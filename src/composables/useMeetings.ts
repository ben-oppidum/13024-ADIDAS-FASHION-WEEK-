import { ref, onMounted } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import type { Meeting, MeetingCalendar } from '@/interfaces/meeting'

import { axiosHeader, formatDate } from '@/functions'
import { endPoint } from '@/stores/environment'

// TS
export type ScheduleItem = {
    id: number;
    from: number;
    to: number;
    class: string;
};

export type Schedule = {
    [key: number]: ScheduleItem[];
};

/* Global */
const header = axiosHeader()

function formatMeetingData(meeting: Meeting): MeetingCalendar {
    const guestsCount = meeting.guests ? meeting.guests.length : 0

    const marketsLabel = meeting.guests && meeting.guests.map(g => g.market)
    const markets = [...new Set(marketsLabel)]
    //const exAccount = getExternalAccounts(meeting)
    const marketClass = meeting.market && meeting.market.label ? meeting.market.label.toLowerCase() : ''
    // const info = 
    //     exAccount ? `${exAccount.join("").toString()} - ${market.toUpperCase()}` : 
    //     market.toUpperCase()


    return {
        id: meeting.id,
        meetingId: meeting.meeting_id,
        start: formatDate(meeting.start_date, 'YYYY-MM-DD HH:mm'),
        end: formatDate(meeting.end_date, 'YYYY-MM-DD HH:mm'),
        title: meeting.area.label,
        content: {
            startHour: formatDate(meeting.start_date, 'HH:mm'),
            endHour: formatDate(meeting.end_date, 'HH:mm'),
            guests: guestsCount,
            title: meeting.area.label,
            areaId: meeting.area.id,
            externalAccountIds: meeting.external_account_ids,
            organizer: meeting.organizer && `${meeting.organizer.first_name} ${meeting.organizer.last_name}`,
            meetingMarket: meeting.market && meeting.market.id,
            markets: markets || []
        },
        class: marketClass,
        disabled: false,
        draggable: false,
    }
}

export const useMeetings = (autoLoad:boolean = false, formatData = false) => {
    const meetings = ref<Meeting[] | null>(null)
    const meetingsCalendar = ref<MeetingCalendar[] | null>(null)
    const disabledHours = ref<Schedule | null>( null)
    const loading = ref(true)

    const getMeetings = async (params?:string) => {
        loading.value = true
        meetings.value = null
        meetingsCalendar.value = null
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

            // Sort Meetings 
            responseData.sort((a:Meeting, b:Meeting) => {
                const dateA = new Date(a.created_at).getTime(); 
                const dateB = new Date(b.created_at).getTime();
                return dateA - dateB; 
            });

            meetings.value = responseData
            
        } catch (error) {
            if (axios.isAxiosError(error) && error.response && error.response.data) console.log(error.response.data)
        } finally {
            loading.value = false
        }
    }

    const setDisabledHours = (selectedArea:number, clear?:boolean) => {
        if(clear) {
            disabledHours.value = {}
            return
        }

        if(meetingsCalendar.value) {

            // Convert Day to Number from 1 to 7
            function getDayNumber(date:string) {
                const day = new Date(date).getDay();
                return day === 0 ? 7 : day;
            }

            // Convert Time to Decimal
            function timeToDecimal(time: string): number {
                const [hours, minutes] = time.split(':').map(Number);
                return hours + minutes / 60;
            }

            // Filter All Meetings Area Except the selected Area
            const otherMeetings = meetingsCalendar.value.filter(meeting => meeting.content.areaId !== selectedArea)
            let structuredDisabledDays: Schedule = {};

            if (otherMeetings && otherMeetings.length > 0) {
                otherMeetings.forEach((day) => {
                    const dayNumber = getDayNumber(day.start);
                    if (!structuredDisabledDays[dayNumber]) {
                        structuredDisabledDays[dayNumber] = []; 
                    }
                    structuredDisabledDays[dayNumber].push({
                        id: day.id,
                        from: timeToDecimal(day.content.startHour) * 60,
                        to: timeToDecimal(day.content.endHour) * 60,
                        class: 'closed',
                    });
                });
            }

            disabledHours.value = structuredDisabledDays

        }
    }

    const deleteMeeting = async (meetingId: string): Promise<string> => {
        if (meetingId) {
            try {
                const response = await axios.delete(`${endPoint.meetings}/${meetingId}`, header);
                return response.data.message;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response && error.response.data) {
                    return error.response.data.message || "An error occurred while deleting the meeting.";
                }
                return "An unexpected error occurred.";
            }
        }
        return "Invalid meeting ID provided.";
    };

    onMounted(async () => {
        if(autoLoad) await getMeetings()
    })

    return {
        meetings,
        meetingsCalendar,
        disabledHours,
        loading,
        getMeetings,
        setDisabledHours,
        deleteMeeting
    }
}

// Type definition for the return value
export type UseMeetingsReturn = {
    meetings: Ref<Meeting[] | null>
    meetingsCalendar: Ref<MeetingCalendar[] | null>
    disabledHours: Ref<Schedule | null>
    loading: Ref<boolean>
    getMeetings: (params?: string) => Promise<void>
    setDisabledHours: (id: number, clear?:boolean) => void;
    deleteMeeting: (meetingId: string) => void;
}