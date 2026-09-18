import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TabBar } from './components/TabBar';
import { ItineraryTab } from './components/ItineraryTab';
import { MapSubwayTab } from './components/MapSubwayTab';
import { GourmetTab } from './components/GourmetTab';
import { BudgetTab } from './components/BudgetTab';
import { GuidebookAITab } from './components/GuidebookAITab';
import { EmergencyModal } from './components/EmergencyModal';
import { TaxiDestinationModal } from './components/TaxiDestinationModal';
import { PackingChecklistModal } from './components/PackingChecklistModal';
import { WeatherRainyGuideModal } from './components/WeatherRainyGuideModal';
import { USJSchedulerModal } from './components/USJSchedulerModal';
import { DutyFreeCalcModal } from './components/DutyFreeCalcModal';
import { ConvenienceStoreModal } from './components/ConvenienceStoreModal';
import { RestaurantPhrasesModal } from './components/RestaurantPhrasesModal';
import { AirportDepartureModal } from './components/AirportDepartureModal';
import { PhotoSpotGuideModal } from './components/PhotoSpotGuideModal';
import { AccommodationModal } from './components/AccommodationModal';
import { initialScheduleData, osakaAccommodations, applyAccommodationToSchedule } from './data/guidebookData';
import { TabType, ScheduleItem, WeatherData, Accommodation } from './types';
import { fetchOsakaWeather } from './utils/weatherService';
import { CloudSun, Umbrella, Thermometer, Wind, CheckCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('itinerary');
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [taxiModalOpen, setTaxiModalOpen] = useState(false);
  const [packingModalOpen, setPackingModalOpen] = useState(false);
  const [weatherRainyModalOpen, setWeatherRainyModalOpen] = useState(false);
  const [usjModalOpen, setUsjModalOpen] = useState(false);
  const [dutyFreeModalOpen, setDutyFreeModalOpen] = useState(false);
  const [convenienceModalOpen, setConvenienceModalOpen] = useState(false);
  const [restaurantPhrasesModalOpen, setRestaurantPhrasesModalOpen] = useState(false);
  const [airportModalOpen, setAirportModalOpen] = useState(false);
  const [photoSpotsModalOpen, setPhotoSpotsModalOpen] = useState(false);
  const [accommodationModalOpen, setAccommodationModalOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Selected Accommodation State (persisted)
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation>(() => {
    try {
      const saved = localStorage.getItem('osaka_selected_accommodation');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return osakaAccommodations[0];
  });

  // Load schedule from localStorage or fallback to PDF data aligned with accommodation
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem('osaka_family_schedule');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return applyAccommodationToSchedule(osakaAccommodations[0], initialScheduleData);
  });

  // Weather state & Rain Simulation
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [rainSimulationDay, setRainSimulationDay] = useState<number | null>(null);
  const [isRefreshingWeather, setIsRefreshingWeather] = useState<boolean>(false);

  const loadWeather = async () => {
    setIsRefreshingWeather(true);
    try {
      const data = await fetchOsakaWeather();
      setWeather(data);
    } catch (e) {
      console.error('Failed to load Osaka weather:', e);
    } finally {
      setIsRefreshingWeather(false);
    }
  };

  // Persist schedule changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('osaka_family_schedule', JSON.stringify(schedule));
    } catch {
      // ignore
    }
  }, [schedule]);

  // Fetch live weather data on mount
  useEffect(() => {
    loadWeather();
  }, []);

  const handleToggleComplete = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleAddNote = (id: string, note: string) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, notes: note } : item
      )
    );
  };

  const handleSelectAccommodation = (hotel: Accommodation) => {
    setSelectedAccommodation(hotel);
    try {
      localStorage.setItem('osaka_selected_accommodation', JSON.stringify(hotel));
    } catch {
      // ignore
    }
    // Automatically recalculate schedule items and transit notes based on the new hotel!
    setSchedule((prev) => applyAccommodationToSchedule(hotel, prev));
  };

  const handleResetSchedule = () => {
    if (window.confirm('모든 방문 체크 및 메모를 초기 상태로 되돌릴까요?')) {
      const fresh = applyAccommodationToSchedule(selectedAccommodation, initialScheduleData);
      setSchedule(fresh);
      localStorage.removeItem('osaka_family_schedule');
    }
  };

  const handleToggleOffline = () => {
    const next = !isOffline;
    setIsOffline(next);
    alert(
      next
        ? '오프라인 모드가 활성화되었습니다. PDF 일정표, 지하철 노선, 생존 일본어, 비상연락처가 인터넷 연결 없이도 즉시 표시됩니다.'
        : '온라인 실시간 모드로 복귀했습니다.'
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header & Menu Bar Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <Navbar
          onOpenSos={() => setEmergencyModalOpen(true)}
          isOffline={isOffline}
          onToggleOffline={handleToggleOffline}
          onOpenTaxi={() => setTaxiModalOpen(true)}
          onOpenPacking={() => setPackingModalOpen(true)}
          onOpenWeather={() => setWeatherRainyModalOpen(true)}
          onOpenUsj={() => setUsjModalOpen(true)}
          onOpenDutyFree={() => setDutyFreeModalOpen(true)}
          onOpenConvenience={() => setConvenienceModalOpen(true)}
          onOpenRestaurantPhrases={() => setRestaurantPhrasesModalOpen(true)}
          onOpenAirport={() => setAirportModalOpen(true)}
          onOpenPhotoSpots={() => setPhotoSpotsModalOpen(true)}
          selectedHotel={selectedAccommodation}
          onOpenAccommodationModal={() => setAccommodationModalOpen(true)}
        />
        <TabBar currentTab={currentTab} onSelectTab={setCurrentTab} />
      </header>

      {/* Main App Canvas */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-4 py-3 sm:py-4">
        {/* Weather & Travel Overview Banner */}
        {weather && (
          <div className="mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 text-white p-3.5 sm:p-4 rounded-2xl shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/15 backdrop-blur-xs rounded-xl">
                  <CloudSun className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-100 flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      오사카 실시간 기상 (Open-Meteo)
                    </span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">
                      {weather.current.condition}
                    </span>
                    <button
                      type="button"
                      onClick={loadWeather}
                      disabled={isRefreshingWeather}
                      className="p-1 hover:bg-white/20 rounded-md transition-colors cursor-pointer"
                      title="실시간 날씨 새로고침"
                    >
                      <RefreshCw
                        className={`w-3 h-3 text-white ${
                          isRefreshingWeather ? 'animate-spin' : ''
                        }`}
                      />
                    </button>
                  </div>
                  <div className="text-xl sm:text-2xl font-black tracking-tight flex items-baseline gap-2">
                    <span>{weather.current.temp}°C</span>
                    <span className="text-xs font-normal text-blue-100">
                      체감 {weather.current.apparentTemp ? `${weather.current.apparentTemp}°C` : `${weather.current.temp}°C`} · 습도 {weather.current.humidity}% · 강수확률 {weather.current.precipitationChance}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Clothing and weather tip from PDF */}
              <div className="sm:max-w-md text-xs bg-black/20 backdrop-blur-xs p-2.5 rounded-xl border border-white/10 leading-relaxed text-blue-50 flex flex-col justify-between gap-1.5">
                <div>
                  <span className="font-bold text-amber-300">💡 복장 & 우천 가이드: </span>
                  {weather.current.clothingTip}
                </div>
                <button
                  type="button"
                  onClick={() => setWeatherRainyModalOpen(true)}
                  className="self-end text-[11px] font-bold text-amber-300 hover:text-white underline cursor-pointer"
                >
                  상세 예보 & 우천 대체 코스 보기 →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab View Switching */}
        {currentTab === 'itinerary' && (
          <ItineraryTab
            schedule={schedule}
            onToggleComplete={handleToggleComplete}
            onAddNote={handleAddNote}
            onResetSchedule={handleResetSchedule}
            onOpenUsj={() => setUsjModalOpen(true)}
            onOpenWeather={() => setWeatherRainyModalOpen(true)}
            onOpenTaxi={() => setTaxiModalOpen(true)}
            onOpenPacking={() => setPackingModalOpen(true)}
            onOpenDutyFree={() => setDutyFreeModalOpen(true)}
            onOpenAirport={() => setAirportModalOpen(true)}
            onOpenPhotoSpots={() => setPhotoSpotsModalOpen(true)}
            selectedHotel={selectedAccommodation}
            onOpenAccommodationModal={() => setAccommodationModalOpen(true)}
            weather={weather}
            rainSimulationDay={rainSimulationDay}
            onSetRainSimulationDay={setRainSimulationDay}
            onRefreshWeather={loadWeather}
          />
        )}

        {currentTab === 'map' && (
          <MapSubwayTab
            onOpenTaxi={() => setTaxiModalOpen(true)}
            selectedHotel={selectedAccommodation}
            onOpenAccommodationModal={() => setAccommodationModalOpen(true)}
          />
        )}

        {currentTab === 'gourmet' && (
          <GourmetTab
            onOpenRestaurantPhrases={() => setRestaurantPhrasesModalOpen(true)}
            onOpenConvenience={() => setConvenienceModalOpen(true)}
          />
        )}

        {currentTab === 'budget' && <BudgetTab />}

        {currentTab === 'guide' && (
          <GuidebookAITab
            onOpenTaxi={() => setTaxiModalOpen(true)}
            onOpenPacking={() => setPackingModalOpen(true)}
            onOpenWeather={() => setWeatherRainyModalOpen(true)}
            onOpenUsj={() => setUsjModalOpen(true)}
            onOpenDutyFree={() => setDutyFreeModalOpen(true)}
            onOpenConvenience={() => setConvenienceModalOpen(true)}
            onOpenRestaurantPhrases={() => setRestaurantPhrasesModalOpen(true)}
            onOpenAirport={() => setAirportModalOpen(true)}
            onOpenPhotoSpots={() => setPhotoSpotsModalOpen(true)}
            selectedHotel={selectedAccommodation}
            onOpenAccommodationModal={() => setAccommodationModalOpen(true)}
          />
        )}
      </main>

      {/* Emergency SOS Modal */}
      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
      />

      {/* 0. Accommodation (Basecamp) Switcher Modal */}
      <AccommodationModal
        isOpen={accommodationModalOpen}
        onClose={() => setAccommodationModalOpen(false)}
        selectedHotel={selectedAccommodation}
        onSelectHotel={handleSelectAccommodation}
      />

      {/* 1. Taxi Driver Destination Card Modal */}
      <TaxiDestinationModal
        isOpen={taxiModalOpen}
        onClose={() => setTaxiModalOpen(false)}
        selectedHotel={selectedAccommodation}
      />

      {/* 2. Packing Checklist Modal */}
      <PackingChecklistModal
        isOpen={packingModalOpen}
        onClose={() => setPackingModalOpen(false)}
      />

      {/* 3. Weather & Rainy Day Guide Modal */}
      <WeatherRainyGuideModal
        isOpen={weatherRainyModalOpen}
        onClose={() => setWeatherRainyModalOpen(false)}
        weather={weather}
      />

      {/* 4. USJ Timetable Scheduler Modal */}
      <USJSchedulerModal
        isOpen={usjModalOpen}
        onClose={() => setUsjModalOpen(false)}
      />

      {/* 5. Duty Free & Discount Coupon Calculator Modal */}
      <DutyFreeCalcModal
        isOpen={dutyFreeModalOpen}
        onClose={() => setDutyFreeModalOpen(false)}
      />

      {/* 6. Convenience Store Late-Night Snack & Phrases Modal */}
      <ConvenienceStoreModal
        isOpen={convenienceModalOpen}
        onClose={() => setConvenienceModalOpen(false)}
      />

      {/* 7. Restaurant Custom Request Cards (Large Text & TTS) */}
      <RestaurantPhrasesModal
        isOpen={restaurantPhrasesModalOpen}
        onClose={() => setRestaurantPhrasesModalOpen(false)}
      />

      {/* 8. Airport Departure & Baggage Packing Planner */}
      <AirportDepartureModal
        isOpen={airportModalOpen}
        onClose={() => setAirportModalOpen(false)}
        selectedHotel={selectedAccommodation}
      />

      {/* 9. Family Photo Spots & Hidden Angles Guide */}
      <PhotoSpotGuideModal
        isOpen={photoSpotsModalOpen}
        onClose={() => setPhotoSpotsModalOpen(false)}
      />
    </div>
  );
}
