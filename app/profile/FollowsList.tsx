import { Photo, User } from '@component/typings'
import { faXmark as close } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext, useEffect, useState } from 'react'
import { motion as m } from 'framer-motion'
import { View } from './[userName]/page'
import { ClipLoader } from 'react-spinners'
import { fetchSinglePhoto, fetchUsername } from '@component/utils/providers'
import { AppContext } from '@component/contexts/appContext'
import { useRouter } from 'next/navigation'

interface PageProps {
    user: User,
    view: View,
    setViewCallback: (view: View) => void
}

export function FollowsList ({ user, view, setViewCallback }: PageProps) {
    const { state, dispatch } =  useContext(AppContext)
    const [redirectAnimation, setRedirectAnimation] = useState(false)
    const [loading, setLoading] = useState(false)
    const [followers, setFollowers] = useState<User[]>([])
    const [following, setFollowing] = useState<User[]>([])
    const router = useRouter()

    useEffect(() => {
        const container = document.getElementById('container')!
        const boxWidth = container?.offsetWidth
        if (view == View.FOLLOWERS) {
            setLoading(true)
            container.scrollBy({ left: -boxWidth - 1,  behavior: 'smooth' })
            if (user.followers == 0 || followers.length >= 8) return
            for (let i = 0; i < 8; i++) {
                fetchSinglePhoto().then(async (photo) => {
                    const user: User = {
                        userName: await fetchUsername(),
                        userImage: photo.src,
                        isFollowed: false,
                        followers: Math.floor(Math.random() * 2500 * 4),
                        following: Math.floor(Math.random() * 200),
                        posts: Math.floor(Math.random() * 25 + 5), 
                        photos: []
                    }
                    setFollowers((followers) => [...followers, user])
                })
            }
        } else if (view == View.FOLLOWING) {
            container.scrollBy({ left: boxWidth + 1,  behavior: 'smooth' })
            if (user.following == 0 || following.length >= 8) return
            for (let i = 0; i < 8; i++) {
                fetchSinglePhoto().then(async (photo) => {
                    const user: User = {
                        userName: await fetchUsername(),
                        userImage: photo.src,
                        isFollowed: false,
                    }
                    setFollowing((following) => [...following, user])
                })
            }
        }
    }, [view])

    const handleBackToProfile = () => {
        setRedirectAnimation(true)
        setTimeout(() => {
            setViewCallback(View.PROFILE)
        }, 300)
    }

    const redirectToUserProfile = (user: User) => {
        setRedirectAnimation(true)
        if (!state.users.some(u => u.userName == user.userName))
            dispatch({ type: 'SET_USERS', payload: [
                ...state.users,
                user
            ]})
        setTimeout(() => {
            router.push(`/profile/${user.userName}`)
        }, 300)
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
            <div className="flex border-b px-[7vh] mt-[3vh] relative h-[7%]">
                <m.div
                    animate={{ color: view === View.FOLLOWERS ? 'black' : 'gray' }}
                    onClick={() => setViewCallback(View.FOLLOWERS)}
                    className='text-[2vh] font-semibold cursor-pointer px-[1vh]'>
                    {user.followers! < 1000
                        ? user.followers! + ' followers'
                        : Math.round(user.followers! / 1000) + 'K followers'
                    }
                </m.div>
                <m.div
                    animate={{ color: view === View.FOLLOWING ? 'black' : 'gray' }}
                    onClick={() => setViewCallback(View.FOLLOWING)}
                    className='text-[2vh] font-semibold ml-auto cursor-pointer px-[1vh]'>
                    {user.following! < 1000
                        ? user.following! + ' following'
                        : Math.round(user.following! / 1000) + 'K following'
                    }
                </m.div>
                <m.div
                    initial={{ width: '0%' }}
                    animate={{ 
                        width: '30%',
                        left: view === View.FOLLOWERS ? '7vh' : '25vh', 
                    }}
                    transition={{ duration: 0.3, ease: 'backInOut' }}
                    className='absolute bg-gray-600 h-[0.5vh] bottom-0'>
                </m.div>
            </div>
            <div id='container' className='flex overflow-x-hidden hide-scrollbar w-[100%] h-[88%] relative'>
                <div className='w-[100%] h-[100%] pb-[5vh] overflow-y-scroll hide-scrollbar'>
                    {followers.map((follower, index) => (
                        <div key={index} className='flex items-center border-b px-[2vh] py-[2vh]'>
                            <m.img
                                src={follower.userImage}
                                className='rounded-full w-[5vh] h-[5vh] cursor-pointer'
                                onClick={() => redirectToUserProfile(follower)}/>
                            <span 
                                className='text-[2vh] font-semibold ml-[1vh] cursor-pointer'
                                onClick={() => redirectToUserProfile(follower)}>
                                {follower.userName}
                            </span>
                            <m.button
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ 
                                    opacity: user.bio ? 1 : 0,
                                    scale: user.bio ? 1 : 0,
                                    backgroundColor: user?.isFollowed ? '#E5E7EB' : '#2563EB',
                                    color: user?.isFollowed ? '#111827' : '#F3F4F6',
                                }}
                                transition={{ duration: 0.2, ease: 'backInOut' }}
                                className="text-[2.3vh] py-[0.5vh] rounded font-semibold w-[40%] ml-auto">
                                {user?.isFollowed ? <p>Following</p> : 'Follow'}
                            </m.button>
                        </div>
                    ))}
                    {loading && (
                        <div id="loader" className="flex justify-center items-center w-full h-[10%] relative">
                            <ClipLoader color="#6B7280" size={20}/>
                        </div>
                    )}
                </div>
                <div className='absolute w-[100%] left-[100%] h-[100%] pb-[5vh] overflow-y-scroll hide-scrollbar'>
                    {following.map((follower, index) => (
                        <div key={index} className='flex items-center border-b px-[2vh] py-[2vh]'>
                            <m.img
                                src={follower.userImage}
                                className='rounded-full w-[5vh] h-[5vh]'/>
                            <span className='text-[2vh] font-semibold ml-[1vh]'>{follower.userName}</span>
                            <m.button
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ 
                                    opacity: user.bio ? 1 : 0,
                                    scale: user.bio ? 1 : 0,
                                    backgroundColor: user?.isFollowed ? '#E5E7EB' : '#2563EB',
                                    color: user?.isFollowed ? '#111827' : '#F3F4F6',
                                }}
                                transition={{ duration: 0.2, ease: 'backInOut' }}
                                className="text-[2.3vh] py-[0.5vh] rounded font-semibold w-[40%] ml-auto">
                                {user?.isFollowed ? <p>Following</p> : 'Follow'}
                            </m.button>
                        </div>
                    ))}
                    {loading && (
                        <div id="loader" className="flex justify-center items-center w-full h-[10%] relative">
                            <ClipLoader color="#6B7280" size={20}/>
                        </div>
                    )}
                </div>                
            </div>
        </m.div>
    )
}