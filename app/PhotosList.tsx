'use client'

import { Photo, User } from "@component/typings";
import { fetchData } from "@component/utils/fetchData";
import { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart as unliked, faComment as comment } from '@fortawesome/free-regular-svg-icons'
import { faHeart as liked, faArrowLeft as left } from '@fortawesome/free-solid-svg-icons'
import { ClipLoader } from "react-spinners";
import { TypeAnimation } from "react-type-animation";
import { motion as m } from 'framer-motion'
import { TextAnimation } from "@component/styles/textAnimation";
import { useRouter } from "next/navigation";
import { AppContext } from "@component/contexts/appContext";
import { fetchUsername, getComments, getPostDate } from "@component/utils/providers";

async function fetchSinglePhoto() {
    const usedIndexes = JSON.parse(localStorage.getItem('usedIndexes') || '[]')
    return fetchData(`randomPhoto?usedIndexes=${JSON.stringify(usedIndexes)}`)
}

const enum View {
    PHOTOS,
    COMMENTS
}

interface PageProps {
    fetchedPhotos?: Photo[]
    onBackToProfile?: () => void,
    photoIndex?: number,
    photoLiked?: (photo: Photo) => void
}

export default function PhotosList({ fetchedPhotos, onBackToProfile, photoIndex, photoLiked }: PageProps) {
    const { state, dispatch } = useContext(AppContext)
    const [photos, setPhotos] = useState<Photo[]>([])
    const containerRef = useRef<any>()
    const [loading, setLoading] = useState<boolean>(false)
    const [imageLoaded, setImageLoaded] = useState<boolean[]>([])
    const [view, setView] = useState<View>(View.PHOTOS)
    const [currentPhoto, setCurrentPhoto] = useState<Photo>()
    const [inputValue, setInputValue] = useState<string>('')
    const [redirectAnimation, setRedirectAnimation] = useState<boolean>(false)
    const router = useRouter()
    let isRunOut = false
    let interrupt = false
    let isLoading = false
    let currentIndex = 0
    let photosLength = 0
    var TextareaAutosize = require('react-textarea-autosize').default;

    const fetchPhoto = async () => {
        if (isLoading || isRunOut || fetchedPhotos) return
        setLoading(true)
        isLoading = true
        setTimeout(() => {
            const loader = document.getElementById('loader')
            loader?.scrollIntoView({ behavior: 'smooth' })
            if (photosLength != 0) currentIndex++
        }, 100)
        fetchSinglePhoto().then((photo) => {
            fetchUsername().then(async (username) => {
                const likes = Math.floor(Math.random() * 5000) 
                const comments = await getComments(likes)
                isRunOut = photo.isRunOut
                setPhotos((prevPhotos) => {
                    const newPhoto: Photo = {
                        index: prevPhotos.length,
                        imageSrc: photo.src,
                        user: { 
                            userName: username[0], 
                            userImage: photo.src,
                            followers: Math.floor(Math.random() * likes * 4),
                            following: Math.floor(Math.random() * 200),
                            posts: Math.floor(Math.random() * 25 + 5), 
                            photos: []
                        },
                        likes: likes,
                        desc: 'no filter no filter no filter no filter no filter no filter',
                        comments: comments,
                        isLiked: false,
                        postDate: getPostDate(),
                        isDispatched: false
                    }
                    photosLength = prevPhotos.length + 1
                    return [...prevPhotos, newPhoto]
                })

                localStorage.setItem("usedIndexes", JSON.stringify(photo.usedIndexes))
            })
        })

        setTimeout(() => {
            isLoading = false
        }, 2000)
    }

    useEffect(() => {
        if (!fetchedPhotos)
            dispatch({ type: 'SET_PHOTOS', payload: photos })
    }, [photos])

    useEffect(() => {
        if (fetchedPhotos) {
            setPhotos(fetchedPhotos)
            photosLength = fetchedPhotos.length
            currentIndex = photoIndex!
            setTimeout(() => {
                scrollToIndex(photoIndex!)
            }, 0)
            return
        }
        if (state.photos.length === 0) {
            localStorage.removeItem('usedIndexes')
            fetchPhoto()
        } else {
            setPhotos(state.photos)
            photosLength = state.photos.length
        }
    }, [])

    const handleScroll = (e: any) => {
        if (interrupt || isLoading) return
        interrupt = true
        if (e.deltaY > 0) {
            if (currentIndex == photosLength - 1) fetchPhoto()
            const nextBox = document.getElementById(`${currentIndex + 1}`)
            nextBox?.scrollIntoView({ behavior: 'smooth' })
            if (nextBox && currentIndex != photosLength) currentIndex++
        } else {
            const prevBox = document.getElementById(`${currentIndex - 1}`)
            prevBox?.scrollIntoView({ behavior: 'smooth' })
            if (prevBox && currentIndex != 0) currentIndex--
        }
        setTimeout(() => {
            interrupt = false
        }, 200)
    }

    const scrollToIndex = (index: number) => {
        const destBox = document.getElementById(`${index}`)
        destBox?.scrollIntoView()
    }

    useEffect(() => {
        const container = containerRef.current as any
        container.addEventListener('wheel', handleScroll)
    }, [])

    const likeOrUnlike = (photo: Photo) => {
        setPhotos(
            photos.map((p) => {
              if (p.imageSrc === photo.imageSrc) {
                return { 
                    ...p, 
                    isLiked: !p.isLiked,
                    likes: p.isLiked ? p.likes - 1 : p.likes + 1 
                };
              }
              return p;
            })
        )
        if (photoLiked) photoLiked(photo)
        dispatch({ type: 'LIKE_OR_UNLIKE', payload: { photo } })
    }

    const handleImageLoad = (index: number) => {
        setImageLoaded((prev) => {
            setLoading(false)
            return [...prev, true]
        })
    }

    useEffect(() => {
        const container = document.getElementById('container')!
        const boxWidth = container?.offsetWidth
        if (view == View.COMMENTS)
            container.scrollBy({ left: boxWidth + 1,  behavior: 'smooth' })
        else
            container.scrollBy({ left: -boxWidth - 1, behavior: 'smooth' })
    }, [view])

    const handleViewComments = (photo: Photo) => {
        setCurrentPhoto(photo)
        setView(View.COMMENTS)
    }

    const handlePostComment = (event: any) => {
        event.preventDefault()
        if (inputValue == '') return
        const newComment = {
            user: { userName: 'You' },
            content: inputValue,
            postDate: getPostDate(),
            likes: 0,
            isLiked: false,          
        }
        setPhotos(
            photos.map((p) => {
              if (p.imageSrc === currentPhoto?.imageSrc) {
                return { 
                    ...p, 
                    comments: [...p.comments, newComment]
                }
              }
              return p
            })
        )
        setCurrentPhoto((prev) => {
            if (prev) {
                return {
                    ...prev,
                    comments: [...prev.comments, newComment]
                }
            }
        })
        setInputValue('')
        const container = document.getElementById('comments-container')!
        setTimeout(() => {
            container.scrollBy({ top: container.scrollHeight, behavior: 'smooth' })
        }, 100)
    }

    const redirectToUserProfile = (user: User) => {
        setRedirectAnimation(true)
        if (fetchedPhotos) {
            setTimeout(() => {
                onBackToProfile!()
                return
            }, 300)
        }
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
        <div id="container" className="flex h-[100%] relative overflow-x-hidden hide-scrollbar">
            <m.div 
                initial={{ x: '100%' }}
                animate={{ x: redirectAnimation ? '100%' : '0%' }}
                transition={{ ease: 'backInOut', duration: 0.3 }}
                ref={containerRef} 
                className="h-[100%] w-[100%] absolute left-0 top-0 overflow-y-hidden hide-scrollbar">
                {photos.map((photo: any) => (
                    <div id={photo.index} key={photo.index} className="h-[100%] pt-[0.5vh]">
                        <div className="flex items-center m-[1vh] cursor-pointer" onClick={() => redirectToUserProfile(photo.user)}>
                            <m.div 
                                initial={{ x: "-100%", opacity: 0 }}
                                animate={{ x: imageLoaded[photo.index] ? 0 : "-100%", opacity: imageLoaded[photo.index] ? 1 : 0 }}
                                className="bg-border-gradient rounded-full p-[0.5vh] border">
                                <img 
                                    src={photo.imageSrc} 
                                    onLoad={() => handleImageLoad(photo.index)}
                                    className="w-[5vh] rounded-full p-[0.4vh] bg-gray-100" />
                            </m.div>
                            {imageLoaded[photo.index] && <>
                                <TypeAnimation
                                    sequence={[photo.isDispatched ? 0 : 1000, photo.user.userName]}
                                    wrapper="p"
                                    className="ml-[1vh] font-bold text-[2vh]"
                                    cursor={false}
                                    speed={photo.isDispatched ? 99 : 40}
                                />
                                <TypeAnimation
                                    sequence={[photo.isDispatched ? 0 : 2200, '• ' + photo.postDate]}
                                    wrapper="p"
                                    className="ml-[1vh] text-[2vh] text-gray-500"
                                    cursor={false}
                                    speed={photo.isDispatched ? 99 : 40}
                                />
                            </>}
                        </div>
                        <m.img
                            initial={{ scale: 0.3, opacity: 0 }}
                            animate={{ scale: imageLoaded[photo.index] ? 1 : 0, opacity: imageLoaded[photo.index] ? 1 : 0 }}
                            src={photo.imageSrc} />
                        {imageLoaded[photo.index] && <>
                            <m.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: photo.isDispatched ? 0 : 1 }}
                                className="mt-[1.5vh] flex">
                                {!photo.isLiked && <FontAwesomeIcon icon={unliked} className="px-[1.5vh] text-[4vh] cursor-pointer hover:text-gray-600 animate-ping-once" onClick={() => likeOrUnlike(photo)} />}
                                {photo.isLiked && <FontAwesomeIcon icon={liked} className="px-[1.5vh] text-[4vh] cursor-pointer text-red-500 animate-ping-once" onClick={() => likeOrUnlike(photo)} />}
                                <FontAwesomeIcon icon={comment} className="px-[1.5vh] text-[4vh] cursor-pointer hover:text-gray-600 animate-ping-once" onClick={() => handleViewComments(photo)}/>
                            </m.div>
                            {photo.isDispatched ? 
                                <p className="px-[1.5vh] pt-1 font-bold text-[2vh]">
                                    {photo.likes.toString()
                                                .replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' likes'}
                                </p> :
                                <TextAnimation
                                    className="px-[1.5vh] pt-1 font-bold text-[2vh]" 
                                    text={photo.likes.toString()
                                                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' likes'}
                                    delay={photo.isDispatched ? 0 : 40}/>
                            }
                            <p className="px-[1.5vh] leading-[2.5vh]">
                                <TypeAnimation
                                    sequence={[photo.isDispatched ? 0 : 2800, photo.user.userName ]}
                                    wrapper="span"
                                    className="font-bold text-[2vh]"
                                    cursor={false}
                                    speed={photo.isDispatched ? 99: 60}
                                />
                                <TypeAnimation
                                    sequence={[photo.isDispatched ? 0 : 3300, photo.desc ]}
                                    wrapper="span"
                                    className="ml-2 text-[2vh]"
                                    cursor={false}
                                    speed={photo.isDispatched ? 99 : 60}
                                />             
                            </p>      
                            {photo.comments.length > 1 &&
                                <div onClick={() => handleViewComments(photo)}>
                                    <TypeAnimation
                                        sequence={[photo.isDispatched ? 0 : 3800, 'View all comments ' + photo.comments.length ]}
                                        wrapper="p"
                                        className="px-[1.5vh] pt-[1vh] text-gray-500 text-[2vh] cursor-pointer mb-0"
                                        cursor={false}
                                        speed={photo.isDispatched ? 99 : 60}
                                    />   
                                </div>
                            }
                            {photo.comments.length > 0 && (
                            <p className="px-[1.5vh] mt-[1vh] leading-[2.5vh]" key={photo.comments[0].userName}>
                                <TypeAnimation
                                    sequence={[photo.isDispatched ? 0 : 4300, photo.comments[0].user.userName ]}
                                    wrapper="span"
                                    className="font-bold text-[2vh]"
                                    cursor={false}
                                    speed={photo.isDispatched ? 90 : 60}
                                /> 
                                <TypeAnimation
                                    sequence={[photo.isDispatched ? 0 : 5000, photo.comments[0].content ]}
                                    wrapper="span"
                                    className="ml-2 text-[2vh]"
                                    cursor={false}
                                    speed={photo.isDispatched ? 99 : 60}
                                />                         
                            </p>
                            )}
                        </>}
                    </div>
                ))}
                {loading && (
                    <div id="loader" className="flex justify-center items-center w-full h-full relative">
                        <ClipLoader color="#6B7280" className=""/>
                    </div>
                )}
            </m.div>
            {currentPhoto && <div className="w-[101%] h-[100%] absolute left-[100%] overflow-hidden">
                <div className="relative h-[100%]">
                    <div id="comments-top" className="flex mx-[1vh] mt-[1.5vh] items-center top-0">
                        <FontAwesomeIcon icon={left} className="px-[1.5vh] text-[4vh] cursor-pointer hover:text-gray-600 animate-ping-once" onClick={() => setView(View.PHOTOS)} />
                        <span className="text-[2.5vh] font-bold ml-[1vh]">Comments</span>
                    </div>
                    <div className="flex p-[1.5vh] border-b">
                        <div>
                            <div className="bg-border-gradient rounded-full p-[0.5vh] border">
                                <img src={currentPhoto?.imageSrc} className="w-[8vh] rounded-full p-[0.4vh] bg-gray-100" />
                            </div>
                        </div>
                        <div className="ml-[2vh]">
                            <p className="font-bold text-[2vh]">{currentPhoto?.user.userName}</p>
                            <p className="text-[2vh] leading-[2.5vh]">{currentPhoto?.desc}</p>
                        </div>
                    </div>
                    <div id="comments-container" className="overflow-y-scroll hide-scrollbar h-full pb-[25vh]">
                        {currentPhoto?.comments?.map((comment: any) => (
                            <div key={comment.user.userName} className="flex p-[1.5vh]">
                                <div>
                                    <img src={comment?.userImage} className="w-[8vh] rounded-full p-[0.4vh] bg-gray-100" />
                                </div>
                                <div className="ml-[2vh]">
                                    <p className="font-bold text-[2vh]">{comment?.user.userName}</p>
                                    <p className="text-[2vh] leading-[2.5vh]">{comment?.content}</p>
                                </div>
                            </div>    
                        ))}
                    </div>
                    <div className="flex absolute bottom-[1.8%] left-[1%] min-h-[10%] h-auto w-[98%] px-[1vh] pt-[1vh] border-t bg-gray-100 rounded-b-2xl">
                        <img src={currentPhoto?.imageSrc} className="w-[5vh] h-[5vh] rounded-full bg-gray-100 mr-[2vh]" />
                        <TextareaAutosize
                            value={inputValue}
                            onChange={(e: any) => setInputValue(e.target.value)}
                            onKeyDown={(e: any) => e.key === 'Enter' && handlePostComment(e)}
                            maxRows={7}
                            className="border-none outline-none text-[2vh] resize-none w-full hide-scrollbar bg-transparent my-[1vh]" 
                            placeholder={`Add a comment for`} />
                        <span 
                            className="font-semibold text-[2.5vh] text-blue-500 cursor-pointer mt-[1vh] mx-[2vh]"
                            onClick={(e: any) => handlePostComment(e)}>
                            Post
                        </span>
                    </div>
                </div>
            </div>}
        </div>
    )
}