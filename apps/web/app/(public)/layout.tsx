import { PublicNav } from "@/app/components/PublicNav"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70 bg-background/95 backdrop-blur py-4">
          <PublicNav />
      </header>

      <main className="mx-auto flex w-full container flex-col gap-12 py-12 sm:py-16">
        {children}
      </main>
    </div>
  )
}
