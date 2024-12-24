import './assets/main.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

import App from './App.vue'
import router from './router'

// Global Components Import
import PageTitle from '@/components/PageTitle.vue'

// PrimeVue
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import Tooltip from 'primevue/tooltip'
import Skeleton from 'primevue/skeleton'
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Message from 'primevue/message'
import Dialog from 'primevue/dialog'

// FormKit
import { plugin, defaultConfig } from '@formkit/vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// PrimeVue
app.directive('tooltip', Tooltip)
app.use(ConfirmationService)
app.component('Button', Button)
app.component('Skeleton', Skeleton)
app.component('ConfirmDialog', ConfirmDialog)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Message', Message)
app.component('Dialog', Dialog)
app.use(PrimeVue, {
    theme: 'none'
});

// Formkit
app.use(plugin, defaultConfig({ 
    plugins: [] 
}))

// Global Components
app.component('PageTitle', PageTitle)

const authStore = useAuthStore()
authStore.getAuth().then(() => {
    app.mount('#app');
});
