# 🌤️ Configuración de OpenWeatherMap API

OpenWeatherMap proporciona información del clima actual y pronósticos para ciudades de todo el mundo.

## Paso 1: Obtener tu API Key Gratuita

1. **Ve al sitio de OpenWeatherMap**:
   - Visita: https://openweathermap.org/api
   - O directamente: https://home.openweathermap.org/users/sign_up

2. **Crear una cuenta**:
   - Haz clic en "Sign Up" (Registrarse)
   - Completa el formulario con:
     - Username (nombre de usuario)
     - Email
     - Password (contraseña)
   - Acepta los términos y condiciones
   - Haz clic en "Create Account"

3. **Verificar tu email**:
   - Revisa tu bandeja de entrada
   - Abre el email de verificación de OpenWeatherMap
   - Haz clic en el enlace de verificación

4. **Obtener tu API Key**:
   - Inicia sesión en: https://home.openweathermap.org/
   - En el menú superior, haz clic en tu nombre de usuario
   - Selecciona "API Keys"
   - Verás una API key llamada "Default" (o puedes crear una nueva)
   - **Copia esta API key** (tendrá algo como: `abc123def456...`)

## Paso 2: Configurar la API Key en tu Proyecto

1. **Abre el archivo `.env`** en la carpeta `backend/`
   
2. **Agrega tu API key**:
   ```
   OPENWEATHER_API_KEY=tu_api_key_aqui
   ```
   
   Reemplaza `tu_api_key_aqui` con la API key que copiaste.

3. **Guarda el archivo**

## Paso 3: Instalar Dependencias

Si aún no lo has hecho, instala las dependencias:
```bash
cd backend
pip install -r requirements.txt
```

## Paso 4: Reiniciar el Servidor

Reinicia tu servidor para que cargue la nueva API key:
```bash
uvicorn main:app --reload --port 8000
```

## ✅ Listo!

Ahora cuando alguien pregunte sobre un destino, el asistente automáticamente buscará y mostrará:
- 🌡️ Temperatura actual
- 🌤️ Sensación térmica
- ☁️ Condiciones del clima
- 💧 Humedad
- 💨 Velocidad del viento
- 📊 Presión atmosférica

## 📝 Notas Importantes

- **Plan Gratuito**: La API gratuita permite hasta 60 llamadas por minuto y 1,000,000 llamadas por mes (más que suficiente para uso personal)
- **Activación**: Puede tomar entre 10 minutos y 2 horas para que tu API key se active completamente
- **Seguridad**: NUNCA compartas tu API key ni la subas a repositorios públicos
- **Costos**: El plan gratuito es completamente gratis, sin tarjeta de crédito requerida

## 🐛 Solución de Problemas

**Error: "Invalid API key"**
- Espera 10-60 minutos después de crear la cuenta
- Verifica que copiaste la API key correctamente
- Asegúrate de que no haya espacios antes o después de la key

**Error: "City not found"**
- Verifica que escribiste el nombre de la ciudad correctamente
- Algunas ciudades pueden requerir el nombre completo o incluir el país
- Ejemplo: "Paris,FR" o "New York,US"

## 📚 Recursos

- Documentación oficial: https://openweathermap.org/api
- Soporte: https://openweathermap.org/appid

