let currentMode = "new"
let thisPlayer
let gameDisplay = "grid"
let gameMode = "normal"
let localMultiplayer = false
let peopleNum
let alcoholUsed = []
let autoplay = false

const gameModes = {
  fivePlayers: "5players",
  alcoholGalore: "alcop",
  insane: "insane",
}

async function startGame(localMultiplayerPlayers) {
  achi.register("Play Rotting Roulette", "bronze")

  turnWheel()
  getTextSpeed()
  getWheelSpeed()

  getById("game").style.display = "grid"
  getById("startGame").style.display = "none"
  
  handlePhoneDisplays()

  if (localMultiplayer) startGameLocalMultiplayer(localMultiplayerPlayers)
  else startGameSingleplayer()
}

async function startGameSingleplayer() {
  players.push(new Human("Player"))

  let botCount = (gameMode === gameModes.fivePlayers) ? 4 : 2

  for (let i = 1; i <= botCount; i++) {
    players.push(new Bot(`CPU ${i}`))
  }
  
  addMultipleAlcohol(3)

  updatePlayers()
  
  const numberOfBullets = 100
  bulletList.generateNew(numberOfBullets)

  await firstAlcoholSingleplayer()
  
  addMultipleAlcohol(2)
  
  // The Index Of The Human Playing Is 0
  thisPlayer = players[0].name

  rottingRoulette()
}

async function startGameLocalMultiplayer(localMultiplayerPlayers) {
  peopleNum = (localMultiplayerPlayers || numberOfPeoplePlaying())

  for (let i = 1; i <= peopleNum; i++) {
    players.push(new Human(`Person ${i}`))
  }
  
  addMultipleAlcoholMultiplayer(3)

  updatePlayers()
  
  const bulletCount = 100
  bulletList.generateNew(bulletCount)

  await firstAlcoholLocalMultiplayer()

  addMultipleAlcoholMultiplayer(2)

  rottingRoulette()
}

function addMultipleAlcohol(number) {
  for (let i = 1; i <= 3; i++) {
    addAlcoholSinglePlayer()
  }
}

function addMultipleAlcoholMultiplayer(number) {
  for (let i = 1; i <= 3; i++) {
    addAlcoholMultiplayer()
  }
}

async function rottingRoulette() {
  while (true) {
    // For Achievement
    checkForShowdown()

    for (let i = 0; i < players.length; i++) {
      if (localMultiplayer && players[i] instanceof Human) {
        updatePlayerInLocalMultiplayer(players[i])
      }

      await players[i].turn()

      if (localMultiplayer) {
        checkIfGameOverLocalMultiplayer()
        continue
      }

      const playersAlive = getPlayersAlive(players[i])
      const mainPlayer = players[0]
    
      if (mainPlayer.hp <= 0) {
        await end(false)
        return
      }

      if (playersAlive === 1) {
        await end(true)
        return
      }
    }
  }
}

function checkIfGameOverLocalMultiplayer() {
  const deadPlayers = players.filter(function(player){
    return (player.hp < 1)
  }).length

  if (deadPlayers !== peopleNum - 1) return

  const winner = players.find(player => player.hp > 0)

  if (!winner) return
    
  if (!autoplay) {
    alert(winner.name + " Wins")
  }

  reload()
}


async function checkForShowdown(params) {
  let numberOfPeopleWithOneHeart = 0
  players.forEach(function(player) {
    if (player.hp == 1) {numberOfPeopleWithOneHeart++}
  })

  if (numberOfPeopleWithOneHeart == 2 && players.getAlivePlayers().length == 2 && !localMultiplayer) {achi.register("Showdown", "silver")}
}

function updatePlayerInLocalMultiplayer(player) {
  thisPlayer = player.name

  const alcoholDisplay = getById("statusEffects")
  alcoholDisplay.innerHTML = "<h1>Alcohol</h1>"

  player.activeAlcohol.forEach(function(alcohol) {
    alcoholDisplay.innerHTML += `<p onclick='displayAlcoholInfo("${alcohol.name}", "${alcohol.description}", "${alcohol.img}")' id='alcohol${alcohol.id}' style="font-size: 2em; margin-top: 1px; margin-bottom: 0px; cursor: pointer">${alcohol.name}</p>`
  })
  
  const lifeImages = getById("lifeImage")
  lifeImages.innerHTML = ""
  for (let i = 1; i <= player.hp; i++) {
    lifeImages.innerHTML += '<img width="50em" src="images/life.png">'
  }
}

function startGameLink() {
  if (!getAutoplay()) {
    startGame()
    return
  }

  const localMultiplayerPlayers = localMultiplayer ? numberOfPeoplePlaying() : 0
  historyPush(localMultiplayerPlayers, difficulty, gameMode)

  reload()
}

function historyPush(localMultiplayerPlayers, difficulty, gameMode) {
  history.pushState("", "", `?origin=autoplay&d=${difficulty}&m=${localMultiplayerPlayers}&g=${gameMode}`)
}

async function end(won) {
  //this is for an achievement
  const howMuchAlcoholUsed = checkIfAllAlcoholUsed()
  const wonMsg = won ? "You Won" : "You Lose"

  if (howMuchAlcoholUsed === "None Used") {
    achi.laterRegi("Sober", "silver")
  }
  else if (howMuchAlcoholUsed) {
    achi.laterRegi("Alcoholic", "silver")
  }

  if (!autoplay) {
    alert(wonMsg)
  }

  achi.laterRegi("Lose Rotting Roulette", "bronze")

  if (localStorage.getItem("username")) {
    document.querySelector("body").innerText = "Please Wait..."

    const won = false
    await sendXP(won)
    reload()
  }
}

async function sendXP(won) {
  // xpType 0 means loss, 1 means success (there are other codes, but they are not used here)
  const xpType = won ? 1 : 0
  
  // intentionally ignore the error (it's not critical)
  try {
    await fetch("https://api.rottingpears.com/xp", {
      method: "POST",
      body: JSON.stringify({
        n: localStorage.getItem("username"),
        p: localStorage.getItem("password"),
        t: xpType
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
  } catch {}
}

function getTextSpeed() {
  const rrTextSpeed = (localStorage.getItem("rrTextSpeed") || "slow")

  const textSpeeds = {
    slow: 3600,
    normal: 2400,
    fast: 1200
  }

  textSpeed = textSpeeds[rrTextSpeed]
}

function getWheelSpeed() {
  let rrWheelSpeed = (localStorage.getItem("rrWheelSpeed") || "40")

  switch (rrWheelSpeed) {
    case ("20"): wheelSpeed = 50; turnSpeed = 3; break
    case ("40"): wheelSpeed = 25; turnSpeed = 1.5; break
    case ("60"): wheelSpeed = 17; turnSpeed = 1; break
  }
}

function setTextSpeed() {
  let rrTextSpeed = (localStorage.getItem("rrTextSpeed") || "slow")

  switch (rrTextSpeed) {
    case ("slow"): localStorage.setItem("rrTextSpeed", "normal"); getById("textSpeed").innerHTML = "Text Speed: Normal"; break
    case ("normal"): localStorage.setItem("rrTextSpeed", "fast"); getById("textSpeed").innerHTML = "Text Speed: Fast"; break
    case ("fast"): localStorage.setItem("rrTextSpeed", "slow"); getById("textSpeed").innerHTML = "Text Speed: Slow"; break
  }
}

function showTextSpeed() {
  let rrTextSpeed = (localStorage.getItem("rrTextSpeed") || "slow")

  switch (rrTextSpeed) {
    case ("slow"): getById("textSpeed").innerHTML = "Text Speed: Slow"; break
    case ("normal"): getById("textSpeed").innerHTML = "Text Speed: Normal"; break
    case ("fast"): getById("textSpeed").innerHTML = "Text Speed: Fast"; break
  }
}

function setWheelSpeed() {
  let rrWheelSpeed = (localStorage.getItem("rrWheelSpeed") || "40")

  switch (rrWheelSpeed) {
    case ("20"): localStorage.setItem("rrWheelSpeed", "40"); getById("wheelSpeed").innerHTML = "Wheel Speed: 40 FPS"; break
    case ("40"): localStorage.setItem("rrWheelSpeed", "60"); getById("wheelSpeed").innerHTML = "Wheel Speed: 60 FPS"; break
    case ("60"): localStorage.setItem("rrWheelSpeed", "20"); getById("wheelSpeed").innerHTML = "Wheel Speed: 20 FPS"; break
  }
}

function showWheelSpeed() {
  let rrWheelSpeed = (localStorage.getItem("rrWheelSpeed") || "40")

  switch (rrWheelSpeed) {
    case ("20"): getById("wheelSpeed").innerHTML = "Wheel Speed: 20 FPS"; break
    case ("40"): getById("wheelSpeed").innerHTML = "Wheel Speed: 40 FPS"; break
    case ("60"): getById("wheelSpeed").innerHTML = "Wheel Speed: 60 FPS"; break
  }
}

function getAutoplay() {
  let rrAutoplay = (localStorage.getItem("rrAutoplay") || "false")

  switch (rrAutoplay) {
    case ("true"): return true
    case ("false"): return false
  }
}

function setAutoplay() {
  let rrAutoplay = (localStorage.getItem("rrAutoplay") || "false")

  switch (rrAutoplay) {
    case ("false"): localStorage.setItem("rrAutoplay", "true"); getById("autoplay").innerHTML = "Autoplay: On"; break
    case ("true"): localStorage.setItem("rrAutoplay", "false"); getById("autoplay").innerHTML = "Autoplay: Off"; break
  }
}

function showAutoplay() {
  let rrAutoplay = (localStorage.getItem("rrAutoplay") || "false")

  switch (rrAutoplay) {
    case ("false"): getById("autoplay").innerHTML = "Autoplay: Off"; break
    case ("true"): getById("autoplay").innerHTML = "Autoplay: On"; break
  }
}

function addAlcoholSinglePlayer() {
  if (gameMode === gameModes.alcoholGalore && SingleplayerAlcopAlcoholTypes.length > 0 && getRndInt(0, 2) === 0) {
    const alcoholNum = getRndInt(0, SingleplayerAlcopAlcoholTypes.length)
    const alcohol = SingleplayerAlcopAlcoholTypes[alcoholNum]
    gameAlcohol.push(alcohol)
    removeItem(SingleplayerAlcopAlcoholTypes, alcohol)
    return
  }

  const alcoholNum = getRndInt(0, AlcoholTypes.length)
  const alcohol = AlcoholTypes[alcoholNum]

  const badAlcohols = [
    "Tequila",
    "Red Wine",
    "Mead",
    "Seltzer"
  ]
  
  //Less Good Alcohols Are Given Less Frequently
  if (badAlcohols.includes(alcohol.name) && getRndInt(0, 2) === 0) {
    addAlcoholSinglePlayer()
    return
  }

  gameAlcohol.push(alcohol)
  removeItem(AlcoholTypes, alcohol)
}

function addAlcoholMultiplayer() {
  if (gameMode === gameModes.alcoholGalore && AlcopAlcoholTypes.length > 0 && getRndInt(0, 2) === 0) {
    const alcoholNum = getRndInt(0, AlcopAlcoholTypes.length)
    const alcohol = AlcopAlcoholTypes[alcoholNum]
    gameAlcohol.push(alcohol)
    removeItem(AlcopAlcoholTypes, alcohol)
    return
  }

  const alcoholNum = getRndInt(0, AlcoholTypes.length)
  const alcohol = AlcoholTypes[alcoholNum]

  const badAlcohols = [
    "Tequila",
    "Red Wine",
    "Mead",
    "Seltzer"
  ]
  
  //Less Good Alcohols Are Given Less Frequently
  if (badAlcohols.includes(alcohol.name) && getRndInt(0, 2) === 0) {
    addAlcoholSinglePlayer()
    return
  }

  gameAlcohol.push(alcohol)
  removeItem(AlcoholTypes, alcohol)
}

//recursive
function numberOfPeoplePlaying() {
  let num = prompt("How Many People Are Playing?")
  num = Number(num)

  if (!num) {
    alert("Not A Number")
  }
  else if (num < 2) {
    alert("Must Be At Least 2 People")
  }
  else if (num > 5) {
    alert("Cannot Be More Than 5 People")
  }
  else {
    return num
  }

  return numberOfPeoplePlaying()
}

function checkIfAllAlcoholUsed() {
  // Also Checks If No Alcohol Was Used
  // This Is For Achievements
  let alcoholUsedNum = 0
  gameAlcohol.forEach(function(alcohol) {
    alcohol = new alcohol()
    if (alcoholUsed.includes(alcohol.name)) {alcoholUsedNum++}
  })

  if (alcoholUsedNum == gameAlcohol.length) {return true}
  else if (alcoholUsedNum == 0) {return "None Used"}
  else {return false}
}

//Code For User Selecting Starting Alcohol (Messy Code, Could Use For Loop Instead Of Function)
async function firstAlcohol() {
  return new Promise(function(resolve) {
    getById("wheelDiv").style.display = "none"
    getById("firstAlcohol").style.display = "block"

    function createOption(num) {
      let alcohol

      // In Multiplayer, Plebs Will Have Objects Instead Of Classes, So Both Are Tried
      try {
        alcohol = new gameAlcohol[num - 1]()
      }
      catch {alcohol = gameAlcohol[num - 1]}
      
      const optionText = getById("op" + num)
      const optionImg = getById("op" + num + "Img")
      const optionDescription = getById("op" + num + "Desc")
      const optionDiv = getById("op" + num + "Div")

      optionText.innerText = alcohol.name
      optionImg.src = "images/" + alcohol.img
      optionDescription.innerText = alcohol.shortDescription || alcohol.description

      optionDiv.addEventListener("click", function a() {
        getById("statusEffects").innerHTML +=  `<p onclick='displayAlcoholInfo("${alcohol.name}", "${alcohol.description}", "${alcohol.img}")' id='alcohol${alcohol.id}' style="font-size: 2em; margin-top: 1px; margin-bottom: 0px; cursor: pointer">${alcohol.name}</p>`
        getById("firstAlcohol").style.display = "none"
        getById("wheelDiv").style.display = "block"

        //Cleanup (remove options)
        for (let i = 1; i <= 3; i++) {
          const alcoholOption = getById("op" + i + "Div").cloneNode(true)
          getById("op" + i + "Div").remove()
          getById("alcoholSelection").appendChild(alcoholOption)
        }

        resolve([alcohol, num-1])
      })
    }
    
    for (let i = 1; i <= 3; i++) {
      createOption(i)
    }
  })
}

async function firstAlcoholSingleplayer() {
  let [alcohol, num] = await firstAlcohol()

  players[0].activeAlcohol.push(alcohol)
  alcohol.startEffect(this, this)
  
  for (let i = 1; i < players.length; i++) {
    players[i].activeAlcohol.push(new gameAlcohol[getRndInt(0, 3)])
  }
}

async function firstAlcoholLocalMultiplayer() {
  let status = getById("statusEffects")
  let chooseAlcohol = getById("chooseAlcohol")
  
  for (let i = 0; i < peopleNum; i++) {
    alert(`Player ${i+1}, Choose Alcohol`)
    let [alcohol, num] = await firstAlcohol()
    status.innerHTML = "<h1>Alcohol</h1>"

    players[i].activeAlcohol.push(alcohol)
    alcohol.startEffect(players[i], players[i])
  }
}

function multiplayer() {
  getById("startGame").style.display = "none"
  getById("multiplayerMenu").style.display = "flex"

  getById("username").value = localStorage.getItem("username") || ""
  getById("password").value = localStorage.getItem("password") || ""
  getById("sessionCode").value = ""

  getById("new").addEventListener("click", function a() {
    currentMode = "new"
    getById("sessionCode").style.display = "none"
    getById("sessionCodeText").style.display = "none"
    getById("whatDoing").innerText = "Creating New Session"

    getById("new").style.display = "none"
    getById("join").style.display = "inline"
  })

  getById("join").addEventListener("click", function b() {
    currentMode = "join"
    getById("sessionCode").style.display = "block"
    getById("sessionCodeText").style.display = "block"
    getById("whatDoing").innerText = "Joining Session"

    getById("join").style.display = "none"
    getById("new").style.display = "inline"
  })

  getById("startMultiplayer").addEventListener("click", function() {
    ws = new WebSocket("wss://api.rottingpears.com/")

    ws.onmessage = function () {
      const username = getById("username").value
      const password = getById("password").value
      const sessionCode = getById("sessionCode").value

      if (username.length < 1 || password.length < 1) {
        alert("Username And Password Must Not Be Blank")
        return
      }

      if (currentMode === "new") {
        newSession(username, password)
        thisPlayer = username
        updateUsernameAndPassword(username, password)
        return
      }

      if (sessionCode.length < 5) {
        alert("Session Code Must Be 5 Characters Long")
        return
      }

      joinSession(username, password, sessionCode)
      thisPlayer = username
      updateUsernameAndPassword(username, password)
    }

    ws.onclose = function() {
      alert("Connection Disrupted")
      reload()
    }
  })
}

function getPlayersAlive(player) {
  return players.filter(player => player.hp > 0).length
}

function updateUsernameAndPassword(username, password) {
  localStorage.setItem("username", username)
  localStorage.setItem("password", password)
}

function updatePlayers() {
  const playerDisplay = getById("innerPlayers")
  playerDisplay.innerHTML = ""
  players.forEach(player => {
    addPlayer(player)
  })
}

function addPlayer(player) {
  getById("innerPlayers").innerHTML += `
      <div id='${player.id}Div'>
        <p style='margin-bottom: 3px' id='${player.id}Name'>${player.name}</p>

        <div id='${player.id}Effects'>

        </div>

        <div style='margin-bottom: 0px' id='${player.id}LifeImages'>
          <img src='images/life.png' style='image-rendering: pixelated;'>
          <img src='images/life.png' style='image-rendering: pixelated;'>
          <img src='images/life.png' style='image-rendering: pixelated;'>
        </div>
      </div>
    `
}

function localMultiplayerStart() {
  if (localMultiplayer) {startGame(); return}
  getById("buttonSet5").style.display = "block"
}