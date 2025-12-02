<template>
    <DefaultSection>
        <HeadingH1>Crear Producto Rohermet</HeadingH1>

        <div class="w-full max-w-md lg:max-w-[56.25rem]">
            <RohermetProductoForm
                ref="productoFormRef"
                :is-editing="false"
                :show-buttons="false"
                @submit="handleFormSubmit"
                @cancel="handleCancel"
            />
        </div>

        <div class="w-full max-w-md lg:max-w-[56.25rem] flex flex-col lg:flex-row items-center gap-5 mt-8">
            <ButtonPrimary @click="handleCancel" type="button" class="!bg-gray-mid !text-dark">
                Cancelar
            </ButtonPrimary>

            <ButtonPrimary @click="handleSubmit" :disabled="submitting">
                <Icon v-if="submitting" name="tabler:loader-2" class="w-4 h-4 animate-spin mr-2" />
                {{ submitting ? 'Creando...' : 'Crear Producto' }}
            </ButtonPrimary>
        </div>
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useRohermetProductos } from '~/composables/rohermet/useProductos.js'

const { createProducto } = useRohermetProductos()
const { success, error: notificationError } = useNotification()

const submitting = ref(false)
const productoFormRef = ref(null)

const handleFormSubmit = async (formData) => {
    submitting.value = true

    try {
        await createProducto(
            formData.productoData,
            formData.archivos
        )

        success('Producto creado exitosamente', {
            title: 'Producto creado'
        })
        await navigateTo(ROUTE_NAMES.ROHERMET.PRODUCTOS)
    } catch (error) {
        notificationError('Error al crear el producto: ' + error.message, {
            title: 'Error al crear producto',
            duration: 8000
        })
    } finally {
        submitting.value = false
    }
}

const handleSubmit = async () => {
    if (productoFormRef.value) {
        await productoFormRef.value.handleSubmit()
    } else {
        notificationError('Error interno: Formulario no disponible', {
            title: 'Error'
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.ROHERMET.PRODUCTOS)
}
</script>