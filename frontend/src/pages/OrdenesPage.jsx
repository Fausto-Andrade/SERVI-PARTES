import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getOrdenes, createOrden, updateOrden } from '../services/ordenService';
import { getClientes } from '../services/clienteService';
import { getTecnicos } from '../services/tecnicoService';
import { getPersonalRecepcion } from '../services/recepcionService';
import usuarioService from '../services/usuarioService'; 
import Swal from 'sweetalert2';
import logo from '../assets/logo.jpeg'; // Ajusta la cantidad de ../ según tu estructura

const SERVICIOS_DISPONIBLES = [
    "Alternador",
    "Arranque",
    "Arranque moto",
    "Aspiradora",
    "Blower",
    "Bobina aire",
    "Bobinada campos bobina",
    "Bobinada corona",
    "Bobinada inducido",
    "Bobinada rotor",
    "Cambio de colector",
    "Moto ventilador",
    "Motor",
    "Motor carpado",
    "Motor elevavidrios",
    "Motor plumillas",
    "Motor puerta",
    "Pulidora",
    "Sistema eléctrico",
    "Taladro",
    "Vehiculo"
];

const OrdenesPage = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [personalRecepcion, setPersonalRecepcion] = useState([]);
    const [admins, setAdmins] = useState([]); 
    const [busqueda, setBusqueda] = useState('');
    const [repuestos, setRepuestos] = useState([{ descripcion: '', valor: '' }]);
    
    const [editando, setEditando] = useState(false);
    const [idOrdenActual, setIdOrdenActual] = useState(null);
    const [verHistorialGlobal, setVerHistorialGlobal] = useState(false); 

    const [paginaActual, setPaginaActual] = useState(1);
    const registrosPorPagina = 5;

    const [mostrarHistorial, setMostrarHistorial] = useState(false);
    const [historialFiltrado, setHistorialFiltrado] = useState([]);
    const [equipoActual, setEquipoActual] = useState('');

    const [montoASumar, setMontoASumar] = useState('');
    const [historialAbonos, setHistorialAbonos] = useState([]);
    const selectTipoOrdenRef = useRef(null);
    const ultimoInputRef = useRef(null);

    const [formData, setFormData] = useState({
        tipo_orden: 'nueva', 
        cliente_id: '', tecnico_id: '', recibido_por: '', 
        tipo_articulo: 'Vehículo', placa: '', codigo_equipo: '', 
        categoria_servicio: '', tipo_especifico: '', mano_obra: '',
        requiere_factura: false, factura_emitida: false,
        estado_pago: 'Pendiente', abono_inicial: 0,
        estado: 'Recibido'
    });

    useEffect(() => {
        if (selectTipoOrdenRef.current) {
            selectTipoOrdenRef.current.focus();
        }
    }, []); 

    // --- CARGA DE DATOS Y LÓGICA ---

    const cargarTodo = useCallback(async () => {
        try {
            const [dataO, dataC, dataT, dataR, dataU] = await Promise.all([
                getOrdenes(), 
                getClientes(), 
                getTecnicos(), 
                getPersonalRecepcion(),
                usuarioService.listar() 
            ]);

            setOrdenes(dataO || []); 
            setClientes(dataC || []); 
            
            const tecnicosActivos = (dataT || []).filter(t => t.activo !== false);
            setTecnicos(tecnicosActivos); 
            
            setPersonalRecepcion(dataR || []);
            
            if (dataU) {
                const filtrados = dataU.filter(u => {
                    const rol = (u.rol || u.role || '').toLowerCase();
                    return rol === 'admin' || rol === 'empleado';
                });
                const unicos = Array.from(new Map(filtrados.map(u => [u.nombre || u.username, u])).values());
                setAdmins(unicos);
            }
        } catch (error) { 
            console.error("Error cargando datos:", error); 
        }
    }, []);

    useEffect(() => {
        cargarTodo();
    }, [cargarTodo]);

    useEffect(() => {
        if (!editando) {
            if (formData.tipo_orden === 'nueva') {
                const numeros = ordenes.map(o => parseInt(o.codigo_equipo)).filter(n => !isNaN(n));
                const siguiente = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;
                setFormData(prev => ({ ...prev, codigo_equipo: siguiente.toString() }));
            } else {
                setFormData(prev => ({ ...prev, codigo_equipo: '' }));
            }
        }
    }, [formData.tipo_orden, ordenes, editando]);

    // --- CÁLCULOS ---
    const listaCombinada = [...personalRecepcion, ...admins];
    const listaReceptores = Array.from(new Map(listaCombinada.map(p => [p.nombre || p.username, p])).values());

    const totalRepuestos = repuestos.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
    const totalGeneral = totalRepuestos + (Number(formData.mano_obra) || 0);
    const saldoPendiente = totalGeneral - (Number(formData.abono_inicial) || 0);

    const esOrdenYaCerradaBase = editando && ordenes.find(o => o.id_orden_servicio === idOrdenActual)?.estado === 'Entregado' && ordenes.find(o => o.id_orden_servicio === idOrdenActual)?.estado_pago === 'Pagado';
    
    const mostrarCheckFinalizado = formData.estado === 'Entregado' && formData.estado_pago === 'Pagado';

    //FOCO AL AGREGAR: Solo cuando el usuario hace clic físicamente en el botón
    const agregarRepuesto = () => {
        setRepuestos([...repuestos, { descripcion: '', valor: '' }]);
        
        // El foco se ejecuta DESPUÉS de que React actualiza el DOM
        setTimeout(() => {
            if (ultimoInputRef.current) {
                ultimoInputRef.current.focus();
            }
        }, 0);
    };

    const seleccionarOrden = (orden) => {
        setEditando(true);
        setIdOrdenActual(orden.id_orden_servicio);

        let repuestosFormateados = [{ descripcion: '', valor: '' }];
        
        if (orden.categoria_servicio && orden.categoria_servicio.trim() !== "") {
            const items = orden.categoria_servicio.split(', ');
            repuestosFormateados = items.map(item => {
                const match = item.match(/(.*?) \(\$(.*?)\)/);
                return {
                    descripcion: match ? match[1] : item,
                    valor: match ? match[2] : ''
                };
            });
        }
        setRepuestos(repuestosFormateados);

        const historialGuardado = localStorage.getItem(`historial_orden_${orden.id_orden_servicio}`);
        
        if (historialGuardado) {
            setHistorialAbonos(JSON.parse(historialGuardado));
        } else if (Number(orden.abono_inicial) > 0) {
            const fechaOriginal = new Date(orden.fecha_ingreso);
            const saldoInicial = [{
                monto: orden.abono_inicial,
                fecha: fechaOriginal.toLocaleDateString(),
                hora: fechaOriginal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Inicial)'
            }];
            setHistorialAbonos(saldoInicial);
        } else {
            setHistorialAbonos([]);
        }

    // 3. CARGAR DATOS DEL FORMULARIO
    setFormData({
        tipo_orden: orden.tipo_orden || 'nueva',
        cliente_id: orden.cliente_id || '',
        tecnico_id: orden.tecnico_id || '',
        recibido_por: orden.recibido_por || '',
        tipo_articulo: orden.tipo_articulo || 'Vehículo',
        placa: orden.placa || '',
        codigo_equipo: orden.codigo_equipo || '',
        tipo_especifico: orden.tipo_especifico || '',
        // Usamos Math.floor como ya lo tenías para evitar decimales molestos en UI
        mano_obra: Math.floor(Number(orden.mano_obra || 0)),
        requiere_factura: orden.requiere_factura || false,
        factura_emitida: orden.factura_emitida || false,
        estado_pago: orden.estado_pago || 'Pendiente',
        abono_inicial: orden.abono_inicial || 0,
        estado: orden.estado || 'Recibido'
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

    const limpiarFormulario = () => {
        setEditando(false);
        setIdOrdenActual(null);
        setRepuestos([{ descripcion: '', valor: '' }]);
        setMontoASumar('');
        setHistorialAbonos([]);
        setFormData({
            tipo_orden: 'nueva',
            cliente_id: '', tecnico_id: '', recibido_por: '', 
            tipo_articulo: 'Vehículo', placa: '', codigo_equipo: '', 
            categoria_servicio: '', tipo_especifico: '', mano_obra: '',
            requiere_factura: false, factura_emitida: false,
            estado_pago: 'Pendiente', abono_inicial: 0,
            estado: 'Recibido'
        });
    };

    const handleSumarAbono = () => {
    if (esOrdenYaCerradaBase) return;
    
    const valorNuevoAbono = Number(montoASumar);
    
    // CALCULAR SALDO PENDIENTE REAL
    // totalGeneral es la suma de mano de obra + repuestos que ya tienes calculada
    const saldoPendiente = totalGeneral - Number(formData.abono_inicial);

    // 1. VALIDACIÓN: No permitir montos vacíos o menores a cero
    if (valorNuevoAbono <= 0 || !montoASumar) {
        Swal.fire({
            icon: 'warning',
            title: 'Monto inválido',
            text: 'Por favor, ingresa un valor mayor a cero para el abono.',
            confirmButtonColor: '#f39c12'
        });
        return;
    }

    // VALIDACIÓN: No permitir que el abono supere el saldo
    if (valorNuevoAbono > saldoPendiente) {
        Swal.fire({
            icon: 'error',
            title: 'Monto excedido',
            html: `El abono <b>$${valorNuevoAbono.toLocaleString()}</b> supera el saldo pendiente.<br><br> 
                   Saldo actual: <b>$${saldoPendiente.toLocaleString()}</b>`,
            confirmButtonColor: '#e74c3c'
        });
        return;
    }

    // PROCESO DE REGISTRO (Si pasa las validaciones)
    const nuevoTotalAbonado = Number(formData.abono_inicial) + valorNuevoAbono;
    
    const nuevoRegistro = {
        monto: valorNuevoAbono,
        fecha: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nuevoHistorial = [...historialAbonos, nuevoRegistro];
    
    // ACTUALIZAR ESTADO Y NAVEGADOR
    setHistorialAbonos(nuevoHistorial);
    if (idOrdenActual) {
        localStorage.setItem(`historial_orden_${idOrdenActual}`, JSON.stringify(nuevoHistorial));
    }

    setFormData(prev => ({
        ...prev,
        abono_inicial: nuevoTotalAbonado,
        // Si el nuevo total es igual al general, cambia a Pagado automáticamente
        estado_pago: nuevoTotalAbonado === totalGeneral ? 'Pagado' : 'Parcial'
    }));
    
    // LIMPIEZA Y NOTIFICACIÓN DE ÉXITO
    setMontoASumar('');
    Swal.fire({ 
        icon: 'success', 
        title: 'Abono registrado', 
        text: `Nuevo saldo: $${(totalGeneral - nuevoTotalAbonado).toLocaleString()}`,
        timer: 1500, 
        showConfirmButton: false 
    });
};

    const abrirHistorial = (codigo) => {
        const filtrado = ordenes.filter(o => o.codigo_equipo === codigo && o.estado === 'Entregado');
        setHistorialFiltrado(filtrado);
        setEquipoActual(codigo);
        setMostrarHistorial(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        setFormData(prev => {
            const nuevoValor = type === 'checkbox' ? checked : value;
            let actualizacion = { ...prev, [name]: nuevoValor };
            
            if (name === 'estado_pago') {
                if (nuevoValor === 'Pagado') {
                    actualizacion.abono_inicial = totalGeneral;
                } else if (nuevoValor === 'Parcial' || nuevoValor === 'Pendiente') {
                    const sumaHistorial = historialAbonos.reduce((acc, ab) => acc + Number(ab.monto), 0);
                    actualizacion.abono_inicial = sumaHistorial;
                }
            }
            return actualizacion;
        });
    };

    const handleRepuestoChange = (index, field, value) => {
        const nuevos = [...repuestos];
        nuevos[index][field] = value;
        setRepuestos(nuevos);
    };

    const handleSubmit = async (e) => {
       e.preventDefault();
        if (esOrdenYaCerradaBase) return;

        // CONDICIÓN SOLICITADA: Para finalizar (Entregado), debe estar Pagado totalmente
        if (formData.estado === 'Entregado' && formData.estado_pago !== 'Pagado') {
            return Swal.fire({
                icon: 'warning',
                title: 'No se puede cerrar la orden',
                text: 'Para marcar la orden como "Entregado", el estado de pago debe ser "Pagado" (Saldo $0).',
                confirmButtonColor: '#3498db'
            });
        }

        if (!editando && formData.tipo_orden === 'nueva') {
            const duplicada = ordenes.find(o => o.codigo_equipo === formData.codigo_equipo && o.estado !== 'Entregado');
            if (duplicada) return Swal.fire({ icon: 'error', title: 'Código Duplicado', text: `Ya existe una orden abierta con el código ${formData.codigo_equipo}` });
        }

        const procedimientos = repuestos
            .filter(r => r.descripcion.trim() !== '')
            .map(r => `${r.descripcion} ($${r.valor || 0})`).join(', ');

        try {
            const sesionSring = localStorage.getItem('usuario'); 
            const usuarioLogueado = sesionSring ? JSON.parse(sesionSring) : null;
            const idUsuarioActual = usuarioLogueado?.id || 1;

            const dataAGuardar = { 
                ...formData, 
                categoria_servicio: procedimientos, 
                id_usuario: idUsuarioActual,
                cliente_id: parseInt(formData.cliente_id, 10),
                tecnico_id: parseInt(formData.tecnico_id, 10),
                mano_obra: parseFloat(formData.mano_obra) || 0,
                abono_inicial: parseFloat(formData.abono_inicial) || 0,
                total: parseFloat(totalGeneral) || 0,
                historial_abonos: JSON.stringify(historialAbonos)
            };

            if (editando) {
                await updateOrden(idOrdenActual, dataAGuardar);
                await Swal.fire({ icon: 'success', title: '¡Actualizado!', timer: 1500, showConfirmButton: false });
            } else {
                await createOrden(dataAGuardar);
                await Swal.fire({ icon: 'success', title: '¡Orden Creada!', timer: 1500, showConfirmButton: false });
            }
            limpiarFormulario();
            cargarTodo();
        } catch (error) { 
            Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error al procesar' });
        }
    };

    const ordenesFiltradas = ordenes.filter(o => {
        const coincideBusqueda = 
            o.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
            o.codigo_equipo?.toLowerCase().includes(busqueda.toLowerCase()) ||
            o.placa?.toLowerCase().includes(busqueda.toLowerCase());
        
        const esCerrada = o.estado === 'Entregado';
        
        return coincideBusqueda && (verHistorialGlobal ? esCerrada : !esCerrada);
    });

    const handlePrint = (orden) => {
    // Creamos una ventana nueva para el ticket de impresión
        const printWindow = window.open('', '_blank');
    
        // Aquí defines el diseño de tu ticket (HTML + CSS básico)
        printWindow.document.write(`
            <html>
                <head>                    
                    <style>                    
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 10px; color: #333; }
                        .ticket { max-width: 400px; margin: 0 auto; border: 1px solid #eee; padding: 15px; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .header-content {
                            display: flex;
                            justify-content: space-between; /* Logo a la izquierda, texto a la derecha */
                            align-items: center;
                            border-bottom: 2px solid #333;
                            padding-bottom: 15px;
                            margin-bottom: 20px;
                        }
                        .logo { max-width: 100px; height: auto; margin-bottom: 10px; }
                        .info-container {
                            text-align: right;
                        }
                        .empresa-nombre { font-size: 1.4rem; font-weight: bold; margin: 0; color: #000; }
                        .info-taller { font-size: 0.8rem; color: #666; margin-bottom: 10px; }
                        
                        .titulo-orden { background: #f4f4f4; text-align: center; padding: 5px; font-weight: bold; margin-bottom: 15px; border: 1px solid #ddd; }
                        
                        .fila { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem; border-bottom: 1px dotted #eee; padding-bottom: 2px; }
                        .label { font-weight: bold; color: #555; }
                        .valor { text-align: right; }
                        
                        .footer { margin-top: 30px; font-size: 0.75rem; text-align: center; border-top: 1px solid #000; padding-top: 10px; }
                        
                        @media print {
                            body { padding: 0; }
                            .ticket { border: none; max-width: 100%; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                <title>ARRANQUES Y ALTERNADORES LA 8va</title>
                    <div class="ticket">
                        <div class="header">
                            <div class="header-content", >
                                <div class="logo-container">
                                    <img src="${logo}" alt="Logo" class="logo" onerror="this.style.display='none'">
                                </div>
                                <div class="info-container">
                                    <div class="info-taller">
                                        <strong>Nit:</strong> 901911501-6 <br>
                                        <strong>📍</strong> Calle 9 # 7-83, Cartago <br>
                                        <strong>📞</strong> Tel: 3117748294
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="titulo-orden">ORDEN DE SERVICIO # ${orden.codigo_equipo}</div>

                        <div class="fila"><span class="label">Fecha:</span> <span class="valor">${new Date(orden.fecha_ingreso).toLocaleDateString()}</span></div>
                        <div class="fila"><span class="label">Cliente:</span> <span class="valor">${orden.nombre_cliente || 'General'}</span></div>
                        <div class="fila"><span class="label">Contacto:</span> <span class="valor">${orden.contacto || '-'}</span></div>
                        <div class="fila"><span class="label">Recibido por:</span> <span class="valor">${orden.recibido_por || '-'}</span></div>
                        
                        <div style="margin: 15px 0; font-weight: bold; font-size: 0.9rem; ">DATOS DEL EQUIPO:</div>
                        
                        <div class="fila"><span class="label">Equipo:</span> <span class="valor">${orden.tipo_especifico}</span></div>
                        <div class="fila"><span class="label">Placa/Código:</span> <span class="valor">${orden.placa || orden.codigo_equipo}</span></div>
                        <div class="fila"><span class="label">Servicio:</span> <span class="valor">${orden.categoria_servicio}</span></div>
                        <div class="fila"><span class="label">Mano de obra:</span> <span class="valor">${orden.mano_obra}</span></div>
                        <div class="fila"><span class="label">Total:</span> <span class="valor">${orden.total}</span></div>
                        <div class="fila"><span class="label">Estado:</span> <span class="valor"><strong>${orden.estado}</strong></span></div>

                        <div class="footer">
                            <p>Favor presentar este documento para retirar su equipo.</p>
                            <p><em>Gracias por confiar en nosotros.</em></p>
                        </div>
                    </div>
                </body>
            </html>
        `);
        
            printWindow.document.close();
            printWindow.onload = () => {
            printWindow.print(); // Abre el diálogo de impresión del sistema
            printWindow.close(); // Cerrar despues de imprimir
        };
    };
    const registrosPaginados = ordenesFiltradas.slice((paginaActual - 1) * registrosPorPagina, paginaActual * registrosPorPagina);
    const totalPaginas = Math.ceil(ordenesFiltradas.length / registrosPorPagina);

    // --- ESTILOS ---
    const grid3Col = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' };
    const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d', marginBottom: '5px' };
    const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box' };
    const inputDisabled = { ...inputStyle, background: '#f5f5f5', color: '#95a5a6', cursor: 'not-allowed' };
    const formCardStyle = { background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '30px' };
    const btnSubmit = { width: '100%', padding: '15px', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '20px', transition: 'all 0.3s' };
    const btnSmall = { padding: '8px 15px', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer', fontWeight: 'bold' };
    const searchStyle = { padding: '10px 20px', borderRadius: '25px', border: '1px solid #ddd', width: '350px', outline: 'none' };
    const tableContainer = { background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
    const thStyle = { padding: '15px', textAlign: 'center', fontSize: '0.85rem' };
    const tdStyle = { padding: '15px', fontSize: '0.85rem', borderBottom: '1px solid #eee' };
    const actionBtn = { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', marginRight: '10px' };
    const billingGrid = { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px', width: '100%'};
    const btnDeleteStyle = { background: '#ff7675', color: 'white', border: 'none', borderRadius: '5px', width: '38px', height: '38px', cursor: 'pointer' };
    const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
    const modalContent = { backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '80%', maxWidth: '900px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' };
    const btnClose = { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' };
    const thSmall = { padding: '10px', fontSize: '0.75rem', textAlign: 'left', color: '#7f8c8d' };
    const tdSmall = { padding: '10px', fontSize: '0.8rem' };

   return (
        <div style={{ padding: '20px', maxWidth: '1366px', margin: 'auto' }}>
            {/* MODAL DE HISTORIAL POR EQUIPO */}
            {mostrarHistorial && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                            <h3 style={{ margin: 0 }}>📜 Historial: <span style={{color: '#3498db'}}>{equipoActual}</span></h3>
                            <button onClick={() => setMostrarHistorial(false)} style={btnClose}>&times;</button>
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '15px' }}>
                            <table width="100%" style={{ borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa' }}>
                                        <th style={thSmall}>Fecha</th>
                                        <th style={thSmall}>Responsables</th>
                                        <th style={thSmall}>Servicio</th>
                                        <th style={thSmall}>Mano Obra</th>
                                        <th style={thSmall}>Repuestos</th>
                                        <th style={thSmall}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historialFiltrado.map((h, index) => {
                                        const sumaRepuestos = (h.categoria_servicio || '')
                                            .split(', ')
                                            .reduce((acc, item) => {
                                                const match = item.match(/\(\$(.*?)\)/);
                                                return acc + (match ? (Number(match[1]) || 0) : 0);
                                            }, 0);

                                        return (
                                            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={tdSmall}>{new Date(h.fecha_ingreso).toLocaleDateString()}</td>
                                                <td style={tdSmall}><b>{h.recibido_por}</b><br/>Téc: {h.nombre_tecnico}</td>
                                                <td style={tdSmall}>{h.categoria_servicio}</td>
                                                <td style={tdSmall}>${Number(h.mano_obra).toLocaleString()}</td>
                                                <td style={tdSmall}>${sumaRepuestos.toLocaleString()}</td>
                                                <td style={tdSmall}><b>${Number(h.total).toLocaleString()}</b></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <div className="no-print">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{color: '#2c3e50', margin: 0}}>🛠️ {editando ? `Editando Orden #${formData.codigo_equipo}` : 'Gestión de Órdenes'}</h2>
                    {/* <button onClick={limpiarFormulario} style={{...btnSmall, background: '#27ae60'}}>Nueva Orden (+)</button> */}
                </header>

                {/* FORMULARIO DE GESTIÓN */}
                <form onSubmit={handleSubmit} style={{...formCardStyle, borderTop: editando ? '5px solid #3498db' : '5px solid #27ae60'}}>
                    <div style={grid3Col}>
                        <div>
                            <label style={labelStyle}>TIPO DE INGRESO</label>
                            <select 
                                ref={selectTipoOrdenRef}
                                name="tipo_orden" 
                                value={formData.tipo_orden} 
                                onChange={handleChange} 
                                style={inputStyle} 
                                disabled={editando}
                                >
                                    <option value="nueva">Orden Nueva</option>
                                    <option value="garantia">Garantía</option>
                                    <option value="reingreso">Reingreso</option>
                            </select>
                        </div>

                        <div>
                            <label style={labelStyle}>CÓDIGO / NÚMERO ORDEN</label>
                            <input 
                                name="codigo_equipo" 
                                value={formData.codigo_equipo} 
                                onChange={handleChange} 
                                required 
                                style={formData.tipo_orden === 'nueva' ? inputDisabled : inputStyle}
                                readOnly={formData.tipo_orden === 'nueva'}
                                placeholder={formData.tipo_orden === 'nueva' ? "" : "Escriba código existente"}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Cliente</label>
                            <select 
                                name="cliente_id" 
                                value={formData.cliente_id} 
                                onChange={handleChange} 
                                style={inputStyle}
                            >
                                <option value="">Seleccione un cliente</option>
                                {clientes
                                    .slice() // Copia para seguridad
                                    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
                                    .map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.nombre}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                    
                    <div style={{...grid3Col, marginTop: '15px'}}>
                        <div>
                            <label style={labelStyle}>Tipo de Equipo</label>
                            <select 
                                name="tipo_especifico" 
                                value={formData.tipo_especifico} 
                                onChange={handleChange} 
                                required 
                                style={inputStyle} 
                                disabled={editando}
                            >
                                <option value="">Seleccionar...</option>
                                {SERVICIOS_DISPONIBLES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Técnico Asignado</label>
                            <select name="tecnico_id" value={formData.tecnico_id} onChange={handleChange} required style={inputStyle}>
                                <option value="">Técnico...</option>
                                {tecnicos.map(t => (
                                    <option key={t.id_usuario || t.id_tecnicos} value={t.id_usuario || t.id_tecnicos}>
                                        {t.nombre || t.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Quién Recibe</label>
                            <select name="recibido_por" value={formData.recibido_por} onChange={handleChange} required style={inputStyle} disabled={editando}>
                                <option value="">Seleccionar Usuario...</option>
                                {listaReceptores.map((persona, idx) => (
                                    <option key={idx} value={persona.nombre || persona.username}>{persona.nombre || persona.username}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{...grid3Col, marginTop: '15px'}}>
                        <div>
                            <label style={labelStyle}>Estado de Trabajo</label>
                            <select name="estado" value={formData.estado} onChange={handleChange} style={{...inputStyle, background: formData.estado === 'Entregado' ? '#d4edda' : 'white'}}>
                                <option value="Recibido">Recibido</option>
                                <option value="En Proceso">En Proceso</option>
                                <option value="Terminado">Terminado</option>
                                <option value="Entregado">Entregado</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Placa (Vehículos)</label>
                            <input name="placa" value={formData.placa} onChange={handleChange} style={inputStyle} disabled={editando || formData.tipo_especifico !== 'Vehiculo'}/>
                        </div>
                        <div>
                            <label style={labelStyle}>Mano de Obra</label>
                            <input type="number" name="mano_obra" value={formData.mano_obra} onChange={handleChange} style={{...inputStyle, fontWeight: 'bold', color: '#165be6', fontSize: '15px'}} />
                        </div>
                    </div>

                    {/* SECCIÓN DE REPUESTOS CON FOCO AUTOMÁTICO */}
                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginTop: '20px', border: '1px solid #eee' }}>
                    <h4 style={{marginTop: 0}}>🔧 Repuestos y Adicionales</h4>
                    {repuestos.map((rep, index) => (
                        <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <input 
                                // Asignamos la referencia SOLO al último elemento del array
                                ref={index === repuestos.length - 1 ? ultimoInputRef : null}
                                style={{ ...inputStyle, flex: 3 }} 
                                placeholder="Descripción" 
                                value={rep.descripcion} 
                                onChange={(e) => handleRepuestoChange(index, 'descripcion', e.target.value)} 
                            />
                            <input 
                                style={{ ...inputStyle, flex: 1 }} 
                                type="number" 
                                placeholder="$" 
                                value={rep.valor} 
                                onChange={(e) => handleRepuestoChange(index, 'valor', e.target.value)} 
                            />

                            {/* Eliminar input de repuestos adicionales */}
                            {repuestos.length > 1 && (
                                    <button type="button" onClick={() => setRepuestos(repuestos.filter((_, i) => i !== index))} style={btnDeleteStyle}>🗑️</button>
                                )}
                        </div>
                    ))}
                    <button type="button" onClick={agregarRepuesto} style={{...btnSmall, background: '#3498db'}}>
                        + Agregar Ítem
                    </button>
                </div>
                    
                    {/* SECCIÓN DE PAGOS Y TOTALES */}
                    <div style={billingGrid}>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                💰 Gestión de Pagos
                            </h4>
                            
                            {/* Controles de Entrada */}
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <select 
                                    name="estado_pago" 
                                    value={formData.estado_pago} 
                                    onChange={handleChange} 
                                    style={{ ...inputStyle, flex: 1 }}
                                >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Parcial">Abono Parcial</option>
                                    <option value="Pagado">Pago Total</option>
                                </select>
                                
                                <input 
                                    type="number" 
                                    value={montoASumar} 
                                    onChange={(e) => setMontoASumar(e.target.value)} 
                                    style={{
                                        ...inputStyle,
                                        fontWeight: 'bold', color: '#165be6', fontSize: '25px', 
                                        flex: 2,
                                        background: (formData.estado_pago === 'Pendiente' || formData.estado_pago === 'Pagado') ? '#f5f5f5' : 'white'
                                    }} 
                                    disabled={formData.estado_pago === 'Pendiente' || formData.estado_pago === 'Pagado'}
                                />
                                
                                <button 
                                    type="button" 
                                    onClick={handleSumarAbono} 
                                    style={{
                                        ...btnSmall, 
                                        background: '#27ae60', 
                                        padding: '0 25px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        opacity: (formData.estado_pago === 'Pendiente' || formData.estado_pago === 'Pagado') ? 0.30 : 1
                                    }}
                                    disabled={formData.estado_pago === 'Pendiente' || formData.estado_pago === 'Pagado'}
                                >
                                    Sumar
                                </button>
                            </div>
                            
                            {/* Tabla de Historial (Diseño de la Imagen) */}
                            <div style={{ 
                                marginTop: '15px', 
                                padding: '15px', 
                                background: '#fff', 
                                border: '1px dashed #ccc', 
                                borderRadius: '8px' 
                            }}>
                                <p style={{ 
                                    fontSize: '11px', 
                                    fontWeight: 'bold', 
                                    color: '#999', 
                                    textAlign: 'center',
                                    marginBottom: '15px', 
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    HISTORIAL DE ABONOS:
                                </p>
                                
                                <table width="90%" style={{ fontSize: '14px', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ color: '#555', borderBottom: 'none' }}>
                                            <th style={{ textAlign: 'left', paddingBottom: '10px', fontWeight: '500' }}>Fecha/Hora</th>
                                            <th style={{ textAlign: 'right', paddingBottom: '10px', fontWeight: '500' }}>Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historialAbonos.map((ab, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                <td style={{ padding: '10px 0', color: '#2c3e50', fontSize: '13px', textAlign: 'left' }}>
                                                    {ab.fecha} 
                                                    <span style={{ color: '#7f8c8d', margin: '0 5px' }}>-</span> 
                                                    <span style={{ fontSize: '12px' }}>{ab.hora}</span>
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: 'bold', padding: '10px 0' }}>
                                                    ${Number(ab.monto).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Resumen de Totales (Lado Derecho) */}
                        <div style={{ textAlign: 'right', minWidth: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2c3e50' }}>
                                TOTAL: ${totalGeneral.toLocaleString()}
                            </div>
                            <br />
                            <div style={{ 
                                fontSize: '1.8rem',
                                color: (totalGeneral - formData.abono_inicial) > 0 ? '#e74c3c' : '#27ae60', 
                                fontWeight: 'bold',
                                marginTop: '5px'
                            }}>
                                SALDO: ${(totalGeneral - formData.abono_inicial).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={esOrdenYaCerradaBase}
                        style={{
                            ...btnSubmit, 
                            background: esOrdenYaCerradaBase ? '#2c3e50' : (editando ? '#3498db' : '#27ae60'),
                            cursor: esOrdenYaCerradaBase ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {esOrdenYaCerradaBase ? '✔️ Orden Cerrada (No Editable)' : (mostrarCheckFinalizado ? '🏁 Finalizar y Cerrar Orden' : (editando ? '💾 Guardar Cambios' : '🆕 Crear Orden'))}
                    </button>
                </form>

                {/* TABLA DE ÓRDENES Y BÚSQUEDA */}
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center'}}>
                    <input type="text" placeholder="🔍 Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={searchStyle} />
                    <h2>{verHistorialGlobal ? 'Historial de Ordenes Cerradas' : 'Ordenes Abiertas'}</h2>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <button onClick={() => { setVerHistorialGlobal(false); setPaginaActual(1); }} style={{...btnSmall, background: !verHistorialGlobal ? '#2c3e50' : '#bdc3c7'}}>Activas</button>
                        <button onClick={() => { setVerHistorialGlobal(true); setPaginaActual(1); }} style={{...btnSmall, background: verHistorialGlobal ? '#2c3e50' : '#bdc3c7'}}>Historial</button>
                    </div>
                </div>

                <div style={tableContainer}>
                    <table width="100%" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#2c3e50', color: 'white' }}>
                                <th style={thStyle}>Código</th>
                                <th style={thStyle}>Cliente</th>
                                <th style={thStyle}>Tipo de equipo</th>
                                <th style={thStyle}>Estado</th>
                                <th style={thStyle}>Saldo</th>
                                <th style={thStyle}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registrosPaginados.map((o, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={tdStyle}><b>{o.codigo_equipo}</b></td>
                                    <td style={tdStyle}>{o.nombre_cliente}</td>
                                     <td style={tdStyle}>{o.tipo_especifico}</td>
                                    <td style={tdStyle}>{o.estado}</td>
                                    <td style={tdStyle}>
                                        <span style={{ color: (o.total - o.abono_inicial) > 0 ? '#e74c3c' : '#27ae60', fontWeight: 'bold' }}>
                                            ${(o.total - o.abono_inicial).toLocaleString()}
                                        </span>
                                    </td>
                                     <td style={tdStyle}>
                                        {o.estado !== 'Entregado' && (
                                            <button onClick={() => seleccionarOrden(o)} style={actionBtn} title="Editar Orden">✏️</button>
                                        )}

                                        {/* NUEVO: Botón de Impresora 🖨️ */}
                                        <button 
                                            onClick={() => handlePrint(o)} 
                                            style={{ 
                                                background: 'none', 
                                                border: 'none', 
                                                cursor: 'pointer', 
                                                fontSize: '18px',
                                                color: '#007bff' // Un color azul para diferenciarlo
                                            }}
                                            title="Imprimir Orden"
                                        >
                                            🖨️
                                        </button>

                                        {o.estado === 'Entregado' && (
                                            <button onClick={() => abrirHistorial(o.codigo_equipo)} style={actionBtn} title="Ver Historial">📜</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* PAGINACIÓN */}
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
            </div>
        </div>
    );
};

export default OrdenesPage;