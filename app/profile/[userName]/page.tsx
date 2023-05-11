'use client'

import { useRouter } from "next/navigation"
import { useContext, useEffect, useRef, useState } from "react"
import { motion as m } from 'framer-motion'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight as right, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { fetchData } from "@component/utils/fetchData"
import { Photo } from "@component/typings"
import { fetchBio, fetchSinglePhoto, getComments, getPostDate } from "@component/utils/providers"
import { AppContext } from "@component/contexts/appContext"
import PhotosList from "@component/app/PhotosList"
import { TypeAnimation } from "react-type-animation"
import { FollowsList } from "../FollowsList"

type PageProps = {
    params: {
        userName: string
    }
}

export const enum View {
    PROFILE,
    FOLLOWERS,
    FOLLOWING
}

export default function UserProfile({ params: { userName } }: PageProps) {
    const { state, dispatch } =  useContext(AppContext)
    const [redirectAnimation, setRedirectAnimation] = useState(false)
    const router = useRouter()
    const user = state.users.find(user => user.userName == userName)!
    const [avatarLoaded, setAvatarLoaded] = useState(false)
    const [imageLoaded, setImageLoaded] = useState<boolean[]>(Array(user?.posts).fill(false) || [])
    const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null)
    const [view, setView] = useState<View>(View.PROFILE)
    const [isLoading, setIsLoading] = useState(false)
    const isMounted = useRef(true)

    useEffect(() => {
        return () => {
            isMounted.current = false
        }
    }, [])

    useEffect(() => {
        const fetchPhotos = async () => {
            setIsLoading(true)
            for (let i = user?.photos!.length; i < user?.posts!; i++) {
                if (!isMounted.current) return
                await getPhoto(i)
            }
            setIsLoading(false)
        }
        if (!user) {
            router.push('/')
        } else if (user?.photos!.length < user?.posts! && !isLoading) {
            fetchBio().then(bio => {
                user.bio = bio
            })
            fetchPhotos()
        }
    }, [state.users, isLoading])

    const getPhoto = async (index: number) => {
        const photo = await fetchSinglePhoto(user.prompt!.prompt!)
        const likes = Math.floor(Math.random() * 5000)
        const newPhoto: Photo = {
            index,
            imageSrc: photo.src,
            user: { 
                userName: user.userName, 
                userImage: user.userImage,
                followers: user.followers,
                following: user.following,
                posts: user.posts, 
                prompt: user.prompt!
            },
            likes: likes,
            desc: 'no filter no filter no filter no filter no filter no filter',
            comments: await getComments(likes),
            isLiked: false,
            postDate: getPostDate(),
            isDispatched: true,
        }

        user.photos!.push(newPhoto)

        dispatch({ type: 'SET_USERS', payload: [
            ...state.users,
            user
        ]})

        localStorage.setItem(`${user.prompt?.prompt}_usedIndexes`, JSON.stringify(photo.usedIndexes))         
    }

    const redirectToHome = () => {
        setRedirectAnimation(true)
        setTimeout(() => {
            router.push('/')
        }, 300);
    }

    const followOrUnfollow = () => {
        if (user.photos!.length == user.posts) {
            dispatch({ type: 'FOLLOW_OR_UNFOLLOW', payload: user })
        } else {
            user.isFollowed = !user.isFollowed
            user.isFollowed ? user.followers!.push({}) : user.followers!.pop()
        }
    }

    const likeOrUnlikePhoto = (photoArg: Photo) => {
        user!.photos!.map(photo => {
            if (photo.imageSrc == photoArg.imageSrc
                && photo.likes == photoArg.likes
                && user?.photos?.length != user?.posts) {
                photo.isLiked = !photo.isLiked
            }
        })
    }

    const sortPhotos = (photos: Photo[]) => {
        return photos.sort((a, b) => {
            if (a.index > b.index) {
                return 1
            } else if (a.index < b.index) {
                return -1
            } else {
                return 0
            }
        })
    }

    const handleSetView = (view: View) => {
        setView(view)
    }

    return (
        <div className="hide-scrollbar h-[100%] relative items-center">
            {!currentPhoto && user &&
                <m.div
                    initial={{ x: '-100%' }}
                    animate={{ x: redirectAnimation ? '-100%' : '0%' }}
                    transition={{ ease: 'backInOut', duration: 0.3 }}
                    className="relative h-[100%]">
                    <div className="flex mx-[1vh] mt-[1.5vh] items-center top-0 h-[5%]">
                        <span className="text-[2.5vh] font-bold ml-[1vh] cursor-pointer" onClick={() => setCurrentPhoto(null)}>{user?.userName}</span>
                        <FontAwesomeIcon 
                            icon={right} 
                            className="px-[1.5vh] text-[4vh] cursor-pointer hover:text-gray-600 animate-ping-once ml-auto" 
                            onClick={() => redirectToHome()}/>                    
                    </div>
                    <div className="flex items-center p-[1.5vh] border-b h-[15%]">
                        <div>
                            <m.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: avatarLoaded ? 1 : 0, scale: avatarLoaded ? 1 : 0 }}
                                transition={{ duration: 0.2, ease: 'backInOut' }} 
                                className="bg-border-gradient rounded-full p-[0.5vh] border">
                                <img 
                                    onLoad={() => setAvatarLoaded(true)}
                                    src={user?.userImage} 
                                    className="w-[9vh] rounded-full p-[0.4vh] bg-gray-100" />
                            </m.div>
                        </div>
                        <div className="ml-[2vh] mt-[1vh] text-center">
                            <TypeAnimation
                                sequence={[user?.photos?.length! > 2 ? 0 : 500, user!.posts!.toString() ]}
                                wrapper="p"
                                className="font-semibold block text-[2.5vh] h-[3.75vh]"
                                cursor={false}
                                speed={user?.photos?.length! > 2 ? 99 : 40}
                            />
                            <p className="text-[2vh]">Posts</p>                        
                        </div>
                        <div className="ml-[3vh] mt-[1vh] text-center cursor-pointer" onClick={() => handleSetView(View.FOLLOWERS)}>
                            {user?.photos?.length! < 2 && <TypeAnimation
                                sequence={[user?.photos?.length == user?.posts ? 0 : 700, user!.followers!.length.toString() ]}
                                wrapper="p"
                                className="font-semibold block text-[2.5vh] h-[3.75vh]"
                                cursor={false}
                                speed={40}
                            />}
                            {user?.photos?.length! >= 2 && <p className="font-semibold block text-[2.5vh] h-[3.75vh]">
                                {user!.followers!.length.toString()}
                            </p>
                            }
                            <p className="text-[2vh]">Followers</p>   
                        </div>
                        <div className="ml-[3vh] mt-[1vh] text-center cursor-pointer" onClick={() => handleSetView(View.FOLLOWING)}>
                            <TypeAnimation
                                sequence={[user?.photos?.length! > 2 ? 0 : 900, user!.following!.length.toString() ]}
                                wrapper="p"
                                className="font-semibold block text-[2.5vh] h-[3.75vh]"
                                cursor={false}
                                speed={user?.photos?.length! > 2 ? 99 : 40}
                            />
                            <p className="text-[2vh]">Following</p>
                        </div>
                    </div>
                    <div className="overflow-y-scroll hide-scrollbar h-[80%] pb-[5vh]">
                        <div className="p-[1.5vh]">
                            <div className="mt-[1vh] h-[30%]">
                                {user.bio && <TypeAnimation
                                    sequence={[0, user.bio.toString() ]}
                                    wrapper="p"
                                    className="text-[2vh] whitespace-pre-line"
                                    cursor={false}
                                    speed={user?.photos?.length! > 2 ? 99 : 40}
                                />}
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
                                onClick={() => followOrUnfollow()} 
                                className="text-[2.3vh] py-[0.5vh] rounded font-semibold w-[40%] mt-[2vh]">
                                {user?.isFollowed ? <p>Following  <FontAwesomeIcon icon={faChevronDown}/></p> : 'Follow'}
                            </m.button>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                            {user?.photos?.map((photo, index) => (
                                <m.img
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ 
                                        opacity: imageLoaded[index] ? 1 : 0, 
                                        scale: imageLoaded[index] ? 1 : 0,
                                    }}
                                    onLoad={() => setImageLoaded((prevState) => {
                                        prevState[index] = true
                                        return [...prevState]
                                    })}
                                    onClick={() => setCurrentPhoto(photo)}
                                    key={index} 
                                    src={photo.imageSrc}
                                    className="border border-gray-300 cursor-pointer"/>
                            ))}     
                        </div>
                    </div>
                </m.div>
            }
            {currentPhoto &&
                <PhotosList 
                    fetchedPhotos={sortPhotos(user!.photos!)} 
                    onBackToProfile={() => { setCurrentPhoto(null); setAvatarLoaded(false); } }
                    photoIndex={currentPhoto.index} 
                    photoLiked={(photo: Photo) => likeOrUnlikePhoto(photo)}/>
            }
            {view != View.PROFILE && <FollowsList user={user!} view={view} setViewCallback={(view: View) => handleSetView(view)}/>}
        </div>
    )
}