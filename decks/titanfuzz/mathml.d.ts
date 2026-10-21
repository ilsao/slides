import type { HTMLAttributes } from 'react';

type MathMLAttributes = HTMLAttributes<MathMLElement> & {
  display?: 'block' | 'inline';
  mathvariant?: 'normal' | 'italic';
  columnalign?: string;
  rowspacing?: string;
  lspace?: string;
};

// React renders MathML natively; its JSX types do not yet include these tags.
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      math: MathMLAttributes;
      mtable: MathMLAttributes;
      mtr: MathMLAttributes;
      mtd: MathMLAttributes;
      mi: MathMLAttributes;
      mo: MathMLAttributes;
      msub: MathMLAttributes;
      msup: MathMLAttributes;
      munder: MathMLAttributes;
    }
  }
}
