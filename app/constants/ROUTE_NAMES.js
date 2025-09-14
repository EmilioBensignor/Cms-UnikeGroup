
export const ROUTE_NAMES = {
    // No auth
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: "/forgot-password",
    FORGOT_PASSWORD_CONFIRMATION: "/forgot-password-confirmation",
    RESET_PASSWORD: "/reset-password",
    // Auth
    HOME: '/',
    WATERPLAST: {
        CATEGORIAS: "/waterplast/categorias",
        EDITAR_CATEGORIA: (id) => `/waterplast/categorias/editar/${id}`,
        PRODUCTOS: "/waterplast/productos",
        CREAR_PRODUCTO: "/waterplast/productos/crear",
        EDITAR_PRODUCTO: (id) => `/waterplast/productos/editar/${id}`,
        OPINIONES: "/waterplast/opiniones",
        CREAR_OPINION: "/waterplast/opiniones/crear",
        EDITAR_OPINION: (id) => `/waterplast/opiniones/editar/${id}`,
        DISTRIBUIDORES: "/waterplast/distribuidores",
        CREAR_DISTRIBUIDOR: "/waterplast/distribuidores/crear",
        EDITAR_DISTRIBUIDOR: (id) => `/waterplast/distribuidores/editar/${id}`,
    },
    // PRODUCTOS_CREAR: '/productos/crear',
    // PRODUCTOS_EDITAR: (id) => `/productos/edit/${id}`,
    // PRODUCTOS_CATEGORIA: (nombre) => `/productos/${encodeURIComponent(nombre)}`,
    // // Reviews
    // REVIEWS: '/reviews',
    // REVIEWS_CREAR: '/reviews/crear',
    // REVIEWS_EDITAR: (id) => `/reviews/edit/${id}`
};