<script setup lang="ts">
import { NInput, NDynamicInput } from "naive-ui";
import { store } from "@/store";
import type { Xs, Xc, Qr, Qs } from "@/store";
import { ref } from "vue";

const xr = ref<number[]>([]);
const xs = ref<Xs[]>([]);
const xc = ref<Xc[]>([]);
const nb = ref<number[]>([]);
const qr = ref<Qr[]>([]);
const qs = ref<Qs[]>([]);
</script>

<template>
  <div>
    <h3>Препроцессор</h3>
    <div>
      <div style="margin-bottom: 5rem">
        <h3>Стержни и узлы (CN)</h3>
        <div>
          <div>
            <div>xr</div>
            <n-dynamic-input v-model:value="xr" placeholder="X">
              <template #create-button-default> Добавить узлы </template>
            </n-dynamic-input>
          </div>
          <div>
            <div>xs</div>
            <n-dynamic-input v-model:value="xs" @create="() => ({})">
              <template #create-button-default> Добавить стержни </template>
              <template #default="{ value }">
                <div style="display: flex; gap: 1rem">
                  <n-input v-model:value="value.I" type="text" placeholder="I" />
                  <n-input v-model:value="value.J" type="text" placeholder="J" />
                  <n-input v-model:value="value.Ig" type="text" placeholder="Ig" />
                </div>
              </template>
            </n-dynamic-input>
          </div>
          <div>
            <div>xc</div>
            <n-dynamic-input v-model:value="xc" @create="() => ({})">
              <template #create-button-default> Добавить классы стержней </template>
              <template #default="{ value }">
                <div style="display: flex; gap: 1rem">
                  <n-input v-model:value="value.L" type="text" placeholder="L" />
                  <n-input v-model:value="value.A" type="text" placeholder="A" />
                  <n-input v-model:value="value.E" type="text" placeholder="E" />
                  <n-input v-model:value="value.S" type="text" placeholder="S" />
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
            <div>nb</div>
            <n-dynamic-input v-model:value="nb" placeholder="I">
              <template #create-button-default> Добавить жесткие опоры </template>
            </n-dynamic-input>
          </div>
          <div>
            <div>qr</div>
            <n-dynamic-input v-model:value="qr" @create="() => ({})">
              <template #create-button-default> Добавить сосредоточенные силы </template>
              <template #default="{ value }">
                <div style="display: flex; gap: 1rem">
                  <n-input v-model:value="value.I" type="text" placeholder="I" />
                  <n-input v-model:value="value.Fx" type="text" placeholder="Fx" />
                </div>
              </template>
            </n-dynamic-input>
          </div>
          <div>
            <div>qs</div>
            <n-dynamic-input v-model:value="qs" @create="() => ({})">
              <template #create-button-default> Добавить распределенные нагрузки </template>
              <template #default="{ value }">
                <div style="display: flex; gap: 1rem">
                  <n-input v-model:value="value.I" type="text" placeholder="I" />
                  <n-input v-model:value="value.Qx" type="text" placeholder="Qx" />
                </div>
              </template>
            </n-dynamic-input>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
