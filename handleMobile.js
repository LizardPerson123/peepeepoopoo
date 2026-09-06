let displayGame = true
let displayGameMobile = true
let globalManage
let lastWidth

const displays = {
  mobile: "mobile",
  mobileLandscape: "landscape",
  desktop: "desktop"
}

// This Function Really Needs To Be Cleaned Up
function handlePhoneDisplays() {
  function manage(bypassWidthCheck=false) {
    const display = getDisplay()
    
    alert(lastWidth)
    alert(window.innerWidth)
    if (lastWidth === window.innerWidth && !bypassWidthCheck) {
      return
    }

    lastWidth = window.innerWidth

    if (display === displays.desktop) {
      resizeForDesktop()
    }
    else if (display === displays.mobileLandscape) {
      resizeForLandscape()
    }
    else if (display === displays.mobile) {
      resizeForMobile()
    }

    if (getById('chooseAlcoholMobileUI').style.display !== "none" && display === displays.desktop) {
      getById('chooseAlcoholMobileUI').style.display = "none"
      getById('game').style.display = "grid"
      return
    }

    if (getById('firstAlcohol').style.display !== "none" && display !== displays.desktop) {
      getById('chooseAlcoholMobileUI').style.display = "block"
      getById('game').style.display = "none"
      return
    }
  }

  globalManage = manage

  addEventListener("resize", manage)

  manage()
}

function resizeForDesktop() {
  getById("game").style.display = "grid"
  getById("messages2").style.display = "none"
  getById("goBackMessageButton").style.display = "inline"
  getById("showMsgButton").innerText = "Messages"
  getById("enemies").style.display = "none"
  getById("enemiesOuter").style.display = "none"
  getById("enemies").innerHTML = ""
  getById("alcoholInfo").style.display = "none"
  host && (getById("showMsgButton").style.display = "inline")
  resetEverythingToDesktop()
  gameDisplay = "grid"
  getById("showMsgButton").setAttribute("onclick", "getById('players').style.display = 'none'; getById('messages').style.display = 'flex'")

  if (gameMode === gameModes.campaign) {
    getById("showMsgButton").style.display = "none"
  }
}

function resizeForLandscape() {
  resetEverythingToLandscape()
  getById("showMsgButton").innerText = "MSG"
  getById("enemies").style.display = "none"
  getById("enemiesOuter").style.display = "none"
  getById("enemies").innerHTML = ""
  getById("alcoholInfo").style.display = "none"
  host && (getById("showMsgButton").style.display = "inline")
  getById("showMsgButton").setAttribute("onclick", "getById('players').style.display = 'none'; getById('game').style.display = 'none'; getById('messages2').style.display = 'flex'")
  getById("game").style.display = "grid"
  gameDisplay = "grid"
  getById("centerThing").style.display = "flex"

  if (gameMode === gameModes.campaign) {
    getById("showMsgButton").style.display = "inline"
    getById("showMsgButton").innerHTML = "..."
    getById("showMsgButton").setAttribute("onclick", "campaignOptionsLandscape()")
  }
}

function resizeForMobile() {
  goBackToMainGame()
  getById("enemies").style.display = "none"
  getById("enemiesOuter").style.display = "none"
  getById("enemies").innerHTML = ""
  getById("showMsgButton").style.display = "none"
  getById("alcoholInfo").style.display = "none"
  host && (getById("messages2").style.display = "none")
  host && (getById("goBackMessageButton").style.display = "none")
  host && (getById("showMsgButton").style.display = "none")
  getById("game").style.display = "flex"
  gameDisplay = "flex"

  if (gameMode === gameModes.campaign) {
    getById("showMsgButton").style.display = "none"
  }
}

function resetEverythingToLandscape() {
  resetEverythingToDesktop()
  
  // Safari Mobile Has A Bug I Think So This Has To Be Done
  getById("lives").style.display = "none"
  getById("campaignOptions").style.display = "none"
}

function getDisplay() {
  if (window.innerWidth <= 551) {return displays.mobile}
  else if (window.innerWidth <= 900) {return displays.mobileLandscape}
  return displays.desktop
}