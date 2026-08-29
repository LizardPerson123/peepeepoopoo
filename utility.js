function getRndInt(min, max) {return Math.floor(Math.random() * (max - min) ) + min}
let getById = id => {return document.getElementById(id) }
let getByClss = className => {return Array.from(document.getElementsByClassName(className))}

function removeItem(array, itemToRemove) {
  const index = array.indexOf(itemToRemove)

  if (index !== -1) {
    array.splice(index, 1)
  }
}

function generateRandomCode(times, min, max) {
  let total = []
  for (let i = 0; i < times; i++) {
    total.push(getRndInt(min, max))
  }

  return total.join("")
}

function isNumberKey(evt) {
  var charCode = (evt.which) ? evt.which : evt.keyCode
  let lengthOfText = getById("sessionCode").value.length > 4
  if ((charCode > 31 && (charCode < 48 || charCode > 57)) || lengthOfText)
    return false;
  return true;
}

function reload() {
  alreadyReloading = true
  document.querySelector("body").innerHTML = ""
  window.location.reload()
  throw "This Is Intentional"
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

const arrayOfDoom = []

function playSound(url) {
  if (!getSoundEffects()) {
    return
  }

  const Audio = document.createElement('audio');
  Audio.style.height = "0px" 
  Audio.style.width = "0px" 
  Audio.src = "sounds/" + url; 
  Audio.playbackRate = 0.85 + getRndInt(0, 31) / 100;
  document.body.appendChild(Audio);
  arrayOfDoom.push(Audio)
  Audio.play()

  Audio.onended = function() {
    removeItem(arrayOfDoom, Audio)
    Audio.remove()
  }
}