<template>
  <div :data-clazz="model.clazz" class="nodeDetail">
    <div class="panelTitle">{{ i18n['endEvent'] }}</div>
    <div class="panelBody">
      <DefaultDetail :model="model" :onChange="onChange" :readOnly="readOnly"/>
            <div class="panelRow">
        <label style="width: 40%;display: inline-block">工作流输出: </label>
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
            <label>参数来源: </label>
            <el-input
                size="small"
                placeholder="请输入内容"
                :value="model['output'+num+'source']"
                @input="(value) => {onChange('output'+num+'source', value)}"
            >
            </el-input>
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

export default {
  inject: ['i18n'],
  components: {
    DefaultDetail
  },
  data() {
    return {
      input_task: [
        {value: "pass", label: "pass"},
        {value: "key", label: "key"},
      ],
    }
  },
  methods: {
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