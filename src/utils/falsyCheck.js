export const falsyCheck = value => {
  if (value === null) { return false }
  if (value === undefined) { return false }
  if (typeof value === 'boolean') { return true }
  if (typeof value === 'object') {
    // Promise type
    if (typeof value.then === 'function') {
      return true
    }
    return Object.keys(value).length
  }
  if (typeof value === 'number') { return true }
  return !!value
}
