'use strict'

var HomeKitGenericService = require('./HomeKitGenericService.js').HomeKitGenericService
var util = require('util')
var HomeKitTypeFactory = require('../util/HomeKitTypeFactory.js')

function HomeMaticHomeKitRaindetectorService (log, platform, id, name, type, adress, special, cfg, Service, Characteristic) {
  HomeMaticHomeKitRaindetectorService.super_.apply(this, arguments)
}

util.inherits(HomeMaticHomeKitRaindetectorService, HomeKitGenericService)

HomeMaticHomeKitRaindetectorService.prototype.propagateServices = function (homebridge, Service, Characteristic) {
  var uuid = homebridge.uuid
  var charUUID = uuid.generate('HomeMatic:customchar:IsRainingCharacteristic')
  var servUUID = uuid.generate('HomeMatic:customchar:IsRainingService')

  Characteristic.IsRainingCharacteristic = HomeKitTypeFactory.createCharacteristic(
    Characteristic,
    'Regen',
    charUUID,
    {
      format: Characteristic.Formats.BOOL,
      perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
    }
  )

  Service.IsRainingService = HomeKitTypeFactory.createService(
    Service,
    servUUID,
    [Characteristic.IsRainingCharacteristic]
  )
}

HomeMaticHomeKitRaindetectorService.prototype.createDeviceService = function (Service, Characteristic) {
  var that = this
  var rain = new Service['IsRainingService'](this.name)
  this.services.push(rain)
  var crain = rain.getCharacteristic(Characteristic.IsRainingCharacteristic)
    .on('get', function (callback) {
      that.query('STATE', function (value) {
        if (callback) callback(null, value)
      })
    })

  this.currentStateCharacteristic['RAINING'] = crain
  crain.eventEnabled = true
}

module.exports = HomeMaticHomeKitRaindetectorService
