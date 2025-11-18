<template>
    <FormLayout @submit.prevent="handleSubmit" class="w-full">
        <FormFieldsContainer>
            <FormTextField v-model="formData.nombre" label="Nombre" id="nombre"
                placeholder="Ingrese el nombre del producto" required :error="errors.nombre" />
            <FormSelect v-model="formData.categoria_id" label="Categoría" id="categoria_id" required
                :error="errors.categoria_id" :options="categoriasOptions" placeholder="Seleccione una categoría" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextarea v-model="formData.descripcion" label="Descripción" id="descripcion"
                placeholder="Ingrese la descripción del producto" required :error="errors.descripcion" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormImageField v-model="formData.imagen" id="imagen" label="Imagen" :error="errors.imagen" required
                targetFolder="rohermet-productos" @upload-start="handleImagenStart"
                @upload-complete="handleImagenComplete" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormFileField v-model="formData.render_3d" id="render_3d" label="Render 3D (.zip)"
                :error="errors.render_3d" :acceptedTypes="['zip']" targetFolder="rohermet-productos"
                @upload-start="handleRender3dStart" @upload-complete="handleRender3dComplete" />
            <FormFileField v-model="formData.archivo_html" id="archivo_html" label="Archivo HTML"
                :error="errors.archivo_html" :acceptedTypes="['html']" targetFolder="rohermet-productos"
                @upload-start="handleArchivoHtmlStart" @upload-complete="handleArchivoHtmlComplete" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormFileField v-model="formData.xr_images_folder" id="xr_images_folder" label="Carpeta XR (.zip)"
                :error="errors.xr_images_folder" :acceptedTypes="['zip']" targetFolder="rohermet-productos"
                @upload-start="handleXrImagesFolderStart" @upload-complete="handleXrImagesFolderComplete" />
            <FormSwitch v-model="formData.estado" id="estado" label="Estado" required :error="errors.estado" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.altura_cm" label="Altura (cm)" id="altura_cm" type="number"
                placeholder="Ingrese la altura en centímetros" :error="errors.altura_cm" @keydown="preventInvalidNumber" />
            <FormTextField v-model="formData.ancho_cm" label="Ancho (cm)" id="ancho_cm" type="number"
                placeholder="Ingrese el ancho en centímetros" :error="errors.ancho_cm" @keydown="preventInvalidNumber" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.largo_cm" label="Largo (cm)" id="largo_cm" type="number"
                placeholder="Ingrese el largo en centímetros" :error="errors.largo_cm" @keydown="preventInvalidNumber" />
            <FormTextField v-model="formData.diametro_cm" label="Diámetro (cm)" id="diametro_cm" type="number"
                placeholder="Ingrese el diámetro en centímetros" :error="errors.diametro_cm" @keydown="preventInvalidNumber" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.capacidad_lts" label="Capacidad (lts)" id="capacidad_lts" type="number"
                placeholder="Ingrese la capacidad en litros" :error="errors.capacidad_lts" @keydown="preventInvalidNumber" />
            <FormSelect v-model="formData.orientacion" label="Orientación" id="orientacion" :error="errors.orientacion"
                :options="orientacionOptions" placeholder="Seleccione orientación" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormSelect v-model="formData.color" label="Color" id="color" :error="errors.color" :options="colorOptions"
                placeholder="Seleccione color" />
            <FormSelect v-model="formData.tecnologia" label="Tecnología" id="tecnologia" :error="errors.tecnologia"
                :options="tecnologiaOptions" placeholder="Seleccione tecnología" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormSelect v-model="formData.opcion" label="Opción" id="opcion" :error="errors.opcion"
                :options="opcionOptions" placeholder="Seleccione opción" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextarea v-model="formData.ficha_tecnica" label="Ficha Técnica" id="ficha_tecnica"
                placeholder="Ingrese la ficha técnica del producto" :error="errors.ficha_tecnica" />
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
import { useRohermetCategorias } from '~/composables/rohermet/useCategorias.js'
import { useRohermetProductos } from '~/composables/rohermet/useProductos.js'

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

const submitting = ref(false)
const imagen = ref(null)
const render3d = ref(null)
const archivoHtml = ref(null)
const xrImagesFolder = ref(null)

const { categorias, fetchCategorias } = useRohermetCategorias()

const categoriasOptions = computed(() => {
    return categorias.value.map(categoria => ({
        value: categoria.id.toString(),
        label: categoria.nombre
    }))
})

const orientacionOptions = [
    { value: 'Vertical', label: 'Vertical' },
    { value: 'Horizontal', label: 'Horizontal' },
    { value: 'No aplica', label: 'No aplica' }
]

const colorOptions = [
    { value: 'Gris', label: 'Gris' },
    { value: 'Blanco', label: 'Blanco' },
    { value: 'Negro', label: 'Negro' },
    { value: 'Naranja', label: 'Naranja' }
]

const tecnologiaOptions = [
    { value: 'Soldadura', label: 'Soldadura' }
]

const opcionOptions = [
    { value: 'Para exteriores', label: 'Para exteriores' },
    { value: 'Para interiores', label: 'Para interiores' }
]

const formData = reactive({
    nombre: '',
    categoria_id: '',
    descripcion: '',
    imagen: null,
    render_3d: null,
    archivo_html: null,
    xr_images_folder: null,
    estado: true,
    altura_cm: null,
    ancho_cm: null,
    largo_cm: null,
    diametro_cm: null,
    capacidad_lts: null,
    orientacion: '',
    color: '',
    tecnologia: '',
    opcion: '',
    ficha_tecnica: ''
})

const errors = reactive({
    nombre: '',
    categoria_id: '',
    descripcion: '',
    imagen: '',
    render_3d: '',
    archivo_html: '',
    xr_images_folder: '',
    estado: '',
    altura_cm: '',
    ancho_cm: '',
    largo_cm: '',
    diametro_cm: '',
    capacidad_lts: '',
    orientacion: '',
    color: '',
    tecnologia: '',
    opcion: '',
    ficha_tecnica: ''
})

watch(() => props.initialData, async (newData) => {
    if (props.isEditing && newData) {
        Object.assign(formData, {
            nombre: newData.nombre || '',
            categoria_id: newData.categoria_id || '',
            descripcion: newData.descripcion || '',
            imagen: newData.imagen || null,
            render_3d: newData.render_3d || null,
            archivo_html: newData.archivo_html || null,
            xr_images_folder: newData.xr_images_folder || null,
            estado: newData.estado !== false,
            altura_cm: newData.altura_cm ?? null,
            ancho_cm: newData.ancho_cm ?? null,
            largo_cm: newData.largo_cm ?? null,
            diametro_cm: newData.diametro_cm ?? null,
            capacidad_lts: newData.capacidad_lts ?? null,
            orientacion: newData.orientacion || '',
            color: newData.color || '',
            tecnologia: newData.tecnologia || '',
            opcion: newData.opcion || '',
            ficha_tecnica: newData.ficha_tecnica || ''
        })
    }
}, { immediate: true, deep: true })

onMounted(async () => {
    try {
        await fetchCategorias()
    } catch (error) {
        console.error('Error al cargar categorías:', error)
    }
})

const preventInvalidNumber = (event) => {
    if (event.key === '-' || event.key === '+' || event.key === 'e' || event.key === 'E') {
        event.preventDefault()
    }
}

const handleImagenStart = (file) => {
    imagen.value = file
    errors.imagen = ''
}

const handleImagenComplete = () => {
    errors.imagen = ''
}

const handleRender3dStart = (file) => {
    render3d.value = file
    errors.render_3d = ''
}

const handleRender3dComplete = () => {
    errors.render_3d = ''
}

const handleArchivoHtmlStart = (file) => {
    archivoHtml.value = file
    errors.archivo_html = ''
}

const handleArchivoHtmlComplete = () => {
    errors.archivo_html = ''
}

const handleXrImagesFolderStart = (file) => {
    xrImagesFolder.value = file
    errors.xr_images_folder = ''
}

const handleXrImagesFolderComplete = () => {
    errors.xr_images_folder = ''
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

    if (!formData.categoria_id) {
        errors.categoria_id = 'La categoría es requerida'
        isValid = false
    }

    if (!formData.descripcion.trim()) {
        errors.descripcion = 'La descripción es requerida'
        isValid = false
    }

    if (!imagen.value && !formData.imagen) {
        errors.imagen = 'La imagen es requerida'
        isValid = false
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
        const productoData = {
            nombre: formData.nombre.trim(),
            categoria_id: parseInt(formData.categoria_id),
            descripcion: formData.descripcion.trim(),
            estado: formData.estado,
            altura_cm: formData.altura_cm ? parseFloat(formData.altura_cm) : null,
            ancho_cm: formData.ancho_cm ? parseFloat(formData.ancho_cm) : null,
            largo_cm: formData.largo_cm ? parseFloat(formData.largo_cm) : null,
            diametro_cm: formData.diametro_cm ? parseFloat(formData.diametro_cm) : null,
            capacidad_lts: formData.capacidad_lts ? parseFloat(formData.capacidad_lts) : null,
            orientacion: formData.orientacion || null,
            color: formData.color || null,
            tecnologia: formData.tecnologia || null,
            opcion: formData.opcion || null,
            ficha_tecnica: formData.ficha_tecnica.trim() || null
        }

        if (props.isEditing) {
            if (!imagen.value) productoData.imagen = formData.imagen
            if (!render3d.value) productoData.render_3d = formData.render_3d
            if (!archivoHtml.value) productoData.archivo_html = formData.archivo_html
            if (!xrImagesFolder.value) productoData.xr_images_folder = formData.xr_images_folder
        }

        emit('submit', {
            productoData,
            archivos: {
                imagen: imagen.value,
                render3d: render3d.value,
                archivoHtml: archivoHtml.value,
                xrImagesFolder: xrImagesFolder.value
            }
        })

    } catch (error) {
        errors.general = 'Error al procesar el formulario'
    } finally {
        submitting.value = false
    }
}
</script>