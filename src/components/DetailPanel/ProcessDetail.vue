<template>
  <div :data-clazz="model.clazz">
    <div class="panelTitle">工作流执行状态</div>
    <div class="panelBody">
<!--      <DefaultDetail :model="model" :onChange="onChange" :readOnly="readOnly"/>-->
      <div class="panelRow" >
        <br><br><br>
      </div>
      <div class="panelRow" >
<!--        <el-radio-button  v-model="status" label="未执行"  > </el-radio-button>-->
        <el-checkbox v-model="status" disabled>未执行</el-checkbox>
      </div>
      <div class="panelRow">
<!--        <el-radio-button v-model="status" label="正在执行"  ></el-radio-button>-->
        <el-checkbox v-model="status" disabled>正在执行</el-checkbox>
      </div>
<!--<br><br><br>-->
      <div class="panelRow">
<!--        <el-radio-button v-model="status" label="执行完成" type="success" ></el-radio-button>-->
                <el-checkbox v-model="checked">执行完成</el-checkbox>

      </div>


      <!--            <div class="panelRow">-->
      <!--                <div>-->
      <!--                    {{i18n['process.dataObjs']}}：-->
      <!--                    <el-button :disabled="readOnly" size="mini" @click="()=>{}">{{i18n['tooltip.edit']}}</el-button>-->
      <!--                </div>-->

      <!--            </div>-->
      <!--            <div class="panelRow">-->
      <!--                <div>-->
      <!--                    {{i18n['process.signalDefs']}}：-->
      <!--                    <el-button :disabled="readOnly" size="mini" @click="()=>{}">{{i18n['tooltip.edit']}}</el-button>-->
      <!--                </div>-->

      <!--            </div>-->
      <!--            <div class="panelRow">-->
      <!--                <div>-->
      <!--                    {{i18n['process.messageDefs']}}：-->
      <!--                    <el-button :disabled="readOnly" size="mini" @click="()=>{}">{{i18n['tooltip.edit']}}</el-button>-->
      <!--                </div>-->

      <!--            </div>-->
    </div>
  </div>
</template>
<script>
import DefaultDetail from "./DefaultDetail";

export default {
  inject: ['i18n'],
  components: {
    DefaultDetail
  },
  props: {
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
    }
  },
  data() {
    return {
      status:'执行完成',
      checked:false
    }
  },

  methods: {
    minus_input() {


      if (this.model.inputCount > 0) {
        //与inputi有关的属性全部删除
        for (var props of Object.keys(this.model)) {
          if (props.includes("input" + this.model.inputCount)) {
            // delete this.model[props]
            this.onChange(props, "")
          }
        }
        this.onChange('inputCount', this.model.inputCount - 1)
      }
    },
    plus_input() {

      if (this.model.inputCount < 10) {
        this.onChange('inputCount', this.model.inputCount + 1)
      }
    },
    minus_output() {
      if (this.model.inputCount > 0) {
        //与outputti有关的属性全部删除
        for (var props of Object.keys(this.model)) {
          if (props.includes("output" + this.model.outputCount)) {
            // delete this.model[props]
            this.onChange(props, "")
          }
        }
        this.onChange('outputCount', this.model.outputCount - 1)
      }
    },
    plus_output() {
      if (this.model.outputCount < 10) {
        this.onChange('outputCount', this.model.outputCount + 1)
      }
    },
  }
}
</script>
