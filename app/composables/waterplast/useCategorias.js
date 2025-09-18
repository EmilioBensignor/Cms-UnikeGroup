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
                .order('orden', { ascending: true })

            if (supabaseError) throw supabaseError

            const categoriasWithUrls = (data || []).map(categoria => ({
                ...categoria,
                imagen_menu: categoria.imagen_menu ? getCategoriaImageUrl(categoria.imagen_menu) : null,
                imagen_hero_home: categoria.imagen_hero_home ? getCategoriaImageUrl(categoria.imagen_hero_home) : null,
                imagen_pagina_categorias: categoria.imagen_pagina_categorias ? getCategoriaImageUrl(categoria.imagen_pagina_categorias) : null,
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
                imagen_menu: data.imagen_menu ? getCategoriaImageUrl(data.imagen_menu) : null,
                imagen_hero_home: data.imagen_hero_home ? getCategoriaImageUrl(data.imagen_hero_home) : null,
                imagen_pagina_categorias: data.imagen_pagina_categorias ? getCategoriaImageUrl(data.imagen_pagina_categorias) : null,
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


    const updateCategoria = async (id, categoriaData, imagenes, iconos, imagenesRedes) => {
        loading.value = true
        error.value = null

        try {
            const { data: currentData, error: fetchError } = await supabase
                .from('waterplast-categorias')
                .select('nombre, imagen_menu, imagen_hero_home, imagen_pagina_categorias, icono1, icono2, icono3, imagenes_redes')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            const categoriaNombre = currentData?.nombre || 'categoria'

            let imagenMenuPath = currentData?.imagen_menu
            let imagenHeroHomePath = currentData?.imagen_hero_home
            let imagenPaginaCategoriasPath = currentData?.imagen_pagina_categorias
            let iconPaths = {
                icono1: currentData?.icono1,
                icono2: currentData?.icono2,
                icono3: currentData?.icono3
            }
            let imagenesRedesPaths = currentData?.imagenes_redes || []

            if (imagenes.imagenMenu) {
                if (currentData?.imagen_menu) {
                    await deleteCategoriaImage(currentData.imagen_menu)
                }
                imagenMenuPath = await uploadCategoriaImage(imagenes.imagenMenu, categoriaNombre + '-menu')
            }

            if (imagenes.imagenHeroHome) {
                if (currentData?.imagen_hero_home) {
                    await deleteCategoriaImage(currentData.imagen_hero_home)
                }
                imagenHeroHomePath = await uploadCategoriaImage(imagenes.imagenHeroHome, categoriaNombre + '-hero')
            }

            if (imagenes.imagenPaginaCategorias) {
                if (currentData?.imagen_pagina_categorias) {
                    await deleteCategoriaImage(currentData.imagen_pagina_categorias)
                }
                imagenPaginaCategoriasPath = await uploadCategoriaImage(imagenes.imagenPaginaCategorias, categoriaNombre + '-categorias')
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
                imagen_menu: imagenMenuPath,
                imagen_hero_home: imagenHeroHomePath,
                imagen_pagina_categorias: imagenPaginaCategoriasPath,
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
                imagen_menu: data.imagen_menu ? getCategoriaImageUrl(data.imagen_menu) : null,
                imagen_hero_home: data.imagen_hero_home ? getCategoriaImageUrl(data.imagen_hero_home) : null,
                imagen_pagina_categorias: data.imagen_pagina_categorias ? getCategoriaImageUrl(data.imagen_pagina_categorias) : null,
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