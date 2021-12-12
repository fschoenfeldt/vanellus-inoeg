// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

// The local backend
export default class LocalBackend {
    constructor(settings, store) {
        this.settings = settings
        this.store = store
        this._taskId = 0
        this._tasks = []
        this._locked = false
    }

    get(key, defaultValue) {
        return this.store.get(key, defaultValue)
    }

    unlock(task) {
        if (this._tasks.length === 0) throw "should not happen"
        if (this._tasks[0][0] !== task) throw "wrong task"
        this._tasks = this._tasks.slice(1)
        console.log(`Finished task ${task}...`)
    }

    clearLocks() {
        this._tasks = []
    }

    async lock(task) {
        if (this._tasks.find((t) => t[0] === task) !== undefined) {
            console.log(`task ${task} is already in queue, aborting...`)
            throw "already queued up" // there's already a task queued up
        }

        const taskId = this._taskId++
        this._tasks.push([task, new Date(), taskId])

        while (true) {
            if (this._tasks.length === 0) throw "should not happen"
            const [t, dt, id] = this._tasks[0]
            if (id === taskId) break // it's our turn
            if (new Date() - dt > 1000 * 60 * 5)
                // tasks time out after 5 minutes
                this._tasks = this._tasks.slice(1)
            await timeout(10)
        }
        console.log(`Executing task ${task}...`)
        // now we go...
    }

    set(key, data) {
        return this.store.set(key, data)
    }

    delete(key) {
        return this.store.delete(key)
    }

    deleteAll(prefix) {
        return this.store.deleteAll(prefix)
    }
}
