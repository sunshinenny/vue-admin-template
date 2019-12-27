<template>
  <div>
    <div>
      <el-row>
        <el-col :span="12" align="left">
      库存范围
      <el-input-number v-model="min"></el-input-number>&nbsp;&nbsp;至&nbsp;&nbsp;
      <el-input-number v-model="max"></el-input-number>
        </el-col>
        <!-- <el-col :span="2">&nbsp;</el-col> -->
        <el-col :span="12" align="right">
          最近出入库时间范围
          <el-date-picker
      v-model="dataRange"
      type="daterange"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期">
    </el-date-picker>
        </el-col>
      </el-row>
    </div>
    <div style="margin:20px 0px">
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        v-loading="tableData==null"
        highlight-current-row
        ref="multipleTable"
        @current-change="handleCurrentChange"
      >
        <el-table-column prop="dealName" label="型号" align="center"></el-table-column>
        <el-table-column prop="addressName" label="仓库" align="center"></el-table-column>
        <el-table-column prop="nums" label="库存" align="center"></el-table-column>
        <el-table-column label="最近出入库时间" align="center" width="200">
          <template slot-scope="scope">{{dateFormat(scope.row.changeTime)}}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>


<script>
import { listModelByNameKeyword } from "@/request/api.js";
import { deepClone } from "@/utils/deep-clone.js";

export default {
  props: ["keyword", "modelData", "addressData"],
  data() {
    return {
      tableData: null,
      tableDataBackup:null,
      currentRow: null,
      min: 0,
      max: 0,
      dataRange:''
    };
  },
  created() {
    listModelByNameKeyword({ keyword: this.keyword }).then(res => {
      if (res.status == 1) {
        this.tableData = res.data;
        this.tableDataBackup = deepClone(res.data)
        this.enhanceTableData();
      } else {
        this.$message.error(res.data);
      }
    });
  },
  watch: {
    min() {},
    max() {
    }
  },
  methods: {
    enhanceTableData() {
      this.tableData.forEach(element => {
        this.modelData.forEach(el => {
          if (el.id === element.model) {
            element.dealName = el.dealName;
          }
        });
        this.addressData.forEach(address => {
          if (address.id === element.address) {
            element.addressName = address.name;
          }
        });
      });
    },
    dateFormat(time) {
      let tempDate = new Date(time);
      let date = new Date(tempDate.valueOf() - 0 * 60 * 60 * 1000); // 当前时间减掉0小时
      return date.toLocaleString();
    },
    handleCurrentChange(val) {
      this.currentRow = val;
      this.$emit("fullAddressSearchTellParentSelectRow", val);
    }
  }
};
</script>
