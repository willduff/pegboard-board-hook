const { primitives, booleans, extrusions, transforms, utils, hulls, maths, geometries } = require('@jscad/modeling')

const hookMountBase = require('./peglock-mount-base.stl')

const createSteelPegboardHook = (params) => {
  const pegRadius = (params.pegDiameter + params.pegClearance) / 2
  const steelCylinder = primitives.cylinder({ radius: pegRadius, height: params.pegDistance / 2 + params.pegDiameter, segments: 32 })

  const fork = [
    transforms.translate([params.pegDistance / 2, -pegRadius, params.pegDistance / 2 + pegRadius / 2], transforms.rotateX(utils.degToRad(params.existingHookAngle), transforms.translateY(-pegRadius, steelCylinder))),
    transforms.translate([params.pegDistance / 2, 0, 0], primitives.cylinder({ radius: pegRadius, height: (params.pegDistance / 2), segments: 32 })),
    transforms.translate([0, 0, -params.pegDistance / 2 + pegRadius], transforms.rotateY(utils.degToRad(90), primitives.cylinder({ radius: pegRadius, height: params.pegDistance + pegRadius / 2, segments: 32 }))),
    transforms.translate([-params.pegDistance / 2, 0, 0], primitives.cylinder({ radius: pegRadius, height: (params.pegDistance / 2), segments: 32 })),
    transforms.translate([-params.pegDistance / 2, -pegRadius, params.pegDistance / 2 + pegRadius / 2], transforms.rotateX(utils.degToRad(params.existingHookAngle), transforms.translateY(-pegRadius, steelCylinder))),
  ]
  const arm = [
    transforms.translate([0, params.pegDistance / 4  + pegRadius, pegRadius], transforms.rotateX(utils.degToRad(100), primitives.cylinder({ radius: pegRadius, height: params.pegDistance+ pegRadius, segments: 32 }))),
    transforms.translate([0, -pegRadius*1.25, -params.pegDistance + pegRadius], transforms.rotateX(utils.degToRad(0), primitives.cylinder({ radius: pegRadius, height: params.pegDistance * 2, segments: 32 }))),
  ]

  const steelPegboardHook = booleans.union(hulls.hullChain(fork), arm)
  return transforms.centerY(transforms.rotate([utils.degToRad(180), utils.degToRad(0), utils.degToRad(0)], steelPegboardHook))
}

const createHookMountBase = (params) => {
  return transforms.translateZ(params.pegMountDepth - (params.pegClearance * 2),
    transforms.translateY(-params.pegDiameter / 2, 
      transforms.translateX(params.pegDistance / 2, 
        transforms.rotateX(utils.degToRad(90), 
          transforms.rotateY(utils.degToRad(90), 
            hookMountBase
          )
        )
      )
    )
  )
}

const createBoardHookBase = (params) => {
  let boardHookBase = createBoardHookBaseExtrusion(params)
  return transforms.translateY(-params.boardHookBaseHeight / 2, boardHookBase)
}

const createBoardHookBaseExtrusion = (params) => {
    const startPoly = primitives.polygon({ points: [[-params.pegDistance * 1.25, 0], [params.boardHookBaseWidth - (params.pegDistance * 0.75), 0], [params.boardHookBaseWidth - (params.pegDistance), params.boardHookBaseHeight], [-params.pegDistance, params.boardHookBaseHeight]] })
    const base = extrusions.slice.fromSides(geometries.geom2.toSides(startPoly))
    
    let boardHookBaseExtrusion = extrusions.extrudeFromSlices(
      {
        numberOfSlices: params.boardHookBaseDepth,
        callback: (progress, count, base) => {
          const translationMatrix = maths.mat4.fromTranslation(maths.mat4.create(), [0, 0, progress * params.boardHookBaseDepth])
          const scaleMatrix = maths.mat4.fromScaling(maths.mat4.create(), [(1 - progress) * params.boardHookBaseNearFarPlaneScale + 1, (1 - progress) * params.boardHookBaseNearFarPlaneScale + 1, 1])
          return extrusions.slice.transform(maths.mat4.multiply(maths.mat4.create(), scaleMatrix, translationMatrix), base)
        }
      }, base
    )

    let boardHookBaseMountCutout = extrusions.extrudeFromSlices(
      {
        numberOfSlices: params.pegMountDepth,
        callback: (progress, count, base) => {
          const translationMatrix = maths.mat4.fromTranslation(maths.mat4.create(), [0, (0.08 * params.boardHookBaseHeight) / 2, progress * (params.pegMountDepth - (params.pegClearance * 2))])
          const scaleMatrix = maths.mat4.fromScaling(maths.mat4.create(), [2, (params.boardHookBaseNearFarPlaneScale + 1) * 0.92, 1])
          return extrusions.slice.transform(maths.mat4.multiply(maths.mat4.create(), scaleMatrix, translationMatrix), base)
        }
      }, base
    )

    const boardHookBaseCutoutLength = (params.boardHookBaseDepth - (params.insertDropOffset - params.insertDropDistance) - params.pegMountDepth * 4)
    const nearFarPlaneScale = (boardHookBaseCutoutLength / params.boardHookBaseDepth) * params.boardHookBaseNearFarPlaneScale
    let boardHookBaseCutout = extrusions.extrudeFromSlices(
      {
        numberOfSlices: params.pegMountDepth,
        callback: (progress, count, base) => {
          const translationMatrix = maths.mat4.fromTranslation(maths.mat4.create(), [0, 0, progress * boardHookBaseCutoutLength])
          const scaleMatrix = maths.mat4.fromScaling(maths.mat4.create(), [(1 - progress) * nearFarPlaneScale + 1, (1 - progress) * nearFarPlaneScale + 1, 1])
          return extrusions.slice.transform(maths.mat4.multiply(maths.mat4.create(), scaleMatrix, translationMatrix), base)
        }
      }, base
    )
    boardHookBaseCutout = transforms.scale([2, 1.25, 1],
      transforms.translate([0, -params.pegMountDepth * 4, params.pegMountDepth * 2], boardHookBaseCutout)
    )

    return booleans.subtract(booleans.subtract(boardHookBaseExtrusion, boardHookBaseMountCutout), boardHookBaseCutout)
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

  // Slide the steel pegboard hook, to create a mold for how it will be installed
  existingSteelPegboardHook = transforms.translateZ(-params.insertDropDistance, existingSteelPegboardHook)
  const iterationSlideDistance = params.insertSlideDistance / params.numInsertSegments
  for (let i = 0; i < params.numInsertSegments; i++) {
    existingSteelPegboardHookInsertSlices.push(transforms.translateX(iterationSlideDistance * i, existingSteelPegboardHook))
  }
  
  let existingSteelPegboardHookInsertMold = booleans.union(existingSteelPegboardHookInsertSlices)

  // Align to the min X axis of the hook base, and the max Z axis
  existingSteelPegboardHookInsertMold = transforms.translate([-params.pegDiameter, 0, params.insertDropOffset], existingSteelPegboardHookInsertMold)

  // Create the board hook base and subtract away the insert mold
  let boardHook = createBoardHookBase(params)
  boardHook = booleans.subtract(boardHook, existingSteelPegboardHookInsertMold)

  // Attach the hook mount base that will slide into the peglock
  let hookMountBase = transforms.rotateZ(utils.degToRad(params.boardHookAngle), createHookMountBase(params))
  let hookMountBase2 = transforms.rotateZ(utils.degToRad(params.boardHookAngle), transforms.translateY(params.pegDistance, createHookMountBase(params)))
  return transforms.rotateX(utils.degToRad(90), booleans.union(boardHook, hookMountBase, hookMountBase2))
}

const getParameterDefinitions = () => {
    return [
        { name: 'pegDistance', type: 'number', initial: 25.4,  caption: 'Existing Steel Pegboard Hook: Peg distance in mm' },
        { name: 'pegDiameter', type: 'number', initial: 6,  caption: 'Existing Steel Pegboard Hook: Peg diameter in mm' },
        { name: 'pegClearance', type: 'number', initial: 0.5,  caption: 'Existing Steel Pegboard Hook: Peg clearance in mm' },
        
        { name: 'pegMountDepth', type: 'number', initial: 7,  caption: 'Existing Hook Mount Base: Depth in mm' },

        { name: 'existingHookAngle', type: 'number', initial: 40,  caption: 'Existing Steel Pegboard Hook: Angle in degrees' },
        { name: 'numInsertSegments', type: 'number', initial: 48,  caption: 'Existing Steel Pegboard Hook: Number of segments for insertion molding' },
        { name: 'insertDropOffset', type: 'number', initial: 113,  caption: 'Existing Steel Pegboard Hook: Insertion drop offset in mm' },
        { name: 'insertDropDistance', type: 'number', initial: 84,  caption: 'Existing Steel Pegboard Hook: Insertion drop distance in mm' },
        { name: 'insertSlideDistance', type: 'number', initial: 28,  caption: 'Existing Steel Pegboard Hook: Insertion rotation angle in degrees' },

        { name: 'boardHookBaseWidth', type: 'number', initial: 64,  caption: 'Board Hook Base: Width in mm' },
        { name: 'boardHookBaseHeight', type: 'number', initial: 48,  caption: 'Board Hook Base: Height in mm' },
        { name: 'boardHookBaseDepth', type: 'number', initial: 135,  caption: 'Board Hook Base: Depth in mm' },
        { name: 'boardHookAngle', type: 'number', initial: -5,  caption: 'Board Hook Base: Angle in degrees, offset from vertical' },
        { name: 'boardHookBaseNearFarPlaneScale', type: 'number', initial: 0.35,  caption: 'Board Hook Base: Scale for difference between near and far plane' },
    ]
}

module.exports = { main, getParameterDefinitions }