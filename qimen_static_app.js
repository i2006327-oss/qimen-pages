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
  return flags && flags.length ? `｜${flags.join("、")}` : "";
}

function palaceClass(p) {
  const classes = ["palace"];
  if (p.marker.first) classes.push("marker-first");
  if (p.marker.second) classes.push("marker-second");
  return classes.join(" ");
}

function renderStaticPalace(p) {
  const div = document.createElement("div");
  const [row, col] = staticGridPositions[p.number];
  div.className = palaceClass(p);
  div.style.gridRow = String(row + 1);
  div.style.gridColumn = String(col + 1);
  const markerClass = p.marker.second && !p.marker.first ? "marker second" : "marker";
  div.innerHTML = `
    <div class="palace-title">${p.name}｜${p.direction}</div>
    <div class="god">${p.god || ""}</div>
    ${p.marker.text ? `<div class="${markerClass}">${p.marker.text}</div>` : ""}
    <div class="stems">
      <div class="${p.heavenClass || ""}">天干 ${p.heavenStem || ""}${flagText(p.heavenFlags)}</div>
      <div class="${p.earthClass || ""}">地干 ${p.earthStem || ""}${flagText(p.earthFlags)}</div>
    </div>
    <div class="right-signs">
      <div class="star ${p.starClass || ""}">${p.star || ""}${flagText(p.starFlags)}</div>
      <div class="door ${p.doorClass || ""}">${p.door || ""}${flagText(p.doorFlags)}</div>
    </div>
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
  grid.innerHTML = "";
  grid.className = `qimen-grid ${data.resonanceClass || ""}`.trim();
  if (data.resonanceFlags && data.resonanceFlags.length) {
    const badge = document.createElement("div");
    badge.className = "chart-resonance-badge";
    badge.textContent = data.resonanceFlags.join("、");
    badge.style.gridRow = "1 / 6";
    badge.style.gridColumn = "1 / 6";
    grid.appendChild(badge);
  }
  for (const item of data.outerBranches) {
    const label = document.createElement("div");
    label.className = `outer-label${item.horse ? " horse" : ""}`;
    label.textContent = item.label;
    label.style.gridRow = String(item.row + 1);
    label.style.gridColumn = String(item.col + 1);
    grid.appendChild(label);
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

setStaticNow();
syncChartTypeControls();
runStaticChart();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
