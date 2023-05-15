'use client'

import { AppProvider } from '@component/contexts/appContext'
import '@component/styles/globals.css'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { LimitStatus } from './LimitStatus'
config.autoAddCss = false

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Instagram-AI</title>
      </head>
      <body className="flex items-center justify-center p-0 sm:p-5">
        <LimitStatus />
        <div className='bg-gray-100 min-w-[46vh] w-full sm:w-[46vh] h-full sm:h-[90vh] sm:rounded-2xl border border-gray-300 overflow-hidden'>
          <div className='pt-1 px-3 font-instagram text-[4vh] border-b h-[8%] cursor-pointer'>Instagram</div>
          <div className='h-[92%]'>
            <AppProvider>
                {children}
            </AppProvider>
          </div>
        </div>
      </body>
    </html>
  )
}
