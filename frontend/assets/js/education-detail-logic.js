/**
 * Lógica JavaScript para a página de Detalhes de Artigo Educativo.
 * 1. Puxa o ID do artigo da URL.
 * 2. Encontra o artigo mockado (ou faria a busca na API).
 * 3. Renderiza o conteúdo detalhado, incluindo a lista completa de dicas.
 * ATUALIZADO: Contém todo o conteúdo detalhado fornecido pelo usuário.
 */

document.addEventListener('DOMContentLoaded', () => {
    const detailContainer = document.getElementById('article-detail-container');
    
    // --- DADOS MOCKADOS (Com conteúdo completo e detalhado) ---
    const educationalContent = [
        {
            id: 1,
            title: "Como separar seu lixo corretamente?",
            category: "Guia Básico",
            readTime: "5 min",
            description: "Aprenda a separar o lixo é uma das formas mais simples e eficazes de cuidar do meio ambiente.",
            tips: [
                "Separe resíduos secos (recicláveis) dos úmidos (orgânicos)",
                "Lave embalagens antes de descartar",
                "Remova tampas e rótulos quando possível",
                "Não misture materiais recicláveis com orgânicos",
                "Pilhas e baterias → pontos de coleta em supermercados e eletrônicas.",
                "Óleo de cozinha → entregue em postos de reciclagem ou em garrafas PET fechadas.",
                "Lâmpadas, medicamentos e eletrônicos → devolva nos pontos de coleta indicados.",
            ],
            icon: "ph-recycle",
            iconEmoji: "♻️",
            fullContent: `
                <p>Aprender a separar o lixo é uma das formas mais simples e eficazes de cuidar do meio ambiente. Com pequenos hábitos diários, você ajuda a reduzir o volume de resíduos nos aterros e facilita o trabalho de quem vive da reciclagem.</p>

                <h2>1. Separe resíduos secos dos úmidos</h2>
                <p><strong>Secos (recicláveis):</strong> papel, papelão, plásticos, vidros e metais.</p>
                <p><strong>Úmidos (orgânicos):</strong> restos de comida, cascas de frutas e verduras, borra de café, folhas e galhos.</p>
                <p><strong>Dica:</strong> mantenha dois recipientes diferentes em casa — um para recicláveis e outro para orgânicos.</p>

                <h2>2. Lave as embalagens antes de descartar</h2>
                <p>Restos de alimentos e líquidos contaminam o material e dificultam a reciclagem.</p>
                <ul>
                    <li>Enxágue embalagens plásticas, latas e vidros com um pouco de água usada (como a da lavagem de louça).</li>
                    <li>Deixe secar antes de colocar na coleta seletiva.</li>
                </ul>

                <h2>3. Atenção aos resíduos especiais</h2>
                <p>Alguns materiais precisam de destinação específica:</p>
                <ul>
                    <li>Pilhas e baterias → pontos de coleta em supermercados e eletrônicas.</li>
                    <li>Óleo de cozinha → entregue em postos de reciclagem ou em garrafas PET fechadas.</li>
                    <li>Lâmpadas, medicamentos e eletrônicos → devolva nos pontos de coleta indicados.</li>
                </ul>

                <h2>4. Cores da coleta seletiva</h2>
                <p>Use as cores para facilitar a separação:</p>
                <ul>
                    <li>Azul: papel e papelão</li>
                    <li>Vermelho: plástico</li>
                    <li>Verde: vidro</li>
                    <li>Amarelo: metal</li>
                    <li>Marrom: orgânico</li>
                    <li>Cinza: rejeitos (o que não pode ser reciclado)</li>
                </ul>
                
                <h2>5. O impacto das suas escolhas</h2>
                <p>Separar o lixo corretamente ajuda a:</p>
                <ul>
                    <li>Reduzir a poluição e o uso de aterros;</li>
                    <li>Economizar energia e matéria-prima;</li>
                    <li>Gerar renda para cooperativas de reciclagem;</li>
                    <li>Contribuir para um planeta mais limpo e sustentável.</li>
                </ul>
                <p><strong>Dica extra:</strong> envolva sua família e vizinhos — quanto mais pessoas adotarem esse hábito, maior o impacto positivo na comunidade!</p>
            `,
        },
        {
            id: 2,
            title: "O que é coleta seletiva?",
            category: "Educação",
            readTime: "4 min",
            description: "A coleta seletiva é o processo de separar e recolher materiais recicláveis de forma diferente do lixo comum.",
            tips: [
                "Coleta seletiva separa materiais recicláveis do lixo comum",
                "Cada cor de lixeira representa um tipo de material",
                "Verde para vidro, azul para papel, vermelho para plástico",
                "Amarelo para metal, marrom para orgânico",
                "Diminui a quantidade de lixo enviado aos aterros",
                "Gera emprego e renda para cooperativas",
            ],
            icon: "ph-trash-simple",
            iconEmoji: "🗑️",
            fullContent: `
                <p>A coleta seletiva é o processo de separar e recolher materiais recicláveis de forma diferente do lixo comum.</p>
                <p>Ela é essencial para que o que pode ser reaproveitado volte para a indústria como matéria-prima, reduzindo o desperdício e o impacto ambiental.</p>
                
                <h2>1. Como funciona a coleta seletiva?</h2>
                <p>O sistema funciona a partir da separação dos resíduos na origem, ou seja, nas casas, empresas e escolas.</p>
                <p>Os materiais são organizados conforme o tipo (papel, plástico, vidro, metal, etc.) e depois recolhidos por cooperativas, empresas ou prefeituras responsáveis.</p>
                <p>Após a coleta:</p>
                <ul>
                    <li>Os materiais são levados a centros de triagem.</li>
                    <li>São limpos, separados e prensados.</li>
                    <li>São vendidos ou enviados para indústrias de reciclagem, que os transformam em novos produtos.</li>
                </ul>

                <h2>2. As cores da coleta seletiva</h2>
                <p>Cada cor de lixeira indica um tipo de material — isso facilita muito o trabalho dos recicladores:</p>
                <ul>
                    <li>🟦 Azul: papel e papelão</li>
                    <li>🟥 Vermelho: plásticos</li>
                    <li>🟩 Verde: vidros</li>
                    <li>🟨 Amarelo: metais</li>
                    <li>🟫 Marrom: resíduos orgânicos (restos de alimentos, folhas)</li>
                    <li>⬛ Cinza: rejeitos (o que não pode ser reciclado)</li>
                </ul>
                <p><strong>Dica:</strong> se a sua cidade ainda não possui lixeiras coloridas, use etiquetas ou adesivos nos recipientes de casa para fazer sua própria coleta seletiva!</p>

                <h2>3. Por que a coleta seletiva é importante?</h2>
                <ul>
                    <li>Diminui a quantidade de lixo enviado aos aterros;</li>
                    <li>Gera emprego e renda para cooperativas de reciclagem;</li>
                    <li>Economiza energia e matéria-prima;</li>
                    <li>Reduz a poluição do solo, da água e do ar.</li>
                </ul>

                <h2>4. Como você pode participar</h2>
                <p>Pequenas atitudes diárias fazem uma grande diferença.</p>
                <ul>
                    <li>Separe corretamente os resíduos na sua casa.</li>
                    <li>Informe-se sobre os dias e rotas da coleta seletiva da sua cidade.</li>
                    <li>Entregue materiais recicláveis em pontos de entrega voluntária (PEVs), se houver.</li>
                    <li>Incentive amigos, vizinhos e familiares a fazerem o mesmo!</li>
                </ul>
            `,
        },
        {
            id: 3,
            title: "3 passos para reduzir plástico em casa",
            category: "Dicas Práticas",
            readTime: "3 min",
            description: "Pequenas mudanças no dia a dia podem reduzir drasticamente o uso de plástico descartável.",
            tips: [
                "Substitua sacolas plásticas por reutilizáveis",
                "Use garrafas e copos reutilizáveis",
                "Compre produtos a granel e evite embalagens",
                "Prefira produtos com embalagens biodegradáveis",
                "Priorize refis",
            ],
            icon: "ph-drop",
            iconEmoji: "🌊",
            fullContent: `
                <p>O plástico está em quase tudo o que usamos, mas grande parte dele é descartável e acaba poluindo o meio ambiente. A boa notícia é que pequenas mudanças no dia a dia podem fazer uma grande diferença!</p>
                
                <h2>1. Substitua sacolas plásticas por reutilizáveis</h2>
                <p>Evite levar para casa várias sacolinhas toda vez que faz compras.</p>
                <ul>
                    <li>Use ecobags, sacolas de pano ou caixas retornáveis.</li>
                    <li>Deixe uma no carro, na mochila ou na bolsa — assim você nunca é pego de surpresa.</li>
                    <li>Uma única ecobag pode substituir centenas de sacolas plásticas por ano.</li>
                </ul>

                <h2>2. Use garrafas e copos reutilizáveis</h2>
                <p>Diga adeus aos copos e garrafinhas descartáveis!</p>
                <ul>
                    <li>Tenha sempre uma garrafinha de água ou copo retrátil com você.</li>
                    <li>No trabalho, use uma caneca pessoal em vez de copos plásticos.</li>
                    <li>Além de reduzir resíduos, você economiza dinheiro e mantém sua bebida na temperatura ideal.</li>
                </ul>

                <h2>3. Prefira produtos com menos embalagem</h2>
                <p>Muitos produtos vêm com embalagens plásticas desnecessárias.</p>
                <ul>
                    <li>Priorize refis, produtos a granel ou com embalagens recicláveis.</li>
                    <li>Evite frutas e legumes embalados individualmente — escolha os vendidos soltos.</li>
                    <li>Dê preferência a marcas que adotam embalagens sustentáveis.</li>
                </ul>
                <p><strong>Dica extra:</strong> reúna o plástico que ainda usa e leve para pontos de coleta ou ecopontos. Assim, você garante o descarte correto e incentiva a reciclagem.</p>
                <p>Lembre-se: pequenas atitudes em casa geram um impacto enorme para o planeta.</p>
            `,
        },
        {
            id: 4,
            title: "Compostagem doméstica para iniciantes",
            category: "Tutorial",
            readTime: "8 min",
            description: "Transforme resíduos orgânicos em adubo rico para plantas e jardins.",
            tips: [
                "Use restos de frutas, verduras e cascas de ovos",
                "Evite carnes, laticínios e óleos",
                "Mantenha equilíbrio entre materiais verdes e marrons",
                "Revire o composto regularmente para aeração",
                "Use húmus em vasos e canteiros",
                "Dilua o chorume para usar como fertilizante",
            ],
            icon: "ph-leaf",
            iconEmoji: "🌱",
            fullContent: `
                <p>A compostagem é uma forma simples e natural de transformar resíduos orgânicos em adubo para plantas, hortas e jardins.</p>
                <p>Além de reduzir o lixo doméstico, ela ajuda a devolver nutrientes ao solo e diminui a emissão de gases poluentes.</p>
                
                <h2>1. O que é compostagem?</h2>
                <p>A compostagem é o processo biológico de decomposição de resíduos orgânicos (como restos de alimentos e folhas secas) realizado por microrganismos, fungos e minhocas.</p>
                <p>O resultado é o húmus — um adubo natural, escuro e rico em nutrientes.</p>
                
                <h2>2. O que pode e o que não pode entrar na composteira</h2>
                <p><strong>Pode colocar:</strong></p>
                <ul>
                    <li>Restos de frutas, verduras e legumes</li>
                    <li>Cascas de ovos trituradas</li>
                    <li>Pães, grãos e borra de café</li>
                    <li>Folhas secas, podas de plantas e serragem</li>
                </ul>
                <p><strong>Evite colocar:</strong></p>
                <ul>
                    <li>Carnes e peixes</li>
                    <li>Laticínios (queijos, leite, iogurte)</li>
                    <li>Óleos e gorduras</li>
                    <li>Fezes de animais domésticos</li>
                    <li>Alimentos cozidos com muito sal ou tempero</li>
                </ul>
                <p><strong>Dica:</strong> quanto mais variados forem os resíduos, melhor será a qualidade do composto final.</p>

                <h2>3. Montando sua composteira</h2>
                <p>Você pode fazer compostagem em baldes empilhados, caixas plásticas ou até em composteiras prontas.</p>
                <p><strong>Passo a passo:</strong></p>
                <ol>
                    <li>Prepare o recipiente: deixe furos para ventilação e drenagem.</li>
                    <li>Monte as camadas: 1ª camada (material seco), 2ª camada (resíduos orgânicos), 3ª camada (material seco para evitar mau cheiro).</li>
                    <li>Mantenha a umidade: o material deve ficar úmido, mas nunca encharcado.</li>
                    <li>Revire o conteúdo a cada 10–15 dias para oxigenar.</li>
                </ol>

                <h2>4. O tempo de decomposição</h2>
                <p>O processo leva em média 2 a 3 meses. Quando estiver pronta, o composto terá cheiro de terra molhada e textura solta.</p>
                
                <h2>5. Como usar o composto produzido</h2>
                <p>Misture 1 parte de composto para 3 partes de terra — suas plantas vão agradecer!</p>
                <p>Se sobrar líquido da composteira (chorume), dilua uma parte em dez partes de água e use como fertilizante natural nas plantas.</p>
            `,
        },
        {
            id: 5,
            title: "Economia de água no dia a dia",
            category: "Sustentabilidade",
            readTime: "6 min",
            description: "Aprenda técnicas simples para economizar água e reduzir desperdícios em casa.",
            tips: [
                "Feche a torneira ao escovar os dentes",
                "Tome banhos mais curtos",
                "Reutilize água da máquina de lavar",
                "Conserte vazamentos imediatamente",
                "Regue as plantas em horários de menor evaporação",
                "Use rega por gotejamento",
            ],
            icon: "ph-tint",
            iconEmoji: "💧",
            fullContent: `
                <p>A água é um dos recursos mais preciosos do planeta — e também um dos mais desperdiçados. Com pequenas atitudes diárias, é possível reduzir o consumo, preservar o meio ambiente e ainda diminuir a conta no fim do mês.</p>
                
                <h2>1. Feche a torneira ao escovar os dentes</h2>
                <p>Deixar a torneira aberta enquanto escova os dentes desperdiça até 12 litros de água por minuto.</p>
                <ul>
                    <li>Feche-a enquanto escova e abra apenas para enxaguar.</li>
                    <li>O mesmo vale ao fazer a barba ou lavar o rosto.</li>
                </ul>

                <h2>2. Tome banhos mais curtos</h2>
                <p>Reduzir o banho de 10 para 5 minutos pode economizar até 80 litros de água por dia.</p>
                <ul>
                    <li>Feche o chuveiro enquanto ensaboa o corpo ou lava o cabelo.</li>
                    <li>Prefira chuveiros econômicos e evite banhos em horários de pico.</li>
                </ul>

                <h2>3. Use a máquina de lavar com a capacidade total</h2>
                <p>Espere acumular uma quantidade suficiente de roupas antes de ligar a máquina.</p>
                <ul>
                    <li>Utilize o modo “nível de água baixo” para pequenas lavagens.</li>
                    <li>Reaproveite a água da máquina para lavar o quintal ou dar descarga (se possível).</li>
                </ul>
                
                <h2>4. Cuide do jardim de forma consciente</h2>
                <ul>
                    <li>Regue as plantas no início da manhã ou no fim da tarde, quando a evaporação é menor.</li>
                    <li>Use rega por gotejamento ou baldes em vez de mangueiras.</li>
                    <li>Aproveite água da chuva sempre que possível.</li>
                </ul>

                <h2>5. Verifique e corrija vazamentos</h2>
                <p>Um pequeno vazamento pode desperdiçar milhares de litros por mês.</p>
                <ul>
                    <li>Observe se há manchas, infiltrações ou aumento repentino na conta de água.</li>
                    <li>Faça inspeções regulares em torneiras, vasos sanitários e encanamentos.</li>
                </ul>
                <p>Cada gota conta! Ao mudar hábitos simples no seu dia a dia, você ajuda a preservar um recurso essencial.</p>
            `,
        },
        {
            id: 6,
            title: "O impacto dos resíduos eletrônicos",
            category: "Conscientização",
            readTime: "7 min",
            description: "Entenda os riscos do descarte incorreto de eletrônicos e onde descartá-los.",
            tips: [
                "Eletrônicos contêm metais pesados tóxicos",
                "Procure pontos de coleta especializados",
                "Doe equipamentos funcionais",
                "Recicle baterias e pilhas separadamente",
                "Apague dados pessoais antes de descartar",
            ],
            icon: "ph-device-mobile-camera",
            iconEmoji: "📱",
            fullContent: `
                <p>Celulares antigos, pilhas, computadores quebrados, televisores e outros aparelhos eletrônicos fazem parte do nosso dia a dia.</p>
                <p>Mas você sabia que o descarte incorreto desses materiais pode causar sérios danos ao meio ambiente e à saúde?</p>
                
                <h2>1. O que são resíduos eletrônicos?</h2>
                <p>Também chamados de lixo eletrônico ou e-lixo, são todos os produtos elétricos e eletrônicos que foram descartados.</p>
                <p>Eles são compostos por plásticos, metais e componentes químicos que, quando descartados incorretamente, podem liberar substâncias tóxicas.</p>
                
                <h2>2. Por que o descarte incorreto é perigoso?</h2>
                <p>Os eletrônicos contêm metais pesados como chumbo, mercúrio, cádmio e níquel.</p>
                <p>Quando jogados no lixo comum ou em locais inadequados, esses materiais:</p>
                <ul>
                    <li>Contaminam o solo e a água;</li>
                    <li>Poluem o ar quando queimados;</li>
                    <li>Oferecem riscos à saúde humana e animal.</li>
                </ul>
                <p>Apenas 1 kg de lixo eletrônico pode contaminar até 40 mil litros de água se descartado de forma incorreta.</p>

                <h2>3. O que pode ser reciclado?</h2>
                <p>Muitos componentes dos eletrônicos podem ser reaproveitados:</p>
                <ul>
                    <li>Metais como cobre, alumínio e ouro;</li>
                    <li>Plásticos das carcaças;</li>
                    <li>Vidros de telas e monitores.</li>
                </ul>
                <p>Esses materiais podem voltar para a indústria, reduzindo a extração de novos recursos naturais.</p>
                
                <h2>4. Onde descartar corretamente</h2>
                <p>Procure pontos de coleta especializados ou ecopontos na sua cidade. Você pode encontrar locais que recebem:</p>
                <ul>
                    <li>Pilhas e baterias (em supermercados e lojas de eletrônicos);</li>
                    <li>Celulares e acessórios (em operadoras e lojas de telefonia);</li>
                    <li>Equipamentos maiores (em postos municipais de coleta).</li>
                </ul>
                <p><strong>Dica:</strong> antes de descartar, apague seus dados pessoais de celulares, notebooks e HDs para garantir sua segurança digital.</p>

                <h2>5. O papel da consciência ambiental</h2>
                <p>Descartar eletrônicos corretamente é mais do que uma obrigação — é uma atitude de responsabilidade ambiental e social.</p>
                <p>Cada aparelho reciclado representa menos contaminação e mais sustentabilidade.</p>
            `,
        },
    ];

    // --- LÓGICA DE CARREGAMENTO ---
    
    // Puxa o ID do evento da URL (ex: detalhe-educacao.html?id=1)
    const urlParams = new URLSearchParams(window.location.search);
    // IMPORTANTE: Converte para número (o ID é numérico)
    const articleId = parseInt(urlParams.get('id')); 
    
    // 1. Encontra o artigo pelo ID
    const article = educationalContent.find(a => a.id === articleId);

    if (!article) {
        detailContainer.innerHTML = '<div class="article-not-found"><h2>Artigo Não Encontrado</h2><p>Parece que o link está quebrado. Volte para a página de educação.</p><a href="educacao.html" class="btn-back">Voltar</a></div>';
        return;
    }

    // 2. Renderiza o conteúdo detalhado
    renderArticle(article);
    
    /**
     * Renderiza o conteúdo completo do artigo.
     * @param {Object} item - O objeto do artigo.
     */
    function renderArticle(item) {
        // Renderiza a lista de dicas do array 'tips'
        const tipsHtml = item.tips.map(tip => `
            <li class="tip-full-item">
                <i class="ph ph-check-circle tip-icon-full"></i>
                <span>${tip}</span>
            </li>
        `).join('');
        
        detailContainer.innerHTML = `
            <a href="educacao.html" class="back-link"><i class="ph ph-arrow-left"></i> Voltar para Educação</a>
            
            <div class="article-header">
                <div class="article-icon">${item.iconEmoji}</div>
                <div class="article-meta-info">
                    <span class="badge-category">${item.category}</span>
                    <h1>${item.title}</h1>
                    <div class="article-read-time">
                        <i class="ph ph-clock"></i>
                        <span>${item.readTime} de leitura</span>
                    </div>
                </div>
            </div>
            
            <div class="article-body">
                <div class="article-summary">
                    ${item.fullContent}
                </div>

                <div class="article-tips">
                    <h2>Dicas de Ação</h2>
                    <ul class="tips-list-full">
                        ${tipsHtml}
                    </ul>
                </div>
            </div>
            
            <div class="share-cta">
                <p>Gostou? Compartilhe esta dica na nossa <a href="comunidade.html">Comunidade Sustentável</a>!</p>
            </div>
        `;
    }
});