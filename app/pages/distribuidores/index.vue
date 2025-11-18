<template>
    <DefaultSection>
        <HeadingH1>Distribuidores</HeadingH1>
        <ButtonPrimary :to="ROUTE_NAMES.UNIKE.CREAR_DISTRIBUIDOR">
            Crear Nuevo Distribuidor
        </ButtonPrimary>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="distribuidores.length === 0" class="text-center py-12">
            <Icon name="tabler:map-pin" class="w-16 h-16" />
            <p class="text-dark text-lg">No hay distribuidores disponibles</p>
        </div>

        <TableLayout v-else :data="distribuidores" :columns="tabla.columns"
            :empty-state-text="`No hay items en distribuidores creados`" table-name="distribuidores" @edit="handleEdit"
            @delete="handleDelete" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useWaterplastDistribuidores } from '~/composables/waterplast/useDistribuidores.js'

const { distribuidores, loading, fetchDistribuidores, deleteDistribuidorCompleto } = useWaterplastDistribuidores()
const { success, error: notificationError } = useNotification()


const tabla = {
    columns: [
        {
            key: 'nombreComercio',
            label: 'Nombre del Comercio',
        },
        {
            key: 'calle',
            label: 'Calle',
        },
        {
            key: 'provincia',
            label: 'Provincia',
        },
        {
            key: 'localidad',
            label: 'Localidad',
        },
        {
            key: 'latitud',
            label: 'Latitud',
        },
        {
            key: 'longitud',
            label: 'Longitud',
        },
        {
            key: 'estado',
            label: 'Estado',
            type: 'boolean'
        },
    ]
}

onMounted(async () => {
    try {
        await fetchDistribuidores()
    } catch (err) {
        console.error('Error loading distribuidores:', err)
    }
})

const handleEdit = (distribuidor) => {
    navigateTo(ROUTE_NAMES.UNIKE.EDITAR_DISTRIBUIDOR(distribuidor.id))
}

const handleDelete = async (distribuidor) => {
    try {
        await deleteDistribuidorCompleto(distribuidor.id)

        success('Distribuidor eliminado exitosamente', {
            title: 'Distribuidor eliminado'
        })

        await fetchDistribuidores()
    } catch (err) {
        console.error('Error deleting distribuidor:', err)

        const errorMessage = err.message || 'Error al eliminar el distribuidor'
        notificationError(errorMessage, {
            title: 'Error al eliminar distribuidor',
            duration: 8000
        })
    }
}
</script>
