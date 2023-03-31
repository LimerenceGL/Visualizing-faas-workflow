<template>
  <div id="app">
    <myheader/>
    <el-row>
      <el-col :span="3">
        <navagation></navagation>
      </el-col>
      <el-col :span="21">
        <router-view name="execute"></router-view>

        <router-view name="workflowDetail"></router-view>
        <router-view name="elementui"></router-view>
        <router-view name="Wfd" ref="wfd" :height="containerHeight" :lang="lang" :data="this.jsonFromFile"
                     :layout="layout"
                     @update-layout="updateLayout"></router-view>
        <!--        <wfd-vue ref="wfd" :height="600" :lang="lang" :data="this.jsonFromFile" :layout="layout"-->
        <!--             @update-layout="updateLayout"/>-->


      </el-col>

    </el-row>


    <input id="datafile" type="file" accept=".yml, .yaml, .json"/><br/>

    <!--    <el-button @click="changeColor">改变颜色</el-button>-->
    {{ RealtimeData }}
    <!--    <el-dialog title="查看流程图" :visible.sync="modalVisible" width="60%">-->
    <!--      <wfd-vue ref="wfd"  :height="600" :lang="lang" />-->
    <!--&lt;!&ndash;        <wfd-vue ref="wfd"  v-if="this.$refs['wfd'].hasOwnProperty('age')" :data="this.$refs['wfd'].getData()" :height="300" isView />&ndash;&gt;-->
    <!--    </el-dialog>-->
  </div>
</template>

<script>
import WfdVue from '../src/components/Wfd'
import axios from 'axios';
import navagation from "../src/components/navagation";
import IoPanel from "../src/components/IoPanel";
import workflowDetail from "../src/components/workflowDetail";
import myheader from "../src/components/myheader";

export default {
  name: 'app',
  components: {
    WfdVue,
    navagation,
    IoPanel,
    workflowDetail,
    myheader
  },
  data() {
    return {
      modalVisible: false,
      lang: "zh",
      layout: true,
      containerHeight: 800,
      demoData: {
        "nodes": [{
          "shape": "start-node",
          "id": "startNode",
          "label": "",
          "clazz": "start",
          "style": {},
          "size": [30, 30],
          "depth": 0,
          "x": 262.3360553570836,
          "y": 27.69845487895492,

        }, {
          "shape": "mail-task-node",
          "run": "testrand",
          "runtime": 1,
          "mem_usage": 0.25,
          "scale": 2,
          "id": "rand",
          "clazz": "mailTask",
          "label": "rand",
          "output1name": "rand_resulta",
          "output1task": "pass",
          "output1size": "8",
          "output2name": "rand_resultb",
          "output2task": "pass",
          "output2size": "8",
          "outputCount": 2,
          "reqmem_req": "0.25",
          "reqgpu": "false",
          "style": {},
          "size": [80, 44],
          "depth": 0,
          "x": 262.8360553570836,
          "y": 117.76790154731694,
          "inputCount": 0,
          "hideIcon": false,

        }, {
          "shape": "exclusive-gateway-node",
          "id": "switchcal",
          "clazz": "exclusiveGateway",
          "label": "switchcal",
          "conditionsinvalid": "${rand.rand_resulta} < ${rand.rand_resultb}",
          "conditionssqrt": "default",
          "style": {},
          "size": [40, 40],
          "depth": 0,
          "x": 262.3360553570836,
          "y": 237.57282142506375
        }, {
          "style": {
            "fill": '#D3D3D3', // 设置填充颜色为红色
            "stroke": 'grey' // 设置描边颜色为蓝色
          },
          // "shape": "mail-task-node",
          "run": "testinvalid",
          "runtime": 1,
          "mem_usage": 0.25,
          "scale": 2,
          "id": "invalid",
          "clazz": "mailTask",
          "label": "invalid",
          "output1name": "invalidresult",
          "output1task": "pass",
          "output1size": "8",
          "outputCount": 1,
          "reqmem_req": "0.25",
          "reqgpu": "false",

          "size": [80, 44],
          "depth": 0,
          "x": 379.83173062922486,
          "y": 299.96975588650594,
          "inputCount": 0,
          "hideIcon": true
        }, {
          "shape": "mail-task-node",
          "run": "testsqrt",
          "runtime": 1,
          "mem_usage": 0.25,
          "scale": 2,
          "id": "sqrt",
          "clazz": "mailTask",
          "label": "sqrt",
          "input1name": "numa",
          "input1task": "pass",
          "input1source": "rand.rand_resulta",
          "input1size": "8",
          "input2name": "numb",
          "input2task": "pass",
          "input2source": "rand.rand_resultb",
          "input2size": "8",
          "inputCount": 2,
          "output1name": "sqrt_result",
          "output1task": "pass",
          "output1size": "8",
          "outputCount": 1,
          "reqmem_req": "0.25",
          "reqgpu": "false",
          "style": {},
          "size": [80, 44],
          "depth": 0,
          "x": 163.83605535708358,
          "y": 298.96975588650594
        }, {
          "shape": "end-node",
          "id": "endNode",
          "label": "",
          "clazz": "end",
          "output1name": "result",
          "output1task": "switch",
          "output1source": "",
          "output1size": "",
          "outputCount": 1,
          "style": {},
          "size": [30, 30],
          "depth": 0,
          "x": 268.1380122836498,
          "y": 417.57282142506375
        }],
        "edges": [{
          "source": "startNode",
          "target": "rand",
          "clazz": "flow",
          "shape": "flow-polyline-round",
          "id": "flow1",
          "style": {
            "stroke": '#90EE90', // 设置为红色
            "lineWidth": 2
          },
          "startPoint": {"x": 262.3360553570836, "y": 43.19845487895492, "index": 3, "anchorIndex": 3},
          "endPoint": {"x": 262.8360553570836, "y": 95.26790154731694, "index": 0, "anchorIndex": 0},
          "depth": 0,


        }, {
          "source": "rand",
          "target": "switchcal",
          "clazz": "flow",
          "shape": "flow-polyline-round",
          "id": "flow2",
          "style": {
            "stroke": '#90EE90', // 设置为红色
            "lineWidth": 2
          },
          "startPoint": {"x": 262.8360553570836, "y": 140.26790154731694, "index": 2, "anchorIndex": 2},
          "endPoint": {"x": 262.3360553570836, "y": 219.07282142506375, "index": 0, "anchorIndex": 0},
          "depth": 0
        }, {
          "source": "switchcal",
          "target": "invalid",
          "clazz": "flow",
          "shape": "flow-polyline-round",
          "id": "flow3",
          "style": {},
          "startPoint": {"x": 280.8360553570836, "y": 237.57282142506375, "index": 1, "anchorIndex": 1},
          "endPoint": {"x": 339.33173062922486, "y": 299.96975588650594, "index": 3, "anchorIndex": 3},
          "depth": 0
        }, {
          "source": "switchcal",
          "target": "sqrt",
          "clazz": "flow",
          "shape": "flow-polyline-round",
          "id": "flow4",
          "style": {
            "stroke": '#90EE90', // 设置为红色
            "lineWidth": 2
          },
          "startPoint": {"x": 243.83605535708358, "y": 237.57282142506375, "index": 3, "anchorIndex": 3},
          "endPoint": {"x": 204.33605535708358, "y": 298.96975588650594, "index": 1, "anchorIndex": 1},
          "depth": 0
        }, {
          "source": "invalid",
          "target": "endNode",
          "clazz": "flow",
          "shape": "flow-polyline-round",
          "id": "flow5",
          "style": {},
          "startPoint": {"x": 379.83173062922486, "y": 322.46975588650594, "index": 2, "anchorIndex": 2},
          "endPoint": {"x": 268.1380122836498, "y": 402.07282142506375, "index": 0, "anchorIndex": 0},
          "depth": 0
        }, {
          "source": "sqrt",
          "target": "endNode",
          "clazz": "flow",
          "shape": "flow-polyline-round",
          "id": "flow6",
          "style": {
            "stroke": '#90EE90', // 设置为红色
            "lineWidth": 2
          },
          "startPoint": {"x": 163.83605535708358, "y": 321.46975588650594, "index": 2, "anchorIndex": 2},
          "endPoint": {"x": 268.1380122836498, "y": 402.07282142506375, "index": 0, "anchorIndex": 0},
          "depth": 0
        }],
        "combos": [],
        "groups": []
      }
      ,
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
          this.jsonFromFile = this.$refs['wfd'].graph.loadYAML(content)
        } else if (fileType === "json") {
          this.jsonFromFile = JSON.parse(content)
          // this.jsonFromFile={"haha":"gege"}
          // this.jsonFromFile= {"nodes":"di"}

        }

        // console.log(k)
        // this.$refs['wfd'].graph.test(content)
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
      alert('工作流【xxx】执行成功！')
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
    changeColor() {
      const node = this.$refs['wfd'].graph.findById('invalid');
      node.update({
        style: {
          fill: '#D3D3D3',
          stroke: '#BEBEBE',
        },
      });
    },
    updateLayout(newValue) {
      this.layout = newValue;
    },
    updateContainerHeight() {
      this.containerHeight = window.innerHeight * 0.8; // 例如，根据屏幕高度的80%设置容器高度
    },
  },
  mounted() {
    this.updateContainerHeight();
    window.addEventListener('resize', this.updateContainerHeight);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateContainerHeight);
  },

}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#datafile {
  display: none;
}
</style>
