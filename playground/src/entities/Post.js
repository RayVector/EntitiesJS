import { Entity, dataTypes, $prepare } from '../../../src'


const getAllPostsQuery = () => {
  return {
    aliasForOne: 'post',
    queryVariables: {
      "options": {
        "paginate": {
          "page": 1,
          "limit": 5
        }
      }
    },
    queryParams: {
      options: 'PageQueryOptions'
    },
    mutationUpdateParams: {
      name: 'updatePost',
      dataType: 'UpdatePostInput!',
      updateField: 'input'
    }
  }
}

const updatePostMutation = () => {
  return {

  }
}

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
        queries: {
          getAllPosts: getAllPostsQuery
        },
        mutations: {
          updatePost: updatePostMutation
        }
      }
    }
  }

  constructor(props) {
    super(props)
    $prepare(this, props)
  }
}
