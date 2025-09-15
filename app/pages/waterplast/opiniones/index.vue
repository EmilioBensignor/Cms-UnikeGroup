<template>
    <DefaultSection>
        <HeadingH1>Opiniones</HeadingH1>
        <ButtonPrimary :to="ROUTE_NAMES.WATERPLAST.CREAR_OPINION">
            Nueva Opinión
        </ButtonPrimary>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="opiniones.length === 0" class="text-center py-12">
            <Icon name="tabler:message-circle" class="w-16 h-16" />
            <p class="text-dark text-lg">No hay opiniones disponibles</p>
        </div>

        <TableLayout v-else :data="opiniones" :columns="tabla.columns"
            :empty-state-text="`No hay items en opiniones creados`" table-name="opiniones" @edit="handleEdit"
            @delete="handleDelete" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'

const { opiniones, loading, fetchOpiniones, deleteOpinionCompleta } = useOpiniones()
const { success, error: notificationError } = useNotification()


const tabla = {
    columns: [
        {
            key: 'titulo',
            label: 'Título',
        },
        {
            key: 'nombre',
            label: 'Nombre',
        },
        {
            key: 'imagen',
            label: 'Imagen',
            type: 'image'
        },
        {
            key: 'estrellas',
            label: 'Estrellas',
        },
        {
            key: 'estado',
            label: 'Estado',
            type: 'boolean'
        },
        {
            key: 'texto',
            label: 'Texto',
            type: 'text'
        }
    ]
}

onMounted(async () => {
    try {
        await fetchOpiniones()
    } catch (err) {
        console.error('Error loading opiniones:', err)
    }
})

const handleEdit = (opinion) => {
    navigateTo(ROUTE_NAMES.WATERPLAST.EDITAR_OPINION(opinion.id))
}

const handleDelete = async (opinion) => {
    try {
        await deleteOpinionCompleta(opinion.id)

        success('Opinión eliminada exitosamente', {
            title: 'Opinión eliminada'
        })

        await fetchOpiniones()
    } catch (err) {
        console.error('Error deleting opinion:', err)

        const errorMessage = err.message || 'Error al eliminar la opinión'
        notificationError(errorMessage, {
            title: 'Error al eliminar opinión',
            duration: 8000
        })
    }
}
</script>
