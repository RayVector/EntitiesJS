export const deepPopulate = (a, b) => {
  for (const field in b) {
    if (typeof b[field] === 'object') {
      deepPopulate(a[field], b[field])
    } else {
      if (typeof a[field] === 'undefined') {
        a[field] = b[field]
      }
    }
  }
}

export const deepEmptyPopulate = (a, b) => {
  const output = {}
  const populate = (valueA, valueB) => {
    for (const field in valueB) {
      if (typeof valueB[field] === 'object' && typeof valueB[field] !== 'object') {
        populate(valueA[field], valueB[field])
      } else {
        output[field] = valueA[field]
      }
    }
  }
  populate(a, b)
  return output
}

export const populateSelf = (a, b) => {
  for (const field in a) {
    if (b[field] !== undefined) {
      if (typeof a[field] === 'object') {
        populateSelf(a[field], b[field])
      } else {
        a[field] = b[field]
      }
    }
  }
}
