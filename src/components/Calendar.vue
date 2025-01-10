<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import VueCal from 'vue-cal'
import 'vue-cal/dist/drag-and-drop.es.js'
import 'vue-cal/dist/vuecal.css'
import Drawer from 'primevue/drawer'

import { useAreas } from '@/composables/useAreas'
import { useMeetings } from '@/composables/useMeetings'
import type { Meeting } from '@/interfaces/meeting'

import type { UseAreasReturn } from '@/composables/useAreas'
import type { UseMeetingsReturn } from '@/composables/useMeetings'

import { formatDate, axiosHeader, meetingStatus } from '@/functions'
import { endPoint } from '@/stores/environment'

import SelectExAccount from '@/components/SelectExAccount.vue'

// TS
type ViewType = 'week' | 'day';
interface ViewChangeEvent { 
    view: ViewType;
    startDate: Date;
}

//  Global
const header = axiosHeader()

// Get Areas
const { areas, loading: loadingAreas }: UseAreasReturn = useAreas(true)

// Calendar Config
const vuecal = ref<InstanceType<typeof VueCal> | null>(null);
const calendarConfig = ref({
    hideViewSelector: true,
    hideTitlebar: false,
    disableViews: ['years', 'year', 'month'],
    activeView: 'week',
    selectedDate: '2025-01-21',
    eventOnMonthView: false, // or short
    disableDays: ['2025-01-20'],
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

// Calendar Title
const calendarTitle = ref('')
// function formatWeekInfo({ startDate, endDate, week }: { startDate: string, endDate: string, week: number }): string {
//     const start = new Date(startDate);
//     const end = new Date(endDate);
    
//     const startMonth = start.toLocaleString('en-US', { month: 'long' });
//     const endMonth = end.toLocaleString('en-US', { month: 'long' });

//     const startYear = start.getFullYear();
//     const endYear = end.getFullYear();

//     // Check if months and years are the same
//     if (startMonth === endMonth && startYear === endYear) {
//         return `Week ${week} (${startMonth} ${startYear})`;
//     } else {
//         return `Week ${week} (${startMonth} ${startYear} - ${endMonth} ${endYear})`;
//     }
// }
// function formatDayInfo(startDate: string | Date): string {
//     const date = new Date(startDate);

//     const day = date.getDate(); 
//     const month = date.toLocaleString('en-US', { month: 'long' }); 
//     const year = date.getFullYear();

//     console.log(date);

//     return `${day} ${month} ${year}`;
// }

// const onEventDrop = ({ event, originalEvent, external }) => {}
const logEvents = (event: any): void => {
    // if(calendarConfig.value.activeView === 'week') calendarTitle.value = 'From Monday 20 to Sunday 26 Jan'
    // if(calendarConfig.value.activeView === 'day') calendarTitle.value = formatDayInfo(event.startDate)
}

const viewChange = (e: ViewChangeEvent) => {
    console.log('View changed');
    console.log(e);
    //calendarTitle.value = formatDayInfo(e.startDate)
    calendarConfig.value.activeView = e.view
}

// On Cell Click
const emit = defineEmits(['openDialog'])
const cellClick = (clickType:string, e:string) => {
    if(clickType === 'click') {
        emit("openDialog", e);
        return
    }

    //calendarTitle.value = formatDayInfo(e)
    console.log(e);
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

const goToTodayDate = () => {
    calendarConfig.value.selectedDate = new Date().toISOString()
}

// Toogle Days Week
const changeView = (view: string) => calendarConfig.value.activeView = view

// Navigate to the previous date
const goToPrevious = () => {
    const prevDate = vuecal.value && vuecal.value.allDayBar.cells && vuecal.value.allDayBar.cells[0].formattedDate || ''
    vuecal.value.previous();
    console.log(prevDate);
    //calendarTitle.value = formatDayInfo(prevDate)
};

// Navigate to the next date
const goToNext = () => {
    const nextDate = vuecal.value && vuecal.value.allDayBar.cells && vuecal.value.allDayBar.cells[0].formattedDate || ''
    vuecal.value.next();
    //calendarTitle.value = formatDayInfo(nextDate)
};
// Data
const { meetingsCalendar: events , loading: loadingMeetings, getMeetings }: UseMeetingsReturn = useMeetings(false, true)
onMounted(async () => { getMeetings('status=2') })

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
                    clearFilter.value = true
                    filteredData = filteredData && filteredData.filter((item) => +item.content.exAccount === +value)
                    break;

                case 'area':
                    clearFilter.value = true
                    filteredData = filteredData && filteredData.filter((item) => +item.content.areaId === +value)
                    break;

                default:
                    break;
            }
        } 
    }

    return filteredData
})

// Clear Filter
const clearFilter = ref<boolean>(false)
const setClearFilter = () => {
    clearFilter.value = false
    for (const key in filter.value) {
        if (filter.value.hasOwnProperty(key)) {
            filter.value[key] = '';
        }
    }

    console.log(filter.value);
}

// Get External Account Client's
const exAccountsClients = computed(() => {
    console.log(events.value);
})

// Meeting Drawer
const meetingDetails = ref<boolean>(false)
</script>

<template>
    <div>
        <div class="grid grid-cols-7 gap-x-3 items-center mb-6">
            <div class="form-group col-span-3">
                <label class="form-label">Ext. Account (CLIENT)</label>
                <SelectExAccount v-model:="filter.exAccount" />
            </div>
            <div class="font-semibold px-6 pt-3 text-center">Or</div>
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
            <!-- <div class="flex bg-gray-100 text-gray-600 rounded-md">
                <template v-if="calendarConfig.activeView === 'day'">
                    <button class="px-3 py-3 flex items-center border-r border-white transition-all duration-100 ease-in-out" @click="goToPrevious">
                        <i class="pi pi-chevron-left !text-xs"></i>
                    </button>
                    <button @click="goToTodayDate" class="font-semibold block leading-none px-6">Today</button>
                    <button class="px-3 py-3 flex items-center border-l border-white transition-all duration-100 ease-in-out" @click="goToNext">
                        <i class="pi pi-chevron-right !text-xs"></i>
                    </button>
                </template>
            </div>
            <div>
                <h1 class="text-black font-semibold text-center text-xl capitalize">{{ calendarTitle }}</h1>
            </div> -->
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
                min-date="2024/01/01"
                :time-from="8 * 60"
                :time-to="19 * 60"
                :time-step="calendarConfig.timeStep"
                :snap-to-time="calendarConfig.timeStep"
                :time-cell-height="calendarConfig.timeCellHeight"
                :events="filtredMeetings"
                :disable-days="calendarConfig.disableDays"
                :today-button="false"
                :editable-events="calendarConfig.editableEvents"
                :min-split-width="100"
                :sticky-split-labels="false"
                :on-event-click="onEventClick"
                :cell-click-hold="false"
                @ready="logEvents($event)"
                @view-change="viewChange($event)"
                @cell-click="cellClick('click', $event)"
                @cell-dblclick="cellClick('dblclick', $event)"
            >
                <template #no-event="{}">
                    <p>No meetings</p>
                </template>

                <template #event="{ event, view }">
                    
                    <div v-if="view === 'week'">
                        <div class="font-semibold flex items-center gap-x-1">
                            <span>{{ event.content.hour }}</span>
                            <span class="w-4 h-4 rounded-full bg-current block"></span>
                            <span>{{ `+${event.content.guests}` }}</span>
                        </div>
                        <div>
                            <span class="title">{{ event.content.title }} - </span>
                            <span class="title font-semibold leading-4">{{ event.content.info }}</span>
                        </div>
                    </div>

                    <div v-if="view === 'day'">
                        <div class="font-semibold flex items-center gap-x-1">
                            <span>{{ event.content.hour }}</span>
                            <span class="w-4 h-4 rounded-full bg-current block"></span>
                            <span>{{ `+${event.content.guests}` }}</span>
                        </div>
                        <div class="flex gap-x-4">
                            <span>{{ event.content.title }}</span>
                            <span class="title font-semibold leading-4">{{ event.content.info }}</span>
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
            <template v-else-if="selectedEvent">
                <h5 class="drawer-section-title">
                    <span>
                        <i class="pi pi-info-circle"></i>
                        Infos
                    </span>
                </h5>
                <ul class="list">
                    <li>
                        <span>ID</span>
                        <span>{{ selectedEvent.meeting_id }}</span>
                    </li>
                    <li>
                        <span>Date</span>
                        <span>{{ formatDate(selectedEvent.start_date, 'DD/MM/YYYY') }}</span>
                    </li>
                    <li>
                        <span>Hour</span>
                        <span>{{ formatDate(selectedEvent.start_date, 'HH:mm') }} - {{ formatDate(selectedEvent.end_date, 'HH:mm') }}</span>
                    </li>
                    <li>
                        <span>Area</span>
                        <span>{{ selectedEvent.area.label }}</span>
                    </li>
                    <li>
                        <span>Market</span>
                        <span>{{ selectedEvent.market.label }}</span>
                    </li>
                    <li>
                        <span>Guests count</span>
                        <span>{{ selectedEvent.guests && `${selectedEvent.guests.length}+` }}</span>
                    </li>
                    <li class="items-center">
                        <span>Status</span>
                        <span :class="['badge', meetingStatus(selectedEvent.status).cls]">{{ meetingStatus(selectedEvent.status).label }}</span>
                    </li>
                </ul>

                <div v-if="selectedEvent.organizer" class="mt-4">
                    <h5 class="drawer-section-title">
                        <span>
                            <i class="pi pi-user"></i>
                            Organizer
                        </span>
                    </h5>
                    <ul class="list">
                        <li>
                            <span>Full name</span>
                            <span>{{ `${selectedEvent.organizer.first_name} ${selectedEvent.organizer.last_name}` }}</span>
                        </li>
                        <li>
                            <span>Role</span>
                            <span>{{ selectedEvent.organizer.role }}</span>
                        </li>
                    </ul>
                </div>

                <div v-if="selectedEvent.guests" class="mt-4">
                    <h5 class="drawer-section-title">
                        <span>
                            <i class="pi pi-users"></i>
                            Guests ({{ selectedEvent.guests.length }})
                        </span>
                    </h5>
                    <div v-for="guest in selectedEvent.guests" :key="guest.id" class="bg-slate-50 border border-gray-200 p-3 rounded-md mb-3">
                        <ul class="list">
                            <li>
                                <span>Full name</span>
                                <span>{{ `${guest.first_name} ${guest.last_name}` }}</span>
                            </li>
                            <li>
                                <span>Email</span>
                                <span>{{ guest.email }}</span>
                            </li>
                            <li>
                                <span>Title</span>
                                <span>{{ guest.position }}</span>
                            </li>
                        </ul>
                    </div>
                </div>

            </template>
        </Drawer>

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

.sko { @apply bg-blue-50/50 text-blue-700 border border-blue-100 border-l-4 border-l-blue-300 }
.em { @apply bg-orange-50/50 text-orange-700 border border-orange-100 border-l-4 border-l-orange-300 }
.eur { @apply bg-lime-50/50 text-lime-700 border border-lime-100 border-l-4 border-l-lime-300  }
.cga { @apply bg-teal-50/50 text-teal-700 border border-teal-100 border-l-4 border-l-teal-300  }
.nam { @apply bg-cyan-50/50 text-cyan-700 border border-cyan-100 border-l-4 border-l-cyan-300  }
.jap { @apply bg-indigo-50/50 text-indigo-700 border border-indigo-100 border-l-4 border-l-indigo-300  }
.lam { @apply bg-purple-50/50 text-purple-700 border border-purple-100 border-l-4 border-l-purple-300  }
.eur { @apply bg-pink-50/50 text-pink-700 border border-pink-100 border-l-4 border-l-pink-300  }

.vuecal__heading { @apply !h-auto }
.weekday-label { @apply !flex !flex-col !items-start pb-3 pt-2 }
.weekday-label .full { @apply uppercase text-gray-600 font-bold text-xs }
.weekday-label span:last-child { @apply uppercase text-gray-600 font-bold text-2xl }

.vuecal__event.disabled {
    cursor: no-drop;
    background: repeating-linear-gradient(45deg, transparent, transparent 10px, #f2f2f2 10px, #f2f2f2 20px);/* IE 10+ */
    color: #999;
}

.vuecal__cell--disabled { @apply bg-gray-100 }

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