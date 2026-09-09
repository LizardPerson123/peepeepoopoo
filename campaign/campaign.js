function startCampaign() {
  saveDataDelte()
  gameMode = gameModes.campaign
  difficulty = "easy"
  getById("campaign").style.display = "none"
  startGameLink()
}

function manageEndCampaign(won) {
  if (won) {
    // Go To Win Screen
    const action = "intermed"
    saveDataExport(action)
    reload()
    return
  }
  
  history.replaceState("", "", "?")
  reload()
}

function saveDataExport(action, player=players[0]) {
  const saveData = {
    player: player,
    action: action
  }

  localStorage.setItem("rrSaveData", JSON.stringify(saveData))
}

function saveDataImport() {
  const data = JSON.parse(localStorage.getItem("rrSaveData"))

  if (!data) {
    const player = new Human("Player")
    player.hp = 8
    player.skips = 2
    return player
  }

  const playerSaveData = data.player
  const player = new Human()
  player.name = playerSaveData.name
  player.hp = playerSaveData.hp
  player.skips = playerSaveData.skips
  player.originalName = playerSaveData.originalName

  playerSaveData.activeAlcohol.forEach(function(alcohol) {
    alcohol = importAlcohol(alcohol)
    player.activeAlcohol.push(alcohol)

    // Add Alcohol To UI
    getById("statusEffects").innerHTML +=  `<p onclick="displayAlcoholInfo('${alcohol.name.replace(/'/g, "\\'")}', '${alcohol.description.replace(/'/g, "\\'")}', '${alcohol.img}')" id="alcohol${alcohol.id}" style="font-size: 2em; margin-top: 1px; margin-bottom: 0px; cursor: pointer">${alcohol.name}</p>`
  })

  if (data.action === "intermed") {
    const result = ["intermed", player]
    return ["special", result]
  }

  window.addEventListener("beforeunload", addUnload)
  saveDataDelte()

  return player
}

function addUnload(event) {
  //event.preventDefault()
}

function saveDataDelte() {
  localStorage.removeItem("rrSaveData")
}

function importAlcohol(alcohol) {
  let realAlcohol
  AlcoholTypes.forEach(function(alcohol2) {
    if (alcohol2.name === alcohol.name || alcohol2.name === alcohol.oname) {
      realAlcohol = new alcohol2()
    }
  })

  SuperAlcohols.forEach(function(alcohol2) {
    if (alcohol2.name === alcohol.name || alcohol2.name === alcohol.oname) {
      realAlcohol = new alcohol2()
    }
  })
  
  return realAlcohol
}

function continueCampaign() {
  gameMode = gameModes.campaign
  startGameLink()
}

function handleSpecialAction(action) {
  switch (action[0]) {
    case ("intermed"): showWinScreen(action[1]); break
  }
}

async function showWinScreen(player) {
  const extraHeart = {
    img: "life.png",
    description: "",
    name: "Extra Heart"
  }

  const extraAlcohol = {
    img: "alcohol.png",
    description: "",
    name: "Extra Alcohol"
  }

  const extraSkip = {
    img: "back.png",
    description: "",
    name: "Extra Skip"
  }

  gameAlcohol = [extraHeart, extraAlcohol, extraSkip]

  getById("centerThing").style.gridArea = "1/1/5/6"
  getById("op2Img").style.width = "50%"
  getById("op3Img").style.width = "50%"
  getById("op1Img").style.width = "50%"
  getById("wheel").src = "images/maps/m1.png"
  getById("eventHeader").innerHTML = "You Won"
  getById("event").innerHTML = "Choose A Reward"
  getById("chooseAlcohol").innerHTML = "Choose A Reward"
  getById("chooseAlcoholMobileUIText").innerHTML = "Choose A Reward"
  getById("buttonsdiv").style.display = "none"

  dontTurnWheel = true

  const choice = await firstAlcohol()

  if (choice[0] === extraHeart) {
    player.hp++
  }

  if (choice[0] === extraAlcohol) {
    player.activeAlcohol.push(new AlcoholTypes[getRndInt(0, AlcoholTypes.length)]())
  }

  if (choice[0] === extraSkip) {
    player.skips++
  }

  const action = "nextRound"
  
  const whatToDo = await nextRoundOrExit()

  if (whatToDo === "next") {
    saveDataExport(action, player)
    reload()
  }

  if (whatToDo === "leave") {
    saveDataExport(action, player)
    exitGame()
  }
}

function nextRoundOrExit() {
  return new Promise(function(resolve) {
    getById("event").style.display = "none"
    getById("eventHeader").innerHTML = "Choose An Action"
  
    // Repurpose Shoot Someone And Alcohol Button For Next Or Leave
    getById("buttons").style.display = "flex"
    getById("shootButton").innerHTML = "Next Round"
    getById("alcoholButton").innerHTML = "Save And Exit"

    getById("shootButton").addEventListener("click", function() {
      resolve("next")
    })

    getById("alcoholButton").addEventListener("click", function() {
      resolve("leave")
    })
  })
}

function skipRound() {
  if (players[0].skips < 1) {
    alert("You Have No Skips")
    return
  }

  if (!confirm("Are You Sure You Want To Use Your Skip? You Have " + players[0].skips + " Skip(s) Left")) {
    return
  }

  players[0].skips--
  saveDataExport()
  window.removeEventListener("beforeunload", addUnload)
  reload()
}