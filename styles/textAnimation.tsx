import { motion as m } from 'framer-motion'

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