import { Entity, dataTypes, $prepare } from '../../../src'

export default class PostAuto extends Entity {
  $fields = {
    id: dataTypes.ID,
    title: dataTypes.STRING,
    body: dataTypes.STRING
  }

  $options = {
    api: {
      alias: 'posts',
      watcherEnabled: true,
      isLoadingStatesEnabled: true
    }
  }

  constructor(props) {
    super()
    $prepare(this, props)
  }
}
