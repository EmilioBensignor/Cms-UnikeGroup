<template>
    <DefaultSection>
        <HeadingH1>Categorías Rohermet</HeadingH1>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="categorias.length === 0" class="text-center py-12">
            <Icon name="tabler:category" class="w-16 h-16" />
            <p class="text-dark text-lg">No hay categorías disponibles</p>
        </div>

        <TableLayout v-else :data="categorias" :columns="tabla.columns" :empty-state-text="`No hay categorías creadas`"
            table-name="categorias" :show-actions="true" :show-delete="false" @edit="handleEdit" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useRohermetCategorias } from '~/composables/rohermet/useCategorias.js'

const { categorias, loading, fetchCategorias } = useRohermetCategorias()

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
        }
    ]
}

onMounted(async () => {
    try {
        await fetchCategorias()
    } catch (err) {
        console.error('Error loading categorias:', err)
    }
})

const handleEdit = (categoria) => {
    navigateTo(ROUTE_NAMES.ROHERMET.EDITAR_CATEGORIA(categoria.id))
}
</script>
