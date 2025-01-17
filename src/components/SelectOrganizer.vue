<script setup lang="ts">
import { onMounted } from 'vue'

import { useUsers } from '@/composables/useUsers'
import type { UseUsersReturn } from '@/composables/useUsers'

// Get Organizer Users 
const { users: organizers, loading, getUsers }: UseUsersReturn = useUsers(false)
onMounted(async () => { await getUsers('role=2, 3&less=true') })

const model = defineModel()
</script>

<template>
    <Select 
        v-model="model" 
        :options="organizers || []" 
        filter 
        :optionLabel="(option) => `${option.first_name} ${option.last_name}`"
        optionValue="id" 
        placeholder="Select an Organizer"
        :disabled="loading"
        fluid
    />
</template>

<style></style>