<script setup lang="ts">
import { ref } from "vue";
import PreprocessorView from "@/components/PreprocessorView.vue";
import PreprocessorForm from "@/components/PreprocessorForm.vue";
import type { Bar, Node } from "@/store";
import { useProcessor } from "@/composables/processor";

const isShow = ref(false);

const formNodes = ref<Node[]>([]);
const formBars = ref<Bar[]>([]);

function handleValidate(nodes: Node[], bars: Bar[]) {
  formNodes.value = nodes;
  formBars.value = bars;

  const processor = useProcessor(formNodes.value, formBars.value);
  isShow.value = true;
}
</script>

<template>
  <preprocessor-view v-if="isShow" :nodes="formNodes" :bars="formBars" @back="isShow = false" />
  <preprocessor-form v-else @validate="handleValidate" />
</template>
