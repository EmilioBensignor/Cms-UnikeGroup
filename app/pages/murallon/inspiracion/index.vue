<template>
    <DefaultSection>
        <HeadingH1>Inspiración Murallón</HeadingH1>
        <ButtonPrimary :to="ROUTE_NAMES.MURALLON.CREAR_INSPIRACION">
            Crear Nueva Inspiración
        </ButtonPrimary>
        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <div v-else-if="inspiraciones.length === 0" class="text-center py-12">
            <Icon name="tabler:photo-heart" class="w-16 h-16" />
            <p class="text-dark text-lg">No hay inspiraciones disponibles</p>
        </div>
        <TableLayout v-else :data="inspiraciones" :columns="tabla.columns"
            :empty-state-text="`No hay inspiraciones creadas`" table-name="inspiraciones" @edit="handleEdit"
            @delete="handleDelete" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useMurallonInspiracion } from '~/composables/murallon/useInspiracion.js'

const { inspiraciones, loading, fetchInspiraciones, deleteInspiracion } = useMurallonInspiracion()
const { success, error: notificationError } = useNotification()

const tabla = {
    columns: [
        {
            key: 'titulo',
            label: 'Título',
        },
        {
            key: 'imagen_antes',
            label: 'Imagen Antes',
            type: 'image'
        },
        {
            key: 'imagen_despues',
            label: 'Imagen Después',
            type: 'image'
        },
        {
            key: 'orden',
            label: 'Orden',
            type: 'number'
        }
    ]
}

onMounted(async () => {
    try {
        await fetchInspiraciones()
    } catch (err) {
        console.error('Error loading inspiraciones:', err)
    }
})

const handleEdit = (inspiracion) => {
    navigateTo(ROUTE_NAMES.MURALLON.EDITAR_INSPIRACION(inspiracion.id))
}

const handleDelete = async (inspiracion) => {
    try {
        await deleteInspiracion(inspiracion.id)

        success('Inspiración eliminada exitosamente', {
            title: 'Inspiración eliminada'
        })

        await fetchInspiraciones()
    } catch (err) {
        console.error('Error deleting inspiracion:', err)

        const errorMessage = err.message || 'Error al eliminar la inspiración'
        notificationError(errorMessage, {
            title: 'Error al eliminar inspiración',
            duration: 8000
        })
    }
}
</script>
