# 💼 Sistema de Gestión de Cartera y Órdenes de Servicio

Este es un software integral desarrollado con el **Stack PERN** (PostgreSQL, Express, React, Node.js) diseñado para optimizar el control de órdenes de servicio técnico, gestión de clientes y seguimiento de abonos financieros en tiempo real.

## 🚀 Características Principales

* **Gestión de Órdenes:** Creación, edición y seguimiento de estados de servicio (Recibido, En Proceso, Entregado).
* **Módulo Financiero:** Sistema de abonos con validaciones inteligentes (impide abonar más del saldo pendiente).
* **Interfaz Dinámica:** UI/UX consistente diseñada para la eficiencia operativa, con notificaciones interactivas mediante **SweetAlert2**.
* **Persistencia Local:** Uso de LocalStorage para garantizar que el progreso de edición y el historial de abonos no se pierdan.
* **Código Automatizado:** Generación de correlativos de órdenes directamente desde el servidor.

## 🛠️ Tecnologías Utilizadas

### Frontend
* **React.js** (Hooks, Context/State Management)
* **SweetAlert2** (Validaciones y alertas)
* **CSS Moderno** (Diseño responsivo y tipografía Inter)

### Backend
* **Node.js & Express**
* **PostgreSQL** (Base de Datos Relacional)
* **Jest & Supertest** (Configuración para Pruebas Unitarias)
