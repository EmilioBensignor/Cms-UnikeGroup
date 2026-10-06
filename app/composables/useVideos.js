import { handleSupabaseError } from '~/utils/errorHandler.js'

export const getYoutubeId = (url) => url?.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/)?.[1] ?? null

export const useVideos = () => {
    const supabase = useSupabaseClient()

    const videos = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchVideos = async () => {
        try {
            loading.value = true
            error.value = null

            const { data, error: fetchError } = await supabase
                .from('videos')
                .select('*')
                .order('id', { ascending: true })

            if (fetchError) throw fetchError

            videos.value = data || []
        } catch (err) {
            error.value = handleSupabaseError(err)
        } finally {
            loading.value = false
        }
    }

    const updateVideo = async (id, youtubeUrl) => {
        const { error: updateError } = await supabase
            .from('videos')
            .update({ youtube_url: youtubeUrl, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (updateError) throw new Error(handleSupabaseError(updateError))
    }

    return {
        videos: readonly(videos),
        loading: readonly(loading),
        error: readonly(error),
        fetchVideos,
        updateVideo,
    }
}
