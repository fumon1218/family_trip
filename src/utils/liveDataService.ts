// 키 발급이 필요 없는 무료 공개 API들을 모아둔 유틸리티
// 1) open.er-api.com   - 실시간 환율 (하루 1회 갱신, 무료·무제한에 가까운 호출)
// 2) api.sunrise-sunset.org - 일출/일몰 시각
// 3) date.nager.at     - 각국 공휴일 정보

export interface LiveExchangeRate {
  jpyToKrw: number; // 1엔 = ?원
  fetchedAt: string;
}

export async function fetchLiveExchangeRate(): Promise<LiveExchangeRate | null> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/JPY');
    if (!res.ok) return null;
    const data = await res.json();
    const rate = data?.rates?.KRW;
    if (typeof rate !== 'number') return null;
    return {
      jpyToKrw: rate,
      fetchedAt: data?.time_last_update_utc || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export interface SunTimes {
  sunriseJst: Date;
  sunsetJst: Date;
  goldenHourStartJst: Date; // 일몰 35분 전부터 골든아워로 근사
  goldenHourEndJst: Date;
}

// 오사카 좌표 기준 (USJ/난바/도톤보리 등 시내 전역에 체감상 동일하게 적용 가능한 오차 범위)
const OSAKA_LAT = 34.6937;
const OSAKA_LNG = 135.5023;

export async function fetchOsakaSunTimes(dateStr?: string): Promise<SunTimes | null> {
  try {
    const dateParam = dateStr || 'today';
    const res = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${OSAKA_LAT}&lng=${OSAKA_LNG}&date=${dateParam}&formatted=0`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 'OK') return null;

    const sunriseUtc = new Date(data.results.sunrise);
    const sunsetUtc = new Date(data.results.sunset);
    // 반환값은 UTC ISO 문자열이므로 Date 객체 자체가 이미 정확한 시점을 가리킴 (표시 시 toLocaleTimeString에 timeZone 지정)
    const goldenStart = new Date(sunsetUtc.getTime() - 35 * 60 * 1000);

    return {
      sunriseJst: sunriseUtc,
      sunsetJst: sunsetUtc,
      goldenHourStartJst: goldenStart,
      goldenHourEndJst: sunsetUtc,
    };
  } catch {
    return null;
  }
}

export function formatJstTime(d: Date): string {
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' });
}

export interface UpcomingHoliday {
  date: string; // YYYY-MM-DD
  localName: string;
  name: string;
  daysUntil: number;
}

export async function fetchNextJapanHoliday(): Promise<UpcomingHoliday | null> {
  try {
    const now = new Date();
    const year = now.getFullYear();

    const fetchYear = async (y: number) => {
      const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${y}/JP`);
      if (!res.ok) return [];
      return res.json();
    };

    let holidays: any[] = await fetchYear(year);
    // 연말이면 내년 공휴일도 함께 확인
    if (now.getMonth() === 11) {
      const nextYearHolidays = await fetchYear(year + 1);
      holidays = [...holidays, ...nextYearHolidays];
    }

    const todayStr = now.toISOString().slice(0, 10);
    const upcoming = holidays
      .filter((h) => h.date >= todayStr)
      .sort((a, b) => (a.date > b.date ? 1 : -1))[0];

    if (!upcoming) return null;

    const holidayDate = new Date(upcoming.date + 'T00:00:00');
    const daysUntil = Math.round((holidayDate.getTime() - new Date(todayStr + 'T00:00:00').getTime()) / (24 * 60 * 60 * 1000));

    return {
      date: upcoming.date,
      localName: upcoming.localName,
      name: upcoming.name,
      daysUntil,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Wikipedia REST/Action API - 키 발급 불필요, CORS는 origin=* 파라미터로 허용됨
// ---------------------------------------------------------------------------

export interface WikiSummary {
  title: string;
  extract: string;
  pageUrl: string;
  thumbnailUrl?: string;
}

// "도톤보리 & 글리코상", "유니버설 스튜디오 재팬 (USJ)" 같은 표기에서 검색에 적합한 핵심어만 추출
function cleanSpotQuery(raw: string): string {
  return raw.split(/[&(（·]/)[0].trim();
}

export async function fetchWikipediaSummary(rawQuery: string): Promise<WikiSummary | null> {
  const query = cleanSpotQuery(rawQuery);
  if (!query) return null;
  try {
    // 1) 검색으로 가장 가까운 문서 제목 찾기 (action API, origin=* 로 브라우저 CORS 허용)
    const searchRes = await fetch(
      `https://ko.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query
      )}&format=json&origin=*&srlimit=1`
    );
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const hit = searchData?.query?.search?.[0];
    if (!hit?.title) return null;

    // 2) REST 요약 API로 실제 문서 요약 가져오기
    const summaryRes = await fetch(
      `https://ko.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title)}`
    );
    if (!summaryRes.ok) return null;
    const summaryData = await summaryRes.json();
    if (!summaryData.extract) return null;

    return {
      title: summaryData.title,
      extract: summaryData.extract,
      pageUrl:
        summaryData.content_urls?.desktop?.page ||
        `https://ko.wikipedia.org/wiki/${encodeURIComponent(hit.title)}`,
      thumbnailUrl: summaryData.thumbnail?.source,
    };
  } catch {
    return null;
  }
}
