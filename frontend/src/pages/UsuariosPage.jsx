import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; 
import Swal from 'sweetalert2';

const UsuariosPage = () => {
    // 1. ESTADOS
    const [usuarios, setUsuarios] = useState([]);
    const [formData, setFormData] = useState({ 
        username: '', 
        password: '', 
        rol: 'empleado' 
    });
    const [busqueda, setBusqueda] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [paginaActual, setPaginaActual] = useState(1);
    
    const navigate = useNavigate();
    const registrosPorPagina = 3;

    const API_ENDPOINT = '/usuarios'; 
    const isFormValid = formData.username.trim() !== '' && formData.password.trim() !== '';

    // 2. CARGA DE DATOS (Con protección contra errores de tipo)
    const cargarUsuarios = useCallback(async () => {
        try {
            const res = await api.get(API_ENDPOINT);
            
            // Verificamos que res.data sea un arreglo antes de procesar
            const dataBruta = Array.isArray(res.data) ? res.data : [];

            const datosNormalizados = dataBruta
                .filter(u => u && u.activo !== false && u.activo !== 0 && u.activo !== 'false') 
                .map(u => ({
                    id_usuario: u.id_usuario || u.ID_USUARIO,
                    username: u.username || u.USERNAME,
                    rol: u.rol || u.ROL || 'empleado',
                    ordenes_activas: Number(u.ordenes_activas || 0),
                    activo: u.activo
                }));
            
            setUsuarios(datosNormalizados.sort((a, b) => (b.id_usuario || 0) - (a.id_usuario || 0)));
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            setUsuarios([]); // Reset a vacío en caso de error
        }
    }, [API_ENDPOINT]);

    useEffect(() => { 
        cargarUsuarios(); 
    }, [cargarUsuarios]);

    // 3. MANEJADORES DE EVENTOS
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Buscamos de forma segura dentro del estado usuarios
        const listaUsuarios = Array.isArray(usuarios) ? usuarios : [];
        const usuarioExistente = listaUsuarios.find(
            (u) => u.username && u.username.toLowerCase() === formData.username.trim().toLowerCase()
        );

        if (usuarioExistente) {
            return Swal.fire({
                title: 'Usuario Duplicado',
                text: `El nombre de usuario "${formData.username}" ya está registrado.`,
                icon: 'warning',
                confirmButtonColor: '#667eea'
            });
        }

        try {
            await api.post(`${API_ENDPOINT}/registro`, formData);
            
            Swal.fire({ 
                title: '¡Usuario Creado!', 
                icon: 'success', 
                timer: 2000, 
                showConfirmButton: false 
            });

            setFormData({ username: '', password: '', rol: 'empleado' });
            setShowPassword(false);
            cargarUsuarios();
        } catch (error) {
            Swal.fire({ 
                title: 'Error', 
                text: error.response?.data?.mensaje || 'Error al registrar', 
                icon: 'error' 
            });
        }
    };

    const handleResetPassword = async (e, id, username) => {
        if(e) e.preventDefault(); 
        const { value: newPassword } = await Swal.fire({
            title: `Cambiar clave de ${username}`,
            input: 'password',
            inputLabel: 'Nueva contraseña',
            showCancelButton: true,
            confirmButtonColor: '#667eea',
            confirmButtonText: 'Actualizar',
            inputValidator: (value) => {
                if (!value) return 'La contraseña no puede estar vacía';
                if (value.length < 4) return 'Debe tener al menos 4 caracteres';
            }
        });

        if (newPassword) {
            try {
                await api.put(`${API_ENDPOINT}/reset-password/${id}`, { password: newPassword });
                Swal.fire({ title: '¡Actualizado!', icon: 'success', timer: 1500, showConfirmButton: false });
                cargarUsuarios(); 
            } catch (error) {
                Swal.fire('Error', 'No se pudo actualizar', 'error');
            }
        }
    };

    const handleRetirar = async (id, username) => {
        const resultado = await Swal.fire({
            title: `¿Retirar a ${username}?`,
            text: "El usuario ya no aparecerá en las listas, pero sus registros históricos se mantendrán.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ed8936',
            confirmButtonText: 'Sí, retirar'
        });

        if (resultado.isConfirmed) {
            try {
                await api.put(`${API_ENDPOINT}/desactivar/${id}`);
                Swal.fire('Retirado', 'El usuario ha sido quitado de la vista.', 'success');
                cargarUsuarios();
            } catch (error) {
                Swal.fire('Error', 'No se pudo retirar al usuario', 'error');
            }
        }
    };

    // 4. FILTRADO Y PAGINACIÓN (Protegido contra tipos no-array)
    const usuariosFiltrados = Array.isArray(usuarios) 
        ? usuarios.filter(u => 
            (u.username || "").toLowerCase().includes(busqueda.toLowerCase()) ||
            (u.rol || "").toLowerCase().includes(busqueda.toLowerCase())
          )
        : [];

    const totalPaginas = Math.ceil(usuariosFiltrados.length / registrosPorPagina);
    const ultimoIndice = paginaActual * registrosPorPagina;
    const primerIndice = ultimoIndice - registrosPorPagina;
    const registrosPaginados = usuariosFiltrados.slice(primerIndice, ultimoIndice);

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Segoe UI, sans-serif' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
                <button onClick={() => navigate('/')} style={{ padding: '10px 20px', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    ← Regresar
                </button>
                <div style={{ textAlign: 'right' }}>
                    <h2 style={{ margin: 0, color: '#2d3748' }}>Administración de Cuentas</h2>
                    <span style={{ color: '#718096', fontSize: '0.9rem' }}>Seguridad y Perfiles de Usuario</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                
                {/* FORMULARIO */}
                <div style={{ background: '#fff', padding: '30px', borderRadius: '15px', border: '1px solid #e2e8f0', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', height: 'fit-content' }}>
                    <h4 style={{ marginTop: 0, color: '#667eea', marginBottom: '20px', borderBottom: '2px solid #f7fafc', paddingBottom: '10px' }}>Crear Nuevo Perfil</h4>
                    
                    <form onSubmit={handleSubmit} autoComplete="off">
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', color: '#4a5568', marginBottom: '5px' }}>Usuario</label>
                            <input 
                                type="text" 
                                name="username"
                                value={formData.username} 
                                onChange={handleChange} 
                                required 
                                style={inputStyle} 
                                autoComplete="new-password"
                            />
                        </div>
                        
                        <div style={{ marginBottom: '15px', position: 'relative' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', color: '#4a5568', marginBottom: '5px' }}>Contraseña</label>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="password"
                                value={formData.password} 
                                onChange={handleChange} 
                                required 
                                style={inputStyle} 
                                autoComplete="new-password"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '35px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px'}}>
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', color: '#4a5568', marginBottom: '5px' }}>Permisos</label>
                            <select name="rol" value={formData.rol} onChange={handleChange} style={selectStyle}>
                                <option value="empleado">Empleado</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>

                        <button 
                            type="submit" 
                            disabled={!isFormValid} 
                            style={{ 
                                ...btnSubmitStyle, 
                                backgroundColor: isFormValid ? '#667eea' : '#cbd5e0', 
                                cursor: isFormValid ? 'pointer' : 'not-allowed' 
                            }}
                        >
                            Habilitar Acceso
                        </button>
                    </form>
                </div>

                {/* TABLA */}
                <div>
                    <input type="text" placeholder="🔍 Filtrar usuarios..." value={busqueda} onChange={e => {setBusqueda(e.target.value); setPaginaActual(1);}} style={searchStyle} />

                    <div style={{ background: 'white', borderRadius: '15px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <table width="100%" style={{ borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #edf2f7' }}>
                                    <th style={thStyle}>USUARIO</th>
                                    <th style={thStyle}>ROL</th>
                                    <th style={thStyle}>TRABAJO</th>
                                    <th style={{ ...thStyle, textAlign: 'center' }}>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrosPaginados.map(u => {
                                    const tieneOrdenes = u.ordenes_activas > 0;
                                    return (
                                        <tr key={u.id_usuario} style={{ borderBottom: '1px solid #edf2f7' }}>
                                            <td style={{ padding: '15px', fontWeight: 'bold', color: '#2d3748' }}>{u.username}</td>
                                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                                <span style={{ ...roleBadgeStyle, backgroundColor: u.rol === 'admin' ? '#fed7d7' : '#ebf4ff', color: u.rol === 'admin' ? '#c53030' : '#3182ce' }}>
                                                    {(u.rol || "").toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                                {tieneOrdenes ? (
                                                    <span style={countBadgeStyle}>{u.ordenes_activas} activas</span>
                                                ) : (
                                                    <span style={{ color: '#cbd5e0', fontSize: '0.8rem' }}>Sin órdenes</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <button onClick={(e) => handleResetPassword(e, u.id_usuario, u.username)} title="Cambiar contraseña" style={btnActionStyle}>🔑</button>
                                                    <button 
                                                        onClick={() => handleRetirar(u.id_usuario, u.username)}
                                                        title="Retirar de la lista"
                                                        style={{ 
                                                            ...btnRetirarStyle,
                                                            cursor: 'pointer'
                                                        }}
                                                    >👤❌</button>
                                                </div>
                                            </td> 
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        <div style={paginationContainer}>
                            <button onClick={() => setPaginaActual(p => Math.max(p - 1, 1))} disabled={paginaActual === 1} style={paginaActual === 1 ? btnNavDisabled : btnNav}>⬅️ Anterior</button>
                            <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>Página {paginaActual} de {totalPaginas || 1}</span>
                            <button onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))} disabled={paginaActual === totalPaginas || totalPaginas === 0} style={paginaActual === totalPaginas || totalPaginas === 0 ? btnNavDisabled : btnNav}>Siguiente ➡️</button>
                        </div> 
                    </div>
                </div>
            </div>
        </div>
    );
};

// Estilos
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', boxSizing: 'border-box' };
const selectStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', backgroundColor: '#f8fafc' };
const btnSubmitStyle = { width: '100%', padding: '15px', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', transition: '0.3s' };
const searchStyle = { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #667eea', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' };
const thStyle = { padding: '15px', textAlign: 'center', color: '#718096' };
const roleBadgeStyle = { fontSize: '0.75rem', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold' };
const btnActionStyle = { background: '#edf2f7', border: '1px solid #cbd5e0', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: '#4a5568' };
const btnRetirarStyle = { background: '#fffaf3', border: '1px solid #fbd38d', borderRadius: '8px', padding: '6px 10px', color: '#dd6b20' };
const countBadgeStyle = { background: '#fff3e0', color: '#ef6c00', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #ffe0b2' };
const paginationContainer = { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '20px', padding: '10px' };
const btnNav = { padding: '8px 15px', backgroundColor: '#3261c0', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const btnNavDisabled = { ...btnNav, backgroundColor: '#bdc3c7', cursor: 'not-allowed' };

export default UsuariosPage;