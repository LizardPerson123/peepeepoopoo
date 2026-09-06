class Specialist extends Bot {
  whatToDoDecision() {
    let player = players[0]
    const chosenAction = "shoot"
    const attackedPlayer = players.indexOf(player)

    return [chosenAction, attackedPlayer]
  }

  whatToDo() {
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve(this.whatToDoDecision())
      }.bind(this), 2000)
    }.bind(this))
  }
}

class Tank extends Bot {
  constructor(name) {
    super(name)
    this.hp = 5
  }
}

class Duplex extends Bot {
  constructor(name) {
    super(name)
    this.hp = 2
  }

  damage(hp, attacker) {
    const damageResult = super.damage(hp, attacker)

    if (this.hp < 1) {
      for (let i = 1; i <= 2; i++) {
        const newTwin = new Bot(`Twin ${i} (${this.name})`)
        newTwin.hp = 1

        players.push(newTwin)
      }

      removeItem(players, this)
      updatePlayers()
    }

    return damageResult
  }
}

class Expendable extends Bot {
  constructor(name) {
    super(name)
    this.hp = 2
  }

  whatToDoDecision() {
    const chosenAction = "shoot"
    const attackedPlayer = players.indexOf(this)

    return [chosenAction, attackedPlayer]
  }

  whatToDo() {
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve(this.whatToDoDecision())
      }.bind(this), 2000)
    }.bind(this))
  }

  damage(hp, attacker) {
    let damageResult = super.damage(hp, attacker)
    
    // If They Kill Themself Than The Player Takes Two Hearts Of Damage
    if (this.hp < 1 && attacker && attacker.name === this.name) {
      players.forEach(function(player) {
        if (player instanceof Human) {
          player.damage(2)
          damageResult += "Player Takes 2 Hearts Of Damage"
        }
      })
    }
    
    return damageResult
  }
}

class CantDie extends Bot {
  constructor(name) {
    super(name)

    // Grab AlcoholEffect Invincible From Red Wine And Add It, Remove Its Name, Then Set Its Turns So That It Basically Never Ends
    const alcoholEffect = new Red_Wine().AlcoholEffect
    alcoholEffect.name = ""
    alcoholEffect.turns = 50000
    this.alcoholEffects.push(alcoholEffect)
    
    const takeDamageName = ""
    const turns = 50000
    const onDamage = undefined
    const onEnd = undefined
    const importance = 5
    const doNotRemoveUnnaturally = true

    function naturalDamageTake(player, result) {
      player.damage(1)
      const msg = "Took Natural Damage"

      // Required To Work With Alcohol Effect Manager
      if (result !== undefined) {
        return [result, msg]
      }

      return msg
    }

    const onShoot = naturalDamageTake
    const onAlcohol = naturalDamageTake
    const giveUpAlcoholEffect = new Effect(takeDamageName, turns, onDamage, onShoot, onEnd, importance, onAlcohol, doNotRemoveUnnaturally)
    this.alcoholEffects.push(giveUpAlcoholEffect)

    this.hp = 5
  }
}

class Innocent extends Bot {
  altOutcome() {
    return "Can't Do Anything"
  }
}

class CanGoInsane extends Bot {
  constructor(name) {
    super(name)
    
    const effectName = ""
    const turns = 50000
    const onDamage = undefined
    const onEnd = undefined
    const importance = 0
    const onAlcohol = undefined
    const doNotRemoveUnnaturally = true

    function onShoot(player, result) {
      if (player.hasGoneInsane) {
        result = true
        return [result, "Guranteed Live"]
      }
      
      let msg = ""
      const goInsane = getRndInt(1, 5) === 1

      if (goInsane) {
        msg = "Has Now Gone Insane"
        player.hasGoneInsane = true
      }

      return [result, msg]
    }

    const insaneEffect = new Effect(effectName, turns, onDamage, onShoot, onEnd, importance, onAlcohol, doNotRemoveUnnaturally)
    this.alcoholEffects.push(insaneEffect)
  }
}

class InfiniteAlcohol extends Bot {
  constructor(name) {
    super(name)
    
    const effectName = ""
    const turns = 50000
    const onDamage = undefined
    const onEnd = undefined
    const importance = 0
    const onShoot = undefined
    const doNotRemoveUnnaturally = true

    function onAlcohol(player) {
      const newAlcohol = new gameAlcohol[getRndInt(0, gameAlcohol.length)]()
      player.activeAlcohol.push(newAlcohol)
      return ""
    }

    const giveUpAlcoholEffect = new Effect(effectName, turns, onDamage, onShoot, onEnd, importance, onAlcohol, doNotRemoveUnnaturally)
    this.alcoholEffects.push(giveUpAlcoholEffect)
  }
}

class Sniper extends Bot {
  constructor(name) {
    super(name)
    
    const effectName = ""
    const turns = 50000
    const onDamage = undefined
    const onEnd = undefined
    const importance = 0

    function supercharge(player, result, playerDamaged) {
      playerDamaged.damage(1)
      result = true
      const msg = "Extra Damage Done"
      
      player.altOutcome = player.altOutcomeFunction
      player.untilSupercharged = player.untilSuperchargedMax
      return [result, msg]
    }

    const onShoot = supercharge
    const onAlcohol = undefined
    const doNotRemoveUnnaturally = true

    const superchargeEffect = new Effect(effectName, turns, onDamage, onShoot, onEnd, importance, onAlcohol, doNotRemoveUnnaturally)
    this.alcoholEffects.push(superchargeEffect)

    this.hp = 2
    this.untilSuperchargedMax = 3
    this.untilSupercharged = this.untilSuperchargedMax
    this.altOutcome = this.altOutcomeFunction
  }

  altOutcomeFunction() {
    this.untilSupercharged--
    
    if (this.untilSupercharged > 0) {
      return `${this.untilSupercharged} Turn(s) Until Supercharged`
    }
    
    this.altOutcome = undefined
    return `${this.name} Is Now Supercharged`
  }

  async whatToDoDecision() {
    const chosenAction = "shoot"
    const player = players.find(player => player instanceof Human)
    const playerIndex = players.indexOf(player)

    return [chosenAction, playerIndex]
  }

  whatToDo() {
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve(this.whatToDoDecision())
      }.bind(this), 2000)
    }.bind(this))
  }
}

let cpus = [Bot, Specialist, Expendable, Duplex, CantDie, CanGoInsane, Innocent, InfiniteAlcohol, Tank, Sniper]