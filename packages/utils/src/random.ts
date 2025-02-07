import { safeIsSecureContext } from './browser/misc.js'

/**
 * @description 获取指定范围内的随机整数, 包括最小值和最大值
 * @description_en Get a random integer within a specified range, including the minimum and maximum values
 */
export function randomIntInclusive(min: number, max: number): number {
  if (min >= max) {
    throw new Error('min must be less than or equal to max')
  }
  const minCeil = Math.ceil(min)
  const maxFloor = Math.floor(max)
  return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil
}

/**
 * @description 获取指定范围内的随机整数, 排除最大值和最小值
 * @description_en Get a random integer within a specified range, excluding the maximum and minimum values
 */
export function randomIntExclusive(min: number, max: number): number {
  if (min >= max) {
    throw new Error('min must be less than or equal to max')
  }
  return randomIntInclusive(min + 1, max - 1)
}

/**
 * @description 获取指定范围内的随机整数，排除最大值
 * @description_en Get a random integer within a specified range, excluding the maximum value
 */
export function randomIntExcludeMax(min: number, max: number): number {
  if (min >= max) {
    throw new Error('min must be less than or equal to max')
  }
  return randomIntInclusive(min, max - 1)
}

/**
 * @description 获取指定长度的随机字符串
 * @description_en Get a random string of specified length
 * @param length 字符串长度 default: 8
 * @param chars 字符集合
 */
export function randomString(
  length = 8,
  chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
): string {
  if (length <= 0) {
    throw new Error('length must be greater than 0')
  }
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[randomIntExcludeMax(0, chars.length)]
  }
  return result
}

/**
 * @platform `all`
 * @description 包含随机生成的、长度为 36 字符的第四版 UUID 字符串。
 * @description_en Contains a randomly generated, 36-character, version 4 UUID string.
 */
export function randomUUID() {
  if (typeof self.crypto !== 'undefined' && safeIsSecureContext()) {
    if (typeof self.crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    if (typeof self.crypto.getRandomValues === 'function') {
      const buffer = new Uint8Array(16)
      crypto.getRandomValues(buffer)
      // 设置UUID版本（4）和变体（10xx）
      buffer[6] = (buffer[6]! & 0x0f) | 0x40 // Version 4
      buffer[8] = (buffer[8]! & 0x3f) | 0x80 // Variant 10xx
      const hexArr = new Array(16)
      for (let i = 0; i < 16; i++) {
        hexArr[i] = buffer[i]!.toString(16).padStart(2, '0')
      }
      return (
        hexArr[0] +
        hexArr[1] +
        hexArr[2] +
        hexArr[3] +
        '-' +
        hexArr[4] +
        hexArr[5] +
        '-' +
        hexArr[6] +
        hexArr[7] +
        '-' +
        hexArr[8] +
        hexArr[9] +
        '-' +
        hexArr[10] +
        hexArr[11] +
        hexArr[12] +
        hexArr[13] +
        hexArr[14] +
        hexArr[15]
      )
    }
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
