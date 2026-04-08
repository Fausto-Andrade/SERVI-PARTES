import React, { useState, useEffect } from 'react';
import api from '../api/axios'; 
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import logoEmpresa from '../assets/logo.jpeg';

const LoginPage = ({ onLogin }) => {
    // 1. Estados iniciales limpios
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // 2. Limpieza forzada al montar el componente (refrescar)
    useEffect(() => {
        setUsername('');
        setPassword('');
    }, []);

    // 3. Validación de longitud para activar el botón
    const esValido = username.trim().length >= 3 && password.length >= 6;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!esValido) return;

        try {
            // CAMBIO: Ahora usamos 'api' y la ruta relativa. 
            // Esto se convierte automáticamente en http://138.36.237.111/api/auth/login
            const res = await api.post('/auth/login', { username, password });
            
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', res.data.username);
            localStorage.setItem('rol', res.data.rol);

            // Alerta de éxito con tus colores de marca originales
            Swal.fire({
                icon: 'success',
                title: '¡Bienvenido!',
                text: `Acceso concedido, hola ${res.data.username}`,
                timer: 2000,
                showConfirmButton: false,
                timerProgressBar: true,
                iconColor: '#27ae60',
                background: '#ffffff'
            });

            onLogin(res.data); 
            
            setTimeout(() => {
                navigate('/'); 
            }, 1500);
            
        } catch (error) {
            console.error(error);
            // Alerta de error con tus estilos originales
            Swal.fire({
                icon: 'error',
                title: 'Error de acceso',
                text: 'Usuario o contraseña incorrectos. Por favor, verifica tus datos.',
                iconColor: '#e74c3c',
                confirmButtonColor: '#ffc107', 
                confirmButtonText: 'Reintentar',
                background: '#ffffff'
            });
        }
    };

    return (
        <div style={cardContainer}>
            <div style={{ marginBottom: '20px' }}>
                <img 
                    src={logoEmpresa} 
                    alt="Logo La 8 Arranques y Alternadores" 
                    style={logoStyle} 
                />
            </div>

            <h2 style={{ color: '#2c3e50', marginBottom: '25px', fontSize: '1.5rem' }}>
                🔐 Acceso al Sistema
            </h2>

            <form onSubmit={handleSubmit} autoComplete="off">
                <div style={{ marginBottom: '15px' }}>
                    <input 
                        type="text" 
                        placeholder="Usuario (Mín. 3 caracteres)" 
                        style={inputStyle} 
                        value={username}
                        onChange={e => setUsername(e.target.value)} 
                        required
                        autoComplete="one-time-code"
                    />
                </div>
                
                <div style={{ marginBottom: '25px', position: 'relative' }}>
                    <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Contraseña (Mín. 6 caracteres)" 
                        style={{ ...inputStyle, paddingRight: '45px' }} 
                        value={password}
                        onChange={e => setPassword(e.target.value)} 
                        required
                        autoComplete="new-password"
                    />
                    <span 
                        onClick={() => setShowPassword(!showPassword)} 
                        style={eyeIconStyle}
                        onMouseOver={(e) => e.target.style.color = '#2980b9'}
                        onMouseOut={(e) => e.target.style.color = '#7f8c8d'}
                        title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </span>
                </div>
                
                <button 
                    type="submit" 
                    disabled={!esValido}
                    style={{
                        ...btnStyle,
                        background: esValido ? '#2c3e50' : '#bdc3c7',
                        cursor: esValido ? 'pointer' : 'not-allowed'
                    }}
                    onMouseOver={(e) => {
                        if(esValido) {
                            e.target.style.background = '#ffc107'; 
                            e.target.style.color = '#2c3e50'; 
                        }
                    }}
                    onMouseOut={(e) => {
                        if(esValido) {
                            e.target.style.background = '#2c3e50';
                            e.target.style.color = 'white';
                        }
                    }}
                >
                    Ingresar
                </button>

                {!esValido && username.length > 0 && (
                    <p style={{ fontSize: '0.7rem', color: '#e67e22', marginTop: '10px' }}>
                        Usuario min. 3 y contraseña min. 6 caracteres.
                    </p>
                )}
            </form>
        </div>
    );
};

// --- ESTILOS (Sin modificaciones) ---
const cardContainer = {
    maxWidth: '400px', 
    margin: '80px auto', 
    padding: '30px', 
    border: '1px solid #ddd', 
    borderRadius: '12px', 
    textAlign: 'center',
    boxShadow: '0 4px 15px rgb(255, 0, 0)',
    background: '#ffffff',
    backgroundColor: '#e2e21144'
};

const logoStyle = { 
    width: '160px', 
    height: 'auto',
    borderRadius: '50%', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
    outlineColor: '#2980b9',
    fontSize: '1rem'
};

const eyeIconStyle = {
    position: 'absolute',
    right: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    fontSize: '20px',
    color: '#7f8c8d',
    transition: 'color 0.3s',
    userSelect: 'none'
};

const btnStyle = {
    width: '100%',
    padding: '14px',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background 0.3s, color 0.3s, transform 0.2s'
};

export default LoginPage;