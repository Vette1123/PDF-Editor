'use client'

import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react'

export interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  /** Seconds to delay the reveal — stagger siblings by passing increasing values. */
  delay?: number
  /** Vertical travel distance in px (default 16). */
  y?: number
}

/**
 * Scroll-triggered fade + rise. Animates once when the element enters the
 * viewport. Honors `prefers-reduced-motion`: when set, children render
 * immediately with no transform so motion-sensitive users get a static page.
 */
export function Reveal({ children, delay = 0, y = 16, ...props }: RevealProps) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className={props.className as string | undefined}>{children as React.ReactNode}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
