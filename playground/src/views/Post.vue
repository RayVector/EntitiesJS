<template>
  <div>
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
</template>

<script setup>

import { useRoute } from "vue-router";
import { onMounted, reactive } from "vue";
import Post from "@/entities/Post";

const route = useRoute()

const state = reactive({
  itemToEdit: null
})

let fields = reactive({
  title: ''
})

onMounted(async () => {
  const itemId = Number(route.params.id)
  const item = await Post.readById(itemId)
  state.itemToEdit = item
  fields = item.createState(fields)
})

</script>
