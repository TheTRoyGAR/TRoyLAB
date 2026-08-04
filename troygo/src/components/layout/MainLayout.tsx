import Header from './Header'
import Footer from './Footer'

interface MainLayoutProps {
  children: React.ReactNode
}

/**
 * MainLayout wraps page content with the shared Header and Footer.
 *
 * Usage (inside any page or nested layout):
 *   <MainLayout>
 *     <YourPageContent />
 *   </MainLayout>
 */
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </>
  )
}
