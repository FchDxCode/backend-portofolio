
import { redirect } from 'next/navigation'
import { createClient } from '@/src/utils/supabase/server'


export default async function Dashboard() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/sign-in')
  }

  // Jika sampai di sini, tampilkan konten dashboard
  return (
    <main>
      <h1>Dashboard</h1>
      <div className="bg-red-300 w-20 h-20">
        Test Content
      </div>
    </main>
  );
}