'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Creates a new post in a group wall
 */
export async function createGroupPost(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const groupId = formData.get('groupId') as string
    const content = formData.get('content') as string
    const imageUrl = formData.get('imageUrl') as string

    const { error } = await supabase
        .from('group_posts')
        .insert({
            group_id: groupId,
            user_id: user.id,
            content,
            image_url: imageUrl
        })

    if (error) throw new Error(error.message)

    revalidatePath(`/dashboard/groups/${groupId}`)
}

/**
 * Likes or Unlikes a post
 */
export async function togglePostLike(postId: string, groupId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if already liked
    const { data: existingLike } = await supabase
        .from('group_post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()

    if (existingLike) {
        await supabase
            .from('group_post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id)
    } else {
        await supabase
            .from('group_post_likes')
            .insert({
                post_id: postId,
                user_id: user.id
            })
    }

    revalidatePath(`/dashboard/groups/${groupId}`)
}

/**
 * Adds a comment to a post
 */
export async function addPostComment(data: {
    postId: string
    groupId: string
    content: string
    parentId?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('group_comments')
        .insert({
            post_id: data.postId,
            user_id: user.id,
            content: data.content,
            parent_id: data.parentId || null
        })

    if (error) throw new Error(error.message)

    revalidatePath(`/dashboard/groups/${data.groupId}`)
}
