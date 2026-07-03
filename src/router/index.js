import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/create',
    name: 'CharacterCreate',
    component: () => import('../views/CharacterCreateView.vue'),
  },
  {
    path: '/select',
    name: 'ScenarioSelect',
    component: () => import('../views/ScenarioSelectView.vue'),
  },
  {
    path: '/game/:scenarioId?',
    name: 'Game',
    component: () => import('../views/GameView.vue'),
  },
  {
    path: '/battle',
    name: 'Battle',
    component: () => import('../views/BattleView.vue'),
  },
  {
    path: '/save',
    name: 'SaveLoad',
    component: () => import('../views/SaveLoadView.vue'),
  },
  {
    path: '/leaderboard',
    name: 'Leaderboard',
    component: () => import('../views/LeaderboardView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
