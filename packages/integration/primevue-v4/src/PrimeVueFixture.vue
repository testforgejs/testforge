<script setup lang="ts">
import { ref } from "vue";

import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { usePrimeVue } from "primevue/config";

const primevue = usePrimeVue();

const value = ref("");
const submittedValue = ref("");

function submit(): void {
  submittedValue.value = value.value;
}
</script>

<template>
  <div>
    <InputText v-model="value" aria-label="Name" />

    <Button label="Submit" @click="submit" />

    <output data-testid="result">
      {{ submittedValue }}
    </output>

    <output data-testid="primevue-config">
      {{ Boolean(primevue.config) }}
    </output>
  </div>
</template>
