import https from 'https'
import crypto from 'crypto'

export default class FatSecret {
  #accessKey
  #sharedSecret
  
  /**
   * @returns {string}
   */
  static get API_BASE() {
    return 'https://platform.fatsecret.com/rest/server.api'
  }
  
  /**
   * @constructor
   * @param {string} accessKey
   * @param {string} sharedSecret
   */
  constructor(accessKey, sharedSecret) {
    if (!accessKey || !sharedSecret) {
      throw new Error('FAT_SECRET ENV not found')
    }
    this.#accessKey = accessKey
    this.#sharedSecret = sharedSecret
  }
  
  /**
   * @description Perform the request to fatsecret
   * @param {object} parameters
   * @returns {Promise}
   * @public
   */
  request(parameters) {
    const query = this._createQuery(parameters)
    const signature = this._createSignature(query)
    return new Promise((resolve, reject) => {
      https
      .request({
        host: 'platform.fatsecret.com',
        method: 'GET',
        path: `${FatSecret.API_BASE}?${query}&oauth_signature=${signature}`,
      })
      .on('error', error => reject(error))
      .on('response', response => {
        let data = ''
        response
        .on('error', error => reject(error))
        .on('data', chunk => data += chunk)
        .on('end', () => {
          try {
            resolve(JSON.parse(data.toString('utf-8')))
          } catch (error) {
            reject(error)
          }
        })
      })
      .end()
    })
  }
  
  /**
   * @description the generated signature to the request params and return it
   * @param {string} query
   * @returns {string}
   * @private
   */
  _createSignature(query) {
    const mac = crypto.createHmac('sha1', this.#sharedSecret + '&')
    mac.update(`GET&${encodeURIComponent(FatSecret.API_BASE)}&${encodeURIComponent(query)}`)
    return encodeURIComponent(mac.digest('base64'))
  }
  
  /**
   * @description Build the sorted key value pair string that will be used for the hmac and request
   * @param {object} parameters
   * @returns {string}
   * @private
   */
  _createQuery(parameters) {
    parameters['format'] = 'json'
    parameters['oauth_version'] = '1.0'
    parameters['oauth_signature_method'] = 'HMAC-SHA1'
    parameters['oauth_nonce'] = crypto.randomBytes(10).toString('HEX')
    parameters['oauth_timestamp'] = Math.floor(new Date().getTime() / 1000)
    parameters['oauth_consumer_key'] = this.#accessKey
    return Object.keys(parameters)
    .sort()
    .reduce((accumulator, parameter) => {
      const data = `&${parameter}=${encodeURIComponent(parameters[parameter])}`
      return accumulator + data
    }, '')
    .slice(1)
  }
}
