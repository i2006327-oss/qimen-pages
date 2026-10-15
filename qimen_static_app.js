const staticGridPositions = {
  4: [1, 1], 9: [1, 2], 2: [1, 3],
  3: [2, 1], 5: [2, 2], 7: [2, 3],
  8: [3, 1], 1: [3, 2], 6: [3, 3],
};

const qs = (id) => document.getElementById(id);

function staticPad2(value) {
  return String(value).padStart(2, "0");
}

function setStaticNow() {
  const now = new Date();
  qs("year").value = now.getFullYear();
  qs("month").value = staticPad2(now.getMonth() + 1);
  qs("day").value = staticPad2(now.getDate());
  qs("hour").value = staticPad2(now.getHours());
  qs("minute").value = staticPad2(now.getMinutes());
  qs("numberYear").value = now.getFullYear();
}

function flagText(flags) {
  if (!flags || !flags.length) return "";
  const symbols = flags.map((flag) => ({
    "空亡": "◎",
    "入墓": "墓",
    "擊刑": "刑",
    "門迫": "迫",
  }[flag] || "")).filter(Boolean);
  return symbols.length ? symbols.join("") : "";
}

const shortGods = { 值符: "符", 螣蛇: "蛇", 太陰: "陰", 六合: "六", 白虎: "白", 玄武: "玄", 九地: "地", 九天: "天" };
const shortStars = { 天蓬星: "蓬", 天芮星: "芮", 天沖星: "沖", 天輔星: "輔", 天禽星: "禽", 天心星: "心", 天柱星: "柱", 天任星: "任", 天英星: "英" };
const shortDoors = { 休門: "休", 生門: "生", 傷門: "傷", 杜門: "杜", 景門: "景", 死門: "死", 驚門: "驚", 開門: "開" };

function palaceClass(p) {
  const classes = ["palace"];
  if (p.marker.first) classes.push("marker-first");
  if (p.marker.second) classes.push("marker-second");
  return classes.join(" ");
}

function stemItemsHtml(items, fallback, fallbackClass) {
  if (items && items.length) {
    return items.map((item) => `<span class="${item.className || ""}">${item.stem || ""}</span>`).join("");
  }
  return `<span class="${fallbackClass || ""}">${fallback || ""}</span>`;
}

function renderStaticPalace(p) {
  const div = document.createElement("div");
  const [row, col] = staticGridPositions[p.number];
  const special = (p.specialFlags || []).map((flag) => `<span class="special-flag">${flag}</span>`).join("");
  const emptyMarker = (p.starFlags || []).length ? `<div class="empty-marker">&#9678;</div>` : "";
  div.className = palaceClass(p);
  div.style.gridRow = String(row + 1);
  div.style.gridColumn = String(col + 1);
  div.title = `${p.name}｜${p.direction}｜${p.god || ""}｜${p.star || ""}｜${p.door || ""}`;
  div.innerHTML = `
    <div class="god">${shortGods[p.god] || p.god || ""}</div>
    <div class="palace-show">顯示</div>
    <div class="stem-line heaven-stem">${stemItemsHtml(p.heavenStemItems, p.heavenStem, p.heavenClass)}</div>
    <div class="stem-line earth-stem">${stemItemsHtml(p.earthStemItems, p.earthStem, p.earthClass)}</div>
    <div class="star ${p.starClass || ""}">${shortStars[p.star] || p.star || ""}</div>
    <div class="door ${p.doorClass || ""}">${shortDoors[p.door] || p.door || ""}</div>
    ${emptyMarker}
    <div class="palace-specials">${special}</div>
  `;
  return div;
}

function renderStaticChart(data) {
  qs("headerText").textContent = data.header;
  qs("summaryText").textContent = data.summary;
  qs("explainText").textContent = data.explanation;
  qs("issueText").textContent = data.issueTable;
  qs("textChart").textContent = data.textChart;
  const grid = qs("qimenGrid");
  const frame = grid.parentElement;
  grid.innerHTML = "";
  grid.className = "qimen-grid";
  frame.className = `chart-scroll ${data.resonanceClass || ""}`.trim();
  for (const item of data.outerBranches) {
    const label = document.createElement("div");
    const side = item.col === 0 ? "left" : (item.col === 4 ? "right" : (item.row === 0 ? "top" : "bottom"));
    label.className = `outer-label outer-${side}${item.horse ? " horse" : ""}`;
    const stemHtml = [...(item.stem || "")].map((ch) => `<span>${ch}</span>`).join("");
    if (side === "left" || side === "right") {
      label.innerHTML = `
        <span class="outer-stage">${item.stage || ""}</span>
        <span class="outer-branch">${item.branch}</span>
        <span class="outer-stem">${stemHtml}</span>
      `;
    } else {
      label.innerHTML = `
        <span class="outer-stage">${item.stage || ""}</span>
        <span class="outer-branch">${item.branch}</span>
        <span class="outer-stem">${stemHtml}</span>
      `;
    }
    label.style.gridRow = String(item.row + 1);
    label.style.gridColumn = String(item.col + 1);
    grid.appendChild(label);
    if (item.horse) {
      const horse = document.createElement("div");
      horse.className = `horse-badge horse-${side}`;
      horse.textContent = "馬";
      horse.style.gridRow = String(item.row + 1);
      horse.style.gridColumn = String(item.col + 1);
      grid.appendChild(horse);
    }
  }
  for (const number of [4, 9, 2, 3, 5, 7, 8, 1, 6]) {
    grid.appendChild(renderStaticPalace(data.palaces[String(number)]));
  }
}

function runStaticChart() {
  try {
    const chartType = qs("chartType").value;
    const chart = QimenStatic.buildChart({
      year: qs("year").value,
      month: qs("month").value,
      day: qs("day").value,
      hour: qs("hour").value,
      minute: qs("minute").value,
      yuanMethod: qs("yuanMethod").value,
    });
    renderStaticChart(QimenStatic.toResponse(chart, {
      chartType,
      topic: qs("topic").value,
      presence: qs("presence").value,
      askerGender: qs("askerGender").value,
      divinerGender: qs("divinerGender").value,
    }));
    selectStaticTab("chart");
  } catch (error) {
    alert(error.message);
  }
}

function syncChartTypeControls() {
  const isLifetime = qs("chartType").value.includes("終身");
  qs("queryConditions").style.display = isLifetime ? "none" : "grid";
}

function renderNumberCard(chart) {
  const card = document.createElement("div");
  card.className = "number-card";
  card.innerHTML = `
    <strong>${chart.chart_type}｜${chart.palace_name}</strong>
    <div class="row"><span>引干</span><b>${chart.lead_stem}</b></div>
    <div class="row"><span>八神</span><b>${chart.god}</b></div>
    <div class="row"><span>九星</span><b>${chart.star}</b></div>
    <div class="row"><span>八門</span><b>${chart.door}</b></div>
    <div class="row"><span>天干</span><b>${chart.heaven_stem}</b></div>
    <div class="row"><span>地干</span><b>${chart.earth_stem}</b></div>
  `;
  return card;
}

function runStaticNumber() {
  try {
    const kind = qs("numberKind").value;
    const value = qs("numberInput").value;
    const gender = qs("numberGender").value;
    const year = qs("numberYear").value;
    let data;
    if (kind === "銀行帳戶") data = QimenNumber.analyzeBank(value, gender, year);
    else if (kind === "車牌") data = QimenNumber.analyzePlate(value, gender, year);
    else data = QimenNumber.analyzePhone(value, gender, year);
    const cards = qs("numberCards");
    cards.innerHTML = "";
    data.charts.forEach((chart) => cards.appendChild(renderNumberCard(chart)));
    qs("numberText").textContent = data.analysis;
    selectStaticTab("number");
  } catch (error) {
    alert(error.message);
  }
}

function selectStaticTab(id) {
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === id));
  document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === id));
}

function renderStaticCases() {
  const cases = window.QimenCases || [];
  const filter = qs("caseCategory");
  for (const category of new Set(cases.map((item) => item.category))) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    filter.appendChild(option);
  }
  function renderList() {
    const list = qs("caseList");
    list.replaceChildren();
    const visible = cases.filter((item) => !filter.value || item.category === filter.value);
    qs("caseCount").textContent = `${visible.length} 個案例`;
    for (const item of visible) {
      const card = document.createElement("details");
      card.className = "case-card";
      const summary = document.createElement("summary");
      const title = document.createElement("strong");
      title.textContent = item.title;
      const meta = document.createElement("span");
      meta.className = "case-meta";
      meta.textContent = `${item.datetime.replace("T", " ")}｜${item.category}｜${item.chartType}`;
      const conclusion = document.createElement("span");
      conclusion.textContent = item.summary;
      summary.append(title, meta, conclusion);
      card.appendChild(summary);
      function section(label, text) {
        const heading = document.createElement("h3");
        heading.textContent = label;
        const body = document.createElement("p");
        body.textContent = text;
        card.append(heading, body);
      }
      const material = item.material_chart;
      section("問題", item.question);
      section("教材盤面重點", `${material.dun}遁${material.ju}局｜四柱：${material.bazi.join("、")}｜旬空：${material.xun_empty}｜馬星：${material.horse_star}｜值符：${material.value_star}｜值使：${material.value_door}。${material.marks}`);
      const palaceText = Object.entries(material.palaces).map(([number, palace]) => `${number}宮：${palace.god}、${palace.star}、${palace.door}｜天${palace.heaven_stem}／地${palace.earth_stem}`).join("\n");
      section("教材各宮", palaceText);
      section("授課老師判斷", item.judgment);
      section("教材記載結果", item.result);
      section("判讀理由", item.reasoning);
      const supplement = document.createElement("aside");
      supplement.className = "case-supplement";
      supplement.setAttribute("aria-label", "補充解說，非教材原文");
      const supplementLabel = document.createElement("strong");
      supplementLabel.className = "case-supplement-label";
      supplementLabel.textContent = "補充｜非教材原文";
      const supplementText = document.createElement("p");
      supplementText.textContent = item.supplement;
      supplement.append(supplementLabel, supplementText);
      card.appendChild(supplement);
      section("引擎比對", `${item.engine_check.status}。${item.engine_check.differences.join("\n") || "所記錄的遁、局、四柱、旬空、馬星、值符值使及八宮門星神干一致。"}`);
      const sources = [];
      if (item.source_slides.length) sources.push(`上課投影片：${item.source_slides.join("、")}`);
      for (const source of item.source_documents || []) sources.push(`${source.filename} 第 ${source.pages.join("、")} 頁`);
      section("來源", `${sources.join("；")}。文字為摘要，未公開教材圖片。`);
      const load = document.createElement("button");
      load.type = "button";
      load.className = "primary";
      load.textContent = "載入此盤";
      load.addEventListener("click", () => {
        const values = item.datetime.split(/[-T:]/);
        ["year", "month", "day", "hour", "minute"].forEach((key, i) => { qs(key).value = values[i]; });
        qs("chartType").value = item.chartType;
        qs("yuanMethod").value = "yinpan";
        const topic = [...qs("topic").options].find((option) => option.value === item.category);
        qs("topic").value = topic ? item.category : "一般";
        syncChartTypeControls();
        runStaticChart();
        qs("chart").scrollIntoView({ block: "start" });
      });
      card.appendChild(load);
      list.appendChild(card);
    }
  }
  filter.addEventListener("change", renderList);
  renderList();
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => selectStaticTab(tab.dataset.tab));
});

qs("nowBtn").addEventListener("click", setStaticNow);
qs("chartBtn").addEventListener("click", runStaticChart);
qs("numberBtn").addEventListener("click", runStaticNumber);
qs("chartType").addEventListener("change", () => {
  syncChartTypeControls();
  runStaticChart();
});

renderStaticCases();
setStaticNow();
syncChartTypeControls();
runStaticChart();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
