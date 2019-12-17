<template>
  <div>
    <el-row>
      <el-col :span="4">
        <el-select v-model="selected" placeholder="请选择型号" @change="handleChange">
          <el-option
            v-for="item in modelData"
            :key="item.id"
            :label="item.dealName"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-row>
          <el-input-number
            v-model="num1"
            controls-position="right"
            style="width: 100px;"
            @change="numChange"
          ></el-input-number>
          <span>~</span>
          <el-input-number
            v-model="num2"
            controls-position="right"
            style="width: 100px;"
            @change="numChange"
          ></el-input-number>
        </el-row>
      </el-col>
      <el-col :span="6">
        <el-date-picker
          v-model="changeDataRange"
          type="daterange"
          @change="changeDataRangeChange"
          value-format="timestamp"
          align="right"
          unlink-panels
          range-separator="至"
          start-placeholder="库存"
          end-placeholder="变更日期"
          :picker-options="pickerOptions"
          style="width:250px"
        ></el-date-picker>
      </el-col>
      <el-col :span="6">
        <el-date-picker
          v-model="subscribeDataRange"
          type="daterange"
          @change="subscribeDataRangeChange"
          value-format="timestamp"
          align="right"
          unlink-panels
          range-separator="至"
          start-placeholder="预约"
          end-placeholder="变更日期"
          :picker-options="pickerOptions"
          style="width:250px"
        ></el-date-picker>
      </el-col>
      <el-col :span="2">
        <el-button icon="el-icon-search" @click="tellParentSearch">搜索</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  props: ["modelData"],
  data() {
    return {
      selected: null,
      searchOption: {},
      num1: 0,
      num2: 0,
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },
      changeDataRange: "",
      subscribeDataRange: ""
    };
  },
  methods: {
    modelChange(list) {
      this.searchOption.model = list.slice(-1)[0];
    },
    handleChange(value) {
      this.searchOption.model = this.selected;
    },
    /** 库存检索方法*/
    numChange() {
      this.searchOption.numRange = `${this.num1},${this.num2}`;
    },
    changeDataRangeChange() {
      if (this.changeDataRange == null) {
        delete this.searchOption.changeDataRange;
      } else {
        this.searchOption.changeDataRange = `${this.changeDataRange[0]},${
          this.changeDataRange[1]
        }`;
      }
    },
    subscribeDataRangeChange() {
      if (this.subscribeDataRange == null) {
        delete this.searchOption.subscribeDataRange;
      } else {
        this.searchOption.subscribeDataRange = `${this.subscribeDataRange[0]},${
          this.subscribeDataRange[1]
        }`;
      }
    },
    /** 通信方法*/
    tellParentSearch() {
      // 数据预处理
      if (this.searchOption.numRange != undefined) {
        let range = this.searchOption.numRange.split(",");
        if (range[0] > range[1]) {
          [range[0], range[1]] = [range[1], [range[0]]]; // 交换大小
          [this.num1, this.num2] = [this.num2, this.num1];
        }
        this.searchOption.numRange = `${range[0]},${range[1]}`;
      }
      this.$emit("tellParentSearch", this.searchOption);
    }
  }
};
</script>

<style>
</style>