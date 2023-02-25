import { Entity, dataTypes, $prepare } from '../../../src'

export default class Post extends Entity {
  $fields = {
    id: dataTypes.ID,
    title: dataTypes.STRING,
    body: dataTypes.STRING
  }

  $options = {
    api: {
      alias: 'posts',
      watcherEnabled: false,
      isLoadingStatesEnabled: true
    }
  }

  constructor(props) {
    super(props)
    $prepare(this, props)
  }
}
