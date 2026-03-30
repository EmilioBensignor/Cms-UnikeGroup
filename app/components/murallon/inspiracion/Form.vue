<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormTextField v-model="formData.titulo" label="Título" id="titulo"
                placeholder="Ingrese el título de la inspiración" required :error="errors.titulo" />
            <FormTextField v-model="formData.orden" label="Orden" id="orden" type="number"
                placeholder="Número de orden" :error="errors.orden" />
        </FormFieldsContainer>
        <FormFieldsContainer>
            <FormImageField v-model="imageAntesPreview" id="imagen_antes" label="Imagen Antes"
                :error="errors.imagen_antes" required targetFolder="inspiracion-murallon"
                @upload-start="handleImageAntesStart" @upload-complete="handleImageAntesComplete" />
            <FormImageField v-model="imageDespuesPreview" id="imagen_despues" label="Imagen Después"
                :error="errors.imagen_despues" required targetFolder="inspiracion-murallon"
                @upload-start="handleImageDespuesStart" @upload-complete="handleImageDespuesComplete" />
        </FormFieldsContainer>
        <div class="w-full flex flex-col lg:flex-row items-center gap-5 mt-8">
            <ButtonPrimary @click="$emit('cancel')" type="button" class="!bg-gray-mid !text-dark">
                Cancelar
            </ButtonPrimary>

            <ButtonPrimary type="submit" :disabled="submitting">
                <Icon v-if="submitting" name="tabler:loader-2" class="w-4 h-4 animate-spin mr-2" />
                {{ submitting ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Inspiración' :
                    'Crear Inspiración') }}
            </ButtonPrimary>
        </div>
    </FormLayout>
</template>

<script setup>
const { error: showValidationError } = useNotification()

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
const imagenAntes = ref(null)
const imagenDespues = ref(null)
const imageAntesPreview = ref(null)
const imageDespuesPreview = ref(null)

const formData = reactive({
    titulo: '',
    orden: 0,
})

const errors = reactive({
    titulo: '',
    orden: '',
    imagen_antes: '',
    imagen_despues: '',
})

onMounted(() => {
    if (props.isEditing && props.initialData) {
        Object.assign(formData, {
            titulo: props.initialData.titulo || '',
            orden: props.initialData.orden || 0,
        })

        if (props.initialData.imagen_antes) {
            imageAntesPreview.value = props.initialData.imagen_antes
        }
        if (props.initialData.imagen_despues) {
            imageDespuesPreview.value = props.initialData.imagen_despues
        }
    }
})

const handleImageAntesStart = (file) => {
    imagenAntes.value = file
    errors.imagen_antes = ''
}

const handleImageAntesComplete = (imageUrl) => {
    imageAntesPreview.value = imageUrl
    errors.imagen_antes = ''
}

const handleImageDespuesStart = (file) => {
    imagenDespues.value = file
    errors.imagen_despues = ''
}

const handleImageDespuesComplete = (imageUrl) => {
    imageDespuesPreview.value = imageUrl
    errors.imagen_despues = ''
}

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

    if (!props.isEditing) {
        if (!imagenAntes.value && !imageAntesPreview.value) {
            errors.imagen_antes = 'La imagen antes es requerida'
            isValid = false
        }
        if (!imagenDespues.value && !imageDespuesPreview.value) {
            errors.imagen_despues = 'La imagen después es requerida'
            isValid = false
        }
    } else {
        if (!imagenAntes.value && !imageAntesPreview.value) {
            errors.imagen_antes = 'La imagen antes es requerida'
            isValid = false
        }
        if (!imagenDespues.value && !imageDespuesPreview.value) {
            errors.imagen_despues = 'La imagen después es requerida'
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
        const inspiracionData = {
            titulo: formData.titulo.trim(),
            orden: parseInt(formData.orden) || 0,
        }

        emit('submit', {
            inspiracionData,
            imagenAntes: imagenAntes.value,
            imagenDespues: imagenDespues.value
        })

    } catch (error) {
        errors.general = 'Error al procesar el formulario'
    } finally {
        submitting.value = false
    }
}
</script>
