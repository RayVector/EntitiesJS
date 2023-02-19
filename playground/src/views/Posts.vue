<template>
  <div>
    <p
      style="cursor: pointer"
      v-for="post in state.postList"
      :key="post.id"
      @click="router.push({ name: 'post', params: { id: post.id } })"
    >
      {{ post.title }}
    </p>
  </div>
</template>

<script setup>

import { onMounted, reactive } from "vue";
import Post from "@/entities/Post";
import { useRouter } from "vue-router";
import { $entityList } from "../../../src/Entity";

const router = useRouter()

const state = reactive({
  postList: []
})

onMounted(async () => {
  state.postList = await $entityList(Post)
})

</script>
