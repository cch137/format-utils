import sha3 from 'crypto-js/sha3.js'
import md5 from 'crypto-js/md5.js'
import str from '../str'
import baseConverter from '../str/base-converter'
import { mask, unmask } from './masker'

const { textToBase64, base64ToText, secureBase64 } = baseConverter

/** Encode 加密 */
function e (input: any, maskLevel = 1, seed?: any): string {
  return mask(secureBase64(textToBase64(str(input))), 64, maskLevel, seed)
}

/** Decode 解密 */
function d (input: string, maskLevel = 1, seed?: any, tryParseJSON = true): any {
  input = base64ToText(unmask(input, 64, maskLevel, seed))
  if (!tryParseJSON) {
    return input
  }
  try {
    return JSON.parse(input)
  } catch (err) {
    return input
  }
}

/** Hash 散列運算 */
function hx (input: any, algorithm: 'MD5' | 224 | 256 | 384 | 512 = 512, seed?: any) {
  const encrypted = e(input, 1, seed).substring(1)
  if (algorithm === 'MD5') {
    return md5(encrypted).toString()
  }
  return sha3(encrypted, { outputLength: algorithm }).toString()
}

export { e, d, hx }
export default { e, d, hx }
