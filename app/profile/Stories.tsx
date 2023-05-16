import { Story } from "@component/typings"
import { faXmark as close } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { motion as m } from "framer-motion"
import { useEffect, useState } from "react"


interface PageProps {
    closeStories: () => void
    story: Story
}

export function Stories ({ story, closeStories }: PageProps) {
    const [closeAnimation, setCloseAnimation] = useState(false)
    const [currentPhoto, setCurrentPhoto] = useState(0)
    let timeoutId: NodeJS.Timeout | null = null

    const handleCloseStories = () => {
        setCloseAnimation(true)
        setTimeout(() => {
            closeStories()
        }, 300)
    }

    useEffect(() => {
        if (currentPhoto === story.photos?.length)
            handleCloseStories()
        else
            timeoutId = setTimeout(() => {
                handleSetCurrentPhoto(currentPhoto + 1)
            }, 6000)

        return () => {
            if (timeoutId)
                clearTimeout(timeoutId)
        }
    }, [currentPhoto])

    const handleSetCurrentPhoto = (index: number) => {
        if (timeoutId)
            clearTimeout(timeoutId)

        const story = document.getElementById(`story-${index}`)
        story?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setCurrentPhoto(index)
    }

    return (
        <m.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: closeAnimation ? 0 : 1, scale: closeAnimation ? 0 : 1 }} 
            transition={{ duration: 0.3, ease: "backInOut" }}
            className="items-center justify-center absolute top-0 left-0 bottom-0 right-0 bg-black bg-opacity-90">
            <FontAwesomeIcon className="absolute right-[3vh] top-[3vh] text-[5vh] text-white cursor-pointer" icon={close} onClick={() => handleCloseStories()}/>
            {story.photos?.map((photo, index) => (
                <div key={`storylabel-${index}`}>
                    {currentPhoto == index &&
                        <div className="flex w-[37vh] ml-[3vh] mt-[3vh]">
                            <img 
                                className='w-[7vh] h-[7vh] rounded-full'
                                src={story.user?.userImage}/>
                            <div className="ml-[2vh]">
                                <p className="text-gray-100 text-[2vh] font-semibold">
                                    {story.user?.userName}
                                    <span className="text-gray-300 text-[1.5vh] font-normal ml-[1vh]">
                                        • {story?.postDates![index]}
                                    </span>
                                </p>
                            </div>
                        </div>
                        }
                </div>
            ))}
            <div className="flex space-x-[1.5vh] mt-[15vh] mx-auto w-[37vh] mb-[1vh]">
            {story.photos?.map((photo, index) => (
                <div 
                    key={`indicator-${index}`}
                    className="w-[100%] h-[0.5vh] bg-gray-400 cursor-pointer"
                    onClick={() => handleSetCurrentPhoto(index)}>
                    <m.div
                        initial={{ width: currentPhoto <= index ? 0 : '100%' }}
                        animate={{ width: currentPhoto >= index ? '100%' : 0 }}
                        transition={{ duration: currentPhoto == index ? 6 : 0, ease: 'easeInOut' }}
                        style={{ backgroundColor: '#f4f5f6', height: '100%', width: currentPhoto > index ? '100%' : 0 }}>
                    </m.div>
                </div>
            ))}
            </div>
            <div className="mx-auto relative flex h-[37vh] items-center space-x-[2vh] overflow-x-scroll hide-scrollbar w-[37vh]">
                {story.photos?.map((photo, index) => (
                    <m.div
                        animate={{ scale: currentPhoto ==  index ? 1.15 : 1 }}
                        transition={{ duration: 6, ease: 'linear' }}
                        style={{ perspective: 1000 }}
                        id={`story-${index}`}
                        key={index}
                        className={`w-full flex-0-0-100`}>
                        <img src={photo}/>
                    </m.div>
                ))}
            </div>
        </m.div>
    )
}