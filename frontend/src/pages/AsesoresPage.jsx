import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import { getPersonalRecepcion, createAsesor, deleteAsesor } from '../services/recepcionService';

const AsesoresPage = () => {
    const [asesores, setAsesores] = useState([]);
    const [asesoresFiltrados, setAsesoresFiltrados] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [nombre, setNombre] = useState('');
    const [cargo, setCargo] = useState('');
    const [cargando, setCargando] = useState(true);
    const [paginaActual, setPaginaActual] = useState(1);
    const registrosPorPagina = 5;
    const navigate = useNavigate();

    // Definimos cargarDatos con useCallback para que sea estable y reusable
    const cargarDatos = useCallback(async () => {
        setCargando(true);
        try {
            const data = await getPersonalRecepcion();
            // Ordenamos y actualizamos estados
            const datosOrdenados = data.sort((a, b) => b.id_recepcion - a.id_recepcion);
            setAsesores(datosOrdenados);
            setAsesoresFiltrados(datosOrdenados);
        } catch (error) {
            console.error("Error al cargar:", error);
            Swal.fire({
                title: 'Error de Conexión',
                text: 'No se pudo conectar con el servidor',
                icon: 'error',
                confirmButtonColor: '#3498db'
            });
        } finally {
            setCargando(false);
        }
    }, []);

    // EFECTO PRINCIPAL: Carga inicial y escucha de eventos globales
    useEffect(() => { 
        cargarDatos(); 

        // Escuchamos si se creó un usuario en la otra página
        const manejarNuevoUsuario = () => {
            console.log("Sincronizando: Nuevo usuario detectado");
            cargarDatos();
        };

        window.addEventListener('usuarioCreado', manejarNuevoUsuario);
        
        // Limpiamos el evento al desmontar el componente
        return () => window.removeEventListener('usuarioCreado', manejarNuevoUsuario);
    }, [cargarDatos]);

    // Lógica de filtrado reactivo
    useEffect(() => {
        const filtrado = asesores.filter(a => 
            (a.nombre?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
            (a.cargo?.toLowerCase() || "").includes(busqueda.toLowerCase())
        );
        setAsesoresFiltrados(filtrado);
        setPaginaActual(1);
    }, [busqueda, asesores]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (nombre.trim().length < 3) {
            Swal.fire({
                title: 'Nombre muy corto',
                text: 'El nombre debe tener al menos 3 caracteres',
                icon: 'warning',
                confirmButtonColor: '#f39c12'
            });
            return;
        }

        try {
            await createAsesor({ nombre, cargo });
            setNombre('');
            setCargo('');
            
            Swal.fire({
                title: '¡Registro Exitoso!',
                text: 'El asesor ha sido guardado correctamente',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            
            cargarDatos();
        } catch (error) {
            Swal.fire({
                title: 'Error al registrar',
                text: 'No se pudo registrar el asesor en la base de datos',
                icon: 'error',
                confirmButtonColor: '#e74c3c'
            });
        }
    };

    const handleEliminar = async (id, nombreAsesor) => {
        const resultado = await Swal.fire({
            title: `¿Eliminar a ${nombreAsesor}?`,
            text: "Esta acción no se puede deshacer y el asesor desaparecerá del sistema",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#34495e',
            confirmButtonText: 'Sí, eliminar permanentemente',
            cancelButtonText: 'Cancelar'
        });

        if (resultado.isConfirmed) {
            try {
                await deleteAsesor(id);
                Swal.fire({
                    title: 'Eliminado',
                    text: 'El registro ha sido borrado.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                cargarDatos();
            } catch (error) {
                Swal.fire({
                    title: 'Conflicto de eliminación',
                    text: 'No se puede eliminar porque el asesor tiene historial de órdenes vinculado.',
                    icon: 'error',
                    confirmButtonColor: '#e74c3c'
                });
            }
        }
    };

    // Paginación
    const ultimoIndice = paginaActual * registrosPorPagina;
    const primerIndice = ultimoIndice - registrosPorPagina;
    const registrosPaginados = asesoresFiltrados.slice(primerIndice, ultimoIndice);
    const totalPaginas = Math.ceil(asesoresFiltrados.length / registrosPorPagina);

    return (
        <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                <button onClick={() => navigate('/ordenes')} style={{ padding: '10px 20px', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    ← Volver al Panel
                </button>
                <h2 style={{ margin: 0, color: '#2c3e50' }}>Gestión de Personal de Recepción</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                
                {/* FORMULARIO */}
                <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #ddd', height: 'fit-content', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                    <h4 style={{ marginTop: 0, color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>Nuevo Registro</h4>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', color: '#34495e', marginBottom: '5px' }}>Nombre Completo</label>
                            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required 
                                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', color: '#34495e', marginBottom: '5px' }}>Cargo / Rol</label>
                            <input type="text" value={cargo} onChange={(e) => setCargo(e.target.value)} required 
                                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                        </div>
                        <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', transition: 'background 0.3s' }}>
                            Guardar Registro
                        </button>
                    </form>
                </div>

                {/* TABLA Y BUSQUEDA */}
                <div>
                    <div style={{ position: 'relative', marginBottom: '15px' }}>
                        <input type="text" placeholder="🔍 Buscar por nombre o cargo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                            style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #3498db', boxSizing: 'border-box', outline: 'none', fontSize: '1rem' }} />
                    </div>

                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #ddd', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                        <table width="100%" style={{ borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '15px', textAlign: 'left', color: '#7f8c8d', fontSize: '0.9rem' }}>ASESOR</th>
                                    <th style={{ padding: '15px', textAlign: 'left', color: '#7f8c8d', fontSize: '0.9rem' }}>CARGO</th>
                                    <th style={{ padding: '15px', textAlign: 'center', color: '#7f8c8d', fontSize: '0.9rem' }}>ESTADO</th>
                                    <th style={{ padding: '15px', textAlign: 'center', color: '#7f8c8d', fontSize: '0.9rem' }}>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargando ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Cargando datos...</td></tr>
                                ) : registrosPaginados.map(a => (
                                    <tr key={a.id_recepcion} style={{ borderBottom: '1px solid #eee', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '15px', fontWeight: 'bold', color: '#2c3e50' }}>{a.nombre}</td>
                                        <td style={{ padding: '15px' }}><span style={{ fontSize: '0.85rem', background: '#e1f5fe', padding: '5px 10px', borderRadius: '20px', color: '#0288d1', fontWeight: '600' }}>{a.cargo}</span></td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                <span style={{ width: '8px', height: '8px', backgroundColor: '#2ecc71', borderRadius: '50%' }}></span>
                                                <small style={{ color: '#2ecc71', fontWeight: 'bold', textTransform: 'uppercase' }}>Activo</small>
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            <button onClick={() => handleEliminar(a.id_recepcion, a.nombre)} 
                                                style={{ padding: '6px 15px', backgroundColor: 'transparent', color: '#e74c3c', border: '2px solid #e74c3c', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s' }}
                                                onMouseOver={(e) => { e.target.style.backgroundColor = '#e74c3c'; e.target.style.color = 'white'; }}
                                                onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#e74c3c'; }}>
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', gap: '20px', background: '#f8f9fa' }}>
                            <button disabled={paginaActual === 1} onClick={() => setPaginaActual(p => p - 1)} 
                                style={{ padding: '8px 15px', borderRadius: '5px', border: '1px solid #ccc', cursor: paginaActual === 1 ? 'default' : 'pointer', background: 'white' }}>
                                Anterior
                            </button>
                            <span style={{ alignSelf: 'center', fontWeight: 'bold', color: '#7f8c8d' }}>
                                Página {paginaActual} de {totalPaginas || 1}
                            </span>
                            <button disabled={paginaActual === totalPaginas || totalPaginas === 0} onClick={() => setPaginaActual(p => p + 1)}
                                style={{ padding: '8px 15px', borderRadius: '5px', border: '1px solid #ccc', cursor: (paginaActual === totalPaginas || totalPaginas === 0) ? 'default' : 'pointer', background: 'white' }}>
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AsesoresPage;