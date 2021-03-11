<template>
  <span>{{ showVal }}</span>
</template>

<script>
  export default {
    name: 'CodeSpan',
    props: {
      code: {
        type: String,
        default() {
          return ''
        }
      },
      value: {
        type: String,
        default() {
          return ''
        }
      }
    },
    data() {
      return {
      }
    },
    computed: {
      showVal() {
        if (!(this.code || this.value)) {
          return ''
        }
        if (this.code) {
          return this.getCodeVal()
        }
        return ''
      }
    },
    methods: {
      getCodeVal() {
        let returnVal = '暂无数据'
        const allocateCode = this.$getCode(this.code)
        if (this.value && allocateCode) {
          returnVal = allocateCode[this.value]
        }
        return returnVal
      }
    }
  }
</script>

<style>
</style>
