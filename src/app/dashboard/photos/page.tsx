import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PhotoGallery } from '@/components/journal/PhotoGallery'

export default async function PhotosPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: photos, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })

    if (error) {
        console.error(error)
    }

    return (
        <div className="max-w-6xl mx-auto px-4">
            <PhotoGallery initialPhotos={photos || []} />
        </div>
    )
}
