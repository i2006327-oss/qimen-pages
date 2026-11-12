const dailyHarms = ["空亡", "入墓", "擊刑", "門迫"];
const dailyResonance = ["干伏吟", "門伏吟", "星伏吟", "干反吟", "門反吟", "星反吟"];
const dailyDirections = {
  1: ["337.5°–22.5°", 0], 8: ["22.5°–67.5°", 45], 3: ["67.5°–112.5°", 90],
  4: ["112.5°–157.5°", 135], 9: ["157.5°–202.5°", 180], 2: ["202.5°–247.5°", 225],
  7: ["247.5°–292.5°", 270], 6: ["292.5°–337.5°", 315],
};
const dailyHours = [["卯", 5], ["辰", 7], ["巳", 9], ["午", 11], ["未", 13], ["申", 15], ["酉", 17], ["戌", 19]];

function dailyTaipeiDate() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function buildDailyResults(date, yuanMethod) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("請選擇有效日期");
  const [year, month, day] = date.split("-").map(Number);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) throw new Error("請選擇有效日期");
  const results = dailyHours.map(([branch, hour]) => {
    const chart = QimenStatic.buildChart({ year, month, day, hour, minute: 30, yuanMethod });
    const palaces = Object.values(chart.palaces).filter((p) => p.number !== 5);
    const dayStem = chart.bazi[2][0] === "甲" ? chart.xun_hidden_stem : chart.bazi[2][0];
    const wealth = palaces.find((p) => p.door === "生門");
    const self = palaces.find((p) => p.heaven_stem.includes(dayStem));
    const capital = palaces.find((p) => p.heaven_stem.includes("戊"));
    if (!wealth || !self || !capital) throw new Error("找不到主宮，無法比較");
    const main = [...new Map([wealth, self, capital].map((p) => [p.number, p])).values()];
    const harms = (p) => dailyHarms.filter((flag) => p.flags.includes(flag));
    const resonance = dailyResonance.filter((flag) => palaces.some((p) => p.flags.includes(flag)));
    const globalResonance = dailyResonance.filter((flag) => palaces.every((p) => p.flags.includes(flag)));
    const five = chart.special_flags.some((flag) => flag.includes("五不遇時"));
    const avoid = five || ["伏吟", "反吟"].some((suffix) => ["干", "門", "星"].every((prefix) => globalResonance.includes(prefix + suffix)));
    const affected = main.filter((p) => harms(p).length).length;
    let score = avoid ? 0 : affected === 0 ? 3 : affected === 1 ? 2 : 1;
    if (!avoid && resonance.length) score = Math.max(1, score - 1);
    return { branch, hour, chart, wealth, self, capital, main, resonance, five, score, grade: ["避開", "下", "中", "上"][score], mainHarmCount: main.reduce((sum, p) => sum + harms(p).length, 0) };
  });
  const ranked = [...results].sort((a, b) => b.score - a.score || a.mainHarmCount - b.mainHarmCount || a.chart.eight_harm_count - b.chart.eight_harm_count || a.hour - b.hour);
  ranked[0].rank = "推薦"; ranked[1].rank = "次選";
  return results;
}

function dailyPalaceText(label, palace) {
  const harms = dailyHarms.filter((flag) => palace.flags.includes(flag));
  return `${label}：${palace.name}（${palace.direction} ${dailyDirections[palace.number][0]}）｜${palace.door}｜${palace.god}｜${harms.join("、") || "無四害"}`;
}

function dailyMap(palace) {
  const map = window.open("", "_blank");
  const base = "https://www.google.com/maps/search/彩券行";
  const navigate = (url) => { if (map) map.location.href = url; else window.open(url, "_blank"); };
  const fallback = (reason) => { qs("dailyLocationStatus").textContent = `無法取得位置：${reason}；已開啟不含座標的地圖。`; navigate(base); };
  const usePosition = (lat, lon) => {
    const angle = dailyDirections[palace.number][1] * Math.PI / 180;
    const distance = 0.8 / 6371;
    const latitude = lat * Math.PI / 180;
    const targetLat = Math.asin(Math.sin(latitude) * Math.cos(distance) + Math.cos(latitude) * Math.sin(distance) * Math.cos(angle));
    const targetLon = lon * Math.PI / 180 + Math.atan2(Math.sin(angle) * Math.sin(distance) * Math.cos(latitude), Math.cos(distance) - Math.sin(latitude) * Math.sin(targetLat));
    navigate(`${base}/@${(targetLat * 180 / Math.PI).toFixed(6)},${(((targetLon * 180 / Math.PI + 540) % 360) - 180).toFixed(6)},16z`);
  };
  if (qs("dailyRemember").checked) {
    try {
      const saved = JSON.parse(localStorage.getItem("qimenDailyLocation"));
      if (saved && Number.isFinite(saved.lat) && Number.isFinite(saved.lon) && Math.abs(saved.lat) <= 90 && Math.abs(saved.lon) <= 180) { usePosition(saved.lat, saved.lon); return; }
    } catch (error) { /* 無法讀取儲存位置時重新定位。 */ }
  }
  if (!navigator.geolocation) { fallback("瀏覽器不支援定位"); return; }
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude: lat, longitude: lon } = position.coords;
    if (qs("dailyRemember").checked) {
      try { localStorage.setItem("qimenDailyLocation", JSON.stringify({ lat, lon })); } catch (error) { qs("dailyLocationStatus").textContent = "無法儲存位置，本次仍可使用定位。"; }
    }
    usePosition(lat, lon);
  }, (error) => fallback(error.message || "定位權限遭拒或定位失敗"), { timeout: 10000 });
}

function renderDailyResults() {
  try {
    const date = qs("dailyDate").value;
    const results = buildDailyResults(date, qs("yuanMethod").value);
    const container = qs("dailyResults");
    container.replaceChildren();
    for (const result of results) {
      const { chart } = result;
      const card = document.createElement("article");
      card.className = `daily-card${result.score === 0 ? " daily-avoid" : ""}`;
      const heading = document.createElement("h3");
      heading.textContent = `${result.branch}時 ${result.hour === 19 ? "19:00–19:59（539 20:00 截止）" : `${staticPad2(result.hour)}:00–${staticPad2(result.hour + 1)}:59`}｜${result.grade}${result.rank ? `・${result.rank}` : ""}`;
      card.appendChild(heading);
      const body = document.createElement("p");
      const open = Object.values(chart.palaces).find((p) => p.number !== 5 && p.door === "開門");
      body.textContent = [`時柱：${chart.bazi[3]}｜${chart.dun}遁${chart.ju}局`, dailyPalaceText("財（生門）", result.wealth), dailyPalaceText(`本人（日干${chart.bazi[2][0]}${chart.bazi[2][0] === "甲" ? `，遁${chart.xun_hidden_stem}` : ""}）`, result.self), dailyPalaceText("本金（戊）", result.capital), open ? dailyPalaceText("開門（補充）", open) : "開門（補充）：未見", `全盤伏吟/反吟：${result.resonance.join("、") || "無"}｜五不遇時：${result.five ? "是" : "否"}｜全盤八宮四害數：${chart.eight_harm_count}`, ...(result.score > 0 && result.resonance.length ? ["有伏吟/反吟，宜守不宜加碼"] : [])].join("\n");
      card.appendChild(body);
      const load = document.createElement("button"); load.type = "button"; load.textContent = "載入此盤";
      load.addEventListener("click", () => {
        const parts = date.split("-"); ["year", "month", "day"].forEach((id, i) => { qs(id).value = parts[i]; });
        qs("hour").value = staticPad2(result.hour); qs("minute").value = "30";
        qs("chartType").value = "時盤（預測盤）"; qs("topic").value = "財運";
        syncChartTypeControls(); runStaticChart(); qs("chart").scrollIntoView({ block: "start" });
      });
      card.appendChild(load);
      if (result.rank === "推薦") {
        const map = document.createElement("button"); map.type = "button"; map.textContent = "在地圖找這個方向的彩券行";
        map.addEventListener("click", () => dailyMap(result.wealth)); card.appendChild(map);
        const note = document.createElement("p"); note.textContent = "地圖以生門（財）方位為準，距目前位置約 0.8 公里。"; card.appendChild(note);
      }
      container.appendChild(card);
    }
  } catch (error) { alert(error.message); }
}

qs("dailyDate").value = dailyTaipeiDate();
qs("dailyCompare").addEventListener("click", renderDailyResults);
qs("dailyClearLocation").addEventListener("click", () => {
  try { localStorage.removeItem("qimenDailyLocation"); qs("dailyRemember").checked = false; qs("dailyLocationStatus").textContent = "已清除記住的位置。"; }
  catch (error) { qs("dailyLocationStatus").textContent = "無法清除儲存的位置。"; }
});

if (staticLastTab === "daily") renderDailyResults();
