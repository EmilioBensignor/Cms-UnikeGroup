export const useMurallonProductos = () => {
    const supabase = useSupabaseClient()
    const {
        uploadMurallonProductoImage,
        deleteMurallonProductoImage,
        getMurallonProductoImageUrl,
        uploadMurallonProductoFile,
        deleteMurallonProductoFile,
        getMurallonProductoFileUrl,
        uploadProductoGaleriaImagenes,
        deleteProductoGaleriaImagen,
        getProductoGaleriaImageUrl
    } = useStorage()
    const loading = ref(false)
    const productos = ref([])
    const currentProducto = ref(null)
    const error = ref(null)

    const generateSlug = (titulo) => {
        return titulo.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/^-+|-+$/g, '')
    }

    const buildTextFields = (data) => ({
        slug: generateSlug(data.nombre),
        descripcion: data.descripcion || null,
        usos: data.usos || null,
        colores: data.colores || null,
        acabado: data.acabado || null,
        poder_cubritivo: data.poder_cubritivo || null,
        rendimiento_caracteristicas: data.rendimiento_caracteristicas || null,
        consistencia_o_viscocidad: data.consistencia_o_viscocidad || null,
        secado: data.secado || null,
        peso_especifico: data.peso_especifico || null,
        modo_de_empleo: data.modo_de_empleo || null,
        aplicacion: data.aplicacion || null,
        recomendaciones_generales: data.recomendaciones_generales || null,
        recomendaciones_seguridad: data.recomendaciones_seguridad || null,
        notas_legales: data.notas_legales || null,
    })

    const fetchProductos = async () => {
        loading.value = true
        error.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('murallon-productos')
                .select(`
                    *,
                    categoria:categorias_id(id, nombre),
                    tipo_aplicacion:tipos_aplicacion_id(id, nombre)
                `)
                .order('nombre', { ascending: true })

            if (supabaseError) throw supabaseError

            const productosWithUrls = (data || []).map(producto => ({
                ...producto,
                imagen_principal: producto.imagen_principal ? getMurallonProductoImageUrl(producto.imagen_principal, true) : null,
                imagen_principal_path: producto.imagen_principal,
                categoria_nombre: producto.categoria?.nombre || '',
                tipo_aplicacion_nombre: producto.tipo_aplicacion?.nombre || ''
            }))

            productos.value = productosWithUrls
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const fetchProductoById = async (id) => {
        loading.value = true
        error.value = null
        currentProducto.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('murallon-productos')
                .select(`
                    *,
                    categoria:categorias_id(id, nombre),
                    tipo_aplicacion:tipos_aplicacion_id(id, nombre)
                `)
                .eq('id', id)
                .single()

            if (supabaseError) throw supabaseError

            currentProducto.value = {
                ...data,
                imagen_principal: data.imagen_principal ? getMurallonProductoImageUrl(data.imagen_principal, true) : null,
                imagen_principal_path: data.imagen_principal,
                ficha_tecnica: data.ficha_tecnica ? getMurallonProductoFileUrl(data.ficha_tecnica, true) : null,
                ficha_tecnica_path: data.ficha_tecnica,
                galeria: data.galeria_imagenes ?
                    data.galeria_imagenes.map((img, index) => ({
                        id: `galeria-${index}`,
                        name: `imagen-${index + 1}.jpg`,
                        url: getProductoGaleriaImageUrl(img, 'murallon', true),
                        storagePath: img,
                        isExisting: true
                    })) : []
            }

            return currentProducto.value
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const createProducto = async (productoData, imagenFile, fichaTecnicaFile = null, removedFiles = {}, galeria = []) => {
        loading.value = true
        error.value = null

        try {
            let imagenPath = null
            let fichaTecnicaPath = null
            let galeriaPaths = []

            if (imagenFile) {
                imagenPath = await uploadMurallonProductoImage(imagenFile, productoData.nombre)
            }

            if (fichaTecnicaFile) {
                fichaTecnicaPath = await uploadMurallonProductoFile(fichaTecnicaFile, productoData.nombre, 'ficha-tecnica')
            }

            if (galeria && Array.isArray(galeria) && galeria.length > 0) {
                const nuevasImagenes = galeria.filter(img => img.file && !img.isExisting)
                if (nuevasImagenes.length > 0) {
                    galeriaPaths = await uploadProductoGaleriaImagenes(nuevasImagenes, productoData.nombre, 'murallon')
                }
            }

            const { data, error: supabaseError } = await supabase
                .from('murallon-productos')
                .insert([{
                    nombre: productoData.nombre,
                    imagen_principal: imagenPath,
                    ficha_tecnica: fichaTecnicaPath,
                    uso: productoData.uso,
                    tamanos_disponibles: productoData.tamanos_disponibles,
                    tipos_aplicacion_id: productoData.tipos_aplicacion_id,
                    categorias_id: productoData.categorias_id,
                    rendimiento: productoData.rendimiento,
                    destacado: productoData.destacado,
                    codigo_color_card: productoData.codigo_color_card || null,
                    galeria_imagenes: galeriaPaths.length > 0 ? galeriaPaths : null,
                    ...buildTextFields(productoData)
                }])
                .select()

            if (supabaseError) throw supabaseError

            return data[0]
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateProducto = async (id, productoData, imagenFile, fichaTecnicaFile = null, removedFiles = {}, galeria = [], removedImages = []) => {
        loading.value = true
        error.value = null

        try {
            const { data: currentData, error: fetchError } = await supabase
                .from('murallon-productos')
                .select('imagen_principal, ficha_tecnica, galeria_imagenes')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            let imagenPath = currentData.imagen_principal

            if (imagenFile) {
                if (currentData.imagen_principal) {
                    try {
                        await deleteMurallonProductoImage(currentData.imagen_principal)
                    } catch (err) {
                        console.warn('Error al borrar imagen anterior:', err)
                    }
                }
                imagenPath = await uploadMurallonProductoImage(imagenFile, productoData.nombre)
            } else if (productoData.imagen_principal_path !== undefined) {
                imagenPath = productoData.imagen_principal_path
            }

            let fichaTecnicaPath = currentData.ficha_tecnica

            if (fichaTecnicaFile) {
                if (currentData.ficha_tecnica) {
                    try {
                        await deleteMurallonProductoFile(currentData.ficha_tecnica)
                    } catch (err) {
                        console.warn('Error al borrar ficha técnica anterior:', err)
                    }
                }
                fichaTecnicaPath = await uploadMurallonProductoFile(fichaTecnicaFile, productoData.nombre, 'ficha-tecnica')
            } else if (removedFiles.fichaTecnica) {
                if (currentData.ficha_tecnica) {
                    try {
                        await deleteMurallonProductoFile(currentData.ficha_tecnica)
                    } catch (err) {
                        console.warn('Error al borrar ficha técnica:', err)
                    }
                }
                fichaTecnicaPath = null
            }

            if (removedImages && removedImages.length > 0) {
                for (const path of removedImages) {
                    try {
                        await deleteProductoGaleriaImagen(path, 'murallon')
                    } catch (err) {
                        console.warn('Error al borrar imagen de galería:', err)
                    }
                }
            }

            const existingPaths = galeria
                .filter(img => img.isExisting && img.storagePath)
                .map(img => img.storagePath)

            let newPaths = []
            const nuevasImagenes = galeria.filter(img => img.file && !img.isExisting)
            if (nuevasImagenes.length > 0) {
                newPaths = await uploadProductoGaleriaImagenes(nuevasImagenes, productoData.nombre, 'murallon')
            }

            const galeriaPaths = [...existingPaths, ...newPaths]

            const { data, error: supabaseError } = await supabase
                .from('murallon-productos')
                .update({
                    nombre: productoData.nombre,
                    imagen_principal: imagenPath,
                    ficha_tecnica: fichaTecnicaPath,
                    uso: productoData.uso,
                    tamanos_disponibles: productoData.tamanos_disponibles,
                    tipos_aplicacion_id: productoData.tipos_aplicacion_id,
                    categorias_id: productoData.categorias_id,
                    rendimiento: productoData.rendimiento,
                    destacado: productoData.destacado,
                    codigo_color_card: productoData.codigo_color_card || null,
                    galeria_imagenes: galeriaPaths.length > 0 ? galeriaPaths : null,
                    ...buildTextFields(productoData)
                })
                .eq('id', id)
                .select()

            if (supabaseError) throw supabaseError

            return data[0]
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteProducto = async (id) => {
        loading.value = true
        error.value = null

        try {
            const { data: currentData, error: fetchError } = await supabase
                .from('murallon-productos')
                .select('imagen_principal, ficha_tecnica, galeria_imagenes')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            if (currentData.imagen_principal) {
                try {
                    await deleteMurallonProductoImage(currentData.imagen_principal)
                } catch (err) {
                    console.warn('Error al borrar imagen:', err)
                }
            }

            if (currentData.ficha_tecnica) {
                try {
                    await deleteMurallonProductoFile(currentData.ficha_tecnica)
                } catch (err) {
                    console.warn('Error al borrar ficha técnica:', err)
                }
            }

            if (currentData.galeria_imagenes && Array.isArray(currentData.galeria_imagenes)) {
                for (const path of currentData.galeria_imagenes) {
                    try {
                        await deleteProductoGaleriaImagen(path, 'murallon')
                    } catch (err) {
                        console.warn('Error al borrar imagen de galería:', err)
                    }
                }
            }

            const { error: supabaseError } = await supabase
                .from('murallon-productos')
                .delete()
                .eq('id', id)

            if (supabaseError) throw supabaseError

            productos.value = productos.value.filter(p => p.id !== id)
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        loading: readonly(loading),
        productos: readonly(productos),
        currentProducto: readonly(currentProducto),
        error: readonly(error),
        fetchProductos,
        fetchProductoById,
        createProducto,
        updateProducto,
        deleteProducto
    }
}
