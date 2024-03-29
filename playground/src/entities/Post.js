import { Entity, dataTypes, $prepare } from '../../../src'

export default class Post extends Entity {
  $fields = {
    id: dataTypes.ID,
    title: dataTypes.STRING,
    body: dataTypes.STRING
  }

  $options = {
    api: {
      alias: 'posts', // <-- alias required!
      watcherEnabled: true,
      debounceTime: 2000
      // pollingTime: 10000
    }
  }

  constructor(props) {
    super(props)
    $prepare(this, props)
  }
}
