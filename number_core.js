(function () {
  const palaceNames = {
    1: "坎一宮", 2: "坤二宮", 3: "震三宮", 4: "巽四宮", 5: "中五宮",
    6: "乾六宮", 7: "兌七宮", 8: "艮八宮", 9: "離九宮",
  };
  const palaceDirections = { 1: "北", 2: "西南", 3: "東", 4: "東南", 5: "中", 6: "西北", 7: "西", 8: "東北", 9: "南" };
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const branchPalace = { 子: 1, 未: 2, 申: 2, 卯: 3, 辰: 4, 巳: 4, 戌: 6, 亥: 6, 酉: 7, 丑: 8, 寅: 8, 午: 9 };
  const stemElements = { 甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水" };
  const generates = new Set(["木火", "火土", "土金", "金水", "水木"]);
  const controls = new Set(["木土", "土水", "水火", "火金", "金木"]);
  const mapping = {
    "0": { palace_male: 2, palace_female: 8, lead_stem: "庚", god: "假符", star: "假蓬星", door: "假休門", heaven_stem: "癸", earth_stem: "癸" },
    "1": { palace: 1, lead_stem: "辛", god: "值符", star: "天蓬星", door: "休門", heaven_stem: "甲", earth_stem: "甲" },
    "2": { palace: 2, lead_stem: "壬", god: "螣蛇", star: "天芮星", door: "死門", heaven_stem: "乙", earth_stem: "乙" },
    "3": { palace: 3, lead_stem: "癸", god: "太陰", star: "天沖星", door: "傷門", heaven_stem: "丙", earth_stem: "丙" },
    "4": { palace: 4, lead_stem: "甲", god: "六合", star: "天輔星", door: "杜門", heaven_stem: "丁", earth_stem: "丁" },
    "5": { palace_male: 2, palace_female: 8, lead_stem: "乙", god: "白虎", star: "天禽星", door: "休門", heaven_stem: "戊", earth_stem: "戊" },
    "6": { palace: 6, lead_stem: "丙", god: "玄武", star: "天心星", door: "開門", heaven_stem: "己", earth_stem: "己" },
    "7": { palace: 7, lead_stem: "丁", god: "九地", star: "天柱星", door: "驚門", heaven_stem: "庚", earth_stem: "庚" },
    "8": { palace: 8, lead_stem: "戊", god: "九天", star: "天任星", door: "生門", heaven_stem: "辛", earth_stem: "辛" },
    "9": { palace: 9, lead_stem: "己", god: "九天", star: "天英星", door: "景門", heaven_stem: "壬", earth_stem: "壬" },
  };

  const palaceMeaning = {
    "坎一宮": "多思、資訊、流動與困局，利資料研究，也要防猜疑與卡住。",
    "坤二宮": "承載、包容、服務與家庭，利穩定照顧，也要防拖延與優柔。",
    "震三宮": "啟動、衝刺、爭論與行動，利開工執行，也要防急躁衝突。",
    "巽四宮": "交流、奔波、業務與號召，利銷售連結，也要防反覆不定。",
    "乾六宮": "管理、規則、權威與創造，利領導決策，也要防固執壓力。",
    "兌七宮": "口才、交易、人情與口舌，利溝通表達，也要防是非。",
    "艮八宮": "沉著、儲蓄、停止與守成，利長期累積，也要防停滯。",
    "離九宮": "曝光、形象、學習與熱度，利名聲展示，也要防焦躁虛火。",
  };
  const godMeaning = {
    "值符": "貴人、品質、領導與正向平台。",
    "螣蛇": "變動、糾纏、幻想與口舌，事情要講清楚。",
    "太陰": "暗中籌畫、細膩、謀略與內在資源。",
    "六合": "人緣、合作、婚姻、談判與媒合。",
    "白虎": "壓力、傷災、強勢與硬碰硬，需控風險。",
    "玄武": "資訊差、投機、曖昧與詐騙風險。",
    "九地": "保守、穩守、低調與長期累積。",
    "九天": "外放、遠行、放大、金融與高處發展。",
    "假符": "神助不足，容易臨門一腳落空，要靠紀律補足。",
  };
  const starMeaning = {
    "天蓬星": "膽識、冒險、流動與破財風險。",
    "天芮星": "問題、細節、學習與健康負擔。",
    "天沖星": "速度、執行、衝動與直接。",
    "天輔星": "文化、教育、技術、顧問與輔助。",
    "天禽星": "整合、顧全大局、穩重與中正。",
    "天心星": "管理、醫藥、策略、財務與系統能力。",
    "天柱星": "表達、辯才、破壞力與獨立性。",
    "天任星": "責任、土地、誠信、儲蓄與守財。",
    "天英星": "名聲、美感、曝光、才華與焦躁。",
    "假蓬星": "冒險與表現欲強，容易虎頭蛇尾。",
  };
  const doorMeaning = {
    "休門": "休息、人情、自由與享受，利溝通緩和。",
    "死門": "卡住、固執、結束與難題，目標推動慢。",
    "傷門": "速度、競爭、車馬與碰撞，行動快但易受傷。",
    "杜門": "技術、保密、研究與阻塞，利專業不利公開。",
    "開門": "開創、交易、領導與收款，入口打開也要控支出。",
    "驚門": "口舌、演講、法律與驚疑，利表達但防是非。",
    "生門": "財利、資源、房產與成長，是資金累積好門。",
    "景門": "曝光、名聲、才氣與桃花，利展示但防虛火。",
    "假休門": "表面像休門，實際助力較弱，容易空轉。",
  };

  function yearBranch(year) {
    return branches[(Number(year) - 4) % 12];
  }

  function numberPalace(digit, gender) {
    const raw = mapping[digit];
    if (raw.palace) return raw.palace;
    return gender === "女" || gender === "female" ? raw.palace_female : raw.palace_male;
  }

  function digitsFromInput(value) {
    return [...String(value || "")].filter((ch) => /\d/.test(ch));
  }

  function plateDigits(value) {
    const conversion = [];
    const digits = [];
    for (const raw of String(value || "").toUpperCase()) {
      if (/\d/.test(raw)) {
        conversion.push({ token: raw, digit: raw, note: "數字照用" });
        digits.push(raw);
      } else if (/[A-Z]/.test(raw)) {
        const n = raw.charCodeAt(0) - 64;
        const digit = String(((n - 1) % 9) + 1);
        conversion.push({ token: raw, digit, note: `A=1 到 Z=26，${n} 取數根` });
        digits.push(digit);
      }
    }
    return { digits, conversion };
  }

  function countBy(items, key) {
    const out = {};
    for (const item of items) out[item[key]] = (out[item[key]] || 0) + 1;
    return out;
  }

  function top(counter) {
    return Object.entries(counter).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${k}x${v}`).join("、") || "無";
  }

  function chartFromWindow(window, gender, palaceName, chartType) {
    return {
      chart_type: chartType,
      digits: window.join(""),
      palace: numberPalace(window[0], gender),
      palace_name: palaceName,
      lead_stem: mapping[window[1]].lead_stem,
      god: mapping[window[2]].god,
      star: mapping[window[3]].star,
      door: mapping[window[4]].door,
      heaven_stem: mapping[window[5]].heaven_stem,
      earth_stem: mapping[window[6]].earth_stem,
    };
  }

  function reduceToNine(total) {
    if (!total) return "0";
    return String(((total - 1) % 9) + 1);
  }

  function stemRelation(heavenStem, earthStem) {
    const heaven = stemElements[heavenStem];
    const earth = stemElements[earthStem];
    if (!heaven || !earth) return "天盤地盤五行不明，先看門星神吉凶。";
    if (heaven === earth) return `天盤${heavenStem}${heaven}、地盤${earthStem}${earth}比和：人車狀態同氣，穩定但容易照原習慣走。`;
    if (generates.has(`${heaven}${earth}`)) return `天盤${heavenStem}${heaven}生地盤${earthStem}${earth}：外在行動能扶住車況與結果，行車較順。`;
    if (generates.has(`${earth}${heaven}`)) return `地盤${earthStem}${earth}生天盤${heavenStem}${heaven}：車況或環境支援人，但也會消耗保養、油錢或時間。`;
    if (controls.has(`${heaven}${earth}`)) return `天盤${heavenStem}${heaven}剋地盤${earthStem}${earth}：人容易壓車，開快、急切或使用強度高時要小心。`;
    if (controls.has(`${earth}${heaven}`)) return `地盤${earthStem}${earth}剋天盤${heavenStem}${heaven}：車況、路況或規則容易反過來卡人，要重保養與守規矩。`;
    return `天盤${heavenStem}${heaven}、地盤${earthStem}${earth}關係普通，回到門星神判斷。`;
  }

  function chartFromPlateSix(window, gender, palace, palaceName, chartType) {
    return {
      chart_type: chartType,
      digits: window.join(""),
      palace,
      palace_name: palaceName,
      lead_stem: mapping[window[1]].lead_stem,
      god: mapping[window[2]].god,
      star: mapping[window[3]].star,
      door: mapping[window[4]].door,
      heaven_stem: mapping[window[0]].heaven_stem,
      earth_stem: mapping[window[5]].earth_stem,
    };
  }

  function digitItem(digit, index, gender) {
    const raw = mapping[digit];
    const palace = numberPalace(digit, gender);
    return {
      position: index + 1,
      digit,
      palace,
      palace_name: palaceNames[palace],
      direction: palaceDirections[palace],
      lead_stem: raw.lead_stem,
      god: raw.god,
      star: raw.star,
      door: raw.door,
      heaven_stem: raw.heaven_stem,
      earth_stem: raw.earth_stem,
    };
  }

  function analysisWindow(digits) {
    if (digits.length >= 7) {
      return {
        window: digits.slice(-7),
        mode: digits.length === 7 ? "七碼全取" : `共${digits.length}碼，取尾七碼`,
      };
    }
    throw new Error("至少需要七位數字才能穿號分析");
  }

  function analyzeDigits(digits, gender, flowYear) {
    const year = Number(flowYear) || new Date().getFullYear();
    const flowBranch = yearBranch(year);
    const flowPalace = branchPalace[flowBranch];
    const selected = analysisWindow(digits);
    const window = selected.window;
    const items = digits.map((digit, index) => digitItem(digit, index, gender));
    const windowItems = window.map((digit, index) => digitItem(digit, index, gender));
    const counters = {
      palace: countBy(windowItems, "palace_name"),
      door: countBy(windowItems, "door"),
      star: countBy(windowItems, "star"),
      god: countBy(windowItems, "god"),
    };
    const wealth = (counters.door["生門"] || 0) + (counters.door["開門"] || 0) + (counters.star["天心星"] || 0) + (counters.star["天任星"] || 0);
    const risk = (counters.door["死門"] || 0) + (counters.door["傷門"] || 0) + (counters.door["驚門"] || 0) + (counters.god["白虎"] || 0) + (counters.god["玄武"] || 0) + (counters.god["螣蛇"] || 0);
    const relationship = (counters.god["六合"] || 0) + (counters.door["休門"] || 0) + (counters.door["景門"] || 0);
    return {
      digits,
      window,
      window_items: windowItems,
      flow_year: year,
      flow_branch: flowBranch,
      flow_palace: flowPalace,
      window_mode: selected.mode,
      charts: [
        chartFromWindow(window, gender, palaceNames[numberPalace(window[0], gender)], "原宮"),
        chartFromWindow(window, gender, palaceNames[flowPalace], "流年宮"),
      ],
      counters,
      scores: { wealth, risk, relationship },
      items,
    };
  }

  function analyzePlateDigits(digits, gender, flowYear) {
    if (digits.length < 6) throw new Error("車牌轉碼後至少需要六碼；請輸入完整車牌，例如 ABC-123 或 ABC-1234");
    const year = Number(flowYear) || new Date().getFullYear();
    const flowBranch = yearBranch(year);
    const flowPalace = branchPalace[flowBranch];
    const window = digits.slice(-6);
    const total = window.reduce((sum, digit) => sum + Number(digit), 0);
    const mainDigit = reduceToNine(total);
    const mainPalace = numberPalace(mainDigit, gender);
    const items = digits.map((digit, index) => digitItem(digit, index, gender));
    const windowItems = window.map((digit, index) => digitItem(digit, index, gender));
    const counters = {
      palace: countBy(windowItems, "palace_name"),
      door: countBy(windowItems, "door"),
      star: countBy(windowItems, "star"),
      god: countBy(windowItems, "god"),
    };
    const wealth = (counters.door["生門"] || 0) + (counters.door["開門"] || 0) + (counters.star["天心星"] || 0) + (counters.star["天任星"] || 0);
    const risk = (counters.door["死門"] || 0) + (counters.door["傷門"] || 0) + (counters.door["驚門"] || 0) + (counters.god["白虎"] || 0) + (counters.god["玄武"] || 0) + (counters.god["螣蛇"] || 0);
    const relationship = (counters.god["六合"] || 0) + (counters.door["休門"] || 0) + (counters.door["景門"] || 0);
    return {
      digits,
      window,
      window_items: windowItems,
      flow_year: year,
      flow_branch: flowBranch,
      flow_palace: flowPalace,
      total_sum: total,
      main_digit: mainDigit,
      main_palace: mainPalace,
      window_mode: digits.length === 6 ? "六碼全取" : `共${digits.length}碼，取末六碼`,
      charts: [
        chartFromPlateSix(window, gender, mainPalace, palaceNames[mainPalace], "主事宮"),
        chartFromPlateSix(window, gender, flowPalace, palaceNames[flowPalace], "流年宮"),
      ],
      counters,
      scores: { wealth, risk, relationship },
      items,
    };
  }

  function subjectAdvice(result, subject) {
    const lines = [];
    const { scores, counters } = result;
    if (subject === "銀行帳戶") {
      if (scores.wealth >= scores.risk + 2) lines.push("財務訊號較強，可作為收入、收款、長期儲蓄或投資紀律帳戶。");
      else if (scores.risk >= scores.wealth + 2) lines.push("風險訊號偏高，不建議放大資金部位，適合小額、分帳、控管用途。");
      else lines.push("財務與風險訊號接近，帳戶可用，但要靠預算規則與自動化分帳穩住。");
      if (counters.god["玄武"] || counters.god["螣蛇"]) lines.push("注意詐騙、盜刷、帳務模糊、投資話術與密碼安全。");
    } else if (subject === "車牌") {
      if (scores.risk >= scores.wealth + 2) lines.push("風險訊號偏高，開車要守規則，注意保險、保養、停車與碰撞風險。");
      else if (scores.wealth >= scores.risk + 2) lines.push("資源訊號較強，適合業務、通勤、跑客戶或工具車用途。");
      else lines.push("車牌訊號不算極端，重點看車況、駕駛習慣與用途。");
    } else {
      if (counters.door["生門"] || counters.door["開門"]) lines.push("有生門/開門，利工作聯絡、業務、資源流動與投資研究。");
      if (counters.door["死門"] || counters.god["白虎"]) lines.push("死門或白虎偏多時，重大交易與衝動決策要多一道確認。");
      if (counters.god["玄武"] || counters.god["螣蛇"]) lines.push("玄武/螣蛇偏多，合約、金流、曖昧訊息與資訊差要寫清楚。");
    }
    if (!lines.length) lines.push("組合中性，重點看用途，不要只因單一吉象就放大決策。");
    return lines;
  }

  function lines(result, subject, metaLines = []) {
    const source = result.charts[0];
    const flow = result.charts[1];
    const roleNames = ["宮位", "引干", "神", "星", "門", "天干", "地干"];
    const out = [
      `${subject}奇門分析：`,
      "規則：七位穿號，依序取「宮位、引干、神、星、門、天干、地干」。0 與 5 不入中宮，男寄坤二、女寄艮八。",
      ...metaLines,
      `本次用碼：${result.window.join("")}｜取碼方式：${result.window_mode}｜流年：${result.flow_year}年${result.flow_branch}，落${palaceNames[result.flow_palace]}`,
      `財務/資源訊號：${result.scores.wealth}｜風險訊號：${result.scores.risk}｜人緣/互動訊號：${result.scores.relationship}`,
      `最多宮位：${top(result.counters.palace)}`,
      `最多八門：${top(result.counters.door)}`,
      `最多九星：${top(result.counters.star)}`,
      `最多八神：${top(result.counters.god)}`,
      "",
      "穿號盤：",
      `- ${source.chart_type} ${source.palace_name}：引干${source.lead_stem}｜${source.god}｜${source.star}｜${source.door}｜天干${source.heaven_stem}｜地干${source.earth_stem}`,
      `- ${flow.chart_type} ${flow.palace_name}：引干${flow.lead_stem}｜${flow.god}｜${flow.star}｜${flow.door}｜天干${flow.heaven_stem}｜地干${flow.earth_stem}`,
      "",
      `${subject}盤詳細解說：`,
      `- 原宮：${source.palace_name}。${palaceMeaning[source.palace_name] || ""}`,
      `- 流年宮：${flow.palace_name}。${result.flow_year} 年容易放大此宮的人事物主題。`,
      `- 八神：${source.god}。${godMeaning[source.god] || ""}`,
      `- 九星：${source.star}。${starMeaning[source.star] || ""}`,
      `- 八門：${source.door}。${doorMeaning[source.door] || ""}`,
      `- 天干/地干：天干${source.heaven_stem}、地干${source.earth_stem}，看外顯行動與底層狀態是否一致。`,
      "",
      `${subject}建議：`,
      ...subjectAdvice(result, subject).map((line) => `- ${line}`),
      "",
      "逐位對照：",
      ...result.window_items.map((item, idx) => `${String(idx + 1).padStart(2, "0")}. ${item.digit}(${roleNames[idx]}) -> ${item.palace_name} ${item.lead_stem} ${item.god} ${item.star} ${item.door} 天干${item.heaven_stem} 地干${item.earth_stem}`),
    ];
    return out.join("\n");
  }

  function plateLines(result, metaLines = []) {
    const source = result.charts[0];
    const flow = result.charts[1];
    const first = result.window_items[0];
    const tail = result.window_items[result.window_items.length - 1];
    const roleNames = ["首碼/方向", "引干", "八神", "九星", "八門", "尾碼/結果"];
    const out = [
      "車牌奇門分析：",
      "規則：車牌採六碼法；英文字母 A=1 到 Z=26 後取 1-9 數根，數字照原數字；超過六碼取末六碼。",
      "主事宮：末六碼總和取 1-9 定宮；首碼看能量與方向，尾碼看結果與收穫。",
      ...metaLines,
      `末六碼：${result.window.join("")}｜取碼方式：${result.window_mode}｜總和：${result.total_sum}｜主事數：${result.main_digit}｜主事宮：${palaceNames[result.main_palace]}`,
      `首碼：${first.digit}，落${first.palace_name}，主車牌起勢與行車方向；尾碼：${tail.digit}，落${tail.palace_name}，主最後結果與收穫。`,
      `天盤地盤：${stemRelation(source.heaven_stem, source.earth_stem)}`,
      `財務/資源訊號：${result.scores.wealth}｜風險訊號：${result.scores.risk}｜人緣/舒適訊號：${result.scores.relationship}`,
      `最多宮位：${top(result.counters.palace)}`,
      `最多八門：${top(result.counters.door)}`,
      `最多九星：${top(result.counters.star)}`,
      `最多八神：${top(result.counters.god)}`,
      "",
      "車牌穿號盤：",
      `- ${source.chart_type} ${source.palace_name}：引干${source.lead_stem}｜${source.god}｜${source.star}｜${source.door}｜天干${source.heaven_stem}｜地干${source.earth_stem}`,
      `- ${flow.chart_type} ${flow.palace_name}：引干${flow.lead_stem}｜${flow.god}｜${flow.star}｜${flow.door}｜天干${flow.heaven_stem}｜地干${flow.earth_stem}`,
      "",
      "車牌盤詳細解說：",
      `- 主事宮：${source.palace_name}。${palaceMeaning[source.palace_name] || ""}`,
      `- 流年宮：${flow.palace_name}。${result.flow_year} 年容易放大此宮的人事物主題。`,
      `- 八神：${source.god}。${godMeaning[source.god] || ""}`,
      `- 九星：${source.star}。${starMeaning[source.star] || ""}`,
      `- 八門：${source.door}。${doorMeaning[source.door] || ""}`,
      "",
      "車牌使用建議：",
      ...subjectAdvice(result, "車牌").map((line) => `- ${line}`),
      "",
      "六碼對照：",
      ...result.window_items.map((item, idx) => `${String(idx + 1).padStart(2, "0")}. ${item.digit}(${roleNames[idx]}) -> ${item.palace_name} ${item.lead_stem} ${item.god} ${item.star} ${item.door} 天干${item.heaven_stem} 地干${item.earth_stem}`),
    ];
    return out.join("\n");
  }

  function analyzePhone(value, gender, flowYear) {
    const digits = digitsFromInput(value);
    const result = analyzeDigits(digits, gender, flowYear);
    result.subject = "手機號碼";
    result.analysis = lines(result, "手機號碼", [`輸入位數：${digits.length}`]);
    return result;
  }

  function analyzeBank(value, gender, flowYear) {
    const digits = digitsFromInput(value);
    const result = analyzeDigits(digits, gender, flowYear);
    result.subject = "銀行帳戶";
    result.analysis = lines(result, "銀行帳戶", [`輸入位數：${digits.length}`, "帳戶分析重點看資金流動、守財能力、風險控管與是否適合作為主要收款/投資帳戶。"]);
    return result;
  }

  function analyzePlate(value, gender, flowYear) {
    const converted = plateDigits(value);
    const result = analyzePlateDigits(converted.digits, gender, flowYear);
    result.subject = "車牌";
    result.conversion = converted.conversion;
    result.convertedNumber = converted.digits.join("");
    const conversionText = converted.conversion.map((item) => `${item.token}→${item.digit}`).join("、");
    result.analysis = plateLines(result, [
      "英文字母用 A=1 到 Z=26 後取 1-9 數根；數字照原數字。",
      "車牌支援六碼以上：六碼全取；超過六碼取末六碼，不再前補0。",
      `轉碼後位數：${converted.digits.length}｜分析用碼：${result.window.join("")}｜${result.window_mode}`,
      `轉碼：${conversionText}`,
    ]);
    return result;
  }

  window.QimenNumber = { analyzePhone, analyzeBank, analyzePlate };
})();
