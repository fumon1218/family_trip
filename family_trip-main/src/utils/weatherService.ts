import { WeatherData, ScheduleItem } from '../types';

export interface RainAlertItem {
  id: string;
  scheduleId: string;
  day: number;
  time: string;
  title: string;
  location: string;
  rainProbability: number;
  severity: 'warning' | 'critical'; // warning >= 50%, critical >= 75%
  backupPlan: string;
  isOutdoor: boolean;
  message: string;
}

// Map WMO codes from Open-Meteo
function mapWmoCode(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: '맑음', icon: 'sun' };
  if (code === 1 || code === 2) return { condition: '대체로 맑음', icon: 'cloud-sun' };
  if (code === 3) return { condition: '구름 많음 / 흐림', icon: 'cloud' };
  if (code === 45 || code === 48) return { condition: '안개', icon: 'cloud' };
  if ([51, 53, 55, 56, 57].includes(code)) return { condition: '이슬비', icon: 'cloud-rain' };
  if ([61, 63, 65].includes(code)) return { condition: '비 (우천)', icon: 'umbrella' };
  if ([71, 73, 75, 77].includes(code)) return { condition: '눈', icon: 'cloud-snow' };
  if ([80, 81, 82].includes(code)) return { condition: '소나기', icon: 'cloud-rain' };
  if ([95, 96, 99].includes(code)) return { condition: '뇌우', icon: 'cloud-lightning' };
  return { condition: '흐림', icon: 'cloud' };
}

// Fetch live weather data (with direct Open-Meteo fallback for GitHub Pages / static export)
export async function fetchOsakaWeather(): Promise<WeatherData> {
  // 1. Try server endpoint first
  try {
    const res = await fetch('/api/weather');
    if (res.ok) {
      const data = await res.json();
      if (data && data.current) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend /api/weather unavailable (running on static host like GitHub Pages). Falling back to client-side Open-Meteo API...', err);
  }

  // 2. Direct client-side fetch from Open-Meteo (works 100% on GitHub Pages without API key!)
  try {
    const apiUrl =
      'https://api.open-meteo.com/v1/forecast?latitude=34.6937&longitude=135.5023&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTokyo';
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Open-Meteo fetch failed');
    const apiData = await response.json();

    const current = apiData.current || {};
    const daily = apiData.daily || {};

    const temp = Math.round(current.temperature_2m ?? 24);
    const wCode = current.weather_code ?? 0;
    const { condition, icon } = mapWmoCode(wCode);
    const humidity = Math.round(current.relative_humidity_2m ?? 50);
    const windKmH = Math.round(current.wind_speed_10m ?? 10);
    const precipProb = (daily.precipitation_probability_max && daily.precipitation_probability_max[0]) ?? 10;

    let clothingTip = '';
    if (temp >= 26) {
      clothingTip = '현재 오사카는 다소 덥습니다. 반팔이나 통기성 좋은 셔츠, 자외선 차단 모자를 착용하세요.';
    } else if (temp >= 20) {
      clothingTip = '쾌적하고 온화한 날씨입니다. 낮에는 가벼운 옷차림, 밤바람 대비 얇은 겉옷을 준비하세요.';
    } else if (temp >= 14) {
      clothingTip = '선선합니다. 가디건이나 자켓을 착용하시고 도톤보리 야경 촬영 시 겉옷을 챙기세요.';
    } else {
      clothingTip = '쌀쌀합니다. 보온용 자켓이나 코트, 핫팩을 준비하여 감기에 유의하세요.';
    }

    if (precipProb >= 50 || [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(wCode)) {
      clothingTip += ' [비 예보 주의] 우산 또는 가벼운 접이식 우비를 가방에 준비하세요.';
    }

    const forecast = [];
    const dayLabels = ['1일차 (도착 & 도톤보리)', '2일차 (USJ 종일)', '3일차 (오사카성 & 출국)'];
    for (let i = 0; i < 3; i++) {
      const dCode = daily.weather_code?.[i] ?? 0;
      const dCond = mapWmoCode(dCode);
      const dMax = Math.round(daily.temperature_2m_max?.[i] ?? temp + 2);
      const dMin = Math.round(daily.temperature_2m_min?.[i] ?? temp - 5);
      const dRain = daily.precipitation_probability_max?.[i] ?? 10;

      forecast.push({
        day: dayLabels[i],
        tempMin: dMin,
        tempMax: dMax,
        condition: dCond.condition,
        icon: dCond.icon,
        rainProb: `${dRain}%`,
        rainProbNumber: dRain,
        tip:
          dRain >= 50
            ? '비 예보가 있습니다! 실내 아케이드 및 백화점·박물관 대체 플랜을 확인하세요.'
            : '야외 활동하기 쾌적합니다. 도보 이동 시 편안한 신발을 착용하세요.',
      });
    }

    return {
      city: 'Osaka, Japan (大阪 실시간 관측)',
      isLive: true,
      lastUpdated: new Date().toLocaleTimeString('ko-KR', { timeZone: 'Asia/Tokyo' }),
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
  } catch (err) {
    console.error('All weather fetches failed, using fallback:', err);
    return {
      city: 'Osaka, Japan (오사카)',
      isLive: false,
      current: {
        temp: 24,
        condition: '대체로 맑음',
        icon: 'sun',
        humidity: 55,
        windKmH: 12,
        precipitationChance: 15,
        clothingTip: '낮에는 쾌적하고 아침·저녁에는 선선합니다. 얇은 겉옷을 지참하세요.',
      },
      forecast: [
        { day: '1일차 (도착 & 도톤보리)', tempMin: 19, tempMax: 26, condition: '대체로 맑음', icon: 'cloud-sun', rainProb: '15%', rainProbNumber: 15, tip: '구로몬 시장 및 도톤보리 관광' },
        { day: '2일차 (USJ 종일)', tempMin: 18, tempMax: 25, condition: '맑음', icon: 'sun', rainProb: '10%', rainProbNumber: 10, tip: 'USJ 종일 정복' },
        { day: '3일차 (오사카성 & 출국)', tempMin: 19, tempMax: 27, condition: '구름 조금', icon: 'cloud-sun', rainProb: '25%', rainProbNumber: 25, tip: '오사카성 및 우메다 쇼핑' },
      ],
    };
  }
}

// Request Browser Web Push Notification Permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

// Trigger Web Push Notification
export function sendBrowserNotification(title: string, body: string, icon = '/icon.png') {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon,
        badge: icon,
      });
    } catch {
      // Fallback for environments with strict SW requirements
    }
  }
}
