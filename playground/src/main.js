import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import { Entity, EntityOptions } from '../../src'
// import { ApiRestHooks } from '../../src'
import { ApiGqlHooks } from '../../src'

Entity.globalOptions = new EntityOptions({
  api: {
    isEnabled: true, // turn on API
    baseUrl: 'https://graphqlzero.almansi.me/api', // 'https://jsonplaceholder.typicode.com', // base url for all API operations
    watcherEnabled: false, // auto update values to API
    isLoadingStatesEnabled: true // add loading state on each Entity field
  }
})
Entity.apiSchema = new ApiGqlHooks()
// Entity.apiSchema = new ApiRestHooks()

createApp(App).use(store).use(router).mount('#app')
