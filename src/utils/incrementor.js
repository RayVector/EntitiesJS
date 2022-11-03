/**
 * mock id incrementor
 * @param list
 * @returns {number}
 */
export const incrementor = (list = []) => {
  if (list.length === 0) { return 1 }
  const lastItem = list[list.length - 1]
  if (!lastItem || !lastItem.id) { throw new Error('incrementor.js: item in array must have id property') }
  return lastItem.id++
}
