const mapTag = '[object Map]'
const setTag = '[object Set]'
const arrayTag = '[object Array]'
const objectTag = '[object Object]'
const argsTag = '[object Arguments]'

const boolTag = '[object Boolean]'
const dateTag = '[object Date]'
const numberTag = '[object Number]'
const stringTag = '[object String]'
const symbolTag = '[object Symbol]'
const errorTag = '[object Error]'
const regexpTag = '[object RegExp]'
const functionTag = '[object Function]'

const deepTag = [mapTag, setTag, arrayTag, objectTag, argsTag]

function isObject(target) {
    return target !== null && (typeof target === 'object' || typeof target === 'function')
}

function getType(target) {
    return Object.prototype.toString.call(target)
}

function getInit(target) {
    const Ctor = target.constructor
    return new Ctor()
}

function cloneSymbol(target) {
    return Object(Symbol.prototype.valueOf.call(target))
}

function cloneRegExp(target) {
    let result = new RegExp(target.source, target.flags)
    result.lastIndex = target.lastIndex
    return result
}

function cloneFunction(func) {
    const bodyReg = /(?<=\{)(.|\n)+(?=\})/g
    const paramReg = /(?<=\().+?(?=\))/g
    const funcStr = func.toString()
    if(func.prototype) {
        const bodyStr = bodyReg.exec(funcStr)
        const paramStr = paramReg.exec(funcStr)
        if(bodyStr) {
            if(paramStr) {
                const paramArr = paramStr[0].split(',')
                return new Function(...paramArr, bodyStr[0])
            } else {
                return new Function(bodyStr[0])
            }
        } else {
            return null
        }
    } else {
        return eval('(' + func.toString() + ')')
    }   
}

function cloneOtherTypes(target, type) {
    const Ctor = target.constructor
    switch(type) {
        case boolTag:
        case numberTag:
        case stringTag:
        case errorTag:
        case dateTag:
            return new Ctor(target)

        case regexpTag:
            return cloneRegExp(target)

        case symbolTag:
            return cloneSymbol(target)

        case funcTag:
            return cloneFunction(target)

        default:
            return null       
    }
}

function deepClone(target, map=new WeakMap()) {
    if(!isObject(target)) {
        return target
    }

    const type = getType(target)
    let cloneTarget

    if(deepTag.includes(type)) {
        cloneTarget = getInit(target, type)
    } else {
        return cloneOtherTypes(target, type)
    }

    if(map.get(target)) {
        return map.get(target)
    }
    map.set(target, cloneTarget)

    if(type === setTag) {
        target.forEach(value => {
            cloneTarget.add(deepClone(value))
        })
        return cloneTarget
    }

    if(type === mapTag) {
        target.forEach((value,key) => {
            cloneTarget.set(key, deepClone(value))
        })
        return cloneTarget
    }

    if(type === arrayTag || type === objectTag) {
        for(let key in target) {
            cloneTarget[key] = deepClone(target[key])
        }
    }
    
    return cloneTarget
}