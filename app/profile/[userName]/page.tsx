'use client'

import { useRouter } from "next/navigation"
import { useContext, useEffect, useRef, useState } from "react"
import { motion as m } from 'framer-motion'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight as right, faChevronDown, faTableCells as grid, faClapperboard as reels, faIdBadge as mention } from '@fortawesome/free-solid-svg-icons'
import { fetchData } from "@component/utils/fetchData"
import { Photo, Story } from "@component/typings"
import { fetchBio, fetchDesc, fetchSinglePhoto, getComments, getPostDate } from "@component/utils/providers"
import { AppContext } from "@component/contexts/appContext"
import PhotosList from "@component/app/PhotosList"
import { TypeAnimation } from "react-type-animation"
import { FollowsList } from "../FollowsList"
import { TypeAnimationCustom } from "@component/styles/textAnimation"
import { parseHashtags, parseHashtagsFixed } from "@component/styles/hashtags"
import { PhotoPrompts } from "@component/lib/prompts"
import { Stories } from "../Stories"
import { DirectMessage } from "../DirectMessage"

type PageProps = {
    params: {
        userName: string
    }
}

const enum View {
    PROFILE,
    FOLLOWERS,
    FOLLOWING,
    DM
}

const enum ContentView {
    PHOTOS,
    REELS,
    TAGGED
}

export default function UserProfile({ params: { userName } }: PageProps) {
    const { state, dispatch } =  useContext(AppContext)
    const [redirectAnimation, setRedirectAnimation] = useState(false)
    const router = useRouter()
    const user = state.users.find(user => user.userName == userName)!
    const [avatarLoaded, setAvatarLoaded] = useState(false)
    const [imageLoaded, setImageLoaded] = useState<boolean[]>(Array(user?.posts).fill(false) || [])
    const [storyLoaded, setStoryLoaded] = useState<boolean[]>(Array(user?.stories?.length).fill(false) || [])
    const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null)
    const [currentStory, setCurrentStory] = useState<Story | null>(null)
    const [view, setView] = useState<View>(View.PROFILE)
    const [contentView, setContentView] = useState<ContentView>(ContentView.PHOTOS)
    const [isLoading, setIsLoading] = useState(false)
    const [bioLoaded, setBioLoaded] = useState(false)
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

        const fetchStories = async (index: number) => {
            let random = Math.floor(Math.random() * 8);
            random += PhotoPrompts.length - 8;
            const photoPrompt = PhotoPrompts[random];
            
            for (let i = 0; i < Math.floor(Math.random() * 10 + 1); i++) {
                if (!isMounted.current) return
                await getStory(index, photoPrompt)
            }
        }

        if (!user) {
            router.push('/')
        } else if (user?.photos!.length < user?.posts! && !isLoading) {
            if (!user.bio)
                fetchBio(user.prompt!.gender!).then(bio => {
                    user.bio = bio
                })
            if (user.stories?.some(x => !x.photos?.length)) {
                for (let i = 0; i < user.stories!.length; i++) {
                    if (!user.stories![i].photos?.length) {
                        fetchStories(i)
                    }
                }
            }
            fetchPhotos()
        }
    }, [state.users, isLoading])

    const getPhoto = async (index: number) => {
        let photoPrompt = user.prompt!

        if (Math.floor(Math.random() * 4) == 0) {
            const random = Math.floor(Math.random() * PhotoPrompts.length)
            if (random > 9)
                photoPrompt = PhotoPrompts[random]
        }

        const photo = await fetchSinglePhoto(photoPrompt!.prompt)
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
                prompt: user.prompt!,
                isDispatched: user.isDispatched
            },
            likes: likes,
            desc: await fetchDesc(photoPrompt!.gender),
            //comments: await getComments(likes, photoPrompt!.gender),
            comments: [],
            isLiked: false,
            postDate: getPostDate(),
            isDispatched: true,
        }

        user.photos!.push(newPhoto)

        dispatch({ type: 'SET_USERS', payload: [
            ...state.users,
            user
        ]})

        localStorage.setItem(`${photo.prompt}_usedIndexes`, JSON.stringify(photo.usedIndexes))         
    }

    const getStory = async (index: number, prompt: any) => {
        const photo = await fetchSinglePhoto(prompt.prompt)

        user.stories![index] = {
            user: { userImage: user.userImage, userName: user.userName },
            photos: [...user.stories![index].photos!, photo.src],
            postDates: [...user.stories![index].postDates!, getPostDate()],
        }

        localStorage.setItem(`${photo.prompt}_usedIndexes`, JSON.stringify(photo.usedIndexes))       
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

    useEffect(() => {
        const photos = document.getElementById('photos')
        const reels = document.getElementById('reels')
        const tagged = document.getElementById('tagged')

        if (contentView == ContentView.PHOTOS)
            photos?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        else if (contentView == ContentView.REELS)
            reels?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        else if (contentView == ContentView.TAGGED)
            tagged?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, [contentView])

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
                        <div className="sm:ml-[2vh] mt-[1vh] text-center ml-auto">
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
                    <div className="overflow-y-scroll hide-scrollbar h-[80%] pb-[2vh]">
                        <div className="p-[1.5vh]">
                            <div className="h-[30%] w-[80%] sm:w-full">
                                {user.bio && !user.isDispatched &&                                     
                                    <TypeAnimationCustom 
                                        text={parseHashtags(user.bio.trimStart())} 
                                        speed={user.photos?.length! > 2 ? 99 : 60}
                                        onLoad={() => { user.isDispatched = true }}
                                        className={'text-[2vh] whitespace-pre-line leading-[0.1vh]'}/>
                                }
                                {user.bio && user.isDispatched &&
                                    <p className="text-[2vh] whitespace-pre-line">{parseHashtagsFixed(user.bio.trimStart())}</p>
                                }
                            </div>
                            <div className="flex">
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
                                <m.button
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ 
                                        opacity: user.bio ? 1 : 0,
                                        scale: user.bio ? 1 : 0,
                                        backgroundColor: '#E5E7EB',
                                        color: '#111827',
                                    }}
                                    transition={{ duration: 0.2, ease: 'backInOut' }}
                                    className="text-[2.3vh] py-[0.5vh] rounded font-semibold w-[40%] mt-[2vh] ml-[2vh]"
                                    onClick={() => setView(View.DM)}>
                                    Message
                                </m.button>
                            </div>
                            {user?.stories!.length > 0 &&
                                <div className="flex items-center mt-[2vh]">
                                    {user.stories!.map((story, index) => (
                                        <div key={`story-${index}`}>
                                        {story.photos && 
                                            <m.img      
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: storyLoaded[index] ? 1 : 0, scale: storyLoaded[index] ? 1 : 0 }}                                   
                                                src={story.photos![0]}
                                                className="w-[9vh] rounded-full p-[0.4vh] bg-gray-100 cursor-pointer border border-gray-200 mr-[2vh]"
                                                onClick={() => setCurrentStory(story)}
                                                onLoad={() => setStoryLoaded((prev) => { prev[index] = true; return prev; })}>
                                            </m.img>
                                        }
                                        </div>
                                    ))}
                                </div>
                            }
                        </div>
                        <div className="flex sticky top-[-1%] text-[3vh] border-b bg-gray-100 h-[12%] justify-center items-center z-10">
                            <FontAwesomeIcon 
                                icon={grid} 
                                className={`cursor-pointer w-full text-gray-${contentView == ContentView.PHOTOS ? 700 : 500}`}
                                onClick={() => setContentView(ContentView.PHOTOS)}/>
                            <FontAwesomeIcon 
                                icon={reels} 
                                className={`cursor-pointer w-full text-gray-${contentView == ContentView.REELS ? 700 : 500}`}
                                onClick={() => setContentView(ContentView.REELS)}/>
                            <FontAwesomeIcon 
                                icon={mention} 
                                className={`cursor-pointer w-full scale-y-90 text-gray-${contentView == ContentView.TAGGED ? 700 : 500}`}
                                onClick={() => setContentView(ContentView.TAGGED)}/>
                            <m.div
                                animate={{ left: contentView == ContentView.PHOTOS ? '0%' : contentView == ContentView.REELS ? '33%' : '66%' }}
                                className="absolute bottom-0 h-[0.5vh] w-[33%] bg-gray-700">                          
                            </m.div>
                        </div>
                        <div className="flex space-x-[1vh] relative overflow-x-scroll hide-scrollbar">
                            <div id="photos" className="grid grid-cols-3 gap-1">
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
                                        onClick={() => { setCurrentPhoto(photo) } }
                                        key={index} 
                                        src={photo.imageSrc}
                                        className="border border-gray-300 cursor-pointer"/>
                                ))}     
                            </div>
                            <div id="reels" className="absolute left-[100%] bg-gray-100 w-full h-full">

                            </div>
                            <div id="tagged" className="absolute left-[200%] bg-gray-100 w-full h-full">

                            </div>
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
            {currentStory &&
                <Stories story={currentStory} closeStories={() => setCurrentStory(null)}/>
            }
            {view != View.PROFILE && view != View.DM && <FollowsList user={user!} view={view} setViewCallback={(view: View) => handleSetView(view)}/>}
            {view == View.DM && <DirectMessage user={user!} setViewCallback={(view: View) => handleSetView(view)} />}
        </div>
    )
}