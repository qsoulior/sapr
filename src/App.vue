<script setup lang="ts">
import { NConfigProvider, NGlobalStyle, NMessageProvider, NLayout, darkTheme } from "naive-ui";
import RootItem from "@/components/RootItem.vue";
</script>

<template>
  <n-config-provider :theme="darkTheme">
    <n-message-provider>
      <n-layout content-style="padding: 1rem; min-height: 100vh; display: flex; flex-direction: column">
        <root-item />
      </n-layout>
    </n-message-provider>
    <n-global-style />
  </n-config-provider>
</template>

<style>
@import "vfonts/OpenSans.css";
@import "chartist/dist/index.css";

.ct-label {
  color: rgba(255, 255, 255, 0.5);
}

.ct-grid {
  stroke: rgba(255, 255, 255, 0.5);
}

.ct-area {
  fill-opacity: 0.35;
}
</style>
