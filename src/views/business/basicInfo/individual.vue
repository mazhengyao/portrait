<template>
  <div class="individual">
    <!--右侧缩略图-->
    <template v-if="showEdit">
      <div v-show="!itemDrawer" class="rightMouseOver" @mouseenter="openItemDrawer()"/>
      <div v-show="itemDrawer" class="rightMouseLeave" @mouseenter="leaveItemDrawer()"/>
    </template>
    <el-drawer :visible.sync="itemDrawer" :with-header="false" :modal="false" :destroy-on-close="true"
               :modal-append-to-body="false" direction="rtl" size="300px">
      <div class="option">
        <el-select v-show="role.roleSelect.length > 1" ref="roleSelect" v-model="role.pickRole" placeholder="请选择"
                   size="small" @change="setComItems">
          <el-option v-for="item in role.roleSelect" :key="item.value" :label="item.content" :value="item.value"/>
        </el-select>
        <div v-for="item in items" :id="item.name" :key="item.name" class="createItem"
             :style="changeItemHeight(item.chart_code)"
             @click="createItem(item.name, item.options, item.options_checked, item.pkid, item.chart_code, item.data_source)">
          <div class="thuTitle" :data-content="item.title" :style="changeBgImage(item.image)"/>
        </div>
      </div>
    </el-drawer>
    <!--中上-->
    <div class="borderStyAll">
      <div class="detail">
        <div class="detail-message borderStyContent">
          <div class="contentJbxx contentJbxx1">
            <div class="contentTitle">
              <dw-title message="基本信息：" :before-title-style="beforeTitleStyle" :is-title-style="isTitleStyle" />
            </div>
            <div class="contentBody contentBodyInfo">
              <div>
                <div>姓名：</div>
                <div>
                  <dw-form dw-key="formBJ" :form-data="formData">
                    <dw-lov
                      span="2"
                      class="myLov"
                      dw-key="xmLov"
                      :value.sync="formData.xmLov"
                      placeholder="请选择人员"
                      fill-mapping="xmLov:xm"
                      res-title="人员列表"
                      res-title-center="false"
                      res-load-path="response/individualLov.vue"
                      :on-res-confirm="makeSure"
                    />
                  </dw-form>
                </div>
                <!-- <div>{{ formData.xm }}</div> -->
              </div>
              <div>
                <div>性别：</div>
                <div>
                  <code-span code="XB" :value="formData.xb"/>
                </div>
              </div>
              <div>
                <div>民族：</div>
                <div>
                  <code-span code="MZ" :value="formData.mz"/>
                </div>
              </div>
              <div>
                <div>政治面貌：</div>
                <div>
                  <code-span code="ZZMM" :value="formData.zzmm"/>
                </div>
              </div>
              <div>
                <div>证件类型：</div>
                <div>
                  <code-span code="YXZJLX" :value="formData.yxzjlx"/>
                </div>
              </div>
              <div>
                <div>证件号码：</div>
                <div>{{ formData.yxzjhm }}</div>
              </div>
              <div>
                <div>手机号码：</div>
                <div>{{ formData.sjhm }}</div>
              </div>
              <div>
                <div>户口所在地：</div>
                <div>{{ formData.hkszd }}</div>
              </div>
            </div>
          </div>

          <div class="contentTable contentTable1">
            <div class="contentTitle">
              <dw-title message="社保缴费情况：" :before-title-style="beforeTitleStyle" :is-title-style="isTitleStyle" />
            </div>
            <div class="contentBody">
              <table border="1">
                <tr>
                  <td><span/></td>
                  <td><span>养老</span></td>
                  <td><span>失业</span></td>
                  <td><span>工伤</span></td>
                </tr>
                <tr>
                  <th><span>最早缴费年月</span></th>
                  <td><span>{{ tableData.ylbx0 }}</span></td>
                  <td><span>{{ tableData.sybx0 }}</span></td>
                  <td><span>{{ tableData.gsbx0 }}</span></td>
                </tr>
                <tr>
                  <th><span>最大缴费年月</span></th>
                  <td><span>{{ tableData.ylbx1 }}</span></td>
                  <td><span>{{ tableData.sybx1 }}</span></td>
                  <td><span>{{ tableData.gsbx1 }}</span></td>
                </tr>
                <tr>
                  <th><span>最后一月缴费基数</span></th>
                  <td><span>{{ tableData.ylbx2 }}</span></td>
                  <td><span>{{ tableData.sybx2 }}</span></td>
                  <td><span>{{ tableData.gsbx2 }}</span></td>
                </tr>
                <tr>
                  <th><span>缴费月数</span></th>
                  <td><span>{{ tableData.ylbx3 }}</span></td>
                  <td><span>{{ tableData.sybx3 }}</span></td>
                  <td><span>{{ tableData.gsbx3 }}</span></td>
                </tr>
              </table>
            </div>
          </div>

          <div class="contentEcharts contentEcharts1">
            <div class="contentTitle">
              <dw-title message="个人所在行业对比：" :before-title-style="beforeTitleStyle" :is-title-style="isTitleStyle"/>
            </div>
            <div class="contentBody">
              <dw-echarts dw-key="transChartLd"/>
            </div>
          </div>
        </div>

      </div>
      <!--可拖拽区域-->
      <div :class="['drag-board', 'borderStyContent', {'operation': formData.radval === '0'}]">
        <draggable-board ref="draggableBoard" :items.sync="items" :layout-param="LayoutParam" :layout-data="layoutData"
                         :diy-id="formData.dwid" :on-save="onSave" :on-delete="onDelete" :role-id="role.pickRole"
                         :check-permission="checkPermission" @isEdit="isEdit"/>
      </div>
    </div>
  </div>
</template>

<script>
  import {dragCommon} from '../../../components/index'
  import codeSpan from '../../../components/codeSpan'
  import draggableBoard from '../../../components/draggable-board'

  export default {
    name: 'Individual',
    components: {
      'draggable-board': draggableBoard,
      'code-span': codeSpan
    },
    mixins: [dragCommon],
    data() {
      return {
        formData: {
          ryid: '',
          xm: '暂无数据',
          xb: '', // code
          mz: '', // code
          jg: '', // code
          zzmm: '', // code
          yxzjlx: '', // code
          yxzjhm: '暂无数据',
          sjhm: '暂无数据',
          hkszd: '暂无数据',
          xmLov: '',
          radval: '0'
        },
        tableColTitle: ['最早缴费年月', '最大缴费年月', '最后一月缴费人数', '最后一月缴费总金额'],
        tableData: {
          gsbx0: '0',
          gsbx1: '0',
          gsbx2: '0',
          gsbx3: '0',
          sybx0: '0',
          sybx1: '0',
          sybx2: '0',
          sybx3: '0',
          ylbx0: '0',
          ylbx1: '0',
          ylbx2: '0',
          ylbx3: '0'
        },
        items: [],
        role: {
          roleSelect: [],
          pickRole: ''
        },
        ldData: [
          {
            value: [0, 0, 0, 0],
            name: ''
          }
        ],
        itemDrawer: false,
        getDataId: '',
        pageId: 'Individual',
        pageType: '1',
        grdbDatas: {
          grjfje: 0,
          pjjfje: 0,
          grjfjs: 0,
          pjjfjs: 0,
          isGetData: false // 是否已经获取到数据
        }
      }
    },
    computed: {},
    mounted() {
      this.getBaseInfo()
      this.ldEcharts()
    },
    methods: {
      initData() {
        if (!this.formData.ryid) {
          return
        }
        this.getBxData()
        this.getLdData()
      },
      getBaseInfo() { // 获取个人基本数据
        this.$ajax('individual.do?method=getBaseInfo', {
          ryid: this.formData.ryid
        }).then(res => { // 成功后操作
          if (res.data.length > 0) {
            this.formData = Object.assign(this.formData, res.data[0])
          }
        })
      },
      ldEcharts() {
        const ldOption = {
          title: {
            show: false,
            text: '基础雷达图'
          },
          tooltip: {
            show: false
          },
          color: ['#5872E0', '#6CCD8F', '#FE5F0B', '#FEE87A', '#089BAB'],
          legend: {
            show: false,
            data: ['预算分配', '实际开销']
          },
          radar: {
            // shape: 'circle',
            name: {
              show: true,
              textStyle: {
                color: '#040404',
                fontSize: '100%'
              }
            },
            nameGap: '11',
            indicator: [
              {
                name: '缴费年限',
                max: 100
              },
              {
                name: '缴费基数',
                max: 100
              },
              {
                name: '养老账户金额',
                max: 100
              },
              {
                name: '年龄',
                max: 100
              }
            ],
            splitArea: {
              show: true,
              areaStyle: {
                color: ['rgb(216,225,243)', 'rgb(232,241,252)', 'rgb(214,220,240)', 'rgb(208,230,250)']
                // color: ['rgba(13,26,73,0.75)', 'rgba(15,44,84,0.75)', 'rgba(13,61,97,0.75)', 'rgba(12,71,105,0.75)'] // 图表背景网格的颜色
              }
            },
            splitLine: {
              show: false,
              lineStyle: {
                width: 1,
                color: '#286fbb' // 图表背景网格线的颜色
              }
            },
            axisLine: {
              show: false
            }
          },
          series: [{
            name: '',
            type: 'radar',
            // areaStyle: {normal: {}},
            data: this.ldData
          }]
        }
        this.$echartsSetOption('transChartLd', ldOption, false, true)
      },
      getLdData() {
        this.$ajax('individual.do?method=getLdData', {
          ryid: this.formData.ryid
        }).then(res => { // 成功后操作
          if (res.data.length > 0) {
            for (const index in res.data) {
              this.ldData[index] = {'name': res.data[index]['name'], 'value': res.data[index]['value'].split(',')}
            }
            this.ldEcharts()
          }
        })
      },
      getBxData() {
        this.$ajax('individual.do?method=getBxJfje', {
          ryid: this.formData.ryid
        }).then(res => { // 成功后操作
          if (res.data.length > 0) {
            this.tableData = {}
            if (res.data.length > 0) {
              const jsonData = res.data[0]
              for (const item in jsonData) {
                this.tableData[item] = jsonData[item] ? jsonData[item] : 0
              }
            }
          }
        })
      },
      async makeSure(data) {
        this.formData = Object.assign(this.formData, data)
        this.initData()
        this.getDataId = this.formData.ryid
        this.drawerCtrl = true
        if (this.saveFlag === true) { // 控制拖拽区域保存后重新获取一遍组件样式信息
          await this.layout()
          this.saveFlag = false
        }
        await this.create()
      }
    }
  }
</script>

<style lang="scss" scoped>
@import "../../../style/dragStyle";
.individual .detail .contentJbxx .contentBodyInfo > div > div[data-v-3fb50b5e]:nth-child(1) {
    width: 35%;
}
.individual .detail .contentJbxx .contentBodyInfo > div > div[data-v-3fb50b5e]:nth-child(2) {
    width: 65%;
}
</style>
