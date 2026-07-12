//Base Code For Rotting Extensions

class RottingExtension {
  constructor(params = {name: "base", register: () => {}, show: () => {}, additonalConstuctor: () => {}}) {
    this.register = params.register || function() {}
    this.show = params.show || function() {}
    this.name = params.name;
    (params.additonalConstuctor || function() {}).bind(this)()
  }

  static baseDisplay(name) {
    getById("main").style.display = "none"
    getById(name).style.display = "block"
  }

  static currentView = "main"
  static prevView

  static setCurrentView(value) {
    this.prevView = this.currentView
    this.currentView = value

    getById(this.prevView).style.display = "none"
    getById(this.currentView).style.display = "block"
  }
}

let achi = new RottingExtension({
  name: "achi",
  register: async function(acheName, type="bronze") {
    if (!localStorage.getItem("username")) {return}
    
    let achi = localStorage.getItem("achi")
    let username = localStorage.getItem("username")

    if (achi == "" || !achi) {achi = {}}
    else {achi = JSON.parse(achi)}

    if (achi[username]) {
      if (achi[username].includes(acheName)) {return "Already Have"}
    }

    //To Prevent Accounts From Being Banned
    //let action_p = await fetch("https://api.rottingpears.com/action_p?n=" + encodeURI(localStorage.getItem("username")))
    //action_p = await action_p.text()
    //if (action_p >= 10) {return}
    
    //This Returns A Description
    let request = await fetch("https://api.rottingpears.com/xp", {
      method: "POST",
      body: JSON.stringify({
        n: localStorage.getItem("username"),
        p: localStorage.getItem("password"),
        t: 2, 
        an: acheName
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })

    if (request.status != 200) {
      achi = localStorage.getItem("achi")
      if (achi == "" || !achi) {achi = {}}
      else {achi = JSON.parse(achi)}
      if (!achi[username]) {achi[username] = []}
      achi[username].push(acheName)
      achi = JSON.stringify(achi)
      localStorage.setItem("achi", achi)
      return "err"
    }
    
    request = await request.text()
    
    let code = generateRandomCode(10, 0, 9)

    // Appending To Div Removes Onclick Elements, So You Have To Manually Re-add Onclick Events
    let onClickEvents = []
    Array.from(getById("achiLists").querySelectorAll("div")).forEach(function(item) {onClickEvents.push([item.id, item.onclick])})
    getById("achiLists").innerHTML += `<div id="achiDiv${code}" class='achiDiv' style="margin-right: -5em; display: flex; border: solid; padding-left: 5px; padding-right: 20px; gap: 5px; background-color: black; color: white; z-index: 50; cursor: pointer">
    <img src="gold_trophy.png" id="achiImg${code}" style="width: 6em; image-rendering: pixelated;">
    <div>
      <p style="font-size: 1.3em;">You Got An Achievement</p>
      <p style="font-size: 1.2em;" id="achiName${code}">Health Care</p>
    </div>
    </div>`

    onClickEvents.forEach(function(item) {
      try {
        getById(item[0]).onclick = item[1]
      }
      catch {}
    })

    getById("achiImg" + code).src = "images/" + type + "_trophy.png"
    getById("achiDiv" + code).style.display = "flex"
    getById("achiDiv" + code).onclick = () => {alert("Description: " + request)}
    getById("achiName" + code).innerText = acheName

    const maxTimes = 20
    const i = 0
    const id = "achiDiv" + code
    this.animate(i, maxTimes, id)
    
    // This Just Updates The Internal Count Of Achievements Users Have
    achi = localStorage.getItem("achi")
    if (achi == "" || !achi) {achi = {}}
    else {achi = JSON.parse(achi)}
    if (!achi[username]) {achi[username] = []}
    achi[username].push(acheName)
    achi = JSON.stringify(achi)
    localStorage.setItem("achi", achi)
  },

  additonalConstuctor: function() {
    window.addEventListener("DOMContentLoaded", function() {
      let laterAchi = localStorage.getItem("laterAchi")
      laterAchi = JSON.parse(laterAchi)
      laterAchi.forEach(function(achi) {
        this.register(achi.acheName, achi.type)
      }.bind(this))

      localStorage.setItem("laterAchi", undefined)
    }.bind(this))

    this.laterRegi = function(name, type) {
      if (!localStorage.getItem("username")) {return}

      let achi = localStorage.getItem("achi") 
      if (achi == "" || !achi) {achi = {}}
      else {achi = JSON.parse(achi)}

      let username = localStorage.getItem("username")
      if (achi[username]) {
        if (achi[username].includes(name)) {return "Already Have"}
      }
      
      let laterAchi = localStorage.getItem("laterAchi")
      if (laterAchi && laterAchi != "undefined") {laterAchi = JSON.parse(laterAchi)}
      else {laterAchi = []}
      laterAchi.push({acheName: name, type: type})
      localStorage.setItem("laterAchi", JSON.stringify(laterAchi))
    }

    this.animate = function (i, maxI, id) {
      if (i >= maxI || getById(id).getBoundingClientRect().left < 5) {setTimeout(() => {getById(id).remove()}, 5000); return}
      setTimeout(function() {
        let right = getById(id).style.marginRight
        //Remove "em" Section To Just Have Number
        let numberToInc = Number(right.slice(0, right.length - 2))
        numberToInc += 0.3
        getById(id).style.marginRight = numberToInc + "em"
        this.animate(i+1, maxI, id)
      }.bind(this), 20)
    }
  }
})