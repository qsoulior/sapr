<script setup lang="ts">
import { ref } from "vue";
import { useMessage, NButton, NModal } from "naive-ui";
import type { Bar, Node } from "@/store";
import PreprocessorView from "@/components/PreprocessorView.vue";
import PreprocessorForm from "@/components/PreprocessorForm.vue";
import PostprocessorSelect from "@/components/PostprocessorSelect.vue";
import { computeComponents, type ComputationResult } from "@/helpers/processor";

const message = useMessage();

const isShow = ref(false);
const showModal = ref(false);

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

const computationResult = ref<ComputationResult | null>(null);

async function compute() {
  const isValid = await validate();
  if (isValid) {
    const result = await computeComponents(formNodes.value, formBars.value);
    computationResult.value = result;
    showModal.value = true;
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
    <n-modal v-model:show="showModal" preset="card" style="width: 30rem" :auto-focus="false">
      <template #header> Выберите операцию </template>
      <template #default>
        <div style="display: flex; flex-direction: column; gap: 1rem">
          <div>Представление результатов вычислений</div>
          <n-button tertiary>Таблицы</n-button>
          <n-button tertiary>Эпюры</n-button>
          <n-button tertiary>Графики</n-button>
          <postprocessor-select :bars="formBars" :computation="computationResult" style="margin-top: 1rem" />
        </div>
      </template>
    </n-modal>
  </div>
</template>
