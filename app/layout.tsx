import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'

// Polices (SIL OFL 1.1) embarquées dans l'application : aucune requête vers un service de
// polices, l'application fonctionnant sans connexion Internet.
// Figtree est la police principale ; Source Sans 3 reste en repli dans la pile de app/globals.css.
const figtree = localFont({
  src: './fonts/figtree-latin-wght-normal.woff2',
  weight: '300 900',
  display: 'swap',
  variable: '--font-figtree',
})

const sourceSans = localFont({
  src: './fonts/source-sans-3-latin-wght-normal.woff2',
  weight: '200 900',
  display: 'swap',
  variable: '--font-source-sans',
})

export const metadata: Metadata = {
  title: 'AlgoPlanR — Affectation des enseignants',
  description:
    "Plateforme d’analyse, de planification et d’aide à la décision sur les ressources et l'affectation des enseignants.",
  icons: {
    icon: [{ url: '/icon-logo-64.png', type: 'image/png', sizes: '64x64' }],
    apple: '/apple-icon-logo.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
  themeColor: '#027174',
}

import { ToastProvider } from '@/src/shared/ui/Toast'
import { ThemeProvider } from '@/src/shared/ui/Theme'

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${figtree.variable} ${sourceSans.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('algoplanr.theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.setAttribute('data-theme','dark');document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
