export type Todo = {
    userId: number
    id: number
    title: string
    completed: boolean
}

export type User = {
    userName: string
    userImage?: string
    photos?: Photo[]
    followers?: number
    following?: number
    posts?: number
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
    content: string
    user: User
    userImage?: string
    postDate: string
    likes: number,
    isLiked: boolean
}