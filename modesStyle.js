const colors = {
  white: "white",
  black: "#131313"
}

let currentColor

function letThereBeDark() {
  getById("modeStyle").innerHTML = `
    * {
      color: white;
      background-color: ${colors.black}
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
  currentColor = colors.black
}

function letThereBeLight() {
  getById("modeStyle").innerHTML = ""
  getById('imgMode').src = 'moon.svg'
  getById("modeButton").innerHTML = "Mode: Light"
  currentColor = colors.white
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

function specialGameDisplay() {
  if (getById('game').style.display === "none") {
    getById("specialGameStyle").innerHTML = ""
    return
  }
  
  getById("specialGameStyle").innerHTML = `
    body {
      background-image: url("images/woodplanks.jpg");
      background-color: ${currentColor};
    }

    #game div {
      background-color: ${currentColor};
    }

    * {background: none}
  `
}

addEventListener("pageshow", function() {
  applyMode()
  specialGameDisplay()
})

applyMode()