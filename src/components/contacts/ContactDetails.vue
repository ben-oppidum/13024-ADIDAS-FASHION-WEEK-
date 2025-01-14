<script setup lang="ts">
import { computed } from 'vue'

import { formatDate, meetingStatus } from '@/functions'
import { useAuthStore } from '@/stores/auth'
import type { User } from "@/interfaces/user"

// Global
const authStore = useAuthStore()
const props = defineProps<{
    contact: User
}>()

// Check if Badge Received (For Sales only)
const badge = computed(() => {
    if(!authStore.user) return null
    if(authStore.user.role.id === 6) return null

    return props.contact.badge && props.contact.badge.received ? 
        { cls: 'text-green-500', icon: 'pi-check', message: `Badge received at ${formatDate(props.contact.badge.date)}` } :
        { cls: 'text-red-500', icon: 'pi-times', message: 'Badge is not received' } 
})
</script>

<template>
    <div class="relative h-full">
        <h5 class="drawer-section-title">
            <span>
                <i class="pi pi-info-circle"></i>
                Infos
            </span>
        </h5>
        <ul class="list">
            <li>
                <span>Reference</span>
                <span>{{ contact.reference }}</span>
            </li>
            <li>
                <span>Created at</span>
                <span>{{ formatDate(contact.created_at, 'DD/MM/YYYY at HH:mm') }}</span>
            </li>
            <li v-if="contact.updated_at">
                <span>Updated at</span>
                <span>{{ formatDate(contact.updated_at, 'DD/MM/YYYY at HH:mm') }}</span>
            </li>
            <li>
                <span>Last Name</span>
                <span>{{ contact.last_name }}</span>
            </li>
            <li>
                <span>First Name</span>
                <span>{{ contact.first_name }}</span>
            </li>
            <li>
                <span>Email</span>
                <span>{{ contact.email }}</span>
            </li>
            <li>
                <span>Phone</span>
                <span>{{ contact.phone || 'Not indicated' }}</span>
            </li>
            <li>
                <span>Position</span>
                <span>{{ contact.position }}</span>
            </li>
            <li v-if="contact.market">
                <span>Market</span>
                <span>{{ contact.market.label }}</span>
            </li>
            <li v-if="badge">
                <span>Badge</span>
                <span :class="['flex items-center gap-x-2', badge.cls]">
                    <i :class="['pi', badge.icon]"></i>
                    {{ badge?.message }}
                </span>
            </li>
        </ul>

        <div v-if="contact.meetings" class="mt-4">
            <h5 class="drawer-section-title">
                <span>
                    <i class="pi pi-calendar"></i>
                    Meetings ({{ contact.meetings.length }})
                </span>
            </h5>

            <template v-if="contact.meetings.length > 0">
                <div v-for="meeting in contact.meetings" :key="meeting.id" class="bg-slate-50 border border-gray-200 p-3 rounded-md mb-3">
                    <div>
                        <span class="block font-semibold text-primary">Date</span>
                        <span>{{ `${formatDate(meeting.start_date, 'DD-MM-YYYY HH:mm')} ${formatDate(meeting.end_date, 'HH:mm')}` }}</span>
                    </div>
                </div>
            </template>

            <template v-else>
                <span class="flex items-center gap-x-2 text-yellow-700">
                    <i class="pi pi-info-circle"></i>
                    This contact is not associate to any meeeting
                </span>
            </template>

        </div>

    </div>
</template>

<style></style>