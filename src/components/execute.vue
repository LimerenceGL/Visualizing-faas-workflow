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
            'status-finished': scope.row.status === 'DONE',
            'status-failed': scope.row.status === 'failed',
            'status-running': scope.row.status === 'EXECUTING'
          }">{{ scope.row.status }}</span>
          <div v-if="scope.row.status === 'EXECUTING'" class="spinner"></div>
        </template>
      </el-table-column>
      <el-table-column prop="start_time" label="开始时间"></el-table-column>
      <el-table-column prop="end_time" label="结束时间"></el-table-column>
      <el-table-column prop="duration" label="持续时间"></el-table-column>

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
      edgeflow_base_url: 'http://133.133.135.8:31187',
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
      base_url: 'http://133.133.134.87:3000',
      timer: null,
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
      this.$router.push(`/detail/${this.workflow_name}/${id}`);
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

    async fetchWorkflowData() {
      try {
        const response = await fetch(
            `${this.edgeflow_base_url}/workflow/statuses/${this.workflow_name}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          // 处理404错误
          if (errorData.error.code === 404) {
            this.$message.error("工作流未找到");
          }
          // 处理其他错误
          else {
            this.$message.error("请求失败，请重试");
          }
          this.$router.go(-1); // 返回父组件
          return;
        }

        const data = await response.json();
        this.tableData = data.statuses.map(instance => ({
          id: instance.call_id,
          status: instance.status,
          start_time: instance.start_time.substring(0, 19), // 修改为新数据格式的字段
          end_time: instance.end_time.substring(0, 19), //
          duration: this.calculateDuration(instance.start_time.substring(0, 19), instance.end_time.substring(0, 19))
        }));

        // 按开始时间降序排序
        this.tableData.sort((a, b) => {
          return new Date(b.start_time) - new Date(a.start_time);
        });

        this.filteredData = this.tableData;
      } catch (error) {
        console.error(error);
        this.$message.error("请求失败，请重试");
        this.$router.go(-1); // 返回父组件
      }
    },

    async checkExecutingStatus() {
      // 检查是否存在执行状态为 EXECUTING 的实例
      const hasExecutingInstance = this.tableData.some(
          (instance) => instance.status === "EXECUTING"
      );

      if (!hasExecutingInstance) {
        return;
      }

      try {
        const response = await fetch(
            `${this.edgeflow_base_url}/workflow/statuses/${this.workflow_name}`
        );

        if (!response.ok) {
          console.error("获取工作流实例状态失败");
          return;
        }

        const data = await response.json();
        const updatedInstances = data.statuses;

        // 使用更新后的实例数据更新表格数据
        this.tableData = this.tableData.map((instance) => {
          const updatedInstance = updatedInstances.find(
              (item) => item.call_id === instance.id
          );

          if (updatedInstance && updatedInstance.status !== "EXECUTING") {
            return {
              ...instance,
              status: updatedInstance.status,
              end_time: updatedInstance.end_time.substring(0, 19),
              duration: this.calculateDuration(
                  instance.start_time,
                  updatedInstance.end_time.substring(0, 19)
              ),
            };
          }

          return instance;
        });

        this.filteredData = this.tableData;
      } catch (error) {
        console.error(error);
      }
    },


    calculateDuration(startTime, endTime) {
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);

      // Ensure both dates are valid
      if (isNaN(startDate) || isNaN(endDate)) {
        return ''
      }

      // Calculate the duration in milliseconds
      const durationMilliseconds = endDate.getTime() - startDate.getTime();

      // Convert the duration to hours, minutes, and seconds
      const durationSeconds = Math.floor(durationMilliseconds / 1000);
      const hours = Math.floor(durationSeconds / 3600);
      const minutes = Math.floor((durationSeconds % 3600) / 60);
      const seconds = durationSeconds % 60;

      // Format the duration as a string
      let durationString = '';

      if (hours > 0) {
        durationString += `${hours} hours, `;
      }

      if (minutes > 0) {
        durationString += `${minutes} minutes, `;
      }

      durationString += `${seconds} seconds`;

      return durationString;
    },


    handlePageChange(page) {
      this.currentPage = page;
    },

  },
  async mounted() {
    // this.fetchData();
    const name = this.$route.query.workflowName;
    this.workflow_name = name;
    await this.fetchWorkflowData();
    this.timer = setInterval(() => {
      this.checkExecutingStatus();
    }, 3000);
  },
  // 当组件被销毁时，清除定时器
  beforeDestroy() {
    clearInterval(this.timer);
  },

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

.spinner {
  display: inline-block;
  width: 15px;
  height: 15px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-left-color: black;
  border-radius: 50%;
  margin-top: 10px;
  margin-left: 5px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>