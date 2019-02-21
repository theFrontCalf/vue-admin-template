// 翻译路由相关 breadcrumb,sidebar,tagsView
export function generateTitle(title) {
    if(this.$te('route.' + title)) {
        //$te,$t 均为vue-i18n定义的方法
        return this.$t('route.' + title)
    }
    return title
}