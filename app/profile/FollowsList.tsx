import { Photo, User } from '@component/typings'
import { faXmark as close } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext, useEffect, useRef, useState } from 'react'
import { motion as m } from 'framer-motion'
import { View } from './[userName]/page'
import { ClipLoader } from 'react-spinners'
import { fetchSinglePhoto, fetchUsername } from '@component/utils/providers'
import { AppContext } from '@component/contexts/appContext'
import { useRouter } from 'next/navigation'
import { TypeAnimation } from 'react-type-animation'
import { get } from 'http'

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
    const [followerImageLoaded, setFollowerImageLoaded] = useState<boolean[]>(Array(user?.posts).fill(false) || [])
    const [followingImageLoaded, setFollowingImageLoaded] = useState<boolean[]>(Array(user?.posts).fill(false) || [])
    const followersContainerRef = useRef<any>()
    const followingContainerRef = useRef<any>()
    const router = useRouter()
    let isLoading = false

    useEffect(() => {
        const abortController = new AbortController()
        const signal = abortController.signal
    
        const container = document.getElementById('container')!
        const boxWidth = container?.offsetWidth
    
        const fetchFollowers = async () => {
            if (user.followers!.length == 0 || followers.length >= 8) return
            for (let i = 0; i < 8; i++) {
                if (i < followers.length || signal.aborted) continue 
                user.followers![i].userName
                    ? setFollowers((followers) => [...followers, user.followers![i]])
                    : await getFollower()
            }
        }
    
        const fetchFollowing = async () => {
            if (user.following!.length == 0 || following.length >= 8) return
            for (let i = 0; i < 8; i++) {
                if (i < following.length || signal.aborted) continue
                user.following![i].userName
                    ? setFollowing((following) => [...following, user.following![i]]) 
                    : await getFollowing()
            }
        }
    
        if (view == View.FOLLOWERS) {
            container.scrollBy({ left: -boxWidth - 1,  behavior: 'smooth' })
            fetchFollowers()
        } else if (view == View.FOLLOWING) {
            container.scrollBy({ left: boxWidth + 1,  behavior: 'smooth' })
            fetchFollowing()
        }
    
        return function cleanup() {
            abortController.abort()
        }
    }, [view])
    

    const getFollower = async () => {
        setLoading(true)
        isLoading = true

        const photo = await fetchSinglePhoto()
        const newUser: User = {
            userName: await fetchUsername(),
            userImage: photo.src,
            isFollowed: false,
            followers: Array.from({ length: Math.floor(Math.random() * 2500 * 4) }),
            following: Array.from({ length: Math.floor(Math.random() * 200) }),
            posts: Math.floor(Math.random() * 25 + 5), 
            photos: []
        }
        setFollowers((followers) => [...followers, newUser])

        dispatch({ type: 'SET_USERS', payload: [
            ...state.users,
            newUser
        ]})

        let index = user.followers!.findIndex(follower => Object.keys(follower).length == 4)
        
        if (index != -1)
            user.followers![index] = newUser
        
        dispatch({ type: 'SET_FOLLOWERS', payload: {
            userName: user.userName,
            followers: user.followers!
        }})  

        setTimeout(() => {
            isLoading = false
        }, 2000)
    }

    const getFollowing = async () => {
        setLoading(true)
        isLoading = true

        const photo = await fetchSinglePhoto()
        const newUser: User = {
            userName: await fetchUsername(),
            userImage: photo.src,
            isFollowed: false,
            followers: Array.from({ length: Math.floor(Math.random() * 2500 * 4) }),
            following: Array.from({ length: Math.floor(Math.random() * 200) }),
            posts: Math.floor(Math.random() * 25 + 5), 
            photos: []
        }
        setFollowing((following) => [...following, newUser])

        dispatch({ type: 'SET_USERS', payload: [
            ...state.users,
            newUser
        ]})

        let index = user.following!.findIndex(following => Object.keys(following).length == 4)
        
        if (index != -1)
            user.following![index] = newUser
        

        dispatch({ type: 'SET_FOLLOWING', payload: {
            userName: user.userName,
            following: user.following!
        }})  

        setTimeout(() => {
            isLoading = false
        }, 2000)
    }

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

    useEffect(() => {
        const followersContainer = followersContainerRef.current as any
        const wrappedHandleFollowersScroll = (e: any) => handleFollowersScroll(followers.length, e)
    
        followersContainer.addEventListener("wheel", wrappedHandleFollowersScroll)
    
        return () => {
            followersContainer.removeEventListener("wheel", wrappedHandleFollowersScroll)
        }
    }, [followers, isLoading, user.followers])

    useEffect(() => {
        const followingContainer = followingContainerRef.current as any
        const wrappedHandleFollowingScroll = (e: any) => handleFollowingScroll(following.length, e)

        followingContainer.addEventListener("wheel", wrappedHandleFollowingScroll)

        return () => {
            followingContainer.removeEventListener("wheel", wrappedHandleFollowingScroll)
        }
    }, [following, isLoading, user.following])

    const handleFollowersScroll = (followersCount: number, e: any) => {
        if (e.deltaY > 0 && !isLoading && followersCount < user.followers!.length)
            getFollower()
    }

    const handleFollowingScroll = (followingCount: number, e: any) => {
        if (e.deltaY > 0 && !isLoading && followingCount < user.following!.length)
            getFollowing()
    }

    useEffect(() => {
        if (followerImageLoaded[7]) {
            setLoading(false)
        }
        if (followingImageLoaded[7]) {
            setLoading(false)
        }
    }, [followerImageLoaded, followingImageLoaded])

    const followOrUnfollow = (user: User) => {
        const followerToFollow = followers.find(follower => follower.userName == user.userName)
        const followingToFollow = following.find(following => following.userName == user.userName)

        if (followerToFollow) {
            followerToFollow.isFollowed = !followerToFollow.isFollowed
            dispatch({ type: 'FOLLOW_OR_UNFOLLOW', payload: followerToFollow })
        }
        if (followingToFollow) {
            followingToFollow.isFollowed = !followingToFollow.isFollowed
            dispatch({ type: 'FOLLOW_OR_UNFOLLOW', payload: followingToFollow })
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
            <div className="flex border-b px-[7vh] mt-[3vh] relative h-[7%]">
                <m.div
                    animate={{ color: view === View.FOLLOWERS ? 'black' : 'gray' }}
                    onClick={() => setViewCallback(View.FOLLOWERS)}
                    className='text-[2vh] font-semibold cursor-pointer px-[1vh]'>
                    {user.followers!.length < 1000
                        ? user.followers!.length + ' followers'
                        : Math.round(user.followers!.length / 1000) + 'K followers'
                    }
                </m.div>
                <m.div
                    animate={{ color: view === View.FOLLOWING ? 'black' : 'gray' }}
                    onClick={() => setViewCallback(View.FOLLOWING)}
                    className='text-[2vh] font-semibold ml-auto cursor-pointer px-[1vh]'>
                    {user.following!.length < 1000
                        ? user.following!.length + ' following'
                        : Math.round(user.following!.length / 1000) + 'K following'
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
            <div
                id='container' 
                className='flex overflow-x-hidden hide-scrollbar w-[100%] h-[88%] relative'>
                <div id='followers' ref={followersContainerRef} className='w-[100%] h-[100%] pb-[5vh] overflow-y-scroll hide-scrollbar'>
                    {followers.filter(x => x.userName && x.userImage).map((follower, index) => (
                        <div key={index} className='flex items-center border-b px-[2vh] py-[2vh]'>
                            <div className='flex items-center' onClick={() => redirectToUserProfile(follower)}>
                                <m.img
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: followerImageLoaded[index] ? 1 : 0, scale: followerImageLoaded[index] ? 1 : 0 }}
                                    src={follower.userImage}
                                    className='rounded-full w-[5vh] h-[5vh] cursor-pointer'
                                    onLoad={() => setFollowerImageLoaded((imageLoaded) => { 
                                        imageLoaded[index] = true 
                                        return [...imageLoaded]
                                    })}/>
                                <TypeAnimation
                                    sequence={[follower.isDispatched ? 0 : 500, follower.userName! ]}
                                    wrapper="p"
                                    className="text-[2vh] font-semibold ml-[1vh] cursor-pointer"
                                    cursor={false}
                                    speed={follower.isDispatched ? 99 : 40}/>
                            </div>
                            <m.button
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ 
                                    opacity: 1,
                                    scale: 1,
                                    backgroundColor: follower?.isFollowed ? '#E5E7EB' : '#2563EB',
                                    color: follower?.isFollowed ? '#111827' : '#F3F4F6',
                                }}
                                transition={{ duration: 0.2, ease: 'backInOut' }}
                                className="text-[2.3vh] py-[0.5vh] rounded font-semibold w-[40%] ml-auto"
                                onClick={() => followOrUnfollow(follower) }>
                                {follower?.isFollowed ? 'Following' : 'Follow'}
                            </m.button>
                        </div>
                    ))}
                    {loading && (
                        <div id="loader" className="flex justify-center items-center w-full h-[10%] py-[5vh] relative">
                            <ClipLoader color="#6B7280" size={20}/>
                        </div>
                    )}
                </div>
                <div ref={followingContainerRef} className='absolute w-[100%] left-[100%] h-[100%] pb-[5vh] overflow-y-scroll hide-scrollbar'>
                    {following.filter(x => x.userName && x.userImage).map((follower, index) => (
                        <div key={index} className='flex items-center border-b px-[2vh] py-[2vh]'>
                            <div className='flex items-center' onClick={() => redirectToUserProfile(follower)}>
                                <m.img
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: followingImageLoaded[index] ? 1 : 0, scale: followingImageLoaded[index] ? 1 : 0 }}
                                    src={follower.userImage}
                                    className='rounded-full w-[5vh] h-[5vh] cursor-pointer'
                                    onLoad={() => setFollowingImageLoaded((imageLoaded) => { 
                                        imageLoaded[index] = true 
                                        return [...imageLoaded]
                                    })}/>
                                <TypeAnimation
                                    sequence={[follower.isDispatched ? 0 : 500, follower.userName! ]}
                                    wrapper="p"
                                    className="text-[2vh] font-semibold ml-[1vh] cursor-pointer"
                                    cursor={false}
                                    speed={follower.isDispatched ? 99 : 40}/>
                            </div>
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
                        <div id="loader" className="flex justify-center items-center w-full h-[10%] py-[3vh] relative">
                            <ClipLoader color="#6B7280" size={20}/>
                        </div>
                    )}
                </div>                
            </div>
        </m.div>
    )
}