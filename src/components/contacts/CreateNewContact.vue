<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'
import RadioButton from 'primevue/radiobutton'

import type { Market } from '@/interfaces/market'
import type { User, Notification } from '@/interfaces/user'
import type { ExternalAccountType } from '@/interfaces/external-account'

import { useGlobalStore } from '@/stores/global'
import { useAuthStore } from '@/stores/auth'
import { axiosHeader, setExternalAccountSelect } from '@/functions'
import { endPoint } from '@/stores/environment'
import { telegramBot } from '@/functions/telegramBot'

import SelectExAccount from '@/components/SelectExAccount.vue'
import PasswordStrength from '@/components/PasswordStrength.vue'

// Global
const store = useGlobalStore()
const authStore = useAuthStore()
const header = axiosHeader()
const required = 'This field is required'
const emit = defineEmits(['updateDialog'])
const props = withDefaults(defineProps<{
    user?: User;
    markets: Market[] | null
    method?: string;
}>(), {
    method: 'add', 
});

// State Form
const passwordScore = ref(null)
const state = ref({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password2: '',
    position: '',
    typeContact: '',
    exAccount: [] as number[],
    market: 0,
    sinnerParty: 'No',
});

// Fill the form if the method is Edit
onMounted(() => {
    console.log(props.user);
    function isExampleEmail(email:string) {
        const domain = "@noemail.com";
        return email.endsWith(domain);
    }

    if(props.user && props.method === 'edit') {
        selectedAccountType.value = props.user.role.id.toString()

        state.value.first_name = props.user.first_name
        state.value.last_name = props.user.last_name
        isExampleEmail(props.user.email) ? '' : state.value.email = props.user.email
        props.user.phone ? state.value.phone = props.user.phone : ''
        props.user.market ? state.value.market = +props.user.market.id : 0
    }
})

// Account Type
const selectedAccountType = ref<string>('')
const resetSelectExAccount = () => {
    selectedExAccount.value = ''
    exAccountKey.value++
}

// External Account Type
const selectedExAccount = ref('')
const exAccountKey = ref(1)
const exAccountType = ref<ExternalAccountType>({
    state: false,
    type: 'single'
})
watch(selectedAccountType, (newType) => {
    const userRole = +newType
    setExternalAccountSelect(userRole, exAccountType.value)
    // const userRole = +newType
    // exAccountType.value.state = false

    // if(userRole && userRole === 6) {
    //     exAccountType.value.state = true
    //     exAccountType.value.type = 'single'
    //     return 
    // }
    // if(userRole && (userRole === 2 || userRole === 3 || userRole === 5)) {
    //     exAccountType.value.state = true
    //     exAccountType.value.type = 'multiselect'
    //     return
    // }
})
function setSelectedExAccount() {
    if (Array.isArray(selectedExAccount.value)) {
        state.value.exAccount = selectedExAccount.value.map(Number); 
    }
    if (typeof selectedExAccount.value === "string" || typeof selectedExAccount.value === "number") {
        state.value.exAccount = [Number(selectedExAccount.value)]; 
    }
}

// Show Hide Password
const handleIconClick = (node:any) => {
    node.props.suffixIcon = node.props.suffixIcon === 'eye' ? 'eyeClosed' : 'eye'
    node.props.type = node.props.type === 'password' ? 'text' : 'password'
}

// Submit Form
const errorMessage = ref<string | null>(null)
const loading = ref<boolean>(false)

const submitHandler = async () => {
    loading.value = true
    let formData = new FormData()

    formData.append('first_name', state.value.first_name)
    formData.append('last_name', state.value.last_name)
    formData.append('email', state.value.email)
    formData.append('phone', state.value.phone)
    formData.append('position', state.value.position)
    formData.append('market_id', state.value.market.toString())
    formData.append('role_id', selectedAccountType.value)
    formData.append('qrcode', 'qrcode')
    formData.append('badge_received', '0')

    if(props.method === 'add') {
        if(state.value.exAccount && state.value.exAccount.length > 0) formData.append('users_external_account', JSON.stringify(state.value.exAccount))
        if(+selectedAccountType.value !== 6) formData.append('password', state.value.password)
    }

    try {

        // If Method is ADD
        if(props.method === 'add') {
            const response = await axios.post(endPoint.users, formData, header)
            if(response && response.data.message) {
                const updateDialogPayload: Notification = {
                    state: true,
                    severity: 'success',
                    group: 'createNewContact',
                    message: 'Contact created successfully',
                };

                setTimeout(() => {
                    emit("updateDialog", updateDialogPayload);
                }, 2000);

                // Send notification to Telegram
                await telegramBot('userCreated', `${state.value.first_name} ${state.value.last_name}`)
            }
        }

        // If Method is Edit
        if(props.method === 'edit' && props.user) {
            const response = await axios.put(`${endPoint.users}/${props.user.reference}`, formData, header)
            if(response && response.data.message) {
                const updateDialogPayload: Notification = {
                    state: true,
                    severity: 'success',
                    group: 'editContact',
                    message: 'Contact edited successfully',
                };

                setTimeout(() => {
                    emit("updateDialog", updateDialogPayload);
                }, 2000);
            }
        }

    } catch (error) {
        console.log(error);
        loading.value = false
        if (axios.isAxiosError(error) && error.response && error.response.data) errorMessage.value = error.response.data.message
    }
}
</script>

<template>
    <FormKit type="form" @submit="submitHandler" :actions="false">
        <div class="grid grid-cols-2 gap-x-3"> 
            
            <template v-if="method === 'add'">
                <div class="form-group">
                    <label class="form-label">Account type</label>
                    <Select 
                        v-model="selectedAccountType" 
                        :options="store.roles" 
                        optionLabel="name" 
                        optionValue="id" 
                        placeholder="Please select a type" 
                        class="w-full"
                        @change="resetSelectExAccount" 
                    />
                </div>
                <div></div>
            </template>

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
            <div class="form-group">
                <FormKit
                    type="text"
                    name="phone"
                    label="Phone number"
                    v-model="state.phone"
                />
            </div>
            <template v-if="method === 'add' && (selectedAccountType && +selectedAccountType !== 6)">
                <div class="form-group">
                    <FormKit
                        type="password"
                        label="Mot de passe"
                        name="password"
                        placeholder="Mot de passe"
                        v-model="state.password"
                        suffix-icon="eyeClosed"
                        @suffix-icon-click="handleIconClick"
                        suffix-icon-class="hover:text-black"
                        validation="required"
                        :validation-messages="{ required: 'Veuillez renseigner un mot de passe valide' }"
                    />
                    <PasswordStrength :password="state.password" v-model="passwordScore" />
                </div>
                <div class="form-group">
                    <FormKit
                        type="password"
                        label="Confirmer le mot de passe"
                        name="password_confirm"
                        placeholder="Mot de passe"
                        v-model="state.password2"
                        suffix-icon="eyeClosed"
                        @suffix-icon-click="handleIconClick"
                        suffix-icon-class="hover:text-black"
                        validation="required|confirm"
                        validation-visibility="dirty"
                        :validation-messages="{ confirm: 'Les mots de passe ne sont pas identiques' }"
                    />
                </div>
            </template>
            <div class="form-group">
                <FormKit
                    type="text"
                    name="title"
                    label="Title"
                    v-model="state.position"
                />
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
            <div v-if="exAccountType.state && method === 'add'" class="form-group">
                <label class="form-label">External Account</label>
                <SelectExAccount :key="exAccountKey" v-model="selectedExAccount" :type="exAccountType.type" @change="setSelectedExAccount" />
            </div>
            <!-- <div class="form-group">
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
            </div> -->
            
            <div v-if="errorMessage" class="col-span-2">
                <Message severity="error">{{ errorMessage }}</Message>
            </div>

            <div class="form-group form-submit !flex-col items-center col-span-2">
                <Button 
                    :label="authStore.isAdmin ? 'Create Contact' : 'Submit for validation'" 
                    :icon="authStore.isAdmin ? '' : 'pi pi-hourglass'"
                    iconPos="right"
                    type="submit"
                    :loading="loading"
                    :disabled="!selectedAccountType" 
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