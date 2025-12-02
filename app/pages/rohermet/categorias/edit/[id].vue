<template>
    <DefaultSection>
        <NuxtLink :to="ROUTE_NAMES.ROHERMET.CATEGORIAS"
            class="flex items-center gap-2 self-start text-dark font-light no-underline">
            <Icon name="tabler:arrow-left" size="1.25rem" />
            Volver a categorías
        </NuxtLink>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="!currentCategoria" class="text-center py-12">
            <Icon name="tabler:file-x" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600 text-lg">Categoría no encontrada</p>
            <ButtonPrimary :to="ROUTE_NAMES.ROHERMET.CATEGORIAS" class="mt-4">
                Volver a categorías
            </ButtonPrimary>
        </div>

        <div v-else class="w-full flex flex-col items-center gap-6 lg:gap-9">
            <HeadingH1>Editar Categoría: {{ currentCategoria.nombre }}</HeadingH1>
            <RohermetCategoriaForm
                :is-editing="true"
                :initial-data="currentCategoria"
                @submit="handleSubmit"
                @cancel="handleCancel"
            />
        </div>
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useRohermetCategorias } from '~/composables/rohermet/useCategorias.js'

const route = useRoute()
const categoriaId = route.params.id

const {
    currentCategoria,
    loading,
    fetchCategoriaById,
    updateCategoria
} = useRohermetCategorias()

const { success, error: notificationError } = useNotification()

onMounted(async () => {
    await loadCategoria()
})

const loadCategoria = async () => {
    try {
        if (!categoriaId) {
            throw new Error('ID de categoría no válido')
        }

        await fetchCategoriaById(categoriaId)
    } catch (err) {
        console.error('Error loading categoria:', err)
    }
}

const handleSubmit = async (formData) => {
    try {
        await updateCategoria(
            categoriaId,
            formData.categoriaData
        )

        success('Categoría actualizada exitosamente', {
            title: 'Categoría actualizada'
        })

        navigateTo(ROUTE_NAMES.ROHERMET.CATEGORIAS)
    } catch (err) {
        console.error('Error updating categoria:', err)

        const errorMessage = err.message || 'Error al actualizar la categoría. Inténtalo de nuevo.'
        notificationError(errorMessage, {
            title: 'Error al actualizar categoría',
            duration: 8000
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.ROHERMET.CATEGORIAS)
}
</script>
