import { Entity, $prepare } from '@/EntitiesJS/Entity.js'
import dataTypes from '@/EntitiesJS/data-types'
import colorDataType from '@/utils/custom-data-types/colorDataType'
import timeDataType from '@/utils/custom-data-types/timeDataType'

export default class Project extends Entity {
  $fields = {
    id: dataTypes.ID,
    name: dataTypes.STRING,
    description: dataTypes.STRING,
    startTime: timeDataType,
    endTime: timeDataType,
    weekDays: dataTypes.ARRAY,
    color: colorDataType
  }

  constructor(props) {
    super(props)
    $prepare(this, props)
  }
}
