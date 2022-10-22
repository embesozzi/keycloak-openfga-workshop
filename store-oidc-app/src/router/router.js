import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '@/store';
import { default as Home } from '@/views/Home.vue'

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/login',
      component:  () => import('@/views/Login'),
    },
    {
      path: '/home',
      name: 'Home',
      component: Home,
      meta: {
        requiresAuth: true,
      }
    },
    {
      path: '/callback',
      name: 'Callback',
      component:  () => import('@/views/Callback'),
    }  
    ]
  });


router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (requiresAuth) { 
    store.dispatch("auth/checkAccess", requiresAuth).then((statusCode) => {
        if(statusCode == "OK") {
          next();
        }  
        else {
          next('/login');
        }
    })
  } 
  else 
  {
    next();
  }
});

export default router;