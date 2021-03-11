<template>
  <div class="organization">
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
          <div class="contentJbxx">
            <!-- <div class="contentTitle"> //contentTitle标题样式-竖杠
              <span>基本信息：</span>
            </div> -->
            <div class="contentTitle">
              <dw-title message="基本信息：" :before-title-style="beforeTitleStyle" :is-title-style="isTitleStyle" />
            </div>
            <div class="contentBodyInfo">
              <div style="display: flex;justify-content: space-around;">
                <!-- <div>单位名称：</div> -->
                <div style="width: 76%;">
                  <dw-form dw-key="formBJ" :form-data="formData">
                    <dw-lov
                      span="3"
                      class="myLov"
                      dw-key="dwmcLov"
                      :value.sync="formData.dwmcLov"
                      placeholder="请选择单位"
                      fill-mapping="dwmcLov:dwmc"
                      res-title="单位信息"
                      res-title-center="false"
                      res-load-path="response/orgnLov.vue"
                      :on-res-confirm="makeSure"/>
                  </dw-form>
                </div>
                <!-- <div :title="formData.dwbh">{{ formData.dwbh }}</div> -->
              </div>
              <div>
                <div>参保单位编号：</div>
                <div :title="formData.dwbh">{{ formData.dwbh }}</div>
              </div>
              <div>
                <div :title="formData.tyshxydm">统一社会信用代码：</div>
                <div>{{ formData.tyshxydm }}</div>
              </div>
              <div>
                <div>参保单位性质：</div>
                <div>
                  <code-span code="DWXZ" :value="formData.cbdwxz"/>
                </div>
              </div>
              <div>
                <div>经济类型：</div>
                <div>
                  <code-span code="JJLX" :value="formData.jjlx"/>
                </div>
              </div>
              <div>
                <div>经济类型明细：</div>
                <div>
                  <code-span code="JJLXMX" :value="formData.jjlxmx"/>
                </div>
              </div>
              <div>
                <div>所属行业：</div>
                <div>
                  <code-span code="SSCY" :value="formData.sscy"/>
                </div>
              </div>
              <div>
                <div>隶属关系：</div>
                <div>
                  <code-span code="LSGX" :value="formData.lsgx"/>
                </div>
              </div>
              <div>
                <div :title="formData.dwdz">单位地址：</div>
                <div>{{ formData.dwdz }}</div>
              </div>
            </div>
          </div>

          <div class="contentTable">
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
                  <th><span>最大缴费年月</span></th>
                  <td><span>{{ tableData.ylbx0 }}</span></td>
                  <td><span>{{ tableData.sybx0 }}</span></td>
                  <td><span>{{ tableData.gsbx0 }}</span></td>
                </tr>
                <tr>
                  <th><span>最后一月缴费人数</span></th>
                  <td><span>{{ tableData.ylbx1 }}</span></td>
                  <td><span>{{ tableData.sybx1 }}</span></td>
                  <td><span>{{ tableData.gsbx1 }}</span></td>
                </tr>
                <tr>
                  <th><span>最后一月缴费总金额</span></th>
                  <td><span>{{ tableData.ylbx2 }}</span></td>
                  <td><span>{{ tableData.sybx2 }}</span></td>
                  <td><span>{{ tableData.gsbx2 }}</span></td>
                </tr>
                <tr>
                  <th><span>缴费基数中位数</span></th>
                  <td><span>{{ tableData.ylbx3 }}</span></td>
                  <td><span>{{ tableData.sybx3 }}</span></td>
                  <td><span>{{ tableData.gsbx3 }}</span></td>
                </tr>
              </table>
            </div>
          </div>

          <div class="contentEcharts">
            <div class="contentTitle">
              <dw-title message="单位所在行业对比：" :before-title-style="beforeTitleStyle" :is-title-style="isTitleStyle"/>
            </div>
            <div class="contentBody">
              <dw-echarts dw-key="transChartLd"/>
            </div>
          </div>

          <div class="contentDwhydb">
            <div class="contentTitle">
              <dw-title message="单位所在行业对比：" :before-title-style="beforeTitleStyle" :is-title-style="isTitleStyle"/>
            </div>
            <div class="contentBody">
              <div v-for="(keyRow, index) in dwszhydbDatas" :key="`tr${index}`" class="compare-item">
                <div class="labelColor">{{ keyRow.label }}</div>
                <div style="display: inline-block;width: 20%;margin-left: 5%;">
                  <dv-digital-flop :config="keyRow.data" class="autoFP"/>
                </div>
              </div>
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
    name: 'Organization',
    components: {
      'draggable-board': draggableBoard,
      'code-span': codeSpan
    },
    mixins: [dragCommon],
    data() {
      return {
        formData: {
          dwid: '',
          dwbh: '暂无数据',
          dwmc: '暂无数据',
          tyshxydm: '暂无数据',
          cbdwxz: '', // code
          jjlx: '', // code
          jjlxmx: '', // code
          sscy: '', // code
          lsgx: '', // code
          dwdz: '暂无数据',
          dwmcLov: '',
          radval: '0'
        },
        tableColTitle: ['最早缴费年月', '最大缴费年月', '最后一月缴费人数', '最后一月缴费总金额'],
        tableData: {
          ylbx0: '0',
          ylbx1: '0',
          ylbx2: '0',
          ylbx3: '0',
          gsbx0: '0',
          gsbx1: '0',
          gsbx2: '0',
          gsbx3: '0',
          sybx0: '0',
          sybx1: '0',
          sybx2: '0',
          sybx3: '0'
        },
        ldOption: {
          title: {
            show: false,
            text: '基础雷达图'
          },
          tooltip: {
            show: false
          },
          color: ['#5872E0', '#FE5F0B', '#FEE87A', '#6CCD8F', '#089BAB'],
          legend: {
            show: false
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
            indicator: [
              {
                name: '人数',
                max: 100
              },
              {
                name: '缴费水准',
                max: 100
              },
              {
                name: '岗位稳定',
                max: 100
              },
              {
                name: '安全系数',
                max: 100
              }
            ],
            nameGap: 11,
            splitArea: {
              show: true,
              areaStyle: {
                // color: ['rgba(13,26,73,0.75)', 'rgba(15,44,84,0.75)', 'rgba(13,61,97,0.75)', 'rgba(12,71,105,0.75)'] // 图表背景网格的颜色
                color: ['rgb(216,225,243)', 'rgb(232,241,252)', 'rgb(214,220,240)', 'rgb(208,230,250)']
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
            data: [
              {
                value: [0, 0, 0, 0],
                name: ''
              }
            ]
          }]
        },
        defaultLdData: [{
          value: [0, 0, 0, 0],
          name: ''
        }],
        items: [],
        role: {
          roleSelect: [],
          pickRole: ''
        },
        itemDrawer: false,
        getDataId: '',
        pageId: 'Organization',
        pageType: '2',
        dwszhyDatas: {
          cbzrs_bc: 0,
          cbzrshypm_bc: 0,
          dqpjjfjs_bc: 0,
          dqpjjfjshypm_bc: 0,
          dqjfjszws_bc: 0,
          dqjfjszwshypm_bc: 0,
          isGetData: false // 是否已经获取到数据
        }
      }
    },
    computed: {
      showRightDiv() {
        return this.formData.radval === '0'
      },
      dwszhydbDatas() {
        const commonStyle = {
          textAlign: 'left',
          fontSize: 20,
          fill: '#040404'
        }
        return [{
                  key: 'cbzrs_bc',
                  label: '参保总人数：',
                  data: {
                    number: [this.dwszhyDatas.cbzrs_bc],
                    textAlign: 'left',
                    style: commonStyle
                  }
                },
                {
                  key: 'dqpjjfjs_bc',
                  label: '平均缴费基数：',
                  data: {
                    number: [this.dwszhyDatas.dqpjjfjs_bc],
                    textAlign: 'left',
                    style: commonStyle
                  }
                },
                {
                  key: 'dqjfjszws_bc',
                  label: '缴费基数中位数：',
                  data: {
                    number: [this.dwszhyDatas.dqjfjszws_bc],
                    textAlign: 'left',
                    style: commonStyle
                  }
                },
                {
                  key: 'cbzrshypm_bc',
                  label: '参保人数行业排名：',
                  data: {
                    number: [this.dwszhyDatas.cbzrshypm_bc],
                    textAlign: 'left',
                    style: commonStyle
                  }
                },
                {
                  key: 'dqpjjfjshypm_bc',
                  label: '平均缴费基数行业排名：',
                  data: {
                    number: [this.dwszhyDatas.dqpjjfjshypm_bc],
                    textAlign: 'left',
                    style: commonStyle
                  }
                },
                {
                  key: 'dqjfjszwshypm_bc',
                  label: '缴费基数中位数行业排名：',
                  data: {
                    number: [this.dwszhyDatas.dqjfjszwshypm_bc],
                    textAlign: 'left',
                    style: commonStyle
                  }
                }
        ]
      }
    },
    mounted() {
      this.$echartsSetOption('transChartLd', this.ldOption, false, true)
    },
    methods: {
      async makeSure(data) { // lov选择后回调数据
        this.dwszhyDatas.isGetData = false
        this.changeDatas(this.formData, data, 'String')
        const jsonResult = await this.$ajax('orgn.do?method=getIndustryCmInfo', {
          dwdjid: data.dwid
        })
        this.dwszhyDatas.isGetData = true
        this.changeDatas(this.dwszhyDatas, jsonResult.data[0], 'Number')
        // 把data中的dwid放入formData中
        this.formData.dwid = data.dwid
        const jsonResult2 = await this.$ajax('orgn.do?method=getOrgnJf', {
          dwdjid: data.dwid
        })
        this.tableData = {}
        if (jsonResult2.data.length > 0) {
          const jsonData = jsonResult2.data[0]
          for (const item in jsonData) {
            this.tableData[item] = jsonData[item] ? jsonData[item] : 0
          }
        }
        this.getDataId = this.formData.dwid
        this.drawerCtrl = true
        if (this.saveFlag === true) { // 控制拖拽区域保存后重新获取一遍组件样式信息
          await this.layout()
          this.saveFlag = false
        }
        await this.create()
        this.getLdDatas(data.dwid)
      },
      getLdDatas(dwid) {
        this.$ajax('orgn.do?method=getLdData', {
          dwdjid: dwid
        }).then(res => { // 成功后操作
          if (res.data.length > 0) {
            this.ldOption.series[0].data.length = 0
            this.ldOption.series[0].data.push({value: res.data[0].value.split(',')})
            this.$echartsSetOption('transChartLd', this.ldOption, false, true)
          } else {
            this.ldOption.series[0].data = this.defaultLdData
            this.$echartsSetOption('transChartLd', this.ldOption, false, true)
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
@import "../../../style/dragStyle";
</style>
