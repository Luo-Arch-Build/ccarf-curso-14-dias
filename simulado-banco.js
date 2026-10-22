// Banco do simulado em modo prova — aula 14 do curso CCAR-F.
// Questões inéditas (não repetem as aulas nem simulados de terceiros), 10 por cenário oficial do Exam Guide v1.0;
// o modo prova sorteia 5 por cenário a cada tentativa, preferindo as ainda não vistas.
// Campos: id, s (cenário), d (domínio), t (task statement), q/qpt (stem EN/PT), o/opt (alternativas EN/PT),
// a (índices corretos; 2 = "select TWO"), e (explicação PT, HTML permitido).
window.CCARF_BANCO = {
  versao: "2026-10-22",
  scen: {
    CS: {
      name: "Customer Support Resolution Agent",
      desc: "You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom MCP tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.",
      pt: "Agente de resolução de suporte ao cliente com o Claude Agent SDK: devoluções, disputas de cobrança e problemas de conta, via MCP tools próprias (get_customer, lookup_order, process_refund, escalate_to_human). Meta: 80%+ de resolução no primeiro contato, sabendo quando escalar."
    },
    CG: {
      name: "Code Generation with Claude Code",
      desc: "You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.",
      pt: "Claude Code no dia a dia do time: geração de código, refatoração, debugging e documentação, com slash commands, CLAUDE.md e a escolha entre plan mode e execução direta."
    },
    MR: {
      name: "Multi-Agent Research System",
      desc: "You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.",
      pt: "Sistema de pesquisa multiagente com o Claude Agent SDK: um coordinator delega a subagents de busca web, análise de documentos, síntese e geração de relatório, produzindo relatórios completos e com citações."
    },
    DP: {
      name: "Developer Productivity with Claude",
      desc: "You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with MCP servers.",
      pt: "Ferramentas de produtividade com o Claude Agent SDK: explorar codebases desconhecidas, entender sistemas legados, gerar boilerplate e automatizar tarefas, com as tools nativas (Read, Write, Bash, Grep, Glob) e MCP servers."
    },
    CI: {
      name: "Claude Code for Continuous Integration",
      desc: "You are integrating Claude Code into your CI/CD pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.",
      pt: "Claude Code no pipeline de CI/CD: code review automatizado, geração de testes e feedback em pull requests, com prompts que dão feedback acionável e minimizam falsos positivos."
    },
    EX: {
      name: "Structured Data Extraction",
      desc: "You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JSON schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.",
      pt: "Sistema de extração de dados estruturados com Claude: extrai informação de documentos não estruturados, valida a saída com JSON schemas, mantém alta acurácia, trata casos de borda e integra com sistemas downstream."
    }
  },
  q: [
    // ------------------------------------------------------------------ Customer Support
    {
      id: "CS1", s: "CS", d: 1, t: "1.1",
      q: "The customer is already verified. In a single response, the model emits two tool_use blocks: lookup_order for order #4471 and lookup_order for order #4498. Your loop executes only the first block, appends that one result, and calls the API again. The next request fails with an error about a tool_use block that has no matching tool_result. What should the loop do?",
      qpt: "O cliente já está verificado. Numa única resposta, o modelo emite dois blocos tool_use: lookup_order do pedido #4471 e lookup_order do pedido #4498. Seu loop executa só o primeiro, anexa esse resultado e chama a API de novo. O request seguinte falha com um erro sobre um bloco tool_use sem tool_result correspondente. O que o loop deve fazer?",
      o: [
        "Add an instruction asking the model to request one tool at a time, so the loop never receives two blocks at once.",
        "Execute every tool_use block in the response and send all of their results back together in the next request.",
        "Drop the second tool_use block and let the model ask for order #4498 again in the following turn.",
        "Start a new conversation for the second tool call, so each request carries exactly one pending tool."
      ],
      opt: [
        "Instruir o modelo a pedir uma tool por vez, para o loop nunca receber dois blocos de uma vez.",
        "Executar todos os blocos tool_use da resposta e devolver todos os resultados juntos no próximo request.",
        "Descartar o segundo tool_use e deixar o modelo pedir o pedido #4498 de novo no turno seguinte.",
        "Abrir uma conversa nova para a segunda chamada, para cada request carregar só uma tool pendente."
      ],
      a: [1],
      e: "O contrato do loop: com <code>stop_reason: \"tool_use\"</code>, execute <strong>todos</strong> os blocos <code>tool_use</code> da resposta e devolva um <code>tool_result</code> para cada um no próximo request — o modelo pode pedir várias tools no mesmo turno. A troca o mecanismo por uma promessa em prompt e ainda perde o paralelismo. C é exatamente o bug: um tool_use sem resultado quebra o histórico. D descarta a conversa, que o modelo precisa para raciocinar sobre o próximo passo."
    },
    {
      id: "CS2", s: "CS", d: 1, t: "1.5",
      q: "Policy requires human approval for any refund above $500. The team added a PostToolUse hook that reads the result of process_refund and, when the amount was above $500, opens a ticket for a supervisor. Audits still find large refunds paid without approval. What is the correct design?",
      qpt: "A política exige aprovação humana para reembolso acima de US$ 500. O time criou um hook PostToolUse que lê o resultado do process_refund e, quando o valor passou de US$ 500, abre um ticket para um supervisor. Auditorias ainda encontram reembolsos altos pagos sem aprovação. Qual é o desenho correto?",
      o: [
        "Keep the PostToolUse hook and make it reverse any refund above $500 automatically once the ticket is open.",
        "Repeat the $500 rule in the system prompt and in the description of process_refund, so the agent stops first.",
        "Intercept the outgoing process_refund call, block it above $500, and route the case to escalate_to_human.",
        "Shorten the time a supervisor takes to see the ticket, so large refunds can be cancelled within minutes."
      ],
      opt: [
        "Manter o hook PostToolUse e fazê-lo estornar automaticamente todo reembolso acima de US$ 500 depois de abrir o ticket.",
        "Repetir a regra dos US$ 500 no system prompt e na descrição do process_refund, para o agente parar antes.",
        "Interceptar a chamada de saída do process_refund, bloqueá-la acima de US$ 500 e encaminhar o caso ao escalate_to_human.",
        "Reduzir o tempo até o supervisor ver o ticket, para reembolsos altos serem cancelados em minutos."
      ],
      a: [2],
      e: "PostToolUse atua <em>depois</em> da execução: o dinheiro já saiu. Regra de compliance pede um hook que intercepte a <strong>chamada de saída</strong>, bloqueie o process_refund acima do limite antes de executar e redirecione para a escalação — garantia determinística. A compensa depois do fato, com o dano feito. B é compliance probabilística via prompt, a falha que o guia descreve. D só reage mais rápido; o pagamento sem aprovação continua possível."
    },
    {
      id: "CS3", s: "CS", d: 2, t: "2.2",
      q: "Your MCP tools now return errorCategory and isRetryable with every failure. For which TWO of these failures should isRetryable be true?",
      qpt: "Suas MCP tools agora devolvem errorCategory e isRetryable em toda falha. Em quais DUAS destas falhas isRetryable deve ser true?",
      o: [
        "lookup_order timed out after 30 seconds while the order database was failing over.",
        "process_refund rejected a $900 refund because the policy limit for this tier is $500.",
        "escalate_to_human got HTTP 503 while the ticketing service restarted for a deploy.",
        "process_refund was called with an API key that lacks the refunds:write scope.",
        "get_customer received an email address in the customer_id field, which expects a number."
      ],
      opt: [
        "lookup_order estourou o timeout de 30 segundos enquanto o banco de pedidos fazia failover.",
        "process_refund recusou um reembolso de US$ 900 porque o limite da política para este nível é US$ 500.",
        "escalate_to_human recebeu HTTP 503 enquanto o serviço de tickets reiniciava por causa de um deploy.",
        "process_refund foi chamado com uma API key sem o escopo refunds:write.",
        "get_customer recebeu um e-mail no campo customer_id, que espera um número."
      ],
      a: [0, 2],
      e: "Só falhas <strong>transitórias</strong> merecem retry: timeout durante failover (A) e indisponibilidade temporária do serviço (C). B é erro de negócio (violação de política): <code>isRetryable: false</code> e uma explicação que o agente possa passar ao cliente. D é erro de permissão: nenhum retry resolve sem trocar a credencial. E é erro de validação: o mesmo input falha igual; o agente precisa corrigir o parâmetro. Metadado estruturado é o que evita retries desperdiçados."
    },
    {
      id: "CS4", s: "CS", d: 5, t: "5.2",
      q: "A customer reports a missing parcel. Over six turns the agent has called lookup_order three times; each call returns “carrier: unknown”, and the agent keeps asking the customer to re-send the tracking number. The customer has not asked for a human. What should the agent do now?",
      qpt: "Um cliente relata um pacote extraviado. Em seis turnos, o agente chamou lookup_order três vezes; todas devolvem “carrier: unknown”, e o agente continua pedindo ao cliente que reenvie o código de rastreio. O cliente não pediu um humano. O que o agente deve fazer agora?",
      o: [
        "Keep trying lookup_order with variations of the tracking number, since the customer has not asked for a human.",
        "Wait to escalate until the customer's messages show frustration, since sentiment shows when a case needs a human.",
        "Send the self-service tracking link and close the conversation, since the order record is incomplete.",
        "Escalate with a structured summary of what was tried, because the agent cannot make meaningful progress on its own."
      ],
      opt: [
        "Continuar tentando lookup_order com variações do código de rastreio, já que o cliente não pediu um humano.",
        "Esperar para escalar até as mensagens mostrarem frustração, já que o sentimento indica quando o caso precisa de um humano.",
        "Enviar o link de rastreio self-service e encerrar a conversa, já que o registro do pedido está incompleto.",
        "Escalar com um resumo estruturado do que já foi tentado, porque o agente não consegue fazer progresso real sozinho."
      ],
      a: [3],
      e: "Incapacidade de fazer progresso real é gatilho legítimo de escalonamento, ao lado do pedido explícito de humano e da lacuna de política. Seis turnos repetindo a mesma busca sem resultado é exatamente isso — e o handoff vai estruturado, porque o humano não vê o transcript. A insiste numa tentativa que já se mostrou inútil. B usa sentimento como proxy de complexidade, o que o guia diz ser não confiável. C abandona o cliente sem resolver nem escalar."
    },
    {
      id: "CS5", s: "CS", d: 1, t: "1.4",
      q: "A programmatic gate already blocks process_refund until get_customer has returned a verified customer ID. The team now adds a change_account_email tool. Within a week, two accounts have their email changed by callers who were never verified. What should you change?",
      qpt: "Um gate programático já bloqueia o process_refund até o get_customer devolver um customer ID verificado. O time agora adiciona a tool change_account_email. Em uma semana, duas contas têm o e-mail trocado por quem nunca foi verificado. O que você deve mudar?",
      o: [
        "Apply the same prerequisite gate to change_account_email, blocking it until a verified customer ID exists.",
        "Add change_account_email to the list of operations that the system prompt says require verification first.",
        "Have the agent ask customers to confirm that they own the account before it changes the email address.",
        "Merge change_account_email into process_refund, so that the existing gate also covers email changes."
      ],
      opt: [
        "Aplicar o mesmo gate de pré-requisito ao change_account_email, bloqueando-o até existir um customer ID verificado.",
        "Incluir change_account_email na lista de operações que, segundo o system prompt, exigem verificação antes.",
        "Fazer o agente pedir ao cliente que confirme ser o dono da conta antes de trocar o e-mail.",
        "Fundir change_account_email ao process_refund, para o gate existente cobrir também a troca de e-mail."
      ],
      a: [0],
      e: "O pré-requisito programático precisa cobrir toda operação sensível, inclusive a tool nova — senão a garantia some exatamente onde está o risco. B volta à compliance probabilística via prompt, que falha numa fração dos casos. C troca verificação por autodeclaração do cliente, que não verifica nada. D mistura responsabilidades numa tool só e piora a interface (descrição e contrato ambíguos) só para reaproveitar o gate."
    },
    // ------------------------------------------------------------------ Multi-Agent Research
    {
      id: "MR1", s: "MR", d: 1, t: "1.2",
      q: "You are documenting the coordinator's responsibilities in this hub-and-spoke design. Which TWO belong to the coordinator?",
      qpt: "Você está documentando as responsabilidades do coordinator neste desenho hub-and-spoke. Quais DUAS são do coordinator?",
      o: [
        "Letting the analysis subagent hand results straight to the report subagent when the coordinator is busy.",
        "Deciding, for each query, which subagents are needed instead of always running every stage.",
        "Giving every subagent read access to the coordinator's full conversation history by default.",
        "Keeping a shared memory store that every subagent reads and writes directly during the run.",
        "Routing every result and error between subagents, so handling is consistent and observable."
      ],
      opt: [
        "Deixar o subagent de análise passar resultados direto ao de relatório quando o coordinator estiver ocupado.",
        "Decidir, para cada query, quais subagents são necessários, em vez de rodar sempre todas as etapas.",
        "Dar a todo subagent, por padrão, acesso de leitura ao histórico completo da conversa do coordinator.",
        "Manter um armazenamento de memória compartilhada que todo subagent lê e escreve diretamente durante a execução.",
        "Rotear todo resultado e todo erro entre subagents, para o tratamento ser consistente e observável."
      ],
      a: [1, 4],
      e: "No hub-and-spoke, o coordinator decompõe a tarefa, decide quais subagents a query exige (B) e é o hub de toda comunicação: resultados e erros passam por ele, o que dá observabilidade, tratamento de erro consistente e fluxo de informação controlado (E). A cria um canal lateral que escapa do hub. C contraria o isolamento: subagent não herda o histórico, o contexto vai explícito no prompt. D troca o roteamento controlado por estado compartilhado sem dono — o mesmo problema do canal lateral."
    },
    {
      id: "MR2", s: "MR", d: 1, t: "1.3",
      q: "A research run has finished collecting and analyzing 60 sources. The editors want to compare two report structures, one thematic and one chronological, built from exactly the same findings, without either attempt influencing the other and without repeating the research. What should you do?",
      qpt: "Uma pesquisa terminou de coletar e analisar 60 fontes. Os editores querem comparar duas estruturas de relatório, uma temática e uma cronológica, montadas exatamente com os mesmos achados, sem que uma tentativa influencie a outra e sem repetir a pesquisa. O que você deve fazer?",
      o: [
        "Rerun the full research pipeline twice, once per structure, so each report has its own research base.",
        "Ask the synthesis subagent for both structures in one response, so both are built from the same context.",
        "Fork the session after the analysis phase and build each structure in its own branch from that baseline.",
        "Resume the original session twice in a row, producing the thematic version and then the chronological one."
      ],
      opt: [
        "Rodar o pipeline de pesquisa inteiro duas vezes, uma por estrutura, para cada relatório ter sua própria base.",
        "Pedir as duas estruturas ao subagent de síntese numa só resposta, para ambas saírem do mesmo contexto.",
        "Fazer fork da sessão depois da fase de análise e montar cada estrutura no seu próprio ramo a partir dessa base.",
        "Retomar a sessão original duas vezes seguidas, gerando a versão temática e depois a cronológica."
      ],
      a: [2],
      e: "Fork de sessão cria ramos independentes a partir de uma base de análise compartilhada — exatamente comparar abordagens divergentes sem repetir trabalho. A repete a pesquisa inteira, com custo e variação desnecessários. B põe as duas versões no mesmo contexto: uma influencia a outra. D, retomando a mesma sessão em sequência, faz a segunda versão herdar o raciocínio da primeira."
    },
    {
      id: "MR3", s: "MR", d: 1, t: "1.3",
      q: "To keep invocations short, the coordinator now calls the report subagent with “Write the report using findings F1–F12 from this run.” The reports come back generic and cite none of the twelve findings. The subagent is correctly defined and receives this prompt. What should change?",
      qpt: "Para encurtar as invocações, o coordinator agora chama o subagent de relatório com “Write the report using findings F1–F12 from this run.” Os relatórios voltam genéricos e não citam nenhum dos doze achados. O subagent está bem definido e recebe esse prompt. O que deve mudar?",
      o: [
        "Include the complete findings F1–F12 in the invocation prompt, with each claim and its source metadata.",
        "Give the report subagent a longer system prompt that explains how the coordinator numbers its findings.",
        "Let the report subagent read the coordinator's conversation history, where findings F1–F12 are listed.",
        "Run the report subagent inside the coordinator's session, so it shares memory of everything found so far."
      ],
      opt: [
        "Incluir os achados F1–F12 completos no prompt de invocação, cada afirmação com os metadados da fonte.",
        "Dar ao subagent de relatório um system prompt mais longo, explicando como o coordinator numera os achados.",
        "Deixar o subagent de relatório ler o histórico da conversa do coordinator, onde F1–F12 estão listados.",
        "Rodar o subagent de relatório dentro da sessão do coordinator, para compartilhar a memória de tudo o que foi achado."
      ],
      a: [0],
      e: "Subagent não herda o contexto do coordinator nem compartilha memória entre invocações: tudo o que ele precisa vai explícito no prompt — aqui, os achados completos, em formato estruturado com metadados de fonte. B explica a numeração, mas o subagent continua sem o conteúdo. C e D descrevem acesso a histórico ou memória compartilhada que o modelo de subagents não oferece: o contexto é isolado por desenho."
    },
    {
      id: "MR4", s: "MR", d: 2, t: "2.3",
      q: "The report-generation subagent was also given the web search tools “so it can add recent context”. Logs show it now spends most of its calls searching the web instead of formatting the findings it receives, and its reports have started citing sources that no subagent analyzed. What is the best fix?",
      qpt: "O subagent de geração de relatório também recebeu as tools de busca web “para poder acrescentar contexto recente”. Os logs mostram que agora ele gasta a maior parte das chamadas buscando na web em vez de formatar os achados que recebe, e os relatórios começaram a citar fontes que nenhum subagent analisou. Qual é a melhor correção?",
      o: [
        "Keep the web search tools and add a system prompt rule that limits the subagent to two searches per report.",
        "Move report generation into the search subagent, so that one agent owns both searching and writing reports.",
        "Rewrite the web search tool descriptions so they discourage use by any agent other than the search subagent.",
        "Restrict its tools to what report writing needs for its role, and leave web search to the search subagent."
      ],
      opt: [
        "Manter as tools de busca e acrescentar ao system prompt uma regra que limita o subagent a duas buscas por relatório.",
        "Passar a geração de relatório para o subagent de busca, para um só agente buscar e escrever os relatórios.",
        "Reescrever as descrições das tools de busca para desencorajar o uso por qualquer agente que não seja o de busca.",
        "Restringir as tools dele ao que a escrita do relatório exige, o seu papel, e deixar a busca web com o subagent de busca."
      ],
      a: [3],
      e: "Tools fora da especialidade são mal usadas — o guia cita exatamente o agente que passa a fazer buscas que não são papel dele. Aqui o custo é duplo: chamadas desperdiçadas e citações de fontes que ninguém analisou. A correção é escopo: cada subagent recebe só as tools do seu papel. A mantém a tentação e confia num limite via prompt. B junta papéis e aumenta o conjunto de tools de um agente, o que piora a seleção. C tenta resolver com descrição um problema de distribuição: a tool continua disponível para quem não deveria tê-la."
    },
    {
      id: "MR5", s: "MR", d: 5, t: "5.6",
      q: "Two credible sources report remote-work rates of 28% and 41% for the same year. The first is a census of all employers; the second is an opt-in online survey. The synthesis subagent writes “about a third of employees work remotely (28–41%)”. What should the report do instead?",
      qpt: "Duas fontes críveis informam taxas de trabalho remoto de 28% e 41% para o mesmo ano. A primeira é um censo de todos os empregadores; a segunda, uma pesquisa online opt-in. O subagent de síntese escreve “cerca de um terço dos empregados trabalha remotamente (28–41%)”. O que o relatório deveria fazer?",
      o: [
        "Use the census figure alone, since a census is more reliable, and drop the survey figure from the report.",
        "Present both figures with their sources and methods, and mark the point as contested rather than settled.",
        "Keep the range but add a footnote saying that the sources used different methods to collect their data.",
        "Ask the analysis subagent to search again until it finds a third source that can break the tie."
      ],
      opt: [
        "Usar só o número do censo, por ser mais confiável, e tirar do relatório o número da pesquisa.",
        "Apresentar os dois números com suas fontes e métodos e marcar o ponto como contestado, não resolvido.",
        "Manter a faixa, mas acrescentar uma nota de rodapé dizendo que as fontes coletaram os dados com métodos diferentes.",
        "Pedir ao subagent de análise que busque de novo até achar uma terceira fonte que desempate."
      ],
      a: [1],
      e: "Conflito entre fontes críveis não se resolve arbitrariamente nem se dilui numa faixa: o relatório mantém os dois valores com atribuição e contexto metodológico (censo × pesquisa opt-in) e marca o ponto como contestado. A escolhe um valor e descarta o outro sem transparência para o leitor. C ainda colapsa os dados num número que nenhuma fonte afirmou, e a nota genérica não diz qual valor vem de onde. D trata o conflito como empate a desempatar, quando a informação valiosa é a divergência e o porquê dela."
    },
    // ------------------------------------------------------------------ Continuous Integration
    {
      id: "CI1", s: "CI", d: 3, t: "3.6",
      q: "A new pipeline job will run Claude Code unattended on every pull request, and a script will post its findings as inline comments. Which TWO configurations does the job need?",
      qpt: "Um job novo do pipeline vai rodar o Claude Code sem supervisão em todo pull request, e um script vai postar os findings como comentários inline. De quais DUAS configurações o job precisa?",
      o: [
        "Pipe the prompt through stdin without flags, which makes the CLI read the input once and exit.",
        "Ask in the prompt for “valid JSON only” and parse the reply with a tolerant regular expression.",
        "Run the CLI with -p, so it processes the prompt, prints the result and exits.",
        "Start an interactive session and have a wrapper script answer any prompts that appear.",
        "Use --output-format json with --json-schema, so findings come back machine-parseable."
      ],
      opt: [
        "Passar o prompt por stdin sem flags, o que faz a CLI ler a entrada uma vez e sair.",
        "Pedir no prompt “só JSON válido” e parsear a resposta com uma expressão regular tolerante.",
        "Rodar a CLI com -p, para ela processar o prompt, imprimir o resultado e sair.",
        "Abrir uma sessão interativa e ter um script que responda a qualquer pergunta que aparecer.",
        "Usar --output-format json com --json-schema, para os findings voltarem parseáveis por máquina."
      ],
      a: [2, 4],
      e: "<code>-p</code> (C) é o modo não interativo documentado: processa, imprime e sai — sem ele o job trava esperando input. <code>--output-format json</code> com <code>--json-schema</code> (E) devolve findings estruturados que o script consegue postar como comentário inline. A é contorno de shell que não ativa o modo certo. B troca a garantia de estrutura por um pedido no prompt e um parser frouxo. D tenta automatizar uma sessão interativa, o que é complexo e frágil quando a flag certa já existe."
    },
    {
      id: "CI2", s: "CI", d: 3, t: "3.6",
      q: "An auto-fix job runs claude -p to patch a failing test, then calls claude -p --resume on the same session to review the patch before opening a pull request. The review step almost never objects, yet human reviewers keep finding problems in these patches. What should change?",
      qpt: "Um job de auto-fix roda claude -p para corrigir um teste quebrado e depois chama claude -p --resume na mesma sessão para revisar o patch antes de abrir o pull request. A revisão quase nunca faz objeção, mas os revisores humanos continuam achando problemas nesses patches. O que deve mudar?",
      o: [
        "Keep resuming the session, but tell the reviewer to treat the patch as the work of an untrusted contributor.",
        "Enable extended thinking on the review step, so the model reasons for longer before approving the patch.",
        "Run the review step twice in the same session and fail the job whenever the two verdicts disagree.",
        "Review in a fresh invocation without --resume, giving it only the diff and the review criteria."
      ],
      opt: [
        "Continuar retomando a sessão, mas instruir o revisor a tratar o patch como trabalho de um colaborador não confiável.",
        "Ativar extended thinking na revisão, para o modelo raciocinar mais antes de aprovar o patch.",
        "Rodar a revisão duas vezes na mesma sessão e falhar o job sempre que os dois veredictos divergirem.",
        "Revisar numa invocação nova, sem --resume, que recebe só o diff e os critérios de revisão."
      ],
      a: [3],
      e: "Retomar a sessão (<code>--resume</code>) leva o raciocínio da geração para dentro da revisão, e o modelo tende a não questionar as próprias decisões. Uma invocação nova, sem esse histórico, vendo só o diff e os critérios, é a revisão independente que o guia recomenda. A tenta simular independência com uma instrução, no mesmo contexto contaminado. B: extended thinking não remove o viés do contexto de geração — o guia diz isso explicitamente. C repete a autoavaliação: duas opiniões do mesmo contexto não são independentes."
    },
    {
      id: "CI3", s: "CI", d: 4, t: "4.1",
      q: "Your CI reviewer posts many findings that developers dismiss as noise, and they have started ignoring the accurate ones too. Which TWO prompt changes improve precision in a consistent way?",
      qpt: "Seu revisor de CI posta muitos findings que os devs descartam como ruído, e eles começaram a ignorar também os corretos. Quais DUAS mudanças no prompt melhoram a precisão de forma consistente?",
      o: [
        "Add: “Only report findings that you are at least 90% confident are real problems.”",
        "Add explicit report/skip criteria: report logic, security and data-loss issues; skip style.",
        "Add: “Be conservative and avoid flagging anything that might be a deliberate choice.”",
        "Add a short code example for each severity level, showing what qualifies for it.",
        "Cap the review at five findings per pull request, so only the strongest ones remain."
      ],
      opt: [
        "Acrescentar: “Só reporte findings que você tenha pelo menos 90% de confiança de que são problemas reais.”",
        "Acrescentar critérios explícitos de reportar/pular: reportar lógica, segurança e perda de dados; pular estilo.",
        "Acrescentar: “Seja conservador e evite apontar qualquer coisa que possa ser uma escolha deliberada.”",
        "Acrescentar um exemplo curto de código para cada nível de severidade, mostrando o que se enquadra nele.",
        "Limitar a revisão a cinco findings por pull request, para só os mais fortes sobrarem."
      ],
      a: [1, 3],
      e: "Precisão vem de critério categórico explícito — o que reportar (lógica, segurança, perda de dados) e o que pular (estilo) (B) — e de critérios de severidade com um exemplo de código por nível, que tornam a classificação consistente (D). A e C são justamente as instruções vagas de confiança e conservadorismo que, segundo o guia, <em>não</em> melhoram a precisão. E corta volume de forma arbitrária: pode descartar o bug real e manter o ruído."
    },
    {
      id: "CI4", s: "CI", d: 4, t: "4.2",
      q: "A CI job reports gaps in test coverage. Its instructions say to report branches that no test exercises, yet it keeps treating a function as covered whenever any test calls it, so untested error-handling branches slip through. The instructions are already detailed. What is the most effective next step?",
      qpt: "Um job de CI aponta lacunas de cobertura de testes. As instruções mandam reportar branches que nenhum teste exercita, mas ele continua considerando a função coberta sempre que algum teste a chama, e branches de tratamento de erro sem teste passam batido. As instruções já são detalhadas. Qual é o próximo passo mais eficaz?",
      o: [
        "Repeat the instruction about branches at the start and at the end of the prompt, in capital letters.",
        "Remove the branch requirement, so the job reports only the functions that no test calls at all.",
        "Add 2–3 borderline examples showing why a function that tests call can still miss a branch.",
        "Ask the model for a confidence score on each gap and report only the gaps scored above 8."
      ],
      opt: [
        "Repetir a instrução sobre branches no começo e no fim do prompt, em letras maiúsculas.",
        "Tirar a exigência de branches, para o job reportar só as funções que nenhum teste chama.",
        "Acrescentar 2–3 exemplos de casos limítrofes mostrando por que uma função chamada por testes ainda pode ter um branch sem teste.",
        "Pedir ao modelo uma nota de confiança por lacuna e reportar só as lacunas com nota acima de 8."
      ],
      a: [2],
      e: "Instrução detalhada que ainda gera resultado inconsistente pede few-shot: 2–3 exemplos de casos ambíguos, com o raciocínio (função chamada por um teste, mas com um branch de erro nunca exercitado), ensinam o modelo a generalizar o julgamento. O guia cita justamente lacunas de cobertura em nível de branch. A repete a instrução que já não funcionou. B desiste do requisito em vez de cumpri-lo. D usa autoconfiança não calibrada como filtro."
    },
    {
      id: "CI5", s: "CI", d: 4, t: "4.6",
      q: "To fix uneven reviews of large pull requests, the team now reviews each changed file in its own focused pass. Local findings improved, but last week a renamed field in one file broke two consumers in other files, and no pass reported it. What should be added?",
      qpt: "Para corrigir revisões desiguais de pull requests grandes, o time agora revisa cada arquivo alterado num passe focado próprio. Os achados locais melhoraram, mas na semana passada um campo renomeado num arquivo quebrou dois consumidores em outros arquivos, e nenhum passe apontou. O que deve ser acrescentado?",
      o: [
        "A separate integration pass over the changed files that follows data flow and contracts across them.",
        "An instruction in every per-file pass to also skim the other changed files for possible side effects.",
        "A return to a single pass over the whole diff, since only that pass can see every file at once.",
        "A second run of each per-file pass, keeping only the findings that appear in both of the runs."
      ],
      opt: [
        "Um passe de integração separado sobre os arquivos alterados, que segue o fluxo de dados e os contratos entre eles.",
        "Uma instrução em cada passe por arquivo para também dar uma olhada nos outros arquivos alterados em busca de efeitos colaterais.",
        "A volta a um passe único sobre o diff inteiro, já que só esse passe enxerga todos os arquivos de uma vez.",
        "Uma segunda execução de cada passe por arquivo, mantendo só os achados que aparecerem nas duas."
      ],
      a: [0],
      e: "Multi-pass completo = passes focados por arquivo para problemas locais <strong>mais</strong> um passe de integração separado para o fluxo de dados entre arquivos. O passe por arquivo, sozinho, não enxerga contrato quebrado entre arquivos — exatamente o que escapou. B traz a diluição de atenção de volta para dentro de cada passe focado. C desfaz a correção que melhorou os achados locais. D exige consenso entre execuções e tende a suprimir bugs reais que aparecem de forma intermitente."
    },
    // ------------------------------------------------------------------ Structured Data Extraction
    {
      id: "EX1", s: "EX", d: 4, t: "4.3",
      q: "Invoice extraction uses tool use with a strict JSON schema, and JSON syntax errors have dropped to zero. Yet on invoices that show two addresses, about 6% of extractions put the shipping address in billing_address. A teammate proposes adding a regex pattern to both address fields. What is the best response?",
      qpt: "A extração de faturas usa tool use com um JSON schema estrito, e os erros de sintaxe JSON caíram a zero. Mas, em faturas com dois endereços, cerca de 6% das extrações põem o endereço de entrega em billing_address. Um colega propõe acrescentar um pattern (regex) aos dois campos de endereço. Qual é a melhor resposta?",
      o: [
        "Agree, because a stricter pattern on both fields will make the schema reject the swapped addresses.",
        "Switch tool_choice from forced to “any”, so the model can pick a different tool for two-address invoices.",
        "Go back to free-text JSON output, since tool use is hiding the model's reasoning about the addresses.",
        "Schemas enforce structure, not meaning; add a semantic check plus examples of two-address invoices."
      ],
      opt: [
        "Concordar, porque um pattern mais estrito nos dois campos fará o schema rejeitar os endereços trocados.",
        "Trocar o tool_choice de forçado para “any”, para o modelo escolher outra tool em faturas com dois endereços.",
        "Voltar à saída JSON em texto livre, já que o tool use esconde o raciocínio do modelo sobre os endereços.",
        "Schemas garantem estrutura, não significado; acrescentar uma checagem semântica e exemplos de faturas com dois endereços."
      ],
      a: [3],
      e: "Tool use com schema estrito elimina erro de sintaxe, não erro semântico — e valor no campo errado é o exemplo do guia. Um endereço trocado continua sendo um endereço válido, então nenhum pattern (A) separa os dois. A correção é semântica: uma checagem que confira o campo (por exemplo, casando com o rótulo “Bill to”) e exemplos few-shot de faturas com dois endereços. B confunde seleção de tool com qualidade do conteúdo. C abre mão da garantia de estrutura que já funciona."
    },
    {
      id: "EX2", s: "EX", d: 4, t: "4.4",
      q: "A validation step catches extractions whose line items do not add up to the stated total. Today the pipeline simply re-sends the original request when this happens, and the second attempt usually fails the same way. How should the retry request be built?",
      qpt: "Uma etapa de validação pega extrações cujos itens não somam o total declarado. Hoje o pipeline simplesmente reenvia o request original quando isso acontece, e a segunda tentativa costuma falhar do mesmo jeito. Como o request de retry deve ser montado?",
      o: [
        "Send the original request again with a higher temperature, so the second attempt explores other readings.",
        "Include the document, the failed extraction and the specific validation error, and ask for a correction.",
        "Send only the validation error, so the model focuses on fixing the arithmetic without the long document.",
        "Send it to a larger model with no extra context, since larger models make fewer arithmetic mistakes."
      ],
      opt: [
        "Reenviar o request original com temperatura mais alta, para a segunda tentativa explorar outras leituras.",
        "Incluir o documento, a extração que falhou e o erro de validação específico, e pedir uma correção.",
        "Enviar só o erro de validação, para o modelo se concentrar na aritmética sem o documento longo.",
        "Mandar para um modelo maior sem contexto extra, já que modelos maiores erram menos nas contas."
      ],
      a: [1],
      e: "Retry-with-error-feedback: o follow-up leva o documento original, a extração que falhou e o erro de validação específico — o modelo sabe o que errou e tem a fonte para corrigir. A repete a mesma tentativa às cegas; mais aleatoriedade não é correção. C tira a fonte: sem o documento, o modelo só consegue “ajustar” números para fechar a soma, ou seja, fabricar. D troca de modelo sem dar a informação que falta: o que deu errado."
    },
    {
      id: "EX3", s: "EX", d: 4, t: "4.5",
      q: "A nightly job submits 5,000 extraction requests as one batch and writes each result to the database row at the same position in the submission list. Reviewers find extractions attached to the wrong contracts, scattered at random. What is the fix?",
      qpt: "Um job noturno envia 5.000 requests de extração num batch e grava cada resultado na linha do banco que ocupa a mesma posição na lista de envio. Os revisores encontram extrações ligadas aos contratos errados, espalhadas ao acaso. Qual é a correção?",
      o: [
        "Give each request a custom_id with the contract's key, and match every result by its custom_id.",
        "Submit smaller batches of 100 requests, so that the results come back in submission order.",
        "Sort the results by their content before writing them, so that the original order is restored.",
        "Move the job to the synchronous API, since batch processing cannot link results back to requests."
      ],
      opt: [
        "Dar a cada request um custom_id com a chave do contrato e casar cada resultado pelo custom_id.",
        "Enviar batches menores, de 100 requests, para os resultados voltarem na ordem de envio.",
        "Ordenar os resultados pelo conteúdo antes de gravar, para restaurar a ordem original.",
        "Passar o job para a API síncrona, já que o batch não consegue ligar resultados aos requests."
      ],
      a: [0],
      e: "Resultados de batch não têm ordem garantida; a correlação request↔resposta é o <code>custom_id</code> — use a chave do contrato e case cada resultado por ela. B aposta numa ordem que a API não promete, e batches menores não mudam isso. C inventa uma ordenação sem relação com a lista original. D parte de uma premissa falsa (o vínculo existe: é o custom_id) e ainda perde os 50% de economia num job noturno que não precisa de latência."
    },
    {
      id: "EX4", s: "EX", d: 5, t: "5.5",
      q: "Some purchase orders state one total in the summary table and a different one in the text. The schema already has a conflict_detected flag, which the model sets correctly, but those documents are still auto-approved whenever overall confidence is high. Reviewer capacity is limited. What should the routing do?",
      qpt: "Alguns pedidos de compra trazem um total na tabela-resumo e outro no texto. O schema já tem a flag conflict_detected, que o modelo preenche corretamente, mas esses documentos continuam aprovados automaticamente sempre que a confiança geral é alta. A capacidade dos revisores é limitada. O que o roteamento deve fazer?",
      o: [
        "Approve them anyway when confidence is high, since the model already flagged the conflict in its output.",
        "Send every purchase order to human review until the model stops finding conflicting totals.",
        "Route documents with conflict_detected set to human review, whatever their overall confidence.",
        "Ask the model to pick the total it finds more plausible and to lower its confidence in these cases."
      ],
      opt: [
        "Aprovar mesmo assim quando a confiança é alta, já que o modelo já sinalizou o conflito na saída.",
        "Mandar todo pedido de compra para revisão humana até o modelo parar de encontrar totais conflitantes.",
        "Rotear para revisão humana os documentos com conflict_detected ligado, qualquer que seja a confiança geral.",
        "Pedir ao modelo que escolha o total que achar mais plausível e reduza a confiança nesses casos."
      ],
      a: [2],
      e: "Documento-fonte contraditório é o que o guia manda priorizar na revisão humana: confiança alta não resolve uma contradição que está no próprio documento. Roteie por <code>conflict_detected</code>, independente do score — uso inteligente de uma capacidade limitada. A trata a flag como decoração. B gasta a capacidade dos revisores com documentos sem conflito. D pede ao modelo para escolher um valor arbitrariamente, exatamente o que não se faz com dados conflitantes."
    },
    {
      id: "EX5", s: "EX", d: 4, t: "4.2",
      q: "A pipeline extracts ingredient quantities from user-written recipes into quantity and unit fields. For phrases like “a pinch of salt” or “two handfuls of spinach”, the model invents grams and milliliters. The field instructions are already detailed. What is the most effective improvement?",
      qpt: "Um pipeline extrai quantidades de ingredientes de receitas escritas por usuários para os campos quantity e unit. Em frases como “a pinch of salt” ou “two handfuls of spinach”, o modelo inventa gramas e mililitros. As instruções dos campos já são detalhadas. Qual é a melhoria mais eficaz?",
      o: [
        "Make quantity and unit required numeric fields, so every ingredient always gets a measurable value.",
        "Add a rule telling the model never to estimate weights, written in capital letters at the top of the prompt.",
        "Pre-process the recipes with a script that deletes every phrase it cannot convert to a standard unit.",
        "Add a few examples of informal measurements, each recorded as written in the recipe, such as quantity 1 and unit “pinch”."
      ],
      opt: [
        "Tornar quantity e unit campos numéricos obrigatórios, para todo ingrediente sempre ter um valor mensurável.",
        "Acrescentar uma regra proibindo o modelo de estimar pesos, em letras maiúsculas no topo do prompt.",
        "Pré-processar as receitas com um script que apaga toda frase que não consegue converter para uma unidade padrão.",
        "Acrescentar alguns exemplos de medidas informais, cada uma registrada como está na receita, como quantity 1 e unit “pinch”."
      ],
      a: [3],
      e: "Few-shot reduz alucinação em extração quando as instruções já são detalhadas — o guia cita justamente medidas informais. Exemplos mostrando “a pinch” preservado como está (unidade informal, sem conversão inventada) ensinam o comportamento esperado. A piora: campo numérico obrigatório força o modelo a fabricar um valor. B é a instrução enfática que já não está funcionando. C joga fora informação real do documento para esconder o problema."
    },
    // ------------------------------------------------------------------ Code Generation
    {
      id: "CG1", s: "CG", d: 3, t: "3.1",
      q: "All code in services/legacy-billing/ must keep the callback style its tests depend on, while the rest of the repository uses async/await, as the root CLAUDE.md says. The legacy code lives only in that directory. What is the simplest way to give Claude this exception?",
      qpt: "Todo o código em services/legacy-billing/ precisa manter o estilo de callbacks do qual os testes dependem, enquanto o resto do repositório usa async/await, como diz o CLAUDE.md da raiz. O código legado fica só nesse diretório. Qual é o jeito mais simples de passar essa exceção ao Claude?",
      o: [
        "Add a personal note to ~/.claude/CLAUDE.md on the machine of each developer who works on billing.",
        "Add a CLAUDE.md inside services/legacy-billing/ that states the callback convention for that directory.",
        "Create a skill with the callback convention and ask developers to invoke it before touching billing.",
        "Rewrite the root CLAUDE.md so it lists every directory together with the coding style that applies to it."
      ],
      opt: [
        "Acrescentar uma nota pessoal em ~/.claude/CLAUDE.md na máquina de cada dev que mexe em billing.",
        "Criar um CLAUDE.md dentro de services/legacy-billing/ com a convenção de callbacks daquele diretório.",
        "Criar uma skill com a convenção de callbacks e pedir aos devs que a invoquem antes de mexer em billing.",
        "Reescrever o CLAUDE.md da raiz para listar cada diretório com o estilo de código que vale para ele."
      ],
      a: [1],
      e: "Convenção confinada a um diretório é o caso do CLAUDE.md de diretório: carrega quando se trabalha ali, vai no git para o time todo e não polui o resto. (Quando a convenção se espalha por vários diretórios — arquivos de teste, por exemplo —, a resposta vira <code>.claude/rules/</code> com glob.) A é escopo de usuário, não compartilhado via controle de versão. C troca o carregamento automático por uma invocação manual que alguém vai esquecer. D volta ao monólito na raiz, carregado em toda sessão."
    },
    {
      id: "CG2", s: "CG", d: 3, t: "3.2",
      q: "A developer wants a personal variant of the team's release-notes skill, with an extra section for their own use, without changing what teammates get. Which action fits?",
      qpt: "Um dev quer uma variante pessoal da skill release-notes do time, com uma seção extra só para uso próprio, sem mudar o que os colegas recebem. Qual ação serve?",
      o: [
        "Create the variant in ~/.claude/skills/ under a different name, such as release-notes-mine.",
        "Edit .claude/skills/release-notes/SKILL.md in the repository and add the extra section there.",
        "Create the variant in the repository as .claude/skills/release-notes-mine/, versioned next to the team skill.",
        "Create the variant in ~/.claude/skills/ with the same name, so it replaces the team version everywhere."
      ],
      opt: [
        "Criar a variante em ~/.claude/skills/ com outro nome, como release-notes-mine.",
        "Editar .claude/skills/release-notes/SKILL.md no repositório e acrescentar a seção extra ali.",
        "Criar a variante no repositório, em .claude/skills/release-notes-mine/, versionada ao lado da skill do time.",
        "Criar a variante em ~/.claude/skills/ com o mesmo nome, para ela substituir a versão do time em todo lugar."
      ],
      a: [0],
      e: "Variante pessoal vai em <code>~/.claude/skills/</code> com <strong>outro nome</strong> (A): não colide com a skill do time e não chega aos colegas. B muda a skill de todo o time para atender uma pessoa. C usa outro nome, mas no repositório a variante vai para todo o time via git. D usa o mesmo nome — o guia recomenda nome diferente justamente para não afetar os colegas —, e um arquivo na pasta pessoal não substitui nada “em todo lugar”."
    },
    {
      id: "CG3", s: "CG", d: 3, t: "3.3",
      q: "A rule in .claude/rules/testing.md has the frontmatter paths: [\"src/*.test.ts\"]. It is applied when Claude edits src/cart.test.ts but not when it edits src/checkout/payment/payment.test.ts. What is the fix?",
      qpt: "Uma rule em .claude/rules/testing.md tem o frontmatter paths: [\"src/*.test.ts\"]. Ela é aplicada quando o Claude edita src/cart.test.ts, mas não quando edita src/checkout/payment/payment.test.ts. Qual é a correção?",
      o: [
        "Change the pattern to “**/*.test.ts”, so it matches test files at any depth in the repository.",
        "Move testing.md into src/checkout/payment/, so the rule sits next to the files it should apply to.",
        "Remove the paths field, so the rule loads in every session no matter which files are being edited.",
        "Add a CLAUDE.md to each test directory that repeats the testing conventions from the rule file."
      ],
      opt: [
        "Trocar o padrão para “**/*.test.ts”, para casar arquivos de teste em qualquer profundidade do repositório.",
        "Mover testing.md para src/checkout/payment/, para a rule ficar ao lado dos arquivos aos quais deve se aplicar.",
        "Remover o campo paths, para a rule carregar em toda sessão, não importa quais arquivos estejam sendo editados.",
        "Criar um CLAUDE.md em cada diretório de testes repetindo as convenções do arquivo de rule."
      ],
      a: [0],
      e: "<code>src/*.test.ts</code> só casa arquivos direto em <code>src/</code>; <code>**/*.test.ts</code> casa em qualquer profundidade — é o glob que segue o tipo de arquivo, independente do diretório. B quebra o modelo: rules ficam em <code>.claude/rules/</code> e o escopo vem do glob, não da localização do arquivo. C carrega a regra sempre, gastando contexto e tokens em trabalho sem relação. D volta ao CLAUDE.md por diretório, que é justamente o que não escala para arquivos espalhados."
    },
    {
      id: "CG4", s: "CG", d: 3, t: "3.4",
      q: "You must add search to the product catalog. Only four files will change, but there are two valid approaches: the database's built-in full-text index, or a separate search cluster that needs new infrastructure and a sync job. How should you use Claude Code?",
      qpt: "Você precisa adicionar busca ao catálogo de produtos. Só quatro arquivos vão mudar, mas há duas abordagens válidas: o índice full-text nativo do banco ou um cluster de busca separado, que exige infraestrutura nova e um job de sincronização. Como você deve usar o Claude Code?",
      o: [
        "Direct execution, since only four files change and the scope of the edit is small and clearly defined.",
        "Direct execution of the built-in index, switching to plan mode only if it fails under load testing.",
        "Plan mode to weigh both approaches and their infrastructure needs, then direct execution.",
        "Two parallel sessions in direct execution, one per approach, keeping whichever version passes the tests."
      ],
      opt: [
        "Execução direta, já que só quatro arquivos mudam e o escopo da edição é pequeno e bem definido.",
        "Execução direta do índice nativo, passando para plan mode só se ele falhar no teste de carga.",
        "Plan mode para pesar as duas abordagens e suas necessidades de infraestrutura, depois execução direta.",
        "Duas sessões paralelas em execução direta, uma por abordagem, ficando com a versão que passar nos testes."
      ],
      a: [2],
      e: "Plan mode não depende só do número de arquivos: duas abordagens válidas com requisitos de infraestrutura diferentes (índice nativo do banco × cluster de busca com job de sincronização) são uma decisão arquitetural — planeje, escolha e depois execute direto. A olha só o tamanho do diff e ignora a decisão. B deixa a arquitetura “emergir” de um teste de carga: retrabalho caro, o mesmo erro da questão oficial do monólito. D implementa as duas às cegas e escolhe pelo teste, sem avaliar o custo de infraestrutura."
    },
    {
      id: "CG5", s: "CG", d: 2, t: "2.4",
      q: "A developer is trying out an experimental MCP server for a local database tool. They added it to the project's .mcp.json and pushed, and now every teammate's session tries to connect to a server they don't have installed. Where should this server be configured?",
      qpt: "Um dev está testando um MCP server experimental para uma ferramenta de banco local. O server foi adicionado ao .mcp.json do projeto e enviado com push, e agora a sessão de cada colega tenta se conectar a um server que ninguém mais tem instalado. Onde esse server deveria ser configurado?",
      o: [
        "In the project's .mcp.json, behind an environment variable that each teammate can leave unset to skip it.",
        "In the developer's user-level ~/.claude.json, which stays personal and is never shared through the repository.",
        "In CLAUDE.md, describing the server so that Claude connects to it only for the developer who needs it.",
        "In a second project file, .mcp.local.json, committed next to .mcp.json for experimental servers only."
      ],
      opt: [
        "No .mcp.json do projeto, atrás de uma variável de ambiente que cada colega pode deixar vazia para pular o server.",
        "No ~/.claude.json do dev, em escopo de usuário, que fica pessoal e nunca é compartilhado pelo repositório.",
        "No CLAUDE.md, descrevendo o server para o Claude se conectar a ele só para o dev que precisa.",
        "Num segundo arquivo do projeto, .mcp.local.json, commitado ao lado do .mcp.json só para servers experimentais."
      ],
      a: [1],
      e: "Server pessoal ou experimental vai no escopo de usuário (<code>~/.claude.json</code>): não é compartilhado via git e não afeta o time. <code>.mcp.json</code> é para tooling compartilhado. A mantém o problema no arquivo do time e transfere o custo para todos. C confunde documentação com configuração: CLAUDE.md não registra MCP servers. D descreve um mecanismo que não existe."
    },
    // ------------------------------------------------------------------ Developer Productivity
    {
      id: "DP1", s: "DP", d: 1, t: "1.6",
      q: "The agent must produce reference docs for 140 internal API endpoints. Each endpoint goes through the same steps: extract the signature, write a description, then add a usage example checked against the signature. Which decomposition fits?",
      qpt: "O agente precisa produzir documentação de referência para 140 endpoints internos. Cada endpoint passa pelos mesmos passos: extrair a assinatura, escrever a descrição e acrescentar um exemplo de uso conferido contra a assinatura. Qual decomposição serve?",
      o: [
        "An adaptive plan in which the agent decides new subtasks for each endpoint based on what it discovers.",
        "A single prompt that documents all 140 endpoints at once, so the style stays consistent across them.",
        "A fixed prompt chain run per endpoint: signature, then description, then a verified usage example.",
        "Dynamic delegation to subagents that each pick the endpoints and the steps they consider most useful."
      ],
      opt: [
        "Um plano adaptativo em que o agente decide subtarefas novas para cada endpoint conforme o que descobre.",
        "Um único prompt que documenta os 140 endpoints de uma vez, para o estilo ficar consistente entre eles.",
        "Uma cadeia fixa de prompts por endpoint: assinatura, depois descrição, depois um exemplo de uso verificado.",
        "Delegação dinâmica a subagents que escolhem os endpoints e os passos que consideram mais úteis."
      ],
      a: [2],
      e: "Passos conhecidos, iguais para todo item e dependentes entre si: prompt chaining, um pipeline sequencial fixo. Decomposição adaptativa (A, D) é para investigação aberta, em que cada achado define o próximo passo — aqui ela só acrescenta variação. B joga 140 endpoints num único passe: diluição de atenção e qualidade desigual."
    },
    {
      id: "DP2", s: "DP", d: 1, t: "1.7",
      q: "An engineer is investigating a payments timeout over several days and often has other Claude Code sessions open at the same time. Each morning they lose time finding the right conversation to continue. Which practice fits?",
      qpt: "Alguém do time investiga um timeout de pagamentos ao longo de vários dias e costuma ter outras sessões do Claude Code abertas ao mesmo tempo. Toda manhã perde tempo achando a conversa certa para continuar. Qual prática serve?",
      o: [
        "Paste yesterday's whole transcript into a new session every morning, so nothing from the investigation is lost.",
        "Keep a single session open overnight for every investigation, so nothing has to be resumed in the morning.",
        "Run /compact at the end of each day, so the conversation is small enough to find among the other sessions.",
        "Give the investigation a session name and continue it each morning with --resume and that name."
      ],
      opt: [
        "Colar o transcript inteiro do dia anterior numa sessão nova toda manhã, para nada da investigação se perder.",
        "Deixar uma sessão aberta durante a noite para cada investigação, para nada precisar ser retomado de manhã.",
        "Rodar /compact no fim de cada dia, para a conversa ficar pequena o bastante para ser achada entre as outras.",
        "Dar um nome à sessão da investigação e continuá-la toda manhã com --resume e esse nome."
      ],
      a: [3],
      e: "Sessão nomeada + <code>--resume &lt;nome&gt;</code> é o mecanismo do guia para continuar uma investigação específica ao longo de vários dias. A recarrega tudo à mão, inclusive tool results velhos, e incha o contexto. B depende de nunca fechar nada: frágil, e não resolve as várias sessões em paralelo. C reduz o contexto, mas não identifica a conversa certa."
    },
    {
      id: "DP3", s: "DP", d: 2, t: "2.5",
      q: "To change a single constant in a 3,000-line configuration module, the agent reads the file and writes the whole file back. Twice this week the rewritten file lost unrelated lines. What should the agent use for changes like this?",
      qpt: "Para mudar uma única constante num módulo de configuração de 3.000 linhas, o agente lê o arquivo e escreve o arquivo inteiro de volta. Duas vezes nesta semana o arquivo reescrito perdeu linhas sem relação com a mudança. O que o agente deve usar em mudanças assim?",
      o: [
        "Bash with sed, so the change is applied by a regular expression to every matching line in the file.",
        "Edit, anchored on a piece of text that appears only once in the file, so only the targeted lines are replaced.",
        "Write again, but split the module into smaller files first, so that each full rewrite is shorter.",
        "Read the file twice before writing, so the agent can double-check that every line is reproduced."
      ],
      opt: [
        "Bash com sed, para a mudança ser aplicada por expressão regular a toda linha que casar no arquivo.",
        "Edit, ancorado num trecho de texto que aparece uma única vez no arquivo, para só as linhas-alvo serem substituídas.",
        "Write de novo, mas antes dividir o módulo em arquivos menores, para cada reescrita completa ser mais curta.",
        "Ler o arquivo duas vezes antes de escrever, para o agente conferir que toda linha foi reproduzida."
      ],
      a: [1],
      e: "Edit é a tool de modificação pontual: substitui só o trecho ancorado num texto único, sem reescrever o resto. Read + Write é o <em>fallback</em> para quando não existe âncora única — aqui ela existe, e reescrever 3.000 linhas para mudar uma constante é onde o conteúdo se perde. A troca uma edição precisa por uma regex que pode casar linhas demais. C reorganiza o código só para contornar a tool errada. D acrescenta custo sem eliminar o risco da reescrita completa."
    },
    {
      id: "DP4", s: "DP", d: 5, t: "5.4",
      q: "Before a refactor, the main agent needs three answers about a 5,000-file monorepo: where feature flags are read, which services call the billing API, and which tests cover checkout. Last time, doing this exploration in the main conversation filled its context. What should it do?",
      qpt: "Antes de uma refatoração, o agente principal precisa de três respostas sobre um monorepo de 5.000 arquivos: onde as feature flags são lidas, quais serviços chamam a API de billing e quais testes cobrem o checkout. Da última vez, fazer essa exploração na conversa principal encheu o contexto. O que ele deve fazer?",
      o: [
        "Answer all three questions in the main conversation, running /compact after each one to free space.",
        "Spawn a subagent per question, each returning a concise summary, while the main agent coordinates.",
        "Move the main agent to a larger context window, so that all of the exploration output fits this time.",
        "Read the whole monorepo once at the start, so that all three questions are answered from memory."
      ],
      opt: [
        "Responder as três perguntas na conversa principal, rodando /compact depois de cada uma para liberar espaço.",
        "Spawnar um subagent por pergunta, cada um devolvendo um resumo conciso, enquanto o agente principal coordena.",
        "Passar o agente principal para uma janela de contexto maior, para toda a saída da exploração caber desta vez.",
        "Ler o monorepo inteiro uma vez no início, para responder às três perguntas de memória."
      ],
      a: [1],
      e: "Delegar perguntas específicas a subagents isola a saída verbosa da exploração: cada um devolve um resumo, e o agente principal guarda o entendimento de alto nível. A ajuda a liberar espaço, mas o principal ainda processa toda a saída verbosa — /compact é complemento, não a estratégia. C adia o problema e dilui a atenção. D é o anti-padrão de ler tudo de antemão."
    },
    {
      id: "DP5", s: "DP", d: 2, t: "2.2",
      q: "An MCP tool, find_references, returns an empty list both when a symbol truly has no references and when the code index is still being rebuilt. During rebuilds, the agent tells engineers that functions are unused and safe to delete. What should change?",
      qpt: "Uma MCP tool, find_references, devolve lista vazia tanto quando um símbolo realmente não tem referências quanto quando o índice de código ainda está sendo reconstruído. Durante as reconstruções, o agente diz aos engenheiros que funções não são usadas e podem ser apagadas. O que deve mudar?",
      o: [
        "Return a structured, retryable error while the index rebuilds, distinct from an empty list of real results.",
        "Tell the agent in its system prompt that an empty list sometimes means that the index is still rebuilding.",
        "Have the agent call find_references three times and trust the result only when all three calls agree.",
        "Return a placeholder reference during rebuilds, so the agent never concludes that a function is unused."
      ],
      opt: [
        "Devolver um erro estruturado e retryable enquanto o índice é reconstruído, distinto de uma lista vazia de resultados reais.",
        "Avisar o agente no system prompt que lista vazia às vezes significa que o índice ainda está sendo reconstruído.",
        "Fazer o agente chamar find_references três vezes e confiar no resultado só quando as três concordarem.",
        "Devolver uma referência fictícia durante a reconstrução, para o agente nunca concluir que uma função não é usada."
      ],
      a: [0],
      e: "Falha de acesso (índice indisponível) e resultado vazio válido são coisas diferentes; devolver as duas como lista vazia esconde a falha e leva a decisões erradas (“pode apagar”). Um erro estruturado, transitório e retryable, separado do vazio legítimo, deixa o agente esperar, tentar de novo ou avisar. B joga no modelo uma ambiguidade que a interface deveria resolver. C repete chamadas que, durante a reconstrução, devolvem o mesmo vazio. D fabrica um dado falso para mascarar o problema."
    },
    // ------------------------------------------------------------------ Ampliação 2026-10-22 (objetivos oficiais do score report)
    {
      id: "CS6", s: "CS", d: 1, t: "1.1",
      q: "In one response the model requests get_customer, lookup_order for order #5120, and lookup_order for order #5133. The order service times out on #5133; your tool wrapper catches the exception and returns an empty list as that call's tool_result. The agent then tells the customer that order #5133 does not exist. What should the loop send back for the failed call?",
      qpt: "Numa única resposta, o modelo pede get_customer, lookup_order do pedido #5120 e lookup_order do pedido #5133. O serviço de pedidos estoura o timeout no #5133; o wrapper da tool captura a exceção e devolve uma lista vazia como tool_result dessa chamada. O agente então diz ao cliente que o pedido #5133 não existe. O que o loop deve devolver para a chamada que falhou?",
      o: [
        "An empty list, as now, plus a system prompt rule telling the agent never to say that an order does not exist.",
        "No result for #5133 until a background retry succeeds, holding back the other two results until then.",
        "A tool_result marked is_error, with the reason and whether a retry may help, sent with the other two.",
        "Nothing: remove the #5133 tool_use block from the history, so that the model asks for that order again later."
      ],
      opt: [
        "Uma lista vazia, como hoje, mais uma regra no system prompt para o agente nunca dizer que um pedido não existe.",
        "Nenhum resultado para o #5133 até um retry em segundo plano dar certo, segurando os outros dois até lá.",
        "Um tool_result marcado com is_error, com o motivo e se vale tentar de novo, enviado junto com os outros dois.",
        "Nada: remover do histórico o bloco tool_use do #5133, para o modelo pedir esse pedido de novo depois."
      ],
      a: [2],
      e: "Falha não pode parecer sucesso: a lista vazia diz ao modelo “consultei e não há nada”, e ele conclui que o pedido não existe. O <code>tool_result</code> da chamada que falhou vai com <code>is_error: true</code> e o motivo (timeout, se vale tentar de novo), junto com os outros dois resultados na mesma mensagem <code>user</code> — cada <code>tool_use</code> precisa do seu <code>tool_result</code>. A ataca o sintoma com instrução e mantém o dado enganoso. B deixa o loop parado esperando um serviço instável, sem informar nada ao modelo. D apaga do histórico o que o modelo pediu: ele perde a informação de que a consulta falhou e pode repetir o pedido sem fim ou responder sem ele."
    },
    {
      id: "CS7", s: "CS", d: 5, t: "5.1",
      q: "Each lookup_order result carries about 40 fields per order (warehouse codes, carrier scan events, internal flags), and every result stays in the conversation. When a customer asks about several orders, answers degrade after the sixth or seventh lookup, and the agent starts mixing up return windows between orders. Support needs only order ID, status, total, purchase date and return window. What should change?",
      qpt: "Cada resultado de lookup_order traz cerca de 40 campos por pedido (códigos de armazém, eventos de rastreio da transportadora, flags internas), e todos os resultados ficam na conversa. Quando o cliente pergunta sobre vários pedidos, as respostas pioram depois do sexto ou sétimo lookup, e o agente começa a misturar prazos de devolução entre pedidos. O suporte só precisa de ID, status, total, data da compra e prazo de devolução. O que deve mudar?",
      o: [
        "Keep in context only the support-relevant fields of each lookup result, and drop the rest of the raw payload.",
        "Summarize the whole conversation in prose after every lookup, replacing all earlier turns with that summary.",
        "Move to a model with a larger context window, so that all forty fields of every order fit with room to spare.",
        "Ask customers to discuss one order per conversation, and open a fresh session for each additional order."
      ],
      opt: [
        "Manter no contexto só os campos de cada resultado que importam ao suporte e descartar o resto do payload bruto.",
        "Resumir a conversa inteira em prosa depois de cada lookup, trocando todos os turnos anteriores pelo resumo.",
        "Usar um modelo com janela de contexto maior, para os quarenta campos de cada pedido caberem com folga.",
        "Pedir ao cliente um pedido por conversa e abrir uma sessão nova para cada pedido adicional."
      ],
      a: [0],
      e: "Retenção seletiva: resultado de tool verboso é o primeiro candidato a sair do contexto. Guardar só os campos que o suporte usa (ID, status, total, data, prazo de devolução) mantém o necessário e tira o ruído que dilui a atenção e mistura os pedidos. B troca dado exato por prosa — prazos e valores viram aproximação a cada resumo. C adia o problema: o ruído continua lá, só cabe mais dele. D transfere ao cliente um limite do sistema e piora a resolução no primeiro contato."
    },
    {
      id: "CS8", s: "CS", d: 2, t: "2.1",
      q: "lookup_order is described as “Looks up an order.” About 15% of its calls fail with “order not found”: the agent passes the customer's email, or the order number exactly as typed (“#51-20”), while the tool accepts only the 8-digit order ID with no prefix. What is the most effective first fix?",
      qpt: "A lookup_order está descrita como “Looks up an order.” Cerca de 15% das chamadas falham com “order not found”: o agente passa o e-mail do cliente, ou o número do pedido do jeito que ele digitou (“#51-20”), enquanto a tool só aceita o ID de 8 dígitos, sem prefixo. Qual é a primeira correção mais eficaz?",
      o: [
        "Retry each failed lookup up to three times, so that the agent can try other formats until one of them works.",
        "Add a system prompt rule telling the agent to ask customers to retype order numbers in the correct format.",
        "Merge lookup_order and get_customer into one lookup tool that accepts any identifier the customer gives.",
        "Expand the description with the accepted input format, an example, and that emails go to get_customer first."
      ],
      opt: [
        "Repetir cada lookup que falhou até três vezes, para o agente testar outros formatos até um funcionar.",
        "Acrescentar ao system prompt uma regra para o agente pedir ao cliente que redigite o número no formato certo.",
        "Juntar lookup_order e get_customer numa tool de busca que aceite qualquer identificador que o cliente der.",
        "Ampliar a description com o formato de entrada aceito, um exemplo e a indicação de que e-mail vai antes para get_customer."
      ],
      a: [3],
      e: "A description é o contrato que o modelo lê para montar a chamada, e “Looks up an order” não diz o formato aceito. Dizer que a entrada é o ID de 8 dígitos sem prefixo, dar um exemplo e apontar que e-mail se resolve antes com get_customer ataca a causa com a correção mais barata. A gasta chamadas em tentativa e erro. B joga para o cliente uma formatação que o agente faz sozinho. C cria uma tool genérica e ambígua, o oposto de tools com propósito e contrato de entrada definidos."
    },
    {
      id: "CS9", s: "CS", d: 1, t: "1.5",
      q: "A PostToolUse hook converts every date in tool results to ISO 8601 before the model sees them. It is registered with the matcher “mcp__backend__get_customer|mcp__backend__lookup_order”. Last month the team added get_return_status from a separate returns server, which reports dates as “DD/MM”. Return-window mistakes are back, but only in conversations about returns. What should the team change?",
      qpt: "Um hook PostToolUse converte toda data dos resultados de tools para ISO 8601 antes de o modelo vê-las. Ele está registrado com o matcher “mcp__backend__get_customer|mcp__backend__lookup_order”. No mês passado o time acrescentou get_return_status, de um server de devoluções separado, que informa datas como “DD/MM”. Os erros de prazo de devolução voltaram, mas só em conversas sobre devoluções. O que o time deve mudar?",
      o: [
        "Add a prompt note that explains the DD/MM format the returns tool uses, alongside the existing hook.",
        "Add the returns tool to the hook's matcher, or match every MCP tool, so its results are converted too.",
        "Move the conversion into a PreToolUse hook, so that dates are normalized before each tool call is made.",
        "Ask the returns team to switch their API to ISO dates, and keep the current hook as it is until then."
      ],
      opt: [
        "Acrescentar ao prompt uma nota explicando o formato DD/MM da tool de devoluções, junto do hook atual.",
        "Incluir a tool de devoluções no matcher do hook, ou casar todas as MCP tools, para os resultados dela também serem convertidos.",
        "Levar a conversão para um hook PreToolUse, para as datas serem normalizadas antes de cada chamada.",
        "Pedir ao time de devoluções que mude a API para datas ISO e manter o hook como está até lá."
      ],
      a: [1],
      e: "O hook só roda para as tools que o matcher casa — e o matcher é comparado com o nome da tool. Com <code>mcp__backend__get_customer|mcp__backend__lookup_order</code>, o resultado da tool nova (<code>mcp__returns__get_return_status</code>) chega cru ao modelo. Incluí-la no matcher, ou usar <code>^mcp__</code> para todas as MCP tools, estende a normalização determinística ao formato novo. A volta à aposta probabilística que o hook substituiu. C erra a fase: o PreToolUse roda antes da chamada, quando ainda não há resultado para converter. D ataca a origem, mas os erros continuam enquanto a migração não chega."
    },
    {
      id: "CS10", s: "CS", d: 5, t: "5.2",
      q: "A customer named Ana Souza asks for a refund of a duplicate charge. get_customer returns three accounts with that name, two of them in the same city. The agent picked the account whose billing city matched the customer's IP location and refunded it, but the duplicate charge was on another account. How should the agent handle multiple matches?",
      qpt: "Uma cliente chamada Ana Souza pede o reembolso de uma cobrança duplicada. O get_customer devolve três contas com esse nome, duas delas na mesma cidade. O agente escolheu a conta cuja cidade de cobrança batia com a localização do IP do cliente e fez o reembolso, mas a cobrança duplicada estava em outra conta. Como o agente deve tratar várias correspondências?",
      o: [
        "Keep matching by IP location, as now, but also log which account was chosen and the reason for it.",
        "Escalate every case with more than one match to a human agent, since only a person can resolve identity.",
        "Ask the customer for another identifier, such as the email or an order number, before taking any action.",
        "Refund the charge on all three accounts, then reverse the extra refunds once the right account is known."
      ],
      opt: [
        "Continuar casando pela localização do IP, como hoje, mas registrar qual conta foi escolhida e o motivo.",
        "Escalar para um humano todo caso com mais de uma correspondência, já que só uma pessoa resolve identidade.",
        "Pedir ao cliente outro identificador, como o e-mail ou um número de pedido, antes de qualquer ação.",
        "Reembolsar a cobrança nas três contas e estornar os reembolsos extras quando a conta certa for conhecida."
      ],
      a: [2],
      e: "Com várias correspondências, escolher por heurística é chutar a identidade — por isso o reembolso caiu na conta errada, e registrar a escolha (A) não muda isso. O certo é pedir um identificador adicional (e-mail, número do pedido) e só agir depois de saber qual é a conta. B escala o que o agente resolve com uma pergunta e derruba a resolução no primeiro contato. D mexe em contas de outras pessoas e cria um problema maior para desfazer."
    },
    {
      id: "MR6", s: "MR", d: 1, t: "1.2",
      q: "Reports must cover eight independent subtopics and be ready within 10 minutes. The current design is a sequential pipeline: the search subagent covers subtopic 1, then subtopic 2, and so on, and the synthesis subagent runs at the end. Runs take 35 minutes. Which structure best meets the coverage and latency requirements?",
      qpt: "Os relatórios precisam cobrir oito subtópicos independentes e ficar prontos em até 10 minutos. O desenho atual é um pipeline sequencial: o subagent de busca cobre o subtópico 1, depois o 2, e assim por diante, e o subagent de síntese roda no fim. Cada execução leva 35 minutos. Qual estrutura atende melhor os requisitos de cobertura e latência?",
      o: [
        "A single agent with every tool and a larger context window, so that it handles all eight subtopics in one session.",
        "Keep the pipeline but have the search subagent return shorter summaries, so that each sequential step runs faster.",
        "Run the eight searches and the synthesis all in parallel, so that every subagent starts at the same moment.",
        "The coordinator spawns one search subagent per subtopic in parallel, then passes all the results to synthesis."
      ],
      opt: [
        "Um único agente com todas as tools e uma janela de contexto maior, para tratar os oito subtópicos numa sessão só.",
        "Manter o pipeline, mas fazer o subagent de busca devolver resumos mais curtos, para cada passo sequencial rodar mais rápido.",
        "Rodar as oito buscas e a síntese todas em paralelo, para todos os subagents começarem no mesmo instante.",
        "O coordinator dispara um subagent de busca por subtópico em paralelo e depois passa todos os resultados para a síntese."
      ],
      a: [3],
      e: "Subtópicos independentes não precisam esperar uns pelos outros: o coordinator dispara as buscas em paralelo (várias chamadas de subagent na mesma resposta), e a latência passa a ser a da busca mais lenta, não a soma. A síntese depende de todos os resultados, então vem depois — é sequencial por necessidade. Regra geral: coordinator-worker em paralelo para o que é independente, pipeline sequencial para o que depende do passo anterior. C ignora essa dependência: a síntese começaria sem dados. A perde o isolamento de contexto e a cobertura de oito frentes. B mexe no tamanho da saída, não na causa da latência, que é a execução em série."
    },
    {
      id: "MR7", s: "MR", d: 1, t: "1.3",
      q: "After a refactor moved the coordinator's query options into a shared config module, research runs stop delegating entirely: the coordinator writes every report from its own knowledge, with no citations, and the logs show zero subagent invocations. The four AgentDefinitions, their descriptions and the agents option were copied over unchanged. What is the most likely cause?",
      qpt: "Depois de um refactor que levou as opções da query do coordinator para um módulo de config compartilhado, os runs de pesquisa param de delegar por completo: o coordinator escreve todo relatório com o próprio conhecimento, sem citações, e os logs mostram zero invocações de subagents. As quatro AgentDefinitions, suas descriptions e a opção agents foram copiadas sem mudança. Qual é a causa mais provável?",
      o: [
        "The new config's allowedTools lacks the Task tool, so the coordinator can no longer spawn subagents.",
        "The subagent definitions omit the tools field, so each one starts with no tools and declines the work.",
        "The config text now fills the coordinator's context, so it no longer has room left to emit tool calls.",
        "The subagents' prompts are too long, so the SDK silently drops them from the agents list at startup."
      ],
      opt: [
        "A lista allowedTools da config nova não inclui mais a tool Task, então nenhum subagent pode ser criado.",
        "As definições dos subagents omitem o campo tools, então cada um começa sem tools e recusa o trabalho.",
        "O texto da config agora enche o contexto do coordinator, que fica sem espaço para emitir tool calls.",
        "Os prompts dos subagents são longos demais, e o SDK os descarta calado da lista agents ao iniciar."
      ],
      a: [0],
      e: "Sintoma: nenhuma delegação, para nenhum subagent, com definições e registro intactos. O que falta para todos ao mesmo tempo é a permissão de spawn: sem a tool de criar subagents no <code>allowedTools</code> do coordinator (Task no guia), ele não invoca ninguém e faz o trabalho sozinho. B parte de premissa falsa: sem <code>tools</code>, o subagent herda as tools disponíveis — e haveria invocações no log de qualquer jeito. C e D não são mecanismos reais: config não ocupa o contexto do modelo, e o SDK não descarta definições pelo tamanho do prompt. 🧭 Produto atual: a tool se chama Agent (Task segue como alias), e <code>allowedTools</code> só pré-aprova; quem tira tools é <code>tools</code>/<code>disallowedTools</code>. Na prova, vale o guia."
    },
    {
      id: "MR8", s: "MR", d: 1, t: "1.3",
      q: "Traces show the coordinator correctly sending the collected findings to the synthesizer subagent. Yet the synthesizer returns one separate analysis per source instead of a combined synthesis — the same kind of output the document analyzer produces. The synthesizer's AgentDefinition was created by copying the document analyzer's and then changing its name and description. What should the team fix?",
      qpt: "Os traces mostram o coordinator mandando corretamente os achados coletados para o subagent synthesizer. Mesmo assim, o synthesizer devolve uma análise separada por fonte em vez de uma síntese combinada — o mesmo tipo de saída do analisador de documentos. A AgentDefinition do synthesizer foi criada copiando a do analisador de documentos e trocando o nome e a description. O que o time deve corrigir?",
      o: [
        "Rewrite the synthesizer's description, so that the coordinator understands it should send the findings there.",
        "Rewrite the synthesizer's prompt field to define its synthesis role and its output, since it runs on that.",
        "Give the synthesizer the document-reading tools too, so it can analyze each source in depth first.",
        "Add step-by-step synthesis instructions to every delegation message the coordinator sends to the synthesizer."
      ],
      opt: [
        "Reescrever a description do synthesizer, para o coordinator entender que deve mandar os achados para ele.",
        "Reescrever o campo prompt do synthesizer definindo o papel de síntese e a saída, porque é com ele que o subagent roda.",
        "Dar também ao synthesizer as tools de leitura de documentos, para ele analisar cada fonte mais a fundo antes.",
        "Acrescentar instruções passo a passo de síntese em toda mensagem de delegação que o coordinator manda ao synthesizer."
      ],
      a: [1],
      e: "A <code>description</code> serve para o coordinator escolher o subagent — e a escolha já está certa, como mostram os traces. O comportamento do subagent vem do <code>prompt</code> da AgentDefinition (o system prompt dele): copiado do analisador, faz o papel do analisador. Corrigir esse campo ataca a causa. A mexe no que já funciona. C reforça o papel errado. D remenda em cada chamada um defeito da definição e troca objetivo por procedimento no prompt de delegação."
    },
    {
      id: "MR9", s: "MR", d: 2, t: "2.3",
      q: "The synthesis subagent's AgentDefinition has a description and a prompt but no tools field. Traces show it running web searches during synthesis and overwriting the shared findings file, which breaks the citations. What should the team change?",
      qpt: "A AgentDefinition do subagent de síntese tem description e prompt, mas não tem o campo tools. Os traces mostram que ele faz buscas na web durante a síntese e sobrescreve o arquivo compartilhado de achados, o que quebra as citações. O que o time deve mudar?",
      o: [
        "Add a line to the synthesis prompt telling it to use only the findings it receives and never to search the web.",
        "Remove the web search tool from the coordinator, so that no subagent is able to inherit it from the parent.",
        "Set the tools field to only what synthesis needs, since omitting it gives the subagent every available tool.",
        "Run the synthesis subagent in its own process with a private copy of the findings file for every request."
      ],
      opt: [
        "Acrescentar ao prompt da síntese uma linha mandando usar só os achados recebidos e nunca buscar na web.",
        "Tirar a tool de busca web do coordinator, para nenhum subagent conseguir herdá-la do agente pai.",
        "Preencher o campo tools só com o que a síntese precisa, já que omiti-lo dá ao subagent todas as tools disponíveis.",
        "Rodar o subagent de síntese num processo próprio, com uma cópia privada do arquivo de achados a cada request."
      ],
      a: [2],
      e: "Sem o campo <code>tools</code>, a AgentDefinition herda as tools disponíveis para subagents — inclusive busca e escrita de arquivo. Listar só o que a síntese precisa tira o comportamento pela raiz. A é prompt contra uma capacidade que continua lá. B quebra o fluxo de quem precisa buscar e não define o conjunto da síntese. D isola o arquivo, mas a síntese continua trazendo fontes novas, sem citação controlada."
    },
    {
      id: "MR10", s: "MR", d: 5, t: "5.3",
      q: "During a run on battery recycling, the patents subagent returns a structured error: the patent database was unavailable for the whole run, even after retries. The coordinator continues, and the final report covers chemistry, logistics and policy but says nothing about patents. Readers conclude that no relevant patents exist. What should change?",
      qpt: "Num run sobre reciclagem de baterias, o subagent de patentes devolve um erro estruturado: a base de patentes ficou indisponível durante todo o run, mesmo depois dos retries. O coordinator segue, e o relatório final cobre química, logística e regulação, mas não diz nada sobre patentes. Os leitores concluem que não existem patentes relevantes. O que deve mudar?",
      o: [
        "Stop the whole run whenever any subagent fails, and return only an error message to the user who asked.",
        "Have the synthesis subagent fill the patent section from the model's own knowledge when sources fail.",
        "Retry the patents subagent until the database recovers, holding the report back for as long as it takes.",
        "Have the report annotate its coverage: which sections are well supported and which have gaps, and why."
      ],
      opt: [
        "Interromper o run inteiro sempre que um subagent falhar e devolver só uma mensagem de erro a quem pediu.",
        "Fazer o subagent de síntese preencher a seção de patentes com o conhecimento do próprio modelo quando as fontes falham.",
        "Repetir o subagent de patentes até a base voltar, segurando o relatório pelo tempo que for preciso.",
        "Fazer o relatório anotar a cobertura: que seções estão bem sustentadas e quais têm lacunas, e por quê."
      ],
      a: [3],
      e: "O erro foi propagado direito; o defeito está na síntese, que transformou ausência de dados em silêncio. O relatório deve trazer anotações de cobertura: o que está bem sustentado e que área ficou sem fonte, e por quê (a base de patentes fora do ar). Assim o leitor não confunde “não pesquisado” com “não existe”. A joga fora o trabalho dos outros subagents por uma falha parcial. B inventa conteúdo sem fonte num relatório com citações. C troca a entrega por uma espera sem prazo."
    },
    {
      id: "CI6", s: "CI", d: 3, t: "3.6",
      q: "A test-generation job runs claude -p inside a throwaway container with no network access and no credentials, destroyed after every run. It must run many build and test commands that the team cannot list in advance, and in -p anything that needs approval would be refused and the build would fail. Which permission mode fits this environment?",
      qpt: "Um job de geração de testes roda claude -p dentro de um container descartável, sem acesso à rede e sem credenciais, destruído depois de cada execução. Ele precisa rodar muitos comandos de build e teste que o time não consegue listar de antemão, e, no -p, tudo o que precisasse de aprovação seria recusado e o build falharia. Qual permission mode serve para esse ambiente?",
      o: [
        "default, since -p answers every approval request automatically when no one is there to respond.",
        "bypassPermissions, fine here because the container is isolated, offline, secret-free and disposable.",
        "plan, so that Claude runs the build and test commands freely while every file edit is held back.",
        "dontAsk with no allow rules, so that every command Claude decides to run goes through without asking."
      ],
      opt: [
        "default, porque o -p responde sozinho a todo pedido de aprovação quando não há ninguém para responder.",
        "bypassPermissions, aceitável aqui porque o container é isolado, sem rede, sem segredos e descartável.",
        "plan, para o Claude rodar à vontade os comandos de build e teste enquanto toda edição fica retida.",
        "dontAsk sem regras allow, para todo comando que o Claude decidir rodar passar sem perguntar."
      ],
      a: [1],
      e: "<code>bypassPermissions</code> pula as checagens de permissão, e a documentação o reserva exatamente para este caso: container ou VM isolados, sem internet e sem credenciais, onde o pior resultado fica contido e é descartado. É o caso oposto ao do runner compartilhado com segredos, em que o certo é <code>dontAsk</code> com o necessário pré-aprovado. A: no <code>-p</code>, o que precisaria de aprovação é recusado, e o build falha. C: o plan mode só explora e propõe, sem editar — e o job precisa escrever os testes. D descreve o contrário do <code>dontAsk</code>: ele <strong>nega</strong> o que pediria permissão, então sem regras allow os comandos de build seriam recusados."
    },
    {
      id: "CI7", s: "CI", d: 3, t: "3.6",
      q: "A documentation job runs claude -p with --max-turns 8. It rarely loops, but each turn reads very large files, and one run last week cost $40 in only six turns. The team wants a spend cap on every single run. What should they add?",
      qpt: "Um job de documentação roda claude -p com --max-turns 8. Ele quase nunca entra em loop, mas cada turno lê arquivos muito grandes, e um run da semana passada custou US$ 40 em só seis turnos. O time quer um teto de gasto para cada run. O que deve acrescentar?",
      o: [
        "--max-budget-usd, which stops the run once its estimated API spend reaches the amount you set.",
        "A lower --max-turns, such as 3, since cutting turns always cuts the run's cost in proportion.",
        "A shell timeout of ten minutes around the command, so that long and costly runs get killed.",
        "--output-format json, so that the job reads the run's cost from the output and fails if too high."
      ],
      opt: [
        "--max-budget-usd, que encerra o run quando o gasto estimado de API chega ao valor definido.",
        "Um --max-turns menor, como 3, porque cortar turnos sempre corta o custo do run na mesma proporção.",
        "Um timeout de shell de dez minutos em volta do comando, para matar runs longos e caros.",
        "--output-format json, para o job ler o custo do run na saída e falhar se ele passar do limite."
      ],
      a: [0],
      e: "<code>--max-turns</code> limita turnos, não gasto — e aqui o custo vem de poucos turnos caros. Quem trava o gasto é <code>--max-budget-usd</code>, que encerra o run quando o custo estimado atinge o valor (só no modo <code>-p</code>). O teto não é exato: o gasto pode passar dele em até o custo de uma resposta, mais o de subagents em andamento — deixe folga. Os dois limites se combinam: turnos contra loop, orçamento contra custo. B parte de premissa falsa: o custo por turno varia muito. C limita tempo, e um turno caro pode ser rápido. D só descobre o gasto depois que ele aconteceu."
    },
    {
      id: "CI8", s: "CI", d: 3, t: "3.6",
      q: "A review job runs claude -p --tools \"Read,Grep,Glob\" so that it cannot change the checkout. The project's .mcp.json also loads a GitHub server, and the job's settings pre-approve all of its tools so the reviewer can post comments. In one run, the reviewer merged the pull request it was reviewing. What closes this gap?",
      qpt: "Um job de review roda claude -p --tools \"Read,Grep,Glob\" para não poder alterar o checkout. O .mcp.json do projeto também carrega um server do GitHub, e o settings do job pré-aprova todas as tools dele para o revisor poder postar comentários. Numa execução, o revisor fez o merge do pull request que estava revisando. O que fecha essa brecha?",
      o: [
        "A CLAUDE.md line forbidding merges, since --tools already limits every tool that the session can call.",
        "--permission-mode acceptEdits, so that file edits are approved and anything else, like a merge, is refused.",
        "Deny the server's merge and push tools with --disallowedTools; --tools covers built-in tools only.",
        "Replace --tools with --allowedTools \"Read,Grep,Glob\", so that only the tools listed there can run."
      ],
      opt: [
        "Uma linha no CLAUDE.md proibindo merge, já que o --tools limita todas as tools que a sessão pode chamar.",
        "--permission-mode acceptEdits, para edições de arquivo serem aprovadas e todo o resto, como merge, ser recusado.",
        "Negar as tools de merge e push do server com --disallowedTools; o --tools só cobre as tools nativas.",
        "Trocar --tools por --allowedTools \"Read,Grep,Glob\", para só as tools listadas ali poderem rodar."
      ],
      a: [2],
      e: "<code>--tools</code> restringe as tools <strong>nativas</strong> (Read, Edit, Bash…); tools de MCP server ficam fora dessa lista e continuam disponíveis — e aqui ainda estavam pré-aprovadas. A correção é negar as tools perigosas do server (por exemplo <code>mcp__github__merge_pull_request</code>) com <code>--disallowedTools</code>, mantendo a de comentar, ou não carregar o server nesse job. A parte de premissa falsa e é só instrução. B não recusa nada: <code>acceptEdits</code> aprova edições e não bloqueia as tools já pré-aprovadas. D piora: <code>--allowedTools</code> só pré-aprova, não restringe."
    },
    {
      id: "CI9", s: "CI", d: 4, t: "4.6",
      q: "Last month the team split its CI review into three passes — security, business logic and API design — but all three prompts still share the same block of eight few-shot examples, six of them about security. The API design pass now reports mostly security issues and still misses most of the API problems that reviewers catch by hand. What should change?",
      qpt: "No mês passado o time dividiu o review de CI em três passes — segurança, lógica de negócio e design de API —, mas os três prompts ainda compartilham o mesmo bloco de oito exemplos few-shot, seis deles sobre segurança. O passe de design de API agora reporta sobretudo problemas de segurança e continua perdendo a maioria dos problemas de API que os revisores pegam à mão. O que deve mudar?",
      o: [
        "Merge the three passes back into one prompt, since separate passes are only repeating each other's work.",
        "Add a final step that discards findings whose category does not match the pass that reported them.",
        "Run the API design pass on a larger model, keeping the same shared block of examples in all three passes.",
        "Give each pass its own few-shot examples for its concern only, instead of the shared mixed example block."
      ],
      opt: [
        "Juntar os três passes de novo num prompt só, já que passes separados só repetem o trabalho um do outro.",
        "Acrescentar um passo final que descarta findings cuja categoria não bate com o passe que os reportou.",
        "Rodar o passe de design de API num modelo maior, mantendo o mesmo bloco de exemplos nos três passes.",
        "Dar a cada passe exemplos few-shot só do próprio concern, no lugar do bloco misto compartilhado."
      ],
      a: [3],
      e: "Separar por concern só funciona com exemplos <strong>dedicados</strong>: o few-shot ensina o que procurar, e um bloco dominado por segurança puxa todos os passes para segurança. Cada passe precisa de prompt focado e exemplos do próprio concern; depois os findings são juntados. A volta ao prompt único, onde os concerns competem pelo recall. B limpa a saída, mas não faz o passe achar os problemas de API que ele não vê. C mantém a causa — os exemplos errados — e só aumenta o custo."
    },
    {
      id: "CI10", s: "CI", d: 4, t: "4.1",
      q: "The team wrote in CLAUDE.md that raw SQL is accepted, meaning the hand-tuned queries in reporting/. Since then the CI reviewer no longer flags raw SQL anywhere, including string-built queries in api/ that a penetration test later exploited. What is the best fix?",
      qpt: "O time escreveu no CLAUDE.md que SQL cru é aceito, pensando nas queries otimizadas à mão em reporting/. Desde então o reviewer de CI não aponta mais SQL cru em lugar nenhum, inclusive queries montadas com concatenação de strings em api/ que um pentest depois explorou. Qual é a melhor correção?",
      o: [
        "Remove the sentence from CLAUDE.md, accepting that the reporting queries get flagged on every PR again.",
        "Rewrite it to name reporting/ and the reason, and state that raw SQL elsewhere must still be reported.",
        "Have the reviewer give each finding a confidence score, and post SQL findings only above 0.8 confidence.",
        "Add a separate security-only review job for api/, leaving the CLAUDE.md sentence exactly as it is now."
      ],
      opt: [
        "Tirar a frase do CLAUDE.md, aceitando que as queries de reporting voltem a ser apontadas em todo PR.",
        "Reescrevê-la nomeando reporting/ e o motivo, e dizendo que SQL cru fora dali continua sendo reportado.",
        "Fazer o reviewer dar uma confiança a cada finding e postar os de SQL só acima de 0.8.",
        "Criar um job de review só de segurança para api/, mantendo a frase do CLAUDE.md exatamente como está."
      ],
      a: [1],
      e: "Critério de exclusão precisa ser explícito sobre o <strong>alcance</strong> e o motivo: “SQL cru é aceito”, sem caminho, virou licença geral, e o reviewer passou a silenciar um risco real. Nomear <code>reporting/</code>, dizer por que ali é aceito e que fora dali continua sendo finding mantém o contexto persistente útil nos dois sentidos — sem falso positivo em reporting/ e sem falso negativo em api/. A troca um erro pelo outro: os falsos positivos voltam. C: autoconfiança não calibrada não separa os dois casos. D cobre só api/ e deixa o critério errado valendo para o resto do repositório."
    },
    {
      id: "EX6", s: "EX", d: 4, t: "4.3",
      q: "To stop truncated output, contract extraction now makes one call per 20-page range with the same schema and merges the item lists in code. Line items that start on page 20 and continue on page 21 now show up twice, or as two partial items, in the merged result. What is the best fix?",
      qpt: "Para acabar com a saída truncada, a extração de contratos agora faz uma chamada por faixa de 20 páginas, com o mesmo schema, e junta as listas de itens no código. Itens que começam na página 20 e continuam na 21 agora aparecem duas vezes, ou como dois itens parciais, no resultado juntado. Qual é a melhor correção?",
      o: [
        "Go back to a single call for the whole contract, with max_tokens raised to the model's maximum.",
        "Tell the model in each call to skip any item that seems to continue onto the next page range.",
        "Overlap the ranges by one page and dedupe in code by item number, keeping the fullest version.",
        "Send all partial outputs to one more call that rewrites them as a single list in free-form text."
      ],
      opt: [
        "Voltar a uma chamada única para o contrato inteiro, com max_tokens no máximo do modelo.",
        "Instruir o modelo, em cada chamada, a pular qualquer item que pareça continuar na faixa seguinte.",
        "Sobrepor as faixas em uma página e deduplicar no código pelo número do item, ficando com a versão mais completa.",
        "Mandar todas as saídas parciais para mais uma chamada que as reescreve como uma lista única em texto livre."
      ],
      a: [2],
      e: "Dividir e juntar é o caminho certo; o defeito está na junção. Faixas com sobreposição garantem que todo item apareça inteiro em pelo menos uma chamada, e a deduplicação em código por chave estável (número do item) fica com a versão completa. A volta ao problema original: <code>max_tokens</code> tem teto prático, e o truncamento retorna no contrato maior. B perde de vez os itens da fronteira. D troca dado estruturado por texto livre e põe o modelo para fazer um merge que o código faz de forma determinística."
    },
    {
      id: "EX7", s: "EX", d: 4, t: "4.3",
      q: "The extractor prefills the assistant turn with “{” and gets valid JSON almost every time. But about 2% of records still miss a required field or put text in a numeric field, and the database loader rejects them. What should the team change?",
      qpt: "O extrator faz prefill do turno do assistant com “{” e recebe JSON válido quase sempre. Mas cerca de 2% dos registros ainda vêm sem um campo obrigatório ou com texto num campo numérico, e o loader do banco os rejeita. O que o time deve mudar?",
      o: [
        "Define the record as a tool's input schema and set strict on that tool, so that its inputs must match.",
        "Keep the prefill and add a strict system prompt instruction listing every required field and its type.",
        "Prefill a longer opening, such as the first two keys, so that the model completes the remaining fields.",
        "Lower the temperature to 0, so that the prefilled response follows the expected format more strictly."
      ],
      opt: [
        "Definir o registro como input schema de uma tool e ligar strict nela, para os argumentos terem de seguir o schema.",
        "Manter o prefill e acrescentar no system prompt uma instrução rígida listando cada campo obrigatório e seu tipo.",
        "Fazer prefill de uma abertura maior, como as duas primeiras chaves, para o modelo completar o resto dos campos.",
        "Baixar a temperatura para 0, para a resposta com prefill seguir o formato esperado com mais rigor."
      ],
      a: [0],
      e: "Na escala de confiabilidade, o prefill garante o começo do JSON, não o schema; instrução no prompt (B) fica abaixo dele. Quando campo ausente ou de tipo errado quebra o consumidor, o método é tool use com JSON schema — e com <code>strict: true</code> os argumentos seguem o schema. C só fixa mais alguns caracteres do começo. D reduz variação, mas não impõe campos nem tipos. 🧭 Produto atual: prefill devolve 400 no Claude 4.6 em diante (e no Mythos Preview); lá o substituto é a saída estruturada (<code>output_config.format</code>). Na prova, vale a escala do objetivo."
    },
    {
      id: "EX8", s: "EX", d: 5, t: "5.5",
      q: "Field confidence is calibrated on a labeled set drawn from the 12 invoice layouts the company has always received, and fields below the threshold go to review. A new supplier now sends about 120 invoices a day in a layout absent from that set. Reviewers have 400 daily slots and use about 250 today. Spot checks find errors on the new layout even at high scores. What should the team do?",
      qpt: "A confiança por campo é calibrada num conjunto rotulado tirado dos 12 layouts de fatura que a empresa sempre recebeu, e campos abaixo do threshold vão para revisão. Um fornecedor novo agora manda cerca de 120 faturas por dia num layout que não está nesse conjunto. Os revisores têm 400 vagas por dia e usam cerca de 250 hoje. Checagens pontuais acham erros no layout novo mesmo com score alto. O que o time deve fazer?",
      o: [
        "Keep the current threshold for the new layout, since the scores were calibrated on a large labeled set.",
        "Route every new-layout invoice to review for now, and label those reviews to recalibrate the layout.",
        "Replace routing with a random 5% sample of all invoices, so that the new layout is covered without bias.",
        "Have the model rate its own certainty on new-layout invoices, and route those below 0.9 to review."
      ],
      opt: [
        "Manter o threshold atual para o layout novo, já que os scores foram calibrados num conjunto rotulado grande.",
        "Mandar por ora toda fatura do layout novo para revisão e usar essas revisões como rótulos para recalibrar o layout.",
        "Trocar o roteamento por uma amostra aleatória de 5% de todas as faturas, cobrindo o layout novo sem viés.",
        "Pedir ao modelo que avalie a própria certeza nas faturas do layout novo e mandar as abaixo de 0.9 para revisão."
      ],
      a: [1],
      e: "Calibração vale para a população em que foi feita: o layout novo está fora do conjunto rotulado, e os erros com score alto mostram que o threshold não se aplica a ele — por isso A falha. Característica do documento é critério de roteamento: enquanto não houver dados rotulados do layout, todas as faturas dele vão para revisão — 120 por dia cabem nas 150 vagas livres — e as revisadas viram rótulos para recalibrar. C troca roteamento por sorteio: amostra aleatória mede erro, não leva a revisão para onde ele está. D usa autoavaliação sem calibração — o mesmo problema de A, sem nem o conjunto rotulado."
    },
    {
      id: "EX9", s: "EX", d: 4, t: "4.4",
      q: "Validation rejects three kinds of extraction: (1) invoice_date in “03.11.2026” form where the schema requires YYYY-MM-DD; (2) contract_reference missing because the invoice never states one; (3) line items that don't sum to the total because a discount line was misread. Which of these should be retried with the validation error as feedback?",
      qpt: "A validação rejeita três tipos de extração: (1) invoice_date no formato “03.11.2026”, quando o schema exige AAAA-MM-DD; (2) contract_reference ausente porque a fatura não informa nenhum; (3) itens que não somam o total porque uma linha de desconto foi mal lida. Quais devem ir para retry com o erro de validação como feedback?",
      o: [
        "All three, since in each case the validation error tells the model exactly what it needs to fix.",
        "Only 1 and 3, since the data is in the document; 2 should come back as null or not found instead.",
        "Only 2, since a missing value is the one case where a second attempt can still find something new.",
        "None; send all three to human review, since a failed validation shows that the model can't be trusted."
      ],
      opt: [
        "Os três, porque em cada caso o erro de validação diz ao modelo exatamente o que corrigir.",
        "Só 1 e 3, porque o dado está no documento; o 2 deve voltar como null ou não encontrado.",
        "Só o 2, porque valor ausente é o único caso em que uma segunda tentativa ainda pode achar algo novo.",
        "Nenhum; mandar os três para revisão humana, porque validação que falhou mostra que o modelo não é confiável."
      ],
      a: [1],
      e: "Retry com feedback funciona quando a informação <strong>está no documento</strong> e o erro é de formato (1) ou de leitura (3): devolver o documento, a extração que falhou e o erro específico permite a correção. Em (2) o dado não existe, e insistir empurra o modelo a inventar um número; o schema deve aceitar ausência (nullable ou “not_found”). A erra justamente no caso 2. C inverte a lógica. D gasta revisão humana em erros que o próprio loop corrige."
    },
    {
      id: "EX10", s: "EX", d: 1, t: "1.4",
      q: "After a programmatic gate made post_to_ledger refuse any invoice without a passing validate_totals result, the team wants to move every rule of the extraction agent into code: the gate, plus “prefer bullet lists in summaries”, “mention the vendor's name first” and “flag unusual payment terms”. What is the right split?",
      qpt: "Depois que um gate em código fez o post_to_ledger recusar toda fatura sem um resultado aprovado de validate_totals, o time quer levar para o código todas as regras do agente de extração: o gate, mais “prefira listas nos resumos”, “cite primeiro o nome do fornecedor” e “sinalize condições de pagamento incomuns”. Qual é a divisão certa?",
      o: [
        "Enforce all four rules in code, since prompt instructions always have some failure rate in production.",
        "Remove the gate and keep all four rules in the prompt, since it now states the validation order clearly.",
        "Replace the agent with a fixed pipeline in code, so that no step can ever be skipped or reordered at all.",
        "Keep the code gate for posting, where a skipped step causes financial errors, and the rest as guidance."
      ],
      opt: [
        "Impor as quatro regras em código, porque instrução no prompt sempre tem alguma taxa de falha em produção.",
        "Tirar o gate e deixar as quatro regras no prompt, que agora explica com clareza a ordem da validação.",
        "Trocar o agente por um pipeline fixo em código, para nenhum passo poder ser pulado ou reordenado.",
        "Manter o gate em código para a postagem, onde um passo pulado causa erro financeiro, e o resto como orientação."
      ],
      a: [3],
      e: "Enforcement em código é para o que <strong>não pode falhar</strong>: postar no razão sem validação gera erro financeiro, e instrução no prompt tem taxa de falha diferente de zero. Preferência de estilo e julgamento (formato do resumo, ordem das informações, o que conta como condição de pagamento incomum) são orientação: ficam no prompt, com critérios e exemplos. A engessa em código o que é julgamento e não se verifica de forma determinística. B volta ao problema que o gate resolveu. C troca a adaptação do agente por rigidez, quando só um passo exige garantia."
    },
    {
      id: "DP6", s: "DP", d: 2, t: "2.5",
      q: "To list every migration file (named like 0042_add_index.migration.sql), the agent runs Glob with db/*.migration.sql and gets 14 files. The team knows of about 60: each service keeps its own db/ folder, such as services/billing/db/, and some keep migrations in subfolders like db/2025/. What should the agent do?",
      qpt: "Para listar todos os arquivos de migration (com nomes como 0042_add_index.migration.sql), o agente roda Glob com db/*.migration.sql e recebe 14 arquivos. O time sabe de cerca de 60: cada serviço tem a própria pasta db/, como services/billing/db/, e alguns guardam migrations em subpastas como db/2025/. O que o agente deve fazer?",
      o: [
        "Use Glob with **/db/**/*.migration.sql, because * stops at one folder level while ** matches any depth.",
        "Switch to Grep for “migration.sql”, so that every file that mentions the extension anywhere is matched.",
        "Run the same Glob from each service folder in turn, then add all of the results to one list in context.",
        "Read the repository root and each db/ folder, then list the migration files that show up in the output."
      ],
      opt: [
        "Usar Glob com **/db/**/*.migration.sql, porque * para num nível de pasta e ** casa qualquer profundidade.",
        "Trocar para Grep por “migration.sql”, para casar todo arquivo que mencione a extensão em qualquer lugar.",
        "Rodar o mesmo Glob a partir de cada pasta de serviço e juntar os resultados numa lista no contexto.",
        "Ler a raiz do repositório e cada pasta db/ e listar os arquivos de migration que aparecerem na saída."
      ],
      a: [0],
      e: "A tool certa com o padrão errado: <code>db/*.migration.sql</code> só casa arquivos direto na pasta <code>db/</code> da raiz, porque <code>*</code> não atravessa pastas. <code>**/db/**/*.migration.sql</code> pega qualquer <code>db/</code> em qualquer profundidade, com as subpastas dele. B volta à busca por conteúdo, que acha menções, não arquivos. C repete o padrão estreito pasta a pasta e ainda perde <code>db/2025/</code>. D gasta leituras com o que um padrão de caminho resolve."
    },
    {
      id: "DP7", s: "DP", d: 2, t: "2.4",
      q: "An SDK agent uses a remote code-index MCP server whose search_code_index tool is described in detail: semantic search across all 40 repositories, what it returns, and when to prefer it over Grep. Most runs use it well, but in some runs the agent answers cross-repository questions with local Grep only and misses callers in other repositories. What should the team check first?",
      qpt: "Um agente do SDK usa um MCP server remoto de índice de código, cuja tool search_code_index está descrita em detalhe: busca semântica nos 40 repositórios, o que devolve e quando preferi-la à Grep. A maioria dos runs a usa bem, mas em alguns o agente responde perguntas entre repositórios só com a Grep local e perde chamadores em outros repositórios. O que o time deve checar primeiro?",
      o: [
        "Rewrite the tool's description again, with more examples of the cross-repository questions it handles.",
        "Remove Grep from the agent's tools, so that search_code_index is the only search tool left in every run.",
        "The mcp_servers status in each run's system init message, looking for failed or needs-auth in bad runs.",
        "Add a system prompt rule saying that the code index must be used for every search question, in any run."
      ],
      opt: [
        "Reescrever de novo a description da tool, com mais exemplos das perguntas entre repositórios que ela atende.",
        "Tirar a Grep das tools do agente, para a search_code_index ser a única tool de busca em todo run.",
        "O status em mcp_servers na mensagem system init de cada run, procurando failed ou needs-auth nos runs ruins.",
        "Acrescentar ao system prompt uma regra dizendo que o índice deve ser usado em toda pergunta de busca."
      ],
      a: [2],
      e: "A description já é boa e funciona na maioria dos runs; o que varia de um run para outro é a conexão. A mensagem <code>system</code> de subtype <code>init</code> traz o status de cada MCP server (<code>connected</code>, <code>failed</code>, <code>needs-auth</code>, <code>pending</code>), e com o server indisponível o agente recai nas tools nativas. Confirmar a descoberta vem antes de mexer em description ou prompt. A mexe no que não é a causa. B tira a Grep, que segue certa para busca local exata, e não conecta o server. D manda usar uma tool que, nesses runs, nem está disponível."
    },
    {
      id: "DP8", s: "DP", d: 2, t: "2.3",
      q: "The agent has 26 tools from four MCP servers plus the built-in tools. It increasingly picks the wrong tool, such as calling a Jira search when it needs a code search. Each of its tasks needs only a handful of these tools. Which design change best addresses this?",
      qpt: "O agente tem 26 tools de quatro MCP servers, mais as tools nativas. Ele escolhe cada vez mais a tool errada, por exemplo uma busca no Jira quando precisa de busca no código. Cada tarefa dele usa só um punhado dessas tools. Qual mudança de desenho resolve melhor?",
      o: [
        "Split the work among subagents with focused roles, each given only the few tools that its role actually needs.",
        "Add a paragraph to the system prompt listing all 26 tools in order, from the most useful to the least useful.",
        "Force the tool choice on every turn by naming, from the orchestration code, the tool the agent should call next.",
        "Merge the four MCP servers into one server, so that the agent sees all of the tools under a single namespace."
      ],
      opt: [
        "Dividir o trabalho entre subagents com papéis focados, cada um só com as poucas tools de que o papel precisa.",
        "Acrescentar ao system prompt um parágrafo listando as 26 tools em ordem, da mais útil à menos útil.",
        "Forçar a escolha da tool em todo turno, com o código de orquestração nomeando a próxima tool que o agente deve chamar.",
        "Fundir os quatro MCP servers num só, para o agente ver todas as tools sob um único namespace."
      ],
      a: [0],
      e: "Muitas tools para escolher degradam a seleção. Distribuir as tools por papel — cada subagent com as poucas de que precisa — reduz a escolha e tira a concorrência entre descrições. B alonga o prompt sem tirar opções. C desloca a decisão para código fixo e perde a adaptação do agente. D muda a organização, não o número de tools."
    },
    {
      id: "DP9", s: "DP", d: 1, t: "1.6",
      q: "An engineer asks: “Explain how authentication works in this legacy system; nobody on the team fully understands it.” The team's chain for other requests runs fixed steps: list the modules, summarize each one, write the overview. Here it summarizes 300 modules and still misses the auth flow, which spans a few files. What approach fits better?",
      qpt: "Um engenheiro pede: “Explique como a autenticação funciona neste sistema legado; ninguém do time entende direito.” A cadeia que o time usa para outros pedidos roda passos fixos: listar os módulos, resumir cada um, escrever a visão geral. Aqui ela resume 300 módulos e ainda perde o fluxo de autenticação, que passa por poucos arquivos. Que abordagem serve melhor?",
      o: [
        "Run the same fixed chain on the auth-related folders only, filtered by a keyword list chosen ahead of time.",
        "Map the structure first, find the auth entry points, then build and adapt the plan from what each step shows.",
        "Load the whole repository into one large context window and ask the question once, with all the code in view.",
        "Run the fixed chain twice, the second time with a longer summary per module, and then compare both overviews."
      ],
      opt: [
        "Rodar a mesma cadeia fixa só nas pastas ligadas a autenticação, filtradas por uma lista de palavras-chave definida antes.",
        "Mapear a estrutura primeiro, achar os pontos de entrada da autenticação e montar e adaptar o plano pelo que cada passo mostrar.",
        "Carregar o repositório inteiro numa janela de contexto grande e fazer a pergunta uma vez, com todo o código à vista.",
        "Rodar a cadeia fixa duas vezes, a segunda com um resumo mais longo por módulo, e comparar as duas visões gerais."
      ],
      a: [1],
      e: "Pergunta aberta sobre um sistema desconhecido pede decomposição <strong>adaptativa</strong>: mapear a estrutura, achar os pontos de entrada e decidir o próximo passo pelo que o passo anterior revelou. A cadeia fixa (prompt chaining) é ótima quando os passos são conhecidos e iguais para cada item — o caso oposto. A presume que você já sabe onde procurar. C dilui a atenção e não cabe num sistema grande. D repete a abordagem que já falhou."
    },
    {
      id: "DP10", s: "DP", d: 5, t: "5.4",
      q: "In a long session mapping a legacy codebase, the agent writes each finding to notes/findings.md as it goes. After the conversation is compacted, it starts contradicting findings recorded in that file, such as which service owns the session cache, and the logs show it never opens the file again. Which TWO changes help most?",
      qpt: "Numa sessão longa mapeando uma codebase legada, o agente registra cada achado em notes/findings.md à medida que avança. Depois que a conversa é compactada, ele passa a contradizer achados registrados nesse arquivo, como qual serviço é dono do cache de sessão, e os logs mostram que ele nunca mais abre o arquivo. Quais DUAS mudanças ajudam mais?",
      o: [
        "Add a standing instruction to read notes/findings.md at the start of each phase and before any ownership claim.",
        "Stop using the notes file and keep every finding in the conversation, so that nothing lives outside the context.",
        "Compact more often, so that each summary covers a shorter stretch of the session and drops fewer details.",
        "When compacting, pass focus instructions, such as /compact keep the service ownership map and open questions.",
        "Ask the agent to rate its confidence in each finding, and re-explore only those findings below a 0.7 threshold."
      ],
      opt: [
        "Acrescentar uma instrução fixa para ler notes/findings.md no início de cada fase e antes de afirmar quem é dono de algo.",
        "Parar de usar o arquivo de notas e manter todo achado na conversa, para nada ficar fora do contexto.",
        "Compactar com mais frequência, para cada resumo cobrir um trecho menor da sessão e perder menos detalhes.",
        "Ao compactar, passar instruções de foco, como /compact keep the service ownership map and open questions.",
        "Pedir ao agente uma nota de confiança para cada achado e reexplorar só os que ficarem abaixo de 0.7."
      ],
      a: [0, 3],
      e: "O scratchpad só ajuda se for <strong>relido</strong>: depois da compactação, o que sobra no contexto é o resumo, e o agente passou a confiar nele em vez do arquivo. Uma instrução fixa para ler <code>notes/findings.md</code> no início de cada fase (A) devolve os achados exatos ao contexto, e instruções de foco no <code>/compact</code> (D) fazem o resumo preservar o que importa. B desfaz a memória estável fora do contexto. C produz mais resumos, não melhores, e cada rodada perde detalhe. E usa autoconfiança não calibrada e não impede a contradição."
    },
    {
      id: "CG6", s: "CG", d: 3, t: "3.4",
      q: "Every Monday a scheduled claude -p job must study the codebase and propose how to split a growing module, for the tech lead to approve before anyone changes code. Last week the job, which runs with acceptEdits, started editing files in the CI checkout on its own. Which setup fits?",
      qpt: "Toda segunda-feira um job agendado de claude -p precisa estudar a codebase e propor como dividir um módulo que não para de crescer, para o tech lead aprovar antes de alguém mexer no código. Na semana passada o job, que roda com acceptEdits, começou a editar arquivos no checkout do CI por conta própria. Qual configuração serve?",
      o: [
        "Keep acceptEdits and add a final step that reverts any edits once the proposal text has been saved.",
        "Run it with --permission-mode plan, so that the job explores and returns a plan without file edits.",
        "Move the job to an interactive session, since plan mode is not available in non-interactive runs.",
        "Run it with --max-turns 1, so that Claude only has time to describe the change instead of making it."
      ],
      opt: [
        "Manter o acceptEdits e acrescentar um passo final que desfaz as edições depois de salvar o texto da proposta.",
        "Rodar com --permission-mode plan, para o job explorar e devolver um plano sem editar arquivos.",
        "Levar o job para uma sessão interativa, já que o plan mode não existe em execuções não interativas.",
        "Rodar com --max-turns 1, para o Claude só ter tempo de descrever a mudança em vez de fazê-la."
      ],
      a: [1],
      e: "Plan mode é o modo de explorar e propor sem alterar nada, e a mesma flag funciona com <code>-p</code>: <code>claude -p --permission-mode plan</code> devolve o plano, que segue para aprovação humana antes da execução. O critério aqui não é o tamanho da mudança, e sim a exigência de aprovação antes de editar. A deixa as edições acontecerem e depende de desfazê-las. C parte de premissa falsa. D corta a exploração de que a proposta precisa e não impede que o primeiro turno edite."
    },
    {
      id: "CG7", s: "CG", d: 3, t: "3.2",
      q: "Claude Code may run the migrate script against local and staging databases, but never when DATABASE_URL points to the production host. The team tried a deny rule for the migrate command, but it also blocked local and staging runs. Which mechanism fits?",
      qpt: "O Claude Code pode rodar o script de migrate contra os bancos local e de staging, mas nunca quando o DATABASE_URL aponta para o host de produção. O time tentou uma regra deny para o comando de migrate, mas ela bloqueou também as execuções local e de staging. Qual mecanismo serve?",
      o: [
        "A CLAUDE.md section warning that migrations must never run against the production database host.",
        "A broader deny rule in .claude/settings.json covering every command that is able to reach the database.",
        "A skill describing how to check DATABASE_URL, which developers invoke before running any migration.",
        "A PreToolUse hook in .claude/settings.json that checks the target and blocks the call on production."
      ],
      opt: [
        "Uma seção do CLAUDE.md avisando que migrations nunca devem rodar contra o host de produção.",
        "Uma regra deny mais ampla no .claude/settings.json, cobrindo todo comando capaz de alcançar o banco.",
        "Uma skill explicando como checar o DATABASE_URL, que os devs invocam antes de rodar qualquer migration.",
        "Um hook PreToolUse no .claude/settings.json que checa o alvo e bloqueia a chamada quando é produção."
      ],
      a: [3],
      e: "Proibição <strong>condicional</strong> — depende de para onde o comando aponta — é caso de hook: um <code>PreToolUse</code> configurado no <code>settings.json</code> do projeto roda em toda chamada, inspeciona o alvo e bloqueia só quando é produção, devolvendo o motivo ao Claude. Regra <code>deny</code> serve para o que é sempre proibido; como casa pelo padrão do comando, ela bloqueia também os usos legítimos — o problema relatado, que B amplia. A e C são orientação: o modelo lê e pode não seguir, e a skill ainda depende de alguém lembrar de invocá-la."
    },
    {
      id: "CG8", s: "CG", d: 2, t: "2.4",
      q: "After pulling the repository, a developer runs /mcp. The team's docs server, defined in the committed .mcp.json, shows a warning that the DOCS_TOKEN variable is not set; the other servers look fine. What is the right fix?",
      qpt: "Depois de dar pull no repositório, um dev roda /mcp. O server de docs do time, definido no .mcp.json commitado, aparece com um aviso de que a variável DOCS_TOKEN não está definida; os outros servers parecem normais. Qual é a correção certa?",
      o: [
        "Set DOCS_TOKEN in their own environment or secret manager, then restart, leaving the .mcp.json unchanged.",
        "Paste their token into .mcp.json in place of ${DOCS_TOKEN}, and commit it so that teammates get it too.",
        "Copy the server into their ~/.claude.json with the same ${DOCS_TOKEN} reference, so it loads in user scope.",
        "Rewrite the docs tool descriptions, so that Claude prefers them over Grep for documentation questions."
      ],
      opt: [
        "Definir DOCS_TOKEN no próprio ambiente ou no gerenciador de segredos e reiniciar, sem mexer no .mcp.json.",
        "Colar o próprio token no .mcp.json no lugar de ${DOCS_TOKEN} e commitar, para o time também receber.",
        "Copiar o server para o próprio ~/.claude.json com a mesma referência ${DOCS_TOKEN}, para carregar no escopo de usuário.",
        "Reescrever as descrições das tools de docs, para o Claude preferi-las ao Grep em perguntas de documentação."
      ],
      a: [0],
      e: "O <code>.mcp.json</code> do projeto é compartilhado e referencia o segredo por variável; cada dev fornece o valor no próprio ambiente. Quando a variável falta, a config carrega com o texto literal, e o <code>/mcp</code> (assim como <code>claude mcp list</code>) avisa qual variável está faltando — então a correção é defini-la e reiniciar. B põe um segredo pessoal no repositório. C muda o escopo, mas a variável continua faltando. D trata como problema de descrição o que é falha de autenticação: o server nem tem credencial."
    },
    {
      id: "CG9", s: "CG", d: 3, t: "3.2",
      q: "Every file that Claude Code edits must go through the project's formatter right after the edit, with no exceptions. A CLAUDE.md line asking for this is followed most of the time, but formatting-only diffs still show up in reviews. What should the team use?",
      qpt: "Todo arquivo que o Claude Code edita precisa passar pelo formatter do projeto logo depois da edição, sem exceção. Uma linha no CLAUDE.md pedindo isso é seguida na maior parte das vezes, mas diffs só de formatação continuam aparecendo nos reviews. O que o time deve usar?",
      o: [
        "A stronger CLAUDE.md line in capital letters, placed at the very top of the file so Claude reads it first.",
        "A /format skill that developers invoke at the end of each session to format every file that was touched.",
        "A PostToolUse hook in the project's settings.json that runs the formatter after each edit or write.",
        "A rule in .claude/rules/ with a glob for source files, so that the formatting reminder loads near edits."
      ],
      opt: [
        "Uma linha mais enfática no CLAUDE.md, em maiúsculas, no topo do arquivo para o Claude ler primeiro.",
        "Uma skill /format que os devs invocam no fim de cada sessão para formatar todos os arquivos tocados.",
        "Um hook PostToolUse no settings.json do projeto que roda o formatter depois de cada edição ou escrita.",
        "Uma rule em .claude/rules/ com glob para arquivos de código, para o lembrete de formatação carregar perto das edições."
      ],
      a: [2],
      e: "Ação que precisa acontecer <strong>sempre</strong>, a cada evento, é hook: um <code>PostToolUse</code> configurado no <code>settings.json</code> roda o formatter de forma determinística depois de cada Edit/Write, sem depender de o modelo lembrar. A e D são texto que o modelo pode deixar de seguir — que é o problema atual. B depende de alguém lembrar de invocar a skill."
    },
    {
      id: "CG10", s: "CG", d: 1, t: "1.3",
      q: "A code-reviewer subagent in .claude/agents/reviewer.md lists tools: Read, Grep, Glob in its frontmatter. The team now wants it to confirm each fix by running the test suite, but it replies that it cannot run commands and asks the main session to run them. It must still not get the Edit or Write tools. What should change?",
      qpt: "Um subagent de code review em .claude/agents/reviewer.md lista tools: Read, Grep, Glob no frontmatter. O time agora quer que ele confirme cada correção rodando a suíte de testes, mas ele responde que não consegue rodar comandos e pede à sessão principal que rode. Ele continua sem poder ter as tools Edit e Write. O que deve mudar?",
      o: [
        "Tell the reviewer in its prompt that it is allowed to run the tests with Bash whenever it needs to.",
        "Start the main session with --allowedTools \"Bash\", so that the reviewer can run commands without asking.",
        "Remove the tools line from the frontmatter, so that the reviewer inherits all of the available tools.",
        "Add Bash to the reviewer's tools list, keeping Edit and Write out of it, so it can run the test suite."
      ],
      opt: [
        "Dizer ao revisor, no prompt dele, que ele pode rodar os testes com Bash sempre que precisar.",
        "Abrir a sessão principal com --allowedTools \"Bash\", para o revisor rodar comandos sem pedir permissão.",
        "Tirar a linha tools do frontmatter, para o revisor herdar todas as tools disponíveis.",
        "Acrescentar Bash à lista tools do revisor, mantendo Edit e Write de fora, para ele rodar a suíte de testes."
      ],
      a: [3],
      e: "O campo <code>tools</code> do subagent define quais tools ele <strong>tem</strong>: sem Bash na lista, nenhuma instrução (A) nem pré-aprovação (B) o faz rodar comandos — <code>--allowedTools</code> só pré-aprova o que já está disponível. A correção é acrescentar Bash à lista, mantendo Edit e Write de fora. C vai ao outro extremo: sem <code>tools</code>, o subagent herda todas as tools disponíveis, inclusive as de edição. Ressalva: Bash também consegue mudar arquivos (<code>sed -i</code>, <code>mv</code>, <code>rm</code>; aula 08) — para o revisor continuar sem escrever, restrinja o Bash ao comando de teste com regras de permissão (ex.: allow só <code>Bash(npm test)</code>) ou um hook <code>PreToolUse</code>."
    }
  ]
};
