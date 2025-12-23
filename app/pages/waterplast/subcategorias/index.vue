<template>
    <DefaultSection>
        <HeadingH1>Subcategorías</HeadingH1>
        <ButtonPrimary @click="handleCreate">
            <Icon name="tabler:plus" class="w-5 h-5 mr-2" />
            Nueva Subcategoría
        </ButtonPrimary>
        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="subcategorias.length === 0" class="text-center py-12">
            <Icon name="tabler:category" class="w-16 h-16" />
            <p class="text-dark text-lg">No hay subcategorías disponibles</p>
        </div>

        <TableLayout v-else :data="subcategorias" :columns="tabla.columns"
            :empty-state-text="`No hay subcategorías creadas`" table-name="subcategorias" :show-actions="true"
            :show-delete="true" @edit="handleEdit" @delete="handleDelete" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useWaterplastSubcategorias } from '~/composables/waterplast/useSubcategorias.js'

const { subcategorias, loading, fetchSubcategorias, deleteSubcategoria } = useWaterplastSubcategorias()
const { success: showSuccess, error: showError } = useNotification()

const tabla = {
    columns: [
        {
            key: 'orden',
            label: 'Orden',
            type: 'number'
        },
        {
            key: 'nombre',
            label: 'Nombre',
        },
        {
            key: 'categoria.nombre',
            label: 'Categoría',
        }
    ]
}

onMounted(async () => {
    try {
        await fetchSubcategorias()
    } catch (err) {
        console.error('Error loading subcategorias:', err)
    }
})

const handleCreate = () => {
    navigateTo(ROUTE_NAMES.WATERPLAST.CREAR_SUBCATEGORIA)
}

const handleEdit = (subcategoria) => {
    navigateTo(ROUTE_NAMES.WATERPLAST.EDITAR_SUBCATEGORIA(subcategoria.id))
}

const handleDelete = async (subcategoria) => {
    try {
        await deleteSubcategoria(subcategoria.id)
        showSuccess('Subcategoría eliminada correctamente')
    } catch (err) {
        showError('Error al eliminar la subcategoría')
        console.error('Error deleting subcategoria:', err)
    }
}
</script>
