<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

import type { User, Notification } from '@/interfaces/user'
import type { ExternalAccountType } from '@/interfaces/external-account'

import { endPoint } from '@/stores/environment'
import { axiosHeader, setExternalAccountSelect } from '@/functions'

import SelectExAccount from '@/components/SelectExAccount.vue'

// Global
const header = axiosHeader()
const emit = defineEmits(['updateDialog'])
const props = defineProps<{
    user: User
}>()

const selectedExAccount = ref('')
const actualExternalAccounts = computed(() => props.user && props.user.external_account ? props.user.external_account : null)

const externalAccountLabel = computed(() => {
    if(exAccountType.value.type === 'single') return 'Replace with a new External Account'
    if(exAccountType.value.type === 'multiselect') return 'Add new External Accounts'
})

const exAccountType = ref<ExternalAccountType>({
    state: false,
    type: 'single'
})

onMounted(() => {
    if(props.user) {
        const userRole = +props.user.role.id
        setExternalAccountSelect(userRole, exAccountType.value)
    }
})

function setSelectedExAccount() {
    let exAcc:number[] = []

    if (Array.isArray(selectedExAccount.value)) {
        exAcc = selectedExAccount.value.map(Number); 
    }
    if (typeof selectedExAccount.value === "string" || typeof selectedExAccount.value === "number") {
        exAcc = [Number(selectedExAccount.value)]; 
    }

    return exAcc
}

// Submit
const errorMessage = ref<string | null>(null)
const loading = ref<boolean>(false)

const updateExAccount = async () => {
    loading.value = true
    let formData = new FormData()

    const selectedExAccountArr = setSelectedExAccount()

    formData.append('email', props.user.email)
    formData.append('external_account', JSON.stringify(selectedExAccountArr))

    try {
            const response = await axios.put(endPoint.usersExternalAccount, formData, header)
            console.log(response);
            if(response && response.data.message) {
                const updateDialogPayload: Notification = {
                    state: true,
                    severity: 'success',
                    group: 'editExAccount',
                    message: response.data.message,
                };

                setTimeout(() => {
                    emit("updateDialog", updateDialogPayload);
                }, 2000);
            }
        } catch (error) {
            console.log(error);
            loading.value = false
            if (axios.isAxiosError(error) && error.response && error.response.data) errorMessage.value = error.response.data.message
        }
}
</script>

<template>
    <div class="grid grid-cols-2 gap-x-6">
        <div class="form-group">
            <label class="form-label">Actual External Account</label>
            <template v-if="actualExternalAccounts && actualExternalAccounts.length > 0">
                <div v-for="ex in actualExternalAccounts" :key="ex.id" class="bg-gray-100 border border-gray-200 rounded-sm py-1 px-2 my-2">
                    {{ ex.label }}
                </div>
            </template>
            <template v-else>
                <span class="flex items-center gap-x-2 text-yellow-600 mt-4">
                    <i class="pi pi-info-circle"></i>
                    No External Account found
                </span>
            </template>
        </div>
        <div class="form-group">
            <label class="form-label">{{ externalAccountLabel }}</label>
            <SelectExAccount v-model="selectedExAccount" :type="exAccountType.type" @change="setSelectedExAccount" />
            <div class="mt-3">
                <Button 
                    label="Update External Account"
                    icon="pi pi-pencil"
                    icon-pos="right"
                    fluid
                    :disabled="!selectedExAccount"
                    :loading="loading"
                    @click="updateExAccount"
                />
                <p v-if="exAccountType.type === 'multiselect' && selectedExAccount && actualExternalAccounts && actualExternalAccounts.length > 0" class="mt-2 text-red-600 text-xs flex items-start gap-x-2">
                    <i class="pi pi-info-circle"></i>
                    Updating the external account will remove the previously selected account if it is not re-selected
                </p>
                <Message v-if="errorMessage" severity="error" class="mt-4">{{ errorMessage }}</Message>
            </div>
        </div>
    </div>
</template>

<style></style>