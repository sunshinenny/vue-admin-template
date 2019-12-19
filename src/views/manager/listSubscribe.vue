<template>
  <div>
    <el-table
      :data="tableData"
      style="width: 100%"
      border
      stripe
      empty-text="无预约信息"
      ref="listSubscribeTable"
    >
      <el-table-column prop="subscribeChangeNum" label="预约操作数" align="center"></el-table-column>
      <el-table-column label="预约时间" width="180" align="center">
        <template slot-scope="scope">{{dateFormat(scope.row.subscribeChangeTime)}}</template>
      </el-table-column>
      <el-table-column prop="subscribeChangeUserName" label="对接人姓名" align="center"></el-table-column>
      <el-table-column prop="subscribeChangeUserPhone" label="对接人联系方式" align="center"></el-table-column>
      <el-table-column prop="subscribeChangeAddress" label="对接人地址" align="center"></el-table-column>
      <el-table-column prop="des" label="备注" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="info" @click="tellParentShowEditSubscibeDialog(scope.row)">编辑</el-button>
          <el-button type="success">完成</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  props: ["tableData"],
  data() {
    return {};
  },
  methods: {
    tellParentShowEditSubscibeDialog(row) {
      this.$emit("tellParentShowEditSubscibeDialog", row);
    },
    /** 工具方法*/
    dateFormat(time) {
      let tempDate = new Date(time);
      let date = new Date(tempDate.valueOf() - 0 * 60 * 60 * 1000); // 当前时间减掉0小时
      return date.toLocaleString();
    }
  }
};
</script>

<style>
</style>