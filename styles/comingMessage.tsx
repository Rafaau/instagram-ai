import { motion } from "framer-motion";

const bounceTransition = {
  y: {
    duration: 0.6,
    repeat: Infinity,
    ease: "easeOut",
  },
}

export default function ComingMessage() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", width: "4vh" }}>
      <motion.span
        style={{ width: "1vh", height: "1vh", backgroundColor: "gray", borderRadius: "50%" }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.8, ease: "easeOut", delay: 0.4 }}
        animate={{ y: ["100%", "-70%", "100%"] }}
      />
      <motion.span
        style={{ width: "1vh", height: "1vh", backgroundColor: "gray", borderRadius: "50%" }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.8, ease: "easeOut", delay: 0.2 }}
        animate={{ y: ["100%", "-70%", "100%"] }}
        initial={{ y: "-100%" }}
      />
      <motion.span
        style={{ width: "1vh", height: "1vh", backgroundColor: "gray", borderRadius: "50%" }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.8, ease: "easeOut", delay: 0 }}
        animate={{ y: ["100%", "-70%", "100%"] }}
      />
    </div>
  )
}
