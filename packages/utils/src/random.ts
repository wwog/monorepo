/**
 * @description 获取指定范围内的随机整数, 包括最小值和最大值
 * @description_en Get a random integer within a specified range, including the minimum and maximum values
 */
export function getRandomIntInclusive(min: number, max: number): number {
  if (min >= max) {
    throw new Error("min must be less than or equal to max");
  }
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);
  return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
}

/**
 * @description 获取指定范围内的随机整数, 排除最大值和最小值
 * @description_en Get a random integer within a specified range, excluding the maximum and minimum values
 */
export function getRandomIntExclusive(min: number, max: number): number {
  if (min >= max) {
    throw new Error("min must be less than or equal to max");
  }
  return getRandomIntInclusive(min + 1, max - 1);
}

/**
 * @description 获取指定范围内的随机整数，排除最大值
 * @description_en Get a random integer within a specified range, excluding the maximum value
 */
export function getRandomIntExcludeMax(min: number, max: number): number {
  if (min >= max) {
    throw new Error("min must be less than or equal to max");
  }
  return getRandomIntInclusive(min, max - 1);
}

/**
 * @description 获取指定长度的随机字符串
 * @description_en Get a random string of specified length
 * @param length 字符串长度 default: 8
 * @param chars 字符集合
 */
export function getRandomString(
  length = 8,
  chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
): string {
  if (length <= 0) {
    throw new Error("length must be greater than 0");
  }
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[getRandomIntExcludeMax(0, chars.length)];
  }
  return result;
}
