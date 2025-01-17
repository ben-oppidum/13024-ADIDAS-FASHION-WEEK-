import { ref, onMounted } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'

import { axiosHeader } from '@/functions'
import { endPoint } from '@/stores/environment'
import type { User } from '@/interfaces/user'
import type { UserSmall } from '@/interfaces/user-small'
import type { Pagination } from '@/interfaces/pagination'

/* Global */
const header = axiosHeader()

export const useUsers = (autoLoad:boolean = false) => {
    const users = ref<User[] | null>(null)
    const usersSmall = ref<UserSmall[] | null>(null)
    const loading = ref<boolean>(true)
    const errorMessage = ref<string | null>(null)
    const pagination = ref<Pagination | null>(null)

    const getUsers = async (params?:string) => {
        loading.value = true
        users.value = null

        const usersEndpoint = 
            params ? `${endPoint.users}?${params}` : 
            endPoint.users

        try {
            const response = await axios.get(usersEndpoint, header)

            // Sort Users 
            response.data.users.sort((a:User, b:User) => {
                if(a.last_name < b.last_name) { return -1; }
                if(a.last_name > b.last_name) { return 1; }
                return 0;
            });
            
            users.value = response.data.users
            pagination.value = response.data.pagination
        } catch (error) {
            if (axios.isAxiosError(error) && error.response && error.response.data) console.log(error.response.data)
        } finally {
            loading.value = false
        }
    }

    const searchUsers = async (paramsUsers:string) => {
        loading.value = true

        try {
            const response = await axios.get(`${endPoint.users}?search=${paramsUsers}`, header)
            usersSmall.value = response.data
        } catch (error) {
            if (axios.isAxiosError(error) && error.response && error.response.data) errorMessage.value = error.response.data
        } finally {
            loading.value = false
        }
    }

    onMounted(async () => {
        if(autoLoad) await getUsers()
    })

    return {
        users,
        usersSmall,
        loading,
        errorMessage,
        pagination,
        getUsers,
        searchUsers
    }
}

// Type definition for the return value
export type UseUsersReturn = {
    users: Ref<User[] | null>
    usersSmall: Ref<UserSmall[] | null>
    pagination: Ref<Pagination | null>
    loading: Ref<boolean>
    errorMessage: Ref<string | null>
    getUsers: (params?: string) => Promise<void>
    searchUsers: (paramsUsers: string) => Promise<void>
}