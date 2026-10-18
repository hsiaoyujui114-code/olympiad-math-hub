# 🏆 奧林匹亞數學初賽歷屆試題與多維解析互動平台
> **Math Olympiad Preliminary Exam Trainer & Multi-Perspective Pedagogical Platform**  
> 純前端靜態架構（Static HTML5/JS/KaTeX）• 支援 GitHub Pages 一鍵發布 • 完整 10 年歷屆試題真題庫

---

## 🌟 核心特色 (Core Features)

1. **依年齡與年級客製化解題思路 (Age-Adaptive Explanation Engine)**
   - **國小低年級（7-8歲）**：採用生活比喻、實物天平、圖象化直觀推導，完全不使用令孩子畏懼的未知數 $x$。
   - **國小中年級（9-10歲）**：規律發掘、表格枚舉、方塊線段圖、逆推與和差倍基本功。
   - **國小高年級（11-12歲，奧數巔峰）**：經典奧數題型（牛吃草、水流行程、梯形蝴蝶定理、因倍數分解、數列裂項、抽屜原理）。
   - **國中組（13-15歲）**：一元二次方程式、乘法公式、相似形、同餘論。
   - **高中組（16-18歲）**：柯西不等式、算幾不等式、二項式定理、極端構造法。

2. **四大思維鏡頭即時切換 (Multi-Perspective Explanation Lenses)**
   任何一道題目，學生與家長皆可在右上角或解析卡片中一鍵切換四大講解維度：
   - 🧒 **初階圖解與啟蒙版**：不用代數公式，以故事化情境與生活常識引導思考。
   - 📐 **標準算術與方程版**：學校正規課堂標準步驟，設未知數、條理分明。
   - ⚡ **奧數極速秒殺技**：競賽特化思維，利用奇偶校驗、同餘餘數、極端值、十字交叉法 30 秒破題。
   - 🔬 **大學與高階數理證明**：以群論、同態映射、狄利克雷抽屜原理、微積分極限的高觀點進行公理化泛化論證。

3. **10 年完整歷屆真題庫 (10 Full Years of Olympiad Exams)**
   - 收錄從 **2017 年至 2026 年（今年最新）** 完整 10 年的奧林匹亞初賽試題。
   - 涵蓋數論、幾何、行程、組合、邏輯、應用、數列七大模組。

4. **遊戲化互動與沉浸式學習工具 (Gamified Interactive Experience)**
   - 💡 **AI 思考逐步導引**：答不出來時，可循序漸進解鎖「提示一」、「提示二」，不直接剝奪思考樂趣。
   - 📝 **全功能幾何與算式草稿計算紙 (Interactive Scratchpad)**：內建 Canvas 手寫計算板，支援滑鼠塗鴉、平板觸控筆書寫、橡皮擦與調色盤。
   - 🔊 **原生 Web Audio API 音效合成器**：清脆答對音效、連勝 Combo 提示，無須外部音訊檔案，100% 離線可用。
   - 🎉 **過關彩帶粒子特效**：激勵學習成就感。
   - 📊 **本機記憶與進度儲存**：自動利用瀏覽器 `localStorage` 記錄歷史作答、連勝記錄、收藏題本。

---

## 🚀 專案結構 (Project Structure)

```text
olympiad-math-hub/
├── index.html              # 應用程式主進入點 (純靜態 HTML，支援雙擊直接開啟)
├── css/
│   └── styles.css          # 自訂樣式、玻璃擬態質感、KaTeX 數學公式優化排版
├── js/
│   ├── app.js              # 核心控制器 (狀態管理、年級切換、評分判定)
│   ├── sound.js            # 原生 Web Audio API 音效引擎 (免外部音頻資源)
│   ├── scratchpad.js       # 互動手繪計算草稿畫布
│   └── data/
│       ├── competitions.js # 年級與賽事中繼資料庫
│       ├── questions-g6.js # 國小六年級 2017~2026 完整 10 年真題庫與四維詳解
│       └── questions-other.js # 其他年級 (低年級、中年級、國中、高中) 真題庫
└── README.md               # 專案詳細說明與部屬指南
```

---

## 💻 本地執行方式 (How to Run Locally)

本專案為 **100% 純靜態前端應用**，無需安裝 Node.js、Python 或任何後端伺服器：

1. **直接開啟**：
   滑鼠雙擊資料夾內的 `index.html` 即可在任一瀏覽器（Chrome, Safari, Edge, Firefox）中直接使用！

2. **開發預覽 (選擇性)**：
   若偏好使用本地伺服器，可在資料夾內執行：
   ```bash
   npx serve .
   # 或
   python3 -m http.server 8080
   ```

---

## 🌐 GitHub Pages 部署指南 (GitHub Pages Deployment)

1. 將本專案推送至 GitHub Repository。
2. 前往儲存庫的 **Settings** -> **Pages**。
3. 在 **Build and deployment** 下方的 **Branch** 選擇 `main`，資料夾選擇 `/ (root)`。
4. 點擊 **Save**，約 1~2 分鐘後即可透過 GitHub 提供之公開網址直接暢玩！
