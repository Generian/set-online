import "@/styles/globals.css"

export const metadata = {
  title: "Play Set online!",
  description: "Web-based online version of the card game Set.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
