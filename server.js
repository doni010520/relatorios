const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const relatorios = JSON.parse(fs.readFileSync(path.join(__dirname, 'relatorios.json'), 'utf8'));

const mapaTitulos = {
  "PESSOAS": "Orientado para Pessoas (Relacional)",
  "ACAO": "Orientado para Ação (Processo)",
  "TEMPO": "Orientado para Tempo (Solução imediata)",
  "MENSAGEM": "Orientado para Mensagem (Conteúdo/Analítico)"
};

function buildConteudoHTML(conteudo) {
  let html = "";
  for (let i = 7; i < conteudo.length; i++) {
    const texto = conteudo[i];
    if (texto.match(/^\d+\./)) {
      html += `<p style="margin: 15px 0 8px 0; font-size: 12px; color: #000000;"><strong>${texto}</strong></p>`;
    } else if (texto.match(/^[A-ZÇÃÕÁÉÍÓÚ\s\-–():]+$/) && texto.length < 100) {
      html += `<p style="margin: 12px 0 8px 0; font-size: 11px; color: #000000;"><strong>${texto}</strong></p>`;
    } else {
      html += `<p style="margin: 0 0 10px 0; font-size: 11px; color: #000000; line-height: 1.6; text-align: justify;">${texto}</p>`;
    }
  }
  return html;
}

function buildEmailHTML(data, conteudoRelatorio) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Perfil de Comunicação e Escuta em Vendas</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="700" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;">
                    <tr>
                        <td style="padding: 30px 40px 5px 40px; text-align: center;">
                            <h1 style="margin: 0; font-size: 16px; font-weight: bold; color: #000000;">
                                Perfil de Comunicação e Escuta em Vendas
                            </h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 5px 40px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #000000;">
                                Treinamento: Conexão Cliente para vendas exponenciais
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 30px 40px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #000000;">
                                Participante: <span style="background-color: #17a2b8; color: #ffffff; padding: 2px 8px;">${data.nome}</span>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;">
                            <hr style="border: none; border-top: 1px solid #cccccc; margin: 0;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 40px;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #000000;">
                                <strong>1. Resultado geral</strong>
                            </p>
                            <table width="100%" cellpadding="3" cellspacing="0" border="0" style="margin: 0 0 8px 20px; font-size: 11px;">
                                <tr>
                                    <td style="padding: 2px 0;">Estilo de escuta</td>
                                    <td style="padding: 2px 0; text-align: right; color: #17a2b8;"><strong>Pontuação</strong></td>
                                </tr>
                                <tr>
                                    <td style="padding: 2px 0;">Pessoas (Relacional)</td>
                                    <td style="padding: 2px 0; text-align: right; color: #17a2b8;"><strong>${data.pontuacoes.PESSOAS}</strong></td>
                                </tr>
                                <tr>
                                    <td style="padding: 2px 0;">Ação (Processo)</td>
                                    <td style="padding: 2px 0; text-align: right; color: #17a2b8;"><strong>${data.pontuacoes.ACAO}</strong></td>
                                </tr>
                                <tr>
                                    <td style="padding: 2px 0;">Tempo (Solução imediata)</td>
                                    <td style="padding: 2px 0; text-align: right; color: #17a2b8;"><strong>${data.pontuacoes.TEMPO}</strong></td>
                                </tr>
                                <tr>
                                    <td style="padding: 2px 0;">Mensagem (Conteúdo / Analítico)</td>
                                    <td style="padding: 2px 0; text-align: right; color: #17a2b8;"><strong>${data.pontuacoes.MENSAGEM}</strong></td>
                                </tr>
                            </table>
                            <p style="margin: 8px 0 8px 0; font-size: 11px; color: #000000; line-height: 1.5;">
                                <strong>Estilo predominante:</strong> ${mapaTitulos[data.predominante]}<br>
                                <strong>Estilo menos desenvolvido:</strong> ${mapaTitulos[data.menosDesenvolvido]}
                            </p>
                            <p style="margin: 15px 0 8px 0; font-size: 12px; color: #000000;">
                                <strong>2. Descrição dos estilos de escuta</strong>
                            </p>
                            <p style="margin: 0 0 10px 0; font-size: 11px; color: #000000; line-height: 1.6; text-align: justify;">
                                <strong>Orientado para Pessoas –</strong> Valoriza o vínculo e a empatia. Escuta com atenção às emoções e constrói confiança pela proximidade.
                            </p>
                            <p style="margin: 0 0 10px 0; font-size: 11px; color: #000000; line-height: 1.6; text-align: justify;">
                                <strong>Orientado para Ação –</strong> Prefere conversas diretas, voltadas à solução e ao resultado. Gosta de foco e clareza, mas pode soar apressado.
                            </p>
                            <p style="margin: 0 0 10px 0; font-size: 11px; color: #000000; line-height: 1.6; text-align: justify;">
                                <strong>Orientado para Tempo –</strong> Preza pela objetividade e pelo respeito ao ritmo da conversa. Evita desvios e busca eficiência.
                            </p>
                            <p style="margin: 0 0 10px 0; font-size: 11px; color: #000000; line-height: 1.6; text-align: justify;">
                                <strong>Orientado para Mensagem –</strong> Escuta para compreender o sentido exato do que está sendo dito. Avalia argumentos, identifica contradições e busca precisão na comunicação.
                            </p>
                            <div style="margin: 15px 0 0 0;">
                                ${conteudoRelatorio}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 40px 0 40px;">
                            <hr style="border: none; border-top: 1px solid #cccccc; margin: 0;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 15px 40px 30px 40px; text-align: center;">
                            <p style="margin: 0 0 5px 0; font-size: 10px; color: #666666;">
                                <strong>Programa Conexão Cliente</strong>
                            </p>
                            <p style="margin: 0 0 5px 0; font-size: 9px; color: #999999;">
                                Desenvolvendo comunicação e escuta ativa para vendas exponenciais
                            </p>
                            <p style="margin: 0; font-size: 8px; color: #999999;">
                                Baseado no LSP-R (Listening Styles Profile - Revised) de Bodie et al., 2013
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

app.post('/gerar', async (req, res) => {
  try {
    const data = req.body;
    const chave = `${data.predominante}-${data.menosDesenvolvido}`;
    const relatorio = relatorios[chave];
    
    if (!relatorio) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }
    
    const conteudoRelatorio = buildConteudoHTML(relatorio.conteudo_completo);
    const emailHTML = buildEmailHTML(data, conteudoRelatorio);
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(emailHTML, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });
    
    await browser.close();
    
    res.json({
      pdf: pdfBuffer.toString('base64'),
      html: emailHTML,
      arquivo: data.arquivo
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(4242, () => {
  console.log('API rodando na porta 4242');
});
