// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Backend } from "../../backend"
import { generateECDHKeyPair, generateECDSAKeyPair, sign } from "../../crypto"
import { VanellusError } from "../../errors"
import { MediatorKeyData } from "../../interfaces"
import { Mediator } from "../../mediator"
import { AdminKeys } from "./"

export async function mediator(
    backend: Backend,
    adminKeys: AdminKeys
): Promise<Mediator> {
    const signingKeyPair = await generateECDSAKeyPair()
    const encryptionKeyPair = await generateECDHKeyPair()

    const mediatorKeyData: MediatorKeyData = {
        signing: signingKeyPair.publicKey,
        encryption: encryptionKeyPair.publicKey,
    }

    const signedData = await sign(
        adminKeys.root.privateKey,
        JSON.stringify(mediatorKeyData),
        adminKeys.root.publicKey
    )

    const response = await backend.appointments.addMediatorPublicKeys(
        {
            signedKeyData: {
                publicKey: signedData.publicKey,
                signature: signedData.signature,
                data: signedData.data,
            },
        },
        adminKeys.root
    )

    if (response instanceof VanellusError)
        throw new Error("cannot create mediator") // this is an error

    const mediator = new Mediator("mediator", backend)

    mediator.keyPairs = {
        signing: signingKeyPair,
        encryption: encryptionKeyPair,
        provider: adminKeys.provider,
    }

    return mediator
}
