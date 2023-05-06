import { Todo } from "@component/typings"
import PhotosList from "./PhotosList"

export default async function Home() {
    return <>
            {/*@ts-ignore*/}
            <PhotosList />
        </>
}