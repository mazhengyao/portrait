<template>
  <div ref="transformDiv" class="move-content-outer" :style="changeStyle" tabIndex="1"
       @mousedown="mousedownDiv($event)" @focus="transformFocus" @blur="transformBlur">
    <slot/>
    <!--缩放节点-->
    <div v-show="showPoint" class="move-content-direction move-content-direction-n"/>
    <div v-show="showPoint" class="move-content-direction move-content-direction-ne"/>
    <div v-show="showPoint" class="move-content-direction move-content-direction-e"/>
    <div v-show="showPoint" class="move-content-direction move-content-direction-se"/>
    <div v-show="showPoint" class="move-content-direction move-content-direction-s"/>
    <div v-show="showPoint" class="move-content-direction move-content-direction-sw"/>
    <div v-show="showPoint" class="move-content-direction move-content-direction-w"/>
    <div v-show="showPoint" class="move-content-direction move-content-direction-nw"/>
    <!--设置框-->
    <div v-show="showPoint" class="move-content-setting" :style="changePosition">
      <span class="move-content-text">上侧：</span>
      <input v-model="style.top" class="move-content-input" type="text"
             @focus="settingFocus" @blur="settingBlur" @input="inputTop($event)" @change="changeTop($event)">
      <span class="move-content-text">左侧：</span>
      <input v-model="style.left" class="move-content-input" type="text"
             @focus="settingFocus" @blur="settingBlur" @input="inputLeft($event)" @change="changeLeft($event)">
      <span class="move-content-text">高度：</span>
      <input v-model="style.height" class="move-content-input" type="text"
             @focus="settingFocus" @blur="settingBlur" @input="inputHeight($event)" @change="changeHeight($event)">
      <span class="move-content-text">宽度：</span>
      <input v-model="style.width" class="move-content-input" type="text"
             @focus="settingFocus" @blur="settingBlur" @input="inputWidth($event)" @change="changeWidth($event)">
      <span class="move-content-text">层级：</span>
      <input v-model="style.index" class="move-content-input" type="text"
             @focus="settingFocus" @blur="settingBlur" @change="changeIndex($event)">
      <button class="move-content-button" @focus="settingFocus" @click="editTransDiv">编辑</button>
      <button class="move-content-button" @focus="settingFocus" @click="deleteTransDiv">删除</button>
    </div>
  </div>
</template>

<script>
  import systemColor from '../style/variables.scss'

  export default {
    name: 'TransformDiv',
    props: {
      com: {
        type: Object
      },
      board: {
        type: Object
      },
      isEdit: {
        type: Boolean
      }
    },
    data() {
      return {
        space: {
          style: '', // 样式
          x: 0, // 鼠标x
          y: 0, // 鼠标y
          width: this.com.comWidth, // 默认div的宽度
          height: this.com.comHeight, // 默认div的高度
          top: this.com.comTop, // 默认div的距离头部距离
          right: 0, // 默认div的距离右侧距离
          bottom: 0, // 默认div的距离底部距离
          left: this.com.comLeft, // 默认div的距离左侧距离
          moveHeight: 30, // 默认头部高度
          minHeight: 33, // div高度不能小于min
          minWidth: 100, // div宽度不能小于min
          moveTarget: null // 鼠标按下之后移动的target
        },
        style: {
          top: this.com.comTop,
          left: this.com.comLeft,
          height: this.com.comHeight,
          width: this.com.comWidth,
          index: this.com.index
        },
        settingStyle: {
          width: 150,
          height: 143,
          top: 0,
          bottom: -155
        },
        showPoint: false,
        showSetting: false,
        systemColor: {
          outlineColor: systemColor.bgBorder
        }
      }
    },
    computed: {
      // 样式动态变换
      changeStyle() {
        let result = `height: ${this.getHeight}px; width: ${this.getWidth}px;
                top: ${this.style.top}px; left: ${this.style.left}px; z-index: ${this.style.index};`
        // 选中时候的边框
        if (this.showPoint) {
          result += `outline: 2px ${this.systemColor.outlineColor} solid;`
        }
        return result
      },
      // 设置框位置动态改变
      changePosition() {
        let result = `width: ${this.settingStyle.width}px; height: ${this.settingStyle.height}px;`
        // 改变设置框定位
        if (!this.settingStyle.top) {
          result += `top: ${this.settingStyle.bottom}px;`
        }
        if (!this.settingStyle.bottom) {
          result += `bottom: ${this.settingStyle.top}px;`
        }
        return result
      },
      getHeight() {
        return this.style.height
      },
      getWidth() {
        return this.style.width
      }
    },
    watch: {
      com: {
        // 实时更新数据
        handler(newValue, oldValue) {
          this.style.top = parseInt(newValue.comTop)
          this.style.left = parseInt(newValue.comLeft)
          this.style.height = parseInt(newValue.comHeight)
          this.style.width = parseInt(newValue.comWidth)
        },
        deep: true
      }
    },
    mounted() {
    },
    methods: {
      // 鼠标按下事件
      mousedownDiv(event) {
        if (this.isEdit) {
          // 向父组件传递数据
          this.$emit('transDivItem', this.com)
          // 鼠标移动事件
          document.onmousemove = (e) => {
            this.addMoveContentControl(this.$refs['transformDiv'], e)
          }
        }
      },
      // 数据赋值
      addMoveContentSuper(divEle, e) {
        // div的style
        this.space.style = divEle.style
        this.space.width = this.space.style.width ? this.space.style.width : this.com.comHeight
        this.space.height = this.space.style.height ? this.space.style.height : this.com.comWidth
        this.space.top = this.space.style.top ? this.space.style.top : 0
        this.space.left = this.space.style.left ? this.space.style.left : 0
        this.space.right = this.space.style.right ? this.space.style.right : 0
        this.space.bottom = this.space.style.bottom ? this.space.style.bottom : 0
        this.space.x = e.movementX
        this.space.y = e.movementY
        // 修改属性的值
        this.space.width = parseInt(this.space.width.toString().replace('px', ''))
        this.space.height = parseInt(this.space.height.toString().replace('px', ''))
        this.space.top = parseInt(this.space.top.toString().replace('px', ''))
        this.space.right = parseInt(this.space.right.toString().replace('px', ''))
        this.space.bottom = parseInt(this.space.bottom.toString().replace('px', ''))
        this.space.left = parseInt(this.space.left.toString().replace('px', ''))
      },
      // 移动缩放逻辑
      addMoveContentControl(divEle, e) {
        if (this.isEdit) {
          if (!divEle) {
            return
          }
          // 当鼠标没有按下则不走方法
          if (e.buttons !== 1) {
            this.space.moveTarget = null
            return
          } else if (this.space.moveTarget === null && !e.target.id) { // 鼠标按下movetarget为空赋值&解决不精确点击缩放节点移动问题
            this.space.moveTarget = e.target
          }
          // 获取所有拉伸的节点
          const direction = divEle.getElementsByClassName('move-content-direction')
          // 缩放
          if (this.space.moveTarget === direction[0]) {
            // 上缩放
            this.addMoveContentTop(divEle, e)
            return
          } else if (this.space.moveTarget === direction[1]) {
            // 右上缩放
            this.addMoveContentRightTop(divEle, e)
            return
          } else if (this.space.moveTarget === direction[2]) {
            // 右缩放
            this.addMoveContentRight(divEle, e)
            return
          } else if (this.space.moveTarget === direction[3]) {
            // 右下缩放
            this.addMoveContentRightButtom(divEle, e)
            return
          } else if (this.space.moveTarget === direction[4]) {
            // 下缩放
            this.addMoveContentButtom(divEle, e)
            return
          } else if (this.space.moveTarget === direction[5]) {
            // 左下缩放
            this.addMoveContentLeftButtom(divEle, e)
            return
          } else if (this.space.moveTarget === direction[6]) {
            // 左缩放
            this.addMoveContentLeft(divEle, e)
            return
          } else if (this.space.moveTarget === direction[7]) {
            // 左上缩放
            this.addMoveContentLeftTop(divEle, e)
            return
          } else if (this.space.moveTarget && this.space.moveTarget.type === 'text') {
            // 特殊情况设置框触发
            return
          }
          // 移动
          if (this.space.moveTarget.ownerDocument && (this.space.moveTarget === divEle ||
            this.space.moveTarget.ownerDocument.activeElement === divEle)) {
            this.addMoveContentMove(divEle, e)
          }
        }
      },
      // 移动
      addMoveContentMove(divEle, e) {
        this.addMoveContentSuper(divEle, e)
        let top = this.space.top + this.space.y
        let left = this.space.left + this.space.x
        const width = this.space.width
        const height = this.space.height

        // 限制 top
        if (top <= 0) {
          top = 0
        }
        // 限制 bottom
        if ((top + height) >= this.board.boardHeight - 3) {
          top = this.board.boardHeight - height - 4
        }
        // 限制 left
        if (left <= 0) {
          left = 0
        }
        // 限制 right
        if ((left + width) >= this.board.boardWidth - 3) {
          left = this.board.boardWidth - width - 3
        }

        // 限制设置框为下方
        if (top <= this.settingStyle.height) {
          this.settingStyle.top = -155
          this.settingStyle.bottom = 0
        }
        // 限制设置框为上方 20为空白长度
        if ((top + height + this.settingStyle.height + 20) >= this.board.boardHeight) {
          this.settingStyle.top = 0
          this.settingStyle.bottom = -155
        }

        this.space.style.top = top + 'px'
        this.space.style.left = left + 'px'

        this.transDivStyle()
      },
      // 向上拉伸
      addMoveContentTop(divEle, e) {
        this.addMoveContentSuper(divEle, e)
        let top = this.space.top
        let height = this.space.height + (-this.space.y)

        // 缩小保护
        if (height < this.space.minHeight) {
          height = this.space.minHeight
        } else {
          top = this.space.top + this.space.y
        }
        // 限制 top
        if (top <= 0) {
          top = 0
          height = this.space.height
        }
        // 限制设置框为下方
        // if (top <= this.settingStyle.height) {
        //   this.settingStyle.top = -155
        //   this.settingStyle.bottom = 0
        // }
        this.space.style.top = top + 'px'
        this.space.style.height = height + 'px'

        this.transDivStyle()
      },
      // 右上拉伸
      addMoveContentRightTop(divEle, e) {
        this.addMoveContentSuper(divEle, e)
        let top = this.space.top
        let width = this.space.width + this.space.x
        let height = this.space.height + (-this.space.y)
        const left = this.space.left + this.space.x

        // 缩小保护
        if (height < this.space.minHeight) {
          height = this.space.minHeight
        }
        if (width < this.space.minWidth) {
          width = this.space.minWidth
        } else {
          top = this.space.top + this.space.y
        }
        // 限制 top
        if (top <= 0) {
          top = 0
          height = this.space.height
        }
        // 限制 right
        if ((left + width) >= this.board.boardWidth) {
          width = this.space.width
        }
        // 限制 bottom
        if ((top + height) >= this.board.boardHeight) {
          top = this.board.boardHeight - height
        }
        // 限制设置框为下方
        // if (top <= this.settingStyle.height) {
        //   this.settingStyle.top = -155
        //   this.settingStyle.bottom = 0
        // }

        this.space.style.top = top + 'px'
        this.space.style.width = width + 'px'
        this.space.style.height = height + 'px'

        this.transDivStyle()
      },
      // 右侧拉伸
      addMoveContentRight(divEle, e) {
        this.addMoveContentSuper(divEle, e)
        let width = this.space.width + this.space.x
        const left = this.space.left + this.space.x

        // 缩小保护
        if (width < this.space.minWidth) {
          width = this.space.minWidth
        }
        // 限制 right
        if ((left + width) >= this.board.boardWidth) {
          width = this.space.width
        }

        this.space.style.width = width + 'px'

        this.transDivStyle()
      },
      // 右下拉伸
      addMoveContentRightButtom(divEle, e) {
        this.addMoveContentSuper(divEle, e)
        const top = this.space.top + this.space.y
        const left = this.space.left + this.space.x
        let width = this.space.width + this.space.x
        let height = this.space.height + this.space.y

        // 缩小保护
        if (height < this.space.minHeight) {
          height = this.space.minHeight
        }
        if (width < this.space.minWidth) {
          width = this.space.minWidth
        }
        // 限制 right
        if ((left + width) >= this.board.boardWidth) {
          width = this.space.width
        }
        // 限制 bottom
        if ((top + height) >= this.board.boardHeight) {
          height = this.space.height
        }
        // 限制设置框为上方
        if ((top + height + this.settingStyle.height + 20) >= this.board.boardHeight) {
          this.settingStyle.top = 0
          this.settingStyle.bottom = -155
        }

        this.space.style.width = width + 'px'
        this.space.style.height = height + 'px'

        this.transDivStyle()
      },
      // 向下拉伸
      addMoveContentButtom(divEle, e) {
        this.addMoveContentSuper(divEle, e)
        const top = this.space.top + this.space.y
        let height = this.space.height + this.space.y

        // 缩小保护
        if (height < this.space.minHeight) {
          height = this.space.minHeight
        }
        // 限制 bottom
        if ((top + height) >= this.board.boardHeight) {
          height = this.space.height
        }
        // 限制设置框为上方
        if ((top + height + this.settingStyle.height + 20) >= this.board.boardHeight) {
          this.settingStyle.top = 0
          this.settingStyle.bottom = -155
        }

        this.space.style.height = height + 'px'

        this.transDivStyle()
      },
      // 左下拉伸
      addMoveContentLeftButtom(divEle, e) {
        this.addMoveContentSuper(divEle, e)
        const top = this.space.top + this.space.y
        let left = this.space.left
        let width = this.space.width + (-this.space.x)
        let height = this.space.height + this.space.y

        // 缩小保护
        if (height < this.space.minHeight) {
          height = this.space.minHeight
        }
        if (width < this.space.minWidth) {
          width = this.space.minWidth
        } else {
          left = this.space.left + this.space.x
        }
        // 限制 left
        if (left <= 0) {
          left = 0
          width = this.space.width
        }
        // 限制 bottom
        if ((top + height) >= this.board.boardHeight) {
          height = this.space.height
        }
        // 限制设置框为上方
        if ((top + height + this.settingStyle.height + 20) >= this.board.boardHeight) {
          this.settingStyle.top = 0
          this.settingStyle.bottom = -155
        }

        this.space.style.width = width + 'px'
        this.space.style.height = height + 'px'
        this.space.style.left = left + 'px'

        this.transDivStyle()
      },
      // 向左拉伸
      addMoveContentLeft(divEle, e) {
        this.addMoveContentSuper(divEle, e)
        let left = this.space.left
        let width = this.space.width + (-this.space.x)

        // 缩小保护
        if (width < this.space.minWidth) {
          width = this.space.minWidth
        } else {
          left = this.space.left + this.space.x
        }
        // 限制 left
        if (left <= 0) {
          left = 0
          width = this.space.width
        }

        this.space.style.left = left + 'px'
        this.space.style.width = width + 'px'

        this.transDivStyle()
      },
      // 左上拉伸
      addMoveContentLeftTop(divEle, e) {
        this.addMoveContentSuper(divEle, e)
        let top = this.space.top
        let left = this.space.left
        let width = this.space.width + (-this.space.x)
        let height = this.space.height + (-this.space.y)

        // 缩小保护
        if (height < this.space.minHeight) {
          height = this.space.minHeight
        } else {
          top = this.space.top + this.space.y
        }
        if (width < this.space.minWidth) {
          width = this.space.minWidth
        } else {
          left = this.space.left + this.space.x
        }
        // 限制 left
        if (left <= 0) {
          left = 0
          width = this.space.width
        }
        // 限制 top
        if (top <= 0) {
          top = 0
          height = this.space.height
        }
        // 限制设置框为下方
        // if (top <= this.settingStyle.height) {
        //   this.settingStyle.top = -155
        //   this.settingStyle.bottom = 0
        // }

        this.space.style.top = top + 'px'
        this.space.style.left = left + 'px'
        this.space.style.width = width + 'px'
        this.space.style.height = height + 'px'

        this.transDivStyle()
      },
      // 父组件传递数据
      transDivStyle() {
        this.$emit('transDivStyle', {
          top: parseInt(this.space.style.top.toString().replace('px', '')),
          left: parseInt(this.space.style.left.toString().replace('px', '')),
          height: parseInt(this.space.style.height.toString().replace('px', '')),
          width: parseInt(this.space.style.width.toString().replace('px', ''))
        })
      },
      // 组件焦点
      transformFocus(event) {
        if (this.isEdit) {
          this.showPoint = true
        }
      },
      // 组件失焦
      transformBlur(event) {
        if (this.isEdit) {
          // 当setting获取焦点后保持transform的焦点
          setTimeout(() => {
            if (!this.showSetting) {
              this.showPoint = false
            }
          }, 10)
        }
      },
      // 设置框焦点
      settingFocus(event) {
        this.showSetting = true
      },
      // 设置框失焦
      settingBlur(event) {
        // 设置框失焦重获焦点问题
        if (event.relatedTarget) {
          if (event.relatedTarget.type !== 'text' && (event.relatedTarget.id === this.board.boardId ||
            event.target.offsetParent.offsetParent.id !== event.relatedTarget.id)) {
            event.target.offsetParent.offsetParent.focus()
            event.relatedTarget.focus()
          }
        }
        this.showSetting = false
      },
      // top绑定input事件
      inputTop(event) {
        const value = event.target.value
        if (value < 0) {
          this.style.top = 0
        }
        if (value > this.board.boardHeight - this.style.height) {
          this.style.top = this.board.boardHeight - this.style.height
        }
      },
      // top绑定change事件
      changeTop(event) {
        this.com.comTop = this.style.top
      },
      // left绑定input事件
      inputLeft(event) {
        const val = event.target.value
        if (val < 0) {
          this.style.left = 0
        }
        if (val > this.board.boardWidth - this.style.width) {
          this.style.left = this.board.boardWidth - this.style.width
        }
      },
      // left绑定change事件
      changeLeft(event) {
        this.com.comLeft = this.style.left
      },
      // height绑定input事件
      inputHeight(event) {
        const val = event.target.value
        if (val < 0) {
          this.style.height = 100
        }
        if (val > this.board.boardHeight - this.style.top) {
          this.style.height = this.board.boardHeight - this.style.top
        }
      },
      // height绑定change事件
      changeHeight(event) {
        this.com.comHeight = this.style.height
      },
      // width绑定input事件
      inputWidth(event) {
        const val = event.target.value
        if (val < 0) {
          this.style.width = 100
        }
        if (val > this.board.boardWidth - this.style.left) {
          this.style.width = this.board.boardWidth - this.style.left
        }
      },
      // width绑定change事件
      changeWidth(event) {
        this.com.comWidth = this.style.width
      },
      // index绑定change事件
      changeIndex(event) {
        this.com.index = this.style.index
      },
      // 删除组件
      deleteTransDiv() {
        this.$emit('deleteTransDiv', this.com)
      },
      editTransDiv() {
        this.$router.push({ name: 'EditComp', params: { compId: this.com.comId }})
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../style/variables.scss';

  /*移动*/
  .move-content-outer {
    width: 100%;
    height: 100%;
    text-align: center;
    line-height: 100%;
    position: absolute;
    &:focus {
       outline: none;
    }
  }

  /* 八个方位的div控制 */
  .move-content-direction {
    width: 5px;
    height: 5px;
    border: 1px $bg-border solid;
    background-color: $third-bg;
    position: absolute;
    padding: 4px;
    border-radius: 4px;
    &::before {
      content: "123";
      background-color: transparent;
      color: transparent;
      font-size: 10px;
      position: absolute;
      top: -5px;
      left: -5px;
    }
  }

  /* 八个方位的div各自的div */
  .move-content-direction-n {
    cursor: n-resize;
    left: 50%;
    top: -7px;
    margin-left: -4px;
  }

  .move-content-direction-ne {
    cursor: ne-resize;
    top: -7px;
    right: -7px;
  }

  .move-content-direction-e {
    cursor: e-resize;
    top: 50%;
    right: -7px;
    margin-top: -4px;
  }

  .move-content-direction-se {
    cursor: se-resize;
    bottom: -7px;
    right: -7px;
  }

  .move-content-direction-s {
    cursor: s-resize;
    bottom: -7px;
    left: 50%;
    margin-left: -4px;
  }

  .move-content-direction-sw {
    cursor: sw-resize;
    left: -7px;
    bottom: -7px;
  }

  .move-content-direction-w {
    cursor: w-resize;
    left: -7px;
    top: 50%;
    margin-top: -4px;
  }

  .move-content-direction-nw {
    cursor: nw-resize;
    left: -7px;
    top: -7px;
  }

  /* 设置框 */
  .move-content-setting {
    background-color: $background-comment;
    border: 2px $bg-border dotted;
    position: absolute;
    border-radius: 3px;
    left: 50%;
    margin-left: -80px;
  }

  .move-content-text {
    font-weight: 500;
    font-size: 18px;
    float: left;
    margin: 3.5px;
    color: $black-comment;
  }

  .move-content-input {
    width: 72px;
    margin: 2px;
    float: right;
    background-color: $background-comment;
    border: 1px solid $bg-border;
    color: $black-comment;
  }

  .move-content-button {
    background-color: $bg-border;
    border: none;
    color: $first-font;
    border-radius: 3px;
    margin: 1px 0 0 3px;
    &:focus {
      outline: none;
    }
    &:hover {
      color: $second-font;
    }
  }

</style>
