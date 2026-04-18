import { createMemoryHistory, createWebHistory } from 'vue-router'

const isBrowser = typeof window !== 'undefined'

// Use a function so that each call creates a NEW instance of the history
export const getDefaultRouter = () => ({
    history: isBrowser ? createWebHistory() : createMemoryHistory(),
    routes: [{ path: '/', component: { render: () => null } }],
})
