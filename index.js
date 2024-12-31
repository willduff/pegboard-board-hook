const { primitives, booleans, extrusions, transforms, utils, hulls } = require('@jscad/modeling')

const hookMountBase = require('./peglock-mount-base.stl')

const createSteelPegboardHook = (params) => {
  let pegRadius = (params.pegDiameter + params.pegClearance) / 2
  let steelCylinder = primitives.cylinder({ radius: pegRadius, height: params.pegDistance / 2, segments: 32 })

  const fork = [
    transforms.translate([params.pegDistance / 2, -pegRadius / 2, params.pegDistance / 2 + pegRadius], transforms.rotateX(utils.degToRad(params.existingHookAngle), transforms.translateY(-pegRadius, steelCylinder))),
    transforms.translate([params.pegDistance / 2, 0, 0], steelCylinder),
    transforms.translate([0, 0, -params.pegDistance / 2 + pegRadius], transforms.rotateY(utils.degToRad(90), primitives.cylinder({ radius: pegRadius, height: params.pegDistance - (2 * pegRadius), segments: 32 }))),
    transforms.translate([-params.pegDistance / 2, 0, 0], steelCylinder),
    transforms.translate([-params.pegDistance / 2, -pegRadius / 2, params.pegDistance / 2 + pegRadius], transforms.rotateX(utils.degToRad(params.existingHookAngle), transforms.translateY(-pegRadius, steelCylinder))),
  ]
  const arm = [
    transforms.translate([0, params.pegDistance / 2, pegRadius], transforms.rotateX(utils.degToRad(95), primitives.cylinder({ radius: pegRadius, height: params.pegDistance, segments: 32 }))),
  ]
  let steelPegboardHook = booleans.union(hulls.hullChain(fork), arm)
  return transforms.rotateX(utils.degToRad(90), steelPegboardHook)
}

const createHookMountBase = (params) => {
  return hookMountBase
}

const createBoardHook = (params) => {
  return primitives.roundedCuboid(params)
}

const main = (params) => {
  let existingSteelPegboardHook = createSteelPegboardHook(params)

  let hookMountBase = createHookMountBase(params)
  let boardHook = createBoardHook(params)
  return booleans.union(existingSteelPegboardHook)//, hookMountBase, boardHook)
}

const getParameterDefinitions = () => {
    return [
        { name: 'pegDistance', type: 'number', initial: 25.4,  caption: 'Existing Steel Pegboard Hook: Peg distance in mm' },
        { name: 'pegDiameter', type: 'number', initial: 6,  caption: 'Existing Steel Pegboard Hook: Peg diameter in mm' },
        { name: 'pegClearance', type: 'number', initial: 0.5,  caption: 'Existing Steel Pegboard Hook: Peg clearance in mm' },
        
        { name: 'existingHookAngle', type: 'number', initial: 35,  caption: 'Existing Steel Pegboard Hook: Angle in degrees' },

        { name: 'doHull', type: 'radio', caption: 'Show:', values: ['shapes', 'hull', 'chain'], captions: ['Original Shapes', 'Hull', 'Hull Chain'], initial: 'shapes' }
    ]
}

module.exports = { main, getParameterDefinitions }