import { Entity } from '@/EntitiesJS/Entity.js'
import dataTypes from '@/EntitiesJS/data-types'
import Project from '@/entities/Project'

export default class ProjectList extends Entity {
  $fields = {
    items: dataTypes.ARRAY_ITEMS
  }

  $item = Project

  constructor(props) {
    super(props)
    Entity.prepare(this, props)
  }
}
