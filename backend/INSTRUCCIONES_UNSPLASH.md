# 📸 Configuración de Unsplash API

Unsplash proporciona una colección increíble de fotos de alta calidad de destinos turísticos alrededor del mundo.

## Paso 1: Obtener tu API Key Gratuita

1. **Ve al sitio de Unsplash**:
   - Visita: https://unsplash.com/developers
   - O directamente: https://unsplash.com/oauth/applications

2. **Crear una cuenta**:
   - Si no tienes cuenta, haz clic en "Sign up" (Registrarse)
   - Completa el formulario con:
     - Nombre
     - Email
     - Password (contraseña)
   - Verifica tu email si es necesario

3. **Crear una nueva aplicación**:
   - Inicia sesión en: https://unsplash.com/oauth/applications
   - Haz clic en "New application" (Nueva aplicación)
   - Completa el formulario:
     - **Application name**: ViajeIA (o el nombre que prefieras)
     - **Description**: Aplicación de asistente de viajes que muestra fotos de destinos
     - Acepta los términos y condiciones
     - Haz clic en "Create application"

4. **Obtener tu Access Key**:
   - Una vez creada la aplicación, verás tu **Application ID**
   - También verás **Application Secret** (no necesitas este para la API pública)
   - **Copia el "Access Key"** o "Access ID" (será algo como: `abc123def456...`)
   - Este es tu `UNSPLASH_ACCESS_KEY`

## Paso 2: Configurar la API Key en tu Proyecto

1. **Abre el archivo `.env`** en la carpeta `backend/`
   
2. **Agrega tu Access Key**:
   ```
   UNSPLASH_ACCESS_KEY=tu_access_key_aqui
   ```
   
   Reemplaza `tu_access_key_aqui` con el Access Key que copiaste.

3. **Guarda el archivo**

## Paso 3: Reiniciar el Servidor

Reinicia tu servidor para que cargue la nueva API key:
```bash
uvicorn main:app --reload --port 8000
```

## ✅ Listo!

Ahora cuando alguien pregunte sobre un destino, el asistente automáticamente:
1. Buscará el destino mencionado
2. Obtendrá 3 fotos hermosas del lugar desde Unsplash
3. Las mostrará en la interfaz antes de la respuesta del asistente

## 📝 Notas Importantes

- **Plan Gratuito**: La API gratuita permite hasta 50 solicitudes por hora (más que suficiente para uso personal)
- **Atribución**: Las fotos incluyen automáticamente el crédito al fotógrafo (requerido por Unsplash)
- **Calidad**: Las fotos son de alta calidad y están optimizadas para web
- **Búsqueda**: Las fotos se buscan usando el nombre del destino + "travel tourism" para mejores resultados
- **Seguridad**: NUNCA compartas tu Access Key ni la subas a repositorios públicos

## 🐛 Solución de Problemas

**Error: "Unauthorized" o 401**
- Verifica que copiaste el Access Key correctamente (no el Application Secret)
- Asegúrate de que no haya espacios antes o después de la key
- Verifica que la aplicación esté activa en Unsplash

**No aparecen fotos**
- Verifica que el destino se detectó correctamente
- Algunos destinos muy específicos o con nombres únicos pueden no tener resultados
- Revisa los logs del servidor para ver si hay errores

**Las fotos son muy grandes**
- Las fotos se cargan en tamaño "regular" (balance entre calidad y velocidad)
- Se usa lazy loading para mejorar el rendimiento
- Las imágenes se optimizan automáticamente por el navegador

## 📚 Recursos

- Documentación oficial: https://unsplash.com/documentation
- Términos de uso: https://unsplash.com/api/terms
- Soporte: https://help.unsplash.com/

