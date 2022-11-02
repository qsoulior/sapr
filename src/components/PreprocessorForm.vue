<script setup lang="ts">
import { ref } from "vue";
import { NDynamicInput, NButton, NInputNumber, NForm, NFormItem, type FormItemRule, type FormInst } from "naive-ui";
import { Bar, Node, type Form, type Xs } from "@/store";
import PreprocessorStore from "@/components/PreprocessorStore.vue";

const emit = defineEmits<{
  (e: "validate", nodes: Node[], bars: Bar[]): void;
}>();

const formRef = ref<FormInst | null>(null);

const formValue = ref<Form>({
  xr: [],
  xs: [],
  xc: [],
  nb: [],
  qr: [],
  qs: [],
});

const requiredRule: FormItemRule = {
  required: true,
  type: "number",
  message: "Пустое поле",
};

const positiveValidator = (value: number) => value > 0;

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
  message: "Длина стержня равна 0",
  trigger: ["blur"],
});

const xcNumberRule: FormItemRule = {
  validator: (rule: FormItemRule, value: number) => value <= formValue.value.xc.length,
  message: "Такого класса нет",
  trigger: ["blur"],
};

const qrExistsRule: FormItemRule = {
  validator: (rule: FormItemRule, value: number) => formValue.value.qr.filter((q) => q.I == value).length <= 1,
  message: "В узле уже есть силы",
  trigger: ["blur"],
};

const qsExistsRule: FormItemRule = {
  validator: (rule: FormItemRule, value: number) => formValue.value.qs.filter((q) => q.I == value).length <= 1,
  message: "На стержне уже есть нагрузки",
  trigger: ["blur"],
};

const storeRef = ref<InstanceType<typeof PreprocessorStore> | null>(null);

async function getXsBound(xr: number[], xs: Xs[]) {
  return xs.map((value) => {
    const [I, J] = [xr[value.I - 1], xr[value.J - 1]];
    return I < J ? { x1: I, x2: J } : { x1: J, x2: I };
  });
}

async function validate(): Promise<void> {
  await formRef.value?.validate();

  if (formValue.value.xr.length < 2) throw new Error("Конструкция должна содержать хотя бы 2 узла");
  if (formValue.value.xs.length === 0) throw new Error("Конструкция должна содержать хотя бы 1 стержень");
  if (formValue.value.nb.length === 0) throw new Error("Конструкция должна содержать хотя бы 1 опору");
  if (formValue.value.xr.length - 1 > formValue.value.xs.length)
    throw new Error("Конструкция содержит незадействованные узлы");

  const xsBound = await getXsBound(formValue.value.xr, formValue.value.xs);
  xsBound.sort((a, b) => a.x1 - b.x1);
  for (let i = 1; i < xsBound.length; i++) {
    if (xsBound[i].x1 !== xsBound[i - 1].x2) throw new Error("Конструкция задана неправильно");
  }

  const nodes = formValue.value.xr.map((item, index) => new Node(index, formValue.value));
  const bars = formValue.value.xs.map((item, index) => new Bar(index, formValue.value));

  await storeRef.value?.saveLocal();
  emit("validate", nodes, bars);
}
</script>

<template>
  <div>
    <preprocessor-store ref="storeRef" v-model:form="formValue" />
  </div>
  <div style="display: flex; flex-direction: column; gap: 3rem">
    <n-form
      ref="formRef"
      :model="formValue"
      :show-require-mark="false"
      label-placement="left"
      style="display: flex; flex-direction: column; gap: 1rem"
    >
      <div>
        <h3>Узлы и стержни</h3>
        <div style="display: flex; flex-direction: column; gap: 1rem">
          <div>
            <div>Узлы</div>
            <n-dynamic-input v-model:value="formValue.xr" :min="2" item-style="margin-bottom: 0;">
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
            <div>Стержни</div>
            <n-dynamic-input v-model:value="formValue.xs" :min="1" @create="() => ({})" item-style="margin-bottom: 0;">
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
                    <n-input-number
                      v-model:value="value.I"
                      :precision="0"
                      :min="1"
                      placeholder="I"
                      :show-button="false"
                    />
                  </n-form-item>
                  <n-form-item
                    ignore-path-change
                    first
                    :show-label="false"
                    :path="`xs[${index}].J`"
                    :rule="[requiredRule, xrNumberRule, xsLengthRule(value)]"
                  >
                    <n-input-number
                      v-model:value="value.J"
                      :precision="0"
                      :min="1"
                      placeholder="J"
                      :show-button="false"
                    />
                  </n-form-item>
                  <n-form-item
                    ignore-path-change
                    first
                    :show-label="false"
                    :path="`xs[${index}].Ig`"
                    :rule="[requiredRule, xcNumberRule]"
                  >
                    <n-input-number
                      v-model:value="value.Ig"
                      :precision="0"
                      :min="1"
                      placeholder="Ig"
                      :show-button="false"
                    />
                  </n-form-item>
                </div>
              </template>
            </n-dynamic-input>
          </div>
          <div>
            <div>Классы стержней</div>
            <n-dynamic-input v-model:value="formValue.xc" :min="1" @create="() => ({})">
              <template #create-button-default> Добавить классы стержней </template>
              <template #default="{ value, index }">
                <div style="display: flex; gap: 1rem">
                  <n-form-item ignore-path-change :label="`${index + 1}`" :path="`xc[${index}].A`" :rule="requiredRule">
                    <n-input-number
                      v-model:value="value.A"
                      :precision="2"
                      :validator="positiveValidator"
                      placeholder="A"
                      :show-button="false"
                    />
                  </n-form-item>
                  <n-form-item ignore-path-change :show-label="false" :path="`xc[${index}].E`" :rule="requiredRule">
                    <n-input-number
                      v-model:value="value.E"
                      :precision="2"
                      :validator="positiveValidator"
                      placeholder="E"
                      :show-button="false"
                    />
                  </n-form-item>
                  <n-form-item ignore-path-change :show-label="false" :path="`xc[${index}].S`" :rule="requiredRule">
                    <n-input-number
                      v-model:value="value.S"
                      :precision="2"
                      :validator="positiveValidator"
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
        <h3>Опоры, силы и нагрузки</h3>
        <div style="display: flex; flex-direction: column; gap: 1rem">
          <div>
            <div>Жесткие опоры</div>
            <n-dynamic-input v-model:value="formValue.nb" :min="1">
              <template #create-button-default> Добавить жесткие опоры </template>
              <template #default="{ index: index }">
                <n-form-item
                  ignore-path-change
                  :label="`${index + 1}`"
                  :path="`nb[${index}]`"
                  :rule="[requiredRule, xrNumberRule]"
                >
                  <n-input-number
                    v-model:value="formValue.nb[index]"
                    :precision="0"
                    :min="1"
                    placeholder="I"
                    :show-button="false"
                  />
                </n-form-item>
              </template>
            </n-dynamic-input>
          </div>
          <div>
            <div>Сосредоточенные силы</div>
            <n-dynamic-input v-model:value="formValue.qr" @create="() => ({})">
              <template #create-button-default> Добавить сосредоточенные силы </template>
              <template #default="{ value, index }">
                <div style="display: flex; gap: 1rem">
                  <n-form-item
                    ignore-path-change
                    first
                    :label="`${index + 1}`"
                    :path="`qr[${index}].I`"
                    :rule="[requiredRule, xrNumberRule, qrExistsRule]"
                  >
                    <n-input-number
                      v-model:value="value.I"
                      :precision="0"
                      :min="1"
                      placeholder="I"
                      :show-button="false"
                    />
                  </n-form-item>
                  <n-form-item ignore-path-change :show-label="false" :path="`qr[${index}].Fx`" :rule="requiredRule">
                    <n-input-number v-model:value="value.Fx" :precision="2" placeholder="Fx" :show-button="false" />
                  </n-form-item>
                </div>
              </template>
            </n-dynamic-input>
          </div>
          <div>
            <div>Распределенные нагрузки</div>
            <n-dynamic-input v-model:value="formValue.qs" @create="() => ({})">
              <template #create-button-default> Добавить распределенные нагрузки </template>
              <template #default="{ value, index }">
                <div style="display: flex; gap: 1rem">
                  <n-form-item
                    ignore-path-change
                    first
                    :label="`${index + 1}`"
                    :path="`qs[${index}].I`"
                    :rule="[requiredRule, xsNumberRule, qsExistsRule]"
                  >
                    <n-input-number
                      v-model:value="value.I"
                      :precision="0"
                      :min="1"
                      placeholder="I"
                      :show-button="false"
                    />
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
      <div style="display: flex; gap: 1rem">
        <n-button tertiary @click.prevent="validate">Отрисовать стержневую систему</n-button>
        <n-button tertiary @click="storeRef?.clearLocal">Очистить</n-button>
      </div>
    </div>
  </div>
</template>
