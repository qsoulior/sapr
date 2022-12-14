<script setup lang="ts">
import { ref } from "vue";
import { NDynamicInput, NInputNumber, NForm, NFormItem, NTooltip, type FormItemRule, type FormInst } from "naive-ui";
import { Bar, Node, type Form, type Xs } from "@/store";
import PreprocessorStorage from "@/components/PreprocessorStorage.vue";

const maxValue = 1e308;

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
  validator: (rule: FormItemRule, value: number) => formValue.value.xr.filter((x) => x === value).length <= 1,
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
  validator: (rule: FormItemRule, value: number) => value !== xs.I,
  message: "Длина стержня равна 0",
  trigger: ["blur"],
});

const xcNumberRule: FormItemRule = {
  validator: (rule: FormItemRule, value: number) => value <= formValue.value.xc.length,
  message: "Такого класса нет",
  trigger: ["blur"],
};

const qrExistsRule: FormItemRule = {
  validator: (rule: FormItemRule, value: number) => formValue.value.qr.filter((q) => q.I === value).length <= 1,
  message: "В узле уже есть силы",
  trigger: ["blur"],
};

const qsExistsRule: FormItemRule = {
  validator: (rule: FormItemRule, value: number) => formValue.value.qs.filter((q) => q.I === value).length <= 1,
  message: "На стержне уже есть нагрузки",
  trigger: ["blur"],
};

const nbExistsRule: FormItemRule = {
  validator: (rule: FormItemRule, value: number) => formValue.value.nb.filter((nb) => nb === value).length <= 1,
  message: "В узле уже есть опора",
  trigger: ["blur"],
};

const storageRef = ref<InstanceType<typeof PreprocessorStorage> | null>(null);

interface ValidationResult {
  nodes: Node[];
  bars: Bar[];
}

async function validate(): Promise<ValidationResult> {
  try {
    await formRef.value?.validate();
  } catch (e) {
    throw new Error("Данные заданы неверно");
  }

  if (formValue.value.xr.length < 2) {
    throw new Error("Конструкция должна содержать хотя бы 2 узла");
  }
  if (formValue.value.xs.length === 0) {
    throw new Error("Конструкция должна содержать хотя бы 1 стержень");
  }
  if (formValue.value.nb.length === 0) {
    throw new Error("Конструкция должна содержать хотя бы 1 опору");
  }

  if (formValue.value.xr.length - 1 > formValue.value.xs.length) {
    throw new Error("Конструкция содержит незадействованные узлы");
  }

  const nodes = formValue.value.xr.map((item, index) => new Node(index, formValue.value)).sort((a, b) => a.x - b.x);
  const bars = formValue.value.xs
    .map((item, index) => new Bar(index, formValue.value))
    .sort((a, b) => a.start - b.start);

  for (let i = 1; i < bars.length; i++) {
    if (bars[i].start !== bars[i - 1].end) {
      throw new Error("Конструкция задана неправильно");
    }
  }

  await storageRef.value?.saveLocal();
  return { nodes, bars };
}

async function clear(): Promise<void> {
  await storageRef.value?.clearLocal();
}

defineExpose({
  validate,
  clear,
});
</script>

<template>
  <preprocessor-storage ref="storageRef" v-model:form="formValue" />
  <n-form
    ref="formRef"
    :model="formValue"
    :show-require-mark="false"
    label-placement="left"
    style="display: flex; flex-direction: column; gap: 1rem"
  >
    <h3>Узлы и стержни</h3>
    <div>Узлы</div>
    <n-dynamic-input v-model:value="formValue.xr" :min="2" item-style="margin-bottom: 0">
      <template #create-button-default> Добавить узлы </template>
      <template #default="{ index: index }">
        <n-form-item
          first
          ignore-path-change
          :label="`${index + 1}`"
          :path="`xr[${index}]`"
          :rule="[requiredRule, xrExistsRule]"
        >
          <n-tooltip trigger="hover" :delay="300">
            <template #trigger>
              <n-input-number
                v-model:value="formValue.xr[index]"
                :min="-maxValue"
                :max="maxValue"
                :show-button="false"
                placeholder="x"
              />
            </template>
            x
          </n-tooltip>
        </n-form-item>
      </template>
    </n-dynamic-input>
    <div>Стержни</div>
    <n-dynamic-input v-model:value="formValue.xs" :min="1" @create="() => ({})" item-style="margin-bottom: 0">
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
            <n-tooltip trigger="hover" :delay="300">
              <template #trigger>
                <n-input-number v-model:value="value.I" :precision="0" :min="1" placeholder="I" :show-button="false" />
              </template>
              I
            </n-tooltip>
          </n-form-item>
          <n-form-item
            ignore-path-change
            first
            :show-label="false"
            :path="`xs[${index}].J`"
            :rule="[requiredRule, xrNumberRule, xsLengthRule(value)]"
          >
            <n-tooltip trigger="hover" :delay="300">
              <template #trigger>
                <n-input-number v-model:value="value.J" :precision="0" :min="1" placeholder="J" :show-button="false" />
              </template>
              J
            </n-tooltip>
          </n-form-item>
          <n-form-item
            ignore-path-change
            first
            :show-label="false"
            :path="`xs[${index}].Ig`"
            :rule="[requiredRule, xcNumberRule]"
          >
            <n-tooltip trigger="hover" :delay="300">
              <template #trigger>
                <n-input-number
                  v-model:value="value.Ig"
                  :precision="0"
                  :min="1"
                  placeholder="Ig"
                  :show-button="false"
                />
              </template>
              Ig
            </n-tooltip>
          </n-form-item>
        </div>
      </template>
    </n-dynamic-input>
    <div>Классы стержней</div>
    <n-dynamic-input v-model:value="formValue.xc" :min="1" @create="() => ({})" item-style="margin-bottom: 0">
      <template #create-button-default> Добавить классы стержней </template>
      <template #default="{ value, index }">
        <div style="display: flex; gap: 1rem">
          <n-form-item ignore-path-change :label="`${index + 1}`" :path="`xc[${index}].A`" :rule="requiredRule">
            <n-tooltip trigger="hover" :delay="300">
              <template #trigger>
                <n-input-number
                  v-model:value="value.A"
                  :max="maxValue"
                  :validator="positiveValidator"
                  placeholder="A"
                  :show-button="false"
                />
              </template>
              A
            </n-tooltip>
          </n-form-item>
          <n-form-item ignore-path-change :show-label="false" :path="`xc[${index}].E`" :rule="requiredRule">
            <n-tooltip trigger="hover" :delay="300">
              <template #trigger>
                <n-input-number
                  v-model:value="value.E"
                  :max="maxValue"
                  :validator="positiveValidator"
                  placeholder="E"
                  :show-button="false"
                />
              </template>
              E
            </n-tooltip>
          </n-form-item>
          <n-form-item ignore-path-change :show-label="false" :path="`xc[${index}].S`" :rule="requiredRule">
            <n-tooltip trigger="hover" :delay="300">
              <template #trigger>
                <n-input-number
                  v-model:value="value.S"
                  :max="maxValue"
                  :validator="positiveValidator"
                  placeholder="[&#963;]"
                  :show-button="false"
                />
              </template>
              [&#963;]
            </n-tooltip>
          </n-form-item>
        </div>
      </template>
    </n-dynamic-input>
    <h3>Опоры, силы и нагрузки</h3>
    <div>Жесткие опоры</div>
    <n-dynamic-input v-model:value="formValue.nb" :min="1" item-style="margin-bottom: 0">
      <template #create-button-default>Добавить жесткие опоры</template>
      <template #default="{ index: index }">
        <n-form-item
          ignore-path-change
          :label="`${index + 1}`"
          :path="`nb[${index}]`"
          :rule="[requiredRule, xrNumberRule, nbExistsRule]"
        >
          <n-tooltip trigger="hover" :delay="300">
            <template #trigger>
              <n-input-number
                v-model:value="formValue.nb[index]"
                :precision="0"
                :min="1"
                placeholder="I"
                :show-button="false"
              />
            </template>
            I
          </n-tooltip>
        </n-form-item>
      </template>
    </n-dynamic-input>
    <div>Сосредоточенные силы</div>
    <n-dynamic-input v-model:value="formValue.qr" @create="() => ({})" item-style="margin-bottom: 0">
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
            <n-tooltip trigger="hover" :delay="300">
              <template #trigger>
                <n-input-number v-model:value="value.I" :precision="0" :min="1" placeholder="I" :show-button="false" />
              </template>
              I
            </n-tooltip>
          </n-form-item>
          <n-form-item ignore-path-change :show-label="false" :path="`qr[${index}].Fx`" :rule="requiredRule">
            <n-tooltip trigger="hover" :delay="300">
              <template #trigger>
                <n-input-number
                  v-model:value="value.Fx"
                  :min="-maxValue"
                  :max="maxValue"
                  placeholder="F"
                  :show-button="false"
                />
              </template>
              F
            </n-tooltip>
          </n-form-item>
        </div>
      </template>
    </n-dynamic-input>
    <div>Распределенные нагрузки</div>
    <n-dynamic-input v-model:value="formValue.qs" @create="() => ({})" item-style="margin-bottom: 0">
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
            <n-tooltip trigger="hover" :delay="300">
              <template #trigger>
                <n-input-number v-model:value="value.I" :precision="0" :min="1" placeholder="I" :show-button="false" />
              </template>
              I
            </n-tooltip>
          </n-form-item>
          <n-form-item ignore-path-change :show-label="false" :path="`qs[${index}].Qx`" :rule="requiredRule">
            <n-tooltip trigger="hover" :delay="300">
              <template #trigger>
                <n-input-number
                  v-model:value="value.Qx"
                  :min="-maxValue"
                  :max="maxValue"
                  placeholder="q"
                  :show-button="false"
                />
              </template>
              q
            </n-tooltip>
          </n-form-item>
        </div>
      </template>
    </n-dynamic-input>
  </n-form>
</template>
