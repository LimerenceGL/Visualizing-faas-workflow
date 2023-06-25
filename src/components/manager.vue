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
              :disabled="scope.row.tag === 'deployed'"
              @click="editFile(scope.row)"
          >
            编辑
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="删除">
        <template slot-scope="scope">
          <el-button
              type="button"
              plain
              :disabled="scope.row.tag === 'deployed'"
              @click="deleteFile(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>

      <el-table-column label="部署">
        <template slot-scope="scope">
          <el-button
              plain
              :disabled="scope.row.tag === 'deployed'"
              @click="deployFile(scope.row)"
          >
            部署
          </el-button>
        </template>
      </el-table-column>

      <el-table-column label="卸载">
        <template slot-scope="scope">
          <el-button
              plain
              :disabled="scope.row.tag === 'undeployed'"
              @click="undeployFile(scope.row)"
          >
            卸载
          </el-button>
        </template>
      </el-table-column>

      <el-table-column label="调用">
        <template slot-scope="scope">
          <el-button
              plain
              :disabled="scope.row.tag !== 'deployed'"
              @click="invokeWorkflow(scope.row)"
          >
            调用
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="查看">
        <template slot-scope="scope">
          <el-button
              plain
              :disabled="scope.row.tag !== 'deployed'"
              @click="goToDetail(scope.row.name)"
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
import {downloadYAML} from "../util/yamlGenerator";

export default {
  name: "Manager",
  data() {
    return {
      edgeflow_base_url: 'http://133.133.135.8:31187', // 后续填写实际的后端URL
      tableData: [],
      filteredData: [],
      searchName: "",
      searchId: "",
      searchStatus: "",
      searchNodeCount: "",
      pageSize: 9,
      currentPage: 1,
      base_url: 'http://133.133.134.87:3000',
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

    //
    // // 跳转到详情页
    // async goToDetail(name) {
    //   try {
    //     const response = await fetch(
    //         `${this.edgeflow_base_url}/workflow/statuses/${name.replace(".json", "")}`
    //     );
    //
    //     if (!response.ok) {
    //       const errorData = await response.json();
    //       // 处理404错误
    //       if (errorData.error.code === 404) {
    //         this.$message.error("工作流未找到");
    //       }
    //       // 处理其他错误
    //       else {
    //         this.$message.error("请求失败，请重试");
    //       }
    //       return;
    //     }
    //
    //     const data = await response.json();
    //
    //     this.$router.push({
    //       path: `/execute`,
    //       query: {
    //         workflowName: name.replace(".json", ""),
    //         instances: JSON.stringify(data.statuses),
    //       },
    //     });
    //   } catch (error) {
    //     console.error(error);
    //     this.$message.error("请求失败，请重试");
    //   }
    // },
    // 跳转到详情页
    goToDetail(name) {
        this.$router.push({
          path: `/execute`,
          query: {
            workflowName: name.replace(".json", ""),
          },
        });

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
      if (tag === 'undeployed') {
        return "未部署"
      } else if (tag == "deployed") {
        return "已部署"
      }
    },
    handlePageChange(page) {
      this.currentPage = page;
    },
    async deleteFile(file) {
      await fetch(this.base_url + `/storage/localWorkflow/${file.name}?id=${file.id}`, {
        method: 'DELETE',
      });

      this.fetchFileList();
    },


    async deployFile(file) {
      const response = await fetch(`${this.base_url}/storage/localWorkflow/${file.name}`);
      const deployJsonData = await response.json();
      const deployYamlData = downloadYAML(deployJsonData, file.name.replace(".json", ""), false)

      try {
        const workflowName = file.name.replace(/\.json$/, ''); // 去掉后缀作为workflowName
        const formData = new FormData();
        formData.append('file', new Blob([deployYamlData], {type: 'multipart/form-data'}), `${workflowName}.yaml`);

        const deployResponse = await fetch(`${this.edgeflow_base_url}/workflow/deploy/${workflowName}`, {
          method: 'POST',
          body: formData,
        });

        console.log(deployResponse)
        if (deployResponse.ok) {
          const updatedFile = {...file, tag: 'deployed'};
          await this.updateFile(updatedFile);
          this.$message.success(`工作流 ${workflowName} 已成功部署`);

          setTimeout(() => {
            this.fetchFileList();
          }, 2000);
        } else {
          const errorData = await deployResponse.json();
          this.$message.error(`部署失败: ${errorData.error.message}`);
        }
      } catch (error) {
        console.error('Error deploying workflow:', error);
        this.$message.error('部署请求失败');
      }
    },


    async undeployFile(file) {
      try {
        const workflowName = file.name.replace(/\.json$/, ''); // 去掉后缀作为workflowName
        const undeployResponse = await fetch(`${this.edgeflow_base_url}/workflow/undeploy/${workflowName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (undeployResponse.status === 200) {
          const updatedFile = {...file, tag: 'undeployed'};
          await this.updateFile(updatedFile);
          this.$message.success(`工作流 ${workflowName} 已成功卸载`);

          setTimeout(() => {
            this.fetchFileList();
          }, 2000);
        } else {
          const contentType = undeployResponse.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const errorData = await undeployResponse.json();
            this.$message.error(`卸载失败: ${errorData.error.message}`);
          } else {
            this.$message.error('卸载请求失败');
          }
        }
      } catch (error) {
        console.error('Error undeploying workflow:', error);
        this.$message.error('卸载请求失败');
      }
    },


    async invokeWorkflow(file) {
      if (file.tag !== 'deployed') {
        this.$message.warning('只有已部署的工作流才可以调用');
        return;
      }

      try {
        const workflowName = file.name.replace(/\.json$/, ''); // 去掉后缀作为workflowName

        const response = await fetch(`${this.edgeflow_base_url}/workflow/execute/${workflowName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (response.ok) {
          const responseData = await response.json();
          this.$message.success(`工作流已成功调用, 实例ID: ${responseData.call_id}`);
        } else {
          const errorData = await response.json();
          this.$message.error(`调用失败: ${errorData.error.message}`);
        }
      } catch (error) {
        console.error('Error invoking workflow:', error);
        this.$message.error('调用请求失败');
      }
    },
    async updateFile(file) {
      const formData = new FormData();
      formData.append('id', file.id);
      formData.append('tag', file.tag);

      await fetch(this.base_url + `/storage/localWorkflow/${file.name}`, {
        method: 'PUT',
        body: formData,
      });
    },

    async fetchFileList() {
      try {
        const response = await fetch(this.base_url + '/storage/localWorkflow');
        const data = await response.json();
        // 按照 lastModified 进行降序排序
        data.sort((a, b) => {
          return new Date(b.lastModified) - new Date(a.lastModified);
        });
        this.tableData = data;
        this.filteredData = data;
      } catch (error) {
        console.error('Error fetching file list:', error);
      }
    },

    async editFile(file) {
      try {
        const response = await fetch(`${this.base_url}/storage/localWorkflow/${file.name}`);
        const data = await response.json();
        this.$emit('updateData',JSON.stringify(data))
        this.$emit('updateWorkflowName',file.name.replace(".json", ""))
        this.$router.push({
          path: '/arrange',

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