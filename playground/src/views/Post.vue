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
        <br>
        <label>
          body2
          <input type="text" v-model="fields.body">
        </label>
        <br>
        <br>
        <button @click="state.itemToEdit.update(fields)">
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

let fields = reactive({
  title: null,
  body: null
})

onMounted(async () => {
  state.isPostLoading = true
  const itemId = Number(route.params.id)
  state.itemToEdit = await $readById(Post, itemId)
  fields = state.itemToEdit.createState(fields)
  state.isPostLoading = false
})

</script>
