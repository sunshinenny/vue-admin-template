<template>
  <div class="manager">
    <el-container style="margin-top:20px">
      <el-header>
        <el-row>
          <el-col :span="8">
            <transition name="fade">
              <el-button type="danger" @click="clearSearch" v-if="currentPageState==='search'">清除搜索</el-button>
            </transition>
            <template v-if="isBatch == false">
              <el-button type="primary" @click="isBatch=true">批量操作</el-button>
              <el-button type="success" @click="visible.recordOperation = true">添加记录</el-button>
            </template>
            <template v-else>
              <el-button type="danger" @click="isBatch=false">退出批量</el-button>
              <el-button type="primary">选择完毕</el-button>
            </template>
          </el-col>
          <el-col :span="16">
            <div class="testSearch">
              <transition name="fade">
                <searchBar
                  :modelData="modelData"
                  @tellParentSearch="doSearch"
                  v-if="visible.model"
                />
              </transition>
            </div>
          </el-col>
        </el-row>
      </el-header>
      <el-main>
        <el-tabs v-model="activeName" @tab-click="handleChangeTab" type="card">
          <el-tab-pane
            v-for="(item,index) in addressData"
            :label="item.name"
            :name="String(item.id)"
            :key="item.createTime"
          ></el-tab-pane>
        </el-tabs>
        <el-table
          :data="tableData"
          border
          style="width: 100%"
          stripe
          v-loading="loading"
          ref="multipleTable"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" v-if="isBatch"></el-table-column>
          <el-table-column label="型号" align="center">
            <template slot-scope="scope">
              {{scope.row.dealName}}
              <el-tag v-if="scope.row.tag!=null">{{scope.row.tag}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="nums" label="库存" align="center"></el-table-column>
          <el-table-column label="最近出入库时间" align="center" width="200">
            <template slot-scope="scope">{{dateFormat(scope.row.changeTime)}}</template>
          </el-table-column>
          <el-table-column label="出入库操作" width="250" align="center">
            <template slot-scope="scope">
              <!--  @change="handleChange"  -->
              <el-input-number
                v-model="scope.row.waitToChange"
                style="width: 125px;"
                controls-position="right"
                :min="0"
              ></el-input-number>
              <el-button
                icon="el-icon-minus"
                circle
                type="primary"
                :disable="loading"
                @click="changeCurrentNum(scope,-1)"
              ></el-button>
              <el-button
                icon="el-icon-plus"
                circle
                type="danger"
                :disable="loading"
                @click="changeCurrentNum(scope,1)"
              ></el-button>
            </template>
          </el-table-column>
          <el-table-column label="预约出入库时间" align="center" width="200">
            <template slot-scope="scope">
              <span v-if="scope.row.subscribeState">{{dateFormat(scope.row.subscribeChangeTime)}}</span>
              <span v-else>暂无安排</span>
            </template>
          </el-table-column>
          <el-table-column label="预约出入库数量" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.subscribeState">{{scope.row.subscribeChangeNum}}</span>
              <span v-else>暂无安排</span>
            </template>
          </el-table-column>
          <el-table-column label="预约出入库操作" align="center" width="160">
            <template slot-scope="scope">
              <el-button-group v-if="scope.row.subscribeState">
                <el-button
                  type="danger"
                  @click="editSubscribe = true,tempDataSubscribeRow = scope.row;visible.subscribe = true"
                >修改</el-button>
                <el-button
                  type="success"
                  :class="confirmSubscribeTimeRead(scope)"
                  @click="handleSubmitSubscribe(scope)"
                >完成</el-button>
              </el-button-group>
              <el-button
                v-else
                type="primary"
                @click="editSubscribe=false;tempDataSubscribeId = scope.row.id;visible.subscribe = true"
              >新的预约</el-button>
            </template>
          </el-table-column>
          <el-table-column label="高级操作" align="center" width="200px">
            <template slot-scope="scope">
              <el-button-group>
                <el-button
                  type="primary"
                  @click="handleShowHistoryDialog(scope)"
                  :disabled="scope.row.originId==null"
                >历史记录</el-button>
                <el-button @click="waitOperationRow=scope.row;visible.recordOperation=true">编辑</el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
      <div align="center">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
          :current-page="1"
          :page-sizes="[100, 200, 300, 400]"
          :page-size="100"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>
    </el-container>
    <div class="historyDialog">
      <el-dialog
        title="历史记录"
        :visible.sync="visible.history"
        width="80%"
        :before-close="handleClose"
      >
        <history
          :modelData="modelData"
          :originId="tempDataOriginId"
          @getAimIdAndOriginId="getHistoryAimIdAndOriginId"
          v-if="visible.history"
        />
        <span slot="footer" class="dialog-footer">
          <el-button @click="visible.history = false">取 消</el-button>
          <el-button type="danger" @click="rollbackHistory">回退到选中状态</el-button>
        </span>
      </el-dialog>
    </div>
    <div class="subscribeDialog">
      <el-dialog
        :title="editSubscribe?'修改预约':'新建预约'"
        :visible.sync="visible.subscribe"
        width="40%"
        :before-close="handleClose"
      >
        <subscribe
          v-if="visible.subscribe"
          :subscribeId="editSubscribe?null:tempDataSubscribeId"
          :row="editSubscribe?tempDataSubscribeRow:null"
          @subscribeTellParentCloseDialog="subscribeTellParentCloseDialog"
          @cancelDialog="editSubscribe=false;visible.subscribe = false;handleCreateTable()"
        />
      </el-dialog>
    </div>
    <div class="recordOperationDialog">
      <el-dialog
        :title="waitOperationRow!=null?'修改记录':'添加新记录'"
        :visible.sync="visible.recordOperation"
        width="40%"
        :before-close="handleClose"
      >
        <recordOperation
          :modelData="modelData"
          :addressData="addressData"
          :row="waitOperationRow"
          @recordOperationDialogTellParentFormValue="setRecordOperationData"
          v-if="visible.recordOperation"
        />
        <span slot="footer" class="dialog-footer">
          <el-button @click="visible.recordOperation = false;waitOperationRow=null">取 消</el-button>
          <template v-if="waitOperationRow==null">
            <el-button type="primary" @click="handelAddRecord">添加</el-button>
          </template>
          <template v-else>
            <el-button type="danger" @click="removeRecord">删除</el-button>
            <el-button type="info" @click="handleEditRecord">修改</el-button>
          </template>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import {
  pageAllStockByAddress,
  listModel,
  listAddress,
  changeStockNum,
  historyReset,
  submitSubscribe,
  addRecordAPI,
  editRecordAPI,
  removeRecordAPI
} from "@/request/api";
import searchBar from "@/views/manager/search/index.vue";
import history from "@/views/manager/history.vue";
import subscribe from "@/views/manager/subscribe.vue";
import recordOperation from "@/views/manager/recordOperation.vue";
export default {
  components: { history, subscribe, searchBar, recordOperation },
  data() {
    return {
      tableData: null, // 用以显示型号数据的表格
      current: 1, // 当前页面
      size: 15, // 一页有几条记录
      total: null, // 查询出来的总数
      modelData: null, // 查询出来的型号数据 为一个list
      addressData: null, // 查询出来的地址数据 为一个list
      activeName: null, // 默认激活的标签页
      currentPageState: "init", //总共页数
      loading: true, //加载数据项的时候不允许进行相关数据操作,避免出现异常
      visible: {
        model: false, // 按照类型搜索
        history: false, // 历史记录dialog
        subscribe: false, // 新的预约
        recordOperation: false // 添加记录弹窗
      },
      tempDataOriginId: null, // 本条记录的原始id信息 temp
      tempDataSubscribeId: null, // 预约时候的那条记录的id temp
      tempDataSubscribeRow: null, // 预约时候的那条记录 temp
      modelDialogTellParentTheModel: null,
      historyDialogTellParentAimIdAndOriginId: null, //
      editSubscribe: false, // 是否在编辑预约记录
      recordOperationData: null, // 需要处理的记录数据 temp
      waitOperationRow: null, // 需要编辑的记录 temp
      isBatch: false, // 是否处于批量操作状态
      multipleSelection: [] // 多选项
    };
  },
  created() {
    // # 处理型号和地址
    this.getBasicData().then(res => {
      // # 处理库存信息
      this.handleCreateTable();
      this.visible.model = true;
    });
  },
  methods: {
    async getBasicData() {
      // # 处理型号和地址
      let listModelRes = await listModel();
      this.modelData = listModelRes.data;

      let listAddressRes = await listAddress();
      this.addressData = listAddressRes.data;
      this.activeName = String(this.addressData[0].id);
    },
    async handleCreateTable() {
      // # 处理库存信息
      let createdTable = await pageAllStockByAddress({
        addressId: parseInt(this.activeName),
        current: this.current,
        size: this.size
      });
      this.tableData = createdTable.data.records;
      this.total = createdTable.data.records.length;
      // ## 赋值具体的型号
      this.enhanceTableData();
      this.loading = false;
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.current = val;
      // 当前页面处于初始化状态
      if (this.currentPageState === "init") {
        this.handleGetTable();
      } else {
        // 否则为 search 查询状态
        // this.handleSeach();
      }
    },
    handleChangeTab(tab, event) {
      this.loading = true;
      this.activeName = tab.name;
      this.currentPageState = "init";
      this.handleCreateTable();
    },
    // 出入库操作
    changeCurrentNum(scope, type) {
      this.loading = true;
      if (
        scope.row.waitToChange === 0 ||
        scope.row.waitToChange === undefined ||
        scope.row.waitToChange === ""
      ) {
        this.$message.error("请确认出入库的数量");
        this.loading = false;
        return;
      }

      if (scope.row.nums + scope.row.waitToChange * type < 0) {
        this.$message.error("库存数不能小于 0");
        this.loading = false;
        return;
      }
      changeStockNum({
        id: scope.row.id,
        num: scope.row.waitToChange * type
      }).then(res => {
        if (res.status === 1) {
          this.$message.success(res.data);
          this.handleCreateTable();
        } else {
          this.$message.error(res.data);
        }
      });
      this.loading = false;
    },
    getHistoryAimIdAndOriginId(val) {
      this.historyDialogTellParentAimIdAndOriginId = val;
    },
    handleShowHistoryDialog(scope) {
      if (scope.row.originId === null || scope.row.originId === undefined) {
        this.$message.error("无历史记录");
      } else {
        this.tempDataOriginId = scope.row.originId;
        this.visible.history = true;
      }
    },
    // 回滚按钮对应的操作
    rollbackHistory() {
      // 做足了判断
      if (this.historyDialogTellParentAimIdAndOriginId != null) {
        if (
          this.historyDialogTellParentAimIdAndOriginId.aimId != null &&
          this.historyDialogTellParentAimIdAndOriginId.aimId != undefined &&
          this.historyDialogTellParentAimIdAndOriginId.originId != null &&
          this.historyDialogTellParentAimIdAndOriginId.aimId != undefined
        ) {
          historyReset(this.historyDialogTellParentAimIdAndOriginId).then(
            res => {
              if (res.status == 1) {
                this.$message.success(res.data);
                this.handleCreateTable();
              } else {
                this.$message.error(res.data);
              }
              // 数据处理
              this.tempDataOriginId = null;
              this.historyDialogTellParentAimIdAndOriginId = null;
              this.visible.history = false;
            }
          );
        }
      } else {
        this.$message.error("请选择记录后进行回退操作");
      }
    },
    // 预约子组件告诉父组件关闭弹窗
    subscribeTellParentCloseDialog() {
      this.handleCreateTable();
      this.visible.subscribe = false;
    },
    // 提交预约操作
    handleSubmitSubscribe(scope) {
      submitSubscribe({
        stockJson: JSON.stringify(scope.row)
      }).then(res => {
        if (res.status == 1) {
          this.$message.success(res.data);
          this.handleCreateTable();
        } else {
          this.$message.error(res.data);
        }
      });
    },
    async doSearch(data) {
      if (JSON.stringify(data) == "{}") {
        this.$message.error("请确认搜索条件");
      } else {
        // # 处理库存信息
        let createdTable = await pageAllStockByAddress({
          addressId: parseInt(this.activeName),
          current: this.current,
          size: this.size,
          searchOption: JSON.stringify(data)
        });
        this.currentPageState = "search";
        this.tableData = createdTable.data.records;
        this.total = createdTable.data.records.length;
        // ## 赋值具体的型号
        this.enhanceTableData();
        this.$message.success("搜索成功");
        this.loading = false;
      }
    },
    clearSearch() {
      this.handleCreateTable();
      this.currentPageState = "init";
      this.visible.model = false;
      setTimeout(() => {
        this.visible.model = true;
      }, 500);
    },
    // 从子组件获取需要添加的记录数据
    setRecordOperationData(data) {
      this.recordOperationData = data;
    },
    // 调用添加记录的API
    handelAddRecord() {
      addRecordAPI({
        stockJson: JSON.stringify(this.recordOperationData)
      }).then(res => {
        if (res.status == 1) {
          this.$message.success(res.data);
          this.visible.recordOperation = false;
          this.recordOperationData = null;
          this.handleCreateTable();
        } else {
          this.$message.error(res.data);
        }
      });
    },
    handleEditRecord() {
      console.log(this.recordOperationData);
      editRecordAPI({
        stockJson: JSON.stringify(this.recordOperationData)
      }).then(res => {
        if (res.status == 1) {
          this.$message.success(res.data);
        } else {
          this.$message.error(res.data);
        }
        this.visible.recordOperation = false;
        this.recordOperationData = null;
        this.waitOperationRow = null;
        this.handleCreateTable();
      });
    },
    removeRecord() {
      this.$confirm("此操作将删除该记录与其历史记录, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          console.log(this.waitOperationRow.id);
          removeRecordAPI({ id: this.waitOperationRow.id }).then(res => {
            if (res.status == 1) {
              this.$message.success(res.data);
            } else {
              this.$message.error(res.data);
            }
            // 清理一些数据
            this.visible.recordOperation = false;
            this.handleCreateTable();
            this.waitOperationRow = null;
          });
        })
        .catch(() => {
          // 清理一些数据
          this.visible.recordOperation = false;
          this.waitOperationRow = null;
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    /** 工具方法*/
    enhanceTableData() {
      this.tableData.forEach(element => {
        // ### 赋值待出入库的数量
        element.waitToChange = "";
        this.modelData.forEach(el => {
          if (el.id === element.model) {
            element.dealName = el.dealName;
          }
        });
      });
      this.tableData.sort((x, y) => {
        //比较函数
        if (x.dealName < y.dealName) {
          return -1;
        } else if (x.dealName > y.dealName) {
          return 1;
        } else {
          return 0;
        }
      });
    },
    confirmSubscribeTimeRead(scope) {
      let timestamp =
        new Date(scope.row.subscribeChangeTime).getTime() -
        new Date().getTime();
      let days = timestamp / 1000 / 60 / 60 / 24; // 如果期限小于3天，作出提醒
      if (days < 3 && days > 0) {
        return "animated infinite heartBeat slow";
      } else if (days < 0) {
        return "animated infinite heartBeat faster";
      }
    },
    dateFormat(time) {
      let tempDate = new Date(time);
      let date = new Date(tempDate.valueOf() - 0 * 60 * 60 * 1000); // 当前时间减掉0小时
      return date.toLocaleString();
    },
    handleClose(done) {
      this.$confirm("确认关闭？")
        .then(_ => {
          // 清除一些数据
          (this.tempDataOriginId = null), // 本条记录的原始id信息
            (this.tempDataSubscribeId = null), // 预约时候的那条记录的id
            (this.tempDataSubscribeRow = null), // 预约时候的那条记录
            (this.recordOperationData = null), // 需要处理的记录数据
            (this.waitOperationRow = null); // 需要编辑的记录
          done();
        })
        .catch(_ => {});
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    }
  }
};
</script>

<style>
</style>