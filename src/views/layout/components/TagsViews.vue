<template>
    <div class="tags-view-container">
        <router-link
            v-for="tag in visitedViews"
            ref="tag"
            :class="isActive(tag)?'active':''"
            :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath}"
            :key="tag.path"
            tag="span"
            class="tags-view-item"
        >
            {{ tag.title }}
            <span class="el-icon-close" @click.prevent.stop="closeSelectedTag(tag)"></span>
        </router-link>
    </div>
</template>
<script>
export default {
    data() {
        return {}
    },
    computed: {
        visitedViews() {
            return this.$store.state.tagsView.visitedViews
        }
    },
    watch: {
        $route() {
            this.addViewTags();
        }
    },
    mounted() {
        this.addViewTags()
    },
    methods: {
        addViewTags() {
            const { name } = this.$route
            if(name) {
                this.$store.dispatch('addView',this.$route)
            }
        },
        isActive(tagObj) {
            return tagObj.path == this.$route.path
        },
        closeSelectedTag(view) {
            this.$store.dispatch('delView',view).then(({ visitedViews }) => {
                if(this.isActive(view)){
                    const lastView = visitedViews.slice(-1)[0];
                    if(lastView){
                        this.$router.push(lastView)
                    }else{
                        this.$router.push('/')
                    }
                }
            })
        }
    }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.tags-view-container {
  height: 34px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
  /* .tags-view-wrapper { */
    .tags-view-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      border: 1px solid #d8dce5;
      color: #495060;
      background: #fff;
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;
      &:first-of-type {
        margin-left: 15px;
      }
      &:last-of-type {
        margin-right: 15px;
      }
      &.active {
        background-color: #42b983;
        color: #fff;
        border-color: #42b983;
        &::before {
          content: '';
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        }
      }
    }
  /* } */
  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 100;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      &:hover {
        background: #eee;
      }
    }
  }
}
</style>

<style rel="stylesheet/scss" lang="scss">
//reset element css of el-icon-close
/* .tags-view-wrapper { */
  /* .tags-view-item { */
    .el-icon-close {
      width: 16px;
      height: 16px;
      vertical-align: 2px;
      border-radius: 50%;
      text-align: center;
      transition: all .3s cubic-bezier(.645, .045, .355, 1);
      transform-origin: 100% 50%;
      &:before {
        transform: scale(.6);
        display: inline-block;
        vertical-align: -2px;
      }
      &:hover {
        background-color: #b4bccc;
        color: #fff;
      }
    }
  /* } */
/* } */
</style>



