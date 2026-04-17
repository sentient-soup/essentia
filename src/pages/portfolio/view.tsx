import { useCallback, useEffect, useState } from 'react';
import { Box, Card, Typography } from '@mui/joy';
import type { PortfolioCard } from '../../types';
import portfolio from '../../assets/info.json';
import Canvas from './canvas';

import styles from './portfolio.module.scss';

export interface PortfolioProps {
  minScale: number;
  maxScale: number;
  scrollFactor: number;
  fadeThreshold: number;
}

export default function Portfolio({
  minScale = 1.0,
  maxScale = 3.0,
  scrollFactor = 800.0,
  fadeThreshold = 0.5,
}: PortfolioProps) {
  const [state, setState] = useState({ currentCard: 0, scroll: 800, total: 0 });
  const updateScroll = useCallback(
    (event: WheelEventInit) => {
      setState(({ currentCard, scroll, total }) => {
        const minScroll = minScale * scrollFactor;
        const maxScroll = maxScale * scrollFactor;
        const delta = event.deltaY ? event.deltaY : 0;
        let newCard = currentCard;
        let newScroll = scroll + delta;
        if (newScroll < minScroll) {
          newScroll = maxScroll;
          newCard = --newCard < 0 ? newCard + portfolio.length : newCard;
        }
        if (newScroll > maxScroll) {
          newScroll = minScroll;
          newCard = ++newCard % portfolio.length;
        }
        return {
          scroll: newScroll,
          currentCard: newCard,
          total: total + delta,
        };
      });
    },
    [minScale, maxScale, scrollFactor]
  );

  useEffect(() => {
    document.addEventListener('mousewheel', updateScroll);
    return () => document.removeEventListener('mousewheel', updateScroll);
  }, [updateScroll]);

  const nextCardIndex = trueMod(state.currentCard + 1, portfolio.length);
  const card = portfolio[state.currentCard];
  const nextCard = portfolio[nextCardIndex];

  const currentScale = state.scroll / scrollFactor;
  const progress = (currentScale - minScale) / (maxScale - minScale);
  const fade = Math.max(0, (progress - fadeThreshold) / (1.0 - fadeThreshold));

  const t = state.total / 5000 / 20.0 + 0.1;
  const d = [0.263, 0.416, 0.557];
  const r = Math.cos(6.28318 * (t + d[0]));
  const g = Math.cos(6.28318 * (t + d[1]));
  const b = Math.cos(6.28318 * (t + d[2]));
  // const color = `rgba(${r * 255}, ${b * 255}, 255, 0.6)`;
  // const color = `rgba(${r}, ${b}, 1.0, 0.6)`;
  return (
    // <Container className={styles.container}>
    <Box sx={{ padding: '0', margin: '0', width: '100%', height: '100%' }}>
      <Canvas />
      {fade > 0 ? (
        <Item
          index={nextCardIndex}
          card={nextCard}
          scale={progress * minScale}
          fade={0}
          color={[r, g, b]}
          className={styles.card}
        />
      ) : null}
      <Item
        index={state.currentCard}
        card={card}
        scale={currentScale}
        fade={fade}
        color={[r, g, b]}
        className={styles.card}
      />
    </Box>
  );
}

function Item(props: ItemProps) {
  const card = props.card ?? {};
  const [r, g, b] = props.color ?? [0.5, 0.5, 0.5];
  // const color = `rgba(${r * 255}, ${b * 255}, 255, 0.8)`;
  const color = `rgba(${g}, ${g}, ${g}, 0.8)`;
  const fg = `rgba(${255 - r * 255}, ${255 - b * 255}, 255, 1)`;

  return (
    <Card
      className={props.className}
      sx={{
        transform: `scale(${props.scale})`,
        opacity: 1.0 - props.fade,
        // backgroundColor: "rgba(0, 0, 0, 0.5)",
        backgroundColor: color,
        // borderColor: 'primary.border',
        width,
      }}
      color='primary'
    >
      <Typography level='h4' component='h1' sx={{ color: 'rgb(10, 8, 10)' }}>
        {card.title}
      </Typography>
      <Typography level='h5' component='h1' sx={{ color: fg }}>
        {card.subtitle}
      </Typography>
      {/* <Typography level='body-sm' sx={{ color: fg }}> */}
      <Typography level='body-sm' sx={{ color: 'grey' }}>
        {card.about}
      </Typography>
    </Card>
  );
}
interface ItemProps {
  index: number;
  scale: number;
  fade: number;
  className?: string;
  color?: number[];
  card: PortfolioCard;
}

const trueMod = (n: number, m: number) => ((n % m) + m) % m;
