function letThereBeDark() {
  getById("modeStyle").innerHTML = `
    * {
      color:white;
      background-color: #131313
    }
    
    .playerOption{
      background-color: white;
      color: black;
    }

    .startButton, #showMsgButton, .startGameButton, #whatDoing, #new, #join, #startMultiplayer, #multiplayerButton2, #buttonSet1 button p {color: white}

    #p5 {
      color: #00bfff
    }

    #alcop, #multiplayerButton4 {
      color: #00ff00
    }
  `

  localStorage.setItem("mode", "dark")

  getById('imgMode').src = 'sun.svg'
  getById("modeButton").innerHTML = "Mode: Dark"
}

function letThereBeLight() {
  getById("modeStyle").innerHTML = ""
  getById('imgMode').src = 'moon.svg'
  getById("modeButton").innerHTML = "Mode: Light"
  localStorage.setItem("mode", "light")
}

function applyMode() {
  let mode = localStorage.getItem("mode")

  if (mode === "dark") {
    letThereBeDark()
  }
  else {
    letThereBeLight()
  }
}

function changeMode() {
  let mode = localStorage.getItem("mode")

  if (mode === "dark") {
    letThereBeLight()
  }
  else {
    letThereBeDark()
  }
}

addEventListener("pageshow", function() {
  applyMode()
})

applyMode()