<template>
    <DefaultSection>
        <HeadingH1>Imágenes Destacadas</HeadingH1>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="imagenesDestacadas.length === 0" class="text-center py-12">
            <Icon name="tabler:photo" class="w-16 h-16" />
            <p class="text-dark text-lg">No hay imágenes destacadas disponibles</p>
        </div>

        <TableLayout v-else :data="imagenesDestacadas" :columns="tabla.columns" :empty-state-text="`No hay imágenes destacadas creadas`"
            table-name="imagenes-destacadas" :show-actions="true" :show-delete="false" @edit="handleEdit" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useWaterplastImagenesDestacadas } from '~/composables/waterplast/useImagenesDestacadas.js'

const { imagenesDestacadas, loading, fetchImagenesDestacadas } = useWaterplastImagenesDestacadas()

const tabla = {
    columns: [
        {
            key: 'nombre',
            label: 'Nombre',
        },
        {
            key: 'imagen_chica',
            label: 'Imagen Chica',
            type: 'image'
        },
        {
            key: 'imagen_mediana',
            label: 'Imagen Mediana',
            type: 'image'
        },
        {
            key: 'imagen_grande',
            label: 'Imagen Grande',
            type: 'image'
        }
    ]
}

onMounted(async () => {
    try {
        await fetchImagenesDestacadas()
    } catch (err) {
        console.error('Error loading imagenes destacadas:', err)
    }
})

const handleEdit = (imagen) => {
    navigateTo(ROUTE_NAMES.WATERPLAST.EDITAR_IMAGEN_DESTACADA(imagen.id))
}
</script>