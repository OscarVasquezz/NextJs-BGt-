import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { XMLParser } from 'fast-xml-parser';

// Configuración de la conexión a la base de datos PostgreSQL
// Lee las credenciales exclusivamente desde las variables de entorno.
const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});

const BANGUAT_API_URL = 'https://www.banguat.gob.gt/variables/ws/tipocambio.asmx';

/**
 * Maneja las peticiones GET para obtener el historial de consultas.
 */
export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, TO_CHAR(fecha_consulta, \'YYYY-MM-DD HH24:MI:SS\') as fecha_consulta, fecha_tipo_cambio, tipo_cambio, origen_api FROM tipos_cambio ORDER BY id DESC LIMIT 5'
    );
    client.release();

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener el historial:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor al consultar el historial.' },
      { status: 500 }
    );
  }
}

/**
 * Maneja las peticiones POST para consultar el tipo de cambio actual y guardarlo.
 */
export async function POST() {
  const apiMethod = 'TipoCambioDia';

  // 1. Consumir el API SOAP de Banguat
  const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${apiMethod} xmlns="http://www.banguat.gob.gt/variables/ws/" />
  </soap:Body>
</soap:Envelope>`;

  try {
    const response = await fetch(BANGUAT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': `http://www.banguat.gob.gt/variables/ws/${apiMethod}`,
      },
      body: soapRequest,
    });

    if (!response.ok) {
      throw new Error(`Error en la petición al API de Banguat: ${response.statusText}`);
    }

    // 2. Parsear la respuesta XML
    const xmlText = await response.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const jsonObj = parser.parse(xmlText);

    const result = jsonObj['soap:Envelope']['soap:Body']['TipoCambioDiaResponse']['TipoCambioDiaResult']['CambioDolar']['VarDolar'];
    
    if (!result) {
        throw new Error('No se pudo encontrar el tipo de cambio en la respuesta del API.');
    }

    const fechaTipoCambioStr = result.fecha;
    const tipoCambio = parseFloat(result.referencia);

    if (isNaN(tipoCambio)) {
      throw new Error('El tipo de cambio recibido no es un número válido.');
    }

    // Formatear la fecha de 'dd/mm/yyyy' a 'yyyy-mm-dd' para la base de datos
    const [day, month, year] = fechaTipoCambioStr.split('/');
    const fechaTipoCambio = `${year}-${month}-${day}`;

    // 3. Guardar en la base de datos
    const client = await pool.connect();
    try {
      const insertQuery = `
        INSERT INTO tipos_cambio (fecha_tipo_cambio, tipo_cambio, origen_api)
        VALUES ($1, $2, $3)
      `;
      await client.query(insertQuery, [fechaTipoCambio, tipoCambio, apiMethod]);
    } finally {
      client.release();
    }

    // 4. Devolver la respuesta al frontend
    const dataToReturn = {
        fecha: fechaTipoCambioStr,
        tipo_cambio: tipoCambio
    };
    return NextResponse.json({ success: true, data: dataToReturn });

  } catch (error: any) {
    console.error('Error en el proceso de consulta de tipo de cambio:', error);
    
    let errorMessage = 'Ocurrió un error en el servidor.';
    if (error.message) {
        errorMessage = error.message;
    }

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
