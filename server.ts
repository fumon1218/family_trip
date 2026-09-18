import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Weather API endpoint for Osaka (Real-time data from Open-Meteo with 10-minute cache)
let weatherCache: { data: any; timestamp: number } | null = null;

function mapWmoToCondition(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: "맑음", icon: "sun" };
  if (code === 1 || code === 2) return { condition: "대체로 맑음", icon: "cloud-sun" };
  if (code === 3) return { condition: "구름 많음 / 흐림", icon: "cloud" };
  if (code === 45 || code === 48) return { condition: "안개", icon: "cloud" };
  if ([51, 53, 55, 56, 57].includes(code)) return { condition: "이슬비", icon: "cloud-rain" };
  if ([61, 63, 65].includes(code)) return { condition: "비 (우천)", icon: "umbrella" };
  if ([71, 73, 75, 77].includes(code)) return { condition: "눈", icon: "cloud-snow" };
  if ([80, 81, 82].includes(code)) return { condition: "소나기", icon: "cloud-rain" };
  if ([95, 96, 99].includes(code)) return { condition: "뇌우", icon: "cloud-lightning" };
  return { condition: "흐림", icon: "cloud" };
}

app.get("/api/weather", async (_req, res) => {
  const now = Date.now();
  // 10-minute cache
  if (weatherCache && now - weatherCache.timestamp < 10 * 60 * 1000) {
    return res.json(weatherCache.data);
  }

  try {
    const apiUrl =
      "https://api.open-meteo.com/v1/forecast?latitude=34.6937&longitude=135.5023&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTokyo";
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Open-Meteo API returned status ${response.status}`);
    }

    const apiData = await response.json();
    const current = apiData.current || {};
    const daily = apiData.daily || {};

    const temp = Math.round(current.temperature_2m ?? 24);
    const wCode = current.weather_code ?? 0;
    const { condition, icon } = mapWmoToCondition(wCode);
    const humidity = Math.round(current.relative_humidity_2m ?? 50);
    const windKmH = Math.round(current.wind_speed_10m ?? 10);
    const precipProb = (daily.precipitation_probability_max && daily.precipitation_probability_max[0]) ?? 10;

    // Smart clothing & rain advice based on real-time temperature
    let clothingTip = "";
    if (temp >= 26) {
      clothingTip = "현재 오사카는 다소 덥습니다. 반팔 또는 통기성 좋은 셔츠, 자외선 차단용 모자/선글라스를 착용하세요.";
    } else if (temp >= 20) {
      clothingTip = "쾌적한 여행 날씨입니다. 낮에는 가벼운 옷차림, 아침·저녁 및 USJ 바닷바람 대비 얇은 겉옷을 챙기세요.";
    } else if (temp >= 14) {
      clothingTip = "선선합니다. 가디건이나 자켓, 걷기 편한 운동화를 착용하세요. 도톤보리 야경 관람 시 겉옷 필수!";
    } else {
      clothingTip = "쌀쌀합니다. 보온용 경량 패딩이나 코트, 핫팩을 준비하여 감기에 유의하세요.";
    }

    if (precipProb >= 50 || [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(wCode)) {
      clothingTip += " [비 예보 주의] 우산이나 가벼운 우비를 가방에 준비하세요.";
    }

    const forecast = [];
    const dayLabels = ["1일차 (도착 & 도톤보리)", "2일차 (USJ 종일)", "3일차 (오사카성 & 출국)"];
    for (let i = 0; i < 3; i++) {
      const dCode = daily.weather_code?.[i] ?? 0;
      const dCond = mapWmoToCondition(dCode);
      const dMax = Math.round(daily.temperature_2m_max?.[i] ?? temp + 2);
      const dMin = Math.round(daily.temperature_2m_min?.[i] ?? temp - 5);
      const dRain = daily.precipitation_probability_max?.[i] ?? 10;

      let tip = "";
      if (i === 0) {
        tip = dRain >= 50
          ? "비 예보가 있습니다. 지붕 아케이드가 완비된 구로몬 시장과 신사이바시스지 위주로 이동하세요."
          : "구로몬 시장은 아케이드 실내라 이동이 편합니다. 저녁 도톤보리 글리코상 야경 촬영 추천!";
      } else if (i === 1) {
        tip = dRain >= 50
          ? "USJ에 비 예보가 있습니다! 판초 우비를 챙기시고 실내 라이드(해리포터, 마리오카트) 위주로 공략하세요."
          : "USJ 베이 에리어는 바닷바람으로 체감온도가 낮을 수 있습니다. 가벼운 외투를 지참하세요.";
      } else {
        tip = dRain >= 50
          ? "오사카성 야외 보행 시 비 예보 주의! 맞은편 오사카 역사박물관(실내) 및 우메다 백화점으로 대체 권장."
          : "오사카성 천수각 관람 후 우메다 다이마루 백화점 13층 실내 쇼핑과 연결하세요.";
      }

      forecast.push({
        day: dayLabels[i],
        tempMin: dMin,
        tempMax: dMax,
        condition: dCond.condition,
        icon: dCond.icon,
        rainProb: `${dRain}%`,
        rainProbNumber: dRain,
        tip,
      });
    }

    const resultData = {
      city: "Osaka, Japan (大阪 실시간 관측)",
      isLive: true,
      lastUpdated: new Date().toLocaleTimeString("ko-KR", { timeZone: "Asia/Tokyo" }),
      current: {
        temp,
        apparentTemp: Math.round(current.apparent_temperature ?? temp),
        condition,
        icon,
        humidity,
        windKmH,
        precipitationChance: precipProb,
        clothingTip,
      },
      forecast,
    };

    weatherCache = { data: resultData, timestamp: now };
    res.json(resultData);
  } catch (error) {
    console.error("Open-Meteo fetch failed, using fallback:", error);
    // Safe seasonal fallback
    res.json({
      city: "Osaka, Japan (大阪)",
      isLive: false,
      current: {
        temp: 22,
        condition: "대체로 맑음",
        icon: "cloud-sun",
        humidity: 55,
        windKmH: 10,
        precipitationChance: 15,
        clothingTip: "낮에는 쾌적하고 아침·저녁에는 선선합니다. 얇은 외투를 지참하세요.",
      },
      forecast: [
        { day: "1일차 (도착 & 도톤보리)", tempMin: 18, tempMax: 26, condition: "대체로 맑음", icon: "cloud-sun", rainProb: "15%", rainProbNumber: 15, tip: "구로몬 시장 및 도톤보리 야경 관광하기 좋습니다." },
        { day: "2일차 (USJ 종일)", tempMin: 17, tempMax: 25, condition: "맑음", icon: "sun", rainProb: "10%", rainProbNumber: 10, tip: "USJ 방문하기 좋은 날씨입니다. 바닷바람용 겉옷 준비." },
        { day: "3일차 (오사카성 & 출국)", tempMin: 18, tempMax: 27, condition: "구름 조금", icon: "cloud-sun", rainProb: "20%", rainProbNumber: 20, tip: "오사카성 공원 산책 후 우메다 쇼핑에 적합합니다." },
      ],
    });
  }
});

// 외교부 해외안전여행 - 국가·지역별 여행경보 프록시 (data.go.kr, 키가 있어야 동작)
// Base URL은 확인됨: https://apis.data.go.kr/1262000/CountryHistoryService2
// 오퍼레이션명은 미확인 상태 - .env의 MOFA_TRAVEL_ALERT_ENDPOINT에서 조정 가능
let travelAlertCache: { data: any; timestamp: number } | null = null;

app.get("/api/travel-alert", async (_req, res) => {
  const now = Date.now();
  // 1시간 캐시 (여행경보는 실시간성이 낮은 정보)
  if (travelAlertCache && now - travelAlertCache.timestamp < 60 * 60 * 1000) {
    return res.json(travelAlertCache.data);
  }

  const serviceKey = process.env.MOFA_TRAVEL_ALERT_SERVICE_KEY;
  const endpoint = process.env.MOFA_TRAVEL_ALERT_ENDPOINT;

  if (!serviceKey || !endpoint) {
    return res.status(503).json({
      error: "MOFA_TRAVEL_ALERT_SERVICE_KEY 또는 MOFA_TRAVEL_ALERT_ENDPOINT가 설정되지 않았습니다.",
    });
  }

  try {
    const url = `${endpoint}?serviceKey=${encodeURIComponent(serviceKey)}&numOfRows=10&pageNo=1&cond[country_nm::EQ]=${encodeURIComponent(
      "일본"
    )}&_type=json`;
    const response = await fetch(url);
    const bodyText = await response.text();

    if (!response.ok) {
      console.error(`data.go.kr API 응답 오류 (${response.status}):`, bodyText.slice(0, 500));
      throw new Error(`data.go.kr API 응답 오류: ${response.status}`);
    }

    let raw: any;
    try {
      raw = JSON.parse(bodyText);
    } catch {
      // 오퍼레이션명이 틀리면 JSON 대신 XML 에러가 오는 경우가 많음 - 로그로 원인 확인 가능
      console.error("data.go.kr 응답이 JSON이 아닙니다 (오퍼레이션명 확인 필요):", bodyText.slice(0, 500));
      throw new Error("data.go.kr 응답 파싱 실패 - 오퍼레이션명을 확인해주세요.");
    }

    // data.go.kr 응답 포맷은 서비스마다 다를 수 있어 최대한 방어적으로 파싱
    const items =
      raw?.response?.body?.items?.item ||
      raw?.body?.items ||
      raw?.items ||
      [];
    const itemList = Array.isArray(items) ? items : [items].filter(Boolean);
    const japan = itemList.find((it: any) => it.country_nm === "일본") || itemList[0] || null;

    const resultData = {
      country: japan?.country_nm || "일본",
      alarmLevel: japan?.current_travel_alarm || japan?.alarm_lvl || null,
      fetchedAt: new Date().toISOString(),
      raw: japan,
    };

    travelAlertCache = { data: resultData, timestamp: now };
    res.json(resultData);
  } catch (error) {
    console.error("MOFA travel alert fetch failed:", error);
    res.status(502).json({ error: "여행경보 정보를 가져오지 못했습니다." });
  }
});

// AI Osaka Travel Concierge endpoint (with resilient model cascading and travel fallback)
app.post("/api/ai/ask", async (req, res) => {
  const { question, context } = req.body;
  if (!question) {
    return res.status(400).json({ error: "질문 내용이 필요합니다." });
  }

  const ai = getAIClient();

  // Smart fallback generator using guidebook data if AI is offline or unavailable
  const generateGuidebookFallback = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes("닌텐도") || q.includes("usj") || q.includes("유니버설") || q.includes("대기")) {
      return `【USJ 슈퍼 닌텐도 월드 & 대기 단축 핵심 비법】
1. 오픈런 골든타임: 개장 시간(09:00)보다 최소 30분~45분 전(08:15~08:30)에 유니버설시티역 도착을 권장합니다.
2. 익스프레스 4 팁: 마이리얼트립 등에서 닌텐도 월드(마리오 카트)와 해리포터 시간 확약권이 포함된 티켓을 구매했다면, 지정 시간에 전용 라인으로 대기 없이 바로 입장할 수 있습니다.
3. USJ 공식 앱 등록: 가족 4명의 입장권 QR을 한 사람의 스마트폰 USJ 공식 앱에 미리 등록해 두면, 파크 입장 즉시 '에어리어 입장 정리권(e정리권)'을 무료로 추가 추첨/발권할 수 있습니다.
4. 체력 안배: USJ는 바닷바람이 거세어 체감온도가 낮습니다. 핫팩이나 겉옷을 챙기시고, 4인 가족 기준 오후 2~3시경 레스토랑에서 1시간 이상 충분한 휴식을 취하세요.`;
    }
    if (q.includes("구로몬") || q.includes("시장") || q.includes("간식")) {
      return `【구로몬 시장 4인 가족 추천 먹거리 & 쇼핑 팁】
1. 꼭 먹어야 할 4인 간식:
  • 즉석 와규 꼬치 구이 (A5 등급 한우급 와규를 눈앞에서 직화 토치로 구워줌)
  • 가리비 버터구이 & 대왕 참치(마구로) 초밥 모둠
  • 즉석 딸기 찹쌀떡(이치고 다이후쿠) 및 생과일 주스
2. 가족 꿀팁: 구로몬 시장은 아케이드(지붕)가 완비되어 비가 와도 쾌적합니다. 대부분의 가게 앞에 먹고 갈 수 있는 간이 테이블이 마련되어 있습니다.
3. 가격 팁: 관광지 특성상 가격대가 있는 편이므로 4인 기준 1~2개 메뉴를 맛보기로 나눠 드신 후, 점심/저녁 본식사를 즐기시는 것을 추천합니다.`;
    }
    if (q.includes("비") || q.includes("우천") || q.includes("실내") || q.includes("날씨")) {
      return `【우천 시 4인 가족 대체 실내 코스 추천】
1. 3일차 오사카성 대체:
  • 오사카성 야외 정원 산책 대신 '천수각 내부(엘리베이터 완비 박물관)' 위주로 관람하세요.
  • 또는 오사카 역사박물관(오사카성 바로 맞은편, 지하철 다니마치욘초메역 연결)으로 대체하면 비를 맞지 않고 오사카의 역사를 쾌적하게 둘러볼 수 있습니다.
2. 우메다 실내 복합몰 투어:
  • 우메다 다이마루 백화점 13층 (닌텐도 오사카, 포켓몬 센터, 원피스 무기이라 스토어)
  • 우메다 루쿠아(LUCUA) 및 그랜드 프론트 오사카: 지하 2층~지상 전 층이 지하도로 연결되어 우산 없이 쇼핑과 미식을 즐길 수 있습니다.
3. 온천 힐링 옵션: 부모님 체력 회복을 위해 우메다 인근 '소라니와 온천' 또는 난바 인근 실내 스파를 방문하시는 것도 훌륭한 선택입니다.`;
    }
    if (q.includes("라멘") || q.includes("덜 짠") || q.includes("부모님") || q.includes("식당")) {
      return `【부모님을 위한 자극적이지 않고 덜 짠 오사카 맛집 가이드】
1. 라멘 주문 팁:
  • 일본 돈코츠 라멘은 한국인 입맛에 다소 짤 수 있습니다. 주문 시 "아지 우스메데 오네가이시마스(맛을 연하게/싱겁게 해주세요)"라고 요청하거나, 뜨거운 물(오유)을 추가 요청하시면 부모님께서 매우 만족해하십니다.
  • 추천 라멘: 도톤보리 '카무쿠라 라멘(神座)' - 맑고 시원한 배추 야채 육수 베이스라 부모님 입맛에 가장 잘 맞습니다.
2. 편안한 정식/식사 추천:
  • 도톤보리 '가니도라쿠 본점': 정갈한 대게 솥밥과 코스요리로 부모님 만족도 1위입니다.
  • 난바 '우동 마루카와' 또는 '키츠네 우동(마츠바야)': 깊은 다시마 육수의 담백한 오사카 전통 우동.
  • 숙소(미마루) 키친 활용: 구로몬 시장에서 신선한 연어/소고기를 사와 숙소 인덕션에서 따뜻한 국과 함께 가족만의 식사를 즐기는 것도 좋습니다.`;
    }
    return `【오사카 4인 가족 여행 가이드 답변】
• 숙소: 미마루 오사카 난바 NORTH를 베이스캠프로 하여 난바역, 도톤보리, 구로몬시장을 도보 5~10분으로 이동하실 수 있습니다.
• 교통: 4인 각자 ICOCA 카드 또는 애플월렛을 준비하시고, 라피트 특급열차는 스마트폰 바우처로 좌석을 미리 지정하세요.
• 긴급 상황 시: 미마루 로비 집결 / 영사관 +81-6-4256-2345 / 경찰 110 / 구급 119
궁금하신 세부 일정이나 추가 장소가 있다면 편하게 질문해주세요!`;
  };

  if (!ai) {
    return res.json({
      answer: generateGuidebookFallback(question),
      source: "guidebook-knowledge-base",
    });
  }

  const systemPrompt = `당신은 '오사카 4인 가족(부모님 + 고교생 자녀 2명 등) 여행' 전문 AI 가이드입니다.
숙소 베이스캠프: '미마루 오사카 난바 NORTH' (도톤보리, 구로몬시장, 난바역 도보권)
2박 3일 주요 동선:
- 1일차: 간사이 공항 입국 -> 라피트 열차 -> 숙소 체크인 -> 구로몬 시장 해산물 -> 도톤보리 글리코상 & 저녁식사
- 2일차: USJ (유니버설 스튜디오 재팬) 오픈런, 슈퍼닌텐도월드 & 해리포터 익스프레스 4
- 3일차: 오사카성(300엔 전기차/E-티켓) -> 우메다 다이마루 백화점(닌텐도 오사카, 포켓몬센터) -> 난바 복귀 면세쇼핑(돈키호테 미도스지점) -> 라피트 탑승 -> 간사이 공항

비상연락처:
- 경찰 110, 구급 119, 영사관 +81-6-4256-2345 (야간 +81-90-1895-0714), 일행 분산 집결지: 미마루 로비

사용자의 질문에 한국어로 친절하고 실용적이며 구체적으로 답변해주세요.
가족 단위 이동 시 체력 안배 팁, 대중교통 환승 팁, 맛집 웨이팅 피하는 시간, 알레르기 및 주의사항을 꼭 덧붙여주세요.`;

  // Fallback candidate models in order of resilience
  const candidateModels = ["gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.8-flash"];

  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemPrompt}\n\n[추가 컨텍스트]: ${context || "없음"}\n\n[사용자 질문]: ${question}`,
              },
            ],
          },
        ],
      });

      if (response && response.text) {
        return res.json({ answer: response.text, source: modelName });
      }
    } catch (modelErr: any) {
      console.warn(`Gemini model ${modelName} failed, trying next fallback:`, modelErr?.message || modelErr);
      // continue to next model
    }
  }

  // If all live models hit temporary quota/availability constraints, seamlessly serve domain knowledge
  console.warn("All Gemini candidate models were temporarily unavailable; serving domain fallback.");
  return res.json({
    answer: generateGuidebookFallback(question),
    source: "guidebook-knowledge-base",
  });
});

// Vite middleware in dev or static server in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Osaka Travel App running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
