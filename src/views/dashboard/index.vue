<template>
  <dw-window>
    <el-image
      class="welcome"
      :src="img"
      fit="contain"/>
  </dw-window>
</template>

<script>
  import img from '@/assets/welcome.png'

  export default {
    name: 'Dashboard',
    data() {
      return {
        img
      }
    }
  }
</script>

<style lang="scss" scoped>
  .welcome {
    /*text-align: center;*/
    height: 98%;
    width: 100%;
  }
</style>
