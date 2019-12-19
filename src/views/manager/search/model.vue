<template>
  <div class="modelSearch">
    <el-select v-model="selected" placeholder="请选择型号" @change="handleChange" filterable>
      <el-option v-for="item in modelData" :key="item.id" :label="item.dealName" :value="item.id"></el-option>
    </el-select>
  </div>
</template>

<script>
export default {
  name: "modelSearch",
  props: ["modelData", "passSelected"],
  data() {
    return {
      selected: null
    };
  },
  created() {
    if (this.passSelected != null || this.passSelected != undefined) {
      this.selected = this.passSelected;
    }
  },
  methods: {
    handleChange(value) {
      console.log(this.selected);
      this.$emit("modelDialogTellParentTheModel", this.selected);
    }
  }
};
</script>

<style>
</style>