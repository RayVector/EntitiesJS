import { Entity, dataTypes } from '../../../src'

export default class Post extends Entity {
  $fields = {
    id: dataTypes.ID,
    title: dataTypes.STRING,
    body: dataTypes.STRING
  }

  $options = {
    api: {
      alias: 'posts', // <-- alias required!
      headers: {
        'testHeader': 'testHeaderValue' // <--- your own header
      },
      watcherEnabled: true // <--- auto update when field state has been changed
      // pollingTime: 10000
    }
  }

  constructor(props) {
    super(props)
    Entity.prepare(this, props)
  }
}
