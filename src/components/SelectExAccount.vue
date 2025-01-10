<script setup lang="ts">
import { ref } from 'vue'
import { useExternalAccount } from '@/composables/useExternalAccount'
import type { UseExternalAccountReturn } from '@/composables/useExternalAccount'
import type { ExternalAccount } from '@/interfaces/external-account'

// Get External Account
const { externalAccounts, loading }: UseExternalAccountReturn = useExternalAccount(true)

const model = defineModel()

// const selectedExAccount = ref<ExternalAccount | ''>('')
// const emit = defineEmits(['updateSelectExAccount'])

// const emitExAccount = () => {
//     emit("updateSelectExAccount", selectedExAccount.value)
// }
</script>

<template>
    <Select 
        v-model="model" 
        :options="externalAccounts || []" 
        filter 
        optionLabel="label" 
        optionValue="id" 
        placeholder="External Account"
        :disabled="loading"
        fluid
    />
</template>

<style></style>