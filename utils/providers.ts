import { PhotoPrompts } from "@component/lib/prompts"
import { fetchData } from "./fetchData"
import { Comment } from "@component/typings"

export async function fetchFemaleUsername() {
    const response = await fetch('https://names.drycodes.com/1?nameOptions=girl_names&case=lower')
    const data = await response.json()
    return data[0]
}

export async function fetchMaleUsername() {
    const response = await fetch('https://names.drycodes.com/1?nameOptions=boy_names&case=lower')
    const data = await response.json()
    return data[0]
}

export async function fetchComment(reps: number = 1, gender: string) {
    if (gender == 'none') return [] // TODO
    let random = Math.floor(Math.random() * 9)
    const prompt = PhotoPrompts[random]
    let comments: Comment[] = []
    const res = await fetchData(`randomComment?gender=${gender}`) as any
    const userName = prompt.gender == 'female' ? await fetchFemaleUsername() : await fetchMaleUsername()
    const userImage = await fetchSinglePhoto(prompt.prompt!)
    comments.push({
        content: res.content,
        user: { 
            userName, 
            userImage: userImage.src,
            followers: Array.from({ length: Math.floor(Math.random() * 10000) }, () => ({
                userName: undefined,
                userImage: undefined,
                isFollowed: false,
                isDispatched: false,
            })),
            following: Array.from({ length: Math.floor(Math.random() * 200) }, () => ({
                userName: undefined,
                userImage: undefined,
                isFollowed: false,
                isDispatched: false,
            })),
            posts: Math.floor(Math.random() * 25 + 5), 
            photos: [],
            prompt: prompt,
        },
        postDate: getPostDate(),
        isLiked: false,
        likes: Math.floor(Math.random() * 1),
        userImage: userImage.src
    })
    for (let i = 0; i < reps - 1; i++) {
        comments.push({})
    }

    localStorage.setItem(`${prompt.prompt}_usedIndexes`, JSON.stringify(userImage.usedIndexes))         

    return comments
}

export async function fetchBio(gender: string) {
    const response = await fetchData(`randomBio?gender=${gender}`)
    return response.bio
}

export async function fetchDesc(gender: string) {
    if (gender == 'none') return '' // TODO
    const response = await fetchData(`randomDesc?gender=${gender}`)
    return response.desc
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

export async function getComments(likes: number, gender: string) {
    let comments: Comment[] = []
    let random
    switch(true) {
        case (likes < 100):
            comments = []
            break
        case (likes > 100 && likes < 1000):
            random = Math.floor(Math.random() * 2)
            comments = await fetchComment(random, gender)
            break
        case (likes > 1000 && likes < 3000):
            random = Math.floor(Math.random() * 4)
            comments = await fetchComment(random, gender)
            break
        case (likes > 3000 && likes <= 5000):
            random = Math.floor(Math.random() * 7)
            comments = await fetchComment(random, gender)
            break
        default:
            comments = []
            break
    } 
    return comments
}

export async function fetchSinglePhoto(prompt: string) {
    const usedIndexes = JSON.parse(localStorage.getItem(`${prompt}_usedIndexes`) || '[]')
    return fetchData(`randomPhoto?prompt=${prompt}&usedIndexes=${JSON.stringify(usedIndexes)}`)
}