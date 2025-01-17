import { ref, computed, onMounted } from 'vue'
import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', () => {
    const appConfig = ref({
        version: '1.0.0',
        mode: '',
    })

    const roles = [
        { id: 1, name: 'Admin' },
        { id: 2, name: 'Sales Market Internal' },
        //{ id: 3, name: 'Sales LFS Internal' },
        //{ id: 4, name: 'Reception' },
        { id: 5, name: 'Global Internal' },
        { id: 6, name: 'Client' },
        { id: 7, name: 'PR' },
    ]

    return { appConfig, roles }
})
