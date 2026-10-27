// Blur is dark with glass surfaces: wherever the dark mode picks an asset, blur picks it too.
export const isDarkMode = (mode: string) => mode === 'dark' || mode === 'blur'
