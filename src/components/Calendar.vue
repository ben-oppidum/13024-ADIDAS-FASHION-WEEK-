<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useToast } from "primevue/usetoast"
import VueCal from 'vue-cal'
import 'vue-cal/dist/drag-and-drop.es.js'
import 'vue-cal/dist/vuecal.css'

import { useAreas } from '@/composables/useAreas'
import { useMeetings } from '@/composables/useMeetings'
import type { Meeting, MeetingCalendar, OpenDialog } from '@/interfaces/meeting'

import type { UseAreasReturn } from '@/composables/useAreas'
import type { UseMeetingsReturn } from '@/composables/useMeetings'

import { axiosHeader } from '@/functions'
import { endPoint } from '@/stores/environment'

import SelectExAccount from '@/components/SelectExAccount.vue'
import MeetingDetails from '@/components/meetings/MeetingDetails.vue'

// TS
type ViewType = 'week' | 'day';
interface ViewChangeEvent { 
    view: ViewType;
    startDate: Date;
}

//  Global
const header = axiosHeader()
const toast = useToast()
const emit = defineEmits(['openDialog'])

// Get Areas
const { areas, loading: loadingAreas }: UseAreasReturn = useAreas(true)

// Calendar Config
const vuecal = ref<InstanceType<typeof VueCal> | null>(null);
const calendarConfig = ref({
    hideViewSelector: true,
    hideTitlebar: false,
    disableViews: ['years', 'year', 'month'],
    activeView: 'week',
    selectedDate: '2025-01-20',
    eventOnMonthView: false, // or short
    disableDays: [], // Format : '2025-01-20'
    minDate: '2025-01-20',
    maxDate: '2025-01-26',
    timeFrom: 8 * 60,
    timeTo: 21 * 60,
    timeStep: 30,
    timeCellHeight: 60,
    editableEvents: { 
        title: false, 
        drag: false, 
        resize: false, 
        delete: false, 
        create: false 
    },
})

// Data
const { 
    meetingsCalendar: events, 
    disabledHours, 
    loading: loadingMeetings, 
    getMeetings, 
    setDisabledHours 
}: UseMeetingsReturn = useMeetings(false, true)
onMounted(async () => { await getMeetings('status=2') })

// Filter Data
const filter = ref<Record<string, string>>({
    exAccount: '',
    area: ''
});

const filtredMeetings = computed(() => {
    let filteredData = events.value;
    for(let fc in filter.value) {
        const value = filter.value[fc];

        if (value != '') {
            switch (fc) {
                case 'exAccount':
                    //clearFilter.value = true
                    //filteredData = filteredData && filteredData.filter((item) => +item.content.exAccount === +value)
                    break;

                case 'area':
                    clearFilter.value = true
                    filteredData = filteredData && filteredData.filter((item) => +item.content.areaId === +value)
                    
                    //setDisabledHours(+value)

                    break;

                default:
                    break;
            }
        } 

    }

    return filteredData || []
})

// Clear Filter
const clearFilter = ref<boolean>(false)
const setClearFilter = () => {
    clearFilter.value = false
    //setDisabledHours(1, true)

    for (const key in filter.value) {
        if (filter.value.hasOwnProperty(key)) {
            filter.value[key] = '';
        }
    }
}

const viewChange = (e: ViewChangeEvent) => calendarConfig.value.activeView = e.view

// On Cell Click
function checkDateRange(date:Date, events: MeetingCalendar[]) {
    const targetDate = new Date(date);

    return events.some(event => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        return targetDate >= eventStart && targetDate <= eventEnd; 
    });
}

const cellClick = (clickType:string, e:Date) => {
    // Check first if cell is a disabled Meeting
    const isDateInRange = events.value ? checkDateRange(e, events.value) : false
    if(isDateInRange) return

    if(clickType === 'click') {
        emit("openDialog", {
            date: e,
            type: 'create'
        } as OpenDialog );
        return
    }
}

// Get Meeting with Meeting ID
const getMeeting = async (meetingId:string) => {
    loadingDrawer.value = true
    try {
        const response = await axios.get(`${endPoint.meetings}?meetingId=${meetingId}`, header)
        const responseData: Meeting[] = response.data;
        if(responseData && responseData.length > 0) return responseData[0]
    } catch (error) {
        if (axios.isAxiosError(error) && error.response && error.response.data) console.log(error.response.data)
    } finally {
        loadingDrawer.value = false
    }
}

// On Event Click
const selectedEvent = ref<Meeting | null>(null)
const loadingDrawer =  ref<boolean>(false)

const onEventClick = async  (e:any) => {
    const foundMeeting = await getMeeting(e.meetingId)
    if(foundMeeting) {
        selectedEvent.value = foundMeeting
        meetingDetails.value = true
    }
}

// Toogle Days Week
const changeView = (view: string) => calendarConfig.value.activeView = view

// Meeting Drawer
const meetingDetails = ref<boolean>(false)

// Get Edited Meeting From Drawer
const getEditedMeeting = async (meetingId:string) => {
    const foundMeeting = await getMeeting(meetingId)
    if(foundMeeting) {
        meetingDetails.value = false
        emit("openDialog", {
            meeting: foundMeeting,
            type: 'edit'
        } as OpenDialog );
    }
}

// Get Canceled Meeting From Drawer
const getCanceledMeeting = async (message:string) => {
    meetingDetails.value = false
    toast.add({ severity: 'success', summary: 'Message', detail: message,  group: `cancel-meeting`, life: 3000 });
    
    setTimeout(async () => {
        await getMeetings('status=2')
    }, 2000);
}
</script>

<template>
    <div>
        <div class="grid grid-cols-7 gap-x-3 items-center mb-6">
            <div class="form-group col-span-3">
                <label class="form-label">External Account</label>
                <SelectExAccount v-model:="filter.exAccount" />
            </div>
            <div class="font-semibold px-6 pt-3 text-center">And</div>
            <div class="form-group col-span-3">
                <label class="form-label">Area</label>
                <Select 
                    v-model="filter.area" 
                    :options="areas || []" 
                    optionLabel="label" 
                    optionValue="id"
                    :placeholder="loadingAreas ? 'Loading ...' : 'Select an area'"
                    :loading="loadingAreas"
                    class="w-full" 
                />
            </div>
            <div class="col-span-7 flex justify-end">
                <button v-if="clearFilter" type="button" @click="setClearFilter" class="text-gray-500 flex items-center gap-x-2 mt-2">
                    <i class="pi pi-filter-slash"></i>
                    Clear filter
                </button>
            </div>
        </div>
        <div class="flex justify-end items-start mb-5">
            <div class="flex gap-x-2 mb-4">
                <button type="button" :class="['font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 hover:text-gray-500 transition-all duration-100 ease-in-out', calendarConfig.activeView === 'week' ? 'bg-gray-900 hover:bg-gray-900 hover:text-white text-white' : 'text-gray-400']" @click="changeView('week')">Week</button>
                <button type="button" :class="['font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 hover:text-gray-500 transition-all duration-100 ease-in-out', calendarConfig.activeView === 'day' ? 'bg-gray-900 hover:bg-gray-900 hover:text-white text-white' : 'text-gray-400']" @click="changeView('day')">Day</button>
            </div>
        </div>
        <template v-if="loadingMeetings">
            <div class="flex items-center justify-center h-[450px]">
                <span class="loader-calendar"></span>
            </div>
        </template>
        <template v-else-if="filtredMeetings">
            <vue-cal 
                ref="vuecal"
                class="bg-white rounded-md"
                style="height: 100vh; width: 100%"
                locale="en"
                :selected-date="calendarConfig.selectedDate"
                :hide-view-selector="calendarConfig.hideViewSelector"
                :hide-title-bar="calendarConfig.hideTitlebar"
                :disable-views="calendarConfig.disableViews"
                :active-view="calendarConfig.activeView"
                :events-on-month-view="calendarConfig.eventOnMonthView"
                :min-date="calendarConfig.minDate"
                :max-date="calendarConfig.maxDate"
                :time-from="calendarConfig.timeFrom"
                :time-to="calendarConfig.timeTo"
                :time-step="calendarConfig.timeStep"
                :snap-to-time="calendarConfig.timeStep"
                :time-cell-height="calendarConfig.timeCellHeight"
                :events="filtredMeetings"
                :special-hours="disabledHours"
                :disable-days="calendarConfig.disableDays"
                :today-button="false"
                :editable-events="calendarConfig.editableEvents"
                :min-split-width="100"
                :sticky-split-labels="false"
                :on-event-click="onEventClick"
                :cell-click-hold="false"
                @view-change="viewChange($event)"
                @cell-click="cellClick('click', $event)"
                @cell-dblclick="cellClick('dblclick', $event)"
            >
                <template #no-event="{}">
                    <p>No meetings</p>
                </template>

                <template #event="{ event, view }">
                    
                    <div class="text-xs" v-if="view === 'week'">
                        <div class="font-semibold flex items-center gap-x-1">
                            <span>{{ event.content.startHour }}</span>
                            <!-- <span class="w-4 h-4 rounded-full bg-current block"></span> -->
                            <span>{{ `(+${event.content.guests})` }}</span>
                        </div>
                        <div>
                            <span class="title block line-clamp-1">{{ event.content.title }}</span>
                            <span class="title font-semibold leading-4 line-clamp-1">{{ event.content.info }}</span>
                        </div>
                    </div>

                    <div v-if="view === 'day'">
                        <div class="font-semibold flex items-center gap-x-1">
                            <span>{{ event.content.startHour }}</span>
                            <!-- <span class="w-4 h-4 rounded-full bg-current block"></span> -->
                            <span>{{ `(+${event.content.guests})` }}</span>
                        </div>
                        <div class="flex gap-x-2">
                            <span>{{ event.content.title }}</span>
                            <span> - </span>
                            <span class="title font-semibold leading-4">{{ event.content.info }}</span>
                            <template v-if="event.content.organizer">
                                <span> - </span>
                                <span>{{ `Organizer : ${event.content.organizer}` }}</span>
                            </template>
                        </div>
                    </div>

                </template>
            </vue-cal>
        </template>

        <Drawer v-model:visible="meetingDetails" :header="selectedEvent ? `${selectedEvent.title} ${selectedEvent.area.label}` : ''" position="right">
            <template v-if="loadingDrawer">
                <div class="w-full h-full flex items-center justify-center">
                    <span class="loader-drawer"></span>
                </div>
            </template>
            <MeetingDetails 
                v-else-if="selectedEvent" 
                :meeting="selectedEvent"
                @update-edited-meeting="getEditedMeeting"
                @update-canceled-meeting="getCanceledMeeting"
            />
        </Drawer>

        <Toast position="top-center" group="cancel-meeting" />

    </div>
</template>

<style>
/* Global */
.vuecal__cell-events { @apply cursor-pointer }
.vuecal__now-line {color: #06c;}
.vuecal__cell-events-count { @apply w-4 h-4 rounded-full bg-blue-500 text-white text-center flex items-center justify-center }

/* Title Bar */
.vuecal__title-bar { @apply text-base py-2.5 text-primary font-semibold }
.vuecal__title-bar .p-button { @apply p-0 text-primary hover:bg-transparent hover:underline }

/* Cell Title */
.vuecal__event { @apply flex items-center text-xs !text-left border-[0.5px] border-gray-200 py-0.5 px-1 }
.vuecal__event .vuecal__event-title { @apply line-clamp-2 }
.vuecal__event .vuecal__event-svg { @apply w-2.5 h-2.5 min-w-2.5 min-h-2.5 mr-1 }

.vuecal__event--dragging {background-color: rgba(60, 60, 60, 0.3);}
.vuecal__cell--today { @apply bg-gray-100 }
.vuecal__cell--disabled { @apply line-through text-gray-200 }

.vuecal__event { @apply text-sm border-0 shadow-none px-3 leading-tight }
/* .vuecal__event .title { @apply line-clamp-1 }
.vuecal__event:not(.disabled):hover .title { @apply line-clamp-none } */

.eur { @apply bg-blue-50 text-blue-700 border border-blue-100 border-l-4 border-l-blue-300  }
.em { @apply bg-indigo-50 text-indigo-700 border border-indigo-100 border-l-4 border-l-indigo-300 }
.sko { @apply bg-gray-100 text-gray-700 border border-gray-100 border-l-4 border-l-gray-300 }
.nam { @apply bg-pink-50 text-pink-700 border border-pink-100 border-l-4 border-l-pink-300  }
.gca { @apply bg-green-50 text-green-700 border border-green-100 border-l-4 border-l-green-300  }
.jap { @apply bg-emerald-50 text-emerald-700 border border-emerald-100 border-l-4 border-l-emerald-300  }
.lam { @apply bg-orange-50 text-orange-700 border border-orange-100 border-l-4 border-l-orange-300  }

.vuecal__heading { @apply !h-auto }
.weekday-label { @apply !flex !flex-col !items-start pb-3 pt-2 }
.weekday-label .full { @apply uppercase text-gray-600 font-bold text-xs }
.weekday-label span:last-child { @apply uppercase text-gray-600 font-bold text-2xl }

.vuecal__event.disabled {
    cursor: no-drop;
    background: repeating-linear-gradient(45deg, transparent, transparent 10px, #f2f2f2 10px, #f2f2f2 20px);/* IE 10+ */
    color: #999;
}

.vuecal__cell--disabled { @apply bg-red-50 }

.closed {
    background: #f6f6f6 
    repeating-linear-gradient(
        -45deg, 
        rgb(200 200 200 / 25%), 
        rgba(169, 169, 169, 0.25) 5px, 
        rgba(125, 125, 125, 0) 5px,
        rgba(255, 255, 255, 0) 15px
    );
    color: #aaaaaa;
    border: 1px solid #dadada;
    cursor: not-allowed;
}

.loader-calendar {
    width: 48px;
    height: 48px;
    display: inline-block;
    position: relative;
    transform: rotate(45deg);
}
.loader-calendar::before {
    content: '';  
    box-sizing: border-box;
    width: 24px;
    height: 24px;
    position: absolute;
    left: 0;
    top: -24px;
    animation: animloader 4s ease infinite;
}
.loader-calendar::after {
    content: '';  
    box-sizing: border-box;
    position: absolute;
    left: 0;
    top: 0;
    width: 24px;
    height: 24px;
    background: rgba(199, 199, 199, 0.85);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
    animation: animloader2 2s ease infinite;
}

@keyframes animloader {
    0% { box-shadow: 0 24px rgba(255, 255, 255, 0), 24px 24px rgba(255, 255, 255, 0), 24px 48px rgba(255, 255, 255, 0), 0px 48px rgba(255, 255, 255, 0); }
    12% { box-shadow: 0 24px white, 24px 24px rgba(255, 255, 255, 0), 24px 48px rgba(255, 255, 255, 0), 0px 48px rgba(255, 255, 255, 0); }
    25% { box-shadow: 0 24px white, 24px 24px white, 24px 48px rgba(255, 255, 255, 0), 0px 48px rgba(255, 255, 255, 0); }
    37% { box-shadow: 0 24px white, 24px 24px white, 24px 48px white, 0px 48px rgba(255, 255, 255, 0); }
    50% { box-shadow: 0 24px white, 24px 24px white, 24px 48px white, 0px 48px white; }
    62% { box-shadow: 0 24px rgba(255, 255, 255, 0), 24px 24px white, 24px 48px white, 0px 48px white; }
    75% { box-shadow: 0 24px rgba(255, 255, 255, 0), 24px 24px rgba(255, 255, 255, 0), 24px 48px white, 0px 48px white; }
    87% { box-shadow: 0 24px rgba(255, 255, 255, 0), 24px 24px rgba(255, 255, 255, 0), 24px 48px rgba(255, 255, 255, 0), 0px 48px white; }
    100% { box-shadow: 0 24px rgba(255, 255, 255, 0), 24px 24px rgba(255, 255, 255, 0), 24px 48px rgba(255, 255, 255, 0), 0px 48px rgba(255, 255, 255, 0); }
}

@keyframes animloader2 {
    0% { transform: translate(0, 0) rotateX(0) rotateY(0); }
    25% { transform: translate(100%, 0) rotateX(0) rotateY(180deg); }
    50% { transform: translate(100%, 100%) rotateX(-180deg) rotateY(180deg); }
    75% { transform: translate(0, 100%) rotateX(-180deg) rotateY(360deg); }
    100% { transform: translate(0, 0) rotateX(0) rotateY(360deg); }
}

.loader-drawer {
    width: 35px;
    height: 35px;
    border: 3px solid;
    border-color: #bcbcbc transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
} 
</style>