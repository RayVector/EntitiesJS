import { EntityMock } from '@/EntitiesJS/mock-data/EntityMock'
import { Entity } from '@/EntitiesJS/Entity.js'
import dataTypes from '@/EntitiesJS/data-types'

export default class ProjectMock extends EntityMock {
  $fields = {
    id: dataTypes.ID,
    name: dataTypes.STRING,
    description: dataTypes.STRING,
    startTime: dataTypes.STRING,
    endTime: dataTypes.STRING,
    weekDays: dataTypes.ARRAY,
    color: dataTypes.STRING,
    number: dataTypes.INTEGER,
    boolean: dataTypes.BOOLEAN,
    image: dataTypes.OBJECT
  }

  // $options = {
  //   api: {
  //     isLoadingStatesEnabled: true
  //   }
  // }

  constructor(props) {
    super(props)
    Entity.prepare(this, props)
  }
}
