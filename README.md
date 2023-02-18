# EntitiesJS

#### - a framework for work with data, which allows to control you field data types with strong typing, framework which take care about API communications (just call the method), framework which can control your fields to auto update them to the API (with loading states in each field), framework with the mock layer to optimize front-end development.

* including strong data typing layer,
* including API communication layer,
* including API modules (restfull api, graphql),
* including mock-data module,
* including Entity field auto update to API,
* including Entity field loading states,
* including custom data types,

## Plan:

- TODO: create full documentation:
  - Entity methods (+ static)
  - EntityMock methods (+ static)
  - How API hooks works
  - How data types works
- TODO: intercept errors in the API layer
- TODO: feature: add Enums data types
- TODO: refactor: from JS to TS (?)
- TODO: composition API (?)
- TODO: test: api create entity
- TODO: test: api delete entity
- TODO: feature: add nested Entities feature:
  - child nested objects relation,
  - relation by id,
  - get full entity on $read,
  - send only id on $update,
  - refetch parent if child has been updated,
- TODO: feature: child entity cascade updating (?)
- TODO: feature: entity self auto update by API in interval (polling?)
- TODO: feature: add GQL feature ("https:-api.graphqlplaceholder.com")
- TODO: feature: data cache (?)
- TODO: feature: old/new value cache in state (?)
- DONE: api custom params
- DONE: setter debounce with promise
- DONE: API loading state
- DONE: add API pack-payload feature
- DONE: add list Entities feature
- DONE: id autoincrement if no API
- DONE: refactor: entity options provide on module connection (Entity.apiSchema = ...)
- DONE: feature: entityState - new method - create entity copy for form
- DONE: feature: API interceptors and rejecting
- DONE: each state (loading etc.) for each field?
- DONE: feature: forms populating and editing
- DONE: feature: entity mock as module with hooks to simulate requests
- DONE: refactor: all service entity $fields to starts with $
- DONE: refactor: modules system
- DONE: refactor: simplify copy/paste code in the entity definition (constructor, super, Entity.prepare)
- DONE: feature: add Entity definition by short (entity) syntax
- DONE: feature: add data type - json
- DONE: bug: loading on preload (for example in static entityList)
- DONE: refactor: resolve global options and class options truth-duplication problem
- DONE: feature: custom data types
- CANCEL: feature: add fields validators and validation errors feature

## Usage:

### 1. Set up the framework:
```javascript
// main.js
import { Entity, EntityOptions } from 'entitiesjs'
import { ApiRestHooks } from 'entitiesjs'

Entity.globalOptions = new EntityOptions({
  api: {
    isEnabled: true, // turn on API
    baseUrl: 'https://jsonplaceholder.typicode.com', // base url for all API operations
    watcherEnabled: false, // auto update values to API
    isLoadingStatesEnabled: true // add loading state on each Entity field
  }
})
Entity.apiSchema = new ApiRestHooks() // <--- here we select the RESTFull API module!
```

### 2. Just define Entity with fields with data types (+ with custom data types):
#### (You won't be able to update field by another data type)
```javascript
// src/entities/Project.js
import { Entity } from 'entitiesjs'
import { dataTypes } from 'entitiesjs'
import colorDataType from '@/utils/custom-data-types/colorDataType'
import timeDataType from '@/utils/custom-data-types/timeDataType'

export default class Project extends Entity {
  $fields = { // <--- entity fields!
    id: dataTypes.ID, // complex data types are built in!
    name: dataTypes.STRING,
    description: dataTypes.STRING,
    startTime: timeDataType, // custom data type
    endTime: timeDataType, // custom data type
    weekDays: dataTypes.ARRAY,
    color: colorDataType // custom data type
  }

  constructor (props) {
    super(props)
    Entity.prepare(this, props) // <--- init entity!
  }
}
```

### 3. Compose parent Entity:
```javascript
// src/entities/ProjectList.js
import { Entity } from 'entitiesjs'
import { dataTypes } from 'entitiesjs'
import Project from '@/entities/Project' // <--- Your custom directory for storing all entities

export default class ProjectList extends Entity {
  $fields = {
    items: dataTypes.ARRAY_ITEMS
  }

  $item = Project // <--- child!

  constructor (props) {
    super(props)
    Entity.prepare(this, props)
  }
}
```
### 4. To use api, compose $options.api field:
```javascript
// src/entities/Post.js
export default class Post extends Entity {
  $fields = {
    id: dataTypes.ID,
    title: dataTypes.STRING,
    body: dataTypes.STRING
  }

  $options = {
    api: {
      alias: 'posts', // <-- alias required!
      headers: {
        'testHeader': 'testHeaderValue' // <--- your own header
      },
      watcherEnabled: true // <--- auto update when field state has been changed
      // pollingTime: 10000
    }
  }

  constructor(props) {
    super(props)
    Entity.prepare(this, props)
  }
}
```
### 5. Use the Entity (VUE example):
```vue
<template>
  <v-container>
    <v-col>
      <form @submit.prevent>
        <v-card>
          <v-card-title>Edit</v-card-title>
          <v-card-subtitle>{{ fields.title }}</v-card-subtitle>
          <v-card-text>
            <!-- You have loading states in the Entity: -->
            <v-text-field
                :loading='itemToEdit.$isApiLoading'
                :disabled='itemToEdit.$isApiLoading'
                v-model='fields.title'
                label='title'
            />
            <v-text-field
                :loading='itemToEdit.$isApiLoading'
                :disabled='itemToEdit.$isApiLoading'
                v-model='fields.body'
                label='body'
            />
          </v-card-text>
          <v-card-actions>
            <!-- Just call the update method: -->
            <v-btn @click='itemToEdit.update(fields)'>Save</v-btn>
          </v-card-actions>
        </v-card>
      </form>
    </v-col>
  </v-container>
</template>

<script>
import Post from '@/entities/Post.js'

export default {
  name: 'testEdit',
  data () {
    return {
      itemToEdit: {},
      fields: {
        title: '',
        body: ''
      }
    }
  },
  async mounted () {
    const itemId = Number(this.$route.params.testId)
    const item = await Post.readById(itemId) // <--- API layer magic!
    this.itemToEdit = item
    this.fields = item.createState(this.fields) // You can create state based by payload
  }
}
</script>
```
### 6. Don't wait back-end, use mock data types which built in:
#### (And change the extends to default Entity when the back-end will be ready) 
```javascript
// src/entities/mock/ProjectMock.js
import { EntityMock } from 'entitiesjs'
import { Entity } from 'entitiesjs'
import { dataTypes } from 'entitiesjs'

export default class ProjectMock extends EntityMock { // <-- Another extends!
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

  constructor(props) {
    super(props)
    Entity.prepare(this, props)
  }
}
```
### 7. A lot of built-in utils ready:
```javascript
import { falsyCheck } from 'entitiesjs'
import { typeofCheck } from 'entitiesjs'
import { debounce } from 'entitiesjs'
import { incrementor } from 'entitiesjs'
import {
  randomString,
  randomNumber,
  randomWords,
  randomBoolean,
  randomArray,
  randomEntity,
  randomWordsList,
  mockDataHooks
} from 'entitiesjs'
import {
  deepPopulate,
  deepEmptyPopulate,
  populateSelf
} from 'entitiesjs'
```
### 8. Lifecycle hooks:
```javascript
// src/entities/Post.js
export default class Post extends Entity {
  $fields = {
    id: dataTypes.ID,
    title: dataTypes.STRING,
    body: dataTypes.STRING
  }

  created () {
    console.log('created:', this)
  }

  updated (newValue, oldValue) {
    console.log('updated:', { newValue, oldValue, entity: this })
  }

  constructor(props) {
    super(props)
    Entity.prepare(this, props)
  }
}
```
## API Documentation:

### Data Types:
ID <br>
STRING <br>
INTEGER <br>
BOOLEAN <br>
DATE <br>
ARRAY <br>
ARRAY_ITEMS <br>
JSON <br>
OBJECT <br>
