import { ref, computed, onMounted } from 'vue'
import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', () => {
    const appConfig = ref({
        version: '1.0.0',
        mode: '',
    })

    return { appConfig }
})
