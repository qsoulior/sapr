<script setup lang="ts">
import { NDynamicInput, NButton, NInputNumber, NForm, NFormItem } from "naive-ui";
import { store } from "@/store";
import type { Xs, Xc, Qr, Qs } from "@/store";
import { ref } from "vue";

interface Form {
  xr: number[];
  xs: Xs[];
  xc: Xc[];
  nb: number[];
  qr: Qr[];
  qs: Qs[];
}

const formValue = ref<Form>({
  xr: [],
  xs: [],
  xc: [],
  nb: [],
  qr: [],
  qs: [],
});
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 3rem">
    <h3>Препроцессор</h3>
    <n-form :model="formValue" style="display: flex; flex-direction: column; gap: 1rem">
      <div>
        <h3>Стержни и узлы (CN)</h3>
        <div>
          <div>
            <div>Узлы (XR)</div>
            <n-dynamic-input v-model:value="formValue.xr" placeholder="X">
              <template #create-button-default> Добавить узлы </template>
              <template #default="{ index: index }">
                <n-form-item :show-feedback="false" :show-label="false" path="">
                  <n-input-number
                    v-model:value="formValue.xr[index]"
                    :precision="2"
                    placeholder="Fx"
                    :show-button="false"
                  />
                </n-form-item>
              </template>
            </n-dynamic-input>
          </div>
          <div>
            <div>Стержни (XS)</div>
            <n-dynamic-input v-model:value="formValue.xs" @create="() => ({})">
              <template #create-button-default> Добавить стержни </template>
              <template #default="{ value }">
                <div style="display: flex; gap: 1rem">
                  <n-form-item :show-feedback="false" :show-label="false" path="">
                    <n-input-number v-model:value="value.I" :precision="2" placeholder="I" :show-button="false" />
                  </n-form-item>
                  <n-form-item :show-feedback="false" :show-label="false" path="">
                    <n-input-number v-model:value="value.J" :precision="2" placeholder="J" :show-button="false" />
                  </n-form-item>
                  <n-form-item :show-feedback="false" :show-label="false" path="">
                    <n-input-number v-model:value="value.Ig" :precision="2" placeholder="Ig" :show-button="false" />
                  </n-form-item>
                </div>
              </template>
            </n-dynamic-input>
          </div>
          <div>
            <div>Классы стержней (XC)</div>
            <n-dynamic-input v-model:value="formValue.xc" @create="() => ({})">
              <template #create-button-default> Добавить классы стержней </template>
              <template #default="{ value }">
                <div style="display: flex; gap: 1rem">
                  <n-form-item :show-feedback="false" :show-label="false" path="">
                    <n-input-number v-model:value="value.L" :precision="2" placeholder="L" :show-button="false" />
                  </n-form-item>
                  <n-form-item :show-feedback="false" :show-label="false" path="">
                    <n-input-number v-model:value="value.A" :precision="2" placeholder="A" :show-button="false" />
                  </n-form-item>
                  <n-form-item :show-feedback="false" :show-label="false" path="">
                    <n-input-number v-model:value="value.E" :precision="2" placeholder="E" :show-button="false" />
                  </n-form-item>
                  <n-form-item :show-feedback="false" :show-label="false" path="">
                    <n-input-number
                      v-model:value="value.S"
                      :precision="2"
                      placeholder="[&#x03c3;]"
                      :show-button="false"
                    />
                  </n-form-item>
                </div>
              </template>
            </n-dynamic-input>
          </div>
        </div>
      </div>
      <div>
        <h3>Опоры и силы (LD)</h3>
        <div>
          <div>
            <div>Жесткие опоры (NB)</div>
            <n-dynamic-input v-model:value="formValue.nb" placeholder="I">
              <template #create-button-default> Добавить жесткие опоры </template>
              <template #default="{ index: index }">
                <n-form-item :show-feedback="false" :show-label="false" path="">
                  <n-input-number
                    v-model:value="formValue.nb[index]"
                    :precision="2"
                    placeholder="Fx"
                    :show-button="false"
                  />
                </n-form-item>
              </template>
            </n-dynamic-input>
          </div>
          <div>
            <div>Сосредоточенные силы (QR)</div>
            <n-dynamic-input v-model:value="formValue.qr" @create="() => ({})">
              <template #create-button-default> Добавить сосредоточенные силы </template>
              <template #default="{ value }">
                <div style="display: flex; gap: 1rem">
                  <n-form-item :show-feedback="false" :show-label="false" path="">
                    <n-input-number v-model:value="value.I" :precision="2" placeholder="I" :show-button="false" />
                  </n-form-item>
                  <n-form-item :show-feedback="false" :show-label="false" path="">
                    <n-input-number v-model:value="value.Fx" :precision="2" placeholder="Fx" :show-button="false" />
                  </n-form-item>
                </div>
              </template>
            </n-dynamic-input>
          </div>
          <div>
            <div>Распределенные нагрузки (QS)</div>
            <n-dynamic-input v-model:value="formValue.qs" @create="() => ({})">
              <template #create-button-default> Добавить распределенные нагрузки </template>
              <template #default="{ value }">
                <div style="display: flex; gap: 1rem">
                  <n-form-item :show-feedback="false" :show-label="false" path="">
                    <n-input-number v-model:value="value.I" :precision="2" placeholder="I" :show-button="false" />
                  </n-form-item>
                  <n-form-item :show-feedback="false" :show-label="false" path="">
                    <n-input-number v-model:value="value.Qx" :precision="2" placeholder="Qx" :show-button="false" />
                  </n-form-item>
                </div>
              </template>
            </n-dynamic-input>
          </div>
        </div>
      </div>
    </n-form>
    <div>
      <n-button tertiary>Проверить данные</n-button>
    </div>
  </div>
</template>
