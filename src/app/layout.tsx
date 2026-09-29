import './globals.css'

import { StreamingMessage } from '@/features/streaming-messages/presentations/StreamingMessage'
import clsx from 'clsx'
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { AppLayout } from './app-layout'
import { Providers } from './providers'

const font = Inter({
  variable: '--font-inter',
  subsets: ['latin']
})
const monoFont = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin']
})

export function generateMetadata(): Metadata {
  return {
    title: 'ExoGen',
    description:
      'Generate images with Stable Diffusion, run LLMs, and more, all on your local machine.'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>): React.JSX.Element {
  return (
    <html lang="en" className="dark">
      <body
        className={clsx(
          font.className,
          monoFont.variable,
          'antialiased bg-background text-foreground'
        )}
      >
        <Providers>
          <AppLayout>
            {children}
            <StreamingMessage />
          </AppLayout>
        </Providers>
      </body>
    </html>
  )
}
