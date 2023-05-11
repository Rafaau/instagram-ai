import { Prompt } from "./lib/prompts"

export type User = {
    userName?: string
    userImage?: string
    photos?: Photo[]
    followers?: User[]
    following?: User[]
    posts?: number
    isFollowed?: boolean
    bio?: string
    isDispatched?: boolean
    prompt?: { prompt: string, gender: string }
}

export type Photo = {
    index: number
    imageSrc: string
    user: User
    likes: number
    desc: string
    comments: Comment[]
    isLiked: boolean
    postDate: string
    isDispatched: boolean
}

export type Comment = {
    content?: string
    user?: User
    userImage?: string
    postDate?: string
    likes?: number
    isLiked?: boolean
    isDispatched?: boolean
}