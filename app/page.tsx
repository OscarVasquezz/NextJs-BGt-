'use client'; // Directiva necesaria para usar hooks de React en el App Router

import { useState, useEffect } from 'react';
import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';

// Tipos para los datos
interface TipoCambio {
  fecha: string;
  tipo_cambio: number;
  rango?: any[]; // Opcional para los resultados de TipoCambioRango
}

interface HistorialItem {
  id: number; // Asumiendo que el ID es numérico
  fecha_consulta: string;
  fecha_tipo_cambio: string;
  tipo_cambio: string; // La BD lo devuelve como string, se podría parsear a número si es necesario
  origen_api: string;
}

export default function HomePage() {
  const [tipoCambio, setTipoCambio] = useState<TipoCambio | null>(null);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistorial = async () => {
    try { // La ruta de API en /api sigue funcionando correctamente con el App Router
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
      const res = await fetch('/api/tipo-cambio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
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

  /**
   * Formatea una fecha al formato guatemalteco (dd mmm aaaa).
   * @param dateInput La fecha a formatear (string o Date).
   */
  const formatGuatemalaDate = (dateInput: string | Date): string => {
    let date: Date;
    if (typeof dateInput === 'string') {
      // Maneja formatos 'dd/mm/yyyy' y 'yyyy-mm-dd'
      if (dateInput.includes('/')) {
        const [day, month, year] = dateInput.split('/');
        date = new Date(`${year}-${month}-${day}T00:00:00`);
      } else {
        date = new Date(dateInput);
      }
    } else {
      date = dateInput;
    }

    if (isNaN(date.getTime())) return String(dateInput); // Devuelve el original si la fecha no es válida

    return new Intl.DateTimeFormat('es-GT', { day: '2-digit', month: 'short', year: 'numeric' }).format(date).replace('.', '');
  };

  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
        <AcmeLogo />
      </div>
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
          <p className={`text-xl text-gray-800 md:text-3xl md:leading-normal ${lusitana.className}`}>
            <strong>Bienvenido a la App de Tipo de Cambio.</strong>
          </p>
          <div className="p-5 font-sans">
            <h1 className="text-2xl font-bold">Tipo de Cambio del Dólar (GTQ)</h1>
            <p className="mt-2">Consulta el tipo de cambio oficial del Banco de Guatemala.</p>

            <div className="mt-4">
              <button onClick={handleConsultar} disabled={loading} className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-base text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-400">
                {loading ? 'Consultando...' : 'Consultar Tipo de Cambio del Día'}
              </button>
            </div>

            {error && (
              <p className="mt-4 font-bold text-red-600">
                <strong>Error:</strong> {error}
              </p>
            )}

            {tipoCambio && (
              <div className="mt-5 rounded-lg border border-gray-300 p-4">
                <h2>Resultado de la Consulta</h2>
                <p><strong>Fecha consultada:</strong> {formatGuatemalaDate(new Date())}</p>
                <p><strong>Fecha del tipo de cambio:</strong> {formatGuatemalaDate(tipoCambio.fecha)}</p>
                <p><strong>Tipo de cambio:</strong> Q {tipoCambio.tipo_cambio}</p>
              </div>
            )}
          </div>
          <Link
              href="/login"
              className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
          >
            <span>Log in</span> <ArrowRightIcon className="w-5 md:w-6" />
          </Link>
        </div>
        <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
          {/* Add Hero Images Here */}
          <Image
            src="/hero-desktop.png"
            width={1000}
            height={760}
            className="hidden md:block"
            alt="Screenshots of the dashboard project showing desktop version"
          />
          <Image
            src="/hero-mobile.png"
            width={560}
            height={620}
            className="block md:hidden"
            alt="Screenshot of the dashboard project showing mobile version"
          />
        </div>
      </div>
      <div className="mt-8 p-5">
        <h2 className="text-2xl font-bold">Historial de Últimas 5 Consultas</h2>
        {historial.length > 0 ? (
          <table className="mt-4 w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">ID</th>
                <th className="border border-gray-300 p-2 text-left">Fecha de Consulta</th>
                <th className="border border-gray-300 p-2 text-left">Fecha de T/C</th>
                <th className="border border-gray-300 p-2 text-left">Tipo de Cambio</th>
                <th className="border border-gray-300 p-2 text-left">API</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((item) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 p-2">{item.id}</td>
                  <td className="border border-gray-300 p-2">{formatGuatemalaDate(item.fecha_consulta)}</td>
                  <td className="border border-gray-300 p-2">{formatGuatemalaDate(item.fecha_tipo_cambio)}</td>
                  <td className="border border-gray-300 p-2">{item.tipo_cambio}</td>
                  <td className="border border-gray-300 p-2">{item.origen_api}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay consultas en el historial.</p>
        )}
      </div>
    </main>
  );
}
