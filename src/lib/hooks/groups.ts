import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Group,
    GroupMember,
    GroupActivity,
    GroupMessage,
    GroupClass,
    GroupEvent
} from '@/types/groups';
import { publishGroupActivity } from '@/app/dashboard/groups/actions';

const supabase = createClient();

/**
 * Hook to fetch a single group by ID
 */
export function useGroup(groupId: string) {
    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        async function fetchGroup() {
            try {
                const { data, error } = await supabase
                    .from('groups')
                    .select('*')
                    .eq('id', groupId)
                    .single();

                if (error) throw error;
                setGroup(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }

        if (groupId) fetchGroup();
    }, [groupId]);

    return { group, loading, error };
}

/**
 * Hook for group activity feed (paginated)
 */
export function useGroupActivities(groupId: string, limit = 20) {
    const [activities, setActivities] = useState<GroupActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActivities() {
            const { data, error } = await supabase
                .from('group_activities')
                .select('*, user:user_id(full_name, avatar_url)')
                .eq('group_id', groupId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (!error) setActivities(data || []);
            setLoading(false);
        }

        if (groupId) fetchActivities();

        const channel = supabase
            .channel(`group_activities:${groupId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'group_activities',
                filter: `group_id=eq.${groupId}`
            }, async (payload) => {
                // Fetch full record with user details
                const { data } = await supabase
                    .from('group_activities')
                    .select('*, user:user_id(full_name, avatar_url)')
                    .eq('id', payload.new.id)
                    .single();

                if (data) {
                    setActivities((prev) => [data, ...prev]);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [groupId, limit]);

    return { activities, loading };
}

/**
 * Hook for realtime group chat
 */
export function useGroupMessages(groupId: string) {
    const [messages, setMessages] = useState<GroupMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMessages() {
            const { data, error } = await supabase
                .from('group_messages')
                .select('*, user:user_id(full_name, avatar_url)')
                .eq('group_id', groupId)
                .order('created_at', { ascending: true })
                .limit(50);

            if (!error) setMessages(data || []);
            setLoading(false);
        }

        if (groupId) fetchMessages();

        const channel = supabase
            .channel(`group_chat:${groupId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'group_messages',
                filter: `group_id=eq.${groupId}`
            }, async (payload) => {
                const { data } = await supabase
                    .from('group_messages')
                    .select('*, user:user_id(full_name, avatar_url)')
                    .eq('id', payload.new.id)
                    .single();

                if (data) {
                    setMessages((prev) => [...prev, data]);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [groupId]);

    const sendMessage = async (content: string, type: string = 'text') => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        return await supabase.from('group_messages').insert({
            group_id: groupId,
            user_id: user.id,
            content,
            type
        });
    };

    return { messages, loading, sendMessage };
}

/**
 * Hook to manage group members
 */
export function useGroupMembers(groupId: string) {
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMembers() {
            const { data, error } = await supabase
                .from('group_members')
                .select('*, user:user_id(full_name, avatar_url)')
                .eq('group_id', groupId);

            if (!error) setMembers(data || []);
            setLoading(false);
        }

        if (groupId) fetchMembers();
    }, [groupId]);

    return { members, loading };
}

/**
 * Hook to join a group via code
 */
export function useJoinGroup() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const joinByCode = async (code: string) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Find group by code
            const { data: group, error: groupError } = await supabase
                .from('groups')
                .select('id')
                .eq('join_code', code)
                .single();

            if (groupError || !group) throw new Error('Código no válido');

            // 2. Insert member
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Debes iniciar sesión');

            const { error: joinError } = await supabase
                .from('group_members')
                .insert({
                    group_id: group.id,
                    user_id: user.id,
                    role: 'member'
                });

            if (joinError) throw joinError;

            // Increment member count
            await supabase.rpc('increment_group_member_count', { group_id: group.id });

            // 3. Notify feed
            await publishGroupActivity('joined_group', {
                group_id: group.id // The action uses user's groups usually but here we specify or it handles it
            });

            return group.id;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { joinByCode, loading, error };
}

/**
 * Hook for group classes
 */
export function useGroupClasses(groupId: string) {
    const [classes, setClasses] = useState<GroupClass[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchClasses() {
            const { data, error } = await supabase
                .from('group_classes')
                .select('*, attendance:class_attendance(user_id, status)')
                .eq('group_id', groupId)
                .order('start_time', { ascending: true });

            if (!error) setClasses(data || []);
            setLoading(false);
        }

        if (groupId) fetchClasses();

        const channel = supabase
            .channel(`group_classes:${groupId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'group_classes',
                filter: `group_id=eq.${groupId}`
            }, () => {
                fetchClasses(); // Refresh on changes
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [groupId]);

    return { classes, loading };
}

/**
 * Hook for group challenges
 */
export function useGroupChallenges() {
    const [challenges, setChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchChallenges() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('challenges')
                .select(`
                    *,
                    user_challenges(user_id, current_progress, is_completed)
                `)
                .order('created_at', { ascending: false });

            if (!error) setChallenges(data || []);
            setLoading(false);
        }

        fetchChallenges();
    }, []);

    return { challenges, loading };
}

/**
 * Hook for group wall posts, comments and likes
 */
export function useGroupPosts(groupId: string) {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        const { data, error } = await supabase
            .from('group_posts')
            .select(`
                *,
                user:user_id(full_name, avatar_url),
                likes:group_post_likes(user_id),
                comments:group_comments(
                    *,
                    user:user_id(full_name, avatar_url)
                )
            `)
            .eq('group_id', groupId)
            .order('created_at', { ascending: false });

        if (!error) setPosts(data || []);
        setLoading(false);
    };

    useEffect(() => {
        if (groupId) fetchPosts();

        const postsChannel = supabase
            .channel(`group_posts:${groupId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'group_posts', filter: `group_id=eq.${groupId}` }, fetchPosts)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'group_comments' }, fetchPosts)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'group_post_likes' }, fetchPosts)
            .subscribe();

        return () => {
            supabase.removeChannel(postsChannel);
        };
    }, [groupId]);

    return { posts, loading, refreshPosts: fetchPosts };
}
