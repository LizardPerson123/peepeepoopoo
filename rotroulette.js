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

bulletList.nextItem = function() {
  let item = bulletList[0]
  removeItem(bulletList, item)
  return item
}

bulletList.generateNew = function(num) {
  for (let i = 1; i <= num; i++) {
    let currentAlcohol = {}
    if (gameMode == "insane") {
      let bullet = getRndInt(1, 3)

      if (bullet == 1) {bulletList.push(true)}
      else {
        let type
        do {
          type = getRndInt(0, gameAlcohol.length)
          currentAlcohol = gameAlcohol[type]
        }
        while (currentAlcohol.name == lastAlcoholGiven.name)

        bulletList.push(new gameAlcohol[type])
      }
      continue
    }

    let bullet = getRndInt(1, 22)

    if (bullet <= currentAlcoholChance) {
      let type
      if (getRndInt(0, 7) == 0 && gameMode == "alcop") {
        bulletList.push(new Mocktail())
        continue
      }
      do {
        type = getRndInt(0, gameAlcohol.length)
        currentAlcohol = gameAlcohol[type]
      }
      while (currentAlcohol.name == lastAlcoholGiven.name)
      
      bulletList.push(new gameAlcohol[type])
      lastAlcoholGiven = gameAlcohol[type]
    }
    else if (bullet <= currentLiveChance + currentAlcoholChance) {
      bulletList.push(true)
    }
    else {
      bulletList.push(false)
    }

    if (currentAlcoholChance <= 5 && (i % 3 == 0 || i % 4 == 0)) {
      currentAlcoholChance += 1
      currentLiveChance += 1
      currentBlankChance -= 2
    }
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

class Alcohol {
  constructor(turns = 1, effect = () => {}, startEffect = () => {}) {
    this.turns = turns
    this.effect = effect
    this.startEffect = startEffect
    this.name = "Generic"
    this.id = generateRandomCode(10, 0, 9)
  }

  async useEffect(player, multiplayerContext = undefined) {
    let effectResult = await this.effect(player, this.turns, multiplayerContext)
    this.turns = effectResult[0]

    return [effectResult[1], effectResult[2]]
  }
}

class Beer extends Alcohol {
  constructor() {
    const turns = 1
    super(turns, function onUse(player, turns) {
      turns--

      const msg = "Guranteed Live"
      const effect = this.AlcoholEffect
      return [turns, msg, effect]
    })
    
    const effectMsg = "Guranteed Live"
    const effectTurns = 1
    const onDamage = undefined

    this.AlcoholEffect = new Effect(effectMsg, effectTurns, onDamage, function onShoot(player, result) {
      const newShootResult = true
      const msg = "Guranteed Live"
      return [newShootResult, msg]
    })

    this.name = "Beer"
    this.description = "Gives A Guranteed Live Next Turn"
    this.img = "beer.png"
  }
}

class Red_Wine extends Alcohol {
  constructor() {
    const turns = 1
    super(turns, function onUse(player, turns) {
      turns--
      
      const msg = "Invincible For One Turn"
      const effect = this.AlcoholEffect
      return [turns, msg, effect]
    })
    
    const effectMsg = "Invincible"
    const effectTurns = 1
    this.AlcoholEffect = new Effect(effectMsg, effectTurns, function onDamage(player) {
      let pronoun = "They"

      if (player.type == "Human") {
        pronoun = "You"
      }
      
      const msg = `But ${pronoun} Were Invincible`
      return [player.hp + 1, msg]
    })

    this.name = "Red Wine"
    this.description = "Makes You Invincible For 1 Turn"
    this.img = "red_wine.png"
  }

  oname = "Red_Wine"
}

class Whiskey extends Alcohol {
  constructor() {
    const turns = 1
    super(turns, function(player, turns) {
      return new Promise(async function(resolve) {
        turns--
      
        if (player.type == "Human") {
          let nextBullet
          
          //If Multiplayer, Than Get Next Bullets From The Host
          if (host && host != thisPlayer) {
            nextBullet = await waitForWhiskeyCallback()
          }
          else {
            nextBullet = bulletList.slice(0, 5)
          }
          
          getById("event").innerHTML = "The Next Bullets Are"

          nextBullet.forEach(function(bullet) {
            if (bullet == false) {
              getById("event").innerHTML += " Blank,"
            }

            else if (bullet === true) {
              getById("event").innerHTML += " Live,"
            }

            else  {
              getById("event").innerHTML += " Alcohol,"
            }
          })

          setTimeout(function() {
            const msg = "Saw The Next Shots"
            resolve([turns, msg])
          }, 5000)
        }
        else {
          const msg = "Saw The Next Shots"
          resolve([turns, msg, this.AlcoholEffect])
        }
      }.bind(this))
    })
    
    const name = ""
    const effectTurns = 5
    const onDamage = undefined
    const onShoot = undefined
    const onEnd = undefined
    this.AlcoholEffect = new Effect(name, effectTurns, onDamage, onShoot, onEnd)
    this.AlcoholEffect.hiddenName = "Whiskey"

    this.name = "Whiskey"
    this.description = "Lets You See The Next 5 Shots"
    this.img = "whiskey.png"
  }
}

class Vodka extends Alcohol {
  constructor() {
    const turns = 1
    super(turns, function(player, turns, multiplayerContext) {
      return new Promise(async function(resolve) {
        turns--
        let stealFrom

        //If Status (An HTML Element), Is Not Assigned, It Won't Crash
        let status = {}
        status.innerHTML = ""

        if (player.type == "Human") {
          getById("eventHeader").innerHTML = "Who To Steal From?"
          stealFrom = players[await choseShoot(false)]
          status = getById("statusEffects")
        }
        else if (!(multiplayerContext == undefined) && multiplayerContext != "pleb") {
          //This Is For Host To Apply Pleb Choice In Multiplayer (multiplayerContext is who pleb is stealing from)
          stealFrom = players[multiplayerContext]
          playerUsingAlcoholOnSelf = stealFrom.name == player.name
        }
        else {
          let playerUsingAlcoholOnSelf
          do {
            stealFrom = getRndInt(0, players.getAlivePlayers().length)
            stealFrom = players.getAlivePlayers()[stealFrom]
            playerUsingAlcoholOnSelf = stealFrom.name == player.name
          }
          while (playerUsingAlcoholOnSelf && difficulty != "easy")
        }

        stealFrom.activeAlcohol.forEach(function(alcohol) {
          player.activeAlcohol.push(alcohol)
          status.innerHTML +=  `<p id='alcohol${alcohol.id}' onclick='displayAlcoholInfo("${alcohol.name}", "${alcohol.description}", "${alcohol.img}")' style="font-size: 2em; margin-top: 1px; margin-bottom: 0px">${alcohol.name}</p>`
        })

        if (stealFrom.activeAlcohol.length == 1 && stealFrom.activeAlcohol[0].name == "Vodka" && player.type == "Human") {
          achi.register("Pointless", "bronze")
        }

        stealFrom.activeAlcohol = []

        if (multiplayerContext == "pleb") {
          const attackedPlayer = players.indexOf(stealFrom)
          resolve([turns, attackedPlayer, undefined])
        }
        else if (stealFrom.type == "Human") {
          getById("statusEffects").innerHTML = "<h1>Alcohol</h1>"
        }
        
        const msg = "Stole Alcohol From " + stealFrom.name
        resolve([turns, msg, undefined])
      })
    })

    this.name = "Vodka"
    this.description = "Steals Alcohol"
    this.img = "vodka.png"
  }
}

class Brandy extends Alcohol {
  constructor() {
    const turns = 1
    super(turns, function(player, turns, multiplayerContext) {
      return new Promise(async function(resolve) {
        turns--

        let applyEffectTo
        
        if (player.type == "Human") {
          getById("eventHeader").innerHTML = "Who To Give Forced Blanks To?"
          applyEffectTo = players[await choseShoot(false)]
        }
        else if (!(multiplayerContext == undefined) && multiplayerContext != "pleb") {
          //This Is For Host To Apply Pleb Choice In Multiplayer (multiplayerContext is who pleb is giving forced blanks to)
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

        applyEffectTo.alcoholEffects.push(this.AlcoholEffect)

        if (multiplayerContext == "pleb") {
          const attackedPlayer = players.indexOf(applyEffectTo)
          resolve([turns, attackedPlayer, undefined])
        }

        getById(`${applyEffectTo.id}Effects`).innerHTML += `<p style='margin-top: 0px; margin-bottom: 2px' id='${this.AlcoholEffect.id}Effect'>${this.AlcoholEffect.name}</p>`
        
        const msg = "Gave Forced Blank To " + applyEffectTo.name + " For 2 Turns"
        resolve([turns, msg, undefined])
      }.bind(this))
    })
    
    const effectMsg = "Forced Blank"
    const effectTurns = 2
    const onDamage = undefined
    this.AlcoholEffect = new Effect(effectMsg, effectTurns, onDamage, function onShoot(player, result) {
      const newShootResult = false
      const msg = "Forced Blank"
      return [newShootResult, msg]
    })

    this.name = "Brandy"
    this.description = "Give A Selected Player Forced Blanks For 2 Turns"
    this.img = "brandy.png"
  }
}

class White_Wine extends Alcohol {
  constructor() {
    const turns = 1
    super(turns, function(player, turns) {
      turns--
      player.damage(-1)
      const msg = "Healed One"
      return[turns, msg, undefined]
    })

    this.name = "White Wine"
    this.description = "Heal One HP"
    this.img = "white_wine.png"
  }

  oname = "White_Wine"
}

class Tequila extends Alcohol {
  constructor() {
    const turns = 1
    super(turns, function(player, turns, multiplayerContext) {
      return new Promise(async function(resolve) {
        turns--

        let removeEffectFrom
        
        if (player.type == "Human") {
          getById("eventHeader").innerHTML = "Who To Clear Effects From?"
          removeEffectFrom = players[await choseShoot(false)]
        }
        else if (!(multiplayerContext == undefined) && multiplayerContext != "pleb") {
          removeEffectFrom = players[multiplayerContext]
        }
        else {
          do {
            removeEffectFrom = getRndInt(0, players.getAlivePlayers().length)
            removeEffectFrom = players.getAlivePlayers()[removeEffectFrom]
          }
          while (removeEffectFrom.name == player.name)
        }

        removeEffectFrom.alcoholEffects = []

        if (multiplayerContext == "pleb") {
          const attackedPlayer = players.indexOf(removeEffectFrom)
          resolve([turns, attackedPlayer, undefined])
        }

        getById(`${removeEffectFrom.id}Effects`).innerHTML = ''
        
        const msg = "Cleared All Effects From " + removeEffectFrom.name
        resolve([turns, msg, undefined])
      }.bind(this))
    })

   this.name = "Tequila"
   this.description = "Clears Effect From Selected Player"
   this.img = "tequila.png"
  }
}

class Gin extends Alcohol {
  constructor() {
    const turns = 1
    super(turns, function(player, turns) {
      return new Promise(async function(resolve) {
        if (player instanceof Human) {achi.register("One Of The Alcohols", "bronze")}
        turns--
        const msg = "Attacks; Can Now Damage The Attacker"
        resolve([turns, msg, this.AlcoholEffect])
      }.bind(this))
    })
    
    const effectMsg = "Shield"
    const effectTurns = 3

    this.AlcoholEffect = new Effect(effectMsg, effectTurns, function onDamage(player, attacker=player) {
      if (getRndInt(1, 3) == 1 && !(player.id === attacker.id)) {
        attacker.damage(1)
        
        const msg = `But It Bounced Off And Hit ${attacker.name}`
        return [player.hp + 1, msg]
      }
      else {
        return [player.hp, '']
      }
    })

    this.name = "Gin"
    this.description = "Places A Shield Around You; Bullets Have A Chance To Bounce Off You And Hit The Attacker; Lasts 3 Turns"
    this.shortDescription = "Bullets Have A Chance To Bounce Off You"
    this.img = "gin.png"
  }
}

class MoonShine extends Alcohol {
  constructor() {
    const turns = 1
    super(turns, function (player, turns, multiplayerContext) {
      return new Promise(async function(resolve) {
        let heartsToWager

        if (player instanceof MultiplayerHuman) {
          heartsToWager = multiplayerContext
        }
        else if (player instanceof Human) {
          getById("eventHeader").innerText = "How Many Hearts Will You Wager?"
          heartsToWager = await chooseHowManyHearts(player)
        }
        else {
          do {
            heartsToWager = getRndInt(1, player.hp + 1)
          }
          while (heartsToWager == 1 && difficulty != "easy" && player.hp > 1)
        }

        this.AlcoholEffect.health = heartsToWager

        if (multiplayerContext == "pleb") {
          const thisPlayer = players.indexOf(player)
          resolve([turns, heartsToWager, undefined])
          return
        }

        resolve([--turns, "Wagered " + heartsToWager + " Hearts", this.AlcoholEffect])
      }.bind(this))
    })

    const effectMsg = "Wasted"
    const effectTurns = 1
    const onDamage = undefined

    this.AlcoholEffect = new Effect(effectMsg, effectTurns, onDamage, function onShoot(player, result, playerDamaged) {
      let heartsWagered = this.health

      let isLive = getRndInt(1, 3) == 1
      let msg = ""

      if (isLive) {
        //One Extra Damage Is Always Done
        playerDamaged.damage(heartsWagered - 1)
        msg = `${heartsWagered} Damage Dealt`
      }
      else {
        player.damage(heartsWagered)
        msg = `${heartsWagered} Health Lost`
      }

      const newShootResult = isLive
      return [newShootResult, msg]
    })

    this.name = "Moon Shine"
    this.description = "Choose To Sacrifice An Amount Of Hearts; If Your Next Turn Is Live, That Damage Is Dealt, If It Is Blank, You Lose Those Hearts"
    this.shortDescription = "Choose To Gamble An Amount Of Hearts"
    this.img = "moonshine.png"
  }

  oname = "MoonShine"
}

class Seltzer extends Alcohol {
  constructor() {
    const turns = 1
    super(turns, async function(player, turns, multiplayerContext) {
      player.alcoholEffects.length = 0
      getById(`${player.id}Effects`).innerHTML = ''
      return [--turns, "Cleared All Effects", undefined]
    })

    this.name = "Seltzer"
    this.description = "Clears All Effects From Yourself"
    this.img = "seltzer.png"
  }

  oname = "Seltzer"
}

class IPA extends Alcohol {
  constructor() {
    const turns = 1
    super(turns, async function(player, turns, multiplayerContext) {
      let bro = new FratBro(player.name, multiplayerContext)
      players.push(bro)
      addPlayer(bro)
      bro.damage(2)

      if (multiplayerContext == "pleb") {
        const name = bro.name
        return [turns, name, undefined]
      }

      return [--turns, bro.name + " Has Joined The Battle", undefined]
    })

    this.name = "IPA"
    this.description = "Summons A Person With One Heart To Fight With You; They Cannot Shoot You"
    this.shortDescription = "Summons An Ally"
    this.img = "ipa.png"
  }

  oname = "IPA"
}

class EnergyBeer extends Alcohol {
  constructor() {
    const turns = 1
    super(turns, function onUse(player, turns) {
      turns--

      const msg = "Guranteed Live For 2 Turns, But With A Risk Of Heart Attack"
      const effect = this.AlcoholEffect
      return [turns, msg, effect]
    })
    
    const effectMsg = "Palpitations"
    const effectTurns = 2
    const onDamage = undefined

    this.AlcoholEffect = new Effect(effectMsg, effectTurns, onDamage, function onShoot(player, result) {
      let heartAttack = getRndInt(0, 3) == 0
      if (heartAttack) {
        if (player.hp == 1) {player.damage(1)}
        while (player.hp > 1) {
          player.damage(1)
        }

        this.turns = 0
        return [false, `${player.name} Had A Heart Attack`]
      }

      const newShootResult = true
      const msg = "Guranteed Live"
      return [newShootResult, msg]
    })

    this.name = "Energy Beer"
    this.description = "Gives A Guranteed Live For The Next Two Turns; But With A Risk Of Getting A Heart Attack And Losing A Lot Of Health"
    this.shortDescription = "Gives A Guranteed Live For The Next Two Turns; But With A Risk"
    this.img = "energybeer.png"
  }

  oname = "EnergyBeer"
}

class Rum extends Alcohol {
  constructor() {
    const turns = 1
    super(turns, function(player, turns, multiplayerContext) {
      return new Promise(async function(resolve) {
        turns--

        let applyEffectTo
        
        if (player.type == "Human") {
          getById("eventHeader").innerHTML = "Who To Give Confusion To?"
          applyEffectTo = players[await choseShoot(false)]
        }
        else if (!(multiplayerContext == undefined) && multiplayerContext != "pleb") {
          //This Is For Host To Apply Pleb Choice In Multiplayer (multiplayerContext is who pleb is giving forced blanks to)
          applyEffectTo = players[multiplayerContext]
        }
        else {
          applyEffectTo = getRndInt(0, players.getAlivePlayers().length)
          applyEffectTo = players.getAlivePlayers()[applyEffectTo]
        }

        applyEffectTo.alcoholEffects.push(this.AlcoholEffect)

        if (multiplayerContext == "pleb") {
          const attackedPlayer = players.indexOf(applyEffectTo)
          resolve([turns, attackedPlayer, undefined])
        }

        applyEffectTo.confused = true

        getById(`${applyEffectTo.id}Effects`).innerHTML += `<p style='margin-top: 0px; margin-bottom: 2px' id='${this.AlcoholEffect.id}Effect'>${this.AlcoholEffect.name}</p>`
        
        const msg = "Gave Confusion To " + applyEffectTo.name + " For 2 Turns"
        resolve([turns, msg, undefined])
      }.bind(this))
    })
    
    const effectMsg = "Confusion"
    const effectTurns = 3
    const onDamage = undefined
    const onShoot = undefined
    this.AlcoholEffect = new Effect(effectMsg, effectTurns, onDamage, onShoot, function onEnd(player) {
      let doRemove = true
      player.alcoholEffects.forEach(function(effect) {
        if (effect.name == "Confusion") {doRemove = false}
      })

      if (doRemove) {
        player.confused = false
      }
    })

    this.name = "Rum"
    this.description = "Randomize A Player's Options"
    this.img = "rum.png"
  }
}

class Mead extends Alcohol {
  constructor() {
    const turns = 1
    super(turns, function(player, turns, multiplayerContext) {
      return new Promise(async function(resolve) {
        turns--

        let applyEffectTo
        
        if (player.type == "Human") {
          getById("eventHeader").innerHTML = "Who To Skip The Next Turn Of?"
          applyEffectTo = players[await choseShoot(false)]
        }
        else if (!(multiplayerContext == undefined) && multiplayerContext != "pleb") {
          //This Is For Host To Apply Pleb Choice In Multiplayer (multiplayerContext is who pleb is giving forced blanks to)
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

        applyEffectTo.alcoholEffects.push(this.AlcoholEffect)

        if (multiplayerContext == "pleb") {
          const attackedPlayer = players.indexOf(applyEffectTo)
          resolve([turns, attackedPlayer, undefined])
        }

        getById(`${applyEffectTo.id}Effects`).innerHTML += `<p style='margin-top: 0px; margin-bottom: 2px' id='${this.AlcoholEffect.id}Effect'>${this.AlcoholEffect.name}</p>`
        applyEffectTo.skipTurn = 1
        
        const msg = "Skipping Next Turn Of " + applyEffectTo.name
        resolve([turns, msg, undefined])
      }.bind(this))
    })
    
    const effectMsg = "Skip Turn"
    const effectTurns = 1
    const onDamage = undefined
    const onShoot = undefined
    this.AlcoholEffect = new Effect(effectMsg, effectTurns, onDamage, onShoot)

    this.name = "Mead"
    this.description = "Skip A Selected Player's Turn"
    this.img = "mead.png"
  }
}

class Mocktail extends Alcohol {
  constructor() {
    const turns = 1
    super(turns, function(player, turns, multiplayerContext) {
      return new Promise(async function(resolve) {
        if (multiplayerContext != "pleb") {
          let msg
          switch(getRndInt(0, 3)) {
            case(2): {
              msg = "Guranteed Live"
              this.name = "Beer"
              this.AlcoholEffect.name = "Guranteed Live"
              break
            }
            case (1): {
              msg = "Invincible For One Turn"
              this.name = "Red Wine"
              this.AlcoholEffect.name = "Invincible"
              break
            }
            case (0): {
              msg = "Attacks On Them Can Now Damage The Attacker"
              this.name = "Gin"
              this.AlcoholEffect.turns = 3
              this.AlcoholEffect.name = "Shield"
              break
            }
          }

          resolve([--turns, msg, this.AlcoholEffect])
          return
        }

        resolve([--turns, undefined, undefined])
      }.bind(this))
    })
    
    const effectMsg = ""
    const effectTurns = 1
    const onDamage = undefined
    const onShoot = undefined
    this.AlcoholEffect = new Effect(effectMsg, effectTurns, onDamage, onShoot)

    this.name = "Mocktail"
    this.description = "Fake Having An Effect Chosen At Random"
    this.img = "mocktail.png"
  }
}

class Effect {
  constructor(name, turns, onDamage = undefined, onShootResult = undefined, onEnd = () => {}) {
    this.turns = turns
    this.id = generateRandomCode(10, 0, 9)
    this.damage = onDamage
    this.shoot = onShootResult
    this.name = name
    this.end = onEnd
  }
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

    let playerDamagedIndex = use[1]

    let resultThing = bulletList.nextItem()
    let playerDamaged = players[playerDamagedIndex]
    let msg = ""

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

    if (resultThing instanceof Alcohol) {
      if (addAlcohol) {
        playerDamaged.activeAlcohol.push(resultThing)
      }

      resultThing.startEffect(this, playerDamaged)
    }
    else if (resultThing) { 
      let damageMsg = players[playerDamagedIndex].damage(1, this)

      if (damageMsg != "") {
        msg += "; "
        msg += damageMsg
      }
    }

    this.clearEffects()
    
    //This Gets Passed To basicTurnDisplay
    return [resultThing, playerDamaged, msg]
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

    this.alcoholEffects.forEach(function(effect) {
      if (effect.damage) {
        let effectDamage = effect.damage(this, attacker)

        this.hp = effectDamage[0]

        msg = effectDamage[1]
      }
    }.bind(this))

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
  
  if (targetedPlayer != 0 && biasPlayer) return true
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