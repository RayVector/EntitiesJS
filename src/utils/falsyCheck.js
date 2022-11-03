export const falsyCheck = value => {
  if (typeof value === 'boolean') { return true }
  if (typeof value === 'object') {
    return Object.keys(value).length
  }
  if (typeof value === 'number') { return true }
  return !!value
}
