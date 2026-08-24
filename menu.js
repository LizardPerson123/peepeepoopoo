function settings() {
  getById("buttonSet1").style.display = "none"
  getById("buttonSet4").style.display = "block"
  showTextSpeed()
  showWheelSpeed()
  showAutoplay()
  showShowWheel()
}

function goBackSettings() {
  getById("buttonSet1").style.display = "grid"
  getById("buttonSet4").style.display = "none"
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

function getShowWheel() {
  let rrShowWheel = (localStorage.getItem("rrShowWheel") || "true")

  switch (rrShowWheel) {
    case ("true"): return true
    case ("false"): return false
  }
}

function setShowWheel() {
  let rrShowWheel = (localStorage.getItem("rrShowWheel") || "true")

  switch (rrShowWheel) {
    case ("false"): localStorage.setItem("rrShowWheel", "true"); getById("showWheel").innerHTML = "Show Wheel"; break
    case ("true"): localStorage.setItem("rrShowWheel", "false"); getById("showWheel").innerHTML = "Don't Show Wheel"; break
  }
}

function goToSingleplayer() {
  getById('buttonSet1').style.display = 'none' 
  getById('buttonSet2').style.display = 'block'
  getById("p5").style.display = "inline"
}

function backFromGameMode() {
  getById('buttonSet2').style.display = 'none'

  if (localMultiplayer) {
    getById("buttonSet3").style.display = "block"
    localMultiplayer = false
    return
  }

  getById('buttonSet1').style.display = 'block' 
}

function goToMultiplayer() {
  getById('buttonSet1').style.display = 'none'
  getById('buttonSet3').style.display = 'block'
}

function backFromMultiplayer() {
  getById('buttonSet1').style.display = 'block' 
  getById('buttonSet3').style.display = 'none'
}

function normalMode() {
  getById('buttonSet2').style.display = 'none'
  localMultiplayerStart()
}

function insaneMode() {
  gameMode = gameModes.insane
  getById('buttonSet2').style.display = 'none'
  localMultiplayerStart()
}

function fivePlayers() {
  gameMode = gameModes.fivePlayers
  getById('buttonSet2').style.display = 'none'
  localMultiplayerStart()
}

function alcoholGalore() {
  gameMode = gameModes.alcoholGalore
  getById('buttonSet2').style.display = 'none'
  localMultiplayerStart()
}

function backFromDifficulty() {
  getById('buttonSet2').style.display = 'block' 
  getById('buttonSet5').style.display = 'none'
}

function enterLocalMultiplayer() {
  getById('buttonSet3').style.display = 'none'
  getById('buttonSet2').style.display = 'block' 
  getById('p5').style.display = 'none'
  localMultiplayer = true
}

function showShowWheel() {
  if (getDisplay() !== displays.mobile) {
    getById("showWheel").style.display = "none"
    return
  }

  let rrShowWheel = (localStorage.getItem("rrShowWheel") || "true")

  switch (rrShowWheel) {
    case ("false"): getById("showWheel").innerHTML = "Don't Show Wheel"; break
    case ("true"): getById("showWheel").innerHTML = "Show Wheel"; break
  }
}