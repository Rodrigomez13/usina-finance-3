#!/bin/bash

echo "Eliminando node_modules y archivos de caché..."
rm -rf node_modules
rm -rf .next
rm -f package-lock.json
rm -f yarn.lock
rm -f pnpm-lock.yaml

echo "Instalando dependencias..."
npm install

echo "Instalando dependencias específicas..."
npm install @supabase/supabase-js

echo "Ejecutando npm audit fix..."
npm audit fix

echo "Iniciando el servidor de desarrollo..."
npm run dev
