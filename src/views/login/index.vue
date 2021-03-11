<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" label-position="left">
      <div class="login-form-div">
        <div class="title-container">
          <h3 class="title">登录系统</h3>
        </div>
        <el-form-item prop="username">
          <span class="svg-container">
            <i class="el-icon-s-custom"/>
          </span>
          <el-input
            ref="username"
            v-model="loginForm.username"
            placeholder="请输入用户名"
            type="text"
          />
        </el-form-item>

        <el-form-item prop="password">
          <span class="svg-container">
            <i class="el-icon-s-opportunity"/>
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.password"
            :type="passwordType"
            placeholder="请输入密码"
            @keyup.enter.native="handleLogin"
          >
            <i slot="suffix" class="el-input__icon el-icon-view" @click="showPwd"/>
          </el-input>
        </el-form-item>

        <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" class="btn"
                   @click.native.prevent="handleLogin">登录
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
  export default {
    name: 'Login',
    data() {
      const validateUsername = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入用户名'))
        } else {
          callback()
        }
      }
      const validatePassword = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入密码'))
        } else {
          callback()
        }
      }
      return {
        loginForm: {
          username: '',
          password: '',
          passWordLogSign: '0'
        },
        loginRules: {
          username: [{required: true, trigger: 'blur', validator: validateUsername}],
          password: [{required: true, trigger: 'blur', validator: validatePassword}]
        },
        loading: false,
        passwordType: 'password',
        redirect: undefined,
        otherQuery: {}
      }
    },
    watch: {
      $route: {
        handler: function(route) {
          const query = route.query
          if (query) {
            this.redirect = query.redirect
            this.otherQuery = this.getOtherQuery(query)
          }
        },
        immediate: true
      }
    },
    mounted() {
      if (process.env.NODE_ENV === 'development') {
        this.loginForm.username = 'sispt'
        this.loginForm.password = 'sispt'
      }
    },
    methods: {
      showPwd() {
        if (this.passwordType === 'password') {
          this.passwordType = ''
        } else {
          this.passwordType = 'password'
        }
        this.$nextTick(() => {
          this.$refs.password.focus()
        })
      },
      handleLogin() {
        this.$refs.loginForm.validate(valid => {
          if (valid) {
            this.loading = true
            this.$store.dispatch('user/login', this.loginForm).then((res) => {
              if (res === '密码错误!') {
                this.$alertError(res)
              } else {
                this.$router.push({path: this.redirect || '/', query: this.otherQuery})
              }
              setTimeout(() => {
                this.loading = false
                this.loginForm.password = ''
              }, 500)
            }).catch((err) => {
              this.$alertError(err)
              this.loading = false
              this.loginForm.password = ''
            })
          } else {
            console.error('请检查用户名和密码。')
            return false
          }
        })
      },
      getOtherQuery(query) {
        return Object.keys(query).reduce((acc, cur) => {
          if (cur !== 'redirect') {
            acc[cur] = query[cur]
          }
          return acc
        }, {})
      }
    }
  }
</script>

<style lang="scss" scoped>
/* 修复input 背景不协调 和光标变色 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  height: 100vh;
  width: 100%;
  background-image: url(../../assets/login/login_bg.png);
  background-size: cover;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 620px;
    max-width: 100%;
    padding: 140px 35px 0;
    margin: 0 auto;
    overflow: hidden;

    .login-form-div {
      padding: 20px 50px 0 50px;
      background-image: url(../../assets/login/login_form.png);
      background-size: cover;
    }
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .btn {
    background-color: #25577d;
    border: 1px solid #25577d;
  }
  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: #76f6ff;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .el-form-item i.el-input__icon {
    cursor: pointer;
  }

  .el-input {
    display: inline-block;
    height: 50px;
    width: 90%;

    ::v-deep input {
      background: transparent;
      border: 0;
      -webkit-appearance: none;
      border-radius: 0;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

</style>
