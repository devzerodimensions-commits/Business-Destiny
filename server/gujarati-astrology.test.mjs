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

// Reference values generated using Swiss Ephemeris by the upstream project's fixture generator:
// https://github.com/svarbhanu/grahan/blob/main/scripts/generate_fixtures.py
// https://github.com/svarbhanu/grahan/blob/main/packages/vedic/fixtures/kundali-grid.json
import references from './fixtures/kundali-reference.json' with { type: 'json' };
import { kundali } from '@grahan/vedic';
import { dateFromZonedTime } from '@grahan/core';
test('Birth-chart engine agrees with 39 published Swiss Ephemeris reference charts', () => {
  const difference = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
  for (const ref of references.data) {
    const c = kundali({
      date: new Date(ref.utc),
      latitude: ref.lat,
      longitude: ref.lon,
    });
    assert.ok(
      difference(c.lagna.longitude, ref.lagnaSidereal) < 0.01,
      `Ascendant ${ref.utc} ${ref.site}`,
    );
    assert.ok(Math.abs(c.ayanamsa - ref.ayanamsa) < 0.0001);
    for (const g of c.grahas) {
      assert.ok(
        difference(g.longitude, ref.bodiesSidereal[g.graha]) <
          (g.graha === 'moon' ? 0.05 : 0.02),
        `${g.graha} ${ref.utc}`,
      );
      assert.equal(g.retrograde, ref.retrograde[g.graha]);
      assert.equal(g.bhava, ((g.rashi - c.lagna.rashi + 12) % 12) + 1);
    }
  }
});
test('Historical Indian birth times use the recorded timezone instead of a fixed modern offset', () => {
  const date = dateFromZonedTime(
    { year: 1943, month: 6, day: 15, hour: 10, minute: 30, second: 0 },
    'Asia/Kolkata',
  );
  assert.equal(date.toISOString(), '1943-06-15T04:00:00.000Z');
  const expected = kundali({
    date,
    latitude: cities[0].latitude,
    longitude: cities[0].longitude,
  });
  const actual = calculateBirthChart('1943-06-15', '10:30', 'ahmedabad');
  assert.equal(actual.lagna.longitude, expected.lagna.longitude);
});
