import { Sidebar } from '@/components/layout/Sidebar'
import { createClient } from '@/lib/supabase/server'
import { VerificationBanner } from '@/components/auth/VerificationBanner'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <Sidebar />

            <main className="flex-1 flex flex-col">
                {user && <VerificationBanner isVerified={!!user.email_confirmed_at} />}
                <div className="p-6 flex-1">
                    {children}
                </div>
            </main>
        </div>
    )
}
