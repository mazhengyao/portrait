<template>
  <dw-response v-loading="loading">
    <dw-form dw-key="individualForm" :form-data="individualFormData" label-width="0">
      <dw-row>
        <dw-input dw-key="individualInput" :value.sync="individualFormData.individualInput" span="8"/>
        <dw-buttons dw-key="testButtons" style="text-align: right;" span="15">
          <dw-button type="primary" :on-click="getGridData">查询</dw-button>
          <dw-button :on-click="resetFormData">清空</dw-button>
        </dw-buttons>
      </dw-row>
    </dw-form>
    <dw-grid dw-key="individualGrid" :value.sync="gridData" :dblclick="btnConfirm" height="50vh">
      <dw-grid-input name="id" head="Id" width="164px" hidden="true"/>
      <dw-grid-input name="xm" head="姓名" width="100px" align="center"/>
      <dw-grid-select name="yxzjlx" head="证件类型" code="YXZJLX" align="center"/>
      <dw-grid-input name="yxzjhm" head="证件号码" align="center"/>
      <dw-grid-input name="sjhm" head="手机号码" align="center"/>
    </dw-grid>
  </dw-response>
</template>

<script>
  import {responseCommon} from '@/components/index' // 引入response通用文件

  export default {
    name: 'IndividualLov',
    mixins: [responseCommon], // 加载引入的response通用文件
    data() {
      return {
        loading: true,
        individualFormData: {
          individualInput: ''
        },
        gridData: []
      }
    },
    mounted() {
      this.individualFormData.individualInput = this.param.lovParam
      this.getGridData()
    },
    methods: {
      getGridData() {
        this.loading = true
        this.$ajax('individual.do?method=getIndividualList', {
          xm: this.individualFormData.individualInput
        }).then(res => {
          this.gridData = res.data
          this.loading = false
        }).catch(err => {
          this.$alertError(err)
        })
      },
      resetFormData() {
        this.individualFormData.individualInput = ''
        this.getGridData()
      },
      btnConfirm() {
        this.onConfirm()
      }
    }
  }
</script>

<style scoped>
</style>
