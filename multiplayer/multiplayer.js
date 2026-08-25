// some code here is unused

function multiplayerStart() {
  if (!localStorage.getItem("username")) {
    multiplayer()
    return
  }
  
  getById("buttonSet3").style.display = "none"
  getById("buttonSet6").style.display = "block"
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

  getById("startMultiplayer").addEventListener("click", function c() {
    const username = getById("username").value
    const password = getById("password").value
    const sessionCode = getById("sessionCode").value
    const decidedAction = currentMode
    connectToMultiplayerServer(username, password, decidedAction, sessionCode)
    getById("startMultiplayer").removeEventListener("click", c)
  })
}

function connectToMultiplayerServer(username, password, decidedAction, sessionCode) {
  ws = new WebSocket("wss://api.rottingpears.com/")

  ws.onmessage = function () {
    if (username.length < 1 || password.length < 1) {
      alert("Username And Password Must Not Be Blank")
      return
    }

    if (decidedAction === "new") {
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
    if (alreadyReloading) return

    alert("Connection Disrupted")
    reload()
  }
}

function connectToMultiplayerNewSession() {
  const username = localStorage.getItem("username")
  const password = localStorage.getItem("password")
  const decidedAction = "new"
  getById("startGame").style.display = "none"
  connectToMultiplayerServer(username, password, decidedAction)
}

function connectToMultiplayerJoinSession() {
  const username = localStorage.getItem("username")
  const password = localStorage.getItem("password")
  const decidedAction = "join"
  const sessionCode = getById("sessionCode2").value
  getById("joinSession").style.display = "none"
  connectToMultiplayerServer(username, password, decidedAction, sessionCode2)
}

function joinSessionMenu() {
  getById("startGame").style.display = "none"
  getById("joinSession").style.display = "block"
}

async function allPlayers() {
  const users = await getMembersApi()

  players.forEach(function(player) {
    if (player instanceof Human || player instanceof MultiplayerHuman) {
      return
    }

    users.push(player.name)
  })

  return users
}