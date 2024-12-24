import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

function getAuth(to: any) {
    if(localStorage.getItem('token') === null && to.name !== 'login' ) {
        return { path: '/login', query: {}, hash: to.hash }
    } 
}

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue'),
        },
        {
            path: '/',
            name: 'home',
            beforeEnter: getAuth,
            component: () => import('../views/HomeView.vue'),
        },
    ],
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    authStore.getAuth();

    next();
});

export default router
