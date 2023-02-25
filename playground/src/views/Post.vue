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
        {{ state.itemToEdit.$isApiLoading }} <br>
        {{ state.itemToEdit.$loadingStates.title.$isLoading }} <br>
        <span v-if="state.itemToEdit.$loadingStates.title.$isLoading">loading</span>
        <label>
          title
          <input type="text" v-model="state.itemToEdit.title"> <br>
        </label>
        <br>
        <span v-if="state.itemToEdit.$loadingStates.body.$isLoading">loading</span>
        <label>
          body
          <input type="text" v-model="state.itemToEdit.body">
        </label>
        <br>
        <br>
        <button @click="state.itemToEdit.update()">
          send
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>

import { useRoute } from "vue-router";
import { onMounted, reactive } from "vue";
import Post from "@/entities/Post";
import { $readById } from "../../../src";

const route = useRoute()

const state = reactive({
  isPostLoading: false,
  itemToEdit: null
})

onMounted(async () => {
  state.isPostLoading = true
  const itemId = Number(route.params.id)
  state.itemToEdit = await $readById(Post, itemId)
  state.isPostLoading = false
})

</script>
