import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePanchang,
  calculateBirthChart,
  cities,
  indiaDate,
  tithiName,
} from '../lib/gujarati-astrology.mjs';
test('Ahmedabad 7 October 2026 agrees with published Drik Panchang to within one minute', () => {
  const p = calculatePanchang('2026-10-07', 'ahmedabad');
  assert.equal(tithiName(p.tithi[0].index), 'બારસ');
  assert.equal(p.tithi[0].paksha, 'krishna');
  assert.equal(p.nakshatra[0].index, 9);
  for (const [actual, expected] of [
    [p.sunrise, '2026-10-07T06:33:00+05:30'],
    [p.sunset, '2026-10-07T18:21:00+05:30'],
    [p.tithi[0].endsAt, '2026-10-07T23:16:00+05:30'],
    [p.nakshatra[0].endsAt, '2026-10-07T21:40:00+05:30'],
    [p.rahuKaal.start, '2026-10-07T12:27:00+05:30'],
  ])
    assert.ok(Math.abs(actual - new Date(expected)) < 60000);
});
test('Every 2026 date calculates across Gujarat, including year boundaries', () => {
  for (const c of cities)
    for (const date of ['2026-01-01', '2026-06-21', '2026-12-31']) {
      const p = calculatePanchang(date, c.id);
      assert.equal(indiaDate(p.sunrise), date);
      assert.ok(p.sunset > p.sunrise);
      assert.ok(p.tithi.length > 0);
      assert.ok(p.tithi.every((s) => s.endsAt > p.window.start));
    }
  for (let i = 0; i < 365; i++) {
    const d = new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10);
    assert.ok(calculatePanchang(d, 'ahmedabad').sunrise);
  }
});
test('Birth chart respects IST and changing birth time, and includes nine planets and twelve houses', () => {
  const a = calculateBirthChart('1990-06-15', '10:30', 'ahmedabad');
  const b = calculateBirthChart('1990-06-15', '18:30', 'ahmedabad');
  assert.equal(a.grahas.length, 9);
  assert.equal(a.bhavas.length, 12);
  assert.equal(a.lagna.rashi, 4);
  assert.notEqual(a.lagna.rashi, b.lagna.rashi);
  assert.equal(a.grahas[1].rashi, 10);
  assert.ok(a.grahas.every((g) => g.bhava >= 1 && g.bhava <= 12));
});
test('Invalid dates, unknown cities, invalid times and future births are rejected', () => {
  for (const date of ['', '2026-02-30', '1899-12-31', '2101-01-01'])
    assert.throws(() => calculatePanchang(date, 'ahmedabad'));
  assert.throws(() => calculatePanchang('2026-10-07', 'unknown'));
  assert.throws(() => calculateBirthChart('1990-06-15', '25:00', 'surat'));
  assert.throws(() => calculateBirthChart('2099-01-01', '12:00', 'surat'));
  assert.equal(indiaDate(new Date('2026-10-07T20:00:00Z')), '2026-10-08');
});
