<template>
  <div>
    <div>
      <el-row>
        <el-col :span="10" align="left">
          库存范围
          <el-input-number v-model="numsRange.min" @change="filterTableDataFunction"></el-input-number>&nbsp;&nbsp;至&nbsp;&nbsp;
          <el-input-number v-model="numsRange.max" @change="filterTableDataFunction"></el-input-number>
        </el-col>
        <!-- <el-col :span="2">&nbsp;</el-col> -->
        <el-col :span="12">
          最近出入库时间范围
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="filterTableDataFunction"
          ></el-date-picker>
        </el-col>
        <el-col :span="2">
          <el-button type="danger" @click="clearSearchOption">清除</el-button>
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
        height="250"
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
      tableDataBackup: null,
      currentRow: null,
      numsRange: {
        min: 0,
        max: 0
      },
      dateRange: null
    };
  },
  created() {
    listModelByNameKeyword({ keyword: this.keyword }).then(res => {
      if (res.status == 1) {
        this.tableData = res.data;
        this.enhanceTableData().then(res => {
          this.tableDataBackup = deepClone(this.tableData);
        });
      } else {
        this.$message.error(res.data);
      }
    });
  },
  methods: {
    enhanceTableData() {
      return new Promise((resolve, reject) => {
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
        resolve();
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
    },
    // 数量范围筛选事件被触发时调用该函数
    filterTableDataFunction() {
      // 定义一个新的TableData，用以存放筛选后的值
      let filterTableData = [];
      // 从最原始的备份数据中进行筛选
      this.tableDataBackup.forEach(element => {
        // 如果记录的库存范围在[min,max]之间，则将其添加到筛选结果中
        // console.log(
        //   filterNumsRange(element, this.numsRange),
        //   filterDateRange(element, this.dateRange)
        // );
        if (
          filterNumsRange(element, this.numsRange) &&
          filterDateRange(element, this.dateRange)
        ) {
          filterTableData.push(element);
        }
      });
      function filterNumsRange(item, numsRange) {
        if (numsRange.max != 0 || numsRange.min != 0) {
          return item.nums >= numsRange.min && item.nums <= numsRange.max;
        } else {
          return true;
        }
      }
      function filterDateRange(item, dateRange) {
        if (dateRange !== null) {
          return (
            new Date(item.changeTime).getTime() >=
              new Date(dateRange[0]).getTime() &&
            new Date(item.changeTime).getTime() <=
              new Date(dateRange[1]).getTime()
          );
        } else {
          return true;
        }
      }

      // 筛选完毕
      // 赋值到tableData以在表格中显示
      this.tableData = deepClone(filterTableData);
    },
    // 清理搜索参数
    clearSearchOption() {
      this.numsRange = {
        min: 0,
        max: 0
      };
      this.dateRange = null;
      // 恢复最初的数据
      this.tableData = this.tableDataBackup;
    }
  }
};
</script>
