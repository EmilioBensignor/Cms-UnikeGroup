<template>
    <DefaultSection>
        <HeadingH1>Editar Subcategoría</HeadingH1>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <SubcategoriaForm v-else :is-editing="true" :initial-data="currentSubcategoria" @submit="handleSubmit"
            @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useWaterplastSubcategorias } from '~/composables/waterplast/useSubcategorias.js'
import SubcategoriaForm from '~/components/waterplast/subcategoria/Form.vue'

const route = useRoute()
const { currentSubcategoria, loading, fetchSubcategoriaById, updateSubcategoria } = useWaterplastSubcategorias()
const { success: showSuccess, error: showError } = useNotification()

onMounted(async () => {
    try {
        const id = route.params.id
        await fetchSubcategoriaById(id)
    } catch (err) {
        showError('Error al cargar la subcategoría')
        console.error('Error loading subcategoria:', err)
        navigateTo(ROUTE_NAMES.WATERPLAST.SUBCATEGORIAS)
    }
})

const handleSubmit = async (subcategoriaData) => {
    try {
        const id = route.params.id
        await updateSubcategoria(id, subcategoriaData)
        showSuccess('Subcategoría actualizada correctamente')
        navigateTo(ROUTE_NAMES.WATERPLAST.SUBCATEGORIAS)
    } catch (err) {
        console.error('Error updating subcategoria:', err)

        if (err.message && err.message.includes('duplicate key') || err.message.includes('unique constraint')) {
            showError('Ya existe una subcategoría con ese número de orden en esta categoría', {
                title: 'Orden duplicado',
                duration: 5000
            })
        } else {
            showError('Error al actualizar la subcategoría: ' + err.message, {
                title: 'Error',
                duration: 5000
            })
        }
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.WATERPLAST.SUBCATEGORIAS)
}
</script>
