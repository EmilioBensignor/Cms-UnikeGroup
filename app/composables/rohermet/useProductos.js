export const useRohermetProductos = () => {
    const supabase = useSupabaseClient()
    const {
        uploadProductoImage,
        uploadProductoFile,
        uploadProductoIcon,
        uploadProductoGaleriaImagenes,
        deleteProductoImage,
        deleteProductoFile,
        deleteProductoIcon,
        deleteProductoGaleriaImagen,
        deleteProductoRender3d,
        getProductoImageUrl,
        getProductoFileUrl,
        getProductoIconUrl,
        getProductoGaleriaImageUrl,
        deleteProductoFolder,
        generateUniqueProductFolderName
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
                .order('orden', { ascending: true })

            if (supabaseError) throw supabaseError

            const productosWithUrls = (data || []).map(producto => ({
                ...producto,
                imagen: producto.imagen ? getProductoImageUrl(producto.imagen, 'rohermet', true) : null,
                render_3d: producto.render_3d ? getProductoFileUrl(producto.render_3d, 'rohermet', true) : null,
                archivo_html: producto.archivo_html ? getProductoFileUrl(producto.archivo_html, 'rohermet', true) : null,
                ficha_tecnica: producto.ficha_tecnica ? getProductoFileUrl(producto.ficha_tecnica, 'rohermet', true) : null,
                manual_instalacion: producto.manual_instalacion ? getProductoFileUrl(producto.manual_instalacion, 'rohermet', true) : null,
                icono1: producto.icono1 ? getProductoIconUrl(producto.icono1, 'rohermet', true) : null,
                icono2: producto.icono2 ? getProductoIconUrl(producto.icono2, 'rohermet', true) : null,
                icono3: producto.icono3 ? getProductoIconUrl(producto.icono3, 'rohermet', true) : null,
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
                imagen: data.imagen ? getProductoImageUrl(data.imagen, 'rohermet', true) : null,
                render_3d: data.render_3d ? getProductoFileUrl(data.render_3d, 'rohermet', true) : null,
                archivo_html: data.archivo_html ? getProductoFileUrl(data.archivo_html, 'rohermet', true) : null,
                ficha_tecnica: data.ficha_tecnica ? getProductoFileUrl(data.ficha_tecnica, 'rohermet', true) : null,
                manual_instalacion: data.manual_instalacion ? getProductoFileUrl(data.manual_instalacion, 'rohermet', true) : null,
                icono1: data.icono1 ? getProductoIconUrl(data.icono1, 'rohermet', true) : null,
                icono2: data.icono2 ? getProductoIconUrl(data.icono2, 'rohermet', true) : null,
                icono3: data.icono3 ? getProductoIconUrl(data.icono3, 'rohermet', true) : null,
                galeria: data.galeria ?
                    data.galeria.map((img, index) => ({
                        id: `galeria-${index}`,
                        name: `imagen-${index + 1}.jpg`,
                        url: getProductoGaleriaImageUrl(img, 'rohermet', true),
                        storagePath: img
                    })) : []
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

    const callUnzipImages = async (productoId) => {
        try {
            if (!supabase || !supabase.functions) {
                return null
            }

            const { data, error } = await supabase.functions.invoke('unzip-images', {
                body: {
                    id: productoId,
                    table: 'rohermet-productos'
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

    const createProducto = async (productoData, archivos, iconos, galeria = []) => {
        loading.value = true
        error.value = null

        try {
            const productoNombre = productoData.nombre
            const capacidadLts = productoData.capacidad_lts
            const marca = 'rohermet'

            const folderName = await generateUniqueProductFolderName(productoNombre, capacidadLts, marca)

            let imagenPath = null
            let render3dPath = null
            let archivoHtmlPath = null
            let fichaTecnicaPath = null
            let manualInstalacionPath = null
            let galeriaPaths = []
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

            if (archivos.archivoHtml) {
                archivoHtmlPath = await uploadProductoFile(archivos.archivoHtml, productoNombre + '-html', capacidadLts, marca, folderName)
            }

            if (archivos.fichaTecnica) {
                fichaTecnicaPath = await uploadProductoFile(archivos.fichaTecnica, productoNombre + '-ficha', capacidadLts, marca, folderName)
            }

            if (archivos.manualInstalacion) {
                manualInstalacionPath = await uploadProductoFile(archivos.manualInstalacion, productoNombre + '-manual', capacidadLts, marca, folderName)
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

            if (galeria && Array.isArray(galeria) && galeria.length > 0) {
                const nuevasImagenes = galeria.filter(img => img.file && !img.isExisting)
                if (nuevasImagenes.length > 0) {
                    galeriaPaths = await uploadProductoGaleriaImagenes(nuevasImagenes, productoNombre, marca)
                }
            }

            const finalProductoData = {
                ...productoData,
                imagen: imagenPath,
                render_3d: render3dPath,
                archivo_html: archivoHtmlPath,
                ficha_tecnica: fichaTecnicaPath,
                manual_instalacion: manualInstalacionPath,
                icono1: iconPaths.icono1,
                icono2: iconPaths.icono2,
                icono3: iconPaths.icono3,
                galeria: galeriaPaths
            }

            const { data, error: supabaseError } = await supabase
                .from('rohermet-productos')
                .insert(finalProductoData)
                .select()
                .single()

            if (supabaseError) throw supabaseError

            const dataWithUrls = {
                ...data,
                imagen: data.imagen ? getProductoImageUrl(data.imagen, 'rohermet', true) : null,
                render_3d: data.render_3d ? getProductoFileUrl(data.render_3d, 'rohermet', true) : null,
                archivo_html: data.archivo_html ? getProductoFileUrl(data.archivo_html, 'rohermet', true) : null,
                ficha_tecnica: data.ficha_tecnica ? getProductoFileUrl(data.ficha_tecnica, 'rohermet', true) : null,
                manual_instalacion: data.manual_instalacion ? getProductoFileUrl(data.manual_instalacion, 'rohermet', true) : null,
                icono1: data.icono1 ? getProductoIconUrl(data.icono1, 'rohermet', true) : null,
                icono2: data.icono2 ? getProductoIconUrl(data.icono2, 'rohermet', true) : null,
                icono3: data.icono3 ? getProductoIconUrl(data.icono3, 'rohermet', true) : null
            }

            productos.value.push(dataWithUrls)

            await callUnzipImages(data.id)

            return dataWithUrls
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateProducto = async (id, productoData, archivos, iconos, galeria = [], removedImages = {}) => {
        loading.value = true
        error.value = null

        try {
            const { data: currentData, error: fetchError } = await supabase
                .from('rohermet-productos')
                .select('nombre, imagen, render_3d, archivo_html, ficha_tecnica, manual_instalacion, icono1, icono2, icono3, galeria')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            const productoNombre = productoData?.nombre || currentData?.nombre || 'producto'
            const capacidadLts = productoData?.capacidad_lts
            const marca = 'rohermet'

            let folderName = null
            if (currentData?.imagen) {
                folderName = currentData.imagen.split('/')[0]
            } else if (currentData?.render_3d) {
                folderName = currentData.render_3d.split('/')[0]
            } else if (currentData?.archivo_html) {
                folderName = currentData.archivo_html.split('/')[0]
            } else if (currentData?.ficha_tecnica) {
                folderName = currentData.ficha_tecnica.split('/')[0]
            } else if (currentData?.manual_instalacion) {
                folderName = currentData.manual_instalacion.split('/')[0]
            } else if (currentData?.icono1) {
                folderName = currentData.icono1.split('/')[0]
            } else if (currentData?.icono2) {
                folderName = currentData.icono2.split('/')[0]
            } else if (currentData?.icono3) {
                folderName = currentData.icono3.split('/')[0]
            } else if (currentData?.galeria && currentData.galeria.length > 0) {
                folderName = currentData.galeria[0].split('/')[0]
            }

            if (!folderName) {
                folderName = await generateUniqueProductFolderName(productoNombre, capacidadLts, marca)
            }

            let imagenPath = currentData?.imagen
            let render3dPath = currentData?.render_3d
            let archivoHtmlPath = currentData?.archivo_html
            let fichaTecnicaPath = currentData?.ficha_tecnica
            let manualInstalacionPath = currentData?.manual_instalacion
            let iconPaths = {
                icono1: currentData?.icono1,
                icono2: currentData?.icono2,
                icono3: currentData?.icono3
            }
            let galeriaPaths = []

            if (removedImages.imagen) {
                if (currentData?.imagen) {
                    await deleteProductoImage(currentData.imagen, marca)
                }
                imagenPath = null
            } else if (archivos.imagen) {
                if (currentData?.imagen) {
                    await deleteProductoImage(currentData.imagen, marca)
                }
                imagenPath = await uploadProductoImage(archivos.imagen, productoNombre, capacidadLts, marca, folderName)
            }

            if (archivos.render3d) {
                if (currentData?.render_3d) {
                    await deleteProductoRender3d(currentData.render_3d, productoNombre, marca)
                }
                render3dPath = await uploadProductoFile(archivos.render3d, productoNombre + '-render3d', capacidadLts, marca, folderName)
            } else if (productoData.render_3d === null && currentData?.render_3d) {
                await deleteProductoRender3d(currentData.render_3d, productoNombre, marca)
                render3dPath = null
            }

            if (archivos.archivoHtml) {
                if (currentData?.archivo_html) {
                    await deleteProductoFile(currentData.archivo_html, marca)
                }
                archivoHtmlPath = await uploadProductoFile(archivos.archivoHtml, productoNombre + '-html', capacidadLts, marca, folderName)
            } else if (productoData.archivo_html === null && currentData?.archivo_html) {
                await deleteProductoFile(currentData.archivo_html, marca)
                archivoHtmlPath = null
            }

            if (archivos.fichaTecnica) {
                if (currentData?.ficha_tecnica) {
                    await deleteProductoFile(currentData.ficha_tecnica, marca)
                }
                fichaTecnicaPath = await uploadProductoFile(archivos.fichaTecnica, productoNombre + '-ficha', capacidadLts, marca, folderName)
            } else if (productoData.ficha_tecnica === null && currentData?.ficha_tecnica) {
                await deleteProductoFile(currentData.ficha_tecnica, marca)
                fichaTecnicaPath = null
            }

            if (archivos.manualInstalacion) {
                if (currentData?.manual_instalacion) {
                    await deleteProductoFile(currentData.manual_instalacion, marca)
                }
                manualInstalacionPath = await uploadProductoFile(archivos.manualInstalacion, productoNombre + '-manual', capacidadLts, marca, folderName)
            } else if (productoData.manual_instalacion === null && currentData?.manual_instalacion) {
                await deleteProductoFile(currentData.manual_instalacion, marca)
                manualInstalacionPath = null
            }

            if (removedImages.icono1) {
                if (currentData?.icono1) await deleteProductoIcon(currentData.icono1, marca)
                iconPaths.icono1 = null
            } else if (iconos.icono1) {
                if (currentData?.icono1) await deleteProductoIcon(currentData.icono1, marca)
                iconPaths.icono1 = await uploadProductoIcon(iconos.icono1, productoNombre, 1, capacidadLts, marca, folderName)
            }
            if (removedImages.icono2) {
                if (currentData?.icono2) await deleteProductoIcon(currentData.icono2, marca)
                iconPaths.icono2 = null
            } else if (iconos.icono2) {
                if (currentData?.icono2) await deleteProductoIcon(currentData.icono2, marca)
                iconPaths.icono2 = await uploadProductoIcon(iconos.icono2, productoNombre, 2, capacidadLts, marca, folderName)
            }
            if (removedImages.icono3) {
                if (currentData?.icono3) await deleteProductoIcon(currentData.icono3, marca)
                iconPaths.icono3 = null
            } else if (iconos.icono3) {
                if (currentData?.icono3) await deleteProductoIcon(currentData.icono3, marca)
                iconPaths.icono3 = await uploadProductoIcon(iconos.icono3, productoNombre, 3, capacidadLts, marca, folderName)
            }

            if (galeria && Array.isArray(galeria) && galeria.length > 0) {
                const imagenesExistentesQueSeMantienen = galeria
                    .filter(img => img.isExisting && img.storagePath)
                    .map(img => img.storagePath)

                const nuevasImagenes = galeria.filter(img => img.file && !img.isExisting)
                const imagenesAntiguasEnDB = currentData?.galeria || []

                const imagenesAEliminar = imagenesAntiguasEnDB.filter(
                    imgDB => !imagenesExistentesQueSeMantienen.includes(imgDB)
                )

                if (imagenesAEliminar.length > 0) {
                    for (const imagen of imagenesAEliminar) {
                        await deleteProductoGaleriaImagen(imagen, 'rohermet')
                    }
                }

                let pathsNuevasImagenes = []
                if (nuevasImagenes.length > 0) {
                    pathsNuevasImagenes = await uploadProductoGaleriaImagenes(nuevasImagenes, productoNombre, 'rohermet')
                }

                galeriaPaths = []
                for (const img of galeria) {
                    if (img.isExisting && img.storagePath) {
                        galeriaPaths.push(img.storagePath)
                    } else if (img.file && !img.isExisting) {
                        const indexNueva = nuevasImagenes.findIndex(n => n.id === img.id)
                        if (indexNueva !== -1 && pathsNuevasImagenes[indexNueva]) {
                            galeriaPaths.push(pathsNuevasImagenes[indexNueva])
                        }
                    }
                }
            } else {
                if (currentData?.galeria && currentData.galeria.length > 0) {
                    for (const imagen of currentData.galeria) {
                        await deleteProductoGaleriaImagen(imagen, 'rohermet')
                    }
                }
                galeriaPaths = []
            }

            const finalProductoData = {
                ...productoData,
                imagen: imagenPath,
                render_3d: render3dPath,
                archivo_html: archivoHtmlPath,
                ficha_tecnica: fichaTecnicaPath,
                manual_instalacion: manualInstalacionPath,
                icono1: iconPaths.icono1,
                icono2: iconPaths.icono2,
                icono3: iconPaths.icono3,
                galeria: galeriaPaths
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
                imagen: data.imagen ? getProductoImageUrl(data.imagen, 'rohermet', true) : null,
                render_3d: data.render_3d ? getProductoFileUrl(data.render_3d, 'rohermet', true) : null,
                archivo_html: data.archivo_html ? getProductoFileUrl(data.archivo_html, 'rohermet', true) : null,
                ficha_tecnica: data.ficha_tecnica ? getProductoFileUrl(data.ficha_tecnica, 'rohermet', true) : null,
                manual_instalacion: data.manual_instalacion ? getProductoFileUrl(data.manual_instalacion, 'rohermet', true) : null,
                icono1: data.icono1 ? getProductoIconUrl(data.icono1, 'rohermet', true) : null,
                icono2: data.icono2 ? getProductoIconUrl(data.icono2, 'rohermet', true) : null,
                icono3: data.icono3 ? getProductoIconUrl(data.icono3, 'rohermet', true) : null
            }

            const index = productos.value.findIndex(prod => prod.id === id)
            if (index !== -1) {
                productos.value[index] = dataWithUrls
            }

            currentProducto.value = dataWithUrls

            const zipActualizado = Boolean(archivos?.render3d)

            if (zipActualizado) {
                await callUnzipImages(id)
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
        deleteProducto,
        callUnzipImages
    }
}
