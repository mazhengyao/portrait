<template>
  <dw-response v-loading="loading">
    <dw-form dw-key="orgnLovForm" :form-data="orgnLovFormData" label-width="0">
      <dw-row>
        <dw-input dw-key="orgnLovInput" :value.sync="orgnLovFormData.param" span="8"/>
        <dw-buttons dw-key="testButtons" style="text-align: right;" span="15">
          <dw-button type="primary" :on-click="getGridData">查询</dw-button>
          <dw-button :on-click="resetFormData">清空</dw-button>
        </dw-buttons>
      </dw-row>

    </dw-form>
    <dw-grid dw-key="orgnData" :value.sync="gridData" :dblclick="btnConfirm" height="50vh">
      <dw-grid-input name="dwid" head="Id" width="164px" hidden="true"/>
      <dw-grid-input name="dwmc" head="单位名称" style="width: 45%"/>
      <dw-grid-input name="tyshxydm" head="统一社会信用代码" style="width: 45%"/>
      <dw-grid-input name="dwdz" head="单位地址" style="width: 45%"/>
    </dw-grid>
  </dw-response>
</template>

<script>
  import {responseCommon} from '@/components/index' // 引入response通用文件

  export default {
    name: 'YhLov',
    mixins: [responseCommon], // 加载引入的response通用文件
    data() {
      return {
        loading: true,
        gridData: [],
        orgnLovFormData: {
          param: ''
        }
      }
    },
    mounted() {
      this.orgnLovFormData.param = this.param.lovParam
      this.getGridData()
    },
    methods: {
      getGridData() {
        this.loading = true
        this.$ajax('orgn.do?method=queryOrgnInfo', {
          param: this.orgnLovFormData.param
        }).then(res => {
          this.gridData = res.data
          this.loading = false
        }).catch(err => {
          this.$alertError(err)
        })
      },
      resetFormData() {
        this.orgnLovFormData.param = ''
        this.gridData = []
        this.$nextTick(() => {
          this.getGridData()
        })
      },
      btnConfirm() {
        this.onConfirm()
      }
    }
  }
</script>

<style scoped>
</style>
