<template>
  <div ref="draggableBoard" class="draggableBoard" :style="changeStyle">
    <vdr v-for="(item, index) in transCom"
         :key="item.comId"
         parent=".draggableBoard" class-name="transCom"
         class-name-dragging="dragging" :class-name-active="item.activeStyle"
         class-name-resizing="resizing" :enable-native-drag="true"
         :w="item.comWidth" :h="item.comHeight" :grid="[20, 20]"
         :x="item.comLeft" :y="item.comTop" :z="item.index"
         :draggable="item.draggable" :resizable="item.resizable"
         :min-width="item.minWidth" :min-height="item.minHeight"
         :is-conflict-check="false" :snap="true" :snap-tolerance="0"
         :style="`z-index: ${parseInt(item.index) + (item.activate ? 100 : 0)}`"
         @dragstop="(left, top) => onDragstop(index, left, top)"
         @resizestop="(left, top, width, height) => onResizstop(index, left, top, width, height)"
         @activated="() => onActivated(index)"
         @deactivated="() => onDeactivated(index)"
         @refLineParams="getRefLineParams">
      <template v-if="!item.delete">
        <!--文字-->
        <div v-if="item.type === 'text'" class="innerText">
          <label :style="item.labelStyle">{{ item.label }}</label>
          <a :style="item.valueStyle">{{ item.value }}</a>
        </div>
        <!--自定义-->
        <div v-else-if="item.type === 'src'" class="innerText">
          <component :is="item.value" :id="diyId" :datas="diyData"/>
        </div>
        <!--表格-->
        <div v-else-if="item.type === 'table'" class="innerTable">
          <el-table :data="item.table" border style="background-color: transparent;"
                    :cell-style="(data) => setCellStyle(data, item)" :header-cell-style="item.headerCellStyle">
            <el-table-column v-for="col in item.header" :key="col.prop" :prop="col.prop" :label="col.label"/>
          </el-table>
        </div>
        <!--eCharts-->
        <dw-echarts v-else :id="item.conName" :dw-key="item.conName" class="innerChart"/>
        <!--设置框-->
        <el-form v-show="item.activate" :v-model="item" label-position="right" label-width="40px" class="settingPage">
          <el-form-item label="居上">
            <el-input v-model.number="item.comTop" @input="(value) => inputTop(index, value)"/>
          </el-form-item>
          <el-form-item label="居左">
            <el-input v-model.number="item.comLeft" @input="(value) => inputLeft(index, value)"/>
          </el-form-item>
          <el-form-item label="宽度">
            <el-input v-model.number="item.comWidth" @input="(value) => inputWidth(index, value)"/>
          </el-form-item>
          <el-form-item label="高度">
            <el-input v-model.number="item.comHeight" @input="(value) => inputHeight(index, value)"/>
          </el-form-item>
          <el-form-item label="层级">
            <el-input v-model.number="item.index"/>
          </el-form-item>
          <el-form-item label="操作">
            <el-button @click="editSetting(item.comId)">编辑</el-button>
            <el-button @click="deleteSetting(item.comId)">删除</el-button>
          </el-form-item>
        </el-form>
      </template>
    </vdr>
    <!--辅助线-->
    <span v-for="item in vLine" v-show="item.display" class="ref-line v-line"
          :style="{ left: item.position, top: item.origin, height: item.lineLength}"/>
    <span v-for="item in hLine" v-show="item.display" class="ref-line h-line"
          :style="{ top: item.position, left: item.origin, width: item.lineLength}"/>
    <div v-if="checkPermission" class="button-group">
      <el-button v-show="isEdit" class="drag-button" @click="save">保存</el-button>
      <el-button v-show="isEdit" class="drag-button" @click="preview">预览</el-button>
      <el-button v-show="!isEdit" class="drag-button" @click="edit">编辑</el-button>
    </div>
  </div>
</template>

<script>
  import vdr from 'vue-draggable-resizable-gorkys'
  import 'vue-draggable-resizable-gorkys/dist/VueDraggableResizable.css'
  import {percentToPx, pxToPercent} from '../tools'

  export default {
    name: 'DraggableBoard',
    components: {
      'vdr': vdr
    },
    props: {
      items: { // 组件数组
        type: Array,
        default: () => []
      },
      layoutData: { // 数据源数据
        type: Object,
        default: () => {}
      },
      layoutParam: { // 布局参数数据
        type: Array,
        default: () => []
      },
      diyId: { // 自定义id
        type: String,
        default: ''
      },
      diyData: { // 自定义数据
        type: Object,
        default: () => {}
      },
      onDelete: { // 删除组件
        type: Function,
        default: () => {}
      },
      onSave: { // 保存组件
        type: Function,
        default: () => {}
      },
      checkPermission: { // 权限
        type: Boolean,
        default: true
      },
      roleId: { // 角色id
        type: String,
        default: ''
      }
    },
    data() {
      return {
        isEdit: true,
        transCom: [],
        vLine: [],
        hLine: [],
        boardInfo: {
          boardHeight: 0,
          boardWidth: 0
        }
      }
    },
    computed: {
      changeStyle() {
        let result = ''
        if (this.checkPermission && this.isEdit) {
          result += `background: linear-gradient(-90deg, rgba(212, 212, 212, 0.5) 1px, transparent 1px) 0 0 / 20px 20px,` +
            `linear-gradient(rgba(212, 212, 212, 0.5) 1px, transparent 1px) 0 0 / 20px 20px;`
        }
        this.isDrag()
        return result
      }
    },
    methods: {
      // 初始化
      init() {
        this.setBoardOffset()
        this.boardResize()
        this.redisplay()
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
          type: chart_code,
          comId: pkid,
          comName: 'transform-div' + index,
          conName: chart_code === 'text' ? 'text' + index : 'chart' + index,
          comTop: parseInt(!values.length ? 0 : values[0]),
          comLeft: parseInt(!values.length ? 0 : values[1]),
          comHeight: parseInt(!values.length ? (chart_code === 'text' ? 100 : 200) : values[2]),
          comWidth: parseInt(!values.length ? 200 : values[3]),
          index: parseInt(!values.length ? 0 : values[4]),
          minWidth: 33,
          minHeight: 100,
          draggable: true,
          resizable: true,
          delete: false,
          activate: false,
          activeStyle: 'active',
          sqlId: data_source,
          optionsChecked: optionsChecked
        }
        const layoutData = this.layoutData[pkid]

        // 类型判断
        if (chart_code === 'text') {
          // 文本类型填充数据
          for (let i = 0, len = optionsChecked.content.length; i < len; i++) {
            if (layoutData) {
              if (options[1].percent) {
                options[1].content = (layoutData[optionsChecked.content[i]][0] * 100).toFixed(2) + '%'
              } else {
                options[1].content = layoutData[optionsChecked.content[i]][0]
              }
            }
          }
          // 样式
          options['labelStyle'] = `color: ${options[0].color}; background-color: ${options[0].bgColor};
            font-size: ${options[0].size}px;letter-spacing: ${options[0].spacing}px; font-weight: ${options[0].weight};
            font-family: ${options[0].fontFamily};line-height: 150%;`
          options['valueStyle'] = `color: ${options[1].color}; background-color: ${options[1].bgColor};
            font-size: ${options[1].size}px;letter-spacing: ${options[1].spacing}px; font-weight: ${options[1].weight};
            font-family: ${options[1].fontFamily}; line-height: 150%;`
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
          if (layoutData) {
            options.xAxis.data = layoutData[optionsChecked.x[0]]
            // 系列数据
            for (let i = 0, len = optionsChecked.category.length; i < len; i++) {
              options.series[i].data = layoutData[optionsChecked.category[i]]
            }
          }
          // 生成图表
          this.$echartsSetOption('chart' + index, options, false, true)
        } else if (chart_code === 'pie' || chart_code === 'doughnut' || chart_code === 'nightingale') {
          // 添加新Transform div
          await this.transCom.push(Object.assign(transOption, {}))
          // 图表option填充数据
          if (layoutData) {
            for (let i = 0, len = optionsChecked.category.length; i < len; i++) {
              options.series[0].data[i].value = layoutData[optionsChecked.category[i]]
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
            if (layoutData) {
              for (let j = 0, len = layoutData[optionsChecked.table[i]].length; j < len; j++) {
                // 为空创建对象
                if (!table[j]) {
                  table[j] = {}
                }
                // 添加属性
                table[j][optionsChecked.table[i]] = layoutData[optionsChecked.table[i]][j]
              }
            }
          }
          // 样式
          options['headerCellStyle'] = {
            'color': options[0].color,
            'background-color': options[0].bgColor,
            'font-size': options[0].size + 'px',
            'font-weight': options[0].weight,
            'text-align': options[0].align,
            'border-color': options[0].lineColor
          }
          options['oddCellStyle'] = {
            'color': options[1].color,
            'background-color': options[1].oddBgColor,
            'font-size': options[1].size + 'px',
            'font-weight': options[1].weight,
            'text-align': options[1].align,
            'border-color': options[1].lineColor
          }
          options['evenCellStyle'] = {
            'color': options[1].color,
            'background-color': options[1].evenBgColor,
            'font-size': options[1].size + 'px',
            'font-weight': options[1].weight,
            'text-align': options[1].align,
            'border-color': options[1].lineColor
          }
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
          if (layoutData) {
            // indicator
            for (let i = 0, len = layoutData[optionsChecked.indicator[0]].length; i < len; i++) {
              options.radar.indicator.push({
                name: layoutData[optionsChecked.indicator[0]][i],
                max: 100
              })
            }
            // series
            for (let i = 0, len = optionsChecked.category.length; i < len; i++) {
              options.series[0].data[i].value = layoutData[optionsChecked.category[i]]
            }
          }
          // 生成图表
          this.$echartsSetOption('chart' + index, options, false, true)
        } else if (chart_code === 'gauge') {
          // 添加新Transform div
          await this.transCom.push(Object.assign(transOption, {}))
          // 图表option填充数据
          if (layoutData) {
            // series
            options.series[0].data[0].value = layoutData[optionsChecked.indicator[0]]
          }
          // 生成图表
          this.$echartsSetOption('chart' + index, options, false, true)
        } else if (chart_code === 'bar&line') {
          // 添加新Transform div
          await this.transCom.push(Object.assign(transOption, {}))
          // 合并bar和line数组
          const barLine = optionsChecked.bar.concat(optionsChecked.line)
          // 图表option填充数据
          if (layoutData) {
            // x轴数据
            options.xAxis.data = layoutData[optionsChecked.x[0]]
            // series数据
            for (let i = 0, len = barLine.length; i < len; i++) {
              options.series[i].data = layoutData[barLine[i]]
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
          if (layoutData) {
            // 初始化
            const lenAbscissa = layoutData[optionsChecked.abscissa[0]].length
            const lenOrdinate = layoutData[optionsChecked.ordinate[0]].length
            const count = lenAbscissa > lenOrdinate ? lenAbscissa : lenOrdinate
            for (let i = 0; i < count; i++) {
              options.series[0].data.push([0, 0])
            }
            // 添加横坐标
            for (let i = 0; i < lenAbscissa; i++) {
              options.series[0].data[i][0] = layoutData[optionsChecked.abscissa[0]][i]
            }
            // 添加纵坐标
            for (let i = 0; i < lenOrdinate; i++) {
              options.series[0].data[i][1] = layoutData[optionsChecked.ordinate[0]][i]
            }
          }
          // 生成图表
          this.$echartsSetOption('chart' + index, options, false, true)
        }
      },
      // 辅助线回调事件
      getRefLineParams(params) {
        const { vLine, hLine } = params
        this.vLine = vLine
        this.hLine = hLine
      },
      // 表格奇偶行
      setCellStyle(data, item) {
        if (data.rowIndex % 2 === 0) {
          return item['oddCellStyle']
        } else {
          return item['evenCellStyle']
        }
      },
      // 画版属性绑定
      setBoardOffset() {
        this.boardInfo.boardHeight = this.$refs['draggableBoard'].offsetHeight
        this.boardInfo.boardWidth = this.$refs['draggableBoard'].offsetWidth
      },
      // 动态更改board和trans尺寸
      boardResize() {
        window.onresize = () => {
          return (() => {
            this.adapt()
          })()
        }
      },
      // 组件自适应窗口
      adapt() {
        // 原数据
        const rawWidth = this.boardInfo.boardWidth
        const rawHeight = this.boardInfo.boardHeight
        this.setBoardOffset()
        // 组件自适应窗口变化
        for (let i = 0, len = this.transCom.length; i < len; i++) {
          this.transCom[i].comTop = Math.floor(Math.round(
            (this.transCom[i].comTop / rawHeight) * this.boardInfo.boardHeight) / 20) * 20
          this.transCom[i].comLeft = Math.floor(Math.round(
            (this.transCom[i].comLeft / rawWidth) * this.boardInfo.boardWidth) / 20) * 20
          this.transCom[i].comWidth = Math.floor(Math.round(
            (this.transCom[i].comWidth / rawWidth) * this.boardInfo.boardWidth) / 20) * 20
          this.transCom[i].comHeight = Math.floor(Math.round(
            (this.transCom[i].comHeight / rawHeight) * this.boardInfo.boardHeight) / 20) * 20
        }
      },
      // 拖动同步数据方法
      onDragstop(index, left, top) {
        this.transCom[index].comLeft = left
        this.transCom[index].comTop = top
      },
      // 缩放同步数据方法
      onResizstop(index, left, top, width, height) {
        this.transCom[index].comLeft = left
        this.transCom[index].comTop = top
        this.transCom[index].comWidth = width
        this.transCom[index].comHeight = height
      },
      // 激活调用方法
      onActivated(index) {
        if (this.isEdit) {
          this.transCom[index].activate = true
        }
      },
      // 激活失效方法
      onDeactivated(index) {
        if (this.isEdit) {
          this.transCom[index].activate = false
        }
      },
      // 设置框编辑
      editSetting(comId) {
        this.$router.push({
          name: 'EditComp',
          params: {
            compId: comId
          }
        })
      },
      // 设置框逻辑删除
      deleteSetting(comId) {
        // 从画板中删除
        for (let i = 0, len = this.transCom.length; i < len; i++) {
          if (comId === this.transCom[i].comId) {
            this.transCom[i].delete = true
            this.onDelete(comId)
          }
        }
      },
      // top绑定input事件
      inputTop(index, value) {
        if (value < 0) {
          this.transCom[index].comTop = 0
        }
        if (value > this.boardInfo.boardHeight - this.transCom[index].comHeight) {
          this.transCom[index].comTop = Math.floor(
            (this.boardInfo.boardHeight - this.transCom[index].comHeight) / 20) * 20
        }
      },
      // left绑定input事件
      inputLeft(index, value) {
        if (value < 0) {
          this.transCom[index].comLeft = 0
        }
        if (value > this.boardInfo.boardWidth - this.transCom[index].comWidth) {
          this.transCom[index].comLeft = Math.floor(
            (this.boardInfo.boardWidth - this.transCom[index].comWidth) / 20) * 20
        }
      },
      // height绑定input事件
      inputHeight(index, value) {
        if (value < 0) {
          this.transCom[index].comHeight = 100
        }
        if (value > this.boardInfo.boardHeight - this.transCom[index].comTop) {
          this.transCom[index].comHeight = Math.floor(
            (this.boardInfo.boardHeight - this.transCom[index].comTop) / 20) * 20
        }
        console.log(this.transCom[index].comHeight)
      },
      // width绑定input事件
      inputWidth(index, value) {
        if (value < 0) {
          this.transCom[index].comWidth = 100
        }
        if (value > this.boardInfo.boardWidth - this.transCom[index].comLeft) {
          this.transCom[index].comWidth = Math.floor(
            (this.boardInfo.boardWidth - this.transCom[index].comLeft) / 20) * 20
        }
      },
      // 预览
      preview() {
        this.isEdit = false
        this.$emit('isEdit', this.isEdit)
      },
      // 编辑
      edit() {
        this.isEdit = true
        this.$emit('isEdit', this.isEdit)
      },
      // 保存布局
      save() {
        if (!this.roleId) {
          this.$alertError('请先选择角色！')
          return
        }
        // 深拷贝
        const transComCopy = JSON.parse(JSON.stringify(this.transCom))
        // 保存不包含逻辑删除的组件列表
        for (let i = 0; i < transComCopy.length; i++) {
          if (transComCopy[i].delete) {
            transComCopy.splice(i--, 1)
          }
        }
        console.log(transComCopy)
        this.onSave({list: JSON.stringify(pxToPercent({
          region: this.$refs['draggableBoard'],
          items: transComCopy
        }))})
      },
      // 重现布局
      redisplay() {
        if (!this.roleId) {
          return
        }
        this.transCom = []
        if (this.layoutParam && this.layoutParam.length > 0) {
          const layout = percentToPx({
            region: this.$refs['draggableBoard'],
            items: this.layoutParam
          })
          for (let i = 0, len = layout.length; i < len; i++) {
            for (let j = 0, len = this.items.length; j < len; j++) {
              if (layout[i].component_id === this.items[j].pkid) {
                this.createItem(this.items[j].name, this.items[j].options, this.items[j].options_checked,
                                layout[i].component_id, this.items[j].chart_code, this.items[j].data_source,
                                layout[i].comTop, layout[i].comLeft, layout[i].comHeight,
                                layout[i].comWidth, layout[i].index)
                break
              }
            }
          }
          this.adapt()
        }
      },
      // 是否可以拖拽
      isDrag() {
        if (this.checkPermission && this.isEdit) {
          for (let i = 0, len = this.transCom.length; i < len; i++) {
            this.transCom[i].draggable = true
            this.transCom[i].resizable = true
            this.transCom[i].activeStyle = 'active'
          }
        } else {
          for (let i = 0, len = this.transCom.length; i < len; i++) {
            this.transCom[i].draggable = false
            this.transCom[i].resizable = false
            this.transCom[i].activeStyle = 'deactive'
          }
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../style/variables.scss';

  .draggableBoard {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .transCom {
    border: none;
    position: absolute;
  }

  .active {
    outline: 2px $trans-border solid;
  }

  .deactive {
    outline: 0;
  }

  .dragging, .resizing {
    outline: 2px $trans-border solid;
    background-color: rgba(64, 158, 255, 0.25); // 选中时颜色
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
      background-color: $button-bg;
      color: $background-comment;
      border: 0;
      width: 3.5vw;
      height: 3.2vh;
      padding: 0;
      z-index: 99;
      font-size: 1vmax;
      &:hover {
        background-color: $header-menu;
        cursor: pointer;
      }
    }
  }

  ::v-deep {
    .handle {
      background-color: $trans-border;
      border: 1px $trans-border solid;
      border-radius: 4px;
      -webkit-transition: all 300ms linear;
      -ms-transition: all 300ms linear;
      transition: all 300ms linear;
      &:hover {
        background-color: $header-menu;
        border: 1px $header-menu solid;
        transform: scale(1.8);
      }
    }
    .ref-line {
      background-color: $td-th-color;
    }
    .v-line {
      width: 2px;
    }
    .h-line {
      height: 2px;
    }
  }

  .el-form {
    position: absolute;
    height: 200px;
    width: 180px;
    background-color: rgba(245, 245, 245, 0.9); // 设置框背景颜色
    box-shadow: 0px -3px 5px 0px $shadow,
                -3px 0px 5px 0px $shadow,
                3px 0px 5px 0px $shadow,
                0px 3px 5px 0px $shadow;
    left: 50%;
    margin-left: -80px;
    top: -220px;
    ::v-deep {
      .el-form-item {
        margin: 3px;
        height: 30px;
      }
      .el-form-item__label {
        padding-right: 7px;
        height: 30px;
        color: $setting-font;
        font-weight: 500;
      }
      .el-input__inner {
        padding: 0;
        border-radius: 5px;
        border: 1px solid $trans-border;
        height: 26px;
      }
      .el-input {
        height: 30px;
      }
      .el-form-item__content {
        height: 30px;
      }
      .el-button {
        padding: 3px;
        background-color: $button-bg;
        border: 0;
        color: $background-comment;
        &:hover {
          background-color: $header-menu;
        }
      }
    }
  }
</style>
