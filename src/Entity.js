/**
 * EntitiesJs - it's a framework for work with data,
 * including strong data typing layer,
 * including API communication layer,
 * including API modules (restfull api, graphql),
 * including mock-data module,
 */

/**
 * module: configs
 */
import errors from './configs/errors'

/**
 * module: utils
 */
import { debounce } from './utils/debounce'

import { deepEmptyPopulate, deepPopulate, populateSelf } from './utils/population'
import { falsyCheck } from "./utils/falsyCheck";

let apiDebouncer = null

/**
 * module: api interface
 * entity-API crud communication wrapper
 */
export class EntityApi {
  constructor (schemaData) {
    this.$create = schemaData.create
    this.$update = schemaData.update
    this.$read = schemaData.read
    this.$delete = schemaData.delete
  }
}

/**
 * module: options
 * config
 */
export class EntityOptions {
  api = {
    isEnabled: false,
    // base url used for sending API
    baseUrl: '',
    // alias used for query name, to determine entity name in the API communication
    // alias it's a main definition for API using
    // if alias is falsy, API will not work
    alias: '',
    // toggle sending API after new value
    watcherEnabled: true,
    // debounce
    debounceTime: 1000, // 1s
    // polling time to auto updating
    pollingTime: 0,
    pollingId: null,
    isLoadingStatesEnabled: false,
    // headers
    headers: null,
    gql: {
      aliasForOne: null,
      variables: {},
      queryParams: {}
    }
  }

  constructor (options = null) {
    if (!options) return
    // populate new data based on the class $fields
    populateSelf(this, options)
  }
}

/**
 * module: loading states
 * config
 */
export class LoadingStates {
  $isLoading = false
  $apiRequestId = null
}

/**
 * main class
 */
export class Entity {
  // set default entity options
  $options = new EntityOptions()
  // global static options, it sets to entity.$options
  static globalOptions = new EntityOptions()
  static apiSchema = null
  // any API hook change this value before/after itself
  $isApiLoading = false
  // means that entity is ready for usage
  $isPrepared = false
  // data types
  $fields = {}
  // loading states
  $loadingStates = {}
  $loadingController = null
  // child entity class
  $item = null

  constructor (data, options = null) {
    new Promise((res) => {
      if (options !== null) $setOptions(this)
      res()
    }).then(() => {
      if ($validateEntityApiEnabled(this)) {
        // set API hooks if api is enabled
        Object.assign(this, new EntityApi(Entity.apiSchema))
      }
    })
  }


  // API INTERFACES
  /**
   * create data
   * @param data
   * @param queryParams
   * @param customFields
   * @param returnFullRes
   * @returns {Promise<*|{}>}
   */
  async create (data = {}, queryParams, customFields = {}, returnFullRes = false) {
    const payload = this.createPayload(data, customFields)
    if (!$validateEntityApiEnabled(this)) {
      $createError('api is disabled')
      console.info(payload)
      return
    }
    const res = await this.$create(this, payload, null, queryParams)
    this.changeApiLoadingStatus(false)
    this.updateLoadingByData(false, payload)
    if (returnFullRes) return res
    else return this.createPayload(res)
  }

  /**
   * get data
   * @returns {Promise<*>}
   */
  async read (id = null, queryParams) {
    if (!$validateEntityApiEnabled(this)) {
      $createError('api is disabled')
      return
    }
    const res = await this.$read(this, id, queryParams)
    this.changeApiLoadingStatus(false)
    return res
  }

  /**
   * patch data
   * @param data
   * @param payload used for certain fields
   * @param queryParams
   * @param leftFields
   * @returns {Promise<*>}
   */
  async update (data = {}, payload = null,  queryParams, leftFields = []) {
    // reject api call
    if (this.$loadingController !== null) {
      this.$loadingController.abort()
      this.$loadingController = null
    }
    // create payload
    const dataPayload = payload ? payload : this.createApiPayload(data, leftFields)
    if (!$validateEntityApiEnabled(this)) {
      $createError('api is disabled')
      return
    }
    this.updateLoadingByData(true, dataPayload)
    this.changeApiLoadingStatus(true)
    const res = await this.$update(this, dataPayload, null, queryParams)
    this.changeApiLoadingStatus(false)
    this.updateLoadingByData(false, dataPayload)
    this.updated(dataPayload, res)
    this.updateState(res)
    return res
  }

  /**
   * update state
   * @param data
   */
  updateState (data) {
    Object.assign(this, data)
  }

  /**
   * delete data
   * @returns {Promise<*>}
   */
  async delete (queryParams) {
    if (!$validateEntityApiEnabled(this)) {
      $createError('api is disabled')
      console.info(this)
      return
    }
    const res = await this.$delete(this, queryParams)
    this.changeApiLoadingStatus(false)
    this.updateLoadingByData(false, this.createPayload())
    return res
  }


  // METHODS
  /**
   * update state bool status
   * @param status
   */
  changeApiLoadingStatus (status) {
    this.$isApiLoading = status
  }

  /**
   * update loading state bool status
   * @param status
   * @param field
   */
  changeApiFieldLoadingStatus (status, field = null) {
    if (field) {
      this.$loadingStates[field].$isLoading = status
    }
  }

  /**
   * updates status by data in for cycle
   * @param status
   * @param data
   * @param extField
   */
  updateLoadingByData (status, data, extField = null) {
    for (const field in data) {
      this.changeApiFieldLoadingStatus(status, field)
    }
    if (extField !== null) {
      this.changeApiFieldLoadingStatus(status, extField)
    }
  }

  /**
   * creates payload for api with data changes check
   * @param data
   * @param leftFields
   * @returns {{}}
   */
  createApiPayload (data = {}, leftFields = []) {
    const payload = {}
    for (const field in this.$fields) {
      if (this[field] !== undefined && field !== 'id' && !leftFields.includes(field)) {
        if (data[field] !== undefined) {
          payload[field] = this.$fields[field].payloadHandler(data[field])
        } else {
          payload[field] = this.$fields[field].payloadHandler(this[field])
        }
      }
    }
    return payload
  }

  /**
   * creates an entity with values based on the entity.$fields
   * @param data
   * @param leftFields
   * @returns {{}}
   */
  createPayload (data = {}, leftFields = []) {
    const payload = {}
    for (const field in this.$fields) {
      if (this[field] !== undefined && !leftFields.includes(field)) {
        if (data[field] !== undefined) {
          payload[field] = data[field]
        } else {
          payload[field] = this[field]
        }
      }
    }
    return payload
  }

  /**
   * entity state method for forms
   * @param data
   */
  createState (data = {}) {
    const payload = this.createPayload()
    if (!Object.keys(data).length) {
      return payload
    }
    return deepEmptyPopulate(payload, data)
  }


  // LIFECYCLE HOOKS
  /**
   * lifecycle hook after prepare()
   * @returns {Entity}
   */
  created () {
    return this
  }

  /**
   * lifecycle hook after update
   * @param newValue
   * @param oldValue
   * @returns {{newValue, oldValue, entity: Entity}}
   */
  updated (newValue, oldValue) {
    return {
      entity: this,
      newValue,
      oldValue
    }
  }
}

/**
 * Gets and return array of the initiated Item prop
 * @returns {Promise<*>}
 */
export const $entityList = (Entity, queryParams = null) => {
  return new Promise((response) => {
    const entity = new Entity()
    setTimeout(async () => {
      const res = await entity.read(null, queryParams)
      response(res.map(extListEntity => new Entity(extListEntity)))
    }, 0)
  })
}

/**
 * get entity by id from api
 * @param Entity
 * @param id
 * @returns {Promise<unknown>}
 */
export const $readById = (Entity, id = null) => {
  return new Promise((response) => {
    const item = new Entity
    setTimeout(async () => {
      const res = await item.read(id)
      response(new Entity(res))
    }, 0)
  })
}

/**
 * Prepare input entity
 * Creates options, validate entity, attaches loading states,
 * set watchers, update prepared state, call created hook
 * @param entity
 * @param extValues
 * @returns {{$isPrepared}|*}
 */
export const $prepare = (entity, extValues) => {
  $setOptions(entity)
  // set custom options in class description way
  // validate entity required $fields
  $validate(entity)
  if (entity.$options.api.isLoadingStatesEnabled) {
    // api $setLoadingStates
    $setLoadingStates(entity)
  }
  // // prefetch
  // if (entity.$options.api.isEnabled && entity.$options.api.isPrefetch) {
  //   entity.fetch()
  // }
  // set $fields and values
  $setWatchers(entity)
  // set external pre-values
  if (!entity.$isPrepared) $init(entity, extValues)
  // entity completed
  entity.$isPrepared = true
  // call created lifecycle hook
  entity.created()
  return entity
}

/**
 * Callback for list with polling
 * @param Entity
 * @param cb
 * @returns {Promise<void>}
 */
export const $entityPollingList = async (Entity, cb) => {
  const entity = new Entity()
  if (entity.$options.api.pollingTime > 0) {
    clearInterval(entity.$options.api.pollingId)
    entity.$options.api.pollingId = setInterval(() => {
      cb($entityList(Entity))
    }, entity.$options.api.pollingTime)
  } else {
    cb($entityList(Entity))
  }
}

/**
 * attaches module LoadingStates
 * @param entity
 */
const $setLoadingStates = (entity) => {
  for (const field in entity.$fields) {
    entity.$loadingStates[field] = new LoadingStates()
  }
}

// func for debouncer
const $updateDebouncedField = (v, entity, entityKey) => {
  entity.update({}, { [entityKey]: v })
}

const $validate = (entity) => {
  // TODO: add cycle on array of the required field
  // required fields: [$fields]
  if (!entity.$fields) $createError(errors.fieldsRequired)
}

const $init = (entity, newData = {}) => {
  for (const entityKey in entity.$fields) {
    // set pre-values
    if (Object.keys(newData).length && newData[entityKey] !== undefined) {
      if (entity.$fields[entityKey].handler !== null) {
        entity.$fields[entityKey].handler(newData[entityKey])
      }
      entity[entityKey] = newData[entityKey]
    }
    // set default dataType value
    else {
      entity[entityKey] = entity.$fields[entityKey].default
    }
  }
  if ($validateEntityApiEnabled(entity, false)) {
    apiDebouncer = debounce($updateDebouncedField, entity?.$options?.api?.debounceTime)
  }
}

/**
 * Value Setter
 * @param entity
 * @param entityKey
 * @param value
 * @returns {Promise<void>}
 */
export const $setEntityValue = async (entity, entityKey, value) => {
  const fieldsValue = entity.$fields[entityKey]
  const isValidValue = falsyCheck(value) ? typeof value.then === 'function' ||
    typeof value === typeof fieldsValue.type(value) :
    typeof value === typeof fieldsValue.type(value)
  // set pre-values
  if (!entity.$isPrepared) entity['_' + entityKey] = value
  if (isValidValue) {
    // don't update if no changes
    // TODO: improve value matching for difficult cases (data-types)
    if (entity['_' + entityKey] === value) return
    if (entity.$isPrepared) {
      // if watcher enabled
      if ($validateEntityApiEnabled(entity, false) && entity?.$options?.api?.watcherEnabled) {
        // if promise type
        if (typeof value.then === 'function') {
          entity.changeApiLoadingStatus(true)
          entity.updateLoadingByData(true, {}, entityKey)
          const res = await value
          entity['_' + entityKey] = res[entityKey]
          entity.changeApiLoadingStatus(false)
          entity.updateLoadingByData(false, {}, entityKey)
        } else {
          apiDebouncer(value, entity, entityKey)
          entity['_' + entityKey] = value
        }
      } else {
        // set value
        entity['_' + entityKey] = value
      }
      // activate data type handler
      if (fieldsValue.handler !== null) {
        fieldsValue.handler(value)
      }
      // resolve promises if value is promise
      if (entity['_' + entityKey] !== null && typeof entity['_' + entityKey].then === 'function') {
        entity['_' + entityKey].then(res => {
          entity['_' + entityKey] = res[entityKey]
          entity.changeApiLoadingStatus(false)
          entity.updateLoadingByData(false, {}, entityKey)
        })
      }
    }
  } else {
    entity['_' + entityKey] = entity['_' + entityKey]
  }
}

/**
 * @param entity
 * @param field
 * @param value
 */
const $setDataTypesMethods = (entity, field, value) => {
  if (entity.$fields[field].valueHandler !== null) {
    if (!entity.$fields[field].valueHandler(entity, field, value)) {
      $createError(`Value '${ field }' doesn't match to data type`)
      throw new Error()
    }
  }
}

const $setWatchers = entity => {
  for (const entityKey in entity.$fields) {
    new Promise((res) => {
      // set watchers
      Object.defineProperty(entity, entityKey, {
        get () {
          return entity['_' + entityKey]
        },
        set (value) {
          // set watcher by field
          $setEntityValue(entity, entityKey, value)
        }
      })
      res()
    }).then(() => {
      // creates special methods to control data type values
      $setDataTypesMethods(entity, entityKey, entity[entityKey])
    })
  }
}

const $createError = (msg = '') => {
  console.error(msg)
}

/**
 * check if API and entity options allow for using an API
 * @param entity
 * @param throwError
 * @returns {((cap: GLenum) => GLboolean)|*|boolean}
 */
export const $validateEntityApiEnabled = (entity = {}, throwError = true) => {
  const isApiEnabled = entity.$options?.api?.isEnabled || false
  // if no api
  if (!entity.$options.api.alias && !isApiEnabled) {
    return false
  }
  if (!isApiEnabled && throwError) $createError(errors.apiEnabledTryCall)
  return isApiEnabled
}

/**
 * Populate options
 * recursion!
 * @param entity
 */
const $setOptions = (entity) => {
  // new options will rewrite global options
  deepPopulate(entity.$options, Entity.globalOptions)
}
