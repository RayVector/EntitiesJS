<template>
  <div>
    <div>
      Item
      <br>
      <br>
      <div>
        <label>
          title
          <input type="text" v-model="state.itemToEdit.title"> <br>
        </label>
        <br>
        <label>
          body
          <input type="text" v-model="state.itemToEdit.body">
        </label>
        <br>
        <br>
        <button>
          send
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive } from "vue";
import { $createState } from "../../../src";
import Item from "@/entities/Item";

const state = reactive({
  itemToEdit: $createState(Item)
})

onMounted(() => {
  state.itemToEdit = new Item()
})
</script>
