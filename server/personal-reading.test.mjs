import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateBirthChart } from '../lib/gujarati-astrology.mjs';
import {
  personalReading,
  signLords,
  planetThemes,
} from '../lib/personal-reading.mjs';
test('Personal reading uses actual chart rulers and preserves calculated relationship placements', () => {
  const chart = calculateBirthChart('1990-06-15', '10:30', 'ahmedabad');
  const r = personalReading(chart);
  assert.equal(chart.lagna.rashi, 4);
  assert.equal(r.themes[0].planet.graha, 'sun');
  assert.equal(r.themes[1].planet.graha, 'saturn');
  assert.equal(r.seventh.rashi, 10);
  assert.equal(r.seventhLord.graha, 'saturn');
  assert.equal(
    r.venus,
    chart.grahas.find((g) => g.graha === 'venus'),
  );
  assert.equal(r.relationshipTheme, planetThemes.saturn.relationship);
});
test('All twelve signs resolve to supported traditional rulers without duplicate themes', () => {
  for (let rashi = 0; rashi < 12; rashi++) {
    const chart = structuredClone(
      calculateBirthChart('1990-06-15', '10:30', 'ahmedabad'),
    );
    chart.lagna.rashi = rashi;
    chart.grahas.find((g) => g.graha === 'moon').rashi = rashi;
    chart.bhavas.find((h) => h.bhava === 7).rashi = (rashi + 6) % 12;
    const r = personalReading(chart);
    assert.equal(r.themes.length, 1);
    assert.equal(r.themes[0].planet.graha, signLords[rashi]);
    assert.ok(r.themes[0].theme.strength);
    assert.ok(r.themes[0].theme.challenge);
    assert.ok(r.relationshipTheme);
  }
});
