import React, { useState } from 'react'; // Importamos useState para el efecto hover
import { NavLink, useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import logo from '../assets/logo.jpeg';

const Navbar = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();
    const [isLogoHovered, setIsLogoHovered] = useState(false); // Estado para el hover del logo
    
    const userRol = localStorage.getItem('rol');
    const userName = localStorage.getItem('user');

    const handleLogout = () => {
        Swal.fire({
            title: '¿Cerrar sesión?',
            text: "Tendrás que ingresar tus datos de nuevo para acceder al sistema.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3261c0',
            cancelButtonColor: '#e74c3c',
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                setIsAuthenticated(false);
                navigate('/login');
            }
        });
    };

    const baseStyle = {
        color: 'white',
        textDecoration: 'none',
        fontWeight: 'bold',
        padding: '10px 15px',
        borderRadius: '4px',
        fontSize: '0.95rem',
        transition: 'all 0.3s ease',
        borderBottom: '3px solid transparent' 
    };

    const activeStyle = {
        ...baseStyle,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderBottom: '3px solid #61dafb', 
        color: '#61dafb'
    };

    return (
        <nav style={{ 
            padding: '0 25px', 
            height: '70px',
            backgroundColor: '#3261c0', 
            display: 'flex', 
            alignItems: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            
            {/* SECCIÓN LOGO + NOMBRE CON EFECTO HOVER */}
            <Link 
                to="/consultar-codigos" 
                onMouseEnter={() => setIsLogoHovered(true)}
                onMouseLeave={() => setIsLogoHovered(false)}
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginRight: '30px', 
                    textDecoration: 'none',
                    gap: '12px',
                    transition: 'transform 0.2s ease'
                }}
            >
                <img 
                    src={logo} 
                    alt="Logo La 8" 
                    style={{ 
                        height: '50px', 
                        width: '50px', 
                        borderRadius: '8px', 
                        objectFit: 'cover',
                        border: isLogoHovered ? '2px solid white' : '2px solid rgba(255,255,255,0.3)',
                        transition: 'all 0.3s ease'
                    }} 
                />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
                    <span style={{ 
                        color: isLogoHovered ? '#61dafb' : 'white',
                        fontSize: '1.4rem', 
                        fontWeight: '800', 
                        letterSpacing: '1px' 
                    }}>
                        LA 8
                    </span>
                    <span style={{ 
                        color: isLogoHovered ? 'white' : '#f7f311', // CAMBIO DINÁMICO DE COLOR
                        fontSize: '0.7rem', 
                        fontWeight: 'bold', 
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        transition: 'color 0.3s ease'
                    }}>
                        Arranques y Alternadores
                    </span>
                </div>
            </Link>

            <div style={{ display: 'flex', gap: '5px', alignItems: 'center', height: '100%' }}>
                {/* Menú Administrativo */}
                {userRol === 'admin' && (
                    <>
                        <NavLink to="/" style={({ isActive }) => isActive ? activeStyle : baseStyle}>🏠 Informes</NavLink>
                        <NavLink to="/usuarios" style={({ isActive }) => isActive ? activeStyle : { ...baseStyle, color: '#ffffff' }}>Usuarios</NavLink>
                        <NavLink to="/tecnicos" style={({ isActive }) => isActive ? activeStyle : baseStyle}>Técnicos</NavLink>
                        {/* <NavLink to="/asesores" style={({ isActive }) => isActive ? activeStyle : baseStyle}>Asesores</NavLink> */}
                    </>
                )}

                {/* Menú Operativo */}
                <NavLink to="/clientes" style={({ isActive }) => isActive ? activeStyle : baseStyle}>Clientes</NavLink>
                <NavLink to="/ordenes" style={({ isActive }) => isActive ? activeStyle : baseStyle}>Órdenes</NavLink>
                <NavLink to="/historial" style={({ isActive }) => isActive ? activeStyle : baseStyle}>Historial</NavLink>
            </div>

            {/* Información de Usuario y Salida */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: 'auto' }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>👤 {userName}</div>
                    <div style={{ color: '#61dafb', fontSize: '0.75rem', textTransform: 'uppercase' }}>{userRol}</div>
                </div>
                
                <button 
                    onClick={handleLogout} 
                    style={{ 
                        background: '#e74c3c', 
                        color: 'white', 
                        border: 'none', 
                        padding: '10px 20px', 
                        cursor: 'pointer', 
                        borderRadius: '6px', 
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                    🚪 Cerrar Sesión
                </button>
            </div>

            <style>{`
                a:hover {
                    background-color: rgba(255, 255, 255, 0.05);
                }
            `}</style>
        </nav>
    );
};

export default Navbar;