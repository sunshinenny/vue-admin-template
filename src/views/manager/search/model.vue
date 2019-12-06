<template>
  <div class="modelSearch">
    <el-cascader
      :options="options"
      :props="{ checkStrictly: true , expandTrigger: 'hover' }"
      @change="handleChange"
      clearable
      placeholder="选择型号"
    ></el-cascader>
  </div>
</template>

<script>
import { reject } from "q";
export default {
  name: "modelSearch",
  props: ["modelData"],
  data() {
    return {
      options: []
    };
  },
  created() {
    this.dealModel();
  },
  methods: {
    handleChange(list) {
        this.$emit("modelDialogTellParentTheModel",list.slice(-1)[0])
    },
    dealModel() {
      // 同步代码保证数据不会错乱
      this.getParent().then(res => {
        this.getChilden();
      });
    },
    getParent() {
      return new Promise((resolve, reject) => {
        this.modelData.forEach(element => {
          if (element.parentId === null) {
            this.options.push({
              value: element.id,
              label: element.name,
              children: []
            });
          }
        });
        resolve();
      });
    },
    getChilden() {
      return new Promise((resolve, reject) => {
        this.modelData.forEach(element => {
          if (element.parentId !== null) {
            this.options.forEach(item => {
              if (item.value === element.parentId) {
                item.children.push({
                  value: element.id,
                  label: element.name
                });
              }
            });
          }
        });
        resolve();
      });
    }
  }
};
</script>

<style>
</style>