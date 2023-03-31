<template>
  <div :data-clazz="model.clazz" class="nodeDetail">
    <div class="panelTitle">{{ i18n['startEvent'] }}</div>
    <div class="panelBody">
      <DefaultDetail :model="model" :onChange="onChange" :readOnly="readOnly"/>
      <div class="panelRow">
        <label style="width: 40%;display: inline-block">工作流输入: </label>
        <label style="width: 15%;display: inline-block">{{
            this.model.inputCount>=0 ? this.model.inputCount : this.onChange('inputCount', 0)
          }} </label>
        <!--      {{ this.model.input_count }}-->
        <el-button icon="el-icon-minus" size="mini" @click="minus_input" circle></el-button>
        <el-button icon="el-icon-plus" size="mini" @click="plus_input" circle></el-button>
        <br>

      </div>
      <el-collapse>
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
  },
  data() {
    return {
      input_task: [
        {value: "pass", label: "pass"},
        {value: "key", label: "key"},
      ],
    }
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
    }
  },
}
</script>
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