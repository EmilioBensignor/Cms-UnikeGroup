<template>
    <FormLayout @submit.prevent="handleSubmit" class="w-full">
        <FormFieldsContainer>
            <FormTextField v-model="formData.nombre" label="Nombre" id="nombre"
                placeholder="Ingrese el nombre del producto" required :error="errors.nombre" />
            <FormSelect v-model="formData.categoria_id" label="Categoría" id="categoria_id" required
                :error="errors.categoria_id" :options="categoriasOptions" placeholder="Seleccione una categoría" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormSelect v-model="formData.subcategoria_id" label="Subcategoría" id="subcategoria_id"
                :error="errors.subcategoria_id" :options="subcategoriasOptions"
                placeholder="Seleccione una subcategoría" />
            <FormImageField v-model="formData.imagen" id="imagen" label="Imagen (450px x 380px)" :error="errors.imagen"
                required :acceptedTypes="['webp']" targetFolder="waterplast-productos" @upload-start="handleImagenStart"
                @upload-complete="handleImagenComplete" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextarea v-model="formData.descripcion" label="Descripción" id="descripcion"
                placeholder="Ingrese la descripción del producto" required :error="errors.descripcion" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormFileField v-model="formData.ficha_tecnica" id="ficha_tecnica" label="Ficha Técnica"
                :error="errors.ficha_tecnica" :acceptedTypes="['pdf']" targetFolder="waterplast-productos"
                @upload-start="handleFichaTecnicaStart" @upload-complete="handleFichaTecnicaComplete"
                @file-removed="() => removedFiles.fichaTecnica = true" />
            <FormFileField v-model="formData.manual_instalacion" id="manual_instalacion" label="Manual de Instalación"
                :error="errors.manual_instalacion" :acceptedTypes="['pdf']" targetFolder="waterplast-productos"
                @upload-start="handleManualInstalacionStart" @upload-complete="handleManualInstalacionComplete"
                @file-removed="() => removedFiles.manualInstalacion = true" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormFileField v-model="formData.archivo_html" id="archivo_html" label="Archivo .html para 3D"
                :error="errors.archivo_html" :acceptedTypes="['html']" targetFolder="waterplast-productos"
                @upload-start="handleArchivoHtmlStart" @upload-complete="handleArchivoHtmlComplete"
                @file-removed="() => removedFiles.archivoHtml = true" />
            <FormFileField v-model="formData.render_3d" id="render_3d" label="Carpeta .zip con imágenes para 3D"
                :error="errors.render_3d" :acceptedTypes="['zip']" targetFolder="waterplast-productos"
                @upload-start="handleRender3dStart" @upload-complete="handleRender3dComplete"
                @file-removed="() => removedFiles.render3d = true" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormSwitch v-model="formData.estado" id="estado" label="Estado" required :error="errors.estado" />
            <FormSelect v-model="formData.opcion" label="Opción" id="opcion" :error="errors.opcion"
                :options="opcionOptions" placeholder="Seleccione opción" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.altura_cm" label="Altura (cm)" id="altura_cm" type="number"
                placeholder="Ingrese la altura en centímetros" :error="errors.altura_cm"
                @keydown="preventInvalidNumber" />
            <FormTextField v-model="formData.ancho_cm" label="Ancho (cm)" id="ancho_cm" type="number"
                placeholder="Ingrese el ancho en centímetros" :error="errors.ancho_cm"
                @keydown="preventInvalidNumber" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.largo_cm" label="Largo (cm)" id="largo_cm" type="number"
                placeholder="Ingrese el largo en centímetros" :error="errors.largo_cm"
                @keydown="preventInvalidNumber" />
            <FormTextField v-model="formData.diametro_cm" label="Diámetro (cm)" id="diametro_cm" type="number"
                placeholder="Ingrese el diámetro en centímetros" :error="errors.diametro_cm"
                @keydown="preventInvalidNumber" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.capacidad_lts" label="Capacidad (lts)" id="capacidad_lts" type="number"
                placeholder="Ingrese la capacidad en litros" :error="errors.capacidad_lts"
                @keydown="preventInvalidNumber" />
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
            <FormTextField v-model="formData.caracteristica1" label="Característica 1" id="caracteristica1"
                placeholder="Ingrese la primera característica" required :error="errors.caracteristica1" />
            <FormImageField v-model="formData.icono1" id="icono1" label="Icono 1 (48px x 48px)" :error="errors.icono1"
                required :acceptedTypes="['webp']" targetFolder="waterplast-productos" @upload-start="handleIconStart1"
                @upload-complete="handleIconComplete1" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.caracteristica2" label="Característica 2" id="caracteristica2"
                placeholder="Ingrese la segunda característica" :error="errors.caracteristica2" />
            <FormImageField v-model="formData.icono2" id="icono2" label="Icono 2 (48px x 48px)" :error="errors.icono2"
                :acceptedTypes="['webp']" targetFolder="waterplast-productos" @upload-start="handleIconStart2"
                @upload-complete="handleIconComplete2" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.caracteristica3" label="Característica 3" id="caracteristica3"
                placeholder="Ingrese la tercera característica" :error="errors.caracteristica3" />
            <FormImageField v-model="formData.icono3" id="icono3" label="Icono 3 (48px x 48px)" :error="errors.icono3"
                :acceptedTypes="['webp']" targetFolder="waterplast-productos" @upload-start="handleIconStart3"
                @upload-complete="handleIconComplete3" />
        </FormFieldsContainer>

        <div v-if="formData.categoria_id && productosRelacionados.length > 0" class="w-full flex flex-col gap-2">
            <FormLabel>Productos Relacionados</FormLabel>
            <FormCheckboxGroupField v-model="formData.productos_relacionados" id="productos_relacionados"
                :options="productosRelacionados" :error="errors.productos_relacionados" />
        </div>

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
import { useWaterplastCategorias } from '~/composables/waterplast/useCategorias.js'
import { useWaterplastSubcategorias } from '~/composables/waterplast/useSubcategorias.js'
import { useWaterplastProductos } from '~/composables/waterplast/useProductos.js'

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
    },
    preserveData: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['submit', 'cancel'])

const submitting = ref(false)
const imagen = ref(null)
const render3d = ref(null)
const fichaTecnica = ref(null)
const manualInstalacion = ref(null)
const archivoHtml = ref(null)
const icono1 = ref(null)
const icono2 = ref(null)
const icono3 = ref(null)

const removedFiles = reactive({
    render3d: false,
    fichaTecnica: false,
    manualInstalacion: false,
    archivoHtml: false
})

const { categorias, fetchCategorias } = useWaterplastCategorias()
const { fetchSubcategoriasByCategoria } = useWaterplastSubcategorias()
const { fetchProductosByCategoria } = useWaterplastProductos()

const productosRelacionados = ref([])
const subcategorias = ref([])

const categoriasOptions = computed(() => {
    return categorias.value.map(categoria => ({
        value: categoria.id.toString(),
        label: categoria.nombre
    }))
})

const subcategoriasOptions = computed(() => {
    return subcategorias.value.map(subcategoria => ({
        value: subcategoria.id.toString(),
        label: subcategoria.nombre
    }))
})

const orientacionOptions = [
    { value: 'vertical', label: 'Vertical' },
    { value: 'horizontal', label: 'Horizontal' },
    { value: 'ninguna', label: 'Ninguna' }
]

const colorOptions = [
    { value: 'arena', label: 'Arena' },
    { value: 'negro', label: 'Negro' },
    { value: 'celeste', label: 'Celeste' },
    { value: 'gris', label: 'Gris' },
    { value: 'blanco', label: 'Blanco' },
    { value: 'rojo', label: 'Rojo' },
    { value: 'azul', label: 'Azul' },
    { value: 'verde', label: 'Verde' },
    { value: 'naranja', label: 'Naranja' },
]

const tecnologiaOptions = [
    { value: 'soplado', label: 'Soplado' },
    { value: 'rotomoldeo', label: 'Rotomoldeo' },
    { value: 'soldadura', label: 'Soldadura' },
    { value: 'inyeccion', label: 'Inyección' }
]

const opcionOptions = [
    { value: 'para_exteriores', label: 'Para Exteriores' },
    { value: 'es_cisterna', label: 'Es cisterna' },
    { value: 'ninguna', label: 'Ninguna' },
]

const formData = reactive({
    nombre: '',
    categoria_id: '',
    subcategoria_id: '',
    descripcion: '',
    imagen: null,
    render_3d: null,
    ficha_tecnica: null,
    manual_instalacion: null,
    archivo_html: null,
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
    caracteristica1: '',
    icono1: null,
    caracteristica2: '',
    icono2: null,
    caracteristica3: '',
    icono3: null,
    productos_relacionados: []
})

const errors = reactive({
    nombre: '',
    categoria_id: '',
    subcategoria_id: '',
    descripcion: '',
    imagen: '',
    render_3d: '',
    ficha_tecnica: '',
    manual_instalacion: '',
    archivo_html: '',
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
    caracteristica1: '',
    icono1: '',
    caracteristica2: '',
    icono2: '',
    caracteristica3: '',
    icono3: '',
    productos_relacionados: ''
})

watch(() => formData.categoria_id, async (newCategoriaId, oldCategoriaId) => {
    if (newCategoriaId) {
        try {
            const subcategoriasData = await fetchSubcategoriasByCategoria(newCategoriaId)
            subcategorias.value = subcategoriasData

            if (oldCategoriaId && oldCategoriaId !== newCategoriaId) {
                formData.subcategoria_id = ''
            }

            const productos = await fetchProductosByCategoria(newCategoriaId)

            const filteredProductos = props.isEditing && props.initialData?.id
                ? productos.filter(p => p.id !== props.initialData.id)
                : productos

            productosRelacionados.value = filteredProductos.map(p => ({
                value: p.id,
                label: p.nombre
            }))

        } catch (error) {
            subcategorias.value = []
            productosRelacionados.value = []
        }
    } else {
        subcategorias.value = []
        formData.subcategoria_id = ''
        productosRelacionados.value = []
        formData.productos_relacionados = []
    }
})

watch(() => props.initialData, async (newData) => {
    if (props.isEditing && newData) {
        Object.assign(formData, {
            nombre: newData.nombre || '',
            categoria_id: newData.categoria_id || '',
            subcategoria_id: newData.subcategoria_id || '',
            descripcion: newData.descripcion || '',
            imagen: newData.imagen || null,
            render_3d: newData.render_3d || null,
            ficha_tecnica: newData.ficha_tecnica || null,
            manual_instalacion: newData.manual_instalacion || null,
            archivo_html: newData.archivo_html || null,
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
            caracteristica1: newData.caracteristica1 || '',
            icono1: newData.icono1 || null,
            caracteristica2: newData.caracteristica2 || '',
            icono2: newData.icono2 || null,
            caracteristica3: newData.caracteristica3 || '',
            icono3: newData.icono3 || null,
            productos_relacionados: newData.productos_relacionados || []
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

const handleFichaTecnicaStart = (file) => {
    fichaTecnica.value = file
    errors.ficha_tecnica = ''
}

const handleFichaTecnicaComplete = () => {
    errors.ficha_tecnica = ''
}

const handleManualInstalacionStart = (file) => {
    manualInstalacion.value = file
    errors.manual_instalacion = ''
}

const handleManualInstalacionComplete = () => {
    errors.manual_instalacion = ''
}

const handleArchivoHtmlStart = (file) => {
    archivoHtml.value = file
    errors.archivo_html = ''
}

const handleArchivoHtmlComplete = () => {
    errors.archivo_html = ''
}

const handleIconStart1 = (file) => {
    icono1.value = file
    errors.icono1 = ''
}

const handleIconComplete1 = () => {
    errors.icono1 = ''
}

const handleIconStart2 = (file) => {
    icono2.value = file
    errors.icono2 = ''
}

const handleIconComplete2 = () => {
    errors.icono2 = ''
}

const handleIconStart3 = (file) => {
    icono3.value = file
    errors.icono3 = ''
}

const handleIconComplete3 = () => {
    errors.icono3 = ''
}

const preventInvalidNumber = (event) => {
    if (['e', 'E', '+', '-'].includes(event.key)) {
        event.preventDefault()
    }
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

    if (!formData.caracteristica1.trim()) {
        errors.caracteristica1 = 'La característica 1 es requerida'
        isValid = false
    }

    if (!icono1.value && !formData.icono1) {
        errors.icono1 = 'El icono 1 es requerido'
        isValid = false
    }

    if (formData.caracteristica2.trim() && !icono2.value && !formData.icono2) {
        errors.icono2 = 'El icono 2 es requerido cuando se ingresa la característica 2'
        isValid = false
    }

    if (!formData.caracteristica2.trim() && (icono2.value || formData.icono2)) {
        errors.caracteristica2 = 'La característica 2 es requerida cuando se ingresa el icono 2'
        isValid = false
    }

    if (formData.caracteristica3.trim() && !icono3.value && !formData.icono3) {
        errors.icono3 = 'El icono 3 es requerido cuando se ingresa la característica 3'
        isValid = false
    }

    if (!formData.caracteristica3.trim() && (icono3.value || formData.icono3)) {
        errors.caracteristica3 = 'La característica 3 es requerida cuando se ingresa el icono 3'
        isValid = false
    }

    if (!isValid) {
        return
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
            categoria_id: formData.categoria_id,
            subcategoria_id: formData.subcategoria_id || null,
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
            caracteristica1: formData.caracteristica1.trim() || null,
            caracteristica2: formData.caracteristica2.trim() || null,
            caracteristica3: formData.caracteristica3.trim() || null,
            productos_relacionados: formData.productos_relacionados || []
        }

        if (props.isEditing) {
            if (!imagen.value) productoData.imagen = formData.imagen

            if (removedFiles.render3d) {
                productoData.render_3d = null
            } else if (!render3d.value) {
                productoData.render_3d = formData.render_3d
            }

            if (removedFiles.fichaTecnica) {
                productoData.ficha_tecnica = null
            } else if (!fichaTecnica.value) {
                productoData.ficha_tecnica = formData.ficha_tecnica
            }

            if (removedFiles.manualInstalacion) {
                productoData.manual_instalacion = null
            } else if (!manualInstalacion.value) {
                productoData.manual_instalacion = formData.manual_instalacion
            }

            if (removedFiles.archivoHtml) {
                productoData.archivo_html = null
            } else if (!archivoHtml.value) {
                productoData.archivo_html = formData.archivo_html
            }

            if (!icono1.value) productoData.icono1 = formData.icono1
            if (!icono2.value) productoData.icono2 = formData.icono2
            if (!icono3.value) productoData.icono3 = formData.icono3
        }

        emit('submit', {
            productoData,
            archivos: {
                imagen: imagen.value,
                render3d: render3d.value,
                fichaTecnica: fichaTecnica.value,
                manualInstalacion: manualInstalacion.value,
                archivoHtml: archivoHtml.value
            },
            iconos: {
                icono1: icono1.value,
                icono2: icono2.value,
                icono3: icono3.value
            }
        })

    } catch (error) {
        errors.general = 'Error al procesar el formulario'
    } finally {
        submitting.value = false
    }
}

defineExpose({
    handleSubmit
})
</script>