let wheelFunc = 0
let dontTurnWheel = false
let alreadySpinningWheel = false
let alreadySetKey = false

function waitForPlayerInput() {
  getById("buttons").style.display = "flex"
  return new Promise(function(resolve) {
    resolveFunc = resolve
    let confused = false

    function resetButton() {
      getById("alcoholButton").removeEventListener("click", alcoholButtonClick)

      getById("shootButton").innerHTML = `<img src="images/itsagun.png" style="margin-right: 3px; image-rendering: pixelated; cursor: pointer; background-color: transparent;">
      Shoot Someone`

      getById("alcoholButton").innerHTML = `<img src="images/alcohol.png" style="margin-right: 2px; image-rendering: pixelated; background-color: transparent;">
      Alcohol`

      getById("shootButton").removeEventListener("click", shootButtonClick)

      clickEvents = []
    }

    let alcoholButtonClick = function() {
      let confused = false
      players.forEach(function(player) {
        if (player.confused === true && player.name === thisPlayer) confused = true
      })

      if (confused && getRndInt(0, 2) === 0) {
        resolveFunc("shoot")
      }

      resolveFunc("alcohol")

      resetButton()
    }

    let shootButtonClick = function() {
      let confused = false
      players.forEach(function(player) {
        if (player.confused === true && player.name === thisPlayer) confused = true
      })

      if (confused && getRndInt(0, 2) === 0 && this.activeAlcohol.length > 0) {
        resolveFunc("alcohol")
      }

      resolveFunc("shoot")

      resetButton()
    }.bind(this)

    if (this.activeAlcohol.length === 0) {
      getById("alcoholButton").style.display = "none"
    }
    else {
      getById("alcoholButton").style.display = "flex"
    }

    players.forEach(function(player) {
      if (player.confused === true && player.name === thisPlayer) confused = true
    })

    clickEvents.push(alcoholButtonClick)
    clickEvents.push(shootButtonClick)

    getById("alcoholButton").addEventListener("click", alcoholButtonClick)

    getById("shootButton").addEventListener("click", shootButtonClick)

    if (confused) {
      getById("alcoholButton").innerHTML = "?"
      getById("shootButton").innerHTML = "?"
    }

  }.bind(this))
}

function choseAlcohol(useAlcohol = false, multiplayerContext = undefined) {
  return new Promise(function(resolve) {
    getById("buttons").style.display = "none"
    getById("alcoholButtons").style.display = "flex"
    let confused = false

    players.forEach(function(player) {
      if (player.confused === true && player.name === thisPlayer) confused = true
    })

    let activeAlcohol = this.activeAlcohol

    if (confused) {
      activeAlcohol = activeAlcohol.slice(0)
      shuffleArray(activeAlcohol)
    }

    getById("alcoholButtons").innerHTML += `<button class="playerOption" style='margin-right: 5px; display: flex; align-items: center;' id='goBackButton'>
      Go Back</button>`

    activeAlcohol.forEach(function(alcohol) {
      getById("alcoholButtons").innerHTML += `<button class="playerOption" style='margin-right: 5px; display: flex; align-items: center;' id='${alcohol.id}Button'>
      <img src="images/${alcohol.img}" style="margin-right: 2px; width: 30px; height: 30px; image-rendering: pixelated; background-color: transparent;">
      ${alcohol.name}</button>`

      if (confused) {
        getById(`${alcohol.id}Button`).innerText = "?"
      }
    })

    getById("goBackButton").addEventListener("click", function() {
      getById("alcoholButtons").innerHTML = ""
      getById("alcoholButtons").style.display = "none"

      resolve("goBack")
    })

    activeAlcohol.forEach(async function(alcohol) {
      getById(`${alcohol.id}Button`).addEventListener("click", async function() {
        if (useAlcohol) {
          //This Is For Multiplayer
          //This Info Is Sent To The Host
          AlcoholTypes.forEach(async function(alcohol2) {
            if (alcohol2.name === alcohol.name || alcohol2.name === alcohol.oname) {
              let effect = await new alcohol2().useEffect(this, multiplayerContext)
              resolve([this.activeAlcohol.indexOf(alcohol), effect[0], effect[1]])
            }
          }.bind(this))

          AlcopAlcoholTypes.forEach(async function(alcohol2) {
            if (alcohol2.name === alcohol.name || alcohol2.name === alcohol.oname) {
              let effect = await new alcohol2().useEffect(this, multiplayerContext)
              resolve([this.activeAlcohol.indexOf(alcohol), effect[0], effect[1]])
            }
          }.bind(this))

          if (Mocktail.name === alcohol.name || Mocktail.name === alcohol.oname) {
            let effect = await new Mocktail().useEffect(this, multiplayerContext)
            resolve([this.activeAlcohol.indexOf(alcohol), effect[0], effect[1]])
          }
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
    getById("shootButtons").style.display = "flex"
    let alivePlayers = players.getAlivePlayers()
    let confused = false

    if (includePlayer) {
      getById("shootButtons").innerHTML += `<button class="playerOption" style='margin-right: 5px; margin-bottom: 8px' id='goBackButton'>
      Go Back</button>`
    }

    players.forEach(function(player) {
      if (player.confused === true && player.name === thisPlayer) confused = true
    })

    if (confused) {
      shuffleArray(alivePlayers)
    }
     
    //This Code Is Seperate To Prevent Overiding The Event Listener
    alivePlayers.forEach(function(player) 
    {
      if (!(!includePlayer && player.name === thisPlayer)) {
        getById("shootButtons").innerHTML += `<button style='margin-right: 5px; margin-bottom: 8px' class="playerOption" id='${player.id}Button'>${player.name}</button>`
      }

      if (confused && !(!includePlayer && player.name === thisPlayer)) {
        getById(`${player.id}Button`).innerText = "?"
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
      if (!(!includePlayer && player.name === thisPlayer)) {
        let playerID = player.id

        getById(`${playerID}Button`).addEventListener("click", async () => {
          if (host && !(await allPlayers()).includes(player.name)) {
            alert("That Users Has Left The Game")
            return
          }

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

  if (this.name === thisPlayer) {
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

  if (result === "altOutcome") {
    eventText.innerText = turn[1]
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve(turn)
      }, textSpeed)
    })
  }

  getById("wheel").style.transform = "rotate("+ 0 +"deg)"
  dontTurnWheel = true

  let playerDamagedName = playerDamaged.name

  if (playerDamagedName === this.name) {
    playerDamagedName = pronoun2
  }
  
  if (result instanceof Alcohol || result.typeObj === "multiplayerAlcohol") {
    playSound("alcohol.mp3")
    eventText.innerText = `${pronoun1} Attempted To Shoot ${playerDamagedName}, But Gave An Alcohol Instead${msg}`

    if (playerDamaged.name === thisPlayer && addAlcohol) {
      status.innerHTML +=  `<p onclick='displayAlcoholInfo("${result.name}", "${result.description}", "${result.img}")' id='alcohol${result.id}' style="font-size: 2em; margin-top: 1px; margin-bottom: 0px; cursor: pointer">${result.name}</p>`
    }

    getById("wheel").src = "images/alcoholget.png"
  }

  else if (result === "alcoholUsed") {
    playSound("drink.mp3")
    let alcohol = turn[1]
    let alcoholMessage = turn[2]
    eventText.innerText = `${pronoun1} Used ${alcohol.name}${alcoholMessage}`
    getById("wheel").src = "images/usealcohol.png"
  }

  else if (result === true && turn[1]) {
    playSound("live.mp3")
    eventText.innerText = `Live. Shot ${playerDamagedName}${msg}`

    if (this.name === playerDamaged.name) {
      getById("wheel").src = "images/selflive.png"
    }
    else {
      getById("wheel").src = "images/live.png"
    }
  }
  else {
    playSound("blank.mp3")

    eventText.innerText = `${pronoun1} Attempted To Shoot ${playerDamagedName}, But It Was Blank${msg}`
    
    if (this.name === playerDamaged.name) {
      getById("wheel").src = "images/selfblank.png"
    }
    else {
      getById("wheel").src = "images/blank.png"
    }
  }

  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(turn)
    }, textSpeed)
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
            turn += turnSpeed;

            if (turn === 360) {
              turn = 0
            }

            x.style.transform = "rotate("+ (turn % 360) +"deg)"
          }
          else {
            turn = 0
          }

          requestAnimationFrame(wheelturn)
        }, wheelSpeed)
      }

      requestAnimationFrame(wheelturn)
      resolve()
  })
}

function displayAlcoholInfo(name, desc, img) {
  displayGame = false
  getById("game").style.display = "none"
  getById("alcoholInfo").style.display = "block"
  getById("alcoholImg").src = "images/" + img
  getById("name").innerText = name
  getById("description").innerText = desc
  getById("enemies").style.display = "none"
  getById("enemiesOuter").style.display = "none"
  getById("enemies").innerHTML = ""
}

function goBack() {
  displayGame = true
  getById("game").style.display = gameDisplay
  getById("alcoholInfo").style.display = "none"
  globalManage(true)
}

function goBackFromEnemy() {
  displayGame = true
  getById("enemies").style.display = "flex"
  getById("enemiesOuter").style.display = "flex"
  getById("alcoholInfo").style.display = "none"
  getById("goBackAlcohol").onclick = goBack
  displayEnemies()
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
  //I did not enjoy having to type these words
  listOfBadWords = ["nigger", "nigga", "fag", "faggot", "retard", "cunt", "kike", "gimp"]
  let containsSlur = listOfBadWords.some(name => msg.toLowerCase().includes(name.toLowerCase()))

  if (msg.length >= 20) {msg = "Blocked For Length"}
  if (containsSlur) {msg = "Blocked For Profanity"}
  if (msg.includes(">") || msg.includes("<")) {msg = "Blocked For Security Reasons"}

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

//DISCLAIMER: THIS FUNCTION WAS (partially) WRITTEN BY AI (Google)
//VERY MESSY BECAUSE IT'S HODGED TOGETHER
function fixVerticalStackOverlap() {
  const buttons = document.querySelectorAll('#buttonSet1 button')
  const buttonSetOne = [buttons[0]]
  const buttonSetTwo = [buttons[1], buttons[2]]
  const buttonSetThree = [buttons[3], buttons[4]]

  buttons.forEach(button => {
    const text = button.querySelector('p')
    const img = button.querySelector('img')
    if (!text || !img) return

    img.style.transform = 'scale(1)'
    img.style.display = "block"

    const buttonRect = button.getBoundingClientRect()
    const textRect = text.getBoundingClientRect()
    const imgRect = img.getBoundingClientRect()

    const textBottomAbsolute = textRect.bottom
    const imgTopAbsolute = imgRect.top
    const buttonTopAbsolute = buttonRect.top

    if (imgTopAbsolute < textBottomAbsolute && buttonSetOne.includes(button)) {
      const availableHeightForImg = buttonRect.bottom - textBottomAbsolute

      let targetScale = availableHeightForImg / imgRect.height

      targetScale = Math.max(0.25, targetScale)

      img.style.transform = `scale(${targetScale})`
      img.style.transformOrigin = 'center bottom'
    }
    else if (imgTopAbsolute < textBottomAbsolute && buttonSetThree.includes(button)) {
      img.style.display = "none"
    }
    else if (buttonRect.top > imgRect.top && buttonSetTwo.includes(button)) {
      const availableHeightForImg = buttonRect.bottom - buttonRect.top - 20

      let targetScale = availableHeightForImg / imgRect.height

      targetScale = Math.max(0.3, targetScale)

      img.style.transform = `scale(${targetScale})`
      img.style.transformOrigin = 'center bottom'
    }

  });
}

//THESE TWO LINES ARE ALSO AI
window.addEventListener('DOMContentLoaded', fixVerticalStackOverlap)
window.addEventListener('resize', fixVerticalStackOverlap)

function preLoadImage(imageName) {
  if (!imageName) {return}
  const image = new Image()
  image.src = `../images/` + imageName
}

function changeMobileView(elementName, displayAs="flex") {
  inMainGame = false

  getById(elementName).style.minHeight = '80vh'
  getById(elementName).style.height = "auto"
  getById("game").querySelectorAll(":scope > div").forEach(function(element) {
    element.style.display = "none"
  })

  getById(elementName).style.display = displayAs
  getById("buttonsdiv").style.display = "flex"
}

let inMainGame = true

function backButton() {
  if (inMainGame) {
   exitGame()
   return
  }

  inMainGame = true
  goBackToMainGame()
}

function goBackToMainGame() {
  displayGameMobile = true

  getById("game").querySelectorAll(":scope > div").forEach(function(element) {
    element.style.display = "none"
  })

  getById("buttonsdiv").style.display = "flex"
  getById("centerThing").style.display = "flex"
  getById("events").style.display = "flex"
}

function resetEverythingToDesktop() {
  getById("game").querySelectorAll(":scope > div").forEach(function(element) {
    element.style.display = "flex"
    element.style.minHeight = ''
    element.style.height = ""
  })

  getById("statusEffects").style.display = "inline"
  getById("buttonsdiv").style.display = "none"
  getById("messages").style.display = "none"
  gameMode !== gameModes.campaign && (getById("campaignOptions").style.display = "none")
}

function displayEnemies() {
  players.forEach(function(player){
    if (!(player instanceof Bot)) {
      return
    }

    getById("enemies").innerHTML += `
    <div id='enemy${player.id}' style='display: flex; justify-content: center; align-items: center; width: 100%;' class="enemyOption" onclick='displayAlcoholInfo("${player.name}", "${player.description}", "${player.img}"); getById("goBackAlcohol").onclick = goBackFromEnemy'>
      <img width="120em" id="enemyImg${player.id}" style="image-rendering: pixelated; flex-shrink: 0; margin-right: 20px" src="images/${player.img}"/>
      <h1 class='textForEnemy' id="enemyName${player.id}">${player.name}</h1>
    </div>
    `

    const enemyDiv = document.getElementById(`enemy${player.id}`)
    const enemyText = document.getElementById(`enemyName${player.id}`)
    let size = 24;

    while (enemyDiv.scrollWidth > window.innerWidth) {
      alert("ah yes")
      size--
      enemyText.style.fontSize = size + 'px'
    }
  })

  getById("enemiesOuter").style.display = "flex"
  getById("enemies").style.display = "flex"
  getById("campaignOptionsLandscape").style.display = "none"
  getById("game").style.display = "none"
}

function goBackFromEnemies() {
  getById("enemies").style.display = "none"
  getById("enemies").innerHTML = ""

  globalManage(true)
}

let isExiting = false

function exitGame() {
  if (isExiting) {
    return
  }

  isExiting = true

  // Autoplay Appends Extra To The History Stack
  if (getAutoplay()) {
    history.back()
    return
  }

  reload()
}

function goBackMessage() {
  getById('messages').style.display = 'none'
  getById('players').style.display = 'flex'
}

function goToMessages() {
  getById('players').style.display = 'none'
  getById('messages').style.display = 'flex'
  displayGame = false
}

function messagesGoBack() {
  getById('messages').style.display = 'none'
  getById('players').style.display = 'flex'
  displayGame = true
}

function campaignOptionsLandscape() {
  getById("game").style.display = "none"
  getById("campaignOptionsLandscape").style.display = "block"
}

function backFromCampaignOptions() {
  getById("game").style.display = gameDisplay
  getById("campaignOptionsLandscape").style.display = "none"
}

const observer = new MutationObserver(specialGameDisplay)

observer.observe(getById('game'), { attributes: true, attributeFilter: ['style'] })

function credits() {
  console.log(
    `Names Here Are Aliases, Not Real Names
      Programmed By: Herman Wricher
      Art Designed By: John Blake
      Title Screen Developed By: John Doe
      Original Idea By: John Doe
      Mocktail Design: John Doe
      
    Version 2.0`
  )
}