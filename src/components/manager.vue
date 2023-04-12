<template>
  <div class="manager-container">
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

    </div>
    <el-table
        :data="displayedData"
        style="width: 100%"

        class="custom-table"
    >
      <el-table-column label="名称">
        <template slot-scope="scope">
          {{ scope.row.name.replace(".json", "") }}
        </template>
      </el-table-column>
      <el-table-column label="修改时间">
        <template slot-scope="scope">
          {{ showTime(scope.row.lastModified) }}
        </template>
      </el-table-column>
      <el-table-column label="标记">
        <template slot-scope="scope">
          {{ showTag(scope.row.tag) }}
        </template>
      </el-table-column>
      <el-table-column label="编辑">
        <template slot-scope="scope">
          <el-button
              plain
              @click="editFile(scope.row)"
          >
            编辑
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="删除">
        <template slot-scope="scope">
          <el-button
              plain
              @click="deleteFile(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="上传">
        <template slot-scope="scope">
          <el-button
              plain
              @click="uploadFile(scope.row)"
          >
            上传
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="部署">
        <template slot-scope="scope">
          <el-button
              plain
              @click="deployFile(scope.row)"
          >
            部署
          </el-button>
        </template>
      </el-table-column>


      <el-table-column label="查看">
        <template slot-scope="scope">
          <el-button
              plain
              @click="goToDetail(scope.row.id)"
          >
            查看实例
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
  name: "Manager",
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
      base_url: 'http://localhost:3000',
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
    showTime(dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    showTag(tag) {
      if (tag === 'not_uploaded') {
        return "未上传"
      } else if (tag === 'uploaded') {
        return "已上传"
      } else if (tag == "deployed") {
        return "已部署"
      }
    },
    handlePageChange(page) {
      this.currentPage = page;
    },
    async deleteFile(file) {
      await fetch(this.base_url + `/public/localWorkflow/${file.name}?id=${file.id}`, {
        method: 'DELETE',
      });
      this.fetchFileList();
    },

    async uploadFile(file) {
      const updatedFile = {...file, tag: 'uploaded'};
      await this.updateFile(updatedFile);
      setTimeout(() => {
        this.fetchFileList();
      }, 2000);
    },

    async deployFile(file) {
      const updatedFile = {...file, tag: 'deployed'};
      await this.updateFile(updatedFile);
      setTimeout(() => {
        this.fetchFileList();
      }, 2000);
    },

    async updateFile(file) {
      const formData = new FormData();
      formData.append('id', file.id);
      formData.append('tag', file.tag);

      await fetch(this.base_url + `/public/localWorkflow/${file.name}`, {
        method: 'PUT',
        body: formData,
      });
    },

    async fetchFileList() {
      try {
        const response = await fetch(this.base_url + '/public/localWorkflow');
        const data = await response.json();
        this.tableData = data;
        this.filteredData = data;
      } catch (error) {
        console.error('Error fetching file list:', error);
      }
    },
    async editFile(file) {
      try {
        const response = await fetch(`${this.base_url}/public/localWorkflow/${file.name}`);
        const data = await response.json();
        this.$router.push({
          path: '/arrange',
          query: {
            data: JSON.stringify(data),
            filename: file.name.replace(".json",""),
          },
        });
      } catch (error) {
        console.error('Error fetching file content:', error);
      }
    },

  },
  mounted() {
    this.fetchFileList();
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
  margin-bottom: 10px; /* 将 margin-bottom 设置为 10px 以使其与 search-item 保持一致 */
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

.manager-container {
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