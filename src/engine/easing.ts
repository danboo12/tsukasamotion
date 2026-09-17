import { EasingFunctionType } from '../types/motion';

export function getEasing(type: EasingFunctionType): (t: number) => number {
  switch (type) {
    case 'linear':
      return (t: number) => t;

    case 'easeOutQuad':
      return (t: number) => 1 - (1 - t) * (1 - t);

    case 'easeInOutCubic':
      return (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    case 'easeOutBack':
      return (t: number) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      };

    case 'easeOutBounce':
      return (t: number) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
          return n1 * t * t;
        } else if (t < 2 / d1) {
          const t2 = t - 1.5 / d1;
          return n1 * t2 * t2 + 0.75;
        } else if (t < 2.5 / d1) {
          const t3 = t - 2.25 / d1;
          return n1 * t3 * t3 + 0.9375;
        } else {
          const t4 = t - 2.625 / d1;
          return n1 * t4 * t4 + 0.984375;
        }
      };

    case 'easeOutElastic':
      return (t: number) => {
        if (t === 0) return 0;
        if (t === 1) return 1;
        const c4 = (2 * Math.PI) / 3;
        return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
      };

    default:
      return (t: number) => t;
  }
}
