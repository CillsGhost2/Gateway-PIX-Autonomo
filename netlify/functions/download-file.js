const fs = require('fs');
const path = require('path');
const FILENAME = 'meu-produto-secreto.zip';

exports.handler = async function(event, context) {
    const filePath = path.join(__dirname, 'private', FILENAME);
    console.log(`Tentando servir o arquivo do caminho: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.error('Arquivo não encontrado no servidor!', filePath);
        return {
            statusCode: 404,
            body: JSON.stringify({ error: 'O arquivo do produto não foi encontrado no servidor.' })
        };
    }

    try {
        const fileBuffer = fs.readFileSync(filePath);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${FILENAME}"`,
            },
            body: fileBuffer.toString('base64'),
            isBase64Encoded: true,
        };
    } catch (error) {
        console.error(`Erro ao ler o arquivo: ${filePath}`, error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Não foi possível ler o arquivo do produto.' })
        };
    }
};
