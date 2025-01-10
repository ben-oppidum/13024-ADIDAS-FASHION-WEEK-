import type { RoleNumber } from '@/interfaces/user'

interface State {
    title: string;
    area: string;
    organizer: string;
    externalAccount: string;
    startDate: string;
    startHour: string;
    endDate: string;
    endHour: string;
    guests: number[];
    internalComment: string;
    guestComment: string;
}

interface Permissions {
    maxMeeting: number | null;
    maxDuration: number | null;
    maxAttendees: number | null;
}

function calculateDuration(startTime: string, endTime: string): number {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Convert times to minutes since midnight
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    // Calculate the difference in minutes
    const durationMinutes = endTotalMinutes - startTotalMinutes;

    // Handle negative duration (crossing midnight)
    if (durationMinutes < 0) return 1000

    return durationMinutes;
}

export function meetingPermission(area:number) {
    let permissions: Permissions | null = null;
    switch (area) {
        case 2: // Meeting Room Flat Paris
            permissions = {
                maxMeeting: 1,
                maxDuration: 60,
                maxAttendees: 3
            }
            break;

        case 3: // Meeting Room Parc Royal
            permissions = {
                maxMeeting: 1,
                maxDuration: 60,
                maxAttendees: 8
            }
            break;

        case 4: // FI Preview
            permissions = {
                maxMeeting: 1,
                maxDuration: null,
                maxAttendees: null
            }
            break;

        case 5: // Ogla Preview
            permissions = {
                maxMeeting: 1,
                maxDuration: 30,
                maxAttendees: null
            }
            break;
    
        default: break;
    }

    return permissions
}

export const checkFormSubmitttion = (area:number, userRole:RoleNumber, state:State) => {
    // If user is Admin or Area is Thorigny return because all permissions are allowed
    if(userRole === 1 || area === 1) return null

    const permissions = meetingPermission(area)
    if (!permissions) return null

    let message = ''

    // Check Duration
    if (permissions.maxDuration !== null && state.startHour && state.endHour) {
        const selectedDuration = calculateDuration(state.startHour, state.endHour);
        if (selectedDuration > permissions.maxDuration) return message = `Warning: The max allowed duration is ${permissions.maxDuration} min`;
    }

    // Check Max Attendees
    if (permissions.maxAttendees !== null) {
        const selectedAttendees = state.guests.length;
        console.log(selectedAttendees);
        if (selectedAttendees > permissions.maxAttendees) return message = `Warning: The max allowed attendees is ${permissions.maxAttendees}`;;
    } 

    return null
}