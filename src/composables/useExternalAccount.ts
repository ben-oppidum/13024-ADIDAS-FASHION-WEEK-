import { ref, onMounted } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import type { ExternalAccount, ExternalAccountSmall } from '@/interfaces/external-account'

import { axiosHeader } from '@/functions'
import { endPoint } from '@/stores/environment'

/* Global */
const header = axiosHeader()

export const useExternalAccount = (autoLoad:boolean = false) => {
    const externalAccounts = ref<ExternalAccount[] | null>(null)
    const externalAccountsSmall = ref<ExternalAccountSmall[] | null>(null)
    const loading = ref(true)

    const getExternalAccount = async (params?:string) => {
        loading.value = true
        const exAccountEndpoint = 
            params ? `${endPoint.externalAccount}?${params}` : 
            endPoint.externalAccount

        try {
            const response = await axios.get(exAccountEndpoint, header)

            // Sort By Name
            response.data.sort((a:ExternalAccount, b:ExternalAccount) => {
                if(a.label < b.label) { return -1; }
                if(a.label > b.label) { return 1; }
                return 0;
            });

            if(params?.includes('less')) {
                externalAccountsSmall.value = response.data
            } else {
                externalAccounts.value = response.data
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response && error.response.data) console.log(error.response.data)
        } finally {
            loading.value = false
        }
    }

    return {
        externalAccounts,
        externalAccountsSmall,
        loading,
        getExternalAccount
    }
}

// Type definition for the return value
export type UseExternalAccountReturn = {
    externalAccounts: Ref<ExternalAccount[] | null>
    externalAccountsSmall: Ref<ExternalAccountSmall[] | null>
    loading: Ref<boolean>
    getExternalAccount: (params?: string) => Promise<void>
}