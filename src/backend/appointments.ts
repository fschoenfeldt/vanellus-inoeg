// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import {
    hash,
    sign,
    verify,
    deriveToken,
    generateECDSAKeyPair,
    ephemeralECDHEncrypt,
    ecdhDecrypt,
    generateECDHKeyPair,
    randomBytes,
} from "../crypto"

import JSONRPCBackend from "./jsonrpc"

// The appointments backend
export default class AppointmentsBackend extends JSONRPCBackend {
    constructor(settings) {
        super(settings, "appointmentsApi")
        this.settings = settings
    }

    async confirmProvider(
        { key, encryptedProviderData, publicProviderData, signedKeyData },
        keyPair
    ) {
        return await this.call(
            "confirmProvider",
            {
                key,
                encryptedProviderData,
                publicProviderData,
                signedKeyData,
            },
            keyPair
        )
    }

    // public endpoints

    async getAppointmentsByZipCode({ zipCode }) {
        return await this.call("getAppointmentsByZipCode", {
            zipCode,
        })
    }

    async getStats({ id, metric, type, n, filter, from, to }) {
        return await this.call("getStats", {
            id,
            metric,
            type,
            n,
            from,
            to,
            filter,
        })
    }

    // return all public keys present in the system
    async getKeys() {
        return await this.call("getKeys", {})
    }

    // data endpoints

    async deleteData({ id }, keyPair) {
        return await this.call("deleteData", { id }, keyPair)
    }

    async getData({ id }, keyPair) {
        return await this.call("getData", { id }, keyPair)
    }

    async bulkGetData({ ids }, keyPair) {
        return await this.call("bulkGetData", { ids }, keyPair)
    }

    async bulkStoreData({ dataList }, keyPair) {
        return await this.call("bulkStoreData", { dataList }, keyPair)
    }

    // store provider data for verification
    async storeData({ id, data, permissions, grant }, keyPair) {
        return await this.call(
            "storeData",
            { id, data, permissions, grant },
            keyPair
        )
    }

    // user endpoints

    async cancelAppointment({ providerID, id, signedTokenData }, keyPair) {
        return await this.call(
            "cancelAppointment",
            { providerID, id, signedTokenData },
            keyPair
        )
    }

    async bookAppointment(
        { providerID, id, encryptedData, signedTokenData },
        keyPair
    ) {
        return await this.call(
            "bookAppointment",
            { providerID, id, encryptedData, signedTokenData },
            keyPair
        )
    }

    // get a token for a given queue
    async getToken({
        hash,
        encryptedData,
        publicKey,
        code,
        queueData,
        signedTokenData,
    }) {
        return await this.call("getToken", {
            hash: hash,
            code: code,
            publicKey: publicKey,
            encryptedData: encryptedData,
            queueData: queueData,
            signedTokenData: signedTokenData,
        })
    }

    // provider-only endpoints

    // get all published appointments from the backend
    async getAppointments({}, keyPair) {
        return await this.call("getProviderAppointments", {}, keyPair)
    }

    // publish all local appointments to the backend
    async publishAppointments({ offers }, keyPair) {
        return await this.call("publishAppointments", { offers }, keyPair)
    }

    async cancelBooking({ id }, keyPair) {
        return await this.call("cancelBooking", { id }, keyPair)
    }

    // get n tokens from the given queue IDs
    async getBookedAppointments({}, keyPair) {
        return await this.call("getBookedAppointments", {}, keyPair)
    }

    async storeProviderData({ encryptedData, code }, keyPair) {
        return await this.call(
            "storeProviderData",
            { encryptedData, code },
            keyPair
        )
    }

    async checkProviderData({}, keyPair) {
        return await this.call("checkProviderData", {}, keyPair)
    }

    // mediator-only endpoint

    async getPendingProviderData({ limit }, keyPair) {
        return await this.call("getPendingProviderData", { limit }, keyPair)
    }

    async getVerifiedProviderData({ limit }, keyPair) {
        return await this.call("getVerifiedProviderData", { limit }, keyPair)
    }
}
