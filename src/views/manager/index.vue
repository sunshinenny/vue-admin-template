<template>
  <div class="manager">
    <el-container style="margin-top:20px">
      <el-header>
        <el-row>
          <el-col>
            <transition name="fade">
              <el-button
                type="danger"
                @click="handleCreateTable();currentPageState='init'"
                v-if="currentPageState==='search'"
              >清除搜索</el-button>
            </transition>
            <el-button type="primary">添加型号</el-button>
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
        <el-table :data="tableData" border style="width: 100%" stripe v-loading="loading">
          <el-table-column prop="dealName" align="center">
            <template slot="header" slot-scope="scope">
              <el-popover placement="top" width="160" trigger="click">
                <modelSearch
                  :modelData="modelData"
                  @modelDialogTellParentTheModel="getModelSearchKey"
                  v-if="visible.model"
                ></modelSearch>
                <div style="text-align: right; margin-top:10px">
                  <el-button type="primary" size="mini" @click="searchByAddressAndModel">确定</el-button>
                </div>
                <el-button type="text" slot="reference">型号</el-button>
              </el-popover>
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
              <span
                v-if="scope.row.subscribeState"
              >{{dateFormat(scope.row.subscribeChangeTime)}}</span>
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
                <el-button type="success" @click="handleSubmitSubscribe(scope)">完成</el-button>
              </el-button-group>
              <el-button
                v-else
                type="primary"
                @click="editSubscribe=false;tempDataSubscribeId = scope.row.id;visible.subscribe = true"
              >新的预约</el-button>
            </template>
          </el-table-column>
          <el-table-column label="高级操作" align="center">
            <template slot-scope="scope">
              <el-button
                type="primary"
                @click="handleShowHistoryDialog(scope)"
                :disabled="scope.row.originId==null"
              >历史记录</el-button>
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
      <el-dialog title="历史记录" :visible.sync="visible.history" width="80%">
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
      <el-dialog :title="editSubscribe?'修改预约':'新建预约'" :visible.sync="visible.subscribe" width="30%">
        <subscribe
          v-if="visible.subscribe"
          :subscribeId="editSubscribe?null:tempDataSubscribeId"
          :row="editSubscribe?tempDataSubscribeRow:null"
          @subscribeTellParentCloseDialog="subscribeTellParentCloseDialog"
          @cancelDialog="editSubscribe=false;visible.subscribe = false;handleCreateTable()"
        />
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
  submitSubscribe
} from "@/request/api";
import modelSearch from "@/views/manager/search/model.vue";
import history from "@/views/manager/history.vue";
import subscribe from "@/views/manager/subscribe.vue";
export default {
  components: { modelSearch, history, subscribe },
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
        subscribe: false // 新的预约
      },
      tempDataOriginId: null, // 本条记录的原始id信息
      tempDataSubscribeId: null, // 预约时候的那条记录的id
      tempDataSubscribeRow: null, // 预约时候的那条记录
      modelDialogTellParentTheModel: null,
      historyDialogTellParentAimIdAndOriginId: null, //
      editSubscribe: false // 是否在编辑预约记录
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
    /** modelSearch子组件相关方法 */
    async searchByAddressAndModel() {
      if (this.modelDialogTellParentTheModel === null) {
        this.$message.error("请选择需要搜索的型号");
      } else {
        this.loading = true;
        this.currentPageState = "search";
        let stockRes = await pageAllStockByAddress({
          addressId: this.activeName,
          modelId: this.modelDialogTellParentTheModel,
          current: this.current,
          size: this.size
        });
        this.tableData = stockRes.data.records;
        this.total = stockRes.data.records.length;
        // ## 赋值具体的型号
        this.enhanceTableData();
        this.loading = false;
      }
    },
    getModelSearchKey(id) {
      this.modelDialogTellParentTheModel = id;
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
    subscribeTellParentCloseDialog() {
      this.handleCreateTable();
      this.visible.subscribe = false;
    },
    // 提交预约操作
    handleSubmitSubscribe(scope){
      submitSubscribe({
        stockJson:JSON.stringify(scope.row)
      }).then(res=>{
        if(res.status == 1){
          this.$message.success(res.data);
          this.handleCreateTable();
        }else{
          this.$message.error(res.data)
        }
      })
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
    },
    dateFormat(time) {
      let tempDate = new Date(time);
      let date = new Date(tempDate.valueOf() - 0 * 60 * 60 * 1000); // 当前时间减掉8小时
      return date.toLocaleString();
    }
  }
};
</script>

<style>
</style>