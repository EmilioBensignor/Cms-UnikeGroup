export const useRohermetProductos = () => {
    const supabase = useSupabaseClient()
    const {
        uploadProductoImage,
        uploadProductoFile,
        deleteProductoImage,
        deleteProductoFile,
        getProductoImageUrl,
        getProductoFileUrl,
        deleteProductoFolder
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
                .from('rohermet-productos')
                .select(`
                    *,
                    categoria:categoria_id(id, nombre)
                `)
                .order('nombre', { ascending: true })

            if (supabaseError) throw supabaseError

            const productosWithUrls = (data || []).map(producto => ({
                ...producto,
                imagen: producto.imagen ? getProductoImageUrl(producto.imagen, 'rohermet') : null,
                render_3d: producto.render_3d ? getProductoFileUrl(producto.render_3d, 'rohermet') : null,
                archivo_html: producto.archivo_html ? getProductoFileUrl(producto.archivo_html, 'rohermet') : null,
                ficha_tecnica: producto.ficha_tecnica ? getProductoFileUrl(producto.ficha_tecnica, 'rohermet') : null,
                categoria_nombre: producto.categoria?.nombre || ''
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
                .from('rohermet-productos')
                .select(`
                    *,
                    categoria:categoria_id(id, nombre)
                `)
                .eq('id', id)
                .single()

            if (supabaseError) throw supabaseError

            const productoWithUrls = {
                ...data,
                imagen: data.imagen ? getProductoImageUrl(data.imagen, 'rohermet') : null,
                render_3d: data.render_3d ? getProductoFileUrl(data.render_3d, 'rohermet') : null,
                archivo_html: data.archivo_html ? getProductoFileUrl(data.archivo_html, 'rohermet') : null,
                ficha_tecnica: data.ficha_tecnica ? getProductoFileUrl(data.ficha_tecnica, 'rohermet') : null
            }

            currentProducto.value = productoWithUrls
            return productoWithUrls
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const fetchProductosByCategoria = async (categoriaId) => {
        loading.value = true
        error.value = null

        try {
            if (!categoriaId) {
                return []
            }

            const { data, error: supabaseError } = await supabase
                .from('rohermet-productos')
                .select('id, nombre, categoria_id')
                .eq('estado', true)
                .order('nombre', { ascending: true })

            if (supabaseError) throw supabaseError

            const filteredData = (data || []).filter(producto =>
                producto.categoria_id.toString() === categoriaId
            )

            return filteredData
        } catch (err) {
            error.value = err.message
            return []
        } finally {
            loading.value = false
        }
    }

    const createProducto = async (productoData, archivos) => {
        loading.value = true
        error.value = null

        try {
            const productoNombre = productoData.nombre

            let imagenPath = null
            let render3dPath = null
            let archivoHtmlPath = null
            let fichaTecnicaPath = null

            if (archivos.imagen) {
                imagenPath = await uploadProductoImage(archivos.imagen, productoNombre, 'rohermet')
            }

            if (archivos.render3d) {
                render3dPath = await uploadProductoFile(archivos.render3d, productoNombre + '-render3d', 'rohermet')
            }

            if (archivos.archivoHtml) {
                archivoHtmlPath = await uploadProductoFile(archivos.archivoHtml, productoNombre + '-html', 'rohermet')
            }

            if (archivos.fichaTecnica) {
                fichaTecnicaPath = await uploadProductoFile(archivos.fichaTecnica, productoNombre + '-ficha', 'rohermet')
            }

            const finalProductoData = {
                ...productoData,
                imagen: imagenPath,
                render_3d: render3dPath,
                archivo_html: archivoHtmlPath,
                ficha_tecnica: fichaTecnicaPath
            }

            const { data, error: supabaseError } = await supabase
                .from('rohermet-productos')
                .insert(finalProductoData)
                .select()
                .single()

            if (supabaseError) throw supabaseError

            const dataWithUrls = {
                ...data,
                imagen: data.imagen ? getProductoImageUrl(data.imagen, 'rohermet') : null,
                render_3d: data.render_3d ? getProductoFileUrl(data.render_3d, 'rohermet') : null,
                archivo_html: data.archivo_html ? getProductoFileUrl(data.archivo_html, 'rohermet') : null,
                ficha_tecnica: data.ficha_tecnica ? getProductoFileUrl(data.ficha_tecnica, 'rohermet') : null
            }

            productos.value.push(dataWithUrls)

            return dataWithUrls
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateProducto = async (id, productoData, archivos) => {
        loading.value = true
        error.value = null

        try {
            const { data: currentData, error: fetchError } = await supabase
                .from('rohermet-productos')
                .select('nombre, imagen, render_3d, archivo_html, ficha_tecnica')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            const productoNombre = productoData?.nombre || currentData?.nombre || 'producto'

            let imagenPath = currentData?.imagen
            let render3dPath = currentData?.render_3d
            let archivoHtmlPath = currentData?.archivo_html
            let fichaTecnicaPath = currentData?.ficha_tecnica

            if (archivos.imagen) {
                if (currentData?.imagen) {
                    await deleteProductoImage(currentData.imagen, 'rohermet')
                }
                imagenPath = await uploadProductoImage(archivos.imagen, productoNombre, 'rohermet')
            }

            if (archivos.render3d) {
                if (currentData?.render_3d) {
                    await deleteProductoFile(currentData.render_3d, 'rohermet')
                }
                render3dPath = await uploadProductoFile(archivos.render3d, productoNombre + '-render3d', 'rohermet')
            }

            if (archivos.archivoHtml) {
                if (currentData?.archivo_html) {
                    await deleteProductoFile(currentData.archivo_html, 'rohermet')
                }
                archivoHtmlPath = await uploadProductoFile(archivos.archivoHtml, productoNombre + '-html', 'rohermet')
            }

            if (archivos.fichaTecnica) {
                if (currentData?.ficha_tecnica) {
                    await deleteProductoFile(currentData.ficha_tecnica, 'rohermet')
                }
                fichaTecnicaPath = await uploadProductoFile(archivos.fichaTecnica, productoNombre + '-ficha', 'rohermet')
            }

            const finalProductoData = {
                ...productoData,
                imagen: imagenPath,
                render_3d: render3dPath,
                archivo_html: archivoHtmlPath,
                ficha_tecnica: fichaTecnicaPath
            }

            const { data, error: supabaseError } = await supabase
                .from('rohermet-productos')
                .update(finalProductoData)
                .eq('id', id)
                .select()
                .single()

            if (supabaseError) throw supabaseError

            const dataWithUrls = {
                ...data,
                imagen: data.imagen ? getProductoImageUrl(data.imagen, 'rohermet') : null,
                render_3d: data.render_3d ? getProductoFileUrl(data.render_3d, 'rohermet') : null,
                archivo_html: data.archivo_html ? getProductoFileUrl(data.archivo_html, 'rohermet') : null,
                ficha_tecnica: data.ficha_tecnica ? getProductoFileUrl(data.ficha_tecnica, 'rohermet') : null
            }

            const index = productos.value.findIndex(prod => prod.id === id)
            if (index !== -1) {
                productos.value[index] = dataWithUrls
            }

            currentProducto.value = dataWithUrls

            return dataWithUrls
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
            const { data: producto } = await supabase
                .from('rohermet-productos')
                .select('nombre, imagen, render_3d, archivo_html')
                .eq('id', id)
                .single()

            const { error: deleteError } = await supabase
                .from('rohermet-productos')
                .delete()
                .eq('id', id)

            if (deleteError) throw deleteError

            if (producto && producto.nombre) {
                try {
                    await deleteProductoFolder(producto.nombre, 'rohermet')
                } catch (error) {
                    console.warn('Error deleting producto folder:', error)
                }
            }

            productos.value = productos.value.filter(p => p.id !== id)

        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        productos,
        currentProducto,
        loading,
        error,
        fetchProductos,
        fetchProductoById,
        fetchProductosByCategoria,
        createProducto,
        updateProducto,
        deleteProducto
    }
}
