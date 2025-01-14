import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

import { axiosHeader } from '@/functions'
import { endPoint } from '@/stores/environment'
import type { User } from '@/interfaces/user'

// TS
interface Navigation {
    routeName: string;
    label: string;
    path: string;
}

export const useAuthStore = defineStore('auth', () => {
    // User State
    const user = ref<User | null>(null)

    // Set Authentification used for Login Page
    const setAuth = (token: string, authUser: User) => {
        user.value = authUser
        localStorage.setItem('token', token) 
    }

    // Get Authentification used for main.ts
    const getAuth = async () => {
        const token = localStorage.getItem('token')

        if(token) {
            try {
                const header = axiosHeader()
                const response = await axios.get(endPoint.auth, header);
                user.value = response.data
        
            } catch (error) {
                if (axios.isAxiosError(error) && error.response && error.response.data) console.log(error.response.data)
                setLogOut()
            }
        } else {
            console.error('🆘 User not found');
        }
    }

    // Check if the user is an Admin
    const isAdmin = computed(() => user.value?.role_id === 1 ? true : false)

    // Check if the user is an Admin
    const isSale = computed(() => user.value?.role_id === 2 || user.value?.role_id === 3 ? true : false)

    // Set Logout Function
    const setLogOut = () => {
        window.localStorage.clear();
        window.location.href = "/login"
    }

    return { 
        user, 
        isAdmin,
        isSale,
        getAuth, 
        setAuth, 
        setLogOut 
    }
})
