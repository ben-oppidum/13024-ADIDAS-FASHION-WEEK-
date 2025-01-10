import axios from 'axios'
import moment from 'moment'

type TextType = 'meetingAccepted' | 'meetingRejected' | 'meetingNeedApproval' | 'meetingCreated' | 'meetingEdited' | 'userCreated';

const BOT_TOKEN = import.meta.env.VITE_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TG_ID;
const now = moment();

export const telegramBot = async (type:string, id:string) => {
    const footerMessage = `\nAt ${now.format('DD/MM/YYYY - HH:mm')}\n@ Adidas Fashion Week APP.`

    const texts: Record<TextType, { text: string }> = {
        meetingCreated: { 
            text: `🟢 # Meetings #\nThe Meeting ${id} it is created by admin` 
        },
        meetingEdited: { 
            text: `🟢 # Meetings #\nThe Meeting ${id} it is edited by admin` 
        },
        meetingNeedApproval: { 
            text: `🟠 # Meetings #\nThe Meeting ${id} it is created and needs approval.` 
        },
        meetingAccepted: { 
            text: `🟢 # Meetings #\nThe Meeting ${id} is now accepted by admin` 
        },
        meetingRejected: { 
            text: `🔴 # Meetings #\nThe Meeting ${id} is rejected by admin` 
        },
        userCreated: { 
            text: `🟢 # Contacts #\nA new contact ${id} it is created` 
        },
    }    

    let formData = new FormData()
    formData.append('chat_id', CHAT_ID)
    formData.append('text', `${texts[type as TextType].text} ${footerMessage}`); 

    try {
        const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, formData, {
            headers: { 
                'Content-Type': 'application/json'
            }
        })

        if(response.data.ok) return true
    } catch (error) {
        console.log(error);
        return false
    } 
}

// 🟠 🟢 🔴