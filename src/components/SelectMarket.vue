<script setup lang="ts">
import { useMarkets } from '@/composables/useMarkets'
import type { useMarketsReturn } from '@/composables/useMarkets'

withDefaults(defineProps<{
    retourValue?: string;
}>(), {
    retourValue: 'label', 
});

// Get Markets 
const { markets, loading }: useMarketsReturn = useMarkets(true)

const model = defineModel()
</script>

<template>
    <Select 
        v-model="model" 
        :options="markets || []" 
        optionLabel="label"
        :optionValue="(option) => retourValue === 'id' ? option.id : option.label"
        placeholder="Select a market" 
        class="w-full"
        :loading="loading"
    />
</template>

<style></style>