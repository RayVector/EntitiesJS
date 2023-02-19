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
      gql: {
        aliasForOne: 'post',
        variables: {
          "options": {
            "paginate": {
              "page": 1,
              "limit": 5
            }
          }
        },
        queryParams: {
          options: 'PageQueryOptions'
        }
      }
    }
  }

  constructor(props) {
    super(props)
    $prepare(this, props)
  }
}
