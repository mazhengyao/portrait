/* 加载配置文件 获取项目所在的文件夹webApp */
import setting from '../settings.js'

const webApp = setting.webApp
import redirect from '../views/redirect'
import login from '../views/login'
import notFound from '../views/404'
import dashboard from '../views/dashboard'

import organization from '../views/business/basicInfo/organization'
import individual from '../views/business/basicInfo/individual'
import createComp from '../views/business/customComp/createComp'
import editComp from '../views/business/customComp/editComp'
import getDataOrigin from '../views/business/getDataOrigin/getDataOrigin'

import main from '../views/business/main'

const constantRoutes = [
  {
    path: '/redirect',
    component: 'Layout',
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: redirect
      }
    ]
  },
  {
    path: '/login',
    component: login,
    hidden: true
  },

  {
    path: '/404',
    component: notFound,
    hidden: true
  },

  {
    path: '/index',
    component: 'Layout',
    redirect: '/index/dashboard',
    hidden: true,
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: dashboard,
      meta: {title: '首页', affix: true, projectPath: `@/${webApp}/dashboard/index`}
    }]
  },
  {
    path: '/',
    component: main,
    redirect: '/organization',
    // hidden: true, // 左侧不显示菜单栏
    meta: {title: 'main'},
    children: [
      {
        path: 'createComp',
        name: 'CreateComp',
        component: createComp,
        meta: {title: '新建组件'}
      },
      {
        path: 'editComp',
        name: 'EditComp',
        component: editComp,
        meta: {title: '编辑组件'}
      },
      {
        path: 'organization',
        name: 'Organization',
        component: organization,
        meta: {title: '单位'}
      },
      {
        path: 'individual',
        name: 'Individual',
        component: individual,
        meta: {title: '个人'}
      },
      {
        path: 'getDataOrigin',
        name: 'GetDataOrigin',
        component: getDataOrigin,
        meta: {title: '取数据源'}
      }
    ]
  }
]
export default constantRoutes
