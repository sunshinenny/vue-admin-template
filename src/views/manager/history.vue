<template>
  <div class="history">
    <el-table
      ref="singleTable"
      :data="tableData"
      border
      style="width: 100%"
      stripe
      highlight-current-row
      @current-change="handleCurrentChange"
    >
      <el-table-column prop="dealName" label="型号" align="center"></el-table-column>
      <el-table-column prop="nums" label="库存" align="center"></el-table-column>
      <el-table-column label="最近出入库时间" align="center">
        <template slot-scope="scope">{{dateFormat(scope.row.changeTime)}}</template>
      </el-table-column>
      <el-table-column label="最近出入库数量" align="center">
        <template slot-scope="scope">
          <span :class="scope.row.changeNum<0?'lessThanZero':'greaterThanZero'">{{scope.row.changeNum}}</span>
        </template>

      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { listStockHistory } from "@/request/api";

export default {
  name: "history",
  props: ["originId", "modelData"],
  data() {
    return {
      tableData: null,
      currentRow: null
    };
  },
  created() {
    this.getHistory();
  },
  methods: {
    handleCurrentChange(val) {
      this.currentRow = val;
      this.$emit("getAimIdAndOriginId", {
        aimId: val.id,
        originId: val.originId
      });
    },
    async getHistory() {
      let historyRes = await listStockHistory({
        originId: this.originId
      });
      this.tableData = historyRes.data;
      this.enhanceTableData();
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

<style scoped>
.greaterThanZero {
  font-weight: bold;
}
.lessThanZero {
  font-weight: bold;
  color: #f56c6c;
}
</style>