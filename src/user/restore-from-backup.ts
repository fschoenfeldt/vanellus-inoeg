// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { aesDecrypt, deriveSecrets } from "../crypto"
import { base322buf, b642buf } from "../helpers/conversion"
import { backupKeys } from "./backup-data"

// make sure the signing and encryption key pairs exist
export async function restoreFromBackup(state, keyStore, settings, secret) {
    const backend = settings.get("backend")

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock("restoreFromBackup")
    } catch (e) {
        throw null // we throw a null exception (which won't affect the store state)
    }

    try {
        const [id, key] = await deriveSecrets(base322buf(secret), 32, 2)
        const data = await backend.storage.getSettings({ id: id })
        const dd = JSON.parse(await aesDecrypt(data, b642buf(key)))

        for (const key of backupKeys) {
            backend.local.set(`user::${key}`, dd[key])
        }

        backend.local.set("user::secret", secret)

        return {
            status: "succeeded",
            data: dd,
        }
    } catch (e) {
        console.error(e)
        return {
            status: "failed",
            error: e,
        }
    } finally {
        backend.local.unlock("restoreFromBackup")
    }
}

restoreFromBackup.actionName = "restoreFromBackup"
