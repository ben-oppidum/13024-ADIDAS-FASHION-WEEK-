<script setup lang="ts">
import MultiSelect from 'primevue/multiselect'

import { useExternalAccount } from '@/composables/useExternalAccount'
import type { UseExternalAccountReturn } from '@/composables/useExternalAccount'
import { useAuthStore } from '@/stores/auth'

// Global
const authStore = useAuthStore()
defineProps<{
    type?: string;
}>()

// Get External Account
// const { externalAccounts, loading }: UseExternalAccountReturn = useExternalAccount(true)
const model = defineModel()
</script>

<template>
    <template v-if="type === 'multiselect'">
        <MultiSelect 
            v-model="model" 
            :options="authStore.externalAccountsSmall || []" 
            :optionLabel="(option) => `${option.label} (${option.market_label})`"
            optionValue="id" 
            filter
            placeholder="Select External Accounts"
            :maxSelectedLabels="3"
            :selectionLimit="5"
            class="w-full"
        />
    </template>
    <template v-else>
        <Select 
            v-model="model" 
            :options="authStore.externalAccountsSmall || []" 
            filter 
            :optionLabel="(option) => `${option.label} (${option.market_label})`" 
            optionValue="id" 
            placeholder="Select an External Account"
            fluid
        />
    </template>
</template>

<style></style>