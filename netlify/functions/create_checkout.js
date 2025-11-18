// Função serverless para Netlify: cria preferência de pagamento no Mercado Pago
// Requer variável de ambiente: MP_ACCESS_TOKEN (token do Mercado Pago)
// Em ambiente de testes, use o token de sandbox do Mercado Pago

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
  if (!MP_ACCESS_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: 'MP_ACCESS_TOKEN not configured' }) };
  }

  const { items = [], shipping = 0 } = body;

  // Converte para formato aceito pelo Mercado Pago
  const mpItems = items.map(i => ({
    title: i.name || 'Item',
    quantity: Number(i.quantity) || 1,
    unit_price: Number(i.unit_price) || 0
  }));

  if (shipping && Number(shipping) > 0) {
    mpItems.push({ title: 'Frete', quantity: 1, unit_price: Number(shipping) });
  }

  const siteUrl = process.env.SITE_URL || '';
  const back_urls = {
    success: siteUrl ? `${siteUrl.replace(/\/$/, '')}/success.html` : '/success.html',
    failure: siteUrl ? `${siteUrl.replace(/\/$/, '')}/cancel.html` : '/cancel.html',
    pending: siteUrl ? `${siteUrl.replace(/\/$/, '')}/` : '/'
  };

  // Permite configurar o número máximo de parcelas por cartão via variável de ambiente
  const maxInstallments = parseInt(process.env.MP_MAX_INSTALLMENTS || '12', 10);
  const preference = {
    items: mpItems,
    back_urls,
    auto_return: 'approved',
    payment_methods: {
      installments: maxInstallments
    }
  };

  try {
    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify(preference)
    });

    const data = await res.json();
    if (!res.ok) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Mercado Pago error', details: data }) };
    }

    // Retorna a URL de checkout para o frontend redirecionar
    return { statusCode: 200, body: JSON.stringify({ checkout_url: data.init_point, preference_id: data.id }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Request failed', details: String(err) }) };
  }
};
