<template>
    <DefaultSection>
        <HeadingH1>Productos</HeadingH1>
        <ButtonPrimary :to="ROUTE_NAMES.WATERPLAST.CREAR_PRODUCTO">
            Crear Nuevo Producto
        </ButtonPrimary>

        <!-- Filtros de búsqueda -->
        <div class="w-full flex flex-col md:flex-row justify-center gap-6">
            <FormTextField v-model="filtros.nombre" id="buscar-nombre" label="Buscar por nombre"
                placeholder="Buscar productos por nombre..." />
            <FormSelect v-model="filtros.categoriaId" id="filtrar-categoria" label="Filtrar por categoría"
                :options="opcionesCategorias" />
        </div>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="productos.length === 0" class="text-center py-12">
            <Icon name="tabler:package" class="w-16 h-16" />
            <p class="text-dark text-lg">No hay productos disponibles</p>
        </div>

        <TableLayout v-else :data="productosFiltrados" :columns="tabla.columns" :empty-state-text="textoEstadoVacio"
            table-name="productos" :show-actions="true" :show-delete="true" @edit="handleEdit" @delete="handleDelete" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useWaterplastProductos } from '~/composables/waterplast/useProductos.js'
import { useWaterplastCategorias } from '~/composables/waterplast/useCategorias.js'

const { productos, loading, fetchProductos, deleteProducto } = useWaterplastProductos()
const { categorias, fetchCategorias } = useWaterplastCategorias()
const { success, error: notificationError } = useNotification()

const filtros = reactive({
    nombre: '',
    categoriaId: ''
})

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

const opcionesCategorias = computed(() => {
    const opciones = [{ value: '', label: 'Todas las categorías' }]

    if (categorias.value) {
        categorias.value.forEach(categoria => {
            opciones.push({
                value: categoria.id.toString(),
                label: categoria.nombre
            })
        })
    }

    return opciones
})

const formatearValor = (valor) => {
    if (!valor) return valor

    return valor
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase())
}

const productosFiltrados = computed(() => {
    if (!productos.value) return []

    return productos.value
        .filter(producto => {
            const cumpleNombre = !filtros.nombre ||
                producto.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())

            const cumpleCategoria = !filtros.categoriaId ||
                producto.categoria_id.toString() === filtros.categoriaId

            return cumpleNombre && cumpleCategoria
        })
        .map(producto => ({
            ...producto,
            orientacion: formatearValor(producto.orientacion),
            color: formatearValor(producto.color),
            tecnologia: formatearValor(producto.tecnologia),
            opcion: formatearValor(producto.opcion)
        }))
})

const textoEstadoVacio = computed(() => {
    if (filtros.nombre || filtros.categoriaId) {
        return 'No se encontraron productos que coincidan con los filtros'
    }
    return 'No hay productos creados'
})

onMounted(async () => {
    try {
        await Promise.all([
            fetchProductos(),
            fetchCategorias()
        ])
    } catch (err) {
        console.error('Error loading data:', err)
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
        notificationError('Error al eliminar el producto: ' + error.message, {
            title: 'Error al eliminar producto',
            duration: 8000
        })
    }
}
</script>