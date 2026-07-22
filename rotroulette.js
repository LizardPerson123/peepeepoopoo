const bulletList = []
const players = []
let clickEvents = []
let resolveFunc
let gameAlcohol = []
let names = ["Dan", "Dave", "Derick", "Dustin", "Darlineeee", "Elizabeth", "Eggbert", "Egg", "Gorbachev", "Benjamin", "Anita", "Emily", "Boris Moris",
     "Gerald", "Doug", "Doctor"
]

let textSpeed = 3600
let wheelSpeed = 25
let turnSpeed = 1.5
let difficulty = "normal"

let currentBlankChance = 13
let currentLiveChance = 5
let currentAlcoholChance = 3
let lastAlcoholGiven = {}

//This will have a resolve func for whatToDo function
let multiplayerResolveFunc

//Only used in multiplayer for security purposes; Cross Check When Packet Sent
let currentPlayer

async function giveEffectTo(player, turns, multiplayerContext) {
  const giveEffectMsg = `Who To Give ${this.AlcoholEffect.name} To?`
  const applyEffectTo = await choosePlayer.bind(this)(player, turns, multiplayerContext, giveEffectMsg)

  applyEffectTo.alcoholEffects.push(this.AlcoholEffect)
  getById(`${applyEffectTo.id}Effects`).innerHTML += `<p style='margin-top: 0px; margin-bottom: 2px' id='${this.AlcoholEffect.id}Effect'>${this.AlcoholEffect.name}</p>`

  const msg = `Gave ${this.AlcoholEffect.name} To ${applyEffectTo.name} For ${this.AlcoholEffect.turns} Turns`
  return [--turns, msg, undefined]
}

async function choosePlayer(player, turns, multiplayerContext, msg) {
  let applyEffectTo
        
  if (player.type == "Human") {
    getById("eventHeader").innerHTML = msg
    applyEffectTo = players[await choseShoot(false)]
  }
  else if (!(multiplayerContext == undefined) && multiplayerContext != "pleb") {
    applyEffectTo = players[multiplayerContext]
  }
  else {
    let playerUsingAlcoholOnSelf
    do {
      applyEffectTo = getRndInt(0, players.getAlivePlayers().length)
      applyEffectTo = players.getAlivePlayers()[applyEffectTo]
      playerUsingAlcoholOnSelf = applyEffectTo.name == player.name
    }
    while (playerUsingAlcoholOnSelf && difficulty != "easy")
  }

  return applyEffectTo
}

bulletList.nextItem = function() {
  let item = bulletList[0]
  removeItem(bulletList, item)
  return item
}

bulletList.generateNew = function(num) {
  for (let i = 1; i <= num; i++) {
    if (gameMode == gameModes.insane) {
      bulletList.generateBulletInsane()
      continue
    }

    bulletList.generateBullet()

    if (currentAlcoholChance <= 5 && (i % 3 == 0 || i % 4 == 0)) {
      currentAlcoholChance += 1
      currentLiveChance += 1
      currentBlankChance -= 2
    }
  }
}

bulletList.generateBulletInsane = function() {
  let bullet = getRndInt(1, 3)
  
  // Live
  if (bullet == 1) {
    bulletList.push(true)
    return
  }
  
  // Alcohol
  let type
  do {
    type = getRndInt(0, gameAlcohol.length)
    currentAlcohol = gameAlcohol[type]
  }
  while (currentAlcohol.name == lastAlcoholGiven.name)

  bulletList.push(new gameAlcohol[type])
}

bulletList.generateBullet = function() {
  let bullet = getRndInt(1, 22)
  
  //Alcohol Bullet
  if (bullet <= currentAlcoholChance) {
    let type
    let currentAlcohol = {}

    if (getRndInt(0, 7) == 0 && gameMode == "alcop") {
      bulletList.push(new Mocktail())
      return
    }
    do {
      type = getRndInt(0, gameAlcohol.length)
      currentAlcohol = gameAlcohol[type]
    }
    while (currentAlcohol.name == lastAlcoholGiven.name)
    
    bulletList.push(new gameAlcohol[type])
    lastAlcoholGiven = gameAlcohol[type]
  }
  
  //Live Bullet
  else if (bullet <= currentLiveChance + currentAlcoholChance) {
    bulletList.push(true)
  }
  
  //Blank Bullet
  else {
    bulletList.push(false)
  }
}

players.getAlivePlayers = function() {
  let toReturn = []
  
  players.forEach(function(player) {
    if (player.hp > 0) {
      toReturn.push(player)
    }
  })

  return toReturn
}

class Player {
  constructor(name) {
    this.hp = 3
    this.activeAlcohol = []
    this.type = "Generic"
    this.originalName = name
    this.name = name
    this.id = generateRandomCode(10, 0, 9)
    this.alcoholEffects = []
  }

  async turn(addAlcohol = true) {
    if (this.hp < 1) {
      //Returning Undefined Will Skip Turn
      return [undefined, undefined]
    }

    if (this.skipTurn) {
      this.skipTurn--
      this.clearEffects()
      return ["Skip Turn"]
    }

    let use = await this.whatToDo()
    const chosenAction = use[0]

    if (chosenAction == "alcohol") {
      let multiplayerContext
      let alcoholToUse = use[1]

      if (alcoholToUse instanceof Array) {
        multiplayerContext = use[1][1]
        alcoholToUse = use[1][0]
      }

      let alcohol = this.activeAlcohol[alcoholToUse]
      let useAlcohol = await alcohol.useEffect(this, multiplayerContext)
      let alcoholEffect = useAlcohol[1]
      let alcoholMessage = useAlcohol[0]

      if (alcohol.turns < 1) {
        try {
          getById(`alcohol${alcohol.id}`).remove()
        }
        catch(e) {}

        removeItem(this.activeAlcohol, alcohol)
      }

      this.clearEffects()

      if (alcoholEffect) {
        this.alcoholEffects.push(alcoholEffect)

        getById(`${this.id}Effects`).innerHTML += `<p style='margin-top: 0px; margin-bottom: 2px' id='${alcoholEffect.id}Effect'>${alcoholEffect.name}</p>`
      }
      
      //This Gets Passed To basicTurnDisplay
      return ["alcoholUsed", alcohol, alcoholMessage]
    }
    
    // If Shooting
    let playerDamagedIndex = use[1]

    let resultThing = bulletList.nextItem()
    let playerDamaged = players[playerDamagedIndex]
    let msg = ""

    this.runEffectsShoot()
    
    // Alcohol
    if (resultThing instanceof Alcohol) {
      if (addAlcohol) {
        playerDamaged.activeAlcohol.push(resultThing)
      }

      resultThing.startEffect(this, playerDamaged)
    }

    // Live
    else if (resultThing) { 
      const damage = 1
      let damageMsg = players[playerDamagedIndex].damage(damage, this)

      if (damageMsg != "") {
        msg += "; "
        msg += damageMsg
      }
    }

    this.clearEffects()
    
    //This Gets Passed To basicTurnDisplay
    return [resultThing, playerDamaged, msg]
  }

  runEffectsShoot() {
    this.alcoholEffects.forEach(function(effect) {
      if (effect.shoot) {
        let shootEffect = effect.shoot(this, resultThing, playerDamaged)

        resultThing = shootEffect[0]
        let effectMsg = shootEffect[1]

        if (effectMsg != "") {
          msg += "; "
          msg += shootEffect[1]
        }
      }
    }.bind(this))
  }

  runEffectsDamage() {
    this.alcoholEffects.forEach(function(effect) {
      if (effect.damage) {
        let effectDamage = effect.damage(this, attacker)

        this.hp = effectDamage[0]

        msg = effectDamage[1]
      }
    }.bind(this))
  }

  //Used here so that host and plebs can display results at the same time, this is for host
  async multiplayerTurn(playerIndex, turn) {
    getById("wheel").src = "images/wheel.png"
    dontTurnWheel = false

    getById("event").innerText = ``
    getById("eventHeader").innerText = `${this.name}'s Turn`

    let [result, playerDamaged, msg] = await turn.bind(this)()

    let hp = {}
    let effects = {}
    let activeAlcohol = {}
    let id = {}

    players.forEach(function(player) {
      hp[player.name] = player.hp
      effects[player.name] = player.alcoholEffects
      activeAlcohol[player.name] = player.activeAlcohol
      id[player.name] = player.id
    })

    if (result instanceof Alcohol) {
      result = {
        name: result.name,
        id: result.id,
        description: result.description,
        img: result.img,
        typeObj: "multiplayerAlcohol"
      }
    }

    let nextTurn = players.getAlivePlayers()[players.getAlivePlayers().indexOf(players[players.indexOf(this)]) + 1] || players.getAlivePlayers()[0]
    
    await broadcast(JSON.stringify({
      code: 1,
      player: this,
      result: result,
      playerDamaged: playerDamaged,
      msg: msg,
      nextTurn: nextTurn.name,
      hp: hp,
      effects: effects,
      activeAlcohol: activeAlcohol,
      id: id,
      skipTurn: nextTurn.skipTurn
    }))

    await basicTurnDisplay.bind(this)(() => {
      return [result, playerDamaged, msg]
    })
  }

  clearEffects() {
    this.alcoholEffects.forEach(function(effect) {
      effect.turns--
      if (effect.turns < 1) {
        removeItem(this.alcoholEffects, effect)
        effect.end(this)
        getById(`${effect.id}Effect`).remove()
      }
    }.bind(this))
  }

  removeEffects() {
    this.alcoholEffects.forEach(function(effect) {
      removeItem(this.alcoholEffects, effect)
      getById(`${effect.id}Effect`).remove()
    }.bind(this))
  }

  damage(hp, attacker) {
    this.hp -= hp
    let msg = ""

    this.runEffectsDamage()

    getById(`${this.id}LifeImages`).innerHTML = ""

    for (let i = 1; i <= this.hp; i++) {
      getById(`${this.id}LifeImages`).innerHTML += '<img src="images/life.png" style="image-rendering: pixelated" />'
    }

    if (this.hp < 1) {
      this.removeEffects()
    }

    return msg
  }

  whatToDo() {
    let whatToDo = getRndInt(1, 3)
    let chosenAction

    if (whatToDo == 1 && this.activeAlcohol.length > 0) {
      chosenAction = "alcohol"
      const choseAlcohol = getRndInt(0, this.activeAlcohol.length)
      return [chosenAction, choseAlcohol]
    }

    let player = getRndInt(0, players.getAlivePlayers().length)
    player = players.getAlivePlayers()[player]
    chosenAction = "shoot"
    const attackedPlayer = players.indexOf(player)

    return [chosenAction, attackedPlayer]
  }
}

class Human extends Player {
  constructor(name) {
    super(name)
    this.type = "Human"
    this.waitForPlayerInput = waitForPlayerInput.bind(this)
    this.choseAlcohol = choseAlcohol.bind(this)
    this.choseShoot = choseShoot.bind(this)
  }

  async turn() {
    return await basicTurnDisplay.bind(this)(super.turn)
  }

  damage(hp, attacker) {
    let msg = super.damage(hp, attacker)

    if (this.name != thisPlayer) return msg

    getById("lifeImage").innerHTML = ""

    for (let i = 1; i <= this.hp; i++) {
      getById("lifeImage").innerHTML += '<img width="50em" src="images/life.png">'
    }

    return msg
  }

  async whatToDo(useAlcohol = false, multiplayerContext = undefined) {
    let whatToDo = await this.waitForPlayerInput()

    if (whatToDo == "alcohol" && this.activeAlcohol.length > 0) {
      let alcohol = await this.choseAlcohol(useAlcohol, multiplayerContext)

      if (alcohol == "goBack") {
        return this.whatToDo(useAlcohol, multiplayerContext)
      }
      
      const chosenAction = "alcohol"
      return [chosenAction, alcohol]
    }
    
    let shoot = await this.choseShoot()

    if (shoot == "goBack") {
      return this.whatToDo(useAlcohol, multiplayerContext)
    }
    
    const chosenAction = "shoot"
    return [chosenAction, shoot]
  }

  async multiplayerTurn(nextTurn) {
    return await super.multiplayerTurn(nextTurn, super.turn)
  }
}

class Bot extends Player {
  constructor(name) {
    super(name)
    this.type = "Bot"
  }

  async turn() {
    await basicTurnDisplay.bind(this)(super.turn)
  }

  whatToDo() {
    let whatToDo = super.whatToDo
    return new Promise(async function(resolve) {
      async function whatToDoLocal() {
        let whatToDoBind = whatToDo.bind(this)
        let chosenAction = whatToDoBind()
        if (rejectAlgorithim(chosenAction, this)) {
          return await whatToDoLocal.bind(this)()
        }

        return chosenAction
      }

      setTimeout(async function() {resolve(await whatToDoLocal.bind(this)())}.bind(this), 2000)
    }.bind(this))
  }
}

class MultiplayerHuman extends Player {
  constructor(name) {
    super(name)
    this.type = "MultiplayerHuman"
  }

  async whatToDo() {
    return new Promise(function(resolve) {
      multiplayerResolveFunc = resolve
    }.bind(this))
  }

  async multiplayerTurn(nextTurn) {
    currentPlayer = this.name

    let toReturn = await super.multiplayerTurn(nextTurn, super.turn)

    return toReturn
  }
}

class FratBro extends Player {
  constructor(playerToNotAttack, name) {
    let chosenName = getRndInt(0, names.length)

    if (name == "pleb") {name = undefined}
  
    super((name || "Frat Bro " + names[chosenName]))
    this.type = "FratBro"
    this.playerToNotAttack = playerToNotAttack
  }

  async turn() {
    await basicTurnDisplay.bind(this)(super.turn)
  }

  whatToDo() {
    let whatToDo = super.whatToDo
    return new Promise(function(resolve) {
      setTimeout(function() {
        let whatToDoBind = whatToDo.bind(this)
        let whatToDoResult
        do {
          whatToDoResult = whatToDoBind()
        }
        while (whatToDoResult[0] == "shoot" && players[whatToDoResult[1]].name == this.playerToNotAttack)

        resolve(whatToDoResult)
      }.bind(this), 2000)
    }.bind(this))
  }

  async multiplayerTurn(nextTurn) {
    currentPlayer = this.name

    let toReturn = await super.multiplayerTurn(nextTurn, super.turn)

    return toReturn
  }
}

// For Difficulty
function normalReject(proposedAction, player) {
  let chosenAction = proposedAction[0]
  let chosenTarget = proposedAction[1]

  let hasGuranteedLive = false
  player.alcoholEffects.forEach(function(effect) {
    if (effect.name == "Guranteed Live") {
      hasGuranteedLive = true
    } 
  })

  let targetHasInvincibility = false
  if (chosenAction == "shoot") {
    players[chosenTarget].alcoholEffects.forEach(function(effect) {
      if (effect.name == "Invincibile") {
        targetHasInvincibility = true
      } 
    })
  }

  let hasEffects = false
  player.alcoholEffects.forEach(function(effect) {
    hasEffects = true
  })
  
  // Has Guranteed Live And Chose To Use Alcohol
  if (chosenAction == "alcohol" && hasGuranteedLive) return true
  // Tried To Shoot Itself With Guranteed Live
  else if (chosenAction == "shoot" && hasGuranteedLive && players[chosenTarget].name == player.name) return true
  // Tried To Shoot Target With Invincibility
  else if (targetHasInvincibility) return true
  // Tried To Use Seltzer With No Effects
  else if (!hasEffects && chosenAction == "alcohol" && (player.activeAlcohol[chosenTarget].name == "Seltzer")) return true
  // Tried To Shoot Self At One Heart
  else if (chosenAction == "shoot" && player.hp < 2 && players[chosenTarget].name == player.name) return true
}

function cheatReject(proposedAction, player) {
  let nextBullet = bulletList[0]
  let chosenAction = proposedAction[0]
  let chosenTarget = proposedAction[1]
  
  if (nextBullet instanceof Alcohol && (chosenAction == "alcohol" || players[chosenTarget].name != player.name)) return true
  else if (nextBullet instanceof Alcohol) return "END"
  else if (nextBullet && (chosenAction == "alcohol" || players[chosenTarget].name == player.name)) return true
}

function playerBiasReject(proposedAction, player) {
  let chosenAction = proposedAction[0]
  let targetedPlayer = proposedAction[1]

  if (chosenAction == "alcohol") return false

  let biasPlayer = getRndInt(0, 3) == 0

  if (difficulty == "hard") {
    biasPlayer = true
  }
  
  if (!(players[targetedPlayer] instanceof Human || players[targetedPlayer] instanceof MultiplayerHuman) && biasPlayer) return true
}

function rejectAlgorithim(proposedAction, player, playerBiasRejectUse=true) {
  if (difficulty == "easy") return false
  let useCheatReject = true
  let firstReject = false

  let hasWhiskey = false
  player.alcoholEffects.forEach(function(effect) {
    if (effect.hiddenName == "Whiskey") hasWhiskey = true
  })

  if (difficulty == "normal" && hasWhiskey == false) useCheatReject = false
  if (difficulty == "hard" && hasWhiskey == false && getRndInt(0, 2) == 0) useCheatReject = false

  if (useCheatReject) firstReject = cheatReject(proposedAction, player)
  
  if (firstReject == "END") return false
  else if (firstReject) return true
  else if (normalReject(proposedAction, player)) return true
  else if (playerBiasRejectUse && playerBiasReject(proposedAction, player)) return true
}

let AlcoholTypes = [Beer, Vodka, Whiskey, Gin, Red_Wine, White_Wine, Tequila, Brandy, Mead]
let AlcopAlcoholTypes = [MoonShine, IPA, EnergyBeer, Rum, Seltzer]
let SingleplayerAlcopAlcoholTypes = [MoonShine, IPA, EnergyBeer, Seltzer]