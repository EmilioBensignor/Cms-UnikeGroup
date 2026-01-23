<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormTextField v-model="formData.orden" label="Número de Orden" id="orden" type="number"
                placeholder="Ingrese el número de orden" required :error="errors.orden" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormImageField v-model="formData.imagen" label="Imagen de Categoría" id="imagen"
                :error="errors.imagen" :current-image="initialData?.imagen" />
        </FormFieldsContainer>

        <div class="w-full flex flex-col lg:flex-row items-center gap-5 mt-8">
            <ButtonPrimary @click="$emit('cancel')" type="button" class="!bg-gray-mid !text-dark">
                Cancelar
            </ButtonPrimary>

            <ButtonPrimary type="submit" :disabled="submitting">
                <Icon v-if="submitting" name="tabler:loader-2" class="w-4 h-4 animate-spin mr-2" />
                {{ submitting ? 'Actualizando...' : 'Actualizar Categoría' }}
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

const formData = reactive({
    orden: 0,
    imagen: null,
})

const errors = reactive({
    orden: '',
    imagen: ''
})

watch(() => props.initialData, async (newData) => {
    if (props.isEditing && newData) {
        Object.assign(formData, {
            orden: newData.orden || 0,
            imagen: null,
        })
    }
}, { immediate: true, deep: true })

const validateForm = () => {
    Object.keys(errors).forEach(key => {
        errors[key] = ''
    })

    let isValid = true

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
        const categoriaData = {
            orden: parseInt(formData.orden),
        }

        emit('submit', {
            categoriaData,
            imagenes: {
                imagen: formData.imagen
            }
        })

    } catch (error) {
        errors.general = 'Error al procesar el formulario'
    } finally {
        submitting.value = false
    }
}
</script>