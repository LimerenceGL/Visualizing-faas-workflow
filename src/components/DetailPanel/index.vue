<template>
    <div class="detailPanel" :style="{'height':height+'px'}">
      <el-scrollbar style="height:100%">
<!--      <ProcessDetail v-if="model.clazz === 'process'" :model="model" :onChange="onChange" :readOnly="readOnly"-->
<!--                     :categorys="categorys"/>-->
      <EndEventDetail v-if="model.clazz === 'end'" :model="model" :onChange="onChange" :readOnly="readOnly"/>
      <StartEventDetail v-else-if="model.clazz === 'start'" :model="model" :onChange="onChange" :readOnly="readOnly"/>
      <GatewayDetail v-else-if="model.clazz === 'gateway' || model.clazz === 'exclusiveGateway' || model.clazz === 'parallelGateway' || model.clazz === 'inclusiveGateway'"
          :model="model" :onChange="onChange" :readOnly="readOnly" :nextObject="nextObject"/>
      <MailTaskDetail v-else-if="model.clazz === 'mailTask'" :model="model"  :onChange="onChange" :readOnly="readOnly"/>
      <TimerEventDetail v-else-if="model.clazz === 'timerStart' || model.clazz === 'timerCatch'" :model="model"
                        :onChange="onChange" :readOnly="readOnly"/>
      <ScriptTaskDetail v-else-if="model.clazz === 'scriptTask'" :model="model" :onChange="onChange"
                        :readOnly="readOnly"/>
      </el-scrollbar>
    </div>
</template>
<script>
import ProcessDetail from "./ProcessDetail"
import EndEventDetail from "./EndEventDetail"
import StartEventDetail from "./StartEventDetail"
import GatewayDetail from "./GatewayDetail"
import MailTaskDetail from "./MailTaskDetail"
import TimerEventDetail from "./TimerEventDetail"
import ScriptTaskDetail from "./ScriptTaskDetail"

export default {
  components: {
    ProcessDetail,
    EndEventDetail,
    StartEventDetail,
    GatewayDetail,
    MailTaskDetail,
    TimerEventDetail,
    ScriptTaskDetail
  },
  props: {
    height: {
      type: Number,
      default: 800,
    },
    model: {
      type: Object,
      default: () => ({}),
    },
    categorys: {
      type: Array,
      default: () => ([]),
    },
    onChange: {
      type: Function,
      default: () => {
      }
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    nextObject: {
      type: Object,
      default: () => ({})
    }
  },
}
</script>
<style lang="scss">
  .detailPanel {
    height: 100%;
    background: #ffffff; // 背景色改为白色
    font-family: 'Helvetica Neue', Arial, sans-serif;
    flex: 0 0 auto;
    float: left;
    width: 100%;
    border-right: 1px solid #E9E9E9;
    border-bottom: 1px solid #E9E9E9;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); // 添加阴影

    .panelTitle {
      text-align: left;
      height: 32px;
      padding-left: 12px;
      color: #000;
      line-height: 28px;
      background: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;
      font-weight: bold;
    }

    .panelBody {
      padding: 10px;

      .panelRow {
        text-align: left;
        display: inline-block;
        font-size: 14px;
        width: 100%;
        padding: 10px 12px;
      }
    }

    .el-scrollbar__wrap {
      overflow-x: hidden !important;
    }

    .el-scrollbar__bar.is-horizontal {
      display: none;
    }
  }
</style>
