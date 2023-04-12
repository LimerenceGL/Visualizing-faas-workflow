<template>
  <div :data-clazz="model.clazz">
    <div class="panelTitle">工作流信息</div>
    <div class="panelBody">
      <!-- 工作流名称 -->
      <div class="workflow-info">
        <div class="workflow-name">
          <span>工作流名称：</span>
          <span>{{ model.workflowName || "workflow1" }}</span>
        </div>

        <!-- 工作流ID -->
        <div class="workflow-id">
          <span>ID：</span>
          <span>{{ model.id || "100000" }}</span>
        </div>

        <!-- 工作流执行状态 -->
        <div class="workflow-status">
          <span>执行状态：</span>
          <span class="status-completed">{{ status }}</span>
        </div>
      </div>
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
      status: '执行完成',
      checked: false
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

<style scoped>
.panelTitle {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.panelBody {
  font-size: 14px;
}

.workflow-info {
  display: inline-block;
}

.workflow-name,
.workflow-id,
.workflow-status {
  margin-bottom: 15px;
  text-align: left;

}

.separator {
  border-top: 1px solid #ccc;
  margin: 5px 0;
}

.status-completed {
  color: green;
}
</style>
