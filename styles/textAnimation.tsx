import { motion as m } from 'framer-motion'
import { useEffect, useState } from 'react'

export function TextAnimation (props: { text: string, delay?: number, className?: string }) {
    const letters = Array.from(props.text)

    const container = {
        hidden: { opacity: 0 },
        visible: (i = props.delay || 1) => ({
          opacity: 1,
          transition: { staggerChildren: 0.03, delayChildren: 0.04 * i },
        }),
    }

    const letterVariants = {
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
        },
        hidden: {
          opacity: 0,
          x: -20,
          y: 10,
        },
    }

    return (
        <m.p 
            className={props.className || ''}
            variants={container}
            initial="hidden"
            animate="visible">
            {letters.map((letter, index) => (
                <m.span
                    variants={letterVariants}
                    key={index}>
                    {letter === " " ? "\u00A0" : letter}
                </m.span>
            ))}
        </m.p>
    )
}


export function TypeAnimationCustom({text, speed, delay, className, onLoad}: any) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [startTyping, setStartTyping] = useState(false)

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      setStartTyping(true)
    }, delay)

    return () => clearTimeout(delayTimer)
  }, [delay])

  useEffect(() => {
    if (!startTyping)
        return

    const interval = setInterval(() => {
      setDisplayedText((prevText) => prevText + text[currentIndex])
      setCurrentIndex((prevIndex) => prevIndex + 1)
    }, speed)

    if (currentIndex >= text.length) {
      clearInterval(interval)
      onLoad()
    }

    return () => clearInterval(interval)
  }, [currentIndex, text, speed, startTyping, onLoad])

  return (
    <span className={`${className}`} dangerouslySetInnerHTML={{ __html: displayedText }} />
  )
}
