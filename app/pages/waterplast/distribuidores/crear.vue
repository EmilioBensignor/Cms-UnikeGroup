<template>
    <DefaultSection>
        <NuxtLink :to="ROUTE_NAMES.WATERPLAST.DISTRIBUIDORES"
            class="flex items-center gap-2 self-start text-dark font-light no-underline">
            <Icon name="tabler:arrow-left" size="1.25rem" />
            Volver a distribuidores
        </NuxtLink>
        <HeadingH1>Crear Distribuidor</HeadingH1>
        <WaterplastDistribuidorForm :is-editing="false" @submit="handleSubmit" @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';
import { useWaterplastDistribuidores } from '~/composables/waterplast/useDistribuidores.js'

const { success, error } = useNotification()
const { createDistribuidor } = useWaterplastDistribuidores()

const handleSubmit = async (formData) => {
    try {
        await createDistribuidor(formData)

        success('Distribuidor creado exitosamente', {
            title: 'Distribuidor agregado'
        })

        navigateTo(ROUTE_NAMES.WATERPLAST.DISTRIBUIDORES)
    } catch (err) {
        console.error('Error creating distribuidor:', err)

        const errorMessage = err.message || 'Error al crear el distribuidor. Inténtalo de nuevo.'
        error(errorMessage, {
            title: 'Error al crear distribuidor',
            duration: 8000
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.WATERPLAST.DISTRIBUIDORES)
}
</script>