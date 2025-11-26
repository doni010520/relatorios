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
            <td align="center" style="padding: 10px;">
                <table width="700" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;">
                
                    <!-- ==================== -->
                    <!-- CAPA - PÁGINA 1      -->
                    <!-- ==================== -->
                    <tr>
                        <td style="padding: 20px 40px;">
                            <p style="margin: 0 0 10px 0; font-size: 11px; color: #000000; line-height: 1.6;">
                                Olá!
                            </p>
                            <p style="margin: 0 0 10px 0; font-size: 11px; color: #000000; line-height: 1.6; text-align: justify;">
                                Antes de qualquer coisa, <strong>parabéns por dedicar um tempo para se conhecer melhor.</strong>
                            </p>
                            <p style="margin: 0 0 10px 0; font-size: 11px; color: #000000; line-height: 1.6; text-align: justify;">
                                O relatório que você está prestes a ler é o resultado do seu <strong>Teste de Perfil de Escuta</strong>, uma ferramenta que faz parte do programa <strong>Conexão Cliente</strong> — criada para ajudar você a compreender <strong>como se comunica, como se conecta e como transforma conversas em resultados</strong>.
                            </p>
                            
                            <p style="margin: 20px 0 8px 0; font-size: 12px; color: #000000;">
                                <strong>Por que este teste é importante</strong>
                            </p>
                            <p style="margin: 0 0 10px 0; font-size: 11px; color: #000000; line-height: 1.6; text-align: justify;">
                                Escutar é muito mais do que ouvir palavras.<br>
                                É perceber intenções, sentimentos, pausas e significados não ditos.
                            </p>
                            <p style="margin: 0 0 10px 0; font-size: 11px; color: #000000; line-height: 1.6; text-align: justify;">
                                Ao compreender o seu estilo de escuta, você ganha clareza sobre <strong>como se relaciona, toma decisões e influencia pessoas</strong> — dentro e fora do ambiente de trabalho.<br>
                                Esse autoconhecimento é o primeiro passo para aprimorar <strong>a comunicação, a empatia e a produtividade</strong>, fortalecendo tanto os <strong>resultados comerciais</strong> quanto as <strong>relações humanas</strong>.
                            </p>
                            
                            <p style="margin: 20px 0 8px 0; font-size: 12px; color: #000000;">
                                <strong>Como ler este relatório</strong>
                            </p>
                            <p style="margin: 0 0 10px 0; font-size: 11px; color: #000000; line-height: 1.6;">
                                Aqui você vai encontrar:
                            </p>
                            <ul style="margin: 5px 0 10px 20px; padding-left: 20px; font-size: 11px; color: #000000; line-height: 1.6;">
                                <li style="margin: 5px 0;"><strong>Seu estilo predominante de escuta</strong> — que revela como você tende a se posicionar em uma conversa.</li>
                                <li style="margin: 5px 0;"><strong>O aspecto menos desenvolvido</strong> — que mostra uma área em que é possível crescer para alcançar mais equilíbrio comunicativo.</li>
                                <li style="margin: 5px 0;"><strong>Uma síntese geral</strong> — com uma leitura integrada sobre como o seu estilo impacta suas interações e resultados.</li>
                                <li style="margin: 5px 0;"><strong>Recomendações práticas</strong> — sugestões simples para aplicar no dia a dia e aprimorar sua escuta de forma natural e consciente.</li>
                            </ul>
                            <p style="margin: 0 0 10px 0; font-size: 11px; color: #000000; line-height: 1.6; text-align: justify;">
                                Não existe certo ou errado.<br>
                                Cada estilo tem forças e desafios próprios, e todos são essenciais.<br>
                                O mais importante é <strong>aprender a adaptar sua escuta conforme o perfil e o momento do interlocutor</strong>, especialmente quando esse interlocutor é o cliente.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- ==================== -->
                    <!-- CAPA - PÁGINA 2      -->
                    <!-- ==================== -->
                    <tr>
                        <td style="padding: 20px 40px; page-break-before: always;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #000000;">
                                <strong>Um convite ao autodesenvolvimento</strong>
                            </p>
                            <p style="margin: 0 0 10px 0; font-size: 11px; color: #000000; line-height: 1.6; text-align: justify;">
                                Use este relatório como uma <strong>ferramenta de aprimoramento profissional e pessoal</strong>.<br>
                                Ele oferece uma visão clara sobre <strong>como o seu estilo de escuta influencia a qualidade das conversas, a tomada de decisão e os resultados que você gera.</strong>
                            </p>
                            <p style="margin: 0 0 10px 0; font-size: 11px; color: #000000; line-height: 1.6; text-align: justify;">
                                E se você ainda não está inscrito no <strong>curso Conexão Cliente</strong>, aproveite esta oportunidade.<br>
                                No curso, você vai aprender <strong>a identificar o perfil de escuta do cliente</strong> e ajustar sua abordagem de forma consultiva, aumentando <strong>a confiança, o engajamento e a taxa de fechamento de vendas</strong>.
                            </p>
                            <p style="margin: 0 0 10px 0; font-size: 11px; color: #000000; line-height: 1.6; text-align: justify;">
                                Ao compreender seus padrões de escuta e ampliar sua percepção na comunicação com o cliente,<br>
                                você passa a conduzir interações com mais estratégia, gerar conexões mais eficazes e alcançar resultados sustentáveis.
                            </p>
                            
                            <p style="margin: 20px 0 8px 0; font-size: 12px; color: #000000;">
                                <strong>Inscreva-se agora</strong>
                            </p>
                            <p style="margin: 0 0 5px 0; font-size: 11px; color: #000000; line-height: 1.6;">
                                <strong>Conexão Cliente</strong><br>
                                <em>Ouvir é o que transforma comunicação em resultado.</em>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- ==================== -->
                    <!-- RELATÓRIO - PÁGINA 3 -->
                    <!-- ==================== -->
                    <tr>
                        <td style="padding: 10px 40px 5px 40px; page-break-before: always; text-align: center;">
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
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="width: 100%; padding: 10px 60px;">
          <img src="data:image/png;base64,${logoBase64}" style="width: 100px; height: auto;">
        </div>
      `,
      footerTemplate: '<div></div>',
      margin: { top: '80px', right: '60px', bottom: '40px', left: '60px' }
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
