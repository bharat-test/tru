const { Router } = require('express')
const jwksClient = require('jwks-rsa')
const httpSignature = require('http-signature')
const util = require('util')
const createApi = require('./tru-api')

const router = Router()
let api = null
let config = null

// PhoneCheck

/**
 * Handles a request to create a PhoneCheck for the phone number within `req.body.phone_number`.
 */
async function createPhoneCheck(req, res) {
  if (!req.body.phone_number) {
    res
      .status(400)
      .json({ error_message: 'phone_number parameter is required' })
    return
  }

  try {
    const phoneCheckRes = await api.createPhoneCheck(req.body.phone_number)

    // Select data to send to client
    res.json({
      check_id: phoneCheckRes.check_id,
      check_url: phoneCheckRes._links.check_url.href,
    })
  } catch (error) {
    config.log('error in /check')
    config.log(error.toString(), error.data)

    res.status(500).send('Whoops!')
  }
}

/**
 * Handle the request to check the state of a Phone Check. `req.query.check_id` must contain a valid Phone Check ID.
 */
async function getPhoneCheckStatus(req, res) {
  if (!req.query.check_id) {
    res.status(400).json({ error_message: 'check_id parameter is required' })
    return
  }

  try {
    const phoneCheckRes = await api.getPhoneCheck(req.query.check_id)
    res.json({
      match: phoneCheckRes.match,
      check_id: phoneCheckRes.check_id,
    })
  } catch (error) {
    config.log('error in getting PhoneCheck status')
    config.log(error.toString(), error.data)

    res.status(500).send('Whoops!')
  }
}

/**
 * Handles a callback from the tru.ID platform indicating that a Phone Check has reached an end state.
 */
async function phoneCheckCallback(req, res) {
  config.log('PhoneCheck received callback', req.headers, req.body)

  const parsed = httpSignature.parseRequest(req)
  const { keyId } = parsed

  const keyClient = jwksClient({
    jwksUri: `${config.apiBaseUrl}/.well-known/jwks.json`,
  })
  const getSigningKey = util.promisify(keyClient.getSigningKey)

  const jwk = await getSigningKey(keyId)

  const verified = httpSignature.verifySignature(parsed, jwk.getPublicKey())
  if (!verified) {
    res.sendStatus(400)
    return
  }
  res.sendStatus(200)
}

// SubscriberCheck

/**
 * Handles a request to create a SubscriberCheck for the phone number within `req.body.phone_number`.
 */
async function createSubscriberCheck(req, res) {
  if (!req.body.phone_number) {
    res
      .status(400)
      .json({ error_message: 'phone_number parameter is required' })
    return
  }

  try {
    const subscriberCheckRes = await api.createSubscriberCheck(
      req.body.phone_number,
    )

    // Select data to send to client
    res.json({
      check_id: subscriberCheckRes.check_id,
      check_url: subscriberCheckRes._links.check_url.href,
    })
  } catch (error) {
    config.log('error in /check')
    config.log(error.toString(), error.data)

    res.status(500).send('Whoops!')
  }
}

/**
 * Handle the request to check the state of a SubscriberCheck. `req.params.check_id` must contain a valid SubscriberCheck ID.
 */
async function getSubscriberCheckStatus(req, res) {
  const checkId = req.params.check_id
  if (!checkId) {
    res.status(400).json({ error_message: 'check_id parameter is required' })
    return
  }

  try {
    const subscriberCheckRes = await api.getSubscriberCheck(checkId)
    res.json({
      match: subscriberCheckRes.match,
      check_id: subscriberCheckRes.check_id,
      no_sim_change: subscriberCheckRes.no_sim_change,
      last_sim_change_at: subscriberCheckRes.last_sim_change_at,
    })
  } catch (error) {
    config.log('error in getting SubscriberCheck status')
    config.log(error.toString(), error.data)

    res.status(500).send('Whoops!')
  }
}

// SIMCheck

async function createSimCheck(req, res) {
  console.log(req.body)
  const phoneNumber = req.body.phone_number

  if (!phoneNumber) {
    res
      .status(400)
      .json({ error_message: 'phone_number parameter is required' })
    return
  }

  try {
    const simCheck = await api.createSimCheck(phoneNumber)
    config.log(simCheck)

    // Select data to send to client
    res.json({
      no_sim_change: simCheck.no_sim_change,
      last_sim_change_at: simCheck.last_sim_change_at,
    })
  } catch (error) {
    config.log('error in creating SIMCheck')
    config.log(error.toString(), error.data)

    res.status(500).send('Whoops!')
  }
}

// Country

async function getCountryCoverage(req, res) {
  const countryCode = req.query.country_code

  if (!countryCode) {
    res
      .status(400)
      .json({ error_message: 'country_code parameter is required' })
    return
  }

  try {
    const countryCoverage = await api.getCountryCoverage(countryCode)
    config.log(countryCoverage)

    // Select data to send to client
    res.json(countryCoverage)
  } catch (error) {
    config.log('error getting country coverage')
    config.log(error.toString(), error.data)

    res.status(500).send('Whoops!')
  }
}

// Device

async function getDeviceCoverage(req, res) {
  const ipAddress = req.query.id_address || req.ip

  if (!ipAddress) {
    res.status(400).json({ error_message: 'id_address parameter is required' })
    return
  }

  try {
    const deviceCoverage = await api.getDeviceCoverage(ipAddress)
    config.log(deviceCoverage)

    res.status(deviceCoverage.status ?? 200).json(deviceCoverage)
  } catch (error) {
    config.log('error getting device coverage')
    config.log(error.toString(), error.data)

    res.status(500).send('Whoops!')
  }
}

async function traces(req, res) {
  console.log(JSON.stringify(req.body, null, 2))
  res.sendStatus(200)
}

// Helpers
async function getMyIp(req, res) {
  const ipResponse = { ip_address: req.ip }
  config.log('MyIp', ipResponse)
  res.status(200).json(ipResponse)
}

function routes(_config) {
  config = _config

  api = createApi(config)

  router.post('/check', createPhoneCheck)
  router.post('/phone-check', createPhoneCheck)
  router.get('/check_status', getPhoneCheckStatus)
  router.get('/phone-check', getPhoneCheckStatus)
  router.post('/callback', phoneCheckCallback)
  router.post('/phone-check/callback', phoneCheckCallback)

  router.post('/subscriber-check', createSubscriberCheck)
  router.get('/subscriber-check/:check_id', getSubscriberCheckStatus)

  router.post('/sim-check', createSimCheck)

  router.get('/country', getCountryCoverage)
  router.get('/device', getDeviceCoverage)

  router.get('/my-ip', getMyIp)

  router.post('/traces', traces)

  return router
}

module.exports = routes
