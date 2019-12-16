<template>
  <div class="subscribe">
    <div align="center">
      <span style="font-size:18px;color:red">正数代表入库 - 负数代表出库</span>
    </div>
    <el-form ref="form" :model="form" label-width="180px" style="margin-top:20px">
      <el-form-item label="预约出入库数量">
        <el-input-number v-model="form.subscribeChangeNum"></el-input-number>
      </el-form-item>
      <el-form-item label="预约出入库时间">
        <el-date-picker
          type="date"
          placeholder="选择日期"
          v-model="form.subscribeChangeTime"
          :picker-options="pickerOptions"
          value-format="timestamp"
          style="width: 100%;"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="对接人姓名">
        <el-input v-model="form.subscribeChangeUserName" placeholder="对接人姓名"></el-input>
      </el-form-item>
      <el-form-item label="对接人联系方式">
        <el-input v-model="form.subscribeChangeUserPhone" placeholder="对接人联系方式"></el-input>
      </el-form-item>
      <el-form-item label="对接人地址">
        <el-input v-model="form.subscribeChangeAddress" placeholder="对接人地址"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit" v-if="row===null">新增</el-button>
        <el-button type="primary" @click="onSubmit" v-else>修改</el-button>
        <el-button type="danger" v-if="row!=null" @click="deleteSubscribeWeb">取消预约</el-button>
        <el-button @click="cancel">取消操作</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { newOrUpdateSubscribe, deleteSubscribe } from "@/request/api";
export default {
  props: ["subscribeId", "row"],
  data() {
    return {
      form: {
        id: null,
        subscribeChangeNum: 0,
        subscribeChangeTime: null,
        subscribeChangeUserName: null,
        subscribeChangeUserPhone: null,
        subscribeChangeAddress: null
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        }
      }
    };
  },
  created() {
    if (this.row != null) {
      this.subscribeId = this.row.id;
      this.row.subscribeChangeTime = new Date(
        this.row.subscribeChangeTime
      ).getTime();
      this.form = this.row;
    }
  },
  methods: {
    onSubmit() {
      this.form.id = this.subscribeId;
      newOrUpdateSubscribe(this.form).then(res => {
        if (res.status == 1) {
          this.$message.success(res.data);
          // 告诉父视图关闭弹窗
          this.$emit("subscribeTellParentCloseDialog");
        } else {
          this.$message.error(res.data);
        }
      });
    },
    cancel() {
      this.$emit("cancelDialog");
    },
    // 删除本次预约信息
    deleteSubscribeWeb() {
      deleteSubscribe({
        id: this.form.id
      }).then(res => {
        if (res.status == 1) {
          this.$message.success(res.data);
        } else {
          this.$message.error(res.data);
        }
      });
      // 告诉父视图关闭弹窗
      this.$emit("subscribeTellParentCloseDialog");
    }
  }
};
</script>

<style>
</style>