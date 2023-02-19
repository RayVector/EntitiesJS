import { $validateEntityApiEnabled } from '../index'
import { falsyCheck } from '../utils/falsyCheck'

export class ApiMethod {
  invoke () {
    return true
  }
}

export class ApiHooks {

  /**
   * api and alias should be enabled
   * @param entity
   * @returns {(function(GLenum): GLboolean)|*|boolean}
   */
  static validateEntity (entity) {
    return entity.$options.api.alias && $validateEntityApiEnabled(entity)
  }

  /**
   * allow non-empty values
   * @param value
   * @returns {boolean|number|*}
   */
  static validateValue (value) {
    return falsyCheck(value)
  }

  create () { return true }

  update () { return true }

  read () { return true }

  delete () { return true }
}
