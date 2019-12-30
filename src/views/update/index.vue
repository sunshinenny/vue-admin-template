<template>
  <div class="update" style="margin-top:10px">
    <el-container>
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
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="warning" @click="updateAddressName(scope)">重命名</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
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
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="warning" @click="updateModelName(scope)">重命名</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>

    <div class="addAddressDialog">
      <el-dialog :title="'添加新仓库'" :visible.sync="visible.addAddress" width="30%">
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
      <el-dialog :title="'添加新型号'" :visible.sync="visible.addModel" width="30%">
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
    this.getBasicData();
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
      this.$confirm("确定是您的本意?", "提示", {
        confirmButtonText: "继续",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          updateAddressNameAPI({
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
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消操作"
          });
        });
    },
    updateModelName(scope) {
      this.$confirm("确定是您的本意?", "提示", {
        confirmButtonText: "继续",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
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
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消操作"
          });
        });
    },
    addNewAddress(addressForm) {
      addNewAddressAPI({
        newName: addressForm.newAddressName
      }).then(res => {
        if (res.status === 1) {
          this.$message.success(res.data);
          this.getBasicData();
          this.visible.addAddress = false;
          this.activeTabName = "first";
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
          this.visible.addModel = false;
          this.activeTabName = "second";
        } else {
          this.$message.error(res.data);
        }
      });
    }
  },
  components: {}
};
</script>
