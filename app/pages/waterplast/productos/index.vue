<template>
    <DefaultSection>
        <HeadingH1>Productos</HeadingH1>
        <ButtonPrimary :to="ROUTE_NAMES.WATERPLAST.CREAR_PRODUCTO">
            Crear Nuevo Producto
        </ButtonPrimary>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="productos.length === 0" class="text-center py-12">
            <Icon name="tabler:package" class="w-16 h-16" />
            <p class="text-dark text-lg">No hay productos disponibles</p>
        </div>

        <TableLayout v-else :data="productos" :columns="tabla.columns" :empty-state-text="`No hay productos creados`"
            table-name="productos" :show-actions="true" :show-delete="true" @edit="handleEdit" @delete="handleDelete" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useWaterplastProductos } from '~/composables/waterplast/useProductos.js'

const { productos, loading, fetchProductos, deleteProducto } = useWaterplastProductos()
const { success, error: notificationError } = useNotification()

const tabla = {
    columns: [
        {
            key: 'nombre',
            label: 'Nombre',
        },
        {
            key: 'categoria_nombre',
            label: 'Categoría',
        },
        {
            key: 'descripcion',
            label: 'Descripción',
        },
        {
            key: 'imagen',
            label: 'Imagen',
            type: 'image'
        },
        {
            key: 'altura_cm',
            label: 'Altura (cm)',
            type: 'number'
        },
        {
            key: 'ancho_cm',
            label: 'Ancho (cm)',
            type: 'number'
        },
        {
            key: 'largo_cm',
            label: 'Largo (cm)',
            type: 'number'
        },
        {
            key: 'diametro_cm',
            label: 'Diámetro (cm)',
            type: 'number'
        },
        {
            key: 'capacidad_lts',
            label: 'Capacidad (lts)',
            type: 'number'
        },
        {
            key: 'orientacion',
            label: 'Orientación',
        },
        {
            key: 'color',
            label: 'Color',
        },
        {
            key: 'tecnologia',
            label: 'Tecnología',
        },
        {
            key: 'opcion',
            label: 'Opción',
        },
        {
            key: 'estado',
            label: 'Estado',
            type: 'boolean'
        }
    ]
}

onMounted(async () => {
    try {
        await fetchProductos()
    } catch (err) {
        console.error('Error loading productos:', err)
    }
})

const handleEdit = (producto) => {
    navigateTo(ROUTE_NAMES.WATERPLAST.EDITAR_PRODUCTO(producto.id))
}

const handleDelete = async (producto) => {
    try {
        await deleteProducto(producto.id)
        success('Producto eliminado exitosamente', {
            title: 'Producto eliminado'
        })
    } catch (error) {
        console.error('Error al eliminar producto:', error)
        notificationError('Error al eliminar el producto: ' + error.message, {
            title: 'Error al eliminar producto',
            duration: 8000
        })
    }
}
</script>