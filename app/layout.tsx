import type { Metadata } from 'next'
import './globals.css'


// This is for the metadata for the MemeKage
export const metadata: Metadata = {
  title: 'MemeKage',
  description: 'Created with ❤ by Aashik',
}

// This is for the root layout for the MemeKage
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
