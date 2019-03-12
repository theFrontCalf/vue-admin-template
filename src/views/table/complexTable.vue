<template>
    <div class="app-container">
        <div class="filter-container">
            <el-input :placeholder="$t('table.title')" v-model="listQuery.title" style="width:200px" class="filter-item" @keyup.enter.native="handleFilter" />
            <el-select v-model="listQuery.importance" :placeholder="$t('table.importance')" clearable style="width:90px;" class="filter-item">
                <el-option v-for="item in importanceOptions" :key="item" :label="item" :value="item" />
            </el-select>
            <el-select v-model="listQuery.type" :placeholder="$t('table.type')" clearable style="width:130px" class="filter-item">
                <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name+'('+item.key+')'" :value="item.key" />
            </el-select>
            <el-select v-model="listQuery.sort" style="width:140px" @change="handleFilter" class="filter-item">
                <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
            </el-select>
            <el-button icon="el-icon-search" type="primary" class="filter-item" @click="handleFilter">{{ $t('table.search') }}</el-button>
            <el-button icon="el-icon-edit" type="primary" class="filter-item" @click="handleCreate">{{ $t('table.add') }}</el-button>
            <el-button icon="el-icon-download" type="primary" class="filter-item" @click="handleDownload">{{ $t('table.export') }}</el-button>
            <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px" @change="tableKey+=1">{{ $t('table.reviewer') }}</el-checkbox>
        </div>
        <el-table v-loading="listLoading" border style="width:100%" :data="list" :key="tableKey" fit highlight-current-row @sort-change="sortChange">
            <el-table-column :label="$t('table.id')" prop="id" sortable="custom" align="center" width="65">
                <template slot-scope="scope">
                    <span>{{ scope.row.id }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.date')" align="ceter" width="150px">
                <template slot-scope="scope">
                    <span>{{ scope.row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.title')" min-width="150px">
                <template slot-scope="scope">
                    <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.title }}</span>
                    <el-tag>{{ scope.row.type | typeFilter }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.author')" width="110px" align="center">
                <template slot-scope="scope">
                    <span>{{ scope.row.author }}</span>
                </template>
            </el-table-column>
            <el-table-column v-if="showReviewer" :label="$t('table.reviewer')" width="110px" align="center">
                <template slot-scope="scope">
                    <span style="color:red;">{{ scope.row.reviewer }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.importance')" width="80px">
                <template slot-scope="scope">
                <svg-icon v-for="n in +scope.row.importance" :key="n" icon-class="star"  class="meta-item__icon"/>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.status')" class-name="status-col" width="100px">
                <template slot-scope="scope">
                    <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column :label="$t('table.actions')" align="center" width="230px" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                    <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}</el-button>
                    <el-button v-if="scope.row.status!='published'" size="mini" type="success" @click="handleModifyStatus(scope.row,'published')">{{ $t('table.publish') }}
                    </el-button>
                    <el-button v-if="scope.row.status!='draft'" size="mini" @click="handleModifyStatus(scope.row,'draft')">{{ $t('table.draft') }}
                    </el-button>
                    <el-button v-if="scope.row.status!='deleted'" size="mini" type="danger" @click="handleModifyStatus(scope.row,'deleted')">{{ $t('table.delete') }}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
        
        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisable">
            <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width:400px; margin-left:50px;">
                <el-form-item :label="$t('table.type')" prop="type">
                    <el-select v-model="temp.type" class="filter-item" placeholder="Please select">
                        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('table.date')" prop="timestamp">
                    <el-date-picker type="datetime" v-model="temp.timestamp" placeholder="Place pick a date" />
                </el-form-item>
                <el-form-item :label="$t('table.title')" prop="title">
                    <el-input v-model="temp.title" />
                </el-form-item>
                <el-form-item :label="$t('table.status')">
                    <el-select v-model="temp.status" class="filter-item" placeholder="Place select">
                        <el-option v-for="item in statusOptions" :key="item" :value="item" :label="item" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('table.importance')">
                    <el-rate v-model="temp.importance" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" :max="3" style="margin-top:8px;" />
                </el-form-item>
            </el-form>
            <div class="dialog-footer" slot="footer">
                <el-button @click="dialogFormVisable = false">{{ $t('table.cancel') }}</el-button>
                <el-button @click="dialogStatus==='create'?createData():updateData()" type="primary">{{ $t('table.confirm') }}</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
// import { parseTime } from '@/utils'  //已经在全局注册过过滤器，此处不需要再次引入
import request from '@/utils/request'
import axios from 'axios'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
// import { fetchList } from '@/api/article'


const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]
// arr to obj ,such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name;
  return acc;
}, {});

export default {
  name: "ComplexTable",
  components: { Pagination },
  data() {
    return {
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [
        { key: "+id", label: "ID Ascending" },
        { key: "-id", label: "ID Descending" }
      ],
      textMap: {
          update: 'Edit',
          create: 'Create'
      },
      rules: {
          type: [{ required: true, message: 'type is required', trigger: 'change' }],
          timestamp: [{ required: true, message: 'timestamp is required', trigger: 'change', type: 'date' }],
          title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      statusOptions: ['published', 'draft', 'deleted'],
      dialogFormVisable: false,
      dialogStatus: '',
      temp: {
          id: undefined,
          importance: 1,
          timestamp: new Date(),
          title: '',
          type: '',
          status: 'published'
      },
      listQuery: {
        importance: undefined,
        title: undefined,
        sort: '+id',
        page: 1,
        limit: 20,
        type: undefined
      },
      showReviewer: false,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
    };
  },
  created() {
      this.getList();
  },
  methods: {
    handleFilter() {
        this.listQuery.page = 1
        this.getList()
    },
    createData() {
        this.updateData(); //过程一样，偷个懒
    },
    updateData() {
        this.$refs['dataForm'].validate((valid) => {
            if(valid){
                this.dialogFormVisable = false
                setTimeout(() => {
                    this.$notify({
                        title: '成功',
                        message: '假装修改成功',
                        type: 'success',
                        duration: 1500
                    })
                }, 200);
            }
        })
    },
    handleCreate() {
        this.temp = {  //重置一下
            id: undefined,
            importance: 1,
            timestamp: new Date(),
            title: '',
            type: '',
            status: 'published'
        }
        this.dialogStatus = 'create'
        this.dialogFormVisable = true
        this.$nextTick(() => {
            this.$refs['dataForm'].clearValidate();
        })
    },
    handleModifyStatus(row, status) {
        this.$message({
            message: '操作成功',
            type: 'success'
        })
        row.status = status
    },
    handleDownload() {},
    sortChange({cloumn, prop, order}) {
        if(prop == 'id') {
            this.sortByID(order)
        }
    },
    sortByID(order) {
        if(order === 'ascending'){
            this.listQuery.sort = "+id"
        } else {
            this.listQuery.sort = "-id"
        }
        this.handleFilter()
    },
    handleUpdate(row) {
        this.temp = Object.assign({}, row)
        this.temp.timestamp = new Date(this.temp.timestamp)
        this.dialogFormVisable = true
        this.dialogStatus = 'update'
        this.$nextTick(() => {
            this.$refs['dataForm'].clearValidate();
        })
    },
    getList() {
        this.listLoading = true;
        axios({
            url: 'https://easy-mock.com/mock/5c739d010cf5d2150d52cdec/vue-admin-template/table/list',
            params: this.listQuery
        }).then(response => {
            if(this.listQuery.sort == '-id') response.data.items.reverse(); //模拟递增递减
            this.list = response.data.items.slice(this.listQuery.limit*(this.listQuery.page - 1),this.listQuery.limit * this.listQuery.page)
            this.total = response.data.total

            // Just to simulate the time of the request
            setTimeout(() => {
                this.listLoading = false
            }, .5 * 1000)
        })
    }
  },
  filters: {
    typeFilter(type) {
      return calendarTypeKeyValue[type];
    },
    statusFilter(status) {
      const statusMap = {
        published: "success",
        draft: "info",
        deleted: "danger"
      };
      return statusMap[status];
    }
  }
};
</script>


