'use strict'

function setLegacyConstants (target, property, values) {
  if (target[property] === undefined) {
    Object.defineProperty(target, property, {
      configurable: true,
      enumerable: false,
      value: values,
      writable: true
    })
  }
}

module.exports = function applyHomebridgeCompatibility (hap) {
  const formats = Object.assign({}, hap.Formats || hap.Characteristic.Formats)
  formats.INTEGER = formats.INTEGER || formats.INT
  formats.UInt16 = formats.UInt16 || formats.UINT16

  const hapPerms = hap.Perms || {}
  const existingPerms = hap.Characteristic.Perms || {}
  const perms = Object.assign({}, hapPerms, existingPerms, {
    READ: existingPerms.READ || hapPerms.PAIRED_READ,
    WRITE: existingPerms.WRITE || hapPerms.PAIRED_WRITE,
    NOTIFY: existingPerms.NOTIFY || hapPerms.NOTIFY
  })

  setLegacyConstants(hap.Characteristic, 'Formats', formats)
  setLegacyConstants(hap.Characteristic, 'Perms', perms)
  setLegacyConstants(hap.Characteristic, 'Units', hap.Units || hap.Characteristic.Units)
  setLegacyConstants(hap.Accessory, 'Categories', hap.Categories || hap.Accessory.Categories)

  return hap
}
