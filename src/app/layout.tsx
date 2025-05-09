import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import AdminLayout from "@/src/components/AdminLayout";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Admin Dashboard",
  description: "Modern Admin Dashboard with Next.js and Tailwind CSS",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AdminLayout>
            {children}
          </AdminLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}