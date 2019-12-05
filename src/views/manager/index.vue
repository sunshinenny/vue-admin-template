<template>
  <div class="manager">
    <el-container style="margin-top:20px">
      <el-header>
        <el-row>
          <el-col>
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
        <el-table :data="tableData" border style="width: 100%" stripe>
          <el-table-column prop="dealName" label="型号" align="center"></el-table-column>
          <el-table-column prop="nums" label="库存" align="center"></el-table-column>
          <el-table-column label="最近出入库时间" align="center">
            <template slot-scope="scope">{{dateFormat(scope.row.changeTime)}}</template>
          </el-table-column>
          <el-table-column label="出入库操作" width="250" align="center">
            <template slot-scope="scope">
              <!--  @change="handleChange"  -->
               <el-input-number v-model="scope.row.waitToChange" style="width: 120px;"  controls-position="right":min="0"></el-input-number>
              <el-button
                icon="el-icon-minus"
                circle
                type="primary"
                @click="changeCurrentNum(scope,-1)"
              ></el-button>
              <el-button
                icon="el-icon-plus"
                circle
                type="danger"
                @click="changeCurrentNum(scope,1)"
              ></el-button>
            </template>
          </el-table-column>
          <el-table-column label="预约出入库时间" align="center">
            <template slot-scope="scope">
              <span
                v-if="scope.row.subscribeChangeTime!==null"
              >{{dateFormat(scope.row.subscribeChangeTime)}}</span>
              <span v-else>暂无安排</span>
            </template>
          </el-table-column>
          <el-table-column label="预约出入库数量" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.subscribeChangeNum!==null">{{scope.row.subscribeChangeNum}}</span>
              <span v-else>暂无安排</span>
            </template>
          </el-table-column>
          <el-table-column label="预约出入库操作" align="center">
            <template slot-scope="scope">
              <el-button type="danger" v-if="scope.row.subscribeChangeTime!==null">修改预约</el-button>
              <el-button v-else type="primary">新的预约</el-button>
            </template>
          </el-table-column>
          <el-table-column label="高级操作" align="center">
            <template slot-scope="scope">
              <el-button type="primary">历史记录</el-button>
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
  </div>
</template>

<script>
import {
  pageAllStockByAddress,
  listModel,
  listAddress,
  changeStockNum
} from "@/request/api";
export default {
  data() {
    return {
      tableData: null, // 用以显示型号数据的表格
      current: 1, // 当前页面
      size: 15, // 一页有几条记录
      total: null, // 查询出来的总数
      modelData: null, // 查询出来的型号数据 为一个list
      addressData: null, // 查询出来的地址数据 为一个list
      activeName: "1", // 默认激活的标签页
      currentPageState: "init" //总共页数
    };
  },
  created() {
    // # 处理型号和地址
    this.getBasicData().then(res=>{
      // # 处理库存信息
      this.handleCreateTable();
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
      console.log(tab);
      this.activeName = tab.name;
      this.handleCreateTable();
    },
    // 出入库操作
    changeCurrentNum(scope, type) {
      console.log(scope.row)
      if (
        scope.row.waitToChange === 0 ||
        scope.row.waitToChange === undefined || scope.row.waitToChange ===""
      ) {
        this.$message.error("请确认出入库的数量");
        return
      }

      if (
        scope.row.nums + scope.row.waitToChange * type < 0 
      ) {
        this.$message.error("库存数不能小于 0");
        return
      }
      changeStockNum({
        id: scope.row.id,
        num: scope.row.waitToChange * type
      }).then(res => {
        if(res.status === 1){
          this.$message.success(res.data)
          this.handleCreateTable()
        }else{
          this.$message.error(res.data)
        }
      });
    },
    dateFormat(time) {
      let tempDate = new Date(time);
      let date = new Date(tempDate.valueOf() - 8 * 60 * 60 * 1000); // 当前时间减掉8小时
      return date.toLocaleString();
    }
  }
};
</script>

<style>
</style>
