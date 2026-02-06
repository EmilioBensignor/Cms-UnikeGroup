<template>
    <DefaultSection>
        <HeadingH1>Editar Producto Rohermet</HeadingH1>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="error" class="text-center py-12">
            <Icon name="tabler:alert-circle" class="w-16 h-16 mx-auto mb-4 text-red-500" />
            <p class="text-red-500 text-lg">{{ error }}</p>
            <ButtonPrimary @click="handleCancel" class="mt-4">
                Volver
            </ButtonPrimary>
        </div>

        <div v-if="!loading && !error" class="w-full max-w-md lg:max-w-[56.25rem]">
            <RohermetProductoForm
                ref="productoFormRef"
                :is-editing="true"
                :initial-data="currentProducto"
                :show-buttons="false"
                @submit="handleFormSubmit"
                @cancel="handleCancel"
            />
        </div>

        <div v-if="!loading && !error" class="w-full max-w-md lg:max-w-[56.25rem] flex flex-col lg:flex-row items-center gap-5 mt-8">
            <ButtonPrimary @click="handleCancel" type="button" class="!bg-gray-mid !text-dark">
                Cancelar
            </ButtonPrimary>

            <ButtonPrimary @click="handleSubmit" :disabled="submitting">
                <Icon v-if="submitting" name="tabler:loader-2" class="w-4 h-4 animate-spin mr-2" />
                {{ submitting ? 'Actualizando...' : 'Actualizar Producto' }}
            </ButtonPrimary>
        </div>
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useRohermetProductos } from '~/composables/rohermet/useProductos.js'

const route = useRoute()
const { success, error: notificationError } = useNotification()
const { currentProducto, loading, error, fetchProductoById, updateProducto } = useRohermetProductos()

const submitting = ref(false)
const productoFormRef = ref(null)

const handleFormSubmit = async (formData) => {
    submitting.value = true

    try {
        const id = route.params.id
        await updateProducto(
            id,
            formData.productoData,
            formData.archivos,
            formData.iconos,
            formData.galeria,
            formData.removedImages
        )

        success('Producto actualizado exitosamente', {
            title: 'Producto actualizado'
        })
        await navigateTo(ROUTE_NAMES.ROHERMET.PRODUCTOS)
    } catch (error) {
        notificationError('Error al actualizar el producto: ' + error.message, {
            title: 'Error al actualizar producto',
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

onMounted(async () => {
    try {
        const id = route.params.id
        if (!id) {
            throw new Error('ID de producto no encontrado')
        }
        await fetchProductoById(id)
    } catch (err) {
        notificationError('Error al cargar el producto', {
            title: 'Error al cargar producto'
        })
    }
})

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.ROHERMET.PRODUCTOS)
}

</script>