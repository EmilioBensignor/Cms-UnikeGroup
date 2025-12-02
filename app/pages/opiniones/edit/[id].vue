<template>
    <DefaultSection>
        <NuxtLink :to="ROUTE_NAMES.UNIKE.OPINIONES"
            class="flex items-center gap-2 self-start text-dark font-light no-underline">
            <Icon name="tabler:arrow-left" size="1.25rem" />
            Volver a opiniones
        </NuxtLink>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="!currentOpinion" class="text-center py-12">
            <Icon name="tabler:file-x" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600 text-lg">Opinión no encontrada</p>
            <ButtonPrimary :to="ROUTE_NAMES.UNIKE.OPINIONES" class="mt-4">
                Volver a opiniones
            </ButtonPrimary>
        </div>

        <div v-else class="w-full flex flex-col items-center gap-6 lg:gap-9">
            <HeadingH1>Editar Opinión</HeadingH1>
            <UnikeOpinionForm 
                :is-editing="true" 
                :initial-data="currentOpinion"
                @submit="handleSubmit" 
                @cancel="handleCancel" 
            />
        </div>
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useWaterplastOpiniones } from '~/composables/waterplast/useOpiniones.js'

const route = useRoute()
const opinionId = route.params.id

const {
    currentOpinion,
    loading,
    fetchOpinionById,
    updateOpinion
} = useWaterplastOpiniones()

const { success, error: notificationError } = useNotification()

onMounted(async () => {
    await loadOpinion()
})

const loadOpinion = async () => {
    try {
        if (!opinionId) {
            throw new Error('ID de opinión no válido')
        }

        await fetchOpinionById(opinionId)
    } catch (err) {
        console.error('Error loading opinion:', err)
    }
}

const handleSubmit = async (formData) => {
    try {
        await updateOpinion(opinionId, formData.opinionData, formData.imagen, formData.imagenFueEliminada)

        success('Opinión actualizada exitosamente', {
            title: 'Opinión actualizada'
        })

        navigateTo(ROUTE_NAMES.UNIKE.OPINIONES)
    } catch (err) {
        console.error('Error updating opinion:', err)

        const errorMessage = err.message || 'Error al actualizar la opinión. Inténtalo de nuevo.'
        notificationError(errorMessage, {
            title: 'Error al actualizar opinión',
            duration: 8000
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.UNIKE.OPINIONES)
}
</script>