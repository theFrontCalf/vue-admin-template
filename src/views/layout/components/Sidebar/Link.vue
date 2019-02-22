
<template>
  <!-- eslint-disable vue/require-component-is -->
  <!-- 不直接绑定 is 会导致校验报错，返回的is决定渲染的元素或组件，其他属性为对应元素的属性值 -->
  <component v-bind="linkProps(to)">  
    <slot/>
  </component>
</template>

<script>
import { isExternal } from '@/utils/validate'

export default {
  props: {
    to: {
      type: String,
      required: true
    }
  },
  methods: {
    linkProps(url) {
      if (isExternal(url)) {
        return {
          is: 'a',
          href: url,
          target: '_blank',
          rel: 'noopener'
        }
      }
      return {
        is: 'router-link',
        to: url
      }
    }
  }
}
</script>
