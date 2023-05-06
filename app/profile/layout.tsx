export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
  
    return (
        <div className='h-[100%] relative'>
            {children}
        </div>
    )
  }