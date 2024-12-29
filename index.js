const { roundedCuboid } = require('@jscad/modeling').primitives
const { union } = require('@jscad/modeling').booleans
 
const createHookMountBase = (params) => {
  return roundedCuboid(params)
}

const createBoardHook = (params) => {
  return roundedCuboid(params)
}

const main = (params) => {
  let hookMountBase = createHookMountBase(params)
  let boardHook = createBoardHook(params)
  return union(hookMountBase, boardHook)
}

const getParameterDefinitions = () => {
    return [
        { name: 'width',  type: 'number', initial: 1,  caption: 'Width in mm' },
        { name: 'depth',  type: 'number', initial: 1,  caption: 'Depth in mm' },
        { name: 'height', type: 'number', initial: 1,  caption: 'Height in mm' },
    ]
}

module.exports = { main, getParameterDefinitions }