'use client';
import { useEffect, useRef, useState } from 'react';
import type { Material, Group, CanvasTexture } from 'three';

export default function Chakra({
  accent,
  highlight,
  fallback,
}: {
  accent: string;
  highlight: string;
  fallback: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const [isPaused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};
    async function mount() {
      const [T, { OrbitControls }, { RoomEnvironment }] = await Promise.all([
        import('three'),
        import('three/addons/controls/OrbitControls.js'),
        import('three/addons/environments/RoomEnvironment.js'),
      ]);
      if (cancelled || !host.current) return;
      const node = host.current;
      const renderer = new T.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      renderer.domElement.tabIndex = 0;
      renderer.domElement.setAttribute(
        'aria-label',
        'Interactive 3D astrology chakra. Drag to rotate; use arrow keys when focused.',
      );
      node.appendChild(renderer.domElement);
      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(39, 1, 0.1, 100);
      camera.position.set(0, 0, 10.5);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.rotateSpeed = 0.5;
      controls.listenToKeyEvents(renderer.domElement);
      const pmrem = new T.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      const environment = pmrem.fromScene(room, 0.04);
      scene.environment = environment.texture;
      room.dispose();
      pmrem.dispose();
      scene.add(new T.AmbientLight(0xffedce, 1.3));
      const key = new T.DirectionalLight(0xffecc8, 4);
      key.position.set(4, 5, 7);
      scene.add(key);
      const fill = new T.DirectionalLight(0xaacbff, 2);
      fill.position.set(-4, -1, 4);
      scene.add(fill);
      const gold = new T.MeshStandardMaterial({
        color: accent,
        metalness: 0.86,
        roughness: 0.23,
      });
      const paleGold = new T.MeshStandardMaterial({
        color: highlight,
        metalness: 0.74,
        roughness: 0.28,
      });
      const navy = new T.MeshStandardMaterial({
        color: 0x082746,
        metalness: 0.72,
        roughness: 0.32,
      });
      const root = new T.Group();
      root.rotation.set(0.22, -0.25, 0);
      scene.add(root);
      const wheel = new T.Group();
      root.add(wheel);
      const ring = (
        radius: number,
        tube: number,
        material: Material,
        parent: Group = wheel,
      ) => {
        const mesh = new T.Mesh(
          new T.TorusGeometry(radius, tube, 12, 180),
          material,
        );
        parent.add(mesh);
        return mesh;
      };
      const back = new T.Mesh(
        new T.CylinderGeometry(2.43, 2.43, 0.11, 128),
        navy,
      );
      back.rotation.x = Math.PI / 2;
      back.position.z = -0.09;
      wheel.add(back);
      [2.47, 2.39, 1.94, 1.87, 0.89].forEach((r, i) =>
        ring(r, i === 0 ? 0.042 : 0.018, i % 2 ? gold : paleGold),
      );
      const ticks = new T.Group();
      wheel.add(ticks);
      for (let i = 0; i < 120; i++) {
        const angle = (i * Math.PI) / 60;
        const major = i % 10 === 0;
        const tick = new T.Mesh(
          new T.BoxGeometry(0.012, major ? 0.115 : 0.045, 0.016),
          gold,
        );
        tick.position.set(
          Math.sin(angle) * 2.32,
          Math.cos(angle) * 2.32,
          0.015,
        );
        tick.rotation.z = -angle;
        ticks.add(tick);
      }
      const symbols = [
        '♈',
        '♉',
        '♊',
        '♋',
        '♌',
        '♍',
        '♎',
        '♏',
        '♐',
        '♑',
        '♒',
        '♓',
      ];
      const names = [
        'ARIES',
        'TAURUS',
        'GEMINI',
        'CANCER',
        'LEO',
        'VIRGO',
        'LIBRA',
        'SCORPIO',
        'SAGITTARIUS',
        'CAPRICORN',
        'AQUARIUS',
        'PISCES',
      ];
      const textures: CanvasTexture[] = [];
      for (let i = 0; i < 12; i++) {
        const angle = Math.PI / 2 - (i * Math.PI) / 6;
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 180;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = highlight;
        ctx.textAlign = 'center';
        ctx.font = '82px Segoe UI Symbol, sans-serif';
        ctx.fillText(symbols[i], 128, 96);
        ctx.font = '19px sans-serif';
        ctx.fillText(names[i], 128, 143);
        const texture = new T.CanvasTexture(canvas);
        texture.colorSpace = T.SRGBColorSpace;
        textures.push(texture);
        const label = new T.Mesh(
          new T.PlaneGeometry(0.57, 0.4),
          new T.MeshBasicMaterial({
            map: texture,
            transparent: true,
            depthWrite: false,
            side: T.DoubleSide,
          }),
        );
        label.position.set(
          Math.cos(angle) * 2.14,
          Math.sin(angle) * 2.14,
          0.055,
        );
        wheel.add(label);
        const divider = new T.Mesh(new T.BoxGeometry(0.012, 0.44, 0.018), gold);
        const a = angle + Math.PI / 12;
        divider.position.set(Math.cos(a) * 2.16, Math.sin(a) * 2.16, 0.018);
        divider.rotation.z = a - Math.PI / 2;
        wheel.add(divider);
      }
      const inner = new T.Group();
      root.add(inner);
      const orbitOne = ring(1.28, 0.008, gold, inner);
      orbitOne.rotation.x = 0.42;
      const orbitTwo = ring(1.63, 0.009, paleGold, inner);
      orbitTwo.rotation.y = -0.36;
      const sun = new T.Mesh(
        new T.SphereGeometry(0.49, 48, 32),
        new T.MeshStandardMaterial({
          color: 0xf5b841,
          emissive: 0x9f4d06,
          emissiveIntensity: 0.45,
          metalness: 0.7,
          roughness: 0.24,
        }),
      );
      inner.add(sun);
      const solarHalo = ring(0.65, 0.012, paleGold, inner);
      solarHalo.rotation.y = 0.28;
      for (let i = 0; i < 24; i++) {
        const a = (i * Math.PI) / 12;
        const ray = new T.Mesh(
          new T.ConeGeometry(0.028, i % 2 ? 0.1 : 0.18, 4),
          gold,
        );
        ray.position.set(Math.cos(a) * 0.77, Math.sin(a) * 0.77, 0);
        ray.rotation.z = a - Math.PI / 2;
        inner.add(ray);
      }
      const colours = [
        0x2baf8f, 0xaabbca, 0xb7381c, 0xbd843e, 0xe5c58a, 0x385780, 0x616771,
        0xecc882,
      ];
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4 + 0.25,
          r = i % 2 ? 1.28 : 1.63;
        const planet = new T.Mesh(
          new T.SphereGeometry(i === 4 ? 0.16 : 0.105, 24, 16),
          new T.MeshStandardMaterial({
            color: colours[i],
            metalness: 0.55,
            roughness: 0.3,
          }),
        );
        planet.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.12);
        inner.add(planet);
        if (i === 4) {
          const saturnRing = new T.Mesh(
            new T.TorusGeometry(0.25, 0.018, 8, 64),
            paleGold,
          );
          saturnRing.rotation.x = 0.8;
          planet.add(saturnRing);
        }
      }
      const gimbal = new T.Group();
      root.add(gimbal);
      const orbit = ring(2.78, 0.013, gold, gimbal);
      orbit.rotation.set(0.8, 0.34, -0.35);
      const orbitB = ring(2.69, 0.009, paleGold, gimbal);
      orbitB.rotation.set(-0.6, 0.22, 0.7);
      const reduced = matchMedia('(prefers-reduced-motion: reduce)');
      paused.current = reduced.matches;
      setPaused(reduced.matches);
      let visible = true, dirty = true;
      controls.addEventListener('change', () => { dirty = true; });
      const intersection = new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
      });
      intersection.observe(node);
      const resize = new ResizeObserver(() => {
        const w = node.clientWidth,
          h = node.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        dirty = true;
      });
      resize.observe(node);
      let raf = 0,
        last = performance.now(),
        time = 0;
      const animate = (now: number) => {
        raf = requestAnimationFrame(animate);
        if(now-last<1000/24)return;
        const delta = Math.min((now - last) / 1000, 0.05);
        last = now;
        if (!visible) return;
        if (!paused.current) {
          time += delta;
          wheel.rotation.z = time * 0.025;
          gimbal.rotation.z = -time * 0.04;
          inner.rotation.z = -time * 0.018;
          root.position.y = Math.sin(time * 0.6) * 0.06;
        }
        controls.update();
        if(!paused.current||dirty){renderer.render(scene, camera);dirty=false;}
      };
      raf = requestAnimationFrame(animate);
      node.dataset.ready = 'true';
      const lost = (event: Event) => {
        event.preventDefault();
        setFailed(true);
      };
      renderer.domElement.addEventListener('webglcontextlost', lost);
      cleanup = () => {
        cancelAnimationFrame(raf);
        resize.disconnect();
        intersection.disconnect();
        controls.dispose();
        renderer.domElement.removeEventListener('webglcontextlost', lost);
        scene.traverse((o) => {
          if (o instanceof T.Mesh) {
            o.geometry.dispose();
            (Array.isArray(o.material) ? o.material : [o.material]).forEach(
              (m) => m.dispose(),
            );
          }
        });
        textures.forEach((t) => t.dispose());
        environment.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }
    mount().catch(() => {
      if (!cancelled) setFailed(true);
    });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [accent, highlight]);
  return (
    <div className="chakra-scene">
      <div className="chakra-glow" />
      {failed ? (
        <img
          className="chakra-fallback"
          src={fallback}
          alt="Business Destiny planetary emblem"
        />
      ) : (
        <div className="chakra-canvas" ref={host} />
      )}
      <div className="chakra-controls">
        <span>
          {failed
            ? 'THE BUSINESS DESTINY EMBLEM'
            : 'DRAG TO EXPLORE · 3D ASTROLOGY CHAKRA'}
        </span>
        {!failed && (
          <button
            type="button"
            onClick={() => {
              paused.current = !paused.current;
              setPaused(paused.current);
            }}
            aria-label={
              isPaused ? 'Play chakra animation' : 'Pause chakra animation'
            }
          >
            {isPaused ? 'Play motion' : 'Pause motion'}
          </button>
        )}
      </div>
    </div>
  );
}
