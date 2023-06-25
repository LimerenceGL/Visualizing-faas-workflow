<template>
  <div>
    <div class="panelTitle">工作流信息</div>
    <div class="panelBody">
      <!-- 工作流名称 -->
      <div class="workflow-info">
        <div class="workflow-name">
          <span>工作流名称：</span>
          <span>{{ model.instanceStatus.workflow }}</span>
        </div>

        <!-- 工作流ID -->
        <div class="workflow-id">
          <span>ID：</span>
          <span>{{ model.instanceStatus.call_id }}</span>
        </div>

        <!-- 工作流执行状态 -->
        <div class="workflow-status">
          <span>执行状态：</span>
          <span :class="{
            'status-completed': model.instanceStatus.status==='DONE',
            'status-error':model.instanceStatus.status==='ERROR',
            'status-executing':model.instanceStatus.status==='EXECUTING',
          }">{{ model.instanceStatus.status }}</span>
          <br>
          <br>
          <div v-if="model.instanceStatus.status === 'EXECUTING'" class="spinner"></div>
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
  computed: {
    statusClass() {
      if (!this.model || !this.model.instanceStatus) {
        return '';
      }
      if (this.model.instanceStatus.status === 'DONE') {
        return 'status-completed';
      } else if (this.model.instanceStatus.status === 'ERROR') {
        return 'status-error';
      } else if (this.model.instanceStatus.status === 'EXECUTING') {
        return 'status-executing';
      }
      return '';
    }
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

.status-error {
  color: red;
}

.status-executing {
  color: #9e9d24;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-left-color: black;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>