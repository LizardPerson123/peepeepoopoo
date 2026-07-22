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
    this.shortDescription = "Gives A Guranteed Live"
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
    this.shortDescription = "Makes You Invincible"
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
    this.shortDescription = "Lets You See The Next Shots"
    this.img = "whiskey.png"
  }
}

class Vodka extends Alcohol {
  constructor() {
    const turns = 1
    super(turns, function(player, turns, multiplayerContext) {
      return new Promise(async function(resolve) {
        const stealFromMsg = "Who To Steal From?"
        const stealFrom = await choosePlayer.bind(this)(player, turns, multiplayerContext, stealFromMsg)
        let status = {}

        if (stealFrom.activeAlcohol.length == 1 && stealFrom.activeAlcohol[0].name == "Vodka" && player.type == "Human") {
          achi.register("Pointless", "bronze")
        }

        if (player.type == "Human") {
          status = getById("statusEffects")
        }

        stealFrom.activeAlcohol.forEach(function(alcohol) {
          player.activeAlcohol.push(alcohol)
          status.innerHTML +=  `<p id='alcohol${alcohol.id}' onclick='displayAlcoholInfo("${alcohol.name}", "${alcohol.description}", "${alcohol.img}")' style="font-size: 2em; margin-top: 1px; margin-bottom: 0px">${alcohol.name}</p>`
        })

        stealFrom.activeAlcohol = []

        if (multiplayerContext == "pleb") {
          // Executes If Multiplayer And This Player Is A Pleb
          const attackedPlayer = players.indexOf(stealFrom)
          resolve([turns, attackedPlayer, undefined])
        }
        else if (stealFrom.type == "Human") {
          getById("statusEffects").innerHTML = "<h1>Alcohol</h1>"
        }
        
        const msg = "Stole Alcohol From " + stealFrom.name
        resolve([--turns, msg, undefined])
      }.bind(this))
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
        const effectGiveTo = await giveEffectTo.bind(this)(player, turns, multiplayerContext)
        resolve(effectGiveTo)
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
    this.shortDescription = "Give A Selected Player Forced Blanks"
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
        const removeEffectMsg = "Who To Clear Effects From?"
        const removeEffectFrom = await choosePlayer.bind(this)(player, turns, multiplayerContext, removeEffectMsg)

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
        const msg = "Attacks Can Now Damage The Attacker"
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
    this.shortDescription = "Bullets Can Bounce Off You"
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
    this.shortDescription = "Gamble Health"
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
        const effectResult = await giveEffectTo.bind(this)(player, turns, multiplayerContext)
        resolve(effectResult)
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
        
        const skipTurnMsg = "Who To Skip The Turn Of?"
        let applyEffectTo = await choosePlayer.bind(this)(player, turns, multiplayerContext, skipTurnMsg)

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