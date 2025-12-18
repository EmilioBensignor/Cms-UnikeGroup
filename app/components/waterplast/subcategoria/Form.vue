<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormTextField v-model="formData.nombre" label="Nombre de la Subcategoría" id="nombre"
                placeholder="Ingrese el nombre de la subcategoría" required :error="errors.nombre" />

            <FormSelect v-model="formData.categoria_id" label="Categoría" id="categoria_id" required
                :error="errors.categoria_id" :options="categoriasOptions" placeholder="Seleccione una categoría" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.orden" label="Número de Orden" id="orden" type="number"
                placeholder="Ingrese el número de orden" required :error="errors.orden" />
        </FormFieldsContainer>

        <div class="w-full flex flex-col lg:flex-row items-center gap-5 mt-8">
            <ButtonPrimary @click="$emit('cancel')" type="button" class="!bg-gray-mid !text-dark">
                Cancelar
            </ButtonPrimary>

            <ButtonPrimary type="submit" :disabled="submitting">
                <Icon v-if="submitting" name="tabler:loader-2" class="w-4 h-4 animate-spin mr-2" />
                {{ submitting ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Subcategoría' : 'Crear Subcategoría') }}
            </ButtonPrimary>
        </div>
    </FormLayout>
</template>

<script setup>
import { useWaterplastCategorias } from '~/composables/waterplast/useCategorias.js'
import { useWaterplastSubcategorias } from '~/composables/waterplast/useSubcategorias.js'

const { error: showValidationError } = useNotification()
const { fetchCategorias, categorias } = useWaterplastCategorias()
const { fetchSubcategoriasByCategoria } = useWaterplastSubcategorias()

const categoriasOptions = computed(() => {
    return categorias.value.map(categoria => ({
        value: categoria.id.toString(),
        label: categoria.nombre
    }))
})

const props = defineProps({
    isEditing: {
        type: Boolean,
        default: false
    },
    initialData: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['submit', 'cancel'])

const submitting = ref(false)

const formData = reactive({
    nombre: '',
    categoria_id: '',
    orden: 0
})

const errors = reactive({
    nombre: '',
    categoria_id: '',
    orden: ''
})

onMounted(async () => {
    await fetchCategorias()
})

watch(() => props.initialData, (newData) => {
    if (props.isEditing && newData) {
        Object.assign(formData, {
            nombre: newData.nombre || '',
            categoria_id: newData.categoria_id || '',
            orden: newData.orden || 0
        })
    }
}, { immediate: true, deep: true })

watch([() => formData.orden, () => formData.categoria_id], async ([newOrden, newCategoriaId]) => {
    errors.orden = ''

    if (!newOrden || !newCategoriaId) {
        return
    }

    try {
        const subcategoriasEnCategoria = await fetchSubcategoriasByCategoria(newCategoriaId)

        const ordenDuplicado = subcategoriasEnCategoria.find(sub => {
            const esOrdenIgual = parseInt(sub.orden) === parseInt(newOrden)
            const esOtraSubcategoria = props.isEditing ? sub.id !== props.initialData.id : true
            return esOrdenIgual && esOtraSubcategoria
        })

        if (ordenDuplicado) {
            errors.orden = 'Ya existe una subcategoría con este número de orden en esta categoría'
        }
    } catch (error) {
        // Silenciosamente fallar si hay error al validar
        console.error('Error validando orden:', error)
    }
})

const validateForm = () => {
    Object.keys(errors).forEach(key => {
        errors[key] = ''
    })

    let isValid = true

    if (!formData.nombre.trim()) {
        errors.nombre = 'El nombre es requerido'
        isValid = false
    }

    if (!formData.categoria_id) {
        errors.categoria_id = 'La categoría es requerida'
        isValid = false
    }

    if (!formData.orden || formData.orden < 1) {
        errors.orden = 'El número de orden es requerido y debe ser mayor a 0'
        isValid = false
    }

    return isValid
}

const handleSubmit = async () => {
    if (!validateForm()) {
        showValidationError('Por favor, completa todos los campos requeridos', {
            title: 'Validación incompleta'
        })
        return
    }

    submitting.value = true

    try {
        const subcategoriasEnCategoria = await fetchSubcategoriasByCategoria(formData.categoria_id)

        const ordenDuplicado = subcategoriasEnCategoria.find(sub => {
            const esOrdenIgual = parseInt(sub.orden) === parseInt(formData.orden)
            const esOtraSubcategoria = props.isEditing ? sub.id !== props.initialData.id : true
            return esOrdenIgual && esOtraSubcategoria
        })

        if (ordenDuplicado) {
            errors.orden = 'Ya existe una subcategoría con este número de orden en esta categoría'
            showValidationError('Ya existe una subcategoría con este número de orden en esta categoría', {
                title: 'Orden duplicado'
            })
            submitting.value = false
            return
        }

        const subcategoriaData = {
            nombre: formData.nombre.trim(),
            categoria_id: formData.categoria_id,
            orden: parseInt(formData.orden)
        }

        emit('submit', subcategoriaData)

    } catch (error) {
        errors.general = 'Error al procesar el formulario'
    } finally {
        submitting.value = false
    }
}
</script>
