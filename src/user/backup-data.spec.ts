// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { deepEqual } from "assert"
import { VanellusError } from "../errors"
import { adminKeys, backend, resetDB } from "../testing/fixtures"
import { User } from "../user"

describe("User.backupData()", function () {
    it("we should be able to backup data", async function () {
        const be = backend()
        const keys = await adminKeys()
        // we reset the database
        await resetDB(be, keys)
        // we create a mediator

        const user = new User("main", be)
        // we generate a secret etc.
        await user.initialize()
        // we set the queue data
        user.queueData = {
            zipCode: "10707",
        }
        // we set the contact data
        user.contactData = {
            name: "Max Mustermann",
        }

        const backupResult = await user.backupData()

        if (backupResult instanceof VanellusError)
            throw new Error("cannot backup data")

        const newUser = new User("new", be)

        newUser.secret = user.secret

        let restoreResult = await newUser.restoreFromBackup()

        if (restoreResult instanceof VanellusError)
            throw new Error("cannot restore data")

        deepEqual(newUser.contactData, user.contactData)
        deepEqual(newUser.tokenData, user.tokenData)
        deepEqual(newUser.queueData, user.queueData)
        deepEqual(newUser.acceptedAppointment, user.acceptedAppointment)

        // we overwrite the secret
        newUser.initialize()

        restoreResult = await newUser.restoreFromBackup()

        if (!(restoreResult instanceof VanellusError))
            throw new Error("should fail")
    })
})
