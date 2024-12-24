<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import VueCal from 'vue-cal'
import 'vue-cal/dist/drag-and-drop.es.js'
import 'vue-cal/dist/vuecal.css'

import { events } from '@/stores/fakeevents'

// Calendar Config
const calendarConfig = ref({
    hideViewSelector: true,
    hideTitlebar: true,
    disableViews: ['years', 'year', 'month'],
    activeView: 'week',
    selectedDate: '2025-01-21',
    eventOnMonthView: false, // or short
    disableDays: ['2025-01-20'],
    timeStep: 30,
    timeCellHeight: 60,
    editableEvents: { 
        title: false, 
        drag: true, 
        resize: true, 
        delete: false, 
        create: false 
    },
})

// Calendar Title
const calendarTitle = ref('')
function formatWeekInfo({ startDate, endDate, week }) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startMonth = start.toLocaleString('en-US', { month: 'long' });
    const endMonth = end.toLocaleString('en-US', { month: 'long' });

    const startYear = start.getFullYear();
    const endYear = end.getFullYear();

    // Check if months and years are the same
    if (startMonth === endMonth && startYear === endYear) {
        return `Week ${week} (${startMonth} ${startYear})`;
    } else {
        return `Week ${week} (${startMonth} ${startYear} - ${endMonth} ${endYear})`;
    }
}
function formatDayInfo(startDate) {
    const date = new Date(startDate);

    const day = date.getDate(); 
    const month = date.toLocaleString('en-US', { month: 'long' }); 
    const year = date.getFullYear();

    console.log(date);

    return `${day} ${month} ${year}`;
}

const onEventDrop = ({ event, originalEvent, external }) => {}
const logEvents = (event) => {
    // const loggedEvent = typeof str === 'object' ? str : e

    // console.log(loggedEvent);
    
    if(calendarConfig.value.activeView === 'week') calendarTitle.value = formatWeekInfo(event)
    if(calendarConfig.value.activeView === 'day') calendarTitle.value = formatDayInfo(event.startDate)
}
const viewChange = (e) => calendarConfig.value.activeView = e.view

const cellClick = (clickType, e) => {
    if(clickType === 'click') return

    calendarTitle.value = formatDayInfo(e)
}
const onEventClick = (e) => {
    if(calendarConfig.value.activeView === 'day') {
        if(e.disabled) console.log('Not allowed');
        if(!e.disabled) console.log('Popup');
    }
}

// Toogle Days Week
const changeView = (view) => calendarConfig.value.activeView = view
</script>

<template>
    <div>
        <div class="flex gap-x-3 mb-6">
            <div class="form-group">
                <label class="font-semibold block text-gray-950 mb-1">Organizer</label>
                <select class="border py-2 px-4 w-full">
                    <option value="" selected disabled cl>Select an organizer</option>
                </select>
            </div>
            <div class="form-group">
                <label class="font-semibold block text-gray-950 mb-1">Area</label>
                <select class="border py-2 px-4 w-full">
                    <option value="" selected disabled cl>Select an area</option>
                </select>
            </div>
            <div class="form-group">
                <label class="font-semibold block text-gray-950 mb-1">Ext. Account</label>
                <select class="border py-2 px-4 w-full">
                    <option value="" selected disabled cl>Select an ext. account</option>
                </select>
            </div>
        </div>
        <div class="flex justify-between items-start mb-5">
            <div class="flex bg-gray-200 text-gray-600 rounded-md">
                <template v-if="calendarConfig.activeView === 'day'">
                    <button class="px-3 py-3 flex items-center border-r border-white transition-all duration-100 ease-in-out" @click="$refs.vuecal.previous()">
                        <i class="pi pi-chevron-left"></i>
                    </button>
                    <button @click="calendarConfig.selectedDate = new Date()" class="font-semibold block leading-none px-6">Today</button>
                    <button class="px-3 py-3 flex items-center border-l border-white transition-all duration-100 ease-in-out" @click="$refs.vuecal.next()">
                        <i class="pi pi-chevron-right"></i>
                    </button>
                </template>
            </div>
            <div>
                <h1 class="text-black font-semibold text-center text-xl capitalize">{{ calendarTitle }}</h1>
            </div>
            <div class="flex gap-x-2 mb-4">
                <button type="button" :class="['font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 hover:text-gray-500 transition-all duration-100 ease-in-out', calendarConfig.activeView === 'week' ? 'bg-gray-900 hover:bg-gray-900 hover:text-white text-white' : 'text-gray-400']" @click="changeView('week')">Week</button>
                <button type="button" :class="['font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 hover:text-gray-500 transition-all duration-100 ease-in-out', calendarConfig.activeView === 'day' ? 'bg-gray-900 hover:bg-gray-900 hover:text-white text-white' : 'text-gray-400']" @click="changeView('day')">Day</button>
            </div>
        </div>
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
            :events="events"
            :disable-days="calendarConfig.disableDays"
            :today-button="false"
            :editable-events="calendarConfig.editableEvents"
            :min-split-width="100"
            :sticky-split-labels="false"
            :on-event-click="onEventClick"
            :cell-click-hold="false"
            @ready="logEvents($event)"
            @event-drop="onEventDrop"
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
                        <span class="title">{{ event.content.title }}</span>
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
    </div>
</template>

<style>
/* Global */
.vuecal__cell-events { @apply cursor-pointer }
.vuecal__now-line {color: #06c;}
.vuecal__cell-events-count { @apply w-4 h-4 rounded-full bg-blue-500 text-white text-center flex items-center justify-center }

/* Cell Title */
.vuecal__event { @apply flex items-center text-xs !text-left border-[0.5px] border-gray-200 py-0.5 px-1 }
.vuecal__event .vuecal__event-title { @apply line-clamp-2 }
.vuecal__event .vuecal__event-svg { @apply w-2.5 h-2.5 min-w-2.5 min-h-2.5 mr-1 }

.vuecal__event--dragging {background-color: rgba(60, 60, 60, 0.3);}
.vuecal__cell--today { @apply bg-gray-100 }
.vuecal__cell--disabled { @apply line-through text-gray-200 }

.vuecal__event { @apply text-sm border-0 shadow-none px-3 leading-tight }
.vuecal__event .title { @apply line-clamp-1 }
.vuecal__event:not(.disabled):hover .title { @apply line-clamp-none }

.jap { @apply bg-blue-50 text-blue-900 border border-blue-100 border-l-4 border-l-blue-900 }
.nam { @apply bg-orange-50 text-orange-900 border border-orange-100 border-l-4 border-l-orange-900 }
.gip { @apply bg-green-50 text-green-900 border border-green-100 border-l-4 border-l-green-900  }

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
</style>