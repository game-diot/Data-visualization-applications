import Vue from 'vue'
import VueRouter from 'vue-router'
import txtS from '../views/txtS.vue'
import NotFoundPage from '../views/NotFoundPage.vue'


Vue.use(VueRouter)

const routes = [
  {
    path:'/',
    redirect:'/login'
  },
  {
    path: '/home',
    name: 'home',
    component: txtS,
    meta:{requiresAuth: true}
  },
  {
    path: '/about',
    name: 'AboutView',
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue'),
    meta:{requiresAuth: true}
  },
    {
    path: '/login',
    name: 'LoginPage',
    meta:{guestOnly: true},
    component: () => import(/* webpackChunkName: "about" */ '../views/LoginPage.vue'),
  },
  {
    path:'*',
    component:NotFoundPage
  },
]

const router = new VueRouter({
  routes
})
const isAuthenticated = () =>{
  return localStorage.getItem('Authtoken') != null
}
router.beforeEach((to, from, next) => {
  if(to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated()){
    next({name: 'login', query:{redirect: to.fullPath}})
  }
  else if(to.matched.some(record => record.meta.guestOnly) && isAuthenticated()){
    next({name:'index'})
  }
  else{
    next()
  }
})

export default router
