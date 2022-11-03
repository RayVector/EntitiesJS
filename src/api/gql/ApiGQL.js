export { ApiMethod, ApiHooks } from '../ApiMethod'

export class ApiGql extends ApiMethod {}

export class ApiGqlPost extends ApiGql {}
export class ApiGqlQueryName extends ApiGql {}

export class ApiGqlHooks extends ApiHooks {
  update () {}
  read () {}
}
