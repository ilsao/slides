import type { CSSProperties } from 'react';
import { fadeTransition, type TransitionDefinition } from '../../src/presentation';

export type TemplateStyle = CSSProperties & { [property: `--template-${string}`]: string | number };

export const themes = {
  paper: { '--template-background': '#f6f4ee', '--template-foreground': '#20232a', '--template-muted': '#686b75', '--template-accent': '#5d50dc', '--template-panel': '#e9e6de' },
  lavender: { '--template-background': '#e9e5ff', '--template-foreground': '#25213f', '--template-muted': '#625b7d', '--template-accent': '#6048db', '--template-panel': '#d9d1ff' },
  midnight: { '--template-background': '#181c2f', '--template-foreground': '#f6f4ff', '--template-muted': '#b4b8cf', '--template-accent': '#ff967b', '--template-panel': '#282d45' },
} satisfies Record<string, TemplateStyle>;

export const slideTransition: TransitionDefinition = {
  name: 'template-slide',
  animate: ({ incoming, outgoing }, direction) => [
    incoming.animate([{ opacity: 0, transform: `translateX(${direction * 60}px)` }, { opacity: 1, transform: 'translateX(0)' }], { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)' }),
    outgoing.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease-out', fill: 'both' }),
  ],
};

export const templateConfig = {
  id: 'template',
  title: 'Template',
  description: '版型、風格與動畫，從這裡開始。',
  version: 1,
  size: { width: 1600, height: 900 },
  theme: 'paper' as keyof typeof themes,
  style: {} as TemplateStyle,
  motion: { duration: .6, ease: [.22, 1, .36, 1] as [number, number, number, number] },
  transition: slideTransition as TransitionDefinition | false,
};

export const transitions = { slide: slideTransition, fade: fadeTransition(.35), none: false } as const;
