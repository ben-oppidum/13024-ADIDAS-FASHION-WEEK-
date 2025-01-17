<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { useToast } from "primevue/usetoast"

import type { UserSmall } from '@/interfaces/user-small'
import type { Meeting, Guest } from "@/interfaces/meeting"

import { useExternalAccount } from '@/composables/useExternalAccount'
import type { UseExternalAccountReturn } from '@/composables/useExternalAccount'

import { axiosHeader, userSearchDisplay } from '@/functions'
import { telegramBot } from '@/functions/telegramBot'
import { endPoint } from '@/stores/environment'

import UsersSearch from '@/components/UsersSearch.vue'
import SelectExAccount from '@/components/SelectExAccount.vue'

// Global
const header = axiosHeader()
const toast = useToast()
const props = defineProps<{
    meeting: Meeting
    guests: Guest[]
}>()

// Clone Guests Props
const oldGuests = ref<Guest[]>(props.guests)

onMounted(() => {
    if(props.guests) {
        props.guests.forEach((pGuest:Guest) => {
            guestsList2.value.push({
                id: pGuest.user_id,
                user_id: pGuest.user_id,
                first_name: pGuest.first_name,
                last_name: pGuest.last_name,
                role_id: pGuest.role_id,
            })
            mergedGuestsList.value.push(pGuest.user_id)
        });
    }
})

// Get External Account
const { externalAccounts, getExternalAccount }: UseExternalAccountReturn = useExternalAccount(false)

// Selected Organizer
const selectedExAccount = ref<number[]>([])
//const exAccountClients = ref<UserSmall[] | null>(null)

const getExternalClients = async () => {
    await getExternalAccount();

    // Reset Values first
    guestsList1.value = [];

    let clients: UserSmall[] = [];
    const selectedExAccounts = selectedExAccount.value as number[];

    if (externalAccounts.value) {
        externalAccounts.value.forEach(account => {
            if (selectedExAccounts.includes(account.id)) {
                if (account.clients) {
                    account.clients.forEach(client => {
                        if (!clients.some(existingClient => existingClient.id === client.id)) {
                            clients.push(client);
                        }
                    });
                }
            }
        });
    }

    const uniqueClients = Array.from(
        new Map(clients.map(item => [item.user_id, item])).values()
    );

    guestsList1.value = uniqueClients;
};

const guestsList1 = ref<UserSmall[]>([]);
const guestsList2 = ref<UserSmall[]>([]); // Existing from API
const mergedGuestsList = ref<number[]>([]);

const guestsList1Length = computed(() => guestsList1.value && guestsList1.value.length)
const guestsList2Length = computed(() => guestsList2.value.length)
const mergedGuestsListLength = computed(() => mergedGuestsList.value.length)

watch(guestsList1, (newVal) => {
    if(newVal) {
        let newList:number[] = []
        let existingList = guestsList2.value.map(g => g.user_id)

        newVal.forEach(pGuest => {
            newList.push(pGuest.user_id)
        });

        const mergedLists = [...newList, ...existingList]
        mergedGuestsList.value = [...new Set(mergedLists)]
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
    
    // Update Guest List 1
    if(guestList === 2) {
        const updateGuestList2 = guestsList2.value && guestsList2.value.filter(guest => guest.user_id !== selectedId)
        guestsList2.value = updateGuestList2
    }

    toast.add({ severity: 'error', summary: 'Message', detail: 'Guest deleted',  group: `guestDeleted`, life: 3000 });
}


// Update Guest Lists
const errorMessage = ref<string | null>(null)
const emit = defineEmits(['updateDialog'])

const updateGuestList = async () => {
    const oldGuestsIds = oldGuests.value.map(g => g.user_id)

    let formData = new FormData();
    formData.append('meeting_id', props.meeting.meeting_id);
    formData.append('old_guests', JSON.stringify(oldGuestsIds));
    formData.append('new_guests', JSON.stringify(mergedGuestsList.value));

    try {
        const response = await axios.put(`${endPoint.meetings}/${props.meeting.meeting_id}/update-guests`, formData, header)
        emit("updateDialog", 'Guests list updated successfully');
    } catch (error) {
        if (axios.isAxiosError(error) && error.response && error.response.data) errorMessage.value = error.response.data.message
    }
}
</script>

<template>
    <div>
        <div class="col-span-2 mb-4 grid grid-cols-2 gap-x-6">
            <!-- <h6 class="form-label">Global Internal, Sales</h6>
            <h6 class="form-label">Invited Guests ({{ mergedGuestsListLength }})</h6> -->

            <!-- <div class="guests-wrapper">
                <UsersSearch :guests-list="mergedGuestsList" @update-selected-guests="getSelectedGuests" />
            </div> -->

            <div class="guests-wrapper">
                <div>
                    <label class="form-label">Select guests from an External Account</label>
                    <SelectExAccount type="multiselect" v-model="selectedExAccount" @change="getExternalClients" />
                </div>

                <figure v-if="guestsList1">
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
                            <span class="block leading-none group-hover:text-red-500 font-semibold line-clamp-1">{{ client.user_id || client.id }} - {{ userSearchDisplay(client) }}</span>
                        </button>
                    </div>
                </figure>
            </div>

        </div>

        <Message v-if="errorMessage" severity="error">{{ errorMessage }}</Message>

        <div class="form-group form-submit !flex-col items-center">
            <Button label="Update guests list" @click="updateGuestList" />
        </div>

        <Toast position="top-center" group="guestDeleted" />

    </div>
</template>

<style></style>