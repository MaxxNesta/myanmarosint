'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Page-level GSAP effects for the homepage. Elements opt in with data attributes:
 *   data-hero            — staggered intro on load
 *   data-reveal          — slide/fade in when scrolled into view
 *   data-count="28"      — number counts up (data-pad="2", data-suffix="+")
 *   data-funnel          — bar width shrinks to its final size on scroll
 */
export default function HomeAnimations() {
  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('[data-hero]', { y: 28, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' })

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el => {
        gsap.from(el, {
          y: 36, opacity: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })

      gsap.utils.toArray<HTMLElement>('[data-count]').forEach(el => {
        const end = Number(el.dataset.count)
        const pad = Number(el.dataset.pad ?? 0)
        const suffix = el.dataset.suffix ?? ''
        const obj = { v: 0 }
        gsap.to(obj, {
          v: end, duration: 1.6, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          onUpdate: () => { el.textContent = String(Math.round(obj.v)).padStart(pad, '0') + suffix },
        })
      })

      gsap.utils.toArray<HTMLElement>('[data-funnel]').forEach(el => {
        gsap.from(el, {
          width: '100%', duration: 1.4, ease: 'power3.inOut',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        })
      })
    })
    return () => mm.revert()
  }, [])

  return null
}
