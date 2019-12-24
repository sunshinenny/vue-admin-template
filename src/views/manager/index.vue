<template>
  <div class="manager">
    <el-container style="margin-top:20px">
      <el-header>
        <el-row>
          <el-col :span="8">
            <transition name="fade">
              <el-button type="danger" @click="clearSearch" v-if="currentPageState==='search'">清除搜索</el-button>
            </transition>
            <el-button type="success" @click="visible.recordOperation = true">添加记录</el-button>
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
        <el-tabs
          v-model="activeAddressName"
          @tab-click="handleChangeTab"
          type="card"
          :stretch="false"
          :lazy="true"
        >
          <el-tab-pane
            v-for="(addressItem,index) in addressData"
            :label="addressItem.name"
            :name="String(addressItem.id)"
            :key="String(addressItem.id)"
          >
            <el-tabs tab-position="left" v-model="activeModelName" :lazy="true">
              <el-tab-pane
                v-for="(modelItem,index) in modelData"
                :name="String(modelItem.id)"
                :key="String(modelItem.id)"
              >
                <span slot="label">
                  <!-- {{modelItem.name+`+'${modelItem.nums}'`}} -->
                  {{modelItem.name}}
                  <!-- <el-tag type="danger">{{modelItem.nums}}</el-tag> -->
                  <!-- <el-badge :value="modelItem.nums" class="item"></el-badge> -->
                </span>
                <stockAndSubscribe
                  :modelId="String(modelItem.id)"
                  :addressId="String(addressItem.id)"
                  :dealName="modelItem.name"
                  :modelData="modelData"
                  :addressData="addressData"
                  :key="activeAddressName+'@'+activeModelName"
                  v-if="activeAddressName==addressItem.id && activeModelName==modelItem.id && !reloadStockAndSubscribe"
                />
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
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
          :modelId="parseInt(activeModelName)"
          :addressId="parseInt(activeAddressName)"
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
  // pageAllStockByAddress,
  listAllStockByAddress,
  listModel,
  listAddress,
  changeStockNum,
  submitSubscribe,
  addRecordAPI,
  editRecordAPI,
  removeRecordAPI
} from "@/request/api";
import stockAndSubscribe from "@/views/manager/stockAndSubscribe.vue";
import searchBar from "@/views/manager/search/index.vue";
import subscribe from "@/views/manager/subscribe.vue";
import recordOperation from "@/views/manager/recordOperation.vue";

export default {
  components: {
    subscribe,
    searchBar,
    recordOperation,
    stockAndSubscribe
  },
  data() {
    return {
      tableData: null, // 用以显示型号数据的表格
      current: 1, // 当前页面
      size: 15, // 一页有几条记录
      total: null, // 查询出来的总数
      modelData: null, // 查询出来的型号数据 为一个list
      addressData: null, // 查询出来的地址数据 为一个list
      activeAddressName: null, // 默认激活的仓库标签页,名为name 实为id
      activeModelName: null, // 默认激活的型号标签页
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
      multipleSelection: [], // 多选项
      currentPageState: "init",
      //-------
      canLoadStockAndSubScribe: false, //是否可以开始加载表格
      reloadStockAndSubscribe: false // 是否需要刷新StockAndSubscribe子组件
    };
  },
  created() {
    // # 处理型号和地址
    this.getBasicData().then(res => {
      // 获取侧边栏的型号所对应的库存数量
      // this.getLeftsideModelNums();
      // # 处理库存信息
      this.visible.model = true;
      this.canLoadStockAndSubScribe = true;
    });
  },
  methods: {
    // 获取基础数据
    async getBasicData() {
      // # 处理型号和地址
      let listModelRes = await listModel();
      this.modelData = listModelRes.data;
      let listAddressRes = await listAddress();
      this.addressData = listAddressRes.data;
      this.activeAddressName = String(this.addressData[0].id);
      this.activeModelName = String(this.modelData[0].id);
    },
    // 激活的标签名
    async handleChangeTab(tab, event) {
      // 重新获取该仓库下的所有型号的库存数，用以在左侧边栏显示
      // let res = await this.getLeftsideModelNums();
      this.loading = true;
      this.activeAddressName = tab.name;
    },
    async getLeftsideModelNums() {
      listAllStockByAddress({ addressId: this.activeAddressName }).then(res => {
        // 给型号添加nums属性
        res.data.forEach(stockItem => {
          this.modelData.forEach(modelItem => {
            if (modelItem.id === stockItem.model) {
              modelItem.nums = stockItem.nums;
            } else {
              modelItem.nums = 0;
            }
          });
        });
      });
    },
    // 搜索方法
    async doSearch(data) {
      this.$message.error("该方法未完成");
      // if (JSON.stringify(data) == "{}") {
      //   this.$message.error("请确认搜索条件");
      // } else {
      //   // # 处理库存信息
      //   let createdTable = await pageAllStockByAddress({
      //     addressId: parseInt(this.activeAddressName),
      //     current: this.current,
      //     size: this.size,
      //     searchOption: JSON.stringify(data)
      //   });
      //   this.currentPageState = "search";
      //   this.tableData = createdTable.data.records;
      //   this.total = createdTable.data.records.length;
      //   // ## 赋值具体的型号
      //   this.enhanceTableData();
      //   this.$message.success("搜索成功");
      //   this.loading = false;
      // }
    },
    // 清除搜索参数
    clearSearch() {
      // this.handleCreateTable();
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
          // 设置自动跳转,但是如果恰巧刚好在这个标签里面,则执行刷新操作
          // 重新赋值就当作刷新
          this.activeAddressName = String(this.recordOperationData.address);
          this.activeModelName = String(this.recordOperationData.model);
          // 重新刷新子组件
          this.reloadStockAndSubscribeFunc();
          // 清除临时数据
          this.visible.recordOperation = false;
          this.recordOperationData = null;
          // this.handleCreateTable();
        } else {
          this.$message.error(res.data);
        }
      });
    },
    // 编辑记录
    handleEditRecord() {
      editRecordAPI({
        stockJson: JSON.stringify(this.recordOperationData)
      }).then(res => {
        if (res.status == 1) {
          this.$message.success(res.data);
          // 重新刷新子组件
          this.reloadStockAndSubscribeFunc();
        } else {
          this.$message.error(res.data);
        }
        this.visible.recordOperation = false;
        this.recordOperationData = null;
        this.waitOperationRow = null;
        // this.handleCreateTable();
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
    handleClose(done) {
      this.$confirm("确认关闭？")
        .then(_ => {
          // // 清除一些数据
          // (this.tempDataOriginId = null), // 本条记录的原始id信息
          //   (this.tempDataSubscribeId = null), // 预约时候的那条记录的id
          //   (this.tempDataSubscribeRow = null), // 预约时候的那条记录
          //   (this.recordOperationData = null), // 需要处理的记录数据
          //   (this.waitOperationRow = null); // 需要编辑的记录
          done();
        })
        .catch(_ => {});
    },
    reloadStockAndSubscribeFunc() {
      this.reloadStockAndSubscribe = true;
      setTimeout(() => {
        this.reloadStockAndSubscribe = false;
      }, 100);
    }
  }
};
</script>

<style>
</style>