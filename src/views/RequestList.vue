<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useConfirm } from "primevue/useconfirm"
import { useToast } from "primevue/usetoast"

import { useMeetings } from '@/composables/useMeetings'
import type { UseMeetingsReturn } from '@/composables/useMeetings'
import type { Meeting, Guest } from '@/interfaces/meeting'

import { fromNowDate, getAreaType, axiosHeader, meetingStatus, formatDate } from '@/functions'
import { telegramBot } from '@/functions/telegramBot'
import { endPoint } from '@/stores/environment'
import { useAuthStore } from '@/stores/auth'

import AddMeeting from '@/components/meetings/AddMeeting.vue'
import GuestsList from '@/components/meetings/GuestsList.vue'

// Global
const header = axiosHeader()
const authStore = useAuthStore()
const confirm = useConfirm()
const toast = useToast()

// Table Config
const expandedRows = ref({});

// Data
const params = ref('single=true')
const { 
    meetings, 
    loading: loadingMeetings,
    getMeetings
}: UseMeetingsReturn = useMeetings(false, false)
onMounted(async () => { getMeetings(params.value) })

// Edit Meeting Dialog
const showDialog = ref<boolean>(false)
const showDialogGuests = ref<boolean>(false)
const selectedMeeting = ref<Meeting | null>(null)

const setEditMeeting = (meeting:Meeting, type:string) => {
    selectedMeeting.value = meeting
    
    if(type === 'edit') showDialog.value = true
    if(type === 'guests') showDialogGuests.value = true
}

const setUpdateDialog = async (message:string, type:string) => {
    if(type === 'edit') {
        showDialog.value = false
        toast.add({ severity: 'success', summary: 'Confirmation', detail: message, group: 'meetingToast', life: 5000 });
    }
    if(type === 'guests') {
        showDialogGuests.value = false
        toast.add({ severity: 'success', summary: 'Confirmation', detail: 'Guests list updated', group: 'meetingToast', life: 5000 });
    }

    await getMeetings(params.value)
}
</script>

<template>
    <div class="page-wrap">
        <div class="container">
            <PageTitle title="Request List" />
            <div class="mt-8">
                <DataTable 
                    :value="meetings" 
                    dataKey="id" 
                    v-model:expandedRows="expandedRows"
                    size="small" 
                    stripedRows
                    scrollable
                    sortMode="multiple"
                    filterDisplay="row"
                    :loading="loadingMeetings"
                    tableStyle="min-width: 1200px"
                >

                    <template #empty>
                        <div class="empty-data">
                            <i class="pi pi-exclamation-circle"></i> 
                            To-do list is empty
                        </div>
                    </template>
                    <Column expander style="width: 50px" />

                    <Column field="id" header="#"></Column>
                    <Column header="Request Date">
                        <template #body="{ data }">
                            <span class="line-clamp-2 capitalize">{{ fromNowDate(data.created_at) }}</span>
                        </template>
                    </Column>
                    <Column field="title" header="Title" class="max-w-[200px]"></Column>
                    <Column header="Market">
                        <template #body="{ data }">
                            <span>{{ `${data.market.label}` }}</span>
                        </template>
                    </Column> 
                    <Column header="Organizer Type">
                        <template #body="{ data }">
                            <span>{{ data.organizer && data.organizer.role }}</span>
                        </template>
                    </Column> 
                    <Column header="Organizer">
                        <template #body="{ data }">
                            <span>{{ data.organizer && `${data.organizer.first_name} ${data.organizer.last_name}` }}</span>
                        </template>
                    </Column> 
                    <Column header="Guests">
                        <template #body="{ data }">
                            <span class="line-clamp-2">{{ data.guests ? data.guests.length : 0 }}+</span>
                        </template>
                    </Column> 
                    <!-- <Column header="">
                        <template #body="{}">
                            <a href="#" class="text-primary"><i class="pi pi-calendar"></i></a>
                        </template>
                    </Column>  -->
                    <Column header="Type">
                        <template #body="{ data }">
                            <span v-if="data.area" :class="['badge', getAreaType(data.area.id).toLowerCase()]">{{ getAreaType(data.area.id) }}</span>
                        </template>
                    </Column> 
                    <Column header="Date - Time">
                        <template #body="{ data }">
                            <span>
                                {{ formatDate(data.start_date, 'DD-MM-YYYY - HH:mm') }}<br />
                                {{ formatDate(data.end_date, 'HH:mm') }}
                            </span>
                        </template>
                    </Column> 
                    <Column header="Status" class="min-w-[120px]">
                        <template #body="{ data }">
                            <span :class="['badge', meetingStatus(data.status).cls]">{{ meetingStatus(data.status).label }}</span>
                        </template>
                    </Column> 
                    <Column header="Action">
                        <template #body="{ data }">
                            <div class="flex gap-x-1">
                                <button 
                                    type="button" 
                                    class="table-action edit"
                                    v-tooltip.top="'Edit'"
                                    placeholder="Top"
                                    @click="setEditMeeting(data, 'edit')"
                                >
                                    <i class="pi pi-pencil"></i>
                                </button>
                                <button 
                                    type="button" 
                                    class="table-action edit"
                                    v-tooltip.top="'Edit Guests'"
                                    placeholder="Top"
                                    @click="setEditMeeting(data, 'guests')"
                                >
                                    <i class="pi pi-users"></i>
                                </button>
                            </div>   
                        </template>
                    </Column> 

                    <!-- Guests Sub Table -->
                    <template #expansion="{ data }">
                        <div class="table-guests">
                            <DataTable :value="data.guests" size="small">
                                <Column header="Guests">
                                    <template #body="{ data }">
                                        <span class="line-clamp-2">{{ `${data.first_name} ${data.last_name}` }}</span>
                                    </template>
                                </Column> 
                                <Column header="Email">
                                    <template #body="{ data }">
                                        <span>{{ data.email }}</span>
                                    </template>
                                </Column>
                                <Column header="Title">
                                    <template #body="{ data }">
                                        <span>{{ data.position || '' }}</span>
                                    </template>
                                </Column>
                                <!-- <Column header="">
                                    <template #body="{}">
                                        <a href="#" class="text-primary"><i class="pi pi-calendar"></i></a>
                                    </template>
                                </Column>  -->
                            </DataTable>
                        </div>
                    </template>

                </DataTable>
                
                <ConfirmDialog group="accept"></ConfirmDialog>
                <ConfirmDialog group="reject"></ConfirmDialog>

                <Toast position="top-center" group="error-toast" />
                <Toast position="top-center" group="accept-toast" />
                <Toast position="top-center" group="reject-toast" />
                <Toast position="top-center" group="meetingToast" />

                <Dialog v-model:visible="showDialog" modal :draggable="false" :style="{ width: '80vw' }" header="Edit Guests">   
                    <AddMeeting 
                        v-if="selectedMeeting"
                        :visible="showDialog"
                        method="edit" 
                        :meeting="selectedMeeting" 
                        @update-dialog="setUpdateDialog($event, 'edit')" 
                    />
                </Dialog>
                <Dialog v-model:visible="showDialogGuests" modal :draggable="false" :style="{ width: '80vw' }" header="Edit guests">   
                    <GuestsList
                        v-if="selectedMeeting"
                        :meeting="selectedMeeting"
                        :guests="selectedMeeting.guests"
                        @updateDialog="setUpdateDialog($event, 'guests')"
                    />
                </Dialog>

            </div>

        </div>

    </div>
</template>
