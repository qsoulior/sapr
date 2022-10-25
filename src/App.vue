<script setup lang="ts">
import { NConfigProvider, NGlobalStyle, darkTheme } from "naive-ui";

import PreprocessorItem from "@/components/PreprocessorItem.vue";
import ProcessorItem from "@/components/ProcessorItem.vue";
import PostprocessorItem from "@/components/PostprocessorItem.vue";
</script>

<template>
  <n-config-provider :theme="darkTheme">
    <main style="display: flex; flex-direction: column; gap: 2rem">
      <preprocessor-item></preprocessor-item>
      <!-- <processor-item></processor-item> -->
      <!-- <postprocessor-item></postprocessor-item> -->
    </main>
    <n-global-style />
  </n-config-provider>
</template>

<style scoped></style>
