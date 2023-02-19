<template>
  <div>
    <div v-if="state.isPostsLoading">
      ... loading ...
    </div>
    <div v-else>
      <p
          style="cursor: pointer"
          v-for="post in state.postList"
          :key="post.id"
          @click="router.push({ name: 'post', params: { id: post.id } })"
      >
        {{ post.title }}
      </p>
    </div>
  </div>
</template>

<script setup>

import { onMounted, reactive } from "vue";
import Post from "@/entities/Post";
import { useRouter } from "vue-router";
import { $entityList } from "../../../src";

const router = useRouter()

const state = reactive({
  isPostsLoading: false,
  postList: []
})

onMounted(async () => {
  state.isPostsLoading = true
  state.postList = await $entityList(Post)
  state.isPostsLoading = false
})

</script>
