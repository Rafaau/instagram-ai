import { Photo, User } from "@component/typings"
import { Dispatch, SetStateAction, createContext, useReducer, useState } from "react"

export type AppState = {
    photos: Photo[]
    users: User[]
}

type AppAction = {
    type: 'SET_PHOTOS' | 'LIKE_OR_UNLIKE' | 'ADD_COMMENT' | 'SET_USERS'
    payload: any
}

const initialState: AppState = {
    photos: [],
    users: []
}

const AppContext = createContext<{ state: AppState, dispatch: Dispatch<AppAction> }>({
    state: initialState,
    dispatch: () => null
})

const appReducer = (state: AppState, action: AppAction) => {
    switch (action.type) {
        case 'SET_PHOTOS':
            return {
                ...state,
                photos: action.payload.map((photo: Photo) => {
                    return {
                        ...photo,
                        isDispatched: true
                    }
                })
            }
        case 'LIKE_OR_UNLIKE':
            return {
                ...state,
                photos: state.photos.map(photo => {
                    if (photo.user === action.payload.user) {
                        return {
                            ...photo,
                            isLiked: !photo.isLiked
                        }
                    }
                    return photo
                })
            }
        case 'ADD_COMMENT':
            return {
                ...state,
                photos: state.photos.map(photo => {
                    if (photo.user === action.payload.user) {
                        return {
                            ...photo,
                            comments: [...photo.comments, action.payload.comment]
                        }
                    }
                    return photo
                })
            }
        case 'SET_USERS':
            return {
                ...state,
                users: action.payload
            }
        default:
            return state
    }
}

interface AppProviderProps {
    children: React.ReactNode
}

const AppProvider = ({ children }: AppProviderProps) => {
    const [state, dispatch] = useReducer(appReducer, initialState)

    return (
        <AppContext.Provider value={{ state, dispatch }}>
                {children}
        </AppContext.Provider>
    )
}

export { AppContext, AppProvider }