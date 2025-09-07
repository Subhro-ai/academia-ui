import {
  trigger,
  transition,
  style,
  query,
  animate,
} from '@angular/animations';

export const fadeAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    // Set a default style for both entering and leaving components
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          left: 0,
          width: '100%',
          opacity: 0,
          transform: 'scale(0.98) translateY(10px)',
        }),
      ],
      { optional: true }
    ),
    // Animate the new page in
    query(
      ':enter',
      [
        animate(
          '300ms ease-in-out',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' })
        ),
      ],
      { optional: true }
    ),
  ]),
]);
