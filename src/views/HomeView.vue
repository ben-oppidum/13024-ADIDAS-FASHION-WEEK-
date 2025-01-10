<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from "primevue/usetoast"

import Calendar from '@/components/Calendar.vue'
import AddMeeting from '@/components/meetings/AddMeeting.vue'

// Global
const toast = useToast()

// Calendar
const calendarKey = ref(1)

// Dialog
const showDialog = ref(false)
const setUpdateDialog = (message:string) => {
    showDialog.value = false
    calendarKey.value++
    toast.add({ severity: 'success', summary: 'Confirmation', detail: message, group: 'meetingToast', life: 5000 });
}

const selectedDate = ref<Date>()
const setOpenDialo = (e:Date) => {
    selectedDate.value = new Date(e)
    showDialog.value = true
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
                <Calendar 
                    :key="calendarKey" 
                    @open-dialog="setOpenDialo"
                />
            </div>
        </div>
        
        <Toast position="top-center" group="meetingToast" />

    </div>
</template>
