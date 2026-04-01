import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
import Swal from 'sweetalert2';
import axios from 'axios';
import OrdenesPage from '/src/pages/OrdenesPage.jsx'; 

expect.extend(matchers);

// Mock de SweetAlert2 para capturar las llamadas a las alertas
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

// Mock de Axios para evitar llamadas reales a la API
vi.mock('axios');

test('Debe mostrar SweetAlert2 cuando el abono excede el saldo pendiente', async () => {
  const { container } = render(
    <BrowserRouter>
      <OrdenesPage />
    </BrowserRouter>
  );

  // 1. Buscamos el input de Mano de Obra usando el selector de atributo name (Opción A)
  const inputManoObra = container.querySelector('input[name="mano_obra"]');
  fireEvent.change(inputManoObra, { target: { value: '100000' } });

  // 2. Buscamos el select de estado de pago por su nombre
  const selectPago = container.querySelector('select[name="estado_pago"]');
  fireEvent.change(selectPago, { target: { value: 'Parcial' } });

  // 3. Buscamos el input de "Nuevo Abono" por su placeholder (que sí es único y visible)
  const inputNuevoAbono = screen.getByPlaceholderText(/Nuevo Abono/i);
  
  // 4. Intentamos abonar 150.000 a una deuda de 100.000
  fireEvent.change(inputNuevoAbono, { target: { value: '150000' } });

  // 5. Buscamos el botón "Sumar" por su texto
  const botonSumar = screen.getByRole('button', { name: /Sumar/i });
  fireEvent.click(botonSumar);

  // 6. Verificamos que el componente ejecute la lógica de validación y dispare Swal.fire
  await waitFor(() => {
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'error',
        title: 'Monto excedido'
      })
    );
  });
});