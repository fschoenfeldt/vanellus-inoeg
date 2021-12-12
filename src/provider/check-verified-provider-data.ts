// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ecdhDecrypt } from "../crypto"
import { Provider } from "./"

export async function checkVerifiedProviderData(this: Provider, data: any) {
    try {
        // we lock the local backend to make sure we don't have any data races
        await this.lock("checkVerifiedProviderData")
    } catch (e) {
        throw null // we throw a null exception (which won't affect the store state)
    }

    try {
        const verifiedData = await this.backend.appointments.checkProviderData(
            {},
            this.keyPairs!.signing
        )
        if (verifiedData === null) {
            this.verifiedData = null
            return { status: "not-found" }
        }
        const keyPair = this.keyPairs!.encryption
        if (keyPair === null) {
            this.verifiedData = null
            return {
                status: "failed",
            }
        }
        try {
            // to do: verify the signature of the encrypted data!

            const decryptedJSONData = await ecdhDecrypt(
                verifiedData.encryptedProviderData.data,
                keyPair.privateKey
            )

            if (decryptedJSONData === null) {
                // can't decrypt
                this.verifiedData = null
                return { status: "failed" }
            }
            const decryptedData = JSON.parse(decryptedJSONData)
            decryptedData.signedData.json = JSON.parse(
                decryptedData.signedData.data
            )
            this.verifiedData = decryptedData
            // to do: check signed keys as well
            return { status: "loaded", data: decryptedData }
        } catch (e) {
            this.verifiedData = null
            return { status: "failed" }
        }
    } catch (e) {
        console.error(e)
        return { status: "failed" }
    } finally {
        this.unlock("checkVerifiedProviderData")
    }
}
