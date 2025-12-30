export const useWaterplastProductos = () => {
    const supabase = useSupabaseClient()
    const {
        uploadProductoImage,
        uploadProductoFile,
        uploadProductoIcon,
        deleteProductoImage,
        deleteProductoFile,
        deleteProductoIcon,
        deleteProductoRender3d,
        getProductoImageUrl,
        getProductoFileUrl,
        getProductoIconUrl,
        uploadCaracteristicaImage,
        deleteCaracteristicaImage,
        getCaracteristicaImageUrl,
        deleteProductoFolder,
        generateUniqueProductFolderName
    } = useStorage()
    const loading = ref(false)
    const productos = ref([])
    const currentProducto = ref(null)
    const error = ref(null)

    const dataURLtoFile = (dataurl, filename) => {
        const arr = dataurl.split(',')
        const mime = arr[0].match(/:(.*?);/)[1]
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
        }
        return new File([u8arr], filename, { type: mime })
    }

    const callUnzipImages = async (productoId) => {
        try {
            if (!supabase || !supabase.functions) {
                return null
            }

            const { data, error } = await supabase.functions.invoke('unzip-images', {
                body: {
                    id: productoId,
                    table: 'waterplast-productos'
                }
            })

            if (error) {
                return null
            }

            return data

        } catch (error) {
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
                    categoria:categoria_id(id, nombre),
                    subcategoria:subcategoria_id(id, nombre)
                `)
                .order('nombre', { ascending: true })

            if (supabaseError) throw supabaseError

            const productosWithUrls = (data || []).map(producto => ({
                ...producto,
                imagen: producto.imagen ? getProductoImageUrl(producto.imagen) : null,
                render_3d: producto.render_3d ? getProductoFileUrl(producto.render_3d) : null,
                ficha_tecnica: producto.ficha_tecnica ? getProductoFileUrl(producto.ficha_tecnica) : null,
                manual_instalacion: producto.manual_instalacion ? getProductoFileUrl(producto.manual_instalacion) : null,
                archivo_html: producto.archivo_html ? getProductoFileUrl(producto.archivo_html) : null,
                icono1: producto.icono1 ? getProductoIconUrl(producto.icono1) : null,
                icono2: producto.icono2 ? getProductoIconUrl(producto.icono2) : null,
                icono3: producto.icono3 ? getProductoIconUrl(producto.icono3) : null,
                categoria_nombre: producto.categoria?.nombre || '',
                subcategoria_nombre: producto.subcategoria?.nombre || ''
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
                .from('waterplast-productos')
                .select(`
                    *,
                    categoria:categoria_id(id, nombre),
                    subcategoria:subcategoria_id(id, nombre)
                `)
                .eq('id', id)
                .single()

            if (supabaseError) throw supabaseError

            const productoWithUrls = {
                ...data,
                imagen: data.imagen ? getProductoImageUrl(data.imagen) : null,
                render_3d: data.render_3d ? getProductoFileUrl(data.render_3d) : null,
                ficha_tecnica: data.ficha_tecnica ? getProductoFileUrl(data.ficha_tecnica) : null,
                manual_instalacion: data.manual_instalacion ? getProductoFileUrl(data.manual_instalacion) : null,
                archivo_html: data.archivo_html ? getProductoFileUrl(data.archivo_html) : null,
                icono1: data.icono1 ? getProductoIconUrl(data.icono1) : null,
                icono2: data.icono2 ? getProductoIconUrl(data.icono2) : null,
                icono3: data.icono3 ? getProductoIconUrl(data.icono3) : null
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
                .from('waterplast-productos')
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
                }
            }

        } catch (err) {
            throw err
        }
    }

    const createProducto = async (productoData, archivos, iconos, caracteristicasAdicionales = []) => {
        loading.value = true
        error.value = null

        try {
            const productoNombre = productoData.nombre
            const capacidadLts = productoData.capacidad_lts
            const marca = 'waterplast'

            const folderName = await generateUniqueProductFolderName(productoNombre, capacidadLts, marca)

            let imagenPath = null
            let render3dPath = null
            let fichaTecnicaPath = null
            let manualInstalacionPath = null
            let archivoHtmlPath = null
            let iconPaths = {
                icono1: null,
                icono2: null,
                icono3: null
            }

            if (archivos.imagen) {
                imagenPath = await uploadProductoImage(archivos.imagen, productoNombre, capacidadLts, marca)
            }

            if (archivos.render3d) {
                render3dPath = await uploadProductoFile(archivos.render3d, productoNombre + '-render3d', capacidadLts, marca, folderName)
            }

            if (archivos.fichaTecnica) {
                fichaTecnicaPath = await uploadProductoFile(archivos.fichaTecnica, productoNombre + '-ficha', capacidadLts, marca, folderName)
            }

            if (archivos.manualInstalacion) {
                manualInstalacionPath = await uploadProductoFile(archivos.manualInstalacion, productoNombre + '-manual', capacidadLts, marca, folderName)
            }

            if (archivos.archivoHtml) {
                archivoHtmlPath = await uploadProductoFile(archivos.archivoHtml, productoNombre + '-html', capacidadLts, marca, folderName)
            }

            if (iconos.icono1) {
                iconPaths.icono1 = await uploadProductoIcon(iconos.icono1, productoNombre, 1, capacidadLts, marca, folderName)
            }
            if (iconos.icono2) {
                iconPaths.icono2 = await uploadProductoIcon(iconos.icono2, productoNombre, 2, capacidadLts, marca, folderName)
            }
            if (iconos.icono3) {
                iconPaths.icono3 = await uploadProductoIcon(iconos.icono3, productoNombre, 3, capacidadLts, marca, folderName)
            }

            const finalProductoData = {
                ...productoData,
                imagen: imagenPath,
                render_3d: render3dPath,
                ficha_tecnica: fichaTecnicaPath,
                manual_instalacion: manualInstalacionPath,
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
                        let fileToUpload = null

                        if (caracteristica.imagen instanceof File || caracteristica.imagen instanceof Blob) {
                            fileToUpload = caracteristica.imagen
                        } else if (typeof caracteristica.imagen === 'string' && caracteristica.imagen.startsWith('data:')) {
                            fileToUpload = dataURLtoFile(caracteristica.imagen, `caracteristica-${index + 1}.webp`)
                        } else if (typeof caracteristica.imagen === 'string' && caracteristica.imagen.includes('/')) {
                            try {
                                const url = new URL(caracteristica.imagen)
                                imagenPath = url.pathname.split('/public/waterplast-productos-caracteristicas/')[1] || caracteristica.imagen
                            } catch {
                                imagenPath = caracteristica.imagen
                            }
                        } else {
                            imagenPath = caracteristica.imagen
                        }

                        if (fileToUpload) {
                            imagenPath = await uploadCaracteristicaImage(
                                fileToUpload,
                                productoNombre,
                                index + 1
                            )
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
                manual_instalacion: data.manual_instalacion ? getProductoFileUrl(data.manual_instalacion) : null,
                archivo_html: data.archivo_html ? getProductoFileUrl(data.archivo_html) : null,
                icono1: data.icono1 ? getProductoIconUrl(data.icono1) : null,
                icono2: data.icono2 ? getProductoIconUrl(data.icono2) : null,
                icono3: data.icono3 ? getProductoIconUrl(data.icono3) : null
            }

            productos.value.push(dataWithUrls)

            const unzipResult = await callUnzipImages(data.id)

            return dataWithUrls
        } catch (err) {
            error.value = err.message
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
                .select('nombre, imagen, render_3d, ficha_tecnica, manual_instalacion, archivo_html, icono1, icono2, icono3')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            const productoNombre = productoData?.nombre || currentData?.nombre || 'producto'
            const capacidadLts = productoData?.capacidad_lts
            const marca = 'waterplast'
            const nombreCambio = productoData?.nombre && productoData.nombre !== currentData?.nombre

            let folderName = null
            if (currentData?.imagen) {
                folderName = currentData.imagen.split('/')[0]
            } else if (currentData?.render_3d) {
                folderName = currentData.render_3d.split('/')[0]
            } else if (currentData?.ficha_tecnica) {
                folderName = currentData.ficha_tecnica.split('/')[0]
            } else if (currentData?.manual_instalacion) {
                folderName = currentData.manual_instalacion.split('/')[0]
            } else if (currentData?.archivo_html) {
                folderName = currentData.archivo_html.split('/')[0]
            } else if (currentData?.icono1) {
                folderName = currentData.icono1.split('/')[0]
            } else if (currentData?.icono2) {
                folderName = currentData.icono2.split('/')[0]
            } else if (currentData?.icono3) {
                folderName = currentData.icono3.split('/')[0]
            }

            if (!folderName) {
                folderName = await generateUniqueProductFolderName(productoNombre, capacidadLts, marca)
            }

            let imagenPath = currentData?.imagen
            let render3dPath = currentData?.render_3d
            let fichaTecnicaPath = currentData?.ficha_tecnica
            let manualInstalacionPath = currentData?.manual_instalacion
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
                imagenPath = await uploadProductoImage(archivos.imagen, productoNombre, capacidadLts, marca, folderName)
            }

            if (archivos.render3d) {
                if (currentData?.render_3d) {
                    await deleteProductoRender3d(currentData.render_3d, productoNombre)
                }
                render3dPath = await uploadProductoFile(archivos.render3d, productoNombre + '-render3d', capacidadLts, marca, folderName)
            } else if (productoData.render_3d === null && currentData?.render_3d) {
                await deleteProductoFile(currentData.render_3d)
                render3dPath = null
            }

            if (archivos.fichaTecnica) {
                if (currentData?.ficha_tecnica) {
                    await deleteProductoFile(currentData.ficha_tecnica)
                }
                fichaTecnicaPath = await uploadProductoFile(archivos.fichaTecnica, productoNombre + '-ficha', capacidadLts, marca, folderName)
            } else if (productoData.ficha_tecnica === null && currentData?.ficha_tecnica) {
                await deleteProductoFile(currentData.ficha_tecnica)
                fichaTecnicaPath = null
            }

            if (archivos.manualInstalacion) {
                if (currentData?.manual_instalacion) {
                    await deleteProductoFile(currentData.manual_instalacion)
                }
                manualInstalacionPath = await uploadProductoFile(archivos.manualInstalacion, productoNombre + '-manual', capacidadLts, marca, folderName)
            } else if (productoData.manual_instalacion === null && currentData?.manual_instalacion) {
                await deleteProductoFile(currentData.manual_instalacion)
                manualInstalacionPath = null
            }

            if (archivos.archivoHtml) {
                if (currentData?.archivo_html) {
                    await deleteProductoFile(currentData.archivo_html)
                }
                archivoHtmlPath = await uploadProductoFile(archivos.archivoHtml, productoNombre + '-html', capacidadLts, marca, folderName)
            } else if (productoData.archivo_html === null && currentData?.archivo_html) {
                await deleteProductoFile(currentData.archivo_html)
                archivoHtmlPath = null
            }

            if (iconos.icono1) {
                if (currentData?.icono1) {
                    await deleteProductoIcon(currentData.icono1)
                }
                iconPaths.icono1 = await uploadProductoIcon(iconos.icono1, productoNombre, 1, capacidadLts, marca, folderName)
            }
            if (iconos.icono2) {
                if (currentData?.icono2) {
                    await deleteProductoIcon(currentData.icono2)
                }
                iconPaths.icono2 = await uploadProductoIcon(iconos.icono2, productoNombre, 2, capacidadLts, marca, folderName)
            }
            if (iconos.icono3) {
                if (currentData?.icono3) {
                    await deleteProductoIcon(currentData.icono3)
                }
                iconPaths.icono3 = await uploadProductoIcon(iconos.icono3, productoNombre, 3, capacidadLts, marca, folderName)
            }

            const finalProductoData = {
                ...productoData,
                imagen: imagenPath,
                render_3d: render3dPath,
                ficha_tecnica: fichaTecnicaPath,
                manual_instalacion: manualInstalacionPath,
                archivo_html: archivoHtmlPath,
                icono1: iconPaths.icono1,
                icono2: iconPaths.icono2,
                icono3: iconPaths.icono3
            }


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
                        let fileToUpload = null
                        const caracteristicaDbId = caracteristica.dbId || caracteristica.id

                        if (caracteristica.imagen instanceof File || caracteristica.imagen instanceof Blob) {
                            fileToUpload = caracteristica.imagen
                        } else if (typeof caracteristica.imagen === 'string' && caracteristica.imagen.startsWith('data:')) {
                            fileToUpload = dataURLtoFile(caracteristica.imagen, `caracteristica-${index + 1}.webp`)
                        } else if (typeof caracteristica.imagen === 'string' && caracteristica.imagen.includes('/')) {
                            try {
                                const url = new URL(caracteristica.imagen)
                                imagenPath = url.pathname.split('/public/waterplast-productos-caracteristicas/')[1] || caracteristica.imagen
                            } catch {
                                imagenPath = caracteristica.imagen
                            }
                        } else {
                            imagenPath = caracteristica.imagen
                        }

                        if (fileToUpload) {
                            imagenPath = await uploadCaracteristicaImage(
                                fileToUpload,
                                productoNombre,
                                index + 1
                            )
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
                manual_instalacion: data.manual_instalacion ? getProductoFileUrl(data.manual_instalacion) : null,
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

            if (zipActualizado) {
                const unzipResult = await callUnzipImages(id)
            }

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
                .from('waterplast-productos')
                .select('nombre, imagen, render_3d, ficha_tecnica, manual_instalacion, archivo_html, icono1, icono2, icono3')
                .eq('id', id)
                .single()


            await supabase
                .from('waterplast-productos-caracteristicas-adicionales')
                .delete()
                .eq('producto_id', id)

            const { error: deleteError } = await supabase
                .from('waterplast-productos')
                .delete()
                .eq('id', id)

            if (deleteError) throw deleteError

            if (producto && producto.nombre) {
                try {
                    await deleteProductoFolder(producto.nombre)
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
        fetchCaracteristicasAdicionales,
        deleteCaracteristicaAdicional,
        createProducto,
        updateProducto,
        deleteProducto,
        callUnzipImages
    }
}