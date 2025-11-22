import { useState, useEffect } from 'react';

import { useState, useEffect } from 'react';

// Definimos los tipos para nuestros datos
interface TipoCambio {
  fecha: string;
  tipo_cambio: number;
}

interface HistorialItem {
  id: number;
  fecha_consulta: string;
  fecha_tipo_cambio: string;
  tipo_cambio: string; // La BD lo devuelve como string
  origen_api: string;
}

export default function HomePage() {
  const [tipoCambio, setTipoCambio] = useState<TipoCambio | null>(null);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistorial = async () => {
    try {
      const res = await fetch('/api/tipo-cambio');
      const data = await res.json();
      if (data.success) {
        setHistorial(data.data);
      } else {
        throw new Error(data.message || 'Error al cargar el historial.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Cargar historial inicial al montar el componente
  useEffect(() => {
    fetchHistorial();
  }, []);

  const handleConsultar = async () => {
    setLoading(true);
    setError(null);
    setTipoCambio(null);

    try {
      const res = await fetch('/api/tipo-cambio', { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Ocurrió un error en el servidor.');
      }

      setTipoCambio(data.data);
      // Refrescar el historial después de una nueva consulta exitosa
      await fetchHistorial();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Tipo de Cambio del Dólar (GTQ)</h1>
      <p>Consulta el tipo de cambio oficial del Banco de Guatemala.</p>

      <button onClick={handleConsultar} disabled={loading}>
        {loading ? 'Consultando...' : 'Consultar Tipo de Cambio'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '15px' }}><strong>Error:</strong> {error}</p>}

      {tipoCambio && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h2>Resultado de la Consulta</h2>
          <p><strong>Fecha consultada:</strong> {new Date().toLocaleDateString('es-GT')}</p>
          <p><strong>Fecha del tipo de cambio:</strong> {tipoCambio.fecha}</p>
          <p><strong>Tipo de cambio:</strong> Q {tipoCambio.tipo_cambio}</p>
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <h2>Historial de Últimas 5 Consultas</h2>
        {historial.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Fecha de Consulta</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Fecha de T/C</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Tipo de Cambio</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>API</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.id}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.fecha_consulta}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.fecha_tipo_cambio}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.tipo_cambio}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.origen_api}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay consultas en el historial.</p>
        )}
      </div>
    </div>
  );
}