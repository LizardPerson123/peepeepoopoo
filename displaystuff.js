let wheelFunc = 0
let dontTurnWheel = false
let alreadySpinningWheel = false
let alreadySetKey = false

function waitForPlayerInput() {
  getById("buttons").style.display = "flex"
  return new Promise(function(resolve) {
    resolveFunc = resolve

    function resetButton() {
      getById("alcoholButton").removeEventListener("click", clickEvents[0])

      getById("shootButton").removeEventListener("click", clickEvents[1])

      clickEvents = []
    }

    let alcoholButtonClick = function() {
      resolveFunc("alcohol")

      resetButton()
    }

    let shootButtonClick = function() {
      resolveFunc("shoot")

      resetButton()
    }

    if (this.activeAlcohol.length == 0) {
      getById("alcoholButton").style.display = "none"
    }
    else {
      getById("alcoholButton").style.display = "flex"
    }

    clickEvents.push(alcoholButtonClick)
    clickEvents.push(shootButtonClick)

    getById("alcoholButton").addEventListener("click", alcoholButtonClick)

    getById("shootButton").addEventListener("click", shootButtonClick)

  }.bind(this))
}

function choseAlcohol(useAlcohol = false, multiplayerContext = undefined) {
  return new Promise(function(resolve) {
    getById("buttons").style.display = "none"
    getById("alcoholButtons").style.display = "flex"

    getById("alcoholButtons").innerHTML += `<button class="playerOption" style='margin-right: 5px; display: flex; align-items: center;' id='goBackButton'>
      Go Back</button>`

    this.activeAlcohol.forEach(function(alcohol) {
      getById("alcoholButtons").innerHTML += `<button class="playerOption" style='margin-right: 5px; display: flex; align-items: center;' id='${alcohol.id}Button'>
      <img src="images/${alcohol.img}" style="margin-right: 2px; width: 30px; height: 30px; image-rendering: pixelated; background-color: transparent;">
      ${alcohol.name}</button>`
    })

    getById("goBackButton").addEventListener("click", function() {
      getById("alcoholButtons").innerHTML = ""
      getById("alcoholButtons").style.display = "none"

      resolve("goBack")
    })

    this.activeAlcohol.forEach(function(alcohol) {
      getById(`${alcohol.id}Button`).addEventListener("click", function() {
        if (useAlcohol) {
          //This Is For Multiplayer
          //This Info Is Sent To The Host
          AlcoholTypes.forEach(async function(alcohol2) {
            if (alcohol2.name == alcohol.name || alcohol2.name == alcohol.oname) {
              let effect = await new alcohol2().useEffect(this, multiplayerContext)
              resolve([this.activeAlcohol.indexOf(alcohol), effect[0], effect[1]])
            }
          }.bind(this))
        }
        else {
          //Resolve Alcohol Index
          alcoholUsed.push(alcohol.name)
          resolve(this.activeAlcohol.indexOf(alcohol))
        }

        getById("alcoholButtons").innerHTML = ""

        getById("alcoholButtons").style.display = "none"
      }.bind(this))
    }.bind(this))
  }.bind(this))
}

function choseShoot(includePlayer = true) {
  return new Promise(function(resolve) {
    //Include Player Would Allow Player To Shoot Themself, And Adds Go Back Button
    //This Function Not Only Allows For Choosing Who To Shoot, But Is Used By Some Alcohol

    getById("buttons").style.display = "none"
    getById("shootButtons").style.display = "inline-block"
    let alivePlayers = players.getAlivePlayers()

    if (includePlayer) {
      getById("shootButtons").innerHTML += `<button class="playerOption" style='margin-right: 5px;' id='goBackButton'>
      Go Back</button>`
    }
     
    //This Code Is Seperate To Pervent Overiding The Event Listener
    alivePlayers.forEach(function(player) 
    {
      if (!(!includePlayer && player.name == thisPlayer)) {
        getById("shootButtons").innerHTML += `<button style='margin-right: 5px' class="playerOption" id='${player.id}Button'>${player.name}</button>`
      }
    })
    
    if (includePlayer) {
      getById("goBackButton").addEventListener("click", function() {
        getById("shootButtons").innerHTML = ""
        getById("shootButtons").style.display = "none"
 
        resolve("goBack")
      })
    }

    alivePlayers.forEach(function(player) {
      if (!(!includePlayer && player.name == thisPlayer)) {
        let playerID = player.id

        getById(`${playerID}Button`).addEventListener("click", () => {
          resolve(players.indexOf(player))

          getById("shootButtons").innerHTML = ""

          getById("shootButtons").style.display = "none"
        })
      }
    })
  })
}

function chooseHowManyHearts(player) {
  return new Promise(function(resolve) {
    //Include Player Would Allow Player To Shoot Themself, And Adds Go Back Button
    //This Function Not Only Allows For Choosing Who To Shoot, But Is Used By Some Alcohol

    getById("buttons").style.display = "none"
    getById("shootButtons").style.display = "inline-block"
    let playerHP = player.hp
     
    //This Code Is Seperate To Pervent Overiding The Event Listener
    for (let i = 1; i <= playerHP; i++)
    {
      getById("shootButtons").innerHTML += `<button style='margin-right: 5px' class="playerOption" id='${i}Button'>${i}</button>`
    }

    for (let i = 1; i <= playerHP; i++) {
      getById(`${i}Button`).addEventListener("click", () => {
        resolve(i)

        getById("shootButtons").innerHTML = ""

        getById("shootButtons").style.display = "none"
      })
    }
  })
}

async function basicTurnDisplay(turnFunc, addAlcohol = true) {
  getById("wheel").src = "images/wheel.png"

  dontTurnWheel = false

  let pronoun1 = "They"
  let pronoun2 = "Themself"
  let status = getById("statusEffects")

  if (this.name == thisPlayer) {
    pronoun1 = "You"
    pronoun2 = "Yourself"
  }

  let eventText = getById("event")
  let eventHeader = getById("eventHeader")

  eventText.innerText = ``

  eventHeader.innerText = `${this.name}'s Turn`

  let turn = await turnFunc.bind(this)(addAlcohol)

  let result = turn[0]
  let playerDamaged = turn[1]
  let msg = turn[2]

  if (result === undefined) {
    return
  }

  let playerDamagedName = playerDamaged.name

  if (playerDamagedName == this.name) {
    playerDamagedName = pronoun2
  }
  
  if (result instanceof Alcohol || result.typeObj == "multiplayerAlcohol") {
    eventText.innerText = `${pronoun1} Attempted To Shoot ${playerDamagedName}, But Gave ${playerDamagedName} An Alcohol Instead`

    if (playerDamaged.name == thisPlayer && addAlcohol) {
      status.innerHTML +=  `<p onclick='displayAlcoholInfo("${result.name}", "${result.description}", "${result.img}")' id='alcohol${result.id}' style="font-size: 2em; margin-top: 1px; margin-bottom: 0px; cursor: pointer">${result.name}</p>`
    }

    getById("wheel").src = "images/alcoholget.png"
  }

  else if (result == "alcoholUsed") {
    let alcohol = turn[1]
    let alcoholMessage = turn[2]
    eventText.innerText = `${pronoun1} Used ${alcohol.name}; ${alcoholMessage}`
    getById("wheel").src = "images/usealcohol.png"
  }

  else if (result == true && turn[1]) {
    eventText.innerText = `Live. Shot ${playerDamagedName}${msg}`

    if (this.name === playerDamaged.name) {
      getById("wheel").src = "images/selflive.png"
    }
    else {
      getById("wheel").src = "images/live.png"
    }
  }

  else {
    eventText.innerText = `${pronoun1} Attempted To Shoot ${playerDamagedName}, But It Was Blank${msg}`
    
    if (this.name === playerDamaged.name) {
      getById("wheel").src = "images/selfblank.png"
    }
    else {
      getById("wheel").src = "images/blank.png"
    }
  }

  getById("wheel").style.transform = "rotate("+ 0 +"deg)"

  dontTurnWheel = true

  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(turn)
    }, 3600)
  })
}

let turn = 0;

function turnWheel() {
  if (alreadySpinningWheel) {return}
  return new Promise(function(resolve) {
      alreadySpinningWheel = true
      let x = document.getElementById("wheel");
      async function wheelturn() {
        setTimeout(async function() {
          if (!dontTurnWheel) {
            turn += 1.5;

            if (turn == 360) {
              turn = 0
            }

            x.style.transform = "rotate("+ (turn % 360) +"deg)"
          }
          else {
            turn = 0
          }

          requestAnimationFrame(wheelturn)
        }, 25)
      }

      requestAnimationFrame(wheelturn)
      resolve()
  })
}

function displayAlcoholInfo(name, desc, img) {
  getById("game").style.display = "none"
  getById("alcoholInfo").style.display = "block"
  getById("alcoholImg").src = "images/" + img

  getById("name").innerText = name
  getById("description").innerText = desc
}

function goBack() {
  getById("game").style.display = gameDisplay
  getById("alcoholInfo").style.display = "none"
}

function goBackHelp() {
  getById("startGame").style.display = "flex"
  getById("aboutGame").style.display = "none"
}

function howToPlay() {
  getById("startGame").style.display = "none"
  getById("aboutGame").style.display = "block"
}

function displayMessage(msg, playerName) {
  if (msg.includes(">") || msg.includes("<")) {msg = "Blocked For Security Reasons"}
  //I did not enjoy having to type these words
  listOfBadWords = ["nigger", "nigga", "fag", "faggot", "retard", "cunt", "kike", "gimp"]
  let containsSlur = listOfBadWords.some(name => msg.toLowerCase().includes(name.toLowerCase()))
  if (containsSlur) {msg = "Blocked For Profanity"}
  if (msg.length > 99) {msg = "Blocked For Length"}

  getById("messageDiv").innerHTML += `<p><span style="color: gray;">${playerName}</span> ${msg || "(empty message)"}</p>`
  getById("messageDiv2").innerHTML += `<p><span style="color: gray;">${playerName}</span> ${msg || "(empty message)"}</p>`
  getById("msgPreview").innerHTML = `<span style="color: gray;">${playerName}</span> ${msg || "(empty message)"}`
}

function sendMessage() {
  if (getById("textMsgInput").value.includes("<") || getById("textMsgInput").value.includes(">")) {alert("For Security Reasons, You Cannot Include Those Characters"); return}
  broadcast(JSON.stringify({code: 3, msg: getById('textMsgInput').value || getById("textMsgInput2").value}))

  displayMessage(getById("textMsgInput").value || getById("textMsgInput2").value, thisPlayer)

  getById("textMsgInput").value = ""
  getById("textMsgInput2").value = ""
}

function keyPressSendMessage() {
  if (alreadySetKey) {return}

  alreadySetKey = true
  document.addEventListener('keydown', onKeyHandler)
  function onKeyHandler(e) {
    if (e.keyCode === 13) {
      sendMessage()
    }
  }
}

function handlePhoneDisplays() {
  //This Can, (And Should), Be Converted To A Css Media Query
  if (window.innerWidth < 800) {
    getById("game").style.display = "flex"
    gameDisplay = "flex"
  }

  function manage() {
    if (window.innerWidth < 800) {
      getById("game").style.display = "flex"
      gameDisplay = "flex"

      getById("showMsgButton").setAttribute("onclick", "getById('players').style.display = 'none'; getById('game').style.display = 'none'; getById('messages2').style.display = 'flex'")
    }
    else {
      getById("game").style.display = "grid"

      getById("showMsgButton").setAttribute("onclick", "getById('players').style.display = 'none'; getById('messages').style.display = 'flex'")

      gameDisplay = "grid"
    }
  }

  addEventListener("resize", manage)

  manage()
}

function credits() {
  console.log(
    `Names Here Are Aliases, Not Real Names
      Programmed By: Herman Wricher
      Art Designed By: John Blake
      Title Screen Developed By: John Doe
      Original Idea By: John Doe
      
    Version 1.3`
  )
}