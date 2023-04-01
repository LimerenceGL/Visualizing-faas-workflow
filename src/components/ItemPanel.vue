<template>

  <div class="itemPanel" :style="{'height': height+'px'}">
<!--    <el-scrollbar class="itemPanelScrollbar" :style="{'height': height+'px'}">-->
      <el-collapse v-model="activeNames">
        <el-collapse-item title="开始节点" name="1">
          <img data-item="{clazz:'start',size:'30*30',label:''}"
               :src="require('../assets/flow/start.svg')" style="width:42px;height:42px"/>
          <div>开始</div>
          <img data-item="{clazz:'end',size:'30*30',label:''}"
               :src="require('../assets/flow/end.svg')" style="width:42px;height:42px"/>
          <div>结束</div>
        </el-collapse-item>
        <el-collapse-item title="控制节点" name="2">
          <img :data-item="scriptTaskData"
               :src="require('../assets/flow/script-task.svg')" style="width:80px;height:44px"/>
          <div>foreach</div>
          <img data-item="{clazz:'exclusiveGateway',size:'40*40','hideIcon':true,label:'switch'}"
               :src="require('../assets/flow/exclusive-gateway.svg')" style="width:48px;height:48px"/>
          <div>switch</div>
          <img data-item="{clazz:'timerCatch',size:'50*30','hideIcon':true,label:'parallel'}"
               :src="require('../assets/flow/timer-catch.svg')" style="width:58px;height:38px"/>
          <div>parallel</div>
        </el-collapse-item>
        <el-collapse-item title="函数节点" name="3">
          <img :data-item="mailTaskData"
               :src="require('../assets/flow/mail-task.svg')" style="width:80px;height:44px"/>
          <div>task</div>
        </el-collapse-item>
      </el-collapse>
<!--    </el-scrollbar>-->
  </div>


</template>
<script>
export default {
  inject: ['i18n'],
  props: {
    height: {
      type: Number,
      default: 800,
    },
     workflowName: {
    type: String,
    default: "",
  },
  },
  data() {
    return {
      isView: false,
      activeNames: [],
      scriptTaskData: "{clazz:'scriptTask',size:'80*44','hideIcon':true,label:'" + this.i18n['scriptTask'] + "'}",
      mailTaskData: "{clazz:'mailTask',size:'80*44','hideIcon':true,label:'" + this.i18n['mailTask'] + "'}",

    };
  },

}
</script>

<style lang="scss">
/* 隐藏滚动条 */


/* 修改滚动条的颜色 */
::-webkit-scrollbar-thumb {
  background-color: #ccc;
}

/* 修改滚动条的宽度 */
::-webkit-scrollbar {
  width: 3px;
}

/* 修改滚动条轨道的颜色 */
::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

/* 给滚动条添加边框 */
::-webkit-scrollbar {
  border: 1px solid #ccc;
}

/* 设置滚动条的圆角 */
::-webkit-scrollbar-thumb {
  border-radius: 10px;
}

.itemPanel {
  float: left;
  width: 10%;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-y: auto; // 保留纵向滚动条
  overflow-x: hidden; // 隐藏横向滚动条
  border-left: 1px solid #E9E9E9;
  border-bottom: 1px solid #E9E9E9;

  img {
    width: 92px;
    height: 96px;
    padding: 4px;
    border: 1px solid rgba(0, 0, 0, 0);
    border-radius: 2px;
    transition: all 0.3s ease;

    &:hover {
      border: 1px solid #ccc;
      cursor: move;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      transform: translateY(-5px);
    }
  }



  .el-collapse {
    border: 0;

    .el-collapse-item {
      > div[role=tab] > div {
        padding: 8px;
        border: 1px solid #E9E9E9;
        border-left: 0;
        border-radius: 5px;
        transition: all 0.3s ease;
      }

      &:first-child {
        > div[role=tab] > div {

          border-top: 10px;
        }
      }

      &:last-child {
        > div[role=tab] > div {
          border-bottom: 1px solid #E9E9E9;
        }
      }

      .el-collapse-item__wrap {
        padding: 15px;

        border-top: 0;
        background: #f0f2f5;
      }
    }
  }
}
</style>
