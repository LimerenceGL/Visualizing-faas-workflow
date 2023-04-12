<template>
  <div class="header">
    <div>EdgeFlow</div>
    <div class="avatar-wrapper"> <!-- 新增 -->
      <img :src="require('../assets/user.jpeg')" alt="User Avatar" class="avatar" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Myheader',
};
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  padding: 10px;
}

div {
  font-size: 20px;
  font-family: 'Sounso Quality 2', sans-serif;
}

.avatar-wrapper {
  width: 40px;
  height: 40px;
  overflow: hidden;
  border-radius: 50%;
  margin-right: 15px;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
