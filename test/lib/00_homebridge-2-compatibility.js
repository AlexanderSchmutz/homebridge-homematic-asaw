'use strict'

const assert = require('assert')
const os = require('os')
const hap = require('@homebridge/hap-nodejs')
const applyHomebridgeCompatibility = require('../../util/HomebridgeCompatibility.js')
const HomeKitTypeFactory = require('../../util/HomeKitTypeFactory.js')
const EveHomeKitTypes = require('../../ChannelServices/EveHomeKitTypes.js')

describe('Homebridge 2 compatibility', function () {
  before(function () {
    applyHomebridgeCompatibility(hap)
  })

  it('provides the legacy constants used by the plugin', function () {
    assert.strictEqual(hap.Characteristic.Formats.DATA, hap.Formats.DATA)
    assert.strictEqual(hap.Characteristic.Formats.INTEGER, hap.Formats.INT)
    assert.strictEqual(hap.Characteristic.Formats.UInt16, hap.Formats.UINT16)
    assert.strictEqual(hap.Characteristic.Perms.READ, hap.Perms.PAIRED_READ)
    assert.strictEqual(hap.Characteristic.Perms.WRITE, hap.Perms.PAIRED_WRITE)
    assert.strictEqual(hap.Characteristic.Perms.NOTIFY, hap.Perms.NOTIFY)
    assert.strictEqual(hap.Characteristic.Units.SECONDS, hap.Units.SECONDS)
    assert.strictEqual(hap.Accessory.Categories.VIDEO_DOORBELL, hap.Categories.VIDEO_DOORBELL)
  })

  it('creates custom characteristics and services with class-based HAP APIs', function () {
    const CustomCharacteristic = HomeKitTypeFactory.createCharacteristic(
      hap.Characteristic,
      'Compatibility Test',
      '00000001-0000-1000-8000-0026BB765291',
      {
        format: hap.Formats.BOOL,
        perms: [hap.Perms.PAIRED_READ, hap.Perms.NOTIFY]
      }
    )
    const CustomService = HomeKitTypeFactory.createService(
      hap.Service,
      '00000002-0000-1000-8000-0026BB765291',
      [CustomCharacteristic]
    )
    const service = new CustomService('Compatibility Test')

    assert.ok(service instanceof hap.Service)
    assert.ok(service.getCharacteristic(CustomCharacteristic) instanceof CustomCharacteristic)
  })

  it('creates the existing Eve power meter types without changing their UUIDs', function () {
    const eve = new EveHomeKitTypes({
      homebridge: {
        hap
      }
    })
    const service = new eve.Service.PowerMeterService('Compatibility Test')

    assert.strictEqual(
      eve.Characteristic.TotalConsumption.UUID,
      'E863F10C-079E-48FF-8F27-9C2605A29F52'
    )
    assert.strictEqual(
      eve.Service.PowerMeterService.UUID,
      'E863F117-079E-48FF-8F27-9C2605A29F52'
    )
    assert.ok(service instanceof hap.Service)
  })

  it('loads fakegato history with the HAP API used by Homebridge 2.2.1', function () {
    const homebridge = {
      hap,
      user: {
        storagePath: function () {
          return os.tmpdir()
        }
      }
    }
    const FakeGatoHistoryService = require('fakegato-history')(homebridge)
    const history = new FakeGatoHistoryService('thermo', {
      displayName: 'Compatibility Test',
      log: {
        debug: function () {}
      }
    }, {
      disableTimer: true
    })

    assert.ok(history instanceof hap.Service)
  })
})
