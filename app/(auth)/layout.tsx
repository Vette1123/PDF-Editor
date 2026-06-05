export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg-canvas)] px-5 py-12">
      {children}
    </main>
  )
}
