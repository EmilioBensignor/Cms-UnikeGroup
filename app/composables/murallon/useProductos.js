export const useMurallonProductos = () => {
    const supabase = useSupabaseClient()
    const {
        uploadMurallonProductoImage,
        deleteMurallonProductoImage,
        getMurallonProductoImageUrl
    } = useStorage()
    const loading = ref(false)
    const productos = ref([])
    const currentProducto = ref(null)
    const error = ref(null)

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
                imagen_principal_path: data.imagen_principal
            }

            return currentProducto.value
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const createProducto = async (productoData, imagenFile) => {
        loading.value = true
        error.value = null

        try {
            let imagenPath = null

            if (imagenFile) {
                imagenPath = await uploadMurallonProductoImage(imagenFile, productoData.nombre)
            }

            const { data, error: supabaseError } = await supabase
                .from('murallon-productos')
                .insert([{
                    nombre: productoData.nombre,
                    imagen_principal: imagenPath,
                    uso: productoData.uso,
                    tamanos_disponibles: productoData.tamanos_disponibles,
                    tipos_aplicacion_id: productoData.tipos_aplicacion_id,
                    categorias_id: productoData.categorias_id,
                    rendimiento: productoData.rendimiento,
                    destacado: productoData.destacado
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

    const updateProducto = async (id, productoData, imagenFile) => {
        loading.value = true
        error.value = null

        try {
            const { data: currentData, error: fetchError } = await supabase
                .from('murallon-productos')
                .select('imagen_principal')
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

            const { data, error: supabaseError } = await supabase
                .from('murallon-productos')
                .update({
                    nombre: productoData.nombre,
                    imagen_principal: imagenPath,
                    uso: productoData.uso,
                    tamanos_disponibles: productoData.tamanos_disponibles,
                    tipos_aplicacion_id: productoData.tipos_aplicacion_id,
                    categorias_id: productoData.categorias_id,
                    rendimiento: productoData.rendimiento,
                    destacado: productoData.destacado
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
                .select('imagen_principal')
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
