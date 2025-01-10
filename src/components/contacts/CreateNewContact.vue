<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import RadioButton from 'primevue/radiobutton'

import type { Market } from '@/interfaces/market'
import type { Notification } from '@/interfaces/user'

import { useAuthStore } from '@/stores/auth'
import { axiosHeader } from '@/functions'
import { endPoint } from '@/stores/environment'
import { telegramBot } from '@/functions/telegramBot'

import SelectExAccount from '@/components/SelectExAccount.vue'

// Global
const authStore = useAuthStore()
const header = axiosHeader()
const required = 'This field is required'
const emit = defineEmits(['updateDialog'])
defineProps<{
    markets: Market[] | null
}>()

// State Gorm
const state = ref({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    typeContact: '',
    exAccount: '',
    market: '',
    sinnerParty: 'No',
});

// Account Type
const selectedAccountType = ref<string>('')
const accountsType = ref([
    { name: 'Adidas Team', code: 'adidas' },
    { name: 'External Account', code: 'exAccount' },
]);

// Submit Form
const errorMessage = ref<string | null>(null)
const submitHandler = async () => {
    let formData = new FormData()

    formData.append('first_name', state.value.first_name)
    formData.append('last_name', state.value.last_name)
    formData.append('email', state.value.email)
    formData.append('phone', state.value.phone)
    formData.append('position', state.value.position)
    formData.append('market_id', state.value.market)
    formData.append('role_id', '6')
    formData.append('qrcode', 'qrcode')
    formData.append('badge_received', '0')

    try {
        const response = await axios.post(endPoint.users, formData, header)
        console.log(response);
        if(response && response.data.message) {
            const updateDialogPayload: Notification = {
                state: true,
                severity: 'success',
                group: 'createNewContact',
                message: 'Contact created successfully',
            };
            emit("updateDialog", updateDialogPayload);

            // Send notification to Telegram
            await telegramBot('userCreated', `${state.value.first_name} ${state.value.last_name}`)
        }
    } catch (error) {
        console.log(error);
        if (axios.isAxiosError(error) && error.response && error.response.data) errorMessage.value = error.response.data.message
    }
}
</script>

<template>
    <FormKit type="form" @submit="submitHandler" :actions="false">
        <div class="grid grid-cols-2 gap-x-3"> 
            <div class="form-group">
                <label class="form-label">Account type</label>
                <Select 
                    v-model="selectedAccountType" 
                    :options="accountsType" 
                    optionLabel="name" 
                    optionValue="code" 
                    placeholder="Please select a type" 
                    class="w-full"
                />
            </div>
            <div></div>

            <div class="form-group">
                <FormKit
                    type="text"
                    name="name"
                    label="Name"
                    v-model="state.first_name"
                    validation="required"
                    :validation-messages="{ required }"
                />
            </div>
            <div class="form-group">
                <FormKit
                    type="text"
                    name="surname"
                    label="Surname"
                    v-model="state.last_name"
                    validation="required"
                    :validation-messages="{ required }"
                />
            </div>
            <div class="form-group">
                <FormKit
                    type="email"
                    name="email"
                    label="Email"
                    v-model="state.email"
                    validation="required"
                    :validation-messages="{ required }"
                />
            </div>
            <div v-if="selectedAccountType === 'exAccount'" class="form-group">
                <FormKit
                    type="text"
                    name="phone"
                    label="Phone number"
                    v-model="state.phone"
                />
            </div>
            <div class="form-group">
                <FormKit
                    type="text"
                    name="title"
                    label="Title"
                    v-model="state.position"
                />
            </div>
            <template v-if="selectedAccountType === 'exAccount'">
                <div></div>
                <div class="form-group">
                    <FormKit
                        type="select"
                        name="title"
                        label="Type of contact"
                        v-model="state.typeContact"
                        validation="required"
                        :validation-messages="{ required }"
                    >
                        <option value="" selected disabled>Select a type of contact</option>
                        <option value="1">Ex account 1</option>
                        <option value="1">Ex account 1</option>
                        <option value="1">Ex account 1</option>
                        <option value="1">Ex account 1</option>
                    </FormKit>
                </div>
            </template>
            <div v-if="selectedAccountType === 'adidas'" class="form-group">
                <label class="form-label">External Account</label>
                <SelectExAccount v-model:="state.exAccount" />
            </div>
            <div v-if="markets" class="form-group">
                <FormKit
                    type="select"
                    name="title"
                    label="Market"
                    v-model="state.market"
                    validation="required"
                    :validation-messages="{ required }"
                >
                    <option value="" selected disabled>Select a market</option>
                    <option v-for="market in markets" :key="market.id" :value="market.id">{{ market.label }}</option>
                </FormKit>
            </div>
            <div class="form-group">
                <label class="form-label !mb-3">Sinner Party Invitation</label>
                <div class="flex items-center gap-x-6">
                    <div class="flex items-center gap-2">
                        <RadioButton v-model="state.sinnerParty" inputId="sinnerParty" name="sinnerParty" value="Yes" />
                        <label for="sinnerParty">Yes</label>
                    </div>
                    <div class="flex items-center gap-2">
                        <RadioButton v-model="state.sinnerParty" inputId="sinnerParty" name="sinnerParty" value="No" />
                        <label for="sinnerParty">No</label>
                    </div>
                </div>
            </div>
            
            <div v-if="errorMessage" class="col-span-2">
                <Message severity="error">{{ errorMessage }}</Message>
            </div>

            <div class="form-group form-submit !flex-col items-center col-span-2">
                <Button 
                    :label="authStore.isAdmin ? 'Create external account' : 'Submit for validation'" 
                    :icon="authStore.isAdmin ? '' : 'pi pi-hourglass'"
                    iconPos="right"
                    type="submit" 
                />
                <p v-if="!authStore.isAdmin" class="mt-2 flex items-center justify-center gap-x-2">
                    <i class="pi pi-info-circle"></i>
                    Your request will be sent to an admin for validation
                </p>
            </div>
        </div>
    </FormKit>
</template>

<style></style>