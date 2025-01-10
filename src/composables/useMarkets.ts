import { ref, onMounted } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import type { Market } from '@/interfaces/market'

import { axiosHeader } from '@/functions'
import { endPoint } from '@/stores/environment'

/* Global */
const header = axiosHeader()

export const useMarkets = (autoLoad:boolean = false) => {
    const markets = ref<Market[] | null>(null)
    const loading = ref(true)

    const getMarkets = async () => {
        loading.value = true

        try {
            const response = await axios.get(endPoint.markets, header)
            markets.value = response.data
        } catch (error) {
            if (axios.isAxiosError(error) && error.response && error.response.data) console.log(error.response.data)
        } finally {
            loading.value = false
        }
    }

    onMounted(async () => {
        if(autoLoad) await getMarkets()
    })

    return {
        markets,
        loading,
        getMarkets
    }
}

// Type definition for the return value
export type useMarketsReturn = {
    markets: Ref<Market[] | null>
    loading: Ref<boolean>
    getMarkets: () => Promise<void>
}