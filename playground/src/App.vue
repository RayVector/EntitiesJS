<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link :to="{ name: 'postAuto', params: { id: 1 } }">Post Auto</router-link> |
    <router-link to="/posts">Posts</router-link> |
    <router-link to="/no-api">No API</router-link>
  </nav>
  <br>
  <router-view/>
</template>
