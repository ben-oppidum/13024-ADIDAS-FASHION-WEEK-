<script setup lang="ts">
import { ref, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useToast } from "primevue/usetoast"
import Paginator from 'primevue/paginator'
import ToggleSwitch from 'primevue/toggleswitch';
import { useMagicKeys } from '@vueuse/core'

import { useUsers } from '@/composables/useUsers'
import type { UseUsersReturn } from '@/composables/useUsers'

import { useMarkets } from '@/composables/useMarkets'
import type { useMarketsReturn } from '@/composables/useMarkets'

import { useExternalAccount } from '@/composables/useExternalAccount'
import type { UseExternalAccountReturn } from '@/composables/useExternalAccount'

import type { User, Notification } from '@/interfaces/user'

import { useGlobalStore } from '@/stores/global'
import { fromNowDate, getAreaType, formatDate } from '@/functions'

import CreateExternalAccount from '@/components/contacts/CreateExternalAccount.vue'
import CreateNewContact from '@/components/contacts/CreateNewContact.vue'
import SelectExAccount from '@/components/SelectExAccount.vue'
import ContactDetails from '@/components/contacts/ContactDetails.vue'

// Global
const store = useGlobalStore()
const toast = useToast()
const { enter } = useMagicKeys()

// Get Users 
const { users: contacts, loading: loadingContacts, pagination, getUsers }: UseUsersReturn = useUsers(false)

// Get Markets 
const { markets, loading: loadingMarkets }: useMarketsReturn = useMarkets(true)

// Get External Account 
const { externalAccounts, loading: loadingExAccount }: UseExternalAccountReturn = useExternalAccount(true)

// Table Config
const expandedRows = ref({});

// Table Pagination
interface TablePagination {
    first: number;
    page: number;
    pageCount?: number;
    rows: number;
}
const setPage = async (e:TablePagination) => {
    const nextPage = e.page + 1
    query.value.has('page') ? 
        query.value.set('page', nextPage.toString()) : 
        query.value.append('page', nextPage.toString())

    query.value.has('limit') ? 
        query.value.set('limit', e.rows.toString()) : 
        query.value.append('limit', e.rows.toString())

    await getUsers(query.value.toString())
}

// Account Type
const selectedAccountType = ref<string>('')

// Set Account Type
const selectedRole = ref<string | null>(null)
const setAccountType = async () => {
    selectedRole.value = `role=${selectedAccountType.value}`
    
    resetFields()
    deleteParameter()

    if(selectedRole.value) await getUsers(selectedRole.value)
}

// Filter Contacts
interface Filter {
    fullname: string;
    exAccount: string;
    market: number;
    hasMeetings: boolean;
    [key: string]: string | boolean | number; 
}
const filter = ref<Filter>({
    fullname: '',
    exAccount: '',
    market: 0,
    hasMeetings: false
});

// Clear Filter
const clearFilter = ref<boolean>(false)
const resetFields = () => {
    console.log(filter.value);
    clearFilter.value = false;
    canFilter.value = false;

    for (const key in filter.value) {
        if (filter.value.hasOwnProperty(key)) {
            const filterKey = key as keyof Filter;
            if (typeof filter.value[filterKey] === 'string') {
                filter.value[filterKey] = '';
            } else if (typeof filter.value[filterKey] === 'boolean') {
                filter.value[filterKey] = false;
            } else if (typeof filter.value[filterKey] === 'number') {
                filter.value[filterKey] = 0;
            }
        }
    }
}
const setClearFilter = async () => {
    resetFields()
    deleteParameter()
    if(selectedRole.value) await getUsers(selectedRole.value);
}

// Block Filter Button if any input is empty
const canFilter = ref<boolean>(false)
const hasTruthyValue = (obj:any) => Object.values(obj).some(value => Boolean(value))
watch(filter.value, async (newVal) => {
    if(hasTruthyValue(newVal)) canFilter.value = true
})

// Delete parameter and add the new value 
const deleteParameter = () => {
    query.value.delete('fullname');
    query.value.delete('market');
    query.value.delete('role');
    query.value.delete('hasMeetings');
}

// Search Contact Server-Side
const query = ref(new URLSearchParams())
const searchContacts = async () => {
    deleteParameter()

    if (filter.value.fullname !== '') query.value.append('fullname', filter.value.fullname.toLowerCase());
    if (filter.value.market !== 0) query.value.append('market', filter.value.market.toString());
    if (selectedAccountType.value !== '') query.value.append('role', selectedAccountType.value);
    if (filter.value.hasMeetings === true) query.value.append('hasMeetings', filter.value.hasMeetings.toString());

    await getUsers(query.value.toString())
    clearFilter.value = true
}
watch(enter, async (v) => {
    if (v) await searchContacts()
})

// External Account Dialog
const exAccountDialog = ref<boolean>(false)

// New Account Dialog
const accountType = ref<string | null>(null)
const newContactDialog = ref<boolean>(false)

// const setContactDialog = () => {
//     accountType.value = type
//     newContactDialog.value =  true
// }

// Get Notification
const getNotificationOnSubmit = async (e:Notification) => {
    newContactDialog.value = false

    toast.add({ 
        severity: e.severity, 
        summary: 'Confirmation', 
        detail: e.message, 
        group: e.group, 
        life: 5000 
    });

    if(selectedRole.value) await getUsers(selectedRole.value)
}

// View More 
const drawerViewMore = ref<boolean>(false)
const selectedContact = ref<User | null>(null)

const viewMore = async (user:User) => {
    drawerViewMore.value = true
    selectedContact.value = user
}
</script>

<template>
    <div class="page-wrap">
        <div class="container">
            <PageTitle title="Contacts">
                <div class="flex gap-x-2">
                    <Button 
                        label="Create External Account"
                        icon="pi pi-plus"
                        icon-pos="right"
                        @click="exAccountDialog = true"
                    />
                    <Button 
                        label="Add a new contact"
                        icon="pi pi-plus"
                        icon-pos="right"
                        @click="newContactDialog =  true"
                    />
                </div>
            </PageTitle>
            <div class="mt-8">

                <div class="grid grid-cols-4">  
                    <div class="form-group">
                        <label class="form-label">Account type</label>
                        <Select 
                            v-model="selectedAccountType" 
                            :options="store.roles" 
                            optionLabel="name" 
                            optionValue="id" 
                            placeholder="Please select a type" 
                            class="w-full"
                            @change="setAccountType"
                        />
                    </div>
                </div>

                <div v-if="selectedAccountType" class="grid grid-cols-14 gap-x-3 py-3 my-3 border-y border-gray-200">  
                    <div class="form-group col-span-4 !mb-0">
                        <label class="form-label">Search by Name or Surname"</label>
                        <InputText 
                            v-model="filter.fullname" 
                            type="text" 
                            name="surname" 
                            placeholder="Name or Surname" 
                            fluid
                         />
                    </div>
                    <div class="form-group col-span-3 !mb-0">
                        <label class="form-label">Filter by External Account</label>
                        <SelectExAccount v-if="!loadingExAccount" v-model:="filter.exAccount" />
                    </div>
                    <div class="form-group !mb-0 col-span-3">
                        <label class="form-label">Filter by Market</label>
                        <Select 
                            v-model="filter.market" 
                            :options="markets || []" 
                            optionLabel="label"
                            optionValue="id"
                            placeholder="Select a Market" 
                            :loading="loadingMarkets"
                            class="w-full" 
                        />
                    </div>
                    <div class="form-group col-span-2 !mb-0">
                        <label class="form-label">Only with Meetings</label>
                        <ToggleSwitch v-model="filter.hasMeetings" class="mt-2" />
                    </div>

                    <div class="flex items-end justify-end col-span-2">
                        <Button 
                            label="Search"
                            icon="pi pi-search"
                            icon-pos="right"
                            :disabled="!canFilter"
                            @click="searchContacts"
                            @keydown.enter="searchContacts"
                        />
                    </div>

                </div>

                <div class="flex items-center justify-between">
                    <div>
                        <span v-if="pagination" class="text-gray-500">{{ `${pagination.totalItems} items found on database` }}</span>
                    </div>
                    <button v-if="clearFilter" type="button" @click="setClearFilter" class="text-gray-500 flex items-center gap-x-2">
                        <i class="pi pi-filter-slash"></i>
                        Clear filter
                    </button>
                </div>

                <div v-if="selectedAccountType" class="mt-8">
                    <DataTable 
                        :value="contacts" 
                        dataKey="id" 
                        v-model:expandedRows="expandedRows"
                        size="small" 
                        stripedRows
                        scrollable
                        sortMode="multiple"
                        filterDisplay="row"
                        :loading="loadingContacts"
                        tableStyle="min-width: 1200px"
                    >

                        <template #empty>
                            <div class="empty-data">
                                <i class="pi pi-exclamation-circle"></i> 
                                No contact found on database
                            </div>
                        </template>
                        <Column expander style="width: 50px" />

                        <Column field="reference" header="ID (Qr code)"></Column>
                        <Column field="first_name" header="Name"></Column>
                        <Column field="last_name" header="Surname"></Column>
                        <Column field="email" header="Email"></Column>
                        <Column field="phone" header="Phone number"></Column>
                        <Column header="Type of contact" class="w-[160px]">
                            <template #body="{ data }">
                                <span v-if="data.role">{{ data.role.role_name }}</span>
                            </template>
                        </Column>
                        <Column field="position" header="Title"></Column>
                        <Column header="Ex Account">
                            <template #body="{ data }">
                                <span v-if="data.external_account">{{ data.external_account.label }}</span>
                            </template>
                        </Column>
                        <Column header="Market">
                            <template #body="{ data }">
                                <span v-if="data.market">{{ data.market.label }}</span>
                            </template>
                        </Column>
                        <Column header="Action">
                            <template #body="{ data }">
                                <div class="flex gap-x-2">
                                    <!-- <Button 
                                        label="Agenda"
                                        icon="pi pi-plus"
                                        icon-pos="right"
                                        size="small"
                                    /> -->
                                    <button 
                                        type="button" 
                                        class="table-action edit"
                                        v-tooltip.top="'View more'"
                                        placeholder="Top"
                                        @click="viewMore(data)"
                                    >
                                        <i class="pi pi-eye"></i>
                                    </button>
                                    <button 
                                        v-if="data.phone"
                                        type="button" 
                                        class="table-action whatsapp"
                                        v-tooltip.top="'Message on Whatsapp'"
                                        placeholder="Top"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.9035 2.03467C10.5933 0.723333 8.8515 0.000583333 6.99592 0C3.17217 0 0.0600833 3.1115 0.0583333 6.937C0.05775 8.15967 0.377417 9.35317 0.984667 10.4055L0 14L3.67733 13.0352C4.69058 13.5882 5.83158 13.8792 6.99242 13.8798H6.99533C10.8185 13.8798 13.9312 10.7677 13.9329 6.94225C13.9341 5.089 13.2131 3.34542 11.9035 2.03467ZM6.99592 12.7079H6.99358C5.95875 12.7079 4.94433 12.4297 4.05883 11.9041L3.84825 11.7793L1.666 12.3515L2.24875 10.2235L2.11167 10.0053C1.53417 9.08717 1.22967 8.02608 1.23025 6.937C1.23142 3.75783 3.8185 1.17133 6.99883 1.17133C8.53883 1.17133 9.98667 1.77217 11.0752 2.86183C12.1637 3.95208 12.7628 5.4005 12.7622 6.94108C12.7604 10.1214 10.1739 12.7079 6.99592 12.7079ZM10.1588 8.3895C9.9855 8.30258 9.13325 7.88317 8.974 7.82542C8.81533 7.76767 8.69983 7.7385 8.58375 7.91175C8.46767 8.085 8.13633 8.47583 8.03483 8.59192C7.93392 8.70742 7.83242 8.722 7.65917 8.63508C7.48592 8.54817 6.92708 8.36558 6.265 7.77467C5.74992 7.315 5.40167 6.74742 5.30075 6.57358C5.19983 6.39975 5.29025 6.30642 5.37658 6.22008C5.45475 6.1425 5.54983 6.01767 5.63675 5.91617C5.72425 5.81583 5.75283 5.7435 5.81117 5.62742C5.86892 5.51192 5.84033 5.41042 5.79658 5.3235C5.75283 5.23717 5.40633 4.38375 5.26225 4.03667C5.12167 3.69833 4.97875 3.74442 4.872 3.73917C4.77108 3.73392 4.65558 3.73333 4.5395 3.73333C4.424 3.73333 4.23617 3.7765 4.0775 3.95033C3.91883 4.12417 3.47083 4.54358 3.47083 5.39642C3.47083 6.24983 4.09208 7.07408 4.17842 7.18958C4.26475 7.30508 5.4005 9.05625 7.13942 9.807C7.553 9.9855 7.87617 10.0922 8.12758 10.1722C8.54292 10.304 8.92092 10.2853 9.21958 10.241C9.55267 10.1914 10.2451 9.82158 10.3898 9.41675C10.5344 9.01192 10.5344 8.66425 10.4907 8.5925C10.4475 8.51958 10.332 8.47642 10.1588 8.3895Z" fill="white"/>
                                        </svg>
                                    </button>
                                </div>
                            </template>
                        </Column>

                        <!-- Guests Sub Table -->
                        <template #expansion="{ data }">
                            <div class="table-guests">
                                <DataTable :value="data.meetings" size="small">
                                    <template #empty>No meetings found for this contact</template>

                                    <Column header="ID">
                                        <template #body="{ data }">
                                            <span>{{ data.id }}</span>
                                        </template>
                                    </Column>
                                    <Column header="Request Date">
                                        <template #body="{ data }">
                                            <span class="line-clamp-2 capitalize">{{ fromNowDate(data.created_at) }}</span>
                                        </template>
                                    </Column>  
                                    <Column header="Organizer Type">
                                        <template #body="{ data }">
                                            <span>Sales</span>
                                        </template>
                                    </Column> 
                                    <Column header="Guests">
                                        <template #body="{ data }">
                                            <span>3+</span>
                                        </template>
                                    </Column> 
                                    <Column header="Type">
                                        <template #body="{ data }">
                                            <span v-if="data.type" :class="['badge', getAreaType(data.type).toLowerCase()]">{{ getAreaType(data.type) }}</span>
                                        </template>
                                    </Column> 
                                    <Column header="Date & Time">
                                        <template #body="{ data }">
                                            <span>{{ `
                                                ${formatDate(data.start_date, 'DD-MM-YYYY - HH:mm')}
                                                 / 
                                                ${formatDate(data.end_date, 'HH:mm')}
                                            ` }}</span>
                                        </template>
                                    </Column> 
                                </DataTable>
                            </div>
                        </template>

                    </DataTable>

                    {{ query }}

                    <Paginator 
                        v-if="pagination"
                        :rows="pagination.itemsPerPage" 
                        :totalRecords="pagination.totalItems" 
                        :rowsPerPageOptions="[20, 30, 40, 50]"
                        @page="setPage"
                        class="mt-8"
                    ></Paginator>

                </div>

            </div>

            <!-- Dialog Add External account -->
            <Dialog 
                v-model:visible="exAccountDialog" 
                modal 
                :draggable="false" 
                :style="{ width: '60vw' }" 
                header="Create a new external account"
            >   
                <CreateExternalAccount :markets="markets || null" @update-dialog="exAccountDialog = false" />
            </Dialog>

            <!-- Dialog Add New Contact -->
            <Dialog 
                v-model:visible="newContactDialog" 
                modal 
                :draggable="false" 
                :style="{ width: '80vw' }" 
                header="Create a new contact"
            >   
                    <CreateNewContact 
                        :markets="markets || null"
                        @update-dialog="getNotificationOnSubmit"
                    />
            </Dialog>

            <!-- Drawer View More -->
            <Drawer v-model:visible="drawerViewMore" :header="selectedContact ? `${selectedContact.last_name.toUpperCase()} ${selectedContact.first_name}` : ''" position="right">
                <ContactDetails v-if="selectedContact" :contact="selectedContact" />
            </Drawer>

            <!-- Toasts -->
            <Toast position="top-center" group="createNewContact" />

        </div>
    </div>
</template>

<style></style>