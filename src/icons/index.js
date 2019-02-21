import Vue from 'vue'
import SvgIcon from '@/components/SvgIcon' // svg组件

// register globally
Vue.component('svg-icon', SvgIcon)
/**
 * @param {path,isUseSubdirectories,regExp} requireContext 
 * path: 要搜索的文件夹目录
 * isUseSubdirectories: 是否搜索它的子目录
 * regExp: 一个匹配文件的正则表达式
 * requireContext.keys() 返回一个文件目录数组
 * map函数遍历引入
 * 可参考：https://blog.csdn.net/viewyu12345/article/details/83012970
 */
const requireAll = requireContext => requireContext.keys().map(requireContext)
const req = require.context('./svg', false, /\.svg$/)
requireAll(req)
