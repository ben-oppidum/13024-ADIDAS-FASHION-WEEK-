import { ref, onMounted } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import type { Area } from '@/interfaces/area'

import { axiosHeader } from '@/functions'
import { endPoint } from '@/stores/environment'

/* Global */
const header = axiosHeader()

export const useAreas = (autoLoad:boolean = false) => {
    const areas = ref<Area[] | null>(null)
    const loading = ref(true)

    const getAreas = async () => {
        loading.value = true

        try {
            const response = await axios.get(endPoint.areas, header)
            areas.value = response.data
        } catch (error) {
            if (axios.isAxiosError(error) && error.response && error.response.data) console.log(error.response.data)
        } finally {
            loading.value = false
        }
    }

    onMounted(async () => {
        if(autoLoad) await getAreas()
    })

    return {
        areas,
        loading,
        getAreas
    }
}

// Type definition for the return value
export type UseAreasReturn = {
    areas: Ref<Area[] | null>
    loading: Ref<boolean>
    getAreas: () => Promise<void>
}