const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class PromiseCyw {
    constructor(fn) {
        this.state = PENDING
        this.value = null
        this.reason = null
        this.onFulfilledCallbacks = []
        this.onRejectedCallbacks = []

        const resolve = vaule => {
            if(value instanceof PromiseCyw) {
                return value.then(resolve, reject)
            }
            setTimeout(() => {
                if (this.status === PENDING){
                    this.status = FULFILLED
                    this.value = value
                    this.onFulfilledCallbacks.forEach(cb => cb(value))
                }
            }, 0)
        }
        const reject = reason => {
            setTimeout(() => {
                if (this.status === PENDING){
                    this.status = REJECTED
                    this.reason = reason
                    this.onRejectedCallbacks.forEach(cb => cb(reason))
                }
            }, 0)
        }
        try {
            fn(resolve, reject)
        } catch(e) {
            reject(e)
        }
        
    }

    then(onFulfilled, onRejected) {
        let newPromise
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }

        if(this.state === FULFILLED) {
            return newPromise = new PromiseCyw((resolve, reject) => {
                try {
                    let x = onFulfilled(this.value)
                    resolvePromise(newPromise, x, resolve, reject)
                } catch(e) {
                    reject(e)
                }
            })
        }

        if(this.state === REJECTED) {
            return newPromise = new PromiseCyw((resolve, reject) => {
                try {
                    let x = onRejected(this.reason)
                    resolvePromise(newPromise, x, resolve, reject)
                } catch(e) {
                    reject(e)
                }
            })
        }

        if (this.status === PENDING) { // 等待态
            // 当异步调用resolve/rejected时 将onFulfilled/onRejected收集暂存到集合中
            return newPromise = new PromiseCyw((resolve, reject) => {
                this.onFulfilledCallbacks.push((value) => {
                    try {
                        let x = onFulfilled(value)
                        resolvePromise(newPromise, x, resolve, reject)
                    } catch(e) {
                        reject(e)
                    }
                })
                this.onRejectedCallbacks.push((reason) => {
                    try {
                        let x = onRejected(reason)
                        resolvePromise(newPromise, x, resolve, reject)
                    } catch(e) {
                        reject(e)
                    }
                })
            })
        }
    }
    
    catch(onRejected) {
        return this.then(null, onRejected)
    }

    static race(promises) {
        return new PromiseCyw((resolve, reject) => {
            promises.forEach((promise, index) => {
                promise.then(resolve, reject)
            })
        })
    }

    static all(promises) {
        return new PromiseCyw((resolve, reject) => {
            let values = []
            let count = 0
            promises.forEach((promise, index) => {
                promise.then((value) => {
                    values[index] = value
                    count++
                    if(count === promises.length) {
                        resolve(values)
                    }
                })
            })
        })
    }

    static resolve(value) {
        return new PromiseCyw(resolve => {
            resolve(value)
        })
    }

    static reject(reason) {
        return new PromiseCyw((resolve, reject) => {
            reject(reason)
        })
    }
}

function resolvePromise(newPromise, x, resolve, reject) {
    if(newPromise === x) {
        return reject(new TypeError('循环引用'))
    }

    let called = false // 避免多次调用
    // 如果x是一个promise对象 （该判断和下面 判断是不是thenable对象重复 所以可有可无）
    if (x instanceof PromiseCyw) { // 获得它的终值 继续resolve
        if (x.status === PENDING) { // 如果为等待态需等待直至 x 被执行或拒绝 并解析y值
            x.then(y => {
                resolvePromise(newPromise, y, resolve, reject)
            }, reason => {
                reject(reason)
            })
        } else { // 如果 x 已经处于执行态/拒绝态(值已经被解析为普通值)，用相同的值执行传递下去 promise
            x.then(resolve, reject)
        }
        // 如果 x 为对象或者函数
    } else if (x != null && ((typeof x === 'object') || (typeof x === 'function'))) {
        try { // 是否是thenable对象（具有then方法的对象/函数）
            let then = x.then
            if (typeof then === 'function') {
                then.call(x, y => {
                    if(called) return
                    called = true
                    resolvePromise(newPromise, y, resolve, reject)
                }, reason => {
                    if(called) return
                    called = true
                    reject(reason)
                })
            } else { // 说明是一个普通对象/函数
                resolve(x)
            }
        } catch(e) {
            if(called) return
            called = true
            reject(e)
        }
    } else {
        resolve(x)
    }
}

/* 
**测试resolve的值是一个Promise对象
let p1 = new Promise(function(resolve, reject) {
    setTimeout(() => {
        resolve(1)
    },3000)
})

let p2 = new Promise(function(resolve, reject) {
    resolve(p1)
})

p2.then((v) => {
    console.log(v)
}) 
*/