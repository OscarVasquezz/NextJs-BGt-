## Next.js App Router Course - Starter

This is the starter template for the Next.js App Router Course. It contains the starting code for the dashboard application.

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

## 2. Evidencia en video (máx. 10 minutos) donde se muestre:
o La ejecución del sistema.
o Explicación breve del código.
o Evidencia de los datos guardados en base de datos.

Videdo: https://drive.google.com/drive/folders/119IbO0eChdf813TnDxdIcKlRh5Rkll66?usp=sharing
## Base de Datos
**Esquema.SQL ./docum/**

## Capturas de Pantalla
**Vista Principal:**
NOTA: Se reutilizo el proyecto de NextJs, para realizar este proyecto.
![Iniciando la App](docum/Capturas/01.png)

Nos muestra la interface el localost
![interface](docum/Capturas/02.png)

*Al ingresar muestra el historial de las últimas 5 consultas y el botón para realizar una nueva consulta.*

**Resultado de la Consulta:**
Muestra la tarjeta con el tipo de cambio del día y el historial actualizado con el nuevo registro.

![Consula](docum/Capturas/03.png)

## Evidencia en Video

realizado la consulta, a continuacion se muestra la informacion registrada en la base de datos local
![Verificacion en la Base de Datos](docum/Capturas/04.png)


# Aplicación de Tipo de Cambio - Banco de Guatemala

Este proyecto es una aplicación web que consume el servicio SOAP del Banco de Guatemala (Banguat) para obtener el tipo de cambio del Quetzal (GTQ) frente al Dólar estadounidense (USD). Cada consulta es almacenada en una base de datos y se muestra un historial de las últimas 5 consultas en la pantalla principal.

## Tecnologías Utilizadas

La aplicación esta basada en JavaScript, aprovechando las capacidades de Nextjs.

*   **Framework:** Next.js
*   **Lenguaje:** TypeScript
*   **Estilos:** Tailwind CSS
*   **Base de Datos:** PostgreSQL

## Instalación y Ejecución
### Prerrequisitos

*   Node.js (v18.17 o superior)
*   Un gestor de paquetes como `pnpm`
*   Una instancia de base de datos en nuesto caso **PostgreSQL**.

### Instalar Dependencias

```bash
npm install
```

### Configurar la Base de Datos

1.  Crear una base de datos.
2.  Importa el esquema de la base de datos que se encuentra en `docum/esquema.sql`. Esto creará la tabla `exchange_rate_logs`.
3.  Configura las variables de entorno. Renombra el archivo `.env.example` a `.env` y añade las credenciales de tu base de datos:

    ```env
    POSTGRES_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    ```

### Ejecutar la Aplicación

```bash
pnpm dev
```

Abre http://localhost:3000 en tu navegador para ver la aplicación.

## Consumo del API de Banguat

La aplicación se conecta al servicio web SOAP del Banco de Guatemala para obtener información actualizada del tipo de cambio.

*   **Endpoint:** `https://www.banguat.gob.gt/variables/ws/tipocambio.asmx`
*   **Método Utilizado:** `TipoCambioDia`

El proceso para consumir el API es el siguiente:

1.  **Solicitud SOAP:** Se realiza una petición `POST` al endpoint con un cuerpo (body) en formato XML que especifica el método `TipoCambioDia`.
2.  **Recepción de Datos:** El API responde con un documento XML que contiene la información del tipo de cambio.
3.  **Parseo de XML:** Se utiliza la librería `fast-xml-parser` para convertir la respuesta XML en un objeto JSON, facilitando así la extracción de los datos.
4.  **Extracción de Datos:** Se navega por el objeto JSON resultante para obtener la fecha del tipo de cambio y el valor de la compra.

Este proceso se encapsula en una función del lado del servidor, asegurando que la lógica de consumo del API no se exponga al cliente.

## Esquema de Base de Datos

Cada consulta exitosa al API se almacena en la base de datos para llevar un registro histórico. La tabla utilizada tiene la siguiente estructura:

```sql
CREATE TABLE exchange_rate_logs (
    id SERIAL PRIMARY KEY,
    fecha_consulta TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_tipo_cambio DATE NOT NULL,
    tipo_cambio DECIMAL(10, 4) NOT NULL,
    origen_api VARCHAR(50) NOT NULL
);
```

*   `id`: Identificador único autoincremental.
*   `fecha_consulta`: Fecha y hora en que se realizó la consulta al API.
*   `fecha_tipo_cambio`: La fecha del tipo de cambio devuelta por el API.
*   `tipo_cambio`: El valor del tipo de cambio.
*   `origen_api`: El método del API de Banguat que se utilizó (ej. `TipoCambioDia`).