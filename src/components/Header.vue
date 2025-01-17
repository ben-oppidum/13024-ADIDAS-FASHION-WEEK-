<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Avatar from 'primevue/avatar'
import Popover from 'primevue/popover'
import { useConfirm } from "primevue/useconfirm"

import { useAuthStore } from '@/stores/auth'
import { getRoleName } from '@/functions/'

// TS
interface Navigation {
    routeName: string;
    label: string;
    path: string;
    roles: number[]
}

// Global
const authStore = useAuthStore()
const route = useRoute()
const confirm = useConfirm()
defineProps<{
    logoOnly?: boolean
}>()

// Navigation
const navigation: Navigation[] = [
    // {
    //     routeName: 'todo',
    //     label: 'To-Do List',
    //     path: '/todo',
    //     roles: [1],
    // },
    // {
    //     routeName: 'requestList',
    //     label: 'Request List',
    //     path: '/request-list',
    //     roles: [2, 3],
    // },
    {
        routeName: 'home',
        label: 'Calendar',
        path: '/',
        roles: [1, 2, 3, 4, 5],
    },
    {
        routeName: 'contacts',
        label: 'Contacts',
        path: '/contacts',
        roles: [1, 2, 3, 4, 5],
    },
]

const authorizedNavigations = computed(() => {
    if(!authStore.user) return []
    const filtredNavigation = navigation.filter(nav => nav.roles.includes(authStore.user!.role_id))
    return filtredNavigation
})

// Panel
const panel = ref()
const togglePanel = (event: Event) => {
    panel.value.toggle(event);
}

// Logout
const setLogOut = () => {
    confirm.require({
        message: 'Are you sure you want to logout?',
        header: 'Log out',
        icon: 'pi pi-info-circle',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Confirm',
            severity: 'danger'
        },
        accept: () => {
            authStore.setLogOut()
        },
        reject: () => {}
    });
}

// Create ShortName
const shortName = computed(() => {
    if(authStore.user) {
        const firstNameLetter = authStore.user.first_name.charAt(0);
        const lastNameLetter = authStore.user.last_name.charAt(0);

        return firstNameLetter + lastNameLetter
    }
    return ''
})
</script>

<template>
    <header :class="['sticky top-0 z-30 flex items-center bg-black text-white h-[56px] px-8', logoOnly ? 'justify-center' : 'justify-between']">
        <router-link to="/">
            <img src="/images/logo-white.png" width="33">
        </router-link>
        <template v-if="!logoOnly">
            <nav class="flex divide-x divide-gray-600">
                <router-link 
                    v-for="(item, index) in authorizedNavigations"
                    :key="index"
                    :to="item.path"
                    :class="[
                        'font-medium px-8 hover:opacity-100 transition-opacity ease-in-out delay-75',
                        route.name === item.routeName ? 'opacity-100' : 'opacity-50'
                    ]"
                >
                    {{ item.label }}
                </router-link>
            </nav>
            <button v-if="authStore.user" type="button" @click="togglePanel" class="flex items-center justify-end text-left">
                <Avatar 
                    :label="shortName" 
                    class="mr-2" 
                    size="large" 
                    shape="circle" 
                    style="background-color: #FFF; color: #000" 
                />
                <div>
                    <span class="block leading-none">{{ `${authStore.user.first_name} ${authStore.user.last_name}` }}</span>
                    <span class="block leading-none text-gray-400 mt-0.5">{{ getRoleName(authStore.user.role_id) }}</span>
                </div>
                <i class="pi pi-chevron-down ml-5"></i>
            </button>
            
            <Popover ref="panel">
                <nav class="flex flex-col min-w-[200px]">
                    <button type="button" @click="setLogOut" class="py-1 px-3 rounded-md flex items-center gap-x-3 transition-all duration-100 ease-in-out text-red-500 hover:bg-gray-100">
                        <i class="pi !text-base pi-sign-out"></i>
                        Logout
                    </button>
                </nav>
            </Popover>

            <ConfirmDialog></ConfirmDialog>

        </template>
    </header>
</template>

<style></style>