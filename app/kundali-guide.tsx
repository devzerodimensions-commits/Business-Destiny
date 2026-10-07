import type { Kundali } from '@grahan/vedic';
import { rashis, nakshatras, grahas } from '@/lib/gujarati-astrology.mjs';
const guNumber = (value: number) =>
  new Intl.NumberFormat('gu-IN', {
    numberingSystem: 'gujr',
    maximumFractionDigits: 2,
  }).format(value);
export function KundaliGuide({
  chart,
  selected,
  onSelect,
}: {
  chart: Kundali;
  selected: number;
  onSelect: (house: number) => void;
}) {
  const house = chart.bhavas[selected - 1];
  const moon = chart.grahas.find((g) => g.graha === 'moon')!;
  const occupants = chart.grahas.filter((g) => g.bhava === selected);
  return (
    <div className="kundali-guide">
      <h4>તમારી કુંડળી કેવી રીતે વાંચવી?</h4>
      <p>
        ઉપરનો મધ્યનો ખાનો પ્રથમ ભાવ (લગ્ન) છે. ત્યાર પછી ભાવો ઘડિયાળની વિરુદ્ધ દિશામાં
        ગણાય છે. ખાને લખેલો આંકડો રાશિનો ક્રમાંક છે, ભાવનો ક્રમાંક નહીં.
      </p>
      <div className="kundali-personal">
        <p>
          <strong>તમારું લગ્ન:</strong> {rashis[chart.lagna.rashi]},{' '}
          {guNumber(chart.lagna.degreeInRashi)}°. જન્મ સમયે પૂર્વ ક્ષિતિજ પર ઉદિત
          રાશિ.
        </p>
        <p>
          <strong>તમારી ચંદ્ર રાશિ:</strong> {rashis[moon.rashi]}. જન્મ સમયે ચંદ્ર{' '}
          {guNumber(moon.bhava)}મા ભાવમાં, {nakshatras[moon.nakshatra.index]}{' '}
          નક્ષત્રના ચરણ {guNumber(moon.nakshatra.pada)}માં હતો.
        </p>
      </div>
      <p className="kundali-select-label">
        ચિત્રનો ખાનો અથવા નીચેનો ભાવ પસંદ કરો:
      </p>
      <div
        className="kundali-house-buttons"
        role="group"
        aria-label="ભાવ પસંદ કરો"
      >
        {chart.bhavas.map((h) => (
          <button
            type="button"
            key={h.bhava}
            aria-pressed={selected === h.bhava}
            onClick={() => onSelect(h.bhava)}
          >
            ભાવ {guNumber(h.bhava)}
          </button>
        ))}
      </div>
      <div className="kundali-house-detail" aria-live="polite">
        <h4>
          ભાવ {guNumber(selected)} · {rashis[house.rashi]}
        </h4>
        <p>ચિત્રમાં આ રાશિનો ક્રમાંક {guNumber(house.rashi + 1)} છે.</p>
        {occupants.length ? (
          occupants.map((g) => (
            <div className="kundali-planet-detail" key={g.graha}>
              <strong>
                {grahas[g.graha]}
                {g.retrograde ? ' · વક્રી' : ''}
              </strong>
              <p>
                {rashis[g.rashi]} રાશિમાં {guNumber(g.degreeInRashi)}° ·{' '}
                {nakshatras[g.nakshatra.index]} · ચરણ{' '}
                {guNumber(g.nakshatra.pada)}
              </p>
              <p>નવાંશ (D9) રાશિ: {rashis[g.navamsaRashi]}</p>
            </div>
          ))
        ) : (
          <p>
            આ ગણતરીમાં દર્શાવેલા નવ ગ્રહોમાંથી કોઈ ગ્રહ આ ભાવમાં નથી. ખાલી ભાવથી કોઈ શુભ
            કે અશુભ પરિણામ નક્કી થતું નથી.
          </p>
        )}
      </div>
      <details className="kundali-sign-key">
        <summary>રાશિના આંકડા ઓળખો</summary>
        <ol>
          {rashis.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </details>
    </div>
  );
}
export function KundaliAccuracy({ chart }: { chart: Kundali }) {
  return (
    <section className="kundali-accuracy">
      <h2>ગણતરી અને સમજણનો આધાર</h2>
      <div className="kundali-explanation-grid">
        <div>
          <h3>અહીં શું ગણવામાં આવે છે?</h3>
          <dl>
            <dt>રાશિ અને અંશ</dt>
            <dd>દરેક રાશિ ૩૦°નો વિભાગ છે. અંશ ગ્રહ તે રાશિમાં ક્યાં છે તે બતાવે છે.</dd>
            <dt>નક્ષત્ર અને ચરણ</dt>
            <dd>નિરયણ રાશિચક્રના ૨૭ નક્ષત્રો છે. દરેક નક્ષત્રના ચાર ચરણ હોય છે.</dd>
            <dt>ભાવ</dt>
            <dd>
              અહીં પૂર્ણ રાશિ ભાવ પદ્ધતિ વપરાય છે: લગ્નની આખી રાશિ પ્રથમ ભાવ, પછીની
              રાશિ બીજો ભાવ.
            </dd>
            <dt>વક્રી</dt>
            <dd>
              પૃથ્વી પરથી ગ્રહની દેખાતી પાછળની ગતિ. તે ગ્રહ ખરેખર પોતાની કક્ષામાં ઊલટો
              ચાલે છે એવો અર્થ નથી.
            </dd>
            <dt>રાહુ અને કેતુ</dt>
            <dd>
              ચંદ્રની કક્ષા અને સૂર્યના દેખાતા માર્ગના છેદબિંદુઓ છે; ભૌતિક ગ્રહો નથી. અહીં
              સરેરાશ ચંદ્ર ગાંઠો વપરાય છે.
            </dd>
            <dt>નવાંશ (D9)</dt>
            <dd>દરેક રાશિને નવ ભાગમાં વહેંચીને મેળવેલું પરંપરાગત વિભાગીય સ્થાન.</dd>
          </dl>
        </div>
        <div>
          <h3>ચોકસાઈ શેના પર આધારિત છે?</h3>
          <p>
            આ પરિણામ તમારી આપેલી જન્મ તારીખ, સમય અને પસંદ કરેલા શહેર પર આધારિત છે. સમય
            ખોટો હોય તો લગ્ન, ભાવ અને અન્ય વિગતો બદલાઈ શકે છે.
          </p>
          <p>
            સ્થળ માટે શહેરના કેન્દ્રનાં અક્ષાંશ-રેખાંશ લેવાય છે. ચોક્કસ જન્મસ્થળ અને જન્મસમય સાથે
            નિષ્ણાત દ્વારા ચકાસણી કરાવવાથી વધુ યોગ્ય સરખામણી થઈ શકે છે.
          </p>
          <p>
            લાહિરી અયનાંશ: {guNumber(chart.ayanamsa)}°. જન્મ સમય ભારતના
            Asia/Kolkata સમયક્ષેત્ર અનુસાર રૂપાંતરિત થાય છે. જૂની તારીખો માટે તે સમયના
            નોંધાયેલા સમયક્ષેત્રનો ઉપયોગ થાય છે.
          </p>
          <p>
            ગણતરી આધાર:{' '}
            <a
              href="https://github.com/svarbhanu/grahan"
              target="_blank"
              rel="noreferrer"
            >
              Grahanનું જાહેર ગણતરી એન્જિન અને પદ્ધતિ
            </a>
            . પરીક્ષણોમાં પ્રકાશિત Swiss Ephemeris સંદર્ભ સાથે ગ્રહસ્થિતિ અને લગ્નની
            સરખામણી કરવામાં આવે છે. અન્ય અયનાંશ અથવા ભાવ પદ્ધતિ ધરાવતી કુંડળીમાં ફરક હોઈ
            શકે છે.
          </p>
          <div className="kundali-honesty">
            <strong>ગણતરી અને ભવિષ્યકથન અલગ છે</strong>
            <p>
              અહીં જન્મ સમયની ગણતરી આધારિત ગ્રહસ્થિતિ સમજાવવામાં આવે છે. જ્યોતિષીય
              અર્થઘટન પરંપરાગત માન્યતાઓ પર આધારિત છે; વ્યક્તિનું ભવિષ્ય વિશ્વસનીય રીતે નક્કી
              કરે છે તે વૈજ્ઞાનિક રીતે સાબિત નથી. અહીં સફળતા, લગ્ન, રોગ, આયુષ્ય કે સંપત્તિ અંગે
              નિશ્ચિત દાવા કરવામાં આવતા નથી.
            </p>
            <p><a href="https://spaceplace.nasa.gov/constellations/en/" target="_blank" rel="noreferrer">ખગોળશાસ્ત્ર અને જ્યોતિષ વચ્ચેનો ફરક — NASA</a></p>
          </div>
        </div>
      </div>
    </section>
  );
}
