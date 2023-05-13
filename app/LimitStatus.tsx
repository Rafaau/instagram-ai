import { useEffect, useState } from "react"
import { motion as m } from "framer-motion"
import { faExclamation } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { fetchData } from "@component/utils/fetchData"

export function LimitStatus () {
    const [expanded, setExpanded] = useState(false)
    const [exceeded, setExceeded] = useState(false)

    useEffect(() => {
        const getLimitStatus = async () => {
            const res = await fetchData('requestsCount')
            if (res.isExceeded) {
                setExceeded(true)
            }
        }

        getLimitStatus()

        const interval = setInterval(getLimitStatus, 10000)

        return () => clearInterval(interval)
    }, [])

    const shake = {
        shake: {
            rotate: [-5, 5, -5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            scale: [1.1, 1.1, 1.1, 1.1, 1, 1, 1, 1, 1, 1],
            transition: {
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut"
            }
        }
    }

    return (
        <m.div
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: exceeded ? 1 : 0, x: 0, width: expanded ? "40vh" : "7vh", height: expanded ? "30vh" : "10vh" }}
            transition={{ duration: 0.3, ease: "backInOut" }}
            className="flex absolute left-0 top-[10vh] rounded bg-gray-100 cursor-pointer border border-gray-300 z-10 overflow-hidden items-center justify-center"
            onClick={() => setExpanded(!expanded)}>
            {!expanded && 
            <m.div
                animate="shake" variants={shake}>
                <FontAwesomeIcon icon={faExclamation} className="text-[5vh]" />
            </m.div>
            }
            {expanded && <p className="text-[2vh] w-[32vh] text-gray-600">
                The application has a daily limit for requests to the <strong>OpenAI API</strong> (in order to minimize costs), 
                which has been exceeded today. Data such as comments, bios, and photo descriptions are now being 
                fetched from a predefined list of placeholders and may be repetitive.
            </p>}
        </m.div>
    )
}