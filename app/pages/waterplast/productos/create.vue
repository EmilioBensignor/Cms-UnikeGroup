<template>
    <DefaultSection>
        <HeadingH1>Crear Producto</HeadingH1>

        <TabsLayout :tabs="tabs" defaultTab="detalle" @tab-change="handleTabChange">
            <template #detalle>
            </template>

            <template #caracteristicas-adicionales>
            </template>
        </TabsLayout>

        <!-- Always mounted forms -->
        <div class="w-full max-w-md lg:max-w-[56.25rem]">
            <ProductoForm
                ref="productoFormRef"
                :is-editing="false"
                :show-buttons="false"
                :preserve-data="true"
                v-show="activeTab === 'detalle'"
                @submit="handleFormSubmit"
                @cancel="handleCancel"
            />

            <CaracteristicasAdicionalesForm
                v-show="activeTab === 'caracteristicas-adicionales'"
                @update="handleCaracteristicasUpdate"
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
import { useWaterplastProductos } from '~/composables/waterplast/useProductos.js'
import ProductoForm from '~/components/waterplast/producto/Form.vue'
import CaracteristicasAdicionalesForm from '~/components/waterplast/producto/CaracteristicasAdicionalesForm.vue'
import TabsLayout from '~/components/tabs/Layout.vue'

const { createProducto } = useWaterplastProductos()
const { success, error: notificationError } = useNotification()

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
        await createProducto(
            formData.productoData,
            formData.archivos,
            formData.iconos,
            caracteristicasAdicionales.value
        )

        success('Producto creado exitosamente', {
            title: 'Producto creado'
        })
        await navigateTo(ROUTE_NAMES.WATERPLAST.PRODUCTOS)
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
    navigateTo(ROUTE_NAMES.WATERPLAST.PRODUCTOS)
}
</script>