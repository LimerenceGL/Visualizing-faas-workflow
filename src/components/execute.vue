<template>
  <div class="execute-container">

    <div class="search-container">
      <div>
        <span>{{ workflow_name }}</span>
      </div>
      <div class="search-title">搜索</div>

      <div class="search-item">
        <el-input
            placeholder="ID"
            v-model="searchId"
            clearable
            @clear="filterData"
            @input="filterData"
        ></el-input>
      </div>
      <div class="search-item">
        <el-select v-model="searchStatus" placeholder="状态" @change="filterData">
          <el-option label="all" value=""></el-option>
          <el-option label="finished" value="finished"></el-option>
          <el-option label="failed" value="failed"></el-option>
          <el-option label="running" value="running"></el-option>
        </el-select>
      </div>
      <div class="search-item">
        <el-date-picker
            v-model="searchStartTime"
            type="datetime"
            placeholder="开始时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            @change="filterData"
        ></el-date-picker>
      </div>
      <div class="search-item">
        <el-date-picker
            v-model="searchEndTime"
            type="datetime"
            placeholder="结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            @change="filterData"
        ></el-date-picker>
      </div>
          <el-button size="small"
               @click="back">返回
    </el-button>
    </div>
    <el-table
        :data="displayedData"
        style="width: 100%"
        class="custom-table"
    >
      <el-table-column prop="id" label="ID"></el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <span :class="{
            'status-finished': scope.row.status === 'finished',
            'status-failed': scope.row.status === 'failed',
            'status-running': scope.row.status === 'running'
          }">{{ scope.row.status }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="start_time" label="开始时间"></el-table-column>
      <el-table-column prop="end_time" label="结束时间"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
              plain
              @click="goToDetail(scope.row.id)"
          >
            查看详情
          </el-button>
        </template>
      </el-table-column>

    </el-table>
    <el-pagination
        :current-page.sync="currentPage"
        :page-size="pageSize"
        :total="filteredData.length"
        layout="prev, pager, next"
        @current-change="handlePageChange"
        class="pagination"
    ></el-pagination>
  </div>
</template>
<script>
export default {
  name: "Execute",
  data() {
    return {
      workflow_name: "",
      tableData: [],
      filteredData: [],
      searchName: "",
      searchId: "",
      searchStatus: "",
      searchStartTime: "",
      searchEndTime: "",
      pageSize: 9,
      currentPage: 1,
      base_url: 'http://localhost:3000'
    };
  },
  computed: {
    displayedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredData.slice(start, end);
    },
  },
  methods: {

    // 跳转到详情页
    goToDetail(id) {
      this.$router.push(`/detail/${id}`);
    },
    back() {
      this.$router.go(-1)
    },
    // 过滤数据
    filterData() {
      this.filteredData = this.tableData.filter((item) => {

        const matchId = this.searchId ? item.id.includes(this.searchId) : true;
        const matchStatus = this.searchStatus ? item.status === this.searchStatus : true;

        let matchStartTime = true;
        if (this.searchStartTime) {
          const searchStartTime = new Date(this.searchStartTime).getTime();
          const itemStartTime = new Date(item.start_time).getTime();
          matchStartTime = itemStartTime >= searchStartTime;
        }

        let matchEndTime = true;
        if (this.searchEndTime) {
          const searchEndTime = new Date(this.searchEndTime).getTime();
          const itemEndTime = item.end_time ? new Date(item.end_time).getTime() : null;
          matchEndTime = itemEndTime && itemEndTime <= searchEndTime;
        }

        return matchName && matchId && matchStatus && matchStartTime && matchEndTime;
      });
    },
    fetchData() {
      const name = this.$route.query.name;
      this.workflow_name = name;

      console.log(name)
      // 使用 fetch 获取 API 数据
      fetch(`${this.base_url}/api/workflow_instances?name=${name}`)
          .then((response) => response.json())
          .then((data) => {
            this.tableData = data.instances;
            this.filteredData = data.instances;
          });
    },
    handlePageChange(page) {
      this.currentPage = page;
    },

  },
  mounted() {
    // this.fetchData();
    // 从json文件中获取数据
    fetch('/data.json')
        .then((response) => response.json()
        ).then((data) => {
      this.workflow_name = data.workflow_name;
      this.tableData = data.instances;
      this.filteredData = data.instances;
    });
  }
};
</script>

<style scoped>

.search-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  background-color: #ffffff;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.search-title {
  font-size: 16px;
  font-weight: bold;
  margin-left: 5%;
  margin-right: 5%;
  margin-bottom: 10px;
}

.search-item {
  flex: 0 0 calc(15% - 15px);
  margin-bottom: 10px;
  background-color: #ffffff;
  border-radius: 5px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  display: flex; /* 添加 display: flex */
  align-items: center; /* 添加 align-items: center */
  justify-content: center; /* 添加 justify-content: center */
}

.search-item:not(:last-child) {
  margin-right: 15px;
}

.execute-container {
  margin: 20px;
}

.custom-table {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  overflow: hidden;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 修改表格单元格文字样式 */
::v-deep .el-table__cell {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  line-height: 1.5;
}

/* 根据状态设置文字颜色 */
.status-finished {
  color: #4CAF50; /* 柔和的绿色 */
}

.status-failed {
  color: #F44336; /* 柔和的红色 */
}

.status-running {
  color: #FFC107; /* 柔和的黄色 */
}
.back-button {
  background-color: #409eff;
  color: #fff;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  margin: 20px 0;
  display: inline-block;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

</style>