import '../index.css'
import { Providers } from './providers'
import { Sidebar } from '@/components/ui/sidebar'
import Link from 'next/link'

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="flex h-screen w-full bg-white text-gray-900">
            <div className="hidden md:block md:w-[350px] flex-shrink-0">
              <Sidebar />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              <header className="h-14 border-b flex items-center px-4 justify-between">
                <Link href="/" className="py-2 px-3 rounded hover:bg-gray-100 transition-colors duration-200">
                  <h1 className="text-lg font-semibold">{process.env.NEXT_PUBLIC_APP_NAME}</h1>
                </Link>
              </header>

              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
} 