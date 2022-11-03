/**
 * EntitiesJs - it's a framework for work with data,
 * including a lot of DRY code principal,
 * including strong data typing layer,
 * including API communication layer,
 * including API modules (restfull api, graphql),
 * including mock-data module,
 */

// Plan:
// TODO: refactor: from JS to TS (?)
// TODO: test: api create entity
// TODO: test: api delete entity
// TODO: feature: add nested Entities feature:
//  - child nested objects relation,
//  - relation by id,
//  - get full entity on $read,
//  - send only id on $update,
//  - refetch parent if child has been updated,
// TODO: feature: child entity cascade updating (?)
// TODO: feature: entity self auto update by API in interval
// TODO: feature: add Enums logic
// TODO: feature: data cache
// TODO: feature: add GQL feature (https://api.graphqlplaceholder.com)
// TODO: feature: old/new value cache in state (?)
// TODO: intercept errors in the API layer
// DONE: api custom params
// DONE: setter debounce with promise
// DONE: API loading state
// DONE: add API pack-payload feature
// DONE: add list Entities feature
// DONE: id autoincrement if no API
// DONE: refactor: entity options provide on module connection (Entity.apiSchema = ...)
// DONE: feature: entityState - new method - create entity copy for form
// DONE: feature: API interceptors and rejecting
// DONE: each state (loading etc) for each field?
// DONE: feature: forms populating and editing
// DONE: feature: entity mock as module with hooks to simulate requests
// DROP: feature: add fields validators and validation errors feature
// DONE: refactor: all service entity $fields to starts with $
// DONE: refactor: modules system
// DONE: refactor: simplify copy/paste code in the entity definition (constructor, super, Entity.prepare)
// DONE: feature: add Entity definition by short (entity) syntax
// DONE: feature: add data type - json
// DONE: bug: loading on preload (for example in static entityList)
// DONE: refactor: resolve global options and class options truth-duplication problem
// DONE: feature: custom data types

/**
 * module: configs
 */
import errors from './configs/errors'

/**
 * module: utils
 */
import {debounce} from './utils/debounce'

import {deepEmptyPopulate, deepPopulate, populateSelf} from './utils/population'

let fieldDebouncer = null

/**
 * module: api interface
 * entity-API crud communication wrapper
 */
export class EntityApi {
    constructor(schemaData) {
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
        aliasList: '',
        // toggle sending API after new value
        watcherEnabled: true,
        // call read of the entity in the initialization
        isPrefetch: false,
        // debounce
        debounceTime: 1000, // 1s
        // polling time to auto updating
        pollingTime: 0,
        pollingId: null,
        isLoadingStatesEnabled: false,
        // headers
        headers: null
    }

    constructor(options = null) {
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

    constructor(data, options = null) {
        new Promise((res) => {
            if (options !== null) Entity.setOptions(this)
            res()
        }).then(() => {
            if (Entity.validateEntityApiEnabled(this)) {
                // set API hooks is api is enabled
                Object.assign(this, new EntityApi(Entity.apiSchema))
            }
        })
    }


    // STATIC
    /**
     * main Entity prepare function
     * this special init method covers entity by all needed data and watchers
     * @param entity
     * @param extValues
     * @returns {{$isPrepared}|*}
     */
    static prepare = (entity, extValues) => {
        Entity.setOptions(entity)
        // set custom options in class description way
        // validate entity required $fields
        Entity.validate(entity)
        if (entity.$options.api.isLoadingStatesEnabled) {
            // api setLoadingStates
            Entity.setLoadingStates(entity)
        }
        // // prefetch
        // if (entity.$options.api.isEnabled && entity.$options.api.isPrefetch) {
        //   entity.fetch()
        // }
        // set $fields and values
        Entity.setWatchers(entity)
        // set external pre-values
        if (!entity.$isPrepared) Entity.init(entity, extValues)
        // entity completed
        entity.$isPrepared = true
        // call created lifecycle hook
        entity.created()
        return entity
    }

    static async entityPollingList(Item, cb) {
        const entity = new Item()
        if (entity.$options.api.pollingTime > 0) {
            clearInterval(entity.$options.api.pollingId)
            entity.$options.api.pollingId = setInterval(() => {
                cb(Entity.entityList(Item))
            }, entity.$options.api.pollingTime)
        } else {
            cb(Entity.entityList(Item))
        }
    }

    /**
     * Creates new LoadingStates $loadingStates by field
     * @param entity
     */
    static setLoadingStates(entity) {
        for (const field in entity.$fields) {
            entity.$loadingStates[field] = new LoadingStates()
        }
    }

    /**
     * debounce and set value
     * @param v
     * @param entity
     * @param entityKey
     */
    static updateDebouncedField(v, entity, entityKey) {
        (function (entity, v, entityKey) {
            entity[entityKey] = entity.$update(entity, v, entityKey)
        }(entity, v, entityKey))
    }

    /**
     * check required $fields
     * @param entity
     */
    static validate(entity) {
        // TODO: add cycle on array of the required field
        // required fields: [$fields]
        if (!entity.$fields) Entity.createError('Field "$fields" is required for Entity child')
    }

    /**
     * set pre-values without watchers
     * @param entity
     * @param newData
     */
    static init = (entity, newData = {}) => {
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
        if (Entity.validateEntityApiEnabled(entity, false)) {
            fieldDebouncer = debounce(Entity.updateDebouncedField, entity?.$options?.api?.debounceTime)
        }
    }

    /**
     * set watcher by field
     * @param entity
     * @param entityKey
     * @param value
     */
    static async setEntityValue(entity, entityKey, value) {
        const fieldsValue = entity.$fields[entityKey]
        const isValidValue = value && (typeof value.then === 'function' ||
            typeof value === typeof fieldsValue.type(value))
        // set pre-values
        if (!entity.$isPrepared) entity['_' + entityKey] = value
        if (isValidValue) {
            // don't update if no changes
            // TODO: improve value matching for difficult cases (data-types)
            if (entity['_' + entityKey] === value) return
            if (entity.$isPrepared) {
                // if watcher enabled
                if (Entity.validateEntityApiEnabled(entity, false) && entity?.$options?.api?.watcherEnabled) {
                    // if promise type
                    if (typeof value.then === 'function') {
                        entity.changeApiLoadingStatus(true)
                        entity.updateLoadingByData(true, {}, entityKey)
                        const res = await value
                        entity['_' + entityKey] = res[entityKey]
                        entity.changeApiLoadingStatus(false)
                        entity.updateLoadingByData(false, {}, entityKey)
                    } else {
                        fieldDebouncer(value, entity, entityKey)
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
                // todo: remove? useless
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
     * creates special methods to control data type values
     * @param entity
     * @param field
     * @param value
     */
    static setDataTypesMethods = (entity, field, value) => {
        if (entity.$fields[field].valueHandler !== null) {
            if (!entity.$fields[field].valueHandler(entity, field, value)) {
                Entity.createError(`Value '${field}' doesn't match to data type`)
                throw new Error()
            }
        }
    }

    /**
     * set watcher, watcher adds reactivity for the value
     * @param entity
     * @returns {*}
     */
    static setWatchers = entity => {
        for (const entityKey in entity.$fields) {
            new Promise((res) => {
                // set watchers
                Object.defineProperty(entity, entityKey, {
                    get() {
                        return entity['_' + entityKey]
                    },
                    set(value) {
                        // set watcher by field
                        Entity.setEntityValue(entity, entityKey, value)
                    }
                })
                res()
            }).then(() => {
                // creates special methods to control data type values
                Entity.setDataTypesMethods(entity, entityKey, entity[entityKey])
            })
        }
    }

    static createError(msg = '') {
        console.error(msg)
    }

    /**
     * check if API and entity options allow for using an API
     * @param entity
     * @param throwError
     * @returns {((cap: GLenum) => GLboolean)|*|boolean}
     */
    static validateEntityApiEnabled(entity = {}, throwError = true) {
        const isApiEnabled = entity.$options?.api?.isEnabled || false
        // if no api
        if (!entity.$options.api.alias && !isApiEnabled) {
            return false
        }
        if (!isApiEnabled && throwError) Entity.createError(errors.apiEnabledTryCall)
        return isApiEnabled
    }

    /**
     * Gets and return array of the initiated Item prop
     * @returns {Promise<*>}
     */
    static async entityList(Item, queryParams) {
        return new Promise((response) => {
            const entity = new Item()
            setTimeout(async () => {
                const res = await entity.read(null, queryParams)
                response(res.map(extListItem => new Item(extListItem)))
            }, 1)
        })
    }

    /**
     * Populate options
     * recursion!
     * @param entity
     */
    static setOptions = (entity) => {
        // new options will rewrite global options
        deepPopulate(entity.$options, Entity.globalOptions)
    }

    static readById(id = null) {
        return new Promise((response) => {
            const item = new this
            setTimeout(async () => {
                const res = await item.read(id)
                response(new this(res))
            }, 1)
        })
    }

    static createState(data = {}) {
        return new this().createState(data)
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
    async create(data = {}, queryParams, customFields = {}, returnFullRes = false) {
        const payload = this.createPayload(data, customFields)
        if (!Entity.validateEntityApiEnabled(this)) {
            Entity.createError('api is disabled')
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
    async read(id = null, queryParams) {
        if (!Entity.validateEntityApiEnabled(this)) {
            Entity.createError('api is disabled')
            return
        }
        const res = await this.$read(this, id, queryParams)
        this.changeApiLoadingStatus(false)
        return res
    }

    /**
     * patch data
     * @param data
     * @param queryParams
     * @param leftFields
     * @returns {Promise<*>}
     */
    async update(data = {}, queryParams, leftFields = []) {
        // reject api call
        if (this.$loadingController !== null) {
            this.$loadingController.abort()
            this.$loadingController = null
        }
        const payload = this.createApiPayload(data, leftFields)
        if (!Entity.validateEntityApiEnabled(this)) {
            Entity.createError('api is disabled')
            return
        }
        this.changeApiLoadingStatus(true)
        this.updateLoadingByData(true, payload)
        const res = await this.$update(this, payload, null, queryParams)
        this.changeApiLoadingStatus(false)
        this.updateLoadingByData(false, payload)
        this.updated(payload, res)
        this.updateState(res)
        return res
    }

    /**
     * update state
     * @param data
     */
    updateState(data) {
        Object.assign(this, data)
    }

    /**
     * delete data
     * @returns {Promise<*>}
     */
    async delete(queryParams) {
        if (!Entity.validateEntityApiEnabled(this)) {
            Entity.createError('api is disabled')
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
    changeApiLoadingStatus(status) {
        this.$isApiLoading = status
    }

    /**
     * update loading state bool status
     * @param status
     * @param field
     */
    changeApiFieldLoadingStatus(status, field = null) {
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
    updateLoadingByData(status, data, extField = null) {
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
    createApiPayload(data = {}, leftFields = []) {
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
    createPayload(data = {}, leftFields = []) {
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
    createState(data = {}) {
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
    created() {
        return this
    }

    /**
     * lifecycle hook after update
     * @param newValue
     * @param oldValue
     * @returns {{newValue, oldValue, entity: Entity}}
     */
    updated(newValue, oldValue) {
        return {
            entity: this,
            newValue,
            oldValue
        }
    }
}
