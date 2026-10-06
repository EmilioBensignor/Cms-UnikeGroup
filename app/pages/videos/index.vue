<template>
    <DefaultSection>
        <HeadingH1>Videos</HeadingH1>
        <p class="text-gray-dark mb-8">Pegá el link de YouTube del video que se muestra en cada página. Si lo dejás vacío, la sección no aparece.</p>

        <div v-if="loading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form v-for="video in videos" :key="video.id" @submit.prevent="handleSave(video)"
                class="flex flex-col gap-5 border border-gray-light rounded-2xl p-6">
                <h3 class="text-lg font-semibold text-dark">{{ PAGE_LABELS[video.pagina] || video.pagina }}</h3>

                <FormTextField :id="`video-${video.id}`" v-model="urls[video.id]" label="Link de YouTube"
                    placeholder="https://www.youtube.com/watch?v=..." :error="errors[video.id]" />

                <div class="aspect-video flex items-center justify-center bg-gray-light rounded-xl overflow-hidden">
                    <iframe v-if="getYoutubeId(urls[video.id])"
                        :src="`https://www.youtube-nocookie.com/embed/${getYoutubeId(urls[video.id])}`"
                        :title="`Video ${video.pagina}`" class="w-full h-full" allowfullscreen></iframe>
                    <span v-else class="text-sm text-gray-dark">Sin video</span>
                </div>

                <button type="submit" :disabled="savingId === video.id"
                    class="bg-primary hover:bg-primaryHover rounded-xl text-light transition duration-300 disabled:opacity-50 cursor-pointer py-3 px-6 mt-auto">
                    {{ savingId === video.id ? 'Guardando...' : 'Guardar' }}
                </button>
            </form>
        </div>
    </DefaultSection>
</template>

<script setup>
import { useVideos, getYoutubeId } from '~/composables/useVideos.js'

const PAGE_LABELS = {
    unike: 'Unike Group',
    waterplast: 'Waterplast',
}

const { videos, loading, fetchVideos, updateVideo } = useVideos()
const { success, error: notifyError } = useNotification()

const urls = reactive({})
const errors = reactive({})
const savingId = ref(null)

const handleSave = async (video) => {
    const url = urls[video.id]?.trim() || null
    errors[video.id] = ''

    if (url && !getYoutubeId(url)) {
        errors[video.id] = 'El link no es un video de YouTube válido'
        return
    }

    try {
        savingId.value = video.id
        await updateVideo(video.id, url)
        success(`Video de ${PAGE_LABELS[video.pagina] || video.pagina} actualizado`)
    } catch (err) {
        notifyError(`Error al guardar el video: ${err.message}`)
    } finally {
        savingId.value = null
    }
}

onMounted(async () => {
    await fetchVideos()
    videos.value.forEach(video => { urls[video.id] = video.youtube_url || '' })
})
</script>
