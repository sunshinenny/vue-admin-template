<template>
  <div class="update">
    <el-container>
      <!-- style="margin-top:20px" -->
      <el-header height="10px"></el-header>
      <el-main>
        <el-tabs type="card" :stretch="false" :lazy="true" v-model="activeTabName">
          <!-- @tab-click="handleClick" -->
          <el-tab-pane label="仓库名称管理" name="first">
            <el-row>
              <el-col :span="14">
                <el-button type="success" @click="visible.addAddress = true">添加仓库</el-button>
              </el-col>
            </el-row>
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
            <el-row>
              <el-col :span="14">
                <el-button type="success" @click="visible.addModel = true">添加型号</el-button>
              </el-col>
            </el-row>
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

    <div class="addAddressDialog">
      <el-dialog :title="'添加新仓库'" :visible.sync="visible.addAddress" width="40%">
        <el-form>
          <el-form-item label="新仓库名称">
            <el-input v-model="addressForm.newAddressName"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="visible.addAddress = false">取 消</el-button>
          <template>
            <el-button type="primary" @click="addNewAddress(addressForm)">添加</el-button>
          </template>
        </span>
      </el-dialog>
    </div>

    <div class="addModelDialog">
      <el-dialog :title="'添加新型号'" :visible.sync="visible.addModel" width="40%">
        <el-form>
          <el-form-item label="新型号名称">
            <el-input v-model="modelForm.newModelName"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="visible.addModel = false">取 消</el-button>
          <template>
            <el-button type="primary" @click="addNewModel(modelForm)">添加</el-button>
          </template>
        </span>
      </el-dialog>
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
  updateAddressNameAPI,
  addNewAddressAPI,
  addNewModelAPI
} from "@/request/api";
import { log } from "util";

export default {
  props: ["NAME"],
  data() {
    return {
      addressForm: {
        id: null,
        newAddressName: null
      },
      modelForm: {
        id: null,
        newModelName: null
      },
      visible: {
        addAddress: false,
        addModel: false // 添加记录弹窗
      },
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
    },
    addNewAddress(addressForm) {
      
      addNewAddressAPI({
        newName: addressForm.newAddressName
      }).then(res => {
        if (res.status === 1) {
          this.$message.success(res.data);
          this.getBasicData();
        } else {
          this.$message.error(res.data);
        }
      });
    },
    addNewModel(modelForm) {
      
      addNewModelAPI({
        newName: modelForm.newModelName
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
