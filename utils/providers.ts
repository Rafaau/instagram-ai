import { fetchData } from "./fetchData"
import { Comment } from "@component/typings"

export async function fetchUsername() {
    const response = await fetch('https://names.drycodes.com/1?nameOptions=girl_names&case=lower')
    const data = await response.json()
    return data
}

export async function fetchComment(reps: number = 1) {
    let comments: Comment[] = []
    for (let i = 0; i < reps; i++) {
        const res = await fetchData('randomComment') as any
        const userName = await fetchUsername()
        //const userImage = await fetchSinglePhoto()
        comments.push({
            content: res.content,
            user: { userName: userName[0] },
            postDate: getPostDate(),
            isLiked: false,
            likes: Math.floor(Math.random() * 1),
            //userImage: userImage.src
        })
    }
    return comments
}

export async function fetchBio() {
    const response = await fetchData('randomBio')
    return response.bio
}

export function getPostDate() {
    const hours = Math.floor(Math.random() * 96)
    let postDate: string
    switch (true) {
        case (hours < 24 && hours > 1):
            postDate = `${hours} hours`
            break
        case (hours > 24 && hours < 48):
            postDate = `1 day`
            break
        case (hours > 48 && hours < 72):
            postDate = `2 days`
            break
        case (hours > 72 && hours < 96):
            postDate = `3 days`
            break
        default:
            postDate = `1 hour`
            break
    }
    return postDate
}

export async function getComments(likes: number) {
    let comments: Comment[] = []
    let random
    switch(true) {
        case (likes < 100):
            comments = []
            break
        case (likes > 100 && likes < 1000):
            random = Math.floor(Math.random() * 3)
            comments = await fetchComment(random)
            break
        case (likes > 1000 && likes < 3000):
            random = Math.floor(Math.random() * 6)
            comments = await fetchComment(random)
            break
        case (likes > 3000 && likes <= 5000):
            random = Math.floor(Math.random() * 9)
            comments = await fetchComment(random)
            break
        default:
            comments = []
            break
    } 
    return comments
}