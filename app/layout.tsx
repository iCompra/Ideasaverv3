// src/app/layout.tsx - Este archivo está correcto como lo tienes.
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { AuthProvider } from '@/src/hooks/use-auth';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial']
});

export const metadata: Metadata = {
  title: 'Idea Saver - Capture Your Thoughts',
  description: 'A powerful tool to capture, organize, and save your ideas',
};

/**
 * Root layout component that wraps all pages
 * Sets up dark theme and includes global Header component
 * ENFORCES bg-dark-primary-bg globally
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-dark-primary-bg`}>
        {/* ThemeProvider DEBE envolver a AuthProvider */}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {/* AuthProvider DEBE envolver los hijos y componentes que usen useAuth */}
          <AuthProvider>
            <div className="min-h-screen bg-dark-primary-bg text-dark-text-light flex flex-col"> {/* Añadido flex-col */}
              <Header />
              <main className="flex-grow"> {/* Añadido flex-grow para empujar el footer hacia abajo */}
                {children}
              </main>
              {/* Toaster se renderiza a nivel de layout */}
              <Toaster /> 
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}