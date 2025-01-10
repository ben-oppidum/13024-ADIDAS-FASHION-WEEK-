<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useToast } from "primevue/usetoast"

import type { UserSmall } from '@/interfaces/user-small'
import type { Meeting, Guest } from "@/interfaces/meeting"

import { axiosHeader, userSearchDisplay } from '@/functions'
import { telegramBot } from '@/functions/telegramBot'
import { endPoint } from '@/stores/environment'

import UsersSearch from '@/components/UsersSearch.vue'

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
            guestsList1.value.push({
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

const mergedGuestsList = ref<number[]>([]);
const guestsList1 = ref<UserSmall[]>([]);
const mergedGuestsListLength = computed(() => mergedGuestsList.value.length)

// Get Selected Guests from Users Search Component
const getSelectedGuests = (guest:UserSmall) => {
    if(guest) {
        guestsList1.value.push(guest);
        mergedGuestsList.value.push(guest.id)
    }
    
}

// Remove Guest from List
const removeGuest = (selectedId:number) => {
    
    // Update Merged Guests List
    const updateMergedGuestsList = mergedGuestsList.value.filter(id => id !== selectedId)
    mergedGuestsList.value = updateMergedGuestsList 

    const updateGuestList1 = guestsList1.value.filter(guest => guest.id !== selectedId)
    guestsList1.value = updateGuestList1

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
        emit("updateDialog", response.data.message);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response && error.response.data) errorMessage.value = error.response.data.message
    }
}
</script>

<template>
    <div>
        <div class="col-span-2 mb-4 grid grid-cols-2 gap-x-6">
            <h6 class="form-label">Global Internal, Sales</h6>
            <h6 class="form-label">Invited Guests ({{ mergedGuestsListLength }})</h6>

            <div class="guests-wrapper">
                <UsersSearch :guests-list="mergedGuestsList" @update-selected-guests="getSelectedGuests" />
            </div>

            <div class="guests-wrapper">

                <figure>
                    <div class="flex gap-y-2 flex-col">
                        {{ mergedGuestsList }}
                        <button 
                            type="button" 
                            class="flex items-center gap-2 group"
                            v-for="client in guestsList1" 
                            :key="client.id"
                            @click="removeGuest(client.id)"
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