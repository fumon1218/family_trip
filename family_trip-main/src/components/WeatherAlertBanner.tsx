import React, { useState, useEffect } from 'react';
import {
  Umbrella,
  CloudRain,
  AlertTriangle,
  Bell,
  BellRing,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  X,
  Sparkles,
  CloudSun,
  Droplets,
  Wind,
} from 'lucide-react';
import { WeatherData, ScheduleItem } from '../types';
import { requestNotificationPermission, sendBrowserNotification } from '../utils/weatherService';

interface WeatherAlertBannerProps {
  weather: WeatherData | null;
  schedule: ScheduleItem[];
  selectedDay: number;
  onRefreshWeather: () => void;
  onOpenWeatherRainyModal: () => void;
  onOpenPackingModal?: () => void;
  rainSimulationDay: number | null; // 1, 2, 3 or null
  onSetRainSimulationDay: (day: number | null) => void;
}

export const WeatherAlertBanner: React.FC<WeatherAlertBannerProps> = ({
  weather,
  schedule,
  selectedDay,
  onRefreshWeather,
  onOpenWeatherRainyModal,
  onOpenPackingModal,
  rainSimulationDay,
  onSetRainSimulationDay,
}) => {
  const [notificationGranted, setNotificationGranted] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });
  const [toastAlert, setToastAlert] = useState<{
    show: boolean;
    title: string;
    body: string;
    scheduleTitle: string;
    rainProb: number;
    backupPlan: string;
  } | null>(null);

  // Check which schedule items have a rain alert
  // 1) Simulation overrides or 2) live forecast with rainProb >= 50%
  const currentDayRainProb = React.useMemo(() => {
    if (rainSimulationDay !== null) {
      return (dayNum: number) => (dayNum === rainSimulationDay ? 80 : 15);
    }
    return (dayNum: number) => {
      const forecastItem = weather?.forecast?.[dayNum - 1];
      if (forecastItem?.rainProbNumber !== undefined) {
        return forecastItem.rainProbNumber;
      }
      return weather?.current.precipitationChance ?? 15;
    };
  }, [rainSimulationDay, weather]);

  // Identify affected items for the selected day (or whole trip if selectedDay === 0)
  const rainyItems = React.useMemo(() => {
    return schedule.filter((item) => {
      if (selectedDay !== 0 && item.day !== selectedDay) return false;
      const prob = currentDayRainProb(item.day);
      // Items with rain prob >= 50% or marked outdoor
      return prob >= 50 && (item.category === 'attraction' || item.category === 'transport' || item.location.includes('공원') || item.location.includes('거리') || item.location.includes('USJ'));
    });
  }, [schedule, selectedDay, currentDayRainProb]);

  // Handle requesting Web Push notification permission
  const handleEnablePushNotification = async () => {
    const granted = await requestNotificationPermission();
    setNotificationGranted(granted);
    if (granted) {
      sendBrowserNotification(
        '☔ [오사카 날씨 알림 설정 완료]',
        '여행 중 비 예보가 감지되면 해당 일정 30분 전 알림과 실내 대체 플랜을 안내해 드립니다.'
      );
      setToastAlert({
        show: true,
        title: '🔔 푸시 알림 활성화 완료',
        body: '오사카 현지 비 예보 시 스마트폰/PC로 즉시 경고 알림을 발송합니다.',
        scheduleTitle: '날씨 기반 일정 알림 활성',
        rainProb: 0,
        backupPlan: '실내 아케이드 및 백화점·박물관 대체 플랜이 준비되어 있습니다.',
      });
    } else {
      alert('브라우저 알림 권한이 차단되었거나 지원되지 않습니다. 인앱 알림 배너로 안내해 드립니다.');
    }
  };

  // Trigger test notification
  const handleTestRainAlert = (targetDay: number) => {
    onSetRainSimulationDay(targetDay);
    const targetTitle = targetDay === 3 ? '오사카성 공원 야외 관광' : targetDay === 2 ? 'USJ 야외 어트랙션' : '도톤보리 야외 거리';
    const backupPlan = targetDay === 3 ? '오사카 역사박물관 10층 실내 전망 & 우메다 다이마루 백화점' : 'USJ 실내 라이드 4대 집중 또는 가이유칸 수족관 플랜B';
    const rainProb = 80;

    // Trigger browser push notification
    sendBrowserNotification(
      `☔ [비 예보 감지 알림] ${targetDay}일차 ${targetTitle}`,
      `강수확률 ${rainProb}% 비 예보가 있습니다! 실내 대체 코스를 확인하세요: ${backupPlan}`
    );

    // Trigger In-App Notification Toast
    setToastAlert({
      show: true,
      title: `☔ [우천 경고 푸시 알림] ${targetDay}일차 비 예보 감지`,
      body: `${targetTitle} 시간대에 비 예보(강수확률 ${rainProb}%)가 있습니다. 부모님과 아이들의 체력 보존을 위해 실내 대체 코스로의 전환을 추천합니다.`,
      scheduleTitle: targetTitle,
      rainProb,
      backupPlan,
    });
  };

  return (
    <div className="space-y-3 mb-4">
      {/* 1. Floating In-App Push Notification Toast */}
      {toastAlert && toastAlert.show && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl border-2 border-amber-400 animate-in fade-in slide-in-from-top-4 relative z-30">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-md animate-bounce">
                <CloudRain className="w-5 h-5 text-blue-900" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black bg-rose-600 text-white px-2 py-0.5 rounded-md">
                    비 예보 경고
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-300">
                    강수확률 {toastAlert.rainProb}%
                  </span>
                  <span className="text-[11px] text-slate-400">
                    실시간 기상 감지 알림
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-white">
                  {toastAlert.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  {toastAlert.body}
                </p>
                {toastAlert.backupPlan && (
                  <div className="mt-2 p-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-amber-200">
                    <span className="font-bold text-white">💡 추천 실내 대체 플랜: </span>
                    {toastAlert.backupPlan}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setToastAlert(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer"
              title="알림 닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="text-[11px] text-slate-400">
              우천 대체 플랜을 확인하면 비 맞지 않고 100% 쾌적한 관광이 가능합니다.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setToastAlert(null);
                  onOpenWeatherRainyModal();
                }}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Umbrella className="w-3.5 h-3.5" />
                <span>우천 대체 플랜B 전체 보기</span>
              </button>
              {onOpenPackingModal && (
                <button
                  type="button"
                  onClick={() => {
                    setToastAlert(null);
                    onOpenPackingModal();
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
                >
                  우산·우비 준비물 확인
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Weather & Schedule Notification Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Weather Status & Live Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <CloudSun className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-slate-900">
                  {weather?.city || '오사카 실시간 기상 관측'}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  실시간 연동
                </span>
                {weather?.lastUpdated && (
                  <span className="text-[10px] text-slate-400">
                    기준: {weather.lastUpdated}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5 mt-0.5 text-xs text-slate-600">
                <span className="font-extrabold text-slate-900 text-sm">
                  {weather?.current.temp ?? 24}°C
                </span>
                <span className="text-slate-500">
                  ({weather?.current.condition || '대체로 맑음'})
                </span>
                <span>• 체감 {weather?.current.apparentTemp ?? weather?.current.temp ?? 24}°C</span>
                <span>• 강수 {weather?.current.precipitationChance ?? 10}%</span>
                <span>• 습도 {weather?.current.humidity ?? 55}%</span>
              </div>
            </div>
          </div>

          {/* Right: Weather-Based Notification Center Actions */}
          <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
            {/* Push Notification Permission Button */}
            <button
              type="button"
              onClick={handleEnablePushNotification}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                notificationGranted
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}
            >
              {notificationGranted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>푸시 알림 켜짐</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 text-indigo-600" />
                  <span>비 예보 푸시 알림 받기</span>
                </>
              )}
            </button>

            {/* Refresh Live Weather */}
            <button
              type="button"
              onClick={onRefreshWeather}
              className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer"
              title="실시간 날씨 새로고침"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Rainy backup guide modal */}
            <button
              type="button"
              onClick={onOpenWeatherRainyModal}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Umbrella className="w-3.5 h-3.5 text-amber-300" />
              <span>우천 대체 코스</span>
            </button>
          </div>
        </div>

        {/* Rain Simulation and Test Section (Easy Verification of Rain Notification) */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-bold">비 예보 시뮬레이션 테스트:</span>
            <span className="text-[11px] text-slate-400">
              (원하는 일차를 누르면 해당 시간대 비 예보 경고 및 푸시 알림이 발송됩니다)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleTestRainAlert(3)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                rainSimulationDay === 3
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
              }`}
            >
              🌧️ 3일차 오사카성 비 예보 (80%)
            </button>

            <button
              type="button"
              onClick={() => handleTestRainAlert(2)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                rainSimulationDay === 2
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
              }`}
            >
              🌧️ 2일차 USJ 비 예보 (75%)
            </button>

            {rainSimulationDay !== null && (
              <button
                type="button"
                onClick={() => onSetRainSimulationDay(null)}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                맑음 초기화
              </button>
            )}
          </div>
        </div>

        {/* Active Rain Warning Alert Indicator Banner (If any schedule item is rainy) */}
        {rainyItems.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                <Umbrella className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-blue-900">
                  {rainSimulationDay || selectedDay}일차 일정 중 비 예보 경고 감지:
                </span>{' '}
                <span className="text-blue-800 font-medium">
                  {rainyItems.map((it) => it.title).join(', ')} 시간대에 비(강수확률 80%)가 예보되어 있습니다.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenWeatherRainyModal}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg cursor-pointer"
            >
              대체 플랜B 적용하기 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
