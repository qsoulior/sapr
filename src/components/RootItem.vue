<script setup lang="ts">
import { ref } from "vue";
import { useMessage, NButton } from "naive-ui";
import type { Bar, Node } from "@/store";
import PreprocessorView from "@/components/PreprocessorView.vue";
import PreprocessorForm from "@/components/PreprocessorForm.vue";
import { calculateComponents } from "@/helpers/processor";

const message = useMessage();

const isShow = ref(false);

const formRef = ref<InstanceType<typeof PreprocessorForm> | null>(null);

const formNodes = ref<Node[]>([]);
const formBars = ref<Bar[]>([]);

async function validate(): Promise<boolean> {
  if (formRef.value === null) return false;
  try {
    const result = await formRef.value.validate();
    formNodes.value = result.nodes;
    formBars.value = result.bars;
    return true;
  } catch (error) {
    if (error instanceof Error) {
      message.error(error.message);
    }
  }
  return false;
}

async function render() {
  const isValid = await validate();
  isShow.value = isValid;
}

async function compute() {
  const isValid = await validate();
  if (isValid) {
    const result = await calculateComponents(formNodes.value, formBars.value);
    console.log(result);
  }
}
</script>

<template>
  <preprocessor-view v-if="isShow" :nodes="formNodes" :bars="formBars" @back="isShow = false" />
  <div v-else style="display: flex; flex-direction: column; gap: 1rem">
    <preprocessor-form ref="formRef" />
    <div style="display: flex; gap: 1rem">
      <n-button tertiary @click="render">Отрисовать стержневую систему</n-button>
      <n-button tertiary @click="compute">Выполнить вычисления</n-button>
      <n-button tertiary @click="formRef?.clear">Очистить</n-button>
    </div>
  </div>
</template>
