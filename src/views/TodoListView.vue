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

import { fromNowDate, getAreaType, axiosHeader, meetingStatus, formatDate, getRoleName } from '@/functions'
import { telegramBot } from '@/functions/telegramBot'
import { endPoint } from '@/stores/environment'
import { useAuthStore } from '@/stores/auth'

import AddMeeting from '@/components/meetings/AddMeeting.vue'
import GuestsList from '@/components/meetings/GuestsList.vue'

// Global
const header = axiosHeader()
const authStore = useAuthStore()

// Table Config
const expandedRows = ref({});

// Data
const params = ref('status=1')
const { 
    meetings, 
    loading: loadingMeetings,
    getMeetings
}: UseMeetingsReturn = useMeetings(false, false)
onMounted(async () => { getMeetings(params.value) })

// Filtred Meetings
const filtredMeetings = computed(() => {
    if(meetings.value) return meetings.value
    return []
})

// Toogle Show All Meeting
interface showAllMeetingsType {
    state: boolean;
    text: string;
}
const showAllMeetings = ref<showAllMeetingsType>({
    state: false,
    text: 'Also display requests already processed'
})
const setAllMeetings = async () => {
    showAllMeetings.value.state = !showAllMeetings.value.state
    meetings.value = null
    
    if(showAllMeetings.value.state) {
        showAllMeetings.value = { state: true, text: 'Only in progress' }
        await getMeetings()
    } else {
        showAllMeetings.value = { state: false, text: 'Also display requests already processed' }
        await getMeetings(params.value)
    }
}

// Accept & Reject Confirmation
const confirm = useConfirm()
const toast = useToast()

const confirmDialog = async (confirmationType:string, meetingId:string) => {
    confirm.require({
        group: confirmationType,
        message: `Do you want to ${confirmationType} this meeting`,
        header: 'Confirmation',
        icon: 'pi pi-info-circle',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: confirmationType === 'accept' ? 'Accept' : 'Reject',
            severity: confirmationType === 'accept' ? 'success' : 'danger'
        },
        accept: async () => {
            const reponse = await adminAproval(confirmationType, meetingId)

            if(reponse && reponse.submitted === false) {
                toast.add({ severity: 'error', summary: 'Message', detail: reponse.message,  group: `error-toast`, life: 3000 });
                return
            }

            toast.add({ 
                severity: 'info', 
                summary: 'Confirmation', 
                detail: confirmationType === 'accept' ?
                    'Meeting accepted successfully' : 
                    'Meeting rejected successfully'
                , 
                group: `${confirmationType}-toast`, 
                life: 5000 
            });

            setTimeout(async () => {
                await getMeetings(params.value)
                confirmationType === 'accept' ? await telegramBot('meetingAccepted', meetingId) : await telegramBot('meetingRejected', meetingId)
            }, 2000);
        },
        reject: () => {}
    });
}

// Admin Aproval function
const adminAproval = async (decision:string, meetingId:string) => {
    const decisionBoolean = decision === 'accept' ? true : false
    let formData = new FormData()
    if(authStore.user) formData.append('user_id', authStore.user.id.toString())

    try {
        const reponse = await axios.put(`${endPoint.meetings}/${meetingId}/adminapproval?accepted=${decisionBoolean}`, formData, header)
        return {
            message: '',
            submitted: true
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response && error.response.data) {
            return {
                message: error.response.data.message,
                submitted: false
            }
        }
    }

}

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

    showAllMeetings.value = {
        state: false,
        text: 'Also display requests already processed'
    }
    await getMeetings(params.value)
}

const setUpdateGuestsDialog = async (e:Event, type:string) => {
    console.log(e);
    console.log(type);

    showDialogGuests.value = false
    toast.add({ severity: 'success', summary: 'Confirmation', detail: 'Guests list updated', group: 'meetingToast', life: 5000 });
    await getMeetings(params.value)
}
</script>

<template>
    <div class="page-wrap">
        <div class="container">
            <template v-if="!authStore.isAdmin">
                <NotAllowed />
            </template>

            <template v-else>
                <PageTitle title="To-Do List">
                    <button type="button" @click="setAllMeetings" class="underline">{{ showAllMeetings.text }}</button>
                </PageTitle>
                <div class="mt-8">
                    <DataTable 
                        :value="filtredMeetings" 
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
                        <Column header="Status">
                            <template #body="{ data }">
                                <span :class="['badge', meetingStatus(data.status).cls]">{{ meetingStatus(data.status).label }}</span>
                            </template>
                        </Column> 
                        <Column header="Action">
                            <template #body="{ data }">
                                <div class="flex gap-x-1">
                                    <button 
                                        v-if="data.status === 1"
                                        type="button" 
                                        class="table-action accept"
                                        v-tooltip.top="'Accept'"
                                        placeholder="Top"
                                        @click="confirmDialog('accept', data.meeting_id)"
                                    >
                                        <i class="pi pi-check"></i>
                                    </button>
                                    <button 
                                        type="button" 
                                        v-if="data.status === 1"
                                        class="table-action reject"
                                        v-tooltip.top="'Reject'"
                                        placeholder="Top"
                                        @click="confirmDialog('reject', data.meeting_id)"
                                    >
                                        <i class="pi pi-times"></i>
                                    </button>
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
                                    <Column header="Rôle">
                                        <template #body="{ data }">
                                            <span>{{ getRoleName(data.role_id) }}</span>
                                        </template>
                                    </Column>
                                    <Column header="External Account">
                                        <template #body="{ data }">
                                            <span>{{ data.external_account_label || '' }}</span>
                                        </template>
                                    </Column>
                                    <Column header="Market">
                                        <template #body="{ data }">
                                            <span>{{ data.market }}</span>
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
            </template>

        </div>

    </div>
</template>
