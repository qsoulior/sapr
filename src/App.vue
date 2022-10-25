<script setup lang="ts">
import PreprocessorItem from "./components/PreprocessorItem.vue";
import ProcessorItem from "./components/ProcessorItem.vue";
import PostprocessorItem from "./components/PostprocessorItem.vue";
</script>

<template>
  <main style="display: flex; gap: 2rem">
    <PreprocessorItem></PreprocessorItem>
    <ProcessorItem></ProcessorItem>
    <PostprocessorItem></PostprocessorItem>
  </main>
</template>

<style scoped></style>
