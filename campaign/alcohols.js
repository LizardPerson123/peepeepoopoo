class SuperBeer extends Beer {
  constructor() {
    super()
    this.AlcoholEffect.turns = getRndInt(2, 4)
    this.name = "Super Beer"
    this.description = `Guranteed Lives For 2-3 Turns`
    this.shortDescription = this.description
    this.whenUsedDesc = `Guranteed Lives For ${this.AlcoholEffect.turns} Turns`
  }

  oname = "SuperBeer"
}

class SuperBrandy extends Brandy {
  constructor() {
    super()
    this.name = "Super Brandy"
    this.shortDescription = "Give A Player Forced Alcohols"
    this.description = "Give A Player Forced Alcohols; If They Shoot Themselves Then It Is Live"

    const effectMsg = "Forced Alcohols"
    const effectTurns = this.AlcoholEffect.turns
    const onDamage = undefined
    this.AlcoholEffect = new Effect(effectMsg, effectTurns, onDamage, function onShoot(player, result, playerDamaged) {
      let newShootResult = new gameAlcohol[getRndInt(0, gameAlcohol.length)]()
      let msg = "Forced Alcohol"

      if (player.name === playerDamaged.name) {
        newShootResult = true
        msg = "Forced Live"
      }

      return [newShootResult, msg]
    })
  }

  oname = "SuperBrandy"
}

class SuperRedWine extends Red_Wine {
  constructor() {
    super()
    this.name = "Super Red Wine"
    this.description = `Invincible For 2-3 Turns`
    this.shortDescription = this.description
    this.AlcoholEffect.turns = getRndInt(2, 4)
  }

  oname = "SuperRedWine"
}

class SuperGin extends Gin {
  constructor() {
    super()
    this.name = "Super Gin"
    this.description = "Places A Shield Around You; Bullets Have A Chance To Bounce Off You And Hit The Attacker; Lasts 5 Turns"
    this.AlcoholEffect.turns = 5
  }

  oname = "SuperGin"
}

let SuperAlcohols = [SuperBeer, SuperBrandy, SuperGin, SuperRedWine]