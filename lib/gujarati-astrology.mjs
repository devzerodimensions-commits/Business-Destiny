import { panchangAtSunrise, kundali } from '@grahan/vedic';
import { dateFromZonedTime } from '@grahan/core';
export const cities = [
  { id: 'ahmedabad', name: 'અમદાવાદ', latitude: 23.0225, longitude: 72.5714 },
  { id: 'surat', name: 'સુરત', latitude: 21.1702, longitude: 72.8311 },
  { id: 'vadodara', name: 'વડોદરા', latitude: 22.3072, longitude: 73.1812 },
  { id: 'rajkot', name: 'રાજકોટ', latitude: 22.3039, longitude: 70.8022 },
  { id: 'gandhinagar', name: 'ગાંધીનગર', latitude: 23.2156, longitude: 72.6369 },
  { id: 'bhavnagar', name: 'ભાવનગર', latitude: 21.7645, longitude: 72.1519 },
  { id: 'jamnagar', name: 'જામનગર', latitude: 22.4707, longitude: 70.0577 },
  { id: 'junagadh', name: 'જૂનાગઢ', latitude: 21.5222, longitude: 70.4579 },
  { id: 'bhuj', name: 'ભુજ', latitude: 23.242, longitude: 69.6669 },
  { id: 'anand', name: 'આણંદ', latitude: 22.5645, longitude: 72.9289 },
  { id: 'mehsana', name: 'મહેસાણા', latitude: 23.588, longitude: 72.3693 },
  { id: 'valsad', name: 'વલસાડ', latitude: 20.5992, longitude: 72.9342 },
];
export const rashis = [
  'મેષ',
  'વૃષભ',
  'મિથુન',
  'કર્ક',
  'સિંહ',
  'કન્યા',
  'તુલા',
  'વૃશ્ચિક',
  'ધનુ',
  'મકર',
  'કુંભ',
  'મીન',
];
export const nakshatras = [
  'અશ્વિની',
  'ભરણી',
  'કૃત્તિકા',
  'રોહિણી',
  'મૃગશીર્ષ',
  'આર્દ્રા',
  'પુનર્વસુ',
  'પુષ્ય',
  'આશ્લેષા',
  'મઘા',
  'પૂર્વાફાલ્ગુની',
  'ઉત્તરાફાલ્ગુની',
  'હસ્ત',
  'ચિત્રા',
  'સ્વાતિ',
  'વિશાખા',
  'અનુરાધા',
  'જ્યેષ્ઠા',
  'મૂળ',
  'પૂર્વાષાઢા',
  'ઉત્તરાષાઢા',
  'શ્રવણ',
  'ધનિષ્ઠા',
  'શતભિષા',
  'પૂર્વાભાદ્રપદ',
  'ઉત્તરાભાદ્રપદ',
  'રેવતી',
];
export const yogas = [
  'વિષ્કંભ',
  'પ્રીતિ',
  'આયુષ્માન',
  'સૌભાગ્ય',
  'શોભન',
  'અતિગંડ',
  'સુકર્મા',
  'ધૃતિ',
  'શૂલ',
  'ગંડ',
  'વૃદ્ધિ',
  'ધ્રુવ',
  'વ્યાઘાત',
  'હર્ષણ',
  'વજ્ર',
  'સિદ્ધિ',
  'વ્યતિપાત',
  'વરીયાન',
  'પરિઘ',
  'શિવ',
  'સિદ્ધ',
  'સાધ્ય',
  'શુભ',
  'શુક્લ',
  'બ્રહ્મ',
  'ઇન્દ્ર',
  'વૈધૃતિ',
];
export const grahas = {
  sun: 'સૂર્ય',
  moon: 'ચંદ્ર',
  mars: 'મંગળ',
  mercury: 'બુધ',
  jupiter: 'ગુરુ',
  venus: 'શુક્ર',
  saturn: 'શનિ',
  rahu: 'રાહુ',
  ketu: 'કેતુ',
};
export const karanas = {
  Bava: 'બવ',
  Balava: 'બાલવ',
  Kaulava: 'કૌલવ',
  Taitila: 'તૈતિલ',
  Gara: 'ગર',
  Vanija: 'વણિજ',
  Vishti: 'વિષ્ટિ (ભદ્રા)',
  Kimstughna: 'કિંસ્તુઘ્ન',
  Shakuni: 'શકુનિ',
  Chatushpada: 'ચતુષ્પદ',
  Naga: 'નાગ',
};
export const weekdays = [
  'રવિવાર',
  'સોમવાર',
  'મંગળવાર',
  'બુધવાર',
  'ગુરુવાર',
  'શુક્રવાર',
  'શનિવાર',
];
const tithis = [
  'પ્રતિપદા',
  'બીજ',
  'ત્રીજ',
  'ચોથ',
  'પાંચમ',
  'છઠ',
  'સાતમ',
  'આઠમ',
  'નોમ',
  'દશમ',
  'એકાદશી',
  'બારસ',
  'તેરસ',
  'ચૌદસ',
];
export function tithiName(index) {
  return index === 14 ? 'પૂનમ' : index === 29 ? 'અમાસ' : tithis[index % 15];
}
export function indiaDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
export function validatedDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw Error('કૃપા કરીને યોગ્ય તારીખ પસંદ કરો.');
  const d = new Date(value + 'T00:00:00Z');
  if (
    !Number.isFinite(d.getTime()) ||
    d.toISOString().slice(0, 10) !== value ||
    d.getUTCFullYear() < 1900 ||
    d.getUTCFullYear() > 2100
  )
    throw Error('તારીખ ૧૯૦૦ થી ૨૧૦૦ વચ્ચે હોવી જોઈએ.');
  return d;
}
export function getCity(id) {
  const city = cities.find((c) => c.id === id);
  if (!city) throw Error('કૃપા કરીને ગુજરાતનું શહેર પસંદ કરો.');
  return city;
}
export function calculatePanchang(value, cityId) {
  const d = validatedDate(value);
  const city = getCity(cityId);
  return panchangAtSunrise({
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: 'Asia/Kolkata',
  });
}
export function calculateBirthChart(value, time, cityId) {
  validatedDate(value);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
    throw Error('કૃપા કરીને જન્મનો યોગ્ય સમય દાખલ કરો.');
  const [year, month, day] = value.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const date = dateFromZonedTime(
    { year, month, day, hour, minute, second: 0 },
    'Asia/Kolkata',
  );
  if (date > new Date())
    throw Error('જન્મની તારીખ અને સમય ભવિષ્યમાં હોઈ શકતા નથી.');
  const city = getCity(cityId);
  return kundali({ date, latitude: city.latitude, longitude: city.longitude });
}
