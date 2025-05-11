import { redirect } from 'next/navigation'
import { createClient } from '@/src/utils/supabase/server'
import AdminLayout from "@/src/components/AdminLayout";
import { AlertProvider } from '@/src/components/ui/alert/AlertProvider';
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data?.user) {
    redirect('/sign-in')
  }

  return (
    <AdminLayout>
      <AlertProvider>
        {children}
      </AlertProvider>
    </AdminLayout>
  )
}