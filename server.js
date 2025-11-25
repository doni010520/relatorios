const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const relatorios = JSON.parse(fs.readFileSync(path.join(__dirname, 'relatorios.json'), 'utf8'));

// Carregar logo em Base64
const logoBase64 = fs.readFileSync(path.join(__dirname, 'logo.png'), 'base64');

const mapaTitulos = {
  "PESSOAS": "Orientado para Pessoas (Relacional)",
  "ACAO": "Orientado para Ação (Processo)",
  "TEMPO": "Orientado para Tempo (Solução imediata)",
  "MENSAGEM": "Orientado para Mensagem (Conteúdo/Analítico)"
};

/**
 * FUNÇÃO CORRIGIDA
 * Esta função agora lê o `item.html` (que já contém os negritos)
 * e aplica o estilo de TÍTULO (fonte 12px, margem) ou PARÁGRAFO (fonte 11px, justificado).
 * Também adiciona quebra de página antes do item 5.
 */
function buildConteudoHTML(conteudo) {
  let html = "";
  let dentroLista = false;
  
  // Começa no 7 para pular os cabeçalhos fixos (Título, Participante, 1. Resultado, 2. Descrição)
  for (let i = 7; i < conteudo.length; i++) {
    const item = conteudo[i];
    const textoHTML = item.html;
    const isList = item.is_list;

    if (dentroLista && !isList) {
      html += '</ul>';
      dentroLista = false;
    }

    // NOVO: Detecta se é o item 5 para adicionar quebra de página
    const ehItem5 = textoHTML.includes("5. Aspecto menos desenvolvido");
    const pageBreakStyle = ehItem5 ? "page-break-before: always;" : "";

    // Regra de Título: 
    // Se o HTML começa com número (ex: "3. ...")
    // OU se o HTML é *apenas* um texto em negrito (ex: "<strong>Síntese geral</strong>")
    // Isso aplica o estilo de título (maior e com mais margem).
    if (textoHTML.match(/^\d+\./) || textoHTML.match(/^<strong>\d+\./) || textoHTML.match(/^<strong>.*<\/strong>$/)) {
      html += `<p style="margin: 15px 0 8px 0; font-size: 12px; color: #000000; ${pageBreakStyle}">${textoHTML}</p>`;
    }
    // Regra de Lista:
    else if (isList) {
      if (!dentroLista) {
        html += '<ul style="margin: 5px 0 10px 20px; padding-left: 20px; font-size: 11px; color: #000000; line-height: 1.6;">';
        dentroLista = true;
      }
      html += `<li style="margin: 5px 0;">${textoHTML}</li>`;
    }
    // Regra de Parágrafo (Padrão):
    else {
      html += `<p style="margin: 0 0 10px 0; font-size: 11px; color: #000000; line-height: 1.6; text-align: justify;">${textoHTML}</p>`;
    }
  }
  
  if (dentroLista) {
    html += '</ul>';
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
                        <td style="padding: 20px 40px 10px 40px;">
                            <img src="data:image/png;base64,${logoBase64}" alt="Logo" style="width: 140px; height: auto;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 40px 5px 40px; text-align: center;">
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
                                Participante: <strong>${data.nome}</strong>
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
                            <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 8px 20px; font-size: 11px; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 0; margin: 0;">Estilo de escuta</td>
                                    <td style="padding: 0 0 0 50px; margin: 0; text-align: center;"><strong>Pontuação</strong></td>
                                </tr>
                                <tr>
                                    <td style="padding: 0; margin: 0;">Pessoas (Relacional)</td>
                                    <td style="padding: 0 0 0 50px; margin: 0; text-align: center;"><strong>${data.pontuacoes.PESSOAS}/42</strong></td>
                                </tr>
                                <tr>
                                    <td style="padding: 0; margin: 0;">Ação (Processo)</td>
                                    <td style="padding: 0 0 0 50px; margin: 0; text-align: center;"><strong>${data.pontuacoes.ACAO}/42</strong></td>
                                </tr>
                                <tr>
                                    <td style="padding: 0; margin: 0;">Tempo (Solução imediata)</td>
                                    <td style="padding: 0 0 0 50px; margin: 0; text-align: center;"><strong>${data.pontuacoes.TEMPO}/42</strong></td>
                                </tr>
                                <tr>
                                    <td style="padding: 0; margin: 0;">Mensagem (Conteúdo / Analítico)</td>
                                    <td style="padding: 0 0 0 50px; margin: 0; text-align: center;"><strong>${data.pontuacoes.MENSAGEM}/42</strong></td>
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
    
    // A chave da correção está aqui, na nova lógica da buildConteudoHTML
    const conteudoRelatorio = buildConteudoHTML(relatorio);
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
      margin: { top: '40px', right: '60px', bottom: '40px', left: '60px' }
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
