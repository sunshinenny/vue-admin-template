<template>
  <div class="manager">
    <el-container style="margin-top:20px">
      <el-header>
        <el-row>
          <el-col :span="14">
            <el-button type="success" @click="visible.recordOperation = true">添加记录</el-button>
          </el-col>
          <el-col :span="10" align="right">
            <el-input v-model="leftSideSearchBarText" placeholder="请输入型号名" style="width:300px">
              <el-button slot="append" type="primary" @click="fullAddressSearchDialog = true">全库搜索</el-button>
            </el-input>
          </el-col>
        </el-row>
      </el-header>
      <!-- 仓库地址名称，横向tab -->
      <el-main>
        <el-tabs
          v-model="activeAddressName"
          @tab-click="handleChangeTab"
          type="card"
          :stretch="false"
          lazy
          :before-leave="reloadLeftTab"
        >
          <el-tab-pane
            v-for="(addressItem,index) in addressData"
            :label="addressItem.name"
            :name="String(addressItem.id)"
            :key="String(addressItem.id)"
          >
            <!-- 型号名称，左侧纵向tab -->
            <el-tabs tab-position="left" v-model="activeModelName" lazy>
              <el-tab-pane
                v-for="(modelItem,index) in modelData"
                :name="String(modelItem.id)"
                :key="String(modelItem.id)"
                :disabled="modelItem.nums==null"
                :label="modelItem.name"
              >
              <!-- :label="getModelLable(modelItem)" -->
                <transition name="el-fade-in-linear">
                  <stockAndSubscribe
                    :modelId="String(modelItem.id)"
                    :addressId="String(addressItem.id)"
                    :dealName="modelItem.name"
                    :modelData="modelData"
                    :addressData="addressData"
                    :key="activeAddressName+'@'+activeModelName"
                    @tellParentReloadLeftTab="reloadLeftTab"
                    v-if="activeAddressName==addressItem.id && activeModelName==modelItem.id && !reloadStockAndSubscribe"
                  />
                </transition>
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
    <div id="fullAddressSearchDialog">
      <el-dialog
        title="全仓库搜索"
        :visible.sync="fullAddressSearchDialog"
        width="80%"
        :before-close="handleClose"
      >
        <fullAddressSearch
          :keyword="leftSideSearchBarText"
          :modelData="modelData"
          :addressData="addressData"
          @fullAddressSearchTellParentSelectRow="setSearchResult"
          v-if="fullAddressSearchDialog"
        />
        <span slot="footer" class="dialog-footer">
          <el-button @click="fullAddressSearchDialog = false">取 消</el-button>
          <el-button type="primary" @click="doSearch">跳转</el-button>
          <el-button type="primary" @click v-if="false">导出</el-button>
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
// import searchBar from "@/views/manager/search/index.vue";
import subscribe from "@/views/manager/subscribe.vue";
import recordOperation from "@/views/manager/recordOperation.vue";
import fullAddressSearch from "@/views/manager/fullAddressSearch.vue";
import { deepClone } from "@/utils/deep-clone.js";

export default {
  components: {
    subscribe,
    // searchBar,
    recordOperation,
    stockAndSubscribe,
    fullAddressSearch
  },
  data() {
    return {
      tableData: null, // 用以显示型号数据的表格
      current: 1, // 当前页面
      size: 15, // 一页有几条记录
      total: null, // 查询出来的总数
      modelData: null, // 查询出来的型号数据 为一个list
      modelDataBackup: null, // 查询出来的型号数据 为一个list - 备份
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
      reloadStockAndSubscribe: false, // 是否需要刷新StockAndSubscribe子组件
      leftSideSearchBarText: "", // 左侧边栏的搜索栏里的搜索文字
      fullAddressSearchDialog: false, // 全仓库搜索Dialog
      searchResult: null // 保留搜索的结果
    };
  },
  created() {
    // # 处理型号和地址
    this.getBasicData().then(res => {
      // # 处理库存信息
      this.visible.model = true;
      this.canLoadStockAndSubScribe = true;
    });
  },
  watch: {
    leftSideSearchBarText() {
      this.filterModelData();
    }
  },
  methods: {
    // 获取基础数据
    async getBasicData() {
      // # 处理型号和地址
      // ## 获取地址
      let listAddressRes = await listAddress();
      this.addressData = listAddressRes.data;
      this.activeAddressName = String(this.addressData[0].id);
      // ## 获取型号
      let listModelRes = await listModel({ addressId: this.activeAddressName });
      this.modelData = listModelRes.data;
      // ### 制作备份，为快捷搜索方法提供数据恢复的可能
      this.modelDataBackup = deepClone(this.modelData);
      this.activeModelName = String(this.modelData[0].id);
    },
    // 激活的标签名
    async handleChangeTab(tab, event) {
      this.loading = true;
      this.activeAddressName = tab.name;
    },
    // 切换标签之前获取新的数据，只有获取成功了才允许切换
    reloadLeftTab(activeName, oldActiveName) {
      return new Promise((resolve, reject) => {
        // ## 获取型号
        listModel({ addressId: activeName }).then(res => {
          this.modelData = res.data;
          resolve();
        });
      });
    },
    // // 获取型号标签
    // getModelLable(modelItem) {
    //   if (modelItem.nums == null) {
    //     return modelItem.name;
    //   } else {
    //     return modelItem.name + `(${modelItem.nums})`;
    //   }
    // },
    // 搜索方法
    setSearchResult(val) {
      this.searchResult = deepClone({
        activeAddressName: val.address,
        activeModelName: val.model
      });
    },
    async doSearch(val) {
      if (this.searchResult == null) {
        this.$message.error("请选择一项以跳转");
        return;
      }
      // 清空搜索项
      this.leftSideSearchBarText = "";
      // 跳转到选择的选项
      this.activeAddressName = String(this.searchResult.activeAddressName);
      this.activeModelName = String(this.searchResult.activeModelName);
      this.searchResult = null;
      this.fullAddressSearchDialog = false;
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
          // 重新赋值 = 重建组件
          this.activeAddressName = String(this.recordOperationData.address);
          this.activeModelName = String(this.recordOperationData.model);
          // 刷新侧边栏
          this.reloadLeftTab(String(this.recordOperationData.address));
          // 重新根据新的仓库id和型号id获取仓储记录
          this.reloadStockAndSubscribeFunc();
          // 清除临时数据
          this.visible.recordOperation = false;
          this.recordOperationData = null;
        } else {
          this.$message.error(res.data);
        }
      });
    },
    // 编辑已有的记录
    handleEditRecord() {
      editRecordAPI({
        stockJson: JSON.stringify(this.recordOperationData)
      }).then(res => {
        if (res.status == 1) {
          this.$message.success(res.data);
          // 重新根据新的仓库id和型号id获取仓储记录
          this.reloadStockAndSubscribeFunc();
        } else {
          this.$message.error(res.data);
        }
        // 清除临时数据
        this.visible.recordOperation = false;
        this.recordOperationData = null;
        this.waitOperationRow = null;
      });
    },
    /** 工具方法*/
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
    // 快捷搜索侧边栏的型号数据
    filterModelData() {
      // 获取备份
      this.modelData = this.modelDataBackup;
      // 如果输入的值为空，直接返回备份，页面显示效果 = 所有型号依旧存在
      if (this.leftSideSearchBarText == "") {
        return;
      }
      // 如果输入值不为空，根据输入值模糊匹配
      let afterFilter = [];
      this.modelData.forEach(element => {
        if (
          element.name
            .toLowerCase()
            .indexOf(this.leftSideSearchBarText.toLowerCase()) != -1
        ) {
          afterFilter.push(element);
        }
      });
      this.modelData = afterFilter;
      // 自动载入搜索到的第一个子组件
      if (this.modelData.length > 0) {
        this.activeModelName = String(this.modelData[0].id);
      }
    },
    // 重新根据新的仓库id和型号id获取仓储记录
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