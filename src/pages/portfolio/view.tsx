import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { PortfolioCard } from '../../types';
import portfolio from '../../assets/info.json';
import { scrollState, updateScroll, attachScrollInput } from './scroll';
import Canvas from './canvas';

import styles from './portfolio.module.scss';

// Pixels of scroll to travel past one card.
const SEGMENT = 1600;
const MIN_SCALE = 1;
const MAX_SCALE = 3;
// Progress at which the current card starts fading out.
const FADE_START = 0.4;

// Newest first; info.json stays in chronological order.
const cards = (portfolio as PortfolioCard[]).slice().reverse();
const trueMod = (n: number, m: number) => ((n % m) + m) % m;

export default function Portfolio() {
  const [index, setIndex] = useState(0);
  const currentRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const detach = attachScrollInput();
    let raf = 0;
    let last = performance.now();
    let shownIndex = 0;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      updateScroll(dt);

      const s = scrollState.current;
      const idx = trueMod(Math.floor(s / SEGMENT), cards.length);
      const p = trueMod(s, SEGMENT) / SEGMENT;

      if (idx !== shownIndex) {
        shownIndex = idx;
        setIndex(idx);
      }
      if (currentRef.current) {
        const scale = MIN_SCALE + p * (MAX_SCALE - MIN_SCALE);
        const fade =
          p < FADE_START ? 1 : 1 - (p - FADE_START) / (1 - FADE_START);
        currentRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
        currentRef.current.style.opacity = `${fade}`;
      }
      if (nextRef.current) {
        nextRef.current.style.transform = `translate(-50%, -50%) scale(${p * MIN_SCALE})`;
        nextRef.current.style.opacity = `${Math.min(1, p * 2)}`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      detach();
    };
  }, []);

  const nextIndex = trueMod(index + 1, cards.length);

  return (
    <div className={styles.container}>
      <Canvas />
      <div ref={nextRef} className={styles.slot} style={{ zIndex: 1 }}>
        <Item card={cards[nextIndex]} />
      </div>
      <div ref={currentRef} className={styles.slot} style={{ zIndex: 2 }}>
        <Item card={cards[index]} />
      </div>
      <header className={styles.header}>
        <span className={styles.name}>Josh Hess</span>
        <nav>
          <a href='https://github.com/euthyphro666' target='_blank'>
            github
          </a>
          <a href='mailto:joshhess13@gmail.com'>contact</a>
        </nav>
      </header>
      <footer className={styles.footer}>
        <span>
          {index + 1} / {cards.length}
        </span>
        <span className={styles.hint}>scroll</span>
      </footer>
    </div>
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; // prettier-ignore

// Accent color per project category, keyed off the subtitle.
const ACCENTS: Record<string, string> = {
  'Work Project': '#7fd6e8',
  'Personal Project': '#cc5869',
  'University Project': '#a78bfa',
  'Code Jam': '#f5c76a',
  'Game Jam': '#f5c76a',
};
const DEFAULT_ACCENT = '#cc5869';

function Item({ card }: { card: PortfolioCard }) {
  const media = card.image?.[0];
  const accent = ACCENTS[card.subtitle] ?? DEFAULT_ACCENT;
  return (
    <article
      className={styles.card}
      style={{ '--accent': accent } as CSSProperties}
    >
      {media &&
        (media.startsWith('http') ? (
          <iframe
            className={styles.media}
            src={media}
            title={card.title}
            allowFullScreen
          />
        ) : (
          <img className={styles.media} src={`/portfolio/${media}`} alt='' />
        ))}
      <div className={styles.body}>
        <div className={styles.heading}>
          <h2>{card.title}</h2>
          <span className={styles.date}>
            {MONTHS[card.month - 1]} {card.year}
          </span>
        </div>
        <span className={styles.subtitle}>{card.subtitle}</span>
        <p className={styles.about}>{card.about}</p>
        <div className={styles.meta}>
          {card.tags?.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
          {card.links?.map(([label, url]) => (
            <a key={url} href={url} target='_blank' className={styles.link}>
              {label} ↗
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
