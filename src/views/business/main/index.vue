<template>
  <el-container>
    <el-header>
      <Screen/>
    </el-header>
    <el-main>
      <router-view/>
    </el-main>
  </el-container>
</template>

<script>
  import settings from '../../../settings'
  import screen from '../../../components/Screen/index'

  export default {
    name: 'Main',
    components: {
      'Screen': screen
    },
    data() {
      return {
        title: settings.title
      }
    },
    mounted() {
    },
    methods: {
    }
  }
</script>

<style lang="scss" scoped>
@import '../../../style/variables.scss';

.el-container {
  height: 100%;
  width: 100%;

  .el-header {
    height: $headerHeight !important;
    padding: 0;
  }

  .el-main {
	position: relative;
    padding: 0;
    background-color: #c9d5e2;
  }
}
</style>
