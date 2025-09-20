<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormTextField v-model="formData.titulo" label="Título" id="titulo"
                placeholder="Ingrese el título de la opinión" required :error="errors.titulo" />

            <FormTextField v-model="formData.nombre" label="Nombre" id="nombre"
                placeholder="Ingrese el nombre de la persona" required :error="errors.nombre" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormImageField v-model="formData.imagen" id="imagen" label="Imagen" :error="errors.imagen" required
                targetFolder="waterplast-opiniones" @upload-start="handleImageStart"
                @upload-complete="handleImageComplete" />
            <FormTextField v-model="formData.estrellas" label="Estrellas" id="estrellas"
                placeholder="Ingrese las estrellas (1 al 5)" required :error="errors.estrellas" type="number" step="0.5"
                min="1" max="5" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormSwitch v-model="formData.estado" id="estado" label="Estado" required :error="errors.estado" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextarea v-model="formData.texto" label="Texto" id="texto" placeholder="Ingrese el texto" required
                :error="errors.texto" />
        </FormFieldsContainer>

        <div class="w-full flex flex-col lg:flex-row items-center gap-5 mt-8">
            <ButtonPrimary @click="$emit('cancel')" type="button" class="!bg-gray-mid !text-dark">
                Cancelar
            </ButtonPrimary>

            <ButtonPrimary type="submit" :disabled="submitting">
                <Icon v-if="submitting" name="tabler:loader-2" class="w-4 h-4 animate-spin mr-2" />
                {{ submitting ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Opinión' :
                    'Crear Opinión') }}
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

const formData = reactive({
    titulo: '',
    nombre: '',
    imagen: null,
    estrellas: null,
    estado: false,
    texto: '',
})

const errors = reactive({
    titulo: '',
    nombre: '',
    imagen: '',
    estrellas: '',
    estado: '',
    texto: ''
})

onMounted(() => {
    if (props.isEditing && props.initialData) {
        Object.assign(formData, {
            titulo: props.initialData.titulo || '',
            nombre: props.initialData.nombre || '',
            imagen: props.initialData.imagen || null,
            estrellas: props.initialData.estrellas || null,
            estado: props.initialData.estado !== false,
            texto: props.initialData.texto || '',
        })

        if (props.initialData.imagen) {
            imagePreview.value = props.initialData.imagen
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

    if (!formData.nombre.trim()) {
        errors.nombre = 'El nombre es requerido'
        isValid = false
    } else if (formData.nombre.trim().length < 2) {
        errors.nombre = 'El nombre debe tener al menos 2 caracteres'
        isValid = false
    }

    if (typeof formData.estado !== 'boolean') {
        errors.estado = 'El estado debe ser válido'
        isValid = false
    }

    if (!formData.texto.trim()) {
        errors.texto = 'El texto es requerido'
        isValid = false
    } else if (formData.texto.trim().length < 10) {
        errors.texto = 'El texto debe tener al menos 10 caracteres'
        isValid = false
    }

    const estrellas = parseFloat(formData.estrellas)
    if (!estrellas || estrellas < 1 || estrellas > 5) {
        errors.estrellas = 'La valoración debe ser un número entre 1 y 5'
        isValid = false
    }


    if (!props.isEditing && !imagen.value) {
        errors.imagen = 'La imagen es requerida'
        isValid = false
    } else if (props.isEditing && !imagen.value && !imagePreview.value) {
        errors.imagen = 'La imagen es requerida'
        isValid = false
    }

    return isValid
}

const handleSubmit = async () => {
    if (!validateForm()) {
        return
    }

    submitting.value = true

    try {
        const opinionData = {
            titulo: formData.titulo.trim(),
            nombre: formData.nombre.trim(),
            estrellas: parseFloat(formData.estrellas),
            estado: formData.estado,
            texto: formData.texto.trim(),
        }

        if (props.isEditing && !imagen.value) {
            opinionData.imagen = formData.imagen
        }

        emit('submit', {
            opinionData,
            imagen: imagen.value
        })

    } catch (error) {
        console.error('Error in form submission:', error)
        errors.general = 'Error al procesar el formulario'
    } finally {
        submitting.value = false
    }
}
</script>