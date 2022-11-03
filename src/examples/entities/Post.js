import { Entity } from '@/EntitiesJS/Entity.js'
import dataTypes from '@/EntitiesJS/data-types'

export default class Post extends Entity {
  $fields = {
    id: dataTypes.ID,
    title: dataTypes.STRING,
    body: dataTypes.STRING
  }

  $options = {
    api: {
      alias: 'posts',
      // headers: {
      //   'testHeader': 'testHeaderValue'
      // },
      watcherEnabled: true
      // pollingTime: 0 // 10000 // 10 sec
    }
  }

  // created () {
  //   this.$fields.title.handler = async (value) => {
  //     console.log('handler:', await value)
  //   }
  //   return super.created()
  // }

  constructor(props) {
    super(props)
    Entity.prepare(this, props)
  }
}
