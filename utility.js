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
  document.querySelector("body").innerHTML = ""
  window.location.reload()
  throw "This Is Intentional"
}