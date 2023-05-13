import { authorizeServiceAccount } from '@component/utils/apiHelpers'
import { google } from 'googleapis'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const usedIndexes = JSON.parse(req.query.usedIndexes as string || '[]')
    const prompt = req.query.prompt as string
    const authClient = await authorizeServiceAccount()
    const drive = google.drive({ version: 'v3', auth: authClient })

    async function makeFilePublic(fileId: string) {
        try {
            const permission = {
                type: 'anyone',
                role: 'reader',
            }
            await drive.permissions.create({
                fields: 'id',
                fileId: fileId,
                requestBody: permission,
            })
        } catch (e) {
            console.log(e)
        }
    }

    try {
        const result = await drive.files.list({
            q: prompt,
            fields: 'nextPageToken, files(id, name, webContentLink)',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
            pageSize: 1000,
        })

        const files = result.data.files

        if (files?.length) {
            files.sort((a, b) => a.name!.localeCompare(b.name!))
            let randomFileIndex
            do {
                randomFileIndex = Math.floor(Math.random() * files.length)
            } while (usedIndexes.includes(randomFileIndex))

            const randomFile = files[randomFileIndex]

            await makeFilePublic(randomFile.id as string)
            usedIndexes.push(randomFileIndex)

            res.status(200).json({ 
                src: `https://drive.google.com/uc?export=view&id=${randomFile.id}`, 
                usedIndexes: usedIndexes,
                prompt: prompt
            })
        }
        else {
            console.log('No files found.')
            res.status(200).json({ error: 'No files found.' })
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({ error: e })
    }
}
