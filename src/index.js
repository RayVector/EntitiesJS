// Data Types
export {
  arrayItemsPayloadHandler,
  arrayOfItemsValueHandler,
  DataType,
  // dateValueHandler,
  entityPayloadHandler,
  idValueHandler,
  JSONType,
  NumberId,
  types
} from './data-types'
export { default as dataTypes } from './data-types'

// Mock data
export { EntityMock } from './mock-data/EntityMock'

// Utils
export { falsyCheck } from './utils/falsyCheck'
export { typeofCheck } from './utils/typeofCheck'
export { debounce } from './utils/debounce'
export { incrementor } from './utils/incrementor'
export {
  randomString,
  randomNumber,
  randomWords,
  randomBoolean,
  randomArray,
  randomEntity,
  randomWordsList,
  mockDataHooks
} from './utils/randomData'
export {
  deepPopulate,
  deepEmptyPopulate,
  populateSelf
} from './utils/population'

// API RESTFull Hooks
export { ApiRestHooks } from './api/rest/ApiRest'

// API graphQL Hooks
export { ApiGqlHooks } from './api/gql/ApiGQL'

// Entity.js
export {
  Entity,
  EntityApi,
  EntityOptions,
  LoadingStates,
  $entityList,
  $readById,
  $prepare,
  $entityPollingList,
  $setEntityValue,
  $validateEntityApiEnabled,
  $createState
} from './Entity'
