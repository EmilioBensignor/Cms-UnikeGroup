export const useMurallonBlog = () => {
    const supabase = useSupabaseClient()
    const {
        uploadMurallonBlogImage,
        deleteMurallonBlogImage,
        getMurallonBlogImageUrl
    } = useStorage()
    const loading = ref(false)
    const blogs = ref([])
    const currentBlog = ref(null)
    const error = ref(null)

    const fetchBlogs = async () => {
        loading.value = true
        error.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('blog-murallon')
                .select('*')
                .order('fecha', { ascending: false })

            if (supabaseError) throw supabaseError

            const blogsWithUrls = (data || []).map(blog => ({
                ...blog,
                imagen_principal: blog.imagen_principal ? getMurallonBlogImageUrl(blog.imagen_principal) : null,
                imagen_principal_path: blog.imagen_principal
            }))

            blogs.value = blogsWithUrls
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const fetchBlogById = async (id) => {
        loading.value = true
        error.value = null
        currentBlog.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('blog-murallon')
                .select('*')
                .eq('id', id)
                .single()

            if (supabaseError) throw supabaseError

            // Traer productos recomendados asociados al blog
            const productosRecomendados = await fetchProductosRecomendados(id)

            currentBlog.value = {
                ...data,
                imagen_principal: data.imagen_principal ? getMurallonBlogImageUrl(data.imagen_principal) : null,
                imagen_principal_path: data.imagen_principal,
                productos_recomendados: productosRecomendados
            }
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    // Trae productos recomendados de un blog ordenados por orden asc (nulls al final)
    const fetchProductosRecomendados = async (blogId) => {
        try {
            const { getMurallonProductoImageUrl } = useStorage()

            const { data, error: supabaseError } = await supabase
                .from('blog-murallon-productos')
                .select(`
                    orden,
                    producto:producto_id (
                        id,
                        nombre,
                        slug,
                        imagen_principal,
                        descripcion
                    )
                `)
                .eq('blog_id', blogId)
                .order('orden', { ascending: true, nullsFirst: false })

            if (supabaseError) throw supabaseError

            return (data || [])
                .filter(item => item.producto)
                .map(item => ({
                    id: item.producto.id,
                    nombre: item.producto.nombre,
                    slug: item.producto.slug,
                    descripcion: item.producto.descripcion,
                    imagen_principal: item.producto.imagen_principal
                        ? getMurallonProductoImageUrl(item.producto.imagen_principal, true)
                        : null,
                    imagen_principal_path: item.producto.imagen_principal,
                    orden: item.orden
                }))
        } catch (err) {
            console.warn('Error al traer productos recomendados:', err)
            return []
        }
    }

    // Reemplaza el set completo de productos recomendados de un blog.
    // Estrategia: borrar todos los existentes e insertar los nuevos en orden.
    const saveProductosRecomendados = async (blogId, productoIds = []) => {
        const { error: deleteError } = await supabase
            .from('blog-murallon-productos')
            .delete()
            .eq('blog_id', blogId)

        if (deleteError) throw deleteError

        if (!productoIds.length) return []

        const rows = productoIds.map((producto_id, index) => ({
            blog_id: blogId,
            producto_id,
            orden: index + 1
        }))

        const { data, error: insertError } = await supabase
            .from('blog-murallon-productos')
            .insert(rows)
            .select()

        if (insertError) throw insertError

        return data
    }

    // Elimina un producto recomendado puntual de un blog.
    const removeProductoRecomendado = async (blogId, productoId) => {
        const { error: deleteError } = await supabase
            .from('blog-murallon-productos')
            .delete()
            .eq('blog_id', blogId)
            .eq('producto_id', productoId)

        if (deleteError) throw deleteError
    }

    const generateSlug = (titulo) => {
        return titulo.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/^-+|-+$/g, '')
    }

    const createBlog = async (blogData, imagenFile, productosRecomendados = []) => {
        loading.value = true
        error.value = null

        try {
            let imagenPath = null

            if (imagenFile) {
                imagenPath = await uploadMurallonBlogImage(imagenFile, blogData.titulo)
            }

            const slug = generateSlug(blogData.titulo)

            const { data, error: supabaseError } = await supabase
                .from('blog-murallon')
                .insert([{
                    titulo: blogData.titulo,
                    slug: slug,
                    imagen_principal: imagenPath,
                    contenido: blogData.contenido,
                    fecha: blogData.fecha || new Date().toISOString().split('T')[0]
                }])
                .select()

            if (supabaseError) throw supabaseError

            const blogCreado = data[0]

            // Persistir productos recomendados asociados al blog recién creado
            if (Array.isArray(productosRecomendados) && productosRecomendados.length > 0) {
                try {
                    await saveProductosRecomendados(blogCreado.id, productosRecomendados)
                } catch (err) {
                    console.warn('Error al guardar productos recomendados:', err)
                }
            }

            return blogCreado
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateBlog = async (id, blogData, imagenFile, productosRecomendados = null) => {
        loading.value = true
        error.value = null

        try {
            const { data: dataBlog, error: fetchError } = await supabase
                .from('blog-murallon')
                .select('imagen_principal')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            let imagenPath = dataBlog.imagen_principal

            if (!imagenFile && !dataBlog.imagen_principal && !blogData.imagen_principal) {
                throw new Error('No se puede actualizar un blog sin imagen. El blog debe tener una imagen principal.')
            }

            if (imagenFile) {
                if (dataBlog.imagen_principal) {
                    try {
                        await deleteMurallonBlogImage(dataBlog.imagen_principal)
                    } catch (err) {
                        console.warn('Error al borrar imagen anterior:', err)
                    }
                }
                imagenPath = await uploadMurallonBlogImage(imagenFile, blogData.titulo)
            } else if (blogData.imagenFueEliminada === true) {
                throw new Error('No se puede actualizar un blog sin imagen. Debe proporcionar una imagen principal.')
            } else if (blogData.imagen_principal !== undefined && blogData.imagen_principal !== null) {
                imagenPath = blogData.imagen_principal
            } else {
                imagenPath = dataBlog.imagen_principal
            }

            const slug = generateSlug(blogData.titulo)

            const { data, error: supabaseError } = await supabase
                .from('blog-murallon')
                .update({
                    titulo: blogData.titulo,
                    slug: slug,
                    imagen_principal: imagenPath,
                    contenido: blogData.contenido,
                    fecha: blogData.fecha
                })
                .eq('id', id)
                .select()

            if (supabaseError) throw supabaseError

            // Si vino el array de productos recomendados, reemplazar el set completo
            if (Array.isArray(productosRecomendados)) {
                try {
                    await saveProductosRecomendados(id, productosRecomendados)
                } catch (err) {
                    console.warn('Error al actualizar productos recomendados:', err)
                }
            }

            return data[0]
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteBlog = async (id) => {
        loading.value = true
        error.value = null

        try {
            const { data: dataBlog, error: fetchError } = await supabase
                .from('blog-murallon')
                .select('imagen_principal, titulo')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            if (dataBlog.imagen_principal) {
                try {
                    await deleteMurallonBlogImage(dataBlog.imagen_principal)
                } catch (err) {
                    console.warn('Error al borrar imagen:', err)
                }
            }

            const { error: supabaseError } = await supabase
                .from('blog-murallon')
                .delete()
                .eq('id', id)

            if (supabaseError) throw supabaseError

            blogs.value = blogs.value.filter(blog => blog.id !== id)
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        loading: readonly(loading),
        blogs: readonly(blogs),
        currentBlog: readonly(currentBlog),
        error: readonly(error),
        fetchBlogs,
        fetchBlogById,
        createBlog,
        updateBlog,
        deleteBlog,
        fetchProductosRecomendados,
        saveProductosRecomendados,
        removeProductoRecomendado
    }
}
