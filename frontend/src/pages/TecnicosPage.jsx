import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import { getTecnicos, createTecnico, deleteTecnico } from '../services/tecnicoService';

const TecnicosPage = () => {
    const [tecnicos, setTecnicos] = useState([]);
    const [tecnicosFiltrados, setTecnicosFiltrados] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [nombre, setNombre] = useState('');
    const [especialidad, setEspecialidad] = useState(''); 
    const [cargando, setCargando] = useState(true);
    const [paginaActual, setPaginaActual] = useState(1);
    const registrosPorPagina = 3;
    const navigate = useNavigate();

    const formularioValido = nombre.trim() !== '' && especialidad.trim() !== '';

    const cargarDatos = async () => {
        setCargando(true);
        try {
            const data = await getTecnicos();
            
            // 1. Filtramos para mostrar solo los técnicos activos (Bloqueo Lógico)
            // 2. Mantenemos tu lógica de ordenamiento por ID descendente
            const listaActivos = Array.isArray(data) 
                ? data
                    .filter(t => t.activo !== false) // Solo activos
                    .sort((a, b) => {
                        const idA = a.id_tecnicos || a.id_tecnico || a.id || 0;
                        const idB = b.id_tecnicos || b.id_tecnico || b.id || 0;
                        return idB - idA;
                    })
                : [];
            setTecnicos(listaActivos);
            setTecnicosFiltrados(listaActivos);
        } catch (error) {
            Swal.fire({ title: 'Error de Conexión', text: 'No se pudieron obtener los datos de los técnicos', icon: 'error' });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    useEffect(() => {
        const filtrado = tecnicos.filter(t => 
            (t.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
            (t.especialidad || "").toLowerCase().includes(busqueda.toLowerCase())
        );
        setTecnicosFiltrados(filtrado);
        setPaginaActual(1);
    }, [busqueda, tecnicos]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createTecnico({ nombre, especialidad });
            setNombre('');
            setEspecialidad('');
            Swal.fire({ title: '¡Registrado!', icon: 'success', timer: 1500, showConfirmButton: false });
            cargarDatos();
        } catch (error) {
            Swal.fire({ title: 'Error', text: 'No se pudo guardar el técnico', icon: 'error' });
        }
    };

    const handleEliminar = async (tecnico) => {
        const id = tecnico.id_tecnicos || tecnico.id_tecnico || tecnico.id;
        const nombreTecnico = tecnico.nombre;

        if (!id) {
            Swal.fire({ title: 'Error', text: 'No se pudo encontrar el ID del técnico', icon: 'error' });
            return;
        }

        const resultado = await Swal.fire({
            title: `¿Retirar a ${nombreTecnico}?`,
            text: "El técnico ya no aparecerá en las listas, pero se conservará su historial.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, retirar',
            cancelButtonText: 'Cancelar'
        });

        if (resultado.isConfirmed) {
            try {
                // Ahora deleteTecnico realiza el bloqueo lógico en el backend
                await deleteTecnico(id);
                Swal.fire({ title: 'Técnico Retirado', icon: 'success', timer: 1500, showConfirmButton: false });
                cargarDatos();
            } catch (error) {
                Swal.fire({ 
                    title: 'Error', 
                    text: error.message || 'No se pudo procesar la solicitud.', 
                    icon: 'error' 
                });
            }
        }
    };

    const ultimoIndice = paginaActual * registrosPorPagina;
    const primerIndice = ultimoIndice - registrosPorPagina;
    const registrosPaginados = Array.isArray(tecnicosFiltrados) ? tecnicosFiltrados.slice(primerIndice, ultimoIndice) : [];
    const totalPaginas = Math.ceil(tecnicosFiltrados.length / registrosPorPagina);

    return (
        <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                <button onClick={() => navigate('/')} style={btnBackStyle}>← Volver</button>
                <h2 style={{ margin: 0, color: '#2c3e50' }}>Gestión de Personal Técnico</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                <div style={cardStyle}>
                    <h4 style={formTitleStyle}>Registrar Técnico</h4>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={labelStyle}>Nombre Completo</label>
                            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Especialidad / Área</label>
                            <input type="text" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} required style={inputStyle} />
                        </div>
                        <button type="submit" disabled={!formularioValido} style={{ ...btnSubmitStyle, backgroundColor: formularioValido ? '#27ae60' : '#bdc3c7', cursor: formularioValido ? 'pointer' : 'not-allowed' }}>
                            Guardar Técnico
                        </button>
                    </form>
                </div>

                <div>
                    <input type="text" placeholder="🔍 Buscar técnico..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={searchStyle} />
                    <div style={tableWrapperStyle}>
                        <table width="100%" style={{ borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8f9fa' }}>
                                    <th style={thStyle}>TÉCNICO</th>
                                    <th style={thStyle}>ESPECIALIDAD</th>
                                    <th style={thStyle}>CARGA ACTIVA</th>
                                    <th style={{...thStyle, textAlign: 'center'}}>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrosPaginados.length > 0 ? (
                                    registrosPaginados.map((t, index) => {
                                        const rowKey = t.id_tecnicos || t.id_tecnico || t.id || `tec-${index}`;
                                        const numOrdenes = Number(t.ordenes_activas || 0);
                                        const tieneOrdenesAbiertas = numOrdenes > 0;

                                        return (
                                            <tr key={rowKey} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={tdStyle}>{t.nombre}</td>
                                                <td style={tdStyle}><span style={badgeStyle}>{t.especialidad}</span></td>
                                                
                                                <td style={tdStyle}>
                                                    {tieneOrdenesAbiertas ? (
                                                        <span style={countBadgeStyle}>
                                                            {numOrdenes} {numOrdenes === 1 ? 'orden activa' : 'órdenes activas'}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#27ae60', fontSize: '0.85rem', fontWeight: '500' }}>● Disponible</span>
                                                    )}
                                                </td>

                                                <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                    <button 
                                                        onClick={() => handleEliminar(t)} 
                                                        disabled={tieneOrdenesAbiertas}
                                                        style={{ 
                                                            ...btnDeleteStyle,
                                                            color: tieneOrdenesAbiertas ? '#bdc3c7' : '#e74c3c',
                                                            borderColor: tieneOrdenesAbiertas ? '#bdc3c7' : '#e74c3c',
                                                            cursor: tieneOrdenesAbiertas ? 'not-allowed' : 'pointer',
                                                            opacity: tieneOrdenesAbiertas ? 0.6 : 1,
                                                            backgroundColor: tieneOrdenesAbiertas ? '#f8f9fa' : 'transparent'
                                                        }}
                                                        title={tieneOrdenesAbiertas ? `No se puede retirar: tiene ${numOrdenes} órdenes pendientes` : "Retirar técnico"}
                                                    >
                                                        {tieneOrdenesAbiertas ? 'Ocupado' : 'Retirar'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr key="empty-row">
                                        <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#95a5a6' }}>
                                            No se encontraron técnicos activos
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        
                        <div style={paginationContainer}>
                            <button onClick={() => setPaginaActual(p => Math.max(p - 1, 1))} disabled={paginaActual === 1} style={paginaActual === 1 ? btnNavDisabled : btnNav}>Anterior</button>
                            <span style={{ fontWeight: 'bold' }}>{paginaActual} / {totalPaginas || 1}</span>
                            <button onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))} disabled={paginaActual === totalPaginas || totalPaginas === 0} style={paginaActual === totalPaginas || totalPaginas === 0 ? btnNavDisabled : btnNav}>Siguiente</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Estilos (Se mantienen los tuyos)
const btnBackStyle = { padding: '10px 20px', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const cardStyle = { background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #ddd', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' };
const formTitleStyle = { marginTop: 0, color: '#27ae60', borderBottom: '2px solid #27ae60', paddingBottom: '10px' };
const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '5px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' };
const btnSubmitStyle = { width: '100%', padding: '14px', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', transition: '0.3s' };
const searchStyle = { width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #27ae60', boxSizing: 'border-box', marginBottom: '15px' };
const tableWrapperStyle = { background: 'white', borderRadius: '12px', border: '1px solid #ddd', overflow: 'hidden' };
const thStyle = { padding: '15px', textAlign: 'left', color: '#7f8c8d', fontSize: '0.9rem', textTransform: 'uppercase' };
const tdStyle = { padding: '15px' };
const badgeStyle = { fontSize: '0.85rem', background: '#e8f5e9', padding: '5px 12px', borderRadius: '20px', color: '#2e7d32', fontWeight: 'bold' };
const btnDeleteStyle = { padding: '6px 15px', backgroundColor: 'transparent', border: '2px solid', borderRadius: '6px', transition: '0.2s', fontWeight: '600' };
const paginationContainer = { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', padding: '15px' };
const btnNav = { padding: '8px 15px', backgroundColor: '#3261c0', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const btnNavDisabled = { ...btnNav, backgroundColor: '#bdc3c7', cursor: 'not-allowed' };

const countBadgeStyle = {
    background: '#fff3e0',
    color: '#ef6c00',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    border: '1px solid #ffe0b2'
};

export default TecnicosPage;