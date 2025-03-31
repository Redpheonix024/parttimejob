import type React from "react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

interface MainLayoutProps {
  children: React.ReactNode
  showNav?: boolean
  activeLink?: string
}

export default function MainLayout({ children, showNav = true, activeLink }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showNav={showNav} activeLink={activeLink} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

