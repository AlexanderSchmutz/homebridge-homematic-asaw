'use strict'

function createCharacteristic (BaseCharacteristic, displayName, uuid, props) {
  class CustomCharacteristic extends BaseCharacteristic {
    constructor () {
      super(displayName, uuid)
      this.setProps(props)
      this.value = this.getDefaultValue()
    }
  }

  CustomCharacteristic.UUID = uuid
  return CustomCharacteristic
}

function createService (BaseService, uuid, characteristics, optionalCharacteristics = []) {
  class CustomService extends BaseService {
    constructor (displayName, subtype) {
      super(displayName, uuid, subtype)
      for (const Characteristic of characteristics) {
        this.addCharacteristic(Characteristic)
      }
      for (const Characteristic of optionalCharacteristics) {
        this.addOptionalCharacteristic(Characteristic)
      }
    }
  }

  CustomService.UUID = uuid
  return CustomService
}

module.exports = {
  createCharacteristic,
  createService
}
