const axios = require('axios');

exports.handler = async function(event, context) {
    const cookieVar = (process.env.MP_COOKIE || '').replace(/[^\x20-\x7E]/g, '');
    const csrfVar = (process.env.MP_CSRF_TOKEN || '').replace(/[^\x20-\x7E]/g, '');
    console.log('Função verify-payment iniciada (versão segura e sanitizada).');

    if (!cookieVar || !csrfVar) {
        console.error('Erro Crítico: Variáveis de ambiente estão vazias ou não foram carregadas.');
        return { 
            statusCode: 500, 
            body: JSON.stringify({ status: 'erro', message: 'Erro de configuração no servidor. Credenciais não carregadas.' }) 
        };
    }
    
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Método não permitido' }) };
    }

    try {
        const body = JSON.parse(event.body);
        const buyerIdentifier = body.identifier;
        const expectedAmount = body.amount;
        const { data } = await axios.get('https://www.mercadopago.com.br/activities/api/activities/list?page=1&listing=activities&useEmbeddings=true', {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Cookie': cookieVar,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/5.37.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
                'x-csrf-token': csrfVar,
                'Referer': 'https://www.mercadopago.com.br/activities'
            }
        });

        console.log(`API do MP respondeu com ${data.results.length} resultados.`);
        let paymentFound = false;

        if (data && data.results) {
            for (const transaction of data.results) {
                if (transaction.subCategory !== 'pix_trf_in') continue;
                const transactionAmount = parseFloat(`${transaction.amount.fraction}.${transaction.amount.cents}`);
                const payerName = transaction.title;
                if (transactionAmount === expectedAmount && payerName.toLowerCase().includes(buyerIdentifier.toLowerCase())) {
                    paymentFound = true;
                    break;
                }
            }
        }
        
        if (paymentFound) {
            return {
                statusCode: 200,
                body: JSON.stringify({ status: 'aprovado', message: 'Pagamento encontrado! Seu download está abaixo.' })
            };
        } else {
            return {
                statusCode: 200,
                body: JSON.stringify({ status: 'pendente', message: 'Pagamento não encontrado.' })
            };
        }

    } catch (error) {
        console.error('ERRO CRÍTICO NA EXECUÇÃO DA FUNÇÃO:', error);
        let errorMessage = 'Ocorreu um erro interno ao verificar o pagamento.';
        if(error.response && (error.response.status === 401 || error.response.status === 403)) {
            errorMessage = "Falha de autenticação. As credenciais (Cookie/Token) podem ter expirado.";
        }
        return {
            statusCode: 500,
            body: JSON.stringify({ status: 'erro', message: errorMessage })
        };
    }
};