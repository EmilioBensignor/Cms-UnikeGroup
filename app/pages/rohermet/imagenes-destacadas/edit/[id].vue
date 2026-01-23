<template>
    <DefaultSection>
        <HeadingH1>Editar {{ currentImagenDestacada?.nombre }}</HeadingH1>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <RohermetImagenDestacadaForm
            v-else
            :is-editing="true"
            :initial-data="currentImagenDestacada"
            @submit="handleSubmit"
            @cancel="handleCancel"
        />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useRohermetImagenesDestacadas } from '~/composables/rohermet/useImagenesDestacadas.js'

const route = useRoute()
const imagenId = route.params.id

const { success, error } = useNotification()
const {
    currentImagenDestacada,
    loading,
    fetchImagenDestacadaById,
    updateImagenDestacada
} = useRohermetImagenesDestacadas()

onMounted(async () => {
    try {
        await fetchImagenDestacadaById(imagenId)
    } catch (err) {
        await navigateTo(ROUTE_NAMES.ROHERMET.IMAGENES_DESTACADAS)
    }
})

const handleSubmit = async (formData) => {
    try {
        await updateImagenDestacada(
            imagenId,
            {},
            formData.imagen_chica,
            formData.imagen_mediana,
            formData.imagen_grande
        )

        success('Imagen destacada actualizada exitosamente', {
            title: 'Imagen destacada actualizada'
        })

        navigateTo(ROUTE_NAMES.ROHERMET.IMAGENES_DESTACADAS)
    } catch (err) {
        console.error('Error updating imagen destacada:', err)

        const errorMessage = err.message || 'Error al actualizar la imagen destacada. Inténtalo de nuevo.'
        error(errorMessage, {
            title: 'Error al actualizar imagen destacada',
            duration: 8000
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.ROHERMET.IMAGENES_DESTACADAS)
}
</script>
