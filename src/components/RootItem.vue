<script setup lang="ts">
import { ref } from "vue";
import { useMessage, NButton, NModal, NPopconfirm } from "naive-ui";
import type { Bar, Node } from "@/store";
import PreprocessorView from "@/components/PreprocessorView.vue";
import PreprocessorForm from "@/components/PreprocessorForm.vue";
import PostprocessorSelect from "@/components/PostprocessorSelect.vue";
import PostprocessorTable from "@/components/PostprocessorTable.vue";
import PostprocessorChart from "@/components/PostprocessorChart.vue";
import PostprocessorEpure from "@/components/PostprocessorEpure.vue";
import { computeComponents, type ComputationResult } from "@/helpers/processor";
import { generatePdf } from "@/helpers/pdf";
import { saveFile } from "@/helpers/common";

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

const nodes = ref<Node[]>([]);
const bars = ref<Bar[]>([]);

async function validate(): Promise<boolean> {
  if (formRef.value === null) return false;
  try {
    const result = await formRef.value.validate();
    nodes.value = result.nodes;
    bars.value = result.bars;
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
    const result = await computeComponents(nodes.value, bars.value);
    computationResult.value = result;
    showModal.value = true;
  }
}

const isLoading = ref(false);

async function createPdf() {
  if (computationResult.value === null) return;
  isLoading.value = true;
  const pdf = await generatePdf(nodes.value, bars.value, computationResult.value);
  pdf.getBlob(async (result) => {
    await saveFile([result], "application/pdf", "report.pdf");
    isLoading.value = false;
  });
}

const showConfirm = ref(false);

async function clearForm() {
  await formRef.value?.clear();
  showConfirm.value = false;
}
</script>

<template>
  <preprocessor-view v-if="currentTab === 1" :nodes="nodes" :bars="bars" @back="currentTab = 0" />
  <div v-else-if="currentTab === 0" style="display: flex; flex-direction: column; gap: 1rem; width: fit-content">
    <preprocessor-form ref="formRef" />
    <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1rem">
      <n-button style="flex: auto" tertiary @click="render">???????????????????? ???????????????????? ??????????????</n-button>
      <n-button style="flex: auto" tertiary @click="compute">?????????????????? ????????????????????</n-button>
      <n-popconfirm v-model:show="showConfirm" positive-text="????" negative-text="??????">
        <template #trigger>
          <n-button style="flex: auto" tertiary>????????????????</n-button>
        </template>
        <template #action>
          <n-button tertiary type="error" size="small" @click="clearForm">????</n-button>
          <n-button tertiary size="small" @click="showConfirm = false">??????</n-button>
        </template>
        <template #default> ???? ??????????????, ?????? ???????????? ???????????????? ????????????? </template>
      </n-popconfirm>
    </div>
    <n-modal v-model:show="showModal" preset="card" style="width: 30rem" :auto-focus="false">
      <template #header> ???????????????? ???????????????? </template>
      <template #default>
        <div style="display: flex; flex-direction: column; gap: 1rem">
          <div>?????????????????????????? ?????????????????????? ????????????????????</div>
          <n-button tertiary @click="currentTab = 2">??????????????</n-button>
          <n-button tertiary @click="currentTab = 3">??????????????</n-button>
          <n-button tertiary @click="currentTab = 4">??????????</n-button>
          <postprocessor-select :bars="bars" :computation="computationResult" style="margin-top: 1rem" />
          <div style="margin-top: 1rem">?????????????? ?????????????????????? ????????????????????</div>
          <n-button tertiary @click="createPdf" :loading="isLoading">?????????????????????????? ??????????</n-button>
        </div>
      </template>
    </n-modal>
  </div>
  <postprocessor-table
    v-else-if="currentTab === 2"
    :bars="bars"
    :computation="computationResult"
    @back="currentTab = 0"
  />
  <postprocessor-chart
    v-else-if="currentTab === 3"
    :bars="bars"
    :computation="computationResult"
    @back="currentTab = 0"
  />
  <postprocessor-epure
    v-else-if="currentTab === 4"
    :bars="bars"
    :computation="computationResult"
    @back="currentTab = 0"
  />
</template>
