<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import { useRoute } from 'vue-router'
import Avatar from 'primevue/avatar'
import Popover from 'primevue/popover'
import { useConfirm } from "primevue/useconfirm"

import { useAuthStore } from '@/stores/auth'

defineProps<{
    logoOnly?: boolean
}>()

// Global
const authStore = useAuthStore()
const route = useRoute()
const confirm = useConfirm()

// TS
interface Navigation {
    routeName: string;
    label: string;
    path: string;
}

// Navigation
const navigation: Ref<Navigation[]> = ref([
    {
        routeName: 'todo',
        label: 'To-Do List',
        path: '/todo',
    },
    {
        routeName: 'home',
        label: 'Calendar',
        path: '/',
    },
    {
        routeName: 'contacts',
        label: 'Contacts',
        path: '/contacts',
    },
])

// Panel
const panel = ref()
const togglePanel = (event: Event) => {
    panel.value.toggle(event);
}

// Logout
const setLogOut = () => {
    confirm.require({
        message: 'Are you sure you want to logout?',
        header: 'Danger Zone',
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
</script>

<template>
    <header :class="['sticky top-0 z-30 flex items-center bg-black text-white h-[56px] px-8', logoOnly ? 'justify-center' : 'justify-between']">
        <router-link to="/">
            <img src="/images/logo-white.png" width="33">
        </router-link>
        <template v-if="!logoOnly">
            <nav class="flex divide-x divide-gray-600">
                <router-link 
                    v-for="(item, index) in navigation"
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
            <button type="button" @click="togglePanel" class="flex items-center justify-end text-left">
                <Avatar 
                    label="JS" 
                    class="mr-2" 
                    size="large" 
                    shape="circle" 
                    style="background-color: #FFF; color: #000" 
                />
                <div>
                    <span class="block leading-none">John Smith</span>
                    <span class="block leading-none text-gray-400 mt-0.5">Admin</span>
                </div>
                <i class="pi pi-chevron-down ml-5"></i>
            </button>
            
            <Popover ref="panel">
                <nav class="flex flex-col min-w-[200px]">
                    <router-link to="/" class="py-1 px-3 rounded-md flex items-center gap-x-3 transition-all duration-100 ease-in-out hover:bg-gray-100">
                        <i class="pi !text-base pi-user"></i>
                        My profil
                    </router-link>
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