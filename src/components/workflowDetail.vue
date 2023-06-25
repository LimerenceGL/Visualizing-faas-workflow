<template>
  <div class="detail-container">
    <el-row>
      <el-col :span="3">
        <el-button size="small" @click="switchLayout">切换布局</el-button>
      </el-col>
      <el-col :span="3">
        <el-slider v-model="scale" :min="0.1" :max="2" :step="0.1" @change="onScaleChange"></el-slider>
      </el-col>

      <el-col :span="3">
        <el-button size="small"
                   @click="back">返回
        </el-button>
      </el-col>
    </el-row>
    <el-row>

    </el-row>
    <el-row>
      <div ref="canvas" class="canvasPanel" @wheel="onWheel"></div>
      <div class="detail-panel-container">
        <!-- Add your custom div here -->
        <div>
          <process-panel :model="statusData"></process-panel>
        </div>

        <DetailPanel ref="detailPanel"
                     :height="height*0.7"
                     :model="selectedModel"
                     :readOnly=true
                     :next-object="nextObject"
                     v-show="Object.keys(selectedModel).length > 0"/>
      </div>


    </el-row>
    {{ selectedModel }}
    <!--    <div v-if="this.graph">{{ this.graph.save() }}</div>-->


  </div>


</template>

<script>
import G6 from '@antv/g6/lib';
import {getShapeName} from '../util/clazz'
import CanvasPanel from '../plugins/canvasPanel'
import DetailPanel from '../components/DetailPanel'
import processPanel from "./processPanel";
import registerShape from '../shape'
import registerBehavior from '../behavior'
import i18n from '../locales'
import {generateGraphJson} from "../util/yamlGenerator";

registerShape(G6);
registerBehavior(G6);
export default {
  name: "workflowDetail.vue",
  components: {
    DetailPanel,
    processPanel
  },
  provide() {
    return {
      i18n: i18n[this.lang]
    }
  },
  props: {
    mode: {
      type: String,
      default: "default"
    },
    height: {
      type: Number,
      default: 800,
    },
    lang: {
      type: String,
      default: "zh"
    },
    nextObject: {
      type: Object,
      default: () => ({})
    },
    // id: {
    //   type: String,
    //   required: true
    // }
  },
  data() {
    return {
      // 添加缩放、布局和搜索相关的数据
      scale: 1,
      layout: "TB",
      resizeFunc: () => {
      },
      data: [],
      selectedModel: {},
      graph: null,
      cmdPlugin: null,
      model: {},
      edgeflow_base_url: 'http://133.133.135.8:31187',
      workflowName: '',
      callId: '',
      statusData: {"instanceStatus":{}},
      base_url: 'http://133.133.134.87:3000',
    };
  },
  methods: {
    initShape(data) {
      if (data && data.nodes) {
        return {
          nodes: data.nodes.map(node => {
            return {
              shape: getShapeName(node.clazz),

              ...node,
            }
          }),
          edges: data.edges
        }
      }
      return data;
    },
    onWheel(e) {
      if (e.preventDefault) {
        e.preventDefault();
      }
      const canvas = this.graph.get('canvas');
      const point = canvas.getPointByClient(e.clientX, e.clientY);
      const ratio = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const currentScale = this.graph.getZoom();
      const newScale = currentScale * ratio;
      this.graph.zoomTo(newScale, point);
      this.scale = newScale; // 更新scale数据
    },
    initEvents() {
      this.graph.on('afteritemselected', (items) => {
        if (items && items.length > 0) {
          let item = this.graph.findById(items[0]);
          if (!item) {
            item = this.getNodeInSubProcess(items[0])
          }
          this.selectedModel = {...item.getModel()};
        } else {
          this.selectedModel = {};
        }
      });

      const page = this.$refs['canvas'];
      const graph = this.graph;
      const height = this.height - 1;
      this.resizeFunc = () => {
        graph.changeSize(page.offsetWidth, height);
      };
      window.addEventListener("resize", this.resizeFunc);
      this.graph.on('canvas:click', () => {
        this.selectedModel = {};
      });
    },
    getNodeInSubProcess(itemId) {
      const subProcess = this.graph.find('node', (node) => {
        if (node.get('model')) {
          const clazz = node.get('model').clazz;
          if (clazz === 'subProcess') {
            const containerGroup = node.getContainer();
            const subGroup = containerGroup.subGroup;
            const item = subGroup.findById(itemId);
            return subGroup.contain(item);
          } else {
            return false;
          }
        } else {
          return false;
        }
      });
      if (subProcess) {
        const group = subProcess.getContainer();
        return group.getItem(subProcess, itemId);
      }
      return null;
    },
    back() {
      this.$router.go(-1)
    },
    async getGraph() {
      try {
        const response = await fetch(`${this.base_url}/storage/localWorkflow/${this.workflowName}.json`);
        this.data = await response.json();

      } catch (error) {
        console.error('Error fetching file content:', error);
      }
    },
    // 添加缩放方法
    onScaleChange(scale) {
      this.graph.zoomTo(scale);
    },
    // 添加切换布局方法
    switchLayout() {
      if (this.layout === "TB") {
        this.layout = "LR";
      } else {
        this.layout = "TB";
      }
      this.graph.updateLayout({
        type: 'dagre',
        rankdir: this.layout,
        ranksep: 20,
      });
    },
    async getInstanceStatus() {
      try {
        const response = await fetch(`${this.edgeflow_base_url}/workflow/status/${this.workflowName}/${this.callId}`, {
          method: 'GET',
        });
        if (response.ok) {
          const responseData = await response.json();
          console.log(responseData)
          this.updateNodeColors(responseData);
          this.statusData=responseData
          // 判断是否需要继续请求状态
          const {instanceStatus} = responseData;
          if (instanceStatus && instanceStatus.status === "EXECUTING") {
            // 每隔1秒再次获取执行状态
            setTimeout(() => {
              this.getInstanceStatus();
            }, 1000);
          }
        }
      } catch (error) {
      }
    },


    updateNodeColors(statusData) {
      if (!statusData || !statusData.instanceStatus || !statusData.instanceStatus.nodes) {
        return;
      }

      const nodesStatus = statusData.instanceStatus.nodes;
      const graphNodes = this.graph.getNodes();

      for (const nodeName in nodesStatus) {
        const nodeStatus = nodesStatus[nodeName];
        const targetNode = graphNodes.find(node => node.getModel().id === nodeStatus.name);
        if (!targetNode) {
          continue;
        }

        let color;
        switch (nodeStatus.status) {
          case 'finished':
            color = '#d8f6be';
            break;
          case 'error':
            color = 'red';
            break;
          case 'running':
            color ='#eff3af';
            break;
          case 'pending':
            color ='transparent';
            break;
          default:
            color = 'transparent';
        }

        this.graph.updateItem(targetNode, {
          style: {
            fill: color,
            stroke: 'black',
          },
        });
      }

      this.graph.refresh();
    },


  },
  destroyed() {
    window.removeEventListener("resize", this.resizeFunc);
    this.graph.getNodes().forEach(node => {
      node.getKeyShape().stopAnimate();
    });
  },
  watch: {
    data(newData, oldData) {
      if (oldData !== newData) {
        if (this.graph) {
          this.graph.changeData(this.initShape(newData));
          this.graph.setMode(this.mode);
          // this.graph.emit('canvas:click');

          if (this.cmdPlugin) {
            this.cmdPlugin.initPlugin(this.graph);
          }
          if (this.isView) {
            this.graph.fitView(5)
          }
        }
      }
    },
  },
  mounted() {
    //根据id获取数据
    this.callId = this.$route.params.id
    this.workflowName = this.$route.params.workflowName
    this.getInstanceStatus()
    // const baseURL = '/graphYamlData/'
    // fetch(baseURL + this.callId + '.yaml')
    //     .then((response) => response.text()
    //     ).then((data) => {
    //   data = this.graph.loadYAML(data)
    //   this.data = data
    //   console.log(this.data)
    // });
    this.getGraph()
    let plugins = [];
    const canvasPanel = new CanvasPanel({container: this.$refs['canvas']});
    plugins = [canvasPanel]
    const width = this.$refs['canvas'].offsetWidth;
    this.graph = new G6.Graph({
      plugins: plugins,
      container: this.$refs['canvas'],
      height: this.height,
      width: width,
      modes: {
        default: ['drag-canvas', 'clickSelected'],
        //'drag-canvas':拖动画布
        view: [],
        edit: [
          'clickSelected',  'drag-canvas'],
      },
      defaultEdge: {
        shape: 'flow-polyline-round',
      },
      layout: {
        type: 'dagre',
        rankdir: 'TB',
        ranksep: 20,
      }
    });
    this.graph.loadYAML = (content) => generateGraphJson(content)

    this.graph.setMode(this.mode);
    this.graph.data(this.initShape(this.data));
    this.graph.render();
    // this.clearNodeColors()
    this.graph.fitView(5);
    this.initEvents();

  },


}
</script>


<style scoped>
.detail-container {

}

.detail-panel-container {
  display: flex;
  flex-direction: column;
  width: 30%;
}


.detail-container {
  width: 100%;
  height: 100%;
  background-color: #fff;
  display: block;
}

.canvasPanel {
  flex: 0 0 auto;
  float: left;
  width: 70%;
  background-color: #fff;
  border-bottom: 1px solid #E9E9E9;
}

::v-deep .g6-node-highlight {
  stroke: #f00;
  stroke-width: 4px;
}

</style>