<template>
  <div>
    <div v-if="teban!=null"> You are {{teban}}</div>
    <svg v-if="playing" width="600" height="600">
      <!-- playingがtrueの時 -->
      <g :transform="direction(teban)">
        <g v-for="(r,i) in masu">
          <rect v-for="(c,j) in r" :x="100+100*j" :y="100+100*i" width="100" height="100" stroke="black" :fill="masu[j][i]==0? white:pink" @click="masuClick(j,i)"></rect>
        </g>
        <koma v-for="(f,idx) in games[0].koma"  @action="act(0,idx)" :teban="f.teban" :x="f.x" :y="f.y" :idx="idx" :na ="f.na" :nari = "f.nari"></koma>
      </g>
    </svg>
    <!-- playingじゃないとき -->
    <v-btn v-if="!playing" @click = "start">start</v-btn>
  </div>
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
      masu:[[0,0,0],[0,0,0],[0,0,0]],
      ugoki:{fu:[[0,1]],gin:[[0,1],[1,1],[-1,1],[1,-1],[-1,-1]],ou:[[-1,1],[0,1],[1,1],[-1,0],[1,0],[-1,-1],[0,-1],[1,-1]],kin:[[-1,1],[0,1],[1,1],[-1,0],[1,0],[0,-1]]},
      white:"white",
      pink:"pink",
      f:"fu",
      o:"ou",
      g:"gin",
      teban:null,
      chosen:null,
      playing:false,
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
    start :function () {
      const watashi = this;
      console.log(this.games[0].ban);
      this.playing = true;
      let ref = db.collection("games").doc("game");
      ref.get().then(function(doc){
        let numplayers = 1;
        if (doc.data().numplayers==1){ // firebaseにプレーヤー数を確認する。
          numplayers = 2
        }
        watashi.teban = numplayers - 1
        let initialData  = { koma:[{na:"fu",x:1,y:0,teban:0,nari:false},{na:"fu",x:3,y:4,teban:1,nari:false},{na:"ou",x:3,y:1,teban:0,nari:false},{na:"ou",x:1,y:3,teban:1,nari:false},
        {na:"gin",x:0,y:0,teban:0,nari:false},{na:"gin",x:4,y:4,teban:1,nari:false}],
        temochi:[2,2],
        teban:0,
        numplayers:numplayers
      }
      ref.update(initialData);
    })
  },
  direction(teban){
    if (teban==0){
      return "scale(1,-1) translate(100,-500)";
    }
    else{
      return "scale(1,1)";
    }
  },
  //dbのデータを見て動けるか判断する
  possiblePositionsFu: function(i, komas){
    let koma = komas[i];
    let dir = (this.teban == 0?1:-1);
    let positions =[];
    //if (!koma.nari){
    // if (true){
    if(koma.y<1|koma.y>3){
      var line = 0;
      var line2 = 0;
      var fx =0;
      var fy = 0;
      //持ち駒でかつその駒が歩だった時
      if(koma.na=="fu"){
        //2歩になってしまうかもしれない場合、そこの列には置けないようにする
        //ここkomas入れた方が良いかも
        line =  this.ableToPutFu(koma.x,koma.y,koma.teban,komas);
        console.log("line");
        console.log(line);
        //これ以上進めないところに置けないようにする
        line2 = koma.teban*(-2) + 3;
      }
      //iが横 jが縦
      for(var i = 1; i<4;i++) {
        for(var j=1;j<4;j++){
          //現在地+動く方向　が盤面に収まっているか
          //もしも駒が歩だったら
          //if(i == line){i = i+1;}
          if(i ==  line ){i = i+1;}
          if(j == line2){j = j+1;}
          if(koma.na=="fu" && this.tfUchifuTsume(i,j,koma.teban,komas)){
            console.log("打ち歩づめ");
          }
          else if(this.occupied(i,j,0,komas)&&this.occupied(i,j,1,komas)&&i<4&&j<4){
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
        if(this.isInside(koma.x+dir*u[0],koma.y+dir*u[1]) && this.occupied(koma.x+dir*u[0],koma.y+dir*u[1],koma.teban,komas)){
          positions.push({x:koma.x+dir*u[0],y:koma.y+dir*u[1]});
        }
      }
    }
    console.log("-------");
    console.log(positions);
    return positions;
    // }
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
  occupied(x,y,teban,komas){
    for (let k of komas){
      if(k.x == x && k.y == y && k.teban == teban){
        return false;
      }
    }
    return true;

  },
  //そこに相手の駒があるかをみる
  //db
  find(i,j,komas){
    //インデックスにするためにinにする
    for(let k in komas){
      if(komas[k].x == j && komas[k].y == i && komas[k].teban !=this.teban  ) {
        return k;
        //このうちの何番目がそれですか
      }
    }
    return null;
  },
  //その場所にある駒の名前を出力する
  findKomaName(x,y,teban,komas){
    //インデックスにするためにinにする
    for(let k in komas){
      // if(komas[k].x == x && komas[k].y == y && komas[k].teban =this.teban) {
      //   return komas[k].na;
      // }
      if(komas[k].x == x && komas[k].y == y && komas[k].teban == teban) {
        console.log("駒の名前は");
        console.log(komas[k].na);
        return komas[k].na;
      }
    }
    console.log("駒の名前なし");
    return null;
  },
  //そこに歩が打てるかどうか　(これ以上進めるか＆に歩ではないか)
  //db
  ableToPutFu(x,y,teban,komas){
    // for(var i = 1; i<4; i++){
    //
    //ここの部分がうまくいってない
    //xが列かもしれない
    // for (let k of this.games[0].koma){
    for (let k of komas){
      for(var i = 1; i<4; i++){
        if(k.x == i && k.teban == teban && k.na == "fu" && k.y < 4 && k.y>0){
          console.log("???");
          console.log(i);
          return i;
        }
      }
    }
    return 4;
  },
  //db
  //動けるところに色をつける
  act: function(k,i){
    this.masu = [[0,0,0],[0,0,0],[0,0,0]];
    let ref = db.collection("games").doc("game");
    const kore = this;
    ref.get().then(function(doc){
      //自分のコマか
      if (doc.data().koma[i].teban == kore.teban && kore.teban == doc.data().teban) {
        console.log(doc.data().koma[i]);
        //色の反転
        //からの時は
        //ここにmasuの初期化を追加
        if(kore.possiblePositionsFu(i,doc.data().koma).length == 0){
          return;
        }
        for (let p of kore.possiblePositionsFu(i,doc.data().koma)){
          console.log(p);
          kore.masu[p.x-1].splice(p.y-1,1,1);
        }
        console.log(k);
        kore.chosen = i
      }
    });
  },
  masuClick:function (j,i) {
    console.log("きた");
    if (this.masu[j][i] == 1) {
      //駒を動かす
      console.log(this.chosen);
      this.move(this.chosen,i,j);
      //マス
      this.masu = [[0,0,0],[0,0,0],[0,0,0]];
      //this.teban = 1 - this.teban;
      let ref = db.collection("games").doc("game");
      ref.get().then(function(doc){
        let tebannow = doc.data().teban;
        ref.update({teban:1-tebannow});
      })
    }
  },
  mleave: function(i){
    this.masu = [[0,0,0],[0,0,0],[0,0,0]];
  },
  tfUchifuTsume(x,y,teban,komas){
    //もし打った歩の目の前が相手の玉だった時,
    //手番0 =先手　うえ
    //手番1 = 後手　しただと思っている
    //もし打った歩の目の前が相手の玉だった時,
    let dir = (teban == 0?1:-1);
    if(this.findKomaName(x,teban==1?y-1:y+1,1-teban,komas)=="ou"){
      console.log("目の前が王様です");
      //他の周りの歩がその玉を取れるかどうか
      for(let k in komas){
        //相手の手番の駒があった時
        if (komas[k].teban !=teban) {
          var ugoki = this.ugoki[komas[k].na];
          if(komas[k].na!="ou"){
            for(let u of ugoki) {
              //駒があったらfalse
              if(komas[k].x+dir*u[0] == x && komas[k].y+dir*u[1] == y){
                //どっかしら動けるところがある
                console.log("他の駒が取れます");
                return false;
              }
            }
          }
        }

      }
      console.log("他の駒が取れません");
      var ugoki = this.ugoki['ou'];
      for(let u of ugoki) {
        //駒があったらfalse
        //occupiedはその場所に何も駒がなかったらtrue
        if(this.isInside(x+dir*u[0],y+dir*u[1]) &&this.occupied(x+dir*u[0],y+dir*u[1],teban,komas)){
          console.log("王様はどこかしらに動けます");
          //どっかしら動けるところがある
          //動いた先で相手の駒に取られないか？？
          //動いた先のx,y
          let ux = x+dir*u[0];
          let uy =  y+dir*u[1];

          for(let k in komas){
            //相手の手番の駒があった時
            if (komas[k].teban =teban ) {

              var ugoki = this.ugoki[komas[k].na];
              for(let u of ugoki) {
                //駒があったらfalse
                if(komas[k].x+dir*u[0] == ux && komas[k].y+dir*u[1] == uy){
                  //どっかしら動けるところがある
                  return true;
                }
              }
            }
          }
          console.log("王様は動けます");
          return false;
        }
      }
      //他の周りの駒で、その歩をとることができる駒がいないか
    }
    console.log("そもそも目の前は王様じゃない");
    return false;
  },

  move: function(idx,i,j){
    //ここで上段でかつ歩だったら成る
    //上段かの判定　line2 = koma.teban*(-2) + 3;
    //このline2が　yの値になる
    //->line2 ==
    //上段の時　かつふだった
    //銀の時は、その駒が手持ちだったかも把握しなくちゃダメ
    let nari = this.games[0].koma[idx].nari;
    if(i+1 == this.games[0].koma[idx].teban*(-2) + 3　&& this.games[0].koma[idx].na == "fu" ||   i+1 == this.games[0].koma[idx].teban*(-2) + 3　&& this.games[0].koma[idx].na == "gin"){
      //成をtrueにする
      nari = true;
    }
    let ref = db.collection("games").doc("game");
    let tmpkomaarr = [];
    for (let k in this.games[0].koma){
      //今動かそうとしている駒以外
      if (k!=idx){
        tmpkomaarr.push(this.games[0].koma[k]);
      }
      else{
        let tmp = {na:this.games[0].koma[idx].na, teban: this.games[0].koma[idx].teban, nari: nari, x:j+1,y:i+1};
        tmpkomaarr.push(tmp);
      }
    }
    //相手の駒がそこにあるかを確認する
    //あった場合それが玉であれば勝敗が決定し、
    let k  = this.find(i+1,j+1,this.games[0].koma);
    console.log(tmpkomaarr[k]);
    console.log(k);
    //持ち駒になる場合
    let newTemochi = this.games[0].temochi;
    if(k){
      let x =0;
      console.log(newTemochi);
      if(this.games[0].koma[k].teban==1){
        //上
        x = this.games[0].temochi[1];
        newTemochi[1]++;
      }
      else {
        x = 4-(this.games[0].temochi[0]);
        newTemochi[0]++;
      }
      console.log(tmpkomaarr[k]);
      //ここに新しいプログラムを入れる

      // let x = 5;
      // if(this.games[0].koma[k].teban==1){
      //           //上
      //           // x = this.games[0].temochi[1];
      //           // this.games[0].temochi[1]++;
      //           for(var i=0;i<=x+1;i++){
      //             if(this.occupied(i,0,0,komas)){
      //
      //
      //               //
      //
      //               tmpkomaarr[k] = {na:tmpkomaarr[k].na,
      //                teban:(1-tmpkomaarr[k].teban),
      //                nari:false,
      //                x:i,
      //                y:0};
      //                 return;
      //             }
      //           }
      //         }
      //         else {
      //           for(var i=4;i>0;i--){
      //             if(this.occupied(i,4,1,komas)){
      //               tmpkomaarr[k] = {na:tmpkomaarr[k].na,
      //                teban:(1-tmpkomaarr[k].teban),
      //                nari:false,
      //                x:i,
      //                y:4};
      //                 return;
      //             }
      //           }
      //         }
      //ここまで



      //これはこれで一応動いているのだ
      //
      tmpkomaarr[k] = {na:tmpkomaarr[k].na,
        teban:(1-tmpkomaarr[k].teban),
        nari:false,
        x:x,
        y:tmpkomaarr[k].teban==1?0:4};
        if(tmpkomaarr[k].na=="ou"){
          //とった駒が王様か判定
          //location.replace('Result.html');
        }
      }
      ref.update({
        koma: tmpkomaarr,
        temochi:newTemochi,
      });

    }
  }
}

</script>
