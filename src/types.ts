export type TabType = 'itinerary' | 'map' | 'gourmet' | 'budget' | 'guide';

export interface ScheduleItem {
  id: string;
  day: number;
  time: string;
  title: string;
  location: string;
  description: string;
  category: 'transport' | 'attraction' | 'food' | 'shopping' | 'rest' | 'hotel';
  completed?: boolean;
  notes?: string;
  badge?: string;
  travelTime?: string;
  emergencyTip?: string;
  rainyBackup?: string;
  durationMinutes?: number;
  tags?: string[];
}

export interface SpotInfo {
  id: string;
  name: string;
  nameJa: string;
  category: 'landmark' | 'shopping' | 'market' | 'theme_park' | 'basecamp';
  area: 'namba' | 'dotonbori' | 'usj' | 'osaka_castle' | 'umeda' | 'kix';
  distanceFromNamba: string;
  transitMethod: string;
  description: string;
  familyTip: string;
  congestionLevel: 'low' | 'moderate' | 'high' | 'very_high';
  peakHours: string;
  coordinates: { x: number; y: number; lat?: number; lng?: number };
  imageKeywords: string;
  pdfReference: string;
}

export interface RestaurantItem {
  id: string;
  name: string;
  nameJa: string;
  area: string;
  category: string;
  pricePerPerson: string;
  signatureDish: string;
  waitingEstimate: string;
  bestVisitTime: string;
  description: string;
  familyTip: string;
  isPdfFeatured: boolean;
  isHiddenGem?: boolean;
  addressJa: string;
  mapPin: { x: number; y: number };
}

export type PaymentStatus = 'paid' | 'pending' | 'onsite';

export interface BudgetItem {
  id: string;
  category: 'lodging' | 'transit' | 'tickets' | 'food' | 'shopping' | 'insurance' | 'etc';
  title: string;
  amountKrw: number;
  amountJpy?: number;
  perPersonRate?: string;
  note: string;
  isPaid: boolean;
  paymentStatus?: PaymentStatus;
  date?: string;
}

export interface JapanesePhrase {
  id: string;
  category: 'essential' | 'dining' | 'shopping' | 'emergency' | 'allergy';
  koreanMeaning: string;
  japaneseText: string;
  pronunciation: string;
  contextTip?: string;
}

export interface Accommodation {
  id: string;
  nameKo: string;
  nameJa: string;
  addressJa: string;
  nearestStation: string;
  stationDistance: string;
  area: string;
  badge: string;
  roomType: string;
  transitToNamba: string;
  transitToUSJ: string;
  transitToDotonbori: string;
  transitToAirport: string;
  features: string[];
  taxiNote: string;
  checkInGuide: string;
  checkOutMinutesToRapit: number; // minutes needed to get to Rapit train
  coordinates: { x: number; y: number };
  isCustom?: boolean;
}

export interface SubwayStation {
  id: string;
  nameKo: string;
  nameJa: string;
  lines: string[];
  x: number;
  y: number;
  isKeyHub?: boolean;
}

export interface SubwayLine {
  id: string;
  nameKo: string;
  nameJa: string;
  color: string;
  stations: string[];
  description: string;
}

export interface WeatherData {
  city: string;
  current: {
    temp: number;
    condition: string;
    icon: string;
    humidity: number;
    windKmH: number;
    precipitationChance: number;
    clothingTip: string;
  };
  forecast: Array<{
    day: string;
    tempMin: number;
    tempMax: number;
    condition: string;
    icon: string;
    rainProb: string;
    tip: string;
  }>;
}
