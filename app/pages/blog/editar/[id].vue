<template>
    <DefaultSection>
        <HeadingH1>Editar Blog</HeadingH1>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <BlogForm v-else :is-editing="true" :initial-data="currentBlog" @submit="handleSubmit" @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';
import { useBlog } from '~/composables/useBlog.js'

const route = useRoute()
const { success, error } = useNotification()
const { currentBlog, loading, fetchBlogById, updateBlog } = useBlog()

onMounted(async () => {
    try {
        await fetchBlogById(route.params.id)
    } catch (err) {
        console.error('Error loading blog:', err)

        const errorMessage = err.message || 'Error al cargar el blog'
        error(errorMessage, {
            title: 'Error al cargar blog',
            duration: 8000
        })
    }
})

const handleSubmit = async ({ blogData, imagen }) => {
    try {
        await updateBlog(route.params.id, blogData, imagen)

        success('Blog actualizado exitosamente', {
            title: 'Blog actualizado'
        })

        navigateTo(ROUTE_NAMES.UNIKE.BLOG)
    } catch (err) {
        console.error('Error updating blog:', err)

        const errorMessage = err.message || 'Error al actualizar el blog. Inténtalo de nuevo.'
        error(errorMessage, {
            title: 'Error al actualizar blog',
            duration: 8000
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.UNIKE.BLOG)
}
</script>