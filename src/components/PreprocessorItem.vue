<script setup lang="ts">
import { ref } from "vue";
import PreprocessorView from "@/components/PreprocessorView.vue";
import PreprocessorForm from "@/components/PreprocessorForm.vue";
import type { Bar } from "@/store";
const isShow = ref(false);

const formBars = ref<Bar[]>([]);

function handleValidate(bars: Bar[]) {
  formBars.value = bars;
  isShow.value = true;
}
</script>

<template>
  <div>
    <h3>Препроцессор</h3>
    <preprocessor-view v-if="isShow" :bars="formBars" @back="isShow = false" />
    <preprocessor-form v-else @validate="handleValidate" />
  </div>
</template>
