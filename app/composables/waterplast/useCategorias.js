export const useWaterplastCategorias = () => {
    const supabase = useSupabaseClient()
    const {
        uploadCategoriaImage,
        uploadCategoriaIcon,
        uploadCategoriaImagenesRedes,
        deleteCategoriaImage,
        deleteCategoriaIcon,
        deleteCategoriaImagenRed,
        getCategoriaImageUrl,
        getCategoriaIconUrl,
        getCategoriaImagenRedUrl
    } = useStorage()
    const loading = ref(false)
    const categorias = ref([])
    const currentCategoria = ref(null)
    const error = ref(null)

    const fetchCategorias = async () => {
        loading.value = true
        error.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('waterplast-categorias')
                .select('*')
                .order('created_at', { ascending: false })

            if (supabaseError) throw supabaseError

            const categoriasWithUrls = (data || []).map(categoria => ({
                ...categoria,
                imagen: categoria.imagen ? getCategoriaImageUrl(categoria.imagen) : null,
                icono1: categoria.icono1 ? getCategoriaIconUrl(categoria.icono1) : null,
                icono2: categoria.icono2 ? getCategoriaIconUrl(categoria.icono2) : null,
                icono3: categoria.icono3 ? getCategoriaIconUrl(categoria.icono3) : null,
                imagenes_redes: categoria.imagenes_redes ?
                    categoria.imagenes_redes.map((img, index) => ({
                        id: `red-${index}`,
                        name: `imagen-red-${index + 1}.jpg`,
                        url: getCategoriaImagenRedUrl(img)
                    })) : [],
                imagenes_redes_count: categoria.imagenes_redes ? categoria.imagenes_redes.length : 0
            }))

            categorias.value = categoriasWithUrls
        } catch (err) {
            error.value = err.message
            console.error('Error al obtener categorías:', err)
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
                .from('waterplast-categorias')
                .select('*')
                .eq('id', id)
                .single()

            if (supabaseError) throw supabaseError

            const categoriaWithUrls = {
                ...data,
                imagen: data.imagen ? getCategoriaImageUrl(data.imagen) : null,
                icono1: data.icono1 ? getCategoriaIconUrl(data.icono1) : null,
                icono2: data.icono2 ? getCategoriaIconUrl(data.icono2) : null,
                icono3: data.icono3 ? getCategoriaIconUrl(data.icono3) : null,
                imagenes_redes: data.imagenes_redes ?
                    data.imagenes_redes.map((img, index) => ({
                        id: `red-${index}`,
                        name: `imagen-red-${index + 1}.jpg`,
                        url: getCategoriaImagenRedUrl(img)
                    })) : []
            }

            currentCategoria.value = categoriaWithUrls
            return categoriaWithUrls
        } catch (err) {
            error.value = err.message
            console.error('Error al obtener categoría:', err)
            throw err
        } finally {
            loading.value = false
        }
    }


    const updateCategoria = async (id, categoriaData, imagenPrincipal, iconos, imagenesRedes) => {
        loading.value = true
        error.value = null

        try {
            const { data: currentData, error: fetchError } = await supabase
                .from('waterplast-categorias')
                .select('nombre, imagen, icono1, icono2, icono3, imagenes_redes')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            const categoriaNombre = currentData?.nombre || 'categoria'

            let imagenPath = currentData?.imagen
            let iconPaths = {
                icono1: currentData?.icono1,
                icono2: currentData?.icono2,
                icono3: currentData?.icono3
            }
            let imagenesRedesPaths = currentData?.imagenes_redes || []

            if (imagenPrincipal) {
                if (currentData?.imagen) {
                    await deleteCategoriaImage(currentData.imagen)
                }
                imagenPath = await uploadCategoriaImage(imagenPrincipal, categoriaNombre)
            }

            if (iconos.icono1) {
                if (currentData?.icono1) {
                    await deleteCategoriaIcon(currentData.icono1)
                }
                iconPaths.icono1 = await uploadCategoriaIcon(iconos.icono1, categoriaNombre, 1)
            }
            if (iconos.icono2) {
                if (currentData?.icono2) {
                    await deleteCategoriaIcon(currentData.icono2)
                }
                iconPaths.icono2 = await uploadCategoriaIcon(iconos.icono2, categoriaNombre, 2)
            }
            if (iconos.icono3) {
                if (currentData?.icono3) {
                    await deleteCategoriaIcon(currentData.icono3)
                }
                iconPaths.icono3 = await uploadCategoriaIcon(iconos.icono3, categoriaNombre, 3)
            }

            if (imagenesRedes && imagenesRedes.length > 0) {
                if (currentData?.imagenes_redes) {
                    for (const imagen of currentData.imagenes_redes) {
                        await deleteCategoriaImagenRed(imagen)
                    }
                }
                imagenesRedesPaths = await uploadCategoriaImagenesRedes(imagenesRedes, categoriaNombre)
            }

            const finalCategoriaData = {
                ...categoriaData,
                imagen: imagenPath,
                icono1: iconPaths.icono1,
                icono2: iconPaths.icono2,
                icono3: iconPaths.icono3,
                imagenes_redes: imagenesRedesPaths
            }

            delete finalCategoriaData.nombre

            const { data, error: supabaseError } = await supabase
                .from('waterplast-categorias')
                .update(finalCategoriaData)
                .eq('id', id)
                .select()
                .single()

            if (supabaseError) throw supabaseError

            const dataWithUrls = {
                ...data,
                imagen: data.imagen ? getCategoriaImageUrl(data.imagen) : null,
                icono1: data.icono1 ? getCategoriaIconUrl(data.icono1) : null,
                icono2: data.icono2 ? getCategoriaIconUrl(data.icono2) : null,
                icono3: data.icono3 ? getCategoriaIconUrl(data.icono3) : null,
                imagenes_redes: data.imagenes_redes ?
                    data.imagenes_redes.map(img => getCategoriaImagenRedUrl(img)) : []
            }

            const index = categorias.value.findIndex(cat => cat.id === id)
            if (index !== -1) {
                categorias.value[index] = dataWithUrls
            }

            currentCategoria.value = dataWithUrls
            return dataWithUrls
        } catch (err) {
            error.value = err.message
            console.error('Error al actualizar categoría:', err)
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