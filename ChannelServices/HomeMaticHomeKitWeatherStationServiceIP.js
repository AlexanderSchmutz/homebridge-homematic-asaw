'use strict'

var HomeKitGenericService = require('./HomeKitGenericService.js').HomeKitGenericService
var util = require('util')
var HomeKitTypeFactory = require('../util/HomeKitTypeFactory.js')

function HomeMaticHomeKitWeatherStationServiceIP (log, platform, id, name, type, adress, special, cfg, Service, Characteristic) {
  HomeMaticHomeKitWeatherStationServiceIP.super_.apply(this, arguments)
}

util.inherits(HomeMaticHomeKitWeatherStationServiceIP, HomeKitGenericService)

HomeMaticHomeKitWeatherStationServiceIP.prototype.propagateServices = function (homebridge, Service, Characteristic) {
  var uuid = homebridge.uuid
  var isRainingCharacteristicUUID = uuid.generate('HomeMatic:customchar:IsRainingCharacteristic')
  var isRainingServiceUUID = uuid.generate('HomeMatic:customchar:IsRainingService')
  var rainCountCharacteristicUUID = uuid.generate('HomeMatic:customchar:RainCountCharacteristic')
  var rainCountServiceUUID = uuid.generate('HomeMatic:customchar:RainCountService')
  var windSpeedCharacteristicUUID = uuid.generate('HomeMatic:customchar:WindSpeedCharacteristic')
  var windSpeedServiceUUID = uuid.generate('HomeMatic:customchar:WindSpeedService')
  var windDirectionCharacteristicUUID = uuid.generate('HomeMatic:customchar:WindDirectionCharacteristic')
  var windDirectionServiceUUID = uuid.generate('HomeMatic:customchar:WindDirectionService')
  var windRangeCharacteristicUUID = uuid.generate('HomeMatic:customchar:WindRangeCharacteristic')
  var windRangeServiceUUID = uuid.generate('HomeMatic:customchar:WindRangeService')
  var sunshineCharacteristicUUID = uuid.generate('HomeMatic:customchar:SunshineCharacteristic')
  var sunshineServiceUUID = uuid.generate('HomeMatic:customchar:SunshineService')

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

  Characteristic.RainCountCharacteristic = HomeKitTypeFactory.createCharacteristic(
    Characteristic,
    'Regenmenge',
    rainCountCharacteristicUUID,
    {
      format: Characteristic.Formats.FLOAT,
      unit: 'mm',
      minStep: 0.1,
      perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
    }
  )
  Service.RainCountService = HomeKitTypeFactory.createService(
    Service,
    rainCountServiceUUID,
    [Characteristic.RainCountCharacteristic]
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

  Characteristic.SunshineCharacteristic = HomeKitTypeFactory.createCharacteristic(
    Characteristic,
    'Sonnenscheindauer',
    sunshineCharacteristicUUID,
    {
      format: Characteristic.Formats.FLOAT,
      unit: 'Minuten',
      perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
    }
  )
  Service.SunshineService = HomeKitTypeFactory.createService(
    Service,
    sunshineServiceUUID,
    [Characteristic.SunshineCharacteristic]
  )
}

HomeMaticHomeKitWeatherStationServiceIP.prototype.createDeviceService = function (Service, Characteristic) {
  var that = this

  this.enableLoggingService('weather')
  this.currentTemperature = -255
  this.currentHumidity = -255

  // HmIP-SWO-B - TemperatureSensor, HumiditySensor, LightSensor, SunshineService, WindSpeedService
  var thermo = new Service['TemperatureSensor'](this.name)
  this.services.push(thermo)

  this.ctemp = thermo.getCharacteristic(Characteristic.CurrentTemperature)
    .setProps({
      minValue: -100
    })
    .on('get', function (callback) {
      that.query('ACTUAL_TEMPERATURE', function (value) {
        if (callback) callback(null, value)
      })
    })

  this.setCurrentStateCharacteristic('ACTUAL_TEMPERATURE', this.ctemp)
  this.ctemp.eventEnabled = true

  var humidity = new Service['HumiditySensor'](this.name)
  this.services.push(humidity)

  this.chum = humidity.getCharacteristic(Characteristic.CurrentRelativeHumidity)
    .on('get', function (callback) {
      that.query('HUMIDITY', function (value) {
        if (callback) callback(null, value)
      })
    })

  this.setCurrentStateCharacteristic('HUMIDITY', this.chum)
  this.chum.eventEnabled = true

  var brightness = new Service['LightSensor'](this.name)
  this.services.push(brightness)

  this.cbright = brightness.getCharacteristic(Characteristic.CurrentAmbientLightLevel)
    .on('get', function (callback) {
      that.query('ILLUMINATION', function (value) {
        if (callback) callback(null, value)
      })
    })

  this.setCurrentStateCharacteristic('ILLUMINATION', this.cbright)
  this.cbright.eventEnabled = true

  var sunshineduration = new Service['SunshineService'](this.name)
  this.services.push(sunshineduration)

  this.csunshineduration = sunshineduration.getCharacteristic(Characteristic.SunshineCharacteristic)
    .on('get', function (callback) {
      this.query('SUNSHINEDURATION', function (value) {
        if (callback) callback(null, value)
      })
    }.bind(this))

  this.setCurrentStateCharacteristic('SUNSHINEDURATION', this.csunshineduration)
  this.csunshineduration.eventEnabled = true

  if (this.deviceType === 'HmIP-SWO-B') {
    var windspeed = new Service['WindSpeedService'](this.name)
    this.services.push(windspeed)

    this.cwindspeed = windspeed.getCharacteristic(Characteristic.WindSpeedCharacteristic)
      .on('get', function (callback) {
        this.query('WIND_SPEED', function (value) {
          if (callback) callback(null, value)
        })
      }.bind(this))

    this.setCurrentStateCharacteristic('WIND_SPEED', this.cwindspeed)
    this.cwindspeed.eventEnabled = true
  }

  // HmIP-SWO-PL - HmIP-SWO-B + RainSensor RainCountService
  if ((this.deviceType === 'HmIP-SWO-PL') || (this.deviceType === 'HmIP-SWO-PR')) {
    var raining = new Service['IsRainingService'](this.name)
    this.services.push(raining)

    var craining = raining.getCharacteristic(Characteristic.IsRainingCharacteristic)
      .on('get', function (callback) {
        that.query('RAINING', function (value) {
          if (callback) callback(null, value)
        })
      })

    this.setCurrentStateCharacteristic('RAINING', craining)
    craining.eventEnabled = true

    var raincount = new Service['RainCountService'](this.name)
    this.services.push(raincount)

    this.craincount = raincount.getCharacteristic(Characteristic.RainCountCharacteristic)
      .on('get', function (callback) {
        this.query('RAIN_COUNTER', function (value) {
          if (callback) callback(null, value)
        })
      }.bind(this))

    this.setCurrentStateCharacteristic('RAIN_COUNTER', this.craincount)
    this.craincount.eventEnabled = true
  }

  // HmIP-SWO-PR - HmIP-SWO-PL + WindDirectionService + WindRangeService
  if (this.deviceType === 'HmIP-SWO-PR') {
    var winddirection = new Service['WindDirectionService'](this.name)
    this.services.push(winddirection)

    this.cwinddirection = winddirection.getCharacteristic(Characteristic.WindDirectionCharacteristic)
      .on('get', function (callback) {
        this.query('WIND_DIR', function (value) {
          if (callback) callback(null, value)
        })
      }.bind(this))

    this.setCurrentStateCharacteristic('WIND_DIR', this.cwinddirection)
    this.cwinddirection.eventEnabled = true

    var windrange = new Service['WindRangeService'](this.name)
    this.services.push(windrange)

    this.cwindrange = windrange.getCharacteristic(Characteristic.WindRangeCharacteristic)
      .on('get', function (callback) {
        this.query('WIND_DIR_RANGE', function (value) {
          if (callback) callback(null, value)
        })
      }.bind(this))

    this.setCurrentStateCharacteristic('WIND_DIR_RANGE', this.cwindrange)
    this.cwindrange.eventEnabled = true
  }

  this.queryData()
}

HomeMaticHomeKitWeatherStationServiceIP.prototype.queryData = function () {
  var that = this

  this.query('ACTUAL_TEMPERATURE', function (value) {
    that.currentTemperature = that.toFiniteNumber(value, that.currentTemperature)
    that.query('HUMIDITY', function (value) {
      that.currentHumidity = that.toRangedPercentage(value, that.currentHumidity, 0, 100)
      if ((that.currentTemperature > -255) && (that.currentHumidity > -255)) {
        that.addLogEntry({
          temp: that.currentTemperature,
          pressure: 0,
          humidity: that.currentHumidity
        })
      }
    })
  })

  // Timer: Query device every 10 minutes
  setTimeout(function () {
    that.queryData()
  }, 10 * 60 * 1000)
}

HomeMaticHomeKitWeatherStationServiceIP.prototype.datapointEvent = function (dp, newValue) {
  if (this.isDataPointEvent(dp, 'ACTUAL_TEMPERATURE')) {
    let temperature = this.toFiniteNumber(newValue, this.currentTemperature)
    if (Number.isFinite(temperature)) {
      this.currentTemperature = temperature
      this.ctemp.updateValue(temperature, null)
    }
  }

  if (this.isDataPointEvent(dp, 'HUMIDITY')) {
    let humidity = this.toRangedPercentage(newValue, this.currentHumidity, 0, 100)
    if (Number.isFinite(humidity)) {
      this.currentHumidity = humidity
      this.chum.updateValue(humidity, null)
    }
  }

  if (this.isDataPointEvent(dp, 'ILLUMINATION')) {
    let illumination = this.toFiniteNumber(newValue, NaN)
    if (Number.isFinite(illumination)) {
      this.cbright.updateValue(illumination, null)
    }
  }

  if (this.isDataPointEvent(dp, 'SUNSHINEDURATION')) {
    let sunshineDuration = this.toFiniteNumber(newValue, NaN)
    if (Number.isFinite(sunshineDuration)) {
      this.csunshineduration.updateValue(sunshineDuration, null)
    }
  }

  if (this.isDataPointEvent(dp, 'WIND_SPEED')) {
    let windSpeed = this.toFiniteNumber(newValue, NaN)
    if (Number.isFinite(windSpeed)) {
      this.cwindspeed.updateValue(windSpeed, null)
    }
  }

  if (this.isDataPointEvent(dp, 'RAIN_COUNTER')) {
    let rainCounter = this.toFiniteNumber(newValue, NaN)
    if (Number.isFinite(rainCounter)) {
      this.craincount.updateValue(rainCounter, null)
    }
  }

  if (this.isDataPointEvent(dp, 'WIND_DIR')) {
    let windDirection = this.toFiniteNumber(newValue, NaN)
    if (Number.isFinite(windDirection)) {
      this.cwinddirection.updateValue(windDirection, null)
    }
  }

  if (this.isDataPointEvent(dp, 'WIND_DIR_RANGE')) {
    let windDirectionRange = this.toFiniteNumber(newValue, NaN)
    if (Number.isFinite(windDirectionRange)) {
      this.cwindrange.updateValue(windDirectionRange, null)
    }
  }

  // make this call a little less often
  if (((this.isDataPointEvent(dp, 'ACTUAL_TEMPERATURE')) || (this.isDataPointEvent(dp, 'HUMIDITY'))) &&
        (this.currentTemperature > -255) && (this.currentHumidity > -255)) {
    this.addLogEntry({
      temp: this.currentTemperature,
      pressure: 0,
      humidity: this.currentHumidity
    })
  }
}

module.exports = HomeMaticHomeKitWeatherStationServiceIP
