<script setup lang="ts">
import { ref } from "vue";

import { useTheme } from "vuetify";
import { VBtn, VTextField } from "vuetify/components";

const theme = useTheme();

const value = ref("");
const submittedValue = ref("");

function submit(): void {
  submittedValue.value = value.value;
}
</script>

<template>
  <div>
    <VTextField v-model="value" label="Name" />

    <VBtn @click="submit"> Submit </VBtn>

    <output data-testid="result">
      {{ submittedValue }}
    </output>

    <output data-testid="vuetify-context">
      {{ Boolean(theme) }}
    </output>
  </div>
</template>
