<template>
    <DefaultSection>
        <HeadingH1>Crear Subcategoría</HeadingH1>

        <SubcategoriaForm @submit="handleSubmit" @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useWaterplastSubcategorias } from '~/composables/waterplast/useSubcategorias.js'
import SubcategoriaForm from '~/components/waterplast/subcategoria/Form.vue'

const { createSubcategoria } = useWaterplastSubcategorias()
const { success: showSuccess, error: showError } = useNotification()

const handleSubmit = async (subcategoriaData) => {
    try {
        await createSubcategoria(subcategoriaData)
        showSuccess('Subcategoría creada correctamente')
        navigateTo(ROUTE_NAMES.WATERPLAST.SUBCATEGORIAS)
    } catch (err) {
        console.error('Error creating subcategoria:', err)

        if (err.message && err.message.includes('duplicate key') || err.message.includes('unique constraint')) {
            showError('Ya existe una subcategoría con ese número de orden en esta categoría', {
                title: 'Orden duplicado',
                duration: 5000
            })
        } else {
            showError('Error al crear la subcategoría: ' + err.message, {
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
