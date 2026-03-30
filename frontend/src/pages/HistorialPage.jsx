import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrdenes } from '../services/ordenService';

const HistorialPage = () => {
    const [todasLasOrdenes, setTodasLasOrdenes] = useState([]);
    const [ordenesFiltradas, setOrdenesFiltradas] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [cargando, setCargando] = useState(true);
    
    // --- ESTADOS DE PAGINACIÓN ---
    const [paginaActual, setPaginaActual] = useState(1);
    const registrosPorPagina = 5;
    
    const navigate = useNavigate();

    // 1. Cargar datos iniciales (FILTRANDO SOLO LAS ENTREGADAS)
    useEffect(() => {
        const obtenerDatos = async () => {
            setCargando(true);
            try {
                const data = await getOrdenes();
                
                // Solo mostramos en el historial las que tengan estado "Entregado"
                // Las demás se consideran abiertas y no pertenecen a esta vista.
                const soloEntregadas = data.filter(o => o.estado === 'Entregado');
                
                const ordenadas = soloEntregadas.sort((a, b) => b.id_orden_servicio - a.id_orden_servicio);
                setTodasLasOrdenes(ordenadas);
                setOrdenesFiltradas(ordenadas);
            } catch (error) {
                console.error("Error al obtener historial:", error);
            } finally {
                setCargando(false);
            }
        };
        obtenerDatos();
    }, []);

    // 2. Filtrado dinámico
    useEffect(() => {
        const term = busqueda.toLowerCase();
        const filtrado = todasLasOrdenes.filter(o => 
            o.placa?.toLowerCase().includes(term) ||
            o.codigo_equipo?.toLowerCase().includes(term) ||
            o.nombre_cliente?.toLowerCase().includes(term) ||
            o.tipo_especifico?.toLowerCase().includes(term) ||
            (o.contacto && String(o.contacto).includes(term))
        );
        setOrdenesFiltradas(filtrado);
        setPaginaActual(1);
    }, [busqueda, todasLasOrdenes]);

    // 3. Funciones de cálculo y utilidades
    const calcularSoloRepuestos = (orden) => {
        const valoresRepuestos = orden.categoria_servicio?.match(/\$(\d+)/g) || [];
        return valoresRepuestos.reduce((acc, val) => acc + parseInt(val.replace('$', '')), 0);
    };

    const calcularTotalFila = (orden) => {
        const sumaRepuestos = calcularSoloRepuestos(orden);
        const manoObra = parseFloat(orden.mano_obra) || 0;
        return sumaRepuestos + manoObra;
    };

    const abrirWhatsApp = (telefono) => {
        if (!telefono || telefono === 'Sin tel') return;
        const numeroLimpio = telefono.replace(/\D/g, '');
        const link = `https://wa.me/${numeroLimpio.length <= 10 ? '57' + numeroLimpio : numeroLimpio}`;
        window.open(link, '_blank');
    };

    // Cálculos de Paginación
    const ultimoIndice = paginaActual * registrosPorPagina;
    const primerIndice = ultimoIndice - registrosPorPagina;
    const registrosPaginados = ordenesFiltradas.slice(primerIndice, ultimoIndice);
    const totalPaginas = Math.ceil(ordenesFiltradas.length / registrosPorPagina);

    const inversionTotalVisible = ordenesFiltradas.reduce((acc, o) => acc + calcularTotalFila(o), 0);

    return (
        <div style={{ padding: '20px', maxWidth: '1350px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '20px' }}>
                <button 
                    onClick={() => navigate('/ordenes')} 
                    style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    ← Volver
                </button>

                <input 
                    type="text" 
                    placeholder="Filtrar por placa, código, cliente, equipo o teléfono..." 
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ 
                        flex: 1, 
                        padding: '12px', 
                        borderRadius: '8px', 
                        border: '2px solid #3498db',
                        fontSize: '1rem'
                    }} 
                />
            </div>

            <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>📜 Hoja de Vida de Equipos (Entregados)</h2>

            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '20px', 
                background: '#2c3e50', 
                color: 'white', 
                borderRadius: '8px', 
                marginBottom: '20px'
            }}>
                <div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>SERVICIOS EN LISTA</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{ordenesFiltradas.length} Registros</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>VALOR TOTAL ACUMULADO</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#2ecc71' }}>
                        ${inversionTotalVisible.toLocaleString()}
                    </div>
                </div>
            </div>

            {cargando ? (
                <p style={{ textAlign: 'center' }}>Cargando información...</p>
            ) : (
                <>
                    <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #eee' }}>
                        <table width="100%" style={{ borderCollapse: 'collapse', backgroundColor: 'white' }}>
                            <thead>
                                <tr style={{ background: '#f4f7f6', color: '#2c3e50', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                                    <th style={{ padding: '15px' }}>Fecha</th>
                                    <th>Código</th>
                                    <th>Cliente / Cel</th>
                                    <th>Equipo / Placa</th>
                                    <th>Procedimiento</th>
                                    <th>Asesor / Técnico</th>
                                    <th>Mano de Obra</th>
                                    <th>Repuestos</th>
                                    <th style={{ textAlign: 'right', paddingRight: '20px' }}>Total General</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrosPaginados.map(o => (
                                    <tr key={o.id_orden_servicio} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '15px', fontSize: '0.85rem' }}>
                                            {new Date(o.fecha_creacion || o.fecha_ingreso).toLocaleDateString()}
                                        </td>
                                        <td style={{ fontWeight: 'bold', color: '#7f8c8d', fontSize: '0.85rem' }}>
                                            {o.codigo_equipo}
                                        </td>
                                        <td style={{ padding: '10px 5px' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{o.nombre_cliente}</div>
                                            <div 
                                                onClick={() => abrirWhatsApp(o.contacto)}
                                                style={{ 
                                                    fontSize: '1rem', 
                                                    fontWeight: 'bold',
                                                    color: o.contacto && o.contacto !== 'Sin tel' ? '#27ae60' : '#7f8c8d',
                                                    cursor: o.contacto && o.contacto !== 'Sin tel' ? 'pointer' : 'default',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                {o.contacto && o.contacto !== 'Sin tel' && <span>🟢</span>}
                                                {o.contacto || 'Sin tel'}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.85rem' }}>{o.tipo_especifico}</div>
                                            {o.placa && <div style={{ fontSize: '0.8rem', color: '#ec5f5f', fontWeight: 'bold' }}>[{o.placa}]</div>}
                                        </td>
                                        <td style={{ fontSize: '0.8rem', color: '#555', maxWidth: '250px' }}>
                                            {o.categoria_servicio}
                                        </td>
                                        <td style={{ fontSize: '0.85rem' }}>
                                            <div style={{ fontWeight: '500' }}>{o.recibido_por || 'N/A'}</div>
                                            <small style={{ color: '#126bdf' }}>👨‍🔧 tec: {o.nombre_tecnico}</small>
                                        </td>
                                        <td style={{ fontWeight: 'bold', color: '#2980b9' }}>
                                            ${parseFloat(o.mano_obra || 0).toLocaleString()}
                                        </td>
                                        <td style={{ fontWeight: 'bold', color: '#9b59b6' }}>
                                            ${calcularSoloRepuestos(o).toLocaleString()}
                                        </td>
                                        <td style={{ textAlign: 'right', paddingRight: '20px', fontWeight: 'bold', color: '#27ae60', fontSize: '1rem' }}>
                                            ${calcularTotalFila(o).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
                        <button 
                            onClick={() => setPaginaActual(p => Math.max(p - 1, 1))}
                            disabled={paginaActual === 1}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: paginaActual === 1 ? '#bdc3c7' : '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: paginaActual === 1 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            ⬅️ Anterior
                        </button>
                        
                        <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                            Página {paginaActual} de {totalPaginas || 1}
                        </span>

                        <button 
                            onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))}
                            disabled={paginaActual === totalPaginas || totalPaginas === 0}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: (paginaActual === totalPaginas || totalPaginas === 0) ? '#bdc3c7' : '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: (paginaActual === totalPaginas || totalPaginas === 0) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Siguiente ➡️
                        </button>
                    </div>
                </>
            )}

            {ordenesFiltradas.length === 0 && !cargando && (
                <div style={{ textAlign: 'center', padding: '50px', color: '#95a5a6', background: '#f9f9f9', borderRadius: '8px', marginTop: '10px' }}>
                    🔍 No hay coincidencias para "{busqueda}"
                </div>
            )}
        </div>
    );
};

export default HistorialPage;