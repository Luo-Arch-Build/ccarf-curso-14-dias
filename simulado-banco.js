// Banco do simulado em modo prova — aula 14 do curso CCAR-F.
// Questões inéditas (não repetem as aulas nem simulados de terceiros), 5 por cenário oficial do Exam Guide v1.0.
// Campos: id, s (cenário), d (domínio), t (task statement), q/qpt (stem EN/PT), o/opt (alternativas EN/PT),
// a (índices corretos; 2 = "select TWO"), e (explicação PT, HTML permitido).
window.CCARF_BANCO = {
  versao: "2026-10-20",
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
    }
  ]
};
