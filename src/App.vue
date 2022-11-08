<script setup lang="ts">
import { ref } from "vue";
import { NConfigProvider, NGlobalStyle, NMessageProvider, NLayout, NLayoutContent, darkTheme } from "naive-ui";

import PreprocessorItem from "@/components/PreprocessorItem.vue";
import ProcessorItem from "@/components/ProcessorItem.vue";
import PostprocessorItem from "@/components/PostprocessorItem.vue";

const tabs = new Map([
  ["preprocessor", PreprocessorItem],
  ["processor", ProcessorItem],
  ["postprocessor", PostprocessorItem],
]);

const currentTab = ref("preprocessor");
</script>

<template>
  <n-config-provider :theme="darkTheme">
    <n-message-provider>
      <n-layout content-style="padding: 1rem;">
        <component :is="tabs.get(currentTab)" />
      </n-layout>
    </n-message-provider>
    <n-global-style />
  </n-config-provider>
</template>

<style scoped>
.container {
}
</style>
