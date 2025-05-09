import { redirect } from 'next/navigation'
import { createClient } from '@/src/utils/supabase/server'
import AdminLayout from "@/src/components/AdminLayout";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server component - Auth check
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data?.user) {
    redirect('/sign-in')
  }

  // Gunakan AdminLayout sebagai client component
  return <AdminLayout>{children}</AdminLayout>
}