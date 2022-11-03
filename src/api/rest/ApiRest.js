import { ApiMethod, ApiHooks } from '../ApiMethod.js'
import { Entity } from '../../Entity'
import { URLSearchParams } from 'core-js/modules/web.url-search-params'

export class ApiRestFetchOptions {
  method = 'GET'
  headers = {
    'Content-Type': 'application/json;charset=utf-8'
  }
  body = null
  signal = null

  constructor(method, headers, body, signal) {
    if (method) this.method = method
    if (headers) this.headers = headers
    if (body) this.body = body
    if (signal) this.signal = signal
  }
}

export class ApiRest extends ApiMethod {
  constructor() {
    super()
  }

  formUrl (extBaseUrl = null, extAlias = null, extParam = null, extQueryParams = null) {
    const entityOptionsApi = Entity.globalOptions.api
    const baseUrl = extBaseUrl || entityOptionsApi.baseUrl
    const alias = extAlias ? `/${extAlias}` : `/${entityOptionsApi.alias}`
    const param = extParam ? `/${extParam}` : ''
    const queryParams = extQueryParams ? `?${new URLSearchParams(extQueryParams)}` : ''
    return `${baseUrl}${alias}${param}${queryParams}`
  }

  async call (entity, baseUrl, alias, options = null, param, queryParams) {
    await entity.changeApiLoadingStatus(true)
    // interceptor
    entity.$loadingController = new AbortController()
    const signal = entity.$loadingController.signal
    const apiOptions = {
      ...options || new ApiRestFetchOptions(),
      signal
    }
    try {
      const res = (await fetch(this.formUrl(baseUrl, alias, param, queryParams), apiOptions))
      return await res.json()
    } catch (e) {
      console.error(e)
      return e
    }
  }
}

export class ApiRestRead extends ApiRest {}
export class ApiRestUpdate extends ApiRest {}

export class ApiRestGet extends ApiRestRead {
  async invoke (entity, alias, id, baseUrl, queryParams) {
    const options = new ApiRestFetchOptions(this.method, entity.$options.api.headers)
    return await this.call(entity, baseUrl, alias, options, id, queryParams)
  }
}
export class ApiRestPost extends ApiRestUpdate {
  method = 'POST'
  async invoke (entity, value, field, baseUrl, alias, queryParams) {
    let body = value
    if (field) {
      body = {}
      body[field] = value
    }
    const options = new ApiRestFetchOptions(this.method, entity.$options.api.headers, JSON.stringify(body))
    return await this.call(entity, baseUrl, alias, options, null, queryParams)
  }
}
export class ApiRestPut extends ApiRestUpdate {
  method = 'PUT'
  invoke (entity, value, field, baseUrl, alias, queryParams) {
    let body = value
    if (field) {
      body = {}
      body[field] = value
    }
    const options = new ApiRestFetchOptions(this.method, entity.$options.api.headers, JSON.stringify(body))
    return this.call(entity, baseUrl, alias, options, entity.id, queryParams)
  }
}
export class ApiRestDelete extends ApiRestUpdate {
  method = 'DELETE'
  async invoke (entity, baseUrl, alias, queryParams) {
    const options = new ApiRestFetchOptions(this.method, entity.$options.api.headers)
    return await this.call(entity, baseUrl, alias, options, entity.id, queryParams)
  }
}

export class ApiRestHooks extends ApiHooks {
  create (entity, value, field, queryParams) {
    if (ApiHooks.validateEntity(entity) && ApiHooks.validateValue(value)) {
      return new ApiRestPost().invoke(entity, value, field, queryParams)
    }
    return value
  }

  update (entity, value, field, queryParams) {
    if (ApiHooks.validateEntity(entity) && ApiHooks.validateValue(value)) {
      // update
      const { baseUrl, alias } = entity.$options.api
      if (typeof value === 'object') {

        return new ApiRestPut().invoke(entity, value, null, baseUrl, alias, queryParams)
      }
      // update by field
      else {
        return new ApiRestPut().invoke(entity, value, field, baseUrl, alias, queryParams)
      }
    }
    return value
  }

  read (entity, id, queryParams) {
    if (ApiHooks.validateEntity(entity)) {
      return new ApiRestGet().invoke(entity, entity.$options.api.alias, id, null, queryParams)
    }
  }

  delete (entity, queryParams) {
    if (ApiHooks.validateEntity(entity)) {
      return new ApiRestDelete().invoke(entity, queryParams)
    }
  }
}
