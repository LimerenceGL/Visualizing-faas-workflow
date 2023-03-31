<template>

  <div id="IoPanel">

    <el-button size="small" style="float:right;margin-top:6px;margin-right:6px;"
               @click="updateYAML">上传YAML<i class="el-icon-upload el-icon--right"></i>
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
               @click="pollingRequests">部署工作流
    </el-button>
    <input id="datafile" type="file" accept=".yml, .yaml, .json"/><br/>

  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "IoPanel",
  data() {
    return {
      modalVisible: false,
      lang: "zh",
      layout: true,
      jsonFromFile: {"nodes": [], "edges": [], "combos": [], "groups": []},
      RealtimeData: null,
      workflowId: null,

    }
  },
  methods: {

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
          this.jsonFromFile = this.graph.loadYAML(content)
        } else if (fileType === "json") {
          this.jsonFromFile = JSON.parse(content)
        }
        this.$emit("changeData",this.jsonFromFile)

      });
      reader.readAsText(file);


    },

    clickFile() {
      document.getElementById('datafile').addEventListener('change', this.readInputFile, false);
      const input = document.querySelector('#datafile')
      input.click()
    },
    async fetchData() {
      try {
        // const response = await axios.post('/api/data', { // 发起POST请求
        //   key1: 'value1',
        //   key2: 'value2'
        // });
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
    updateYAML() {
      alert("方法未实现")
    },
    getDeployMessage(info) {
      //获取部署信息
      if (info['state'] === 1) {
        this.workflowId = info['id']
        return true
      } else if (info['state'] === 2 || info['state'] === 3) {
        alert(info['message'])
        return false
      }
    },

    updateLayout(newValue) {
      this.layout = newValue;
    },
  },
  props:["graph"]
}
</script>

<style >
#datafile {
  display: none;
}
</style>