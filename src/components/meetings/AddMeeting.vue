<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import { useToast } from "primevue/usetoast"

import { useAreas } from '@/composables/useAreas'
import { useExternalAccount } from '@/composables/useExternalAccount'

import type { UseAreasReturn } from '@/composables/useAreas'
import type { UseExternalAccountReturn } from '@/composables/useExternalAccount'
import type { UserSmall } from '@/interfaces/user-small'
import type { Meeting } from '@/interfaces/meeting'

import { useAuthStore } from '@/stores/auth'
import { checkFormSubmitttion } from '@/functions/meetingPermission'
import { convertToIso, axiosHeader, formatDate, userSearchDisplay } from '@/functions'
import { telegramBot } from '@/functions/telegramBot'
import { endPoint } from '@/stores/environment'

import UsersSearch from '@/components/UsersSearch.vue'
import SelectOrganizer from '@/components/SelectOrganizer.vue'
import SelectExAccount from '@/components/SelectExAccount.vue'

// Global
const authStore = useAuthStore()
const header = axiosHeader()
const toast = useToast()
const props = withDefaults(defineProps<{
    meeting?: Meeting;
    method?: string;
    startDate?: Date;
}>(), {
    method: 'add', 
});

// If StartDate is indicated on Props
onMounted(() => {
    if(props.startDate) {
        state.value.startDate = formatDate(props.startDate, 'YYYY-MM-DD')
        state.value.startHour = formatDate(props.startDate, 'HH:mm')
        state.value.endDate = formatDate(props.startDate, 'YYYY-MM-DD')
    }
})

// Submit Button Label + Icon
const submitButton = computed(() => {
    if(props.method === 'edit') {
        return {
            label: 'Update meeting',
            icon: 'pi pi-pencil'
        }
    }

    if(authStore.isAdmin) {
        return {
            label: 'Create meeting',
            icon: 'pi pi-plus'
        }
    } else {
        return {
            label: 'Submit for validation',
            icon: 'pi pi-hourglass'
        }
    }
})

// Get Areas
const { areas, loading: loadingAreas }: UseAreasReturn = useAreas(true)

// Get External Account
const { externalAccounts, getExternalAccount }: UseExternalAccountReturn = useExternalAccount(false)

// Get External Account Clients
const guestsSelectorKey = ref(0);
const exAccountClients = ref<UserSmall[] | null>(null)
const getExternalClients = async () => {
    await getExternalAccount();

    // Reset Values first
    exAccountClients.value = null;
    mergedGuestsList.value = [];
    guestsList1.value = [];
    guestsList2.value = [];
    guestsSelectorKey.value++;

    let clients: UserSmall[] = [];
    const selectedExAccounts = state.value.externalAccount as number[];

    if (externalAccounts.value) {
        externalAccounts.value.forEach(account => {
            if (selectedExAccounts.includes(account.id)) {
                if (account.clients) {
                    clients.push(...account.clients);
                }
            }
        });
    }

    exAccountClients.value = clients;
};

// const getExternalClients = async () => {
//     await getExternalAccount()

//     // Reser Values first
//     exAccountClients.value = null
//     mergedGuestsList.value = []
//     guestsList1.value = []
//     guestsList2.value = []
//     guestsSelectorKey.value++; 

//     let clients:UserSmall[] = []
//     const selectedExAccount = +state.value.externalAccount

//     externalAccounts.value && externalAccounts.value.forEach(account => {
//         if(account.id === selectedExAccount) account.clients && clients.push(...account.clients)
//     });

//     exAccountClients.value = clients
// }

// Today date
const minDate = '2025-01-20';

// State
const required = 'Required field'
const state = ref({
    title: '',
    area: '',
    organizer: 0,
    externalAccount: [],
    startDate: '',
    startHour: '',
    endDate: '',
    endHour: '',
    guests: [] as number[],
    internalComment: '',
})

const mergedGuestsList = ref<number[]>([]);
const guestsList1 = ref<UserSmall[]>([]);
const guestsList2 = ref<UserSmall[]>([]);

const guestsList1Length = computed(() => guestsList1.value.length)
const guestsList2Length = computed(() => guestsList2.value.length)
const mergedGuestsListLength = computed(() => mergedGuestsList.value.length)

watch(exAccountClients, (newVal) => {
    if(newVal) {
        guestsList1.value = newVal
        newVal.forEach(pGuest => {
            mergedGuestsList.value.push(pGuest.user_id)
        });
    }
})

// Get Selected Guests from Users Search Component
const getSelectedGuests = (guest:UserSmall) => {
    if(guest) {
        guestsList2.value.push(guest);
        mergedGuestsList.value.push(guest.id)
    }
    
}

// Remove Guest from List
const removeGuest = (selectedId:number, guestList:number) => {
    
    // Update Merged Guests List
    const updateMergedGuestsList = mergedGuestsList.value.filter(id => id !== selectedId)
    mergedGuestsList.value = updateMergedGuestsList 

    // Update Guest List 1
    if(guestList === 1) {
        const updateGuestList1 = guestsList1.value.filter(guest => guest.user_id !== selectedId)
        guestsList1.value = updateGuestList1
    }

    // Update Guest List 2
    if(guestList === 2) {
        const updateGuestList2 = guestsList2.value.filter(guest => guest.id !== selectedId)
        guestsList2.value = updateGuestList2
    }

    toast.add({ severity: 'error', summary: 'Message', detail: 'Guest deleted',  group: `guestDeleted`, life: 3000 });
}

// Fill the form if the method is Edit
onMounted(() => {
    if(props.meeting && props.method === 'edit') {
        props.meeting.title ? state.value.title = props.meeting.title : ''
        props.meeting.area_id ? state.value.area = props.meeting.area_id.toString() : ''
        props.meeting.organizer ? state.value.organizer = props.meeting.organizer.id : ''
        
        props.meeting.start_date ? state.value.startDate = formatDate(props.meeting.start_date, 'YYYY-MM-DD') : ''
        props.meeting.start_date ? state.value.startHour = formatDate(props.meeting.start_date, 'HH:mm') : ''
        props.meeting.end_date ? state.value.endDate = formatDate(props.meeting.end_date, 'YYYY-MM-DD') : ''
        props.meeting.end_date ? state.value.endHour = formatDate(props.meeting.end_date, 'HH:mm') : ''

        props.meeting.internal_comment ? state.value.internalComment = props.meeting.internal_comment : ''
    }
})

// Watch All Fields to Allow Submit or not depending of User and his Permissions
const areaMessage = ref<string | null>(null)
watch(state.value, (newState) => {
    if(newState.area && authStore.user) {
        areaMessage.value = checkFormSubmitttion(+newState.area, authStore.user.role_id, newState)
    }
})

// Submit Meeting
const loading = ref<boolean>(false)
const errorMessage = ref<string | null>(null)
const emit = defineEmits(['updateDialog'])

const submitHandler = async () => {
    let formData = new FormData();
    loading.value = true

    const startDateTime = convertToIso(state.value.startDate, state.value.startHour)
    const endDateTime = convertToIso(state.value.startDate, state.value.endHour)

    // Set Organizer 
    const setOrganizer = (): string | number | null => {
        if (authStore.isAdmin) return state.value.organizer;
        return authStore.user?.id || null;
    };

    const acc = state.value.externalAccount[0]

    formData.append('title', state.value.title);
    formData.append('start_date', startDateTime);
    formData.append('end_date', endDateTime);
    formData.append('area_id', state.value.area);
    formData.append('organizer_id', String(setOrganizer() ?? ''));
    if(props.method === 'add') { 
        formData.append('external_account_id', acc);
        formData.append('guests', JSON.stringify(mergedGuestsList.value)) 
    }
    formData.append('internal_comment', state.value.internalComment);

    try {
        // If Method is ADD
        if(props.method === 'add') {
            const response = await axios.post(endPoint.meetings, formData, header)
            if(response.data && response.data.message) {
                setTimeout(async () => {

                    emit("updateDialog", response.data.message);
                    const meetingId = response.data.meeting_id

                    // Send Notificatio To Telegram
                    authStore.isAdmin ? await telegramBot('meetingCreated', meetingId) : await telegramBot('meetingNeedApproval', meetingId)

                }, 2000);
            }
        }

        // If Method is EDIT
        if(props.method === 'edit' && props.meeting) {
            const meetingId = props.meeting.meeting_id
            const response = await axios.put(`${endPoint.meetings}/${meetingId}/edit`, formData, header)
            if(response.data && response.data.message) {
                setTimeout(async () => {
                    
                    emit("updateDialog", response.data.message);

                    // Send Notificatio To Telegram
                    await telegramBot('meetingEdited', meetingId)

                }, 2000);
            }
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response && error.response.data) errorMessage.value = error.response.data.message
        loading.value = false
    } 
}
</script>

<template>   
    <FormKit type="form" @submit="submitHandler" :actions="false">
        <div class="grid grid-cols-2 gap-x-3">
            <div class="form-group">
                <FormKit
                    type="text"
                    name="title"
                    label="Title"
                    placeholder="Title"
                    v-model="state.title"
                />
            </div>
            <div class="form-group">
                <FormKit
                    type="select"
                    name="area"
                    label="Area"
                    v-model="state.area"
                    validation="required"
                    :validation-messages="{ required }"
                >
                    <option value="" selected disabled>{{ `${loadingAreas ? 'Loading ...' : 'Select an Area'}` }}</option>
                    <option v-for="area in areas" :key="area.id" :value="area.id">{{ area.label }}</option>
                </FormKit>
            </div>

            <template v-if="authStore.isAdmin">
                <div class="form-group">
                    <label class="form-label">Organizer</label>
                    <SelectOrganizer v-model="state.organizer" />
                </div>
                <div></div>
            </template>

            <template v-if="method === 'add'">
                <div class="guests-wrapper">
                    <div>
                        <label class="form-label">Select guests from an External Account</label>
                        <SelectExAccount type="multiselect" v-model="state.externalAccount" @change="getExternalClients" />
                    </div>

                    <!-- My clients [List 1] -->
                    <figure v-if="exAccountClients">
                        <span class="font-semibold block text-black pb-1 mb-3 border-b border-gray-300">Invited Guests ({{ guestsList1Length }})</span>
                        <div class="flex gap-y-2 flex-col">
                            <button 
                                type="button" 
                                class="flex items-center gap-2 group"
                                v-for="client in guestsList1" 
                                :key="client.id"
                                @click="removeGuest(client.user_id, 1)"
                            >
                                <i class="pi pi-trash text-red-500"></i>
                                <span class="block leading-none group-hover:text-red-500 font-semibold line-clamp-1">{{ client.user_id }} - {{ userSearchDisplay(client) }}</span>
                            </button>
                        </div>
                    </figure>
                </div>

                <div class="guests-wrapper">
                    <div>
                        <span class="font-semibold block text-black pb-1">Select a guest</span>
                        <UsersSearch :guests-list="mergedGuestsList" @update-selected-guests="getSelectedGuests" />
                    </div>

                    <!-- Added Guest [List 2] -->
                    <figure>
                        <span class="font-semibold block text-black pb-1 mb-3 border-b border-gray-300">Added guests ({{ guestsList2Length }})</span>
                        <div class="flex gap-y-2 flex-col">
                            <button 
                                type="button" 
                                class="flex items-center gap-2 group"
                                v-for="client in guestsList2" 
                                :key="client.id"
                                @click="removeGuest(client.id, 2)"
                            >
                                <i class="pi pi-trash text-red-500"></i>
                                <span class="block leading-none group-hover:text-red-500 font-semibold line-clamp-1">{{ client.id }} - {{ userSearchDisplay(client) }}</span>
                            </button>
                        </div>
                    </figure>
                </div>

                <div class="col-span-2 text-gray-500 text-xs -mt-2 mb-4">Total guests : {{ mergedGuestsListLength }}</div>

                <Toast position="top-center" group="guestDeleted" />

            </template>

            <div class="form-group">
                <FormKit
                    type="date"
                    name="startDate"
                    label="Date"
                    v-model="state.startDate"
                    :validation="`required|date_after_or_equal:${minDate}`"
                    :validation-messages="{ 
                        required,
                        date_after_or_equal: 'Date must be after or equal 20 January 2025'
                    }"
                />
            </div>
            <div class="grid grid-cols-2 gap-x-3">
                <div class="form-group">
                    <FormKit
                        type="time"
                        name="startHour"
                        label="From"
                        v-model="state.startHour"
                        validation="required"
                        :validation-messages="{ required }"
                    />
                </div>
                <div class="form-group">
                    <FormKit
                        type="time"
                        name="endHour"
                        label="To"
                        v-model="state.endHour"
                        validation="required"
                        :validation-messages="{ required }"
                    />
                </div>
            </div>
            <div class="form-group">
                <FormKit
                    type="textarea"
                    name="internalComment"
                    label="Internal comment"
                    placeholder="Type your comment here"
                    v-model="state.internalComment"
                    outer-class="textarea-small"
                />
            </div>
        </div>

        <Message v-if="areaMessage" severity="warn" class="mt-3">{{ areaMessage }}</Message>
        <Message v-if="errorMessage" severity="error">{{ errorMessage }}</Message>

        <div class="form-group form-submit !flex-col items-center">
            <Button 
                :label="submitButton.label" 
                :icon="submitButton.icon"
                iconPos="right"
                type="submit" 
                :loading="loading"
            />
            <p v-if="!authStore.isAdmin" class="mt-2 flex items-center justify-center gap-x-2">
                <i class="pi pi-info-circle"></i>
                Your request will be sent to an admin for validation
            </p>
        </div>
    </FormKit>
</template>

<style>
.slide-fade-enter-active {
    transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateY(20px);
    opacity: 0;
}

.guests-wrapper { @apply border border-gray-200 p-2 mb-3 rounded-md flex flex-col gap-y-1 h-[300px] overflow-y-scroll space-y-3 }
</style>