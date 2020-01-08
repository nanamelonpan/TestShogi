<template>
  <g  @click="chooseOrMove" :transform="trans">
    <polygon  :points="points" stroke = "black" fill = "wheat"></polygon>
    <text x="27" y="70" font-size="45">{{kanji()}}</text>
  </g>
</template>

<script>
export default {
  props: ["x","y","teban", "idx","na","nari"],

  computed:{
    trans: function(){
      //return "translate(" + parseInt(this.x)*100 + "," + parseInt(this.y)*100 + ")";
          return "translate(" + parseInt(this.x)*100 + "," + parseInt(this.y)*100 + ")";
    },
    points:function(){
      if (this.teban==0){
        return "5 0 10 70 50 100 90 70 95 0";
      }
      else {
        return "5 100 10 30 50 0 90 30 95 100";
      }
    }
  },
  methods:{
    chooseOrMove:function(){
      this.$emit("action", this.idx);
    },
    kanji:function() {
      if(this.na == "fu" && !this.nari) {
        return "歩";
      }
      else if(this.na == "fu"  && this.nari) {
        return "と";
      }
      else if (this.na == "gin" &&!this.nari) {
        return "銀";
      }else if (this.na == "gin" && this.nari) {
        return "全";
      }
      else{
        return "玉";
      }
    }
  }
}
</script>
