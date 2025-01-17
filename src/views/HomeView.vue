<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from "primevue/usetoast"
import type { Meeting, Guest, OpenDialog } from '@/interfaces/meeting'

import Calendar from '@/components/Calendar.vue'
import AddMeeting from '@/components/meetings/AddMeeting.vue'
import GuestsList from '@/components/meetings/GuestsList.vue'

// Global
const toast = useToast()

// Calendar
const calendarKey = ref(1)

// Dialog
const showDialog = ref<boolean>(false)
const showDialogEdit = ref<boolean>(false)
const dialogTitle = ref<string>('')

const setUpdateDialog = (message:string) => {
    showDialog.value = false
    showDialogEdit.value = false

    calendarKey.value++
    toast.add({ severity: 'success', summary: 'Confirmation', detail: message, group: 'meetingToast', life: 5000 });
}

const selectedDate = ref<Date>()
const selectedMeeting = ref<Meeting | null>(null)
const selectedMeetingGuests = ref<Meeting | null>(null)

const setOpenDialog = (e:OpenDialog) => {
    // Reset Values first
    showDialog.value = false
    selectedMeeting.value = null
    selectedMeetingGuests.value = null
    
    if(e.type === 'create') {
        e.date ? selectedDate.value = new Date(e.date) : ''
        showDialog.value = true
    }

    if(e.type === 'edit' && e.meeting) {
        showDialogEdit.value = true
        dialogTitle.value = e.dialogTitle
        selectedMeeting.value = e.meeting
    }

    if(e.type === 'editGuests' && e.meeting) {
        showDialogEdit.value = true
        dialogTitle.value = e.dialogTitle
        selectedMeetingGuests.value = e.meeting
    }
}
</script>

<template>
    <div class="page-wrap">
        <div class="container">
            <PageTitle title="Calendars">
                <Button 
                    label="Create a new meeting" 
                    icon="pi pi-plus" 
                    @click="showDialog = true"
                />
            </PageTitle>
            <div class="mt-8">
                <Dialog 
                    v-model:visible="showDialog"
                    modal 
                    :draggable="false" 
                    :style="{ width: '80vw' }" 
                    header="Create new meeting"
                >   
                    <AddMeeting 
                        :visible="showDialog" 
                        :start-date="selectedDate"
                        @update-dialog="setUpdateDialog" 
                    />
                </Dialog>
                <Dialog 
                    v-model:visible="showDialogEdit"
                    modal 
                    :draggable="false" 
                    :style="{ width: '80vw' }" 
                    :header="dialogTitle"
                >   
                    <AddMeeting 
                        v-if="selectedMeeting"
                        :visible="showDialogEdit" 
                        method="edit" 
                        :meeting="selectedMeeting" 
                        @update-dialog="setUpdateDialog" 
                    />
                    <GuestsList
                        v-if="selectedMeetingGuests"
                        :meeting="selectedMeetingGuests"
                        :guests="selectedMeetingGuests.guests"
                        @updateDialog="setUpdateDialog"
                    />
                </Dialog>
                <Calendar 
                    :key="calendarKey" 
                    @open-dialog="setOpenDialog"
                />
            </div>
        </div>
        
        <Toast position="top-center" group="meetingToast" />

    </div>
</template>
