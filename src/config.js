const path = require('path')
const { cwd } = require('process')
require('dotenv').config()

console.log('Loading standard configuration')

const PORT = process.env.PORT ?? 8080
const DEBUG =
  process.env.DEBUG === undefined ? true : process.env.DEBUG === 'true'
const API_BASE_URL = process.env.API_BASE_URL ?? 'https://eu.api.tru.id'
const CLIENT_ID = process.env.TRU_ID_CLIENT_ID
const CLIENT_SECRET = process.env.TRU_ID_CLIENT_SECRET
const LOCALTUNNEL_ENABLED = process.env.LOCALTUNNEL_ENABLED
  ? process.env.LOCALTUNNEL_ENABLED === 'true'
  : false
const { LOCALTUNNEL_SUBDOMAIN, PROJECT_PATH } = process.env

function configure(params) {
  const processConfig = {
    port: PORT,
    DEBUG,
    apiBaseUrl: API_BASE_URL,
    basicAuth: {
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
    },
    localtunnel: {
      enabled: LOCALTUNNEL_ENABLED,
      subdomain: LOCALTUNNEL_SUBDOMAIN,
    },
    log: (...args) => {
      if (DEBUG) {
        console.debug.call(...args)
      }
    },
  }

  if (CLIENT_ID && CLIENT_SECRET) {
    processConfig.project = {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }
  }

  // Override config from process.env with those passed as parameters
  const config = { ...processConfig, ...params }

  if (!config.project) {
    const defaultProjectLocation = path.join(cwd(), 'tru.json')
    const projectConfig = require(PROJECT_PATH ?? defaultProjectLocation)
    console.log(
      `Loading tru.json project configuration from default location: "${defaultProjectLocation}"`,
    )
    config.project = {
      client_id: projectConfig.credentials[0].client_id,
      client_secret: projectConfig.credentials[0].client_secret,
    }
  }

  return config
}

module.exports = configure
