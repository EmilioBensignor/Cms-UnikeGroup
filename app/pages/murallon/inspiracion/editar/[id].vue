<template>
    <DefaultSection>
        <HeadingH1>Editar Inspiración Murallón</HeadingH1>
        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <MurallonInspiracionForm v-else :is-editing="true" :initial-data="currentInspiracion" @submit="handleSubmit"
            @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'
import { useMurallonInspiracion } from '~/composables/murallon/useInspiracion.js'

const route = useRoute()
const { success, error } = useNotification()
const { currentInspiracion, loading, fetchInspiracionById, updateInspiracion } = useMurallonInspiracion()

onMounted(async () => {
    try {
        await fetchInspiracionById(route.params.id)
    } catch (err) {
        console.error('Error loading inspiracion:', err)

        const errorMessage = err.message || 'Error al cargar la inspiración'
        error(errorMessage, {
            title: 'Error al cargar inspiración',
            duration: 8000
        })
    }
})

const handleSubmit = async ({ inspiracionData, imagenAntes, imagenDespues }) => {
    try {
        await updateInspiracion(route.params.id, inspiracionData, imagenAntes, imagenDespues)

        success('Inspiración actualizada exitosamente', {
            title: 'Inspiración actualizada'
        })

        navigateTo(ROUTE_NAMES.MURALLON.INSPIRACION)
    } catch (err) {
        console.error('Error updating inspiracion:', err)

        const errorMessage = err.message || 'Error al actualizar la inspiración. Inténtalo de nuevo.'
        error(errorMessage, {
            title: 'Error al actualizar inspiración',
            duration: 8000
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.MURALLON.INSPIRACION)
}
</script>
