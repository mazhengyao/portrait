/**
 * 统一引入所有业务页面
 * @author 张小凡
 */
const modulesFiles = require.context('./business', true, /\.vue$/)

const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = modulesFiles(modulePath)
  modules[moduleName] = value.default
  return modules
}, {})

export default modules
