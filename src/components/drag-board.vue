<template>
  <div>
    <div ref="dragBoard" class="dragBoard" tabindex="1">
      <trans-div v-for="item in transCom" v-show="!item.delete" :ref="item.comName" :key="item.name" :com="item"
                 :board="boardInfo"
                 :is-edit="isEdit"
                 @transDivItem="transDivItem" @transDivStyle="transDivStyle" @deleteTransDiv="deleteTransDiv">
        <div v-if="item.type === 'text'" class="innerText">
          <label :style="item.labelStyle">{{ item.label }}</label>
          <a :style="item.valueStyle">{{ item.value }}</a>
        </div>
        <div v-else-if="item.type === 'src'" class="innerText">
          <component :is="item.value" :id="diyId" :datas="diyDatas"/>
        </div>
        <div v-else-if="item.type === 'table'" class="innerTable">
          <el-table :data="item.table" border style="background-color: transparent;"
                    :cell-style="(data) => setCellStyle(data, item)" :header-cell-style="item.headerCellStyle">
            <el-table-column v-for="col in item.header" :key="col.prop" :prop="col.prop" :label="col.label"/>
          </el-table>
        </div>
        <dw-echarts v-else :id="item.conName" :dw-key="item.conName" class="innerChart"/>
      </trans-div>
      <div v-if="checkPermission" class="button-group">
        <el-button v-show="isEdit" class="drag-button" @click="preview">预览</el-button>
        <el-button v-show="isEdit" class="drag-button" @click="save">保存</el-button>
        <el-button v-show="!isEdit" class="drag-button" @click="edit">编辑</el-button>
      </div>
    </div>
  </div>
</template>

<script>
  import {pxToPercent, percentToPx} from '../tools/index'
  import transDiv from './trans-div'
  import systemColor from '../style/variables.scss'

  export default {
    name: 'DraggableBoard',
    components: {
      'trans-div': transDiv
    },
    props: {
      items: Array,
      layoutStyle: Array,
      diyDatas: { // 用于自定义部分
        type: Object,
        default: () => {
        }
      },
      diyId: { // 用于自定义部分
        type: String,
        default: ''
      },
      onSave: { // 保存拖拽组件的布局
        type: Function,
        default: () => {
        }
      },
      onDelete: { // 删除拖拽区域echarts组件
        type: Function,
        default: () => {
        }
      },
      optionData: { // 存放数据源sql查出来的数据部分（可选项、数值）
        type: Object,
        default: () => {
        }
      },
      layoutProps: Object,
      saveProps: Object,
      checkPermission: Boolean
    },
    data() {
      return {
        isEdit: true,
        transCom: [],
        setting: {
          comTop: 0,
          comLeft: 0,
          comHeight: 200,
          comWidth: 200,
          index: 0
        },
        boardInfo: {
          boardTop: 0,
          boardLeft: 0
        },
        chartList: [],
        systemColor: {
          bgColor: systemColor.boardBg,
          borderColor: systemColor.borderColor
        }
      }
    },
    methods: {
      // 初始化
      init() {
        this.setBoardOffset()
        this.boardResize()
        this.getCharts()
      },
      // 画版属性绑定
      setBoardOffset() {
        this.boardInfo.boardTop = this.$refs['dragBoard'].offsetTop
        this.boardInfo.boardLeft = this.$refs['dragBoard'].offsetLeft
        this.boardInfo.boardHeight = this.$refs['dragBoard'].offsetHeight
        this.boardInfo.boardWidth = this.$refs['dragBoard'].offsetWidth
      },
      // 动态更改board和trans尺寸
      boardResize() {
        window.onresize = () => {
          return (() => {
            // 原数据
            const rawWidth = this.boardInfo.boardWidth
            const rawHeight = this.boardInfo.boardHeight
            this.setBoardOffset()
            // 组件自适应窗口变化
            for (let i = 0, len = this.transCom.length; i < len; i++) {
              this.transCom[i].comTop = Math.round((this.transCom[i].comTop / rawHeight) * this.boardInfo.boardHeight)
              this.transCom[i].comLeft = Math.round((this.transCom[i].comLeft / rawWidth) * this.boardInfo.boardWidth)
              this.transCom[i].comWidth = Math.round((this.transCom[i].comWidth / rawWidth) * this.boardInfo.boardWidth)
              this.transCom[i].comHeight = Math.round((this.transCom[i].comHeight / rawHeight) * this.boardInfo.boardHeight)
            }
          })()
        }
      },
      // 接收子组件数据
      transDivItem(data) {
        this.setting = data
      },
      // 接收子组件数据
      transDivStyle(data) {
        this.setting.comHeight = data.height
        this.setting.comWidth = data.width
        this.setting.comTop = data.top
        this.setting.comLeft = data.left
      },
      // 逻辑删除组件
      deleteTransDiv(data) {
        // 从画板中删除
        for (let i = 0, len = this.transCom.length; i < len; i++) {
          if (data.comId === this.transCom[i].comId) {
            this.transCom[i].delete = true
            this.onDelete(data.comId)
          }
        }
      },
      // 保存布局
      save() {
        if (!this.saveProps.roleId) {
          this.$alertError('请先选择角色！')
          return null
        }
        // 深拷贝
        const transComCopy = JSON.parse(JSON.stringify(this.transCom))
        // 保存不包含逻辑删除的组件列表
        for (let i = 0; i < transComCopy.length; i++) {
          if (transComCopy[i].delete) {
            transComCopy.splice(i--, 1)
          }
        }
        const saveAjaxProps = Object.assign({
          userId: this.$store.state.user.userInfo.userid,
          list: JSON.stringify(pxToPercent({
            region: this.$refs['dragBoard'],
            items: transComCopy
          }))
        }, this.saveProps)
        this.onSave(saveAjaxProps)
        this.saveFlag = true
      },
      // 获取本页面保存好Chart的数据
      getCharts() {
        if (!this.layoutProps.roleId) {
          return null
        }
        this.transCom = []
        if (this.layoutStyle && this.layoutStyle.length > 0) {
          this.chartList = percentToPx({
            region: this.$refs['dragBoard'],
            items: this.layoutStyle
          })
          this.redisplayLayout()
        }
      },
      // 重现布局
      redisplayLayout() {
        for (let i = 0, len = this.chartList.length; i < len; i++) {
          for (let j = 0, len = this.items.length; j < len; j++) {
            if (this.chartList[i].component_id === this.items[j].pkid) {
              this.createItem(this.items[j].name, this.items[j].options, this.items[j].options_checked,
                              this.chartList[i].component_id, this.items[j].chart_code, this.items[j].data_source, this.chartList[i].comTop,
                              this.chartList[i].comLeft, this.chartList[i].comHeight, this.chartList[i].comWidth, this.chartList[i].index)
              break
            }
          }
        }
      },
      // 创建新的div实例
      async createItem(name, option, options_checked, pkid, chart_code, data_source, ...values) {
        // 展示不允许创建，创建只允许一次
        if ((!this.isEdit && !values.length)) {
          return
        }
        const options = JSON.parse(option)
        const optionsChecked = JSON.parse(options_checked)
        const index = this.transCom.length + 1
        const transOption = {
          comId: pkid,
          comName: 'transform-div' + index,
          conName: chart_code === 'text' ? 'text' + index : 'chart' + index,
          type: chart_code,
          comTop: !values.length ? 0 : values[0],
          comLeft: !values.length ? 0 : values[1],
          comHeight: !values.length ? (chart_code === 'text' ? 100 : 200) : values[2],
          comWidth: !values.length ? 200 : values[3],
          index: !values.length ? 0 : values[4],
          delete: false,
          sqlId: data_source,
          optionsChecked: optionsChecked
        }
        const optionsDate = this.optionData[pkid]

        // 类型判断
        if (chart_code === 'text') {
          // 文本类型填充数据
          for (let i = 0, len = optionsChecked.content.length; i < len; i++) {
            if (optionsDate) {
              if (options[1].percent) {
                options[1].content = (optionsDate[optionsChecked.content[i]][0] * 100).toFixed(2) + '%'
              } else {
                options[1].content = optionsDate[optionsChecked.content[i]][0]
              }
            }
          }
          // 样式
          options['labelStyle'] = `color: ${options[0].color}; background-color: ${options[0].bgColor}; font-size: ${options[0].size}px;
                letter-spacing: ${options[0].spacing}px; font-weight: ${options[0].weight}; font-family: ${options[0].fontFamily};
                line-height: 150%;`
          options['valueStyle'] = `color: ${options[1].color}; background-color: ${options[1].bgColor}; font-size: ${options[1].size}px;
                letter-spacing: ${options[1].spacing}px; font-weight: ${options[1].weight}; font-family: ${options[1].fontFamily};
                line-height: 150%;`
          if (options[0].display === 'inline') {
            options['labelStyle'] += `margin-right: ${options[0].size}px;`
          } else if (options[0].display === 'block') {
            options['labelStyle'] += `display:block;`
          }
          // 添加新Transform div
          await this.transCom.push(Object.assign(transOption, {
            label: options[0].content,
            value: options[1].content,
            labelStyle: options['labelStyle'],
            valueStyle: options['valueStyle'],
            percent: options[1].percent
          }))
        } else if (chart_code === 'bar' || chart_code === 'line') {
          // 添加新Transform div
          await this.transCom.push(Object.assign(transOption, {}))
          // 图表option填充数据
          // x轴数据
          if (optionsDate) {
            options.xAxis.data = optionsDate[optionsChecked.x[0]]
            // 系列数据
            for (let i = 0, len = optionsChecked.category.length; i < len; i++) {
              options.series[i].data = optionsDate[optionsChecked.category[i]]
            }
          }
          // 生成图表
          this.$echartsSetOption('chart' + index, options, false, true)
        } else if (chart_code === 'pie' || chart_code === 'doughnut' || chart_code === 'nightingale') {
          // 添加新Transform div
          await this.transCom.push(Object.assign(transOption, {}))
          // 图表option填充数据
          if (optionsDate) {
            for (let i = 0, len = optionsChecked.category.length; i < len; i++) {
              options.series[0].data[i].value = optionsDate[optionsChecked.category[i]]
            }
          }
          // 生成图表
          this.$echartsSetOption('chart' + index, options, false, true)
        } else if (chart_code === 'table') {
          const table = []
          const header = []
          // 表格类型填充数据
          for (let i = 0, len = optionsChecked.table.length; i < len; i++) {
            // 添加表头
            header.push({
              prop: optionsChecked.table[i],
              label: optionsChecked.table[i]
            })
            // 添加表体数据
            if (optionsDate) {
              for (let j = 0, len = optionsDate[optionsChecked.table[i]].length; j < len; j++) {
                // 为空创建对象
                if (!table[j]) {
                  table[j] = {}
                }
                // 添加属性
                table[j][optionsChecked.table[i]] = optionsDate[optionsChecked.table[i]][j]
              }
            }
          }
          // 样式
          options['headerCellStyle'] = `color: ${options[0].color}; background-color: ${options[0].bgColor}; font-size: ${options[0].size}px;
                font-weight: ${options[0].weight}; text-align: ${options[0].align}; border-color: ${options[0].lineColor};`
          options['oddCellStyle'] = `color: ${options[1].color}; background-color: ${options[1].oddBgColor}; font-size: ${options[1].size}px;
                font-weight: ${options[1].weight}; text-align: ${options[1].align}; border-color: ${options[1].lineColor};`
          options['evenCellStyle'] = `color: ${options[1].color}; background-color: ${options[1].evenBgColor}; font-size: ${options[1].size}px;
                font-weight: ${options[1].weight}; text-align: ${options[1].align}; border-color: ${options[1].lineColor};`
          // 添加新Transform div
          await this.transCom.push(Object.assign(transOption, {
            table: table,
            header: header,
            oddCellStyle: options['oddCellStyle'],
            evenCellStyle: options['evenCellStyle'],
            headerCellStyle: options['headerCellStyle']
          }))
        } else if (chart_code === 'radar') {
          // 添加新Transform div
          await this.transCom.push(Object.assign(transOption, {}))
          // 图表option填充数据
          if (optionsDate) {
            // indicator
            for (let i = 0, len = optionsDate[optionsChecked.indicator[0]].length; i < len; i++) {
              options.radar.indicator.push({
                name: optionsDate[optionsChecked.indicator[0]][i],
                max: 100
              })
            }
            // series
            for (let i = 0, len = optionsChecked.category.length; i < len; i++) {
              options.series[0].data[i].value = optionsDate[optionsChecked.category[i]]
            }
          }
          // 生成图表
          this.$echartsSetOption('chart' + index, options, false, true)
        } else if (chart_code === 'gauge') {
          // 添加新Transform div
          await this.transCom.push(Object.assign(transOption, {}))
          // 图表option填充数据
          if (optionsDate) {
            // series
            options.series[0].data[0].value = optionsDate[optionsChecked.indicator[0]]
          }
          // 生成图表
          this.$echartsSetOption('chart' + index, options, false, true)
        } else if (chart_code === 'bar&line') {
          // 添加新Transform div
          await this.transCom.push(Object.assign(transOption, {}))
          // 合并bar和line数组
          const barLine = optionsChecked.bar.concat(optionsChecked.line)
          // 图表option填充数据
          if (optionsDate) {
            // x轴数据
            options.xAxis.data = optionsDate[optionsChecked.x[0]]
            // series数据
            for (let i = 0, len = barLine.length; i < len; i++) {
              options.series[i].data = optionsDate[barLine[i]]
            }
          }
          // 生成图表
          this.$echartsSetOption('chart' + index, options, false, true)
        } else if (chart_code === 'src') {
          this.transCom.push(Object.assign(transOption, {
            value: data_source
          }))
        } else if (chart_code === 'scatter') {
          // 添加新Transform div
          await this.transCom.push(Object.assign(transOption, {}))
          // 图表option填充数据
          if (optionsDate) {
            // 初始化
            const lenAbscissa = optionsDate[optionsChecked.abscissa[0]].length
            const lenOrdinate = optionsDate[optionsChecked.ordinate[0]].length
            const count = lenAbscissa > lenOrdinate ? lenAbscissa : lenOrdinate
            for (let i = 0; i < count; i++) {
              options.series[0].data.push([0, 0])
            }
            // 添加横坐标
            for (let i = 0; i < lenAbscissa; i++) {
              options.series[0].data[i][0] = optionsDate[optionsChecked.abscissa[0]][i]
            }
            // 添加纵坐标
            for (let i = 0; i < lenOrdinate; i++) {
              options.series[0].data[i][1] = optionsDate[optionsChecked.ordinate[0]][i]
            }
          }
          // 生成图表
          this.$echartsSetOption('chart' + index, options, false, true)
        }
      },
      setCellStyle(data, item) {
        if (data.rowIndex % 2 === 0) {
          return item['oddCellStyle']
        } else {
          return item['evenCellStyle']
        }
      },
      preview() {
        this.isEdit = false
        this.$emit('isEdit', this.isEdit)
      },
      edit() {
        this.isEdit = true
        this.$emit('isEdit', this.isEdit)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../style/variables.scss';

  .dragBoard {
    position: relative;
    height: 100%;
  }

  .innerChart {
    position: relative;
    width: 100%;
    height: 100%;
    margin-left: auto;
    margin-right: auto;
    overflow: hidden;
    word-break: break-all;
  }

  .innerText {
    width: 100%;
    height: 100%;
  }

  .innerTable {
    width: 100%;
    height: 100%;
    overflow-y: auto;
  }

  .button-group {
    position: absolute;
    bottom: 0;
    right: 0.5%;

    .drag-button {
      background-color: $border-color;
      color: $first-font;
      border: 0;
      width: 3.5vw;
      height: 3.2vh;
      padding: 0;
      z-index: 99;
      font-size: 1vmax;
      &:hover {
        background-color: $third-bg;
        cursor: pointer;
      }
    }
  }

  .el-table--border:after, .el-table--group:after, .el-table:before {
    display: none;
  }

  .el-table--border, .el-table--group {
    border-color: transparent;
  }

  ::v-deep .el-table__empty-block {
    border-color: transparent;
  }
</style>
