<script setup lang="ts">
import { computed } from 'vue'
import { useConfirm } from "primevue/useconfirm"

import { useAuthStore } from '@/stores/auth'
import { getExternalAccounts, formatDate, meetingStatus, getRoleName } from '@/functions'

import { useMeetings } from '@/composables/useMeetings'
import type { Meeting } from "@/interfaces/meeting"
import type { UseMeetingsReturn } from '@/composables/useMeetings'

// Global
const authStore = useAuthStore()
const confirm = useConfirm()
const emit = defineEmits(['updateCanceledMeeting', 'updateEditedMeeting', 'updateEditedGuestsMeeting'])
const props = defineProps<{
    meeting: Meeting
}>()

// Data
const { deleteMeeting }: UseMeetingsReturn = useMeetings(false)

// Get Meeting External Accounts from Guests
const externalAccounts = computed(() => {
    if(props.meeting.external_account_ids && authStore.externalAccountsSmall) {
        return getExternalAccounts(props.meeting.external_account_ids, authStore.externalAccountsSmall)
    }
})

// Check the Meeting Ability to Edit
const canEditMeeting = computed(() => {
    if(authStore && authStore.isAdmin) return true

    if(authStore && authStore.isSale && authStore.user) {
        return authStore.user.id === props.meeting.organizer.id ? true : false
    }

    return false
})

// Edit Meeting
const setEditMeeting = (type:string) => {
    if(type === 'edit') emit("updateEditedMeeting", props.meeting.meeting_id);
    if(type === 'editGuests') emit("updateEditedGuestsMeeting", props.meeting.meeting_id);
}

// Delete Meeting
const setDeleteMeeting = async () => {
    confirm.require({
        message: 'Are you sure you want to delete this meeting?',
        header: 'Cancel',
        icon: 'pi pi-trash',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Confirm',
            severity: 'danger'
        },
        accept: async () => {
            try {
                const message = await deleteMeeting(props.meeting.meeting_id);
                emit("updateCanceledMeeting", message);
            } catch (error) {
                console.error("Failed to delete the meeting:", error);
                emit("updateCanceledMeeting", 'Failed to delete the meeting');
            }
        },
        reject: () => {}
    });
}
</script>

<template>
    <div class="relative flex flex-col h-full">

        <div class="flex gap-x-3 w-full mb-6">
            <Button 
                v-if="canEditMeeting"
                label="Edit" 
                icon="pi pi-pencil" 
                iconPos="right" 
                fluid 
                @click="setEditMeeting('edit')" 
            />
            <Button 
                v-if="canEditMeeting"
                label="Edit guests" 
                icon="pi pi-user-plus" 
                iconPos="right" 
                fluid 
                @click="setEditMeeting('editGuests')" 
            />
            <Button 
                v-if="authStore.isAdmin"
                label="Cancel" 
                icon="pi pi-times" 
                iconPos="right" 
                severity="danger" 
                fluid 
                @click="setDeleteMeeting" 
            />
        </div>

        <h5 class="drawer-section-title">
            <span>
                <i class="pi pi-info-circle"></i>
                Infos
            </span>
        </h5>
        <ul class="list">
            <li>
                <span>ID</span>
                <span>{{ meeting.meeting_id }}</span>
            </li>
            <li v-if="meeting.title">
                <span>Title</span>
                <span>{{ meeting.title }}</span>
            </li>
            <li>
                <span>Date</span>
                <span>{{ formatDate(meeting.start_date, 'DD/MM/YYYY') }}</span>
            </li>
            <li>
                <span>Hour</span>
                <span>{{ formatDate(meeting.start_date, 'HH:mm') }} - {{ formatDate(meeting.end_date, 'HH:mm') }}</span>
            </li>
            <li>
                <span>Area</span>
                <span>{{ meeting.area.label }}</span>
            </li>
            <!-- <li>
                <span>Market</span>
                <span>{{ meeting.market.label }}</span>
            </li> -->
            <li>
                <span>Guests count</span>
                <span>{{ meeting.guests && `${meeting.guests.length}+` }}</span>
            </li>
            <li class="items-center">
                <span>Status</span>
                <span :class="['badge', meetingStatus(meeting.status).cls]">{{ meetingStatus(meeting.status).label }}</span>
            </li>
        </ul>

        <div v-if="externalAccounts" class="mt-4">
            <h5 class="drawer-section-title">
                <span>
                    <i class="pi pi-user"></i>
                    External Account
                </span>
            </h5>
            <ul class="list">
                <li v-for="(ex, index) in externalAccounts" :key="index">
                    <span>{{ `${index + 1} - ${ex.label} - ${ex.market_label}` }}</span>
                </li>
            </ul>
        </div>

        <div v-if="meeting.organizer" class="mt-4">
            <h5 class="drawer-section-title">
                <span>
                    <i class="pi pi-user"></i>
                    Organizer
                </span>
            </h5>
            <ul class="list">
                <li>
                    <span>Full name</span>
                    <span>{{ `${meeting.organizer.first_name} ${meeting.organizer.last_name}` }}</span>
                </li>
                <li>
                    <span>Role</span>
                    <span>{{ meeting.organizer.role }}</span>
                </li>
            </ul>
        </div>

        <div v-if="meeting.guests" class="mt-4">
            <h5 class="drawer-section-title">
                <span>
                    <i class="pi pi-users"></i>
                    Guests ({{ meeting.guests.length }})
                </span>
            </h5>
            <div v-for="guest in meeting.guests" :key="guest.id" class="bg-slate-50 border border-gray-200 py-1 px-3 rounded-md mb-3">
                <ul class="list">
                    <li>
                        <span>Full name</span>
                        <span>{{ `${guest.first_name} ${guest.last_name}` }}</span>
                    </li>
                    <li>
                        <span>Email</span>
                        <span>{{ guest.email }}</span>
                    </li>
                    <li v-if="guest.position">
                        <span>Title</span>
                        <span>{{ guest.position }}</span>
                    </li>
                    <li>
                        <span>Rôle</span>
                        <span>{{ getRoleName(guest.role_id) }}</span>
                    </li>
                </ul>
            </div>

        </div>

        <ConfirmDialog :group="`delete-meeting-${meeting.meeting_id}`"></ConfirmDialog>

    </div>
</template>

<style></style>