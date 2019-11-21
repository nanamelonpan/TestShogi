<template>
  <g transform = "translate(100,100)" >
    <g transform = "translate(50,350)">
      <text>{{teban}}{{stage}}</text>
    </g>
    <g v-for="(r,i) in masu">
      <rect v-for="(c,j) in r" :x="100+100*j" :y="100+100*i" width="100" height="100" stroke="black" :fill="masu[j][i]==0? white:pink" @click="masuClick(j,i)"></rect>
    </g>
    <koma v-for="(f,idx) in koma"  @action="act(0,idx)" :teban="f.teban" :x="f.x" :y="f.y" :idx="idx" :na ="f.na"></koma>
  </g>
</template>

<script>
import koma from '~/components/koma.vue'
import axios from 'axios';
import firebase from "~/plugins/firebase.js";
import { mapGetters} from 'vuex';
const db = firebase.firestore();

export default{
  components:{
    koma
  },
  data: function(){
    return {
      koma:[{na:"fu",x:1,y:1,teban:0,nari:false},{na:"fu",x:3,y:3,teban:1,nari:false},{na:"ou",x:2,y:1,teban:0,nari:false},{na:"ou",x:2,y:3,teban:1,nari:false},
      {na:"gin",x:0,y:0,teban:0,nari:false},{na:"gin",x:4,y:4,teban:1,nari:false}],
      temochi:[1,1],
      masu:[[0,0,0],[0,0,0],[0,0,0]],
      ugoki:{fu:[[0,1]],gin:[[0,1],[1,1],[-1,1],[1,-1],[-1,-1]],ou:[[-1,1],[0,1],[1,1],[-1,0],[1,0],[-1,-1],[0,-1],[1,-1]],kin:[[-1,1],[0,1],[1,1],[-1,0],[1,0],[0,-1]]},
      white:"white",
      pink:"pink",
      f:"fu",
      o:"ou",
      g:"gin",
      teban:0,
      stage:"choose",
      chosen:null
    };
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
    //dbのデータを見て動けるか判断する
    possiblePositionsFu: function(i){
      let koma = this.koma[i];
      let dir = (this.teban == 0?1:-1);
      let positions =[];
      //if (!koma.nari){
      if (true){
        //盤に収まるかどうか
        //of　で一つ一つがuに入っていく

        //持ち駒だった時　= 駒が置いていないところに置くことができる
        //駒が手持ちの時
        //xではなくyで判定
        if(koma.y<1|koma.y>3){
          var line = 0;
          var line2 = 0;
          //持ち駒でかつその駒が歩だった時
          if(koma.na=="fu"){
            //2歩になってしまうかもしれない場合、そこの列には置けないようにする
            line =  this.ableToPutFu(koma.x,koma.y,koma.teban);
            console.log("line");
            console.log(line);
            //これ以上進めないところに置けないようにする
            line2 = koma.teban*(-2) + 3;
            //line2 = koma.teban*(2) + 1;

          }
          //iが横 jが縦
          for(var i = 1; i<4;i++) {
            for(var j=1;j<4;j++){

              //現在地+動く方向　が盤面に収まっているか
              //もしも駒が歩だったら
              //if(i == line){i = i+1;}
              if(i ==  line ){i = i+1;}
              if(j == line2){j = j+1;}

              if(this.occupied(i,j,0)&&this.occupied(i,j,1)&&i<4&&j<4){
                positions.push({x:i,y:j});
              }

            }
          }
        }else{
          var ugoki;
          if (koma.nari){
            console.log("成りだったよ");
            ugoki = this.ugoki['kin'];
          }else{
            ugoki = this.ugoki[koma.na];
          }
          //for(let u of this.ugoki[koma.na]) {
          for(let u of ugoki) {
            //現在地+動く方向　が盤面に収まっているか
            if(this.isInside(koma.x+dir*u[0],koma.y+dir*u[1]) && this.occupied(koma.x+dir*u[0],koma.y+dir*u[1],koma.teban)){
              positions.push({x:koma.x+dir*u[0],y:koma.y+dir*u[1]});
            }
          }
        }
        console.log("-------");
        console.log(positions);
        return positions;
      }
    },
    //local
    isInside(x,y){
      if(x>=1 && x<=3 && y>=1 && y<=3){
        return true;
      }
      else return false;

    },
    //自分の駒がないことを確認
    //駒があったらfalse
    //db
    occupied(x,y,teban){
      for (let k of this.koma){
        if(k.x == x && k.y == y && k.teban == teban){
          return false;
        }
      }
      return true;

    },
    //そこに相手の駒があるかをみる
    //db
    find(i,j){
      //インデックスにするためにinにする
      for(let k in this.koma){
        if(this.koma[k].x == j && this.koma[k].y == i && this.koma[k].teban !=this.teban  ) {
          return k;
          //このうちの何番目がそれですか
        }
      }
      return null;
    },
    //そこに歩が打てるかどうか　(これ以上進めるか＆に歩ではないか)
    //db
    ableToPutFu(x,y,teban){
      // for(var i = 1; i<4; i++){
      //
      //if(!this.occupied(i,y,teban)){return i;}
      //ここの部分がうまくいってない
      //xが列かもしれない
      for (let k of this.koma){
        for(var i = 1; i<4; i++){
          //if(k.x == x && k.y == y && k.teban == teban && k.na == "fu"){
          //最後の条件のところで持ち駒を換算しなくなる
          if(k.y == i && k.teban == teban && k.na == "fu" && k.x < 4 && k.x>0){
            console.log("???");
            console.log(i);

            return i;
          }
        }
      }
      return 4;
      //}

    },
    //db
    //動けるところに色をつける
    act: function(k,i){
      this.masu = [[0,0,0],[0,0,0],[0,0,0]];
      //this.stage == "choose";
      // if (this.stage == "choose") {
      if (true) {
        //自分のコマか
        console.log("aaa");
        if (this.koma[i].teban == this.teban) {
          //色の反転
          //からの時は
          //ここにmasuの初期化を追加

          if(this.possiblePositionsFu(i).length == 0){
            return;
          }
          for (let p of this.possiblePositionsFu(i)){

            console.log(p);
            this.masu[p.x-1].splice(p.y-1,1,1);
          }
          console.log(k);
          //this.stage ="move";
          this.chosen = i

        }

      } else {
        //move
        //現在どの駒が選択されているか

        if (this.masu) {

        }

      }
    },
    masuClick:function (j,i) {
      //console.log("きた");

      //if (this.stage == "move") {
      if (true) {
        console.log("きた");

        if (this.masu[j][i] == 1) {
          console.log([j,i]);
          //駒を動かす
          console.log("3333333");
          console.log(this.chosen);
          this.move(this.chosen,i,j);

          //もし相手の駒があったら持ち駒にする
          // if(!occupied(i,j,1-this.teban)){
          //
          // }
          //this.pickUp(j,i,this.teban)
          this.stage ="choose";
          //マス
          this.masu = [[0,0,0],[0,0,0],[0,0,0]];
          this.teban = 1 - this.teban;

        }

      }

    },
    mleave: function(i){
      this.masu = [[0,0,0],[0,0,0],[0,0,0]];
    },
    move: function(idx,i,j){
      //[{na:"fu",x:1,y:1,teban:0, nari:false}
      //ここで上段でかつ歩だったら成る
      //上段かの判定　line2 = koma.teban*(-2) + 3;
      //このline2が　yの値になる
      //->line2 ==
      //上段の時　かつふだった時
      if(i+1 == this.koma[idx].teban*(-2) + 3　&& this.koma[idx].na == "fu" ){
        //成をtrueにする
        this.koma[idx].nari = true;

      }

      this.koma.splice(idx,1,{na:this.koma[idx].na,teban:this.koma[idx].teban,nari:this.koma[idx].nari, x:j+1,y:i+1});

      //相手の駒がそこにあるかを確認する
      //あった場合それが玉であれば勝敗が決定し、
      let k  = this.find(i+1,j+1);
      console.log(k);
      //持ち駒になる場合
      if(k){
        let x =0;
        if(this.koma[k].teban==1){
          //上
          x = this.temochi[1];
          this.temochi[1]++;
        }
        else {
          x = 4-(this.temochi[0]);
          this.temochi[0]++;
        }
        this.koma.splice(k,1,{na:this.koma[k].na,teban:(1-this.koma[k].teban),nari:false,x:x,y:this.koma[k].teban==1?0:4});
        if(this.koma[k].na=="ou"){
          //とった駒が王様か判定
          //location.replace('Result.html');
        }
        //もしもとった駒が王様だったら

      }
    }
    // tfUchifuTsume(){
    //
    // }
  }
}

</script>
