class Gun5050 extends Effect {
  constructor() {
    const name = "50/50 Gun"

    // Basically Infinite
    const turns = 5000

    const onShoot = function() {
      const msg = ""
      const result = getRndInt(0, 2) == 0
      return [result, msg]
    }

    const onDamage = undefined

    super(name, turns, onDamage, onShoot)
  }
}