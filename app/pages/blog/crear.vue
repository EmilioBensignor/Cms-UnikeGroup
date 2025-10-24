<template>
    <DefaultSection>
        <HeadingH1>Crear Blog</HeadingH1>
        <BlogForm :is-editing="false" @submit="handleSubmit" @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';
import { useBlog } from '~/composables/useBlog.js'

const { success, error } = useNotification()
const { createBlog } = useBlog()

const handleSubmit = async ({ blogData, imagen }) => {
    try {
        await createBlog(blogData, imagen)

        success('Blog creado exitosamente', {
            title: 'Blog agregado'
        })

        navigateTo(ROUTE_NAMES.UNIKE.BLOG)
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
    navigateTo(ROUTE_NAMES.UNIKE.BLOG)
}
</script>