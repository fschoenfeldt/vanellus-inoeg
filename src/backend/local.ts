// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Store } from "../interfaces"

// The local backend
export class LocalBackend {
    public store: Store

    constructor(store: Store) {
        this.store = store
    }

    get(key: string, defaultValue?: any) {
        return this.store.get(key, defaultValue)
    }

    set(key: string, data: any) {
        return this.store.set(key, data)
    }

    delete(key: string) {
        return this.store.delete(key)
    }

    deleteAll(prefix: string) {
        return this.store.deleteAll(prefix)
    }
}
