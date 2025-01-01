const { primitives, booleans, extrusions, transforms, utils, hulls } = require('@jscad/modeling')

const hookMountBase = require('./peglock-mount-base.stl')

const createSteelPegboardHook = (params) => {
  const pegRadius = (params.pegDiameter + params.pegClearance) / 2
  const steelCylinder = primitives.cylinder({ radius: pegRadius, height: params.pegDistance / 2, segments: 32 })

  const fork = [
    transforms.translate([params.pegDistance / 2, -pegRadius / 2, params.pegDistance / 2 + pegRadius], transforms.rotateX(utils.degToRad(params.existingHookAngle), transforms.translateY(-pegRadius, steelCylinder))),
    transforms.translate([params.pegDistance / 2, 0, 0], primitives.cylinder({ radius: pegRadius, height: (params.pegDistance / 2) + pegRadius, segments: 32 })),
    transforms.translate([0, 0, -params.pegDistance / 2 + pegRadius], transforms.rotateY(utils.degToRad(90), primitives.cylinder({ radius: pegRadius, height: params.pegDistance, segments: 32 }))),
    transforms.translate([-params.pegDistance / 2, 0, 0], primitives.cylinder({ radius: pegRadius, height: (params.pegDistance / 2) + pegRadius, segments: 32 })),
    transforms.translate([-params.pegDistance / 2, -pegRadius / 2, params.pegDistance / 2 + pegRadius], transforms.rotateX(utils.degToRad(params.existingHookAngle), transforms.translateY(-pegRadius, steelCylinder))),
  ]
  const arm = [
    transforms.translate([0, params.pegDistance / 4, pegRadius], transforms.rotateX(utils.degToRad(95), primitives.cylinder({ radius: pegRadius, height: params.pegDistance + params.pegDiameter, segments: 32 }))),
    transforms.translate([0, -pegRadius*1.25, -params.pegDistance + pegRadius], transforms.rotateX(utils.degToRad(5), primitives.cylinder({ radius: pegRadius, height: params.pegDistance * 2, segments: 32 }))),
  ]

  const steelPegboardHook = booleans.union(hulls.hullChain(fork), arm)
  return transforms.centerY(transforms.rotateX(utils.degToRad(180 - params.existingHookAngle), steelPegboardHook))
}

const createHookMountBase = (params) => {
  return hookMountBase
}

const createBoardHookBase = (params) => {
  return primitives.roundedCuboid({ size: [params.boardHookBaseWidth, params.boardHookBaseHeight, params.boardHookBaseDepth] })
}

const main = (params) => {
  // Create a digital replica of the existing steel pegboard hook - Lowe's Project Source Steel Pegboard Hook (8-in W x 1.38-in H)
  let existingSteelPegboardHook = createSteelPegboardHook(params)

  // Move up the steel hook to the top of the insertion point, so it can be moved down each iteration
  existingSteelPegboardHook = transforms.translateZ(params.insertDropDistance, existingSteelPegboardHook)

  // Insert the steel pegboard hook, to create a mold for how it will be installed
  let existingSteelPegboardHookInsertSlices = []
  const iterationDropDistance = params.insertDropDistance / params.numInsertSegments
  for (let i = 0; i < params.numInsertSegments; i++) {
    existingSteelPegboardHookInsertSlices.push(transforms.translateZ(-iterationDropDistance * i, existingSteelPegboardHook))
  }

  // Rotate the steel pegboard hook, to create a mold for how it will be installed
  existingSteelPegboardHook = transforms.translateZ(-params.insertDropDistance, existingSteelPegboardHook)
  const iterationRotationAngle = params.insertRotationAngle / params.numInsertSegments
  for (let i = 0; i < params.numInsertSegments; i++) {
    existingSteelPegboardHookInsertSlices.push(transforms.rotateZ(utils.degToRad(iterationRotationAngle * i), existingSteelPegboardHook))
  }

  // Finally, slide the steel pegboard hook into place, to create a mold for how it will be installed
  const iterationPullDistance = (params.insertDropDistance / 3) / params.numInsertSegments
  for (let i = 0; i < params.numInsertSegments; i++) {
    existingSteelPegboardHookInsertSlices.push(transforms.translateZ(iterationPullDistance * i, transforms.rotateZ(utils.degToRad(params.insertRotationAngle), existingSteelPegboardHook)))
  }
  
  let existingSteelPegboardHookInsertMold = booleans.union(existingSteelPegboardHookInsertSlices)

  // Create the board hook base and subtract away the insert mold
  let boardHook = createBoardHookBase(params)
  boardHook = booleans.subtract(boardHook, existingSteelPegboardHookInsertMold)

  // TODO
  //let hookMountBase = createHookMountBase(params)
  
  return boardHook//, hookMountBase, boardHook)
}

const getParameterDefinitions = () => {
    return [
        { name: 'pegDistance', type: 'number', initial: 25.4,  caption: 'Existing Steel Pegboard Hook: Peg distance in mm' },
        { name: 'pegDiameter', type: 'number', initial: 6,  caption: 'Existing Steel Pegboard Hook: Peg diameter in mm' },
        { name: 'pegClearance', type: 'number', initial: 0.5,  caption: 'Existing Steel Pegboard Hook: Peg clearance in mm' },

        { name: 'existingHookAngle', type: 'number', initial: 35,  caption: 'Existing Steel Pegboard Hook: Angle in degrees' },
        { name: 'numInsertSegments', type: 'number', initial: 18,  caption: 'Existing Steel Pegboard Hook: Number of segments for insertion molding' },
        { name: 'insertDropDistance', type: 'number', initial: 25.4,  caption: 'Existing Steel Pegboard Hook: Insertion drop distance in mm' },
        { name: 'insertRotationAngle', type: 'number', initial: 45,  caption: 'Existing Steel Pegboard Hook: Insertion rotation angle in degrees' },

        { name: 'boardHookBaseWidth', type: 'number', initial: 64,  caption: 'Board Hook Base: Width in mm' },
        { name: 'boardHookBaseHeight', type: 'number', initial: 64,  caption: 'Board Hook Base: Height in mm' },
        { name: 'boardHookBaseDepth', type: 'number', initial: 50.8,  caption: 'Board Hook Base: Depth in mm' },
    ]
}

module.exports = { main, getParameterDefinitions }