import { AppContext } from "@component/contexts/appContext"
import { User } from "@component/typings"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { motion as m } from "framer-motion"
import { useContext, useEffect, useState } from "react"
import { faXmark as close } from "@fortawesome/free-solid-svg-icons"
import { fetchDM } from "@component/utils/providers"
import { TypeAnimation } from "react-type-animation"
import ComingMessage from "@component/styles/comingMessage"

interface PageProps {
    user: User,
    setViewCallback: (view: any) => void
}

const enum View {
    PROFILE,
    FOLLOWERS,
    FOLLOWING
}

export function DirectMessage ({ user, setViewCallback }: PageProps) {
    const { state, dispatch } =  useContext(AppContext)
    const [redirectAnimation, setRedirectAnimation] = useState(false)
    const [loading, setLoading] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [mounted, setMounted] = useState(false)
    var TextareaAutosize = require('react-textarea-autosize').default

    useEffect(() => {
        setTimeout(() => {
            setMounted(true)
        }, 300)
    }, [])

    const handleBackToProfile = () => {
        setRedirectAnimation(true)
        setTimeout(() => {
            setViewCallback(View.PROFILE)
        }, 300)
    }

    const handlePostMessage = async (e: any) => {
        e.preventDefault()
        if (inputValue.length > 0) {
            setInputValue('')
            const input = document.getElementById('input')
            input?.focus()
            const message = {
                user: { userName: 'You', userImage: '/blank_avatar.jpg' },
                content: inputValue
            }

            if (user.directMessages?.findLast(x => x.user!.userName == user.userName)?.content == "Hey, I'm kinda busy atm. DM me later:)") {
                user.directMessages!.push(message)
                setTimeout(() => {
                    const container = document.getElementById('container')
                    container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
                }, 100)
                return
            } 

            const history = []
            for (let i = 0; i < user.directMessages!.length; i += 2) {
                history.push([ user.directMessages![i].content, user.directMessages![i + 1]?.content ])
            }

            user.directMessages!.push(message)

            setLoading(true)
           
            setTimeout(() => {
                const container = document.getElementById('container')
                container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
            }, 100)

            const res = await fetchDM(inputValue, history)

            setLoading(false)

            user.directMessages!.push({ user: { 
                userName: user.userName,
                 userImage: user.userImage 
                }, 
                content: res.content 
            })

            setTimeout(() => {
                const container = document.getElementById('container')
                container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
            }, 100)
        }
    }

    return (
        <m.div                     
            initial={{ 
                height: '0%', 
                top: '50%', 
                bottom: '50%',
                color: 'transparent', 
                opacity: 0,
            }}
            animate={{ 
                height: redirectAnimation ? '0%' : '100%', 
                top: redirectAnimation ? '50%' : '0%',
                bottom: redirectAnimation ? '50' : '0%',
                color: redirectAnimation ? 'transparent' : 'black',
                opacity: redirectAnimation ? 0 : 1,
            }}
            transition={{ duration: 0.4, ease: 'backInOut' }}
            className="absolute bg-gray-100 w-full ">
                        <div className="flex mx-[1vh] items-center top-0 h-[5%]">       
                <span className="text-[2.5vh] font-bold ml-[1vh] cursor-pointer">{user?.userName}</span>    
                <FontAwesomeIcon 
                    icon={close} 
                    className="px-[1.5vh] text-[4vh] cursor-pointer hover:text-gray-600 animate-ping-once ml-auto" 
                    onClick={() => handleBackToProfile()}/>         
            </div>
            <div id="container" className="relative mt-[5vh] overflow-y-scroll hide-scrollbar h-[85%] pb-[10vh]">
                <m.img
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 0 }}
                    src={user.userImage}
                    onLoad={() => setImageLoaded(true)}
                    className="w-[15vh] rounded-full m-auto border border-gray-300"/>
                <p className="font-bold text-[3vh] text-center">{user.userName}</p>
                <p className="text-[2vh] text-center">Instagram</p>
                <p className='text-[2vh] text-center text-gray-400'>
                    {user.followers!.length < 1000
                        ? user.followers!.length + ' followers'
                        : Math.round(user.followers!.length / 1000) + 'K followers'
                    } • {user.posts!} posts
                </p>
                <p className='text-[2vh] text-center text-gray-400 mb-[3vh]'>
                    {user.isFollowed ? "You've followed this Instagram account" : "You don't follow each other on Instagram"}
                </p>
                {user.directMessages?.map((message, index) => (
                    <div key={`message-${index}`} className="flex px-[2vh] mt-[2vh]">
                        <m.img
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }} 
                            src={message.user!.userImage} className="w-[5vh] h-[5vh] rounded-full border border-gray-300"/>
                        <m.p 
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="font-semibold text-[2vh] ml-[1.5vh]">
                            {message.user!.userName}
                            <TypeAnimation
                                sequence={[0, message.content!]}
                                wrapper="span"
                                className="font-normal ml-[1vh]"
                                cursor={false}
                                speed={mounted ? 60 : 99}
                            />
                        </m.p>
                    </div>
                ))}
                {loading &&
                    <div className="flex items-center mt-[2vh] px-[2vh]">
                        <m.img
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }} 
                            src={user.userImage} 
                            className="w-[5vh] h-[5vh] rounded-full mr-[1.5vh]"/>
                        <m.p 
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="font-semibold text-[2vh] mr-[1.5vh]">
                            {user.userName}
                        </m.p>
                        <ComingMessage/>
                    </div>
                }
            </div>
            <div className="flex items-center absolute bottom-[2%] min-h-[10%] h-auto w-full px-[1vh] border-t bg-gray-100 rounded-b-2xl">
                <img src="/blank_avatar.jpg" className="w-[5vh] h-[5vh] rounded-full bg-gray-100 mr-[1vh] border border-gray-300" />
                <TextareaAutosize
                    id="input"
                    value={inputValue}
                    onChange={(e: any) => setInputValue(e.target.value)}
                    onKeyDown={(e: any) => e.key === 'Enter' && !loading && handlePostMessage(e)}
                    maxRows={7}
                    className="border-none outline-none text-[2.5vh] resize-none w-full hide-scrollbar bg-transparent my-[1vh] ml-[2vh]" 
                    placeholder={`Message`} />
                <span 
                    className="font-semibold text-[2.5vh] text-blue-500 cursor-pointer mt-[1vh] mx-[2vh] mb-[1vh]"
                    onClick={(e: any) => !loading && handlePostMessage(e)}>
                    Send
                </span>
            </div>
        </m.div>
    )
}