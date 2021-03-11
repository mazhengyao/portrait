import Vue from 'vue'

/**
 * 计算百分比
 * @param num 原始数
 * @param total 总数
 * @returns {string}
 */
function toPercent(num, total) {
  let number = Math.round(num / total * 10000) / 100.00
  if (number > 97) {
    number = 100
  }
  return number.toString()// 小数点后两位百分比
}

/**
 * 还原百分比
 * @param num 原始数
 * @param total 总数
 * @returns {string}
 */
function toPx(num, total) {
  const number = Math.floor(Math.round(total * parseFloat(num)) / 100.00)
  return number.toString()// 小数点后两位百分比
}

/**
 * 像素转百分比
 * @param region 范围$refs
 * @param items 需要转变的数组
 */
export function pxToPercent({region = null, items = []} = {}) {
  const utils = Vue.prototype.$utils
  const returnList = []
  if (!region) {
    console.error('未能获取到正确的区域$refs')
    return returnList
  }
  if (!items.length) {
    console.warn('需要转变的数组长度为0')
    return returnList
  }
  const deepCloneItems = utils.clone(items, true)
  for (const item of deepCloneItems) {
    item.percent_height = toPercent(item.comHeight, region.clientHeight)
    item.percent_width = toPercent(item.comWidth, region.clientWidth)
    item.percent_top = toPercent(item.comTop, region.clientHeight)
    item.percent_left = toPercent(item.comLeft, region.clientWidth)
    item.index = item.index.toString()
    returnList.push(item)
  }
  return returnList
}

/**
 * 百分比转像素
 * @param region 范围$refs
 * @param items 需要转变的数组
 */
export function percentToPx({region = null, items = []} = {}) {
  const utils = Vue.prototype.$utils
  const returnList = []
  if (!region) {
    console.error('未能获取到正确的区域$refs')
    return returnList
  }
  if (!items.length) {
    console.warn('需要转变的数组长度为0')
    return returnList
  }
  const deepCloneItems = utils.clone(items, true)
  for (const item of deepCloneItems) {
    item.comHeight = toPx(item.p_height, region.clientHeight)
    item.comWidth = toPx(item.p_width, region.clientWidth)
    item.comTop = toPx(item.p_top, region.clientHeight)
    item.comLeft = toPx(item.p_left, region.clientWidth)
    item.index = item.p_index
    returnList.push(item)
  }
  return returnList
}

/**
 * 切换系统配色 todo
 * @param scheme 配色方案
 */
export function changeSystemTheme() {
  const scheme = {
    '--first-bg': '#fff',
    '--second-bg': '#fff',
    '--third-bg': '#fff',
    '--img-bg': '#fff',
    '--td-bg': '#fff',
    '--th-bg': '#fff',
    '--td-th-color': '#fff',
    '--board-bg': '#fff',
    '--bg-border': '#fff',
    '--first-font': '#fff',
    '--title-show': '#fff',
    '--title-edit': '#fff',
    '--collapse-color': '#fff',
    '--border-color': '#fff'
  }
  for (const item in scheme) {
    document.getElementsByTagName('body')[0].style.setProperty(item, scheme[item])
  }
}

export default {
  pxToPercent,
  percentToPx,
  changeSystemTheme
}
