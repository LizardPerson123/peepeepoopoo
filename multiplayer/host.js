let host
let usercount = 0
let users
let takenAlcoholFrom = []
let inGameBegin = false
let inGame = false

function newSession(username, password) {
  return new Promise(async function (resolve, reject) {
    getById("multiplayerMenu").style.display = "none"
    getById("multiplayerNewMenu").style.display = "block"

    try {
      let sessionID = await newSessionApi(username, password)
      getById("status").innerText = "Session Code: " + sessionID

      onUserLeft = async function(eventData) {
        let members = await getMembersApi()
        if (members.length < 2 && inGameBegin) {
          alert("Not Enough Players Anymore, " + eventData.username + " Left")
          reload()
        }

        let removedUser = eventData.username
        getById(removedUser).remove()
        usercount--

        if (usercount < 5 && !(inGameBegin || inGame)) {
          await openJoin()
        }
        else {
          removeItem(takenAlcoholFrom, eventData.username)
        }
          
        players.forEach(function(player) {
          if (player.name == removedUser) {
            getById(player.id + "Div").style.display = "none"
            players[players.indexOf(player)].hp = 0

            if (player.name == currentPlayer) {
              multiplayerResolveFunc(["shoot", players.indexOf(player)])
            }
          }
        })
      }

      onNewUser = async function(eventData) {
        getById("usernames").innerHTML += `<p id="${eventData.username}" style="font-size: 1.3em;  margin-top: 0px;">${eventData.username}</p>`
        await sendTo(eventData.username, JSON.stringify({hash: "sj"}))
        usercount++

        if (usercount > 4) {
          endJoiningApi()
          alert("Maximum Users Reached")
        }

        let members = await getMembersApi()
        if (members.length > 1) {
          getById("beginGameButton").style.display = "inline-block"
        }
      }

      host = username
       
      resolve()
    }
    catch (err) {
      switch (err.message) {
        case ("NO USER"): alert("That User Does Not Exist"); break
        case ("INCORRECT PASSWORD"): alert("Wrong Password"); break
        case ("USERNAME AND PASSWORD REQUIRED"): alert("Please Provide Username And Password"); break
        case ("ACCOUNT BANNED"): alert("Your Account Is Banned, View Your Account Page For More Information"); break
        default: alert(err)
      }

      getById("multiplayerMenu").style.display = "flex"
      getById("multiplayerNewMenu").style.display = "none"  
    }
    
  })
}

async function beginGameHost(turns) {
  achi.register("Play Rotting Roulette Multiplayer", "bronze")
  getById("showMsgButton").style.display = "block"
  keyPressSendMessage()
  handlePhoneDisplays()
  getWheelSpeed()
  getTextSpeed()

  inGameBegin = true
  await endJoiningApi()

  getById("multiplayerNewMenu").style.display = "none"
  getById("game").style.display = gameDisplay

  if (gameDisplay == "grid") {
    getById("msgPreview").style.display = "block"
  }

  users = await getMembersApi()

  users.forEach(function(item) {
    if (item == thisPlayer) {
      players.push(new Human(item))
    }
    else {
      players.push(new MultiplayerHuman(item))
    }
  })

  updatePlayers()

  //Randomly Select Game Alcohol
  for (let i = 1; i <= 3; i++) {
    addAlcoholMultiplayer()
  }

  gameAlcohol.forEach(function(alcohol) {
    AlcoholTypes.push(alcohol)
  })

  let gameAlcoholToSend = []

  for (let i = 0; i <= 2; i++) {
    let alcohol = new gameAlcohol[i]()
    gameAlcoholToSend.push({name: alcohol.name, id: alcohol.id, description: alcohol.shortDescription || alcohol.description, img: alcohol.img})
  }

  await broadcast(JSON.stringify({
    code: -2,
    gameAlcohol: gameAlcoholToSend
  }))

  onMessageFrom = async function daGame(eventData, from) {
    //Whiskey Manager (Whiskey Is Very Special And Needs Additional Code To Work In Multiplayer)
    if (eventData.code == 8 && from == currentPlayer) {
      let hasWhiskey = players.find(function(player) {return (player.name == from && player.activeAlcohol.find((alcohol) => {return alcohol.name == "Whiskey"}))})

      if (hasWhiskey) {
        sendTo(from, JSON.stringify({code: 9, msg: bulletList.slice(0, 5)}))
      }
    }
    else if (eventData.code == 2) {
      currentPlayer = undefined
      console.log(eventData.response)
      multiplayerResolveFunc(eventData.response)
    }
    else if (eventData.code == 3) {
      displayMessage(eventData.msg, from)
    }
    else {
      //This Manages Adding Alcohol At Beginning Of Game
      players.forEach(function(player) {
        if (player.name == from && !(takenAlcoholFrom.includes(player.name))) {
          let newAlcohol = new gameAlcohol[eventData.alcohol]()
          newAlcohol.id = eventData.id
          player.activeAlcohol.push(newAlcohol)
          takenAlcoholFrom.push(player.name)
        }
      })
      multiplayerGame()
    }
  }
  
  //To Prevent Bugs, This Has To Show After The Broadcast Message To Restart Is Shown
  if (turns) {
    alert("You Survived " + turns + " Turns")
  }

  await firstAlcoholHost()
  getById("firstAlcohol").style.display = "none"
  takenAlcoholFrom.push(host)

  multiplayerGame()
}

async function firstAlcoholHost() {
  let [alcohol, num] = await firstAlcohol()

  players[0].activeAlcohol.push(alcohol)
  players[0].activeAlcohol[0].startEffect(this, this)

  turnWheel()
}

async function multiplayerGame() {
  let users = await getMembersApi()
  if (takenAlcoholFrom.sort().join(",") == users.sort().join(",")) {
    inGame = true
    await broadcast(JSON.stringify({
      code: 0,
      nextTurn: players[0].name,
    }))

    bulletList.generateNew(100)
    
    let turns = 0
    while (true) {
      turns++
      for (let i = 0; i < players.length; i++) {
        if (players[i].hp < 1) {
          continue
        }
        else if (players.getAlivePlayers().length < players.length && gameMode == "survival") {
          resetGame(true, turns)
          return
        }
        else if (players.getAlivePlayers().length == 1) {
          resetGame()
          return
        }

        await players[i].multiplayerTurn(i)
      }
    } 
  }
}

function endGamePhase() {
  broadcast(JSON.stringify({code: 4, winner: players.getAlivePlayers()[0]}))

  getById("game").style.display = "none"

  getById("continuePlaying").style.display = "flex"

  let playersPlayNext = []

  async function checkToContinue() {
    let members = await getMembersApi()
    if (playersPlayNext.sort().join(",") == members.sort().join(",")) {
      resetGame()
    }
  }

  onMessageFrom = function(eventData, from) {
    if (eventData.join) {
      playersPlayNext.push(from)
    }
    else {
      removeItem(playersPlayNext, from)
      kick(from)
    }

    checkToContinue()
  }

  onUserLeft = function(eventData) {
    removeItem(playersPlayNext, eventData.username)

    checkToContinue()
  }
}

function resetGame(isHost = true, turns) {
  currentPlayer = undefined
  takenAlcoholFrom = []
  gameAlcohol = []

  //Cannot set bulletList = [], since bulletList is constant
  bulletList.length = 0

  getById("eventHeader").innerText = "Events"
  getById("event").innerText = "Waiting For Game To Start..."
  getById("buttons").style.display = "none"

  players.forEach(function(player) {
    getById(player.id + "Div").remove()
    
    if (player.name == thisPlayer) {
      player.activeAlcohol.forEach(function(alcohol) {
        getById("alcohol" + alcohol.id).remove()
      })
    }
  })

  getById("lifeImage").innerHTML = `
    <img width="50em" src="images/life.png">
    <img width="50em" src="images/life.png">
    <img width="50em"  src="images/life.png">`

  getById('wheelDiv').style.display = "none"
  getById("wheel").src = "images/wheel.png"
  dontTurnWheel = false
  getById("firstAlcohol").style.display = "block"

  //Cannot set players = [], since players is constant
  players.length = 0
  
  if (isHost) {
    beginGameHost(turns)
  }
}