<template>
  <div class="changeRangeSearch">
    <el-row>
      <el-col :span="11">
        <el-input-number v-model="num1" controls-position="right" @change="tellParentChangeRange"></el-input-number>
      </el-col>
      <el-col :span="2">到</el-col>
      <el-col :span="11">
        <el-input-number v-model="num2" controls-position="right"
          @change="tellParentChangeRange"
        ></el-input-number>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "changeRangeSearch",
  props: ["changeRangeData"],
  data() {
    return {
      num1: 0,
      num2: 0
    };
  },
  created() {
    this.dealChangeRange();
  },
  methods: {
    tellParentChangeRange(){
      this.$emit(
        "changeRangeDialogTellParentTheChangeRange",
        {
          num1:this.num1,
          num2:this.num2
        }
      );
    },
    dealChangeRange() {}
  }
};
</script>

<style>
</style>