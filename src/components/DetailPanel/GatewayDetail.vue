<template>
  <div :data-clazz="model.clazz" class="nodeDetail">
    <div class="panelTitle">switch</div>
    <div class="panelBody">
      <!--            <DefaultDetail :model="model" :onChange="onChange" :readOnly="readOnly" />-->

      <DefaultDetail :model="model" :onChange="onChange" :readOnly="readOnly"/>
      <div class="panelRow">
        <div>name：</div>
        <el-input style="width:90%; font-size:12px"
                  :disabled="readOnly"
                  :value="model.label"
                  @input="(value) => {onChange('label', value)}"/>
      </div>
      <div class="panelRow">
        <div>type：</div>
        <el-input style="width:90%; font-size:12px"
                  :disabled="true"
                  value=switch
        />
      </div>



<!--    {{nextObject}}-->
      <div v-if="nextObject.hasOwnProperty(model.id) ">
        <div class="panelRow">
        <div>conditions：</div>
          </div>
        <div v-for="target of Object.keys(nextObject[model.id])" class="panelRow">
        <el-input style="width:90%; font-size:12px"
                  :disabled="readOnly"
                  :value="model['conditions'+target]"
                  @input="(value) => {onChange('conditions'+target, value)}">
          <template slot="append">{{ nextObject[model.id][target] }}</template></el-input>

      </div>

      </div>


    </div>
  </div>
</template>
<script>
import DefaultDetail from "./DefaultDetail";

export default {
  inject: ['i18n'],
  data() {
    return {
      next_list: []

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
    nextObject: {
      type: Object,
      default: () => ({})
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