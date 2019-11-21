<template>
  <v-layout
  column
  justify-center
  align-center
  >
  <div>
    <svg width="800" height="800">
      <!-- playingがtrueの時 -->
      <ban v-if="playing"> </ban>
    </svg>
  </div>
  <!-- playingじゃないとき -->
  <v-btn v-if="!playing" @click = "start">start</v-btn>
</v-layout>
</template>

<script>
import ban from '~/components/ban.vue';
import axios from 'axios';
import firebase from "~/plugins/firebase.js";
import { mapGetters} from 'vuex';
const db = firebase.firestore();


export default {
  data:function () {
    return {
      playing:false,
    }
  },
  components: {
    ban
  },
  computed: {
    // VuexからPostsデータを取得
    ...mapGetters(['games']),
    //gameというdocumentへの引用
  },
  created: function () {
    // firestoreのpostsをバインド database tb
    this.$store.dispatch('setGamesRef', db.collection('games'))
  },
  methods:{
    start :function () {
      const watashi = this;
      console.log(this.games[0].ban);
      this.playing = true;

      //手番を決める
      //dbに接続
      let ref = db.collection("games").doc("game");
      //documentをゲットすることができたらthenのなかのfunctionを実行
      //読み込み
      ref.get().then(function(doc){
        //自分がなんばんめのplayerか
        //今0人だったら1 , 1だったら２
        watashi.myteban = doc.data().num + 1;
        //dbを書き換える
        //何人来たか

        //   koma:[{na:"fu",x:1,y:1,teban:0,nari:false},{na:"fu",x:3,y:3,teban:1,nari:false},{na:"ou",x:2,y:1,teban:0,nari:false},{na:"ou",x:2,y:3,teban:1,nari:false},
        // {na:"gin",x:0,y:0,teban:0,nari:false},{na:"gin",x:4,y:4,teban:1,nari:false}],
        // temochi:[1,1],
        let initialData  = { koma:[{na:"fu",x:1,y:1,teban:0,nari:false},{na:"fu",x:3,y:3,teban:1,nari:false},{na:"ou",x:2,y:1,teban:0,nari:false},{na:"ou",x:2,y:3,teban:1,nari:false},
         {na:"gin",x:0,y:0,teban:0,nari:false},{na:"gin",x:4,y:4,teban:1,nari:false}],
         temochi:[1,1],
         teban:0
       }

         ref.update(initialData);

      })
    }
  }

}
</script>
