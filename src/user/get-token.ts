// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import {
    generateECDHKeyPair,
    generateECDSAKeyPair,
    hashString,
    randomBytes,
} from "../crypto"
import { ErrorCode, VanellusError } from "../errors"
import { ContactData, Result, Status } from "../interfaces"
import { User } from "./"

async function hashContactData(data: ContactData) {
    const hashData = {
        name: data.name,
        nonce: randomBytes(32),
    }

    const hashDataJSON = JSON.stringify(hashData)
    const dataHash = await hashString(hashDataJSON)
    return [dataHash, hashData.nonce]
}

export async function getToken(
    this: User,
    { code }: { code?: string }
): Promise<Result | VanellusError> {
    if (!this.contactData)
        return new VanellusError(
            ErrorCode.DataMissing,
            "contact data is missing"
        )
    if (!this.secret)
        return new VanellusError(ErrorCode.DataMissing, "seret is missing")

    // we hash the user data to prove it didn't change later...
    const [dataHash, nonce] = await hashContactData(this.contactData)
    const signingKeyPair = await generateECDSAKeyPair()
    const encryptionKeyPair = await generateECDHKeyPair()

    const userToken = {
        version: "0.3",
        code: this.secret.slice(0, 4),
        createdAt: new Date().toISOString(),
        publicKey: signingKeyPair.publicKey, // the signing key to control the ID
        encryptionPublicKey: encryptionKeyPair.publicKey,
    }

    const signedToken = await this.backend.appointments.getToken({
        hash: dataHash,
        publicKey: signingKeyPair.publicKey,
        code: code,
    })

    if (signedToken instanceof VanellusError) return signedToken

    const tokenData = {
        createdAt: new Date().toISOString(),
        signedToken: signedToken,
        keyPairs: {
            signing: signingKeyPair,
            encryption: encryptionKeyPair,
        },
        hashNonce: nonce,
        dataHash: dataHash,
        userToken: userToken,
    }

    this.tokenData = tokenData

    return {
        tokenData: tokenData,
        status: Status.Succeeded,
    }
}
