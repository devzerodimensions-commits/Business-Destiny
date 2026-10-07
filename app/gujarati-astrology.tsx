'use client';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Kundali } from '@grahan/vedic';
import { KundaliGuide, KundaliAccuracy } from './kundali-guide';
import PersonalReading from './personal-reading';
import {
  CalendarDays,
  Sunrise,
  Sunset,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Printer,
  Sparkles,
} from 'lucide-react';
import {
  cities,
  rashis,
  nakshatras,
  yogas,
  grahas,
  karanas,
  weekdays,
  tithiName,
  indiaDate,
  calculatePanchang,
  calculateBirthChart,
  getCity,
} from '@/lib/gujarati-astrology.mjs';
const number = (value: number) => new Intl.NumberFormat('gu-IN').format(value);
const clock = (date: Date | null) =>
  date
    ? new Intl.DateTimeFormat('gu-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).format(date)
    : '—';
const dateLabel = (value: string) =>
  new Intl.DateTimeFormat('gu-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value + 'T12:00:00+05:30'));
const anchors = [
  [0.5, 0.28],
  [0.25, 0.12],
  [0.12, 0.28],
  [0.28, 0.5],
  [0.12, 0.72],
  [0.25, 0.88],
  [0.5, 0.72],
  [0.75, 0.88],
  [0.88, 0.72],
  [0.72, 0.5],
  [0.88, 0.28],
  [0.75, 0.12],
];
function BirthChart({
  chart,
  selected,
  onSelect,
}: {
  chart: Kundali;
  selected: number;
  onSelect: (house: number) => void;
}) {
  return (
    <svg
      className="gu-chart"
      viewBox="0 0 500 500"
      role="group"
      aria-label="જન્મ રાશિ કુંડળી: રાશિના ક્રમાંક અને ગ્રહો"
    >
      <rect x="1" y="1" width="498" height="498" />
      <path d="M1 1L499 499M499 1L1 499M250 1L499 250L250 499L1 250Z" />
      {chart.bhavas.map((house, i) => {
        const [x, y] = anchors[i];
        return (
          <g
            key={house.bhava}
            role="button"
            tabIndex={0}
            aria-label={`ભાવ ${house.bhava}, ${rashis[house.rashi]}, ${house.grahas.length ? house.grahas.map((g) => grahas[g]).join(', ') : 'કોઈ ગ્રહ નથી'}`}
            aria-pressed={selected === house.bhava}
            onClick={() => onSelect(house.bhava)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(house.bhava);
              }
            }}
            className={selected === house.bhava ? 'selected-house' : undefined}
          >
            <circle cx={x * 500} cy={y * 500} r="38" />
            <text x={x * 500} y={y * 500 - 18} className="gu-sign-number">
              {number(house.rashi + 1)}
            </text>
            {house.grahas.map((g, j) => (
              <text key={g} x={x * 500} y={y * 500 + j * 19}>
                {grahas[g]}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
export default function GujaratiAstrology() {
  const [date, setDate] = useState(indiaDate);
  const [city, setCity] = useState('ahmedabad');
  useEffect(() => {
    let lastToday = indiaDate();
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      const now = new Date();
      const today = indiaDate(now);
      if (today !== lastToday) {
        const previousToday = lastToday;
        setDate((selected) => (selected === previousToday ? today : selected));
        lastToday = today;
      }
      clearTimeout(timer);
      const nextMidnight =
        new Date(today + 'T00:00:00+05:30').getTime() + 86400000;
      timer = setTimeout(
        refresh,
        Math.max(1000, nextMidnight - now.getTime() + 500),
      );
    };
    refresh();
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  const [tab, setTab] = useState<'panchang' | 'janmakshar'>(() =>
    typeof window !== 'undefined' && window.location.hash === '#janmakshar'
      ? 'janmakshar'
      : 'panchang',
  );
  const [birth, setBirth] = useState<{
    chart: Kundali;
    name: string;
    date: string;
    time: string;
    city: string;
  } | null>(null);
  const [birthError, setBirthError] = useState('');
  const [selectedHouse, setSelectedHouse] = useState(1);
  const day = useMemo(() => {
    try {
      return { data: calculatePanchang(date, city), error: '' };
    } catch (e) {
      return { data: null, error: (e as Error).message };
    }
  }, [date, city]);
  function changeDay(delta: number) {
    const d = new Date(date + 'T12:00:00Z');
    if (!Number.isFinite(d.getTime())) return;
    d.setUTCDate(d.getUTCDate() + delta);
    const next = d.toISOString().slice(0, 10);
    if (next >= '1900-01-01' && next <= '2100-12-31') setDate(next);
  }
  function createBirth(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBirthError('');
    setBirth(null);
    setSelectedHouse(1);
    const f = new FormData(e.currentTarget);
    const value = (key: string) => String(f.get(key) || '');
    try {
      setBirth({
        chart: calculateBirthChart(value('date'), value('time'), value('city')),
        name: value('name'),
        date: value('date'),
        time: value('time'),
        city: value('city'),
      });
    } catch (e) {
      setBirthError((e as Error).message);
    }
  }
  const p = day.data;
  return (
    <article className="gu-page" lang="gu">
      <div className="gu-intro wrap">
        <a href="/" className="textlink">
          ← મુખ્ય પૃષ્ઠ
        </a>
        <div className="eyebrow">BUSINESS DESTINY · ગુજરાત</div>
        <h1>
          પંચાંગ અને <em>જન્માક્ષર</em>
        </h1>
        <p>રોજનું પંચાંગ જાણો. તમારી જન્મ વિગતો પરથી વ્યક્તિગત કુંડળી બનાવો.</p>
        <div className="gu-tabs" role="tablist" aria-label="પંચાંગ અને જન્માક્ષર">
          <button
            id="panchang-tab"
            role="tab"
            aria-controls="panchang-panel"
            aria-selected={tab === 'panchang'}
            onClick={() => {
              setTab('panchang');
              history.replaceState(null, '', '#panchang');
            }}
          >
            <CalendarDays size={19} />
            પંચાંગ
          </button>
          <button
            id="janmakshar-tab"
            role="tab"
            aria-controls="janmakshar-panel"
            aria-selected={tab === 'janmakshar'}
            onClick={() => {
              setTab('janmakshar');
              history.replaceState(null, '', '#janmakshar');
            }}
          >
            <Sparkles size={19} />
            જન્માક્ષર
          </button>
        </div>
      </div>
      {tab === 'panchang' ? (
        <section
          className="gu-content wrap"
          id="panchang-panel"
          role="tabpanel"
          aria-labelledby="panchang-tab"
        >
          <div className="gu-toolbar">
            <label>
              તારીખ
              <input
                type="date"
                value={date}
                min="1900-01-01"
                max="2100-12-31"
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label>
              ગુજરાતનું શહેર
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="gu-day-buttons">
              <button aria-label="પાછલો દિવસ" onClick={() => changeDay(-1)}>
                <ChevronLeft />
              </button>
              <button onClick={() => setDate(indiaDate())}>આજનું પંચાંગ</button>
              <button aria-label="આગલો દિવસ" onClick={() => changeDay(1)}>
                <ChevronRight />
              </button>
            </div>
          </div>
          {day.error && (
            <p className="error" role="alert">
              {day.error}
            </p>
          )}
          {p && (
            <>
              <div className="gu-day-heading">
                <div>
                  <span className="eyebrow">
                    {getCity(city).name} · ગુજરાત · ભારતીય સમય
                  </span>
                  <h2>{dateLabel(date)}</h2>
                  <p>
                    {weekdays[p.vaar.index]} ·{' '}
                    {p.tithi[0].paksha === 'shukla' ? 'શુક્લ પક્ષ' : 'કૃષ્ણ પક્ષ'}
                  </p>
                </div>
                <div className="gu-sun-times">
                  <div>
                    <Sunrise />
                    <span>
                      સૂર્યોદય<strong>{clock(p.sunrise)}</strong>
                    </span>
                  </div>
                  <div>
                    <Sunset />
                    <span>
                      સૂર્યાસ્ત<strong>{clock(p.sunset)}</strong>
                    </span>
                  </div>
                </div>
              </div>
              <div className="gu-anga-grid">
                {[
                  {
                    label: 'તિથિ',
                    spans: p.tithi.map((s) => ({
                      name: tithiName(s.index),
                      end: s.endsAt,
                    })),
                  },
                  {
                    label: 'નક્ષત્ર',
                    spans: p.nakshatra.map((s) => ({
                      name: nakshatras[s.index],
                      end: s.endsAt,
                    })),
                  },
                  {
                    label: 'યોગ',
                    spans: p.yoga.map((s) => ({
                      name: yogas[s.index],
                      end: s.endsAt,
                    })),
                  },
                  {
                    label: 'કરણ',
                    spans: p.karana.map((s) => ({
                      name: karanas[s.name as keyof typeof karanas] || s.name,
                      end: s.endsAt,
                    })),
                  },
                ].map((item) => (
                  <div className="gu-anga" key={item.label}>
                    <span>{item.label}</span>
                    <h3>{item.spans[0].name}</h3>
                    {item.spans.map((s, i) => (
                      <p key={i}>
                        {i > 0 ? `${s.name} · ` : ''}
                        {new Intl.DateTimeFormat('gu-IN', {
                          timeZone: 'Asia/Kolkata',
                          day: 'numeric',
                          month: 'short',
                        }).format(s.end)}
                        , {clock(s.end)} સુધી
                      </p>
                    ))}
                  </div>
                ))}
              </div>
              <div className="gu-rahu">
                <div>
                  <span>રાહુ કાળ</span>
                  <h3>
                    {p.rahuKaal
                      ? `${clock(p.rahuKaal.start)} – ${clock(p.rahuKaal.end)}`
                      : 'ઉપલબ્ધ નથી'}
                  </h3>
                </div>
                <p>પરંપરા મુજબ આ સમય દરમિયાન નવા શુભ કાર્યની શરૂઆત ટાળવામાં આવે છે.</p>
              </div>
              <p className="gu-note">
                પંચાંગ સૂર્યોદયથી બીજા દિવસના સૂર્યોદય સુધી દર્શાવ્યું છે. સમય પસંદ કરેલા શહેર
                અને લાહિરી અયનાંશ પર આધારિત છે; અન્ય પંચાંગ સાથે થોડો ફરક હોઈ શકે છે.
              </p>
            </>
          )}
        </section>
      ) : (
        <section
          className="gu-content wrap"
          id="janmakshar-panel"
          role="tabpanel"
          aria-labelledby="janmakshar-tab"
        >
          <div className="gu-birth-layout">
            <div>
              <span className="eyebrow">તમારી વ્યક્તિગત કુંડળી</span>
              <h2>જન્મ વિગતો દાખલ કરો</h2>
              <p>
                જન્મની તારીખ, ચોક્કસ સમય અને જન્મસ્થળ પરથી લગ્ન, ચંદ્ર રાશિ, નક્ષત્ર અને
                ગ્રહોની સ્થિતિ જુઓ.
              </p>
              <form
                className="gu-birth-form"
                onSubmit={createBirth}
                onChange={() => {
                  setBirth(null);
                  setBirthError('');
                }}
              >
                <label>
                  નામ (વૈકલ્પિક)
                  <input name="name" maxLength={100} placeholder="તમારું નામ" />
                </label>
                <div className="gu-form-row">
                  <label>
                    જન્મ તારીખ
                    <input
                      name="date"
                      type="date"
                      min="1900-01-01"
                      max={indiaDate()}
                      required
                    />
                  </label>
                  <label>
                    જન્મ સમય (૨૪ કલાક)
                    <input name="time" type="time" required />
                  </label>
                </div>
                <label>
                  જન્મસ્થળ (ગુજરાત)
                  <select name="city" required defaultValue="ahmedabad">
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="gu-note">
                  ચોક્કસ જન્મ સમય જરૂરી છે. ગણતરી પસંદ કરેલા શહેરના કેન્દ્ર માટે થાય છે.
                  તમારી વિગતો આ ઉપકરણ પર જ ગણવામાં આવે છે અને મોકલવામાં કે સંગ્રહવામાં
                  આવતી નથી.
                </p>
                <button className="button">
                  જન્માક્ષર બનાવો <ArrowRight size={18} />
                </button>
                {birthError && (
                  <p className="error" role="alert">
                    {birthError}
                  </p>
                )}
              </form>
            </div>
            <div className="gu-birth-preview">
              {birth ? (
                <>
                  <span className="eyebrow">જન્મ રાશિ કુંડળી</span>
                  <h3>{birth.name || 'તમારું જન્માક્ષર'}</h3>
                  <p>
                    {dateLabel(birth.date)} · {birth.time} ·{' '}
                    {getCity(birth.city).name}
                  </p>
                  <BirthChart
                    chart={birth.chart}
                    selected={selectedHouse}
                    onSelect={setSelectedHouse}
                  />
                  <small>
                    આંકડા રાશિના ક્રમાંક દર્શાવે છે (૧ = મેષ). ગ્રહો તેમના ભાવમાં દર્શાવ્યા
                    છે.
                  </small>
                  <a className="button outline reading-jump" href="#personal-reading">શક્તિઓ અને સંબંધોની વાંચન નોંધ જુઓ ↓</a>
                  <KundaliGuide
                    chart={birth.chart}
                    selected={selectedHouse}
                    onSelect={setSelectedHouse}
                  />
                </>
              ) : (
                <>
                  <Sparkles size={48} strokeWidth={1} />
                  <h3>તમારા જન્માક્ષરની શરૂઆત અહીંથી</h3>
                  <p>જન્મ વિગતો ભરીને કુંડળી, લગ્ન અને ગ્રહોની સ્થિતિ જુઓ.</p>
                  <div className="gu-empty-orbit" aria-hidden="true">
                    ✦
                  </div>
                </>
              )}
            </div>
          </div>
          {birth && (
            <div className="gu-birth-results" aria-live="polite">
              <PersonalReading chart={birth.chart} />
              <div className="gu-summary">
                <div>
                  <span>લગ્ન</span>
                  <h3>{rashis[birth.chart.lagna.rashi]}</h3>
                </div>
                <div>
                  <span>ચંદ્ર રાશિ</span>
                  <h3>{rashis[birth.chart.grahas[1].rashi]}</h3>
                </div>
                <div>
                  <span>જન્મ નક્ષત્ર</span>
                  <h3>{nakshatras[birth.chart.grahas[1].nakshatra.index]}</h3>
                  <small>
                    ચરણ {number(birth.chart.grahas[1].nakshatra.pada)}
                  </small>
                </div>
              </div>
              <h2>ગ્રહોની સ્થિતિ</h2>
              <div className="gu-table-scroll">
                <table>
                  <caption className="sr-only">
                    જન્મ સમયે ગ્રહોની રાશિ અને ભાવ
                  </caption>
                  <thead>
                    <tr>
                      <th>ગ્રહ</th>
                      <th>રાશિ</th>
                      <th>અંશ</th>
                      <th>ભાવ</th>
                      <th>નક્ષત્ર</th>
                    </tr>
                  </thead>
                  <tbody>
                    {birth.chart.grahas.map((g) => (
                      <tr key={g.graha}>
                        <th>
                          {grahas[g.graha]}
                          {g.retrograde ? ' (વક્રી)' : ''}
                        </th>
                        <td>{rashis[g.rashi]}</td>
                        <td>
                          {new Intl.NumberFormat('gu-IN', {
                            maximumFractionDigits: 2,
                          }).format(g.degreeInRashi)}
                          °
                        </td>
                        <td>{number(g.bhava)}</td>
                        <td>{nakshatras[g.nakshatra.index]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="gu-note">
                લાહિરી અયનાંશ · પૂર્ણ રાશિ ભાવ પદ્ધતિ · સરેરાશ રાહુ-કેતુ. આ ગણતરી આધારિત
                જન્માક્ષર છે. વિગતવાર પરંપરાગત અર્થઘટન માટે Tejas Parikh સાથે પરામર્શ
                કરી શકો છો.
              </p>
              <KundaliAccuracy chart={birth.chart} />
              <div className="actions">
                <button
                  className="button outline gu-print"
                  onClick={() => window.print()}
                >
                  <Printer size={17} />
                  પ્રિન્ટ / PDF સાચવો
                </button>
                <a className="button" href="/?service=Janmakshar#contact">
                  પરામર્શ માટે સંપર્ક કરો <ArrowRight size={17} />
                </a>
              </div>
            </div>
          )}
        </section>
      )}
      <div className="gu-bottom wrap">
        <p>
          Business Destiny · પરંપરાગત જ્ઞાન સાથે તમારા પ્રશ્નો માટે એક વિચારશીલ શરૂઆત.
        </p>
        <small>
          ગણતરી આધાર:{' '}
          <a
            href="https://github.com/svarbhanu/grahan"
            target="_blank"
            rel="noreferrer"
          >
            Grahan
          </a>
        </small>
      </div>
    </article>
  );
}
