import React, { useState } from 'react';
import { createCliente } from '../services/clienteService';

const FormularioCliente = ({ onClienteCreado }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    contacto: ''
  });
  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'contacto') {
      // Bloquea todo lo que no sea número
      const soloNumeros = value.replace(/[^0-9]/g, '');
      setFormData({ ...formData, [name]: soloNumeros });
    } 
    else if (name === 'nombre') {
      // Bloquea números y símbolos, permite letras, tildes y espacios
      const soloLetras = value.replace(/[^a-zA-ZÁ-ÿ\s]/g, '');
      setFormData({ ...formData, [name]: soloLetras });
    } 
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones mínimas antes de enviar al backend
    if (formData.nombre.trim().length < 3) {
      setMensaje('⚠️ El nombre es demasiado corto');
      return;
    }
    if (formData.contacto.length < 7) {
      setMensaje('⚠️ El contacto debe tener al menos 7 dígitos');
      return;
    }

    try {
      const response = await createCliente(formData);
      setMensaje(`✅ ${response.mensaje}`);
      setFormData({ nombre: '', contacto: '' });
      if (onClienteCreado) onClienteCreado();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('❌ Error al registrar cliente');
      console.error(error);
    }
  };

  return (
    <div style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
      <h3 style={{ marginTop: 0 }}>Registrar Nuevo Cliente</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Nombre Completo (solo letras):</label><br />
          <input 
            type="text" 
            name="nombre" 
            placeholder="Ej: Juan Pérez"
            value={formData.nombre} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Número de Contacto (solo números):</label><br />
          <input 
            type="text" 
            name="contacto" 
            placeholder="Ej: 3101234567"
            value={formData.contacto} 
            onChange={handleChange} 
            required 
            maxLength="10"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <button 
          type="submit" 
          style={{ 
            backgroundColor: '#2ecc71', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontWeight: 'bold' 
          }}
        >
          Guardar Cliente
        </button>
      </form>
      {mensaje && <p style={{ marginTop: '10px', fontWeight: 'bold', color: mensaje.includes('✅') ? 'green' : 'red' }}>{mensaje}</p>}
    </div>
  );
};

export default FormularioCliente;