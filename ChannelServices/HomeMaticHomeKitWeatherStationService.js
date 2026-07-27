'use strict'

var HomeKitGenericService = require('./HomeKitGenericService.js').HomeKitGenericService
var util = require('util')
var HomeKitTypeFactory = require('../util/HomeKitTypeFactory.js')

function HomeMaticHomeKitWeatherStationService (log, platform, id, name, type, adress, special, cfg, Service, Characteristic) {
  HomeMaticHomeKitWeatherStationService.super_.apply(this, arguments)
}

util.inherits(HomeMaticHomeKitWeatherStationService, HomeKitGenericService)

HomeMaticHomeKitWeatherStationService.prototype.propagateServices = function (homebridge, Service, Characteristic) {
  var uuid = homebridge.uuid
  var isRainingCharacteristicUUID = uuid.generate('HomeMatic:customchar:IsRainingCharacteristic')
  var isRainingServiceUUID = uuid.generate('HomeMatic:customchar:IsRainingService')
  var windSpeedCharacteristicUUID = uuid.generate('HomeMatic:customchar:WindSpeedCharacteristic')
  var windSpeedServiceUUID = uuid.generate('HomeMatic:customchar:WindSpeedService')
  var windDirectionCharacteristicUUID = uuid.generate('HomeMatic:customchar:WindDirectionCharacteristic')
  var windDirectionServiceUUID = uuid.generate('HomeMatic:customchar:WindDirectionService')
  var windRangeCharacteristicUUID = uuid.generate('HomeMatic:customchar:WindRangeCharacteristic')
  var windRangeServiceUUID = uuid.generate('HomeMatic:customchar:WindRangeService')

  Characteristic.IsRainingCharacteristic = HomeKitTypeFactory.createCharacteristic(
    Characteristic,
    'Regen',
    isRainingCharacteristicUUID,
    {
      format: Characteristic.Formats.BOOL,
      perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
    }
  )
  Service.IsRainingService = HomeKitTypeFactory.createService(
    Service,
    isRainingServiceUUID,
    [Characteristic.IsRainingCharacteristic]
  )

  Characteristic.WindSpeedCharacteristic = HomeKitTypeFactory.createCharacteristic(
    Characteristic,
    'Wind Geschwindigkeit',
    windSpeedCharacteristicUUID,
    {
      format: Characteristic.Formats.FLOAT,
      unit: 'km/h',
      minStep: 0.1,
      perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
    }
  )
  Service.WindSpeedService = HomeKitTypeFactory.createService(
    Service,
    windSpeedServiceUUID,
    [Characteristic.WindSpeedCharacteristic]
  )

  Characteristic.WindDirectionCharacteristic = HomeKitTypeFactory.createCharacteristic(
    Characteristic,
    'Wind Richtung',
    windDirectionCharacteristicUUID,
    {
      format: Characteristic.Formats.INTEGER,
      unit: 'Grad',
      perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
    }
  )
  Service.WindDirectionService = HomeKitTypeFactory.createService(
    Service,
    windDirectionServiceUUID,
    [Characteristic.WindDirectionCharacteristic]
  )

  Characteristic.WindRangeCharacteristic = HomeKitTypeFactory.createCharacteristic(
    Characteristic,
    'Wind Schwankungsbreite',
    windRangeCharacteristicUUID,
    {
      format: Characteristic.Formats.INTEGER,
      unit: 'Grad',
      perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
    }
  )
  Service.WindRangeService = HomeKitTypeFactory.createService(
    Service,
    windRangeServiceUUID,
    [Characteristic.WindRangeCharacteristic]
  )
}

HomeMaticHomeKitWeatherStationService.prototype.createDeviceService = function (Service, Characteristic) {
  var that = this

  this.enableLoggingService('weather')
  this.currentTemperature = -255
  this.currentHumidity = -255

  var thermo = new Service['TemperatureSensor'](this.name)
  this.services.push(thermo)

  var ctemp = thermo.getCharacteristic(Characteristic.CurrentTemperature)
    .setProps({ minValue: -100 })
    .on('get', function (callback) {
      that.query('TEMPERATURE', function (value) {
        if (callback) callback(null, value)
      })
    })

  this.setCurrentStateCharacteristic('TEMPERATURE', ctemp)
  ctemp.eventEnabled = true

  var humidity = new Service['HumiditySensor'](this.name)
  this.services.push(humidity)

  var chum = humidity.getCharacteristic(Characteristic.CurrentRelativeHumidity)
    .on('get', function (callback) {
      that.query('HUMIDITY', function (value) {
        if (callback) callback(null, value)
      })
    })

  this.setCurrentStateCharacteristic('HUMIDITY', chum)
  chum.eventEnabled = true

  var brightness = new Service['LightSensor'](this.name)
  this.services.push(brightness)

  var cbright = brightness.getCharacteristic(Characteristic.CurrentAmbientLightLevel)
    .on('get', function (callback) {
      that.query('BRIGHTNESS', function (value) {
        if (callback) callback(null, value)
      })
    })

  this.setCurrentStateCharacteristic('BRIGHTNESS', cbright)
  cbright.eventEnabled = true

  var rain = new Service['IsRainingService'](this.name)
  this.services.push(rain)

  var crain = rain.getCharacteristic(Characteristic.IsRainingCharacteristic)
    .on('get', function (callback) {
      that.query('RAINING', function (value) {
        if (callback) callback(null, value)
      })
    })

  this.setCurrentStateCharacteristic('RAINING', crain)
  crain.eventEnabled = true

  var windspeed = new Service['WindSpeedService'](this.name)
  this.services.push(windspeed)
  var cwindspeed = windspeed.getCharacteristic(Characteristic.WindSpeedCharacteristic)
    .on('get', function (callback) {
      that.query('WIND_SPEED', function (value) {
        if (callback) callback(null, value)
      })
    })

  this.setCurrentStateCharacteristic('WINDSPEED', cwindspeed)
  cwindspeed.eventEnabled = true

  var winddirection = new Service['WindDirectionService'](this.name)
  this.services.push(winddirection)
  var cwinddirection = winddirection.getCharacteristic(Characteristic.WindDirectionCharacteristic)
    .on('get', function (callback) {
      that.query('WIND_DIRECTION', function (value) {
        if (callback) callback(null, value)
      })
    })

  this.setCurrentStateCharacteristic('WIND_DIRECTION', cwinddirection)
  cwinddirection.eventEnabled = true

  var windrange = new Service['WindRangeService'](this.name)
  this.services.push(windrange)
  var cwindrange = windrange.getCharacteristic(Characteristic.WindRangeCharacteristic)
    .on('get', function (callback) {
      that.query('WIND_DIRECTION_RANGE', function (value) {
        if (callback) callback(null, value)
      })
    })

  this.setCurrentStateCharacteristic('WIND_DIRECTION_RANGE', cwindrange)
  cwindrange.eventEnabled = true

  this.queryData()
}

HomeMaticHomeKitWeatherStationService.prototype.queryData = function () {
  var that = this

  this.query('TEMPERATURE', function (value) {
    that.currentTemperature = that.toFiniteNumber(value, that.currentTemperature)
    that.query('HUMIDITY', function (value) {
      that.currentHumidity = that.toRangedPercentage(value, that.currentHumidity, 0, 100)
      if ((that.currentTemperature > -255) && (that.currentHumidity > -255)) {
        that.addLogEntry({ temp: that.currentTemperature, pressure: 0, humidity: that.currentHumidity })
      }
    })
  })

  // Timer: Query device every 10 minutes
  setTimeout(function () { that.queryData() }, 10 * 60 * 1000)
}

HomeMaticHomeKitWeatherStationService.prototype.datapointEvent = function (dp, newValue) {
  if (this.isDataPointEvent(dp, 'TEMPERATURE')) {
    this.currentTemperature = this.toFiniteNumber(newValue, this.currentTemperature)
  }

  if (this.isDataPointEvent(dp, 'HUMIDITY')) {
    this.currentHumidity = this.toRangedPercentage(newValue, this.currentHumidity, 0, 100)
  }

  // make this call a little less often
  if (((this.isDataPointEvent(dp, 'TEMPERATURE')) || (this.isDataPointEvent(dp, 'HUMIDITY'))) &&
       (this.currentTemperature > -255) && (this.currentHumidity > -255)) {
    this.addLogEntry({ temp: this.currentTemperature, pressure: 0, humidity: this.currentHumidity })
  }
}

module.exports = HomeMaticHomeKitWeatherStationService
