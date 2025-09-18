<template>
    <DefaultSection>
        <NuxtLink :to="ROUTE_NAMES.WATERPLAST.DISTRIBUIDORES"
            class="flex items-center gap-2 self-start text-dark font-light no-underline">
            <Icon name="tabler:arrow-left" size="1.25rem" />
            Volver a distribuidores
        </NuxtLink>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="!currentDistribuidor" class="text-center py-12">
            <Icon name="tabler:file-x" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600 text-lg">Distribuidor no encontrado</p>
            <ButtonPrimary :to="ROUTE_NAMES.WATERPLAST.DISTRIBUIDORES" class="mt-4">
                Volver a distribuidores
            </ButtonPrimary>
        </div>

        <div v-else class="w-full flex flex-col items-center gap-6 lg:gap-9">
            <HeadingH1>Editar Distribuidor</HeadingH1>
            <WaterplastDistribuidorForm
                :is-editing="true"
                :initial-data="currentDistribuidor"
                @submit="handleSubmit"
                @cancel="handleCancel"
            />
        </div>
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useWaterplastDistribuidores } from '~/composables/waterplast/useDistribuidores.js'

const route = useRoute()
const distribuidorId = route.params.id

const {
    currentDistribuidor,
    loading,
    fetchDistribuidorById,
    updateDistribuidor
} = useWaterplastDistribuidores()

const { success, error: notificationError } = useNotification()

onMounted(async () => {
    await loadDistribuidor()
})

const loadDistribuidor = async () => {
    try {
        if (!distribuidorId) {
            throw new Error('ID de distribuidor no válido')
        }

        await fetchDistribuidorById(distribuidorId)
    } catch (err) {
        console.error('Error loading distribuidor:', err)
    }
}

const handleSubmit = async (formData) => {
    try {
        await updateDistribuidor(distribuidorId, formData)

        success('Distribuidor actualizado exitosamente', {
            title: 'Distribuidor actualizado'
        })

        navigateTo(ROUTE_NAMES.WATERPLAST.DISTRIBUIDORES)
    } catch (err) {
        console.error('Error updating distribuidor:', err)

        const errorMessage = err.message || 'Error al actualizar el distribuidor. Inténtalo de nuevo.'
        notificationError(errorMessage, {
            title: 'Error al actualizar distribuidor',
            duration: 8000
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.WATERPLAST.DISTRIBUIDORES)
}
</script>