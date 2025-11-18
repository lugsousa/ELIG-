# Publicar no Netlify (passos rápidos)

Este documento descreve os passos essenciais para publicar o site no Netlify e configurar a função serverless que integra com o Mercado Pago.

1. Criar novo site no Netlify e conectar o repositório.

2. Variáveis de ambiente (Settings → Build & deploy → Environment):
   - `MP_ACCESS_TOKEN`: Token do Mercado Pago (produção) ou token de sandbox para testes.
   - `SITE_URL` (opcional): URL pública do site (ex: `https://minha-loja.netlify.app`). Se não informado, as rotas locais `/success.html` e `/cancel.html` serão usadas.

3. Verificar rota da função:
   - A função está em `netlify/functions/create_checkout.js` e será exposta em `/.netlify/functions/create_checkout`.
   - O frontend chama essa rota para criar a preferência e receber `checkout_url`.

4. Testes em sandbox:
   - Configure `MP_ACCESS_TOKEN` com o token de testes do Mercado Pago.
   - Faça um pedido no site, confirme que a função retorna `checkout_url` do ambiente sandbox.

5. Produção:
   - Quando pronto, troque `MP_ACCESS_TOKEN` pelo token de produção (não compartilhe este token).

6. URLs de retorno (back_urls):
   - Ao criar a preferência, o Netlify function usa `SITE_URL` para gerar `success.html` e `cancel.html`. Se `SITE_URL` não estiver configurado, usa caminhos relativos.

Observação: por segurança, nunca commit seus tokens no repositório. Use as variáveis de ambiente do Netlify.

## Opção: Habilitar Netlify CMS (edição via Netlify Identity + Git Gateway)

Se quiser uma solução amigável para editores não técnicos, o Netlify CMS permite editar `content.json` diretamente pelo painel do Netlify.

Passos resumidos:

1. Ative **Identity** no painel do site do Netlify (Site settings → Identity → Enable Identity).
2. Em Identity → Settings, ative **Git Gateway**. Isso permitirá ao CMS gravar no repositório via Git.
3. Defina o branch padrão como `main` (ou o branch que você usa).
4. No repositório, já existe um scaffold em `admin/config.yml` e `admin/index.html`.
5. Acesse `https://<seu-site>.netlify.app/admin/` e faça login via Identity (você precisará convidar um usuário a partir do painel Identity ou permitir регистраções).
6. Ao salvar mudanças no CMS, o Git Gateway criará commits no repositório e disparará o deploy automático.

Notas:
- O arquivo gerenciado é `content.json` (definido em `admin/config.yml`).
- Se desejar imagens hospedadas no repositório, configure `media_folder` para um diretório no repositório (ex.: `static/images`). O CMS fará upload para esse diretório.

## Pagamentos: ativar Pix, cartão de crédito e débito (Mercado Pago)

O projeto já integra com o Mercado Pago via a função serverless `netlify/functions/create_checkout.js`, que cria uma preferência e retorna a `checkout_url`. Para garantir que o checkout apresente Pix, cartão de crédito e débito, siga estas recomendações:

1. No painel do Mercado Pago (prod ou sandbox), confirme que sua conta está habilitada para os meios de pagamento desejados:
   - Pix: habilite Pix na sua conta e ajuste as configurações de recebimento.
   - Cartões (crédito/débito): verifique as formas aceitas e as configurações de parcelamento.

2. Teste em sandbox usando o token de testes do Mercado Pago (`MP_ACCESS_TOKEN` configurado no Netlify como token de sandbox). O checkout sandbox geralmente mostra as opções de pagamento suportadas pela conta de testes.

3. A função `create_checkout` inclui um parâmetro de configuração para o número máximo de parcelas de cartão. Você pode ajustar isso definindo a variável de ambiente `MP_MAX_INSTALLMENTS` no Netlify (valor inteiro). O padrão é `12`.

4. Observação técnica: o Mercado Pago determina quais métodos de pagamento serão oferecidos ao comprador com base na configuração da conta, no país e no instrumento de pagamento disponível. A preferência criada pela função contém os itens do pedido e instruções de retorno; a interface de checkout do Mercado Pago mostrará Pix e cartões se a conta estiver configurada para eles.

5. Para habilitar o fluxo de produção:
   - Troque `MP_ACCESS_TOKEN` para o token de produção.
   - Teste um pagamento real com um valor pequeno.

Se quiser, posso também:
- Adicionar ícones visuais no frontend para Pix/cartão/débito.
- Fornecer um exemplo de configuração sandbox do Mercado Pago (IDs, cards de teste, etc.).

### Exemplos e passos rápidos para sandbox (Mercado Pago)

- Use o token de sandbox do Mercado Pago em `MP_ACCESS_TOKEN` para testar o fluxo.
- Para cartões de teste e dados de exemplo, consulte a documentação oficial do Mercado Pago (sandbox). O painel de sandbox fornece números de cartão, datas e códigos de segurança específicos para testar autorização e captura.
- Para Pix em sandbox, siga as instruções do Mercado Pago para gerar cobranças de teste (o comportamento pode variar por região).

Passos de verificação rápidos:
1. Configure `MP_ACCESS_TOKEN` com o token sandbox no Netlify.
2. Execute um checkout no site e confirme que a função serverless retorna `checkout_url` (verifique o console do navegador para erros).
3. Acesse o `checkout_url` e verifique se as opções Pix/cartão aparecem no ambiente de sandbox.
4. Simule um pagamento usando os dados de teste indicados pelo Mercado Pago (cartões sandbox ou fluxos de Pix de teste).

Se desejar, posso adicionar exemplos oficiais de números de cartão de teste e passos detalhados do sandbox do Mercado Pago aqui (posso incluí-los se confirmar que quer que eu adicione esses exemplos).


