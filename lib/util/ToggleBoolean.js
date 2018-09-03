class ToggleBoolean {
  constructor(initialStatus) {
    this.on = this.on.bind(this)

    this.status = initialStatus || false
  }

  on() {
    this.status = true
  }

  check() {
    return this.status
  }
}

module.exports = ToggleBoolean
