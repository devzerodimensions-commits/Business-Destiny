'use client';
import { useEffect, useState, type CSSProperties } from 'react';
import type { ChakraSettings } from './chakra';

export default function PalmChakra({ settings }: { settings: ChakraSettings }) {
  const [paused, setPaused] = useState(true);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPaused(preference.matches || !settings.autoRotate);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, [settings.autoRotate]);
  return (
    <div className="palm-chakra">
      <div
        className="palm-chakra-art"
        style={{ transform: `scale(${settings.scale})` }}
      >
        <img
          className="palm-zodiac-ring"
          src="/media/palm-zodiac-wheel.png"
          alt=""
          style={
            {
              animationDuration: `${100 / Math.max(settings.speed, 0.01)}s`,
              animationDirection:
                settings.direction === 'clockwise' ? 'normal' : 'reverse',
              animationPlayState:
                paused || !settings.speed ? 'paused' : 'running',
            } as CSSProperties
          }
        />
        <img
          className="palm-illustration"
          src="/media/palm-astrology-hand.png"
          alt="Palmistry hand with astrological symbols in front of a zodiac chakra"
        />
      </div>
      <button
        type="button"
        className="palm-motion-control"
        onClick={() => setPaused(!paused)}
        aria-pressed={!paused}
      >
        {paused ? 'Play chakra animation' : 'Pause chakra animation'}
      </button>
    </div>
  );
}
