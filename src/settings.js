/**
 * 项目主配置文件
 */
module.exports = {
  /**
   * @type String
   * @description 页签上面的标题
   */
  title: '社保主体画像系统',

  /**
   * @type String
   * @description 项目要开发的页面所在的文件夹
   */
  webApp: 'views',

  /**
   * @type {boolean} true | false
   * @description 展示左侧菜单上方的logo
   *
   */
  sidebarLogo: true,

  /**
   * @type Object
   * @param open 开启返回大屏
   * @param type sef vue
   * @param path 如果启用vue模式的话，需指定跳转path
   * @description 返回大屏功能
   */
  goDisplayScreen: {
    open: false,
    type: 'sef',
    path: '/'
  },

  /**
   * @type Boolean
   * @description 定时任务功能
   */
  pwe: false,

  /**
   * @type {boolean} true | false
   * @description 是否启用json格式的Ajax。 true: json  false: xml
   */
  jsonAjax: true,

  /**
   * @type String
   * @description 端口号
   */
  port: '8079',

  /**
   * @type String
   * @description 开发环境下，调用后台接口基础地址
   */
  // devAjaxBaseUrl: 'http://10.1.60.111:8580',
  devAjaxBaseUrl: 'http://10.1.84.59:8080',
  // devAjaxBaseUrl: 'http://10.1.84.79:8080',

  /**
   * @type String
   * @description 调用后台接口基础地址
   */
  // ajaxProjectName: '/mdom',
  ajaxProjectName: '/sispt',

  /**
   * @type Object
   * @param login 登录webApp
   * @param getInfo 获取用户信息
   * @param getPermissions 获取左侧权限菜单
   * @param getCode 获取code
   * @description 框架必须的api
   */
  frameApi: {
    login: 'logon.do?method=doLogon',
    getInfo: 'user.do?method=getUserInfo',
    getPermissions: 'menuTree.do?method=queryMenuTree',
    getCode: 'getCode.do?method=getCode'
  },

  /**
   * @type String
   */
  development: process.env.NODE_ENV
}
