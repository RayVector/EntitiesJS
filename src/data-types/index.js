// EntitiesJS custom data types
export const NumberId = (value) => {
  if (value === null || typeof value === 'number') return value
}
export const JSONType = (value) => {
  try {
    return JSON.parse(value)
  } catch (e) {
    return false
  }
}

export class DataType {
  // function data type
  type = null
  // default value
  default = null
  // calls after watcher on init()
  handler = null
  // function, calls after setter
  valueHandler = null
  // function, calls before api sending
  payloadHandler = null

  constructor(
    type = () => {
    },
    _default = null,
    handler = null,
    valueHandler = null,
    payloadHandler = (v) => v
  ) {
    this.type = type
    this.default = _default
    this.handler = handler
    this.valueHandler = valueHandler
    this.payloadHandler = payloadHandler
  }
}

// value handlers
export const arrayOfItemsValueHandler = (entity, field, value) => value.every(item => item instanceof entity.$item)
// export const dateValueHandler = (entity, field, value) => value instanceof Date
export const idValueHandler = (entity, field, value) => value !== null ? Number.isInteger(value) : true

// payload handlers
export const entityPayloadHandler = value => value.id
export const arrayItemsPayloadHandler = value => value.map(item => item.id)

export const types = {
  ID: new DataType(NumberId, null, idValueHandler),
  STRING: new DataType(String, ''),
  INTEGER: new DataType(Number, 0),
  BOOLEAN: new DataType(Boolean, false),
  DATE: new DataType(Date, new Date(), null),
  ARRAY: new DataType(Array, []),
  ARRAY_ITEMS: new DataType(Array, [], null, arrayOfItemsValueHandler, arrayItemsPayloadHandler),
  JSON: new DataType(JSONType, JSON.stringify({})),
  OBJECT: new DataType(Object, {}, null, null, entityPayloadHandler)
}

export default Object.assign({}, types)
