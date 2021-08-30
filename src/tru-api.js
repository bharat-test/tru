const axios = require('axios')
const qs = require('querystring')

const DEFAULT_SCOPES = ['phone_check sim_check subscriber_check coverage']

// Check
const CHECK_TYPES = {
  PHONE: 'phone',
  SIM: 'sim',
  SUBSCRIBER: 'subscriber',
}

// TODO this smells, fix it later
let config

function log(...args) {
  if (config.DEBUG) {
    console.debug.call(...args)
  }
}

// Tokens

/**
 * Creates an Access Token withon `phone_check` scope.
 *
 * @param scopes {Object} Optional. Array of scopes for the created access token. Defaults to `['phone_check sim_check coverage']`.
 */
async function getAccessToken(scopes = DEFAULT_SCOPES) {
  log('getAccessToken')

  const url = `${config.apiBaseUrl}/oauth2/v1/token`
  const params = qs.stringify({
    grant_type: 'client_credentials',

    // scope to use depends on product
    scope: scopes,
  })

  const toEncode = `${config.project.client_id}:${config.project.client_secret}`
  const auth = Buffer.from(toEncode).toString('base64')
  const requestHeaders = {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  }

  log('url', url)
  log('params', params)
  log('requestHeaders', requestHeaders)

  const accessTokenResult = await axios.post(url, params, {
    headers: requestHeaders,
  })

  log('accessTokenResult.data', accessTokenResult.data)

  return accessTokenResult.data
}

/**
 * Creates a Check of a type for the given `phoneNumber`.
 *
 * @param {String} type - `phone`, `sim` or `subscriber` via `CHECK_TYPES`
 * @param {String} phoneNumber - The phone number to create a Phone Check for.
 */
async function createCheck(type, phoneNumber) {
  log('createCheck')

  const url = `${config.apiBaseUrl}/${type}_check/v0.1/checks`
  const params = {
    phone_number: phoneNumber,
  }

  const auth = (await getAccessToken()).access_token
  const requestHeaders = {
    Authorization: `Bearer ${auth}`,
    'Content-Type': 'application/json',
  }

  log('url', url)
  log('params', params)
  log('requestHeaders', requestHeaders)

  const checkCreationResult = await axios.post(url, params, {
    headers: requestHeaders,
  })

  log('checkCreationResult.data', checkCreationResult.data)

  return checkCreationResult.data
}

/**
 * Retrieves a Check of a provided `type` with the given `check_id`
 *
 * @param {String} type - Either `phone` or `subscriber`
 * @param {String} checkId The ID of the PhoneCheck to retrieve.
 */
async function getCheck(type, checkId) {
  log('getCheck')

  const url = `${config.apiBaseUrl}/${type}_check/v0.1/checks/${checkId}`
  const params = {}

  const auth = (await getAccessToken()).access_token
  const requestHeaders = {
    Authorization: `Bearer ${auth}`,
    'Content-Type': 'application/json',
  }

  log('url', url)
  log('params', params)
  log('requestHeaders', requestHeaders)

  const getCheckResult = await axios.get(url, {
    params,
    headers: requestHeaders,
  })

  log('getCheckResult.data', getCheckResult.data)

  return getCheckResult.data
}

// PhoneCheck

/**
 * Creates a PhoneCheck for the given `phoneNumber`.
 *
 * @param {String} phoneNumber - The phone number to create a Phone Check for.
 */
async function createPhoneCheck(phoneNumber) {
  log('createPhoneCheck')

  return createCheck(CHECK_TYPES.PHONE, phoneNumber)
}

/**
 * Retrieves a PhoneCheck with the given `check_id`
 *
 * @param {String} checkId The ID of the PhoneCheck to retrieve.
 */
async function getPhoneCheck(checkId) {
  log('getPhoneCheck')

  return getCheck(CHECK_TYPES.PHONE, checkId)
}

// SubscriberCheck

/**
 * Creates a SubscriberCheck for the given `phoneNumber`.
 *
 * @param {String} phoneNumber - The phone number to create a SubscriberCheck for.
 */
async function createSubscriberCheck(phoneNumber) {
  log('createSubscriberCheck')

  return createCheck(CHECK_TYPES.SUBSCRIBER, phoneNumber)
}

/**
 * Retrieves a SubscriberCheck with the given `check_id`
 *
 * @param {String} checkId The ID of the SubscriberCheck to retrieve.
 */
async function getSubscriberCheck(checkId) {
  log('getSubscriberCheck')

  return getCheck(CHECK_TYPES.SUBSCRIBER, checkId)
}

// SIMCheck

async function createSimCheck(phoneNumber) {
  log('createSimCheck')

  return createCheck(CHECK_TYPES.SIM, phoneNumber)
}

// Coverage / Countries

/**
 * Get product and network coverage by country code (e.g. GB) or phone number country prefix (e.g. 44).
 *
 * @param {string} countryCode
 */
async function getCountryCoverage(countryCode) {
  log('getCountryCoverage')

  const url = `${config.apiBaseUrl}/coverage/v0.1/countries/${countryCode}`
  const auth = (await getAccessToken(['coverage'])).access_token
  const requestHeaders = {
    Authorization: `Bearer ${auth}`,
  }

  log('url', url)
  log('requestHeaders', requestHeaders)

  const countryCoverageResult = await axios.get(url, {
    headers: requestHeaders,
  })

  log('countryCoverageResult.data', countryCoverageResult.data)

  return countryCoverageResult.data
}

// Coverage / Device

/**
 * Get product and network coverage by IP address.
 *
 * @param {string} ipAddress the IP address of the device for which coverage is being queried
 */
async function getDeviceCoverage(ipAddress) {
  log('getIPCoverage')

  const url = `${config.apiBaseUrl}/coverage/v0.1/device_ips/${ipAddress}`
  const auth = (await getAccessToken(['coverage'])).access_token
  const requestHeaders = {
    Authorization: `Bearer ${auth}`,
  }

  log('url', url)
  log('requestHeaders', requestHeaders)

  const deviceCoverageResult = await axios.get(url, {
    headers: requestHeaders,
    validateStatus: (status) => status >= 200 && status <= 412,
  })

  log('deviceCoverageResult.data', deviceCoverageResult.data)

  return deviceCoverageResult.data
}

const api = {
  createPhoneCheck,
  getPhoneCheck,
  createSubscriberCheck,
  getSubscriberCheck,
  createSimCheck,
  getCountryCoverage,
  getAccessToken,
  getDeviceCoverage,
}

module.exports = function (_config) {
  config = _config
  return api
}
