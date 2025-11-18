
export const ROUTE_NAMES = {
    // No auth
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: "/forgot-password",
    FORGOT_PASSWORD_CONFIRMATION: "/forgot-password-confirmation",
    RESET_PASSWORD: "/reset-password",
    // Auth
    HOME: '/',
    UNIKE: {
        BLOG: "/blog",
        CREAR_BLOG: "/blog/crear",
        EDITAR_BLOG: (id) => `/blog/editar/${id}`,
        OPINIONES: "/opiniones",
        CREAR_OPINION: "/opiniones/crear",
        EDITAR_OPINION: (id) => `/opiniones/edit/${id}`,
        DISTRIBUIDORES: "/distribuidores",
        CREAR_DISTRIBUIDOR: "/distribuidores/crear",
        EDITAR_DISTRIBUIDOR: (id) => `/distribuidores/edit/${id}`,
    },
    WATERPLAST: {
        CATEGORIAS: "/waterplast/categorias",
        EDITAR_CATEGORIA: (id) => `/waterplast/categorias/edit/${id}`,
        PRODUCTOS: "/waterplast/productos",
        CREAR_PRODUCTO: "/waterplast/productos/create",
        EDITAR_PRODUCTO: (id) => `/waterplast/productos/edit/${id}`,
        IMAGENES_DESTACADAS: "/waterplast/imagenes-destacadas",
        EDITAR_IMAGEN_DESTACADA: (id) => `/waterplast/imagenes-destacadas/edit/${id}`,
    },
    ROHERMET: {
        CATEGORIAS: "/rohermet/categorias",
        EDITAR_CATEGORIA: (id) => `/rohermet/categorias/edit/${id}`,
        PRODUCTOS: "/rohermet/productos",
        CREAR_PRODUCTO: "/rohermet/productos/create",
        EDITAR_PRODUCTO: (id) => `/rohermet/productos/edit/${id}`,
    },
};