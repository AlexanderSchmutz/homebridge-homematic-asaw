'use strict'

var HomeKitGenericService = require('./HomeKitGenericService.js').HomeKitGenericService
var util = require('util')
var HomeKitTypeFactory = require('../util/HomeKitTypeFactory.js')

function HomeMaticHomeKitProgramService (log, platform, id, name, type, adress, special, cfg, Service, Characteristic) {
  HomeMaticHomeKitProgramService.super_.apply(this, arguments)
}

util.inherits(HomeMaticHomeKitProgramService, HomeKitGenericService)

HomeMaticHomeKitProgramService.prototype.propagateServices = function (homebridge, Service, Characteristic) {
  Characteristic.ProgramLaunchCharacteristic = HomeKitTypeFactory.createCharacteristic(
    Characteristic,
    'Program',
    '5E0115D7-7594-4846-AFB7-F456389E81EC',
    {
      format: Characteristic.Formats.BOOL,
      perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
    }
  )

  Service.ProgramLaunchService = HomeKitTypeFactory.createService(
    Service,
    'B7F46B4D-3D69-4804-8114-393F257D4039',
    [Characteristic.ProgramLaunchCharacteristic]
  )
}

HomeMaticHomeKitProgramService.prototype.createDeviceService = function (Service, Characteristic) {
  var that = this
  var prg = new Service['ProgramLaunchService'](this.name)
  this.services.push(prg)

  var pgrl = prg.getCharacteristic(Characteristic.ProgramLaunchCharacteristic)

    .on('get', function (callback) {
      if (callback) callback(null, 0)
    })

    .on('set', function (value, callback) {
      that.log.debug('ProgramLaunchService Event %s', value)
      if ((value === 1) || (value === true)) {
        that.log.debug('Launch Program %s', that.adress)
        that.command('sendregacommand', '', 'var x=dom.GetObject("' + that.adress + '");if (x) {x.ProgramExecute();}', function () {
        })

        setTimeout(function () {
          pgrl.setValue(0, null)
        }, 1000)
      }
      let result = 0
      callback(result)
    })

  pgrl.eventEnabled = true
}

module.exports = HomeMaticHomeKitProgramService
