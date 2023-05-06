'use client'

import { useRouter } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import { motion as m } from 'framer-motion'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight as right } from '@fortawesome/free-solid-svg-icons'
import { fetchData } from "@component/utils/fetchData"
import { Photo } from "@component/typings"
import { getComments, getPostDate } from "@component/utils/providers"
import { AppContext } from "@component/contexts/appContext"
import PhotosList from "@component/app/PhotosList"

type PageProps = {
    params: {
        userName: string
    }
}

async function fetchPhotos(amount: number) {
    const usedIndexes = JSON.parse(localStorage.getItem('usedIndexes') || '[]')
    return fetchData(`randomPhotos?amount=${amount}&usedIndexes=${JSON.stringify(usedIndexes)}`)
}

export default function UserProfile({ params: { userName } }: PageProps) {
    const { state, dispatch } =  useContext(AppContext)
    const [redirectAnimation, setRedirectAnimation] = useState(false)
    const router = useRouter()
    const user = state.users.find(user => user.userName == userName)
    const [imageLoaded, setImageLoaded] = useState<boolean[]>(Array(user?.posts).fill(false) || [])
    const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null)

    useEffect(() => {
        if (!user) {
            router.push('/')
        } else if (user?.photos!.length == 0)
            fetchPhotos(user?.posts!).then((photos) => {
                let fetchedPhotos: Photo[] = []
                photos.srcs.forEach(async (src: string, index: number) => {
                    const newPhoto: Photo = {
                        index: index,
                        imageSrc: src,
                        user: { 
                            userName: user.userName, 
                            userImage: user.userImage,
                            followers: user.followers,
                            following: user.following,
                            posts: user.posts, 
                        },
                        likes: Math.floor(Math.random() * 5000) ,
                        desc: 'no filter no filter no filter no filter no filter no filter',
                        comments: await getComments(Math.floor(Math.random() * 10)),
                        isLiked: false,
                        postDate: getPostDate(),
                        isDispatched: true
                    }
                    fetchedPhotos.push(newPhoto)
                })
                user.photos = fetchedPhotos
                dispatch({ type: 'SET_USERS', payload: [
                    ...state.users,
                    user
                ]})
            })
    }, [state.users])

    const redirectToHome = () => {
        setRedirectAnimation(true)
        setTimeout(() => {
            router.push('/')
        }, 300);
    }

    return (
        <div className="hide-scrollbar h-[100%]">
            {!currentPhoto && 
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
                    <div className="flex p-[1.5vh] border-b items-center h-[15%]">
                        <div>
                            <div className="bg-border-gradient rounded-full p-[0.5vh] border">
                                <img src={user?.userImage} className="w-[9vh] rounded-full p-[0.4vh] bg-gray-100" />
                            </div>
                        </div>
                        <div className="ml-[2vh] mt-[1vh] text-center">
                            <p className="font-semibold block text-[2.5vh]">{user?.posts}</p>
                            <p className="text-[2vh]">Posts</p>
                        </div>
                        <div className="ml-[3vh] mt-[1vh] text-center">
                            <p className="font-semibold block text-[2.5vh]">{user?.followers}</p>
                            <p className="text-[2vh]">Followers</p>
                        </div>
                        <div className="ml-[3vh] mt-[1vh] text-center">
                            <p className="font-semibold block text-[2.5vh]">{user?.following}</p>
                            <p className="text-[2vh]">Following</p>
                        </div>
                    </div>
                    <div className="overflow-y-scroll hide-scrollbar h-[80%] pb-[5vh]">
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
                    fetchedPhotos={user!.photos} 
                    onBackToProfile={() => setCurrentPhoto(null)}
                    photoIndex={currentPhoto.index} />
            }
        </div>
    )
}