import { Component, type ReactNode, type RefObject } from 'react';
import type { TransitionDefinition } from './types';

export type CapturedTransition = { serial: number; value: unknown };
type Props = {
  serial: number;
  root: RefObject<HTMLElement | null>;
  capture?: TransitionDefinition['capture'];
  onCapture: (snapshot: CapturedTransition | null) => void;
  children: ReactNode;
};

/** getSnapshotBeforeUpdate runs in React's before-mutation phase, earlier than
 * layout-effect cleanup. That is the last opportunity to read an interrupted
 * CSS/WAAPI animation's visible geometry rather than its reconstructed end pose.
 * Opt-in step updates increment the same serial and retain the current DOM.
 * This boundary adds no DOM and is inert for decks without a capture hook. */
export class TransitionSnapshot extends Component<Props, Record<string, never>, CapturedTransition | null> {
  getSnapshotBeforeUpdate(previous: Props): CapturedTransition | null {
    if (previous.serial === this.props.serial || !this.props.capture) return null;
    const current = this.props.root.current?.querySelector<HTMLElement>('.page-incoming');
    if (!current) return null;
    try {
      return { serial: this.props.serial, value: this.props.capture(current) };
    } catch (error) {
      // Snapshotting is an enhancement. A deck's capture error must never make
      // navigation unusable; animate can fall back to its outgoing snapshot.
      console.warn('Could not capture the current slide transition.', error);
      return null;
    }
  }

  componentDidUpdate(_previous: Props, _state: Record<string, never>, snapshot: CapturedTransition | null) {
    // Child layout lifecycles run before the enclosing Stage's layout effect.
    this.props.onCapture(snapshot);
  }

  render() { return this.props.children; }
}
