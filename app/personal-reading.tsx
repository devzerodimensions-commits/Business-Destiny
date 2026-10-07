import type { Kundali } from '@grahan/vedic';
import { personalReading } from '@/lib/personal-reading.mjs';
import { rashis, grahas } from '@/lib/gujarati-astrology.mjs';
const n = (value: number) =>
  new Intl.NumberFormat('gu-IN', { numberingSystem: 'gujr' }).format(value);
export default function PersonalReading({ chart }: { chart: Kundali }) {
  const reading = personalReading(chart);
  return (
    <section className="personal-reading" id="personal-reading">
      <div className="eyebrow">પરંપરાગત જ્યોતિષીય અર્થઘટન</div>
      <h2>તમારા સ્વભાવ અને સંબંધો માટે વિચારબિંદુઓ</h2>
      <p className="reading-intro">
        આ તમારી કુંડળી પર આધારિત સરળ, આપમેળે તૈયાર થયેલી પરંપરાગત વાંચન નોંધ છે. તેને તમારી
        સાચી વ્યક્તિગત અનુભૂતિ સાથે સરખાવો. આ વ્યક્તિત્વ પરીક્ષણ, સંપૂર્ણ જ્યોતિષીય વિશ્લેષણ
        અથવા નિશ્ચિત ભવિષ્યવાણી નથી.
      </p>
      <div className="reading-columns">
        <article>
          <h3>તમારી સંભવિત શક્તિઓ</h3>
          {reading.themes.map((item, i) => (
            <div className="reading-theme" key={item.planet.graha}>
              <span className="reading-basis">
                આધાર:{' '}
                {item.from === 'lagna'
                  ? `${rashis[chart.lagna.rashi]} લગ્ન`
                  : `${rashis[chart.grahas.find((g) => g.graha === 'moon')!.rashi]} ચંદ્ર રાશિ`}
                નો સ્વામી {grahas[item.planet.graha as keyof typeof grahas]} ·{' '}
                {rashis[item.planet.rashi]} · ભાવ {n(item.planet.bhava)}
              </span>
              <h4>{item.theme.title}</h4>
              <p>{item.theme.strength}</p>
            </div>
          ))}
        </article>
        <article>
          <h3>ધ્યાન આપવા અને સુધારવાના મુદ્દા</h3>
          {reading.themes.map((item) => (
            <div className="reading-theme" key={item.planet.graha}>
              <h4>{item.theme.title}</h4>
              <p>{item.theme.challenge}</p>
              <div className="reading-action">
                <strong>વ્યવહારુ પગલું</strong>
                <p>{item.theme.action}</p>
              </div>
            </div>
          ))}
          <small>
            આ પ્રશ્નો આત્મવિચાર માટે છે; તેઓ તમારામાં આ નબળાઈઓ છે એવો નિષ્કર્ષ આપતા નથી.
          </small>
        </article>
      </div>
      <article className="reading-marriage">
        <span className="eyebrow">લગ્ન અને સંબંધો</span>
        <h3>તમારી કુંડળીમાં સંબંધોનો સંદર્ભ</h3>
        <div className="reading-marriage-facts">
          <div>
            <span>સાતમા ભાવની રાશિ</span>
            <strong>{rashis[reading.seventh.rashi]}</strong>
          </div>
          <div>
            <span>સાતમા ભાવનો સ્વામી</span>
            <strong>
              {grahas[reading.seventhLord.graha as keyof typeof grahas]} · ભાવ{' '}
              {n(reading.seventhLord.bhava)}
            </strong>
          </div>
          <div>
            <span>શુક્રનું સ્થાન</span>
            <strong>
              {rashis[reading.venus.rashi]} · ભાવ {n(reading.venus.bhava)}
            </strong>
          </div>
        </div>
        <p>
          પરંપરાગત જ્યોતિષમાં સાતમો ભાવ અને તેનો સ્વામી ભાગીદારી અને લગ્ન માટે જોવામાં આવે
          છે. તમારી કુંડળીમાં {grahas[reading.seventhLord.graha as keyof typeof grahas]} સાતમા ભાવનો સ્વામી
          છે અને {rashis[reading.seventhLord.rashi]} રાશિમાં છે. શુક્રની નવાંશ રાશિ{' '}
          {rashis[reading.venus.navamsaRashi]} છે.
        </p>
        <div className="reading-action">
          <strong>સંબંધમાં વિચારવા જેવી બાબત</strong>
          <p>{reading.relationshipTheme}</p>
        </div>
        <p>
          લગ્ન વિશે વ્યવહારુ રીતે વાત કરતાં પરસ્પર સહમતી, વિશ્વાસ, મતભેદ ઉકેલવાની રીત,
          પરિવારની અપેક્ષાઓ અને જીવનલક્ષ્યો પર ચર્ચા કરો.
        </p>
        <p className="gu-note">
          આ એક વ્યક્તિની કુંડળીની પ્રાથમિક નોંધ છે. તેનાથી લગ્ન ક્યારે થશે, લગ્નજીવન સારું કે
          ખરાબ રહેશે, છૂટાછેડા થશે કે જીવનસાથી કેવો હશે તેનો વિશ્વસનીય નિષ્કર્ષ કાઢી શકાય
          નહીં. અહીં ગુણમિલાન, દશા, ગોચર, ગ્રહબળ અથવા દોષનું સંપૂર્ણ મૂલ્યાંકન કરવામાં આવ્યું
          નથી.
        </p>
      </article>
      <details className="reading-method">
        <summary>આ વાંચન કેવી રીતે તૈયાર થાય છે?</summary>
        <p>
          લગ્નની રાશિના સ્વામી અને ચંદ્ર રાશિના સ્વામીના પરંપરાગત ગ્રહપ્રતીકો પરથી
          વિચારબિંદુઓ પસંદ થાય છે. બંનેનો સ્વામી એક હોય તો તે મુદ્દો એક જ વાર બતાવાય છે.
          સંબંધની નોંધ સાતમા ભાવના સ્વામી પર આધારિત છે; તેની ગણતરીની સ્થિતિ અને શુક્રની
          સ્થિતિ અલગથી દેખાડવામાં આવે છે.
        </p>
        <p>
          ગ્રહ કારકત્વ અને સાતમા ભાવનો પરંપરાગત સંદર્ભ:{' '}
          <a
            href="https://vedic-astro.s3.amazonaws.com/books/bhrihat_parasara_hora_shastra.pdf"
            target="_blank"
            rel="noreferrer"
          >
            બૃહત્ પરાશર હોરા શાસ્ત્ર — અંગ્રેજી અનુવાદ, અધ્યાય ૩ અને ૧૮
          </a>
          . અહીંનાં આત્મવિચારના પ્રશ્નો અને વ્યવહારુ પગલાં સરળ સંપાદકીય સૂચનો છે, ગ્રંથના
          શાબ્દિક અનુવાદ નથી.
        </p>
        <p>
          આ આપમેળે તૈયાર થયેલું વાંચન છે; Tejas Parikh દ્વારા વ્યક્તિગત રીતે સમીક્ષા કરવામાં
          આવી છે એવો દાવો કરવામાં આવતો નથી.
        </p>
      </details>
    </section>
  );
}
