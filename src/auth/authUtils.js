
const JWT = require('jsonwebtoken')
const asyncHandler = require('../helpers/asyncHandle')
const { AuthFailureError, NotFoundError } = require('../core/error.response')
const { findByUserId } = require('../services/KeyToken.services')

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFESHTOKEN: 'refeshtoken'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {

        //accessToken
        const accessToken = await JWT.sign(payload, publicKey, {
            expiresIn: '2 days'
        })


        //refeshToken
        const refeshToken = await JWT.sign(payload, privateKey, {
            expiresIn: '7 days',
        })

        //
        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.log(err)
            }
            else {
                console.log('decode verify: ', decode)
            }
        })

        return { accessToken, refeshToken }
    } catch (error) {

    }
}


const authentication = asyncHandler(async (req, res, next) => {
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) throw new AuthFailureError('Invalid Request')

    const keyStore = findByUserId(userId)
    if (!keyStore) throw new NotFoundError('Not Found KeyStore')

    let promise = new Promise((resolve, reject) => {
        // Do some asynchronous operation
        resolve(keyStore);
    });

    let data = await promise;

    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if (!accessToken) throw new AuthFailureError('Invalid Request')

    try {
        const decodeUser = JWT.verify(accessToken, data.publicKey)

        if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid Request')

        req.keyStore = data

        return next()
    } catch (error) {
        throw error
    }
})


const authenticationV2 = asyncHandler(async (req, res, next) => {
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) throw new AuthFailureError('Invalid Request')

    const keyStore = findByUserId(userId)
    if (!keyStore) throw new NotFoundError('Not Found KeyStore')

    let promise = new Promise((resolve, reject) => {
        // Do some asynchronous operation
        resolve(keyStore);
    });

    let data = await promise;

    if (req.headers[HEADER.REFESHTOKEN]) {
        try {

            const refeshToken = req.headers[HEADER.REFESHTOKEN]

            const decodeUser = JWT.verify(refeshToken, data.privateKey)
            if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid userID')

            req.keyStore = data
            req.user = decodeUser
            req.refeshToken = refeshToken

            return next()


        } catch (error) {
            throw error
        }
    }

    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if (!accessToken) throw new AuthFailureError('Invalid Request')

    try {
        const decodeUser = JWT.verify(accessToken, data.publicKey)

        if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid Request')

        req.keyStore = data
        console.log("a")

        return next()
    } catch (error) {
        throw error
    }
})


const verifyJWT = async (token, keySecret) => {
    return await JWT.verify(token, keySecret)
}

module.exports = {
    createTokenPair,
    authentication,
    verifyJWT,
    authenticationV2
}
