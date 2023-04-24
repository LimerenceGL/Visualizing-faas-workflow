<template>
    <div class="detailPanel" :style="{'height':height+'px'}">
      <el-scrollbar style="height:100%">
      <ProcessDetail :model="model"/>

      </el-scrollbar>
    </div>
</template>

<script>
import ProcessDetail from "./DetailPanel/ProcessDetail";


export default {
  name: "processPanel",
  components: {
    ProcessDetail,

  },
   props: {
    height: {
      type: Number,
      default: 200,
    },
    model: {
      type: Object,
      default: () => ({}),
    },

  },
}
</script>

<style scoped>

</style>