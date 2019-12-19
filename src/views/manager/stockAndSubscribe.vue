<template>
  <div>
    <div style="margin:20px 0px 20px">
      <span style="font-size:20px">库存信息</span>
    </div>
    <div class="stock">
      <el-table :data="tableData" v-loading="loading" style="width: 100%" border stripe>
        <el-table-column label="型号" align="center">
          <template slot-scope="scope">{{dealName}}</template>
        </el-table-column>
        <el-table-column label="出入库操作" width="250" align="center">
          <template slot-scope="scope">
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
        <el-table-column prop="nums" label="库存" align="center"></el-table-column>
        <el-table-column label="最近出入库时间" align="center" width="200">
          <template slot-scope="scope">{{dateFormat(scope.row.changeTime)}}</template>
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
    </div>
    <div style="margin:20px 0px 20px">
      <span style="font-size:20px">预约信息</span>
      <el-button type="primary" @click="visible.subscribe = true">添加预约</el-button>
    </div>
    <div class="subscribe">
      <listSubscribe
        :tableData="listSubscribeData"
        @tellParentShowEditSubscibeDialog="showEditSubscribeDialog"
      />
    </div>
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
          :stockId="editSubscribe?null:tableData[0].id"
          :originId="editSubscribe?null:tableData[0].originId"
          :row="editSubscribe?tempDataSubscribeRow:null"
          @subscribeTellParentCloseDialog="subscribeTellParentCloseDialog"
          @cancelDialog="editSubscribe=false;visible.subscribe = false;getStock()"
        />
        <!-- :stockId="editSubscribe?null:tempDataSubscribeId" -->
      </el-dialog>
    </div>
    <div class="recordOperationDialog">
      <el-dialog
        title="修改记录"
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
import { listStockByAddressAndModel, changeStockNum } from "@/request/api";
import { historyReset, removeRecordAPI, editRecordAPI } from "@/request/api";
import { listSubscribeByStockId } from "@/request/api";
import history from "@/views/manager/history.vue";
import recordOperation from "@/views/manager/recordOperation.vue";
import subscribe from "@/views/manager/subscribe.vue";
import listSubscribe from "@/views/manager/listSubscribe.vue";
export default {
  props: ["modelId", "addressId", "dealName", "modelData", "addressData"],
  components: {
    history,
    recordOperation,
    subscribe,
    listSubscribe
  },
  data() {
    return {
      tableData: null, // 表格数据
      loading: false, // 表格是否加载中
      listSubscribeData: null, // 读取出来的预约信息
      visible: {
        model: false, // 按照类型搜索
        history: false, // 历史记录dialog
        subscribe: false, // 新的预约
        recordOperation: false // 添加记录弹窗
      },
      editSubscribe: false, //是否在编辑预约信息
      tempDataSubscribeRow: null, // 需要编辑的预约信息
      waitOperationRow: null, // 需要编辑的记录 temp
      stockIdForListSubscribe: null,
      originIdForListSubscribe: null
    };
  },
  created() {
    this.getStock();
  },
  methods: {
    async getStock() {
      // # 处理库存信息
      let stockFromDB = await listStockByAddressAndModel({
        addressId: this.addressId,
        modelId: this.modelId
      });
      if (stockFromDB.data.length > 0) {
        stockFromDB.data[0].waitToChange = 0;
        this.tableData = stockFromDB.data;
        // 加载预约信息
        this.stockIdForListSubscribe = stockFromDB.data[0].id;
        this.originIdForListSubscribe = stockFromDB.data[0].originId;
        this.listSubscribe(
          stockFromDB.data[0].id,
          stockFromDB.data[0].originId
        );
      } else {
        this.tableData = null;
      }
      // ## 赋值具体的型号
      //   this.enhanceTableData();
      this.loading = false;
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
          this.getStock();
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
                this.getStock();
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
      // 刷新预约信息列表
      this.listSubscribe(
        this.stockIdForListSubscribe,
        this.originIdForListSubscribe
      );
      this.editSubscribe = false;
      this.visible.subscribe = false;
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
          // this.handleCreateTable();
        } else {
          this.$message.error(res.data);
        }
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
            this.getStock();
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
    handleEditRecord() {
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
        // TODO 修改成功后 自动跳转到对应的型号和仓库中
      });
    },
    /**
     * 预约相关方法,new
     */
    // 刷新预约列表
    listSubscribe(stockId, originId) {
      listSubscribeByStockId({
        stockId: stockId,
        originId: originId
      }).then(res => {
        if (res.status == 1) {
          this.listSubscribeData = res.data;
          //   this.$message.success(res.data);
        } else {
          //   this.$message.error(res.data);
        }
      });
    },
    showEditSubscribeDialog(row) {
      this.visible.subscribe = true;
      this.editSubscribe = true;
      this.tempDataSubscribeRow = row;
    },
    /** 工具方法*/
    dateFormat(time) {
      let tempDate = new Date(time);
      let date = new Date(tempDate.valueOf() - 0 * 60 * 60 * 1000); // 当前时间减掉0小时
      return date.toLocaleString();
    },
    handleClose(done) {
      this.$confirm("确认关闭？")
        .then(_ => {
          done();
        })
        .catch(_ => {});
    }
  }
};
</script>

<style>
</style>