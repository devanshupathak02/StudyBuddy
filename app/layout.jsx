import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"

export const metadata = {
  title: "StudyBuddy AI - Your Smart Study Companion",
  description:
    "Get instant help with homework, quizzes, and progress tracking powered by AI. Perfect for students, teachers, and educational institutions.",
  keywords: "AI tutor, homework help, study assistant, education technology, learning platform",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
