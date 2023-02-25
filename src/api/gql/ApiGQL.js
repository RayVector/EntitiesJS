import { Entity } from "../../Entity";
import { ApiRestFetchOptions } from "../rest/ApiRest";

import { ApiMethod, ApiHooks } from '../ApiMethod'

export class ApiGQLFetchOptions {
  method = 'POST'
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

export class ApiGql extends ApiMethod {
  constructor() {
    super()
  }

  formUrl (extBaseUrl = null) {
    const entityOptionsApi = Entity.globalOptions.api
    return extBaseUrl || entityOptionsApi.baseUrl
  }

  async call (entity, baseUrl, alias, options = null) {
    await entity.changeApiLoadingStatus(true)
    // interceptor
    entity.$loadingController = new AbortController()
    const signal = entity.$loadingController.signal
    const apiOptions = {
      ...options || new ApiRestFetchOptions(),
      signal
    }
    try {
      const res = (await fetch(this.formUrl(baseUrl, alias), apiOptions))
      return await res.json()
    } catch (e) {
      console.error(e)
      return e
    }
  }
}

export class ApiGqlGet extends ApiGql {
  method = 'POST'
  async invoke (entity, baseUrl, alias, id) {
    const { queryParams, queryVariables, aliasForOne } = entity.$options.api.gql
    const body = new ApiGqlQuery().buildQuery(entity, alias, queryParams, queryVariables, id, aliasForOne)
    const options = new ApiGQLFetchOptions(this.method, entity.$options.api.headers, JSON.stringify(body))
    return await this.call(entity, baseUrl, alias, options)
  }
}

export class ApiGqlPost extends ApiGql {
  method = 'POST'
  async invoke (entity, value, field, baseUrl, alias) {
    const { mutationUpdateParams } = entity.$options.api.gql
    const body = new ApiGqlQuery().buildMutation(entity, mutationUpdateParams, { value, field })
    const options = new ApiGQLFetchOptions(this.method, entity.$options.api.headers, JSON.stringify(body))
    return await this.call(entity, baseUrl, alias, options)
  }
}


export class ApiGqlQuery extends ApiGql {
  buildQuery (entity, alias, queryParams, variables, id = null, aliasForOne) {
    const data = Object.keys(entity.$fields).join(' ')
    let queryParamsString = ''
    for (const field in queryParams) {
      queryParamsString += `$${field}: ${queryParams[field]},`
    }
    let aliasOptions = ''
    let mainAlias = alias
    // id
    if (id !== null) {
      mainAlias = aliasForOne
      for (const field in queryParams) {
        aliasOptions = `id: ${Number(id)}`
      }
    } else {
      for (const field in queryParams) {
        aliasOptions += `${field}: $${field}`
      }
    }
    let query = `query (${queryParamsString}) {
          ${mainAlias} (${aliasOptions}) {
            data { ${data} }
          }
        }`
    // id
    if (id !== null) {
      query = `
        query {
          ${mainAlias} (${aliasOptions}) {${data}}
        }
      `
    }
    return {
      operationName: null,
      query,
      variables
    }
  }

  buildMutation (entity, { name, dataType, updateField }, { value, field }) {
    const data = Object.keys(entity.$fields).join(' ')
    const payload = typeof value === 'object' ? value : { [field]: value }
    const variables = {
      id: Number(entity.id),
      [updateField]: payload
    }
    let query = `mutation ($id: ID!, $${updateField}: ${dataType}) {
      ${name} (id: $id, ${updateField}: $${updateField}) {
        ${data}
      }
    }`
    return {
      operationName: null,
      query,
      variables
    }
  }
}

export class ApiGqlHooks extends ApiHooks {
  async read (entity, id = null) {
    if (ApiHooks.validateEntity(entity)) {
      const { baseUrl, alias, gql } = entity.$options.api
      const res = await new ApiGqlGet().invoke(entity, baseUrl, alias, id)
      if (id !== null) {
        return res.data[gql.aliasForOne]
      }
      return res.data[alias].data
    }
  }

  async update (entity, value, field) {
    console.log('update')
    if (ApiHooks.validateEntity(entity)) {
      const { baseUrl, alias, gql } = entity.$options.api
      const res = await new ApiGqlPost().invoke(entity, value, field, baseUrl, alias)
      if (entity.id !== null) {
        return res.data[gql.aliasForOne]
      }
      return res.data[alias].data
    }
  }
}
