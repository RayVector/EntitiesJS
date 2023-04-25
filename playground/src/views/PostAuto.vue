<template>
  <div>
    <div v-if="state.isPostLoading">
      ... loading ...
    </div>
    <div v-else>
      Post {{ $route.params.id }}
      <br>
      <br>
      <div v-if="state.itemToEdit !== null">
        <span v-if="state.itemToEdit.$isApiLoading">loading</span>
        <label>
          title
          <input type="text" v-model="state.itemToEdit.title"> <br>
        </label>
        <br>
        <span v-if="state.itemToEdit.$isApiLoading">loading</span>
        <label>
          body
          <input type="text" v-model="state.itemToEdit.body">
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>

import { onMounted, reactive } from "vue"
import { $readById } from '../../../src'
import PostAuto from '@/entities/PostAuto'
import { useRoute } from 'vue-router'

const route = useRoute()

const state = reactive({
  isPostLoading: false,
  itemToEdit: null
})

onMounted(async () => {
  state.isPostLoading = true
  const itemId = Number(route.params.id)
  state.itemToEdit = await $readById(PostAuto, itemId)
  state.isPostLoading = false
})

</script>
