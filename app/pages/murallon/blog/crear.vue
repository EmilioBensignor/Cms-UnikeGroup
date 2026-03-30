<template>
    <DefaultSection>
        <HeadingH1>Crear Blog Murallón</HeadingH1>
        <MurallonBlogForm :is-editing="false" @submit="handleSubmit" @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'
import { useMurallonBlog } from '~/composables/murallon/useBlog.js'

const { success, error } = useNotification()
const { createBlog } = useMurallonBlog()

const handleSubmit = async ({ blogData, imagen }) => {
    try {
        await createBlog(blogData, imagen)

        success('Blog creado exitosamente', {
            title: 'Blog agregado'
        })

        navigateTo(ROUTE_NAMES.MURALLON.BLOG)
    } catch (err) {
        console.error('Error creating blog:', err)

        const errorMessage = err.message || 'Error al crear el blog. Inténtalo de nuevo.'
        error(errorMessage, {
            title: 'Error al crear blog',
            duration: 8000
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.MURALLON.BLOG)
}
</script>
