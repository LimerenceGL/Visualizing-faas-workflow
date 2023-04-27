<template>

  <div id="IoPanel">

    <el-button size="small" style="float:right;margin-top:6px;margin-right:6px;"
               @click="back">返回
    </el-button>
    <el-button size="small" style="float:right;margin-top:6px;margin-right:6px;"
               @click="()=>{graph.saveYAML()}">导出YAML
    </el-button>
    <el-button size="small" style="float:right;margin-top:6px;margin-right:6px;"
               @click="()=>{graph.saveJSON()}">导出JSON
    </el-button>
    <el-button size="small" style="float:right;margin-top:6px;margin-right:6px;"
               @click="clickFile">导入工作流
    </el-button>
    <el-button size="small" style="float:right;margin-top:6px;margin-right:6px;"
               @click="saveWorkflow">保存工作流
    </el-button>
    <el-button size="small" style="float:right;margin-top:6px;margin-right:6px;"
               @click="createNewWorkflow">新建工作流
    </el-button>

    <!--    <el-button size="small" style="float:right;margin-top:6px;margin-right:6px;"-->
    <!--               @click="pollingRequests">部署工作流-->
    <!--    </el-button>-->
    <!--    <el-input-->
    <!--        placeholder="请输入工作流名称"-->
    <!--        size="small"-->
    <!--        v-model="workflowName"-->
    <!--        @input="onWorkflowNameChange"-->
    <!--        style="float:right;margin-top:6px;margin-right:6px;;width:150px;"-->
    <!--    >-->
    <!--    </el-input>-->
    <el-link
        :underline="false"
        style="float:right;margin-top:12px;margin-right:20px;"
        @click="openDialog"
    >
      <span style="font-weight: bold">{{ workflowName || "未命名" }}</span>
    </el-link>

    <!-- 添加弹框，用于编辑工作流名称 -->
    <el-dialog
        title="编辑工作流名称"
        :visible.sync="showDialog"
        width="30%"
        @close="showDialog = false"
        :modal="false"
    >
      <el-input
          ref="workflowNameInput"
          placeholder="请输入工作流名称"
          v-model="tempWorkflowName"
          @keyup.enter.native="saveWorkflowName"
      ></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="saveWorkflowName">确定</el-button>
      </span>
    </el-dialog>
    <input id="datafile" type="file" accept=".yml, .yaml, .json"/><br/>

  </div>
</template>

<script>
import axios from "axios";
import {Message} from "element-ui";

export default {
  name: "IoPanel",
  data() {
    return {
      modalVisible: false,
      lang: "zh",

      jsonFromFile: {"nodes": [], "edges": [], "combos": [], "groups": []},
      RealtimeData: null,
      showDialog: false,
      tempWorkflowName: this.workflowName,

    }
  },
  methods: {
    back() {
      this.$router.go(-1)
    },
    readInputFile(event) {
      let file = event.target.files[0];

      if (!file) {
        return;
      }
      let fileType = file.name.substring(file.name.lastIndexOf(".") + 1)
      let reader = new FileReader();

      reader.addEventListener('load', event => {
        let content = event.target.result;
        if (fileType === "yaml" || fileType === "yml") {
          const {rst, workflowName} = this.graph.loadYAML(content)
          this.jsonFromFile = rst
          this.tempWorkflowName = workflowName

          this.onWorkflowNameChange();
        } else if (fileType === "json") {
          this.jsonFromFile = JSON.parse(content)
        }
        this.$emit("changeData", this.jsonFromFile)

      });
      reader.readAsText(file);
    },
    async createNewWorkflow() {
      // 检查图形是否为空（没有节点和边）
      const isEmpty = this.graph.getNodes().length === 0;

      // 如果图形不为空且用户同意保存工作流，则保存工作流
      if (!isEmpty && confirm("当前工作流不为空，是否保存？")) {
        await this.saveWorkflow();
      }
      this.tempWorkflowName = "";
      this.onWorkflowNameChange();
      this.$emit("resetGraph");
    },

    clickFile() {
      document.getElementById('datafile').addEventListener('change', this.readInputFile, false);
      const input = document.querySelector('#datafile')
      input.click()
    },
    async fetchData() {
      try {

        const response = await axios.get('/test.json');
        this.RealtimeData = response.data // 更新数据
      } catch (error) {
        console.log(error);
      }
    },
    pollingRequests() {
      this.fetchData(); // 组件创建时先发起一次请求
      setInterval(() => {
        this.fetchData(); // 每隔5秒发起一次请求
      }, 5000);
    },
    executeWorkflow(graph, workid, executeSituation) {
      //通过执行信息修改工作流
      if (!workid === executeSituation['id']) {
        alert("工作流不匹配")
        return graph
      }
      for (let node in executeSituation['nodes']) {
        if (node['condition'] === 'Finished') {
          for (let graphNode in graph['nodes']) {
            if (graphNode['label'] === node['name']) {
              graphNode['hideIcon'] = false
            }
          }
        } else if (node['condition'] === 'Error') {
          alert("节点", node['name'], "发生错误")
          //添加改变icon规则
          return graph
        }
      }
      return graph
    },


    async saveWorkflow() {
      if (!this.workflowName) {
        Message({
          message: "请输入工作流名称",
          type: "warning",
          duration: 3000
        });
        return;
      }
      const filename = `http://localhost:3000/localWorkflow/${this.workflowName}.json`;
      try {
        // 检查文件是否已经存在
        const response = await axios.head(filename);
        if (response.status === 200) {
          if (confirm("文件已存在，是否替换？")) {
            // 保存文件
            await this.saveWorkflowToFile(filename);
          }
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // 文件不存在，直接保存
          await this.saveWorkflowToFile(filename);
        } else {
          console.error("保存工作流出错:", error);
        }
      }
    },
    async saveWorkflowToFile(filename) {
      try {
        const workflowData = this.graph.save(); // 使用 graph 中的 save 方法获取工作流数据
        const jsonData = JSON.stringify(workflowData); // 将工作流数据转换为 JSON 字符串
        const formData = new FormData();
        const file = new File([jsonData], `${this.workflowName}.json`, {type: "application/json"});
        formData.append("file", file);
        console.log("Saving workflow to:", filename);
        await axios.put(filename, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }); // 发送 PUT 请求保存工作流数据
        Message({
          message: "工作流已保存",
          type: "success",
          duration: 3000
        });

      } catch (error) {
        console.error("保存文件出错:", error);
        Message({
          message: "保存工作流出错，请稍后重试",
          type: "error",
          duration: 3000
        });
      }
    },
    openDialog() {

      this.showDialog = true;
      this.$nextTick(() => {
        // 使用 $refs 获取 el-input 组件并调用 focus() 方法
        this.$refs.workflowNameInput.focus();
      });
    },

    saveWorkflowName() {

      this.onWorkflowNameChange();

      this.showDialog = false;
    },

    onWorkflowNameChange() {
      this.$emit("updateWorkflowName", this.tempWorkflowName);
    },
  },
  props: {
    graph: {
      type: Object,
      default: () => ({nodes: [], edges: []})
    },
    workflowName: {
      type: String,
      default: ""
    }
  }

}
</script>

<style>
#datafile {
  display: none;
}
</style>