<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { NButton, NUpload, type UploadCustomRequestOptions, type UploadFileInfo, type UploadInst } from "naive-ui";
import type { Form } from "@/store";

const props = defineProps<{
  form: Form;
}>();

const emit = defineEmits<{
  (e: "update:form", form: Form): void;
}>();

const formValue = computed<Form>({
  get() {
    return props.form;
  },
  set(value) {
    emit("update:form", value);
  },
});

onMounted(async () => {
  const form = await loadLocal();
  if (form !== null) formValue.value = form;
});

async function loadLocal(): Promise<Form | null> {
  const formString = localStorage.getItem("form");
  if (formString === null) return null;
  try {
    const form: Form = JSON.parse(formString);
    return form;
  } catch (e) {
    return null;
  }
}

async function saveLocal(): Promise<void> {
  localStorage.setItem("form", JSON.stringify(formValue.value));
}

async function clearLocal(): Promise<void> {
  formValue.value = { xr: [], xs: [], xc: [], nb: [], qr: [], qs: [] };
  localStorage.removeItem("form");
}

async function saveFile(): Promise<void> {
  const blob = new Blob([JSON.stringify(formValue.value)], { type: "application/json" });
  const anchor = document.createElement("a");
  const url = URL.createObjectURL(blob);
  anchor.href = url;
  anchor.download = "form.json";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

const uploadRef = ref<UploadInst | null>(null);

async function handleBeforeUpload({ file }: { file: UploadFileInfo }): Promise<boolean> {
  if (file.file === null || file.file === undefined) return false;
  if (file.file.size > 10 * 1024 * 1024) {
    return false;
  }
  if (file.file.name.length > 100) {
    return false;
  }
  if (file.file.type !== "application/json") {
    return false;
  }
  return true;
}

async function handleCustomRequest({ file, onFinish, onError, onProgress }: UploadCustomRequestOptions): Promise<void> {
  if (file.file === null) {
    onError();
    return;
  }

  const reader = new FileReader();

  reader.onprogress = (ev) => {
    if (ev.lengthComputable) {
      const percent = Math.round((ev.loaded / ev.total) * 100);
      onProgress({ percent });
    }
  };
  reader.onload = () => {
    if (typeof reader.result !== "string") {
      onError();
    } else {
      try {
        const result: Form = JSON.parse(reader.result);
        formValue.value = result;
        onFinish();
        uploadRef.value?.clear();
      } catch (error) {
        if (error instanceof SyntaxError) {
          onError();
        }
      }
    }
  };
  reader.onerror = () => {
    onError();
  };

  reader.readAsText(file.file);
}

defineExpose({
  saveLocal,
  clearLocal,
});
</script>

<template>
  <div style="display: flex; gap: 1rem">
    <n-button tertiary @click="saveFile">Сохранить файл</n-button>
    <n-upload
      ref="uploadRef"
      accept="application/json"
      :max="1"
      :show-file-list="false"
      :custom-request="handleCustomRequest"
      @before-upload="handleBeforeUpload"
    >
      <n-button tertiary>Открыть файл</n-button>
    </n-upload>
  </div>
</template>
