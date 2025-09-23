export const useWaterplastProductos = () => {
    const supabase = useSupabaseClient()
    const {
        uploadProductoImage,
        uploadProductoFile,
        uploadProductoIcon,
        deleteProductoImage,
        deleteProductoFile,
        deleteProductoIcon,
        getProductoImageUrl,
        getProductoFileUrl,
        getProductoIconUrl,
        uploadCaracteristicaImage,
        deleteCaracteristicaImage,
        getCaracteristicaImageUrl
    } = useStorage()
    const loading = ref(false)
    const productos = ref([])
    const currentProducto = ref(null)
    const error = ref(null)

const callUnzipImages = async (productoId) => {
  try {
    console.log('🚀 Iniciando llamada a unzip-images para producto:', productoId)
    
    // Ensure we have a valid supabase client
    if (!supabase || !supabase.functions) {
      console.error('❌ Supabase client not properly initialized')
      return null
    }
    
    console.log('📡 Enviando request a edge function...')

    const { data, error } = await supabase.functions.invoke('unzip-images', {
      body: { id: productoId }
    })

    if (error) {
      console.error('❌ Error al descomprimir:', error)
      return null
    }

    console.log('📦 Response data:', data)
    console.log('✅ ZIP descomprimido exitosamente:', data)
    return data

  } catch (error) {
    console.error('⚠️ Error llamando a unzip-images:', error)
    return null
  }
}


    const fetchProductos = async () => {
        loading.value = true
        error.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('waterplast-productos')
                .select(`
                    *,
                    categoria:categoria_id(id, nombre)
                `)
                .order('nombre', { ascending: true })

            if (supabaseError) throw supabaseError

            const productosWithUrls = (data || []).map(producto => ({
                ...producto,
                imagen: producto.imagen ? getProductoImageUrl(producto.imagen) : null,
                render_3d: producto.render_3d ? getProductoFileUrl(producto.render_3d) : null,
                ficha_tecnica: producto.ficha_tecnica ? getProductoFileUrl(producto.ficha_tecnica) : null,
                archivo_html: producto.archivo_html ? getProductoFileUrl(producto.archivo_html) : null,
                icono1: producto.icono1 ? getProductoIconUrl(producto.icono1) : null,
                icono2: producto.icono2 ? getProductoIconUrl(producto.icono2) : null,
                icono3: producto.icono3 ? getProductoIconUrl(producto.icono3) : null,
                categoria_nombre: producto.categoria?.nombre || ''
            }))

            productos.value = productosWithUrls
        } catch (err) {
            error.value = err.message
            console.error('Error al obtener productos:', err)
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
                .from('waterplast-productos')
                .select(`
                    *,
                    categoria:categoria_id(id, nombre)
                `)
                .eq('id', id)
                .single()

            if (supabaseError) throw supabaseError

            const productoWithUrls = {
                ...data,
                imagen: data.imagen ? getProductoImageUrl(data.imagen) : null,
                render_3d: data.render_3d ? getProductoFileUrl(data.render_3d) : null,
                ficha_tecnica: data.ficha_tecnica ? getProductoFileUrl(data.ficha_tecnica) : null,
                archivo_html: data.archivo_html ? getProductoFileUrl(data.archivo_html) : null,
                icono1: data.icono1 ? getProductoIconUrl(data.icono1) : null,
                icono2: data.icono2 ? getProductoIconUrl(data.icono2) : null,
                icono3: data.icono3 ? getProductoIconUrl(data.icono3) : null
            }

            currentProducto.value = productoWithUrls
            return productoWithUrls
        } catch (err) {
            error.value = err.message
            console.error('Error al obtener producto:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const fetchProductosByCategoria = async (categoriaId) => {
        loading.value = true
        error.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('waterplast-productos')
                .select('id, nombre')
                .eq('categoria_id', categoriaId)
                .eq('estado', true)
                .order('nombre', { ascending: true })

            if (supabaseError) throw supabaseError

            return data || []
        } catch (err) {
            error.value = err.message
            console.error('Error al obtener productos por categoría:', err)
            return []
        } finally {
            loading.value = false
        }
    }

    const fetchCaracteristicasAdicionales = async (productoId) => {
        try {
            const { data, error: supabaseError } = await supabase
                .from('waterplast-productos-caracteristicas-adicionales')
                .select('*')
                .eq('producto_id', productoId)
                .order('orden', { ascending: true })

            if (supabaseError) throw supabaseError

            return (data || []).map((caracteristica, index) => ({
                id: caracteristica.id,
                imagen: caracteristica.imagen ? getCaracteristicaImageUrl(caracteristica.imagen) : null,
                descripcion: caracteristica.descripcion,
                isOpen: index === 0,
                errors: {
                    imagen: '',
                    descripcion: ''
                }
            }))
        } catch (err) {
            console.error('Error al obtener características adicionales:', err)
            return []
        }
    }

    const deleteCaracteristicaAdicional = async (caracteristicaId) => {
        try {
            const { data: caracteristica } = await supabase
                .from('waterplast-productos-caracteristicas-adicionales')
                .select('imagen')
                .eq('id', caracteristicaId)
                .single()

            const { error: deleteError } = await supabase
                .from('waterplast-productos-caracteristicas-adicionales')
                .delete()
                .eq('id', caracteristicaId)

            if (deleteError) throw deleteError

            if (caracteristica && caracteristica.imagen) {
                try {
                    await deleteCaracteristicaImage(caracteristica.imagen)
                } catch (error) {
                    console.warn('Error deleting caracteristica image:', error)
                }
            }

        } catch (err) {
            console.error('Error al eliminar característica adicional:', err)
            throw err
        }
    }

    const createProducto = async (productoData, archivos, iconos, caracteristicasAdicionales = []) => {
        loading.value = true
        error.value = null

        try {
            const productoNombre = productoData.nombre

            let imagenPath = null
            let render3dPath = null
            let fichaTecnicaPath = null
            let archivoHtmlPath = null
            let iconPaths = {
                icono1: null,
                icono2: null,
                icono3: null
            }

            if (archivos.imagen) {
                imagenPath = await uploadProductoImage(archivos.imagen, productoNombre)
            }

            if (archivos.render3d) {
                render3dPath = await uploadProductoFile(archivos.render3d, productoNombre + '-render3d')
            }

            if (archivos.fichaTecnica) {
                fichaTecnicaPath = await uploadProductoFile(archivos.fichaTecnica, productoNombre + '-ficha')
            }

            if (archivos.archivoHtml) {
                archivoHtmlPath = await uploadProductoFile(archivos.archivoHtml, productoNombre + '-html')
            }

            if (iconos.icono1) {
                iconPaths.icono1 = await uploadProductoIcon(iconos.icono1, productoNombre, 1)
            }
            if (iconos.icono2) {
                iconPaths.icono2 = await uploadProductoIcon(iconos.icono2, productoNombre, 2)
            }
            if (iconos.icono3) {
                iconPaths.icono3 = await uploadProductoIcon(iconos.icono3, productoNombre, 3)
            }

            const finalProductoData = {
                ...productoData,
                imagen: imagenPath,
                render_3d: render3dPath,
                ficha_tecnica: fichaTecnicaPath,
                archivo_html: archivoHtmlPath,
                icono1: iconPaths.icono1,
                icono2: iconPaths.icono2,
                icono3: iconPaths.icono3
            }

            const { data, error: supabaseError } = await supabase
                .from('waterplast-productos')
                .insert(finalProductoData)
                .select()
                .single()

            if (supabaseError) throw supabaseError

            if (caracteristicasAdicionales && caracteristicasAdicionales.length > 0) {
                for (let index = 0; index < caracteristicasAdicionales.length; index++) {
                    const caracteristica = caracteristicasAdicionales[index]
                    if (caracteristica.imagen && caracteristica.descripcion) {
                        let imagenPath = null
                        if (caracteristica.imagen instanceof File || caracteristica.imagen instanceof Blob) {
                            imagenPath = await uploadCaracteristicaImage(
                                caracteristica.imagen,
                                productoNombre,
                                index + 1
                            )
                        } else {
                            if (typeof caracteristica.imagen === 'string' && caracteristica.imagen.includes('/')) {
                                const url = new URL(caracteristica.imagen)
                                imagenPath = url.pathname.split('/').slice(-1)[0]
                            } else {
                                imagenPath = caracteristica.imagen
                            }
                        }

                        const { error: caracteristicaError } = await supabase
                            .from('waterplast-productos-caracteristicas-adicionales')
                            .insert({
                                producto_id: data.id,
                                imagen: imagenPath,
                                descripcion: caracteristica.descripcion,
                                orden: index + 1
                            })

                        if (caracteristicaError) {
                            console.error('Error al insertar característica adicional:', caracteristicaError)
                        }
                    }
                }
            }

            const dataWithUrls = {
                ...data,
                imagen: data.imagen ? getProductoImageUrl(data.imagen) : null,
                render_3d: data.render_3d ? getProductoFileUrl(data.render_3d) : null,
                ficha_tecnica: data.ficha_tecnica ? getProductoFileUrl(data.ficha_tecnica) : null,
                archivo_html: data.archivo_html ? getProductoFileUrl(data.archivo_html) : null,
                icono1: data.icono1 ? getProductoIconUrl(data.icono1) : null,
                icono2: data.icono2 ? getProductoIconUrl(data.icono2) : null,
                icono3: data.icono3 ? getProductoIconUrl(data.icono3) : null
            }

            productos.value.push(dataWithUrls)

            // Call unzip-images function after successful creation
            console.log('🔄 Llamando a callUnzipImages después de crear producto...')
            const unzipResult = await callUnzipImages(data.id)
            console.log('📊 Resultado de unzip:', unzipResult)

            return dataWithUrls
        } catch (err) {
            error.value = err.message
            console.error('Error al crear producto:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateProducto = async (id, productoData, archivos, iconos, caracteristicasAdicionales = []) => {
        loading.value = true
        error.value = null

        try {
            const { data: currentData, error: fetchError } = await supabase
                .from('waterplast-productos')
                .select('nombre, imagen, render_3d, ficha_tecnica, archivo_html, icono1, icono2, icono3')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            const productoNombre = currentData?.nombre || 'producto'

            let imagenPath = currentData?.imagen
            let render3dPath = currentData?.render_3d
            let fichaTecnicaPath = currentData?.ficha_tecnica
            let archivoHtmlPath = currentData?.archivo_html
            let iconPaths = {
                icono1: currentData?.icono1,
                icono2: currentData?.icono2,
                icono3: currentData?.icono3
            }

            if (archivos.imagen) {
                if (currentData?.imagen) {
                    await deleteProductoImage(currentData.imagen)
                }
                imagenPath = await uploadProductoImage(archivos.imagen, productoNombre)
            }

            if (archivos.render3d) {
                if (currentData?.render_3d) {
                    await deleteProductoFile(currentData.render_3d)
                }
                render3dPath = await uploadProductoFile(archivos.render3d, productoNombre + '-render3d')
            }

            if (archivos.fichaTecnica) {
                if (currentData?.ficha_tecnica) {
                    await deleteProductoFile(currentData.ficha_tecnica)
                }
                fichaTecnicaPath = await uploadProductoFile(archivos.fichaTecnica, productoNombre + '-ficha')
            }

            if (archivos.archivoHtml) {
                if (currentData?.archivo_html) {
                    await deleteProductoFile(currentData.archivo_html)
                }
                archivoHtmlPath = await uploadProductoFile(archivos.archivoHtml, productoNombre + '-html')
            }

            if (iconos.icono1) {
                if (currentData?.icono1) {
                    await deleteProductoIcon(currentData.icono1)
                }
                iconPaths.icono1 = await uploadProductoIcon(iconos.icono1, productoNombre, 1)
            }
            if (iconos.icono2) {
                if (currentData?.icono2) {
                    await deleteProductoIcon(currentData.icono2)
                }
                iconPaths.icono2 = await uploadProductoIcon(iconos.icono2, productoNombre, 2)
            }
            if (iconos.icono3) {
                if (currentData?.icono3) {
                    await deleteProductoIcon(currentData.icono3)
                }
                iconPaths.icono3 = await uploadProductoIcon(iconos.icono3, productoNombre, 3)
            }

            const finalProductoData = {
                ...productoData,
                imagen: imagenPath,
                render_3d: render3dPath,
                ficha_tecnica: fichaTecnicaPath,
                archivo_html: archivoHtmlPath,
                icono1: iconPaths.icono1,
                icono2: iconPaths.icono2,
                icono3: iconPaths.icono3
            }

            delete finalProductoData.nombre

            const { data, error: supabaseError } = await supabase
                .from('waterplast-productos')
                .update(finalProductoData)
                .eq('id', id)
                .select()
                .single()

            if (supabaseError) throw supabaseError

            if (caracteristicasAdicionales && caracteristicasAdicionales.length >= 0) {
                const { data: existingCaracteristicas } = await supabase
                    .from('waterplast-productos-caracteristicas-adicionales')
                    .select('id, imagen')
                    .eq('producto_id', id)

                const currentCaracteristicasWithDbId = caracteristicasAdicionales.filter(c => c.dbId || c.id)
                const existingIds = new Set(existingCaracteristicas?.map(c => c.id) || [])
                const newIds = new Set(currentCaracteristicasWithDbId.map(c => c.dbId || c.id))

                const idsToDelete = [...existingIds].filter(id => !newIds.has(id))

                for (const deleteId of idsToDelete) {
                    const caracteristicaToDelete = existingCaracteristicas.find(c => c.id === deleteId)
                    if (caracteristicaToDelete?.imagen) {
                        try {
                            await deleteCaracteristicaImage(caracteristicaToDelete.imagen)
                        } catch (error) {
                            console.warn('Error deleting caracteristica image:', error)
                        }
                    }

                    await supabase
                        .from('waterplast-productos-caracteristicas-adicionales')
                        .delete()
                        .eq('id', deleteId)
                }

                for (let index = 0; index < caracteristicasAdicionales.length; index++) {
                    const caracteristica = caracteristicasAdicionales[index]
                    if (caracteristica.imagen && caracteristica.descripcion) {
                        let imagenPath = null
                        const caracteristicaDbId = caracteristica.dbId || caracteristica.id

                        if (caracteristica.imagen instanceof File || caracteristica.imagen instanceof Blob) {
                            imagenPath = await uploadCaracteristicaImage(
                                caracteristica.imagen,
                                currentData?.nombre || 'producto',
                                index + 1
                            )
                        } else {
                            if (typeof caracteristica.imagen === 'string' && caracteristica.imagen.includes('/')) {
                                try {
                                    const url = new URL(caracteristica.imagen)
                                    imagenPath = url.pathname.split('/public/waterplast-productos-caracteristicas/')[1] || caracteristica.imagen
                                } catch {
                                    imagenPath = caracteristica.imagen
                                }
                            } else {
                                imagenPath = caracteristica.imagen
                            }
                        }

                        const caracteristicaData = {
                            producto_id: id,
                            imagen: imagenPath,
                            descripcion: caracteristica.descripcion,
                            orden: index + 1
                        }

                        if (caracteristicaDbId && existingIds.has(caracteristicaDbId)) {
                            const { error: updateError } = await supabase
                                .from('waterplast-productos-caracteristicas-adicionales')
                                .update(caracteristicaData)
                                .eq('id', caracteristicaDbId)

                            if (updateError) {
                                console.error('Error al actualizar característica adicional:', updateError)
                            }
                        } else {
                            const { error: insertError } = await supabase
                                .from('waterplast-productos-caracteristicas-adicionales')
                                .insert(caracteristicaData)

                            if (insertError) {
                                console.error('Error al insertar característica adicional:', insertError)
                            }
                        }
                    }
                }
            }

            const dataWithUrls = {
                ...data,
                imagen: data.imagen ? getProductoImageUrl(data.imagen) : null,
                render_3d: data.render_3d ? getProductoFileUrl(data.render_3d) : null,
                ficha_tecnica: data.ficha_tecnica ? getProductoFileUrl(data.ficha_tecnica) : null,
                archivo_html: data.archivo_html ? getProductoFileUrl(data.archivo_html) : null,
                icono1: data.icono1 ? getProductoIconUrl(data.icono1) : null,
                icono2: data.icono2 ? getProductoIconUrl(data.icono2) : null,
                icono3: data.icono3 ? getProductoIconUrl(data.icono3) : null
            }

            const index = productos.value.findIndex(prod => prod.id === id)
            if (index !== -1) {
                productos.value[index] = dataWithUrls
            }

            currentProducto.value = dataWithUrls

            const zipActualizado = Boolean(archivos?.render3d)

            // Call unzip-images function after successful update
            console.log('🔄 Llamando a callUnzipImages después de actualizar producto...')
            const unzipResult = await callUnzipImages(id)
            console.log('📊 Resultado de unzip:', unzipResult)

            return dataWithUrls
        } catch (err) {
            error.value = err.message
            console.error('Error al actualizar producto:', err)
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
                .from('waterplast-productos')
                .select('imagen, render_3d, ficha_tecnica, archivo_html, icono1, icono2, icono3')
                .eq('id', id)
                .single()

            const { data: caracteristicas } = await supabase
                .from('waterplast-productos-caracteristicas-adicionales')
                .select('imagen')
                .eq('producto_id', id)

            if (caracteristicas && caracteristicas.length > 0) {
                for (const caracteristica of caracteristicas) {
                    if (caracteristica.imagen) {
                        try {
                            await deleteCaracteristicaImage(caracteristica.imagen)
                        } catch (error) {
                            console.warn('Error deleting caracteristica image:', error)
                        }
                    }
                }
            }

            await supabase
                .from('waterplast-productos-caracteristicas-adicionales')
                .delete()
                .eq('producto_id', id)

            if (producto) {
                if (producto.imagen) {
                    try {
                        await deleteProductoImage(producto.imagen)
                    } catch (error) {
                        console.warn('Error deleting product image:', error)
                    }
                }
                if (producto.render_3d) {
                    try {
                        await deleteProductoFile(producto.render_3d)
                    } catch (error) {
                        console.warn('Error deleting render 3d:', error)
                    }
                }
                if (producto.ficha_tecnica) {
                    try {
                        await deleteProductoFile(producto.ficha_tecnica)
                    } catch (error) {
                        console.warn('Error deleting ficha tecnica:', error)
                    }
                }
                if (producto.archivo_html) {
                    try {
                        await deleteProductoFile(producto.archivo_html)
                    } catch (error) {
                        console.warn('Error deleting archivo html:', error)
                    }
                }
                if (producto.icono1) {
                    try {
                        await deleteProductoIcon(producto.icono1)
                    } catch (error) {
                        console.warn('Error deleting icono1:', error)
                    }
                }
                if (producto.icono2) {
                    try {
                        await deleteProductoIcon(producto.icono2)
                    } catch (error) {
                        console.warn('Error deleting icono2:', error)
                    }
                }
                if (producto.icono3) {
                    try {
                        await deleteProductoIcon(producto.icono3)
                    } catch (error) {
                        console.warn('Error deleting icono3:', error)
                    }
                }
            }

            const { error: deleteError } = await supabase
                .from('waterplast-productos')
                .delete()
                .eq('id', id)

            if (deleteError) throw deleteError

            productos.value = productos.value.filter(p => p.id !== id)

        } catch (err) {
            error.value = err.message
            console.error('Error al eliminar producto:', err)
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
        fetchCaracteristicasAdicionales,
        deleteCaracteristicaAdicional,
        createProducto,
        updateProducto,
        deleteProducto,
        callUnzipImages
    }
}