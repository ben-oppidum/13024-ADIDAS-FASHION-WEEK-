<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from "primevue/usetoast"
import type { Meeting, OpenDialog } from '@/interfaces/meeting'

import Calendar from '@/components/Calendar.vue'
import AddMeeting from '@/components/meetings/AddMeeting.vue'

// Global
const toast = useToast()

// Calendar
const calendarKey = ref(1)

// Dialog
const showDialog = ref<boolean>(false)
const showDialogEdit = ref<boolean>(false)
const setUpdateDialog = (message:string) => {
    showDialog.value = false
    showDialogEdit.value = false

    calendarKey.value++
    toast.add({ severity: 'success', summary: 'Confirmation', detail: message, group: 'meetingToast', life: 5000 });
}

const selectedDate = ref<Date>()
const selectedMeeting = ref<Meeting | null>(null)
const setOpenDialog = (e:OpenDialog) => {
    
    if(e.type === 'create') {
        e.date ? selectedDate.value = new Date(e.date) : ''
        showDialog.value = true
    }

    if(e.type === 'edit' && e.meeting) {
        showDialogEdit.value = true
        selectedMeeting.value = e.meeting
        console.log(selectedMeeting.value);
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
                    header="Add new meeting"
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
                    header="Edit meeting"
                >   
                    <AddMeeting 
                        v-if="selectedMeeting"
                        :visible="showDialogEdit" 
                        method="edit" 
                        :meeting="selectedMeeting" 
                        @update-dialog="setUpdateDialog" 
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
