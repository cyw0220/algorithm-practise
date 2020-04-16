class lazyMan {
    constructor(name) {
        this.taskList = []
        this._subcribe(generateTask('lazyMan', name))
        setTimeout(()=> {
            this._publish()
        }, 0)
    }

    _subcribe(task) {
        if(task.type === 'sleepFirst'){
            this.taskList.unshift(task)
        } else {
            this.taskList.push(task)
        }
    }

    _publish() {
        if(this.taskList.length > 0) {
            this._run(this.taskList.shift())
        }
    }

    _run(task) {
        let taskType = task.type
        switch(taskType) {
            case 'lazyMan':
                console.log('hi, this is ' + task.msg)
                this._publish()
                break

            case 'eat':
                console.log('eat ' + task.msg)
                this._publish()
                break

            case 'sleep':    
            case 'sleepFirst':
                console.log('wake up after ' + task.msg + ' secs')
                setTimeout(()=> {
                    this._publish()
                }, task.msg* 1000)               
        }
    }

    eat(name) {
        this._subcribe(generateTask('eat', name))
        return this
    }

    sleep(num) {
        this._subcribe(generateTask('sleep', num))
        return this
    }

    sleepFirst(num) {
        this._subcribe(generateTask('sleepFirst', num))
        return this
    }
}

function LazyMan(name) {
    let lazyManObj = new lazyMan(name)
    return lazyManObj
}

function generateTask(type, msg) {
    return {type, msg}
}