<template>
    <DefaultSection>
        <HeadingH1>Blog</HeadingH1>
        <ButtonPrimary :to="ROUTE_NAMES.UNIKE.CREAR_BLOG">
            Crear Nuevo Blog
        </ButtonPrimary>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="blogs.length === 0" class="text-center py-12">
            <Icon name="tabler:article" class="w-16 h-16" />
            <p class="text-dark text-lg">No hay blogs disponibles</p>
        </div>

        <TableLayout v-else :data="blogs" :columns="tabla.columns"
            :empty-state-text="`No hay blogs creados`" table-name="blogs" @edit="handleEdit"
            @delete="handleDelete" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useBlog } from '~/composables/useBlog.js'

const { blogs, loading, fetchBlogs, deleteBlog } = useBlog()
const { success, error: notificationError } = useNotification()

const tabla = {
    columns: [
        {
            key: 'titulo',
            label: 'Título',
        },
        {
            key: 'imagen_principal',
            label: 'Imagen',
            type: 'image'
        },
        {
            key: 'creado_por',
            label: 'Creado por',
        },
        {
            key: 'fecha',
            label: 'Fecha',
            type: 'date'
        },
        {
            key: 'contenido',
            label: 'Contenido',
            type: 'text'
        }
    ]
}

onMounted(async () => {
    try {
        await fetchBlogs()
    } catch (err) {
        console.error('Error loading blogs:', err)
    }
})

const handleEdit = (blog) => {
    navigateTo(ROUTE_NAMES.UNIKE.EDITAR_BLOG(blog.id))
}

const handleDelete = async (blog) => {
    try {
        await deleteBlog(blog.id)

        success('Blog eliminado exitosamente', {
            title: 'Blog eliminado'
        })

        await fetchBlogs()
    } catch (err) {
        console.error('Error deleting blog:', err)

        const errorMessage = err.message || 'Error al eliminar el blog'
        notificationError(errorMessage, {
            title: 'Error al eliminar blog',
            duration: 8000
        })
    }
}
</script>