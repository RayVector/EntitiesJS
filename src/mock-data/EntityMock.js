import { Entity }  from '../Entity'
import { deepPopulate }  from '../utils/population'
import { mockDataHooks } from '../utils/randomData'
import { typeofCheck }  from '../utils/typeofCheck'

export class EntityMock extends Entity {
  constructor(props) {
    super(props)
  }

  static populateMockData (entity) {
    for (const field in entity.$fields) {
      const entityValue = entity[field]
      const type = typeofCheck(entityValue)
      const mockTypeHandler = mockDataHooks[type]
      entity[field] = mockTypeHandler()
    }
  }

  static mockCreateList (number = 1, Entity = null, data = {}) {
    const output = []
    for (let i = 0; i < number; i++) {
      const entityItem = new Entity || this
      EntityMock.populateMockData(entityItem)
      deepPopulate(entityItem, data)
      output.push(entityItem)
    }
    return output
  }

  static async asyncMockCreateList (number = 1, timeout = 500) {
    return new Promise((resolve) => {
      const entity = this
      setTimeout(() => resolve(EntityMock.mockCreateList(number, entity)), timeout)
    }).then(res => {
      return res
    })
  }

  // API interfaces override
  create (data = {}) {
    const payload = this.createApiPayload(data)
    console.info(payload)
    return this
  }

  read () {
    console.info(this)
    return this
  }

  update (data = {}) {
    const payload = this.createApiPayload(data)
    console.info(payload)
    return this
  }

  delete () {
    console.info(this)
    return this
  }
}
