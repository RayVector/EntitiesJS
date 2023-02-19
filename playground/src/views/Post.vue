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
        <input type="text" v-model="state.itemToEdit.title"> <br>
        <br>
        <input type="text" v-model="fields.title"> <br>
        <br>
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
  title: ''
})

onMounted(async () => {
  state.isPostLoading = true
  const itemId = Number(route.params.id)
  const item = await $readById(Post, itemId)
  state.itemToEdit = item
  fields = item.createState(fields)
  state.isPostLoading = false
})

</script>
