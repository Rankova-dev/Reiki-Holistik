## Plan de implementación

### 1. Subir videos al almacenamiento
- Crear bucket de storage para los videos del curso
- Subir los 3 videos: Introducción, Autotratamiento, Tratamiento en camilla
- Insertar registros en `course_content` vinculados a los productos correspondientes

### 2. Reescribir Mi Biblioteca
- Si no está logueado: pantalla con candado + mensaje para animar a comprar
- Si está logueado pero no ha comprado: mensaje invitando a comprar la formación
- Si ha comprado: mostrar barra de progreso con los 3 videos en orden secuencial
- Videos bloqueados hasta ver el anterior
- Al completar todos los videos → redirect al calendario con las sesiones
- Diferenciar grupos: curso completo vs curso por separado

### 3. Actualizar Calendario
- Si no está logueado: pantalla con candado
- Si no ha comprado: mensaje invitando a comprar

### 4. Mover Cuenta del navbar al icono de usuario
- Quitar "Cuenta" de los links de formación
- Click en el icono de usuario → navega a /cuenta

### 5. Pasarela de pago (Stripe)
- Activar Stripe integration
- Crear productos/precios en Stripe
- Implementar flujo de compra desde las tarjetas de formación

### Orden de ejecución:
1. Storage + contenidos en DB (migración)
2. Navbar update
3. Mi Biblioteca rewrite
4. Calendario update  
5. Stripe (requiere que el usuario proporcione su clave)