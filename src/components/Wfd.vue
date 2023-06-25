<template>
  <div class="root">
    <el-row class="position-relative">

      <ToolbarPanel ref="toolbar"/>

      <IoPanel class="floating-io-panel" @changeData="updateData" :graph="this.graph"
               @updateWorkflowName="updateWorkflowName" :workflowName="workflowName" @resetGraph="resetGraph"></IoPanel>

    </el-row>
    <div class="display-flex">
      <ItemPanel ref="addItemPanel" class="itemPanel" :height="height" :workflowName="workflowName"/>

      <div ref="canvas" class="canvasPanel"></div>
      <DetailPanel ref="detailPanel"
                   class="detailPanel"
                   :height="height"
                   :model="selectedModel"
                   :readOnly=false
                   :next-object="nextObject"
                   :onChange="(key,val)=>{onItemCfgChange(key,val)}"
                   v-show="Object.keys(selectedModel).length > 0"/>

    </div>

    <!--    <div v-if="this.graph">{{ this.graph.save() }}</div>-->

    <div>
    </div>

  </div>
</template>
<script>
import G6 from '@antv/g6/lib';
import {getShapeName} from '../util/clazz'
import Command from '../plugins/command'
import Toolbar from '../plugins/toolbar'
import AddItemPanel from '../plugins/addItemPanel'
import CanvasPanel from '../plugins/canvasPanel'
import ToolbarPanel from '../components/ToolbarPanel'
import ItemPanel from '../components/ItemPanel'
import DetailPanel from '../components/DetailPanel'

import i18n from '../locales'
import {exportImg, exportXML} from "../util/bpmn"
import registerShape from '../shape'
import registerBehavior from '../behavior'
import {downloadJSON, downloadYAML, generateGraphJson} from "../util/yamlGenerator";
import IoPanel from "./IoPanel";

registerShape(G6);
registerBehavior(G6);
export default {
  name: "wfd-vue",
  components: {
    ToolbarPanel,
    ItemPanel,
    DetailPanel,

    IoPanel
  },
  provide() {
    return {
      i18n: i18n[this.lang]
    }
  },
  props: {
    isView: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: "edit"
    },
    height: {
      type: Number,
      default: 800,
    },
    lang: {
      type: String,
      default: "zh"
    },
    data: {
      type: Object,
      default: () => ({nodes: [], edges: []})
    },
    nextObject: {
      type: Object,
      default: () => ({})
    },
    workflowName: {
      type: String,
      default: ""
    }

  },
  data() {
    return {
      resizeFunc: () => {
      },
      selectedModel: {},
      processModel: {
        id: '',
        name: '',
        clazz: 'process',


      },
      graph: null,
      cmdPlugin: null,
      localData: this.data,
    };
  },
  watch: {
    localData(newData, oldData) {
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
    data(newData) {
      this.localData = newData
    }

  },
  methods: {
    resetGraph() {
      this.localData = {nodes: [], edges: [], combos: [], groups: []};
      if (this.graph) {
        this.graph.clear();
        this.graph.changeData(this.initShape(this.localData));
      }
    },


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
    initEvents() {
      this.graph.on('afteritemselected', (items) => {
        if (items && items.length > 0) {
          let item = this.graph.findById(items[0]);
          if (!item) {
            item = this.getNodeInSubProcess(items[0])
          }
          this.selectedModel = {...item.getModel()};
        } else {
          this.selectedModel = this.processModel;
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
    onItemCfgChange(key, value) {
      const items = this.graph.get('selectedItems');
      if (items && items.length > 0) {
        let item = this.graph.findById(items[0]);
        if (!item) {
          item = this.getNodeInSubProcess(items[0])
        }
        if (this.graph.executeCommand) {
          this.graph.executeCommand('update', {
            itemId: items[0],
            updateModel: {[key]: value}
          });
        } else {
          this.graph.updateItem(item, {[key]: value});
        }
        this.selectedModel = {...item.getModel()};
      } else {
        const canvasModel = {...this.processModel, [key]: value};
        this.selectedModel = canvasModel;
        this.processModel = canvasModel;
      }
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

    watch_switch_next() {
      //检测新增和修改
      let json = this.graph.save()
      for (let node of json['nodes']) {
        if (node['clazz'] == 'exclusiveGateway') {
          let nodeid = node['id'];
          if (!this.nextObject[nodeid])
            this.nextObject[nodeid] = {};
          for (let edge of json['edges']) {
            if (edge['source'] == nodeid) {
              let targetnodeid = edge['target']
              for (let tarnode of json['nodes']) {
                if (tarnode['id'] == targetnodeid) {
                  this.nextObject[nodeid][targetnodeid] = tarnode['label']
                }
              }
            }
          }
        }
      }
      //检测是否有删除
      for (let sourcenode of Object.keys(this.nextObject)) {
        if (Object.keys(sourcenode).length != 0) {
          for (let targetnode of Object.keys(this.nextObject[sourcenode])) {
            let is_alive = false
            for (let edge of json['edges']) {
              if (edge['source'] == sourcenode && edge['target'] == targetnode) {
                // console.log('here')
                is_alive = true
              }
            }
            //如果线被删了
            if (!is_alive) {

              //修改nextobject数组
              delete this.nextObject[sourcenode][targetnode]
              //删除model中相关属性，后续改掉，这样的代码太ugly了
              for (let node of json['nodes']) {
                if (node.id == sourcenode && node.hasOwnProperty('conditions' + targetnode)) {
                  delete node['conditions' + targetnode]
                }
              }

            }
          }
        }
      }
    },

    updateData(newdata) {
      this.localData = newdata;
    },
    updateWorkflowName(newName) {
      this.$emit("updateWorkflowName", newName);
    },

  },
  destroyed() {
    window.removeEventListener("resize", this.resizeFunc);
    this.graph.getNodes().forEach(node => {
      node.getKeyShape().stopAnimate();
    });
  },
  beforeUpdate() {
    this.watch_switch_next()
  },
  mounted() {


    let plugins = [];
    if (!this.isView) {
      this.cmdPlugin = new Command();//工具栏
      const toolbar = new Toolbar({container: this.$refs['toolbar'].$el});
      const addItemPanel = new AddItemPanel({container: this.$refs['addItemPanel'].$el});
      const canvasPanel = new CanvasPanel({container: this.$refs['canvas']});
      plugins = [this.cmdPlugin, toolbar, addItemPanel, canvasPanel];
    }
    const width = this.$refs['canvas'].offsetWidth;

    this.graph = new G6.Graph({
      plugins: plugins,
      container: this.$refs['canvas'],
      height: this.height * 0.8,
      width: width,
      modes: {
        default: ['drag-canvas', 'clickSelected'],
        //'drag-canvas':拖动画布
        view: [],
        edit: ['hoverNodeActived', 'hoverAnchorActived', 'dragNode', 'dragEdge', 'drag-canvas',
          'dragPanelItemAddNode', 'clickSelected', 'deleteItem', 'itemAlign', 'dragPoint', 'brush-select'],
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
    //添加保存为需要的json格式功能
    this.graph.saveXML = (createFile = false) => exportXML(this.graph.save(), this.processModel, createFile);
    this.graph.saveImg = (createFile = true) => exportImg(this.$refs['canvas'], this.processModel.name, createFile);
    this.graph.saveYAML = () => downloadYAML(this.graph.save(), this.workflowName)
    this.graph.saveJSON = () => downloadJSON(this.graph.save())
    this.graph.loadYAML = (content) => generateGraphJson(content)


    if (this.isView)
      this.graph.setMode('view');
    else
      this.graph.setMode(this.mode);
    this.graph.data(this.initShape(this.localData));
    this.graph.render();
    if (this.isView && this.localData && this.localData.nodes) {
      this.graph.fitView(5)
    }
    this.initEvents();


  }
};
</script>
<style lang="scss" scoped>
.root {
  width: 100%;
  height: 100%;
  background-color: #fff;
  display: block;
}

.display-flex {
  display: flex;
  flex-wrap: nowrap;
}

.itemPanel {
  flex: 0 0 auto;
  float: left;
  width: 15%; // 根据需要调整宽度
  background-color: #fff;
  border-bottom: 1px solid #E9E9E9;
}

.position-relative {
  position: relative;
}

.floating-io-panel {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1000;
}

.canvasPanel {
  flex: 0 0 auto;
  float: left;
  width: 65%; // 根据需要调整宽度
  background-color: #fff;
  border-bottom: 1px solid #E9E9E9;
  margin-left: 2px;
}

.detailPanel {
  flex: 0 0 auto;
  float: left;
  width: 20%; // 根据需要调整宽度
  background-color: #fff;
  border-bottom: 1px solid #E9E9E9;
}

.g6-tooltip {
  border: 1px solid #e2e2e2;
  border-radius: 4px;
  font-size: 12px;
  color: #545454;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px 8px;
  box-shadow: rgb(174, 174, 174) 0px 0px 10px;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
</style>
