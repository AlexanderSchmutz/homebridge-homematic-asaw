'use strict'

const HomeKitTypeFactory = require('../util/HomeKitTypeFactory.js')

let hap

module.exports = class CustomHomeKitTypes {
  constructor (homebridge) {
    hap = homebridge.homebridge.hap
    this.Characteristic = {}
    this.Service = {}
  }

  createCharacteristic (name, uuid, props, displayName = name) {
    this.Characteristic[name] = HomeKitTypeFactory.createCharacteristic(
      hap.Characteristic,
      displayName,
      uuid,
      props
    )
  }

  createService (name, uuid, Characteristics, OptionalCharacteristics = []) {
    this.Service[name] = HomeKitTypeFactory.createService(
      hap.Service,
      uuid,
      Characteristics,
      OptionalCharacteristics
    )
  }
}
