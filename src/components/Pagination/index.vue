<template>
<div class="pagination-container">
    <el-pagination
        :background="background"
        :layout="layout"
        :current-page.sync="currentPage"
        :page-size.sync="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        v-bind="$attrs"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
    />
</div>
</template>

<script>
export default {
    name: 'Pagination',
    props: {
        total: { type: Number, default: 0 },
        page: { type: Number, default: 1 },
        limit: { type: Number, default: 10}
    },
    data() {
        return {
            background: true,
            layout: 'total, sizes, prev, pager, next, jumper',
            pageSizes: [10, 20, 30, 40, 50, 100]
        }
    },
    computed: {
        currentPage: {
            get() {
                return this.page;
            },
            set(val) {
                this.$emit('update:page',val)
            }
        },
        pageSize: {
            get() {
                return this.limit;
            },
            set(val) {
                this.$emit('update:limit',val)
            }
        }
    },
    methods: {
        handleSizeChange(val) {
            this.$emit('pagination', {page: this.currentPage, limit: val})
        },
        handleCurrentChange(val) {
            this.$emit('pagination', {page: val, limit: this.pageSize})
        }
    }
}
</script>
<style lang="scss" scoped>
    .pagination-container {
        padding: 32px 16px;
        margin-top:30px;
    }
</style>
