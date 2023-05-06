export async function fetchData(endpoint: string, url: string = `/api/${endpoint}`, options = {}) {
    try {
        const response = await fetch(url, options)
        const data = await response.json()
        
        if (!response.ok) {
            throw new Error(data.error)
        }

        return data
    } catch (e: any) {
        console.log(e.message)
        throw e
    }
}