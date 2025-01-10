import { ref, onMounted } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import type { Meeting, MeetingCalendar } from '@/interfaces/meeting'

import { axiosHeader, formatDate, getAreaType } from '@/functions'
import { endPoint } from '@/stores/environment'

/* Global */
const header = axiosHeader()

export const useMeetings = (autoLoad:boolean = false, formatData = false) => {
    const meetings = ref<Meeting[] | null>(null)
    const meetingsCalendar = ref<MeetingCalendar[] | null>(null)
    const loading = ref(true)

    const getMeetings = async (params?:string) => {
        loading.value = true
        meetings.value = null
        const meetingsEndpoint = 
            params ? `${endPoint.meetings}?${params}` : 
            endPoint.meetings

        try {
            const response = await axios.get(meetingsEndpoint, header)
            const responseData: Meeting[] = response.data;

            if(formatData) {
                const formatedMeeting = responseData.map((item: Meeting) => formatMeetingData(item));
                meetingsCalendar.value = formatedMeeting
                return
            } 

            meetings.value = responseData
            
        } catch (error) {
            if (axios.isAxiosError(error) && error.response && error.response.data) console.log(error.response.data)
        } finally {
            loading.value = false
        }
    }

    onMounted(async () => {
        if(autoLoad) await getMeetings()
    })

    return {
        meetings,
        meetingsCalendar,
        loading,
        getMeetings
    }
}

function formatMeetingData(meeting: Meeting): MeetingCalendar {
    const guestsCount = meeting.guests ? meeting.guests.length : 0
    const areaType = getAreaType(meeting.area_id) || ''
    const info = meeting.title
    const market = meeting.market && meeting.market.label ? meeting.market.label.toLowerCase() : ''

    return {
        id: meeting.id,
        meetingId: meeting.meeting_id,
        start: formatDate(meeting.start_date, 'YYYY-MM-DD HH:mm'),
        end: formatDate(meeting.end_date, 'YYYY-MM-DD HH:mm'),
        title: areaType,
        content: {
            hour: formatDate(meeting.start_date, 'HH:mm'),
            guests: guestsCount,
            title: areaType,
            info: info,
            areaId: meeting.area.id,
            exAccount: meeting.external_account_id,
        },
        class: market,
        disabled: true,
        draggable: false,
    }
  }

// Type definition for the return value
export type UseMeetingsReturn = {
    meetings: Ref<Meeting[] | null>
    meetingsCalendar: Ref<MeetingCalendar[] | null>
    loading: Ref<boolean>
    getMeetings: (params?: string) => Promise<void>
}