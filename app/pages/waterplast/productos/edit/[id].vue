<template>
    <DefaultSection>
        <HeadingH1>Editar Producto</HeadingH1>

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

        <TabsLayout v-else :tabs="tabs" defaultTab="detalle" @tab-change="handleTabChange">
            <template #detalle>
            </template>

            <template #caracteristicas-adicionales>
            </template>
        </TabsLayout>

        <div v-if="!loading && !error" class="w-full max-w-md lg:max-w-[56.25rem] flex justify-center">
            <ProductoForm
                ref="productoFormRef"
                :is-editing="true"
                :initial-data="currentProducto"
                :show-buttons="false"
                :preserve-data="true"
                v-show="activeTab === 'detalle'"
                @submit="handleFormSubmit"
                @cancel="handleCancel"
            />

            <CaracteristicasAdicionalesForm
                ref="caracteristicasFormRef"
                v-show="activeTab === 'caracteristicas-adicionales'"
                @update="handleCaracteristicasUpdate"
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
import { useWaterplastProductos } from '~/composables/waterplast/useProductos.js'
import ProductoForm from '~/components/waterplast/producto/Form.vue'
import CaracteristicasAdicionalesForm from '~/components/waterplast/producto/CaracteristicasAdicionalesForm.vue'
import TabsLayout from '~/components/tabs/Layout.vue'

const route = useRoute()
const { success, error: notificationError } = useNotification()
const { currentProducto, loading, error, fetchProductoById, updateProducto, fetchCaracteristicasAdicionales } = useWaterplastProductos()

const tabs = [
    {
        id: 'detalle',
        label: 'Detalle'
    },
    {
        id: 'caracteristicas-adicionales',
        label: 'Características Adicionales'
    }
]

const caracteristicasAdicionales = ref([])
const submitting = ref(false)
const productoFormRef = ref(null)
const caracteristicasFormRef = ref(null)
const activeTab = ref('detalle')

const handleTabChange = (tabId) => {
    activeTab.value = tabId
}

const handleCaracteristicasUpdate = (caracteristicas) => {
    caracteristicasAdicionales.value = caracteristicas
}

const handleFormSubmit = async (formData) => {
    submitting.value = true

    try {
        const id = route.params.id
        await updateProducto(
            id,
            formData.productoData,
            formData.archivos,
            formData.iconos,
            caracteristicasAdicionales.value
        )

        success('Producto actualizado exitosamente', {
            title: 'Producto actualizado'
        })
        await navigateTo(ROUTE_NAMES.WATERPLAST.PRODUCTOS)
    } catch (error) {
        notificationError('Error al actualizar el producto: ' + error.message, {
            title: 'Error al actualizar producto',
            duration: 8000
        })
    } finally {
        submitting.value = false
    }
}

watch(() => currentProducto.value, async (newProducto) => {
    if (newProducto && newProducto.id) {
        try {
            const existingCaracteristicas = await fetchCaracteristicasAdicionales(newProducto.id)

            await nextTick()

            if (caracteristicasFormRef.value) {
                caracteristicasFormRef.value.loadCaracteristicas(existingCaracteristicas)
            }
        } catch (err) {
            console.error('Error loading características:', err)
        }
    }
}, { immediate: true })

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
    navigateTo(ROUTE_NAMES.WATERPLAST.PRODUCTOS)
}
</script>