<template>
  <div class="createComp">
    <div class="showDiv clickDiv">
      <el-collapse v-model="activeCollapse" accordion>
        <el-collapse-item v-for="sup in collapses" :key="sup" :name="sup">
          <template slot="title">
            <div style="position: relative; width: 100%;height: 100%;line-height: normal;">
              <div style="position: absolute;height: 50%; width: 95%;top: 25%;left: 5%;" class="contentTitle"><span>{{ sup }}</span></div>
            </div>
          </template>
          <div v-for="sub in items[sup]" :key="sub.name" class="subItem" @click="createChart(sub.type)">
            <div class="imgDiv">
              <i :class="sub.icon"/>
            </div>
            <p class="itemP">{{ sub.name }}</p>
          </div>
        </el-collapse-item>
      </el-collapse>
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
        <el-tab-pane label="主体绑定" name="first">
          <label v-show="roleSelect.length > 1" class="editLabel">部门：</label>
          <el-select v-show="roleSelect.length > 1" v-model="pick.pickRole" placeholder="请选择" size="small"
                     @change="setRoleCache">
            <el-option v-for="item in roleSelect" :key="item.value" :label="item.content" :value="item.value"/>
          </el-select>
          <label class="editLabel">主体：</label>
          <el-radio-group v-model="pick.pickRadio" @change="setDataSource">
            <el-radio label="个人"/>
            <el-radio label="单位"/>
          </el-radio-group>
        </el-tab-pane>
        <el-tab-pane label="数据绑定" name="second">
          <div class="dataBinding">
            <div class="inputDiv">
              <label v-show="type !== 'text' && type !== 'table'" class="editLabel">标题：</label>
              <el-input v-show="type !== 'text' && type !== 'table'" v-model="title.text" placeholder="请输入标题"
                        size="small" @input="setTitle"/>
              <label id="data" class="editLabel">
                <span v-if="type !== 'src'">数据源：</span>
                <span v-if="type === 'src'">组件名：</span>
              </label>
              <!-- <el-input v-if="type === 'src'" v-model="zdyzjmc" placeholder="请选择组件" size="small" /> -->
              <el-select v-if="type === 'src'" v-model="zdyzjmc" class="el-input" placeholder="请选择组件" size="small">
                <el-option v-for="item in zdyzjOption" :key="item.name" :label="item.name" :value="item.value"/>
              </el-select>
              <el-cascader v-if="type !== 'src'" ref="dataSource" v-model="dataSource.value" :options="dataSource.options"
                           :props="{ expandTrigger: 'hover' }"
                           placeholder="请选择数据源" size="small" @change="changeOption"/>
            </div>
            <div v-show="type !== 'src'" class="dragDiv">
              <div class="bigDiv">
                <p class="editP optionalP contentTitle">可选项</p>
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
                  <p class="editP topP contentTitle">系列</p>
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
                    <p class="editP topP contentTitle">柱体</p>
                    <div class="sameDiv mixedDiv">
                      <draggable class="list-group" :list="listBar" group="optional" @change="setBar">
                        <div v-for="element in listBar" :key="element.name" class="list-group-item">
                          {{ element.name }}
                        </div>
                      </draggable>
                    </div>
                  </div>
                  <div class="smallDiv lesserDiv">
                    <p class="editP middleP contentTitle">折线</p>
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
                  <p class="editP middleP contentTitle">X轴</p>
                  <div class="sameDiv" :style="changeHeight">
                    <draggable class="list-group" :list="listX" group="optional" @change="setXAxis" @add="addXItem">
                      <div v-for="element in listX" :key="element.name" class="list-group-item">
                        {{ element.name }}
                      </div>
                    </draggable>
                  </div>
                </div>
                <div v-show="type === 'radar' || type === 'gauge'" class="smallDiv">
                  <p v-show="type === 'gauge'" class="editP topP contentTitle">指针</p>
                  <p v-show="type === 'radar'" class="editP middleP contentTitle">指针</p>
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
                    <p class="editP topP contentTitle">横坐标</p>
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
                    <p class="editP middleP contentTitle">纵坐标</p>
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
                <p class="editP topP contentTitle">内容</p>
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
                <p class="editP topP contentTitle">数据</p>
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
        <el-tab-pane v-if="type !=='src'" label="样式绑定" name="third">
          <div v-show="type !== 'text' && type !== 'table'" class="styleBindingChart">
            <div class="backgroundDiv">
              <p class="editP styleP">背景样式</p>
              <label class="editLabel styleLabel">颜色：</label>
              <el-color-picker v-model="pick.pickBgColor" show-alpha @change="setBgColor"/>
              <label class="editLabel">主题：</label>
              <el-select v-show="type !== 'gauge'" v-model="pick.pickTheme" class="styleBox" placeholder="请选择" size="small" @change="setTheme">
                <el-option v-for="item in theme" :key="item.name" :label="item.name" :value="item.value"/>
              </el-select>
              <el-select v-show="type === 'gauge'" v-model="pick.pickGaugeTheme" class="styleBox" placeholder="请选择" size="small"
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
              <el-switch v-model="pick.pickLegend" @change="setLegendShow"/>
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
              <el-switch v-model="pick.pickSplit" @change="setSplit"/>
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
                <el-switch v-model="pick.pickApparent" @change="setApparent"/>
                <label class="editLabel">平滑曲线：</label>
                <el-switch v-model="pick.pickSmooth" @change="setSmooth"/>
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
                <el-switch v-model="pick.pickRadarLabel" @change="setRadarLabel"/>
                <label class="editLabel">区域面积：</label>
                <el-switch v-model="pick.pickOpacity" @change="setOpacity"/>
              </div>
              <div v-show="type === 'gauge'">
                <label class="editLabel styleLabel">最小值：</label>
                <el-input-number v-model="pick.pickMin" controls-position="right" size="small" @change="setGaugeMin"/>
                <label class="editLabel styleLabel">最大值：</label>
                <el-input-number v-model="pick.pickMax" controls-position="right" size="small" @change="setGaugeMax"/>
                <label class="editLabel">半径大小：</label>
                <el-slider v-model="pick.pickGaugeWidth" @change="setGaugeWidth"/>
                <label class="editLabel styleLabel">刻度线：</label>
                <el-switch v-model="pick.pickGaugeTick" @change="setGaugeTick"/>
                <label class="editLabel styleLabel">刻度值：</label>
                <el-switch v-model="pick.pickGaugeLabel" @change="setGaugeLabel"/>
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
              <el-switch v-model="text[1].percent" @change="setPercent"/>
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
        <el-button v-show="activeName === 'third' || (type === 'src' && activeName === 'second')"
                   class="button" @click="saveData">保存</el-button>
        <el-button v-show="activeName !== 'third' && !(type === 'src' && activeName === 'second')"
                   class="button" @click="nextStep">下一步</el-button>
        <el-button class="button" @click="resetData('button')">重置</el-button>
      </div>
    </div>
  </div>
</template>

<script>
  import draggable from 'vuedraggable'
  import {compCommon} from '../../../components/index'
  import systemColor from '../../../style/variables.scss'

  export default {
    name: 'CreateComp',
    components: {
      draggable
    },
    mixins: [compCommon],
    data() {
      return {
        roleSelect: [],
        activeCollapse: '',
        systemColor: {
          activeColor: systemColor.bgBorder,
          inactiveColor: systemColor.imgBg
        }
      }
    },
    computed: {
      collapses() {
        const keys = Object.keys(this.items).sort()
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.activeCollapse = keys[0]
        return keys
      },
      defaultId() {
        if (this.zdyzjmc && this.pick.pickRadio === '个人') {
          return this.$store.state.user.userInfo.personid
        }
        if (this.zdyzjmc && this.pick.pickRadio === '单位') {
          return this.$store.state.user.userInfo.orgnid
        }
      }
    },
    mounted() {
      // 左侧点击div
      this.setItems()
    },
    methods: {
      // 设置部门下拉框数据
      async setRoleSelect() {
        const userInfo = this.$store.state.user.userInfo
        if (userInfo.jsid.length === 1) {
          this.pick.pickRole = userInfo.jsid[0].value
          this.setRoleCache()
        } else if (!userInfo.jsid.length) {
          this.pick.pickRole = ' '
          this.setRoleCache()
        }
        this.roleSelect = userInfo.jsid
        this.userId = userInfo.userid
      },
      // 设置左侧选项
      async setItems() {
        try {
          const res = await this.$ajax('editChart.do?method=getAllChartType', {})
          const data = {}
          for (let i = 0, len = res.data.length; i < len; i++) {
            if (!data[res.data[i].suptype]) {
              data[res.data[i].suptype] = [res.data[i]]
            } else {
              data[res.data[i].suptype].push(res.data[i])
            }
          }
          this.items = data
        } catch (err) {
          this.$alertError(err.message)
          throw err
        }
      },
      // 创建图表实例
      createChart(type) {
        const pickRole = this.pick.pickRole
        const pickRadio = this.pick.pickRadio
        const title = this.title.text
        const dataSource = this.dataSource.value

        // 重置 初始化
        this.resetData('chart')
        if (type === 'line') {
          this.type = 'line'
          this.typeName = '折线图'
          this.$nextTick(() => {
            this.createBarLine()
          })
        } else if (type === 'pie') {
          this.type = 'pie'
          this.typeName = '饼状图'
          this.$nextTick(() => {
            this.createPieSet()
          })
        } else if (type === 'bar') {
          this.type = 'bar'
          this.typeName = '柱形图'
          this.$nextTick(() => {
            this.createBarLine()
          })
        } else if (type === 'doughnut') {
          this.type = 'doughnut'
          this.typeName = '环形图'
          this.$nextTick(() => {
            this.createPieSet()
          })
        } else if (type === 'text') {
          this.type = 'text'
          this.typeName = '文本'
        } else if (type === 'nightingale') {
          this.type = 'nightingale'
          this.typeName = '南丁格尔图'
          this.$nextTick(() => {
            this.createPieSet()
          })
        } else if (type === 'table') {
          this.type = 'table'
          this.typeName = '表格'
        } else if (type === 'radar') {
          this.type = 'radar'
          this.typeName = '雷达图'
          this.$nextTick(() => {
            this.createRadar()
          })
        } else if (type === 'src') {
          this.type = 'src'
          this.typeName = '自定义图形'
          this.zdyzjmc = ''
        } else if (type === 'gauge') {
          this.type = 'gauge'
          this.typeName = '仪表盘'
          this.$nextTick(() => {
            this.createGauge()
          })
        } else if (type === 'bar&line') {
          this.type = 'bar&line'
          this.typeName = '折柱图'
          this.$nextTick(() => {
            this.createBarLine()
          })
        } else if (type === 'scatter') {
          this.type = 'scatter'
          this.typeName = '散点图'
          this.$nextTick(() => {
            this.createScatter()
          })
        }

        this.pick.pickRole = pickRole
        this.pick.pickRadio = pickRadio
        this.title.text = title
        this.dataSource.value = dataSource
        if (pickRole && pickRadio) {
          this.activeName = 'second'
          this.setHeight()
          if (this.dataSource.value.length > 0) {
            this.$nextTick(() => {
              this.changeOption().then(() => {
                this.setTitle()
              })
            })
          }
        }
      },
      // 创建柱状图和折线图实例
      createBarLine() {
        this.$echartsClear('transChart')
        this.option = {
          backgroundColor: this.pick.pickBgColor,
          title: {
            text: this.title.text,
            textStyle: {
              color: this.title.color
            },
            left: this.title.left[0].value
          },
          legend: {
            show: this.pick.pickLegend,
            textStyle: {
              color: this.pick.pickLegendColor
            },
            x: this.legend.x[0].value,
            y: this.legend.y[0].value,
            orient: this.legend.orient[0].value
          },
          tooltip: {},
          color: this.theme[0].color,
          xAxis: {
            name: this.axis.xAxisName,
            data: this.listX.length ? this.listX[0].value : [],
            axisLine: {
              lineStyle: {
                color: this.axis.color
              }
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              interval: 0,
              rotate: 0
            }
          },
          series: this.setSeries(this.type)
        }
        if (this.type === 'bar' || this.type === 'line') {
          this.option['yAxis'] = [{
            name: this.axis.yAxisName,
            axisLine: {
              lineStyle: {
                color: this.axis.color
              }
            },
            splitLine: {
              show: false
            },
            splitArea: {
              show: false,
              areaStyle: {
                color: ['rgba(0, 136, 212, 0.25)', this.pick.pickBgColor ? this.pick.pickBgColor : 'rgba(255,255,255,0.25)']
              }
            }
          }]
        } else if (this.type === 'bar&line') {
          this.option['yAxis'] = [
            {
              name: this.axis.yAxisName,
              axisLine: {
                lineStyle: {
                  color: this.axis.color
                }
              },
              splitLine: {
                show: false
              },
              splitArea: {
                show: false,
                areaStyle: {
                  color: ['rgba(0, 136, 212, 0.25)', this.pick.pickBgColor ? this.pick.pickBgColor : 'rgba(255,255,255,0.25)']
                }
              }
            },
            {
              name: this.axis.yAxisName,
              axisLine: {
                lineStyle: {
                  color: this.axis.color
                }
              },
              splitLine: {
                show: false
              },
              splitArea: {
                show: false
              }
            }
          ]
        }
        this.$echartsSetOption('transChart', this.option, false, true)
        this.$echartsClear('transChart')
      },
      // 创建饼状图和环形图实例
      createPieSet() {
        this.$echartsClear('transChart')
        this.option = {
          backgroundColor: this.pick.pickBgColor,
          title: {
            text: this.title.text,
            textStyle: {
              color: this.title.color
            },
            left: this.title.left[0].value
          },
          legend: {
            show: this.pick.pickLegend,
            textStyle: {
              color: this.pick.pickLegendColor
            },
            x: this.legend.x[0].value,
            y: this.legend.y[0].value,
            orient: this.legend.orient[0].value
          },
          tooltip: {},
          color: this.theme[0].color,
          series: this.setSeries(this.type)
        }
        this.$echartsSetOption('transChart', this.option, false, true)
      },
      // 创建雷达图实例
      createRadar() {
        this.$echartsClear('transChart')
        this.option = {
          backgroundColor: this.pick.pickBgColor,
          title: {
            text: this.title.text,
            textStyle: {
              color: this.title.color
            },
            left: this.title.left[0].value
          },
          tooltip: {},
          legend: {
            show: this.pick.pickLegend,
            textStyle: {
              color: this.pick.pickLegendColor
            },
            x: this.legend.x[0].value,
            y: this.legend.y[0].value,
            orient: this.legend.orient[0].value
          },
          color: this.theme[0].color,
          radar: {
            name: {
              show: true,
              textStyle: {
                color: this.pick.pickLegendColor,
                fontSize: '100%'
              }
            },
            indicator: [],
            nameGap: 11,
            splitArea: {
              show: true,
              areaStyle: {
                color: this.radarTheme[0].color // 图表背景网格的颜色
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
          series: this.setSeries(this.type)
        }
        this.$echartsSetOption('transChart', this.option, false, true)
        this.$echartsClear('transChart')
      },
      // 创建仪表盘实例
      createGauge() {
        this.$echartsClear('transChart')
        this.option = {
          backgroundColor: this.pick.pickBgColor,
          title: {
            text: this.title.text,
            textStyle: {
              color: this.title.color
            },
            left: this.title.left[0].value
          },
          series: this.setSeries(this.type)
        }
        this.$echartsSetOption('transChart', this.option, false, true)
        this.$echartsClear('transChart')
      },
      // 创建散点图实例
      createScatter() {
        this.$echartsClear('transChart')
        this.option = {
          backgroundColor: this.pick.pickBgColor,
          title: {
            text: this.title.text,
            textStyle: {
              color: this.title.color
            },
            left: this.title.left[0].value
          },
          tooltip: {},
          color: this.theme[0].color,
          xAxis: {
            name: this.axis.xAxisName,
            axisLine: {
              lineStyle: {
                color: this.axis.color
              }
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              interval: 0,
              rotate: 0
            }
          },
          yAxis: [{
            name: this.axis.yAxisName,
            axisLine: {
              lineStyle: {
                color: this.axis.color
              }
            },
            splitLine: {
              show: false
            },
            splitArea: {
              show: false,
              areaStyle: {
                color: ['rgba(0, 136, 212, 0.25)', this.pick.pickBgColor ? this.pick.pickBgColor : 'rgba(255,255,255,0.25)']
              }
            }
          }],
          series: this.setSeries(this.type)
        }
        this.$echartsSetOption('transChart', this.option, false, true)
        this.$echartsClear('transChart')
      },
      // 重置页面数据
      resetData(type) {
        // 重置基本数据
        this.activeName = 'first'
        this.type = ''
        this.typeName = ''
        this.dataSource.value = []
        this.listOptional = []
        this.listCategory = []
        this.listX = []
        this.listContent = []
        this.listIndicator = []
        this.listBar = []
        this.listLine = []
        this.listAbscissa = []
        this.listOrdinate = []
        // 重置对象数据
        this.bar = Object.assign({}, this.$options.data().bar)
        this.title = Object.assign({}, this.$options.data().title)
        this.axis = Object.assign({}, this.$options.data().axis)
        this.pick = Object.assign({}, this.$options.data().pick)
        this.text = Object.assign({}, this.$options.data().text)
        // 重置图表
        if (Object.keys(this.option).length) {
          this.option = {}
          this.$echartsClear('transChart')
        }
        if (type === 'button') {
          this.$alertSuccess('重置成功！')
        } else if (type === 'chart') {
          this.$alertSuccess('新建组件实例成功！')
        }
        this.setHeight()
      },
      // Tab切换逻辑判断
      beforeLeave(activeName, oldActiveName) {
        if (activeName !== 'first') {
          if (!this.type) {
            this.$alertWarning('请先选择图表类型！')
            return false
          }
          if (!this.pick.pickRole) {
            this.$alertWarning('请选择部门！')
            return false
          }
          if (!this.pick.pickRadio) {
            this.$alertWarning('请选择主体！')
            return false
          }
        }
        if (oldActiveName !== 'third' && activeName === 'third') {
          if (!this.dataSource.value.length) {
            this.$alertWarning('请选择数据源！')
            return false
          }
        }
      },
      setHeight() {
        if (this.activeName === 'second') {
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
            if (this.activeName === 'first') {
              if (!this.pick.pickRadio) {
                throw new Error('请选择主体！')
              }
              this.activeName = 'second'
              this.setHeight()
            } else if (this.activeName === 'second') {
              if (!this.dataSource.value.length) {
                throw new Error('请选择数据源！')
              }
              this.activeName = 'third'
            }
          } else {
            this.$alertWarning('请先选择图表类型！')
          }
        } catch (err) {
          this.$alertWarning(err.message)
          throw err
        }
      },
      setRoleCache() {
        this.$setCache('roleId', this.pick.pickRole)
      },
      async setDataSource() {
        if (!this.type) {
          this.$alertWarning('请先选择图表类型！')
          return false
        }
        // 数据清空
        this.listX = []
        this.listOptional = []
        this.listCategory = []
        this.listContent = []
        this.listTable = []
        this.listIndicator = []
        this.listBar = []
        this.listLine = []
        this.listAbscissa = []
        this.listOrdinate = []
        this.dataSource.options = []
        this.dataSource.value = []
        if (this.type !== 'src' && this.type !== 'text' && this.type !== 'table') {
          this.$echartsClear('transChart')
        }
        const type = !this.pick.pickRadio ? this.pick.pickRadio : (this.pick.pickRadio === '个人' ? 1 : 2)
        const dataSource = await this.$ajax('editChart.do?method=dataSourceBind', {
          type: type
        })
        this.dataSource.options = dataSource.data
      },
      async changeOption() {
        // 数据清空
        this.listCategory = []
        this.listOptional = []
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
          Id: this.pick.pickRadio === '个人' ? this.$store.state.user.userInfo.personid
            : (this.pick.pickRadio === '单位' ? this.$store.state.user.userInfo.orgnid : '')
        })
        if (optionList.data && optionList.data.length > 0) {
          this.listOptional = JSON.parse(optionList.data)
        }
        this.cascaderKey += 1
      },
      async saveData() {
        try {
          // 清空option中的示例数据
          const option = this.saveOption()
          // 获取选中的可选项
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
          const image = await this.$saveImage('transChartDiv', {
            quality: 0.7,
            maxWidth: 300
          })
          const setInfo = await this.$ajax('editChart.do?method=setEditChart', {
            'chartCode': this.type,
            'title': this.title.text,
            'dataSource': dataSourceVal,
            'type': !this.pick.pickRadio ? this.pick.pickRadio : (this.pick.pickRadio === '个人' ? 1 : 2),
            'options': option,
            'userId': this.userId,
            'roleId': this.pick.pickRole,
            'image': image,
            'optionsChecked': JSON.stringify(optionsChecked),
            'optionsBackup': JSON.stringify(optionsBackup)
          })
          if (setInfo.msg === '保存成功') {
            this.$alertSuccess(setInfo.msg + '！')
            this.resetData()
          }
        } catch (err) {
          this.$alertError(err.message)
          throw err
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
@import "../../../style/customStyle";
</style>
