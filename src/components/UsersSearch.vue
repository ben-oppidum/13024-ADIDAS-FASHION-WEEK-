<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useUsers } from '@/composables/useUsers'
import type { UseUsersReturn } from '@/composables/useUsers'
import ProgressSpinner from 'primevue/progressspinner'
import { userSearchDisplay } from '@/functions'
import { useToast } from "primevue/usetoast"

import type { UserSmall } from '@/interfaces/user-small'

// Global
const toast = useToast()
const props = defineProps<{
    guestsList: number[]
}>()

// Get Users 
const { usersSmall: guests, loading: loadingGuests, errorMessage, searchUsers }: UseUsersReturn = useUsers(false)

const searchQuery = ref('');
const filteredGuests = computed(() => {
    if(guests.value) {
        const query = searchQuery.value.toLowerCase();
        return guests.value.filter((guest) => {
        
            const fullName = `${guest.first_name} ${guest.last_name}`.toLowerCase();
            return (
                guest.first_name.toLowerCase().includes(query) ||
                guest.last_name.toLowerCase().includes(query) ||
                fullName.includes(query)
            );
        });
    }
});

// Watch for changes in searchQuery and call fetchUsers each time the query changes
watch(() => searchQuery.value, (newSearchQuery) => {
    setTimeout(async () => {
        if (newSearchQuery.trim() && newSearchQuery.length >= 3) {
            await searchUsers(newSearchQuery.toLowerCase());
        } else {
            guests.value = [];
        }
    }, 1000);
})

//
onMounted(() => loadingGuests.value = false)

// On Checkbox send to parent component
const selectedGuests = ref([])
const emit = defineEmits(['updateSelectedGuests'])

const addGuest = (guest:UserSmall) => {
    if(props.guestsList.includes(guest.id)) {
        toast.add({ severity: 'error', summary: 'Attention', detail: "This guest appair to be already on the list", group: 'guestError', life: 3000 });
        return
    }

    toast.add({ severity: 'success', summary: 'Confirmation', detail: "Guest added to the list", group: 'guestSuccess', life: 3000 });
    emit("updateSelectedGuests", guest);
}

// watch(selectedGuests, (newVal) => {
//     console.log(newVal);
//     emit("updateSelectedGuests", newVal);
// })
</script>

<template>
    <div>
        <div class="mb-3">
            <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by First or Last Name"
                class="form-input"
            />
        </div>
        
        <div v-if="loadingGuests" class="flex items-center justify-between">
            Loading list ...
            <div class="w-5 h-5">
                <ProgressSpinner 
                    style="width: 20px; height: 20px" 
                    strokeWidth="4" 
                    fill="transparent"
                    animationDuration=".5s" 
                />
            </div>
        </div>

        <div v-if="guests" class="space-y-2">
            <div class="flex gap-y-2 flex-col">
                <button 
                    type="button" 
                    class="flex items-center gap-2 group"
                    v-for="guest in filteredGuests" 
                    :key="guest.id"
                    @click="addGuest(guest)"
                >
                    <i class="pi pi-plus text-green-500"></i>
                    <span class="block leading-none group-hover:text-green-500 font-semibold line-clamp-1">{{ guest.id }} - {{ userSearchDisplay(guest) }}</span>
                </button>
            </div>
        </div>

        <div v-else-if="errorMessage" class="text-gray-500">
            {{ errorMessage }}
        </div>

        <Toast position="top-center" group="guestSuccess" />
        <Toast position="top-center" group="guestError" />

    </div>
</template>

<style></style>