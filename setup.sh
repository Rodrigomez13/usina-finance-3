#!/bin/bash

# Actualizar npm
npm install -g npm@latest

# Limpiar caché
npm cache clean --force

# Eliminar node_modules y package-lock.json
rm -rf node_modules
rm -f package-lock.json

# Instalar dependencias
npm install

# Instalar dependencias específicas de shadcn/ui
npm install @radix-ui/react-alert-dialog
npm install @radix-ui/react-alert
npm install @radix-ui/react-aspect-ratio
npm install @radix-ui/react-checkbox
npm install @radix-ui/react-collapsible
npm install @radix-ui/react-context-menu
npm install @radix-ui/react-hover-card
npm install @radix-ui/react-menubar
npm install @radix-ui/react-navigation-menu
npm install @radix-ui/react-progress
npm install @radix-ui/react-radio-group
npm install @radix-ui/react-scroll-area
npm install @radix-ui/react-separator
npm install @radix-ui/react-slider
npm install @radix-ui/react-switch
npm install @radix-ui/react-toast
npm install @radix-ui/react-toggle
npm install @radix-ui/react-tooltip

# Instalar dependencias de desarrollo
npm install -D tailwindcss postcss autoprefixer
npm install -D @tailwindcss/forms
npm install -D @tailwindcss/typography

# Iniciar el servidor de desarrollo
echo "Instalación completada. Iniciando servidor de desarrollo..."
npm run dev
