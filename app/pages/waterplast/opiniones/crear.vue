<template>
    <DefaultSection>
        <NuxtLink :to="ROUTE_NAMES.WATERPLAST.OPINIONES"
            class="flex items-center gap-2 self-start text-dark font-light no-underline">
            <Icon name="tabler:arrow-left" size="1.25rem" />
            Volver a opiniones
        </NuxtLink>
        <HeadingH1>Crear Opinión</HeadingH1>
        <WaterplastOpinionForm :is-editing="false" @submit="handleSubmit" @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';


const { success, error } = useNotification()
const { createOpinion } = useOpiniones()

const handleSubmit = async (formData) => {
    try {
        await createOpinion(formData)

        success('Opinión creada exitosamente', {
            title: 'Opinión agregada'
        })

        navigateTo(ROUTE_NAMES.WATERPLAST.OPINIONES)
    } catch (err) {
        console.error('Error creating opinion:', err)

        const errorMessage = err.message || 'Error al crear la opinión. Inténtalo de nuevo.'
        error(errorMessage, {
            title: 'Error al crear opinión',
            duration: 8000
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.WATERPLAST.OPINIONES)
}
</script>