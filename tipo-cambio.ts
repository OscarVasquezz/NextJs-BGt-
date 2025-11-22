import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { query } from '../../lib/db';

type TipoCambioResult = {
  fecha: string;
  referencia: number;
};

type ApiResponseData = {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseData>
) {
  if (req.method === 'POST') {
    const soapRequest = `
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
        <soap:Body>
          <TipoCambioDia xmlns="http://www.banguat.gob.gt/variables/ws/"/>
        </soap:Body>
      </soap:Envelope>
    `;

    const url = 'https://www.banguat.gob.gt/variables/ws/tipocambio.asmx';
    const apiMethod = 'TipoCambioDia';

    try {
      const { data } = await axios.post(url, soapRequest, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': `http://www.banguat.gob.gt/variables/ws/${apiMethod}`,
        },
      });

      const parser = new XMLParser();
      const parsedData = parser.parse(data);
      const result: TipoCambioResult = parsedData['soap:Envelope']['soap:Body']['TipoCambioDiaResponse']['TipoCambioDiaResult']['CambioDolar']['VarDolar'][0];

      if (!result) {
        throw new Error('No se pudo obtener el tipo de cambio del API.');
      }

      const tipoCambio = {
        fecha: result.fecha,
        referencia: result.referencia,
      };

      const insertQuery = `
        INSERT INTO tipos_cambio (fecha_consulta, fecha_tipo_cambio, tipo_cambio, origen_api)
        VALUES (NOW(), $1, $2, $3)
        RETURNING *;
      `;

      const [day, month, year] = tipoCambio.fecha.split('/');
      const formattedDate = `${year}-${month}-${day}`;

      const values = [formattedDate, tipoCambio.referencia, apiMethod];
      await query(insertQuery, values);

      res.status(200).json({
        success: true,
        data: {
          fecha: tipoCambio.fecha,
          tipo_cambio: tipoCambio.referencia,
        },
      });

    } catch (error: any) {
      console.error('Error al procesar la solicitud:', error);
      res.status(500).json({ success: false, message: 'Error al consultar el tipo de cambio.', error: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const { rows } = await query(
        'SELECT id, fecha_consulta, fecha_tipo_cambio, tipo_cambio, origen_api FROM tipos_cambio ORDER BY fecha_consulta DESC LIMIT 5',
        []
      );

      const formattedRows = rows.map(row => ({
        ...row,
        fecha_consulta: new Date(row.fecha_consulta).toLocaleString('es-GT'),
        fecha_tipo_cambio: new Date(row.fecha_tipo_cambio).toLocaleDateString('es-GT'),
      }));

      res.status(200).json({ success: true, data: formattedRows });
    } catch (error: any) {
      console.error('Error al obtener el historial:', error);
      res.status(500).json({ success: false, message: 'Error al obtener el historial de consultas.', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}