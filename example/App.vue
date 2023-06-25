<template>
  <div id="app">
    <myheader/>
    <el-row>
      <el-col :span="3">
        <navagation></navagation>
      </el-col>
      <el-col :span="21">
        <router-view name="execute"></router-view>
        <router-view name="manager" @updateData="updateDataFromJson" @updateWorkflowName="updateWorkflowName"></router-view>
        <router-view name="workflowDetail"></router-view>
        <router-view name="elementui"></router-view>
        <keep-alive>

          <router-view name="Wfd" ref="wfd" :height="containerHeight" :lang="lang" :data="this.data"
                       :layout="layout" @update-layout="updateLayout" @update:data="updateDataFromChild"
                       :workflowName="workflowName" @updateWorkflowName="updateWorkflowName"></router-view>
        </keep-alive>
        <!--        <wfd-vue ref="wfd" :height="600" :lang="lang" :data="this.data" :layout="layout"-->
        <!--             @update-layout="updateLayout"/>-->


      </el-col>

    </el-row>


    <input id="datafile" type="file" accept=".yml, .yaml, .json"/><br/>


    <!--    {{ RealtimeData }}-->

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

      data: {"nodes": [], "edges": [], "combos": [], "groups": []},
      RealtimeData: null,
      workflowName: ""
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
          this.data = this.$refs['wfd'].graph.loadYAML(content)
        } else if (fileType === "json") {
          this.data = JSON.parse(content)
        }

      });
      reader.readAsText(file);

    },
    updateWorkflowName(newName) {
      this.workflowName = newName;
    },

    updateDataFromChild(newData) {
      this.data = newData;
    },
    updateDataFromJson(newData){
      this.data = JSON.parse(newData)
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


    updateLayout(newValue) {
      this.layout = newValue;
    },
    updateContainerHeight() {
      this.containerHeight = window.innerHeight * 0.85; // 例如，根据屏幕高度的80%设置容器高度
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
<style scoped>
.wfd-container {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: auto;
}

@media screen and (max-width: 767px) {
  .wfd-container {
    zoom: 0.8;
  }
}

@media screen and (min-width: 768px) and (max-width: 991px) {
  .wfd-container {
    zoom: 0.9;
  }
}

@media screen and (min-width: 992px) and (max-width: 1199px) {
  .wfd-container {
    zoom: 1;
  }
}

@media screen and (min-width: 1200px) {
  .wfd-container {
    zoom: 1;
  }
}
</style>