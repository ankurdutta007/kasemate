const fs = require('fs');
const file = 'src/components/landing-v2/CasesV2.tsx';
let content = fs.readFileSync(file, 'utf8');

// The replacement chunk
const search = `            const finalRotate = useTransform(parallaxRotate, r => baseRotate + r)
            const finalY = useTransform(parallaxY, py => baseY - py)
            const finalX = useTransform(parallaxX, px => baseX + px)

            return (
              <ScrollReveal
                key={c.label}
                delay={0.1 * i} // Staggered entrance
                duration={0.8}
                y={60}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  transformOrigin: 'bottom center',
                  zIndex: i,
                }}
              >
                <motion.div
                  className={\`lv2-card-stack-item lv2-layer--s\${c.stage}\`}
                  style={{
                    width: '100%',
                    height: '100%',
                    rotate: prefersReducedMotion ? baseRotate : finalRotate,
                    y: prefersReducedMotion ? baseY : finalY,
                    x: prefersReducedMotion ? baseX : finalX,
                    borderRadius: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 24,
                    background: 'var(--lv2-bg-elevated)', // FORCE opaque background so cards don't bleed through
                  }}
                >`;

const replace = `            return (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 60, rotate: 0, x: 0 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  rotate: prefersReducedMotion ? baseRotate : baseRotate,
                  x: prefersReducedMotion ? baseX : baseX,
                }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.35,
                  delay: i * 0.04, // 0.24s max delay + 0.35s duration = 0.59s total
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  transformOrigin: 'bottom center',
                  zIndex: i,
                }}
              >
                <motion.div
                  className={\`lv2-card-stack-item lv2-layer--s\${c.stage}\`}
                  style={{
                    width: '100%',
                    height: '100%',
                    rotate: prefersReducedMotion ? 0 : parallaxRotate,
                    y: prefersReducedMotion ? baseY : useTransform(parallaxY, py => baseY - py),
                    x: prefersReducedMotion ? 0 : parallaxX,
                    transformOrigin: 'bottom center',
                    borderRadius: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 24,
                    background: 'var(--lv2-bg-elevated)', // FORCE opaque background so cards don't bleed through
                  }}
                >`;

content = content.replace(search, replace);

// We need to also close the new motion.div instead of ScrollReveal
content = content.replace(`                </motion.div>\n              </ScrollReveal>`, `                </motion.div>\n              </motion.div>`);

fs.writeFileSync(file, content);
console.log('Done!');
