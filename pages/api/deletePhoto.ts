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
    const fileId = req.query.fileId as string
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
        drive.files.delete({
            fileId: fileId,
        }), function (err: any) {
            if (err) {
                console.error(err);
            } else {
                console.log('File deleted.');
            }
        }

        res.status(200).json({ 
            message: 'Deleted'
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({ error: e })
    }
}
