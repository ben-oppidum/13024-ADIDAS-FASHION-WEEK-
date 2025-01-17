import moment from 'moment/min/moment-with-locales'
import type { UserSmall } from '@/interfaces/user-small'
import type { Meeting, Guest } from '@/interfaces/meeting';
import type { ExternalAccountSmall, ExternalAccountType } from '@/interfaces/external-account'

// Format Date
export const formatDate = (date:string | Date, format = 'DD-MM-YYYY') => moment.utc(date).format(format);

// From Now Date
export function fromNowDate(date:string) {
    const givenDate = moment(date);
    const today = moment();
    const diffInDays = today.diff(givenDate, 'days');

    if (diffInDays <= 10) {
        return givenDate.fromNow(); 
    } else {
        return givenDate.format('YYYY-MM-DD'); 
    }
}

// Axios Header
export function axiosHeader(contentType:string = 'application/json') {
    const token = localStorage.getItem('token')
    return {
        headers: { 
            'Content-Type': contentType,
            'Accept': 'application/json',
            'x-auth-token': token
        }
    }
}

// Format User Role
export const getRoleName = (roleId:number) => {
    switch (roleId) {
        case 1: return 'Admin';
        case 2: return 'Sales Market Internal';
        case 3: return 'Sales LFS Internal';
        case 4: return 'Reception';
        case 5: return 'Global Internal';
        case 6: return 'Client';
    
        default: return 'Unknown Role';
    }
}

// Format Area Type
export function getAreaType(type:number) {
    switch (type) {
        case 1: return 'Showroom'
        case 2: return 'Meeting'
        case 3: return 'FI'
        case 4: return 'Ogla'
            
        default: return ''
    }
}

// Meeting Status
export function meetingStatus(status:number) {
    switch (status) {
        case 1: return { label: 'In progress', cls: 'bg-orange-500 border-orange-500 text-white' }
        case 2: return { label: 'Accepted', cls: 'bg-green-500 border-green-500 text-white' }
        case 3: return { label: 'Rejected', cls: 'bg-red-500 border-red-500 text-white' }
            
        default: return { label: '', cls: '' }
    }
}

export const userSearchDisplay = (user:UserSmall) => {
    if(!user.first_name || !user.last_name || !user.role_id) return
    return `${user.first_name} ${user.last_name} (${getRoleName(user.role_id)})`
}

// Convert Date & Timr to ISO Format
export function convertToIso(date: string, time: string) {
    const dateTime = new Date(`${date}T${time}:00Z`);
    const formattedDateTime = dateTime.toISOString();

    return formattedDateTime
}

// Get External Account from meeting
export const getExternalAccounts = (ids:number[], externalAccounts:ExternalAccountSmall[]) => {
    const filteredData = externalAccounts.filter(ex => ids.includes(ex.id));
    return filteredData.length > 0 ? filteredData : null
    // const guests = meeting.guests.map((g:Guest) => g.external_account_label)
    // const uniqueExternalAccounts = [...new Set(guests.filter((label) => label !== null && label !== undefined))];
    
    // return uniqueExternalAccounts.length > 0 ? uniqueExternalAccounts : null
}

export const getExternalAccountLabel = (ids:number[], externalAccounts:ExternalAccountSmall[]) => {
    if(ids && externalAccounts) {
        let labels:any = []

        const filteredData = externalAccounts.filter(ex => ids.includes(ex.id));
        filteredData.forEach(el => {
            labels.push(`${el.label} - ${el.market_label}`)
        });
        return labels.join("").toString()
    }

    return null
}

export function setExternalAccountSelect(userRole:number, exType:ExternalAccountType) {
    exType.state = false

    if(userRole && userRole === 6) {
        exType.state = true
        exType.type = 'single'
        return 
    }
    if(userRole && (userRole === 2 || userRole === 3 || userRole === 5)) {
        exType.state = true
        exType.type = 'multiselect'
        return
    }

    return exType
}