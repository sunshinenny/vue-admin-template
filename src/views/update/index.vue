<template>
  <div class="update">
    <el-container style="margin-top:20px">
      <el-header></el-header>
      <el-main>
        <el-tabs type="card" :stretch="false" :lazy="true" v-model="activeTabName">
          <!-- @tab-click="handleClick" -->
          <el-tab-pane label="仓库名称管理" name="first">
            <el-table :data="addressData" style="width: 100%">
              <el-table-column label="仓库名称">
                <template slot-scope="scope">{{scope.row.name}}</template>
              </el-table-column>
              <el-table-column label="新名称">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.newName"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="确认新名称">
                <template slot-scope="scope">{{scope.row.newName}}</template>
              </el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" @click="updateAddressName(scope)">更改</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <!-- <template v-for="item in modelData">
            <el-row>
              {{item.name}}
            </el-row>
          </template>-->
          <el-tab-pane label="型号名称管理" name="second">
            <el-table :data="modelData" style="width: 100%">
              <el-table-column label="型号名称">
                <template slot-scope="scope">{{scope.row.name}}</template>
              </el-table-column>
              <el-table-column label="新名称">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.newName"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="确认新名称">
                <template slot-scope="scope">{{scope.row.newName}}</template>
              </el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" @click="updateModelName(scope)">更改</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
    <div>
      <el-dialog></el-dialog>
    </div>
  </div>
</template>

<style>
</style>
<script>
import {
  // pageAllStockByAddress,
  listModel,
  listAddress,
  updateModelNameAPI,
  updateAddressNameAPI
} from "@/request/api";
import { log } from 'util';

export default {
  props: ["NAME"],
  data() {
    return {
      tableData: null, // 用以显示型号数据的表格
      modelData: null, // 查询出来的型号数据 为一个list
      addressData: null, // 查询出来的地址数据 为一个list
      loading: true, //加载数据项的时候不允许进行相关数据操作,避免出现异常
      activeTabName: "first"
    };
  },
  computed: {},
  created() {
    // # 处理型号和地址
    this.getBasicData().then(res => {
      // # 处理库存信息
      // this.visible.model = true;
      // this.canLoadStockAndSubScribe = true;
    });
  },
  mounted() {
    this.getBasicData();
  },
  watch: {},
  methods: {
    // 获取基础数据
    async getBasicData() {
      // # 处理型号和地址
      let listModelRes = await listModel();
      this.modelData = listModelRes.data;
      let listAddressRes = await listAddress();
      this.addressData = listAddressRes.data;
      // this.AddressName = String(this.addressData[0].AddressName);
      // this.ModelName = String(this.modelData[0].ModelName);
    },
    updateAddressName(scope) {
      updateAddressNameAPI({
        // stockJson: JSON.stringify(scope)
        id: scope.row.id,
        newName: scope.row.newName
      }).then(res => {
        if (res.status === 1) {
          this.$message.success(res.data);
          this.getBasicData();
        } else {
          this.$message.error(res.data);
        }
      });
    },
    updateModelName(scope) {
      console.log(scope);
      updateModelNameAPI({
        id: scope.row.id,
        newName: scope.row.newName
      }).then(res => {
        if (res.status === 1) {
          this.$message.success(res.data);
          this.getBasicData();
        } else {
          this.$message.error(res.data);
        }
      });
    }
  },
  components: {}
};
</script>
