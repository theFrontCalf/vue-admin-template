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
    handleCreate() {},
    handleDownload() {},
    sortChange(cloumn, prop, order) {
        // console.log(cloumn, prop, order)
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
    getList() {
        this.listLoading = true;
        axios({
            url: 'https://easy-mock.com/mock/5c739d010cf5d2150d52cdec/vue-admin-template/table/list',
            params: this.listQuery
        }).then(response => {
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

var wuu = [
    {id:1000,name:'cn'},
	{id:1001,name:'cn'},
    {id:1002,name:'usa'},
    {id:1003,name:'usa'},
    {id:1004,name:'jp'},
    {id:1005,name:'jp'},
]

var target = [
    {
		name:'cn',
		val: [
            {id:1000,name:'cn'},
			{id:1001,name:'cn'},
		]
	},
	{
		name:'usa',
		val: [
            {id:1002,name:'usa'},
			{id:1003,name:'usa'},
		]
	},
	{
		name:'jp',
		val: [
            {id:1004,name:'jp'},
			{id:1005,name:'jp'},
		]
	},
]
</script>


