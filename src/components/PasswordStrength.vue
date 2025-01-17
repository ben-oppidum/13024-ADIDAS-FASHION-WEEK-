<script setup lang="ts">
import { ref } from 'vue'
import PasswordMeter from 'vue-simple-password-meter'

const model = defineModel()
const props = defineProps({
    password: String,
})

type Strength = 'risky' | 'guessable' | 'weak' | 'safe' | 'secure';
type StrengthTranslated = 'Risqué' | 'Devinable' | 'Faible' | 'Bon' | 'Sécurisé'

interface scorePayload {
    score: number;
    strength: Strength;
}

interface scoreType {
    score: number;
    strength: scoreResult;
}

interface scoreResult {
    label1: Strength;
    label2: StrengthTranslated;
    cls: string;
}

const score = ref<scoreType | null>(null);
const onScore = (payload:scorePayload) => {
    const translatedStrength:scoreResult[] = [
        { label1: 'risky', label2: 'Risqué', cls: 'text-[#f95e68]' }, 
        { label1: 'guessable', label2: 'Devinable', cls: 'text-[#fb964d]' },
        { label1: 'weak', label2: 'Faible', cls: 'text-[#fdd244]' },
        { label1: 'safe', label2: 'Bon', cls: 'text-[#b0dc53]' },
        { label1: 'secure', label2: 'Sécurisé', cls: 'text-[#35cc62]' },
    ]

    const strengthResult = translatedStrength.find(item => item.label1 === payload.strength)
    if(strengthResult) {
        score.value = {
            score: payload.score,
            strength: strengthResult
        }
        model.value = payload.score
    }
};
</script>

<template>
    <div class="flex justify-between items-center pt-2">
        <password-meter :password="password" @score="onScore" class="!mt-0" />
        <span v-if="password && score" :class="['font-semibold pl-5', score.strength.cls]">{{ score.strength.label2 }}</span>
    </div>
</template>

<style></style>