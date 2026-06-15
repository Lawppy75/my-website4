//画像のリスト
let hammer = document.getElementsByClassName("hammer")

//いたちの位置データ[0]～[8]
let itachix  = [169, 282, 392, 129, 269, 406,  82, 256, 428]
let itachiy  = [106, 106, 106, 138, 138, 138, 205, 205, 205]
let itachisx = [ 75,  75,  75, 101, 101, 101, 125, 125, 125]
let itachisy = [ 83,  83,  83, 109, 109, 109, 139, 139, 139]

//効果音のリスト
let oto = []

//固定データ（変わらないデータ）
let window1 = { sx:640, sy:480 } //ウィンドウの横の長さと縦の長さ
let timerno //タイマー制御用
let timerv = 30 //ゲームの実行タイマー値(小さいと速い)
let canvas //キャンバス
let hammax = 393 //ハンマーの表示最大サイズ
let hammin = 166 //ハンマーの表示最小サイズ
let itachiwaiti = 50 //いたちの出現待ちカウンタの値(小さくするとすぐ出現)
let itachicounti = 75 //いたちの出現カウンタの値(小さくするとすぐ逃げる)
let gametimeri = 100 // ゲームタイマー開始値

//作業データ（ゲームの状態によって値が変わります）
let timer = timerv //ゲームの実行タイマー
let mode = 0 //ゲームの状態（0:タイトル画面,5:通常プレイ,6:ゴールドいたち,7:３連いたち,9:タイムオーバー）
let mouse //マウスの座標
let score = 0 //スコア
let hiscore = [0, 0, 0] //ハイスコア(3位まで)
let hammers = 0 //ハンマーの状態(0:アップ,1:ダウン)
let hamsize = 0 //ハンマーの大きさ
let hammerx = 0 //ハンマーのX座標
let hammery = 0 //ハンマーのY座標
let itachis = [0, 0, 0, 0, 0, 0, 0, 0, 0] //いたちの状態(0:いない,1:出現,4:当たり)
let itachiwait = 20 //いたちの出現待ちカウンタ
let itachicount = 0 //いたちの出現カウンタ
let itachino = -1 //出現中のいたちの番号(-1:いない,0～8:いたちの番号)
let gametimer = gametimeri // ゲームタイマー
let bonustime = gametimeri / 2 //ボーナスタイム(ゲームタイマー開始値の半分)
let sanren = 0 //３連いたちの列(0～2)

//最初に１回だけやること（起動処理）
function init() {
    canvas = document.getElementById('canvas') //キャンバスを得る
    ctx = canvas.getContext('2d') //キャンバスの情報（コンテキスト）を得る
    canvas.addEventListener('click', onclick_canvas, false) //クリックされた時の処理を指定
    canvas.addEventListener('mousedown', ondown_canvas, false) //マウスボタンが押されている時の処理を指定
    canvas.addEventListener('mouseup', onup_canvas, false) //マウスボタンが押され終わった時の処理を指定
    canvas.addEventListener('mousemove', onmove_canvas, false) //マウスが動いた時の処理を指定
    start() //開始処理を呼ぶ
}

//マウスの座標を得る
function mousezahyo(canvas, event) {
    let rect = canvas.getBoundingClientRect() //キャンバスの位置を得る
    return { //座標を計算して返す
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    }
}

//マウスがスタートボタンの上にあるかを返す（ある場合はハンマーの座標と大きさを決める）
function onstart(mousex, mousey) {
    if (mousex > 240 && mousey > 390 && mousex < 396 && mousey < 437) {
        hamsize = hammax //ハンマーの大きさを最大にする
        hammerx = mousex - hamsize / 2 //ハンマーのX座標はマウスのX座標－ハンマーの大きさ÷２
        hammery = mousey - hamsize / 2 //ハンマーのY座標はマウスのY座標－ハンマーの大きさ÷２
        return true
    } else {
        return false
    }
}

//マウスがリスタートボタンの上にあるかを返す（ある場合はハンマーの座標と大きさを決める）
function onrestart(mousex, mousey) {
    if (mousex > 450 && mousey > 390 && mousex < 606 && mousey < 437) {
        hamsize = hammax //ハンマーの大きさを最大にする
        hammerx = mousex - hamsize / 2 //ハンマーのX座標はマウスのX座標－ハンマーの大きさ÷２
        hammery = mousey - hamsize / 2 //ハンマーのY座標はマウスのY座標－ハンマーの大きさ÷２
        return true
    } else {
        return false
    }
}

//ハンマーの大きさを決める
function hammersize(mousey) {
    let hamhiritsu = mousey / (window1.sy * 2 / 3) //マウスのY座標とウインドウの高さの2/3の比率を求める
    let size = Math.floor(hammax * hamhiritsu) //ハンマーの大きさをこの比率に合わせる
    if (size > hammax) { //最大サイズを超えないようにする
        size = hammax
    } else if (size < hammin) { //最小サイズ未満にならないようにする
        size = hammin
    }
    return size //ハンマーの大きさを返す
}

//出現するいたちを決める
function getitachino() {
    return Math.floor(Math.random() * 9) //0～8の乱数で出現するいたちを決めて返す
}

//いたち出現待ちカウントをセット
function getitachiwait() {
    return Math.floor(itachiwaiti * (Math.random() + 0.5)) //いたち出現待ちカウントを返す
}

//いたち[no]とハンマーの当たり判定をする
function hammeritachi(no) {
    let hamhitx0 = hammerx + hamsize * 0.05 //ハンマーの当たりはんい(X: 5%～)の左上X座標
    let hamhity0 = hammery + hamsize * 0.65 //ハンマーの当たりはんい(Y:65%～)の左上Y座標
    let hamhitx1 = hammerx + hamsize * 0.30 //ハンマーの当たりはんい(X:～30%)の右下X座標
    let hamhity1 = hammery + hamsize * 0.75 //ハンマーの当たりはんい(Y:～75%)の右下Y座標
    let itachixm = itachix[no] + itachisx[no] / 2 //いたちの頭中央のX座標
    let itachiym = itachiy[no] //いたちの頭中央のY座標
    return hamhitx0 < itachixm && hamhitx1 > itachixm && hamhity0 < itachiym && hamhity1 > itachiym //範囲内かを返す
}

//ゴールド｜3連いたち出現効果音を流す
function sounditachi(no) {
    if (oto.length > 0) { //効果音読み込み済み？
        oto[no].currentTime = 0 //効果音の準備
        oto[no].play() //効果音を流す
    }
}

//いたちをえがく
function drawitachi(no) {
    ctx.drawImage(itachi, itachix[no], itachiy[no], itachisx[no], itachisy[no]) //いたち画像[no]を表示
}

//ゴールドいたちをえがく
function drawitachig(no) {
    ctx.drawImage(itachig, itachix[no], itachiy[no], itachisx[no], itachisy[no]) //いたち画像[no]を表示
}

//当たり画像をえがく
function drawatari(no) {
    ctx.drawImage(atari, itachix[no], itachiy[no], itachisx[no], itachisx[no]) //あたり画像を表示
}

//ゲームタイマーをえがく
function drawtimer(mytimer) {
    ctx.font = '36pt Arial' //文字サイズを指定
       ctx.fillStyle = 'white' //白色に設定
    let inttimer = Math.ceil(mytimer)
    ctx.fillText("TIME:" + ("000" + inttimer).slice(-3), 168, 65) //ゲームタイマーを3桁で表示
}

//ハイスコアの更新
function hiscoreupdate(myscore) {
    if (hiscore[2] < myscore) { //ランクイン（現在の最下位より大）？
        hiscore[2] = myscore //仮に最下位とする
        for (let i = 2; i > 0; i--) { //1位までについてくり返す
            if (hiscore[i - 1] < hiscore[i]) { //逆順になっていたら
                let temp = hiscore[i - 1]
                hiscore[i - 1] = hiscore[i] //交換する
                hiscore[i] = temp
            } else { //でなければ
                break //更新完了
            }
        }
    }
}

//ハイスコアをえがく
function drawhiscore(no) {
    ctx.fillText(no + ": " + ("0000" + hiscore[no - 1]).slice(-4), 198, 358 + 34 * no) //中下にハイスコア[no]を表示
}

//いたちの位置とモードによって点数を求める
function getpoint(no, mymode = 5) {
    if (no <= 2) { //１行目のいたちならば
        return 3 * (mymode - 4) //3×(モード-4)点を返す
    } else if (no <= 5) { //２行目のいたちならば
        return 2 * (mymode - 4) //2×(モード-4)点を返す
    } else { //３行目のいたちならば
        return 1 * (mymode - 4) //1×(モード-4)点を返す
    }
}
