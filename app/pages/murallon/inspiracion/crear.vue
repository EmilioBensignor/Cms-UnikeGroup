<template>
    <DefaultSection>
        <HeadingH1>Crear Inspiración Murallón</HeadingH1>
        <MurallonInspiracionForm :is-editing="false" @submit="handleSubmit" @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'
import { useMurallonInspiracion } from '~/composables/murallon/useInspiracion.js'

const { success, error } = useNotification()
const { createInspiracion } = useMurallonInspiracion()

const handleSubmit = async ({ inspiracionData, imagenAntes, imagenDespues }) => {
    try {
        await createInspiracion(inspiracionData, imagenAntes, imagenDespues)

        success('Inspiración creada exitosamente', {
            title: 'Inspiración agregada'
        })

        navigateTo(ROUTE_NAMES.MURALLON.INSPIRACION)
    } catch (err) {
        console.error('Error creating inspiracion:', err)

        const errorMessage = err.message || 'Error al crear la inspiración. Inténtalo de nuevo.'
        error(errorMessage, {
            title: 'Error al crear inspiración',
            duration: 8000
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.MURALLON.INSPIRACION)
}
</script>
