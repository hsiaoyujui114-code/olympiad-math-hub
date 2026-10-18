// 奧林匹亞競賽與年級設定資料庫
window.OlympiadMeta = {
  // 年齡 / 年級設定
  grades: [
    {
      id: 1,
      name: "國小一年級 (7歲)",
      short: "一年級",
      category: "國小低年級",
      ageRange: "6-7 歲",
      icon: "🌱",
      color: "from-emerald-400 to-teal-500",
      description: "數感啟蒙、實物對應、圖形認知與觀察力訓練",
      defaultStyle: "intuitive",
      recommendedStyles: ["intuitive", "standard"]
    },
    {
      id: 2,
      name: "國小二年級 (8歲)",
      short: "二年級",
      category: "國小低年級",
      ageRange: "7-8 歲",
      icon: "🎈",
      color: "from-teal-400 to-cyan-500",
      description: "乘法概念、排隊問題、簡單規律與天平概念",
      defaultStyle: "intuitive",
      recommendedStyles: ["intuitive", "standard"]
    },
    {
      id: 3,
      name: "國小三年級 (9歲)",
      short: "三年級",
      category: "國小中年級",
      ageRange: "8-9 歲",
      icon: "🔍",
      color: "from-blue-400 to-indigo-500",
      description: "巧算速算、和差倍問題、方陣與周長面積探索",
      defaultStyle: "standard",
      recommendedStyles: ["intuitive", "standard", "olympiad"]
    },
    {
      id: 4,
      name: "國小四年級 (10歲)",
      short: "四年級",
      category: "國小中年級",
      ageRange: "9-10 歲",
      icon: "🧩",
      color: "from-indigo-400 to-violet-500",
      description: "逆推法、雞兔同籠、邏輯推理與週期數列應用",
      defaultStyle: "standard",
      recommendedStyles: ["intuitive", "standard", "olympiad"]
    },
    {
      id: 5,
      name: "國小五年級 (11歲)",
      short: "五年級",
      category: "國小高年級",
      ageRange: "10-11 歲",
      icon: "🚀",
      color: "from-purple-400 to-fuchsia-500",
      description: "因數倍數、質數合數、等積變形、牛吃草初探",
      defaultStyle: "olympiad",
      recommendedStyles: ["standard", "olympiad", "rigorous"]
    },
    {
      id: 6,
      name: "國小六年級 (12歲)",
      short: "六年級 (奧數巔峰)",
      category: "國小高年級",
      ageRange: "11-12 歲",
      icon: "🏆",
      featured: true,
      color: "from-amber-400 via-orange-500 to-red-500",
      description: "奧數集大成！行程流水、數論同餘、工程幾何與抽屜原理（提供完整 10 年歷屆試題）",
      defaultStyle: "olympiad",
      recommendedStyles: ["intuitive", "standard", "olympiad", "rigorous"]
    },
    {
      id: 7,
      name: "國中七年級 (13歲)",
      short: "國一 (七年級)",
      category: "國中組",
      ageRange: "12-13 歲",
      icon: "📐",
      color: "from-cyan-500 to-blue-600",
      description: "一元一次方程、整數性質、坐標幾何、代數式化簡",
      defaultStyle: "standard",
      recommendedStyles: ["standard", "olympiad", "rigorous"]
    },
    {
      id: 8,
      name: "國中八年級 (14歲)",
      short: "國二 (八年級)",
      category: "國中組",
      ageRange: "13-14 歲",
      icon: "⚡",
      color: "from-blue-600 to-indigo-700",
      description: "乘法公式、畢氏定理、等差級數、幾何全等變換",
      defaultStyle: "olympiad",
      recommendedStyles: ["standard", "olympiad", "rigorous"]
    },
    {
      id: 9,
      name: "國中九年級 (15歲)",
      short: "國三 (九年級)",
      category: "國中組",
      ageRange: "14-15 歲",
      icon: "🔥",
      color: "from-violet-600 to-purple-800",
      description: "相似形、圓冪定理、二次函數極值、組合計數",
      defaultStyle: "rigorous",
      recommendedStyles: ["olympiad", "rigorous"]
    },
    {
      id: 10,
      name: "高中組 (16-18歲)",
      short: "高中奧賽專項",
      category: "高中組",
      ageRange: "16-18 歲",
      icon: "👑",
      color: "from-rose-500 to-red-700",
      description: "柯西算幾不等式、二項式定理、同餘論、圖論與極端構造",
      defaultStyle: "rigorous",
      recommendedStyles: ["olympiad", "rigorous"]
    }
  ],

  // 賽事種類
  competitions: [
    {
      id: "olympiad",
      name: "奧林匹亞數學競賽 - 初賽",
      short: "奧林匹亞初賽",
      tag: "全國最具權威",
      badge: "經典推薦",
      icon: "🏆",
      description: "強調思維靈活性、突破常規的解題巧思與跨模組綜合數學能力。歷屆試題是各資優班與代表隊的必經之路。",
      years: [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017]
    },
    {
      id: "apmops",
      name: "亞太國小數學奧林匹亞 (APMOPS)",
      short: "APMOPS 亞太奧數",
      tag: "國際頂尖盃賽",
      badge: "新加坡萊佛士主辦",
      icon: "🌏",
      description: "題目短小精悍，強調在有限時間內的迅速洞察與高階心算、數論與排列巧解。",
      years: [2026, 2025, 2024, 2023, 2022]
    },
    {
      id: "wmi",
      name: "世界數學邀請賽 (WMI)",
      short: "WMI 世界邀請賽",
      tag: "跨國思維考驗",
      badge: "全球連鎖競賽",
      icon: "🌐",
      description: "注重生活應用、跨學科整合以及新穎的邏輯博弈建模題型。",
      years: [2026, 2025, 2024, 2023, 2022]
    },
    {
      id: "amc",
      name: "美國數學競賽 (AMC 8 / 10)",
      short: "AMC 美國競賽",
      tag: "常春藤名校認可",
      badge: "國際升學指標",
      icon: "🇺🇸",
      description: "由美國數學協會 (MAA) 舉辦，重邏輯推理、圖形空間想像與快速排錯能力。",
      years: [2026, 2025, 2024, 2023, 2022]
    }
  ],

  // 四大不同層級之講解風格定義
  explanationStyles: {
    intuitive: {
      id: "intuitive",
      name: "🧒 初階圖解與啟蒙版",
      subtitle: "直觀生活比喻 • 免代數公式 • 看圖秒懂",
      badge: "適合低年級 / 初學者",
      color: "bg-emerald-50 border-emerald-200 text-emerald-800",
      accent: "emerald",
      icon: "🎨",
      philosophy: "完全不使用令人生畏的未知數 x 或繁雜公式。用「分糖果」、「排排站」、「切披薩」、「天平秤重」等具體具象模型，培養純粹直觀數感。"
    },
    standard: {
      id: "standard",
      name: "📐 標準算術與方程版",
      subtitle: "學校規範步驟 • 循序代數 • 邏輯條理分明",
      badge: "學校標準教材 / 扎實基本功",
      color: "bg-blue-50 border-blue-200 text-blue-800",
      accent: "blue",
      icon: "📝",
      philosophy: "嚴格遵守學校課本教學步驟，設未知數 x、列出清晰的一元或二元一次方程、標記比例因果，寫出完整考卷可獲滿分的標準解答。"
    },
    olympiad: {
      id: "olympiad",
      name: "⚡ 奧數極速秒殺技",
      subtitle: "競賽特化思維 • 奇偶同餘 • 極值特值秒破",
      badge: "奧賽高分秘訣 / 選手思維",
      color: "bg-amber-50 border-amber-200 text-amber-800",
      accent: "amber",
      icon: "⚡",
      philosophy: "競賽選手的特戰思維！利用「奇偶校驗」、「模運算餘數特徵」、「極端邊界法」、「打包整體化」等巧思，避開冗長計算，30 秒內直擊破綻。"
    },
    rigorous: {
      id: "rigorous",
      name: "🔬 大學與高階數理證明",
      subtitle: "公理化架構 • 抽屜原理 • 嚴謹反證與泛化",
      badge: "資優探究 / 數學本質",
      color: "bg-purple-50 border-purple-200 text-purple-800",
      accent: "purple",
      icon: "🔬",
      philosophy: "以近世代數與集合論的高觀點俯瞰問題。運用狄利克雷抽屜原理、不變量原理、數學歸納法，將具體數字推廣為泛化公式 (Generalization)。"
    }
  }
};
