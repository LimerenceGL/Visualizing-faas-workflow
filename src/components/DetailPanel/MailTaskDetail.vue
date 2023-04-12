<template>
  <div :data-clazz="model.clazz" class="nodeDetail">
    <div class="panelTitle">task</div>
    <div class="panelBody">
      <!--            <DefaultDetail :model="model" :onChange="onChange" :readOnly="readOnly" />-->
      <DefaultDetail :model="model" :onChange="onChange" :readOnly="readOnly"/>


      <div class="panelRow">
        <div>名称：</div>
        <el-input style="width:90%; font-size:12px"
                  :disabled="readOnly"
                  :value="model.label"
                  @input="(value) => {onChange('label', value)}"/>
      </div>
      <div class="panelRow">
        <div >类型：</div>
        <el-input style="width:90%; font-size:12px"
                  :disabled="true"
                  value=task
        />
      </div>
      <div class="panelRow">
        <div >运行函数名称：</div>
        <el-input style="width:90%; font-size:12px"
                  :disabled="readOnly"
                  :value="model.run"
                  @input="(value) => {onChange('run', value)}"/>
      </div>

      <!--      <div class="panelRow">-->
      <!--        <div>函数运行时间：</div>-->
      <!--        <el-input style="width:90%; font-size:12px"-->
      <!--                  :disabled="readOnly"-->
      <!--                  :value="model.runtime"-->
      <!--                  @input="(value) => {onChange('runtime', value)}-->
      <!--">-->
      <!--          <template slot="append">s</template>-->
      <!--        </el-input>-->
      <!--      </div>-->
      <div class="panelRow">
        <div >伸缩敏感度：</div>
        <el-input style="width:90%; font-size:12px"
                  :disabled="readOnly"
                  :value="model.mem_usage"
                  @input="(value) => {onChange('mem_usage', value)}">
          <template slot="append">%</template>
        </el-input>
      </div>
      <div class="panelRow">
        <div>最大副本数：</div>
        <el-input style="width:90%; font-size:12px"
                  :disabled="readOnly"
                  :value="model.scale"
                  @input="(value) => {onChange('scale', value)}"/>
      </div>
      <div class="panelRow">
        <div>内存需求：</div>
        <el-input style="width:90%; font-size:12px"
                  :disabled="readOnly"
                  :value="model.reqmem_req"
                  @input="(value) => {onChange('reqmem_req', value)}">
          <template slot="append">GB</template>
        </el-input>
      </div>
      <!--     -->
      <!--      <div class="panelRow">-->
      <!--        <div>GPU需求：</div>-->
      <!--        <el-select :value="model.reqgpu" @input="(value) => {onChange('reqgpu', value)}" placeholder="请选择">-->
      <!--          <el-option-->
      <!--              v-for="item in gpu_options"-->
      <!--              :key="item.value"-->
      <!--              :label="item.label"-->
      <!--              :value="item.value"></el-option>-->
      <!--        </el-select>-->
      <!--      </div>-->
      <div class="panelRow">
        <label style="width: 20%;display: inline-block">输入: </label>
        <label style="width: 15%;display: inline-block">{{
            this.model.inputCount >= 0 ? this.model.inputCount : this.onChange('inputCount', 0)
          }} </label>
        <!--      {{ this.model.input_count }}-->
        <el-button icon="el-icon-minus" size="mini" @click="minus_input" circle></el-button>
        <el-button icon="el-icon-plus" size="mini" @click="plus_input" circle></el-button>
        <br>

      </div>
      <el-collapse v-if="this.model.inputCount>0">
        <div v-for="num in this.model.inputCount" class="panelRow">
          <div v-show=false>{{ templi = 'input ' + num }}</div>
          <el-collapse-item :title=templi>
            <label>名称: </label>
            <el-input

                size="small"
                placeholder="请输入内容"
                :value="model['input'+num+'name']"
                @input="(value) => {onChange('input'+num+'name', value)}">
            </el-input>
            <br><br>
            <label>参数名称: </label>
            <el-select :value="model['input'+num+'task']" @input="(value) => {onChange('input'+num+'task', value)}"
                       placeholder="请选择" size="small">
              <el-option
                  v-for="item in input_task"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
            <br><br>
            <label>参数来源: </label>
            <el-input
                size="small"
                placeholder="请输入内容"
                :value="model['input'+num+'source']"
                @input="(value) => {onChange('input'+num+'source', value)}"
            >
            </el-input>
            <br><br>
            <label>参数大小: </label>
            <el-input
                size="small"
                placeholder="请输入内容"
                :value="model['input'+num+'size']"
                @input="(value) => {onChange('input'+num+'size', value)}">
              <template slot="append">B</template>
            </el-input>
            <el-divider></el-divider>
          </el-collapse-item>

        </div>
      </el-collapse>

      <div class="panelRow">
        <label style="width: 20%;display: inline-block">输出: </label>
        <label style="width: 15%;display: inline-block">{{
            this.model.outputCount >= 0 ? this.model.outputCount : this.onChange('outputCount', 0)
          }} </label>
        <el-button icon="el-icon-minus" size="mini" @click="minus_output" circle></el-button>
        <el-button icon="el-icon-plus" size="mini" @click="plus_output" circle></el-button>
      </div>
      <el-collapse>
        <div v-for="num in this.model.outputCount" class="panelRow">
          <div v-show=false>{{ tempout = 'output ' + num }}</div>
          <el-collapse-item :title=tempout>

            <label>名称: </label>
            <el-input
                size="small"
                placeholder="请输入内容"
                :value="model['output'+num+'name']"
                @input="(value) => {onChange('output'+num+'name', value)}">
            </el-input>
            <br><br>
            <label>参数名称: </label>
            <el-select :value="model['output'+num+'task']" @input="(value) => {onChange('output'+num+'task', value)}"
                       placeholder="请选择" size="small">
              <el-option
                  v-for="item in input_task"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
            <br><br>
            <label>参数大小: </label>
            <el-input
                size="small"
                placeholder="请输入内容"
                :value="model['output'+num+'size']"
                @input="(value) => {onChange('output'+num+'size', value)}">
              <template slot="append">B</template>
            </el-input>
          </el-collapse-item>
        </div>

      </el-collapse>


    </div>
  </div>
</template>
<script>
import DefaultDetail from "./DefaultDetail";
import disableInputMixin from "../../mixins/disableInput"

export default {
  inject: ['i18n'],
  mixins: [disableInputMixin],
  data() {
    return {
      gpu_options: [
        {value: true, label: "true"},
        {value: false, label: "false"}
      ],
      input_task: [
        {value: "pass", label: "pass"},
        {value: "key", label: "key"},
      ],
      size: "small"

    }
  },
  components: {
    DefaultDetail,

  },

  props: {
    model: {
      type: Object,
      default: () => ({}),
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
      if (this.model.outputCount > 0) {
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

  },

}
</script>
<style>


.el-collapse {
  box-sizing: border-box;
  padding-left: 10%;
  padding-right: 20%;

  border: none;
}

.transclass {
  background-color: transparent;
}

.el-collapse-item__header {
  border: none;
  background-color: transparent !important;
}

.el-collapse-item__wrap {
  background-color: transparent !important;
  border: none;
}

.el-collapse-item__content {
  padding: 0;
}

el-input {
  width: 50%;
}

</style>
<style lang="scss" >
// 新增mailTaskDetail样式
.nodeDetail {
  .panelTitle {
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    font-weight: bold;
  }

  .panelBody {
    padding: 10px;

    .panelRow {
      align-items: center;
      padding: 10px 12px;

    }
    // 调整输入框的样式
     .el-input {
      flex-grow: 1;
      margin-top: 8px;
    }
    // 调整折叠面板的样式
    .el-collapse {
      margin-top: 12px;
      .el-collapse-item {
        .el-collapse-item__header {
          font-weight: bold;
        }
      }
    }
  }
}


</style>
