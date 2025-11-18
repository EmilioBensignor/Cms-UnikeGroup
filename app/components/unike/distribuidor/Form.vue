<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormTextField v-model="formData.nombreComercio" label="Nombre del Comercio" id="nombreComercio"
                placeholder="Ingrese el nombre del comercio" required :error="errors.nombreComercio" />

            <FormTextField v-model="formData.calle" label="Calle" id="calle"
                placeholder="Ingrese la dirección" required :error="errors.calle" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.provincia" label="Provincia" id="provincia"
                placeholder="Ingrese la provincia" required :error="errors.provincia" />

            <FormTextField v-model="formData.localidad" label="Localidad" id="localidad"
                placeholder="Ingrese la localidad" required :error="errors.localidad" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.latitud" label="Latitud (Google Maps)" id="latitud"
                placeholder="Ej: -34.6037 (usar punto, no coma)" :error="errors.latitud" required type="text" />

            <FormTextField v-model="formData.longitud" label="Longitud (Google Maps)" id="longitud"
                placeholder="Ej: -58.3816 (usar punto, no coma)" :error="errors.longitud" required type="text" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormSwitch v-model="formData.estado" id="estado" label="Estado" required :error="errors.estado" />
        </FormFieldsContainer>

        <div class="w-full flex flex-col lg:flex-row items-center gap-5 mt-8">
            <ButtonPrimary @click="$emit('cancel')" type="button" class="!bg-gray-mid !text-dark">
                Cancelar
            </ButtonPrimary>

            <ButtonPrimary type="submit" :disabled="submitting">
                <Icon v-if="submitting" name="tabler:loader-2" class="w-4 h-4 animate-spin mr-2" />
                {{ submitting ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Distribuidor' :
                    'Crear Distribuidor') }}
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

const formData = reactive({
    nombreComercio: '',
    calle: '',
    provincia: '',
    localidad: '',
    latitud: '',
    longitud: '',
    estado: true,
})

const errors = reactive({
    nombreComercio: '',
    calle: '',
    provincia: '',
    localidad: '',
    latitud: '',
    longitud: '',
    estado: ''
})

onMounted(() => {
    if (props.isEditing && props.initialData) {
        Object.assign(formData, {
            nombreComercio: props.initialData.nombreComercio || '',
            calle: props.initialData.calle || '',
            provincia: props.initialData.provincia || '',
            localidad: props.initialData.localidad || '',
            latitud: props.initialData.latitud != null ? String(props.initialData.latitud) : '',
            longitud: props.initialData.longitud != null ? String(props.initialData.longitud) : '',
            estado: props.initialData.estado !== false,
        })
    }
})

const validateForm = () => {
    Object.keys(errors).forEach(key => {
        errors[key] = ''
    })

    let isValid = true

    if (!formData.nombreComercio.trim()) {
        errors.nombreComercio = 'El nombre del comercio es requerido'
        isValid = false
    } else if (formData.nombreComercio.trim().length < 3) {
        errors.nombreComercio = 'El nombre del comercio debe tener al menos 3 caracteres'
        isValid = false
    }

    if (!formData.calle.trim()) {
        errors.calle = 'La calle es requerida'
        isValid = false
    } else if (formData.calle.trim().length < 3) {
        errors.calle = 'La calle debe tener al menos 3 caracteres'
        isValid = false
    }

    if (!formData.provincia.trim()) {
        errors.provincia = 'La provincia es requerida'
        isValid = false
    } else if (formData.provincia.trim().length < 2) {
        errors.provincia = 'La provincia debe tener al menos 2 caracteres'
        isValid = false
    }

    if (!formData.localidad.trim()) {
        errors.localidad = 'La localidad es requerida'
        isValid = false
    } else if (formData.localidad.trim().length < 2) {
        errors.localidad = 'La localidad debe tener al menos 2 caracteres'
        isValid = false
    }

    if (formData.latitud && String(formData.latitud).trim() !== '') {
        const lat = parseFloat(formData.latitud)
        if (isNaN(lat)) {
            errors.latitud = 'La latitud debe ser un número válido'
            isValid = false
        }
    }

    if (formData.longitud && String(formData.longitud).trim() !== '') {
        const lng = parseFloat(formData.longitud)
        if (isNaN(lng)) {
            errors.longitud = 'La longitud debe ser un número válido'
            isValid = false
        }
    }

    if (typeof formData.estado !== 'boolean') {
        errors.estado = 'El estado debe ser válido'
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
        const distribuidorData = {
            nombreComercio: formData.nombreComercio.trim(),
            calle: formData.calle.trim(),
            provincia: formData.provincia.trim(),
            localidad: formData.localidad.trim(),
            latitud: String(formData.latitud).trim() ? parseFloat(formData.latitud) : null,
            longitud: String(formData.longitud).trim() ? parseFloat(formData.longitud) : null,
            estado: formData.estado,
        }

        emit('submit', distribuidorData)

    } catch (error) {
        console.error('Error in form submission:', error)
        errors.general = 'Error al procesar el formulario'
    } finally {
        submitting.value = false
    }
}
</script>