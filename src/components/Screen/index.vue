<template>
  <div class="header">
    <span class="title-span">
      <i class="iconfont iconyonghushuliang"/>
      {{ title }}
    </span>
    <div class="right-menu">
      <el-menu :default-active="menuActive" mode="horizontal">
        <el-menu-item index="organization" @click="openPage('organization')">单位画像</el-menu-item>
        <el-menu-item index="individual" @click="openPage('individual')">个人画像</el-menu-item>
        <el-menu-item v-if="checkPermission" index="createComp" @click="openPage('createComp')">新建组件</el-menu-item>
        <el-menu-item v-if="checkPermission" index="editComp" @click="openPage('editComp')">编辑组件</el-menu-item>
        <el-menu-item v-if="checkPermission" index="getDataOrigin" @click="openPage('getDataOrigin')">数据源管理
        </el-menu-item>
      </el-menu>
      <span class="date-time">{{ currentTime }}</span>
      <span class="name">{{ name }}</span>
      <i class="iconfont iconquanping" @click="fullScreen"/>
      <i class="iconfont iconxitongtuichu" @click="logout"/>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import settings from '../../settings'

  export default {
    name: 'Screen',
    data() {
      return {
        title: settings.title,
        menuActive: '',
        time: '', // 定义一个定时器的变量
        currentTime: this.getTime() // 获取当前时间
      }
    },
    computed: {
      checkPermission() {
        const buttons = this.$store.getters.permission_buttons
        return buttons.includes('editPage')
      },
      ...mapGetters([
        'name'
      ])
    },
    mounted() {
      this.menuActive = this.$route.path.split('/')[1]
      this.time = setInterval(() => {
        this.currentTime = this.getTime()
      }, 1000)
    },
    beforeDestroy() {
      if (this.time) {
        clearInterval(this.time) // 在Vue实例销毁前，清除我们的定时器
      }
    },
    methods: {
      getTime() {
        return this.$utils.toDateString(new Date(), 'yyyy-MM-dd HH:mm:ss')
      },
      // 点击全屏按钮
      fullScreen() {
        this.$fullScreen()
      },
      // 退出登录
      logout() {
        this.$confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$logout()
        })
      },
      openPage(path) {
        this.$router.push(`${path}`)
      }
    }
  }
</script>

<style lang="scss" scoped>
@import '../../style/variables.scss';

.header {
  display: -webkit-flex; /* Safari */
  display: flex;
  justify-content: space-between;
  height: 100%;
  line-height: $headerHeight;
  color: #ffffff;
  font-size: 2.7vh;
  font-weight: bold;
  background-image: linear-gradient(to right, #027aff, #0062d1);

  .title-span {
    letter-spacing: 5px;
    margin-left: 15px;

    i {
      font-size: 24px;
    }
  }

  .right-menu {
    display: inline-flex;
    height: 100%;
    margin: 0 20px 0 0;

    .name {
      font-size: 16px;
      margin: 0 10px 0 0;
    }

    .date-time {
      font-size: 16px;
      margin: 0 10px 0 20px;
    }

    .iconfont {
      cursor: pointer;
      margin: 0 10px 0 0;
    }

    ::v-deep {
      .el-menu {
        background-color: transparent;
      }

      &.el-menu--horizontal {
        border-bottom: 0;

        & > .el-menu-item {
          border-bottom: 0;
        }

        & .el-menu {
          .el-menu-item, .el-submenu__title {
            color: #f4f9fe;
            background-color: #0062d1;
          }
        }

        & .el-menu-item, & > .el-submenu .el-submenu__title {
          height: $headerHeight;
          line-height: $headerHeight;
          color: #f4f9fe;

          &.is-active {
            background-color: $header-menu;
            border-bottom: 0;
          }

          &:hover {
            background-color: $header-menu;
          }

          i {
            color: #f4f9fe;
          }
        }
      }
    }
  }
}
</style>
