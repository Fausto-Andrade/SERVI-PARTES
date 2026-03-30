import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrdenes } from '../services/ordenService';

const ConsultaCodigosPage = () => {
    const [codigosUnicos, setCodigosUnicos] = useState([]);
    const [codigosFiltrados, setCodigosFiltrados] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [cargando, setCargando] = useState(true);

    // --- ESTADOS DE PAGINACIÓN ---
    const [paginaActual, setPaginaActual] = useState(1);
    const registrosPorPagina = 5;

    const navigate = useNavigate();

    useEffect(() => {
        const obtenerCodigos = async () => {
            setCargando(true);
            try {
                const data = await getOrdenes();
                // Extraer solo codigo_equipo y eliminar duplicados
                const listaCodigos = data
                    .map(o => o.codigo_equipo)
                    .filter((codigo, index, self) => codigo && self.indexOf(codigo) === index)
                    .sort(); // Ordenar alfabéticamente
                
                setCodigosUnicos(listaCodigos);
                setCodigosFiltrados(listaCodigos);
            } catch (error) {
                console.error("Error al obtener códigos:", error);
            } finally {
                setCargando(false);
            }
        };
        obtenerCodigos();
    }, []);

    // Filtrado dinámico
    useEffect(() => {
        const term = busqueda.toLowerCase();
        const filtrado = codigosUnicos.filter(codigo => 
            codigo?.toLowerCase().includes(term)
        );
        setCodigosFiltrados(filtrado);
        setPaginaActual(1);
    }, [busqueda, codigosUnicos]);

    // Cálculos de Paginación
    const ultimoIndice = paginaActual * registrosPorPagina;
    const primerIndice = ultimoIndice - registrosPorPagina;
    const registrosPaginados = codigosFiltrados.slice(primerIndice, ultimoIndice);
    const totalPaginas = Math.ceil(codigosFiltrados.length / registrosPorPagina);

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
            
            {/* Cabecera con Buscador */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '20px' }}>
                <button 
                    onClick={() => navigate('/')} 
                    style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    ← Volver
                </button>

                <input 
                    type="text" 
                    placeholder="Buscar código de equipo..." 
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

            <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>🔍 Consulta de Códigos Registrados</h2>

            {/* Banner Informativo */}
            <div style={{ 
                padding: '15px 20px', 
                background: '#2c3e50', 
                color: 'white', 
                borderRadius: '8px', 
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>TOTAL CÓDIGOS ÚNICOS</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{codigosFiltrados.length}</span>
            </div>

            {cargando ? (
                <p style={{ textAlign: 'center' }}>Cargando códigos...</p>
            ) : (
                <>
                    <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #eee' }}>
                        <table width="100%" style={{ borderCollapse: 'collapse', backgroundColor: 'white' }}>
                            <thead>
                                <tr style={{ background: '#f4f7f6', color: '#2c3e50', borderBottom: '2px solid #dee2e6' }}>
                                    {/* <th style={{ padding: '15px', paddingLeft: '60px' }}>#</th> */}
                                    <th style={{ padding: '5px 130px', paddingLeft: '150px' }}>Código de Equipo</th>
                                    <th style={{ textAlign: 'right', paddingRight: '40px' }}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrosPaginados.map((codigo, index) => (
                                    <tr key={codigo} style={{ borderBottom: '1px solid #eee' }}>
                                        {/* <td style={{ padding: '15px', color: '#95a5a6' }}>{primerIndice + index + 1}</td> */}
                                        <td style={{ padding: '15px', fontWeight: 'bold', color: '#2c3e50', fontSize: '1.1rem' }}>
                                            {codigo}
                                        </td>
                                        <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                                            <span style={{ 
                                                background: '#e8f6f3', 
                                                color: '#27ae60', 
                                                padding: '4px 8px', 
                                                borderRadius: '4px', 
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold'
                                            }}>
                                                REGISTRADO
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Controles de Paginación */}
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

            {codigosFiltrados.length === 0 && !cargando && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#95a5a6' }}>
                    No se encontraron códigos que coincidan con "{busqueda}"
                </div>
            )}
        </div>
    );
};

export default ConsultaCodigosPage;