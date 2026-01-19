class Mutex {
    constructor() {
        this._locking = Promise.resolve();
    }
    lock() {
        let unlock;
        const newLock = new Promise(resolve => unlock = resolve);
        const rv = this._locking.then(() => unlock);
        this._locking = this._locking.then(() => newLock);
        return rv;
    }
}

module.exports = Mutex;
