<script setup lang="ts">
defineProps<{
    title: string
}>()
</script>

<template>
    <div class="flex items-center justify-between">
        <h1 class="text-3xl font-semibold">{{ title }}</h1>
        <div>
            <slot />
        </div>
    </div>
</template>