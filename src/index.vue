<!--
 * @Description: 统计分析页面
 * @Author: zhaoyp
 * @Date: 2021-01-29 19:33:32
 * @LastEditTime: 2021-06-09 15:13:56
 * @LastEditors:  
-->
<template>
  <div class="eauAnalysisBox">
    <div class="treebox">
      <el-tree
        ref="trees"
        :data="treeData"
        :props="defaultProps"
        node-key="id"
        :default-expanded-keys="expanded"
        :expand-on-click-node="false"
        :show-checkbox="true"
        :check-on-click-node="true"
        :check-strictly="true"
        @node-click="getchange"
        :v-loading="loading"
        @check="checkSelcet"
      >
        <!-- @check-change="getDataItem('tree')" -->
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <img
            v-if="data.channel"
            class="treeshowpic"
            :src="chanelpic"
            alt=""
          />
          <img
            v-else-if="data.device"
            class="treeshowpic"
            :src="devicepic"
            alt=""
          />
          <img v-else class="treeshowpic" :src="orgtreepic" alt="" />
          <span>
            {{ node.label }}
          </span>
        </span>
      </el-tree>
      <!-- expand-on-click-node 是否在点击节点的时候展开或者收缩节点， 默认值为 true，如果为 false，则只有点箭头图标的时候才会展开或者收缩节点。 -->
    </div>
    <div class="tabbox">
      <div class="flex flexb tabhead">
        <div class="flex flexs">
          <span class="icon"></span>
          <div class="menename">{{ $t('report.statisticalanalysis') }}</div>
        </div>
        <div class="searchform flex flexe">
          <el-form
            :inline="true"
            @submit.native.prevent
            :model="searchform"
            class="flex flexc"
          >
            <el-form-item :label="$t('theads.datatype') + '：'">
              <el-select
                v-model="searchform.dataType"
                :placeholder="$t('Cyc.Pleaseselect')"
                @change="getDataItem('search')"
              >
                <el-option
                  v-for="item in dataTypeList"
                  :key="item.value"
                  :label="item.dictName"
                  :value="item.dictCode"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('report.TimeType') + '：'">
              <el-select
                v-model="searchform.dateType"
                :placeholder="$t('Cyc.Pleaseselect')"
                @change="_dateChange"
              >
                <el-option
                  v-for="item in dateTypeList"
                  :key="item.dictCode"
                  :label="item.dictName"
                  :value="item.dictCode"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <div v-show="changePage">
              <el-form-item prop="startValue">
                <div class="block">
                  <span class="demonstration"
                    >{{
                      changePage
                        ? $t('report.thebasetime')
                        : $t('theads.Stime')
                    }}：</span
                  >
                  <el-date-picker
                    v-model="searchform.startValue"
                    :type="currentType.timeType"
                    :placeholder="
                      changePage
                        ? $t('report.basetime')
                        : $t('Cyc.PleaseSelectAStartTime')
                    "
                    prefix-icon="el-icon-date"
                    :picker-options="pickerOptions_start"
                    :format="currentType.format"
                    @change="onStartTimeChange"
                    popper-class="hourBox"
                  >
                  </el-date-picker>
                </div>
              </el-form-item>
              <el-form-item prop="endValue">
                <div class="block">
                  <span class="demonstration"
                    >{{
                      changePage
                        ? $t('report.thecomparisontime')
                        : $t('theads.Etime')
                    }}：</span
                  >
                  <el-date-picker
                    v-model="searchform.endValue"
                    :type="currentType.timeType"
                    :placeholder="
                      changePage
                        ? $t('report.comparisontime')
                        : $t('Cyc.PleaseSelectAEndTime')
                    "
                    prefix-icon="el-icon-date"
                    :picker-options="pickerOptions_end"
                    :format="currentType.format"
                    @change="onEndTimeChange"
                    popper-class="hourBox"
                  >
                  </el-date-picker>
                </div>
              </el-form-item>
            </div>
            <!-- 时间选择框 -->
            <MyTimeSelect
              v-show="!changePage"
              ref="timeSelect"
              :format="currentType.format"
              :time="[searchform.startValue, searchform.endValue]"
              @changeTime="changeTime"
            />

            <el-form-item v-if="hasPerm('system:search')">
              <!-- @click="_search(1)" -->
              <el-button
                class="searchbtn"
                type="primary"
                size="small"
                @click="doSearch"
                >{{ $t('btns.query') }}</el-button
              >
            </el-form-item>
            <el-form-item v-if="hasPerm('system:contrast')">
              <!--  -->
              <el-button type="warning" size="small" @click="_contrast"
                >{{
                  changePage
                    ? $t('report.Timeperiodstatistics')
                    : $t('report.Timepointcomparison')
                }}<i class="el-icon-sort el-icon--right"></i
              ></el-button>
            </el-form-item>
            <el-form-item
              v-if="hasPerm('system:eaupreview')"
              class="iframeModeHide"
            >
              <el-button type="primary" size="small" @click="_preview">{{
                $t('eauData.Singleunit')
              }}</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="tabmain inner_scroll_box">
        <div class="chartsbox padd25" ref="parchart">
          <div
            class="chartBox"
            id="chartBox"
            v-show="selectData.length > 0"
          ></div>
        </div>
        <div class="chooseData padd25">
          <!-- <div class="flex flexs">
            <span class="icon"></span>
            <div class="menename">{{ $t("lables.adddataitem") }}</div>
          </div> -->
          <el-row :class="showMorEIte ? 'dataTable heightAuto' : 'dataTable'">
            <el-col
              v-for="dataItem in chooseData"
              :key="dataItem.id"
              :xs="{ span: '4-8' }"
              :sm="{ span: '4-8' }"
              :lg="{ span: '4-8' }"
            >
              <div
                @click="_selectDataItem(dataItem)"
                class="dataItem"
                :title="
                  dataItem.dataUnit
                    ? dataItem.dataName + '(' + dataItem.dataUnit + ')'
                    : dataItem.dataName
                "
                :class="_isSelected(dataItem) ? 'active' : ''"
              >
                {{ dataItem.dataName
                }}<span v-if="dataItem.dataUnit"
                  >({{ dataItem.dataUnit }})</span
                >
              </div>
            </el-col>
          </el-row>
          <div
            class="showMore"
            v-if="chooseData.length > 10"
            @click="showMoreItem"
          >
            {{
              showMorEIte ? $t('statistics.packUp') : $t('statistics.showAll')
            }}
            <img v-if="!showMorEIte" class="showmoreImg" :src="transDown" />
            <img v-else class="showmoreImg" :src="transUp" />
          </div>
        </div>
        <p
          :id="chooseData.length == 0 ? 'nodatas' : 'nodata'"
          v-if="chooseData.length == 0 || selectData.length == 0"
        >
          {{ $t('lables.nodata') }}
        </p>
        <div class="returnTable padd25" v-show="selectData.length > 0">
          <div
            class="export flex flexe"
            v-if="timeTableData.length || tableList.length"
          >
            <!-- 导出 -->
            <el-button
              v-if="hasPerm('system:export')"
              type="primary"
              @click="exportList"
              >{{ $t('btns.export') }}</el-button
            >
          </div>
          <template v-if="!changePage">
            <div style="width: 100%" class="inner_scroll_box w400">
              <div
                :class="
                  tableList.length == 3 ? 'flex flexs w1500' : 'flex flexs w100'
                "
              >
                <div
                  v-for="(item, index) in tableList"
                  :key="index"
                  class="w50"
                  :style="'width:' + 100 / tableList.length + '%'"
                >
                  <el-table
                    :class="tableList.length > 1 ? 'firstwidth' : ''"
                    :stripe="true"
                    :border="true"
                    :data="item"
                    :cell-style="cellStyleFn"
                    :header-cell-style="headerCellStyleFn"
                  >
                    <el-table-column
                      v-if="index == 0"
                      align="center"
                      prop="readd"
                      :label="$t('theads.time')"
                      width="170px"
                    >
                    </el-table-column>
                    <el-table-column :label="item[0]['name']" align="center">
                      <el-table-column
                        prop="current"
                        :label="$t('theads.Currentperiod')"
                        align="center"
                        show-overflow-tooltip
                      >
                      </el-table-column>
                      <el-table-column
                        prop="theSameTerm"
                        :label="$t('theads.Sameperiod')"
                        show-overflow-tooltip
                        align="center"
                      >
                      </el-table-column>
                      <el-table-column
                        prop="yearOnYear"
                        show-overflow-tooltip
                        :label="$t('theads.Yearonyear')"
                        align="center"
                      >
                        <template slot-scope="scope">
                          <span
                            v-if="
                              scope.row.yearOnYear == '-' ||
                              Number(parseInt(scope.row.yearOnYear)) == 0
                            "
                            >{{ scope.row.yearOnYear }}</span
                          >
                          <span
                            v-else
                            :class="
                              Number(parseInt(scope.row.yearOnYear)) > 0
                                ? 'red'
                                : 'green'
                            "
                            >{{ scope.row.yearOnYear }}</span
                          >
                        </template>
                      </el-table-column>
                      <el-table-column
                        show-overflow-tooltip
                        prop="priorPeriod"
                        :label="$t('theads.Lastissue')"
                        align="center"
                      >
                      </el-table-column>
                      <el-table-column
                        prop="monthOnMonth"
                        show-overflow-tooltip
                        :label="$t('theads.Chaincomparison')"
                        align="center"
                      >
                        <template slot-scope="scope">
                          <span
                            v-if="
                              scope.row.monthOnMonth == '-' ||
                              Number(parseInt(scope.row.monthOnMonth)) == 0
                            "
                            >{{ scope.row.monthOnMonth }}</span
                          >
                          <span
                            v-else
                            :class="
                              Number(parseInt(scope.row.monthOnMonth)) > 0
                                ? 'red'
                                : 'green'
                            "
                            >{{ scope.row.monthOnMonth }}</span
                          >
                        </template>
                      </el-table-column>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </div>
          </template>
          <!-- 时间点表格数据展示 -->
          <template v-else>
            <el-table
              :header-cell-style="headerCellStyleFn"
              :data="timeTableData"
              v-if="timeTableData.length"
              :cell-style="cellStyleFn1"
              :stripe="true"
              border
            >
              <el-table-column
                prop="name"
                show-overflow-tooltip
                align="center"
                :label="$t('theads.Comparisonitemname')"
              >
              </el-table-column>
              <el-table-column
                prop="startTimeData"
                align="center"
                :label="
                  searchform.dateType == 'HOUR'
                    ? startTimeLabel + ':00:00'
                    : startTimeLabel
                "
              >
              </el-table-column>
              <el-table-column
                prop="endTimeData"
                align="center"
                :label="
                  searchform.dateType == 'HOUR'
                    ? endTimeLabel + ':00:00'
                    : endTimeLabel
                "
              >
              </el-table-column>
              <!-- prop="increaseAndDecrease" -->
              <el-table-column
                :label="$t('theads.Incrementanddecrement')"
                align="center"
              >
                <template slot-scope="scope">
                  <span
                    v-if="
                      scope.row.increaseAndDecrease == '-' ||
                      Number(parseInt(scope.row.increaseAndDecrease)) == 0
                    "
                    >{{ scope.row.increaseAndDecrease }}</span
                  >
                  <span
                    v-else
                    :class="
                      Number(parseInt(scope.row.increaseAndDecrease)) < 0
                        ? 'green'
                        : 'red'
                    "
                    >{{ scope.row.increaseAndDecrease }}</span
                  >
                </template>
              </el-table-column>
              <el-table-column
                align="center"
                :label="$t('theads.Chaincomparison')"
              >
                <template slot-scope="scope">
                  <span
                    v-if="
                      scope.row.turnsRatio == '-' ||
                      Number(parseInt(scope.row.turnsRatio)) == 0
                    "
                    >{{ scope.row.turnsRatio }}</span
                  >
                  <span
                    v-else
                    :class="
                      Number(parseInt(scope.row.turnsRatio)) < 0
                        ? 'green'
                        : 'red'
                    "
                    >{{ scope.row.turnsRatio }}</span
                  >
                </template>
              </el-table-column>
            </el-table>
          </template>
        </div>
      </div>
    </div>
    <message
      :success="success"
      :info="message"
      :show="ismess"
      @close="_closemess"
    />
  </div>
</template>

<script>
import echarts from 'echarts'
import { eaudataorg, dictData } from '@/api/eaudatas'
import {
  getDataUnitBy0rgId,
  getEmergyStatistics,
  getEmergyStatisticsReport,
  gettimesData,
  gettimesReports,
} from '@/api/eauanalysis'
import { dateFormat } from '@/utils/utils'
export default {
  name: 'eauanalysis',
  data() {
    return {
      orgtreepic: require('@/assets/ximg/orgpic.png'),
      devicepic: require('@/assets/ximg/device.png'),
      chanelpic: require('@/assets/ximg/passway.png'),
      transUp: require('@/assets/ximg/tranUp.png'),
      transDown: require('@/assets/ximg/tranDown.png'),
      changePage: false, //切换两时间点和时间段统计
      treeData: [], //树结构数据
      defaultProps: {
        children: 'children',
        label: 'orgName',
      },
      expanded: [], // 默认展开项
      preSelectTreeKeys: [],
      dataTypeList: [], //
      dateTypeList: [],
      currentType: {
        timeType: '', // 时间类型
        format: '',
      },
      searchform: {
        dataType: '', // 数据类型
        dateType: '', // 时间类型
        startValue: '', // 开始时间
        endValue: '', // 结束时间
      },
      chooseData: [], //数据项
      selectData: [], // 选中的数据项
      tableTitle: [], //时间段比较头部列表 1级表头
      tableDateTime: [], //时间段比较时间列表
      timeTableData: [], //时间点数据
      tableList: [],
      startTimeLabel: '',
      endTimeLabel: '',
      success: 1,
      message: '',
      ismess: false,
      currentPage: 1, //当前页
      currentSize: 10, // 每页多少条
      total: 0, // 总共多少条
      loading: true,
      w: 0,
      showMorEIte: false,
      secectTreeLength: 0, //组织机构选择的个数
      myChart: null,
      isSwitch: true,
      rightWidth: 65,
    }
  },

  components: {},
  created() {
    this.loading = true
    this.getTree()
  },
  computed: {
    pickerOptions_start() {
      let _this = this
      return {
        disabledDate(time) {
          if (!time) {
            return
          }
          if (time) {
            if (_this.searchform.dateType == 'HOUR') {
              return time.getTime() > Date.now() - 86400000
            } else {
              return time.getTime() > Date.now()
            }
          }
        },
      }
    },
    pickerOptions_end() {
      let _this = this
      return {
        disabledDate(time) {
          if (!time) return
          let time1 = _this.searchform.startValue
          if (time) {
            if (_this.searchform.dateType == 'HOUR') {
              return time.getTime() > Date.now() - 86400000
            } else {
              return time.getTime() > Date.now()
            }
          }
        },
      }
    },
  },
  watch: {
    secectTreeLength(val) {
      this.showMorEIte = false
    },
  },
  beforeRouteLeave(to, from, next) {
    this.isSwitch = false
    // 判断要跳转哪个页面 从而清除缓存
    sessionStorage.removeItem('treelist')
    sessionStorage.removeItem('orgid')
    next()
  },
  mounted() {
    this.w = this.$refs.parchart.offsetWidth - 60 + 'px'
  },
  methods: {
    // 显示更多
    showMoreItem() {
      this.showMorEIte = !this.showMorEIte
    },
    // 获取能耗单元树
    getTree() {
      eaudataorg().then((res) => {
        if (res.code == 'SUCCESS') {
          if (!this.isSwitch) return
          let data = res.data
          data[0].disabled = true
          this.treeData = data
          // 默认展开项
          let RouterTimeData = this.$route.query
          let routerOrgId = RouterTimeData.routerOrgId
          let TimeDateType = RouterTimeData.TimeDateType
          if (res.data.length) {
            let treelist = sessionStorage.getItem('treelist')
            if (treelist) {
              this.expanded = JSON.parse(treelist)
              this.orgId = sessionStorage.getItem('orgid')
              this.getleixing()
              this.getTimeleixing()
            } else {
              if (routerOrgId) {
                this.orgId = routerOrgId
                sessionStorage.setItem('orgid', routerOrgId)
                sessionStorage.setItem(
                  'treelist',
                  JSON.stringify([routerOrgId])
                )
                this.expanded.push(routerOrgId)
                this.getleixing()
                if (TimeDateType) {
                  this.getTimeleixing(1)
                } else {
                  this.getTimeleixing()
                }
              } else {
                let i = 0
                this._currData(data[0], i)
                this.orgId = this.expanded[0]
                sessionStorage.setItem('orgid', this.orgId)
                sessionStorage.setItem(
                  'treelist',
                  JSON.stringify(this.expanded)
                )
                // 初始化值 先请求树 在请求数据项 选中默认数据项 获取数据
                this.getleixing()
                this.getTimeleixing()
              }
            }
            this.$nextTick(() => {
              this.$refs.trees.setChecked(this.orgId, true)
            })
          }
        }
      })
    },
    // 递归查询id
    _currData(data, i = 0) {
      if (data) {
        if (data.flag) {
          let id = data.id
          this.expanded.push(id)
          i += 1
        }
        if (this.expanded.length >= 1) {
          return
        } else {
          if (data.children.length && i < 2) {
            this._currData(data.children[0], i)
          }
        }
      }
    },
    checkSelcet(val, ischeck, ischild) {
      this.getchange(val, ischeck)
    },
    getchange(val, ischeck, ischild) {
      if (val.id === '0') {
        return
      } else {
        if (!val.flag) {
          this.ismess = true
          this.success = 3
          this.message = this.$t('phrase.noauthorg')
          this.$refs.trees.setChecked(val, val.flag)
          return
        } else {
          //console.log(111);
          this.getDataItem('tree')
          this.orgId = val.id
          sessionStorage.setItem('orgid', this.orgId)
        }
      }
    },
    // 选择能耗单元，选择数据类型，获取数据项内容
    getDataItem(currentHandleType, flag) {
      //console.log(2222);
      let CheckedKeys = this.$refs.trees.getCheckedKeys()
      let { dataType } = this.searchform
      //console.log(CheckedKeys);
      if (currentHandleType == 'tree' && CheckedKeys.length > 3) {
        this.ismess = true
        //console.log(3333);
        this.success = 3
        this.message = this.$t('report.onlyThreeUnitchose') //最多只能选择3个能耗单元进行统计分析
        this.$refs.trees.setCheckedKeys(this.preSelectTreeKeys)
        return
      }
      this.selectData = []
      this.preSelectTreeKeys = CheckedKeys
      this.secectTreeLength = CheckedKeys.length
      if (dataType == '' || CheckedKeys.length == 0) {
        this.chooseData = []
        //console.log(4444);
        return
      }
      //console.log(5555);
      getDataUnitBy0rgId({
        orgIds: this.preSelectTreeKeys.join(','),
        dataType: dataType,
      }).then((res) => {
        if (res.code == 'SUCCESS') {
          this.chooseData = res.data
          if (this.chooseData.length) {
            // 初始化 调用一次获取数据接口
            this.selectData = [this.chooseData[0]]
          }
          this._search()
        }
      })
    },
    // 时间类型改变
    _dateChange(value) {
      switch (value) {
        case 'YEAR':
          this.currentType = {
            timeType: 'year',
            format: 'yyyy',
          }
          this.setYeartime()
          break
        case 'MONTH':
          this.currentType = {
            timeType: 'month',
            format: 'yyyy-MM',
          }
          this.setMouthtime()
          break
        case 'DAY':
          this.currentType = {
            timeType: 'date',
            format: 'yyyy-MM-dd',
          }
          this.setDaytime()
          break
        case 'HOUR':
          this.currentType = {
            timeType: 'datetime',
            format: 'yyyy-MM-dd HH',
          }
          this.setHourtime()
          break
      }
    },

    // 选择数据项
    _selectDataItem(dataItem) {
      let CheckedKeys = this.$refs.trees.getCheckedKeys()
      if (CheckedKeys.length == 0) {
        this.ismess = true
        this.success = 3
        this.message = this.$t('report.PleaseCheckTheEnergyUnitFirst') //请先勾选能耗单元
        return false
      }

      let { dataType, dateType, startValue, endValue } = this.searchform
      if (dateType == '') {
        this.ismess = true
        this.success = 3
        this.message = this.$t('report.selectTimeType') //请选择时间类型
        return false
      }
      if (!startValue) {
        this.ismess = true
        this.success = 3
        this.message = this.changePage
          ? this.$t('report.basetime')
          : this.$t('Cyc.PleaseSelectAStartTime')
        return false
      }
      if (!endValue) {
        this.ismess = true
        this.success = 3
        this.message = this.changePage
          ? this.$t('report.comparisontime')
          : this.$t('Cyc.PleaseSelectAEndTime')
        return false
      }
      if (this.selectData.length == 3) {
        let isselected = this.selectData.some((el) => {
          return el.id == dataItem.id
        })
        if (!isselected) {
          this.ismess = true
          this.success = 3
          this.message = this.$t('report.OnleyThreeCan') //最多只能选择3个同单位的数据项
          return false
        }
      }
      if (this._isSelected(dataItem)) {
        // 取消选中 不在请求
        this.selectData = this.selectData.filter(
          (item) => item.id !== dataItem.id
        )
        if (this.selectData.length == 0) {
          this.tableList = []
          if (this.myChart) {
            this.myChart.dispose()
          }
        } else {
          if (this.changePage) {
            this.searchTime()
          } else {
            this._search()
          }
        }
        return false
      }
      if (CheckedKeys.length == 1 && this.selectData.length > 0) {
        if (dataItem.dataUnit !== this.selectData[0].dataUnit) {
          this.ismess = true
          this.success = 3
          this.message = this.$t('report.OnleyThreeCan') //最多只能选择3个同单位的数据项
          return
        }
      }
      if (this.selectData.length > 0 && CheckedKeys.length > 1) {
        if (dataItem.dataUnit !== this.selectData[0].dataUnit) {
          this.ismess = true
          this.success = 3
          this.message = this.$t('report.OnleyOneCan') //只能选择1个数据项
          return false
        }
      }
      if (
        (this.$refs.trees.getCheckedNodes().length > 1 &&
          this.selectData.length >= 1) ||
        (this.$refs.trees.getCheckedNodes().length =
          1 && this.selectData.length >= 3)
      ) {
        this.ismess = true
        this.success = 3
        this.message = this.$t('report.OnleyOneCan') //只能选择1个数据项
        return false
        // this.selectData = this.selectData.slice(1, this.selectData.length);
      }
      this.selectData.push(dataItem)
      if (this.changePage) {
        this.searchTime()
      } else {
        this._search()
      }
    },
    //点击查询按钮
    doSearch() {
      if (this.changePage) {
        this.searchTime('yes')
      } else {
        this._search('yes')
      }
    },
    // 判断当前数据项是否被选中
    _isSelected(dataItem) {
      for (let i in this.selectData) {
        if (this.selectData[i].id == dataItem.id) {
          return true
        }
      }
      return false
    },
    _contrast() {
      //console.log(this.selectData);
      this.selectData = [this.chooseData[0]]
      //时间段对比false  两时间点对比true
      this.changePage = !this.changePage
      this.tableList = []
      this.timeTableData = []
      if (this.myChart) {
        this.myChart.dispose()
      }
      if (this.changePage) {
        this.searchTime()
      } else {
        this._search()
      }
    },
    _preview() {
      // 能耗单元预览
      let CheckedKeys = this.$refs.trees.getCheckedKeys()
      //console.log(CheckedKeys);
      if (CheckedKeys.length > 1) {
        this.ismess = true
        this.success = 3
        this.message = this.$t('report.onlyOneUnitchose') //请先勾选能耗单元只能选择一个能耗单元
        return
      }
      let stime, etime
      if (!this.searchform.startValue) {
        stime = ''
      } else {
        stime = this._changeTime(
          this.searchform.startValue,
          this.currentType.format
        )
      }
      if (!this.searchform.endValue) {
        etime = ''
      } else {
        etime = this._changeTime(
          this.searchform.endValue,
          this.currentType.format
        )
      }
      //console.log(stime, etime);
      this.$router.push({
        path: '/eaubrowse',
        query: {
          routerOrgId: CheckedKeys[0],
          TimeDateType: this.searchform.dateType,
          TimeStartValue: stime + '',
          TimeEndValue: etime + '',
          TimeFormat: this.currentType.format,
          TimeDataType: this.currentType.timeType,
        },
      })
    },
    // 点击按钮查询
    searchTime(val) {
      /* this.tableList = [];
      this.timeTableData = [];
      if (this.myChart) {
        this.myChart.dispose();
      } */
      // 1个能耗单元可以选3个数据项 两时间点
      // 2个能号单元可以选1个数据项 两时间点
      let CheckedKeys = this.$refs.trees.getCheckedKeys()
      let { dataType, dateType, startValue, endValue } = this.searchform
      if (CheckedKeys.length == 0) {
        this.ismess = true
        this.success = 3
        this.message = this.$t('report.PleaseCheckTheEnergyUnitFirst') //请先勾选能耗单元
        return false
      }
      if (dataType == '') {
        this.ismess = true
        this.success = 3
        this.message = this.$t('report.selectDatatype') //请选择数据类型
        return false
      }
      if (this.searchform.dateType == '') {
        this.ismess = true
        this.success = 3
        this.message = this.$t('report.selectTimeType') //请选择时间类型
        return false
      }
      if (!startValue) {
        this.ismess = true
        this.success = 3
        this.message = this.$t('report.basetime') //请选择基准时间
        return false
      }
      if (!endValue) {
        this.ismess = true
        this.success = 3
        this.message = this.$t('report.comparisontime') //请选择对比时间
        return false
      }

      // 1能耗单元 限制条件
      if (CheckedKeys.length == 1) {
        if (this.selectData.length > 3) {
          this.ismess = true
          this.success = 3
          this.message = this.$t('report.OnleyThreeCan') //最多只能选择3个同单位的数据项
          return false
        }
      } else {
        // 多能耗单元限制条件
        if (this.selectData.length > 1) {
          this.ismess = true
          this.success = 3
          this.message = this.$t('report.OnleyOneCan') //只能选择1个数据项
          return false
        }
      }
      let dataItemsArr = []
      let dataIdsArr = []
      this.selectData.forEach((item) => {
        if (item) {
          dataItemsArr.push(item.dataCode)
          dataIdsArr.push(item.id)
        }
      })
      let startTime = '',
        endTime = ''
      switch (this.searchform.dateType) {
        case 'YEAR':
          startTime = this._changeTime(this.searchform.startValue, 'yyyy')
          endTime = this._changeTime(this.searchform.endValue, 'yyyy')
          break
        case 'MONTH':
          startTime = this._changeTime(this.searchform.startValue, 'yyyy-MM')
          endTime = this._changeTime(this.searchform.endValue, 'yyyy-MM')
          break
        case 'DAY':
          startTime = this._changeTime(this.searchform.startValue, 'yyyy-MM-dd')
          endTime = this._changeTime(this.searchform.endValue, 'yyyy-MM-dd')
          break
        case 'HOUR':
          startTime = this._changeTime(
            this.searchform.startValue,
            'yyyy-MM-dd hh'
          )
          endTime = this._changeTime(this.searchform.endValue, 'yyyy-MM-dd hh')
          break
      }
      this.startTimeLabel = startTime
      this.endTimeLabel = endTime
      if (startTime == endTime) {
        this.selectData = []
        this.ismess = true
        this.success = 3
        this.message = this.$t('report.differentTimes') //基准时间不能和对比时间相同
        return
      }
      if (this.selectData.length == 0 && val == 'yes') {
        this.ismess = true
        this.success = 3
        this.message = this.$t('statistics.PleaseSelectTheDataItem') //请选择数据项
        return false
      }
      let params = {
        startTime,
        endTime,
        dateType: this.searchform.dateType,
        dataItem: dataItemsArr.join(','),
        orgId: CheckedKeys.join(','),
        dataIds: dataIdsArr.join(','),
      }
      gettimesData(params).then((res) => {
        if (res.code == 'SUCCESS') {
          this.$nextTick(() => {
            this.handleEcharts(res.data)
          })
          this.timeTableData = res.data.table
        }
      })
    },

    handleEcharts(datas) {
      console.log(datas)
      let dataType = this.searchform.dateType
      let legendData = [],
        xAxisData = [],
        maxNum = 0,
        maxNumList = [],
        maxNameList = [],
        maxLength = 0,
        seriesData = []
      this.myChart = echarts.init(document.getElementById('chartBox'))
      let colors = ['#2EC7C9', '#B6A2DE', '#5AB1EF']
      if (this.changePage) {
        xAxisData = datas.list.orgNameList //柱状图 数据
        legendData = datas.list.dateList //顶部中间
        let markLineDatalist = []
        // for (let j = 0; j < xAxisData.length; j++) {
        //   if (datas.indicatorList[j].dataId.length) {
        //     let arrMk = datas.indicatorList[j].dataId;
        //     arrMk.forEach((el) => {
        //       let mkItem = {
        //         name: "",
        //         yAxis: "",
        //         lineStyle: {
        //           color: "",
        //         },
        //       };
        //       maxNumList.push(el.indicatorNum);
        //       mkItem.name = el.indicatorTypeName + "：" + el.indicatorNum;
        //       maxNameList.push(mkItem.name);
        //       mkItem.yAxis = el.indicatorNum;
        //       mkItem.lineStyle["color"] = colors[j];
        //       markLineDatalist.push(mkItem);
        //     });
        //   } else {
        //     maxNumList = [];
        //     maxNameList = [];
        //   }
        // }
        //console.log(datas.list.iconData);
        for (let i = 0; i < datas.list.iconData.length; i++) {
          let obj = {
            type: 'bar',
            barMaxWidth: 40,
            data: [],
            name: '',
            // markLine: {
            //   symbol: "none", //去掉箭头
            //   data: [],
            //   label: {
            //     color: "#333333",
            //     formatter: function (val) {
            //       return val.name;
            //     },
            //   },
            // },
          }
          obj.data = datas.list.iconData[i].data
          obj.name = datas.list.iconData[i].name
          // obj.markLine.data = []; //
          maxNumList.push(...obj.data)
          seriesData.push(obj)
        }
      } else {
        //console.log(datas);
        xAxisData = datas.dateList //柱状图 数据
        legendData = datas.tableName //顶部中间
        // datas.list 要处理的数据
        for (let i = 0; i < datas.list.length; i++) {
          let obj = {
            type: 'bar',
            barMaxWidth: 40,
            data: [],
            name: '',
            markLine: {
              symbol: 'none', //去掉箭头
              data: [],
              label: {
                color: '#333333',
                padding: [-20, 0, 0, 0], //基准值先进值边距
                // position: "end",
                formatter: function (val) {
                  console.log(val)
                  return val.name
                },
              },
            },
          }
          if (!datas.list[i].dataUnit) {
            obj.name = `${datas.list[i].orgId}-${this.transformData(
              datas.list[i].dataItem
            )}${datas.list[i].dataUnit}`
          } else {
            obj.name = `${datas.list[i].orgId}-${this.transformData(
              datas.list[i].dataItem
            )}(${datas.list[i].dataUnit})`
          }

          datas.list[i].dataList.forEach((el) => {
            obj.data.push(el.data)
            maxNumList.push(el.data)
          })
          // 循环生成markLine数据
          if (datas.indicatorList[i].dataId.length) {
            let arrMk = datas.indicatorList[i].dataId
            arrMk.forEach((el) => {
              let mkItem = {
                name: '',
                yAxis: '',
                lineStyle: {
                  color: '',
                },
              }
              maxNumList.push(el.indicatorNum)
              mkItem.name = el.indicatorTypeName + ':' + el.indicatorNum
              maxNameList.push(mkItem.name)
              mkItem.yAxis = el.indicatorNum
              mkItem.lineStyle['color'] = colors[i]
              obj.markLine.data.push(mkItem)
              if (el.indicatorNum.length > 3 && el.indicatorNum.length < 5) {
                this.rightWidth = 100
              } else if (el.indicatorNum.length > 5) {
                this.rightWidth = 150
              } else {
                this.rightWidth = 65
              }
            })
          } else {
            this.rightWidth = 65
          }
          //console.log(maxNumList);
          seriesData.push(obj)
        }
      }
      //console.log(legendData);
      //console.log(seriesData);
      maxNumList = maxNumList.map((el) => {
        if (el == '-') {
          el = 0
        }
        return Math.ceil(el)
      })
      let brr = maxNameList.map((el) => {
        return el.length + 1
      })
      if (brr && brr.length != 0) {
        maxLength = Math.max(...brr)
      } else {
        maxLength = 0
      }
      maxNum = Math.max(...maxNumList)
      //console.log(maxLength);
      this.myChart.setOption(
        {
          color: colors,
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              // 坐标轴指示器，坐标轴触发有效
              // type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
            },
            formatter: function (param) {
              let color = ['#2EC7C9', '#B6A2DE', '#5AB1EF']
              var relVal = param[0].name
              var value = 0
              for (var i = 0, l = param.length; i < l; i++) {
                value += param[i].value
                relVal +=
                  // "<br/>" + "<span :style='background:'><span>"+ param[i]["seriesName"] + ":" + param[i]["data"];
                  `<div class="flex flexs"><div style='background:${color[i]};margin-right:3px;width: 10px;height: 10px;border-radius: 50%;'></div><div>${param[i]['seriesName']}:${param[i]['data']}</div></div>`
              }
              return relVal
            },
          },
          legend: {
            data: legendData,
            type: 'scroll', // plain
            itemWidth: 20,
            itemHeight: 20,
            itemGap: 20,
          },
          grid: {
            /*  left: dataType == "HOUR" || dataType == "DAY" ? "3%" : 0, */
            left: 0,
            /*  right: maxLength + "%",   */
            right: this.rightWidth, //默认65
            bottom: 34,
            containLabel: true,
          },
          xAxis: {
            data: xAxisData,
            axisLine: {
              lineStyle: {
                color: '#eee',
              },
            },
            axisLabel: {
              interval: 0,
              rotate: xAxisData.length > 10 ? 60 : 0,
              textStyle: { color: '#999' },
            },
          },
          yAxis: {
            axisLine: {
              show: true,
              lineStyle: {
                color: '#eee',
              },
            },
            max: maxNum % 5 ? (maxNum % 5) + maxNum : maxNum,
            min: 0,
            interval: maxNum % 5 ? ((maxNum % 5) + maxNum) / 5 : maxNum / 5,
            splitLine: {
              show: true,
              lineStyle: {
                color: ['#eee'],
                width: 1,
                type: 'solid',
              },
            },
            axisLabel: {
              show: true,
              textStyle: { color: '#999' },
            },
          },
          series: seriesData,
          // dataZoom: [
          //   {
          //     type: "inside",
          //     zoomOnMouseWheel: true,
          //     moveOnMouseMove: true,
          //   },
          //   {
          //     type: "slider", // inside
          //     orient: "horizontal",
          //     bottom: 0,
          //   },
          // ],
        },
        true
      )
    },
    //查询
    _search(val) {
      //console.log("6666666666");
      if (this.myChart) {
        this.myChart.dispose()
      }
      this.tableList = []
      this.timeTableData = []

      let CheckedKeys = this.$refs.trees.getCheckedKeys()
      let { dataType, dateType, startValue, endValue } = this.searchform
      if (CheckedKeys.length == 0) {
        this.ismess = true
        this.success = 3
        this.message = this.$t('report.PleaseCheckTheEnergyUnitFirst')
        return false
      }
      if (dataType == '') {
        this.ismess = true
        this.success = 3
        this.message = this.$t('report.selectDatatype') //请选择数据类型
        return false
      }
      if (dateType == '') {
        this.ismess = true
        this.success = 3
        this.message = this.$t('report.selectTimeType') //请选择时间类型
        return false
      }
      if (!startValue) {
        this.ismess = true
        this.success = 3
        this.message = this.$t('Cyc.PleaseSelectAStartTime') //请选择开始时间
        return false
      }
      if (!endValue) {
        this.ismess = true
        this.success = 3
        this.message = this.$t('Cyc.PleaseSelectAEndTime') //请选择结束时间
        return false
      }
      if (this.selectData.length == 0 && val == 'yes') {
        this.ismess = true
        this.success = 3
        this.message = this.$t('statistics.PleaseSelectTheDataItem') //请选择数据项
        return false
      }
      let dataItemsArr = []
      let dataIdsArr = []
      this.selectData.forEach((item) => {
        if (item) {
          dataItemsArr.push(item.dataCode)
          dataIdsArr.push(item.id)
        }
      })
      let startTime = '',
        endTime = ''
      switch (this.searchform.dateType) {
        case 'YEAR':
          startTime = this._changeTime(this.searchform.startValue, 'yyyy')
          endTime = this._changeTime(this.searchform.endValue, 'yyyy')
          break
        case 'MONTH':
          startTime = this._changeTime(this.searchform.startValue, 'yyyy-MM')
          endTime = this._changeTime(this.searchform.endValue, 'yyyy-MM')
          break
        case 'DAY':
          startTime = this._changeTime(this.searchform.startValue, 'yyyy-MM-dd')
          endTime = this._changeTime(this.searchform.endValue, 'yyyy-MM-dd')
          break

        case 'HOUR':
          startTime = this._changeTime(
            this.searchform.startValue,
            'yyyy-MM-dd hh'
          )
          endTime = this._changeTime(this.searchform.endValue, 'yyyy-MM-dd hh')
          break
      }
      if (startTime > endTime) {
        this.message = this.$t('Lwork.greaterStart') //开始时间不能大于结束时间
        this.success = 3
        this.ismess = true
        return
      }
      let params = {
        startTime,
        endTime,
        dateType: this.searchform.dateType,
        dataItem: dataItemsArr.join(','),
        orgId: CheckedKeys.join(','),
        current: this.currentPage,
        size: this.currentSize,
        dataIds: dataIdsArr.join(','),
      }
      getEmergyStatistics(params).then((res) => {
        if (res.code == 'SUCCESS') {
          this.getTableList(res.data)
          this.$nextTick(() => {
            this.handleEcharts(res.data)
          })
        }
      })
    },
    // table表格数据转换
    getTableList(datas) {
      let tableName = datas.tableName
      let table = datas.table
      let arr = []
      for (let i = 0; i < tableName.length; i++) {
        for (let key in table) {
          if (tableName[i] == key) {
            table[key][0].name = tableName[i]
            arr.push(table[key])
          }
        }
      }
      let tableList = []
      for (var item in arr) {
        const arry = arr[item]
        tableList.push(arry)
      }
      this.tableList = tableList
    },
    // 时间格式转换
    _changeTime(now, type = 'yyyy-MM-dd') {
      var year = now.getFullYear()
      var month = now.getMonth() + 1
      var date = now.getDate()
      var hour = now.getHours()
      var minute = now.getMinutes()
      var second = now.getSeconds()

      if (month.toString().length == 1) {
        month = '0' + month
      }
      if (date.toString().length == 1) {
        date = '0' + date
      }
      if (hour.toString().length == 1) {
        hour = '0' + hour
      }
      switch (type) {
        case 'yyyy-MM-dd hh':
          return `${year}-${month}-${date} ${hour}`
          break
        case 'yyyy-MM-dd':
          return `${year}-${month}-${date}`
          break
        case 'yyyy-MM':
          return `${year}-${month}`
          break
        case 'yyyy':
          return `${year}`
          break
      }
    },
    // 转换时间
    transformTime(date) {
      let time = ''
      switch (date.length) {
        case 4: //年
          time = date
          break
        case 6: //月
          time = date.substr(0, 4) + '-' + date.substr(4, 2)
          break
        case 8: //日
          time =
            date.substr(0, 4) +
            '-' +
            date.substr(4, 2) +
            '-' +
            date.substr(6, 2)
          break
        case 10: //小时
          time =
            date.substr(0, 4) +
            '-' +
            date.substr(4, 2) +
            '-' +
            date.substr(6, 2) +
            ' ' +
            date.substr(8, 2)
          break
      }
      return time
    },
    // 转换数据项名称
    transformData(dataName) {
      let newName = ''
      this.selectData.forEach((selectItem) => {
        if (selectItem.dataCode == dataName) {
          newName = selectItem.dataName
        }
      })
      return newName
    },
    // 转换表格数据
    transformTable(data) {
      // data.forEach((item, index) => {
      //   for (let key in item) {
      //     if (index == 0 && key !== "reapp") {
      //       this.tableTitle.push({
      //         label:
      //           key.split("-")[0] + "-" + this.transformData(key.split("-")[1]),
      //         props: key,
      //       });
      //     }
      //   }
      //   data[index].reapp = this.transformTime(item.reapp);
      // });
      // this.tableData = data;
    },

    // 导出列表
    exportList() {
      let dataItemsArr = []
      this.selectData.forEach((item) => {
        if (item) {
          dataItemsArr.push(item.dataCode)
        }
      })
      let startTime = '',
        endTime = ''
      switch (this.searchform.dateType) {
        case 'YEAR':
          startTime = this._changeTime(this.searchform.startValue, 'yyyy')
          endTime = this._changeTime(this.searchform.endValue, 'yyyy')
          break
        case 'MONTH':
          startTime = this._changeTime(this.searchform.startValue, 'yyyy-MM')
          endTime = this._changeTime(this.searchform.endValue, 'yyyy-MM')
          break
        case 'DAY':
          startTime = this._changeTime(this.searchform.startValue, 'yyyy-MM-dd')
          endTime = this._changeTime(this.searchform.endValue, 'yyyy-MM-dd')
          break
        case 'HOUR':
          startTime = this._changeTime(
            this.searchform.startValue,
            'yyyy-MM-dd hh'
          )
          endTime = this._changeTime(this.searchform.endValue, 'yyyy-MM-dd hh')
          break
      }
      let params = {
        dateType: this.searchform.dateType,
        startTime,
        endTime,
        dataItem: dataItemsArr.join(','),
        orgId: this.$refs.trees.getCheckedKeys().join(','),
      }
      if (this.changePage) {
        let name = this.$t('report.timepointlook') //能耗单元时间点统计分析
        gettimesReports(params, name).then((res) => {})
      } else {
        let name = this.$t('report.timeDatalook') //能耗单元时间段统计分析
        getEmergyStatisticsReport(params, name).then((res) => {})
      }
    },
    // 关闭消息
    _closemess() {
      this.ismess = false
    },
    cellStyleFn(cellObj) {
      let cellStyle = { textAlign: 'center', color: '#333333' }
      if (cellObj.rowIndex % 2 !== 0) {
        // 偶数行
        cellStyle.background = '#F4FAFF'
      }
      return cellStyle
    },
    cellStyleFn1(cellObj) {
      let cellStyle = { textAlign: 'center', color: '#333333' }
      if (cellObj.rowIndex % 2 == 0) {
        // 偶数行
        cellStyle.background = '#F4FAFF'
      } else {
        cellStyle.background = '#FFFFFF'
      }
      return cellStyle
    },
    headerCellStyleFn(headerCellObj) {
      let headerCellStyle = {
        textAlign: 'center',
        color: '#333333',
        fontWeight: 'normal',
        background: '#fff',
      }
      if (headerCellObj.rowIndex == 1) {
        headerCellStyle.background = '#F4FAFF'
      }
      return headerCellStyle
    },

    // 开始时间改变
    onStartTimeChange(value) {
      this.searchform.startValue = value
      if (!value || !this.searchform.endValue) {
        return
      }
      let nowDate = new Date()
      if (value.getTime() > nowDate.getTime()) {
        this.searchform.startValue = ''
        this.showMsg(this.$t('statistics.times')) //只能查询当前时间之前的数据
      }
      let entTime = this.searchform.endValue
      let types = this.searchform.dateType
      if (this.changePage) {
        if (entTime && value.getTime() == entTime.getTime()) {
          this.message = this.$t('report.differentTimes') //基准时间不能和对比时间相同
          this.success = 3
          this.ismess = true
          this.searchform.startValue = ''
        }
      }
    },
    dotime(now) {
      var year = now.getFullYear()
      var month = now.getMonth() + 1
      var date = now.getDate()
      var hour = now.getHours()
      var minute = now.getMinutes()
      var second = now.getSeconds()
      if (month.toString().length == 1) {
        month = '0' + month
      }
      if (date.toString().length == 1) {
        date = '0' + date
      }
      if (hour.toString().length == 1) {
        hour = '0' + hour
      }
      if (minute.toString().length == 1) {
        minute = '0' + minute
      }
      if (second.toString().length == 1) {
        second = '0' + second
      }
      return `${year}-${month}-${date} ${hour}:${minute}:${second}`
    },
    showMsg(msg) {
      this.message = msg
      this.success = 3
      this.ismess = true
    },
    // 结束时间改变
    onEndTimeChange(value) {
      this.searchform.endValue = value
      if (!value || !this.searchform.startValue) {
        return
      }
      let nowDate = new Date()
      if (value.getTime() > nowDate.getTime()) {
        this.searchform.endValue = ''
        this.showMsg(this.$t('statistics.times')) //"只能查询当前时间之前的数据"
      }
      let types = this.searchform.dateType
      let startTime = this.searchform.startValue
      // console.log(value, startTime);
      if (this.changePage) {
        if (startTime && value.getTime() == startTime.getTime()) {
          this.message = this.$t('report.differentTime') //对比时间不能和基准时间相同
          this.success = 3
          this.ismess = true
          this.searchform.endValue = ''
        }
      }
    },

    //时间改变
    changeTime(val) {
      console.log(val)
      if (val) {
        this.searchform.startValue = val[0]
        this.searchform.endValue = val[1]
      } else {
        this.searchform.startValue = null
        this.searchform.endValue = null
      }
    },
    // 字典获取数据类型
    getleixing() {
      dictData({ root: 'T_DIC_DATATYPE' }).then((res) => {
        if (res.code == 'SUCCESS') {
          let arr = res.data.find((el) => {
            return el.dictCode == '02'
          })
          //console.log(arr);
          this.dataTypeList = [arr]
          this.searchform.dataType = this.dataTypeList[0].dictCode
          this.getDataItem('search', true)
        }
      })
    },
    getTimeleixing(flag) {
      dictData({ root: 'T_DICT_TIMETYPE' }).then((res) => {
        if (res.code == 'SUCCESS') {
          let arr = []
          res.data.forEach((el) => {
            arr.unshift(el)
          })
          this.dateTypeList = arr
          if (flag) {
            this.searchform.dateType = this.$route.query.TimeDateType
            this.currentType = {
              timeType: this.$route.query.TimeDataType,
              format: this.$route.query.TimeFormat,
            }
            if (!this.$route.query.TimeStartValue) {
              this.searchform.startValue = ''
            } else {
              this.searchform.startValue = new Date(
                this.$route.query.TimeStartValue
              )
            }
            if (!this.$route.query.TimeEndValue) {
              this.searchform.endValue = ''
            } else {
              this.searchform.endValue = new Date(
                this.$route.query.TimeEndValue
              )
            }
            this.getleixing()
          } else {
            this.searchform.dateType = 'MONTH'
            this.currentType = {
              timeType: 'month',
              format: 'yyyy-MM',
            }
            this.setMouthtime()
          }
        }
      })
    },
    setMouthtime() {
      let d = new Date()
      let mouth = d.getMonth() + 1
      let year = d.getFullYear()
      this.searchform.endValue = d
      if (mouth <= 5) {
        year = year - 1
        mouth = 12 - 5 + mouth
        mouth = mouth > 9 ? mouth : '0' + mouth
        let a = year + '-' + mouth + '-01 00:00:00'
        this.searchform.startValue = new Date(a)
      } else {
        let a = year + '-0' + (mouth - 5) + '-01 00:00:00'
        this.searchform.startValue = new Date(a)
      }
    },
    setYeartime() {
      let d = new Date()
      let year = d.getFullYear() + '-01-01 00:00:00'
      let ey = new Date(year)
      this.searchform.endValue = ey
      let syear = d.getFullYear() - 1 + '-01-01 00:00:00'
      let sy = new Date(syear)
      this.searchform.startValue = sy
      // console.log(ey, sy);
    },
    setDaytime() {
      let d = new Date()
      let year = d.getFullYear()
      let mouth = d.getMonth() + 1
      let day = d.getDate()
      let endday = year + '-' + mouth + '-' + day + ' 00:00:00'
      let ed = new Date(d)
      this.searchform.endValue = ed
      let dtimenum = d.getTime() - 6 * 24 * 3600 * 1000
      let a = new Date(dtimenum)
      let ay = a.getFullYear()
      let am = a.getMonth() + 1
      let ad = a.getDate()
      let starday = ay + '-' + am + '-' + ad + ' 00:00:00'
      let sd = new Date(starday)
      this.searchform.startValue = sd
    },
    setHourtime() {
      let a = new Date()
      let ay = a.getFullYear()
      let am = a.getMonth() + 1
      let ad = a.getDate()
      let ah = a.getHours()
      let str = ay + '-' + am + '-' + ad + ' ' + ah + ':00:00'
      let ed = new Date(str) - 24 * 3600 * 1000
      this.searchform.endValue = new Date(ed)
      let dtimenum = new Date(ed).getTime() - 7 * 3600 * 1000
      let sd = new Date(dtimenum)
      this.searchform.startValue = new Date(sd)
      //console.log(ed, sd);
    },
  },
}
</script>

<style scoped lang="scss">
@import './index.module.scss';
</style>
<style lang="scss">
/*小时时间选择器处理*/
.hourBox {
  .el-time-spinner .el-time-spinner__wrapper:nth-child(2) {
    display: none;
  }
  .el-time-spinner .el-time-spinner__wrapper:nth-child(1) {
    width: 100%;
  }
}
#nodata {
  margin: -90px auto;
}
#nodatas {
  margin: 0 auto;
}
.el-icon-sort {
  transform: rotate(90deg);
}
</style>
