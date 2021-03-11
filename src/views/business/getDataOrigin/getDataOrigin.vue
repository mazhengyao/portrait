<template>
  <!--  主div-->
  <div class="tree-page">
    <!--    左侧div-->
    <div class="leftDiv">
      <!--      新增数据源按钮div-->
      <div class="innerLeftTopDiv">
        <dw-button dw-key="appendOriginButton" type="primary" size="mini" class="appendOriginButton"
                   @click="appendOrigin">新增数据源
        </dw-button>
      </div>
      <!--      左侧数据源树div-->
      <div class="innerLeftBottomDiv tree">
        <el-scrollbar style="height:100%">
          <el-tree :data="data"
                   class="treeNode"
                   node-key="id"
                   :default-expanded-keys="expandKey"
                   accordion
                   :expand-on-click-node="false"
                   @node-click="requestData">
            <span slot-scope="{ node, data }"
                  class="custom-tree-node">
              <!-- 如果是编辑状态 -->
              <template v-if="data.isEdit === 1">
                <el-input ref="input"
                          v-model="newlabel"
                          class="el-input"
                          @keyup.enter.native="() => {$refs.input.blur()}"
                          @blur="() => submitEdit(node,data)"/>
              </template>
              <!-- 如果不是编辑状态 -->
              <span v-else v-text="data.label"/>
              <span>

                <el-button type="text"
                           size="mini"
                           @click="() => edit(node,data)">
                  <i class="el-icon-edit"/>
                </el-button>

                <el-button v-if="data.level < 2"
                           type="text"
                           size="mini"
                           @click="() => append(node,data)">
                  <i class="el-icon-plus"/>
                </el-button>

                <el-button type="text"
                           size="mini"
                           @click="() => remove(node, data)">
                  <i class="el-icon-delete"/>
                </el-button>
              </span>
            </span>
          </el-tree>
        </el-scrollbar>
      </div>
    </div>
    <!--    右侧配置数据源div-->
    <div class="rightContentDiv">
      <div v-show="sign === 'origin'" class="rightDiv">
        <div id="data1" class="editAll">{{ OriginTitle }}--配置数据源</div>
        <div class="inputOption">
          <dw-form v-loading="loading" :element-loading-background="systemColor.loadingColor" dw-key="formDataSource" :form-data="formData" label-width="100px"
                   element-loading-text="请先编辑左侧节点标题">
            <dw-select dw-key="DataBase" :value.sync="formData.DataBase" placeholder="请选择" label="数据库：" span="11"
                       class="SqlSelect" code="SJY" required :on-change="linkChange"/>
            <dw-input dw-key="IP" :value.sync="formData.IP" placeholder="请输入内容" label="IP地址：" span="11" class="SqlSelect"
                      type="text" required :on-change="linkChange"/>
            <dw-input dw-key="Port" :value.sync="formData.Port" placeholder="请输入内容" label="端口号：" span="11"
                      class="SqlSelect" type="text" required :on-change="linkChange"/>
            <dw-input dw-key="Model" :value.sync="formData.Model" placeholder="请输入内容" label="Model：" span="11"
                      class="SqlSelect" type="text" required :on-change="linkChange"/>
            <dw-input dw-key="UserName" :value.sync="formData.UserName" placeholder="请输入内容" label="用户名：" span="11"
                      class="SqlSelect" type="text" required :on-change="linkChange"/>
            <dw-input dw-key="PassWord" :value.sync="formData.PassWord" placeholder="请输入内容" label="密  码：" span="11"
                      class="SqlSelect" type="text" password required :on-change="linkChange"/>
          </dw-form>
        </div>
        <div class="buttons">
          <dw-button dw-key="linkButton" type="primary" size="medium" class="button" @click="linkTest">测试连接</dw-button>
          <dw-button dw-key="saveButton" type="primary" size="medium" class="button" @click="saveOption">保存</dw-button>
        </div>
      </div>
      <!--    选择类别部分div-->
      <div v-show="sign === 'category'" class="rightDiv">
        <div id="data2" class="editAll">{{ CategoryTitle }}--类别选择</div>
        <div class="inputOption">
          <dw-form v-loading="loading" :element-loading-background="systemColor.loadingColor" dw-key="formDataCategory" :form-data="CategoryData" label-width="100px"
                   element-loading-text="请先编辑左侧节点标题">
            <dw-select dw-key="Category" :value.sync="CategoryData.Category" placeholder="请选择" label="类别：" span="11"
                       class="CategorySelect" code="RYLB" required/>
          </dw-form>
        </div>
        <div class="buttons">
          <dw-button dw-key="saveButton" type="primary" size="medium" class="button" @click="saveCategory">保存</dw-button>
        </div>
      </div>
      <!--    SQL编写部分div-->
      <div v-show="sign === 'exe'" class="rightDiv">
        <div id="data3" class="editAll">{{ SqlTitle }}</div>
        <codemirror v-model="code" v-loading="loading" :element-loading-background="systemColor.loadingColor" :options="cmOption" class="textArea"
                    element-loading-text="请先编辑左侧节点标题" :on-change="sqlSignChange"/>
        <div class="buttons">
          <dw-button dw-key="testButton" type="primary" size="medium" class="button" @click="exeTest">测试运行</dw-button>
          <dw-button dw-key="button" type="primary" size="medium" class="button" @click="saveSQL">保存</dw-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  // 引入全局方法
  import {codemirror} from 'vue-codemirror'
  // language
  import 'codemirror/mode/sql/sql.js'
  // theme css
  import 'codemirror/theme/cobalt.css'
  // color css
  import systemColor from '../../../style/variables.scss'

  export default {
    name: 'GetDataOrigin',
    components: {
      codemirror
    },
    data() {
      return {
        data: [],
        newlabel: '',
        SqlTitle: '',
        OriginTitle: '',
        CategoryTitle: '',
        treeId: '',
        treePId: '',
        treeLevel: '',
        sign: '',
        expandKey: [],
        formData: {
          IP: '',
          Port: '',
          Model: '',
          UserName: '',
          PassWord: '',
          DataBase: ''
        },
        CategoryData: {
          Category: ''
        },
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        cmOption: {
          tabSize: 4,
          styleActiveLine: true,
          lineNumbers: true,
          lineWrapping: true,
          line: true,
          mode: 'text/x-mysql'
        },
        code: '',
        loading: false,
        sqlSign: false,
        linkSign: false,
        systemColor: {
          bgColor: systemColor.boardBg,
          borderColor: systemColor.borderColor,
          loadingColor: systemColor.firstBg
        }
      }
    },
    mounted() {
      this.createOriginTree()
    },
    methods: {
      // 请求后端生成数据源树
      createOriginTree() {
        this.$ajax('dataSource.do?method=getDataSourceTreeList', { // 参数
        }).then(jsonResult => { // 成功后操作
          this.data = jsonResult.data
        })
      },
      // 增加树节点 (逻辑判断)
      append(node, data) {
        if (data.level === 0) {
          if ((data.address !== undefined) && (data.address !== null)) {
            this.CategoryData.Category = '' // 防止点击其他二级节点后，category中存有数值
            this.appendNode(node, data)
          } else {
            this.$alertWarning('请先配置好连接信息并保存后方可进行新增操作！！！')
          }
        }
        if (data.level === 1) {
          if ((data.type !== undefined) && (data.type !== null)) {
            this.appendNode(node, data)
          } else {
            this.$alertWarning('请先选择类别并保存后方可进行新增操作！！！')
          }
        }
      },
      // 增加树节点
      appendNode(node, data) {
        node.expanded = true
        const newChild = {
          pid: data.id,
          isEdit: 1,
          label: '临时标题',
          level: data.level + 1,
          children: []
        }
        if (!data.children) {
          this.$set(data, 'children', [])
        }
        this.loading = true
        data.children.push(newChild)
        setTimeout(() => {
          this.$nextTick(() => {
            this.$refs.input.focus()
            this.$refs.input.$el.click()
          })
        }, 100)
      },
      // 删除树节点
      remove(node, data) {
        this.$confirm('清空节点内容将删除与节点相关的所有内容，确定执行吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (data.id) {
            this.$ajax('dataSource.do?method=deleteDataSourceTreeList', { // 参数
              level: this.treeLevel,
              id: this.treeId
            }).then(jsonResult => { // 成功后操作
              if (jsonResult.flag === true) {
                this.$alertSuccess('删除成功!!')
                this.createOriginTree()
                this.expandKey = [this.treePId]
              }
            })
          } else {
            const parent = node.parent
            const children = parent.data.children || parent.data
            const index = children.findIndex(d => d.id === data.id)
            children.splice(index, 1)
          }
          this.sign = 'false'
        }).catch(() => {
          console.log('取消删除')
        })
      },
      // 在编辑框失去焦点后删除空节点
      cancelEdit(node, data) {
        if (data.id) {
          this.$confirm('清空节点内容将删除与节点相关的所有内容，确定执行吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.$ajax('dataSource.do?method=deleteDataSourceTreeList', { // 参数
              level: this.treeLevel,
              id: this.treeId
            }).then(jsonResult => { // 成功后操作
              if (jsonResult.flag === true) {
                this.$alertSuccess('删除成功!!')
                this.createOriginTree()
                this.expandKey = [this.treePId]
              }
            })
            this.sign = 'false'
          }).catch(() => {
            this.$set(data, 'isEdit', 0)
            console.log('取消删除')
          })
        } else {
          const parent = node.parent
          const children = parent.data.children || parent.data
          const index = children.findIndex(d => d.id === data.id)
          children.splice(index, 1)
          this.$set(data, 'isEdit', 0)
          this.$alertError('节点不输入内容将删除空节点！！！')
        }
      },
      // 编辑节点
      edit(node, data) {
        this.loading = true
        this.$set(data, 'isEdit', 1)
        this.newlabel = data.label
        this.$nextTick(() => {
          this.$refs.input.focus()
        })
      },
      // 提交编辑节点
      submitEdit(node, data) {
        this.loading = false
        if (data.label === this.newlabel) {
          this.newlabel = ''
          this.$set(data, 'isEdit', 0)
        } else if (!this.newlabel || !data.label) {
          this.cancelEdit(node, data)
          this.sign = 'false'
        } else {
          this.$set(data, 'label', this.newlabel)
          this.newlabel = ''
          this.$set(data, 'isEdit', 0)
          this.requestData(data)
          if (data.id && data.level === 0) {
            this.saveOption()
          }
          if (data.id && data.level === 1) {
            this.saveCategory()
          }
          if (data.id && data.level === 2) {
            this.saveSQL()
          }
        }
      },
      // 点击节点后请求当前节点存储的数据
      requestData(data) {
        this.treeId = data.id
        this.treePId = data.pid
        this.treeLevel = data.level
        if (data.level === 0) {
          this.sign = 'origin'
          this.OriginTitle = data.label ? data.label : ''
          this.formData.DataBase = data.code ? data.code : ''
          this.formData.IP = data.address ? data.address : ''
          this.formData.Port = data.port ? data.port : ''
          this.formData.Model = data.model ? data.model : ''
          this.formData.UserName = data.username ? data.username : ''
          this.formData.PassWord = data.password ? data.password : ''
          this.linkSign = false
        }
        if (data.level === 1) {
          this.sign = 'category'
          if (data.label) {
            this.CategoryTitle = data.label
          }
          if (data.type) {
            this.CategoryData.Category = data.type
          }
        }
        if (data.level === 2) {
          this.sign = 'exe'
          this.SqlTitle = data.label
          this.code = data.content
          this.sqlSign = false
          if (data.content === undefined) {
            this.code = ''
          }
        }
      },
      // 添加根节点
      appendOrigin(node) {
        node.expanded = true
        const newChild = {
          isEdit: 1,
          label: '临时标题',
          level: 0
        }
        this.loading = true
        this.data.push(newChild)
        setTimeout(() => {
          this.$nextTick(() => {
            this.$refs.input.focus()
            this.$refs.input.$el.click()
          })
        }, 100)
      },
      // 保存一级节点数据源配置
      async saveOption() {
        try {
          await this.$formValidate('formDataSource')
          if (this.formData.IP.indexOf(' ') !== -1 ||
            this.formData.Port.indexOf(' ') !== -1 ||
            this.formData.Model.indexOf(' ') !== -1 ||
            this.formData.UserName.indexOf(' ') !== -1 ||
            this.formData.PassWord.indexOf(' ') !== -1) {
            this.$alertError('不允许输入空格占位符！！')
          } else if (this.linkSign === false) {
            this.$alertError('请先进行测试，连接测试通过后，再进行保存！！！')
          } else {
            if (this.treeId === undefined) { // 新增后保存
              this.$ajax('dataSource.do?method=addDataSourceTreeList', { // 参数
                level: this.treeLevel,
                code: this.formData.DataBase,
                address: this.formData.IP,
                port: this.formData.Port,
                model: this.formData.Model,
                username: this.formData.UserName,
                password: this.formData.PassWord,
                name: this.OriginTitle
              }).then(jsonResult => { // 成功后操作
                if (jsonResult.flag === true) {
                  this.$alertSuccess('新增成功!!')
                  this.createOriginTree()
                  this.sign = 'false'
                }
              })
            } else { // 修改后保存
              this.$ajax('dataSource.do?method=updateDataSourceTreeList', { // 参数
                id: this.treeId,
                level: this.treeLevel,
                code: this.formData.DataBase,
                address: this.formData.IP,
                port: this.formData.Port,
                model: this.formData.Model,
                username: this.formData.UserName,
                password: this.formData.PassWord,
                name: this.OriginTitle
              }).then(jsonResult => { // 成功后操作
                if (jsonResult.flag === true) {
                  this.$alertSuccess('修改成功!!')
                  this.linkSign = false
                  this.createOriginTree()
                }
              })
            }
          }
        } catch (e) {
          this.$alertError(e)
        }
      },
      // 保存二级节点类别配置
      async saveCategory() {
        try {
          await this.$formValidate('formDataCategory')
          if (this.treeId === undefined) { // 新增后保存
            this.$ajax('dataSource.do?method=addDataSourceTreeList', { // 参数
              level: this.treeLevel,
              fkid: this.treePId,
              type: this.CategoryData.Category,
              name: this.CategoryTitle
            }).then(jsonResult => { // 成功后操作
              if (jsonResult.flag === true) {
                this.$alertSuccess('新增成功!!')
                this.createOriginTree()
                this.sign = 'false'
                this.expandKey = [this.treePId]
              }
            })
          } else { // 修改后保存
            this.$ajax('dataSource.do?method=updateDataSourceTreeList', { // 参数
              id: this.treeId,
              level: this.treeLevel,
              type: this.CategoryData.Category,
              name: this.CategoryTitle
            }).then(jsonResult => { // 成功后操作
              if (jsonResult.flag === true) {
                this.$alertSuccess('修改成功!!')
                this.createOriginTree()
                this.expandKey = [this.treePId]
              }
            })
          }
        } catch (e) {
          this.$alertError(e)
        }
      },
      // 保存三级节点SQL语句
      saveSQL() {
        if (this.code.match(/^[ ]*$/) || this.code === null || this.code === undefined) {
          this.$alertError('SQL为空，不允许保存！！！')
        } else if (this.sqlSign === false) {
          this.$alertError('请先进行测试，SQL测试通过后，再进行保存！！！')
        } else {
          if (this.treeId === undefined) { // 新增后保存
            this.$ajax('dataSource.do?method=addDataSourceTreeList', { // 参数
              level: this.treeLevel,
              fkid: this.treePId,
              content: this.code,
              name: this.SqlTitle
            }).then(jsonResult => { // 成功后操作
              if (jsonResult.flag === true) {
                this.$alertSuccess('新增成功!!')
                this.createOriginTree()
                this.sign = 'false'
                this.expandKey = [this.treePId]
              }
            })
          } else { // 修改后保存
            this.$ajax('dataSource.do?method=updateDataSourceTreeList', { // 参数
              id: this.treeId,
              level: this.treeLevel,
              content: this.code,
              name: this.SqlTitle
            }).then(jsonResult => { // 成功后操作
              if (jsonResult.flag === true) {
                this.$alertSuccess('修改成功!!')
                this.createOriginTree()
                this.sqlSign = false
                this.expandKey = [this.treePId]
              }
            })
          }
        }
      },
      // 数据库连接测试
      async linkTest() {
        try {
          await this.$formValidate('formDataSource')
          if (this.formData.IP.indexOf(' ') !== -1 ||
            this.formData.Port.indexOf(' ') !== -1 ||
            this.formData.Model.indexOf(' ') !== -1 ||
            this.formData.UserName.indexOf(' ') !== -1 ||
            this.formData.PassWord.indexOf(' ') !== -1) {
            this.$alertError('不允许输入空格占位符！！')
          } else {
            this.$ajax('dataSource.do?method=dbLinkTest', { // 参数
              dbtype: this.formData.DataBase,
              url: this.formData.IP + ':' + this.formData.Port + '/' + this.formData.Model,
              username: this.formData.UserName,
              password: this.formData.PassWord
            }).then(jsonResult => { // 成功后操作
              if (jsonResult.flag === true) {
                this.linkSign = true
                this.$alertSuccess('数据库测试连接成功！！！')
              } else {
                this.linkSign = false
                this.$alertError('连接信息有误，请检查！！！')
                console.error(jsonResult.error)
              }
            })
          }
        } catch (e) {
          this.$alertError(e)
        }
      },
      // 运行测试SQL
      exeTest() {
        this.$ajax('dataSource.do?method=checkSqlInfo', { // 参数
          pid: this.treePId,
          sql: this.code,
          Id: this.$store.state.user.userInfo.orgnid
        }).then(jsonResult => { // 成功后操作
          if (jsonResult.flag === true) {
            this.sqlSign = true
            this.$alertSuccess('SQL测试成功！！！')
          } else {
            this.sqlSign = false
            this.$alertError(jsonResult.error)
          }
        })
      },
      // change事件，input框内容改动，则将保存标志置为false
      linkChange() {
        this.linkSign = false
      },
      // change事件，input框内容改动，则将保存标志置为false
      sqlSignChange() {
        this.sqlSign = false
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import "../../../style/variables";

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
    //background-color: $first-bg;
    color: $black-comment; //$first-font
  }

  .tree-page {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .rightDiv {
    height: 100%;
    width: 100%;
    float: left;
    border: 10px solid #61a2ea;
    border-radius: 20px;
    position: relative;
    .buttons {
      width: 100%;
      height: 9%;
      text-align: right;
      padding-top: 1%;
      .button {
        margin-right: 10px;
      }
    }
  }

  .leftDiv {
    height: 100%;
    width: 25%;
    float: left;
    padding-left: 2%;
    padding-top: 1%;
    border: 5px solid $background-comment;
    border-radius: 20px;
    background-color: $second-font;
  }
  .rightContentDiv {
    height: 100%;
    width: 75%;
    margin-left: 25%;
    border: 5px solid $background-comment;
    .rightDiv {
      background-color: $second-font;
    }
  }
  
  .innerLeftBottomDiv {
    height: 92%;
    float: left;
    margin-top: 3%;
    //background-color: $first-bg;
  }

  .innerLeftTopDiv {
    position: relative;
    height: 4%;
    width: 100%;
    text-align: right;
    margin-top: 2%;
    //background-color: $first-bg;
  }

  .appendOriginButton {
    margin-right: 10px;
  }

  .tree {
    width: 100%;
    margin-right: 1%;
  }

  .treeNode {
    //background-color: $first-bg;
    color: $first-font;
  }

  .textArea {
    height: 84%;
    resize: none;
    font-size: 20px;

    ::v-deep {
      .CodeMirror {
        height: 100%;
        border-top: 3px solid $black-comment;
        background: #F0F0F0;
        color: $black-comment;
      }
      .CodeMirror-gutters {
        background: #c8c8c8;
        color: $black-comment;
      }
      .CodeMirror-scroll {
        overflow-y: auto;
        overflow-x: hidden;
      }
    }
  }

  .inputOption {
    height: 84%;
  }

  .SqlSelect {
    margin: 2% 20% 1% 25%;
  }

  .CategorySelect {
    margin: 8% 20% 1% 25%;
  }

  ::v-deep {
    .el-form-item__label {
      color: $black-comment;
      font-weight: 500;
      font-size: 20px;
      vertical-align: middle;
    }

    .el-input__inner {
      vertical-align: middle;
      background-color: $background-comment;
      color: $black-comment;
    }
  }

  .editAll {
    color: $title-edit;
    font-weight: 600;
    font-size: 25px;
    padding: 1% 0 0 1%;
    height: 7%;
  }

  .originzone {

  }

  .editzone {

  }

  /*修改el-input高度*/
  ::v-deep .el-input__inner {
    height: 25px;
  }

  /*Node节点选中和鼠标经过样式*/
  ::v-deep {
    /*鼠标点击时的背景色样式*/
    /* .el-tree-node:focus > .el-tree-node__content {
      background-color: $first-bg !important;
    } */

    /*鼠标经过时的背景色样式*/
    /* .el-tree-node__content:hover {
      background-color: $first-bg;
    } */

    /*鼠标点击空白区域使其失去焦点时的背景色样式*/
    /* .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
      background-color: $first-bg;
    } */

    .el-scrollbar .el-scrollbar__wrap {
      overflow-x: hidden;
    }
  }
</style>
