<template>
    <div class="w-full flex flex-col gap-4">
        <FormLabel>Productos recomendados</FormLabel>

        <!-- Buscador de productos para agregar -->
        <div class="w-full relative">
            <input
                ref="searchInput"
                v-model="searchQuery"
                type="text"
                placeholder="Buscar producto por nombre..."
                @focus="showSuggestions = true"
                @input="showSuggestions = true"
                @blur="handleBlurSearch"
                class="w-full bg-light border border-dark rounded-md outline-none lg:text-xl font-light text-dark lg:placeholder:text-xl placeholder:font-light placeholder:text-gray-dark py-3 pr-3 pl-10"
            />
            <Icon name="tabler:search" class="w-5 h-5 absolute top-1/2 left-3 -translate-y-1/2 text-gray-dark" />

            <!-- Dropdown de sugerencias -->
            <div
                v-if="showSuggestions && filteredProductos.length > 0"
                class="w-full max-h-72 absolute top-full left-0 z-10 flex flex-col bg-light border border-gray-mid rounded-md overflow-y-auto mt-1"
            >
                <button
                    v-for="producto in filteredProductos"
                    :key="producto.id"
                    type="button"
                    @mousedown.prevent="addProducto(producto)"
                    class="w-full flex items-center gap-3 hover:bg-gray-light text-left transition-colors p-3"
                >
                    <div class="w-12 h-12 flex-shrink-0 bg-gray-light rounded overflow-hidden">
                        <img
                            v-if="producto.imagen_principal"
                            :src="producto.imagen_principal"
                            :alt="producto.nombre"
                            class="w-full h-full object-cover"
                        />
                        <div v-else class="w-full h-full flex items-center justify-center">
                            <Icon name="tabler:photo" class="w-5 h-5 text-gray-dark" />
                        </div>
                    </div>
                    <span class="text-dark font-medium">{{ producto.nombre }}</span>
                </button>
            </div>

            <div
                v-else-if="showSuggestions && searchQuery.trim() && !loadingProductos"
                class="w-full absolute top-full left-0 z-10 bg-light border border-gray-mid rounded-md text-dark text-sm p-3 mt-1"
            >
                No se encontraron productos disponibles.
            </div>
        </div>

        <!-- Lista de productos seleccionados -->
        <div v-if="seleccionados.length > 0" class="w-full flex flex-col gap-2">
            <p class="text-dark text-sm font-light">
                {{ seleccionados.length }}
                {{ seleccionados.length === 1 ? 'producto seleccionado' : 'productos seleccionados' }}
                — usá las flechas para reordenar
            </p>

            <ul class="w-full flex flex-col gap-2">
                <li
                    v-for="(producto, index) in seleccionados"
                    :key="producto.id"
                    class="w-full flex items-center gap-3 bg-light border border-gray-mid rounded-md p-3"
                >
                    <span class="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-secondary rounded-full text-light text-sm font-semibold">
                        {{ index + 1 }}
                    </span>

                    <div class="w-12 h-12 flex-shrink-0 bg-gray-light rounded overflow-hidden">
                        <img
                            v-if="producto.imagen_principal"
                            :src="producto.imagen_principal"
                            :alt="producto.nombre"
                            class="w-full h-full object-cover"
                        />
                        <div v-else class="w-full h-full flex items-center justify-center">
                            <Icon name="tabler:photo" class="w-5 h-5 text-gray-dark" />
                        </div>
                    </div>

                    <span class="flex-1 text-dark font-medium truncate">{{ producto.nombre }}</span>

                    <div class="flex items-center gap-1">
                        <button
                            type="button"
                            :disabled="index === 0"
                            @click="moveProducto(index, index - 1)"
                            class="w-9 h-9 flex items-center justify-center bg-secondary hover:bg-secondary/80 disabled:opacity-30 disabled:cursor-not-allowed rounded-full text-light transition-colors"
                            aria-label="Mover hacia arriba"
                        >
                            <Icon name="tabler:arrow-up" class="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            :disabled="index === seleccionados.length - 1"
                            @click="moveProducto(index, index + 1)"
                            class="w-9 h-9 flex items-center justify-center bg-secondary hover:bg-secondary/80 disabled:opacity-30 disabled:cursor-not-allowed rounded-full text-light transition-colors"
                            aria-label="Mover hacia abajo"
                        >
                            <Icon name="tabler:arrow-down" class="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            @click="removeProducto(index)"
                            class="w-9 h-9 flex items-center justify-center bg-primary hover:bg-primary/80 rounded-full text-light transition-colors"
                            aria-label="Eliminar"
                        >
                            <Icon name="tabler:trash" class="w-4 h-4" />
                        </button>
                    </div>
                </li>
            </ul>
        </div>

        <p v-else class="text-dark text-sm font-light">
            Aún no agregaste productos recomendados.
        </p>
    </div>
</template>

<script setup>
import { useMurallonProductos } from '~/composables/murallon/useProductos.js'

const props = defineProps({
    modelValue: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['update:modelValue'])

const { productos, loading: loadingProductos, fetchProductos } = useMurallonProductos()

const seleccionados = ref([])
const searchQuery = ref('')
const showSuggestions = ref(false)
const searchInput = ref(null)

onMounted(async () => {
    await fetchProductos()
})

watch(
    () => props.modelValue,
    (newValue) => {
        if (!Array.isArray(newValue)) {
            seleccionados.value = []
            return
        }
        const sameIds =
            newValue.length === seleccionados.value.length &&
            newValue.every((p, i) => (p?.id || p) === seleccionados.value[i]?.id)
        if (sameIds) return

        seleccionados.value = newValue.map(item => ({
            id: item.id || item,
            nombre: item.nombre || '',
            slug: item.slug || '',
            imagen_principal: item.imagen_principal || null,
            descripcion: item.descripcion || null
        }))
    },
    { immediate: true, deep: true }
)

const filteredProductos = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    const seleccionadosIds = new Set(seleccionados.value.map(p => p.id))

    return (productos.value || [])
        .filter(p => !seleccionadosIds.has(p.id))
        .filter(p => !query || (p.nombre || '').toLowerCase().includes(query))
        .slice(0, 10)
})

const handleBlurSearch = () => {
    setTimeout(() => {
        showSuggestions.value = false
    }, 150)
}

const addProducto = (producto) => {
    seleccionados.value.push({
        id: producto.id,
        nombre: producto.nombre,
        slug: producto.slug,
        imagen_principal: producto.imagen_principal,
        descripcion: producto.descripcion
    })
    searchQuery.value = ''
    showSuggestions.value = true
    emitUpdate()
    nextTick(() => {
        searchInput.value?.focus()
    })
}

const removeProducto = (index) => {
    seleccionados.value.splice(index, 1)
    emitUpdate()
}

const moveProducto = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= seleccionados.value.length) return
    const copia = [...seleccionados.value]
    const [movido] = copia.splice(fromIndex, 1)
    copia.splice(toIndex, 0, movido)
    seleccionados.value = copia
    emitUpdate()
}

const emitUpdate = () => {
    emit('update:modelValue', [...seleccionados.value])
}
</script>
