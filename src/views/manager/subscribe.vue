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
          type="datetime"
          placeholder="选择时间"
          v-model="form.subscribeChangeTime"
          :picker-options="pickerOptions"
          value-format="timestamp"
          style="width: 100%;"
          default-time="12:00:00"
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
      <el-form-item label="备注">
        <el-input v-model="form.des" placeholder="备注"></el-input>
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
import { addSubscribe } from "@/request/api";
export default {
  props: ["stockId", "row", "originId"],
  data() {
    return {
      form: {
        id: null,
        subscribeChangeNum: 0,
        subscribeChangeTime: null,
        subscribeChangeUserName: null,
        subscribeChangeUserPhone: null,
        subscribeChangeAddress: null,
        des: null
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        },
        step: "00:15",
        start: "08:30",
        end: "18:30"
      }
    };
  },
  created() {
    if (this.row != null) {
      console.table(this.row);
      this.row.subscribeChangeTime = new Date(
        this.row.subscribeChangeTime
      ).getTime();
      this.form = this.row;
    }
  },
  methods: {
    onSubmit() {
      newOrUpdateSubscribe(
        this.row == null
          ? {
              // 新增使用传递来的stockId和originId
              stockId: this.stockId,
              originId: this.originId,
              subscribeJson: JSON.stringify(this.form)
            }
          : {
              // 修改使用row中的stockId和originId
              subscribeJson: JSON.stringify(this.form)
            }
      ).then(res => {
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
          // 告诉父视图关闭弹窗
          this.$emit("subscribeTellParentCloseDialog");
        } else {
          this.$message.error(res.data);
        }
      });
    }
    // funcAddSubscribe() {
    //   addSubscribe({
    //     stockId: this.stockId,
    //     originId: this.originId,
    //     subscribeJson:JSON.stringify(this.form)
    //   }).then(res=>{
    //     console.log(res)
    //   });
    // }
  }
};
</script>

<style>
</style>