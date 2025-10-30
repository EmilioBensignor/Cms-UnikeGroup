<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormTextField v-model="formData.titulo" label="Título" id="titulo" placeholder="Ingrese el título del blog"
                required :error="errors.titulo" />
            <FormImageField v-model="imagePreview" id="imagen" label="Imagen Principal" :error="errors.imagen"
                required targetFolder="blog" @upload-start="handleImageStart" @upload-complete="handleImageComplete" />
        </FormFieldsContainer>
        <FormFieldsContainer>
            <FormDateField v-model="formData.fecha" label="Fecha" id="fecha" required
                :error="errors.fecha" :max="today" />
            <FormSelect v-model="formData.creado_por" label="Creado por" id="creado_por"
                placeholder="Seleccione quién crea el blog" :options="creadoPorOptions" required :error="errors.creado_por" />
        </FormFieldsContainer>
        <FormFieldsContainer>
            <FormTextarea v-model="formData.contenido" label="Contenido" id="contenido"
                placeholder="Ingrese el contenido del blog" required :error="errors.contenido"
                :show-formatting="true" :rows="10" />
        </FormFieldsContainer>
        <div class="w-full flex flex-col lg:flex-row items-center gap-5 mt-8">
            <ButtonPrimary @click="$emit('cancel')" type="button" class="!bg-gray-mid !text-dark">
                Cancelar
            </ButtonPrimary>

            <ButtonPrimary type="submit" :disabled="submitting">
                <Icon v-if="submitting" name="tabler:loader-2" class="w-4 h-4 animate-spin mr-2" />
                {{ submitting ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Blog' :
                    'Crear Blog') }}
            </ButtonPrimary>
        </div>
    </FormLayout>
</template>

<script setup>
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
const imagen = ref(null)
const imagePreview = ref(null)
const imagenOriginal = ref(null)

const today = computed(() => new Date().toISOString().split('T')[0])

const creadoPorOptions = [
    { label: 'Unike Group', value: 'Unike Group' },
    { label: 'Waterplast', value: 'Waterplast' },
    { label: 'Rohermet', value: 'Rohermet' }
]

const formData = reactive({
    titulo: '',
    imagen: null,
    contenido: '',
    fecha: new Date().toISOString().split('T')[0],
    creado_por: '',
})

const errors = reactive({
    titulo: '',
    imagen: '',
    contenido: '',
    fecha: '',
    creado_por: ''
})

onMounted(() => {
    if (props.isEditing && props.initialData) {
        Object.assign(formData, {
            titulo: props.initialData.titulo || '',
            imagen: props.initialData.imagen_principal_path || null,
            contenido: props.initialData.contenido || '',
            fecha: props.initialData.fecha || new Date().toISOString().split('T')[0],
            creado_por: props.initialData.creado_por || '',
        })

        if (props.initialData.imagen_principal) {
            imagePreview.value = props.initialData.imagen_principal
            imagenOriginal.value = props.initialData.imagen_principal_path || props.initialData.imagen_principal
        }
    }
})

const handleImageStart = (file) => {
    imagen.value = file
    errors.imagen = ''
}

const handleImageComplete = (imageUrl) => {
    imagePreview.value = imageUrl
    errors.imagen = ''
}

watch(() => imagePreview.value, (newValue) => {
    if (!newValue && newValue !== imagePreview.value) {
        formData.imagen = null
    }
})

const validateForm = () => {
    Object.keys(errors).forEach(key => {
        errors[key] = ''
    })

    let isValid = true

    if (!formData.titulo.trim()) {
        errors.titulo = 'El título es requerido'
        isValid = false
    } else if (formData.titulo.trim().length < 3) {
        errors.titulo = 'El título debe tener al menos 3 caracteres'
        isValid = false
    }

    if (!formData.contenido.trim()) {
        errors.contenido = 'El contenido es requerido'
        isValid = false
    } else if (formData.contenido.trim().length < 10) {
        errors.contenido = 'El contenido debe tener al menos 10 caracteres'
        isValid = false
    }

    if (!formData.fecha) {
        errors.fecha = 'La fecha es requerida'
        isValid = false
    } else {
        const fechaSeleccionada = new Date(formData.fecha)
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        fechaSeleccionada.setHours(0, 0, 0, 0)

        if (fechaSeleccionada > hoy) {
            errors.fecha = 'No se permite crear blogs con fechas futuras'
            isValid = false
        }
    }

    if (!formData.creado_por) {
        errors.creado_por = 'Debe seleccionar quién crea el blog'
        isValid = false
    }

    const hasNewImage = !!imagen.value
    const hasImagePreview = !!imagePreview.value
    const imagenWasDeleted = imagenOriginal.value && !imagePreview.value && !imagen.value

    if (!props.isEditing) {
        if (!hasNewImage && !hasImagePreview) {
            errors.imagen = 'La imagen es requerida'
            isValid = false
        }
    } else {
        if (!hasNewImage && !hasImagePreview) {
            errors.imagen = 'La imagen es requerida'
            isValid = false
        }

        if (imagenWasDeleted) {
            errors.imagen = 'No se puede actualizar un blog sin imagen. Debe proporcionar una imagen'
            isValid = false
        }
    }

    return isValid
}

const handleSubmit = async () => {
    if (!validateForm()) {
        return
    }

    submitting.value = true

    try {
        const blogData = {
            titulo: formData.titulo.trim(),
            contenido: formData.contenido.trim(),
            fecha: formData.fecha,
            creado_por: formData.creado_por,
        }

        if (props.isEditing) {
            if (imagen.value) {
                blogData.imagenFueEliminada = false
            } else {
                blogData.imagen_principal = formData.imagen
                blogData.imagenFueEliminada = false
            }
        }

        emit('submit', {
            blogData,
            imagen: imagen.value
        })

    } catch (error) {
        errors.general = 'Error al procesar el formulario'
    } finally {
        submitting.value = false
    }
}
</script>