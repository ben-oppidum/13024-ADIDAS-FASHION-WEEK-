<script setup lang="ts">
import Calendar from '@/components/Calendar.vue'
</script>

<template>
    <div class="page-wrap">
        <div class="container">
            <PageTitle title="Calendars">
                <Button label="Create a new meeting" icon="pi pi-plus" />
            </PageTitle>
            <div class="mt-8">
                <Calendar />
            </div>
        </div>
    </div>
</template>
