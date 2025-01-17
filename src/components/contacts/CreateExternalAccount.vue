<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import { useToast } from "primevue/usetoast"

import type { Market } from '@/interfaces/market'

import { useAuthStore } from '@/stores/auth'
import { axiosHeader } from '@/functions'
import { endPoint } from '@/stores/environment'

// Global
const authStore = useAuthStore()
const header = axiosHeader()
const toast = useToast()
const props = defineProps<{
    markets: Market[] | null
}>()

// Check Existing External Account
const isExistingExAccount = ref<boolean>(false) 
function checkExistingExAccount() {
    if(authStore.externalAccountsSmall) {
        const isExisting = authStore.externalAccountsSmall.some(item => item.label.toLocaleLowerCase() === state.value.exAccount.toLowerCase());
        return isExistingExAccount.value = isExisting
    }

    return isExistingExAccount.value = false
}

// State Gorm
const errorMessage = ref<string | null>(null)
const loading = ref<boolean>(false)
const emit = defineEmits(['updateDialog'])

const state = ref({
    exAccount: '',
    market: '',
});

const submitHandler = async () => {
    let formData = new FormData();
    loading.value = true

    formData.append('label', state.value.exAccount);
    formData.append('market_id', state.value.market);

    try {
        const response = await axios.post(endPoint.externalAccount, formData, header)
        errorMessage.value = null
        toast.add({ severity: 'success', summary: 'Confirmation', detail: response.data.message, group: 'successMessage', life: 3000 });
        
        setTimeout(() => {
            emit("updateDialog", true);
        }, 3000);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response && error.response.data) errorMessage.value = error.response.data.message
        loading.value = false
    }
}
</script>

<template>
    <div class="grid grid-cols-2 gap-x-3">
        <div class="form-group">
            <label class="form-label">External Account</label>
            <InputText 
                v-model="state.exAccount"
                name="exAccount" 
                type="text" 
                placeholder="Choose a title" 
                fluid 
                @input="checkExistingExAccount"
            />
            <p v-if="isExistingExAccount" class="text-red-500 font-semibold mt-2">Be careful: This external account already exists</p>
        </div>
        <div v-if="markets" class="form-group">
            <label class="form-label">Market</label>
            <Select 
                v-model="state.market" 
                :options="markets" 
                optionLabel="label"
                optionValue="id" 
                placeholder="Select a market" 
                class="w-full" 
            />
        </div>
        <div class="form-group form-submit !flex-col items-center col-span-2">
            <Message v-if="errorMessage" severity="error" class="mb-4">{{ errorMessage }}</Message>

            <Button 
                :label="authStore.isAdmin ? 'Create external account' : 'Submit for validation'" 
                :icon="authStore.isAdmin ? '' : 'pi pi-hourglass'"
                iconPos="right"
                type="submit" 
                :disabled="state.exAccount === '' || state.market === '' || isExistingExAccount"
                :loading="loading"
                @click="submitHandler"
            />
            <p v-if="!authStore.isAdmin" class="mt-2 flex items-center justify-center gap-x-2">
                <i class="pi pi-info-circle"></i>
                Your request will be sent to an admin for validation
            </p>
        </div>

        <Toast position="top-center" group="successMessage" />

    </div>
</template>

<style></style>