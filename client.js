/**
 * Browser half of dsh-rainbow-composer.
 *
 * Paints an animated rainbow gradient border around the resident message
 * composer (`[data-composer-card]`, shipped by
 * `@deepseek-ai/dsh-client-ui-conversation`). The effect is pure CSS: one
 * registered custom property drives a rotating `conic-gradient`, and a masked
 * pseudo-element turns it into a 1.5px ring.
 *
 * The ring lives on `::before`, which the shipped card does not use, so no
 * shipped affordance is disturbed. A soft static halo is optional — see the
 * commented block at the end of the stylesheet.
 */
window.__ModuleLoader__.load({
  id: 'dsh-rainbow-composer',
  factory() {
    /** Palette, clockwise from the top: cyan → periwinkle → orchid → rose → amber → lime → mint. */
    const HUES = [
      '#45d4ea 0deg',
      '#8299ff 46deg',
      '#df85ff 92deg',
      '#fb6f86 138deg',
      '#fbb32a 186deg',
      '#c6f063 232deg',
      '#4fe0b4 278deg',
      '#43d5e6 322deg',
      '#45d4ea 360deg',
    ].join(', ')

    /** Everything the composer needs; scoped to the card so nothing else repaints. */
    const CSS = `
@property --dsh-rb-angle { syntax: "<angle>"; inherits: true; initial-value: 0deg; }

@keyframes dsh-rb-spin { to { --dsh-rb-angle: 360deg; } }

[data-composer-card] {
  --dsh-rb-w: 1.5px;
  --dsh-rb-hues: ${HUES};
  --dsh-rb-ring: conic-gradient(from var(--dsh-rb-angle, 0deg) at 50% 50%, var(--dsh-rb-hues));
  animation: dsh-rb-spin 9s linear infinite;
}

/* 1.5px rainbow ring hugging the card edge (outer gradient, inner hole masked out). */
[data-composer-card]::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  padding: var(--dsh-rb-w);
  border-radius: inherit;
  background: var(--dsh-rb-ring);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  pointer-events: none;
}

/*
 * The breathing halo is intentionally absent: a static pulse read less natural
 * than the standalone demo, so the composer keeps only the crisp ring. To put a
 * still, non-animated halo back, uncomment the block below.
 *
[data-composer-card]:has(> [data-composer-overlay])::after {
  content: "";
  position: absolute;
  inset: -6px;
  padding: 6px;
  border-radius: calc(var(--dsw-radius-panel, 16px) + 6px);
  background: conic-gradient(from 210deg at 50% 50%, var(--dsh-rb-hues));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  filter: blur(12px) saturate(1.25);
  opacity: .35;
  pointer-events: none;
}
*/

@media (prefers-reduced-motion: reduce) {
  [data-composer-card] { animation: none; }
}
`

    /**
     * Load marker: the slot registration proves this module reached the live
     * client and that `apply` ran. It renders nothing.
     */
    function RainbowBeacon() {
      return null
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.effect(() => {
          const style = document.createElement('style')
          style.setAttribute('data-dsh-plugin', 'rainbow-composer')
          style.textContent = CSS
          document.head.appendChild(style)
          return () => {
            style.remove()
          }
        }, 'rainbow-composer: styles')

        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
          name: 'conversation.composer.dock',
          id: 'rainbow-composer',
          order: 0,
        }, RainbowBeacon))
      },
    }
  },
})