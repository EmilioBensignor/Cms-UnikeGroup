export const useRohermetCategorias = () => {
    const supabase = useSupabaseClient()
    const {
        uploadRohermetCategoriaImage,
        deleteRohermetCategoriaImage,
        getRohermetCategoriaImageUrl,
        uploadCategoriaImage,
        deleteCategoriaImage,
        getCategoriaImageUrl,
        uploadCategoriaIcon,
        deleteCategoriaIcon,
        getCategoriaIconUrl,
        uploadCategoriaImagenesRedes,
        deleteCategoriaImagenRed,
        getCategoriaImagenRedUrl
    } = useStorage()
    const loading = ref(false)
    const categorias = ref([])
    const currentCategoria = ref(null)
    const error = ref(null)

    const marca = 'rohermet'

    const fetchCategorias = async () => {
        loading.value = true
        error.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('rohermet-categorias')
                .select('*')
                .order('orden', { ascending: true })

            if (supabaseError) throw supabaseError

            const categoriasWithUrls = (data || []).map(categoria => ({
                ...categoria,
                imagen: categoria.imagen ? getRohermetCategoriaImageUrl(categoria.imagen) : null,
                imagen_xl_categorias: categoria.imagen_xl_categorias ? getCategoriaImageUrl(categoria.imagen_xl_categorias, marca) : null,
                imagen_l_categorias: categoria.imagen_l_categorias ? getCategoriaImageUrl(categoria.imagen_l_categorias, marca) : null,
                imagen_m_categorias: categoria.imagen_m_categorias ? getCategoriaImageUrl(categoria.imagen_m_categorias, marca) : null,
                imagen_s_categorias: categoria.imagen_s_categorias ? getCategoriaImageUrl(categoria.imagen_s_categorias, marca) : null,
                icono1: categoria.icono1 ? getCategoriaIconUrl(categoria.icono1, marca) : null,
                icono2: categoria.icono2 ? getCategoriaIconUrl(categoria.icono2, marca) : null,
                icono3: categoria.icono3 ? getCategoriaIconUrl(categoria.icono3, marca) : null,
                imagenes_redes: categoria.imagenes_redes ?
                    categoria.imagenes_redes.map((img, index) => ({
                        id: `red-${index}`,
                        name: `imagen-red-${index + 1}.jpg`,
                        url: getCategoriaImagenRedUrl(img, marca)
                    })) : [],
                imagenes_redes_count: categoria.imagenes_redes ? categoria.imagenes_redes.length : 0
            }))

            categorias.value = categoriasWithUrls
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const fetchCategoriaById = async (id) => {
        loading.value = true
        error.value = null
        currentCategoria.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('rohermet-categorias')
                .select('*')
                .eq('id', id)
                .single()

            if (supabaseError) throw supabaseError

            const categoriaWithUrls = {
                ...data,
                imagen: data.imagen ? getRohermetCategoriaImageUrl(data.imagen) : null,
                imagen_xl_categorias: data.imagen_xl_categorias ? getCategoriaImageUrl(data.imagen_xl_categorias, marca) : null,
                imagen_l_categorias: data.imagen_l_categorias ? getCategoriaImageUrl(data.imagen_l_categorias, marca) : null,
                imagen_m_categorias: data.imagen_m_categorias ? getCategoriaImageUrl(data.imagen_m_categorias, marca) : null,
                imagen_s_categorias: data.imagen_s_categorias ? getCategoriaImageUrl(data.imagen_s_categorias, marca) : null,
                icono1: data.icono1 ? getCategoriaIconUrl(data.icono1, marca) : null,
                icono2: data.icono2 ? getCategoriaIconUrl(data.icono2, marca) : null,
                icono3: data.icono3 ? getCategoriaIconUrl(data.icono3, marca) : null,
                imagenes_redes: data.imagenes_redes ?
                    data.imagenes_redes.map((img, index) => ({
                        id: `red-${index}`,
                        name: `imagen-red-${index + 1}.jpg`,
                        url: getCategoriaImagenRedUrl(img, marca),
                        storagePath: img
                    })) : []
            }

            currentCategoria.value = categoriaWithUrls
            return categoriaWithUrls
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateCategoria = async (id, categoriaData, imagenes, iconos, imagenesRedes, removedImages = {}) => {
        loading.value = true
        error.value = null

        try {
            const { data: currentData, error: fetchError } = await supabase
                .from('rohermet-categorias')
                .select('nombre, imagen, imagen_xl_categorias, imagen_l_categorias, imagen_m_categorias, imagen_s_categorias, icono1, icono2, icono3, imagenes_redes')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            const categoriaNombre = currentData?.nombre || 'categoria'

            let imagenPath = currentData?.imagen
            let imagenXLCategoriasPath = currentData?.imagen_xl_categorias
            let imagenLCategoriasPath = currentData?.imagen_l_categorias
            let imagenMCategoriasPath = currentData?.imagen_m_categorias
            let imagenSCategoriasPath = currentData?.imagen_s_categorias
            let iconPaths = {
                icono1: currentData?.icono1,
                icono2: currentData?.icono2,
                icono3: currentData?.icono3
            }
            let imagenesRedesPaths = currentData?.imagenes_redes || []

            if (removedImages.imagen) {
                if (currentData?.imagen) await deleteRohermetCategoriaImage(currentData.imagen)
                imagenPath = null
            } else if (imagenes.imagen) {
                if (currentData?.imagen) await deleteRohermetCategoriaImage(currentData.imagen)
                imagenPath = await uploadRohermetCategoriaImage(imagenes.imagen, categoriaNombre)
            }

            if (removedImages.imagenXLCategorias) {
                if (currentData?.imagen_xl_categorias) await deleteCategoriaImage(currentData.imagen_xl_categorias, marca)
                imagenXLCategoriasPath = null
            } else if (imagenes.imagenXLCategorias) {
                if (currentData?.imagen_xl_categorias) await deleteCategoriaImage(currentData.imagen_xl_categorias, marca)
                imagenXLCategoriasPath = await uploadCategoriaImage(imagenes.imagenXLCategorias, categoriaNombre + '-xl-categorias', marca)
            }

            if (removedImages.imagenLCategorias) {
                if (currentData?.imagen_l_categorias) await deleteCategoriaImage(currentData.imagen_l_categorias, marca)
                imagenLCategoriasPath = null
            } else if (imagenes.imagenLCategorias) {
                if (currentData?.imagen_l_categorias) await deleteCategoriaImage(currentData.imagen_l_categorias, marca)
                imagenLCategoriasPath = await uploadCategoriaImage(imagenes.imagenLCategorias, categoriaNombre + '-l-categorias', marca)
            }

            if (removedImages.imagenMCategorias) {
                if (currentData?.imagen_m_categorias) await deleteCategoriaImage(currentData.imagen_m_categorias, marca)
                imagenMCategoriasPath = null
            } else if (imagenes.imagenMCategorias) {
                if (currentData?.imagen_m_categorias) await deleteCategoriaImage(currentData.imagen_m_categorias, marca)
                imagenMCategoriasPath = await uploadCategoriaImage(imagenes.imagenMCategorias, categoriaNombre + '-m-categorias', marca)
            }

            if (removedImages.imagenSCategorias) {
                if (currentData?.imagen_s_categorias) await deleteCategoriaImage(currentData.imagen_s_categorias, marca)
                imagenSCategoriasPath = null
            } else if (imagenes.imagenSCategorias) {
                if (currentData?.imagen_s_categorias) await deleteCategoriaImage(currentData.imagen_s_categorias, marca)
                imagenSCategoriasPath = await uploadCategoriaImage(imagenes.imagenSCategorias, categoriaNombre + '-s-categorias', marca)
            }

            if (removedImages.icono1) {
                if (currentData?.icono1) await deleteCategoriaIcon(currentData.icono1, marca)
                iconPaths.icono1 = null
            } else if (iconos.icono1) {
                if (currentData?.icono1) await deleteCategoriaIcon(currentData.icono1, marca)
                iconPaths.icono1 = await uploadCategoriaIcon(iconos.icono1, categoriaNombre, 1, marca)
            }

            if (removedImages.icono2) {
                if (currentData?.icono2) await deleteCategoriaIcon(currentData.icono2, marca)
                iconPaths.icono2 = null
            } else if (iconos.icono2) {
                if (currentData?.icono2) {
                    await deleteCategoriaIcon(currentData.icono2, marca)
                }
                iconPaths.icono2 = await uploadCategoriaIcon(iconos.icono2, categoriaNombre, 2, marca)
            }
            if (removedImages.icono3) {
                if (currentData?.icono3) await deleteCategoriaIcon(currentData.icono3, marca)
                iconPaths.icono3 = null
            } else if (iconos.icono3) {
                if (currentData?.icono3) await deleteCategoriaIcon(currentData.icono3, marca)
                iconPaths.icono3 = await uploadCategoriaIcon(iconos.icono3, categoriaNombre, 3, marca)
            }

            if (imagenesRedes && Array.isArray(imagenesRedes) && imagenesRedes.length > 0) {
                const imagenesExistentesQueSeMantienen = imagenesRedes
                    .filter(img => img.isExisting && img.storagePath)
                    .map(img => img.storagePath)

                const nuevasImagenes = imagenesRedes.filter(img => img.file && !img.isExisting)
                const imagenesAntiguasEnDB = currentData?.imagenes_redes || []

                const imagenesAEliminar = imagenesAntiguasEnDB.filter(
                    imgDB => !imagenesExistentesQueSeMantienen.includes(imgDB)
                )

                if (imagenesAEliminar.length > 0) {
                    for (const imagen of imagenesAEliminar) {
                        await deleteCategoriaImagenRed(imagen, marca)
                    }
                }

                let pathsNuevasImagenes = []
                if (nuevasImagenes.length > 0) {
                    pathsNuevasImagenes = await uploadCategoriaImagenesRedes(nuevasImagenes, categoriaNombre, marca)
                }

                imagenesRedesPaths = []
                for (const img of imagenesRedes) {
                    if (img.isExisting && img.storagePath) {
                        imagenesRedesPaths.push(img.storagePath)
                    } else if (img.file && !img.isExisting) {
                        const indexNueva = nuevasImagenes.findIndex(n => n.id === img.id)
                        if (indexNueva !== -1 && pathsNuevasImagenes[indexNueva]) {
                            imagenesRedesPaths.push(pathsNuevasImagenes[indexNueva])
                        }
                    }
                }
            } else {
                if (currentData?.imagenes_redes && currentData.imagenes_redes.length > 0) {
                    for (const imagen of currentData.imagenes_redes) {
                        await deleteCategoriaImagenRed(imagen, marca)
                    }
                }
                imagenesRedesPaths = []
            }

            const finalCategoriaData = {
                ...categoriaData,
                imagen: imagenPath,
                imagen_xl_categorias: imagenXLCategoriasPath,
                imagen_l_categorias: imagenLCategoriasPath,
                imagen_m_categorias: imagenMCategoriasPath,
                imagen_s_categorias: imagenSCategoriasPath,
                icono1: iconPaths.icono1,
                icono2: iconPaths.icono2,
                icono3: iconPaths.icono3,
                imagenes_redes: imagenesRedesPaths
            }

            delete finalCategoriaData.nombre

            const { data, error: supabaseError } = await supabase
                .from('rohermet-categorias')
                .update(finalCategoriaData)
                .eq('id', id)
                .select()
                .single()

            if (supabaseError) throw supabaseError

            const dataWithUrls = {
                ...data,
                imagen: data.imagen ? getRohermetCategoriaImageUrl(data.imagen) : null,
                imagen_xl_categorias: data.imagen_xl_categorias ? getCategoriaImageUrl(data.imagen_xl_categorias, marca) : null,
                imagen_l_categorias: data.imagen_l_categorias ? getCategoriaImageUrl(data.imagen_l_categorias, marca) : null,
                imagen_m_categorias: data.imagen_m_categorias ? getCategoriaImageUrl(data.imagen_m_categorias, marca) : null,
                imagen_s_categorias: data.imagen_s_categorias ? getCategoriaImageUrl(data.imagen_s_categorias, marca) : null,
                icono1: data.icono1 ? getCategoriaIconUrl(data.icono1, marca) : null,
                icono2: data.icono2 ? getCategoriaIconUrl(data.icono2, marca) : null,
                icono3: data.icono3 ? getCategoriaIconUrl(data.icono3, marca) : null,
                imagenes_redes: data.imagenes_redes ?
                    data.imagenes_redes.map(img => getCategoriaImagenRedUrl(img, marca)) : []
            }

            const index = categorias.value.findIndex(cat => cat.id === id)
            if (index !== -1) {
                categorias.value[index] = dataWithUrls
            }

            currentCategoria.value = dataWithUrls
            return dataWithUrls
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        categorias,
        currentCategoria,
        loading,
        error,
        fetchCategorias,
        fetchCategoriaById,
        updateCategoria
    }
}
