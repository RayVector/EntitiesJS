import { Entity, dataTypes, $prepare } from '../../../src'

export default class Item extends Entity {
  $fields = {
    id: dataTypes.ID,
    title: dataTypes.STRING,
    body: dataTypes.STRING
  }

  constructor(props) {
    super(props)
    $prepare(this, props)
  }
}
