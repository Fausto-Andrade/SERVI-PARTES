import React, { useEffect, useState } from 'react';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../services/clienteService';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const ClientesPage = () => {
    const [clientes, setClientes] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [editando, setEditando] = useState(false);
    const navigate = useNavigate();
    
    // Estados para la paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const registrosPorPagina = 5;

    const [formData, setFormData] = useState({
        id: '',
        nombre: '',
        contacto: '',
        email: '',
        direccion: ''
    });

    const cargarClientes = async () => {
        try {
            const data = await getClientes();
            setClientes(data);
        } catch (error) {
            console.error("Error al cargar clientes:", error);
        }
    };

    useEffect(() => { cargarClientes(); }, []);

    // 1. Filtrado
    const clientesFiltrados = clientes.filter(c =>
        (c.nombre?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
        (c.contacto || '').includes(busqueda)
    );

    // 2. Lógica de Paginación
    const ultimoIndice = paginaActual * registrosPorPagina;
    const primerIndice = ultimoIndice - registrosPorPagina;
    const registrosPaginados = clientesFiltrados.slice(primerIndice, ultimoIndice);
    const totalPaginas = Math.ceil(clientesFiltrados.length / registrosPorPagina);

    // Resetear a página 1 cuando se busca algo
    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda]);

    // Manejo de cambios con validaciones integradas
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'contacto') {
            if (value === '' || /^\d+$/.test(value)) {
                setFormData({ ...formData, [name]: value });
            }
        } else if (name === 'nombre') {
            if (value === '' || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
                setFormData({ ...formData, [name]: value });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Lógica de Validación de Duplicados Ajustada
            const esDuplicado = clientes.some(c => {
                // Verificamos si el nombre o contacto ya existen en OTRO registro diferente al actual
                const coincidenciaNombre = c.nombre.toLowerCase().trim() === formData.nombre.toLowerCase().trim();
                const coincidenciaContacto = String(c.contacto).trim() === String(formData.contacto).trim();
                const esDiferenteId = String(c.id) !== String(formData.id);

                return (coincidenciaNombre || coincidenciaContacto) && esDiferenteId;
            });

            if (esDuplicado) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Dato Duplicado',
                    text: 'Ya existe otro cliente con este mismo nombre o número de contacto.',
                    confirmButtonColor: '#3261c0'
                });
                return; 
            }

            if (editando) {
                await updateCliente(formData.id, formData);
                Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Cliente modificado correctamente', timer: 1500, showConfirmButton: false });
            } else {
                await createCliente(formData);
                Swal.fire({ icon: 'success', title: 'Guardado', text: 'Cliente registrado con éxito', timer: 1500, showConfirmButton: false });
            }
            cancelarEdicion();
            cargarClientes();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo procesar la solicitud' });
        }
    };

    const prepararEdicion = (cliente) => {
        setEditando(true);
        setFormData(cliente);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelarEdicion = () => {
        setEditando(false);
        setFormData({ id: '', nombre: '', contacto: '', email: '', direccion: '' });
    };

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: 'auto' }}>
            <header style={{ marginBottom: '30px' }}>
                <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>👥 Directorio de Clientes</h2>
                <p style={{ color: '#7f8c8d' }}>Administra la base de datos de "La 8"</p>
            </header>

            {/* --- FORMULARIO --- */}
            <div style={formCardStyle}>
                <h4 style={{ marginTop: 0, color: '#3261c0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    {editando ? '📝 Editar Información' : '➕ Registrar Nuevo Cliente'}
                </h4>
                <form onSubmit={handleSubmit} style={gridStyle}>
                    <div>
                        <label style={labelStyle}>Nombre Completo</label>
                        <input name="nombre" value={formData.nombre} onChange={handleChange} required style={inputStyle} placeholder="Ej. Juan Pérez" />
                    </div>
                    <div>
                        <label style={labelStyle}>Teléfono (Contacto)</label>
                        <input name="contacto" value={formData.contacto} onChange={handleChange} required style={inputStyle} placeholder="3000000000" />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                        <button type="submit" style={editando ? btnUpdate : btnSave}>
                            {editando ? 'Actualizar' : 'Guardar Cliente'}
                        </button>
                        {editando && <button type="button" onClick={cancelarEdicion} style={btnCancel}>Cancelar</button>}

                        <button 
                            type="button"
                            onClick={() => navigate('/ordenes')} 
                            style={{ 
                                padding: '10px 20px', 
                                backgroundColor: '#667eea', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                cursor: 'pointer', 
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            📋 Órdenes
                        </button>
                    </div>
                </form>
            </div>

            {/* --- BUSCADOR --- */}
            <div style={{ marginBottom: '20px', textAlign: 'right' }}>
                <input 
                    type="text" 
                    placeholder="🔍 Buscar por nombre o contacto..." 
                    value={busqueda} 
                    onChange={(e) => setBusqueda(e.target.value)} 
                    style={searchStyle} 
                />
            </div>

            {/* --- TABLA --- */}
            <div style={tableContainer}>
                <table width="100%" style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <thead>
                        <tr style={{ background: '#2c3e50', color: 'white' }}>
                            <th style={thStyle}>Nombre del Cliente</th>
                            <th style={thStyle}>Contacto</th>
                            <th style={thStyle}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registrosPaginados.map(c => (
                            <tr key={c.id} style={trStyle}>
                                <td style={tdStyle}>
                                    <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>{c.nombre}</div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        {c.contacto ? (
                                            <a 
                                                href={`https://wa.me/${String(c.contacto).replace(/\s+/g, '')}?text=Hola%20${encodeURIComponent(c.nombre)},%20te%20saludamos%20de%20La%208...`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{ fontWeight: '400', color: '#27ae60', textDecoration: 'none' }}
                                            >
                                                📞 {c.contacto} ↗️
                                            </a>
                                        ) : (
                                            <span style={{ color: '#bdc3c7' }}>Sin contacto</span>
                                        )}
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                        <button onClick={() => prepararEdicion(c)} style={actionBtn}>✏️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- CONTROLES DE PAGINACIÓN --- */}
            <div style={paginationContainer}>
                <button 
                    onClick={() => setPaginaActual(p => Math.max(p - 1, 1))}
                    disabled={paginaActual === 1}
                    style={paginaActual === 1 ? btnNavDisabled : btnNav}
                >
                    ⬅️ Anterior
                </button>
                
                <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                    Página {paginaActual} de {totalPaginas || 1}
                </span>

                <button 
                    onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))}
                    disabled={paginaActual === totalPaginas || totalPaginas === 0}
                    style={paginaActual === totalPaginas || totalPaginas === 0 ? btnNavDisabled : btnNav}
                >
                    Siguiente ➡️
                </button>
            </div>
        </div>
    );
};

// --- ESTILOS ---
const formCardStyle = { background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '30px', borderTop: '5px solid #3261c0' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5%' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginTop: '8px', boxSizing: 'border-box' };
const labelStyle = { fontSize: '13px', fontWeight: 'bold', color: '#7f8c8d'};
const btnSave = { padding: '12px 20px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const btnUpdate = { padding: '12px 20px', background: '#f39c12', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const btnCancel = { padding: '12px 20px', background: '#bdc3c7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const searchStyle = { padding: '10px 15px', borderRadius: '25px', border: '1px solid #ddd', width: '300px', outline: 'none' };
const tableContainer = { padding: '15px', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };
const thStyle = { padding: '12px 15px', textAlign: 'center' }; // Centrado
const tdStyle = { padding: '15px', textAlign: 'center' }; // Centrado
const trStyle = { borderBottom: '1px solid #eee' };
const actionBtn = { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' };

const paginationContainer = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px',
    padding: '10px'
};

const btnNav = {
    padding: '8px 15px',
    backgroundColor: '#3261c0',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: '0.3s'
};

const btnNavDisabled = {
    ...btnNav,
    backgroundColor: '#bdc3c7',
    cursor: 'not-allowed'
};

export default ClientesPage;