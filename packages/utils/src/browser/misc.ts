/**
 * @platform `browser`
 * @description 安全的获取是否运行在安全上下文(https)中,在非浏览器环境下会抛出错误，可通过restrain参数控制是否抛出错误
 * @description_en Safely get whether running in a secure context (https), will throw an error in non-browser environments，can control whether to throw an error through the restrain parameter
 * @param [restrain=true] - 是否抑制错误,默认为true
 * @param [restrain=true] - Whether to suppress errors, default is true
 * @returns {boolean}
 */
export function safeIsSecureContext(restrain = true): boolean {
  if (self.isSecureContext !== undefined) {
    return self.isSecureContext
  }
  // Compatibility with older browsers
  if (self.location) {
    if (self.location.protocol === 'https:') {
      return true
    } else if (self.location.protocol === 'http:') {
      return false
    }
  }
  if (restrain === false) {
    throw new Error(
      `Unable to determine if running in a secure context, if you are running in a Node.js environment, you can ignore this error`,
    )
  }
  return false
}
