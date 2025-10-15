import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '{{projectName}}',
  description: 'Built with effex',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  )
}
