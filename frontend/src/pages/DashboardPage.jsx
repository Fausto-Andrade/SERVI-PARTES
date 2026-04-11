import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrdenes } from '../services/ordenService';
import { 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    AreaChart, Area 
} from 'recharts';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [todasLasOrdenes, setTodasLasOrdenes] = useState([]);
    const [periodo, setPeriodo] = useState('diario');
    const [isLoaded, setIsLoaded] = useState(false);
    const [ordenesFiltradas, setOrdenesFiltradas] = useState([]); 
    const [busqueda, setBusqueda] = useState('');
    
    // Estados para rango de fechas
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    // --- ESTADOS PARA PAGINACIÓN ---
    const [paginaActual, setPaginaActual] = useState(1);
    const registrosPorPagina = 5;

    const [stats, setStats] = useState({
        totalManoObra: 0,
        totalRepuestos: 0,
        totalIngresos: 0,
        cantidadOrdenes: 0,
        dataGrafica: [],
        dataAnual: []
    });

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const data = await getOrdenes();
                setTodasLasOrdenes(data);
                procesarPorPeriodo(data, 'diario');
                setTimeout(() => setIsLoaded(true), 200);
            } catch (error) { 
                console.error("Error cargando datos:", error); 
            }
        };
        cargarDatos();
    }, []);

    // Función auxiliar para normalizar fechas sin desfase de zona horaria
    const normalizarFecha = (fechaStr) => {
        if (!fechaStr) return new Date();
        const d = new Date(fechaStr);
        if (fechaStr.includes('T')) return d; 
        return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    };

    const procesarPorPeriodo = (data, tipo, params = {}) => {
        const ahora = new Date();
        let fechaInicio = new Date();
        let fechaFin = new Date();
        const anioActual = ahora.getFullYear();

        setPaginaActual(1);

        if (tipo === 'mes' && params.mesIndex !== null) {
            fechaInicio = new Date(anioActual, params.mesIndex, 1);
            fechaFin = new Date(anioActual, params.mesIndex + 1, 0, 23, 59, 59);
            setPeriodo(`Mes: ${new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(fechaInicio)}`);
        } else if (tipo === 'rango') {
            const [y1, m1, d1] = params.desde.split('-').map(Number);
            const [y2, m2, d2] = params.hasta.split('-').map(Number);
            fechaInicio = new Date(y1, m1 - 1, d1, 0, 0, 0);
            fechaFin = new Date(y2, m2 - 1, d2, 23, 59, 59);
            setPeriodo(`Rango: ${params.desde} al ${params.hasta}`);
        } else {
            if (tipo === 'diario') {
                fechaInicio.setHours(0, 0, 0, 0);
                fechaFin.setHours(23, 59, 59, 999);
            }
            else if (tipo === 'semanal') fechaInicio.setDate(ahora.getDate() - 7);
            else if (tipo === 'quincenal') fechaInicio.setDate(ahora.getDate() - 15);
            else if (tipo === 'mensual') fechaInicio.setMonth(ahora.getMonth(), 1);
            setPeriodo(tipo);
        }

        const filtradas = data.filter(o => {
            const f = new Date(o.fecha_creacion || o.fecha_ingreso);
            return f >= fechaInicio && f <= fechaFin;
        });

        setOrdenesFiltradas(filtradas);

        let sumaMO = 0;
        let sumaRepuestos = 0;

        filtradas.forEach(o => {
            sumaMO += parseFloat(o.mano_obra) || 0;
            const rep = o.categoria_servicio?.match(/\$(\d+)/g)?.reduce((s, v) => s + parseInt(v.replace('$', '')), 0) || 0;
            sumaRepuestos += rep;
        });

        const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const dataAnualCalculada = mesesNombres.map((name, index) => {
            const ordenesMes = data.filter(o => {
                const f = new Date(o.fecha_creacion || o.fecha_ingreso);
                return f.getMonth() === index && f.getFullYear() === anioActual;
            });
            const montoMes = ordenesMes.reduce((acc, o) => {
                const mo = parseFloat(o.mano_obra) || 0;
                const rep = o.categoria_servicio?.match(/\$(\d+)/g)?.reduce((s, v) => s + parseInt(v.replace('$', '')), 0) || 0;
                return acc + mo + rep;
            }, 0);
            return { name, monto: montoMes };
        });

        setStats({
            totalManoObra: sumaMO,
            totalRepuestos: sumaRepuestos,
            totalIngresos: sumaMO + sumaRepuestos,
            cantidadOrdenes: filtradas.length,
            dataAnual: dataAnualCalculada
        });
    };

    const handleFiltrarRango = () => {
        if (fechaDesde && fechaHasta) {
            procesarPorPeriodo(todasLasOrdenes, 'rango', { desde: fechaDesde, hasta: fechaHasta });
        }
    };

    // --- LÓGICA DE FILTRADO Y PAGINACIÓN ---
    const ordenesVisiblesBase = ordenesFiltradas.filter(o => 
        (o.id?.toString() || "").includes(busqueda) ||
        (o.nombre_tecnico?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
        (o.categoria_servicio?.toLowerCase() || "").includes(busqueda.toLowerCase())
    );

    const ultimoIndice = paginaActual * registrosPorPagina;
    const primerIndice = ultimoIndice - registrosPorPagina;
    const ordenesPaginadas = ordenesVisiblesBase.slice(primerIndice, ultimoIndice);
    const totalPaginas = Math.ceil(ordenesVisiblesBase.length / registrosPorPagina);

    const totalesPorTecnico = ordenesVisiblesBase.reduce((acc, o) => {
        const nombre = o.nombre_tecnico || 'Sin asignar';
        acc[nombre] = (acc[nombre] || 0) + (parseFloat(o.mano_obra) || 0);
        return acc;
    }, {});

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: 'auto', background: '#f4f7f6', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: '#2c3e50', margin: 0 }}>📊 Reportes de Productividad</h1>
                <button onClick={() => navigate('/ordenes')} style={btnNav}>Ver Órdenes</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', marginBottom: '20px' }}>
                <div style={containerStyleMini}>
                    <h4 style={{marginTop: 0, color: '#7f8c8d'}}>Por Mes</h4>
                    <select 
                        onChange={(e) => procesarPorPeriodo(todasLasOrdenes, 'mes', { mesIndex: e.target.value !== "" ? parseInt(e.target.value) : null })}
                        style={{...inputStyle, width: '100%'}}
                    >
                        <option value="">Seleccionar Mes...</option>
                        {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((m, i) => (
                            <option key={m} value={i}>{m}</option>
                        ))}
                    </select>
                </div>

                <div style={containerStyleMini}>
                    <h4 style={{marginTop: 0, color: '#7f8c8d'}}>Rango de Fechas Personalizado</h4>
                    <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} style={inputStyle} />
                        <span>a</span>
                        <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} style={inputStyle} />
                        <button onClick={handleFiltrarRango} style={{...btnNav, backgroundColor: '#27ae60'}}>Filtrar</button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', background: '#fff', padding: '10px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                {['diario', 'semanal', 'quincenal', 'mensual'].map(p => (
                    <button 
                        key={p}
                        onClick={() => procesarPorPeriodo(todasLasOrdenes, p)}
                        style={{
                            flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            backgroundColor: periodo === p ? '#3498db' : 'transparent',
                            color: periodo === p ? 'white' : '#7f8c8d',
                            fontWeight: 'bold', textTransform: 'capitalize'
                        }}
                    >
                        {p}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ ...kpiCard, borderBottom: '4px solid #2980b9' }}>
                    <span style={kpiLabel}>MANO DE OBRA</span>
                    <h2 style={{ color: '#2980b9', margin: '10px 0' }}>${stats.totalManoObra.toLocaleString()}</h2>
                    <small style={{ color: '#bdc3c7' }}>{periodo.toUpperCase()}</small>
                </div>
                <div style={{ ...kpiCard, borderBottom: '4px solid #8e44ad' }}>
                    <span style={kpiLabel}>REPUESTOS / SERV.</span>
                    <h2 style={{ color: '#8e44ad', margin: '10px 0' }}>${stats.totalRepuestos.toLocaleString()}</h2>
                    <small style={{ color: '#bdc3c7' }}>Costo estimado</small>
                </div>
                <div style={{ ...kpiCard, borderBottom: '4px solid #27ae60' }}>
                    <span style={kpiLabel}>TOTAL INGRESOS</span>
                    <h2 style={{ color: '#27ae60', margin: '10px 0' }}>${stats.totalIngresos.toLocaleString()}</h2>
                    <small style={{ color: '#bdc3c7' }}>Neto acumulado</small>
                </div>
                <div style={{ ...kpiCard, borderBottom: '4px solid #2c3e50' }}>
                    <span style={kpiLabel}>ÓRDENES</span>
                    <h2 style={{ color: '#2c3e50', margin: '10px 0' }}>{stats.cantidadOrdenes}</h2>
                    <small style={{ color: '#bdc3c7' }}>Servicios ejecutados</small>
                </div>
            </div>

            <div style={{ ...containerStyle, marginTop: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ color: '#2c3e50', margin: 0 }}>📋 Detalle de Servicios Realizados</h3>
                    <input 
                        type="text"
                        placeholder="🔍 Filtrar lista actual..."
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setPaginaActual(1);
                        }}
                        style={{ ...inputStyle, width: '300px', borderRadius: '20px' }}
                    />
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', color: '#7f8c8d' }}>
                                <th style={{ padding: '12px' }}>Fecha</th>
                                <th style={{ padding: '12px' }}>🔢 Código</th>
                                <th style={{ padding: '12px' }}>👨‍🔧 Técnico</th>
                                <th style={{ padding: '12px' }}>Servicio</th>
                                <th style={{ padding: '12px' }}>Mano de Obra</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ordenesPaginadas.length > 0 ? ordenesPaginadas.map((o, idx) => {
                                const fechaVisual = normalizarFecha(o.fecha_creacion || o.fecha_ingreso);
                                return (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f9f9f9', color: '#34495e' }}>
                                        <td style={{ padding: '12px' }}>{fechaVisual.toLocaleDateString('es-ES')}</td>
                                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#2c3e50' }}>{o.codigo_equipo}</td>
                                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{o.nombre_tecnico || 'N/A'}</td>
                                        <td style={{ padding: '12px' }}>{o.categoria_servicio || 'General'}</td>
                                        <td style={{ padding: '12px', color: '#27ae60', fontWeight: 'bold' }}>${(parseFloat(o.mano_obra) || 0).toLocaleString()}</td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#bdc3c7' }}>No hay registros para mostrar.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '10px', border: '1px solid #eee' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>💰 Producción por Técnico (Filtro Actual)</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                        {Object.entries(totalesPorTecnico).map(([nombre, total]) => (
                            <div key={nombre} style={{ background: '#fff', padding: '10px 15px', borderRadius: '8px', borderLeft: '4px solid #3498db', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <small style={{ color: '#7f8c8d', display: 'block' }}>{nombre}</small>
                                <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>${total.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
                    
                {totalPaginas > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '10px' }}>
                        <button 
                            onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                            disabled={paginaActual === 1}
                            style={{ ...btnPaginacion, opacity: paginaActual === 1 ? 0.5 : 1 }}
                        >
                            ⬅️ Anterior
                        </button>
                        <span style={{ fontSize: '0.9rem', color: '#7f8c8d', fontWeight: 'bold' }}>
                            Página {paginaActual} de {totalPaginas}
                        </span>
                        <button 
                            onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                            disabled={paginaActual === totalPaginas}
                            style={{ ...btnPaginacion, opacity: paginaActual === totalPaginas ? 0.5 : 1 }}
                        >
                            Siguiente ➡️
                        </button>
                    </div>
                )}
            </div>

            <div style={{ ...containerStyle, marginTop: '30px', marginBottom: '50px' }}>
                <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>📈 Tendencia Mensual de Ingresos ({new Date().getFullYear()})</h3>
                <div style={{ width: '100%', height: '250px' }}>
                    {isLoaded && (
                        <ResponsiveContainer width="99%" height="100%">
                            <AreaChart data={stats.dataAnual}>
                                <defs>
                                    <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#2ecc71" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(val) => `$${val/1000}k`} />
                                <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
                                <Area type="monotone" dataKey="monto" stroke="#27ae60" fillOpacity={1} fill="url(#colorMonto)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div> 
        </div>
    );
};

const btnNav = { padding: '10px 20px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' };
const btnPaginacion = { padding: '8px 16px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' };
const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '0.9rem' };
const kpiCard = { backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' };
const kpiLabel = { color: '#7f8c8d', fontSize: '0.85rem', fontWeight: 'bold' };
const containerStyle = { backgroundColor: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', minHeight: '200px' };
const containerStyleMini = { backgroundColor: 'white', borderRadius: '15px', padding: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };

export default DashboardPage;