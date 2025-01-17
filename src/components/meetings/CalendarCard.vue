<script setup lang="ts">
import type { MeetingCalendar } from '@/interfaces/meeting'
import { useAuthStore } from '@/stores/auth'
import { getExternalAccountLabel } from '@/functions'

type View = 'day' | 'week'

//  Global
const authStore = useAuthStore()
defineProps<{
    view: View
    meeting: MeetingCalendar
}>()
</script>

<template>
    <div :class="view === 'week' ? 'text-xs' : ''">
        <div class="font-semibold flex items-center gap-x-1">
            <span>{{ meeting.content.startHour }}</span>
            <span>{{ `(+${meeting.content.guests})` }}</span>
        </div>
        
        <template v-if="view === 'week'">
            <div>
                <span class="title block line-clamp-1">{{ meeting.content.title }}</span>
                <span 
                    v-if="authStore.externalAccountsSmall && meeting.content.externalAccountIds" 
                    class="title font-semibold leading-4 line-clamp-1"
                >
                    {{ getExternalAccountLabel(meeting.content.externalAccountIds, authStore.externalAccountsSmall) }}
                </span>
            </div>
        </template>

        <template v-if="view === 'day'">
            <div class="flex items-center gap-x-2">
                <span>{{ meeting.content.title }}</span>
                <span> - </span>
                <span 
                    v-if="authStore.externalAccountsSmall && meeting.content.externalAccountIds" 
                    class="title font-semibold leading-4 line-clamp-1"
                >
                    {{ getExternalAccountLabel(meeting.content.externalAccountIds, authStore.externalAccountsSmall) }}
                </span>
                <template v-if="meeting.content.organizer">
                    <span> - </span>
                    <span>{{ `Organizer : ${meeting.content.organizer}` }}</span>
                </template>
            </div>
        </template>
        
    </div>
</template>

<style></style>