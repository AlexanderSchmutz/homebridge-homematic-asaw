'use strict'

var HomeKitGenericService = require('./HomeKitGenericService.js').HomeKitGenericService
var util = require('util')

function HomeMaticHomeKitIPThermostatService (log, platform, id, name, type, adress, special, cfg, Service, Characteristic) {
  HomeMaticHomeKitIPThermostatService.super_.apply(this, arguments)
}

util.inherits(HomeMaticHomeKitIPThermostatService, HomeKitGenericService)

HomeMaticHomeKitIPThermostatService.prototype.createDeviceService = function (Service, Characteristic) {
  var that = this
  this.usecache = false
  var thermo = new Service['Thermostat'](this.name)
  this.services.push(thermo)
  this.enableLoggingService('thermo')

  var mode = thermo.getCharacteristic(Characteristic.CurrentHeatingCoolingState)
    .on('get', function (callback) {
      that.query('SET_POINT_TEMPERATURE', function (value) {
        if (value < 6.0) {
          that.getCurrentStateCharacteristic('CONTROL_MODE').setValue(1, null)
          if (callback) callback(null, 0)
        } else {
          that.getCurrentStateCharacteristic('CONTROL_MODE').setValue(0, null)
          if (callback) callback(null, 1)
        }
      })
    })

  this.setCurrentStateCharacteristic('CONTROL_MODE', mode)
  mode.eventEnabled = true

  var targetMode = thermo.getCharacteristic(Characteristic.TargetHeatingCoolingState)
    .on('get', function (callback) {
      that.query('SET_POINT_TEMPERATURE', function (value) {
        if (value < 6.0) {
          if (callback) callback(null, 0)
        } else {
          if (callback) callback(null, 1)
        }
      })
    })

    .on('set', function (value, callback) {
      if (value === 0) {
        this.command('setrega', 'SET_POINT_TEMPERATURE', 0)
        this.cleanVirtualDevice('SET_POINT_TEMPERATURE')
      } else {
        this.cleanVirtualDevice('SET_POINT_TEMPERATURE')
      }
      callback()
    }.bind(this))

  targetMode.setProps({
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY],
    maxValue: 1,
    minValue: 0,
    minStep: 1
  })

  this.cctemp = thermo.getCharacteristic(Characteristic.CurrentTemperature)
    .setProps({ minValue: -100 })
    .on('get', function (callback) {
      this.remoteGetValue('ACTUAL_TEMPERATURE', function (value) {
        if (callback) callback(null, value)
      })
    }.bind(this))

  this.cctemp.eventEnabled = true

  this.cchum = thermo.getCharacteristic(Characteristic.CurrentRelativeHumidity)
    .on('get', function (callback) {
      this.remoteGetValue('HUMIDITY', function (value) {
        if (callback) callback(null, value)
      })
    }.bind(this))

  this.cchum.eventEnabled = true

  this.ttemp = thermo.getCharacteristic(Characteristic.TargetTemperature)
    .setProps({ minValue: 6.0, maxValue: 30.5, minStep: 0.1 })
    .on('get', function (callback) {
      this.query('SET_POINT_TEMPERATURE', function (value) {
        if (value < 6) {
          value = 6
        }
        if (value > 30) {
          value = 30.5
        }
        if (callback) callback(null, value)
      })
    }.bind(this))

    .on('set', function (value, callback) {
      this.delayed('setrega', 'SET_POINT_TEMPERATURE', value, 500)
      callback()
    }.bind(this))

  this.ttemp.eventEnabled = true

  thermo.getCharacteristic(Characteristic.TemperatureDisplayUnits)
    .on('get', function (callback) {
      if (callback) callback(null, Characteristic.TemperatureDisplayUnits.CELSIUS)
    })

  this.remoteGetValue('SET_POINT_TEMPERATURE')
  this.queryData()
}

HomeMaticHomeKitIPThermostatService.prototype.queryData = function () {
  var that = this
  this.query('HUMIDITY', function (value) {
    let humidity = that.toRangedPercentage(value, that.toFiniteNumber(that.currentHumidity, NaN), 0, 100)
    if (Number.isFinite(humidity)) {
      that.currentHumidity = humidity
      that.cchum.updateValue(humidity, null)
      that.addLogEntry({ humidity: humidity })
    }
  })

  this.query('ACTUAL_TEMPERATURE', function (value) {
    let temperature = that.toFiniteNumber(value, that.toFiniteNumber(that.currentTemperature, NaN))
    if (Number.isFinite(temperature)) {
      that.currentTemperature = temperature
      that.cctemp.updateValue(temperature, null)
      that.addLogEntry({ currentTemp: temperature })
    }
  })

  // create timer to query device every 10 minutes
  this.refreshTimer = setTimeout(function () { that.queryData() }, 10 * 60 * 1000)
}

HomeMaticHomeKitIPThermostatService.prototype.shutdown = function () {
  clearTimeout(this.refreshTimer)
}

HomeMaticHomeKitIPThermostatService.prototype.datapointEvent = function (dp, newValue) {
  if (this.isDataPointEvent(dp, 'ACTUAL_TEMPERATURE')) {
    let temperature = this.toFiniteNumber(newValue, this.toFiniteNumber(this.currentTemperature, NaN))
    if (Number.isFinite(temperature)) {
      this.currentTemperature = temperature
      this.cctemp.updateValue(temperature, null)
      this.addLogEntry({ currentTemp: temperature })
    }
  }

  if (this.isDataPointEvent(dp, 'HUMIDITY')) {
    let humidity = this.toRangedPercentage(newValue, this.toFiniteNumber(this.currentHumidity, NaN), 0, 100)
    if (Number.isFinite(humidity)) {
      this.currentHumidity = humidity
      this.cchum.updateValue(humidity, null)
      this.addLogEntry({ humidity: humidity })
    }
  }

  if (this.isDataPointEvent(dp, 'SET_POINT_TEMPERATURE')) {
    let setTemperature = this.toFiniteNumber(newValue, this.toFiniteNumber(this.targetTemperature, NaN))
    if (Number.isFinite(setTemperature)) {
      this.targetTemperature = setTemperature
      this.ttemp.updateValue(setTemperature, null)
      this.addLogEntry({ setTemp: setTemperature })
    }
  }
}

module.exports = HomeMaticHomeKitIPThermostatService
