// ==========================================
// 基本データ
// ==========================================

let playerNames = [];

let allRoundsScores = [];

let currentGameResult = null;

// 点数確認画面で一時的に保持する点数
let pendingRawPoints = null;

const base = 25000;

const STORAGE_KEY = "mahjongGameHistory";

const PLAYER_STORAGE_KEY = "mahjongPlayers";


// ==========================================
// 画面切り替え
// ==========================================

function hideAllScreens() {

  document.getElementById("main-menu-screen").style.display = "none";

  document.getElementById("player-management-screen").style.display = "none";

  document.getElementById("name-input-screen").style.display = "none";

  document.getElementById("score-input-screen").style.display = "none";

  document.getElementById("score-check-screen").style.display = "none";

  document.getElementById("intermediate-progress-screen").style.display = "none";

  document.getElementById("game-result-screen").style.display = "none";

  document.getElementById("statistics-screen").style.display = "none";

  document.getElementById("history-screen").style.display = "none";
}


// ==========================================
// メインメニュー
// ==========================================

function showMainMenu() {

  hideAllScreens();

  document.getElementById("main-menu-screen").style.display = "block";
}


// ==========================================
// プレイヤー管理
// ==========================================

function showPlayerManagement() {

  hideAllScreens();

  document.getElementById(
    "player-management-screen"
  ).style.display = "block";

  displayPlayerList();
}


// ==========================================
// プレイヤー一覧表示
// ==========================================

function displayPlayerList() {

  const players = loadPlayers();

  const list =
    document.getElementById("player-list");


  if (players.length === 0) {

    list.innerHTML =
      "<p>登録されているプレイヤーはいません。</p>";

    return;
  }


  let html = "";


  players.forEach((name, index) => {

    html +=
      `<div class="player-item">

        <span class="player-name">
          ${escapeHtml(name)}
        </span>

        <button
          class="delete-player-button"
          onclick="deletePlayer(${index})">

          削除

        </button>

      </div>`;

  });


  list.innerHTML = html;
}


// ==========================================
// プレイヤー追加
// ==========================================

function addPlayer() {

  const input =
    document.getElementById("new-player-name");

  const name =
    input.value.trim();


  if (name === "") {

    alert("プレイヤー名を入力してください。");

    return;
  }


  const players =
    loadPlayers();


  // 同名チェック

  if (players.includes(name)) {

    alert("そのプレイヤーはすでに登録されています。");

    return;
  }


  players.push(name);


  savePlayers(players);


  input.value = "";


  displayPlayerList();
}


// ==========================================
// プレイヤー削除
// ==========================================

function deletePlayer(index) {

  const players =
    loadPlayers();


  const name =
    players[index];


  const answer =
    confirm(
      `「${name}」をプレイヤー一覧から削除しますか？`
    );


  if (!answer) {

    return;
  }


  players.splice(index, 1);


  savePlayers(players);


  displayPlayerList();
}


// ==========================================
// プレイヤーデータ読み込み
// ==========================================

function loadPlayers() {

  const data =
    localStorage.getItem(
      PLAYER_STORAGE_KEY
    );


  if (data === null) {

    return [];
  }


  try {

    return JSON.parse(data);

  } catch (error) {

    console.error(
      "プレイヤーデータの読み込みに失敗しました。",
      error
    );

    return [];
  }
}


// ==========================================
// プレイヤーデータ保存
// ==========================================

function savePlayers(players) {

  localStorage.setItem(
    PLAYER_STORAGE_KEY,
    JSON.stringify(players)
  );
}


// ==========================================
// 対局開始画面
// ==========================================

function showGameStart() {

  const players =
    loadPlayers();


  if (players.length < 4) {

    alert(
      "対局を開始するには、4人以上のプレイヤーを登録してください。\n\n「プレイヤー管理」から登録できます。"
    );

    showPlayerManagement();

    return;
  }


  hideAllScreens();


  document.getElementById(
    "name-input-screen"
  ).style.display = "block";


  createPlayerSelects();
}


// ==========================================
// プレイヤー選択欄を作成
// ==========================================

function createPlayerSelects() {

  const players =
    loadPlayers();


  for (let i = 1; i <= 4; i++) {

    const select =
      document.getElementById(
        `player-select-${i}`
      );


    select.innerHTML = "";


    players.forEach(name => {

      const option =
        document.createElement("option");

      option.value = name;

      option.textContent = name;

      select.appendChild(option);

    });

  }


  // 初期状態で4人を別々に選択

  for (let i = 1; i <= 4; i++) {

    document.getElementById(
      `player-select-${i}`
    ).selectedIndex = i - 1;

  }
}


// ==========================================
// 対局開始
// ==========================================

function startGame() {

  playerNames = [

    document.getElementById(
      "player-select-1"
    ).value,

    document.getElementById(
      "player-select-2"
    ).value,

    document.getElementById(
      "player-select-3"
    ).value,

    document.getElementById(
      "player-select-4"
    ).value

  ];


  // ========================================
  // 重複チェック
  // ========================================

  const uniqueNames =
    new Set(playerNames);


  if (uniqueNames.size !== 4) {

    alert(
      "同じプレイヤーを複数の席に設定することはできません。"
    );

    return;
  }


  // 今回の対局データを初期化

  allRoundsScores = [];

  currentGameResult = null;

  pendingRawPoints = null;


  // ラベル変更

  document.getElementById("p1-label").innerText =
    `${playerNames[0]} 持ち点`;

  document.getElementById("p2-label").innerText =
    `${playerNames[1]} 持ち点`;

  document.getElementById("p3-label").innerText =
    `${playerNames[2]} 持ち点`;

  document.getElementById("p4-label").innerText =
    `${playerNames[3]} 持ち点`;


  // 入力欄クリア

  document.getElementById("p1").value = "";

  document.getElementById("p2").value = "";

  document.getElementById("p3").value = "";

  document.getElementById("p4").value = "";

  document.getElementById("result").innerHTML = "";


  hideAllScreens();

  document.getElementById(
    "score-input-screen"
  ).style.display = "block";
}


// ==========================================
// 局の結果を保存
// ==========================================

function nextRound() {

  const rawPoints = [

    Number(
      document.getElementById("p1").value
    ),

    Number(
      document.getElementById("p2").value
    ),

    Number(
      document.getElementById("p3").value
    ),

    Number(
      document.getElementById("p4").value
    )

  ];


  // ========================================
  // 入力チェック
  // ========================================

  if (

    document.getElementById("p1").value === "" ||

    document.getElementById("p2").value === "" ||

    document.getElementById("p3").value === "" ||

    document.getElementById("p4").value === ""

  ) {

    document.getElementById("result").innerHTML =
      "<h3>全プレイヤーの点数を入力してください。</h3>";

    return;
  }


  // ========================================
  // 点数合計の確認
  // ========================================

  const totalPoints =
    rawPoints.reduce(
      (sum, score) => sum + score,
      0
    );


  if (totalPoints !== 100000) {

    // 点数を一時保存
    pendingRawPoints = rawPoints;


    document.getElementById(
      "score-check-message"
    ).innerHTML =

      `<h3>点数の合計が100000点ではありません。</h3>

       <p>
         現在の合計：
         <strong>${totalPoints}点</strong>
       </p>

       <p>
         入力内容を確認してください。
       </p>`;


    hideAllScreens();


    document.getElementById(
      "score-check-screen"
    ).style.display = "block";


    return;
  }


  // 合計が100000点の場合はそのまま保存

  saveRound(rawPoints);
}


// ==========================================
// 合計が正しい場合・続行する場合の
// 共通保存処理
// ==========================================

function saveRound(rawPoints) {

  // ========================================
  // 順位ボーナス
  // ========================================

  const rankBonuses = [
    20000,
    10000,
    -10000,
    -20000
  ];


  const players =
    rawPoints.map(
      (score, index) => ({

        score: score,

        originalIndex: index

      })
    );


  players.sort(
    (a, b) => b.score - a.score
  );


  const finalBonuses =
    new Array(4);

  const ranks =
    new Array(4);


  let rank = 0;


  for (
    let i = 0;
    i < players.length;
    i++
  ) {

    if (
      i > 0 &&
      players[i].score <
      players[i - 1].score
    ) {

      rank = i;

    }


    finalBonuses[
      players[i].originalIndex
    ] = rankBonuses[rank];


    ranks[
      players[i].originalIndex
    ] = rank + 1;

  }


  // ========================================
  // 最終点数
  // ========================================

  const roundPoints =
    rawPoints.map(
      (score, index) =>
        score +
        finalBonuses[index]
    );


  // ========================================
  // 各局データ保存
  // ========================================

  allRoundsScores.push({

    raw: rawPoints,

    final: roundPoints,

    ranks: ranks,

    bonuses: finalBonuses

  });


  // ========================================
  // 入力欄クリア
  // ========================================

  document.getElementById("p1").value = "";

  document.getElementById("p2").value = "";

  document.getElementById("p3").value = "";

  document.getElementById("p4").value = "";


  // 一時データを削除

  pendingRawPoints = null;


  document.getElementById("result").innerHTML =
    `<h3>${allRoundsScores.length}局目の結果を保存しました。</h3>`;


  hideAllScreens();


  document.getElementById(
    "score-input-screen"
  ).style.display = "block";
}


// ==========================================
// 点数を入力し直す
// ==========================================

function backToScoreInputForCorrection() {

  hideAllScreens();


  document.getElementById(
    "score-input-screen"
  ).style.display = "block";
}


// ==========================================
// 合計が100000点でなくても続行
// ==========================================

function continueWithInvalidTotal() {

  if (pendingRawPoints === null) {

    alert(
      "保存する点数データがありません。"
    );

    backToScoreInputForCorrection();

    return;
  }


  saveRound(
    pendingRawPoints
  );
}


// ==========================================
// 途中経過
// ==========================================

function showIntermediateProgress() {

  if (allRoundsScores.length === 0) {

    document.getElementById("result").innerHTML =
      "<h3>表示する途中経過データがありません。</h3>";

    return;
  }


  hideAllScreens();


  document.getElementById(
    "intermediate-progress-screen"
  ).style.display = "block";


  let tableHtml =
    `<table class="intermediate-table">

      <tr>

        <th>局</th>

        ${playerNames
          .map(
            name =>
              `<th>${escapeHtml(name)}</th>`
          )
          .join("")}

      </tr>`;


  allRoundsScores.forEach(
    (round, roundIndex) => {

      tableHtml +=
        `<tr>

          <td>${roundIndex + 1}局</td>`;


      // 点数＋順位を表示
      // 例：27000(1)

      round.raw.forEach(
        (score, playerIndex) => {

          tableHtml +=
            `<td>
              ${score}(${round.ranks[playerIndex]})
            </td>`;

        }
      );


      tableHtml += `</tr>`;

    }
  );


  tableHtml += `</table>`;


  document.getElementById(
    "intermediate-table"
  ).innerHTML = tableHtml;
}


// ==========================================
// 点数入力画面へ戻る
// ==========================================

function backToScoreInput() {

  hideAllScreens();

  document.getElementById(
    "score-input-screen"
  ).style.display = "block";
}


// ==========================================
// 対局結果を集計
// ==========================================

function tallyResults() {

  if (allRoundsScores.length === 0) {

    document.getElementById("result").innerHTML =
      "<h3>集計する対局データがありません。</h3>";

    return;
  }


  // ========================================
  // 合計点
  // ========================================

  const finalScores = [
    0,
    0,
    0,
    0
  ];


  allRoundsScores.forEach(
    round => {

      round.final.forEach(
        (score, index) => {

          finalScores[index] += score;

        }
      );

    }
  );


  // ========================================
  // 最終順位
  // ========================================

  const players =
    finalScores.map(
      (score, index) => ({

        score: score,

        originalIndex: index

      })
    );


  players.sort(
    (a, b) => b.score - a.score
  );


  const finalRanks =
    new Array(4);


  let rank = 0;


  for (
    let i = 0;
    i < players.length;
    i++
  ) {

    if (
      i > 0 &&
      players[i].score <
      players[i - 1].score
    ) {

      rank = i;

    }


    finalRanks[
      players[i].originalIndex
    ] = rank + 1;

  }


  // ========================================
  // 収支
  // ========================================

  const totalBase =
    base * allRoundsScores.length;


  const settlements =
    finalScores.map(
      score =>
        (score - totalBase) / 10
    );


  // ========================================
  // 対局結果
  // ========================================

  currentGameResult = {

    date:
      new Date().toISOString(),

    rounds:
      allRoundsScores.length,

    players:
      playerNames.map(
        (name, index) => ({

          name: name,

          score:
            finalScores[index],

          rank:
            finalRanks[index],

          settlement:
            settlements[index]

        })
      ),

    roundDetails:
      allRoundsScores.map(
        (round, index) => ({

          round:
            index + 1,

          players:
            playerNames.map(
              (name, playerIndex) => ({

                name: name,

                rawScore:
                  round.raw[playerIndex],

                finalScore:
                  round.final[playerIndex],

                rank:
                  round.ranks[playerIndex],

                bonus:
                  round.bonuses[playerIndex]

              })
            )

        })
      )

  };


  // ========================================
  // 結果表示
  // ========================================

  let html =
    `<h3>
      ${allRoundsScores.length}局の最終結果
    </h3>`;


  html +=
    `<table class="game-result-table">

      <tr>

        <th>順位</th>

        <th>名前</th>

        <th>合計点</th>

        <th>収支</th>

      </tr>`;


  const sortedPlayers =
    [...currentGameResult.players]
      .sort(
        (a, b) => a.rank - b.rank
      );


  sortedPlayers.forEach(
    player => {

      const sign =
        player.settlement > 0
          ? "+"
          : "";


      html +=
        `<tr>

          <td>
            ${player.rank}位
          </td>

          <td>
            ${escapeHtml(player.name)}
          </td>

          <td>
            ${player.score}
          </td>

          <td>
            ${sign}${player.settlement}円
          </td>

        </tr>`;

    }
  );


  html += `</table>`;


  document.getElementById(
    "game-result"
  ).innerHTML = html;


  hideAllScreens();


  document.getElementById(
    "game-result-screen"
  ).style.display = "block";
}


// ==========================================
// 対局結果を保存
// ==========================================

function saveGameResult() {

  if (currentGameResult === null) {

    alert(
      "保存する対局結果がありません。"
    );

    return;
  }


  const history =
    loadGameHistory();


  history.push(
    currentGameResult
  );


  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(history)
  );


  alert(
    "対局結果を成績に保存しました。"
  );


  showMainMenu();
}


// ==========================================
// 保存データ読み込み
// ==========================================

function loadGameHistory() {

  const data =
    localStorage.getItem(
      STORAGE_KEY
    );


  if (data === null) {

    return [];
  }


  try {

    return JSON.parse(data);

  } catch (error) {

    console.error(
      "成績データの読み込みに失敗しました。",
      error
    );

    return [];
  }
}


// ==========================================
// 成績表示
// ==========================================

function showStatistics() {

  const history =
    loadGameHistory();


  hideAllScreens();


  document.getElementById(
    "statistics-screen"
  ).style.display = "block";


  if (history.length === 0) {

    document.getElementById(
      "statistics-table"
    ).innerHTML =
      "<h3>まだ保存された対局データがありません。</h3>";

    return;
  }


  const stats = {};


  history.forEach(
    game => {

      game.players.forEach(
        player => {

          if (!stats[player.name]) {

            stats[player.name] = {

              games: 0,

              rank1: 0,

              rank2: 0,

              rank3: 0,

              rank4: 0,

              rankTotal: 0,

              settlementTotal: 0

            };

          }


          const s =
            stats[player.name];


          s.games++;

          s.rankTotal +=
            player.rank;

          s.settlementTotal +=
            player.settlement;


          if (player.rank === 1) {
            s.rank1++;
          }

          if (player.rank === 2) {
            s.rank2++;
          }

          if (player.rank === 3) {
            s.rank3++;
          }

          if (player.rank === 4) {
            s.rank4++;
          }

        }
      );

    }
  );


  let html =
    `<p>
      保存されている対局数：
      ${history.length}局
    </p>`;


  html +=
    `<div style="overflow-x:auto;">

      <table class="statistics-table">

        <tr>

          <th>名前</th>

          <th>対局</th>

          <th>平均順位</th>

          <th>1位率</th>

          <th>連対率</th>

          <th>ラス率</th>

          <th>平均収支</th>

          <th>通算収支</th>

        </tr>`;


  Object.keys(stats).forEach(
    name => {

      const s =
        stats[name];


      const averageRank =
        s.rankTotal /
        s.games;


      const firstRate =
        s.rank1 /
        s.games *
        100;


      const rentaiRate =
        (s.rank1 + s.rank2) /
        s.games *
        100;


      const lastRate =
        s.rank4 /
        s.games *
        100;


      const averageSettlement =
        s.settlementTotal /
        s.games;


      html +=
        `<tr>

          <td>
            ${escapeHtml(name)}
          </td>

          <td>
            ${s.games}
          </td>

          <td>
            ${averageRank.toFixed(2)}
          </td>

          <td>
            ${firstRate.toFixed(1)}%
          </td>

          <td>
            ${rentaiRate.toFixed(1)}%
          </td>

          <td>
            ${lastRate.toFixed(1)}%
          </td>

          <td>
            ${averageSettlement >= 0 ? "+" : ""}
            ${averageSettlement.toFixed(0)}円
          </td>

          <td>
            ${s.settlementTotal >= 0 ? "+" : ""}
            ${s.settlementTotal.toFixed(0)}円
          </td>

        </tr>`;

    }
  );


  html +=
    `</table>
     </div>`;


  document.getElementById(
    "statistics-table"
  ).innerHTML = html;
}


// ==========================================
// 対局履歴
// ==========================================

function showGameHistory() {

  const history =
    loadGameHistory();


  hideAllScreens();


  document.getElementById(
    "history-screen"
  ).style.display = "block";


  if (history.length === 0) {

    document.getElementById(
      "history-list"
    ).innerHTML =
      "<h3>まだ保存された対局履歴がありません。</h3>";

    return;
  }


  let html = "";


  const reversedHistory =
    [...history].reverse();


  reversedHistory.forEach(
    game => {

      const date =
        new Date(game.date);


      const dateText =
        date.toLocaleString(
          "ja-JP",
          {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
          }
        );


      html +=
        `<div class="history-item">

          <div class="history-date">
            ${dateText}
          </div>

          <div class="history-rounds">
            ${game.rounds}局
          </div>`;


      html +=
        `<table class="history-table">

          <tr>

            <th>順位</th>

            <th>名前</th>

            <th>合計点</th>

            <th>収支</th>

          </tr>`;


      const sortedPlayers =
        [...game.players]
          .sort(
            (a, b) =>
              a.rank - b.rank
          );


      sortedPlayers.forEach(
        player => {

          const sign =
            player.settlement > 0
              ? "+"
              : "";


          html +=
            `<tr>

              <td>
                ${player.rank}位
              </td>

              <td>
                ${escapeHtml(player.name)}
              </td>

              <td>
                ${player.score}
              </td>

              <td>
                ${sign}${player.settlement}円
              </td>

            </tr>`;

        }
      );


      html +=
        `</table>`;


      // ====================================
      // 各局詳細
      // ====================================

      if (
        game.roundDetails &&
        game.roundDetails.length > 0
      ) {

        html +=
          `<div class="round-details">

            <h4>各局の詳細</h4>`;


        game.roundDetails.forEach(
          round => {

            html +=
              `<div class="round-title">
                ${round.round}局目
              </div>`;


            html +=
              `<table class="round-table">

                <tr>

                  <th>順位</th>

                  <th>名前</th>

                  <th>持ち点</th>

                  <th>順位点</th>

                  <th>最終点</th>

                </tr>`;


            const sortedRoundPlayers =
              [...round.players]
                .sort(
                  (a, b) =>
                    a.rank - b.rank
                );


            sortedRoundPlayers.forEach(
              player => {

                const bonusSign =
                  player.bonus > 0
                    ? "+"
                    : "";


                html +=
                  `<tr>

                    <td>
                      ${player.rank}位
                    </td>

                    <td>
                      ${escapeHtml(player.name)}
                    </td>

                    <td>
                      ${player.rawScore}
                    </td>

                    <td>
                      ${bonusSign}${player.bonus}
                    </td>

                    <td>
                      ${player.finalScore}
                    </td>

                  </tr>`;

              }
            );


            html +=
              `</table>`;

          }
        );


        html +=
          `</div>`;
      }


      html +=
        `</div>`;

    }
  );


  document.getElementById(
    "history-list"
  ).innerHTML = html;
}


// ==========================================
// 成績データ削除
// ==========================================

function clearGameHistory() {

  const answer =
    confirm(
      "保存されている成績データをすべて削除します。\n\n本当に削除しますか？"
    );


  if (!answer) {

    return;
  }


  localStorage.removeItem(
    STORAGE_KEY
  );


  alert(
    "成績データを削除しました。"
  );


  showGameHistory();
}


// ==========================================
// HTMLエスケープ
// ==========================================

function escapeHtml(text) {

  const div =
    document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}