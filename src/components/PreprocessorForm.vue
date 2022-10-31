<script setup lang="ts">
import { ref } from "vue";
import { NDynamicInput, NButton, NInputNumber, NForm, NFormItem, type FormItemRule, type FormInst } from "naive-ui";
import { Bar, Node, type Form, type Xs } from "@/store";

const emit = defineEmits<{
  (e: "validate", nodes: Node[], bars: Bar[]): void;
}>();

const formRef = ref<FormInst | null>(null);

const formValue = ref<Form>({
  xr: [0, 3, 7],
  xs: [
    { I: 1, J: 2, Ig: 1 },
    { I: 2, J: 3, Ig: 2 },
  ],
  xc: [
    { A: 2, E: 5, S: 5 },
    { A: 3, E: 5, S: 5 },
  ],
  nb: [1, 3],
  qr: [
    { I: 1, Fx: -20 },
    { I: 2, Fx: -50 },
    { I: 3, Fx: 20 },
  ],
  qs: [{ I: 1, Qx: 30 }],
});

const requiredRule: FormItemRule = {
  required: true,
  type: "number",
  message: "Пустое поле",
};

const xrExistsRule: FormItemRule = {
  validator: (rule: FormItemRule, value: number) => formValue.value.xr.filter((x) => x == value).length <= 1,
  message: "Такой узел уже существует",
  trigger: ["blur"],
};

const xrNumberRule: FormItemRule = {
  validator: (rule: FormItemRule, value: number) => value <= formValue.value.xr.length,
  message: "Такого узла нет",
  trigger: ["blur"],
};

const xsNumberRule: FormItemRule = {
  validator: (rule: FormItemRule, value: number) => value <= formValue.value.xs.length,
  message: "Такого стержня нет",
  trigger: ["blur"],
};

const xsLengthRule = (xs: Xs): FormItemRule => ({
  validator: (rule: FormItemRule, value: number) => value != xs.I,
  message: "Длина стержня = 0",
  trigger: ["blur"],
});

const xcNumberRule: FormItemRule = {
  validator: (rule: FormItemRule, value: number) => value <= formValue.value.xc.length,
  message: "Такого класса нет",
  trigger: ["blur"],
};

async function validate() {
  if (formValue.value.xr.length === 0) throw new Error("xr is empty");
  await formRef.value?.validate();
  const nodes = formValue.value.xr.map((item, index) => new Node(index, formValue.value));
  const bars = formValue.value.xs.map((item, index) => new Bar(index, formValue.value));
  emit("validate", nodes, bars);
}

defineExpose({
  validate,
});
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 3rem">
    <n-form
      ref="formRef"
      :model="formValue"
      :show-require-mark="false"
      label-placement="left"
      style="display: flex; flex-direction: column; gap: 1rem"
    >
      <div>
        <h3>Стержни и узлы (CN)</h3>
        <div style="display: flex; flex-direction: column; gap: 1rem">
          <div>
            <div>Узлы (XR)</div>
            <n-dynamic-input v-model:value="formValue.xr" item-style="margin-bottom: 0;">
              <template #create-button-default> Добавить узлы </template>
              <template #default="{ index: index }">
                <n-form-item
                  first
                  ignore-path-change
                  :label="`${index + 1}`"
                  :path="`xr[${index}]`"
                  :rule="[requiredRule, xrExistsRule]"
                >
                  <n-input-number
                    v-model:value="formValue.xr[index]"
                    :precision="2"
                    :show-button="false"
                    placeholder="x"
                  />
                </n-form-item>
              </template>
            </n-dynamic-input>
          </div>
          <div>
            <div>Стержни (XS)</div>
            <n-dynamic-input v-model:value="formValue.xs" @create="() => ({})" item-style="margin-bottom: 0;">
              <template #create-button-default> Добавить стержни </template>
              <template #default="{ value, index }">
                <div style="display: flex; gap: 1rem">
                  <n-form-item
                    ignore-path-change
                    first
                    :label="`${index + 1}`"
                    :path="`xs[${index}].I`"
                    :rule="[requiredRule, xrNumberRule]"
                  >
                    <n-input-number v-model:value="value.I" :min="1" placeholder="I" :show-button="false" />
                  </n-form-item>
                  <n-form-item
                    ignore-path-change
                    first
                    :show-label="false"
                    :path="`xs[${index}].J`"
                    :rule="[requiredRule, xrNumberRule, xsLengthRule(value)]"
                  >
                    <n-input-number v-model:value="value.J" :min="1" placeholder="J" :show-button="false" />
                  </n-form-item>
                  <n-form-item
                    ignore-path-change
                    first
                    :show-label="false"
                    :path="`xs[${index}].Ig`"
                    :rule="[requiredRule, xcNumberRule]"
                  >
                    <n-input-number v-model:value="value.Ig" :min="1" placeholder="Ig" :show-button="false" />
                  </n-form-item>
                </div>
              </template>
            </n-dynamic-input>
          </div>
          <div>
            <div>Классы стержней (XC)</div>
            <n-dynamic-input v-model:value="formValue.xc" @create="() => ({})">
              <template #create-button-default> Добавить классы стержней </template>
              <template #default="{ value, index }">
                <div style="display: flex; gap: 1rem">
                  <n-form-item ignore-path-change :label="`${index + 1}`" :path="`xc[${index}].A`" :rule="requiredRule">
                    <n-input-number
                      v-model:value="value.A"
                      :precision="2"
                      :min="0"
                      placeholder="A"
                      :show-button="false"
                    />
                  </n-form-item>
                  <n-form-item ignore-path-change :show-label="false" :path="`xc[${index}].E`" :rule="requiredRule">
                    <n-input-number
                      v-model:value="value.E"
                      :precision="2"
                      :min="0"
                      placeholder="E"
                      :show-button="false"
                    />
                  </n-form-item>
                  <n-form-item ignore-path-change :show-label="false" :path="`xc[${index}].S`" :rule="requiredRule">
                    <n-input-number
                      v-model:value="value.S"
                      :precision="2"
                      :min="0"
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
        <div style="display: flex; flex-direction: column; gap: 1rem">
          <div>
            <div>Жесткие опоры (NB)</div>
            <n-dynamic-input v-model:value="formValue.nb">
              <template #create-button-default> Добавить жесткие опоры </template>
              <template #default="{ index: index }">
                <n-form-item
                  ignore-path-change
                  :label="`${index + 1}`"
                  :path="`nb[${index}]`"
                  :rule="[requiredRule, xrNumberRule]"
                >
                  <n-input-number v-model:value="formValue.nb[index]" :min="1" placeholder="I" :show-button="false" />
                </n-form-item>
              </template>
            </n-dynamic-input>
          </div>
          <div>
            <div>Сосредоточенные силы (QR)</div>
            <n-dynamic-input v-model:value="formValue.qr" @create="() => ({})">
              <template #create-button-default> Добавить сосредоточенные силы </template>
              <template #default="{ value, index }">
                <div style="display: flex; gap: 1rem">
                  <n-form-item
                    ignore-path-change
                    first
                    :label="`${index + 1}`"
                    :path="`qr[${index}].I`"
                    :rule="[requiredRule, xrNumberRule]"
                  >
                    <n-input-number v-model:value="value.I" :min="1" placeholder="I" :show-button="false" />
                  </n-form-item>
                  <n-form-item ignore-path-change :show-label="false" :path="`qr[${index}].Fx`" :rule="requiredRule">
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
              <template #default="{ value, index }">
                <div style="display: flex; gap: 1rem">
                  <n-form-item
                    ignore-path-change
                    first
                    :label="`${index + 1}`"
                    :path="`qs[${index}].I`"
                    :rule="[requiredRule, xsNumberRule]"
                  >
                    <n-input-number v-model:value="value.I" :min="1" placeholder="I" :show-button="false" />
                  </n-form-item>
                  <n-form-item ignore-path-change :show-label="false" :path="`qs[${index}].Qx`" :rule="requiredRule">
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
      <n-button tertiary @click.prevent="validate">Отрисовать стержневую систему</n-button>
      <n-button tertiary @click.prevent="validate">Сохранить файл</n-button>
    </div>
  </div>
</template>
