import type { ComponentType, ReactNode } from 'react';
import { motion } from 'motion/react';
import type { SlideDefinition, SlideRenderProps } from '../../src/presentation';

export type AuthoredPage = SlideDefinition & { Render: ComponentType<SlideRenderProps> };
export const isStill = (runtime: SlideRenderProps) => runtime.still || runtime.reducedMotion || runtime.mode === 'preview' || !runtime.active;
export const canInteract = (runtime: SlideRenderProps) => runtime.mode === 'playback' && runtime.active;

export function Reveal({ runtime, at = 0, effect = 'rise', duration = .6, children, className }: {
  runtime: SlideRenderProps; at?: number; effect?: 'rise' | 'clip' | 'scale'; duration?: number; children: ReactNode; className?: string;
}) {
  const visible = runtime.step >= at;
  const hidden = effect === 'clip' ? { opacity: 0, clipPath: 'inset(0 0 100% 0)' }
    : effect === 'scale' ? { opacity: 0, scale: .85 } : { opacity: 0, y: 22 };
  const shown = effect === 'clip' ? { opacity: 1, clipPath: 'inset(0 0 0% 0)' }
    : effect === 'scale' ? { opacity: 1, scale: 1 } : { opacity: 1, y: 0 };
  return <motion.div className={className} aria-hidden={!visible} initial={isStill(runtime) ? false : hidden}
    animate={visible ? shown : hidden} transition={{ duration: isStill(runtime) ? 0 : duration, ease: [.22, 1, .36, 1] }}>{children}</motion.div>;
}
