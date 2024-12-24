<script setup lang="ts">
import { ref } from 'vue'
import type { Ref, ComponentInternalInstance } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

import { endPoint } from '@/stores/environment'
import { useAuthStore } from '@/stores/auth'

// TS
interface ErrorResponse {
    message: string;
}
interface State {
    email: string;
    password: string;
}

// Global
const authStore = useAuthStore()
const router = useRouter()

const handleIconClick = (node: ComponentInternalInstance) => {
    if (node.props) {
        node.props.suffixIcon = node.props.suffixIcon === 'eye' ? 'eyeClosed' : 'eye';
        node.props.type = node.props.type === 'password' ? 'text' : 'password';
    }
}

// Login
const errorMessage = ref<string | null>(null);
const state = ref<State>({
    email: 'john.smith@oppidum.fr',
    password: '123456',
})

const setLogin = async () => {
    let formData = new FormData();
    formData.append('email', state.value.email);
    formData.append('password', state.value.password);

    try {
        const response = await axios.post(endPoint.auth, formData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        const user = response.data.user
        if(user && user.role_id === 6) return errorMessage.value = 'You are not allowed to view this App'

        authStore.setAuth(response.data.token, user)
        router.push('/')

    } catch (error) {
        console.log(error);
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.data) {
                const data = error.response.data as ErrorResponse; // Cast to the expected type
                errorMessage.value = data.message;
            }
        }
    }
}
</script>

<template>
    <div class="page-wrap h-screen flex items-center justify-center bg-slate-50">
        <div class="container">
            <div class="max-w-lg mx-auto -mt-24">
                <h1 class="text-4xl text-center mb-6">Login</h1>
                <div class="p-4 bg-white border border-gray-200 rounded-lg">
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis, quisquam.</p>
                    <FormKit type="form" @submit="setLogin" :actions="false">
                        <div class="form-group">
                            <FormKit
                                type="email"
                                name="email"
                                label="Email"
                                placeholder="Email"
                                v-model="state.email"
                                validation="required"
                                :validation-messages="{ required: 'Please enter a valid username' }"
                            />
                        </div>

                        <div class="form-group">
                            <FormKit
                                type="password"
                                label="Password"
                                placeholder="Password"
                                v-model="state.password"
                                suffix-icon="eyeClosed"
                                @suffix-icon-click="handleIconClick"
                                suffix-icon-class="hover:text-black"
                                validation="required"
                                :validation-messages="{ required: 'Please enter a valid password' }"
                            />
                        </div>

                        <Message v-if="errorMessage" severity="error">{{ errorMessage }}</Message>

                        <div class="form-group !mb-0">
                            <Button 
                                label="Submit" 
                                type="submit"
                                :disabled="!state.email || !state.password"
                            />
                        </div>

                    </FormKit>
                </div>
            </div>
        </div>
    </div>
</template>
