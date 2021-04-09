import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login'
import Home from '../views/Home'
import Pp from '../views/Pp'
import Formations from '../views/Formations'
import DetailedFormation from '@/components/DetailedFormation'
import AddProject from '@/components/AddProject'
import Configuration from '@/components/Configuration'
import store from '../store/index'
import Template from '@/components/Template'
import TemplateGlobal from '@/components/TemplateGlobal'

const listOfProjects = store.state.projects

Vue.use(VueRouter)

const routes = [{
  path: '/',
  name: 'login',
  component: Login
},
{
  path: '/home',
  name: 'home',
  component: Home,
  beforeEnter: (to, from, next) => {
    if (listOfProjects.length === 0) {
      next({
        name: 'new-project'
      })
    } else {
      next()
    }
  }
},
{
  path: '/formations',
  name: 'formations',
  component: Formations
},
{
  path: '/config',
  component: Configuration
},
{
  path: '/new-project',
  name: 'new-project',
  component: AddProject
},
{
  name: 'detailFormation',
  path: '/formations/details/:formation',
  component: DetailedFormation
},
{
  path: '/privacy-policy',
  name: 'privacy-policy',
  component: Pp
},
{
  path: '/template',
  name: 'template',
  component: Template
},
{
  path: '/templateGlobal',
  name: 'templateGlobal',
  component: TemplateGlobal
}
]

const router = new VueRouter({
  routes
})

export default router
