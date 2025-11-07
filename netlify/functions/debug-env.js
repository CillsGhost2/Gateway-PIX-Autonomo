exports.handler = async function(event, context) {
    console.log('--- Início do Debug de Variáveis de Ambiente ---');

    const cookieVar = process.env.MP_COOKIE;
    const csrfVar = process.env.MP_CSRF_TOKEN;

    console.log(`Valor de MP_COOKIE: ${cookieVar}`);
    console.log(`Valor de MP_CSRF_TOKEN: ${csrfVar}`);

    console.log('--- Fim do Debug ---');

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: "Verifique os logs da função 'debug-env' no painel da Netlify para ver os valores.",
            is_cookie_defined: !!cookieVar,
            is_csrf_defined: !!csrfVar
        })
    };
};  