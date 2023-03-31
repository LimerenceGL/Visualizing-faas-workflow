<template>
  <div class="execute-container">
    <div class="search-container">
  <div class="search-title">搜索</div>
  <div class="search-item">
    <el-input
      placeholder="名称"
      v-model="searchName"
      clearable
      @clear="filterData"
      @input="filterData"
    ></el-input>
  </div>
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
      <el-option label="error" value="error"></el-option>
      <el-option label="running" value="running"></el-option>
    </el-select>
  </div>
  <div class="search-item">
    <el-input
      placeholder="节点数"
      v-model="searchNodeCount"
      clearable
      @clear="filterData"
      @input="filterData"
    ></el-input>
  </div>
</div>
       <el-table
      :data="displayedData"
      style="width: 100%"

      class="custom-table"
    >
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="id" label="ID"></el-table-column>
      <el-table-column label="状态">
  <template slot-scope="scope">
    <span :class="{
      'status-finished': scope.row.status === 'finished',
      'status-error': scope.row.status === 'error',
      'status-running': scope.row.status === 'running'
    }">{{ scope.row.status }}</span>
  </template>
</el-table-column>
      <el-table-column prop="nodeCount" label="节点数"></el-table-column>
          <el-table-column label="更新时间">
        <template slot-scope="scope">
          {{ timeDifference(scope.row.update) }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            type="info" plain
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
      tableData: [],
      filteredData: [],
      searchName: "",
      searchId: "",
      searchStatus: "",
      searchNodeCount: "",
       pageSize: 9,
      currentPage: 1,
    };
  },
   computed: {
    timeDifference() {
      return (timestamp) => {
        if (!timestamp) return "未知";
        const now = Date.now();
        const diff = now - timestamp;
        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;
        if (diff < minute) {
          return Math.floor(diff / 1000) + "秒前";
        } else if (diff < hour) {
          return Math.floor(diff / minute) + "分钟前";
        } else if (diff < day) {
          return Math.floor(diff / hour) + "小时前";
        } else if (diff < 10 * day) {
          return Math.floor(diff / day) + "天前";
        } else {
          return "10天以上";
        }
      };
    },
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
    // 根据状态返回对应的文本
    tableStatusFormatter(status) {
      console.log(status)
      return status
    },
    // 过滤数据
    filterData() {
      this.filteredData = this.tableData.filter((item) => {
        const matchName = this.searchName ? item.name.includes(this.searchName) : true;
        const matchId = this.searchId ? item.id.includes(this.searchId) : true;
        const matchStatus = this.searchStatus ? item.status === this.searchStatus : true;
        const matchNodeCount = this.searchNodeCount
            ? item.nodeCount.toString().includes(this.searchNodeCount)
            : true;
        return matchName && matchId && matchStatus && matchNodeCount;
      });
    },

     handlePageChange(page) {
      this.currentPage = page;
    },

  },
  mounted() {
    // 从json文件中获取数据
    fetch('/data.json')
        .then((response) => response.json()
        ).then((data) => {
      this.tableData = data;
      this.filteredData = data;
    });
  }
  ,
};
</script>
<style scoped>

.search-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.search-title {
  font-size: 16px;
  font-weight: bold;
  margin-left: 5%;
  margin-right: 5%;
  margin-bottom: 13px;
}

.search-item {
  flex: 0 0 calc(15% - 15px);
  margin-bottom: 10px;
  background-color: #ffffff;

  border-radius: 5px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
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

  .status-error {
    color: #F44336; /* 柔和的红色 */
  }

  .status-running {
    color: #FFC107; /* 柔和的黄色 */
  }
</style>