import mercadopago from 'mercadopago';

// Configurar credenciais do Mercado Pago
export const configureMercadoPago = () => {
  mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
  });
  
  console.log('✅ Mercado Pago configurado com sucesso');
};

export default mercadopago;
