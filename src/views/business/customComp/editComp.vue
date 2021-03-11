<template>
  <div class="editComp">
    <div class="showDiv clickDiv">
      <div class="option">
        <div class="option-select">
          <el-select v-show="role.roleSelect.length > 1" ref="roleSelect" v-model="role.pickRole" placeholder="请选择"
                     size="small" class="thnSelect" @change="setThnItems">
            <el-option v-for="item in role.roleSelect" :key="item.value" :label="item.content" :value="item.value"/>
          </el-select>
          <el-select v-model="subject.pickSubject" placeholder="请选择" size="small" class="thnSelect" @change="setThnItems">
            <el-option v-for="item in subject.subjectSelect" :key="item.value" :label="item.name" :value="item.value"/>
          </el-select>
        </div>
        <div v-loading="loading" :element-loading-background="systemColor.loadingColor" class="option-item">
          <div v-for="item in items" :id="item.name" :key="item.name" class="createItem"
               :style="changeItemHeight(item.chart_code)"
               @click="createChart(item.title, item.chart_code, item.data_source, item.options_backup, item.pkid)">
            <div class="thuTitle" :data-content="item.title" :style="changeBgImage(item.image)"/>
          </div>
        </div>
      </div>
    </div>
    <div class="showDiv chartDiv">
      <div class="chartDivBor">
        <dw-save-screen dw-key="transChartDiv" show="true" class="save-screen">
        <div v-if="type === 'text'" class="transText">
          <div>
            <label :style="changeLabel">{{ text[0].content }}</label>
            <a :style="changeValue">{{ text[1].content }}</a>
          </div>
        </div>
        <div v-else-if="type === 'table'" class="transTable">
          <el-table :key="Math.random()" :data="table" border :cell-style="changeTableBody"
                    :header-cell-style="changeTableHead">
            <el-table-column v-for="item in header" :key="item.prop" :prop="item.prop" :label="item.label"/>
          </el-table>
        </div>
        <div v-else-if="type === 'src'" class="transTable">
          <component :is="zdyzjmc" v-if="zdyzjmc" :id="defaultId"/>
        </div>
        <div v-else-if="type === ''"/>
        <dw-echarts v-else dw-key="transChart" class="transChart"/>
      </dw-save-screen>
      </div>
    </div>
    <div class="showDiv editDiv">
      <el-tabs v-model="activeName" :before-leave="beforeLeave" @tab-click="setHeight">
        <el-tab-pane label="数据绑定" name="first">
          <div class="dataBinding">
            <div class="inputDiv">
              <label v-show="type !== 'text' && type !== 'table'" class="editLabel">标题：</label>
              <el-input v-show="type !== 'text' && type !== 'table'" v-model="title.text" size="small"
                        placeholder="请输入标题" @input="setTitle" />
              <label id="data" class="editLabel">数据源：</label>
              <el-cascader v-if="type !== 'src'" ref="dataSource" :key="cascaderKey" v-model="dataSource.value" :options="dataSource.options"
                           :props="{ expandTrigger: 'hover' }" placeholder="请选择数据源" size="small" @change="changeOption"/>
              <el-select v-if="type === 'src'" v-model="zdyzjmc" class="el-input" placeholder="请选择组件" size="small">
                <el-option v-for="item in zdyzjOption" :key="item.name" :label="item.name" :value="item.value"/>
              </el-select>
            </div>
            <div v-if="type !== 'src'" class="dragDiv">
              <div class="bigDiv">
                <p class="editP optionalP">可选项</p>
                <div ref="optionalDiv" class="optionalDiv">
                  <draggable class="list-group" :list="listOptional" group="optional">
                    <div v-for="element in listOptional" :key="element.name" class="list-group-item">
                      {{ element.name }}
                    </div>
                  </draggable>
                </div>
              </div>
              <div v-show="type !== 'text' && type !== 'table'" class="bigDiv">
                <div v-show="type !== 'gauge' && type !== 'bar&line' && type !== 'scatter'" class="smallDiv">
                  <p class="editP topP">系列</p>
                  <div class="sameDiv" :style="changeHeight">
                    <draggable class="list-group" :list="listCategory" group="optional" @change="setCategory">
                      <div v-for="element in listCategory" :key="element.name" class="list-group-item">
                        {{ element.name }}
                      </div>
                    </draggable>
                  </div>
                </div>
                <div v-show="type === 'bar&line'">
                  <div class="smallDiv lesserDiv">
                    <p class="editP topP">柱体</p>
                    <div class="sameDiv mixedDiv">
                      <draggable class="list-group" :list="listBar" group="optional" @change="setBar">
                        <div v-for="element in listBar" :key="element.name" class="list-group-item">
                          {{ element.name }}
                        </div>
                      </draggable>
                    </div>
                  </div>
                  <div class="smallDiv lesserDiv">
                    <p class="editP middleP">折线</p>
                    <div class="sameDiv mixedDiv">
                      <draggable class="list-group" :list="listLine" group="optional" @change="setLine">
                        <div v-for="element in listLine" :key="element.name" class="list-group-item">
                          {{ element.name }}
                        </div>
                      </draggable>
                    </div>
                  </div>
                </div>
                <div v-show="!type || (type === 'bar' || type === 'line' || type === 'bar&line')" class="smallDiv">
                  <p class="editP middleP">X轴</p>
                  <div class="sameDiv" :style="changeHeight">
                    <draggable class="list-group" :list="listX" group="optional" @change="setXAxis" @add="addXItem">
                      <div v-for="element in listX" :key="element.name" class="list-group-item">
                        {{ element.name }}
                      </div>
                    </draggable>
                  </div>
                </div>
                <div v-show="type === 'radar' || type === 'gauge'" class="smallDiv">
                  <p v-show="type === 'gauge'" class="editP topP">指针</p>
                  <p v-show="type === 'radar'" class="editP middleP">指针</p>
                  <div class="sameDiv" :style="changeHeight">
                    <draggable class="list-group" :list="listIndicator" group="optional" @change="setIndicator"
                               @add="addIndicator">
                      <div v-for="element in listIndicator" :key="element.name" class="list-group-item">
                        {{ element.name }}
                      </div>
                    </draggable>
                  </div>
                </div>
                <div v-show="type === 'scatter'">
                  <div class="smallDiv">
                    <p class="editP topP">横坐标</p>
                    <div class="sameDiv">
                      <draggable class="list-group" :list="listAbscissa" group="optional" @change="setAbscissa"
                                 @add="addAbscissaItem">
                        <div v-for="element in listAbscissa" :key="element.name" class="list-group-item">
                          {{ element.name }}
                        </div>
                      </draggable>
                    </div>
                  </div>
                  <div class="smallDiv">
                    <p class="editP middleP">纵坐标</p>
                    <div class="sameDiv">
                      <draggable class="list-group" :list="listOrdinate" group="optional" @change="setOrdinate"
                                 @add="addOrdinateItem">
                        <div v-for="element in listOrdinate" :key="element.name" class="list-group-item">
                          {{ element.name }}
                        </div>
                      </draggable>
                    </div>
                  </div>
                </div>
              </div>
              <div v-show="type === 'text'" class="bigDiv">
                <p class="editP topP">内容</p>
                <div ref="contentDiv" class="contentDiv">
                  <draggable class="list-group" :list="listContent" group="optional" @change="setContent"
                             @add="addContent">
                    <div v-for="element in listContent" :key="element.name" class="list-group-item">
                      {{ element.name }}
                    </div>
                  </draggable>
                </div>
              </div>
              <div v-show="type === 'table'" class="bigDiv">
                <p class="editP topP">数据</p>
                <div class="contentDiv">
                  <draggable class="list-group" :list="listTable" group="optional" @change="setTableData">
                    <div v-for="element in listTable" :key="element.name" class="list-group-item">
                      {{ element.name }}
                    </div>
                  </draggable>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane v-if="type !== 'src'" label="样式绑定" name="second">
          <div v-show="type !== 'text' && type !== 'table'" class="styleBindingChart">
            <div class="backgroundDiv">
              <p class="editP styleP">背景样式</p>
              <label class="editLabel styleLabel">颜色：</label>
              <el-color-picker v-model="pick.pickBgColor" show-alpha @change="setBgColor"/>
              <label class="editLabel">主题：</label>
              <el-select v-show="type !== 'gauge'" v-model="pick.pickTheme" class="styleBox" placeholder="请选择"
                         size="small" @change="setTheme">
                <el-option v-for="item in theme" :key="item.name" :label="item.name" :value="item.value"/>
              </el-select>
              <el-select v-show="type === 'gauge'" v-model="pick.pickGaugeTheme" class="styleBox" placeholder="请选择"
                         size="small"
                         @change="setGaugeTheme">
                <el-option v-for="item in gaugeTheme" :key="item.name" :label="item.name" :value="item.value"/>
              </el-select>
            </div>
            <div class="titleDiv">
              <p class="editP styleP">标题样式</p>
              <label class="editLabel styleLabel">颜色：</label>
              <el-color-picker v-model="title.color" show-alpha @change="setTitleColor"/>
              <label class="editLabel styleLabel">位置：</label>
              <el-select v-model="pick.pickLeft" class="styleBox" placeholder="请选择" size="small"
                         @change="setTitleLeft">
                <el-option v-for="item in title.left" :key="item.name" :label="item.name" :value="item.value"/>
              </el-select>
            </div>
            <div v-show="type !== 'gauge' && type !== 'scatter'" class="legendDiv">
              <p class="editP styleP">图例样式</p>
              <label class="editLabel styleLabel">显示：</label>
              <el-switch v-model="pick.pickLegend" :active-color="systemColor.activeColor"
                         :inactive-color="systemColor.inactiveColor" @change="setLegendShow"/>
              <label class="editLabel styleLabel">字体颜色：</label>
              <el-color-picker v-model="pick.pickLegendColor" show-alpha @change="setLegendColor"/>
              <label class="editLabel styleLabel">横向位置：</label>
              <el-select v-model="pick.pickX" class="styleBox" placeholder="请选择" size="small" @change="setLegendX">
                <el-option v-for="item in legend.x" :key="item.name" :label="item.name" :value="item.value"/>
              </el-select>
              <label class="editLabel styleLabel">纵向位置：</label>
              <el-select v-model="pick.pickY" class="styleBox" placeholder="请选择" size="small" @change="setLegendY">
                <el-option v-for="item in legend.y" :key="item.name" :label="item.name" :value="item.value"/>
              </el-select>
              <label class="editLabel styleLabel">布局朝向：</label>
              <el-select v-model="pick.pickOrient" class="styleBox" placeholder="请选择" size="small"
                         @change="setLegendOrient">
                <el-option v-for="item in legend.orient" :key="item.name" :label="item.name" :value="item.value"/>
              </el-select>
            </div>
            <div v-show="type === 'bar' || type === 'line' || type === 'bar&line' || type === 'scatter'"
                 class="axisDiv">
              <p class="editP styleP">轴线样式</p>
              <label class="editLabel">X轴名称：</label>
              <el-input v-model="axis.xAxisName" class="styleBox" placeholder="请输入名称" size="small"
                        @input="setXAxisName"/>
              <label class="editLabel">Y轴名称：</label>
              <el-input v-model="axis.yAxisName" class="styleBox" placeholder="请输入名称" size="small"
                        @input="setYAxisName"/>
              <label class="editLabel">轴线颜色：</label>
              <el-color-picker v-model="axis.color" show-alpha @change="setAxisColor"/>
              <label class="editLabel">网格显示：</label>
              <el-switch v-model="pick.pickSplit" :active-color="systemColor.activeColor"
                         :inactive-color="systemColor.inactiveColor" @change="setSplit"/>
              <label class="editLabel">文字倾斜：</label>
              <el-slider v-model="pick.pickRotate" :min="-90" :max="90" @change="setRotate"/>
            </div>
            <div class="featureDiv">
              <p class="editP styleP"> {{ typeName }}样式</p>
              <div v-show="type === 'bar' || type === 'bar&line'">
                <label class="editLabel">柱体宽度：</label>
                <el-slider v-model="bar.barWidth" :min="0" :max="100" @change="setBarWidth"/>
                <label class="editLabel">柱体圆角：</label>
                <el-slider v-model="bar.barBorderRadius" :min="0" :max="25"
                           @change="setBarBorderRadius"/>
              </div>
              <div v-show="type === 'line' || type === 'bar&line'">
                <label class="editLabel">面积堆积：</label>
                <el-switch v-model="pick.pickApparent" :active-color="systemColor.activeColor"
                           :inactive-color="systemColor.inactiveColor" @change="setApparent"/>
                <label class="editLabel">平滑曲线：</label>
                <el-switch v-model="pick.pickSmooth" :active-color="systemColor.activeColor"
                           :inactive-color="systemColor.inactiveColor" @change="setSmooth"/>
              </div>
              <div v-show="type === 'pie' || type === 'nightingale'">
                <label class="editLabel">标签位置：</label>
                <el-select v-model="pick.pickPieTips" class="styleBox" placeholder="请选择" size="small"
                           @change="setPieTips">
                  <el-option v-for="item in tips[0]" :key="item.name" :label="item.name" :value="item.value"/>
                </el-select>
              </div>
              <div v-show="type === 'doughnut'">
                <label class="editLabel">标签位置：</label>
                <el-select v-model="pick.pickDoughnutTips" class="styleBox" size="small"
                           placeholder="请选择" @change="setDoughnutTips">
                  <el-option v-for="item in tips[1]" :key="item.name" :label="item.name" :value="item.value"/>
                </el-select>
                <label class="editLabel">半径大小：</label>
                <el-slider v-model="pick.pickRadius" :format-tooltip="setSliderFormat"
                           :min="0" :max="75" @change="setRadius"/>
              </div>
              <div v-show="type === 'radar'">
                <label class="editLabel">背景配色：</label>
                <el-select v-model="pick.pickRadarTheme" class="styleBox" placeholder="请选择" size="small"
                           @change="setRadarTheme">
                  <el-option v-for="item in radarTheme" :key="item.name" :label="item.name" :value="item.value"/>
                </el-select>
                <label class="editLabel">数值显示：</label>
                <el-switch v-model="pick.pickRadarLabel" :active-color="systemColor.activeColor"
                           :inactive-color="systemColor.inactiveColor" @change="setRadarLabel"/>
                <label class="editLabel">区域面积：</label>
                <el-switch v-model="pick.pickOpacity" :active-color="systemColor.activeColor"
                           :inactive-color="systemColor.inactiveColor" @change="setOpacity"/>
              </div>
              <div v-show="type === 'gauge'">
                <label class="editLabel styleLabel">最小值：</label>
                <el-input-number v-model="pick.pickMin" controls-position="right" size="small" @change="setGaugeMin"/>
                <label class="editLabel styleLabel">最大值：</label>
                <el-input-number v-model="pick.pickMax" controls-position="right" size="small" @change="setGaugeMax"/>
                <label class="editLabel">半径大小：</label>
                <el-slider v-model="pick.pickGaugeWidth" @change="setGaugeWidth"/>
                <label class="editLabel styleLabel">刻度线：</label>
                <el-switch v-model="pick.pickGaugeTick" :active-color="systemColor.activeColor"
                           :inactive-color="systemColor.inactiveColor" @change="setGaugeTick"/>
                <label class="editLabel styleLabel">刻度值：</label>
                <el-switch v-model="pick.pickGaugeLabel" :active-color="systemColor.activeColor"
                           :inactive-color="systemColor.inactiveColor" @change="setGaugeLabel"/>
              </div>
              <div v-show="type === 'scatter'">
                <label class="editLabel">气泡大小：</label>
                <el-slider v-model="pick.pickSymbolSize" @change="setSymbolSize"/>
              </div>
            </div>
          </div>
          <div v-show="type === 'text'" class="styleBindingText">
            <div class="textDiv">
              <p class="editP styleP">标签样式</p>
              <label class="editLabel styleLabel">字体类型：</label>
              <el-select v-model="text[0].fontFamily" class="styleBox" placeholder="请选择" size="small">
                <el-option v-for="item in textList[0].fontList" :key="item.name" :label="item.name"
                           :value="item.value"/>
              </el-select>
              <label class="editLabel styleLabel">字体大小：</label>
              <el-input-number v-model="text[0].size" controls-position="right" :min="1" :max="100" size="small"/>
              <label class="editLabel styleLabel">字体颜色：</label>
              <el-color-picker v-model="text[0].color" show-alpha/>
              <label class="editLabel styleLabel">字体间距：</label>
              <el-input-number v-model="text[0].spacing" controls-position="right" :min="0" :max="100" size="small"/>
              <label class="editLabel styleLabel">背景颜色：</label>
              <el-color-picker v-model="text[0].bgColor" show-alpha/>
              <label class="editLabel styleLabel">文字粗细：</label>
              <el-select v-model="text[0].weight" class="styleBox" placeholder="请选择" size="small">
                <el-option v-for="item in textList[0].weightList" :key="item.name" :label="item.name"
                           :value="item.value"/>
              </el-select>
              <label class="editLabel styleLabel">对齐方式：</label>
              <el-select v-model="text[0].display" class="styleBox" placeholder="请选择" size="small">
                <el-option v-for="item in textList[0].displayList" :key="item.name" :label="item.name"
                           :value="item.value"/>
              </el-select>
            </div>
            <div class="textDiv">
              <p class="editP styleP">文本样式</p>
              <label class="editLabel styleLabel">字体类型：</label>
              <el-select v-model="text[1].fontFamily" class="styleBox" placeholder="请选择" size="small">
                <el-option v-for="item in textList[1].fontList" :key="item.name" :label="item.name"
                           :value="item.value"/>
              </el-select>
              <label class="editLabel styleLabel">字体大小：</label>
              <el-input-number v-model="text[1].size" controls-position="right" :min="1" :max="100" size="small"/>
              <label class="editLabel styleLabel">字体颜色：</label>
              <el-color-picker v-model="text[1].color" show-alpha/>
              <label class="editLabel styleLabel">字体间距：</label>
              <el-input-number v-model="text[1].spacing" controls-position="right" :min="0" :max="100" size="small"/>
              <label class="editLabel styleLabel">背景颜色：</label>
              <el-color-picker v-model="text[1].bgColor" show-alpha/>
              <label class="editLabel styleLabel">文字粗细：</label>
              <el-select v-model="text[1].weight" class="styleBox" placeholder="请选择" size="small">
                <el-option v-for="item in textList[1].weightList" :key="item.name" :label="item.name"
                           :value="item.value"/>
              </el-select>
              <label class="editLabel styleLabel">百分比：</label>
              <el-switch v-model="text[1].percent" :active-color="systemColor.activeColor"
                         :inactive-color="systemColor.inactiveColor" @change="setPercent"/>
            </div>
          </div>
          <div v-show="type === 'table'" class="styleBindingTable">
            <div class="tableDiv">
              <p class="editP styleP">表头样式</p>
              <label class="editLabel styleLabel">字体大小：</label>
              <el-input-number v-model="tableStyle[0].size" controls-position="right" :min="1" :max="100" size="small"/>
              <label class="editLabel styleLabel">字体颜色：</label>
              <el-color-picker v-model="tableStyle[0].color" show-alpha/>
              <label class="editLabel styleLabel">文字粗细：</label>
              <el-select v-model="tableStyle[0].weight" class="styleBox" placeholder="请选择" size="small">
                <el-option v-for="item in textList[0].weightList" :key="item.name" :label="item.name"
                           :value="item.value"/>
              </el-select>
              <label class="editLabel styleLabel">对齐方式：</label>
              <el-select v-model="tableStyle[0].align" class="styleBox" placeholder="请选择" size="small">
                <el-option v-for="item in textList[0].alignList" :key="item.name" :label="item.name"
                           :value="item.value"/>
              </el-select>
              <label class="editLabel styleLabel">表头颜色：</label>
              <el-color-picker v-model="tableStyle[0].bgColor" show-alpha/>
              <label class="editLabel styleLabel">格线颜色：</label>
              <el-color-picker v-model="tableStyle[0].lineColor" show-alpha/>
            </div>
            <div class="tableDiv">
              <p class="editP styleP">表格样式</p>
              <label class="editLabel styleLabel">字体大小：</label>
              <el-input-number v-model="tableStyle[1].size" controls-position="right" :min="1" :max="100" size="small"/>
              <label class="editLabel styleLabel">字体颜色：</label>
              <el-color-picker v-model="tableStyle[1].color" show-alpha/>
              <label class="editLabel styleLabel">文字粗细：</label>
              <el-select v-model="tableStyle[1].weight" class="styleBox" placeholder="请选择" size="small">
                <el-option v-for="item in textList[0].weightList" :key="item.name" :label="item.name"
                           :value="item.value"/>
              </el-select>
              <label class="editLabel styleLabel">对齐方式：</label>
              <el-select v-model="tableStyle[1].align" class="styleBox" placeholder="请选择" size="small">
                <el-option v-for="item in textList[0].alignList" :key="item.name" :label="item.name"
                           :value="item.value"/>
              </el-select>
              <label class="editLabel styleLabel">奇行颜色：</label>
              <el-color-picker v-model="tableStyle[1].oddBgColor" show-alpha/>
              <label class="editLabel styleLabel">偶行颜色：</label>
              <el-color-picker v-model="tableStyle[1].evenBgColor" show-alpha/>
              <label class="editLabel styleLabel">格线颜色：</label>
              <el-color-picker v-model="tableStyle[1].lineColor" show-alpha/>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      <div class="buttons">
        <el-button v-show="activeName === 'second' || type === 'src'" class="button" @click="updateData">修改</el-button>
        <el-button v-show="activeName !== 'second' && type != 'src'" class="button" @click="nextStep">下一步</el-button>
        <el-button class="button" @click="deleteData">删除</el-button>
        <el-button class="button" @click="resetData('click')">重置</el-button>
      </div>
    </div>
  </div>
</template>

<script>
  import draggable from 'vuedraggable'
  import {compCommon} from '../../../components/index'
  import systemColor from '../../../style/variables.scss'

  export default {
    name: 'EditComp',
    components: {
      draggable
    },
    mixins: [compCommon],
    data() {
      return {
        pkid: '',
        loading: false,
        role: {
          roleSelect: [],
          pickRole: ''
        },
        subject: {
          subjectSelect: [
            {
              name: '个人',
              value: '1'
            },
            {
              name: '单位',
              value: '2'
            }
          ],
          pickSubject: '1'
        },
        systemColor: {
          activeColor: systemColor.bgBorder,
          inactiveColor: systemColor.imgBg,
          loadingColor: systemColor.firstBg
        }
      }
    },
    computed: {
      defaultId() {
        if (this.zdyzjmc && this.subject.pickSubject === '1') {
          return this.$store.state.user.userInfo.personid
        }
        if (this.zdyzjmc && this.subject.pickSubject === '2') {
          return this.$store.state.user.userInfo.orgnid
        }
      }
    },
    mounted() {
      this.backfillData()
    },
    methods: {
      // 设置角色下拉框数据
      async setRoleSelect() {
        const userInfo = this.$store.state.user.userInfo
        this.role.roleSelect = userInfo.jsid
        this.userId = userInfo.userid
        if (!this.role.pickRole) {
          this.role.pickRole = this.role.roleSelect[0].value
        }
      },
      // 创建图表实例
      createChart(title, type, dataSource, optionsBackup, pkid) {
        const settingData = JSON.parse(optionsBackup)
        this.setHeight()
        // 基本数据
        this.pkid = pkid
        this.option = settingData.option
        this.type = settingData.type ? settingData.type : type
        this.typeName = settingData.typeName
        this.listCategory = settingData.listCategory
        this.listX = settingData.listX
        this.listOptional = settingData.listOptional
        this.cascaderKey += 1
        // 对象数据
        this.bar = Object.assign({}, settingData.bar)
        this.title = Object.assign({}, settingData.title)
        this.axis = Object.assign({}, settingData.axis)
        this.pick = Object.assign({}, settingData.pick)
        this.dataSource = Object.assign({}, settingData.dataSource)
        if (type === 'table') {
          this.listTable = settingData.listTable
          this.header = settingData.header
          this.table = settingData.table
          this.tableStyle = Object.assign({}, settingData.tableStyle)
          return
        } else if (type === 'text') {
          this.listContent = settingData.listContent
          this.text = Object.assign({}, settingData.text)
          return
        } else if (type === 'radar' || type === 'gauge') {
          this.listIndicator = settingData.listIndicator
        } else if (type === 'bar&line') {
          this.listBar = settingData.listBar
          this.listLine = settingData.listLine
        } else if (type === 'src') {
          this.zdyzjmc = dataSource
          this.title = Object.assign({}, {
            text: title
          })
          return
        } else if (type === 'scatter') {
          this.listAbscissa = settingData.listAbscissa
          this.listOrdinate = settingData.listOrdinate
        }
        // 图表
        this.$nextTick(() => {
          this.$echartsSetOption('transChart', this.option, false, true)
        })
      },
      // 设置右侧item
      async setThnItems() {
        this.items = []
        if (!this.role.pickRole) {
          return
        }
        this.loading = true
        const chartList = await this.$ajax('editChart.do?method=getEditChartList', {
          'roleId': this.role.pickRole,
          'type': this.subject.pickSubject
        })
        for (let i = 0, len = chartList.data.length, n = -1; i < len; i++) {
          n = parseInt(i) + parseInt(1)
          chartList.data[i]['name'] = 'item' + n
          this.items.push(chartList.data[i])
        }
        this.loading = false
      },
      // 重置页面数据
      resetData(type) {
        // 重置基本数据
        this.pkid = ''
        this.activeName = 'first'
        this.type = ''
        this.typeName = ''
        this.dataSource.value = []
        this.listOptional = []
        this.listCategory = []
        this.listX = []
        this.listContent = []
        this.listTable = []
        this.listIndicator = []
        this.listBar = []
        this.listLine = []
        this.listAbscissa = []
        this.listOrdinate = []
        this.header = []
        this.table = []
        // 重置对象数据
        this.bar = Object.assign({}, this.$options.data().bar)
        this.title = Object.assign({}, this.$options.data().title)
        this.axis = Object.assign({}, this.$options.data().axis)
        this.pick = Object.assign({}, this.$options.data().pick)
        this.text = Object.assign({}, this.$options.data().text)
        this.tableStyle = Object.assign({}, this.$options.data().tableStyle)
        // 重置图表
        if (this.option && Object.keys(this.option).length) {
          this.option = {}
          this.$echartsClear('transChart')
        }
        if (type === 'click') {
          this.$alertSuccess('重置成功！')
        }
        this.setHeight()
      },
      // Tab切换逻辑判断
      beforeLeave(activeName, oldActiveName) {
        if (activeName !== 'first') {
          if (!this.type) {
            this.$alertWarning('请先选择图表！')
            return false
          }
        }
      },
      setHeight() {
        if (this.activeName === 'first' && this.type !== 'src') {
          this.$nextTick(() => {
            this.categoryHeight = this.$refs['optionalDiv'].offsetHeight
            this.indicatorHeight = this.$refs['optionalDiv'].offsetHeight
            this.xAxisHeight = this.$refs['optionalDiv'].offsetHeight / 5
          })
        }
      },
      nextStep() {
        try {
          if (this.type) {
            this.activeName = 'second'
          } else {
            this.$alertWarning('请先选择图表！')
          }
        } catch (err) {
          this.$alertWarning(err.message)
          throw err
        }
      },
      // 改变item大小
      changeItemHeight(chart_code) {
        if (chart_code === 'text') {
          return `height: 12.5vh;`
        } else {
          return `height: 22.5vh;`
        }
      },
      // 展示缩略图
      changeBgImage(image) {
        return `height: 100%; width: 100%; background-image: url(` + image + `);
                background-repeat:no-repeat; background-size:100% 100%;`
      },
      async changeOption() {
        // 数据清空
        this.listCategory = []
        this.listX = []
        this.listContent = []
        this.listTable = []
        this.listIndicator = []
        this.listBar = []
        this.listLine = []
        this.listAbscissa = []
        this.listOrdinate = []
        this.header = []
        this.table = []
        this.text[0].content = ''
        this.text[1].content = ''
        this.setXAxis()
        this.setIndicator()
        this.setCategory()
        if (this.type !== 'src' && this.type !== 'text' && this.type !== 'table') {
          this.$echartsClear('transChart')
        }
        const checkedNode = this.$refs['dataSource'].getCheckedNodes()
        const optionList = await this.$ajax('dataSource.do?method=checkSqlInfo', {
          pid: this.dataSource.value[0],
          sqlid: checkedNode[0].data.value,
          postionData: true,
          Id: this.subject.pickSubject === '1' ? this.$store.state.user.userInfo.personid
            : this.subject.pickSubject === '2' ? this.$store.state.user.userInfo.orgnid : ''
        })
        this.listOptional = JSON.parse(optionList.data)
        this.cascaderKey += 1
      },
      async deleteData() {
        try {
          if (this.pkid) {
            await this.$confirm('确定要删除该组件吗?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
            const deleteInfo = await this.$ajax('editChart.do?method=deleteEditChart', {
              'pkid': this.pkid
            })
            if (deleteInfo.msg === '删除成功') {
              this.$alertSuccess(deleteInfo.msg + '！')
              this.resetData()
              await this.setThnItems()
            }
          } else {
            this.$alertWarning('请先选择图表！')
          }
        } catch (err) {
          if (err !== 'cancel') {
            this.$alertError('删除失败！')
            throw err
          }
        }
      },
      async updateData() {
        try {
          // 清空option中的示例数据
          const option = this.saveOption()
          let optionsChecked = {}
          let optionsBackup = {}
          let dataSourceVal = ''

          if (this.type === 'src') {
            dataSourceVal = this.zdyzjmc
          } else {
            dataSourceVal = this.dataSource.value[1]
            optionsChecked = {
              category: this.getListName(this.listCategory),
              x: this.getListName(this.listX),
              content: this.getListName(this.listContent),
              table: this.getListName(this.listTable),
              indicator: this.getListName(this.listIndicator),
              bar: this.getListName(this.listBar),
              line: this.getListName(this.listLine),
              abscissa: this.getListName(this.listAbscissa),
              ordinate: this.getListName(this.listOrdinate)
            }
            optionsBackup = this.getOptionsBackUp()
          }
          // 获取选中的可选项
          const image = await this.$saveImage('transChartDiv', {
            quality: 0.7,
            maxWidth: 300
          })
          const updateInfo = await this.$ajax('editChart.do?method=updateEditChart', {
            'pkid': this.pkid,
            'chartCode': this.type,
            'title': this.title.text,
            'dataSource': dataSourceVal,
            'type': this.subject.pickSubject,
            'options': option,
            'userId': this.userId,
            'roleId': this.role.pickRole,
            'image': image,
            'optionsChecked': JSON.stringify(optionsChecked),
            'optionsBackup': JSON.stringify(optionsBackup)
          })
          if (updateInfo.msg === '修改成功') {
            this.$alertSuccess(updateInfo.msg + '！')
            await this.setThnItems()
          }
        } catch (err) {
          this.$alertError(err.message)
          throw err
        }
      },
      async backfillData() {
        if (this.$route.params.compId) {
          const res = await this.$ajax('editChart.do?method=getEditChart', {
            'pkid': this.$route.params.compId
          })
          this.createChart(res.data[0].title, res.data[0].chart_code, res.data[0].data_source,
                           res.data[0].options_backup, this.$route.params.compId)
          this.role.pickRole = res.data[0].role_id
          this.subject.pickSubject = res.data[0].type
        }
        await this.setThnItems()
      }
    }
  }
</script>

<style lang="scss" scoped>
@import "../../../style/customStyle";
</style>
