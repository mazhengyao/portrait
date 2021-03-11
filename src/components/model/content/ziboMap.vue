<template>
  <div class="center">
    <dw-echarts ref="dtzs" dw-key="dtzs" style="position: absolute;right: 8%;height: 78%; width: 100%;"/>
  </div>
</template>

<script>
  import geojson from './mapJson/370300.json'

  export default {
    // 总览
    name: 'ZiboMap',
    data() {
      return {
        zbdtjson: geojson,
        geoCoordMap: {
          '37039Z市直': [118.000589, 36.837272],
          '370392淄川区': [117.985352, 36.653966],
          '370393张店区': [118.046958, 36.807102],
          '370394博山区': [117.858626, 36.505328],
          '370395临淄区': [118.288079, 36.821221],
          '370396周村区': [117.876794, 36.806412],
          '370397桓台县': [118.108775, 36.965007],
          '370398高青县': [117.915282, 37.112853],
          '37039A沂源县': [118.198271, 36.206622],
          '37039B高新区': [118.049766, 36.836384],
          '37039C文昌湖': [117.884763, 36.724005],
          '37039D经济开发区': [117.931524, 36.838547]
        },
        mapdata: [
          {name: '37039Z市直', value: {dyrs: 100, txrs: 80, dyrstb: 1.1, txrstb: 1.2}},
          {name: '370392淄川区', value: {dyrs: 100, txrs: 80, dyrstb: 1.1, txrstb: 1.2}},
          {name: '370393张店区', value: {dyrs: 100, txrs: 80, dyrstb: 1.1, txrstb: 1.2}},
          {name: '370394博山区', value: {dyrs: 100, txrs: 80, dyrstb: 1.1, txrstb: 1.2}},
          {name: '370395临淄区', value: {dyrs: 100, txrs: 80, dyrstb: 1.1, txrstb: 1.2}},
          {name: '370396周村区', value: {dyrs: 100, txrs: 80, dyrstb: 1.1, txrstb: 1.2}},
          {name: '370397桓台县', value: {dyrs: 100, txrs: 80, dyrstb: 1.1, txrstb: 1.2}},
          {name: '370398高青县', value: {dyrs: 100, txrs: 80, dyrstb: 1.1, txrstb: 1.2}},
          {name: '37039A沂源县', value: {dyrs: 100, txrs: 80, dyrstb: 1.1, txrstb: 1.2}},
          {name: '37039B高新区', value: {dyrs: 100, txrs: 80, dyrstb: 1.1, txrstb: 1.2}},
          {name: '37039C文昌湖', value: {dyrs: 100, txrs: 80, dyrstb: 1.1, txrstb: 1.2}},
          {name: '37039D经济开发区', value: {dyrs: 100, txrs: 80, dyrstb: 1.1, txrstb: 1.2}}
        ],
        option_dtzs: {
          tooltip: {
            trigger: 'item',
            borderColor: 'rgba(56,255,187,0.7)',
            borderWidth: 0.1,
            formatter: function(params) {
              return params.name.substring(6) + '<br\>' + '待遇人数:' + params.value[2].dyrs + '<br\>待遇人数同比增长:' + params.value[2].dyrstb +
                '%<br\>退休人数:' + params.value[2].txrs + '<br\>退休人数同比增长:' + params.value[2].txrstb + '%'
            }
          },
          grid: {
            top: 0
          },
          geo: {
            map: 'zibo',
            label: {
              normal: {
                show: false,
                textStyle: {
                  color: 'none'
                }
              },
              emphasis: {
                show: false
              }
            },
            roam: false,
            zoom: 1.22,
            itemStyle: {
              normal: {
                borderColor: 'rgba(255, 239, 244, 0.7)',
                borderWidth: 2,
                shadowColor: 'rgba(0,0,0,0)',
                shadowBlur: 10,
                areaColor: '#c9d5e2'
              },
              emphasis: {
                areaColor: '#e0d7e2'
              }
            }
          },
          series: {
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: [],
            itemStyle: {
              normal: {
                color: '#5500ff'
              }
            },
            symbolSize: 5,
            showEffectOn: 'render',
            rippleEffect: {
              brushType: 'stroke'
            },
            hoverAnimation: true
          }
        }
      }
    },
    mounted() { // 这里是页面加载的时候执行函数
      this.setAllOption()
      const echarts = this.$echartsSetOption('dtzs', this.option_dtzs, false)
    },
    methods: {
      setAllOption() { // 将页面所有的echarts加载option
        this.option_dtzs.series.data = this.convertData(this.mapdata)
        this.setOptiondtzs(this.option_dtzs)
      },
      setOptiondtzs(opt) {
        this.$echarts.registerMap('zibo', this.zbdtjson)
        this.$refs['dtzs'].setOption(opt)
      },
      convertData(data) {
        const res = []
        for (let i = 0; i < data.length; i++) {
          const geoCoord = this.geoCoordMap[data[i].name]
          if (geoCoord) {
            res.push({
              name: data[i].name,
              value: geoCoord.concat(data[i].value)
            })
          }
        }
        return res
      }
    }
  }
</script>

<style scoped>
  .overviewPage {
    width: 100%;
    height: 100%;
  }
  .title {
    width: 100%;
    height: 8%;
    color: #cef4ff;
    font-size: 0.7vw;
    position: absolute;
    padding-left:7px;
    border-left:5px solid #0D80FF;
  }
  .content {
    top: 3%;
    left: 2%;
    right: 1%;
    width: 96%;
    height: 97%;
    position: absolute;
  }
  .top {
    left: 0.5%;
    width: 100%;
    height: 10%;
    position: absolute;
  }
  .dyrs {
    color: #cef4ff;
    font-size: 1.2vw;
    width: 24%;
    top: 2%;
    height: 96%;
    position: absolute;
  }
  .txrs {
    color: #cef4ff;
    left: 25%;
    font-size: 1.2vw;
    width: 24%;
    top: 2%;
    height: 96%;
    position: absolute;
  }
  .jjsr {
    color: #cef4ff;
    left: 50%;
    font-size: 1.2vw;
    width: 24%;
    top: 2%;
    height: 96%;
    position: absolute;
  }
  .jjzc {
    color: #cef4ff;
    left: 75%;
    font-size: 1.2vw;
    width: 24%;
    top: 2%;
    height: 96%;
    position: absolute;
  }
  .middle {
    top: 11%;
    width: 100%;
    height: 62%;
    position: absolute;
  }
  .bottom {
    top: 74%;
    width: 100%;
    height: 26%;
    position: absolute;
  }
  .center {
    background-size: 100% 45%;
    width: 26%;height: 130%;
    position: absolute;
    left: 37%;
  }
  .left {
    width: 35%;
    height: 100%;
    position: absolute;
  }
  .right {
    width: 35%;
    height: 100%;
    position: absolute;
    left: 65%;
  }
  .left_top {
    width: 100%;
    height: 49%;
    position: absolute;
  }
  .left_bottom {
    width: 100%;
    top: 51%;
    height: 49%;
    position: absolute;
  }
  .inner_content {
    top: 10%;
    width: 100%;
    height: 90%;
    position: absolute;
  }
  .pjjfffqs {
    height: 100%;
    width: 100%;
    position: absolute;
  }
  .icon{
    background:-webkit-linear-gradient(top,#0069A0,#07489E);
    position:absolute;
    top:0;
    left:6%;
    width:20%;
    height:100%;
  }
  .icondaiyurenshu{
    color:#ffffff;
    position:absolute;
    left:25%;
    top:12%;
    font-size: 2.5vw
  }
  .icontuixiurenshu{
    color:#ffffff;
    position:absolute;
    left:25%;
    top:12%;
    font-size: 2.5vw
  }
  .iconjijinshouru{
    color:#ffffff;
    position:absolute;
    left:25%;
    top:12%;
    font-size: 2.5vw
  }
  .iconjijinzhichu{
    color:#ffffff;
    position:absolute;
    left:25%;
    top:12%;
    font-size: 2.5vw
  }
  .number1{
    color:#17eefe;
    font-size:2vw;
    position: absolute;
    left:30%;
    top:6%;
    height:55%;
    width:50%
  }
  .name1{
    color:#9AAEAF;
    font-size:1vw;
    position: absolute;
    left:30%;
    top:60%;
    height:35%;
    width:50%
  }
  .number2{
    color:#17eefe;
    font-size:2vw;
    position: absolute;
    left:70%;
    top:6%;
    height:55%;
    width:30%
  }
  .name2{
    color:#9AAEAF;
    font-size:1vw;
    position: absolute;
    left:70%;
    top:60%;
    height:30%;
    width:35%
  }
</style>
