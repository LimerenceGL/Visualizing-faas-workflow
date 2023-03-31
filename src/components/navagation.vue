<template>
  <!--            <el-radio-group v-model="isCollapse" style="margin-bottom: 20px;">-->
  <!--  <el-radio-button :label="false">展开</el-radio-button>-->
  <!--  <el-radio-button :label="true">收起</el-radio-button>-->
  <!--</el-radio-group>-->
  <el-row class="tac">
   <el-col :span="24">
  <el-menu default-active="arrange"  router class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose"
           :collapse="isCollapse">

    <el-menu-item  index="/arrange">
      <i class="el-icon-menu"></i>
      <span slot="title">工作流编排</span>
    </el-menu-item>
    <el-menu-item index="/manager"  >
      <i class="el-icon-s-management"></i>
      <span slot="title" >工作流管理</span>

    </el-menu-item>
    <el-menu-item index="/execute">
      <i class="el-icon-document"></i>
      <span slot="title">工作流执行</span>
    </el-menu-item>
        <el-menu-item index="/elementui">
      <i class="el-icon-document"></i>
      <span slot="title">页面展示</span>
    </el-menu-item>

  </el-menu>
   </el-col>
  </el-row>
</template>

<script>
export default {
  name: "navagation",
  data() {
    return {
      isCollapse: false
    }
  },
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
  }
}
</script>

<style scoped>

</style>