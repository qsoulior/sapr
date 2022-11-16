<script setup lang="ts">
import { ref } from "vue";
import { useMessage, NButton, NModal } from "naive-ui";
import type { Bar, Node } from "@/store";
import PreprocessorView from "@/components/PreprocessorView.vue";
import PreprocessorForm from "@/components/PreprocessorForm.vue";
import PostprocessorSelect from "@/components/PostprocessorSelect.vue";
import PostprocessorTable from "@/components/PostprocessorTable.vue";
import PostprocessorChart from "@/components/PostprocessorChart.vue";
import PostprocessorEpure from "@/components/PostprocessorEpure.vue";
import { computeComponents, type ComputationResult } from "@/helpers/processor";

const message = useMessage();

enum Tab {
  PreprocessorForm,
  PreprocessorView,
  PostprocessorTable,
  PostprocessorChart,
  PostprocessorEpure,
}

const currentTab = ref(Tab.PreprocessorForm);
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
  if (isValid) currentTab.value = Tab.PreprocessorView;
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
  <preprocessor-view v-if="currentTab === 1" :nodes="formNodes" :bars="formBars" @back="currentTab = 0" />
  <div v-else-if="currentTab === 0" style="display: flex; flex-direction: column; gap: 1rem">
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
          <n-button tertiary @click="currentTab = 2">Таблицы</n-button>
          <n-button tertiary @click="currentTab = 3">Графики</n-button>
          <n-button tertiary @click="currentTab = 4">Эпюры</n-button>
          <postprocessor-select :bars="formBars" :computation="computationResult" style="margin-top: 1rem" />
        </div>
      </template>
    </n-modal>
  </div>
  <postprocessor-table
    v-else-if="currentTab === 2"
    :bars="formBars"
    :computation="computationResult"
    @back="currentTab = 0"
  />
  <postprocessor-chart
    v-else-if="currentTab === 3"
    :bars="formBars"
    :computation="computationResult"
    @back="currentTab = 0"
  />
  <postprocessor-epure
    v-else-if="currentTab === 4"
    :bars="formBars"
    :computation="computationResult"
    @back="currentTab = 0"
  />
</template>
