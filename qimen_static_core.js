(function () {
  const PALACE_NAMES = { 1: "坎一宮", 2: "坤二宮", 3: "震三宮", 4: "巽四宮", 5: "中五宮", 6: "乾六宮", 7: "兌七宮", 8: "艮八宮", 9: "離九宮" };
  const PALACE_DIRECTIONS = { 1: "北", 2: "西南", 3: "東", 4: "東南", 5: "中", 6: "西北", 7: "西", 8: "東北", 9: "南" };
  const PALACE_ELEMENTS = { 1: "水", 2: "土", 3: "木", 4: "木", 5: "土", 6: "金", 7: "金", 8: "土", 9: "火" };
  const PALACE_BRANCHES = { 1: ["子"], 2: ["未", "申"], 3: ["卯"], 4: ["辰", "巳"], 5: [], 6: ["戌", "亥"], 7: ["酉"], 8: ["丑", "寅"], 9: ["午"] };
  const GRID = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];
  const CENTER_HOST_PALACE = 2;
  const CLOCKWISE_RING = [1, 8, 3, 4, 9, 2, 7, 6];
  const STEMS = [..."甲乙丙丁戊己庚辛壬癸"];
  const BRANCHES = [..."子丑寅卯辰巳午未申酉戌亥"];
  const GANZHI_60 = Array.from({ length: 60 }, (_, i) => STEMS[i % 10] + BRANCHES[i % 12]);
  const YI_ORDER = ["戊", "己", "庚", "辛", "壬", "癸", "丁", "丙", "乙"];
  const YIN_YANG_JU = {
    冬至: ["陽", [1, 7, 4]], 小寒: ["陽", [2, 8, 5]], 大寒: ["陽", [3, 9, 6]],
    立春: ["陽", [8, 5, 2]], 雨水: ["陽", [9, 6, 3]], 驚蟄: ["陽", [1, 7, 4]],
    春分: ["陽", [3, 9, 6]], 清明: ["陽", [4, 1, 7]], 穀雨: ["陽", [5, 2, 8]],
    立夏: ["陽", [4, 1, 7]], 小滿: ["陽", [5, 2, 8]], 芒種: ["陽", [6, 3, 9]],
    夏至: ["陰", [9, 3, 6]], 小暑: ["陰", [8, 2, 5]], 大暑: ["陰", [7, 1, 4]],
    立秋: ["陰", [2, 5, 8]], 處暑: ["陰", [1, 4, 7]], 白露: ["陰", [9, 3, 6]],
    秋分: ["陰", [7, 1, 4]], 寒露: ["陰", [6, 9, 3]], 霜降: ["陰", [5, 8, 2]],
    立冬: ["陰", [6, 9, 3]], 小雪: ["陰", [5, 8, 2]], 大雪: ["陰", [4, 7, 1]],
  };
  const YINPAN_DUN_YANG_JIEQI = new Set(["冬至", "小寒", "大寒", "立春", "雨水", "驚蟄", "春分", "清明", "穀雨", "立夏", "小滿", "芒種"]);
  const BASE_STARS = { 1: "天蓬星", 2: "天芮星", 3: "天沖星", 4: "天輔星", 5: "天禽星", 6: "天心星", 7: "天柱星", 8: "天任星", 9: "天英星" };
  const BASE_DOORS = { 1: "休門", 2: "死門", 3: "傷門", 4: "杜門", 5: "死門", 6: "開門", 7: "驚門", 8: "生門", 9: "景門" };
  const DOOR_ORDER = ["休門", "生門", "傷門", "杜門", "景門", "死門", "驚門", "開門"];
  const DOOR_ELEMENTS = { 休門: "水", 生門: "土", 傷門: "木", 杜門: "木", 景門: "火", 死門: "土", 驚門: "金", 開門: "金" };
  const YINPAN_GODS = ["值符", "螣蛇", "太陰", "六合", "白虎", "玄武", "九地", "九天"];
  const XUN_HIDDEN_STEM = { 甲子: "戊", 甲戌: "己", 甲申: "庚", 甲午: "辛", 甲辰: "壬", 甲寅: "癸" };
  const XUN_EMPTY = { 甲子: "戌亥", 甲戌: "申酉", 甲申: "午未", 甲午: "辰巳", 甲辰: "寅卯", 甲寅: "子丑" };
  const LONGEVITY_STAGES = ["長生", "沐浴", "冠帶", "臨官", "帝旺", "衰", "病", "死", "墓", "絕", "胎", "養"];
  const LONGEVITY_START = { 甲: "亥", 乙: "午", 丙: "寅", 丁: "酉", 戊: "寅", 己: "酉", 庚: "巳", 辛: "子", 壬: "申", 癸: "卯" };
  const YANG_STEMS = new Set(["甲", "丙", "戊", "庚", "壬"]);
  const FOUR_HARMS = ["空亡", "入墓", "擊刑", "門迫"];
  const TOMB_BRANCH_BY_STEM = { 辛: "辰", 壬: "辰", 癸: "未", 丁: "丑", 己: "丑", 庚: "丑", 乙: "戌", 丙: "戌", 戊: "戌" };
  const STRIKE_PALACE_BY_STEM = { 戊: 3, 己: 2, 庚: 8, 辛: 9, 壬: 4, 癸: 4 };
  const OPPOSITE_PALACE = { 1: 9, 9: 1, 2: 8, 8: 2, 3: 7, 7: 3, 4: 6, 6: 4 };
  const CONTROLS = new Set(["木土", "土水", "水火", "火金", "金木"]);
  const GENERATES = new Set(["木火", "火土", "土金", "金水", "水木"]);
  const OUTER_BRANCH_POSITIONS = { 巳: [0, 1], 午: [0, 2], 未: [0, 3], 申: [1, 4], 酉: [2, 4], 戌: [3, 4], 亥: [4, 3], 子: [4, 2], 丑: [4, 1], 寅: [3, 0], 卯: [2, 0], 辰: [1, 0] };

  function normalizeJieqi(name) {
    return String(name)
      .replace("谷雨", "穀雨")
      .replace("惊蛰", "驚蟄")
      .replace("小满", "小滿")
      .replace("芒种", "芒種")
      .replace("处暑", "處暑");
  }
  function ganzhiIndex(gz) {
    const index = GANZHI_60.indexOf(gz);
    if (index < 0) throw new Error(`干支錯誤：${gz}`);
    return index;
  }
  function xunFor(gz) {
    return GANZHI_60[Math.floor(ganzhiIndex(gz) / 10) * 10];
  }
  function displayPalaceNumber(palace) {
    return palace === 5 ? CENTER_HOST_PALACE : palace;
  }
  function palaceSequence(start, direction) {
    return Array.from({ length: 9 }, (_, i) => ((start - 1 + (direction === "陽" ? i : -i) + 90) % 9) + 1);
  }
  function ringFrom(start, reverse = false) {
    start = displayPalaceNumber(start);
    const ring = reverse ? [...CLOCKWISE_RING].reverse() : [...CLOCKWISE_RING];
    const index = ring.indexOf(start);
    return ring.slice(index).concat(ring.slice(0, index));
  }
  function rotateRingValues(base, sourcePalace, targetPalace, reverse = false) {
    const sourceRing = ringFrom(sourcePalace, reverse);
    const targetRing = ringFrom(targetPalace, reverse);
    const out = {};
    sourceRing.forEach((source, i) => { out[targetRing[i]] = base[source] || ""; });
    return out;
  }
  function placeYinpanEarthStems(dun, ju) {
    const display = {};
    for (let p = 1; p <= 9; p++) display[p] = [];
    const origins = {};
    let palace = ju;
    for (const stem of YI_ORDER) {
      origins[palace] = stem;
      display[displayPalaceNumber(palace)].push(stem);
      palace += dun === "陽" ? 1 : -1;
      if (palace > 9) palace = 1;
      if (palace < 1) palace = 9;
    }
    const earth = {};
    for (let p = 1; p <= 9; p++) earth[p] = display[p].join("");
    return [earth, origins];
  }
  function stemOriginPalaces(origins) {
    const out = {};
    Object.entries(origins).forEach(([palace, stem]) => { out[stem] = Number(palace); });
    return out;
  }
  function branchNumber(branch) {
    return BRANCHES.indexOf(branch) + 1;
  }
  function yearBranch(year) {
    return BRANCHES[(Number(year) - 4) % 12];
  }
  function branchPalace(branch) {
    for (const [palace, branches] of Object.entries(PALACE_BRANCHES)) {
      if (branches.includes(branch)) return Number(palace);
    }
    throw new Error(`不支援地支：${branch}`);
  }
  function yinpanDun(jieqi) {
    return YINPAN_DUN_YANG_JIEQI.has(jieqi) ? "陽" : "陰";
  }
  function yinpanJu(lunar, bazi) {
    const value = (branchNumber(bazi[0][1]) + Math.abs(lunar.getMonth()) + lunar.getDay() + branchNumber(bazi[3][1])) % 9;
    return value || 9;
  }
  function yuanByDayBranch(dayGz) {
    const branch = dayGz[1];
    if ("子午卯酉".includes(branch)) return "上元";
    if ("寅申巳亥".includes(branch)) return "中元";
    return "下元";
  }
  function yuanByFixed5Days(year, month, day, lunar) {
    const prevSolar = lunar.getPrevJieQi(true).getSolar();
    const start = new Date(prevSolar.getYear(), prevSolar.getMonth() - 1, prevSolar.getDay());
    const current = new Date(year, month - 1, day);
    const delta = Math.max(0, Math.floor((current - start) / 86400000));
    if (delta <= 4) return "上元";
    if (delta <= 9) return "中元";
    return "下元";
  }
  function moveNumericPalace(start, steps, dun) {
    let palace = start;
    for (let i = 0; i < steps; i++) {
      palace += dun === "陽" ? 1 : -1;
      if (palace > 9) palace = 1;
      if (palace < 1) palace = 9;
    }
    return displayPalaceNumber(palace);
  }
  function placeDoors(valueDoor, valueDoorPalace) {
    const startIndex = DOOR_ORDER.indexOf(valueDoor);
    const ring = ringFrom(valueDoorPalace, false);
    const out = {};
    ring.forEach((palace, offset) => { out[palace] = DOOR_ORDER[(startIndex + offset) % DOOR_ORDER.length]; });
    return out;
  }
  function placeYinpanGods(startPalace, dun) {
    const ring = ringFrom(startPalace, dun === "陰");
    const out = {};
    ring.forEach((palace, i) => { out[palace] = YINPAN_GODS[i] || ""; });
    return out;
  }
  function stemSet(value) {
    return new Set([...String(value || "")].filter((ch) => STEMS.includes(ch)));
  }
  function intersects(a, b) {
    for (const item of a) if (b.has(item)) return true;
    return false;
  }
  function stemProblemFlags(stems, branches, palace) {
    const flags = [];
    const set = stemSet(stems);
    for (const stem of set) {
      if (branches.includes(TOMB_BRANCH_BY_STEM[stem])) flags.push("入墓");
      if (STRIKE_PALACE_BY_STEM[stem] === palace) flags.push("擊刑");
    }
    return [...new Set(flags)];
  }
  function elementControls(a, b) {
    return CONTROLS.has(`${a}${b}`);
  }
  function detectPalaceMarks(palace, heavenStem, earthStem, star, door, xunEmpty, earthStems) {
    const branches = PALACE_BRANCHES[palace];
    const heavenFlags = stemProblemFlags(heavenStem, branches, palace);
    const earthFlags = stemProblemFlags(earthStem, branches, palace);
    const starFlags = [];
    const doorFlags = [];
    const resonanceFlags = [];
    if (branches.some((branch) => xunEmpty.includes(branch))) starFlags.push("空亡");
    if (door && elementControls(DOOR_ELEMENTS[door], PALACE_ELEMENTS[palace])) doorFlags.push("門迫");
    if (intersects(stemSet(heavenStem), stemSet(earthStem))) resonanceFlags.push("干伏吟");
    if (door === BASE_DOORS[palace]) resonanceFlags.push("門伏吟");
    if (star === BASE_STARS[palace]) resonanceFlags.push("星伏吟");
    const opposite = OPPOSITE_PALACE[palace];
    if (opposite) {
      if (intersects(stemSet(heavenStem), stemSet(earthStems[opposite] || ""))) resonanceFlags.push("干反吟");
      if (door === BASE_DOORS[opposite]) resonanceFlags.push("門反吟");
      if (star === BASE_STARS[opposite]) resonanceFlags.push("星反吟");
    }
    const flags = [...new Set([...starFlags, ...heavenFlags, ...earthFlags, ...doorFlags, ...resonanceFlags])];
    return { flags, heaven_flags: heavenFlags, earth_flags: earthFlags, star_flags: [...new Set(starFlags)], door_flags: [...new Set(doorFlags)], resonance_flags: [...new Set(resonanceFlags)] };
  }
  function collectFlags(palaces, allowed) {
    const found = new Set();
    Object.values(palaces).forEach((p) => p.flags.forEach((flag) => { if (allowed.includes(flag)) found.add(flag); }));
    return allowed.filter((flag) => found.has(flag));
  }
  function stemHeavenPalace(heavenStems, stem) {
    for (const [palace, stems] of Object.entries(heavenStems)) {
      if (String(stems).includes(stem)) return Number(palace);
    }
    throw new Error(`${stem} 不在天干盤`);
  }
  function stemLookupForHiddenJia(stem, hiddenStem) {
    return stem === "甲" ? hiddenStem : stem;
  }
  function horseStar(branch) {
    if ("申子辰".includes(branch)) return "寅";
    if ("寅午戌".includes(branch)) return "申";
    if ("亥卯未".includes(branch)) return "巳";
    return "亥";
  }
  function longevityByStem(stem) {
    const start = LONGEVITY_START[stem];
    const index = BRANCHES.indexOf(start);
    const direction = YANG_STEMS.has(stem) ? 1 : -1;
    const out = {};
    LONGEVITY_STAGES.forEach((stage, offset) => { out[BRANCHES[(index + direction * offset + 120) % 12]] = stage; });
    return out;
  }
  function palaceScore(p) {
    let score = ({ 生門: 3, 開門: 2, 休門: 1, 景門: 1, 杜門: 0, 驚門: -1, 傷門: -2, 死門: -3 }[p.door] || 0);
    if (["值符", "太陰", "六合", "九天", "九地"].includes(p.god)) score += 1;
    if (["螣蛇", "白虎", "玄武"].includes(p.god)) score -= 1;
    if (["天心星", "天任星", "天輔星"].includes(p.star)) score += 1;
    if ([...(p.heaven_stem || "") + (p.earth_stem || "")].some((s) => ["乙", "丙", "丁"].includes(s))) score += 1;
    score -= p.flags.length;
    return score;
  }
  function relation(subject, obj) {
    const a = PALACE_ELEMENTS[subject.number], b = PALACE_ELEMENTS[obj.number];
    if (subject.number === obj.number) return "主客同宮：你與事情黏在一起，感受強、牽動大。";
    if (a === b) return `主客比和：${a}${b}同氣，可談但容易各持己見。`;
    if (GENERATES.has(`${a}${b}`)) return "第一用神生第二用神：你在推動事情，會花心力與資源。";
    if (GENERATES.has(`${b}${a}`)) return "第二用神生第一用神：事情或對方較能回應你。";
    if (CONTROLS.has(`${a}${b}`)) return "第一用神剋第二用神：你能掌控，但太硬會形成壓迫。";
    if (CONTROLS.has(`${b}${a}`)) return "第二用神剋第一用神：事情壓力較重，先降風險。";
    return "主客關係平穩。";
  }
  function formatClock(totalMinutes) {
    const value = ((totalMinutes % 1440) + 1440) % 1440;
    const hour = Math.floor(value / 60);
    const minute = value % 60;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }
  function keInfo(solar, timeBranch) {
    const total = Number(solar.hour) * 60 + Number(solar.minute || 0);
    const offset = (total >= 1380 || total < 60) ? (total - 1380 + 1440) % 1440 : (total - 60) % 120;
    const index = Math.min(8, Math.floor(offset / 15) + 1);
    const blockStart = total - offset;
    const start = blockStart + (index - 1) * 15;
    const end = start + 14;
    const half = index <= 4 ? "上四刻" : "下四刻";
    return {
      index,
      half,
      branch: timeBranch,
      offset,
      range: `${formatClock(start)}-${formatClock(end)}`,
      label: `${timeBranch}時第${index}刻（${half}｜${formatClock(start)}-${formatClock(end)}）`,
    };
  }
  function buildChart({ year, month, day, hour, minute = 0, yuanMethod = "yinpan" }) {
    year = Number(year); month = Number(month); day = Number(day); hour = Number(hour); minute = Number(minute) || 0;
    if (!window.Solar) throw new Error("lunar.js 尚未載入");
    const lunar = Solar.fromYmdHms(year, month, day, hour, minute, 0).getLunar();
    const bazi = [lunar.getYearInGanZhiExact(), lunar.getMonthInGanZhiExact(), lunar.getDayInGanZhiExact(), lunar.getTimeInGanZhi()];
    const jieqi = normalizeJieqi(lunar.getPrevJieQi(true).getName());
    if (!YIN_YANG_JU[jieqi]) throw new Error(`暫不支援節氣：${jieqi}`);
    let yuan, dun, ju;
    if (yuanMethod === "fixed5") {
      yuan = yuanByFixed5Days(year, month, day, lunar);
      const idx = { 上元: 0, 中元: 1, 下元: 2 }[yuan];
      [dun, ju] = [YIN_YANG_JU[jieqi][0], YIN_YANG_JU[jieqi][1][idx]];
    } else if (yuanMethod === "branch") {
      yuan = yuanByDayBranch(bazi[2]);
      const idx = { 上元: 0, 中元: 1, 下元: 2 }[yuan];
      [dun, ju] = [YIN_YANG_JU[jieqi][0], YIN_YANG_JU[jieqi][1][idx]];
    } else {
      yuan = "陰盤";
      dun = yinpanDun(jieqi);
      ju = yinpanJu(lunar, bazi);
    }
    const [earthStems, hiddenEarthStems] = placeYinpanEarthStems(dun, ju);
    const stemOrigins = stemOriginPalaces(hiddenEarthStems);
    const timeGz = bazi[3];
    const xun = xunFor(timeGz);
    const xunHidden = XUN_HIDDEN_STEM[xun];
    const xunOriginPalace = stemOrigins[xunHidden];
    const xunDisplayPalace = displayPalaceNumber(xunOriginPalace);
    const valueStar = xunOriginPalace === 5 ? "天禽星" : BASE_STARS[xunDisplayPalace];
    const valueDoor = BASE_DOORS[xunOriginPalace];
    const hourStem = timeGz[0];
    const hourLookupStem = hourStem === "甲" ? xunHidden : hourStem;
    const hourStemOriginPalace = stemOrigins[hourLookupStem];
    const hourStemPalace = displayPalaceNumber(hourStemOriginPalace);
    const stars = rotateRingValues(BASE_STARS, xunDisplayPalace, hourStemPalace, false);
    const heavenStems = rotateRingValues(earthStems, xunDisplayPalace, hourStemPalace, false);
    const valueDoorPalace = moveNumericPalace(xunOriginPalace, ganzhiIndex(timeGz) - ganzhiIndex(xun), dun);
    const doors = placeDoors(valueDoor, valueDoorPalace);
    const annualBranch = yearBranch(year);
    const annualPalace = branchPalace(annualBranch);
    const gods = placeYinpanGods(hourStemPalace, dun);
    const firstYongshenPalace = stemHeavenPalace(heavenStems, stemLookupForHiddenJia(bazi[2][0], xunHidden));
    const secondYongshenPalace = stemHeavenPalace(heavenStems, stemLookupForHiddenJia(bazi[3][0], xunHidden));
    const horse = horseStar(timeGz[1]);
    const longevityStem = stemLookupForHiddenJia(bazi[2][0], xunHidden);
    const longevityMap = longevityByStem(longevityStem);
    const palaces = {};
    for (let palace = 1; palace <= 9; palace++) {
      const marks = detectPalaceMarks(palace, heavenStems[palace] || "", earthStems[palace] || "", stars[palace] || "", doors[palace] || "", XUN_EMPTY[xun], earthStems);
      const branches = PALACE_BRANCHES[palace];
      palaces[palace] = {
        number: palace,
        name: PALACE_NAMES[palace],
        direction: PALACE_DIRECTIONS[palace],
        earth_stem: earthStems[palace] || "",
        heaven_stem: heavenStems[palace] || "",
        star: stars[palace] || "",
        door: doors[palace] || "",
        god: gods[palace] || "",
        branches,
        ...marks,
        longevity: branches.map((branch) => [branch, longevityMap[branch]]),
        has_horse: branches.includes(horse),
      };
    }
    const chart = {
      solar: { year, month, day, hour, minute },
      bazi, jieqi, yuan, dun, ju, xun,
      xun_hidden_stem: xunHidden,
      xun_empty: XUN_EMPTY[xun],
      value_star: valueStar,
      value_door: valueDoor,
      hour_stem_palace: hourStemPalace,
      value_door_palace: valueDoorPalace,
      palaces,
      horse_star: horse,
      global_flags: collectFlags(palaces, FOUR_HARMS),
      first_yongshen_palace: firstYongshenPalace,
      second_yongshen_palace: secondYongshenPalace,
      annual_palace: annualPalace,
      annual_branch: annualBranch,
      longevity_stem: longevityStem,
    };
    return chart;
  }
  function outerBranches(chart) {
    const map = {};
    Object.values(chart.palaces).forEach((p) => p.longevity.forEach(([b, s]) => { map[b] = s; }));
    return Object.entries(OUTER_BRANCH_POSITIONS).map(([branch, [row, col]]) => {
      const parts = [branch];
      if (map[branch]) parts.push(map[branch]);
      if (branch === chart.horse_star) parts.push("馬");
      return { branch, row, col, horse: branch === chart.horse_star, label: parts.join(" | ") };
    });
  }
  function markerFor(number, chart) {
    const labels = [];
    if (number === chart.first_yongshen_palace) labels.push("第一用神");
    if (number === chart.second_yongshen_palace) labels.push("第二用神");
    return { text: labels.join(" / "), first: labels.includes("第一用神"), second: labels.includes("第二用神") };
  }
  function issueClass(flags) {
    if (flags.includes("擊刑") && flags.includes("入墓")) return "issue-both";
    if (flags.includes("擊刑")) return "issue-strike";
    if (flags.includes("入墓")) return "issue-tomb";
    return "";
  }
  function palaceView(p, chart) {
    return {
      number: p.number,
      name: p.number === 5 ? `五寄${PALACE_NAMES[CENTER_HOST_PALACE].replace("宮", "")}` : p.name,
      direction: p.number === 5 ? PALACE_DIRECTIONS[CENTER_HOST_PALACE] : p.direction,
      heavenStem: p.heaven_stem,
      earthStem: p.earth_stem,
      star: p.star,
      door: p.door,
      god: p.god,
      heavenFlags: p.heaven_flags,
      earthFlags: p.earth_flags,
      starFlags: p.star_flags,
      doorFlags: p.door_flags,
      resonanceFlags: p.resonance_flags,
      marker: markerFor(p.number, chart),
      heavenClass: issueClass(p.heaven_flags),
      earthClass: issueClass(p.earth_flags),
      starClass: p.star_flags.includes("空亡") ? "issue-empty" : "",
      doorClass: p.door_flags.includes("門迫") ? "issue-strike" : "",
      borderClass: "",
    };
  }
  function issueTable(chart) {
    const lines = ["標記統計表：", `四害統計：${chart.global_flags.join("、") || "無"}｜馬星：${chart.horse_star}｜十二長生用干：${chart.longevity_stem}`, "宮位｜十二長生/馬｜天干問題｜地干問題｜九星問題｜八門問題｜伏吟/反吟"];
    for (const palace of [4, 9, 2, 3, 5, 7, 8, 1, 6]) {
      const p = chart.palaces[palace];
      const longevity = p.longevity.map(([b, s]) => `${b}${s}`).concat(p.has_horse ? ["馬"] : []).join("、") || "-";
      lines.push(`${p.name}｜${longevity}｜${p.heaven_flags.join("、") || "-"}｜${p.earth_flags.join("、") || "-"}｜${p.star_flags.join("、") || "-"}｜${p.door_flags.join("、") || "-"}｜${p.resonance_flags.join("、") || "-"}`);
    }
    return lines.join("\n");
  }
  const PALACE_TRAITS = {
    1: "思考深、反應快，適合研究、資訊、流動型資源，但也容易想太多。",
    2: "重現實、重責任，能扛事，但容易被家庭、資金或身體壓力綁住。",
    3: "行動快、想突破，有衝勁，也容易急躁、先做後修。",
    4: "重人脈、資訊、規劃與彈性，適合談判、媒合、技術包裝。",
    5: "中宮寄坤，事情多落到責任、現實條件與資源配置。",
    6: "重制度、專業、名聲與權責，適合工程、管理、規範型工作。",
    7: "重表達、交易、口碑與人際互動，利業務與溝通，也防口舌。",
    8: "重累積、技術、資產與穩定，慢熱但能做長期成果。",
    9: "重曝光、名聲、感情熱度與靈感，利被看見，也防虛火。",
  };
  const GOD_FEEL = {
    值符: "有貴人、核心資源與正規力量，宜走正道、找關鍵人物。",
    螣蛇: "想像力強但也多疑，容易曖昧、糾結、想很多。",
    太陰: "適合暗中準備、精算與布局，事情不宜太早曝光。",
    六合: "有人緣、合作、感情與媒合訊號，重點是把條件談清楚。",
    白虎: "壓力大、衝突強，適合硬仗，但要防受傷、破財與口氣過硬。",
    玄武: "資訊差、投機、隱情與曖昧重，利查資料，但要防騙與帳務不清。",
    九地: "穩守、慢成、能累積，適合長線與低調布局。",
    九天: "外放、擴張、遠方、曝光強，適合放大聲量與跨域。",
  };
  const STAR_FEEL = {
    天蓬星: "膽子與慾望強，利研究風險與偏財，但忌貪快。",
    天芮星: "問題、壓力、學習與健康負擔重，要先補漏洞。",
    天沖星: "行動、突破、衝刺力強，快則有利，急則有傷。",
    天輔星: "學習、專業、證照、教學與貴人扶持佳。",
    天禽星: "中正穩重，能整合資源，但責任也重。",
    天心星: "技術、醫療、管理、判斷力佳，適合用專業換錢。",
    天柱星: "壓力、口舌、制度與聲音，利表達但要防硬碰硬。",
    天任星: "承擔、資產、穩定與長期經營，適合慢慢做大。",
    天英星: "曝光、名聲、文書、形象與感情熱度，利展示。",
  };
  const DOOR_FEEL = {
    休門: "利休養、人情、貴人與穩定互動。",
    生門: "利財利、資源、收入、經營與長期成長。",
    傷門: "有突破也有損傷，適合修理問題，不宜衝動硬上。",
    杜門: "重技術、閉關、保密與內部整理，慢但能做深。",
    景門: "利曝光、作品、名聲與桃花，也容易虛火。",
    死門: "事情卡住、保守、舊問題重，適合收尾、整理、止損。",
    驚門: "口舌、驚動、消息、風險高，利提醒與查錯。",
    開門: "利工作、機會、開局、合約與對外發展。",
  };
  const FLAG_ADVICE = {
    空亡: "容易落空、想像多於落地，先確認人、事、錢是否真的到位",
    入墓: "事情被壓住或卡住，要靠整理、等待與制度化解",
    擊刑: "內外衝突、急躁或自我打結明顯，先降火再行動",
    門迫: "環境壓力大，方法不順時要換路線，不要硬推",
    干伏吟: "人事重複、卡在同一題，要先修正舊模式",
    門伏吟: "做法反覆，容易原地打轉",
    星伏吟: "心態與事件模式重複，需要換觀點",
    干反吟: "人事變動快，容易反向發展",
    門反吟: "做法容易被推翻，宜留備案",
    星反吟: "外部局勢變動，判斷不可一次押死",
  };
  function hasThreeWonder(p) {
    return [...((p.heaven_stem || "") + (p.earth_stem || ""))].some((s) => ["乙", "丙", "丁"].includes(s));
  }
  function flagsText(p) {
    const flags = p.flags || [];
    if (!flags.length) return "這宮沒有明顯四害，事情相對乾淨。";
    return flags.map((f) => FLAG_ADVICE[f] || f).join("；") + "。";
  }
  function stripEnd(text) {
    return String(text || "").replace(/[。；，\s]+$/g, "");
  }
  function palaceTone(p) {
    return [
      `${p.name}主「${stripEnd(PALACE_TRAITS[p.number] || "看宮位組合")}」`,
      GOD_FEEL[p.god],
      STAR_FEEL[p.star],
      DOOR_FEEL[p.door],
    ].filter(Boolean).map(stripEnd).join("；");
  }
  function topicScore(p, topic) {
    let score = palaceScore(p);
    if (topic === "財運") {
      if (["生門", "開門", "休門"].includes(p.door)) score += 3;
      if (["天心星", "天任星", "天輔星"].includes(p.star)) score += 2;
      if (["值符", "九地", "九天", "太陰"].includes(p.god)) score += 1;
    } else if (topic === "感情") {
      if (p.god === "六合") score += 4;
      if (["休門", "開門", "生門", "景門"].includes(p.door)) score += 2;
      if (hasThreeWonder(p)) score += 1;
    } else if (topic === "事業") {
      if (["開門", "景門", "生門"].includes(p.door)) score += 3;
      if (["天心星", "天輔星", "天任星"].includes(p.star)) score += 2;
      if (["值符", "九天"].includes(p.god)) score += 2;
    } else if (topic === "健康") {
      if (p.star === "天芮星") score += 4;
      if (["死門", "傷門", "驚門"].includes(p.door)) score += 2;
      if (["白虎", "螣蛇"].includes(p.god)) score += 2;
      score += (p.flags || []).length;
    }
    return score;
  }
  function bestTopicPalace(chart, topic) {
    const palaces = Object.values(chart.palaces);
    return palaces.sort((a, b) => topicScore(b, topic) - topicScore(a, topic))[0];
  }
  function topicLine(topic, p) {
    const base = `${topic}看${p.name}，見${p.god}、${p.star}、${p.door}。`;
    if (topic === "財運") return `${base}${p.door === "生門" ? "有資源與收入訊號，" : ""}${p.star === "天心星" ? "偏向用專業、技術、判斷力換錢，" : ""}${flagsText(p)}`;
    if (topic === "感情") return `${base}${p.god === "六合" ? "有和合、人緣或媒合訊號，" : ""}${["玄武", "螣蛇"].includes(p.god) ? "但曖昧、猜測與話沒講清楚會變成問題，" : ""}${flagsText(p)}`;
    if (topic === "事業") return `${base}${["開門", "景門", "生門"].includes(p.door) ? "有對外開展、曝光或資源機會，" : ""}${flagsText(p)}`;
    if (topic === "健康") return `${base}這是盤象提醒，偏向壓力、作息、舊問題或身心耗損；身體仍以醫療檢查為準。${flagsText(p)}`;
    return `${base}${flagsText(p)}`;
  }
  function explain(chart, options = {}) {
    const first = chart.palaces[chart.first_yongshen_palace];
    const second = chart.palaces[chart.second_yongshen_palace];
    const good = Object.values(chart.palaces).sort((a, b) => palaceScore(b) - palaceScore(a)).slice(0, 4);
    const risks = Object.values(chart.palaces).filter((p) => p.flags.length).slice(0, 5);
    const wealth = bestTopicPalace(chart, "財運");
    const relationship = bestTopicPalace(chart, "感情");
    const career = bestTopicPalace(chart, "事業");
    const health = bestTopicPalace(chart, "健康");
    const chartType = options.chartType || "終身盤（出生盤）";
    const isKe = String(chartType).includes("刻盤");
    const isPrediction = isKe || String(chartType).includes("時盤") || String(chartType).includes("預測");
    const ke = keInfo(chart.solar, chart.bazi[3][1]);
    const condition = isPrediction ? `${isKe ? `刻盤：${ke.label}。` : ""}問事條件：${options.presence || "人在現場"}｜${options.askerGender || "男問"}｜${options.divinerGender || "男預測師"}` : "終身盤：以出生時間定盤，不使用人在/不在場與問事者條件。";
    const relationText = relation(first, second);
    const firstHasRisk = first.flags && first.flags.length;
    const secondHasRisk = second.flags && second.flags.length;
    const headline = firstHasRisk && secondHasRisk
      ? "這盤不是缺機會，而是自己狀態與事情本體都帶阻力，先釐清條件再出手。"
      : firstHasRisk
        ? "這盤先處理自己的狀態；你一穩，事情才容易順。"
        : secondHasRisk
          ? "這盤事情本體有卡點，不宜只靠熱情推進，要先拆風險。"
          : "這盤主客相對乾淨，可以看準方向後主動布局。";
    const lines = [
      "解說盤：",
      `排盤類型：${chartType}`,
      condition,
      "",
      `一、總結：${headline}`,
      `主客關係：${relationText}`,
      "",
      "二、用神判斷",
      `第一用神（${isPrediction ? "問測者/日干" : "命主/日干"}）：落${first.name}，${palaceTone(first)}。${flagsText(first)}`,
      `第二用神（${isPrediction ? "所問事/時干" : "行為反應/時干"}）：落${second.name}，${palaceTone(second)}。${flagsText(second)}`,
      "",
      "三、各項運勢",
      `財運：${topicLine("財運", wealth)}`,
      `感情：${topicLine("感情", relationship)}`,
      `事業：${topicLine("事業", career)}`,
      `健康：${topicLine("健康", health)}`,
      "",
      "四、可用宮位",
      ...good.map((p) => `- ${p.name}：${p.god}、${p.star}、${p.door}。適合用「${stripEnd(DOOR_FEEL[p.door] || "依盤面取用")}」的方式處理。${flagsText(p)}`),
      "",
      `五、四害與動象：${chart.global_flags.join("、") || "無"}。馬星在${chart.horse_star}，代表事情有移動、變化或需要主動走出去的部分。十二長生用干為${chart.longevity_stem}。`,
    ];
    if (risks.length) {
      lines.push("", "六、風險位");
      risks.forEach((p) => lines.push(`- ${p.name}：${p.flags.join("、")}。${flagsText(p)}`));
    }
    lines.push("", "七、行動建議");
    if (relationText.includes("生第二")) lines.push("- 你會是付出與推動的一方，適合主動，但要設定時間、金錢與情緒停損。");
    else if (relationText.includes("生第一")) lines.push("- 外部或對方有回應你的機會，重點是接住資源，不要因懷疑而錯過。");
    else if (relationText.includes("剋第一")) lines.push("- 壓力在你身上，先守住基本盤，重大決策不要一次押滿。");
    else if (relationText.includes("剋第二")) lines.push("- 你能控制局面，但語氣與手段要柔一點，避免把好事推硬。");
    else lines.push("- 先把條件說清楚，再用可用宮位的方向去推進。");
    return lines.join("\n");
  }
  function toResponse(chart, options = {}) {
    const resonance = ["干伏吟", "門伏吟", "星伏吟", "干反吟", "門反吟", "星反吟"].filter((flag) => Object.values(chart.palaces).some((p) => p.flags.includes(flag))).join("、") || "無";
    const resonanceFlags = resonance === "無" ? [] : resonance.split("、");
    const palaces = {};
    Object.entries(chart.palaces).forEach(([n, p]) => { palaces[n] = palaceView(p, chart); });
    const isKe = String(options.chartType || "").includes("刻盤");
    const ke = keInfo(chart.solar, chart.bazi[3][1]);
    const keHeader = isKe ? `｜刻：${ke.label}` : "";
    const keSummary = isKe ? `｜刻盤：${ke.label}` : "";
    return {
      chartType: options.chartType || "靜態排盤",
      header: `盤種：${options.chartType || "靜態排盤"}｜時間：${chart.solar.year}-${String(chart.solar.month).padStart(2, "0")}-${String(chart.solar.day).padStart(2, "0")} ${String(chart.solar.hour).padStart(2, "0")}:${String(chart.solar.minute).padStart(2, "0")}${keHeader}｜四柱：${chart.bazi[0]}年 ${chart.bazi[1]}月 ${chart.bazi[2]}日 ${chart.bazi[3]}時｜節氣：${chart.jieqi}｜${chart.yuan}｜${chart.dun}遁${chart.ju}局`,
      summary: `旬首：${chart.xun}(${chart.xun_hidden_stem})｜空亡：${chart.xun_empty}｜馬星：${chart.horse_star}｜十二長生用干：${chart.longevity_stem}｜值符：${chart.value_star}｜值使：${chart.value_door}｜值使落宮：${PALACE_NAMES[chart.value_door_palace]}｜四害統計：${chart.global_flags.join("、") || "無"}｜伏吟/反吟：${resonance}${keSummary}`,
      palaces,
      resonanceFlags,
      resonanceClass: resonanceFlags.some((f) => f.endsWith("反吟")) ? "chart-resonance-reverse" : (resonanceFlags.some((f) => f.endsWith("伏吟")) ? "chart-resonance-fuyin" : ""),
      outerBranches: outerBranches(chart),
      issueTable: issueTable(chart),
      explanation: explain(chart, options),
      textChart: issueTable(chart),
    };
  }
  window.QimenStatic = { buildChart, toResponse, GRID };
})();
