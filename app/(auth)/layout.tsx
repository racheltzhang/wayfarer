// Auth screens use the app-shell from root layout — no extra chrome needed
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
