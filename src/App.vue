<script setup lang="ts">
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'

import Header from '@/components/Header.vue'

const route = useRoute()

const logoOnly = computed(() => route.name === 'login' ? true : false)

</script>

<template>
    <main class="h-screen">
        <Header :logo-only="logoOnly" />
        <RouterView />
    </main>
</template>