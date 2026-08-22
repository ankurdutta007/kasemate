import { useEffect } from 'react'
import Lenis from 'lenis'
// Every rule in this stylesheet is gated behind the `.lenis` class that Lenis
// puts on <html> while it is running, and removes again on destroy(). So it is
// completely inert on every other route in the app.
import 'lenis/dist/lenis.css'

/**
 * Runs Lenis smooth scrolling for as long as the calling component is mounted.
 *
 * Two things make this safe to use on a single page of a multi-page app:
 *
 *  1. `enabled` — pass false and Lenis is never constructed at all. LandingV2
 *     passes false when the visitor has "reduce motion" turned on, so those
 *     users get plain, native browser scrolling.
 *
 *  2. The cleanup function — when you navigate away from the page, React runs
 *     the returned cleanup, which cancels the animation frame loop and calls
 *     lenis.destroy(). That removes the classes and inline styles Lenis put on
 *     <html>, so smooth scrolling cannot leak into /roadmap, /hub, or anywhere
 *     else.
 */
/**
 * The Lenis instance currently running, if any. Module-level so that the mobile
 * menu can freeze the page behind itself without prop-drilling the instance
 * through every component.
 */
let activeLenis: Lenis | null = null

/**
 * Freeze / unfreeze page scrolling. Used when the mobile menu overlay is open
 * so the page doesn't scroll around behind it.
 *
 * Falls back to `overflow: hidden` on <body> when Lenis isn't running, which is
 * the case for visitors who have "reduce motion" turned on.
 */
export function setPageScrollLocked(locked: boolean) {
  if (activeLenis) {
    locked ? activeLenis.stop() : activeLenis.start()
    return
  }
  document.body.style.overflow = locked ? 'hidden' : ''
}

/** Everything that wants to be told when the page scrolls. */
const scrollSubscribers = new Set<(scrollY: number) => void>()

function notifyScrollSubscribers() {
  const y = window.scrollY
  scrollSubscribers.forEach(cb => cb(y))
}

/**
 * Subscribe to page scroll in a way that works whether or not Lenis is running.
 *
 * Lenis emits its own `scroll` event, and the browser emits the native one. We
 * listen to both, so the same callback fires for reduced-motion visitors (native
 * scrolling) and for everyone else (Lenis smooth scrolling).
 *
 * Returns an unsubscribe function.
 */
export function subscribeToPageScroll(cb: (scrollY: number) => void) {
  scrollSubscribers.add(cb)
  window.addEventListener('scroll', notifyScrollSubscribers, { passive: true })
  return () => {
    scrollSubscribers.delete(cb)
    if (scrollSubscribers.size === 0) {
      window.removeEventListener('scroll', notifyScrollSubscribers)
    }
  }
}

export function useLenisScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      // Leave touch devices on native scrolling — it feels better on phones
      // and avoids fighting the OS momentum scroll.
      syncTouch: false,
    })
    activeLenis = lenis

    // Lenis suppresses some native scroll events while it animates, so forward
    // its own scroll event to our subscribers too.
    lenis.on('scroll', notifyScrollSubscribers)

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      activeLenis = null
      // Belt and braces: make sure we never leave the page frozen.
      document.body.style.overflow = ''
    }
  }, [enabled])
}
