import { google } from 'googleapis'
import type { NextApiRequest, NextApiResponse } from 'next'

async function authorizeServiceAccount() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        },
        scopes: [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive.photos.readonly'
        ],
    })

    return auth
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const amount = Number(req.query.amount || '1')
    const usedIndexes = JSON.parse(req.query.usedIndexes as string || '[]')
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
            q: "mimeType='image/jpeg' or mimeType='image/png'",
            fields: 'nextPageToken, files(id, name, webContentLink)',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,

        })
        const files = result.data.files

        if (files?.length) {
            files.sort((a, b) => a.name!.localeCompare(b.name!))
            // let randomFileIndex
            // do {
            //     randomFileIndex = Math.floor(Math.random() * files.length)
            // } while (usedIndexes.includes(randomFileIndex))
            let randomFiles = []
            let srcs = []
            for (let i = 0; i < amount; i++) {
                const randomFileIndex = Math.floor(Math.random() * files.length)
                randomFiles.push(files[randomFileIndex])
                srcs.push(`https://drive.google.com/uc?export=view&id=${randomFiles[i].id}`)
                await makeFilePublic(randomFiles[i].id as string)
                usedIndexes.push(randomFileIndex)
            }

            res.status(200).json({ 
                srcs: srcs,
                usedIndexes: usedIndexes,
                isRunOut: usedIndexes.length == files.length 
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
