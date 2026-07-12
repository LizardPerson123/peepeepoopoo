function letThereBeDark() {
  getById("modeStyle").innerHTML = `
    * {
      color:white;
      background-color: #0d0e0e
    }
    
    .playerOption{
      background-color: white;
      color: black;
    }

    .startButton, #showMsgButton, .startGameButton, #whatDoing, #new, #join, #startMultiplayer {color: white}
  `

  localStorage.setItem("mode", "dark")

  getById('imgMode').src = 'sun.svg';
}

function letThereBeLight() {
  getById("modeStyle").innerHTML = ""
  getById('imgMode').src = 'moon.svg';
  localStorage.setItem("mode", "light")
}

function applyMode() {
  let mode = localStorage.getItem("mode")

  if (mode == "dark") {
    letThereBeDark()
  }
  else {
    letThereBeLight()
  }
}

function changeMode() {
  let mode = localStorage.getItem("mode")

  if (mode == "dark") {
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