
/**
 * response通用配置
 */
export const responseCommon = {
  props: {
    param: { // 参数
      type: Object,
      default() {
        return {}
      }
    },
    onConfirm: { // 自动获取表格的选中值方法
      type: Function,
      default: () => {
      }
    },
    onClose: { // 触发关闭窗口事件
      type: Function,
      default: () => {
      }
    }
  }
}

/**
 * drag通用配置
 */
export const dragCommon = {

  data() {
    return {
      drawerCtrl: false, // 控制抽屉只有在lov框选择之后才能触发，默认不能触发
      saveFlag: false, // 控制保存后切换id时会重新获取一遍布局信息，避免获取布局信息只触发一次
      layoutData: {}, // 存放数据源sql查出来的数据部分
      LayoutParam: [], // 存放个人、单位页面当前id保存的自定义echarts组件的布局信息
      beforeTitleStyle: 'backgroundColor: #2067c0;width: 0.3vw;height: 3vh;marginRight: 6px',
      isTitleStyle: 'fontSize:1.2vw;'
    }
  },
  mounted() {
    this.setPage()
  },
  computed: {
    showEdit() {
      return this.formData.radval === '0' && this.checkPermission
    },
    checkPermission() {
      const buttons = this.$store.getters.permission_buttons
      return buttons.includes('editPage')
    }
  },
  methods: {
    // 获取组件的布局样式信息
    async layout() {
      const list = await this.$ajax('editChart.do?method=getDragChartList', {
        userId: this.$store.state.user.userInfo.userid,
        roleId: this.role.pickRole,
        pageId: this.pageId,
        type: this.pageType
      })
      this.LayoutParam = list.data
    },
    // 拿到所有的已布局组件的必要option信息
    async create() {
      this.layoutData = {}
      for (const item of this.LayoutParam) {
        // 通过入参传入drag-board组件
        if (item.chart_code === 'src') {
          this.layoutData[item.component_id] = {value: item.sql_id}
        } else {
          this.layoutData[item.component_id] = await this.getOptionBySql(item['sql_id'])
        }
      }
      this.$nextTick(() => {
        this.$refs['draggableBoard'].init()
      })
    },
    // 通过sql获取可选项等数据
    async getOptionBySql(sqlId) {
      const res = await this.$ajax('dataSource.do?method=checkSqlInfo', {
        sqlId: sqlId,
        postionData: true,
        Id: this.getDataId
      })
      const optionsDate = {}
      // 格式转换
      if (res.data && res.data.length > 0) {
        const resData = JSON.parse(res.data)
        for (const item2 of resData) {
          optionsDate[item2.name] = item2.value
        }
        return optionsDate
      }
    },
    // 保存当前拖拽的组件布局
    onSave(option) {
      this.$ajax('editChart.do?method=setDragChartList', Object.assign({
        userId: this.$store.state.user.userInfo.userid,
        roleId: this.role.pickRole,
        pageId: this.pageId,
        type: this.pageType}, option)).then((res) => {
        if (res.msg === '保存成功') {
          this.$alertSuccess(res.msg)
          this.saveFlag = true
        }
      })
    },
    // 删除单个布局组件
    onDelete(comId) {
      if (comId) {
        delete this.layoutData[comId]
      }
    },
    // 合并对象数据
    changeDatas(oldArr, newArr, type) {
      const keyArr = Object.keys(newArr)
      if (type === 'Number') {
        for (const item of keyArr) {
          oldArr[item] = Number(newArr[item])
        }
      } else {
        for (const item of keyArr) {
          oldArr[item] = newArr[item]
        }
      }
    },
    // 配置页面
    async setPage() {
      this.role.pickRole = this.$getCache('roleId')
      // 设置角色下拉框数据
      await this.setRoleSelect()
      await this.setItems()
      await this.layout()
    },
    // 设置角色下拉框数据
    async setRoleSelect() {
      const userInfo = this.$store.state.user.userInfo
      this.role.roleSelect = userInfo.jsid
      if (!this.role.pickRole) {
        this.role.pickRole = this.role.roleSelect[0].value
      }
    },
    // 点击右侧角色框
    async setComItems() {
      this.LayoutParam = []
      await this.setItems()
      await this.layout()
      await this.create()
    },
    // 设置右侧item
    async setItems() {
      this.items = []
      this.style = []
      if (!this.role.pickRole) {
        return
      }
      const chartList = await this.$ajax('editChart.do?method=getEditChartList', {
        'roleId': this.role.pickRole,
        'type': this.pageType
      })
      for (let i = 0, len = chartList.data.length, n = -1; i < len; i++) {
        chartList.data[i]['show'] = false
        n = parseInt(i) + parseInt(1)
        chartList.data[i]['name'] = 'item' + n
        this.items.push(chartList.data[i])
      }
    },
    // 展示缩略图
    changeBgImage(image) {
      return `height: 100%; width: 100%; background-image: url(` + image + `);
                background-repeat:no-repeat; background-size:100% 100%;`
    },
    // 改变item大小
    changeItemHeight(chart_code) {
      if (chart_code === 'text') {
        return `height: 12.5%;`
      } else {
        return `height: 22.5%;`
      }
    },
    // 抽屉打开方法
    openItemDrawer() {
      if (this.drawerCtrl) {
        this.itemDrawer = true
      }
    },
    // 抽屉关闭方法
    leaveItemDrawer() {
      this.$refs['roleSelect'].blur()
      this.itemDrawer = false
    },
    // 右侧点击事件
    async createItem(name, option, options_checked, pkid, chart_code, data_source, ...values) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.layoutData.hasOwnProperty(pkid)) {
        return
      }
      if (chart_code === 'src') {
        this.$refs['draggableBoard'].createItem(name, option, options_checked, pkid, chart_code, data_source, ...values)
        this.layoutData[pkid] = {value: data_source}
      } else {
        await this.getOptionBySql(data_source).then((res) => {
          this.layoutData[pkid] = res
          this.$refs['draggableBoard'].createItem(name, option, options_checked, pkid, chart_code, data_source, ...values)
        })
      }
    },
    isEdit(data) {
      if (data) {
        // 编辑
        this.formData.radval = '0'
      } else {
        // 预览
        this.formData.radval = '1'
      }
    }
  }
}

/**
 * comp通用配置
 */
export const compCommon = {
  data() {
    return {
      zdyzjOption: [],
      userId: '',
      activeName: 'first',
      categoryHeight: '',
      indicatorHeight: '',
      xAxisHeight: '',
      cascaderKey: 0,
      items: [],
      type: '',
      typeName: '',
      option: {},
      listOptional: [],
      listCategory: [],
      listX: [],
      listContent: [],
      listTable: [],
      listIndicator: [],
      listAbscissa: [],
      listOrdinate: [],
      zdyzjmc: '', // 自定义组件名称
      listBar: [],
      listLine: [],
      dataSource: {
        value: [],
        options: []
      },
      table: [],
      header: [],
      legend: {
        x: [
          {
            name: '居中',
            value: 'center'
          },
          {
            name: '居左',
            value: 'left'
          },
          {
            name: '居右',
            value: 'right'
          }
        ],
        y: [
          {
            name: '顶部',
            value: 'top'
          },
          {
            name: '中部',
            value: 'center'
          },
          {
            name: '底部',
            value: 'bottom'
          }
        ],
        orient: [
          {
            name: '横向',
            value: 'horizontal'
          },
          {
            name: '纵向',
            value: 'vertical'
          }
        ]
      },
      tips: [
        [
          {
            name: '外部',
            value: 'outer'
          },
          {
            name: '内部',
            value: 'inner'
          },
          {
            name: '隐藏',
            value: 'hidden'
          }
        ],
        [
          {
            name: '外部',
            value: 'outer'
          },
          {
            name: '内部',
            value: 'inner'
          },
          {
            name: '中心',
            value: 'center'
          },
          {
            name: '隐藏',
            value: 'hidden'
          }
        ]
      ],
      theme: [
        {
          name: '默认',
          value: 'default',
          color: ['#6BAB9C', '#FA9184', '#E16A79', '#5872E0', '#5D759A',
            '#ABB3C7', '#A1C9A5', '#E78964', '#E3D83C', '#FDB3CC',
            '#ABDEE3', '#D1D4FA']
        },
        {
          name: '备选',
          value: 'spare',
          color: ['#2598F1', '#8CCCFE', '#3751FE', '#7C8DFF', '#F56367',
            '#FE5F0B', '#FEE87A', '#089BAB', '#2E9C78', '#6CCD8F',
            '#B5FF92', '#D3E3F0']
        }
      ],
      radarTheme: [
        {
          name: '默认',
          value: 'default',
          color: ['rgb(216,225,243,1)', 'rgb(232,241,252,1)', 'rgb(214,220,240,1)', 'rgb(208,230,250,1)']
        },
        {
          name: '备选',
          value: 'spare',
          color: ['rgba(140,204,254,0.75)', 'rgba(37,152,241,0.75)', 'rgba(55,81,254,0.75)', 'rgba(37,64,248,0.75)']
        }
      ],
      gaugeTheme: [
        {
          name: '默认',
          value: 'default',
          color: [[0.09, '#8CCCFE'], [0.82, '#2598F1'], [1, '#3751FE']]
        },
        {
          name: '备选',
          value: 'spare',
          color: [[0.09, '#5D759A'], [0.82, '#2E9C78'], [1, '#FE5F0B']]
        }
      ],
      title: {
        text: '',
        color: '#5177FB',
        left: [
          {
            name: '居左',
            value: 'left'
          },
          {
            name: '居中',
            value: 'center'
          },
          {
            name: '居右',
            value: 'right'
          }]
      },
      bar: {
        barWidth: 40,
        barBorderRadius: 0
      },
      axis: {
        xAxisName: '',
        yAxisName: '',
        color: '#557DFE'
      },
      pick: {
        pickTheme: 'default',
        pickSplit: 0,
        pickSmooth: 0,
        pickApparent: 0,
        pickLeft: 'left',
        pickX: 'center',
        pickY: 'top',
        pickRadio: '',
        pickOrient: 'horizontal',
        pickPieTips: 'outer',
        pickDoughnutTips: 'outer',
        pickRadius: 55,
        pickRole: '',
        pickLegend: true,
        pickBgColor: '',
        pickRotate: 0,
        pickRadarTheme: 'default',
        pickGaugeTheme: 'default',
        pickRadarLabel: 0,
        pickOpacity: 0,
        pickMin: 0,
        pickMax: 100,
        pickGaugeWidth: 18,
        pickGaugeTick: true,
        pickGaugeLabel: true,
        pickSymbolSize: 20,
        pickLegendColor: '#5177FB'
      },
      text: [
        {
          content: '',
          size: 22,
          color: '#2067C0',
          bgColor: '',
          weight: 'normal',
          display: 'inline',
          spacing: 0,
          fontFamily: 'Microsoft YaHei'
        },
        {
          content: '',
          size: 22,
          color: '#040404',
          bgColor: '',
          weight: 'normal',
          spacing: 0,
          fontFamily: 'Microsoft YaHei',
          percent: false
        }
      ],
      textList: [
        {
          weightList: [
            {
              name: '细体',
              value: 'lighter'
            },
            {
              name: '正常',
              value: 'normal'
            },
            {
              name: '粗体',
              value: 'bold'
            }
          ],
          fontList: [
            {
              name: '宋体',
              value: 'SimSun'
            },
            {
              name: '黑体',
              value: 'SimHei'
            },
            {
              name: '楷体',
              value: 'KaiTi'
            },
            {
              name: '仿宋',
              value: 'FangSong'
            },
            {
              name: '微软雅黑',
              value: 'Microsoft YaHei'
            },
            {
              name: '微软正黑体',
              value: 'Microsoft JhengHei'
            }
          ],
          displayList: [
            {
              name: '行内',
              value: 'inline'
            },
            {
              name: '块级',
              value: 'block'
            }
          ],
          alignList: [
            {
              name: '居中',
              value: 'center'
            },
            {
              name: '居左',
              value: 'left'
            },
            {
              name: '居右',
              value: 'right'
            }
          ]
        },
        {
          weightList: [
            {
              name: '细体',
              value: 'lighter'
            },
            {
              name: '正常',
              value: 'normal'
            },
            {
              name: '粗体',
              value: 'bold'
            }
          ],
          fontList: [
            {
              name: '宋体',
              value: 'SimSun'
            },
            {
              name: '黑体',
              value: 'SimHei'
            },
            {
              name: '楷体',
              value: 'KaiTi'
            },
            {
              name: '仿宋',
              value: 'FangSong'
            },
            {
              name: '微软雅黑',
              value: 'Microsoft YaHei'
            },
            {
              name: '微软正黑体',
              value: 'Microsoft JhengHei'
            }
          ]
        }
      ],
      tableStyle: [
        {
          bgColor: '',
          color: '',
          size: 18,
          weight: 'bold',
          align: 'center',
          lineColor: ''
        },
        {
          oddBgColor: '',
          evenBgColor: '',
          color: '',
          size: 16,
          weight: 'normal',
          align: 'center',
          lineColor: ''
        }
      ]
    }
  },
  computed: {
    // 类别可选项高度变化
    changeHeight() {
      if (this.type === 'pie' || this.type === 'doughnut' || this.type === 'nightingale') {
        return `height: ${this.categoryHeight}px;`
      } else if (this.type === 'gauge') {
        return `height: ${this.indicatorHeight}px;`
      } else if (this.type === 'bar&line') {
        return `height: ${this.xAxisHeight}px;`
      }
      return ``
    },
    changeLabel() {
      let result = `color: ${this.text[0].color}; background-color: ${this.text[0].bgColor}; font-size: ${this.text[0].size}px;
                letter-spacing: ${this.text[0].spacing}px; font-weight: ${this.text[0].weight}; font-family: ${this.text[0].fontFamily};`
      if (this.text[0].display === 'inline') {
        result += `margin-right: ${(Math.round(this.text[0].size / 3))}px;`
      } else if (this.text[0].display === 'block') {
        result += `display:block;`
      }
      return result
    },
    changeValue() {
      return `color: ${this.text[1].color}; background-color: ${this.text[1].bgColor}; font-size: ${this.text[1].size}px;
                letter-spacing: ${this.text[1].spacing}px; font-weight: ${this.text[1].weight}; font-family: ${this.text[1].fontFamily};`
    },
    changeTableHead() {
      return ` background-color: ${this.tableStyle[0].bgColor}; color: ${this.tableStyle[0].color}; font-size: ${this.tableStyle[0].size}px;
               font-weight: ${this.tableStyle[0].weight}; text-align: ${this.tableStyle[0].align}; border-color: ${this.tableStyle[0].lineColor};`
    },
    changeTableBody() {
      return ({row, column, rowIndex, columnIndex}) => {
        let result = `color: ${this.tableStyle[1].color}; font-size: ${this.tableStyle[1].size}px;
                      font-weight: ${this.tableStyle[1].weight}; text-align: ${this.tableStyle[1].align};
                      border-color: ${this.tableStyle[1].lineColor};`
        if (rowIndex % 2 === 0) {
          result += `background-color: ${this.tableStyle[1].oddBgColor};`
        } else {
          result += `background-color: ${this.tableStyle[1].evenBgColor};`
        }
        return result
      }
    }
  },
  mounted() {
    this.resizeHeight()
    // 设置部门下拉框数据
    this.setRoleSelect()
    this.setZdyzjOption()
  },
  methods: {
    // 设置标题
    setTitle() {
      if (this.option && Object.keys(this.option).length) {
        this.option.title.text = this.title.text
        // true为不合并加载
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置X轴
    setXAxis() {
      if (Object.keys(this.option).length) {
        if (this.type === 'line' || this.type === 'bar' || this.type === 'bar&line') {
          this.option.xAxis = {
            name: this.axis.xAxisName,
            data: this.listX.length ? this.listX[0].value : [],
            axisLine: {
              lineStyle: {
                color: this.axis.color
              }
            },
            axisLabel: {
              interval: 0,
              rotate: 0
            }
          }
          // 同时刷新类别
          this.setCategory()
        }
      }
    },
    // 设置指针
    setIndicator() {
      if (Object.keys(this.option).length && this.type === 'radar') {
        if (this.listIndicator.length) {
          this.option.radar.indicator = []
          for (let i = 0, len = this.listIndicator[0].value.length; i < len; i++) {
            this.option.radar.indicator.push({
              name: this.listIndicator[0].value[i],
              max: 100
            })
          }
        } else {
          this.option.radar.indicator = [{}]
        }
        // 同时刷新类别
        this.setCategory()
      } else if (Object.keys(this.option).length && this.type === 'gauge') {
        if (this.listIndicator.length) {
          this.option.series[0].data = [{
            name: this.listIndicator[0].name,
            value: this.listIndicator[0].value[0]
          }]
        } else {
          this.option.series[0].data = []
        }
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置柱体
    setBar() {
      if (Object.keys(this.option).length && this.type === 'bar&line') {
        this.option.series = this.setSeries(this.type)
        this.setApparent()
        // 根据type设置不同的series
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置折线
    setLine() {
      if (Object.keys(this.option).length && this.type === 'bar&line') {
        this.option.series = this.setSeries(this.type)
        this.setApparent()
        // 根据type设置不同的series
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置类别
    setCategory() {
      if (Object.keys(this.option).length) {
        this.option.series = this.setSeries(this.type)
        if (this.type === 'line' || this.type === 'bar&line') {
          this.setApparent()
        }
        // 根据type设置不同的series
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置横坐标
    setAbscissa() {
      if (Object.keys(this.option).length) {
        this.option.series = this.setSeries(this.type)
        // 根据type设置不同的series
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置纵坐标
    setOrdinate() {
      if (Object.keys(this.option).length) {
        this.option.series = this.setSeries(this.type)
        // 根据type设置不同的series
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置文字内容
    setContent() {
      if (this.listContent.length) {
        this.text[0].content = this.listContent[0].name
        this.text[1].content = this.listContent[0].value[0]
      } else {
        this.text[0].content = ''
        this.text[1].content = ''
      }
    },
    // 设置表格内容
    setTableData() {
      // 1.清空
      this.header = []
      this.table = []
      for (let i = 0, len = this.listTable.length; i < len; i++) {
        // 2.添加表头
        this.header.push({
          prop: this.listTable[i].name,
          label: this.listTable[i].name
        })
        // 3.添加表体数据
        for (let j = 0, len = this.listTable[i].value.length; j < len; j++) {
          // 为空创建对象
          if (!this.table[j]) {
            this.table[j] = {}
          }
          // 之后添加属性
          this.table[j][this.listTable[i].name] = this.listTable[i].value[j]
        }
      }
    },
    // 设置图表Series
    setSeries(type) {
      let series = []
      if (this.type === 'line' || this.type === 'bar' || this.type === 'rader') {
        for (let i = 0, len = this.listCategory.length; i < len; i++) {
          series.push({
            name: this.listCategory[i].name,
            type: type,
            data: this.listCategory[i].value
          })
          if (this.type === 'line') {
            series[i]['smooth'] = this.pick.pickSmooth
          } else if (this.type === 'bar') {
            series[i]['barMaxWidth'] = this.bar.barWidth
            series[i]['itemStyle'] = {normal: {barBorderRadius: this.bar.barBorderRadius}}
          }
        }
      } else if (this.type === 'pie' || this.type === 'doughnut' || this.type === 'nightingale') {
        const data = []
        for (let i = 0, len = this.listCategory.length; i < len; i++) {
          data.push({
            name: this.listCategory[i].name,
            value: this.listCategory.length && this.listCategory[i].value.length === 1 ? this.listCategory[i].value[0] : ''
          })
        }
        series = [{
          name: '',
          type: 'pie',
          data: data,
          label: {
            normal: {
              show: true,
              position: ''
            }
          }
        }]
        if (this.type === 'doughnut') {
          series[0]['radius'] = [this.pick.pickRadius + '%', '75%']
          series[0]['label']['emphasis'] = {show: false, position: ''}
        } else if (this.type === 'nightingale') {
          series[0]['roseType'] = 'radius'
        }
      } else if (this.type === 'radar') {
        if (this.listIndicator.length) {
          series.push({
            name: 'radar',
            type: type,
            data: [],
            areaStyle: {
              opacity: this.pick.pickOpacity ? 0.25 : 0
            },
            label: {
              show: this.pick.pickRadarLabel
            }
          })
          for (let i = 0, len = this.listCategory.length; i < len; i++) {
            series[0]['data'].push({
              name: this.listCategory[i].name,
              value: this.listCategory[i].value
            })
          }
        }
      } else if (this.type === 'gauge') {
        // 获取配色
        let color
        for (const item of this.gaugeTheme) {
          if (item.value === this.pick.pickGaugeTheme) {
            color = item.color
          }
        }
        // 定义
        series = [{
          type: type,
          data: [],
          min: this.pick.pickMin,
          max: this.pick.pickMax,
          axisLine: {
            lineStyle: {
              color: color,
              width: this.pick.pickGaugeWidth
            }
          },
          axisTick: {
            show: this.pick.pickGaugeTick
          },
          axisLabel: {
            show: this.pick.pickGaugeLabel
          },
          title: {
            textStyle: {
              color: '#5177FB'
            }
          }
        }]
      } else if (this.type === 'bar&line') {
        for (let i = 0, len = this.listBar.length; i < len; i++) {
          series.push({
            name: this.listBar[i].name,
            type: 'bar',
            yAxisIndex: 0,
            data: this.listBar[i].value,
            barMaxWidth: this.bar.barWidth,
            itemStyle: {
              normal: {
                barBorderRadius: this.bar.barBorderRadius
              }
            }
          })
        }
        for (let i = 0, len = this.listLine.length; i < len; i++) {
          series.push({
            name: this.listLine[i].name,
            type: 'line',
            yAxisIndex: 1,
            data: this.listLine[i].value,
            smooth: this.pick.pickSmooth
          })
        }
      } else if (this.type === 'scatter') {
        series.push({
          symbolSize: this.pick.pickSymbolSize,
          type: type,
          data: []
        })
        if (this.listAbscissa.length && this.listOrdinate.length) {
          // 初始化
          const count = this.listAbscissa[0].value.length > this.listOrdinate[0].value.length
            ? this.listAbscissa[0].value.length : this.listOrdinate[0].value.length
          for (let i = 0; i < count; i++) {
            series[0].data.push([0, 0])
          }
          // 添加横坐标
          for (let i = 0, len = this.listAbscissa[0].value.length; i < len; i++) {
            series[0].data[i][0] = this.listAbscissa[0].value[i]
          }
          // 添加纵坐标
          for (let i = 0, len = this.listOrdinate[0].value.length; i < len; i++) {
            series[0].data[i][1] = this.listOrdinate[0].value[i]
          }
        }
      }
      return series
    },
    // 设置Slider单位
    setSliderFormat(e) {
      return e + '%'
    },
    // 设置图表主题
    setTheme() {
      if (Object.keys(this.option).length) {
        for (let i = 0; i < this.theme.length; i++) {
          if (this.theme[i].value === this.pick.pickTheme) {
            this.option.color = this.theme[i].color
            this.$echartsSetOption('transChart', this.option, false, true)
            return
          }
        }
      }
    },
    // 设置雷达图主题
    setRadarTheme() {
      if (Object.keys(this.option).length) {
        for (let i = 0; i < this.radarTheme.length; i++) {
          if (this.radarTheme[i].value === this.pick.pickRadarTheme) {
            this.option.radar.splitArea.areaStyle.color = this.radarTheme[i].color
            this.$echartsSetOption('transChart', this.option, false, true)
            return
          }
        }
      }
    },
    // 设置仪表盘主题
    setGaugeTheme() {
      if (Object.keys(this.option).length) {
        for (let i = 0; i < this.gaugeTheme.length; i++) {
          if (this.gaugeTheme[i].value === this.pick.pickGaugeTheme) {
            this.option.series[0].axisLine.lineStyle.color = this.gaugeTheme[i].color
            this.$echartsSetOption('transChart', this.option, false, true)
            return
          }
        }
      }
    },
    // 设置背景颜色
    setBgColor() {
      if (Object.keys(this.option).length) {
        this.option.backgroundColor = this.pick.pickBgColor
        if (this.type === 'bar' || this.type === 'line') {
          this.option.yAxis[0].splitArea.areaStyle.color[1] = this.pick.pickBgColor
        }
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置网格显示
    setSplit() {
      if (Object.keys(this.option).length) {
        this.option.yAxis[0].splitArea.show = this.pick.pickSplit
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置文字倾斜
    setRotate() {
      if (Object.keys(this.option).length) {
        this.option.xAxis.axisLabel.rotate = this.pick.pickRotate
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置标题颜色
    setTitleColor() {
      if (Object.keys(this.option).length) {
        this.option.title.textStyle.color = this.title.color
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置标题位置
    setTitleLeft() {
      if (Object.keys(this.option).length) {
        this.option.title.left = this.pick.pickLeft
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置图例显示
    setLegendShow() {
      if (Object.keys(this.option).length) {
        this.option.legend.show = this.pick.pickLegend
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置图例横向位置
    setLegendX() {
      if (Object.keys(this.option).length) {
        this.option.legend.x = this.pick.pickX
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置图例纵向位置
    setLegendY() {
      if (Object.keys(this.option).length) {
        this.option.legend.y = this.pick.pickY
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置图例布局朝向
    setLegendOrient() {
      if (Object.keys(this.option).length) {
        this.option.legend.orient = this.pick.pickOrient
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置饼图标签信息
    setPieTips() {
      if (Object.keys(this.option).length) {
        if (this.pick.pickPieTips === 'hidden') {
          this.option.series[0].label.normal.show = false
        } else {
          this.option.series[0].label.normal.show = true
          this.option.series[0].label.normal.position = this.pick.pickPieTips
        }
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置环形图标签信息
    setDoughnutTips() {
      if (Object.keys(this.option).length) {
        if (this.pick.pickDoughnutTips === 'hidden') {
          this.option.series[0].label.normal.show = false
          this.option.series[0].label.emphasis.show = false
        } else if (this.pick.pickDoughnutTips === 'center') {
          this.option.series[0].label.normal.show = false
          this.option.series[0].label.emphasis.show = true
          this.option.series[0].label.normal.position = ''
          this.option.series[0].label.emphasis.position = this.pick.pickDoughnutTips
        } else {
          this.option.series[0].label.normal.show = true
          this.option.series[0].label.emphasis.show = false
          this.option.series[0].label.normal.position = this.pick.pickDoughnutTips
        }
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置柱体宽度
    setBarWidth() {
      if (Object.keys(this.option).length && this.option.series.length) {
        for (let i = 0; i < this.option.series.length; i++) {
          if (this.option.series[i].type === 'bar') {
            this.option.series[i].barMaxWidth = this.bar.barWidth
          }
        }
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置柱体圆角
    setBarBorderRadius() {
      if (Object.keys(this.option).length && this.option.series.length) {
        for (let i = 0; i < this.option.series.length; i++) {
          if (this.option.series[i].type === 'bar') {
            this.option.series[i].itemStyle.normal.barBorderRadius = this.bar.barBorderRadius
          }
        }
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置环形图半径大小
    setRadius() {
      if (Object.keys(this.option).length) {
        this.option.series[0].radius[0] = this.pick.pickRadius + '%'
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置X轴名称
    setXAxisName() {
      if (Object.keys(this.option).length) {
        this.option.xAxis.name = this.axis.xAxisName
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置Y轴名称
    setYAxisName() {
      if (Object.keys(this.option).length) {
        this.option.yAxis[0].name = this.axis.yAxisName
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置轴线颜色
    setAxisColor() {
      if (Object.keys(this.option).length) {
        this.option.xAxis.axisLine.lineStyle.color = this.axis.color
        this.option.yAxis[0].axisLine.lineStyle.color = this.axis.color
        if (this.type === 'bar&line') {
          this.option.yAxis[1].axisLine.lineStyle.color = this.axis.color
        }
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置图例字体颜色
    setLegendColor() {
      if (Object.keys(this.option).length) {
        this.option.legend.textStyle.color = this.pick.pickLegendColor
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置折线图平滑曲线
    setSmooth() {
      if (Object.keys(this.option).length && this.option.series.length) {
        for (let i = 0; i < this.option.series.length; i++) {
          if (this.option.series[i].type === 'line') {
            this.option.series[i].smooth = this.pick.pickSmooth
          }
        }
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置折线图面积堆积
    setApparent() {
      if (Object.keys(this.option).length && this.option.series.length) {
        for (let i = 0; i < this.option.series.length; i++) {
          if (!this.pick.pickApparent) {
            delete (this.option.series[i]['areaStyle'])
          } else {
            if (this.option.series[i].type === 'line') {
              this.option.series[i]['areaStyle'] = {
                normal: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                      offset: 0,
                      color: 'rgba(0, 136, 212, 0.6)'
                    }, {
                      offset: 0.6,
                      color: 'rgba(0, 136, 212, 0.4)'
                    }, {
                      offset: 1,
                      color: 'rgba(0, 136, 212, 0.2)'
                    }],
                    globalCoord: false
                  },
                  shadowColor: 'rgba(0, 0, 0, 0.1)',
                  shadowBlur: 10
                }
              }
            }
          }
        }
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置雷达图数值显示
    setRadarLabel() {
      if (Object.keys(this.option).length) {
        this.option.series[0].label.show = this.pick.pickRadarLabel
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置雷达图区域面积
    setOpacity() {
      if (Object.keys(this.option).length) {
        if (this.pick.pickOpacity) {
          this.option.series[0].areaStyle.opacity = 0.25
        } else {
          this.option.series[0].areaStyle.opacity = 0
        }
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置仪表盘最小值
    setGaugeMin() {
      if (Object.keys(this.option).length) {
        this.option.series[0].min = this.pick.pickMin
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置仪表盘最大值
    setGaugeMax() {
      if (Object.keys(this.option).length) {
        this.option.series[0].max = this.pick.pickMax
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置仪表盘半径
    setGaugeWidth() {
      if (Object.keys(this.option).length) {
        this.option.series[0].axisLine.lineStyle.width = this.pick.pickGaugeWidth
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置仪表盘刻度线显示
    setGaugeTick() {
      if (Object.keys(this.option).length) {
        this.option.series[0].axisTick.show = this.pick.pickGaugeTick
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置仪表盘刻度值显示
    setGaugeLabel() {
      if (Object.keys(this.option).length) {
        this.option.series[0].axisLabel.show = this.pick.pickGaugeLabel
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    // 设置气泡大小
    setSymbolSize() {
      if (Object.keys(this.option).length) {
        this.option.series[0].symbolSize = this.pick.pickSymbolSize
        this.$echartsSetOption('transChart', this.option, false, true)
      }
    },
    addXItem() {
      if (this.listX.length > 1) {
        this.listOptional.push(this.listX.pop())
        this.$alertWarning('请检查X轴可选项！')
      }
    },
    addAbscissaItem() {
      if (this.listAbscissa.length > 1) {
        this.listOptional.push(this.listAbscissa.pop())
        this.$alertWarning('请检查横坐标可选项！')
      }
    },
    addOrdinateItem() {
      if (this.listOrdinate.length > 1) {
        this.listOptional.push(this.listOrdinate.pop())
        this.$alertWarning('请检查纵坐标可选项！')
      }
    },
    addIndicator() {
      if (this.listIndicator.length > 1) {
        this.listOptional.push(this.listIndicator.pop())
        this.$alertWarning('请检查指针可选项！')
      }
    },
    addContent() {
      if (this.listContent.length > 1) {
        this.listOptional.push(this.listContent.pop())
        this.$alertWarning('请检查内容可选项！')
      }
    },
    setPercent() {
      if (parseInt(this.text[1].content) !== parseFloat(this.text[1].content)) {
        if (this.text[1].percent) {
          this.text[1].content = (this.text[1].content * 100).toFixed(2) + '%'
        } else {
          this.text[1].content = (this.text[1].content.replace('%', '') / 100).toFixed(4)
        }
      } else {
        this.$alertWarning('整数无需进行转换！')
        this.text[1].percent = 'false'
      }
    },
    getListName(list) {
      const nameList = []
      for (let i = 0, len = list.length; i < len; i++) {
        nameList.push(list[i].name)
      }
      return nameList
    },
    // 类别自适应窗口大小
    resizeHeight() {
      window.onresize = () => {
        return (() => {
          if (this.$refs['optionalDiv']) {
            this.categoryHeight = this.$refs['optionalDiv'].offsetHeight
            this.indicatorHeight = this.$refs['optionalDiv'].offsetHeight
            this.xAxisHeight = this.$refs['optionalDiv'].offsetHeight / 5
          }
        })()
      }
    },
    saveOption() {
      let option
      if (this.type === 'bar' || this.type === 'line' || this.type === 'bar&line') {
        option = JSON.parse(JSON.stringify(this.option))
        option.xAxis.data = []
        for (let i = 0, len = option.series.length; i < len; i++) {
          option.series[i].data = []
        }
      } else if (this.type === 'pie' || this.type === 'doughnut' || this.type === 'nightingale') {
        option = JSON.parse(JSON.stringify(this.option))
        for (let i = 0, len = option.series[0].data.length; i < len; i++) {
          option.series[0].data[i].value = ''
        }
      } else if (this.type === 'text') {
        option = JSON.parse(JSON.stringify(this.text))
        option[1].content = ''
      } else if (this.type === 'table') {
        option = JSON.parse(JSON.stringify(this.tableStyle))
      } else if (this.type === 'radar') {
        option = JSON.parse(JSON.stringify(this.option))
        option.radar.indicator = []
        for (let i = 0, len = option.series[0].data.length; i < len; i++) {
          option.series[0].data[i].value = []
        }
      } else if (this.type === 'gauge') {
        option = JSON.parse(JSON.stringify(this.option))
        option.series[0].data[0].value = ''
      } else if (this.type === 'scatter') {
        option = JSON.parse(JSON.stringify(this.option))
        option.series[0].data = []
      } else if (this.type === 'src') {
        option = ''
      }
      return JSON.stringify(option)
    },
    getOptionsBackUp() {
      const optionsBackup = {
        pkid: this.pkid,
        option: this.option,
        type: this.type,
        typeName: this.typeName,
        listCategory: this.listCategory,
        listX: this.listX,
        listOptional: this.listOptional,
        bar: this.bar,
        title: this.title,
        axis: this.axis,
        pick: this.pick,
        dataSource: this.dataSource
      }
      if (this.type === 'table') {
        optionsBackup['listTable'] = this.listTable
        optionsBackup['header'] = this.header
        optionsBackup['table'] = this.table
        optionsBackup['tableStyle'] = this.tableStyle
      } else if (this.type === 'text') {
        optionsBackup['listContent'] = this.listContent
        optionsBackup['text'] = this.text
      } else if (this.type === 'radar' || this.type === 'gauge') {
        optionsBackup['listIndicator'] = this.listIndicator
      } else if (this.type === 'bar&line') {
        optionsBackup['listBar'] = this.listBar
        optionsBackup['listLine'] = this.listLine
      } else if (this.type === 'scatter') {
        optionsBackup['listAbscissa'] = this.listAbscissa
        optionsBackup['listOrdinate'] = this.listOrdinate
      }
      return optionsBackup
    },
    // 设置 下拉框
    setZdyzjOption() {
      const allOpt = this.$getCode('ZDYZJ')
      // const options = []
      for (const it in allOpt) {
        this.zdyzjOption.push({value: it, name: allOpt[it]})
      }
    }
  }
}
