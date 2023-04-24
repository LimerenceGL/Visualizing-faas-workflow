<template>
  <div >
    <div class="panelTitle">工作流信息</div>
    <div class="panelBody">
      <!-- 工作流名称 -->
      <div class="workflow-info">
        <div class="workflow-name">
          <span>工作流名称：</span>
          <span>{{ model.workflow_name || "workflow1" }}</span>
        </div>

        <!-- 工作流ID -->
        <div class="workflow-id">
          <span>ID：</span>
          <span>{{ model.instance_id || "100000" }}</span>
        </div>

        <!-- 工作流执行状态 -->
        <div class="workflow-status">
          <span>执行状态：</span>
          <span class="status-completed">{{ model.status||status }}</span>
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
  },
  data() {
    return {
      status: '执行完成',
      checked: false
    }
  },


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
