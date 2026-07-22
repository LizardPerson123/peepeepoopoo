let hash
let whiskeyResolveFunc

function joinSession(username, password, sessionID) {
  return new Promise(async function (resolve, reject) {
    getById("multiplayerMenu").style.display = "none"
    getById("multiplayerJoin").style.display = "block"

    try {
      let [hostName, usersList, assume] = await joinSessionApi(username, password, sessionID)
      
      if (assume != "rotRoul") {alert("This Is Not A Rotting Roulette Session"); reload()}
      
      host = hostName
      users = usersList
      getById("host").innerText = "Host: " + host

      users.forEach(username => {
        getById("usernames2").innerHTML += `<p id="${username}" style="font-size: 1.3em; margin-top: 0px;">${username}</p>`
      });

      onNewUser = function(eventData) {
        getById("usernames2").innerHTML += `<p id="${eventData.username}" style="font-size: 1.3em; margin-top: 0px;">${eventData.username}</p>`
      }

      onMessageFrom = function(eventData, from) {
        if (eventData.code == -2) {
          gameAlcohol = eventData.gameAlcohol
          beginGamePleb()
        }
        else if (eventData.code == 3) {
          displayMessage(eventData.msg, from)
          return
        }
      }

      onUserLeft = function(eventData) {
        let removedUser = eventData.username

        if (inGame) {
          players.forEach(function(player) {
            if (player.name == removedUser) {
              getById(player.id + "Div").style.display = "none"
            }
          })

          return
        }

        getById(removedUser).remove()
      }

      resolve()
    }
    catch (err) {
      err = err.message

      switch (err) {
        case ("NO USER"): alert("That User Does Not Exist"); break
        case ("INCORRECT PASSWORD"): alert("Wrong Password"); break
        case ("USERNAME AND PASSWORD REQUIRED"): alert("Please Provide Username And Password"); break
        case ("NO SESSION"): alert("No Session"); break
        case ("ACCOUNT BANNED"): alert("Your Account Is Banned, View Your Account Page For More Information"); break
        default: alert("Something Happened")
      }

      getById("multiplayerMenu").style.display = "flex"
      getById("multiplayerJoin").style.display = "none"  
      resolve()
    }

  })
}

async function beginGamePleb() {
  achi.register("Play Rotting Roulette Multiplayer", "bronze")
  inGame = true
  keyPressSendMessage()
  handlePhoneDisplays()
  getWheelSpeed()

  getById("multiplayerJoin").style.display = "none"
  getById("game").style.display = gameDisplay
  getById("showMsgButton").style.display = "block"
  getById("eventHeader").innerText = "Events"
  getById("event").innerText = "Waiting For Game To Start..."
  getById("buttons").style.display = "none"

  if (gameDisplay == "grid") {
    getById("msgPreview").style.display = "block"
  }

  users = await getMembersApi()

  users.forEach(function(item) {
    players.push(new Human(item))
  })

  updatePlayers()
  
  let [alcohol, num] = await firstAlcoholPleb()
  getById("firstAlcohol").style.display = "none"

  sendTo(host, JSON.stringify({
    code: -1,
    alcohol: num,
    id: alcohol.id
  }))

  players.forEach(function(player) {
    if (player.name == thisPlayer) {
      players[players.indexOf(player)].activeAlcohol.push(alcohol)
    }
  })

  onMessageFrom = async function (msg, from) {
    if (msg.code == 3) {
      displayMessage(msg.msg, from)
      return
    }

    getById("event").innerText = ``
    getById("eventHeader").innerText = `${msg.nextTurn}'s Turn`

    onMessageFrom = async function(msg, from) {
      if (msg.code == 3) {
        displayMessage(msg.msg, from)
        return
      }

      if (msg.code == -2) {
        resetGame(false)
        gameAlcohol = msg.gameAlcohol
        await beginGamePleb()
        return
      }

      if (msg.code == 9) {
        whiskeyResolveFunc(msg.msg)
        whiskeyResolveFunc = undefined
        return
      }

      getById("buttons").style.display = "none"
      
      //This Just Updates All The Stats Of The Game
      await updateGame(msg)
      
      //This Code Manages The NextTurn Part Of The Message
      getById("eventHeader").innerText = `${msg.nextTurn}'s Turn`

      if (msg.nextTurn == thisPlayer && !msg.skipTurn) {
        players.forEach(async function(player) {
          if (player.name == thisPlayer) {
            sendTo(host, JSON.stringify({code: 2, response: await player.whatToDo(true, "pleb")}))
          }
        })
      }
    }
  }
}

async function firstAlcoholPleb() {
  let [alcohol, num] = await firstAlcohol()
  turnWheel()
  
  return [alcohol, num]
}

function waitForWhiskeyCallback() {
  return new Promise(function(resolve) {
    whiskeyResolveFunc = resolve
    sendTo(host, JSON.stringify({code: 8}))
  })
}

async function updateGame(msg) {
  // Message Does Not Update Game State
  if (!msg.hp) {return}
  updatePlayersPleb(msg)
  players.forEach(function(player) {
    if (player.hp != msg.hp[player.name]) {
      players[players.indexOf(player)].hp = msg.hp[player.name]

      getById(`${player.id}LifeImages`).innerHTML = ""

      for (let i = 1; i <= player.hp; i++) {
        getById(`${player.id}LifeImages`).innerHTML += '<img src="images/life.png" style="image-rendering: pixelated"/>'
      } 

      if (player.name == thisPlayer) {
        getById("lifeImage").innerHTML = ""

        for (let i = 1; i <= player.hp; i++) {
          getById("lifeImage").innerHTML += '<img width="50em" src="images/life.png">'
        }
      }
    }
    
    if (player.alcoholEffects.sort().join(",") != msg.effects[player.name].sort().join(",")) {
      player.removeEffects()
      players[players.indexOf(player)].confused = false
      players[players.indexOf(player)].alcoholEffects = msg.effects[player.name]
      
      player.alcoholEffects.forEach(function(alcoholEffect) {
        players[players.indexOf(player)].alcoholEffects.push(alcoholEffect)
        getById(`${player.id}Effects`).innerHTML += `<p style='margin-top: 0px; margin-bottom: 2px' id='${alcoholEffect.id}Effect'>${alcoholEffect.name}</p>`

        if (player.name == thisPlayer && alcoholEffect.name == "Confusion") {
          players[players.indexOf(player)].confused = true
        }
      })
    }

    if (player.name == thisPlayer) {
      player.activeAlcohol.forEach(function(alcohol) {
        getById("alcohol" + alcohol.id).remove()
      })

      let index = players.indexOf(player)
      players[index].activeAlcohol = msg.activeAlcohol[player.name]
      players[index].activeAlcohol.forEach(function(alcohol) {
        getById("statusEffects").innerHTML += `<p onclick='displayAlcoholInfo("${alcohol.name}", "${alcohol.description}", "${alcohol.img}")' id='alcohol${alcohol.id}' style="font-size: 2em; margin-top: 1px; margin-bottom: 0px; cursor: pointer">${alcohol.name}</p>`
      })
    }
  })
  
  //This States What Happened In The Game
  await basicTurnDisplay.bind(msg.player)(() => {return [msg.result, msg.playerDamaged, msg.msg]}, false)
  
  //If Alcohol Used By This Pleb, Remove It Visually
  if (msg.result == "alcoholUsed" && msg.player.name == thisPlayer) {
    try {getById("alcohol" + msg.playerDamaged.id).remove(); }
    catch(e) {}
  }
  
  getById("wheel").src = "images/wheel.png"
  dontTurnWheel = false
  getById("event").innerText = ``

  players.forEach(function(player) {
    //If The NextTurn Is Dead, Skip Ahead
    if (player.name == msg.nextTurn && player.hp < 1) {
      let next = player

      do {next = players[players.indexOf(next) + 1]
        if (next == undefined) {next = players[0]}
      }
      while (next.hp < 1)

      msg.nextTurn = next.name
    }
  })
}

function updatePlayersPleb(msg) {
  for (const [key, value] of Object.entries(msg.hp)) {
    let existsInPlayer = false
    players.forEach(function (player) {
      if (player.name == key) {
        existsInPlayer = true
      }
    })

    if (!existsInPlayer) {
      let player = {id: msg.id[key], name: key}
      addPlayer(player)
      let newHuman = new Human(key)
      newHuman.id = msg.id[key]
      players.push(newHuman)
    }
  }
}