<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormTextField v-model="formData.nombre" label="Nombre" id="nombre"
                placeholder="Ingrese el nombre del producto" required :error="errors.nombre" />
            <FormTextField v-model="formData.rendimiento" label="Rendimiento" id="rendimiento"
                placeholder="Ej: 10 – 16 m² / L" :error="errors.rendimiento" />
        </FormFieldsContainer>
        <FormFieldsContainer>
            <FormSelect v-model="formData.categorias_id" label="Categoría" id="categorias_id"
                placeholder="Seleccione una categoría" :options="opcionesCategorias" required
                :error="errors.categorias_id" />
            <FormSelect v-model="formData.tipos_aplicacion_id" label="Tipo de Aplicación" id="tipos_aplicacion_id"
                placeholder="Seleccione un tipo de aplicación" :options="opcionesTiposAplicacion" required
                :error="errors.tipos_aplicacion_id" />
        </FormFieldsContainer>
        <FormFieldsContainer>
            <FormImageField v-model="imagePreview" id="imagen_principal" label="Imagen Principal"
                :error="errors.imagen_principal" required targetFolder="murallon-productos"
                @upload-start="handleImageStart" @upload-complete="handleImageComplete" />
        </FormFieldsContainer>
        <FormFieldsContainer>
            <FormCheckboxGroupField v-model="formData.uso" label="Uso" id="uso" :options="usoOptions"
                :error="errors.uso" />
        </FormFieldsContainer>
        <FormFieldsContainer>
            <FormCheckboxGroupField v-model="formData.tamanos_disponibles" label="Tamaños Disponibles"
                id="tamanos_disponibles" :options="tamanosOptions" :error="errors.tamanos_disponibles" />
        </FormFieldsContainer>
        <FormFieldsContainer>
            <FormSwitch v-model="formData.destacado" label="Destacado" id="destacado" />
        </FormFieldsContainer>

        <div v-if="showButtons" class="w-full flex flex-col lg:flex-row items-center gap-5 mt-8">
            <ButtonPrimary @click="$emit('cancel')" type="button" class="!bg-gray-mid !text-dark">
                Cancelar
            </ButtonPrimary>

            <ButtonPrimary type="submit" :disabled="submitting">
                <Icon v-if="submitting" name="tabler:loader-2" class="w-4 h-4 animate-spin mr-2" />
                {{ submitting ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Producto' :
                    'Crear Producto') }}
            </ButtonPrimary>
        </div>
    </FormLayout>
</template>

<script setup>
import { useMurallonCategorias } from '~/composables/murallon/useCategorias.js'
import { useMurallonTiposAplicacion } from '~/composables/murallon/useTiposAplicacion.js'

const { error: showValidationError } = useNotification()

const props = defineProps({
    isEditing: {
        type: Boolean,
        default: false
    },
    initialData: {
        type: Object,
        default: () => ({})
    },
    showButtons: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['submit', 'cancel'])

const { categorias, fetchCategorias } = useMurallonCategorias()
const { tiposAplicacion, fetchTiposAplicacion } = useMurallonTiposAplicacion()

const submitting = ref(false)
const imagen = ref(null)
const imagePreview = ref(null)

const usoOptions = [
    { value: 'Interior', label: 'Interior' },
    { value: 'Exterior', label: 'Exterior' }
]

const tamanosOptions = [
    { value: '1 L', label: '1 L' },
    { value: '4 L', label: '4 L' },
    { value: '10 L', label: '10 L' },
    { value: '20 L', label: '20 L' }
]

const formData = reactive({
    nombre: '',
    categorias_id: '',
    tipos_aplicacion_id: '',
    uso: [],
    tamanos_disponibles: [],
    rendimiento: '',
    destacado: false,
})

const errors = reactive({
    nombre: '',
    imagen_principal: '',
    categorias_id: '',
    tipos_aplicacion_id: '',
    uso: '',
    tamanos_disponibles: '',
    rendimiento: '',
})

const opcionesCategorias = computed(() => {
    const opciones = [{ value: '', label: 'Seleccione una categoría' }]
    if (categorias.value) {
        categorias.value.forEach(cat => {
            opciones.push({ value: cat.id, label: cat.nombre })
        })
    }
    return opciones
})

const opcionesTiposAplicacion = computed(() => {
    const opciones = [{ value: '', label: 'Seleccione un tipo de aplicación' }]
    if (tiposAplicacion.value) {
        tiposAplicacion.value.forEach(tipo => {
            opciones.push({ value: tipo.id, label: tipo.nombre })
        })
    }
    return opciones
})

onMounted(async () => {
    await Promise.all([
        fetchCategorias(),
        fetchTiposAplicacion()
    ])

    if (props.isEditing && props.initialData) {
        Object.assign(formData, {
            nombre: props.initialData.nombre || '',
            categorias_id: props.initialData.categorias_id || '',
            tipos_aplicacion_id: props.initialData.tipos_aplicacion_id || '',
            uso: props.initialData.uso || [],
            tamanos_disponibles: props.initialData.tamanos_disponibles || [],
            rendimiento: props.initialData.rendimiento || '',
            destacado: props.initialData.destacado || false,
        })

        if (props.initialData.imagen_principal) {
            imagePreview.value = props.initialData.imagen_principal
        }
    }
})

const handleImageStart = (file) => {
    imagen.value = file
    errors.imagen_principal = ''
}

const handleImageComplete = (imageUrl) => {
    imagePreview.value = imageUrl
    errors.imagen_principal = ''
}

const validateForm = () => {
    Object.keys(errors).forEach(key => {
        errors[key] = ''
    })

    let isValid = true

    if (!formData.nombre.trim()) {
        errors.nombre = 'El nombre es requerido'
        isValid = false
    }

    if (!formData.categorias_id) {
        errors.categorias_id = 'La categoría es requerida'
        isValid = false
    }

    if (!formData.tipos_aplicacion_id) {
        errors.tipos_aplicacion_id = 'El tipo de aplicación es requerido'
        isValid = false
    }

    if (!props.isEditing) {
        if (!imagen.value && !imagePreview.value) {
            errors.imagen_principal = 'La imagen es requerida'
            isValid = false
        }
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
        const productoData = {
            nombre: formData.nombre.trim(),
            categorias_id: formData.categorias_id,
            tipos_aplicacion_id: formData.tipos_aplicacion_id,
            uso: formData.uso,
            tamanos_disponibles: formData.tamanos_disponibles,
            rendimiento: formData.rendimiento.trim(),
            destacado: formData.destacado,
        }

        if (props.isEditing) {
            productoData.imagen_principal_path = props.initialData?.imagen_principal_path || null
        }

        emit('submit', {
            productoData,
            imagen: imagen.value
        })
    } catch (error) {
        console.error('Error al procesar el formulario:', error)
    } finally {
        submitting.value = false
    }
}

defineExpose({
    handleSubmit
})
</script>
