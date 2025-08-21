Perfecto 🙌, este script en **Google Apps Script** está enfocado en exportar datos de inquilinos desde una hoja de cálculo hacia tu API de Back-Bot.
Te armé un `README.md` con documentación clara, profesional y con el sello de **Didi & Jaqui** 👩‍💻👇

---

````markdown
# 🏠 Back-Bot Sheets Exporter  

> Script en **Google Apps Script** para exportar inquilinos desde Google Sheets hacia la API de Back-Bot, con soporte para encabezados en español e inglés, validaciones, backups y logs.  

---

## ✨ Funcionalidades principales
- 📤 **Exportar inquilinos** desde la hoja `INQUILINOS NOTIFICACIONES` hacia la API.  
- 🌍 **Soporte bilingüe (ES/EN)** en encabezados de columnas (ej: `nombre` / `name`, `telefono` / `number`).  
- ✅ **Validación automática** de columnas requeridas antes de enviar.  
- 📅 **Formateo de fechas** en formato `yyyy-MM-dd`.  
- 🔔 **Campo booleano** para recordatorios (`reminder_activated`).  
- 📑 **Marcado automático de estado** en la hoja después de cada exportación.  
- 🗂️ **Generación de backups** con timestamp en nuevas pestañas.  
- 📝 **Logs centralizados** en una hoja llamada `Logs`.  
- 📋 **Menú personalizado en Google Sheets** con las acciones más usadas.  

---

## 📂 Estructura del Script

| 🚀 Función | 📖 Descripción |
|------------|----------------|
| `exportarInquilinos()` | Procesa la hoja de inquilinos, valida datos y los envía al endpoint de Back-Bot. |
| `mostrarMensaje(msg)` | Muestra alertas al usuario o escribe mensajes en la hoja si no hay UI. |
| `mostrarLogs()` | Vuelca el `Logger` en una hoja llamada `Logs` para depuración. |
| `crearBackupDatos()` | Crea una copia completa de los datos en una nueva pestaña con fecha/hora. |
| `onOpen()` | Crea un menú en Google Sheets llamado **Back-Bot** con accesos directos. |

---

## 🚀 Cómo usarlo

1. Abre tu [Google Apps Script](https://script.google.com/).  
2. Copia el contenido del script dentro de tu proyecto vinculado al **Google Sheet**.  
3. Asegúrate de tener la hoja llamada **`INQUILINOS NOTIFICACIONES`** con estas columnas mínimas:  

   - `nombre` / `name`  
   - `telefono` / `number`  
   - `fecha_entrada` / `entry_date`  
   - `fecha_salida` / `exit_date`  
   - `fecha_reserva` / `reservation_date`  
   - `reminder_activated` / `recordatorio_activado`  
   - `address` / `piso` / `direccion`  

4. Ajusta la URL de la API en el script si es necesario:  
   ```js
   const API_URL = 'https://back-bot-4pfj.onrender.com/api/tenants/from-sheet';
````

5. Vuelve a tu hoja de cálculo → menú superior → verás el menú **Back-Bot** con las opciones:

   * ▶️ *Exportar Inquilinos*
   * 📑 *Ver Logs*
   * 💾 *Crear Backup*

---

## 📦 Ejemplo de Payload enviado

```json
{
  "inquilinos": [
    {
      "nombre": "Juan Pérez",
      "telefono": "+34600111222",
      "fecha_entrada": "2025-09-01",
      "fecha_salida": "2025-09-10",
      "fecha_reserva": "2025-08-15",
      "reminder_activated": true,
      "address": "Calle Mayor 123"
    }
  ]
}
```

---

## ⚠️ Validaciones implementadas

* ❌ Si falta alguna columna requerida → se muestra error y no se envía nada.
* ❌ Si la fila está vacía o incompleta → se ignora.
* ✅ Solo se exportan filas **completas y válidas**.
* ✅ Se marca la fecha/hora en la hoja para cada fila enviada exitosamente.

---

## 👀 Demo visual

*(Se recomienda añadir capturas de: la hoja de inquilinos, logs generados y el backup creado automáticamente)*

---

## ✨ Autoras

👩‍💻 **Jaqui**
⚡ Expertas en automatización con Google Apps Script y APIs backend.

---

### 🌟 ¿Por qué es un proyecto top?

✔️ Elimina el trabajo manual al exportar inquilinos.
✔️ Asegura calidad de datos con validaciones y logs.
✔️ Integra Google Sheets directamente con tu backend.
✔️ Incluye herramientas de backup y depuración para máxima confiabilidad.

```

---

¿Quieres que te arme también una **plantilla de hoja de Google Sheets de ejemplo** (con columnas correctas en ES/EN) para que la pongas en el README como guía visual para los usuarios?
```
