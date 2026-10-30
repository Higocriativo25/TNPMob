//-- TELA PREFERÊNCIA DO MOTORISTA  -->
var MOTORISTAPAG_Login_preferenciasMotorista = {
    notificacoesAtivas: true,
    somNotificacoes: true,
    vibracaoAtiva: true,

    alertasMapaAtivos: true

  
    
};

/* ==================================================
   MOTORISTA — PREFERÊNCIAS
   OBTER CONEXÃO COM FIREBASE
================================================== */

function MOTORISTAPAG_Login_func_obterDbPreferenciasMotorista() {

    if (typeof PRIMEIRAPAG_Login_db !== "undefined") {
        return PRIMEIRAPAG_Login_db;
    }

    return firebase.firestore();

}


/* ==================================================
   MOTORISTA — PREFERÊNCIAS
   OBTER USUÁRIO AUTENTICADO
================================================== */

function MOTORISTAPAG_Login_func_obterUserPreferenciasMotorista() {

    if (
        typeof PRIMEIRAPAG_Login_auth !== "undefined" &&
        PRIMEIRAPAG_Login_auth.currentUser
    ) {
        return PRIMEIRAPAG_Login_auth.currentUser;
    }

    return firebase.auth().currentUser;
}


/* ==================================================
   MOTORISTA — PREFERÊNCIAS
   ABRIR MÓDULO FILHO DE CONFIGURAÇÕES
================================================== */

let MOTORISTAPAG_Login_promessaCarregarPreferenciasm = null;

async function MOTORISTAPAG_Login_func_abrirPreferenciasMotorista() {

    const area = document.getElementById(
        "MOTORISTAPAG_Login_area_preferenciasm"
    );

    if (!area) {
        console.error(
            "TNP MOB: mount de Preferências não encontrado."
        );
        return;
    }

    try {

        let modal = area.querySelector(
            "#MOTORISTAPAG_Login_modal_preferencias_motorista"
        );

        /* Carregar somente na primeira abertura. */
        if (!modal) {

            if (!MOTORISTAPAG_Login_promessaCarregarPreferenciasm) {

                MOTORISTAPAG_Login_promessaCarregarPreferenciasm =
                    fetch("configuracoesm/preferenciasm/preferenciasm.html")
                        .then(function(resposta) {

                            if (!resposta.ok) {
                                throw new Error(
                                    "HTTP " + resposta.status
                                );
                            }

                            return resposta.text();
                        })
                        .then(function(html) {
                            area.innerHTML = html;
                        })
                        .finally(function() {
                            MOTORISTAPAG_Login_promessaCarregarPreferenciasm = null;
                        });
            }

            await MOTORISTAPAG_Login_promessaCarregarPreferenciasm;

            modal = area.querySelector(
                "#MOTORISTAPAG_Login_modal_preferencias_motorista"
            );
        }

        if (!modal) {
            throw new Error(
                "Modal de Preferências não encontrado após carregamento."
            );
        }
		
		/* Abrir Preferências sobre Configurações. */
			modal.classList.add("active");
				
		/* Registrar Preferências no Voltar Global. */
		if (
			typeof TNP_MOB_func_registrarCamadaVoltar ===
			"function"
		) {
			TNP_MOB_func_registrarCamadaVoltar(
				"motorista_preferencias",
				MOTORISTAPAG_Login_func_voltarPreferenciasMotorista
			);
		}

        /* Recuperar as preferências do motorista. */
        await MOTORISTAPAG_Login_func_carregarPreferenciasMotorista();

    } catch (erro) {

        console.error(
            "TNP MOB: erro ao abrir Preferências do Motorista:",
            erro
        );
    }
}


/* ==================================================
   MOTORISTA — PREFERÊNCIAS
   CARREGAR PREFERÊNCIAS SALVAS
================================================== */

async function MOTORISTAPAG_Login_func_carregarPreferenciasMotorista() {

    const user = MOTORISTAPAG_Login_func_obterUserPreferenciasMotorista();

    if (!user) return;

    try {
        const db = MOTORISTAPAG_Login_func_obterDbPreferenciasMotorista();

        const snap = await db.collection("motoristas").doc(user.uid).get();

        const dados = snap.exists ? (snap.data() || {}) : {};
        const preferenciasSalvas = dados.preferencias || {};

        MOTORISTAPAG_Login_preferenciasMotorista = {
            ...MOTORISTAPAG_Login_preferenciasMotorista,
            ...preferenciasSalvas,            
        };

        MOTORISTAPAG_Login_func_preencherTelaPreferenciasMotorista();

    } catch (erro) {
        console.error("Erro ao carregar preferências do motorista:", erro);
    }
}


/* ==================================================
   MOTORISTA — PREFERÊNCIAS
   PREENCHER CAMPOS DA TELA
================================================== */

function MOTORISTAPAG_Login_func_preencherTelaPreferenciasMotorista() {

    const prefs = MOTORISTAPAG_Login_preferenciasMotorista || {};

    const campoNotificacoes = document.getElementById("MOTORISTAPAG_Login_pref_notificacoes");
    const campoSom = document.getElementById("MOTORISTAPAG_Login_pref_som");
    const campoVibracao = document.getElementById("MOTORISTAPAG_Login_pref_vibracao");
    const campoAlertasMapa = document.getElementById("MOTORISTAPAG_Login_pref_alertas_mapa");

    if (campoNotificacoes) campoNotificacoes.checked = prefs.notificacoesAtivas !== false;
    if (campoSom) campoSom.checked = prefs.somNotificacoes !== false;
    if (campoVibracao) campoVibracao.checked = prefs.vibracaoAtiva !== false;
    if (campoAlertasMapa) campoAlertasMapa.checked = prefs.alertasMapaAtivos !== false;
}


/* ==================================================
   MOTORISTA — PREFERÊNCIAS
   SALVAR PREFERÊNCIAS NO FIREBASE
================================================== */

async function MOTORISTAPAG_Login_func_salvarPreferenciasMotorista(mostrarAviso) {
    const user = MOTORISTAPAG_Login_func_obterUserPreferenciasMotorista();

    if (!user) {
        alert("Você precisa estar logado para salvar preferências.");
        return;
    }

    const campoNotificacoes = document.getElementById("MOTORISTAPAG_Login_pref_notificacoes");
    const campoSom = document.getElementById("MOTORISTAPAG_Login_pref_som");
    const campoVibracao = document.getElementById("MOTORISTAPAG_Login_pref_vibracao");
    const campoAlertasMapa = document.getElementById("MOTORISTAPAG_Login_pref_alertas_mapa");

    const preferencias = {
        notificacoesAtivas: campoNotificacoes ? campoNotificacoes.checked === true : true,
        somNotificacoes: campoSom ? campoSom.checked === true : true,
        vibracaoAtiva: campoVibracao ? campoVibracao.checked === true : true,

        alertasMapaAtivos: campoAlertasMapa ? campoAlertasMapa.checked === true : true,
       
    };

    try {
        const db = MOTORISTAPAG_Login_func_obterDbPreferenciasMotorista();

        await db.collection("motoristas").doc(user.uid).set({
            preferencias: preferencias,
            atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        MOTORISTAPAG_Login_preferenciasMotorista = preferencias;

        if (mostrarAviso === true) {
            alert("Preferências salvas.");
        }

    } catch (erro) {
        console.error("Erro ao salvar preferências do motorista:", erro);
        alert("Não foi possível salvar as preferências.");
    }
}


/* ==================================================
   MOTORISTA — PREFERÊNCIAS
   CONTROLE DE VIBRAÇÃO
================================================== */

function MOTORISTAPAG_Login_func_vibrarMotorista(padrao) {
    const podeVibrar =
        typeof navigator !== "undefined" &&
        typeof navigator.vibrate === "function";

    if (!podeVibrar) return;

    const prefs = MOTORISTAPAG_Login_preferenciasMotorista || {};

    if (prefs.vibracaoAtiva === false) return;

    if (padrao === "alerta") {
        navigator.vibrate([200, 100, 200]);
        return;
    }

    if (padrao === "mensagem") {
        navigator.vibrate(120);
        return;
    }

    if (padrao === "sos") {
        navigator.vibrate([300, 120, 300, 120, 500]);
        return;
    }

    navigator.vibrate(100);
}


/* ==================================================
   MOTORISTA — PREFERÊNCIAS
   TESTAR VIBRAÇÃO
================================================== */

function MOTORISTAPAG_Login_func_testarVibracaoMotorista() {
    MOTORISTAPAG_Login_func_vibrarMotorista("alerta");
}


/* ==================================================
   TNP MOB — MOTORISTA
   PREFERÊNCIAS

   VOLTAR PARA CONFIGURAÇÕES

   - Fecha somente Preferências
   - Mantém Configurações aberta
   - Preserva o módulo montado
   - Remove a camada do Voltar Global
   - Não altera Firebase
================================================== */

/* ==================================================
   TNP MOB — MOTORISTA
   PREFERÊNCIAS — VOLTAR PARA CONFIGURAÇÕES

   - Fecha somente Preferências
   - Mantém Configurações aberta
   - Preserva o HTML montado
   - Remove o registro do Voltar Global
   - Não altera Firebase
================================================== */

function MOTORISTAPAG_Login_func_voltarPreferenciasMotorista() {

    const modal = document.getElementById(
        "MOTORISTAPAG_Login_modal_preferencias_motorista"
    );

    // Fecha somente Preferências.
    if (modal) {
        modal.classList.remove("active");
    }

    // Remove seu próprio registro do Voltar Global,
    // mesmo que o modal não seja encontrado.
    if (
        typeof TNP_MOB_func_removerCamadaVoltar === "function"
    ) {
        TNP_MOB_func_removerCamadaVoltar(
            "motorista_preferencias"
        );
    }
}


/* ==================================================
   MOTORISTA — PREFERÊNCIAS
   FUNÇÕES PÚBLICAS
================================================== */

window.MOTORISTAPAG_Login_func_abrirPreferenciasMotorista =
    MOTORISTAPAG_Login_func_abrirPreferenciasMotorista;

window.MOTORISTAPAG_Login_func_salvarPreferenciasMotorista =
    MOTORISTAPAG_Login_func_salvarPreferenciasMotorista;

window.MOTORISTAPAG_Login_func_testarVibracaoMotorista =
    MOTORISTAPAG_Login_func_testarVibracaoMotorista;

window.MOTORISTAPAG_Login_func_vibrarMotorista =
    MOTORISTAPAG_Login_func_vibrarMotorista;

window.MOTORISTAPAG_Login_func_voltarPreferenciasMotorista =
    MOTORISTAPAG_Login_func_voltarPreferenciasMotorista;

/* ==================================================
   TNP MOB — MOTORISTA
   PREFERÊNCIAS — FINAL
================================================== */



/* ==================================================
   MOTORISTA — GERENCIAR VEÍCULOS
   ABRIR MÓDULO FILHO DE CONFIGURAÇÕES
================================================== */

let MOTORISTAPAG_Login_promessaCarregarGerenciarVeiculosm = null;


/* ==================================================
   TNP MOB — CONFIGURAÇÕES DO MOTORISTA
   FORMAS DE RECEBIMENTO

   FIRESTORE:
   motoristas/{uid}
       preferencias.aceitaDinheiro

   true  = aceita corridas em dinheiro
   false = não aceita corridas em dinheiro

   INTEGRAÇÃO FUTURA — MÓDULO DE CHAMADAS:
   Antes de oferecer uma corrida em dinheiro,
   consultar este campo do motorista.

   A regra também deverá ser validada no
   processamento da chamada, não apenas na tela.
================================================== */

async function MOTORISTAPAG_Login_func_abrirOpcaoDinheiroMotorista() {

    const painel = document.getElementById(
        'MOTORISTAPAG_Login_painel_opcao_dinheiro'
    );

    const botao = document.getElementById(
        'MOTORISTAPAG_Login_btn_opcao_dinheiro'
    );

    if (!painel) return;

    painel.hidden = !painel.hidden;

    if (botao) {
        botao.setAttribute(
            'aria-expanded',
            String(!painel.hidden)
        );
    }

    if (!painel.hidden) {
        await MOTORISTAPAG_Login_func_carregarOpcaoDinheiroMotorista();
    }
}


async function MOTORISTAPAG_Login_func_carregarOpcaoDinheiroMotorista() {

    const user = PRIMEIRAPAG_Login_auth.currentUser;

    const campo = document.getElementById(
        'MOTORISTAPAG_Login_pref_aceita_dinheiro'
    );

    const status = document.getElementById(
        'MOTORISTAPAG_Login_status_opcao_dinheiro'
    );

    if (!campo) return;

    campo.disabled = true;

    if (!user) {
        if (status) status.innerText = 'Faça login para alterar.';
        return;
    }

    try {

        const snap = await PRIMEIRAPAG_Login_db
            .collection('motoristas')
            .doc(user.uid)
            .get();

        const dados = snap.exists ? snap.data() : {};
        const prefs = dados.preferencias || {};

        // Sem configuração anterior: mantém dinheiro aceito.
        const aceita = prefs.aceitaDinheiro !== false;

        campo.checked = aceita;
        campo.dataset.valorSalvo = String(aceita);
        campo.disabled = false;

        if (status) {
            status.innerText = 'Sua escolha é salva automaticamente.';
        }

    } catch (erro) {

        console.error('Erro ao carregar opção de dinheiro:', erro);

        if (status) {
            status.innerText = 'Não foi possível carregar a preferência.';
        }
    }
}


async function MOTORISTAPAG_Login_func_salvarOpcaoDinheiroMotorista(campo) {

    const user = PRIMEIRAPAG_Login_auth.currentUser;

    const status = document.getElementById(
        'MOTORISTAPAG_Login_status_opcao_dinheiro'
    );

    if (!campo || !user) return;

    const aceita = campo.checked === true;

    campo.disabled = true;

    if (status) status.innerText = 'Salvando...';

    try {

        await PRIMEIRAPAG_Login_db
            .collection('motoristas')
            .doc(user.uid)
            .update({
                'preferencias.aceitaDinheiro': aceita,
                atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
            });

        campo.dataset.valorSalvo = String(aceita);

        if (status) {
            status.innerText = aceita
                ? 'Corridas em dinheiro ativadas.'
                : 'Corridas em dinheiro desativadas.';
        }

    } catch (erro) {

        console.error('Erro ao salvar opção de dinheiro:', erro);

        campo.checked = campo.dataset.valorSalvo !== 'false';

        if (status) {
            status.innerText = 'Erro ao salvar. Tente novamente.';
        }

    } finally {
        campo.disabled = false;
    }
}


/* ==================================================
   TNP MOB — GERENCIAR VEÍCULOS
   VOLTAR PARA CONFIGURAÇÕES OU HOME
================================================== */


/* ==================================================
   TNP MOB — MOTORISTA
   GERENCIAR VEÍCULOS

   VOLTAR PARA CONFIGURAÇÕES OU HOME

   - Limpa o modo temporário de correção
   - Libera arquivos temporários da interface
   - Preserva os dados salvos no Firebase
   - Mantém os direcionamentos originais
   - Não desmonta o módulo
================================================== */

/* ==================================================
   TNP MOB — MOTORISTA
   GERENCIAR VEÍCULOS — FECHAMENTO PRÓPRIO

   - Limpa estados temporários
   - Libera prévias e arquivos não enviados
   - Fecha somente seu próprio módulo
   - Remove sua camada do Voltar Global
   - Mantém o HTML montado
   - Preserva os dados do Firebase
   - Mantém o retorno original para Home
================================================== */

function MOTORISTAPAG_Login_func_voltarGerenciarVeiculos(destino) {

    const modulo = document.getElementById(
        "MOTORISTAPAG_Login_gerenciar_veiculos_modulo"
    );

    if (modulo) {

        // Encerrar o modo temporário de correção.
        delete modulo.dataset.veiculoCorrecaoId;
        delete modulo.dataset.correcaoCrlv;
        delete modulo.dataset.correcaoFotoVeiculoPlaca;

        // Liberar prévias e arquivos temporários.
        if (
            typeof MOTORISTAPAG_Login_func_limparTelaDocumentosNovoVeiculo
            === "function"
        ) {
            MOTORISTAPAG_Login_func_limparTelaDocumentosNovoVeiculo();
        }

        // Fechar somente Gerenciar Veículos.
        modulo.classList.remove("active");
    }

    // Remover o registro próprio do Voltar Global.
    if (
        typeof TNP_MOB_func_removerCamadaVoltar === "function"
    ) {
        TNP_MOB_func_removerCamadaVoltar(
            "motorista_gerenciar_veiculos"
        );
    }

    // Preservar o direcionamento original.
    if (destino === "home") {

        if (
            typeof MOTORISTAPAG_Login_func_voltarConfiguracoesMotorista
            === "function"
        ) {
            MOTORISTAPAG_Login_func_voltarConfiguracoesMotorista();
        }
    }
}




/* ==================================================
   TNP MOB — MOTORISTA
   GERENCIAR VEÍCULOS

   ABRIR MÓDULO / RETORNAR À LISTA

   - Monta o HTML somente uma vez
   - Preserva MOUNT e caminho original
   - Limpa o estado temporário de correção
   - Descarta arquivos ainda não enviados
   - Preserva documentos salvos no Firebase
   - Reutiliza o módulo já montado
================================================== */

async function MOTORISTAPAG_Login_func_abrirGerenciarVeiculos() {

    const area = document.getElementById(
        "MOTORISTAPAG_Login_area_gerenciar_veiculosm"
    );

    if (!area) {
        console.error(
            "TNP MOB: mount de Gerenciar Veículos não encontrado."
        );
        return;
    }

    try {

        let modulo = area.querySelector(
            "#MOTORISTAPAG_Login_gerenciar_veiculos_modulo"
        );

        /* ==============================================
           1. CARREGAR HTML SOMENTE NA PRIMEIRA VEZ
        ============================================== */

        if (!modulo) {

            if (!MOTORISTAPAG_Login_promessaCarregarGerenciarVeiculosm) {

                MOTORISTAPAG_Login_promessaCarregarGerenciarVeiculosm =
                    fetch(
                        "configuracoesm/gerenciar-veiculosm/gerenciar-veiculosm.html"
                    )
                    .then(function(resposta) {

                        if (!resposta.ok) {
                            throw new Error(
                                "HTTP " + resposta.status
                            );
                        }

                        return resposta.text();
                    })
                    .then(function(html) {
                        area.innerHTML = html;
                    })
                    .finally(function() {
                        MOTORISTAPAG_Login_promessaCarregarGerenciarVeiculosm =
                            null;
                    });
            }

            await MOTORISTAPAG_Login_promessaCarregarGerenciarVeiculosm;

            modulo = area.querySelector(
                "#MOTORISTAPAG_Login_gerenciar_veiculos_modulo"
            );
        }

        if (!modulo) {
            throw new Error(
                "Módulo Gerenciar Veículos não encontrado."
            );
        }

        /* ==============================================
           2. ENCERRAR CORREÇÃO ANTERIOR

           Somente dados temporários da interface.
        ============================================== */

        delete modulo.dataset.veiculoCorrecaoId;
        delete modulo.dataset.correcaoCrlv;
        delete modulo.dataset.correcaoFotoVeiculoPlaca;

        /* ==============================================
           3. LIMPAR DOCUMENTOS TEMPORÁRIOS

           Não exclui arquivos do Firebase Storage.
           Não altera documentos do Firestore.
        ============================================== */

        if (
            typeof MOTORISTAPAG_Login_func_limparTelaDocumentosNovoVeiculo
            === "function"
        ) {
            MOTORISTAPAG_Login_func_limparTelaDocumentosNovoVeiculo();
        }

        /* ==============================================
           4. ABRIR O MÓDULO

           Mantém o HTML montado para reutilização.
        ============================================== */

        modulo.classList.add("active");
		
		/* ==============================================
		   GERENCIAR VEÍCULOS — VOLTAR GLOBAL
		============================================== */

		if (
			typeof TNP_MOB_func_registrarCamadaVoltar === "function"
		) {
			TNP_MOB_func_registrarCamadaVoltar(
				"motorista_gerenciar_veiculos",
				function() {
					MOTORISTAPAG_Login_func_voltarGerenciarVeiculos(
						"configuracoes"
					);
				}
			);
		}

        /* ==============================================
           5. FECHAR ETAPAS INTERNAS ANTERIORES
        ============================================== */

        modulo.querySelectorAll(
            ".MOTORISTAPAG_Login_gerenciar_veiculos_etapa"
        ).forEach(function(tela) {

            tela.classList.remove("active");

        });

        /* ==============================================
           6. MOSTRAR LISTA PRINCIPAL
        ============================================== */

        const telaPrincipal = modulo.querySelector(
            "#MOTORISTAPAG_Login_screen_gerenciar_veiculos"
        );

        if (!telaPrincipal) {
            throw new Error(
                "Tela principal de Gerenciar Veículos não encontrada."
            );
        }

        telaPrincipal.classList.add("active");

        /* ==============================================
           7. ATUALIZAR VEÍCULOS

           Firebase permanece como fonte oficial.
        ============================================== */

        if (
            typeof MOTORISTAPAG_Login_func_carregarGerenciarVeiculos
            === "function"
        ) {
            await MOTORISTAPAG_Login_func_carregarGerenciarVeiculos();
        }

    } catch (erro) {

        console.error(
            "TNP MOB: erro ao abrir Gerenciar Veículos:",
            erro
        );
    }
}



/* ==================================================
   MOTORISTA — GERENCIAR VEÍCULOS
   CARREGAR LISTA DE VEÍCULOS
================================================== */

async function MOTORISTAPAG_Login_func_carregarGerenciarVeiculos() {
    const user = PRIMEIRAPAG_Login_auth.currentUser;
    const lista = document.getElementById('MOTORISTAPAG_Login_lista_gerenciar_veiculos');
    const btnAdicionar = document.getElementById('MOTORISTAPAG_Login_btn_adicionar_veiculo');

    if (!user || !lista) return;

    lista.innerHTML = "";

    const carregando = document.createElement("div");
    carregando.className = "MOTORISTAPAG_Login_gerenciar_veiculos_vazio";
    carregando.textContent = "Carregando veículos...";
    lista.appendChild(carregando);

    try {
        const docMotorista = await PRIMEIRAPAG_Login_db
            .collection('motoristas')
            .doc(user.uid)
            .get();

        const dados = docMotorista.exists ? docMotorista.data() : {};

        let veiculos = [];

        if (Array.isArray(dados.veiculos) && dados.veiculos.length > 0) {
            veiculos = dados.veiculos;
        } else if (dados.veiculo && dados.veiculo.placa) {
            veiculos = [
                {
                    id: "veiculo_1",
                    placa: dados.veiculo.placa || "",
                    renavam: dados.veiculo.renavam || "",
                    marca: dados.veiculo.marca || "",
                    modelo: dados.veiculo.modelo || "",
                    ano: dados.veiculo.ano || "",
                    categoriaPrincipal: dados.veiculo.categoriaPrincipal || "",
                    status: dados.documentosVeiculoStatus || "pendente_analise",
                    documentos: dados.documentosVeiculo || {},
                    criadoEm: dados.veiculo.criadoEm || null,
                    atualizadoEm: dados.veiculo.atualizadoEm || null
                }
            ];

            await PRIMEIRAPAG_Login_db
                .collection('motoristas')
                .doc(user.uid)
                .set({
                    veiculos: veiculos,
                    veiculoAtualId: dados.veiculoAtualId || "veiculo_1",
                    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
        }

        lista.innerHTML = "";

        if (veiculos.length === 0) {
            const vazio = document.createElement("div");
            vazio.className = "MOTORISTAPAG_Login_gerenciar_veiculos_vazio";
            vazio.textContent = "Nenhum veículo cadastrado ainda.";
            lista.appendChild(vazio);
        }

				
		/* ==============================================
		   GERENCIAR VEÍCULOS — ORDEM VISUAL

		   1. Veículo em uso aparece primeiro.
		   2. Demais veículos mantêm sua ordem.
		   3. Não modifica o array no Firebase.
		   4. Preserva os índices originais.
		============================================== */

		const veiculoEmUsoId =
			dados.veiculoAtualId || "veiculo_1";

		veiculos
			.map(function(veiculo, index) {
				return {
					veiculo: veiculo,
					indexOriginal: index
				};
			})
			.sort(function(a, b) {

				const idA =
					a.veiculo?.id ||
					("veiculo_" + (a.indexOriginal + 1));

				const idB =
					b.veiculo?.id ||
					("veiculo_" + (b.indexOriginal + 1));

				const aEmUso = idA === veiculoEmUsoId;
				const bEmUso = idB === veiculoEmUsoId;

				return Number(bEmUso) - Number(aEmUso);
			})
			.forEach(function(item) {

				MOTORISTAPAG_Login_func_criarCardGerenciarVeiculo(
					lista,
					item.veiculo,
					item.indexOriginal,
					veiculoEmUsoId
				);

			});


        if (btnAdicionar) {
            btnAdicionar.style.display = veiculos.length >= 3 ? "none" : "block";
            btnAdicionar.disabled = veiculos.length >= 3;
        }

    } catch (erro) {
        console.error("Erro ao carregar gerenciamento de veículos:", erro);

        lista.innerHTML = "";

        const erroBox = document.createElement("div");
        erroBox.className = "MOTORISTAPAG_Login_gerenciar_veiculos_vazio";
        erroBox.textContent = "Não foi possível carregar os veículos agora.";
        lista.appendChild(erroBox);
    }
}


/* ==================================================
   MOTORISTA — GERENCIAR VEÍCULOS
   CRIAR CARD DE CADA VEÍCULO
================================================== */


/* ==================================================
   TNP MOB — MOTORISTA
   GERENCIAR VEÍCULOS
   CRIAR CARD DE CADA VEÍCULO

   - Distingue cadastro novo de correção do Admin
   - Preserva veículo aprovado e em uso
   - Não altera Firebase nem Storage
================================================== */

function MOTORISTAPAG_Login_func_criarCardGerenciarVeiculo(
    lista,
    veiculo,
    index,
    veiculoAtualId
) {

    const id = veiculo.id || ("veiculo_" + (index + 1));

    const status = String(
        veiculo.status || "pendente_analise"
    ).trim().toLowerCase();

    const aprovado = status === "aprovado";
    const emUso = aprovado && id === veiculoAtualId;

    const documentos = veiculo.documentos || {};
    const crlv = documentos.crlv || {};
    const fotoVeiculoPlaca = documentos.fotoVeiculoPlaca || {};

    /* ==============================================
       1. IDENTIFICAR CORREÇÃO DO ADMIN

       pendente_envio também existe no cadastro novo.
       Nesse caso, exige registro de solicitação.
    ============================================== */

    function precisaCorrigir(documento) {

        const situacao = String(
            documento.status || ""
        ).trim().toLowerCase();

        if ([
            "pendente_correcao",
            "reprovado",
            "recusado",
            "corrigir"
        ].includes(situacao)) {
            return true;
        }

        if (situacao === "pendente_envio") {
            return Boolean(
                documento.solicitadoEm ||
                documento.reprovadoEm
            );
        }

        return false;
    }

    const temDocumentoParaCorrecao =
        precisaCorrigir(crlv) ||
        precisaCorrigir(fotoVeiculoPlaca);

    const correcaoPermitida =
        [
            "em_revisao",
            "recusado",
            "pendente_envio"
        ].includes(status) &&
        temDocumentoParaCorrecao;

    /* ==============================================
       2. CRIAR CARD
    ============================================== */

    const card = document.createElement("div");

    card.className =
        "MOTORISTAPAG_Login_gerenciar_veiculos_card " +
        "TNP_mini_moldura";

    if (emUso) {
        card.className += " em_uso";
    }

    if (status === "em_revisao") {
        card.className += " em_revisao";
    }

    if (status === "recusado") {
        card.className += " recusado";
    }

    if (
        correcaoPermitida &&
        status === "pendente_envio"
    ) {
        card.className += " em_revisao";
    }

    /* ==============================================
       3. TOPO
    ============================================== */

    const topo = document.createElement("div");

    topo.className =
        "MOTORISTAPAG_Login_gerenciar_veiculos_topo";

    const titulo = document.createElement("strong");

    const modelo = veiculo.modelo || "Veículo";
    const marca = veiculo.marca || "";

    titulo.textContent = marca
        ? marca + " " + modelo
        : modelo;

    const statusBadge = document.createElement("span");

    statusBadge.className =
        "MOTORISTAPAG_Login_gerenciar_veiculos_status";

    statusBadge.textContent = emUso
        ? "EM USO"
        : correcaoPermitida
            ? "CORREÇÃO NECESSÁRIA"
            : MOTORISTAPAG_Login_func_textoStatusVeiculo(status);

    topo.appendChild(titulo);
    topo.appendChild(statusBadge);

    /* ==============================================
       4. DADOS DO VEÍCULO
    ============================================== */

    const info = document.createElement("div");

    info.className =
        "MOTORISTAPAG_Login_gerenciar_veiculos_info";

    info.appendChild(
        document.createTextNode(
            "Placa: " +
            (veiculo.placa || "Placa não informada")
        )
    );

    info.appendChild(document.createElement("br"));

    info.appendChild(
        document.createTextNode(
            "Ano: " +
            (veiculo.ano || "Ano não informado")
        )
    );

    info.appendChild(document.createElement("br"));

    info.appendChild(
        document.createTextNode(
            "Categoria: " +
            (
                veiculo.categoriaPrincipal ||
                veiculo.categoria ||
                "Categoria não informada"
            )
        )
    );

    /* ==============================================
       5. DOCUMENTOS
    ============================================== */

    const docs = document.createElement("div");

    docs.className =
        "MOTORISTAPAG_Login_gerenciar_veiculos_docs";

    docs.appendChild(
        MOTORISTAPAG_Login_func_criarLinhaDocVeiculo(
            "CRLV",
            crlv.status || "pendente_envio"
        )
    );

    docs.appendChild(
        MOTORISTAPAG_Login_func_criarLinhaDocVeiculo(
            "Foto do veículo",
            fotoVeiculoPlaca.status || "pendente_envio"
        )
    );

    /* ==============================================
       6. AÇÕES
    ============================================== */

    const acoes = document.createElement("div");

    acoes.className =
        "MOTORISTAPAG_Login_gerenciar_veiculos_acoes";

    function adicionarBotao(
        texto,
        classe,
        desabilitado,
        acao
    ) {

        const botao = document.createElement("button");

        botao.className = classe;
        botao.textContent = texto;
        botao.disabled = desabilitado;

        if (acao) {
            botao.addEventListener("click", acao);
        }

        acoes.appendChild(botao);

        return botao;
    }

    /* ==============================================
       7. VEÍCULO APROVADO
    ============================================== */

    if (aprovado) {

        adicionarBotao(
            emUso
                ? "VEÍCULO EM USO"
                : "USAR ESTE VEÍCULO",

            "PRIMEIRAPAG_Login_btn " +
            "PRIMEIRAPAG_Login_btn_primary",

            emUso,

            function() {
                MOTORISTAPAG_Login_func_definirVeiculoEmUso(id);
            }
        );

    }

    /* ==============================================
       8. CORREÇÃO SOLICITADA PELO ADMIN
    ============================================== */

    else if (correcaoPermitida) {

        adicionarBotao(
            "CORRIGIR VEÍCULO",

            "PRIMEIRAPAG_Login_btn " +
            "PRIMEIRAPAG_Login_btn_secondary",

            false,

            function() {
                MOTORISTAPAG_Login_func_abrirCorrecaoVeiculo(id);
            }
        );

    }

    /* ==============================================
       9. CADASTRO NOVO INCOMPLETO
    ============================================== */

    else if (status === "pendente_envio") {

        adicionarBotao(
            "CONTINUAR CADASTRO",

            "PRIMEIRAPAG_Login_btn " +
            "PRIMEIRAPAG_Login_btn_primary",

            false,

            function() {
                MOTORISTAPAG_Login_func_continuarCadastroNovoVeiculo(id);
            }
        );

    }

    /* ==============================================
       10. AGUARDANDO ANÁLISE OU OUTRO STATUS
    ============================================== */

    else {

        adicionarBotao(
            MOTORISTAPAG_Login_func_textoBotaoStatusVeiculo(status),

            "PRIMEIRAPAG_Login_btn " +
            "PRIMEIRAPAG_Login_btn_primary",

            true,

            null
        );
    }

    /* ==============================================
       11. EXCLUIR VEÍCULO

       Preserva a função original e suas validações.
    ============================================== */

    adicionarBotao(
        "EXCLUIR VEÍCULO",

        "PRIMEIRAPAG_Login_btn " +
        "MOTORISTAPAG_Login_btn_excluir_veiculo",

        false,

        function() {
            MOTORISTAPAG_Login_func_excluirVeiculoGerenciado(id);
        }
    );

    /* ==============================================
       12. MONTAR CARD
    ============================================== */

    card.appendChild(topo);
    card.appendChild(info);
    card.appendChild(docs);
    card.appendChild(acoes);

    lista.appendChild(card);
}


/* ==================================================
   MOTORISTA — ABRIR CORREÇÃO DO VEÍCULO
   REUTILIZA A TELA DE DOCUMENTOS
   NÃO ALTERA FIREBASE
================================================== */


/* ==================================================
   TNP MOB — MOTORISTA
   GERENCIAR VEÍCULOS

   ABRIR CORREÇÃO DE DOCUMENTOS

   - Identifica exatamente o veículo
   - Consulta o Firebase
   - Identifica documentos corrigíveis
   - Preserva documentos aprovados
   - Prepara a interface individualmente
   - Não altera Firebase nem Storage
================================================== */


/* ==================================================
   TNP MOB — MOTORISTA / GERENCIAR VEÍCULOS
   ABRIR CORREÇÃO INDIVIDUAL DE DOCUMENTOS

   Apenas consulta Firestore e prepara a tela.
   Não grava no Firebase nem envia ao Storage.
================================================== */
async function MOTORISTAPAG_Login_func_abrirCorrecaoVeiculo(veiculoId) {
    const usuario = PRIMEIRAPAG_Login_auth.currentUser;
    const modulo = document.getElementById(
        'MOTORISTAPAG_Login_gerenciar_veiculos_modulo'
    );

    if (!usuario || !modulo || !veiculoId) return;

    try {
        /* 1. Consultar o veículo atualizado no Firebase. */
        const snapshot = await PRIMEIRAPAG_Login_db
            .collection('motoristas')
            .doc(usuario.uid)
            .get();

        if (!snapshot.exists) {
            throw new Error('Cadastro do motorista não encontrado.');
        }

        const dados = snapshot.data() || {};
        const veiculos = Array.isArray(dados.veiculos)
            ? dados.veiculos
            : [];

        const veiculo = veiculos.find(function(item) {
            return item && String(item.id) === String(veiculoId);
        });

        if (!veiculo) {
            throw new Error('Veículo não encontrado.');
        }

        const normalizar = function(valor) {
            return String(valor || '').trim().toLowerCase();
        };

        const statusVeiculo = normalizar(veiculo.status);

        if (!['em_revisao', 'recusado', 'pendente_envio'].includes(statusVeiculo)) {
            throw new Error('Este veículo não está disponível para correção.');
        }

        /* 2. Identificar SOMENTE os documentos solicitados pelo Admin. */
        const documentos = veiculo.documentos || {};
        const crlv = documentos.crlv || {};
        const foto = documentos.fotoVeiculoPlaca || {};

        const statusCrlv = normalizar(crlv.status);
        const statusFoto = normalizar(foto.status);

        const statusCorrecaoExplicita = [
            'pendente_correcao', 'reprovado', 'recusado', 'corrigir'
        ];

        function documentoPrecisaCorrecao(documento, tipo) {
            const status = normalizar(documento.status);

            if (statusCorrecaoExplicita.includes(status)) return true;
            if (status !== 'pendente_envio') return false;

            /* pendente_envio do cadastro novo NÃO é pedido do Admin. */
            const pedidoIndividual = Boolean(
                documento.solicitadoEm ||
                documento.reprovadoEm ||
                documento.reprovadoPor
            );

            const resumoConfere =
                String(dados.pendenciaAdminVeiculoId || '') === String(veiculoId) &&
                String(dados.pendenciaAdminVeiculoDocumento || '') === tipo;

            return pedidoIndividual || resumoConfere;
        }

        const corrigirCrlv = documentoPrecisaCorrecao(crlv, 'crlv');
        const corrigirFoto = documentoPrecisaCorrecao(foto, 'fotoVeiculoPlaca');

        if (!corrigirCrlv && !corrigirFoto) {
            throw new Error(
                'Nenhum documento possui correção solicitada pelo administrador.'
            );
        }

        /* 3. Conferir a tela ANTES de alterar o estado visual. */
        const tela = modulo.querySelector(
            '#MOTORISTAPAG_Login_screen_documentos_novo_veiculo'
        );

        if (!tela) throw new Error('Tela de documentos não encontrada.');

        /* 4. Limpar arquivos anteriores apenas da memória e da interface. */
        delete modulo.dataset.veiculoCorrecaoId;
        delete modulo.dataset.correcaoCrlv;
        delete modulo.dataset.correcaoFotoVeiculoPlaca;

        MOTORISTAPAG_Login_func_limparTelaDocumentosNovoVeiculo();

        /* 5. Registrar o veículo e cada autorização separadamente. */
        modulo.dataset.veiculoCorrecaoId = String(veiculoId);
        modulo.dataset.correcaoCrlv = String(corrigirCrlv);
        modulo.dataset.correcaoFotoVeiculoPlaca = String(corrigirFoto);

        /* 6. Recuperar os documentos que já estão enviados/aprovados.
           O Firebase continua sendo a fonte oficial. */
        function documentoConfirmado(documento, status) {
            if (status === 'aprovado') return true;
            return [
                'pendente_analise', 'enviado_analise', 'em_analise'
            ].includes(status) &&
                documento.enviado === true &&
                Boolean(documento.url && documento.caminho);
        }

        const crlvPronto = !corrigirCrlv &&
            documentoConfirmado(crlv, statusCrlv);

        const fotoPronta = !corrigirFoto &&
            documentoConfirmado(foto, statusFoto);

        MOTORISTAPAG_Login_novoVeiculoCrlvPronto = crlvPronto;
        MOTORISTAPAG_Login_novoVeiculoFotoPlacaPronta = fotoPronta;

        function buscar(id) {
            return modulo.querySelector('#MOTORISTAPAG_Login_' + id);
        }

        function controlar(id, habilitado, visivel) {
            const elemento = buscar(id);
            if (!elemento) return;
            elemento.disabled = !habilitado;
            if (visivel !== undefined && elemento.tagName === 'BUTTON') {
                elemento.style.display = visivel ? '' : 'none';
            }
        }

        function textoDocumento(documento, status, corrigir) {
            if (status === 'aprovado') return 'APROVADO — NÃO REENVIAR';

            if (corrigir) {
                const motivo =
                    documento.motivoReprovacao ||
                    documento.motivo ||
                    veiculo.motivoReprovacao ||
                    'Correção solicitada pelo administrador.';
                return 'CORREÇÃO NECESSÁRIA: ' + motivo;
            }

            if ([
                'pendente_analise', 'enviado_analise', 'em_analise'
            ].includes(status)) {
                return 'ENVIADO — AGUARDANDO ANÁLISE';
            }

            return 'Status: ' + (status || 'não informado');
        }

        const campoCrlv = buscar('status_novo_veiculo_crlv');
        const campoFoto = buscar('status_novo_veiculo_foto_placa');

        if (campoCrlv) campoCrlv.innerText = textoDocumento(
            crlv, statusCrlv, corrigirCrlv
        );
        if (campoFoto) campoFoto.innerText = textoDocumento(
            foto, statusFoto, corrigirFoto
        );

        /* 7. Só exibir 'Enviado' para o documento preservado. */
        const enviadoCrlv = buscar('enviado_novo_veiculo_crlv');
        const enviadoFoto = buscar('enviado_novo_veiculo_foto_placa');

        if (enviadoCrlv) {
            enviadoCrlv.classList.toggle('TNP_hidden', !crlvPronto);
        }
        if (enviadoFoto) {
            enviadoFoto.classList.toggle('TNP_hidden', !fotoPronta);
        }

        /* 8. Seleção individual: não libera documento aprovado. */
        controlar('btn_novo_veiculo_crlv', corrigirCrlv, corrigirCrlv);
        controlar('btn_novo_veiculo_crlv_pdf', corrigirCrlv, corrigirCrlv);
        controlar('input_novo_veiculo_crlv', corrigirCrlv);
        controlar('input_novo_veiculo_crlv_pdf', corrigirCrlv);

        const liberarFoto = corrigirFoto && crlvPronto;
        controlar('btn_novo_veiculo_foto_placa', liberarFoto, corrigirFoto);
        controlar('input_novo_veiculo_foto_placa', liberarFoto);

        if (corrigirFoto && !liberarFoto) {
            const botaoFoto = buscar('btn_novo_veiculo_foto_placa');
            if (botaoFoto) botaoFoto.innerText = '🔒 AGUARDANDO CRLV';
        }

        /* 9. A preparação de foto/PDF libera o confirmar depois.
           Nunca liberar confirmação antes de selecionar arquivo. */
        controlar('btn_confirmar_novo_veiculo_crlv', false);
        controlar('btn_confirmar_novo_veiculo_foto_placa', false);
        controlar('btn_trocar_novo_veiculo_crlv', corrigirCrlv);
        controlar('btn_trocar_novo_veiculo_foto_placa', corrigirFoto);

        /* Cadastro novo e correção são finalizações diferentes. */
        const finalizar = buscar('btn_enviar_documentos_novo_veiculo');
        if (finalizar) {
            finalizar.disabled = true;
            finalizar.innerText = 'AGUARDANDO CORREÇÃO DOS DOCUMENTOS';
        }

        /* 10. Atualizar controles existentes, já adaptados à correção. */
        MOTORISTAPAG_Login_func_atualizarOpcoesCrlvNovoVeiculo();
        MOTORISTAPAG_Login_func_atualizarBloqueioFotoVeiculo();

        modulo.querySelectorAll(
            '.MOTORISTAPAG_Login_gerenciar_veiculos_etapa'
        ).forEach(function(etapa) {
            etapa.classList.remove('active');
        });

        tela.classList.add('active');

        console.info('TNP MOB — Correção preparada:', {
            veiculoId: String(veiculoId),
            corrigirCrlv,
            corrigirFoto,
            crlvPronto,
            fotoPronta,
            fotoLiberada: liberarFoto
        });

    } catch (erro) {
        console.error('Erro ao abrir correção de veículo:', erro);
        alert(erro.message || 'Não foi possível abrir a correção.');
    }
}


/* ==================================================
   MOTORISTA — GERENCIAR VEÍCULOS
   TEXTOS DOS STATUS DOS VEÍCULOS
================================================== */

function MOTORISTAPAG_Login_func_textoStatusVeiculo(status) {
    if (status === "aprovado") return "APROVADO";
    if (status === "pendente_analise") return "EM ANÁLISE";
    if (status === "em_revisao") return "EM REVISÃO";
    if (status === "recusado") return "RECUSADO";
    if (status === "pendente_envio") return "PENDENTE";
    return "EM ANÁLISE";
}


/* ==================================================
   MOTORISTA — GERENCIAR VEÍCULOS
   TEXTOS DOS BOTÕES POR STATUS
================================================== */

function MOTORISTAPAG_Login_func_textoBotaoStatusVeiculo(status) {
    if (status === "pendente_analise") return "AGUARDANDO APROVAÇÃO";
    if (status === "em_revisao") return "PRECISA DE CORREÇÃO";
    if (status === "recusado") return "VEÍCULO RECUSADO";
    if (status === "pendente_envio") return "PENDENTE DE ENVIO";
    return "INDISPONÍVEL";
}


/* ==================================================
   MOTORISTA — GERENCIAR VEÍCULOS
   TEXTOS DOS STATUS DOS DOCUMENTOS
================================================== */

function MOTORISTAPAG_Login_func_textoStatusDocumentoVeiculo(status) {
    if (status === "aprovado") return "Aprovado";
    if (status === "pendente_analise") return "Em análise";
    if (status === "reprovado") return "Reprovado";
    if (status === "pendente_envio") return "Pendente";
    return "Pendente";
}


/* ==================================================
   MOTORISTA — GERENCIAR VEÍCULOS
   CRIAR LINHA DE STATUS DOS DOCUMENTOS
================================================== */

function MOTORISTAPAG_Login_func_criarLinhaDocVeiculo(nome, status) {
    const linha = document.createElement("div");
    linha.className = "MOTORISTAPAG_Login_gerenciar_veiculos_doc_linha";

    const label = document.createElement("span");
    label.textContent = nome;

    const valor = document.createElement("span");
    valor.textContent = MOTORISTAPAG_Login_func_textoStatusDocumentoVeiculo(status);

    linha.appendChild(label);
    linha.appendChild(valor);

    return linha;
}


/* ==================================================
   MOTORISTA — GERENCIAR VEÍCULOS
   INICIAR CADASTRO DE NOVO VEÍCULO
================================================== */

function MOTORISTAPAG_Login_func_iniciarCadastroNovoVeiculo() {

    const modulo = document.getElementById(
        "MOTORISTAPAG_Login_gerenciar_veiculos_modulo"
    );

    if (!modulo) {
        console.error(
            "TNP MOB: módulo Gerenciar Veículos não encontrado."
        );
        return;
    }

    const telaAdicionar = modulo.querySelector(
        "#MOTORISTAPAG_Login_screen_adicionar_veiculo"
    );

    if (!telaAdicionar) {
        console.error(
            "TNP MOB: tela Adicionar Veículo não encontrada."
        );
        return;
    }

    /* ==============================================
       NAVEGAÇÃO INTERNA DO MÓDULO
    ============================================== */

    modulo.querySelectorAll(
        ".MOTORISTAPAG_Login_gerenciar_veiculos_etapa"
    ).forEach(function(tela) {
        tela.classList.remove("active");
    });

    telaAdicionar.classList.add("active");

    /* ==============================================
       LIMPAR MENSAGENS DE ERRO
    ============================================== */

    const erro = document.getElementById(
        "MOTORISTAPAG_Login_error_adicionar_veiculo"
    );

    if (erro) {
        erro.innerText = "";
        erro.style.display = "none";
    }

    /* ==============================================
       LIMPAR CAMPOS DO NOVO VEÍCULO
    ============================================== */

    const campos = [
        'MOTORISTAPAG_Login_input_novo_veiculo_placa',
        'MOTORISTAPAG_Login_input_novo_veiculo_renavam',
        'MOTORISTAPAG_Login_input_novo_veiculo_marca',
        'MOTORISTAPAG_Login_input_novo_veiculo_modelo',
        'MOTORISTAPAG_Login_input_novo_veiculo_cor',
        'MOTORISTAPAG_Login_input_novo_veiculo_ano',
        'MOTORISTAPAG_Login_select_novo_veiculo_categoria'
    ];

    campos.forEach(function(id) {
        const campo = document.getElementById(id);

        if (campo) {
            campo.value = "";
            campo.classList.remove('error');
        }
    });
}


/* ==================================================
   TNP MOB — GERENCIAR VEÍCULOS

   1. MÁSCARA DA PLACA DO NOVO VEÍCULO

   Mesma proteção do cadastro inicial.
================================================== */

function MOTORISTAPAG_Login_func_mascararPlacaNovoVeiculo(input) {

    if (!input) return;

    input.value = String(input.value || '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 7);
}


/* ==================================================
   TNP MOB — GERENCIAR VEÍCULOS

   2. VALIDAR PLACA DO NOVO VEÍCULO

   Padrão antigo: ABC1234
   Padrão Mercosul: ABC1D23
================================================== */

function MOTORISTAPAG_Login_func_validarPlacaNovoVeiculo(placa) {

    const placaLimpa = String(placa || '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');

    const padraoAntigo = /^[A-Z]{3}[0-9]{4}$/;
    const padraoMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

    return (
        padraoAntigo.test(placaLimpa) ||
        padraoMercosul.test(placaLimpa)
    );
}


/* ==================================================
   TNP MOB — GERENCIAR VEÍCULOS
   MÁSCARA DO RENAVAM DO NOVO VEÍCULO

   - Aceita somente números
   - Remove letras e símbolos imediatamente
   - Limita a 11 dígitos
================================================== */

function MOTORISTAPAG_Login_func_mascararRenavamNovoVeiculo(input) {

    if (!input) return;

    input.value = String(input.value || '')
        .replace(/\D/g, '')
        .slice(0, 11);

}


async function MOTORISTAPAG_Login_func_salvarNovoVeiculoDados() {
    const user = PRIMEIRAPAG_Login_auth.currentUser;
    const btn = document.getElementById('MOTORISTAPAG_Login_btn_salvar_novo_veiculo');
    const erroBox = document.getElementById('MOTORISTAPAG_Login_error_adicionar_veiculo');

    const inputPlaca = document.getElementById('MOTORISTAPAG_Login_input_novo_veiculo_placa');
    const inputRenavam = document.getElementById('MOTORISTAPAG_Login_input_novo_veiculo_renavam');
    const inputMarca = document.getElementById('MOTORISTAPAG_Login_input_novo_veiculo_marca');
    const inputModelo = document.getElementById('MOTORISTAPAG_Login_input_novo_veiculo_modelo');
    const inputCor = document.getElementById('MOTORISTAPAG_Login_input_novo_veiculo_cor');
    const inputAno = document.getElementById('MOTORISTAPAG_Login_input_novo_veiculo_ano');
    const selectCategoria = document.getElementById('MOTORISTAPAG_Login_select_novo_veiculo_categoria');

    const campos = [
        inputPlaca,
        inputRenavam,
        inputMarca,
        inputModelo,
        inputCor,
        inputAno,
        selectCategoria
    ];

    campos.forEach(function(campo) {
        if (campo) campo.classList.remove('error');
    });

    if (erroBox) {
        erroBox.innerText = "";
        erroBox.style.display = "none";
    }

    if (!user) {
        return PRIMEIRAPAG_Login_func_irPara('PRIMEIRAPAG_Login_screen_main');
    }

    const placa = inputPlaca ? inputPlaca.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
    const renavam = inputRenavam ? inputRenavam.value.trim().replace(/\D/g, '') : '';
    const marca = inputMarca ? inputMarca.value.trim() : '';
    const modelo = inputModelo ? inputModelo.value.trim() : '';
    const cor = inputCor ? inputCor.value.trim() : '';
    const ano = inputAno ? inputAno.value.trim().replace(/\D/g, '') : '';
    const categoria = selectCategoria ? selectCategoria.value : '';

    function mostrarErroVeiculo(mensagem, campo) {
        if (campo) campo.classList.add('error');

        if (erroBox) {
            erroBox.innerText = mensagem;
            erroBox.style.display = "block";
            erroBox.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
            alert(mensagem);
        }
    }

		
	if (!MOTORISTAPAG_Login_func_validarPlacaNovoVeiculo(placa)) {

		return mostrarErroVeiculo(
			'Informe uma placa válida no padrão ABC1234 ou ABC1D23.',
			inputPlaca
		);

	}


		
	/* ==================================================
	   TNP MOB — GERENCIAR VEÍCULOS

	   VALIDAR RENAVAM DO NOVO VEÍCULO

	   - Somente números após a limpeza
	   - Mínimo de 9 dígitos
	   - Máximo de 11 dígitos
	   - Campo obrigatório
	================================================== */

	if (renavam.length < 9 || renavam.length > 11) {

		return mostrarErroVeiculo(
			'Informe um Renavam válido.',
			inputRenavam
		);

	}


		
	/* ==================================================
	   TNP MOB — GERENCIAR VEÍCULOS
	   VALIDAR MARCA DO NOVO VEÍCULO

	   - Campo obrigatório
	   - Mínimo de 2 caracteres
	   - Máximo de 30 caracteres
	   - Espaços das extremidades removidos
	================================================== */

	if (marca.length < 2 || marca.length > 30) {

		return mostrarErroVeiculo(
			'Informe uma marca válida.',
			inputMarca
		);

	}


	   
	/* ==================================================
	   TNP MOB — GERENCIAR VEÍCULOS
	   VALIDAR MODELO DO NOVO VEÍCULO

	   - Campo obrigatório
	   - Mínimo de 2 caracteres
	   - Máximo de 40 caracteres
	   - Espaços das extremidades removidos
	================================================== */

	if (modelo.length < 2 || modelo.length > 40) {

		return mostrarErroVeiculo(
			'Informe um modelo válido.',
			inputModelo
		);

	}


		
	/* ==================================================
	   TNP MOB — GERENCIAR VEÍCULOS
	   VALIDAR COR DO NOVO VEÍCULO

	   - Campo obrigatório
	   - Mínimo de 3 caracteres
	   - Máximo de 25 caracteres
	   - Espaços das extremidades removidos
	================================================== */

	if (cor.length < 3 || cor.length > 25) {

		return mostrarErroVeiculo(
			'Informe uma cor válida.',
			inputCor
		);

	}


		
	/* ==================================================
	   TNP MOB — GERENCIAR VEÍCULOS
	   VALIDAR ANO DO NOVO VEÍCULO

	   - Somente números após a limpeza
	   - Exatamente 4 dígitos
	   - Ano mínimo: 1990
	   - Ano máximo: ano atual + 1
	   - Campo obrigatório
	================================================== */

	const anoAtual = new Date().getFullYear();

	if (
		!/^\d{4}$/.test(ano) ||
		Number(ano) < 1990 ||
		Number(ano) > anoAtual + 1
	) {

		return mostrarErroVeiculo(
			'Informe um ano válido entre 1990 e ' +
			(anoAtual + 1) + '.',
			inputAno
		);

	}


    if (!categoria) {
        return mostrarErroVeiculo('Selecione a categoria do veículo.', selectCategoria);
    }

    const textoOriginal = btn ? btn.innerText : 'CONTINUAR PARA DOCUMENTOS';

    try {
        if (btn) {
            btn.disabled = true;
            btn.innerText = 'SALVANDO...';
        }

        const motoristaRef = PRIMEIRAPAG_Login_db
            .collection('motoristas')
            .doc(user.uid);

        const docMotorista = await motoristaRef.get();
        const dados = docMotorista.exists ? docMotorista.data() : {};

        let veiculos = [];

        if (Array.isArray(dados.veiculos) && dados.veiculos.length > 0) {
            veiculos = dados.veiculos;
        } else if (dados.veiculo && dados.veiculo.placa) {
            veiculos = [
                {
                    id: "veiculo_1",
                    placa: dados.veiculo.placa || "",
                    renavam: dados.veiculo.renavam || "",
                    marca: dados.veiculo.marca || "",
                    modelo: dados.veiculo.modelo || "",
                    cor: dados.veiculo.cor || "",
                    ano: dados.veiculo.ano || "",
                    categoria: dados.veiculo.categoria || dados.veiculo.categoriaPrincipal || "",
                    categoriaPrincipal: dados.veiculo.categoriaPrincipal || dados.veiculo.categoria || "",
                    status: dados.documentosVeiculoStatus || "pendente_analise",
                    documentos: dados.documentosVeiculo || {},
                    documentosEnviados: dados.documentosVeiculoConcluidos === true,
                    emUso: false,
                    criadoEm: new Date(),
                    atualizadoEm: new Date()
                }
            ];
        }

        if (veiculos.length >= 3) {
            return mostrarErroVeiculo('Você já possui 3 veículos cadastrados. Exclua um veículo antes de adicionar outro.', null);
        }

        const placaJaExiste = veiculos.some(function(veiculo) {
            return String(veiculo.placa || '').toUpperCase() === placa;
        });

        if (placaJaExiste) {
            return mostrarErroVeiculo('Esta placa já está cadastrada na sua conta.', inputPlaca);
        }

        let proximoNumero = 1;

        veiculos.forEach(function(veiculo) {
            const id = String(veiculo.id || "");
            const numero = Number(id.replace("veiculo_", ""));

            if (!isNaN(numero) && numero >= proximoNumero) {
                proximoNumero = numero + 1;
            }
        });

        const novoVeiculoId = "veiculo_" + proximoNumero;

        const novoVeiculo = {
            id: novoVeiculoId,
            placa: placa,
            renavam: renavam,
            marca: marca,
            modelo: modelo,
            cor: cor,
            ano: ano,
            categoria: categoria,
            categoriaPrincipal: categoria,

            status: "pendente_envio",
            dadosConcluidos: true,
            documentosEnviados: false,
            emUso: false,

            documentos: {
                crlv: {
                    enviado: false,
                    status: "pendente_envio",
                    url: "",
                    caminho: "",
                    motivoReprovacao: ""
                },
                fotoVeiculoPlaca: {
                    enviado: false,
                    status: "pendente_envio",
                    url: "",
                    caminho: "",
                    motivoReprovacao: ""
                }
            },

            criadoEm: new Date(),
            atualizadoEm: new Date()
        };

        veiculos.push(novoVeiculo);

        await motoristaRef.set({
            veiculos: veiculos,
            veiculoCadastroAtualId: novoVeiculoId,
            atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        window.MOTORISTAPAG_Login_veiculoCadastroAtualId = novoVeiculoId;

        MOTORISTAPAG_Login_arquivoNovoVeiculoCrlvPendente = null;
        MOTORISTAPAG_Login_arquivoNovoVeiculoFotoPlacaPendente = null;
        MOTORISTAPAG_Login_novoVeiculoCrlvPronto = false;
        MOTORISTAPAG_Login_novoVeiculoFotoPlacaPronta = false;

				
		/* ==============================================
		   GERENCIAR VEÍCULOS
		   ABRIR ETAPA INTERNA — DOCUMENTOS
		============================================== */

		const modulo = document.getElementById(
			"MOTORISTAPAG_Login_gerenciar_veiculos_modulo"
		);

		const telaDocumentos = modulo
			? modulo.querySelector(
				"#MOTORISTAPAG_Login_screen_documentos_novo_veiculo"
			)
			: null;

		if (!telaDocumentos) {
			console.error(
				"TNP MOB: tela Documentos do Novo Veículo não encontrada."
			);
			return;
		}

		/* Desativar as outras etapas do módulo. */
		modulo.querySelectorAll(
			".MOTORISTAPAG_Login_gerenciar_veiculos_etapa"
		).forEach(function(tela) {
			tela.classList.remove("active");
		});

		/* Limpar a tela antes de exibi-la. */
		MOTORISTAPAG_Login_func_limparTelaDocumentosNovoVeiculo();

		/* Ativar a etapa Documentos. */
		telaDocumentos.classList.add("active");


    } catch (erro) {
        console.error('Erro ao salvar novo veículo:', erro);
        mostrarErroVeiculo('Não foi possível salvar o veículo agora. Tente novamente.', null);

    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerText = textoOriginal;
        }
    }
}



/* ==================================================
   TNP MOB — GERENCIAR VEÍCULOS
   RETOMAR DOCUMENTOS DO VEÍCULO PENDENTE
   FIREBASE É A FONTE OFICIAL.
================================================== */


/* ==================================================
   TNP MOB — MOTORISTA / GERENCIAR VEÍCULOS
   RETOMAR CADASTRO DE VEÍCULO PENDENTE

   - Firebase é a fonte oficial
   - Retoma somente o veículo selecionado
   - Não permite usar o fluxo de correção do Admin
   - Recupera os documentos já enviados
   - Libera FINALIZAR quando ambos estiverem prontos
   - Não altera outros veículos nem documentos
================================================== */

async function MOTORISTAPAG_Login_func_continuarCadastroNovoVeiculo(veiculoId) {

    const usuario = PRIMEIRAPAG_Login_auth.currentUser;

    const modulo = document.getElementById(
        'MOTORISTAPAG_Login_gerenciar_veiculos_modulo'
    );

    if (!usuario || !modulo || !veiculoId) {
        return;
    }

    const telaDocumentos = modulo.querySelector(
        '#MOTORISTAPAG_Login_screen_documentos_novo_veiculo'
    );

    if (!telaDocumentos) {
        console.error(
            'TNP MOB: tela de documentos não encontrada.'
        );
        return;
    }

    const btnFinal = modulo.querySelector(
        '#MOTORISTAPAG_Login_btn_enviar_documentos_novo_veiculo'
    );

    try {

        /* ==============================================
           1. IDENTIFICAR O VEÍCULO SELECIONADO
        ============================================== */

        veiculoId = String(veiculoId).trim();

        if (!veiculoId) {
            throw new Error('Veículo não identificado.');
        }

        const motoristaRef = PRIMEIRAPAG_Login_db
            .collection('motoristas')
            .doc(usuario.uid);

        /* ==============================================
           2. CONSULTAR E VALIDAR NO FIREBASE

           A seleção do cadastro é feita na mesma
           transação que confere o estado do veículo.
        ============================================== */

        const veiculo = await PRIMEIRAPAG_Login_db.runTransaction(
            async function(transacao) {

                const snapshot = await transacao.get(
                    motoristaRef
                );

                if (!snapshot.exists) {
                    throw new Error(
                        'Cadastro do motorista não encontrado.'
                    );
                }

                const dados = snapshot.data() || {};

                const veiculos = Array.isArray(dados.veiculos)
                    ? dados.veiculos
                    : [];

                const encontrado = veiculos.find(
                    function(item) {
                        return (
                            item &&
                            String(item.id) === veiculoId
                        );
                    }
                );

                if (!encontrado) {
                    throw new Error(
                        'Veículo não encontrado.'
                    );
                }

                const statusVeiculo = String(
                    encontrado.status || ''
                ).trim().toLowerCase();

                if (statusVeiculo !== 'pendente_envio') {
                    throw new Error(
                        'Este veículo não está pendente de cadastro.'
                    );
                }

                /* ======================================
                   3. SEPARAR CADASTRO DE CORREÇÃO

                   Um pedido de reenvio do Admin
                   utiliza outra função.
                ====================================== */

                const documentos = encontrado.documentos || {};

                const crlv = documentos.crlv || {};

                const foto = documentos.fotoVeiculoPlaca || {};

                function documentoEmCorrecao(doc) {

                    const status = String(
                        doc.status || ''
                    ).trim().toLowerCase();

                    if ([
                        'pendente_correcao',
                        'reprovado',
                        'recusado',
                        'corrigir'
                    ].includes(status)) {
                        return true;
                    }

                    return (
                        status === 'pendente_envio' &&
                        Boolean(
                            doc.solicitadoEm ||
                            doc.reprovadoEm ||
                            doc.reprovadoPor
                        )
                    );
                }

                const pendenciaAdmin =
                    String(
                        dados.pendenciaAdminVeiculoId || ''
                    ) === veiculoId &&

                    [
                        'crlv',
                        'fotoVeiculoPlaca'
                    ].includes(
                        String(
                            dados.pendenciaAdminVeiculoDocumento || ''
                        )
                    );

                if (
                    documentoEmCorrecao(crlv) ||
                    documentoEmCorrecao(foto) ||
                    pendenciaAdmin
                ) {
                    throw new Error(
                        'Existe uma correção solicitada pelo administrador. ' +
                        'Volte à lista e utilize CORRIGIR VEÍCULO.'
                    );
                }

                /* ======================================
                   4. REGISTRAR VEÍCULO DO CADASTRO

                   Não altera veículo em uso,
                   nem documentos, nem status.
                ====================================== */

                if (
                    String(
                        dados.veiculoCadastroAtualId || ''
                    ) !== veiculoId
                ) {

                    transacao.update(motoristaRef, {
                        veiculoCadastroAtualId: veiculoId
                    });
                }

                return encontrado;
            }
        );

        /* ==============================================
           5. IDENTIFICAR DOCUMENTOS OFICIAIS
        ============================================== */

        const documentos = veiculo.documentos || {};

        const crlv = documentos.crlv || {};

        const foto = documentos.fotoVeiculoPlaca || {};

        const statusAceitos = [
            'pendente_analise',
            'enviado_analise',
            'em_analise',
            'aprovado'
        ];

        function documentoConfirmado(documento) {

            const status = String(
                documento.status || ''
            ).trim().toLowerCase();

            return (
                documento.enviado === true &&
                Boolean(documento.url) &&
                Boolean(documento.caminho) &&
                statusAceitos.includes(status)
            );
        }

        const crlvPronto = documentoConfirmado(crlv);

        const fotoPronta = documentoConfirmado(foto);

        /* ==============================================
           6. ENCERRAR CORREÇÃO VISUAL ANTERIOR
        ============================================== */

        delete modulo.dataset.veiculoCorrecaoId;
        delete modulo.dataset.correcaoCrlv;
        delete modulo.dataset.correcaoFotoVeiculoPlaca;

        /* ==============================================
           7. LIMPAR ARQUIVOS TEMPORÁRIOS

           Não exclui documentos salvos.
        ============================================== */

        MOTORISTAPAG_Login_func_limparTelaDocumentosNovoVeiculo();

        /* ==============================================
           8. DEFINIR CADASTRO ATUAL NA MEMÓRIA
        ============================================== */

        window.MOTORISTAPAG_Login_veiculoCadastroAtualId =
            veiculoId;

        MOTORISTAPAG_Login_novoVeiculoCrlvPronto =
            crlvPronto;

        MOTORISTAPAG_Login_novoVeiculoFotoPlacaPronta =
            fotoPronta;

        /* ==============================================
           9. RESTAURAR DOCUMENTOS ENVIADOS
        ============================================== */

        function mostrarDocumentoEnviado(sufixo, documento) {

            const areaEnviado = modulo.querySelector(
                '#MOTORISTAPAG_Login_enviado_novo_veiculo_' +
                sufixo
            );

            const status = modulo.querySelector(
                '#MOTORISTAPAG_Login_status_novo_veiculo_' +
                sufixo
            );

            if (areaEnviado) {
                areaEnviado.classList.remove('TNP_hidden');
            }

            if (status) {

                status.innerText =
                    String(
                        documento.status || ''
                    ).toLowerCase() === 'aprovado'
                        ? 'Aprovado'
                        : 'Enviado';
            }
        }

        if (crlvPronto) {
            mostrarDocumentoEnviado('crlv', crlv);
        }

        if (fotoPronta) {
            mostrarDocumentoEnviado('foto_placa', foto);
        }

        /* ==============================================
           10. ATUALIZAR CONTROLES DOS DOCUMENTOS
        ============================================== */

        MOTORISTAPAG_Login_func_atualizarOpcoesCrlvNovoVeiculo();

        MOTORISTAPAG_Login_func_atualizarBloqueioFotoVeiculo();

        /* ==============================================
           11. ABRIR ETAPA DE DOCUMENTOS
        ============================================== */

        modulo.querySelectorAll(
            '.MOTORISTAPAG_Login_gerenciar_veiculos_etapa'
        ).forEach(function(tela) {
            tela.classList.remove('active');
        });

        telaDocumentos.classList.add('active');

        /* ==============================================
           12. VERIFICAR LIBERAÇÃO DA FINALIZAÇÃO

           Esta função já existe no módulo.
           Não duplicar a regra dos botões.
        ============================================== */

        MOTORISTAPAG_Login_func_verificarLiberarEnviarDocumentosNovoVeiculo();

        console.info(
            'TNP MOB — Cadastro de veículo retomado:',
            {
                veiculoId: veiculoId,
                crlvPronto: crlvPronto,
                fotoPronta: fotoPronta,
                podeFinalizar:
                    crlvPronto &&
                    fotoPronta &&
                    btnFinal?.disabled === false
            }
        );

    } catch (erro) {

        console.error(
            'Erro ao continuar cadastro do veículo:',
            erro
        );

        alert(
            erro.message ||
            'Não foi possível retomar os documentos deste veículo.'
        );
    }
}



/* ==================================================
   MOTORISTA — GERENCIAR VEÍCULOS
   LIMPAR TELA DE DOCUMENTOS DO NOVO VEÍCULO
================================================== */


/* ==================================================
   TNP MOB — MOTORISTA
   GERENCIAR VEÍCULOS

   PASSO 157
   LIMPAR E PREPARAR DOCUMENTOS DO NOVO VEÍCULO

   ESTADO INICIAL:
   - CRLV pendente
   - Foto do veículo pendente
   - Prévia oculta
   - Confirmação oculta
   - Estado enviado oculto
   - Botão de conclusão desabilitado

   NÃO ALTERA O FIREBASE.
================================================== */

function MOTORISTAPAG_Login_func_limparTelaDocumentosNovoVeiculo() {

    const modulo = document.getElementById(
        'MOTORISTAPAG_Login_gerenciar_veiculos_modulo'
    );

    if (!modulo) return;

    function buscar(id) {
        return modulo.querySelector('#' + id);
    }


    /* ==============================================
       1. LIMPAR MENSAGENS DE ERRO
    ============================================== */

    const erroBox = buscar(
        'MOTORISTAPAG_Login_error_documentos_novo_veiculo'
    );

    if (erroBox) {
        erroBox.innerText = '';
        erroBox.style.display = 'none';
    }


    /* ==============================================
       2. LIBERAR URLs TEMPORÁRIAS
          E LIMPAR PRÉVIAS DAS FOTOS
    ============================================== */

    const idsPreview = [
        'MOTORISTAPAG_Login_preview_novo_veiculo_crlv',
        'MOTORISTAPAG_Login_preview_novo_veiculo_foto_placa'
    ];

    idsPreview.forEach(function(id) {

        const imagem = buscar(id);

        if (!imagem) return;

        const urlAnterior = imagem.getAttribute('src');

        if (
            urlAnterior &&
            urlAnterior.startsWith('blob:')
        ) {
            URL.revokeObjectURL(urlAnterior);
        }

        imagem.removeAttribute('src');
        imagem.style.display = 'none';

    });


		
	/* ==============================================
	   3. LIMPAR PRÉVIA DO PDF
	============================================== */

	const previewPdf = buscar(
		'MOTORISTAPAG_Login_preview_pdf_novo_veiculo_crlv'
	);

	const nomePdf = buscar(
		'MOTORISTAPAG_Login_nome_pdf_novo_veiculo_crlv'
	);

	const visualizacaoPdf = buscar(
		'MOTORISTAPAG_Login_visualizacao_pdf_novo_veiculo_crlv'
	);

	if (previewPdf) {
		previewPdf.classList.add('TNP_hidden');
	}

	if (visualizacaoPdf) {
		const urlAnterior = visualizacaoPdf.getAttribute('src');

		visualizacaoPdf.src = 'about:blank';

		if (urlAnterior && urlAnterior.startsWith('blob:')) {
			URL.revokeObjectURL(urlAnterior);
		}
	}

	if (nomePdf) {
		nomePdf.innerText = 'CRLV.pdf';
	}



    /* ==============================================
       4. OCULTAR ÁREAS DE PRÉVIA

       SERÃO EXIBIDAS QUANDO O MOTORISTA
       SELECIONAR FOTO OU PDF.
    ============================================== */

    const idsAreasPrevia = [
        'MOTORISTAPAG_Login_area_previa_novo_veiculo_crlv',
        'MOTORISTAPAG_Login_area_previa_novo_veiculo_foto_placa'
    ];

    idsAreasPrevia.forEach(function(id) {

        const area = buscar(id);

        if (area) {
            area.classList.add('TNP_hidden');
        }

    });


    /* ==============================================
       5. OCULTAR BOTÕES DE CONFIRMAÇÃO
    ============================================== */

    const idsConfirmacao = [
        'MOTORISTAPAG_Login_confirmacao_novo_veiculo_crlv',
        'MOTORISTAPAG_Login_confirmacao_novo_veiculo_foto_placa'
    ];

    idsConfirmacao.forEach(function(id) {

        const area = buscar(id);

        if (area) {
            area.classList.add('TNP_hidden');
        }

    });


    /* ==============================================
       6. OCULTAR ESTADO ENVIADO
    ============================================== */

    const idsEnviados = [
        'MOTORISTAPAG_Login_enviado_novo_veiculo_crlv',
        'MOTORISTAPAG_Login_enviado_novo_veiculo_foto_placa'
    ];

    idsEnviados.forEach(function(id) {

        const area = buscar(id);

        if (area) {
            area.classList.add('TNP_hidden');
        }

    });


    /* ==============================================
       7. RESTAURAR STATUS INICIAIS
    ============================================== */

    const idsStatus = [
        'MOTORISTAPAG_Login_status_novo_veiculo_crlv',
        'MOTORISTAPAG_Login_status_novo_veiculo_foto_placa'
    ];

    idsStatus.forEach(function(id) {

        const status = buscar(id);

        if (status) {
            status.innerText = 'Pendente de envio';
        }

    });


    /* ==============================================
       8. LIMPAR INFORMAÇÕES DE COMPRESSÃO
    ============================================== */

    const idsCompressao = [
        'MOTORISTAPAG_Login_info_compressao_novo_veiculo_crlv',
        'MOTORISTAPAG_Login_info_compressao_novo_veiculo_foto_placa'
    ];

    idsCompressao.forEach(function(id) {

        const info = buscar(id);

        if (info) {
            info.innerText = '';
            info.style.display = 'none';
        }

    });


    /* ==============================================
       9. LIMPAR INPUTS DE ARQUIVOS
    ============================================== */

    const idsInputs = [
        'MOTORISTAPAG_Login_input_novo_veiculo_crlv',
        'MOTORISTAPAG_Login_input_novo_veiculo_crlv_pdf',
        'MOTORISTAPAG_Login_input_novo_veiculo_foto_placa'
    ];

    idsInputs.forEach(function(id) {

        const input = buscar(id);

        if (input) {
            input.value = '';
        }

    });


    /* ==============================================
       10. RESTAURAR BOTÕES DE ESCOLHA

       FOTO E PDF DO CRLV PERMANECEM
       COMO DUAS OPÇÕES INDEPENDENTES.
    ============================================== */

    const botoesEscolha = [
        {
            id: 'MOTORISTAPAG_Login_btn_novo_veiculo_crlv',
            texto: '📷 TIRAR FOTO DO CRLV'
        },
        {
            id: 'MOTORISTAPAG_Login_btn_novo_veiculo_crlv_pdf',
            texto: '📄 ENVIAR PDF DO CRLV'
        },
        {
            id: 'MOTORISTAPAG_Login_btn_novo_veiculo_foto_placa',
            texto: '📷 TIRAR FOTO DO VEÍCULO'
        }
    ];

    botoesEscolha.forEach(function(config) {

        const botao = buscar(config.id);

        if (botao) {
            botao.disabled = false;
            botao.innerText = config.texto;
        }

    });


    /* ==============================================
       11. RESTAURAR BOTÕES DE CONFIRMAÇÃO
    ============================================== */

    const botoesConfirmar = [
        {
            id: 'MOTORISTAPAG_Login_btn_confirmar_novo_veiculo_crlv',
            texto: 'CONFIRMAR E ENVIAR CRLV'
        },
        {
            id: 'MOTORISTAPAG_Login_btn_confirmar_novo_veiculo_foto_placa',
            texto: 'CONFIRMAR E ENVIAR FOTO'
        },
        {
            id: 'MOTORISTAPAG_Login_btn_trocar_novo_veiculo_crlv',
            texto: 'TROCAR ARQUIVO'
        },
        {
            id: 'MOTORISTAPAG_Login_btn_trocar_novo_veiculo_foto_placa',
            texto: 'TROCAR FOTO'
        }
    ];

    botoesConfirmar.forEach(function(config) {

        const botao = buscar(config.id);

        if (botao) {
            botao.disabled = false;
            botao.innerText = config.texto;
        }

    });


    /* ==============================================
       12. LIMPAR ARQUIVOS TEMPORÁRIOS

       SOMENTE MEMÓRIA LOCAL.
       NÃO EXCLUI DOCUMENTOS DO FIREBASE.
    ============================================== */

    MOTORISTAPAG_Login_arquivoNovoVeiculoCrlvPendente = null;

    MOTORISTAPAG_Login_arquivoNovoVeiculoFotoPlacaPendente = null;

    MOTORISTAPAG_Login_novoVeiculoCrlvPronto = false;

    MOTORISTAPAG_Login_novoVeiculoFotoPlacaPronta = false;


    /* ==============================================
       13. RESTAURAR BOTÃO DO RODAPÉ
    ============================================== */

    const btnEnviar = buscar(
        'MOTORISTAPAG_Login_btn_enviar_documentos_novo_veiculo'
    );

    if (btnEnviar) {
        btnEnviar.disabled = true;
        btnEnviar.innerText = 'AGUARDANDO DOCUMENTOS';
    }
	
	MOTORISTAPAG_Login_func_atualizarOpcoesCrlvNovoVeiculo();

}



/* ==================================================
   MOTORISTA — GERENCIAR VEÍCULOS
   ESTADO DOS DOCUMENTOS DO NOVO VEÍCULO
================================================== */

let MOTORISTAPAG_Login_arquivoNovoVeiculoCrlvPendente = null;
let MOTORISTAPAG_Login_arquivoNovoVeiculoFotoPlacaPendente = null;

let MOTORISTAPAG_Login_novoVeiculoCrlvPronto = false;
let MOTORISTAPAG_Login_novoVeiculoFotoPlacaPronta = false;


/* ==================================================
   TNP MOB — GERENCIAR VEÍCULOS

   PASSO 160
   CONTROLAR OPÇÕES DE FOTO OU PDF DO CRLV

   NÃO MODIFICA FIREBASE.
================================================== */


/* ==================================================
   TNP MOB — MOTORISTA
   GERENCIAR VEÍCULOS

   CONTROLAR OPÇÕES DO CRLV

   - Cadastro normal de veículo
   - Correção individual de documento
   - Preserva documento aprovado
   - Permite foto ou PDF do CRLV
   - Não altera Firebase nem Storage
================================================== */

function MOTORISTAPAG_Login_func_atualizarOpcoesCrlvNovoVeiculo() {

    const modulo = document.getElementById(
        "MOTORISTAPAG_Login_gerenciar_veiculos_modulo"
    );

    if (!modulo) return;

    const btnFoto = modulo.querySelector(
        "#MOTORISTAPAG_Login_btn_novo_veiculo_crlv"
    );

    const btnPdf = modulo.querySelector(
        "#MOTORISTAPAG_Login_btn_novo_veiculo_crlv_pdf"
    );

    const inputFoto = modulo.querySelector(
        "#MOTORISTAPAG_Login_input_novo_veiculo_crlv"
    );

    const inputPdf = modulo.querySelector(
        "#MOTORISTAPAG_Login_input_novo_veiculo_crlv_pdf"
    );

    if (!btnFoto || !btnPdf) return;

    /* ==============================================
       1. IDENTIFICAR MODO DE CORREÇÃO
    ============================================== */

    const veiculoCorrecaoId = String(
        modulo.dataset.veiculoCorrecaoId || ""
    ).trim();

    const emCorrecao = Boolean(veiculoCorrecaoId);

    const corrigirCrlv =
        modulo.dataset.correcaoCrlv === "true";

    /* ==============================================
       2. IDENTIFICAR ESTADOS
    ============================================== */

    const dadosPendente =
        MOTORISTAPAG_Login_arquivoNovoVeiculoCrlvPendente;

    const crlvEnviado =
        MOTORISTAPAG_Login_novoVeiculoCrlvPronto === true;

    /* ==============================================
       3. PROTEGER CRLV NÃO AUTORIZADO

       No modo de correção, somente o documento
       solicitado pelo Admin pode ser selecionado.
    ============================================== */

    if (emCorrecao && !corrigirCrlv) {

        btnFoto.disabled = true;
        btnPdf.disabled = true;

        btnFoto.style.display = "none";
        btnPdf.style.display = "none";

        if (inputFoto) {
            inputFoto.disabled = true;
        }

        if (inputPdf) {
            inputPdf.disabled = true;
        }

        return;
    }

    /* ==============================================
       4. MANTER INTEGRAÇÃO DO CADASTRO NORMAL

       A função da foto do veículo será adaptada
       separadamente para o modo de correção.
    ============================================== */

    if (!emCorrecao) {
        MOTORISTAPAG_Login_func_atualizarBloqueioFotoVeiculo();
    }

    /* ==============================================
       5. DOCUMENTO JÁ ENVIADO OU APROVADO

       Não permitir nova seleção.
    ============================================== */

    if (crlvEnviado) {

        btnFoto.disabled = true;
        btnPdf.disabled = true;

        btnFoto.style.display = "none";
        btnPdf.style.display = "none";

        if (inputFoto) {
            inputFoto.disabled = true;
        }

        if (inputPdf) {
            inputPdf.disabled = true;
        }

        return;
    }

    /* ==============================================
       6. LIBERAR INPUTS AUTORIZADOS
    ============================================== */

    if (inputFoto) {
        inputFoto.disabled = false;
    }

    if (inputPdf) {
        inputPdf.disabled = false;
    }

    /* ==============================================
       7. IDENTIFICAR ARQUIVO SELECIONADO
    ============================================== */

    let tipoAtual = "";

    if (dadosPendente) {

        const ehPdf =
            dadosPendente.tipoArquivo === "pdf" ||
            dadosPendente.contentType === "application/pdf" ||
            (
                dadosPendente.arquivoOriginal &&
                dadosPendente.arquivoOriginal.type ===
                    "application/pdf"
            );

        tipoAtual = ehPdf ? "pdf" : "foto";
    }

    /* ==============================================
       8. NENHUM ARQUIVO SELECIONADO

       Mostrar foto e PDF.
    ============================================== */

    if (tipoAtual === "") {

        btnFoto.style.display = "";
        btnFoto.disabled = false;
        btnFoto.innerText = "📷 TIRAR FOTO DO CRLV";

        btnPdf.style.display = "";
        btnPdf.disabled = false;
        btnPdf.innerText = "📄 ENVIAR PDF DO CRLV";

        return;
    }

    /* ==============================================
       9. PDF SELECIONADO

       Permitir trocar por foto.
    ============================================== */

    if (tipoAtual === "pdf") {

        btnFoto.style.display = "";
        btnFoto.disabled = false;
        btnFoto.innerText = "📷 TROCAR POR FOTO";

        btnPdf.style.display = "none";
        btnPdf.disabled = true;

        return;
    }

    /* ==============================================
       10. FOTO SELECIONADA

       Permitir trocar por PDF.
    ============================================== */

    if (tipoAtual === "foto") {

        btnFoto.style.display = "none";
        btnFoto.disabled = true;

        btnPdf.style.display = "";
        btnPdf.disabled = false;
        btnPdf.innerText = "📄 TROCAR POR PDF DO CRLV";

        return;
    }
}



/* ==================================================
   TNP MOB — MOTORISTA
   GERENCIAR VEÍCULOS

   PASSO 161
   BLOQUEAR FOTO DO VEÍCULO ATÉ O CRLV SER ENVIADO

   NÃO ALTERA FIREBASE.
================================================== */


/* ==================================================
   TNP MOB — MOTORISTA
   GERENCIAR VEÍCULOS

   CONTROLAR FOTO DO VEÍCULO

   CADASTRO NORMAL:
   - Aguarda o CRLV ser enviado
   - Libera a foto quando o CRLV está pronto
   - Bloqueia foto já enviada

   MODO DE CORREÇÃO:
   - Respeita os documentos autorizados pelo Admin
   - Preserva documentos aprovados
   - Permite corrigir somente a foto recusada
   - Aguarda o CRLV se ambos foram recusados
   - Preserva o motivo exibido pelo Admin

   NÃO ALTERA FIREBASE NEM STORAGE.
================================================== */

function MOTORISTAPAG_Login_func_atualizarBloqueioFotoVeiculo() {

    const modulo = document.getElementById(
        "MOTORISTAPAG_Login_gerenciar_veiculos_modulo"
    );

    if (!modulo) return;

    /* ==============================================
       1. IDENTIFICAR ELEMENTOS
    ============================================== */

    const botaoFoto = modulo.querySelector(
        "#MOTORISTAPAG_Login_btn_novo_veiculo_foto_placa"
    );

    const inputFoto = modulo.querySelector(
        "#MOTORISTAPAG_Login_input_novo_veiculo_foto_placa"
    );

    const statusFoto = modulo.querySelector(
        "#MOTORISTAPAG_Login_status_novo_veiculo_foto_placa"
    );

    /* ==============================================
       2. IDENTIFICAR MODO DE CORREÇÃO
    ============================================== */

    const veiculoCorrecaoId = String(
        modulo.dataset.veiculoCorrecaoId || ""
    ).trim();

    const emCorrecao = Boolean(veiculoCorrecaoId);

    const corrigirFoto =
        modulo.dataset.correcaoFotoVeiculoPlaca === "true";

    /* ==============================================
       3. CONSULTAR ESTADOS DOS DOCUMENTOS
    ============================================== */

    const crlvEnviado =
        MOTORISTAPAG_Login_novoVeiculoCrlvPronto === true;

    const fotoEnviada =
        MOTORISTAPAG_Login_novoVeiculoFotoPlacaPronta === true;

    const fotoEmPrevia =
        MOTORISTAPAG_Login_arquivoNovoVeiculoFotoPlacaPendente !== null;

    /* ==============================================
       4. PROTEGER FOTO NÃO AUTORIZADA

       Se estamos em correção e o Admin não
       solicitou essa foto, não permitir seleção.

       Exemplo:
       CRLV recusado + foto aprovada.
    ============================================== */

    if (emCorrecao && !corrigirFoto) {

        if (inputFoto) {
            inputFoto.disabled = true;
        }

        if (botaoFoto) {
            botaoFoto.disabled = true;
            botaoFoto.style.display = "none";
        }

        return;
    }

    /* ==============================================
       5. CONTROLAR INPUT DA FOTO

       Requisitos:
       - CRLV pronto
       - Foto ainda não enviada

       Em correção, o CRLV pronto representa
       o CRLV aprovado ou reenviado.
    ============================================== */

    const liberarFoto =
        crlvEnviado && !fotoEnviada;

    if (inputFoto) {
        inputFoto.disabled = !liberarFoto;
    }

    /* ==============================================
       6. CONTROLAR BOTÃO DA FOTO
    ============================================== */

    if (botaoFoto) {

        /* Foto já enviada ou aprovada. */

        if (fotoEnviada) {

            botaoFoto.disabled = true;
            botaoFoto.style.display = "none";

        }

        /* CRLV ainda não está pronto. */

        else if (!crlvEnviado) {

            botaoFoto.disabled = true;
            botaoFoto.style.display = "";

            botaoFoto.innerText =
                "🔒 AGUARDANDO CRLV";

        }

        /* Foto autorizada para seleção. */

        else {

            botaoFoto.disabled = false;
            botaoFoto.style.display = "";

            botaoFoto.innerText =
                emCorrecao
                    ? "📷 CORRIGIR FOTO DO VEÍCULO"
                    : "📷 TIRAR FOTO DO VEÍCULO";
        }
    }

    /* ==============================================
       7. PRESERVAR MENSAGEM DO ADMIN

       No modo de correção, o motivo exibido
       pela função abrirCorrecaoVeiculo()
       não deve ser substituído.
    ============================================== */

    if (emCorrecao) {
        return;
    }

    /* ==============================================
       8. ATUALIZAR STATUS DO CADASTRO NORMAL

       Não apagar informações de fotos
       já preparadas ou enviadas.
    ============================================== */

    if (
        statusFoto &&
        !fotoEnviada &&
        !fotoEmPrevia
    ) {

        statusFoto.innerText =
            crlvEnviado
                ? "Pendente de envio"
                : "Aguardando envio do CRLV";
    }
}



/* ==================================================
   MOTORISTA — GERENCIAR VEÍCULOS
   ABRIR CÂMERA PARA DOCUMENTO DO NOVO VEÍCULO
================================================== */

function MOTORISTAPAG_Login_func_abrirCameraDocumentoNovoVeiculo(tipoDocumento) {
    let input = null;

    if (tipoDocumento === 'crlv') {
        input = document.getElementById('MOTORISTAPAG_Login_input_novo_veiculo_crlv');
    }

    if (tipoDocumento === 'fotoVeiculoPlaca') {
        input = document.getElementById('MOTORISTAPAG_Login_input_novo_veiculo_foto_placa');
    }

    if (!input) {
        console.error('Input do documento do novo veículo não encontrado:', tipoDocumento);

        const erroBox = document.getElementById('MOTORISTAPAG_Login_error_documentos_novo_veiculo');

        if (erroBox) {
            erroBox.innerText = 'Erro interno: campo de foto não encontrado.';
            erroBox.style.display = 'block';
        }

        return;
    }

    input.click();
}


/* ==================================================
   MOTORISTA — GERENCIAR VEÍCULOS
   FORMATAR TAMANHO DOS ARQUIVOS
================================================== */

function MOTORISTAPAG_Login_func_formatarTamanhoArquivoNovoVeiculo(bytes) {
    if (!bytes || bytes <= 0) {
        return "0 KB";
    }

    if (bytes < 1024 * 1024) {
        return Math.round(bytes / 1024) + " KB";
    }

    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}


/* ==================================================
   MOTORISTA — GERENCIAR VEÍCULOS
   COMPRIMIR IMAGEM DO NOVO VEÍCULO
================================================== */

function MOTORISTAPAG_Login_func_comprimirImagemNovoVeiculo(arquivo, qualidade, larguraMaxima, alturaMaxima) {
    return new Promise(function(resolve, reject) {
        const leitor = new FileReader();

        leitor.onload = function(evento) {
            const imagem = new Image();

            imagem.onload = function() {
                let largura = imagem.width;
                let altura = imagem.height;

                if (largura > larguraMaxima || altura > alturaMaxima) {
                    const proporcao = Math.min(
                        larguraMaxima / largura,
                        alturaMaxima / altura
                    );

                    largura = Math.round(largura * proporcao);
                    altura = Math.round(altura * proporcao);
                }

                const canvas = document.createElement("canvas");
                canvas.width = largura;
                canvas.height = altura;

                const contexto = canvas.getContext("2d");
                contexto.drawImage(imagem, 0, 0, largura, altura);

                canvas.toBlob(
                    function(blob) {
                        if (!blob) {
                            reject(new Error("Não foi possível comprimir a imagem."));
                            return;
                        }

                        const arquivoCompactado = new File(
                            [blob],
                            "novo_veiculo_" + Date.now() + ".jpg",
                            { type: "image/jpeg" }
                        );

                        resolve(arquivoCompactado);
                    },
                    "image/jpeg",
                    qualidade || 0.7
                );
            };

            imagem.onerror = function() {
                reject(new Error("Não foi possível carregar a imagem."));
            };

            imagem.src = evento.target.result;
        };

        leitor.onerror = function() {
            reject(new Error("Não foi possível ler o arquivo."));
        };

        leitor.readAsDataURL(arquivo);
    });
}


/* ==================================================
   TNP MOB — MOTORISTA
   GERENCIAR VEÍCULOS

   PASSO 158
   PREPARAR FOTO DO NOVO VEÍCULO

   FOTO → COMPRESSÃO → PRÉVIA → CONFIRMAÇÃO

   NÃO ENVIA AO FIREBASE NESTA ETAPA.
================================================== */


/* ==================================================
   TNP MOB — MOTORISTA / GERENCIAR VEÍCULOS
   PREPARAR IMAGEM: CADASTRO OU CORREÇÃO

   Somente memória e interface. Não envia ao Firebase.
   A confirmação revalida a situação oficial do documento.
================================================== */

async function MOTORISTAPAG_Login_func_prepararDocumentoNovoVeiculo(event, tipoDocumento) {

    const input = event && event.target ? event.target : null;
    const arquivoOriginal = input?.files?.[0] || null;

    if (!arquivoOriginal) return;

    const modulo = document.getElementById(
        'MOTORISTAPAG_Login_gerenciar_veiculos_modulo'
    );

    if (!modulo) {
        input.value = '';
        return;
    }

    const buscar = id => modulo.querySelector('#' + id);

    const erroBox = buscar(
        'MOTORISTAPAG_Login_error_documentos_novo_veiculo'
    );

    function mostrarErro(mensagem) {
        MOTORISTAPAG_Login_func_mostrarErroDocumentoNovoVeiculo(mensagem);

        if (input) input.value = '';
    }

    /* ==============================================
       1. VALIDAR TIPO DE DOCUMENTO
    ============================================== */

    if (
        tipoDocumento !== 'crlv' &&
        tipoDocumento !== 'fotoVeiculoPlaca'
    ) {
        mostrarErro('Tipo de documento inválido.');
        return;
    }

    const ehCrlv = tipoDocumento === 'crlv';
    const sufixo = ehCrlv ? 'crlv' : 'foto_placa';

    /* ==============================================
       2. IDENTIFICAR MODO DE CORREÇÃO
    ============================================== */

    const veiculoCorrecaoId = String(
        modulo.dataset.veiculoCorrecaoId || ''
    ).trim();

    const emCorrecao = Boolean(veiculoCorrecaoId);

    const chavePermissao = ehCrlv
        ? 'correcaoCrlv'
        : 'correcaoFotoVeiculoPlaca';

    /* A autorização da tela é uma primeira proteção.
       O envio consultará novamente o Firebase. */

    if (
        emCorrecao &&
        modulo.dataset[chavePermissao] !== 'true'
    ) {
        mostrarErro(
            'O administrador não solicitou a correção deste documento.'
        );
        return;
    }

    /* ==============================================
       3. PROTEGER DOCUMENTOS JÁ ENVIADOS
    ============================================== */

    if (
        (ehCrlv &&
            MOTORISTAPAG_Login_novoVeiculoCrlvPronto === true) ||
        (!ehCrlv &&
            MOTORISTAPAG_Login_novoVeiculoFotoPlacaPronta === true)
    ) {
        mostrarErro(
            'Este documento já foi enviado ou aprovado. ' +
            'Não é permitido substituí-lo.'
        );
        return;
    }

    /* ==============================================
       4. RESPEITAR SEQUÊNCIA DO CRLV
    ============================================== */

    if (
        !ehCrlv &&
        MOTORISTAPAG_Login_novoVeiculoCrlvPronto !== true
    ) {
        mostrarErro(
            'Confirme e envie o CRLV antes de fotografar o veículo.'
        );
        return;
    }

    /* ==============================================
       5. VALIDAR IMAGEM
    ============================================== */

    if (
        !arquivoOriginal.type ||
        !arquivoOriginal.type.startsWith('image/')
    ) {
        mostrarErro(
            'Envie apenas arquivos de imagem nesta opção.'
        );
        return;
    }

    if (!arquivoOriginal.size || arquivoOriginal.size <= 0) {
        mostrarErro('A imagem selecionada está vazia.');
        return;
    }

    /* ==============================================
       6. IDENTIFICAR ELEMENTOS DA TELA
    ============================================== */

    const preview = buscar(
        'MOTORISTAPAG_Login_preview_novo_veiculo_' + sufixo
    );

    const status = buscar(
        'MOTORISTAPAG_Login_status_novo_veiculo_' + sufixo
    );

    const infoCompressao = buscar(
        'MOTORISTAPAG_Login_info_compressao_novo_veiculo_' + sufixo
    );

    const areaPrevia = buscar(
        'MOTORISTAPAG_Login_area_previa_novo_veiculo_' + sufixo
    );

    const areaConfirmacao = buscar(
        'MOTORISTAPAG_Login_confirmacao_novo_veiculo_' + sufixo
    );

    const areaEnviado = buscar(
        'MOTORISTAPAG_Login_enviado_novo_veiculo_' + sufixo
    );

    const btnConfirmar = buscar(
        'MOTORISTAPAG_Login_btn_confirmar_novo_veiculo_' + sufixo
    );

    const statusAnterior = status
        ? status.innerText
        : 'Pendente de envio';

    /* Identificar troca de veículo durante a compressão. */

    const cadastroIdInicial = String(
        window.MOTORISTAPAG_Login_veiculoCadastroAtualId || ''
    ).trim();

    try {

        /* ==========================================
           7. PREPARAR IMAGEM
        ========================================== */

        if (btnConfirmar) {
            btnConfirmar.disabled = true;
        }

        if (status) {
            status.innerText = 'Preparando imagem...';
        }

        const arquivoCompactado =
            await MOTORISTAPAG_Login_func_comprimirImagemNovoVeiculo(
                arquivoOriginal,
                0.7,
                900,
                900
            );

        /* ==========================================
           8. VERIFICAR SE O VEÍCULO MUDOU

           Evita aplicar uma compressão antiga
           a outro veículo selecionado.
        ========================================== */

        const correcaoAtual = String(
            modulo.dataset.veiculoCorrecaoId || ''
        ).trim();

        const cadastroAtual = String(
            window.MOTORISTAPAG_Login_veiculoCadastroAtualId || ''
        ).trim();

        if (
            correcaoAtual !== veiculoCorrecaoId ||
            (!emCorrecao && cadastroAtual !== cadastroIdInicial) ||
            (emCorrecao &&
                modulo.dataset[chavePermissao] !== 'true')
        ) {
            return;
        }

        if (
            (ehCrlv &&
                MOTORISTAPAG_Login_novoVeiculoCrlvPronto === true) ||
            (!ehCrlv &&
                MOTORISTAPAG_Login_novoVeiculoFotoPlacaPronta === true)
        ) {
            return;
        }

        /* ==========================================
           9. GUARDAR ARQUIVO TEMPORÁRIO
        ========================================== */

        const tamanhoOriginal = arquivoOriginal.size;
        const tamanhoFinal = arquivoCompactado.size;
        const economia = tamanhoOriginal - tamanhoFinal;

        const dadosPendente = {
            arquivoOriginal: arquivoOriginal,
            arquivoCompactado: arquivoCompactado,
            tamanhoOriginal: tamanhoOriginal,
            tamanhoFinal: tamanhoFinal,
            economia: economia
        };

        /* Preparado não significa enviado. */

        if (ehCrlv) {

            MOTORISTAPAG_Login_arquivoNovoVeiculoCrlvPendente =
                dadosPendente;

            MOTORISTAPAG_Login_novoVeiculoCrlvPronto = false;

        } else {

            MOTORISTAPAG_Login_arquivoNovoVeiculoFotoPlacaPendente =
                dadosPendente;

            MOTORISTAPAG_Login_novoVeiculoFotoPlacaPronta = false;
        }

        /* ==========================================
           10. MOSTRAR PRÉVIA DA IMAGEM
        ========================================== */

        if (preview) {

            const urlAnterior = preview.getAttribute('src');

            if (
                urlAnterior &&
                urlAnterior.startsWith('blob:')
            ) {
                URL.revokeObjectURL(urlAnterior);
            }

            preview.src = URL.createObjectURL(arquivoCompactado);
            preview.style.display = 'block';
        }

        /* ==========================================
           11. OCULTAR PDF SE O CRLV FOR FOTO
        ========================================== */

        if (ehCrlv) {

            const previewPdf = buscar(
                'MOTORISTAPAG_Login_preview_pdf_novo_veiculo_crlv'
            );

            const visualizacaoPdf = buscar(
                'MOTORISTAPAG_Login_visualizacao_pdf_novo_veiculo_crlv'
            );

            if (previewPdf) {
                previewPdf.classList.add('TNP_hidden');
            }

            if (visualizacaoPdf) {

                const urlAnterior =
                    visualizacaoPdf.getAttribute('src');

                visualizacaoPdf.src = 'about:blank';

                if (
                    urlAnterior &&
                    urlAnterior.startsWith('blob:')
                ) {
                    URL.revokeObjectURL(urlAnterior);
                }
            }
        }

        /* ==========================================
           12. MOSTRAR INFORMAÇÕES DA COMPRESSÃO
        ========================================== */

        if (infoCompressao) {

            const formatar =
                MOTORISTAPAG_Login_func_formatarTamanhoArquivoNovoVeiculo;

            const textoEconomia = economia > 0
                ? 'economizou ' + formatar(economia)
                : economia < 0
                    ? 'aumentou ' + formatar(Math.abs(economia))
                    : 'sem alteração no tamanho';

            infoCompressao.innerText =
                'Compressão: ' +
                formatar(tamanhoOriginal) +
                ' → ' +
                formatar(tamanhoFinal) +
                ' | ' +
                textoEconomia;

            infoCompressao.style.display = 'block';
        }

        /* ==========================================
           13. MOSTRAR PRÉVIA E CONFIRMAÇÃO
        ========================================== */

        if (areaPrevia) {
            areaPrevia.classList.remove('TNP_hidden');
        }

        if (areaConfirmacao) {
            areaConfirmacao.classList.remove('TNP_hidden');
        }

        if (areaEnviado) {
            areaEnviado.classList.add('TNP_hidden');
        }

        /* ==========================================
           14. ATUALIZAR STATUS
        ========================================== */

        if (status) {
            status.innerText = emCorrecao
                ? 'Imagem pronta para reenviar.'
                : 'Imagem pronta para envio.';
        }

        /* ==========================================
           15. LIBERAR CONFIRMAÇÃO INDIVIDUAL

           O Firebase será validado novamente
           na função que confirma o envio.
        ========================================== */

        if (btnConfirmar) {
            btnConfirmar.disabled = false;
        }

        if (erroBox) {
            erroBox.innerText = '';
            erroBox.style.display = 'none';
        }

        /* ==========================================
           16. ATUALIZAR CONTROLES DA TELA
        ========================================== */

        MOTORISTAPAG_Login_func_atualizarOpcoesCrlvNovoVeiculo();

        MOTORISTAPAG_Login_func_atualizarBloqueioFotoVeiculo();

        MOTORISTAPAG_Login_func_verificarLiberarEnviarDocumentosNovoVeiculo();

    } catch (erro) {

        console.error(
            'Erro ao preparar imagem do veículo:',
            erro
        );

        if (status) {
            status.innerText = statusAnterior;
        }

        if (btnConfirmar) {
            btnConfirmar.disabled = true;
        }

        MOTORISTAPAG_Login_func_mostrarErroDocumentoNovoVeiculo(
            'Não foi possível preparar a imagem. Tente novamente.'
        );

    } finally {

        if (input) {
            input.value = '';
        }
    }
}



/* ==================================================
   TNP MOB — GERENCIAR VEÍCULOS
   PASSO 159 — ABRIR PDF DO CRLV
================================================== */

function MOTORISTAPAG_Login_func_abrirPdfNovoVeiculo() {

    const input = document.getElementById(
        'MOTORISTAPAG_Login_input_novo_veiculo_crlv_pdf'
    );

    if (!input) {
        MOTORISTAPAG_Login_func_mostrarErroDocumentoNovoVeiculo(
            'Não foi possível abrir o seletor de PDF.'
        );
        return;
    }

    input.value = '';
    input.click();
}


/* ==================================================
   TNP MOB — GERENCIAR VEÍCULOS
   PASSO 159 — PREPARAR PDF DO CRLV

   VALIDAR → MOSTRAR PRÉVIA → CONFIRMAR

   NÃO ENVIA AO FIREBASE.
================================================== */


/* ==================================================
   TNP MOB — GERENCIAR VEÍCULOS
   PREPARAR CRLV EM PDF — CADASTRO OU CORREÇÃO

   Apenas prepara o arquivo para confirmação.
   Não realiza upload nem grava no Firebase.
================================================== */

async function MOTORISTAPAG_Login_func_prepararPdfNovoVeiculo(event) {

    const input = event && event.target ? event.target : null;

    const arquivo = input && input.files
        ? input.files[0]
        : null;

    if (!arquivo) return;

    const modulo = document.getElementById(
        'MOTORISTAPAG_Login_gerenciar_veiculos_modulo'
    );

    if (!modulo) {
        input.value = '';
        return;
    }

    function buscar(id) {
        return modulo.querySelector('#' + id);
    }

    const erroBox = buscar(
        'MOTORISTAPAG_Login_error_documentos_novo_veiculo'
    );

    const status = buscar(
        'MOTORISTAPAG_Login_status_novo_veiculo_crlv'
    );

    const previewImagem = buscar(
        'MOTORISTAPAG_Login_preview_novo_veiculo_crlv'
    );

    const previewPdf = buscar(
        'MOTORISTAPAG_Login_preview_pdf_novo_veiculo_crlv'
    );

    const nomePdf = buscar(
        'MOTORISTAPAG_Login_nome_pdf_novo_veiculo_crlv'
    );

    const areaPrevia = buscar(
        'MOTORISTAPAG_Login_area_previa_novo_veiculo_crlv'
    );

    const areaConfirmacao = buscar(
        'MOTORISTAPAG_Login_confirmacao_novo_veiculo_crlv'
    );

    const areaEnviado = buscar(
        'MOTORISTAPAG_Login_enviado_novo_veiculo_crlv'
    );

    const infoCompressao = buscar(
        'MOTORISTAPAG_Login_info_compressao_novo_veiculo_crlv'
    );

    const btnConfirmar = buscar(
        'MOTORISTAPAG_Login_btn_confirmar_novo_veiculo_crlv'
    );

    const telaDocumentos = buscar(
        'MOTORISTAPAG_Login_screen_documentos_novo_veiculo'
    );

    /* ==============================================
       1. IDENTIFICAR CADASTRO OU CORREÇÃO
    ============================================== */

    const veiculoCorrecaoId = String(
        modulo.dataset.veiculoCorrecaoId || ''
    ).trim();

    const emCorrecao = Boolean(veiculoCorrecaoId);

    const cadastroIdInicial = String(
        window.MOTORISTAPAG_Login_veiculoCadastroAtualId || ''
    ).trim();

    const statusAnterior = status
        ? status.innerText
        : '';

    let deveRestaurarStatus = false;

    try {

        /* ==========================================
           2. VALIDAR TELA ATUAL
        ========================================== */

        if (
            !telaDocumentos ||
            !telaDocumentos.classList.contains('active')
        ) {
            throw new Error(
                'Abra a etapa de documentos antes de selecionar o PDF.'
            );
        }

        /* ==========================================
           3. VALIDAR PERMISSÃO DO ADMIN

           Um documento não autorizado
           não pode ser preparado em correção.
        ========================================== */

        if (
            emCorrecao &&
            modulo.dataset.correcaoCrlv !== 'true'
        ) {
            throw new Error(
                'O administrador não solicitou a correção do CRLV.'
            );
        }

        /* ==========================================
           4. PROTEGER CRLV JÁ ENVIADO

           Vale para cadastro e correção.
        ========================================== */

        if (
            MOTORISTAPAG_Login_novoVeiculoCrlvPronto === true
        ) {
            throw new Error(
                'O CRLV já foi enviado ou aprovado e não pode ser substituído.'
            );
        }

        /* ==========================================
           5. VALIDAR EXTENSÃO E TIPO
        ========================================== */

        const nomeArquivo = String(arquivo.name || '');

        const tipo = String(
            arquivo.type || ''
        ).toLowerCase();

        const ehPdf =
            tipo === 'application/pdf' ||
            nomeArquivo.toLowerCase().endsWith('.pdf');

        if (!ehPdf) {
            throw new Error(
                'Selecione um arquivo PDF do CRLV.'
            );
        }

        /* ==========================================
           6. VALIDAR TAMANHO
        ========================================== */

        if (!arquivo.size || arquivo.size <= 0) {
            throw new Error(
                'O PDF selecionado está vazio.'
            );
        }

        if (arquivo.size > 20 * 1024 * 1024) {
            throw new Error(
                'O PDF está muito grande. O limite é 20 MB.'
            );
        }

        /* ==========================================
           7. BLOQUEAR CONFIRMAÇÃO DURANTE LEITURA
        ========================================== */

        if (btnConfirmar) {
            btnConfirmar.disabled = true;
        }

        if (status) {
            status.innerText = 'Validando PDF...';
            deveRestaurarStatus = true;
        }

        /* ==========================================
           8. LER OS PRIMEIROS BYTES
        ========================================== */

        const bytesInicio = await new Promise(
            function(resolve, reject) {

                const leitor = new FileReader();

                leitor.onload = function() {

                    if (!(leitor.result instanceof ArrayBuffer)) {
                        reject(
                            new Error('Não foi possível ler o PDF.')
                        );
                        return;
                    }

                    resolve(
                        new Uint8Array(leitor.result)
                    );
                };

                leitor.onerror = function() {
                    reject(
                        new Error('Não foi possível ler o PDF.')
                    );
                };

                leitor.onabort = function() {
                    reject(
                        new Error('A leitura do PDF foi interrompida.')
                    );
                };

                leitor.readAsArrayBuffer(
                    arquivo.slice(0, 5)
                );
            }
        );

        /* ==========================================
           9. CONFERIR ASSINATURA REAL DO PDF
        ========================================== */

        const assinaturaPdf = String.fromCharCode(
            ...bytesInicio
        );

        if (assinaturaPdf !== '%PDF-') {
            throw new Error(
                'O arquivo selecionado não é um PDF válido.'
            );
        }

        /* ==========================================
           10. REVALIDAR O VEÍCULO APÓS A LEITURA

           Impede utilizar um arquivo antigo
           caso o motorista mude de veículo.
        ========================================== */

        const correcaoAtual = String(
            modulo.dataset.veiculoCorrecaoId || ''
        ).trim();

        const cadastroAtual = String(
            window.MOTORISTAPAG_Login_veiculoCadastroAtualId || ''
        ).trim();

        if (
            correcaoAtual !== veiculoCorrecaoId ||
            (
                !emCorrecao &&
                cadastroAtual !== cadastroIdInicial
            ) ||
            (
                emCorrecao &&
                modulo.dataset.correcaoCrlv !== 'true'
            ) ||
            MOTORISTAPAG_Login_novoVeiculoCrlvPronto === true ||
            !telaDocumentos.classList.contains('active')
        ) {

            /* O contexto mudou.
               Não aplicar PDF antigo à tela atual. */

            return;
        }

        /* ==========================================
           11. GUARDAR ARQUIVO TEMPORÁRIO

           PDF NÃO SOFRE COMPRESSÃO.
           PREPARADO NÃO SIGNIFICA ENVIADO.
        ========================================== */

        MOTORISTAPAG_Login_arquivoNovoVeiculoCrlvPendente = {

            arquivoOriginal: arquivo,
            arquivoCompactado: arquivo,

            tamanhoOriginal: arquivo.size,
            tamanhoFinal: arquivo.size,
            economia: 0,

            extensao: 'pdf',
            contentType: 'application/pdf',
            tipoArquivo: 'pdf',
            tipoEnvio: 'pdf_digital',

            nomeOriginal: nomeArquivo
        };

        MOTORISTAPAG_Login_novoVeiculoCrlvPronto = false;

        /* ==========================================
           12. OCULTAR PRÉVIA DE IMAGEM ANTERIOR
        ========================================== */

        if (previewImagem) {

            const urlAnterior =
                previewImagem.getAttribute('src');

            if (
                urlAnterior &&
                urlAnterior.startsWith('blob:')
            ) {
                URL.revokeObjectURL(urlAnterior);
            }

            previewImagem.removeAttribute('src');

            previewImagem.style.display = 'none';
        }

        /* ==========================================
           13. MOSTRAR PRÉVIA DO PDF
        ========================================== */

        if (nomePdf) {
            nomePdf.innerText =
                nomeArquivo || 'CRLV.pdf';
        }

        if (previewPdf) {
            previewPdf.classList.remove('TNP_hidden');
        }

        /* ==========================================
           14. MOSTRAR TAMANHO
        ========================================== */

        if (infoCompressao) {

            infoCompressao.innerText =
                'PDF: ' +
                MOTORISTAPAG_Login_func_formatarTamanhoArquivoNovoVeiculo(
                    arquivo.size
                );

            infoCompressao.style.display = 'block';
        }

        /* ==========================================
           15. MOSTRAR PRÉVIA E CONFIRMAÇÃO
        ========================================== */

        if (areaPrevia) {
            areaPrevia.classList.remove('TNP_hidden');
        }

        if (areaConfirmacao) {
            areaConfirmacao.classList.remove('TNP_hidden');
        }

        if (areaEnviado) {
            areaEnviado.classList.add('TNP_hidden');
        }

        /* ==========================================
           16. ATUALIZAR STATUS
        ========================================== */

        if (status) {

            status.innerText = emCorrecao
                ? 'PDF pronto para reenviar.'
                : 'PDF pronto para envio.';

            deveRestaurarStatus = false;
        }

        /* ==========================================
           17. LIBERAR CONFIRMAÇÃO INDIVIDUAL

           O envio ainda fará validação no Firebase.
        ========================================== */

        if (btnConfirmar) {
            btnConfirmar.disabled = false;
        }

        /* ==========================================
           18. LIMPAR ERROS
        ========================================== */

        if (erroBox) {
            erroBox.innerText = '';
            erroBox.style.display = 'none';
        }

        /* ==========================================
           19. ATUALIZAR CONTROLES

           NÃO REALIZA UPLOAD.
        ========================================== */

        MOTORISTAPAG_Login_func_atualizarOpcoesCrlvNovoVeiculo();

        MOTORISTAPAG_Login_func_atualizarBloqueioFotoVeiculo();

        MOTORISTAPAG_Login_func_verificarLiberarEnviarDocumentosNovoVeiculo();

    } catch (erro) {

        console.error(
            'Erro ao preparar PDF do CRLV:',
            erro
        );

        if (deveRestaurarStatus && status) {
            status.innerText = statusAnterior;
        }

        if (btnConfirmar) {
            btnConfirmar.disabled = true;
        }

        MOTORISTAPAG_Login_func_mostrarErroDocumentoNovoVeiculo(
            erro && erro.message
                ? erro.message
                : 'Não foi possível preparar o PDF.'
        );

    } finally {

        if (input) {
            input.value = '';
        }
    }
}



/* ==================================================
   TNP MOB — MOTORISTA
   GERENCIAR VEÍCULOS

   PASSO 162 — PARTE 2
   CONFIRMAR E ENVIAR DOCUMENTO INDIVIDUAL

   MANTÉM OS CAMINHOS DO FIREBASE.
================================================== */


/* ==================================================
   TNP MOB — GERENCIAR VEÍCULOS
   CONFIRMAR ENVIO INDIVIDUAL (CADASTRO / CORREÇÃO)

   Preserva os caminhos existentes de Firestore/Storage.
   Nunca modifica outro veículo nem os espelhos do ativo.
   A validação é repetida dentro da transação.
================================================== */
async function MOTORISTAPAG_Login_func_confirmarEnviarDocumentoNovoVeiculo(tipoDocumento) {

    if (!['crlv', 'fotoVeiculoPlaca'].includes(tipoDocumento)) return;

    const ehCrlv = tipoDocumento === 'crlv';
    const sufixo = ehCrlv ? 'crlv' : 'foto_placa';

    const modulo = document.getElementById(
        'MOTORISTAPAG_Login_gerenciar_veiculos_modulo'
    );

    const veiculoCorrecaoId = String(
        modulo?.dataset.veiculoCorrecaoId || ''
    ).trim();
    const emCorrecao = Boolean(veiculoCorrecaoId);

    const dadosPendente = ehCrlv
        ? MOTORISTAPAG_Login_arquivoNovoVeiculoCrlvPendente
        : MOTORISTAPAG_Login_arquivoNovoVeiculoFotoPlacaPendente;

    const btn = document.getElementById(
        'MOTORISTAPAG_Login_btn_confirmar_novo_veiculo_' + sufixo
    );
    const status = document.getElementById(
        'MOTORISTAPAG_Login_status_novo_veiculo_' + sufixo
    );
    const areaPrevia = document.getElementById(
        'MOTORISTAPAG_Login_area_previa_novo_veiculo_' + sufixo
    );
    const areaConfirmacao = document.getElementById(
        'MOTORISTAPAG_Login_confirmacao_novo_veiculo_' + sufixo
    );
    const areaEnviado = document.getElementById(
        'MOTORISTAPAG_Login_enviado_novo_veiculo_' + sufixo
    );

    const user = PRIMEIRAPAG_Login_auth.currentUser;
    if (!user) {
        MOTORISTAPAG_Login_func_mostrarErroDocumentoNovoVeiculo(
            'Sua sessão expirou. Faça login novamente.'
        );
        return;
    }

    if (!dadosPendente || !dadosPendente.arquivoCompactado) {
        MOTORISTAPAG_Login_func_mostrarErroDocumentoNovoVeiculo(
            'Selecione o documento antes de confirmar.'
        );
        return;
    }

    if (!ehCrlv && MOTORISTAPAG_Login_novoVeiculoCrlvPronto !== true) {
        MOTORISTAPAG_Login_func_mostrarErroDocumentoNovoVeiculo(
            'O CRLV precisa estar aprovado ou enviado antes da foto.'
        );
        return;
    }

    if (
        (ehCrlv && MOTORISTAPAG_Login_novoVeiculoCrlvPronto === true) ||
        (!ehCrlv && MOTORISTAPAG_Login_novoVeiculoFotoPlacaPronta === true)
    ) return;

    /* A confirmação só é executada quando a interface a liberou. */
    if (btn && btn.disabled) return;

    const textoOriginal = btn ? btn.innerText : 'CONFIRMAR E ENVIAR';
    const statusAnterior = status ? status.innerText : '';
    let enviadoComSucesso = false;

    const normalizar = function(valor) {
        return String(valor || '').trim().toLowerCase();
    };

    const statusCorrigiveis = [
        'pendente_correcao', 'reprovado', 'recusado', 'corrigir', 'pendente_envio'
    ];

    const statusProtegidos = [
        'aprovado', 'pendente_analise', 'enviado_analise', 'em_analise'
    ];

    /* Esta validação atua tanto na prévia quanto na transação.
       Não consulta DOM e não altera dados: recebe um snapshot. */
    function validarDestino(dadosMotorista, veiculoId, documento) {

        const lista = Array.isArray(dadosMotorista.veiculos)
            ? dadosMotorista.veiculos
            : [];
        const indice = lista.findIndex(function(item) {
            return item && item.id === veiculoId;
        });
        if (indice === -1) throw new Error('Veículo não encontrado.');

        const veiculo = lista[indice];
        const situacao = normalizar(veiculo.status);
        const registro = (veiculo.documentos || {})[documento] || {};
        const situacaoDocumento = normalizar(registro.status);

        if (statusProtegidos.includes(situacaoDocumento)) {
            throw new Error('O documento já foi enviado ou aprovado. Não pode ser substituído.');
        }

        if (emCorrecao) {
            if (veiculoId !== veiculoCorrecaoId) {
                throw new Error('A correção está vinculada a outro veículo.');
            }
            if (!['em_revisao', 'recusado', 'pendente_envio'].includes(situacao)) {
                throw new Error('O veículo não está disponível para correção.');
            }
            if (!statusCorrigiveis.includes(situacaoDocumento)) {
                throw new Error('Este documento não possui correção autorizada.');
            }

            /* Pendente_envio também é usado no cadastro novo.
               Só aceitar como correção quando houver evidência
               de solicitação/reprovação individual do Admin. */
            const vinculoAdmin =
                String(dadosMotorista.pendenciaAdminVeiculoId || '') === veiculoId &&
                String(dadosMotorista.pendenciaAdminVeiculoDocumento || '') === documento;

            const pedidoAdmin = Boolean(
                registro.solicitadoEm ||
                registro.reprovadoEm ||
                registro.reprovadoPor ||
                vinculoAdmin
            );

            if (situacaoDocumento === 'pendente_envio' && !pedidoAdmin) {
                throw new Error('Ainda não há solicitação do Admin para reenviar este documento.');
            }

        } else {
            if (situacao !== 'pendente_envio') {
                throw new Error('Este veículo não está na etapa de cadastro de documentos.');
            }
            if (
                String(dadosMotorista.veiculoCadastroAtualId || '') &&
                String(dadosMotorista.veiculoCadastroAtualId) !== veiculoId
            ) {
                throw new Error('Outro veículo está selecionado para concluir o cadastro.');
            }
            if (situacaoDocumento !== '' && situacaoDocumento !== 'pendente_envio') {
                throw new Error('Este documento não está pendente de envio.');
            }
            if (
                registro.enviado === true ||
                registro.url ||
                registro.caminho
            ) {
                throw new Error('Este documento já está registrado no Firebase.');
            }
        }

        if (documento === 'fotoVeiculoPlaca') {
            const crlv = (veiculo.documentos || {}).crlv || {};
            const estadoCrlv = normalizar(crlv.status);
            const crlvAprovado = estadoCrlv === 'aprovado';
            const crlvEnviado = crlv.enviado === true && Boolean(crlv.url && crlv.caminho);
            if (!crlvAprovado && !crlvEnviado) {
                throw new Error('Confirme o envio do CRLV antes de enviar a foto.');
            }
            if (emCorrecao && !crlvAprovado && ![
                'pendente_analise', 'enviado_analise', 'em_analise'
            ].includes(estadoCrlv)) {
                throw new Error('Aguarde o reenvio do CRLV antes de corrigir a foto.');
            }
        }

        return { indice, veiculo, registro };
    }

    try {
        if (btn) {
            btn.disabled = true;
            btn.innerText = 'ENVIANDO...';
        }
        if (status) status.innerText = 'Validando documento...';

        const motoristaRef = PRIMEIRAPAG_Login_db
            .collection('motoristas')
            .doc(user.uid);

        const docMotorista = await motoristaRef.get();
        if (!docMotorista.exists) {
            throw new Error('Cadastro do motorista não encontrado.');
        }

        const dados = docMotorista.data() || {};
        const veiculoId = emCorrecao
            ? veiculoCorrecaoId
            : String(
                dados.veiculoCadastroAtualId ||
                window.MOTORISTAPAG_Login_veiculoCadastroAtualId ||
                ''
            ).trim();

        if (!veiculoId) throw new Error('Veículo selecionado não encontrado.');

        /* Antes de criar um novo arquivo no Storage. */
        validarDestino(dados, veiculoId, tipoDocumento);

        if (status) status.innerText = 'Enviando documento...';

        const documentoEnviado =
            await MOTORISTAPAG_Login_func_uploadDocumentoNovoVeiculoComprimido(
                user.uid,
                veiculoId,
                tipoDocumento,
                dadosPendente
            );

        /* Revalidar status atuais sem alterar o documento de outro veículo.
           A transação aborta se o Admin alterou o estado durante o upload. */
        await PRIMEIRAPAG_Login_db.runTransaction(async function(transacao) {

            const snapAtual = await transacao.get(motoristaRef);
            if (!snapAtual.exists) {
                throw new Error('Cadastro do motorista não encontrado na transação.');
            }

            const dadosAtuais = snapAtual.data() || {};
            const validacao = validarDestino(dadosAtuais, veiculoId, tipoDocumento);
            const lista = dadosAtuais.veiculos.slice();
            const veiculo = {
                ...validacao.veiculo,
                documentos: { ...(validacao.veiculo.documentos || {}) }
            };

            /* Preservar as demais informações do documento e limpar o
               motivo anterior APENAS no documento reenviado. */
            veiculo.documentos[tipoDocumento] = {
                ...validacao.registro,
                ...documentoEnviado,
                status: 'pendente_analise',
                motivoReprovacao: ''
            };

            if (emCorrecao) {
                const todos = [
                    veiculo.documentos.crlv || {},
                    veiculo.documentos.fotoVeiculoPlaca || {}
                ];
                const faltaDocumento = todos.some(function(item) {
                    return statusCorrigiveis.includes(normalizar(item.status));
                });
                veiculo.status = faltaDocumento
                    ? 'em_revisao'
                    : 'pendente_analise';
                if (!faltaDocumento) veiculo.motivoReprovacao = '';
                veiculo.documentosEnviados = !faltaDocumento;
            }
            /* No cadastro normal, o status continua pendente_envio,
               e a finalização oficial permanece responsável pela mudança. */

            veiculo.atualizadoEm = new Date();
            lista[validacao.indice] = veiculo;

            const atualizacao = {
                veiculos: lista,
                atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (emCorrecao) {
                atualizacao.requerAnaliseAdmin = true;
            }

            transacao.set(motoristaRef, atualizacao, { merge: true });
        });

        enviadoComSucesso = true;

        if (ehCrlv) {
            MOTORISTAPAG_Login_novoVeiculoCrlvPronto = true;
            MOTORISTAPAG_Login_arquivoNovoVeiculoCrlvPendente = null;
        } else {
            MOTORISTAPAG_Login_novoVeiculoFotoPlacaPronta = true;
            MOTORISTAPAG_Login_arquivoNovoVeiculoFotoPlacaPendente = null;
        }

        if (areaPrevia) areaPrevia.classList.add('TNP_hidden');
        if (areaConfirmacao) areaConfirmacao.classList.add('TNP_hidden');
        if (areaEnviado) areaEnviado.classList.remove('TNP_hidden');
        if (status) status.innerText = emCorrecao
            ? 'Correção enviada — aguardando análise'
            : 'Enviado';

        MOTORISTAPAG_Login_func_atualizarOpcoesCrlvNovoVeiculo();
        MOTORISTAPAG_Login_func_atualizarBloqueioFotoVeiculo();
        MOTORISTAPAG_Login_func_verificarLiberarEnviarDocumentosNovoVeiculo();

        const erroBox = document.getElementById(
            'MOTORISTAPAG_Login_error_documentos_novo_veiculo'
        );
        if (erroBox) {
            erroBox.innerText = '';
            erroBox.style.display = 'none';
        }

    } catch (erro) {
        console.error('Erro ao enviar documento do veículo:', erro);
        if (status) status.innerText = statusAnterior;
        MOTORISTAPAG_Login_func_mostrarErroDocumentoNovoVeiculo(
            erro && erro.message
                ? erro.message
                : 'Não foi possível enviar o documento. Tente novamente.'
        );
    } finally {
        if (btn && !enviadoComSucesso) {
            btn.disabled = false;
            btn.innerText = textoOriginal;
        }
    }
}



/* ==================================================
   TNP MOB — MOTORISTA
   GERENCIAR VEÍCULOS

   PASSO 163 — TROCAR DOCUMENTO

   LIMPA SOMENTE O ARQUIVO PENDENTE.
   NÃO ALTERA DOCUMENTOS SALVOS NO FIREBASE.
================================================== */

function MOTORISTAPAG_Login_func_trocarDocumentoNovoVeiculo(tipoDocumento) {

    if (
        tipoDocumento !== 'crlv' &&
        tipoDocumento !== 'fotoVeiculoPlaca'
    ) {
        return;
    }

    const ehCrlv = tipoDocumento === 'crlv';
    const sufixo = ehCrlv ? 'crlv' : 'foto_placa';

    // Não permitir trocar documento já enviado.
    if (
        (ehCrlv && MOTORISTAPAG_Login_novoVeiculoCrlvPronto) ||
        (!ehCrlv && MOTORISTAPAG_Login_novoVeiculoFotoPlacaPronta)
    ) {
        return;
    }

    // Limpar somente o arquivo temporário.
    if (ehCrlv) {
        MOTORISTAPAG_Login_arquivoNovoVeiculoCrlvPendente = null;
    } else {
        MOTORISTAPAG_Login_arquivoNovoVeiculoFotoPlacaPendente = null;
    }

    const modulo = document.getElementById(
        'MOTORISTAPAG_Login_gerenciar_veiculos_modulo'
    );

    if (!modulo) return;

    function buscar(id) {
        return modulo.querySelector('#' + id);
    }

    // Remover prévia da fotografia.
    const imagem = buscar(
        'MOTORISTAPAG_Login_preview_novo_veiculo_' + sufixo
    );

    if (imagem) {
        const url = imagem.getAttribute('src');

        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }

        imagem.removeAttribute('src');
        imagem.style.display = 'none';
    }

    // Limpar miniatura do PDF, se for CRLV.
    if (ehCrlv) {

        const previewPdf = buscar(
            'MOTORISTAPAG_Login_preview_pdf_novo_veiculo_crlv'
        );

        const nomePdf = buscar(
            'MOTORISTAPAG_Login_nome_pdf_novo_veiculo_crlv'
        );

        if (previewPdf) {
            previewPdf.classList.add('TNP_hidden');
        }

        if (nomePdf) {
            nomePdf.innerText = 'CRLV.pdf';
        }
    }

    // Ocultar informações do arquivo.
    const info = buscar(
        'MOTORISTAPAG_Login_info_compressao_novo_veiculo_' + sufixo
    );

    if (info) {
        info.innerText = '';
        info.style.display = 'none';
    }

    // Ocultar prévia e botões Confirmar/Trocar.
    const areaPrevia = buscar(
        'MOTORISTAPAG_Login_area_previa_novo_veiculo_' + sufixo
    );

    const areaConfirmacao = buscar(
        'MOTORISTAPAG_Login_confirmacao_novo_veiculo_' + sufixo
    );

    if (areaPrevia) {
        areaPrevia.classList.add('TNP_hidden');
    }

    if (areaConfirmacao) {
        areaConfirmacao.classList.add('TNP_hidden');
    }

    // Restaurar status.
    const status = buscar(
        'MOTORISTAPAG_Login_status_novo_veiculo_' + sufixo
    );

    if (status) {
        status.innerText = 'Pendente de envio';
    }

    // Limpar seletores de arquivo.
    const idsInputs = ehCrlv
        ? [
            'MOTORISTAPAG_Login_input_novo_veiculo_crlv',
            'MOTORISTAPAG_Login_input_novo_veiculo_crlv_pdf'
        ]
        : [
            'MOTORISTAPAG_Login_input_novo_veiculo_foto_placa'
        ];

    idsInputs.forEach(function(id) {
        const input = buscar(id);
        if (input) input.value = '';
    });

    // Limpar mensagem de erro.
    const erro = buscar(
        'MOTORISTAPAG_Login_error_documentos_novo_veiculo'
    );

    if (erro) {
        erro.innerText = '';
        erro.style.display = 'none';
    }

    // Restaurar botões conforme o estado atual.
    MOTORISTAPAG_Login_func_atualizarOpcoesCrlvNovoVeiculo();

    MOTORISTAPAG_Login_func_atualizarBloqueioFotoVeiculo();

    MOTORISTAPAG_Login_func_verificarLiberarEnviarDocumentosNovoVeiculo();
}


/* ==================================================
   MOTORISTA — GERENCIAR VEÍCULOS
   VERIFICAR LIBERAÇÃO DO ENVIO DOS DOCUMENTOS
================================================== */


function MOTORISTAPAG_Login_func_verificarLiberarEnviarDocumentosNovoVeiculo() {

    const btn = document.getElementById(
        'MOTORISTAPAG_Login_btn_enviar_documentos_novo_veiculo'
    );

    if (!btn) return;

	/* ==============================================
	   PROTEGER A FINALIZAÇÃO DURANTE CORREÇÃO
	============================================== */

	const modulo = document.getElementById(
		"MOTORISTAPAG_Login_gerenciar_veiculos_modulo"
	);

	const veiculoCorrecaoId = String(
		modulo?.dataset.veiculoCorrecaoId || ""
	).trim();

	if (veiculoCorrecaoId) {
		btn.disabled = true;
		btn.innerText = "CORREÇÃO EM PREPARAÇÃO";
		return;
	}

	/* CADASTRO NORMAL DE NOVO VEÍCULO */

	const completo =
		MOTORISTAPAG_Login_novoVeiculoCrlvPronto === true &&
		MOTORISTAPAG_Login_novoVeiculoFotoPlacaPronta === true;

    btn.disabled = !completo;

    btn.innerText = completo
        ? 'FINALIZAR CADASTRO DO VEÍCULO'
        : 'AGUARDANDO DOCUMENTOS';
}


/* ==================================================
   TNP MOB — GERENCIAR VEÍCULOS
   FINALIZAR CADASTRO DO VEÍCULO

   NÃO REENVIA DOCUMENTOS.
   CONFERE OS DOIS NO FIREBASE.
================================================== */


/* ==================================================
   TNP MOB — MOTORISTA / GERENCIAR VEÍCULOS
   FINALIZAR CADASTRO NORMAL DE NOVO VEÍCULO

   - Firebase é a fonte oficial
   - Não finaliza correções solicitadas pelo Admin
   - Confere documentos dentro da transação
   - Preserva os demais veículos
   - Encaminha para a fila de análise do Admin
================================================== */

async function MOTORISTAPAG_Login_func_concluirDocumentosNovoVeiculo() {

    const usuario = PRIMEIRAPAG_Login_auth.currentUser;

    const modulo = document.getElementById(
        'MOTORISTAPAG_Login_gerenciar_veiculos_modulo'
    );

    const btn = document.getElementById(
        'MOTORISTAPAG_Login_btn_enviar_documentos_novo_veiculo'
    );

    /* ==============================================
       1. PROTEGER O MODO DE CORREÇÃO
    ============================================== */

    if (modulo?.dataset.veiculoCorrecaoId) {

        MOTORISTAPAG_Login_func_mostrarErroDocumentoNovoVeiculo(
            'Esta tela está em modo de correção. ' +
            'O reenvio deve ser feito por documento.'
        );

        return;
    }

    /* ==============================================
       2. VALIDAR USUÁRIO
    ============================================== */

    if (!usuario) {

        MOTORISTAPAG_Login_func_mostrarErroDocumentoNovoVeiculo(
            'Faça login novamente.'
        );

        return;
    }

    /* ==============================================
       3. VERIFICAR DOCUMENTOS NA INTERFACE
    ============================================== */

    if (
        MOTORISTAPAG_Login_novoVeiculoCrlvPronto !== true ||
        MOTORISTAPAG_Login_novoVeiculoFotoPlacaPronta !== true
    ) {

        MOTORISTAPAG_Login_func_mostrarErroDocumentoNovoVeiculo(
            'Envie os dois documentos antes de finalizar.'
        );

        return;
    }

    if (btn && btn.disabled) return;

    const textoOriginal = btn
        ? btn.innerText
        : 'FINALIZAR CADASTRO DO VEÍCULO';

    let confirmouFirestore = false;

    if (btn) {
        btn.disabled = true;
        btn.innerText = 'FINALIZANDO...';
    }

    try {

        const motoristaRef = PRIMEIRAPAG_Login_db
            .collection('motoristas')
            .doc(usuario.uid);

        /* ==============================================
           4. TRANSAÇÃO — FIREBASE OFICIAL
        ============================================== */

        await PRIMEIRAPAG_Login_db.runTransaction(
            async function(transacao) {

                const snapshot =
                    await transacao.get(motoristaRef);

                if (!snapshot.exists) {
                    throw new Error(
                        'Cadastro do motorista não encontrado.'
                    );
                }

                const dados = snapshot.data() || {};

                /* Identificar veículo pelo Firebase. */

                const veiculoId = String(
                    dados.veiculoCadastroAtualId || ''
                ).trim();

                if (!veiculoId) {
                    throw new Error(
                        'Nenhum veículo está selecionado ' +
                        'para finalizar o cadastro.'
                    );
                }

                /* A memória deve concordar com o Firebase. */

                const veiculoEmTela = String(
                    window.MOTORISTAPAG_Login_veiculoCadastroAtualId || ''
                ).trim();

                if (
                    veiculoEmTela &&
                    veiculoEmTela !== veiculoId
                ) {
                    throw new Error(
                        'O veículo selecionado mudou. ' +
                        'Volte à lista e abra novamente o cadastro.'
                    );
                }

                /* ==========================================
                   5. LOCALIZAR SOMENTE O VEÍCULO ALVO
                ========================================== */

                const veiculos =
                    Array.isArray(dados.veiculos)
                        ? dados.veiculos.slice()
                        : [];

                const index = veiculos.findIndex(
                    function(item) {
                        return (
                            item &&
                            String(item.id) === veiculoId
                        );
                    }
                );

                if (index === -1) {
                    throw new Error(
                        'Veículo não encontrado no Firebase.'
                    );
                }

                const veiculo = {
                    ...veiculos[index]
                };

                const statusVeiculo = String(
                    veiculo.status || ''
                ).trim().toLowerCase();

                if (statusVeiculo !== 'pendente_envio') {
                    throw new Error(
                        'Este veículo não está na etapa ' +
                        'de conclusão do cadastro.'
                    );
                }

                /* Nunca finalizar veículo em uso. */

                if (
                    String(dados.veiculoAtualId || '') === veiculoId
                ) {
                    throw new Error(
                        'O veículo em uso não pode ser ' +
                        'finalizado novamente.'
                    );
                }

                /* ==========================================
                   6. CONFERIR OS DOIS DOCUMENTOS
                ========================================== */

                const documentos = veiculo.documentos || {};

                const crlv = documentos.crlv || {};

                const foto =
                    documentos.fotoVeiculoPlaca || {};

                const statusValidos = [
                    'pendente_analise',
                    'enviado_analise',
                    'em_analise',
                    'aprovado'
                ];

                function documentoValido(documento) {

                    const status = String(
                        documento.status || ''
                    ).trim().toLowerCase();

                    return (
                        documento.enviado === true &&
                        Boolean(documento.url) &&
                        Boolean(documento.caminho) &&
                        statusValidos.includes(status)
                    );
                }

                if (
                    !documentoValido(crlv) ||
                    !documentoValido(foto)
                ) {
                    throw new Error(
                        'Os dois documentos precisam estar ' +
                        'enviados e aguardando análise no Firebase.'
                    );
                }

                /* ==========================================
                   7. NÃO CONFUNDIR CORREÇÃO COM CADASTRO

                   pendente_envio também é utilizado
                   quando o Admin solicita um reenvio.
                ========================================== */

                const pedidoAdmin = [crlv, foto].some(
                    function(doc) {

                        return Boolean(
                            doc.solicitadoEm ||
                            doc.reprovadoEm ||
                            doc.reprovadoPor
                        );
                    }
                );

                const resumoDeCorrecao =
                    String(
                        dados.pendenciaAdminVeiculoId || ''
                    ) === veiculoId &&

                    [
                        'crlv',
                        'fotoVeiculoPlaca'
                    ].includes(
                        String(
                            dados.pendenciaAdminVeiculoDocumento || ''
                        )
                    );

                if (pedidoAdmin || resumoDeCorrecao) {
                    throw new Error(
                        'Existe uma solicitação do administrador ' +
                        'para este veículo. Utilize o fluxo de correção.'
                    );
                }

                /* ==========================================
                   8. FINALIZAR SOMENTE ESTE VEÍCULO
                ========================================== */

                veiculo.status = 'pendente_analise';

                veiculo.documentosEnviados = true;

                veiculo.atualizadoEm = new Date();

                veiculos[index] = veiculo;

                /* ==========================================
                   9. GRAVAR E ENCAMINHAR AO ADMIN

                   Não alterar:
                   - veiculoAtualId
                   - podeAceitarCorrida
                   - disponível para corridas
                   - demais veículos
                ========================================== */

                transacao.update(motoristaRef, {

                    veiculos: veiculos,

                    veiculoCadastroAtualId: '',

                    requerAnaliseAdmin: true,

                    atualizadoEm:
                        firebase.firestore.FieldValue.serverTimestamp()

                });
            }
        );

        /* ==============================================
           10. FIREBASE CONFIRMOU A FINALIZAÇÃO
        ============================================== */

        confirmouFirestore = true;

        window.MOTORISTAPAG_Login_veiculoCadastroAtualId = '';

        await MOTORISTAPAG_Login_func_abrirGerenciarVeiculos();

        alert(
            'Cadastro finalizado! ' +
            'O veículo está aguardando análise.'
        );

    } catch (erro) {

        console.error(
            'Erro ao finalizar veículo:',
            erro
        );

        MOTORISTAPAG_Login_func_mostrarErroDocumentoNovoVeiculo(
            confirmouFirestore
                ? (
                    'O cadastro foi salvo, mas houve um ' +
                    'problema ao atualizar a lista. ' +
                    'Abra Gerenciar Veículos novamente.'
                )
                : (
                    erro.message ||
                    'Não foi possível finalizar o cadastro.'
                )
        );

    } finally {

        if (btn && !confirmouFirestore) {

            btn.innerText = textoOriginal;

            MOTORISTAPAG_Login_func_verificarLiberarEnviarDocumentosNovoVeiculo();
        }
    }
}


/* ==================================================
   COMPATIBILIDADE — ENVIO ANTIGO

   Não realiza upload duplicado.
   Reutiliza a finalização oficial.
================================================== */

async function MOTORISTAPAG_Login_func_enviarDocumentosNovoVeiculo() {

    const modulo = document.getElementById(
        "MOTORISTAPAG_Login_gerenciar_veiculos_modulo"
    );

    if (modulo?.dataset.veiculoCorrecaoId) {
        MOTORISTAPAG_Login_func_mostrarErroDocumentoNovoVeiculo(
            "A correção de documentos ainda está em preparação."
        );

        return;
    }

    return MOTORISTAPAG_Login_func_concluirDocumentosNovoVeiculo();
}

/* ==================================================
   MOTORISTA — GERENCIAR VEÍCULOS
   MOSTRAR ERROS DOS DOCUMENTOS
================================================== */

function MOTORISTAPAG_Login_func_mostrarErroDocumentoNovoVeiculo(mensagem) {
    const erroBox = document.getElementById('MOTORISTAPAG_Login_error_documentos_novo_veiculo');

    if (erroBox) {
        erroBox.innerText = mensagem;
        erroBox.style.display = 'block';
        erroBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    alert(mensagem);
}


/* ==================================================
   MOTORISTA — GERENCIAR VEÍCULOS
   UPLOAD DOS DOCUMENTOS COMPRIMIDOS
================================================== */


/* ==================================================
   TNP MOB — MOTORISTA
   GERENCIAR VEÍCULOS

   PASSO 162 — UPLOAD FOTO OU PDF

   MANTÉM OS CAMINHOS DO FIREBASE.
================================================== */

async function MOTORISTAPAG_Login_func_uploadDocumentoNovoVeiculoComprimido(
    uid,
    veiculoId,
    tipoDocumento,
    dadosPendente
) {

    /* ==============================================
       1. VALIDAR DADOS
    ============================================== */

    if (
        !uid ||
        !veiculoId ||
        !dadosPendente ||
        !dadosPendente.arquivoCompactado
    ) {
        throw new Error(
            'Dados insuficientes para enviar o documento.'
        );
    }

    if (
        tipoDocumento !== 'crlv' &&
        tipoDocumento !== 'fotoVeiculoPlaca'
    ) {
        throw new Error(
            'Tipo de documento não reconhecido.'
        );
    }


    /* ==============================================
       2. IDENTIFICAR FOTO OU PDF
    ============================================== */

    const arquivo = dadosPendente.arquivoCompactado;

    const ehPdf =
        dadosPendente.tipoArquivo === 'pdf' ||
        dadosPendente.contentType === 'application/pdf' ||
        arquivo.type === 'application/pdf';


    /* ==============================================
       3. PERMITIR PDF SOMENTE NO CRLV
    ============================================== */

    if (ehPdf && tipoDocumento !== 'crlv') {
        throw new Error(
            'A foto do veículo deve ser enviada como imagem.'
        );
    }


    /* ==============================================
       4. DEFINIR EXTENSÃO E TIPO
    ============================================== */

    const extensao = ehPdf ? 'pdf' : 'jpg';

    const contentType = ehPdf
        ? 'application/pdf'
        : 'image/jpeg';


    /* ==============================================
       5. DEFINIR NOME DO ARQUIVO
    ============================================== */

    const nomeArquivo =
        tipoDocumento +
        '_' +
        Date.now() +
        '.' +
        extensao;


    /* ==============================================
       6. CAMINHO ORIGINAL DO FIREBASE STORAGE
    ============================================== */

    const caminho =
        'motoristas/' +
        uid +
        '/veiculos/' +
        veiculoId +
        '/' +
        nomeArquivo;


    /* ==============================================
       7. PREPARAR REFERÊNCIA DO STORAGE
    ============================================== */

    const storageRef = PRIMEIRAPAG_Login_storage
        .ref()
        .child(caminho);


    /* ==============================================
       8. ENVIAR ARQUIVO UMA ÚNICA VEZ
    ============================================== */

    await storageRef.put(arquivo, {
        contentType: contentType
    });


    /* ==============================================
       9. OBTER URL DO ARQUIVO ENVIADO
    ============================================== */

    const url = await storageRef.getDownloadURL();


    /* ==============================================
       10. RETORNAR DADOS DO DOCUMENTO
       CAMPOS ORIGINAIS PRESERVADOS
    ============================================== */

    return {
        enviado: true,
        url: url,
        caminho: caminho,
        status: 'pendente_analise',
        motivoReprovacao: '',
        tamanhoOriginal: dadosPendente.tamanhoOriginal,
        tamanhoFinal: dadosPendente.tamanhoFinal,
        economiaBytes: dadosPendente.economia,
        atualizadoEm: new Date()
    };
}



async function MOTORISTAPAG_Login_func_excluirVeiculoGerenciado(veiculoId) {
    const user = PRIMEIRAPAG_Login_auth.currentUser;

		
	if (!user) {
		alert('Sua sessão expirou. Faça login novamente.');
		return;
	}


    if (!veiculoId) {
        alert('Não foi possível identificar o veículo para excluir.');
        return;
    }

    try {
        const motoristaRef = PRIMEIRAPAG_Login_db
            .collection('motoristas')
            .doc(user.uid);

        const doc = await motoristaRef.get();
        const dados = doc.exists ? doc.data() : {};

        const veiculos = Array.isArray(dados.veiculos) ? dados.veiculos : [];
        const veiculoAtualId = dados.veiculoAtualId || '';

        const veiculosValidos = veiculos.filter(function(veiculo) {
            return veiculo && veiculo.id;
        });

        const veiculoParaExcluir = veiculosValidos.find(function(veiculo) {
            return veiculo.id === veiculoId;
        });

        if (!veiculoParaExcluir) {
            alert('Veículo não encontrado.');
            return;
        }

        // 1. Se for o único veículo cadastrado: bloquear exclusão
        if (veiculosValidos.length <= 1) {
            alert(
                'Você precisa manter pelo menos um veículo cadastrado.\n\n' +
                'Para trocar de veículo, adicione outro veículo primeiro.'
            );
            return;
        }

        const veiculoEstaEmUso =
            veiculoAtualId === veiculoId ||
            veiculoParaExcluir.emUso === true;

        // 2. Se estiver em uso: pedir para escolher outro veículo aprovado antes
        if (veiculoEstaEmUso) {
            alert(
                'Este veículo está em uso.\n\n' +
                'Escolha outro veículo aprovado como veículo em uso antes de excluir este.'
            );
            return;
        }

        // 3. Se não estiver em uso: pode excluir
        const confirmar = confirm(
            'Deseja excluir este veículo?\n\n' +
            'Essa ação remove o veículo da sua lista.'
        );

        if (!confirmar) return;

        const veiculosAtualizados = veiculosValidos.filter(function(veiculo) {
            return veiculo.id !== veiculoId;
        });

        await motoristaRef.set({
            veiculos: veiculosAtualizados,
            atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        alert('Veículo excluído com sucesso.');

        if (typeof MOTORISTAPAG_Login_func_carregarGerenciarVeiculos === 'function') {
            await MOTORISTAPAG_Login_func_carregarGerenciarVeiculos();
        }

        if (typeof MOTORISTAPAG_Login_func_carregarVeiculosEmUso === 'function') {
            await MOTORISTAPAG_Login_func_carregarVeiculosEmUso();
        }

    } catch (erro) {
        console.error('Erro ao excluir veículo:', erro);
        alert('Não foi possível excluir o veículo agora. Tente novamente.');
    }
}


/* ==================================================
   TNP MOB — MOTORISTA
   CONFIGURAÇÕES → GERENCIAR CATEGORIAS
   gerenciar-categoriasm.js

   MÓDULO FILHO DE CONFIGURAÇÕES

   REGRAS:
   - Montar HTML somente uma vez.
   - Preservar Configurações montada.
   - Abrir o filho sobre o pai.
   - Fechar somente o filho.
   - Integrar com o Voltar Global.
   - Não modificar Firebase nesta etapa.
================================================== */


/* ==================================================
   1. CONTROLE DE CARREGAMENTO ÚNICO
================================================== */

let MOTORISTAPAG_Login_promessaCarregarCategoriasm = null;


/* ==================================================
   2. ABRIR GERENCIAR CATEGORIAS
================================================== */

async function MOTORISTAPAG_Login_func_abrirGerenciarCategorias() {

    const area = document.getElementById(
        "MOTORISTAPAG_Login_area_gerenciar_categoriasm"
    );

    if (!area) {
        console.error(
            "MOUNT de Gerenciar Categorias não encontrado."
        );
        return;
    }

    try {

        /* ==========================================
           CARREGAR HTML SOMENTE UMA VEZ
        ========================================== */

        if (
            !area.querySelector(
                "#MOTORISTAPAG_Login_modal_gerenciar_categoriasm"
            )
        ) {

            if (
                !MOTORISTAPAG_Login_promessaCarregarCategoriasm
            ) {

                MOTORISTAPAG_Login_promessaCarregarCategoriasm =
                    fetch(
                        "configuracoesm/gerenciar-categoriasm/gerenciar-categoriasm.html"
                    )
                    .then(function(resposta) {

                        if (!resposta.ok) {
                            throw new Error(
                                "Erro HTTP: " + resposta.status
                            );
                        }

                        return resposta.text();

                    })
                    .then(function(html) {

                        area.innerHTML = html;

                    })
                    .finally(function() {

                        MOTORISTAPAG_Login_promessaCarregarCategoriasm =
                            null;

                    });

            }

            await MOTORISTAPAG_Login_promessaCarregarCategoriasm;

        }


        /* ==========================================
           LOCALIZAR O MODAL
        ========================================== */

        const modal = area.querySelector(
            "#MOTORISTAPAG_Login_modal_gerenciar_categoriasm"
        );

        if (!modal) {
            console.error(
                "Modal de Gerenciar Categorias não encontrado."
            );
            return;
        }


        /* ==========================================
           ABRIR O MÓDULO FILHO

           Não fecha Configurações.
           Não desmonta o módulo pai.
        ========================================== */

        modal.classList.add("active");


        /* ==========================================
           REGISTRAR VOLTAR GLOBAL
        ========================================== */

        if (
            typeof TNP_MOB_func_registrarCamadaVoltar ===
            "function"
        ) {

            TNP_MOB_func_registrarCamadaVoltar(
                "motorista_gerenciar_categorias",
                MOTORISTAPAG_Login_func_voltarGerenciarCategorias
            );

        }
		
			
	/* ==========================================
	   CARREGAR VEÍCULOS E AUTORIZAÇÕES
	   APÓS ABRIR O MÓDULO
	========================================== */

	
/* ==========================================
   ATUALIZAR VEÍCULOS E MODALIDADES
   SEMPRE QUE ABRIR GERENCIAR CATEGORIAS
========================================== */

	const dadosCategorias =
		await MOTORISTAPAG_Login_func_carregarGerenciarCategorias();

	if (dadosCategorias) {

		await MOTORISTAPAG_Login_func_exibirVeiculosGerenciarCategorias();

	}



    } catch (erro) {

        console.error(
            "Erro ao abrir Gerenciar Categorias:",
            erro
        );

    }

}


/* ==================================================
   3. VOLTAR GERENCIAR CATEGORIAS

   - Fecha somente o módulo filho.
   - Preserva Configurações.
   - Mantém o HTML montado.
   - Remove sua camada do Voltar Global.
================================================== */

function MOTORISTAPAG_Login_func_voltarGerenciarCategorias() {

    const modal = document.getElementById(
        "MOTORISTAPAG_Login_modal_gerenciar_categoriasm"
    );

    if (modal) {
        modal.classList.remove("active");
    }

    if (
        typeof TNP_MOB_func_removerCamadaVoltar ===
        "function"
    ) {

        TNP_MOB_func_removerCamadaVoltar(
            "motorista_gerenciar_categorias"
        );

    }

}


/* ==================================================
   4. SALVAR CATEGORIAS

   IMPLEMENTAÇÃO PENDENTE.

   O botão permanece desabilitado no HTML.
   Nenhuma alteração é enviada ao Firebase.
================================================== */


/* ==================================================
   TNP MOB — MOTORISTA
   SALVAR MODALIDADES ATIVAS

   - Motorista altera somente "ativas".
   - "autorizadas" permanece sob controle do admin.
   - Valida autorizações atuais no Firebase.
   - Confere se as modalidades continuam disponíveis.
   - Preserva os demais veículos e dados.
   - Não altera aprovação nem tarifas.
================================================== */

async function MOTORISTAPAG_Login_func_salvarGerenciarCategorias() {

    const botao = document.getElementById(
        "MOTORISTAPAG_Login_btn_salvar_categorias"
    );

    const status = document.getElementById(
        "MOTORISTAPAG_Login_categorias_status"
    );

    const lista = document.getElementById(
        "MOTORISTAPAG_Login_categorias_lista_veiculos"
    );

    if (!botao || !lista || botao.disabled) {
        return;
    }

    botao.disabled = true;

    if (status) {
        status.textContent = "Salvando suas modalidades...";
    }

    try {

        const auth =
            typeof PRIMEIRAPAG_Login_auth !== "undefined"
                ? PRIMEIRAPAG_Login_auth
                : firebase.auth();

        const usuario = auth.currentUser;

        if (!usuario) {
            throw new Error("Motorista não autenticado.");
        }

        const db =
            typeof PRIMEIRAPAG_Login_db !== "undefined"
                ? PRIMEIRAPAG_Login_db
                : firebase.firestore();

        const referencia = db
            .collection("motoristas")
            .doc(usuario.uid);

        // Captura os checkboxes exibidos nesta tela.
        const checkboxes = Array.from(
            lista.querySelectorAll(
                ".MOTORISTAPAG_Login_categorias_modalidade_checkbox"
            )
        );

        const selecoes = {};

        for (const checkbox of checkboxes) {

            const veiculoId = checkbox.dataset.veiculoId;
            const subcategoriaId = checkbox.dataset.subcategoriaId;

            if (
                !/^[a-zA-Z0-9_]+$/.test(veiculoId || "") ||
                !/^[a-zA-Z0-9_]+$/.test(subcategoriaId || "")
            ) {
                throw new Error("Identificador inválido.");
            }

            if (!selecoes[veiculoId]) {
                selecoes[veiculoId] = [];
            }

            if (checkbox.checked) {
                selecoes[veiculoId].push(subcategoriaId);
            }

        }

        // Inclui os veículos exibidos mesmo quando não
        // possuem checkboxes, permitindo salvar ativas: [].
        const dadosTela =
            MOTORISTAPAG_Login_dadosGerenciarCategorias;

        if (!dadosTela || dadosTela.uid !== usuario.uid) {
            throw new Error("Reabra a tela para atualizar os dados.");
        }

        for (const veiculo of dadosTela.veiculos) {

            const veiculoId = String(veiculo.id || "");

            if (!/^[a-zA-Z0-9_]+$/.test(veiculoId)) {
                throw new Error("Veículo com identificador inválido.");
            }

            if (!selecoes[veiculoId]) {
                selecoes[veiculoId] = [];
            }

        }

        await db.runTransaction(async function(transacao) {

            const documento = await transacao.get(referencia);

            if (!documento.exists) {
                throw new Error("Cadastro do motorista não encontrado.");
            }

            const dadosAtuais = documento.data() || {};
            const mapa = dadosAtuais.subcategoriasPorVeiculo || {};

            const verificacoes = [];

            // Primeiro: todas as leituras necessárias.
            for (const veiculoId of Object.keys(selecoes)) {

                const configuracao = mapa[veiculoId];

                if (!configuracao) {
                    throw new Error(
                        "Autorizações não encontradas para " + veiculoId
                    );
                }

                const autorizadas = Array.isArray(
                    configuracao.autorizadas
                ) ? configuracao.autorizadas : [];

                const categoria = String(
                    configuracao.categoria || ""
                ).toLowerCase();

                if (!["carro", "moto", "utilitario"].includes(categoria)) {
                    throw new Error("Categoria do veículo inválida.");
                }

                for (const id of selecoes[veiculoId]) {

                    if (!autorizadas.includes(id)) {
                        throw new Error(
                            "A modalidade " + id +
                            " não está autorizada."
                        );
                    }

                    const referenciaModalidade = db
                        .collection("categoriasCorridas")
                        .doc(categoria)
                        .collection("subcategorias")
                        .doc(id);

                    const modalidade = await transacao.get(
                        referenciaModalidade
                    );

                    verificacoes.push({
                        id,
                        modalidade
                    });

                }

            }

            for (const item of verificacoes) {

                const dadosModalidade = item.modalidade.exists
                    ? item.modalidade.data() || {}
                    : null;

                if (
                    !dadosModalidade ||
                    dadosModalidade.ativo !== true ||
                    dadosModalidade.excluido === true
                ) {
                    throw new Error(
                        "A modalidade " + item.id +
                        " não está mais disponível."
                    );
                }

            }

            // Depois das leituras, grava somente "ativas".
            const atualizacoes = {};

            for (const veiculoId of Object.keys(selecoes)) {

                atualizacoes[
                    "subcategoriasPorVeiculo." +
                    veiculoId +
                    ".ativas"
                ] = [...new Set(selecoes[veiculoId])];

            }

            if (Object.keys(atualizacoes).length > 0) {
                transacao.update(referencia, atualizacoes);
            }

        });

        if (status) {
            status.textContent =
                "Modalidades salvas com sucesso!";
        }

        console.log(
            "TNP MOB — Modalidades ativas salvas:",
            selecoes
        );

        // Recarrega os dados oficiais e atualiza a tela.
        const novosDados =
            await MOTORISTAPAG_Login_func_carregarGerenciarCategorias();

        if (novosDados) {
            await MOTORISTAPAG_Login_func_exibirVeiculosGerenciarCategorias();
        }

    } catch (erro) {

        console.error(
            "TNP MOB — Erro ao salvar modalidades:",
            erro
        );

        if (status) {
            status.textContent =
                "Não foi possível salvar: " + erro.message;
        }

        botao.disabled = false;

    }

}



/* ==================================================
   5.3 — GERENCIAR CATEGORIAS
   CARREGAR DADOS OFICIAIS DO MOTORISTA

   SOMENTE LEITURA.

   - Consulta motoristas/{uid}
   - Identifica veículos cadastrados
   - Identifica subcategorias autorizadas
   - Não cria autorizações
   - Não modifica Firebase
================================================== */

let MOTORISTAPAG_Login_dadosGerenciarCategorias = null;

async function MOTORISTAPAG_Login_func_carregarGerenciarCategorias() {

    const areaLista = document.getElementById(
        "MOTORISTAPAG_Login_categorias_lista_veiculos"
    );

    const botaoSalvar = document.getElementById(
        "MOTORISTAPAG_Login_btn_salvar_categorias"
    );

    if (botaoSalvar) {
        botaoSalvar.disabled = true;
    }

    if (areaLista) {
        areaLista.setAttribute("aria-busy", "true");
    }

    try {

        /* ==========================================
           USUÁRIO AUTENTICADO
        ========================================== */

        const auth =
            typeof PRIMEIRAPAG_Login_auth !== "undefined"
                ? PRIMEIRAPAG_Login_auth
                : firebase.auth();

        const usuario = auth.currentUser;

        if (!usuario) {
            throw new Error(
                "Nenhum motorista autenticado."
            );
        }

        /* ==========================================
           BANCO OFICIAL
        ========================================== */

        const db =
            typeof PRIMEIRAPAG_Login_db !== "undefined"
                ? PRIMEIRAPAG_Login_db
                : firebase.firestore();

        const documento = await db
            .collection("motoristas")
            .doc(usuario.uid)
            .get();

        if (!documento.exists) {
            throw new Error(
                "Cadastro do motorista não encontrado."
            );
        }

        const dados = documento.data() || {};

        /* ==========================================
           VEÍCULOS CADASTRADOS
        ========================================== */

        let veiculos = [];

        if (Array.isArray(dados.veiculos)) {

            veiculos = dados.veiculos.filter(
                function(veiculo) {
                    return (
                        veiculo &&
                        typeof veiculo === "object" &&
                        !Array.isArray(veiculo)
                    );
                }
            );

        } else if (
            dados.veiculo &&
            typeof dados.veiculo === "object" &&
            !Array.isArray(dados.veiculo)
        ) {

            veiculos = [dados.veiculo];

        }

        /* ==========================================
           AUTORIZAÇÕES DO ADMINISTRADOR

           Ausência do campo NÃO representa
           autorização automática.
        ========================================== */

        const mapaOriginal = dados.subcategoriasPorVeiculo;

        const subcategoriasPorVeiculo =
            mapaOriginal &&
            typeof mapaOriginal === "object" &&
            !Array.isArray(mapaOriginal)
                ? mapaOriginal
                : {};

        /* ==========================================
           GUARDAR RESULTADO EM MEMÓRIA

           Não modificar o documento original.
        ========================================== */

        MOTORISTAPAG_Login_dadosGerenciarCategorias = {

            uid: usuario.uid,

            veiculos: veiculos.map(
                function(veiculo) {
                    return { ...veiculo };
                }
            ),

            subcategoriasPorVeiculo:
                structuredClone(subcategoriasPorVeiculo)

        };

        /* ==========================================
           DIAGNÓSTICO
        ========================================== */

        console.log(
            "TNP MOB — Gerenciar Categorias:",
            {
                quantidadeVeiculos:
                    MOTORISTAPAG_Login_dadosGerenciarCategorias
                        .veiculos.length,

                idsVeiculos:
                    MOTORISTAPAG_Login_dadosGerenciarCategorias
                        .veiculos.map(function(veiculo) {
                            return veiculo.id;
                        }),

                veiculosComAutorizacoes:
                    Object.keys(
                        MOTORISTAPAG_Login_dadosGerenciarCategorias
                            .subcategoriasPorVeiculo
                    )
            }
        );

        return MOTORISTAPAG_Login_dadosGerenciarCategorias;

    } catch (erro) {

        MOTORISTAPAG_Login_dadosGerenciarCategorias = null;

        console.error(
            "TNP MOB — Erro ao carregar Gerenciar Categorias:",
            erro
        );

        const status = document.getElementById(
            "MOTORISTAPAG_Login_categorias_status"
        );

        if (status) {
            status.textContent =
                "Não foi possível consultar os veículos.";
        }

        return null;

    } finally {

        if (areaLista) {
            areaLista.setAttribute("aria-busy", "false");
        }

    }

}


/* ==================================================
   TNP MOB — GERENCIAR CATEGORIAS

   CONSULTAR SUBCATEGORIAS DISPONÍVEIS

   - Consulta somente a categoria informada.
   - Considera apenas modalidades ativas.
   - Ignora modalidades excluídas.
   - Não retorna preços nem tarifas.
   - Não grava no Firebase.
================================================== */

async function MOTORISTAPAG_Login_func_consultarModalidadesDisponiveis(
    categoria
) {

    const db =
        typeof PRIMEIRAPAG_Login_db !== "undefined"
            ? PRIMEIRAPAG_Login_db
            : firebase.firestore();

    const categoriaId = String(
        categoria || ""
    ).trim().toLowerCase();

    if (!categoriaId) {
        return [];
    }

    const consulta = await db
        .collection("categoriasCorridas")
        .doc(categoriaId)
        .collection("subcategorias")
        .get();

    return consulta.docs
        .filter(function(documento) {

            const dados = documento.data() || {};

            return (
                dados.ativo === true &&
                dados.excluido !== true
            );

        })
        .map(function(documento) {

            const dados = documento.data() || {};

            return {
                id: documento.id,
                nome: String(
                    dados.nome || documento.id
                )
            };

        });

}


/* ==================================================
   TNP MOB — GERENCIAR CATEGORIAS
   EXIBIR VEÍCULOS E MODALIDADES AUTORIZADAS

   - Usa os dados oficiais já carregados.
   - Consulta o catálogo atual.
   - Ignora modalidades excluídas ou inativas.
   - Mostra somente modalidades autorizadas.
   - Não apresenta tarifas.
   - Não grava no Firebase.
================================================== */

async function MOTORISTAPAG_Login_func_exibirVeiculosGerenciarCategorias() {

    const lista = document.getElementById(
        "MOTORISTAPAG_Login_categorias_lista_veiculos"
    );

    const dados = MOTORISTAPAG_Login_dadosGerenciarCategorias;

    if (!lista || !dados) {
        return;
    }

    lista.replaceChildren();
    lista.setAttribute("aria-busy", "true");

    try {

        const cacheCategorias = {};

        for (const veiculo of dados.veiculos) {

            const veiculoId = String(veiculo.id || "");

            const autorizacao =
                dados.subcategoriasPorVeiculo[veiculoId] || {};

            const categoria = String(
                autorizacao.categoria ||
                veiculo.categoria ||
                veiculo.categoriaPrincipal ||
                ""
            ).toLowerCase();

            if (!Object.prototype.hasOwnProperty.call(
                cacheCategorias, categoria
            )) {

                cacheCategorias[categoria] =
                    await MOTORISTAPAG_Login_func_consultarModalidadesDisponiveis(
                        categoria
                    );

            }

            const disponiveis = cacheCategorias[categoria];

            const autorizadas = Array.isArray(
                autorizacao.autorizadas
            ) ? autorizacao.autorizadas : [];

            const ativas = Array.isArray(
                autorizacao.ativas
            ) ? autorizacao.ativas : [];

            const modalidades = disponiveis.filter(
                function(modalidade) {
                    return autorizadas.includes(modalidade.id);
                }
            );

            const card = document.createElement("section");

            card.className =
                "TNP_mini_moldura " +
                "MOTORISTAPAG_Login_categorias_veiculo_card";

            const topo = document.createElement("div");

            topo.className =
                "MOTORISTAPAG_Login_categorias_veiculo_topo";

            const info = document.createElement("div");

            info.className =
                "MOTORISTAPAG_Login_categorias_veiculo_info";

            const titulo = document.createElement("strong");

            titulo.textContent = [
                veiculo.marca,
                veiculo.modelo
            ].filter(Boolean).join(" ") || veiculoId;

            const detalhes = document.createElement("small");

            detalhes.textContent =
                (veiculo.placa || "Sem placa") +
                " • " +
                categoria.toUpperCase();

            info.append(titulo, detalhes);
            topo.appendChild(info);
            card.appendChild(topo);

            const areaModalidades = document.createElement("div");

            areaModalidades.className =
                "MOTORISTAPAG_Login_categorias_modalidades";

            if (modalidades.length === 0) {

                const aviso = document.createElement("p");

                aviso.textContent =
                    "Nenhuma modalidade disponível " +
                    "e autorizada para este veículo.";

                areaModalidades.appendChild(aviso);

            } else {

                for (const modalidade of modalidades) {

                    const linha = document.createElement("label");

                    linha.className =
                        "TNP_mini_moldura " +
                        "MOTORISTAPAG_Login_categorias_modalidade_item";

                    const texto = document.createElement("span");

                    texto.className =
                        "MOTORISTAPAG_Login_categorias_modalidade_texto";

                    const nome = document.createElement("strong");

                    nome.textContent = modalidade.nome;

                    const descricao = document.createElement("small");

                    descricao.textContent =
                        "Autorizada pelo administrador";

                    texto.append(nome, descricao);

                    const checkbox = document.createElement("input");

                    checkbox.type = "checkbox";

                    checkbox.className =
                        "MOTORISTAPAG_Login_categorias_modalidade_checkbox";

                    checkbox.checked =
                        ativas.includes(modalidade.id);

										
					/* ==========================================
					   MOTORISTA PODE ATIVAR OU DESATIVAR
					   SOMENTE MODALIDADES AUTORIZADAS
					========================================== */

					checkbox.disabled = false;

					checkbox.addEventListener("change", function() {

						const botaoSalvar = document.getElementById(
							"MOTORISTAPAG_Login_btn_salvar_categorias"
						);

						if (botaoSalvar) {
							botaoSalvar.disabled = false;
						}

						const status = document.getElementById(
							"MOTORISTAPAG_Login_categorias_status"
						);

						if (status) {
							status.textContent =
								"Alterações pendentes. Toque em SALVAR ALTERAÇÕES para confirmar.";
						}

					});


                    checkbox.dataset.veiculoId = veiculoId;
                    checkbox.dataset.subcategoriaId = modalidade.id;

                    linha.append(texto, checkbox);

                    areaModalidades.appendChild(linha);

                }

            }

            card.appendChild(areaModalidades);

            lista.appendChild(card);

        }

        if (dados.veiculos.length === 0) {

            const aviso = document.createElement("p");

            aviso.textContent =
                "Nenhum veículo cadastrado encontrado.";

            lista.appendChild(aviso);

        }

    } catch (erro) {

        console.error(
            "TNP MOB — Erro ao exibir modalidades:",
            erro
        );

        const aviso = document.createElement("p");

        aviso.textContent =
            "Não foi possível carregar as modalidades.";

        lista.replaceChildren(aviso);

    } finally {

        lista.setAttribute("aria-busy", "false");

    }

}





/* ==================================================
   TNP MOB — GERENCIAR CATEGORIAS
   ETAPA DE NAVEGAÇÃO FINAL
================================================== */


/* ==================================================
   MOTORISTA — FERRAMENTAS DE ACEITAÇÃO
================================================== */


/* ==================================================
   CARREGAR MÓDULO
================================================== */

async function MOTORISTAPAG_Login_func_carregarModuloFerramentas() {
    const area = document.getElementById('MOTORISTAPAG_Login_area_ferramentas');

    if (!area) {
        console.error('Área do módulo Ferramentas não encontrada.');
        return false;
    }

    if (!document.getElementById('MOTORISTAPAG_Login_modal_ferramentas')) {
        try {
            const resposta = await fetch('ferramentas/ferramentas.html');

            if (!resposta.ok) {
                throw new Error('Não foi possível carregar ferramentas.html');
            }

            area.innerHTML = await resposta.text();

        } catch (erro) {
            console.error('Erro ao carregar módulo Ferramentas:', erro);
            return false;
        }
    }


    /* SINCRONIZA O TEMA ATUAL DO MAPA */

    if (typeof TNP_MAPA_func_atualizarBotoesTema === "function") {
        TNP_MAPA_func_atualizarBotoesTema();
    }

    return true;
}



/* ==================================================
   MOTORISTA — FECHAR FERRAMENTAS
================================================== */

function MOTORISTAPAG_Login_func_fecharFerramentas() {

    const modal = document.getElementById(
        "MOTORISTAPAG_Login_modal_ferramentas"
    );

    if (modal) {
        modal.classList.remove("active");
    }

    if (
        typeof TNP_MOB_func_removerCamadaVoltar === "function"
    ) {
        TNP_MOB_func_removerCamadaVoltar(
            "motorista_ferramentas"
        );
    }
}

/* ==================================================
   MOTORISTA — ABRIR MÓDULO FERRAMENTAS
================================================== */

async function MOTORISTAPAG_Login_func_abrirModuloFerramentas() {

    const carregou =
        await MOTORISTAPAG_Login_func_carregarModuloFerramentas();

    if (!carregou) {
        return false;
    }

    const modal = document.getElementById(
        "MOTORISTAPAG_Login_modal_ferramentas"
    );

    if (!modal) {
        console.error("Modal Ferramentas não encontrado.");
        return false;
    }

    modal.classList.add("active");

    if (
        typeof TNP_MOB_func_registrarCamadaVoltar === "function"
    ) {
        TNP_MOB_func_registrarCamadaVoltar(
            "motorista_ferramentas",
            MOTORISTAPAG_Login_func_fecharFerramentas
        );
    }

    return true;
}

/* ==================================================
   DISPONIBILIZAR GLOBALMENTE
================================================== */

window.MOTORISTAPAG_Login_func_carregarModuloFerramentas =
    MOTORISTAPAG_Login_func_carregarModuloFerramentas;

window.MOTORISTAPAG_Login_func_fecharFerramentas =
    MOTORISTAPAG_Login_func_fecharFerramentas;
	
window.MOTORISTAPAG_Login_func_abrirModuloFerramentas =
    MOTORISTAPAG_Login_func_abrirModuloFerramentas;	

/* ==================================================
   TNP MOB — HOME MOTORISTA
   ESTADO DE CONEXÃO CONFORME PAINEL ADMIN
================================================== */

function MOTORISTAPAG_Login_func_obterEstadoConexaoAdmin(
    m = {}
) {

    // Mesma prioridade de status do Painel Admin.
    const status = String(
        m.statusAnaliseMotorista ||
        m.statusAnalise ||
        m.motoristaStatus ||
        m.status?.geral ||
        "em_analise"
    ).trim().toLowerCase();


    // Confirmação PIX — mesmos campos do Admin.
    const pix = m.pixConfirmacaoRecebimento || {};

    const pixConfirmado =
        pix.status === "pago" ||
        pix.pago === true ||
        m.contaRecebimentoConfirmada === true;


    // Veículo atual.
    const veiculoAtual = Array.isArray(m.veiculos)
        ? (
            m.veiculos.find(
                v => v.id === m.veiculoAtualId
            ) ||
            m.veiculos[0] ||
            {}
        )
        : (m.veiculo || {});


    // Documentos que podem exigir correção.
    const documentos = [
        m.documentosMotorista?.fotoCnh,
        m.documentosMotorista?.selfieComCnh,
        m.documentosMotorista?.cnhDigital,
        m.documentosMotorista?.selfieValidacaoCnh,
        m.documentosVeiculo?.crlv,
        m.documentosVeiculo?.fotoVeiculoPlaca,
        veiculoAtual.documentos?.crlv,
        veiculoAtual.documentos?.fotoVeiculoPlaca
    ];

    const documentosComPendencia =
        documentos.some(documento =>
            [
                "reprovado",
                "recusado",
                "pendente_correcao",
                "corrigir"
            ].includes(
                String(
                    documento?.status || ""
                ).trim().toLowerCase()
            )
        );


    // Bloqueios reconhecidos pelo Painel Admin.
    const statusBloqueado = [
        "bloqueado",
        "bloqueado_cnh_vencida",
        "recusado",
        "reprovado",
        "suspenso",
        "cancelado"
    ].includes(status);


    const statusCorrecao = [
        "pendente_correcao",
        "pendente_correcao_selfie",
        "pendente_correcao_veiculo",
        "pendente_documentos"
    ].includes(status);


	
    /* ==================================================
       PENDÊNCIAS ADMINISTRATIVAS — MAPA OFICIAL

       Uma pendência obrigatória ativa impede
       a conexão, independentemente do modal.

       Pendências não obrigatórias e documentos
       já enviados para análise não são
       bloqueados apenas por este mapa.
    ================================================== */

    const mapaPendenciasAdmin =
        m.pendenciasAdminMotorista &&
        typeof m.pendenciasAdminMotorista === "object" &&
        !Array.isArray(m.pendenciasAdminMotorista)
            ? m.pendenciasAdminMotorista
            : {};

    const statusPendenciasAtivas = [
        "aguardando_envio",
        "pendente_envio",
        "pendente_correcao",
        "reprovado",
        "recusado",
        "corrigir"
    ];

    const possuiPendenciaAdminObrigatoria =
        Object.values(mapaPendenciasAdmin).some(
            function(registro) {

                if (
                    !registro ||
                    typeof registro !== "object" ||
                    Array.isArray(registro)
                ) {
                    return false;
                }

                const statusPendencia =
                    String(registro.status || "")
                        .trim()
                        .toLowerCase();

                return (
                    registro.obrigatoria !== false &&
                    statusPendenciasAtivas.includes(
                        statusPendencia
                    )
                );
            }
        );


    
    const possuiPendencia =
        statusBloqueado ||
        statusCorrecao ||
        documentosComPendencia ||
        possuiPendenciaAdminObrigatoria ||
        m.cnhBloqueioPorVencimento === true ||
        m.bloqueadoPorPendenciaAdmin === true ||
        m.bloqueadoPorSelfieInadequada === true ||
        m.cpfConflito === true ||
        m.cpfConflitoStatus ===
            "pendente_analise_suporte";


    // 1. Pendências e bloqueios administrativos.
    if (possuiPendencia) {
        return {
            estado: "pendencia",
            texto: "VER PENDÊNCIA"
        };
    }


    // 2. Pendência financeira.
    if (
        !pixConfirmado ||
        m.bloqueadoPorPagamentoMotorista === true
    ) {
        return {
            estado: "pagamento",
            texto: "VER PAGAMENTO"
        };
    }


    // 3. Autorização oficial do Painel Admin.
    const aprovado =
        status === "aprovado" &&
        m.podeAceitarCorrida === true &&
        m.cadastroCompletoMotorista === true &&
        m.perfil100Motorista === true;


    if (aprovado) {
        return {
            estado: "offline",
            texto: "CONECTAR"
        };
    }


    // 4. Ainda não aprovado.
    return {
        estado: "analise",
        texto: "EM ANÁLISE"
    };
}


/* ==================================================
   HOME MOTORISTA — VERIFICAR CONFIRMAÇÃO PIX
================================================== */

async function MOTORISTAPAG_Login_func_verificarConfirmacaoPixHome(
    dadosMotorista = {}
) {

    /*
     * A Home verifica somente o estado permanente.
     *
     * Se a conta já foi confirmada corretamente,
     * não existe nada para abrir.
     */

    if (
        dadosMotorista.contaRecebimentoConfirmada ===
        true
    ) {
        return false;
    }


    /*
     * A partir daqui a responsabilidade sai da Home.
     *
     * O módulo pix-confirmacao-conta:
     * - abre a confirmação;
     * - chama o motor Pix;
     * - recebe o resultado;
     * - verifica CPF;
     * - chama CPF divergente quando necessário.
     */

    if (
        typeof TNPPIX_func_abrirModal !==
        "function"
    ) {

        console.error(
            "TNP MOB: módulo de confirmação Pix não está disponível na Home do motorista."
        );

        return false;
    }


    await TNPPIX_func_abrirModal({
        origem:
            "motorista",

        tipoPagamento:
            "confirmacao_conta_recebimento_motorista"
    });


    return true;
}


/* =========================================================
   TNP MOB — GERENCIADOR DE PENDÊNCIAS
   BOTÃO CONECTAR / SAIR — INTEGRAÇÃO FUTURA

   RESPONSABILIDADE DESTE MÓDULO
   ---------------------------------------------------------
   Este módulo é o responsável por controlar a autorização
   e a disponibilidade ONLINE / OFFLINE do motorista.

   FLUXO DO BOTÃO CONECTAR:
   1. Consultar motoristas/{uid} no Firebase.
   2. Conferir aprovação administrativa.
   3. Verificar pendências obrigatórias e bloqueios.
   4. Verificar confirmação PIX e cadastro completo.
   5. Se houver restrição, impedir a conexão.
   6. Se estiver autorizado, registrar ONLINE no Firebase.
   7. Ao tocar em SAIR, registrar OFFLINE no Firebase.

   ESTADO ATUAL:
   ---------------------------------------------------------
   A verificação das pendências e da autorização já existe
   e foi testada com dados simulados e pendência real.

   A mudança ONLINE / OFFLINE ainda é apenas visual.
   A gravação oficial no Firebase NÃO foi implementada.

   INTEGRAÇÃO FUTURA COM CHAMADAS:
   ---------------------------------------------------------
   motorista/homem/chamadas/

   O módulo Chamadas possui responsabilidade própria:
   - Consultar corridas disponíveis.
   - Exibir informações das chamadas.
   - Ordenar por proximidade ou maior valor.
   - Permitir solicitar a aceitação da corrida.

   Chamadas NÃO controla o botão CONECTAR / SAIR.
   Chamadas NÃO define a disponibilidade do motorista.

   SEGURANÇA:
   ---------------------------------------------------------
   Quando o sistema de corridas for implementado,
   o backend também deverá verificar a autorização
   do motorista antes de permitir aceitar uma corrida.

   Uma pendência administrativa obrigatória deve impedir
   novas corridas, independentemente de modais abertos.

   A disponibilidade oficial deverá utilizar um contrato
   único no Firebase, ainda a ser definido e validado.

   REGRAS DE MODULARIZAÇÃO:
   ---------------------------------------------------------
   - Firebase mantém o estado oficial.
   - O Gerenciador controla ONLINE / OFFLINE.
   - Chamadas consulta e apresenta corridas.
   - O backend autoriza a aceitação definitiva.
   - Não duplicar lógica entre módulos.
   - Não alterar nomes ou caminhos Firebase existentes
     sem conferir previamente o contrato oficial.

   PENDENTE:
   Implementar e testar a persistência ONLINE / OFFLINE
   quando iniciarmos o sistema real de corridas.

   NÃO IMPLEMENTAR NESTA ETAPA.
========================================================= */


async function MOTORISTAPAG_GERENCIADOR_func_acionarBotaoConectar() {

    const btn = document.getElementById(
        "MOTORISTAPAG_Login_btn_conectar"
    );

    if (!btn) return false;


    // Permite sair do estado online.
    if (btn.dataset.estado === "online") {

        btn.dataset.estado = "offline";
        btn.innerText = "CONECTAR";

        btn.classList.remove(
            "MOTORISTAPAG_Login_home_btn_online"
        );

        return true;
    }


    const user =
        PRIMEIRAPAG_Login_auth.currentUser;

    if (!user) {
        return false;
    }


    // Evita dois cliques simultâneos.
    if (btn.dataset.verificando === "true") {
        return false;
    }

    btn.dataset.verificando = "true";
    btn.disabled = true;


    try {

        // Consulta diretamente o estado oficial
        // do Motorista antes de conectar.
        const snap = await PRIMEIRAPAG_Login_db
            .collection("motoristas")
            .doc(user.uid)
            .get({ source: "server" });


        if (!snap.exists) {
            throw new Error(
                "Cadastro do Motorista não encontrado."
            );
        }


        const dadosMotorista = snap.data() || {};

        const resultado =
            MOTORISTAPAG_Login_func_obterEstadoConexaoAdmin(
                dadosMotorista
            );


        // Atualiza o botão com os dados recentes.
        btn.dataset.estado = resultado.estado;
        btn.innerText = resultado.texto;

        btn.classList.remove(
            "MOTORISTAPAG_Login_home_btn_online"
        );


        if (resultado.estado === "pendencia") {

            MOTORISTAPAG_Login_func_abrirPaginaProvisoria(
                "Pendência no cadastro",
                "Existe uma pendência no seu cadastro. Abra Meu perfil para revisar as informações."
            );

            return false;
        }


				
		if (resultado.estado === "pagamento") {

			/* ==========================================
			   HOME MOTORISTA — ABRIR CONFIRMAÇÃO PIX

			   Não altera o Firebase.
			   Não confirma pagamento automaticamente.
			   Não libera o Motorista para corridas.
			========================================== */

			if (typeof TNPPIX_func_abrirModal !== "function") {
				console.error(
					"TNP MOB: módulo de confirmação PIX não disponível."
				);

				return false;
			}

			await TNPPIX_func_abrirModal({
				origem: "motorista",
				tipoPagamento: "confirmacao_conta_recebimento_motorista"
			});

			return false;
		}



        if (resultado.estado === "analise") {

            MOTORISTAPAG_Login_func_abrirPaginaProvisoria(
                "Cadastro em análise",
                "Seu cadastro de motorista está aguardando aprovação administrativa."
            );

            return false;
        }


        // Somente o estado autorizado conecta.
        if (resultado.estado === "offline") {

            btn.dataset.estado = "online";
            btn.innerText = "SAIR";

            btn.classList.add(
                "MOTORISTAPAG_Login_home_btn_online"
            );

            return true;
        }


        return false;

    } catch (erro) {

        console.error(
            "Erro ao verificar autorização do Motorista:",
            erro
        );

        alert(
            "Não foi possível conferir sua autorização. Tente novamente."
        );

        return false;

    } finally {

        btn.dataset.verificando = "false";
        btn.disabled = false;
    }
}

window.MOTORISTAPAG_GERENCIADOR_func_acionarBotaoConectar =
    MOTORISTAPAG_GERENCIADOR_func_acionarBotaoConectar;

/* ==================================================
   TNP MOB — GANHOS E RECOMPENSAS
   MÓDULO DO MOTORISTA
================================================== */


/* ==================================================
   GANHOS — FORMATO PADRÃO DOS REGISTROS
================================================== */

/*
 * Todos os registros usados por Ganhos,
 * Histórico completo e Relatórios financeiros
 * deverão seguir este mesmo formato.
 *
 * CAMPOS PRINCIPAIS
 *
 * id:
 * Identificador único do registro.
 *
 * corridaId:
 * Identificador da corrida relacionada.
 * Pode ficar vazio em promoções ou pausas gerais.
 *
 * motoristaId:
 * UID do motorista proprietário do registro.
 *
 * grupo:
 * corridas
 * financeiro
 * espera
 * percurso
 * promocoes
 * cancelamentos
 * pausas
 *
 * status:
 * recebida
 * aceita
 * concluida
 * cancelada
 * credito
 * debito
 * pendente
 * pausa_ativa
 * pausa_finalizada
 *
 * tipoRegistro:
 * Identifica o evento específico dentro do grupo.
 *
 * criadoEm:
 * Data do registro ou Firebase Timestamp.
 *
 * descricao:
 * Texto explicativo apresentado no Histórico.
 *
 * impactoFinanceiro:
 * true quando o registro altera valores.
 * false quando é somente um evento operacional.
 *
 * valorBruto:
 * Valor original antes de taxas e descontos.
 *
 * valorCredito:
 * Valor positivo acrescentado ao motorista.
 *
 * valorDebito:
 * Valor retirado ou descontado.
 *
 * valorLiquido:
 * Resultado financeiro final do registro.
 *
 * taxaPlataforma:
 * Valor da taxa da plataforma.
 *
 * statusFinanceiro:
 * pendente
 * disponivel
 * bloqueado
 * estornado
 *
 * tempoEsperaMinutos:
 * Quantidade de minutos cobrados de espera.
 *
 * origem e destino:
 * Endereços relacionados à corrida.
 *
 * motivo:
 * Motivo de cancelamento, ajuste ou ocorrência.
 */


/* ==================================================
   GANHOS — REGISTROS CENTRAIS
================================================== */

let MOTORISTAPAG_Login_historicoGanhosRegistros = [];

/* ==================================================
   GANHOS — FORMATAR DATA E HORÁRIO
   USO COMPARTILHADO: HISTÓRICO / RELATÓRIOS
================================================== */

function MOTORISTAPAG_Login_func_formatarDataHoraHistoricoGanhos(
    valor
) {

    const data =
        MOTORISTAPAG_Login_func_converterDataHistoricoGanhos(
            valor
        );

    if (!data) {
        return "Data não informada";
    }

    return data.toLocaleString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

/* ==================================================
   GANHOS — OBTER TÍTULO DO REGISTRO
   USO COMPARTILHADO: HISTÓRICO / RELATÓRIOS
================================================== */

function MOTORISTAPAG_Login_func_obterTituloRegistroHistoricoGanhos(
    registro
) {

    if (
        registro.titulo
    ) {
        return registro.titulo;
    }

    const chave =
        String(
            registro.grupo || ""
        ) +
        ":" +
        String(
            registro.status || ""
        );

    const titulos = {
        "corridas:recebida":
            "Solicitação recebida",

        "corridas:aceita":
            "Corrida aceita",

        "corridas:concluida":
            "Corrida concluída",

        "corridas:cancelada":
            "Corrida cancelada",

        "financeiro:credito":
            "Crédito recebido",

        "financeiro:debito":
            "Ajuste financeiro",

        "financeiro:pendente":
            "Valor pendente",

        "espera:credito":
            "Tempo de espera",

        "percurso:credito":
            "Alteração de percurso",

        "promocoes:credito":
            "Promoção ou recompensa",

        "cancelamentos:cancelada":
            "Cancelamento registrado",

        "pausas:pausa_ativa":
            "Pausa temporária ativa",

        "pausas:pausa_finalizada":
            "Pausa temporária finalizada"
    };

    return titulos[chave] ||
        registro.tipoTexto ||
        "Registro do histórico";
}

/* ==================================================
   GANHOS — OBTER TEXTO DO STATUS
   USO COMPARTILHADO: HISTÓRICO / RELATÓRIOS
================================================== */

function MOTORISTAPAG_Login_func_obterTextoStatusHistoricoGanhos(
    status
) {

    const textos = {
        recebida:
            "Recebida",

        aceita:
            "Aceita",

        concluida:
            "Concluída",

        cancelada:
            "Cancelada",

        credito:
            "Crédito",

        debito:
            "Ajuste",

        pendente:
            "Pendente",

        pausa_ativa:
            "Pausa ativa",

        pausa_finalizada:
            "Pausa finalizada"
    };

    return textos[status] ||
        "Registrado";
}

/* ==================================================
   GANHOS — DEFINIR REGISTROS CENTRAIS
================================================== */

function MOTORISTAPAG_Login_func_definirRegistrosHistoricoGanhos(
    registros
) {

    MOTORISTAPAG_Login_historicoGanhosRegistros =
        Array.isArray(registros)
            ? registros.slice()
            : [];

    const modalHistorico =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_historico_ganhos"
        );

    if (
        modalHistorico &&
        typeof MOTORISTAPAG_Login_func_renderizarHistoricoGanhos ===
            "function"
    ) {
        MOTORISTAPAG_Login_func_renderizarHistoricoGanhos();
    }
}

/* ==================================================
   MOTORISTA — GANHOS E RECOMPENSAS
   BASE FUNCIONAL SEM CORRIDAS
================================================== */

/*
 * Esta função receberá futuramente o resumo
 * calculado a partir das corridas e dos registros
 * financeiros do motorista.
 *
 * Enquanto não houver corridas, todos os campos
 * permanecem zerados.
 */
 
 /* ==================================================
   GANHOS — CONVERTER NÚMERO
================================================== */

function MOTORISTAPAG_Login_func_converterNumeroGanhos(
    valor
) {

    const numero =
        Number(valor);

    return Number.isFinite(numero)
        ? numero
        : 0;
}

/* ==================================================
   GANHOS — FORMATAR MOEDA
   USO COMPARTILHADO: GANHOS / RELATÓRIOS
================================================== */

function MOTORISTAPAG_Login_func_formatarMoedaGanhos(
    valor
) {

    return MOTORISTAPAG_Login_func_converterNumeroGanhos(
        valor
    ).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}

/* ==================================================
   GANHOS — ALTERAR TEXTO
   USO COMPARTILHADO: GANHOS / RELATÓRIOS
================================================== */

function MOTORISTAPAG_Login_func_definirTextoGanhos(
    idElemento,
    valor
) {

    const elemento =
        document.getElementById(
            idElemento
        );

    if (!elemento) {
        return;
    }

    elemento.innerText =
        valor;
}

/* ==================================================
   GANHOS — RECEBER RESUMO
================================================== */

function MOTORISTAPAG_Login_func_definirResumoGanhos(
    dados
) {

    const resumo =
        dados &&
        typeof dados === "object"
            ? dados
            : {};


    /*
     * Valores principais.
     */

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_ganhos_semana_valor",
        MOTORISTAPAG_Login_func_formatarMoedaGanhos(
            resumo.ganhosSemana
        )
    );

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_ganhos_hoje_valor",
        MOTORISTAPAG_Login_func_formatarMoedaGanhos(
            resumo.ganhosHoje
        )
    );

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_ganhos_mes_valor",
        MOTORISTAPAG_Login_func_formatarMoedaGanhos(
            resumo.ganhosMes
        )
    );

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_ganhos_saldo_disponivel",
        MOTORISTAPAG_Login_func_formatarMoedaGanhos(
            resumo.saldoDisponivel
        )
    );

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_ganhos_saldo_pendente",
        MOTORISTAPAG_Login_func_formatarMoedaGanhos(
            resumo.saldoPendente
        )
    );


    /*
     * Texto abaixo do ganho semanal.
     */

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_ganhos_semana_periodo",
        resumo.textoSemana ||
        "Nenhuma corrida concluída nesta semana."
    );


    /*
     * Resumo das corridas.
     */

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_ganhos_solicitacoes",
        String(
            MOTORISTAPAG_Login_func_converterNumeroGanhos(
                resumo.solicitacoesRecebidas
            )
        )
    );

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_ganhos_aceitas",
        String(
            MOTORISTAPAG_Login_func_converterNumeroGanhos(
                resumo.corridasAceitas
            )
        )
    );

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_ganhos_concluidas",
        String(
            MOTORISTAPAG_Login_func_converterNumeroGanhos(
                resumo.corridasConcluidas
            )
        )
    );

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_ganhos_canceladas",
        String(
            MOTORISTAPAG_Login_func_converterNumeroGanhos(
                resumo.corridasCanceladas
            )
        )
    );


    /*
     * Detalhamento financeiro.
     */

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_ganhos_corridas_valor",
        MOTORISTAPAG_Login_func_formatarMoedaGanhos(
            resumo.ganhosCorridas
        )
    );

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_ganhos_espera_valor",
        MOTORISTAPAG_Login_func_formatarMoedaGanhos(
            resumo.ganhosEspera
        )
    );

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_ganhos_ajustes_valor",
        MOTORISTAPAG_Login_func_formatarMoedaGanhos(
            resumo.ajustesPercurso
        )
    );

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_ganhos_recompensas_valor",
        MOTORISTAPAG_Login_func_formatarMoedaGanhos(
            resumo.promocoesRecompensas
        )
    );

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_ganhos_taxa_plataforma",
        MOTORISTAPAG_Login_func_formatarMoedaGanhos(
            resumo.taxaPlataforma
        )
    );

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_ganhos_total_liquido",
        MOTORISTAPAG_Login_func_formatarMoedaGanhos(
            resumo.totalLiquido
        )
    );


    /*
     * Atividade operacional.
     */

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_ganhos_cancelamentos_embarque",
        String(
            MOTORISTAPAG_Login_func_converterNumeroGanhos(
                resumo.cancelamentosAntesEmbarque
            )
        )
    );

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_ganhos_pausa_status",
        resumo.pausaOperacionalAtiva === true
            ? "Sim"
            : "Não"
    );


    /*
     * Promoções disponíveis.
     */

    const quantidadePromocoes =
        MOTORISTAPAG_Login_func_converterNumeroGanhos(
            resumo.promocoesQuantidade
        );

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_ganhos_promocoes_quantidade",
        quantidadePromocoes === 1
            ? "1 disponível"
            : quantidadePromocoes +
              " disponíveis"
    );
}

/* ==================================================
   GANHOS — LIMPAR RESUMO
================================================== */

function MOTORISTAPAG_Login_func_limparResumoGanhos() {

    MOTORISTAPAG_Login_func_definirResumoGanhos(
        {}
    );
}


/* ==================================================
   MOTORISTA — GANHOS
   CENTRALIZAR REGISTROS FUTUROS
================================================== */

/*
 * Esta função não busca nada no Firebase ainda.
 *
 * Futuramente, depois de carregar as corridas,
 * bastará executar:
 *
 * MOTORISTAPAG_Login_func_atualizarGanhosComRegistros(
 *     registros
 * );
 */

/* ==================================================
   GANHOS — INÍCIO DO DIA
================================================== */

function MOTORISTAPAG_Login_func_inicioDiaGanhos(
    data
) {

    return new Date(
        data.getFullYear(),
        data.getMonth(),
        data.getDate(),
        0,
        0,
        0,
        0
    );
}

/* ==================================================
   GANHOS — INÍCIO DA SEMANA
================================================== */

function MOTORISTAPAG_Login_func_inicioSemanaGanhos(
    data
) {

    const inicio =
        MOTORISTAPAG_Login_func_inicioDiaGanhos(
            data
        );

    const diaSemana =
        inicio.getDay();

    const diferenca =
        diaSemana === 0
            ? -6
            : 1 - diaSemana;

    inicio.setDate(
        inicio.getDate() +
        diferenca
    );

    return inicio;
}

/* ==================================================
   GANHOS — INÍCIO DO MÊS
================================================== */

function MOTORISTAPAG_Login_func_inicioMesGanhos(
    data
) {

    return new Date(
        data.getFullYear(),
        data.getMonth(),
        1,
        0,
        0,
        0,
        0
    );
}

/* ==================================================
   GANHOS — VALOR LÍQUIDO DO REGISTRO
   USO COMPARTILHADO: GANHOS / RELATÓRIOS
================================================== */

function MOTORISTAPAG_Login_func_obterValorLiquidoRegistroGanhos(
    registro
) {

    if (
        registro.valorLiquido !==
            undefined &&
        registro.valorLiquido !==
            null
    ) {

        return MOTORISTAPAG_Login_func_converterNumeroGanhos(
            registro.valorLiquido
        );
    }

    const credito =
        MOTORISTAPAG_Login_func_converterNumeroGanhos(
            registro.valorCredito
        );

    const debito =
        MOTORISTAPAG_Login_func_converterNumeroGanhos(
            registro.valorDebito
        );

    return credito - debito;
}

/* ==================================================
   GANHOS — VERIFICAR IMPACTO FINANCEIRO
   USO COMPARTILHADO: GANHOS / RELATÓRIOS
================================================== */

function MOTORISTAPAG_Login_func_registroPossuiImpactoFinanceiro(
    registro
) {

    if (
        registro.impactoFinanceiro ===
        false
    ) {
        return false;
    }

    const valorCredito =
        MOTORISTAPAG_Login_func_converterNumeroGanhos(
            registro.valorCredito
        );

    const valorDebito =
        MOTORISTAPAG_Login_func_converterNumeroGanhos(
            registro.valorDebito
        );

    const valorLiquido =
        MOTORISTAPAG_Login_func_obterValorLiquidoRegistroGanhos(
            registro
        );

    return (
        valorCredito !== 0 ||
        valorDebito !== 0 ||
        valorLiquido !== 0
    );
}

/* ==================================================
   GANHOS — CALCULAR RESUMO DOS REGISTROS
================================================== */
/* ==================================================
   GANHOS — REGRA PARA NÃO DUPLICAR VALORES
================================================== */

/*
 * REGRA PARA QUANDO AS CORRIDAS REAIS FOREM LIGADAS:
 *
 * Cada valor financeiro deve possuir apenas um
 * registro responsável por somá-lo.
 *
 * Exemplo:
 *
 * O registro da corrida concluída guarda:
 *
 * grupo: "corridas"
 * status: "concluida"
 * impactoFinanceiro: true
 * valorBruto
 * valorCredito
 * valorLiquido
 * taxaPlataforma
 *
 * Caso outro registro seja criado apenas para informar
 * que o crédito passou de pendente para disponível,
 * ele não pode somar o dinheiro novamente.
 *
 * Nesse caso, usar:
 *
 * grupo: "financeiro"
 * tipoRegistro: "credito_liberado"
 * impactoFinanceiro: false
 * statusFinanceiro: "disponivel"
 *
 * Não repetir nesse registro informativo:
 *
 * valorCredito
 * valorLiquido
 * taxaPlataforma
 *
 * Portanto:
 *
 * - evento operacional informa o que aconteceu;
 * - registro financeiro principal soma o valor;
 * - mudança de status financeiro apenas informa;
 * - o mesmo ganho nunca deve ser registrado duas vezes
 *   com impactoFinanceiro igual a true.
 */
 
 

/* ==================================================
   GANHOS — CALCULAR RESUMO DOS REGISTROS
   USO COMPARTILHADO: GANHOS / RELATÓRIOS
================================================== */

function MOTORISTAPAG_Login_func_calcularResumoGanhosRegistros(
    registros
) {

    const agora =
        new Date();

    const inicioHoje =
        MOTORISTAPAG_Login_func_inicioDiaGanhos(
            agora
        );

    const inicioSemana =
        MOTORISTAPAG_Login_func_inicioSemanaGanhos(
            agora
        );

    const inicioMes =
        MOTORISTAPAG_Login_func_inicioMesGanhos(
            agora
        );

    const resumo = {
        ganhosHoje: 0,
        ganhosSemana: 0,
        ganhosMes: 0,

        saldoDisponivel: 0,
        saldoPendente: 0,

        solicitacoesRecebidas: 0,
        corridasAceitas: 0,
        corridasConcluidas: 0,
        corridasCanceladas: 0,

        valorBrutoCorridas: 0,
		ganhosCorridas: 0,
		ganhosEspera: 0,
		
        ajustesPercurso: 0,
        promocoesRecompensas: 0,
        taxaPlataforma: 0,
        totalLiquido: 0,

        cancelamentosAntesEmbarque: 0,
        pausaOperacionalAtiva: false,

        promocoesQuantidade: 0,
        textoSemana:
            "Nenhuma corrida concluída nesta semana."
    };

    let concluidasNestaSemana = 0;

	/*
	 * Impede que o mesmo registro ou a mesma etapa
	 * da corrida seja contabilizada mais de uma vez.
	 */
	const idsRegistrosProcessados =
		new Set();

	const solicitacoesContadas =
		new Set();

	const corridasAceitasContadas =
		new Set();

	const corridasConcluidasContadas =
		new Set();

	const corridasCanceladasContadas =
		new Set();

	registros.forEach(
		function (
			registro,
			indice
		) {

			const idRegistro =
				String(
					registro.id || ""
				).trim();

			/*
			 * O mesmo registro não pode ser
			 * processado duas vezes.
			 */
			if (
				idRegistro &&
				idsRegistrosProcessados.has(
					idRegistro
				)
			) {
				return;
			}

			if (idRegistro) {
				idsRegistrosProcessados.add(
					idRegistro
				);
			}

            const grupo =
                String(
                    registro.grupo || ""
                )
                    .toLowerCase()
                    .trim();

            const status =
                String(
                    registro.status || ""
                )
                    .toLowerCase()
                    .trim();

            const tipoRegistro =
				String(
					registro.tipoRegistro ||
					registro.tipo ||
					""
				)
					.toLowerCase()
					.trim();

			/*
			 * Os eventos operacionais são contados
			 * uma única vez por corrida.
			 *
			 * O índice é apenas uma proteção temporária
			 * para registros antigos sem id e corridaId.
			 */
			const chaveCorrida =
				String(
					registro.corridaId ||
					idRegistro ||
					"registro_" + indice
				).trim();

            const dataRegistro =
                MOTORISTAPAG_Login_func_converterDataHistoricoGanhos(
                    registro.criadoEm
                );

            const valorLiquido =
                MOTORISTAPAG_Login_func_obterValorLiquidoRegistroGanhos(
                    registro
                );
				
			const valorBrutoCorrida =
				MOTORISTAPAG_Login_func_converterNumeroGanhos(
					registro.valorBrutoCorrida ||
					registro.valorBruto ||
					registro.valorCredito
				);	

            const possuiImpactoFinanceiro =
                MOTORISTAPAG_Login_func_registroPossuiImpactoFinanceiro(
                    registro
                );
				
				const ehConclusaoCorrida =
				grupo === "corridas" &&
				status === "concluida";

			const primeiraConclusaoCorrida =
				!ehConclusaoCorrida ||
				!corridasConcluidasContadas.has(
					chaveCorrida
				);

			/*
			 * Uma corrida concluída não pode ter o valor
			 * principal somado duas vezes.
			 */
			const contabilizarImpactoFinanceiro =
				possuiImpactoFinanceiro &&
				primeiraConclusaoCorrida;


            /*
             * Valores por período.
             */

				if (
					dataRegistro &&
					contabilizarImpactoFinanceiro
				) {

                if (
                    dataRegistro.getTime() >=
                    inicioHoje.getTime()
                ) {
                    resumo.ganhosHoje +=
                        valorLiquido;
                }

                if (
                    dataRegistro.getTime() >=
                    inicioSemana.getTime()
                ) {
                    resumo.ganhosSemana +=
                        valorLiquido;
                }

                if (
                    dataRegistro.getTime() >=
                    inicioMes.getTime()
                ) {
                    resumo.ganhosMes +=
                        valorLiquido;
                }
            }


            /*
			 * Resumo das corridas.
			 *
			 * Cada situação é contabilizada uma única
			 * vez por corrida.
			 */

			if (
				grupo === "corridas"
			) {

				if (
					status === "recebida" &&
					!solicitacoesContadas.has(
						chaveCorrida
					)
				) {

					solicitacoesContadas.add(
						chaveCorrida
					);

					resumo.solicitacoesRecebidas++;
				}

				if (
					status === "aceita" &&
					!corridasAceitasContadas.has(
						chaveCorrida
					)
				) {

					corridasAceitasContadas.add(
						chaveCorrida
					);

					resumo.corridasAceitas++;
				}

				if (
					status === "concluida" &&
					!corridasConcluidasContadas.has(
						chaveCorrida
					)
				) {

					corridasConcluidasContadas.add(
						chaveCorrida
					);

					resumo.corridasConcluidas++;

					if (
						contabilizarImpactoFinanceiro
					) {

						resumo.valorBrutoCorridas +=
							valorBrutoCorrida;

						resumo.ganhosCorridas +=
							valorLiquido;
					}

					if (
						dataRegistro &&
						dataRegistro.getTime() >=
						inicioSemana.getTime()
					) {
						concluidasNestaSemana++;
					}
				}

				if (
					status === "cancelada" &&
					!corridasCanceladasContadas.has(
						chaveCorrida
					)
				) {

					corridasCanceladasContadas.add(
						chaveCorrida
					);

					resumo.corridasCanceladas++;
				}
			}


            /*
             * Detalhamento financeiro.
             */

            if (
				grupo === "espera" &&
				contabilizarImpactoFinanceiro
			) {
				resumo.ganhosEspera +=
					valorLiquido;
			}

			if (
				grupo === "percurso" &&
				contabilizarImpactoFinanceiro
			) {
				resumo.ajustesPercurso +=
					valorLiquido;
			}

			if (
				grupo === "promocoes" &&
				contabilizarImpactoFinanceiro
			) {
				resumo.promocoesRecompensas +=
					valorLiquido;
			}

            if (
				contabilizarImpactoFinanceiro &&
				tipoRegistro ===
					"taxa_plataforma"
			) {

				const valorTaxa =
					MOTORISTAPAG_Login_func_converterNumeroGanhos(
						registro.valorDebito ||
						registro.taxaPlataforma
					);

				resumo.taxaPlataforma +=
					Math.abs(
						valorTaxa
					);
			}

            if (
				contabilizarImpactoFinanceiro &&
                registro.taxaPlataforma !==
                    undefined &&
                tipoRegistro !==
                    "taxa_plataforma"
            ) {

                resumo.taxaPlataforma +=
                    Math.abs(
                        MOTORISTAPAG_Login_func_converterNumeroGanhos(
                            registro.taxaPlataforma
                        )
                    );
            }


            /*
             * Saldo disponível e pendente.
             */

            const disponibilidade =
                String(
                    registro.disponibilidade ||
                    registro.statusFinanceiro ||
                    ""
                )
                    .toLowerCase()
                    .trim();

            if (
				contabilizarImpactoFinanceiro &&
                disponibilidade ===
                "disponivel"
            ) {
                resumo.saldoDisponivel +=
                    valorLiquido;
            }

            if (
				contabilizarImpactoFinanceiro &&
                disponibilidade ===
                "pendente"
            ) {
                resumo.saldoPendente +=
                    valorLiquido;
            }


            /*
             * Total líquido.
             */

            if (
                contabilizarImpactoFinanceiro
            ) {
                resumo.totalLiquido +=
                    valorLiquido;
            }


            /*
             * Cancelamentos antes do embarque.
             */

            if (
                grupo ===
                    "cancelamentos" &&
                (
                    registro.antesEmbarque ===
                        true ||
                    tipoRegistro ===
                        "cancelamento_antes_embarque"
                )
            ) {
                resumo.cancelamentosAntesEmbarque++;
            }


            /*
             * Pausa operacional.
             */

            if (
                grupo === "pausas" &&
                status === "pausa_ativa"
            ) {
                resumo.pausaOperacionalAtiva =
                    true;
            }


            /*
             * Promoções atualmente disponíveis.
             */

            if (
                grupo === "promocoes" &&
                registro.promocaoAtiva ===
                    true
            ) {
                resumo.promocoesQuantidade++;
            }
        }
    );


    /*
     * Texto mostrado abaixo dos ganhos semanais.
     */

    if (
        concluidasNestaSemana === 1
    ) {

        resumo.textoSemana =
            "1 corrida concluída nesta semana.";

    } else if (
        concluidasNestaSemana > 1
    ) {

        resumo.textoSemana =
            concluidasNestaSemana +
            " corridas concluídas nesta semana.";
    }

    return resumo;
}

/* ==================================================
   GANHOS — ATUALIZAR REGISTROS E RESUMO
================================================== */

function MOTORISTAPAG_Login_func_atualizarGanhosComRegistros(
    registros
) {

    const listaRegistros =
        Array.isArray(registros)
            ? registros.slice()
            : [];

    /*
     * Atualiza os registros centrais.
     * Se o Histórico completo estiver montado,
     * ele também será renderizado.
     */

    MOTORISTAPAG_Login_func_definirRegistrosHistoricoGanhos(
        listaRegistros
    );


    /*
     * Calcula e atualiza a tela principal.
     */

    const resumo =
        MOTORISTAPAG_Login_func_calcularResumoGanhosRegistros(
            listaRegistros
        );

    MOTORISTAPAG_Login_func_definirResumoGanhos(
        resumo
    );
}

/* ==================================================
   MOTORISTA — ABRIR TELA DE GANHOS
================================================== */

async function MOTORISTAPAG_Login_func_abrirGanhos() {

    if (
        typeof MOTORISTAPAG_Login_func_fecharMenuLateral ===
        "function"
    ) {
        MOTORISTAPAG_Login_func_fecharMenuLateral();
    }

    let modalGanhos =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_ganhos"
        );

    /*
     * Se o módulo ainda não estiver montado,
     * carrega o HTML de Ganhos.
     */

    if (!modalGanhos) {

        const areaHistorico =
            document.getElementById(
                "MOTORISTAPAG_Login_area_historico"
            );

        if (!areaHistorico) {

            alert(
                "A área de Ganhos e recompensas não foi encontrada."
            );

            return;
        }

        try {

            const resposta =
                await fetch(
                    "historico/historico.html"
                );

            if (!resposta.ok) {

                throw new Error(
                    "Falha ao carregar Ganhos e recompensas."
                );
            }

            areaHistorico.innerHTML =
                await resposta.text();

            modalGanhos =
                document.getElementById(
                    "MOTORISTAPAG_Login_modal_ganhos"
                );

        } catch (erro) {

            console.error(
                "Erro ao carregar Ganhos e recompensas:",
                erro
            );

            alert(
                "Não foi possível abrir Ganhos e recompensas."
            );

            return;
        }
    }

    if (!modalGanhos) {
        return;
    }

    modalGanhos.classList.add(
        "active"
    );
	
		
	/*
	 * GANHOS E RECOMPENSAS — VOLTAR GLOBAL
	 *
	 * Registra o módulo pai na pilha de navegação.
	 */
	if (
		typeof TNP_MOB_func_registrarCamadaVoltar ===
		"function"
	) {
		TNP_MOB_func_registrarCamadaVoltar(
			"motorista_ganhos",
			MOTORISTAPAG_Login_func_fecharGanhos
		);
	}


    /*
     * Atualiza a tela com os registros
     * que já estiverem carregados.
     */

    MOTORISTAPAG_Login_func_atualizarGanhosComRegistros(
        MOTORISTAPAG_Login_historicoGanhosRegistros
    );
}


/* ==================================================
   MOTORISTA — FECHAR TELA DE GANHOS
================================================== */

function MOTORISTAPAG_Login_func_fecharGanhos() {

    const modalGanhos =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_ganhos"
        );

    /*
     * FECHAR GANHOS E RECOMPENSAS
     */
    if (modalGanhos) {

        modalGanhos.classList.remove(
            "active"
        );
    }

    /*
     * GANHOS E RECOMPENSAS — VOLTAR GLOBAL
     *
     * Remove o módulo pai da pilha quando
     * a tela de Ganhos for fechada.
     */
    if (
        typeof TNP_MOB_func_removerCamadaVoltar ===
        "function"
    ) {
        TNP_MOB_func_removerCamadaVoltar(
            "motorista_ganhos"
        );
    }
}






































/* ==================================================
   GANHOS — DISPONIBILIZAR FUNÇÕES
================================================== */

window.MOTORISTAPAG_Login_func_definirRegistrosHistoricoGanhos =
    MOTORISTAPAG_Login_func_definirRegistrosHistoricoGanhos;
	
/* ==================================================
   GANHOS — DISPONIBILIZAR FUNÇÕES
================================================== */

window.MOTORISTAPAG_Login_func_definirResumoGanhos =
    MOTORISTAPAG_Login_func_definirResumoGanhos;

window.MOTORISTAPAG_Login_func_limparResumoGanhos =
    MOTORISTAPAG_Login_func_limparResumoGanhos;	
	

/* ==================================================
   GANHOS — DISPONIBILIZAR PONTE FUTURA
================================================== */

window.MOTORISTAPAG_Login_func_atualizarGanhosComRegistros =
    MOTORISTAPAG_Login_func_atualizarGanhosComRegistros;

window.MOTORISTAPAG_Login_func_calcularResumoGanhosRegistros =
    MOTORISTAPAG_Login_func_calcularResumoGanhosRegistros;
	

window.MOTORISTAPAG_Login_func_fecharGanhos =
    MOTORISTAPAG_Login_func_fecharGanhos;
	
window.MOTORISTAPAG_Login_func_abrirGanhos =
    MOTORISTAPAG_Login_func_abrirGanhos;	

let MOTORISTAPAG_Login_relatorioConsultadoAtual = null;
	
let MOTORISTAPAG_Login_compartilhamentoNativoAtivo = false;	



function MOTORISTAPAG_Login_func_mostrarErroRelatorios(
    mensagem
) {

    const campoErro =
        document.getElementById(
            "MOTORISTAPAG_Login_error_relatorios"
        );

    if (!campoErro) {
        return;
    }

    campoErro.innerText =
        mensagem || "";
}

/* ==================================================
   RELATÓRIOS — CRIAR OPÇÃO DE PERÍODO
================================================== */

function MOTORISTAPAG_Login_func_criarOpcaoPeriodoRelatorio(
    valor,
    texto
) {

    const opcao =
        document.createElement(
            "option"
        );

    opcao.value =
        valor;

    opcao.textContent =
        texto;

    return opcao;
}

/* ==================================================
   RELATÓRIOS — FORMATAR DATA
================================================== */

function MOTORISTAPAG_Login_func_formatarDataRelatorio(
    valor
) {

    if (!valor) {
        return "";
    }

    const partes =
        String(valor).split("-");

    if (
        partes.length !== 3
    ) {
        return "";
    }

    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );
}

/* ==================================================
   RELATÓRIOS — ATUALIZAR TEXTO DO PERÍODO
================================================== */

function MOTORISTAPAG_Login_func_atualizarPeriodoRelatorio() {

    const campoTipo =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_tipo"
        );

    const campoPeriodo =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_periodo"
        );

    const campoTexto =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_periodo_texto"
        );

    if (
        !campoTipo ||
        !campoTexto
    ) {
        return;
    }

    MOTORISTAPAG_Login_func_mostrarErroRelatorios(
        ""
    );

    if (
        campoTipo.value ===
        "personalizado"
    ) {

        const campoInicio =
            document.getElementById(
                "MOTORISTAPAG_Login_relatorios_data_inicio"
            );

        const campoFim =
            document.getElementById(
                "MOTORISTAPAG_Login_relatorios_data_fim"
            );

        const dataInicio =
            campoInicio
                ? MOTORISTAPAG_Login_func_formatarDataRelatorio(
                    campoInicio.value
                )
                : "";

        const dataFim =
            campoFim
                ? MOTORISTAPAG_Login_func_formatarDataRelatorio(
                    campoFim.value
                )
                : "";

        campoTexto.innerText =
            dataInicio &&
            dataFim
                ? dataInicio +
                  " até " +
                  dataFim
                : "Período personalizado";

        return;
    }

    if (!campoPeriodo) {
        return;
    }

    const opcaoSelecionada =
        campoPeriodo.options[
            campoPeriodo.selectedIndex
        ];

    campoTexto.innerText =
        opcaoSelecionada
            ? opcaoSelecionada.textContent
            : "Período selecionado";
}

/* ==================================================
   RELATÓRIOS — VALIDAR DATAS
================================================== */

function MOTORISTAPAG_Login_func_validarDatasRelatorio() {

    const campoTipo =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_tipo"
        );

    const campoInicio =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_data_inicio"
        );

    const campoFim =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_data_fim"
        );

    if (
        !campoTipo ||
        !campoInicio ||
        !campoFim
    ) {
        return false;
    }

    /*
     * Qualquer mudança nos seletores invalida
     * o relatório consultado anteriormente.
     */
    MOTORISTAPAG_Login_relatorioConsultadoAtual =
        null;

    const btnPdf =
        document.getElementById(
            "MOTORISTAPAG_Login_btn_relatorio_pdf"
        );

    if (btnPdf) {
        btnPdf.disabled =
            true;
    }

    const btnCsv =
        document.getElementById(
            "MOTORISTAPAG_Login_btn_relatorio_csv"
        );

    if (btnCsv) {
        btnCsv.disabled =
            true;
    }

    const btnCompartilhar =
        document.getElementById(
            "MOTORISTAPAG_Login_btn_relatorio_compartilhar"
        );

    if (btnCompartilhar) {
        btnCompartilhar.disabled =
            true;
    }

    campoInicio.setCustomValidity(
        ""
    );

    campoFim.setCustomValidity(
        ""
    );

    MOTORISTAPAG_Login_func_mostrarErroRelatorios(
        ""
    );

    if (
        campoTipo.value !==
        "personalizado"
    ) {
        return true;
    }

    /*
     * Enquanto as duas datas ainda não foram
     * preenchidas, não exibe erro automático.
     *
     * A mensagem será mostrada ao clicar
     * em Consultar relatório.
     */
    if (
        !campoInicio.value ||
        !campoFim.value
    ) {
        return false;
    }

    if (
        campoInicio.value >
        campoFim.value
    ) {

        const mensagem =
            "A data inicial não pode ser maior que a data final.";

        campoInicio.setCustomValidity(
            mensagem
        );

        campoFim.setCustomValidity(
            mensagem
        );

        MOTORISTAPAG_Login_func_mostrarErroRelatorios(
            mensagem
        );

        return false;
    }

    return true;
}	
	
/* ==================================================
   RELATÓRIOS — ALTERAR TIPO
================================================== */

function MOTORISTAPAG_Login_func_alterarTipoRelatorio() {

    const campoTipo =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_tipo"
        );

    const campoPeriodo =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_periodo"
        );

    const labelPeriodo =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_periodo_label"
        );

    const blocoDatas =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_datas"
        );

    const campoInicio =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_data_inicio"
        );

    const campoFim =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_data_fim"
        );

    if (
        !campoTipo ||
        !campoPeriodo ||
        !labelPeriodo ||
        !blocoDatas
    ) {
        return;
    }

    MOTORISTAPAG_Login_func_mostrarErroRelatorios(
        ""
    );

    if (campoInicio) {
        campoInicio.setCustomValidity(
            ""
        );
    }

    if (campoFim) {
        campoFim.setCustomValidity(
            ""
        );
    }

    /*
     * PERÍODO PERSONALIZADO
     */

    if (
        campoTipo.value ===
        "personalizado"
    ) {

        labelPeriodo.style.display =
            "none";

        campoPeriodo.style.display =
            "none";

        blocoDatas.style.display =
            "grid";

        MOTORISTAPAG_Login_func_validarDatasRelatorio();

        return;
    }

    /*
     * RELATÓRIO MENSAL OU ANUAL
     */

    labelPeriodo.style.display =
        "block";

    campoPeriodo.style.display =
        "block";

    blocoDatas.style.display =
        "none";

    campoPeriodo.replaceChildren();

    if (
        campoTipo.value ===
        "anual"
    ) {

        campoPeriodo.append(
            MOTORISTAPAG_Login_func_criarOpcaoPeriodoRelatorio(
                "ano_atual",
                "Este ano"
            ),

            MOTORISTAPAG_Login_func_criarOpcaoPeriodoRelatorio(
                "ano_anterior",
                "Ano anterior"
            )
        );

    } else {

        campoPeriodo.append(
            MOTORISTAPAG_Login_func_criarOpcaoPeriodoRelatorio(
                "mes_atual",
                "Este mês"
            ),

            MOTORISTAPAG_Login_func_criarOpcaoPeriodoRelatorio(
                "mes_anterior",
                "Mês anterior"
            )
        );
    }

    MOTORISTAPAG_Login_func_validarDatasRelatorio();
}

/* ==================================================
   RELATÓRIOS — INICIALIZAR SELETORES
================================================== */

function MOTORISTAPAG_Login_func_inicializarRelatorios() {

    const campoTipo =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_tipo"
        );

    if (!campoTipo) {
        return;
    }

    MOTORISTAPAG_Login_func_alterarTipoRelatorio();
}

/* ==================================================
   RELATÓRIOS — OBTER INTERVALO SELECIONADO
================================================== */

function MOTORISTAPAG_Login_func_obterIntervaloRelatorio() {

    const campoTipo =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_tipo"
        );

    const campoPeriodo =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_periodo"
        );

    const campoInicio =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_data_inicio"
        );

    const campoFim =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_data_fim"
        );

    if (!campoTipo) {

        MOTORISTAPAG_Login_func_mostrarErroRelatorios(
            "Não foi possível identificar o tipo de relatório."
        );

        return null;
    }

    const agora =
        new Date();

    let inicio = null;
    let fim = null;


    /*
     * PERÍODO PERSONALIZADO
     */

    if (
        campoTipo.value ===
        "personalizado"
    ) {

        if (
            !campoInicio ||
            !campoFim
        ) {

            MOTORISTAPAG_Login_func_mostrarErroRelatorios(
                "Os campos de data não foram encontrados."
            );

            return null;
        }

        if (
            !campoInicio.value &&
            !campoFim.value
        ) {

            MOTORISTAPAG_Login_func_mostrarErroRelatorios(
                "Selecione a data inicial e a data final."
            );

            campoInicio.focus();

            return null;
        }

        if (!campoInicio.value) {

            MOTORISTAPAG_Login_func_mostrarErroRelatorios(
                "Selecione a data inicial."
            );

            campoInicio.focus();

            return null;
        }

        if (!campoFim.value) {

            MOTORISTAPAG_Login_func_mostrarErroRelatorios(
                "Selecione a data final."
            );

            campoFim.focus();

            return null;
        }

        if (
            !MOTORISTAPAG_Login_func_validarDatasRelatorio()
        ) {
            return null;
        }

        inicio =
            MOTORISTAPAG_Login_func_converterDataInputHistoricoGanhos(
                campoInicio.value,
                false
            );

        fim =
            MOTORISTAPAG_Login_func_converterDataInputHistoricoGanhos(
                campoFim.value,
                true
            );

        return {
            inicio: inicio,
            fim: fim
        };
    }


    /*
     * RELATÓRIO MENSAL OU ANUAL
     */

    if (!campoPeriodo) {

        MOTORISTAPAG_Login_func_mostrarErroRelatorios(
            "Selecione o período do relatório."
        );

        return null;
    }

    switch (
        campoPeriodo.value
    ) {

        case "mes_anterior":

            inicio =
                new Date(
                    agora.getFullYear(),
                    agora.getMonth() - 1,
                    1,
                    0,
                    0,
                    0,
                    0
                );

            fim =
                new Date(
                    agora.getFullYear(),
                    agora.getMonth(),
                    0,
                    23,
                    59,
                    59,
                    999
                );

            break;


        case "ano_atual":

            inicio =
                new Date(
                    agora.getFullYear(),
                    0,
                    1,
                    0,
                    0,
                    0,
                    0
                );

            fim =
                new Date(
                    agora.getFullYear(),
                    11,
                    31,
                    23,
                    59,
                    59,
                    999
                );

            break;


        case "ano_anterior":

            inicio =
                new Date(
                    agora.getFullYear() - 1,
                    0,
                    1,
                    0,
                    0,
                    0,
                    0
                );

            fim =
                new Date(
                    agora.getFullYear() - 1,
                    11,
                    31,
                    23,
                    59,
                    59,
                    999
                );

            break;


        case "mes_atual":
        default:

            inicio =
                new Date(
                    agora.getFullYear(),
                    agora.getMonth(),
                    1,
                    0,
                    0,
                    0,
                    0
                );

            fim =
                new Date(
                    agora.getFullYear(),
                    agora.getMonth() + 1,
                    0,
                    23,
                    59,
                    59,
                    999
                );

            break;
    }

    return {
        inicio: inicio,
        fim: fim
    };
}

/* ==================================================
   RELATÓRIOS — CONSULTAR
================================================== */

function MOTORISTAPAG_Login_func_consultarRelatorio() {

    MOTORISTAPAG_Login_func_mostrarErroRelatorios(
        ""
    );

    const intervalo =
        MOTORISTAPAG_Login_func_obterIntervaloRelatorio();

    if (!intervalo) {
        return;
    }


    /*
     * Filtra a lista central já utilizada
     * pelo histórico e pela tela de ganhos.
     */

    const registrosDoPeriodo =
        MOTORISTAPAG_Login_historicoGanhosRegistros.filter(
            function (registro) {

                const dataRegistro =
                    MOTORISTAPAG_Login_func_converterDataHistoricoGanhos(
                        registro.criadoEm
                    );

                if (!dataRegistro) {
                    return false;
                }

                return (
                    dataRegistro.getTime() >=
                        intervalo.inicio.getTime() &&
                    dataRegistro.getTime() <=
                        intervalo.fim.getTime()
                );
            }
        );


    /*
     * Reaproveita o cálculo já existente.
     */

    const resumo =
        MOTORISTAPAG_Login_func_calcularResumoGanhosRegistros(
            registrosDoPeriodo
        );


    /*
     * Resumo financeiro.
     */

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_relatorios_valor_bruto",
        MOTORISTAPAG_Login_func_formatarMoedaGanhos(
            resumo.valorBrutoCorridas
        )
    );

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_relatorios_valor_espera",
        MOTORISTAPAG_Login_func_formatarMoedaGanhos(
            resumo.ganhosEspera
        )
    );

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_relatorios_valor_ajustes",
        MOTORISTAPAG_Login_func_formatarMoedaGanhos(
            resumo.ajustesPercurso
        )
    );

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_relatorios_valor_promocoes",
        MOTORISTAPAG_Login_func_formatarMoedaGanhos(
            resumo.promocoesRecompensas
        )
    );

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_relatorios_taxa_plataforma",
        MOTORISTAPAG_Login_func_formatarMoedaGanhos(
            resumo.taxaPlataforma
        )
    );

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_relatorios_total_liquido",
        MOTORISTAPAG_Login_func_formatarMoedaGanhos(
            resumo.totalLiquido
        )
    );


    /*
     * Atividade do período.
     */

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_relatorios_solicitacoes",
        String(
            resumo.solicitacoesRecebidas
        )
    );

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_relatorios_aceitas",
        String(
            resumo.corridasAceitas
        )
    );

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_relatorios_concluidas",
        String(
            resumo.corridasConcluidas
        )
    );

    MOTORISTAPAG_Login_func_definirTextoGanhos(
        "MOTORISTAPAG_Login_relatorios_canceladas",
        String(
            resumo.corridasCanceladas
        )
    );


    /*
     * Atualiza o texto do período somente
     * depois que a consulta foi realizada.
     */

    MOTORISTAPAG_Login_func_atualizarPeriodoRelatorio();
	
	/*
	 * Guarda o resultado exato desta consulta.
	 */

	const campoTipoRelatorio =
		document.getElementById(
			"MOTORISTAPAG_Login_relatorios_tipo"
		);

	const campoPeriodoRelatorio =
		document.getElementById(
			"MOTORISTAPAG_Login_relatorios_periodo"
		);

	const campoInicioRelatorio =
		document.getElementById(
			"MOTORISTAPAG_Login_relatorios_data_inicio"
		);

	const campoFimRelatorio =
		document.getElementById(
			"MOTORISTAPAG_Login_relatorios_data_fim"
		);

	const campoPeriodoTexto =
		document.getElementById(
			"MOTORISTAPAG_Login_relatorios_periodo_texto"
		);

	MOTORISTAPAG_Login_relatorioConsultadoAtual = {
		tipo:
			campoTipoRelatorio
				? campoTipoRelatorio.value
				: "",

		periodo:
			campoPeriodoRelatorio
				? campoPeriodoRelatorio.value
				: "",

		dataInicio:
			campoInicioRelatorio
				? campoInicioRelatorio.value
				: "",

		dataFim:
			campoFimRelatorio
				? campoFimRelatorio.value
				: "",

		periodoTexto:
			campoPeriodoTexto
				? campoPeriodoTexto.innerText
				: "Período consultado",

		intervalo: intervalo,

		registros:
			registrosDoPeriodo.slice(),

		resumo: resumo
	};


	/*
	 * O PDF só é liberado quando existem registros.
	 */

	const btnPdf =
		document.getElementById(
			"MOTORISTAPAG_Login_btn_relatorio_pdf"
		);

	if (btnPdf) {
		btnPdf.disabled =
			registrosDoPeriodo.length === 0;
	}
	
		const btnCsv =
		document.getElementById(
			"MOTORISTAPAG_Login_btn_relatorio_csv"
		);

	if (btnCsv) {
		btnCsv.disabled =
			registrosDoPeriodo.length === 0;
	}
	
	const btnCompartilhar =
		document.getElementById(
			"MOTORISTAPAG_Login_btn_relatorio_compartilhar"
		);

	if (btnCompartilhar) {
		btnCompartilhar.disabled =
			registrosDoPeriodo.length === 0;
	}
    /*
     * Estado vazio.
     */

    const estadoVazio =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_estado_vazio"
        );

    if (estadoVazio) {

        estadoVazio.style.display =
            registrosDoPeriodo.length === 0
                ? "flex"
                : "none";
    }
}

/* ==================================================
   RELATÓRIOS — GERAR PDF
================================================== */

async function MOTORISTAPAG_Login_func_gerarPdfRelatorio(modo = "baixar") {

    MOTORISTAPAG_Login_func_mostrarErroRelatorios(
        ""
    );

    const consulta =
        MOTORISTAPAG_Login_relatorioConsultadoAtual;

    if (
        !consulta ||
        !Array.isArray(
            consulta.registros
        ) ||
        consulta.registros.length === 0
    ) {

        MOTORISTAPAG_Login_func_mostrarErroRelatorios(
            "Consulte um período com registros antes de gerar o PDF."
        );

        return;
    }


    /*
     * Confirma que o motorista não alterou
     * o período depois da última consulta.
     */

    const campoTipo =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_tipo"
        );

    const campoPeriodo =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_periodo"
        );

    const campoInicio =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_data_inicio"
        );

    const campoFim =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_data_fim"
        );

    const tipoAtual =
        campoTipo
            ? campoTipo.value
            : "";

    const periodoAtual =
        campoPeriodo
            ? campoPeriodo.value
            : "";

    const dataInicioAtual =
        campoInicio
            ? campoInicio.value
            : "";

    const dataFimAtual =
        campoFim
            ? campoFim.value
            : "";

    if (
        consulta.tipo !==
            tipoAtual ||
        consulta.periodo !==
            periodoAtual ||
        consulta.dataInicio !==
            dataInicioAtual ||
        consulta.dataFim !==
            dataFimAtual
    ) {

        MOTORISTAPAG_Login_func_mostrarErroRelatorios(
            "O período foi alterado. Consulte o relatório novamente antes de gerar o PDF."
        );

        return;
    }


    /*
     * Verifica se a biblioteca foi carregada.
     */

    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        MOTORISTAPAG_Login_func_mostrarErroRelatorios(
            "Não foi possível carregar o gerador de PDF. Verifique sua conexão e tente novamente."
        );

        return;
    }

    try {

        const jsPDF =
            window.jspdf.jsPDF;

        const pdf =
            new jsPDF({
                orientation:
                    "portrait",

                unit:
                    "mm",

                format:
                    "a4"
            });

        const larguraPagina =
            pdf.internal.pageSize.getWidth();

        const alturaPagina =
            pdf.internal.pageSize.getHeight();

        const margem =
            15;

        const larguraUtil =
            larguraPagina -
            margem * 2;

        let posicaoY =
            18;


        /*
         * Identificação do motorista.
         */

        let identificacaoMotorista =
            "Motorista TNP MOB";

        try {

            const usuarioAtual =
                window.firebase &&
                firebase.auth
                    ? firebase.auth().currentUser
                    : null;

            if (usuarioAtual) {

                identificacaoMotorista =
                    usuarioAtual.displayName ||
                    usuarioAtual.email ||
                    identificacaoMotorista;
            }

        } catch (erroFirebase) {

            /*
             * O PDF continua mesmo quando
             * não for possível obter o usuário.
             */
        }


        /*
         * Título.
         */

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.setFontSize(
            17
        );

        pdf.text(
            "TNP MOB - Relatório financeiro",
            margem,
            posicaoY
        );

        posicaoY +=
            9;

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.setFontSize(
            10
        );

        pdf.text(
            "Motorista: " +
            identificacaoMotorista,
            margem,
            posicaoY
        );

        posicaoY +=
            5;

        pdf.text(
            "Período: " +
            consulta.periodoTexto,
            margem,
            posicaoY
        );

        posicaoY +=
            5;

        pdf.text(
            "Emitido em: " +
            new Date().toLocaleString(
                "pt-BR"
            ),
            margem,
            posicaoY
        );

        posicaoY +=
            7;

        pdf.line(
            margem,
            posicaoY,
            larguraPagina - margem,
            posicaoY
        );

        posicaoY +=
            9;


        /*
         * Resumo financeiro.
         */

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.setFontSize(
            13
        );

        pdf.text(
            "Resumo financeiro",
            margem,
            posicaoY
        );

        posicaoY +=
            8;

        pdf.setFontSize(
            10
        );

        const linhasFinanceiras = [
            [
                "Valor bruto das corridas",
                consulta.resumo.valorBrutoCorridas
            ],

            [
                "Tempo de espera",
                consulta.resumo.ganhosEspera
            ],

            [
                "Ajustes de percurso e trânsito",
                consulta.resumo.ajustesPercurso
            ],

            [
                "Promoções e recompensas",
                consulta.resumo.promocoesRecompensas
            ],

            [
                "Taxa da plataforma",
                consulta.resumo.taxaPlataforma
            ],

            [
                "Total líquido do motorista",
                consulta.resumo.totalLiquido
            ]
        ];

        linhasFinanceiras.forEach(
            function (
                linha,
                indice
            ) {

                pdf.setFont(
                    "helvetica",
                    indice ===
                        linhasFinanceiras.length - 1
                            ? "bold"
                            : "normal"
                );

                pdf.text(
                    linha[0],
                    margem,
                    posicaoY
                );

                pdf.text(
                    MOTORISTAPAG_Login_func_formatarMoedaGanhos(
                        linha[1]
                    ),
                    larguraPagina - margem,
                    posicaoY,
                    {
                        align:
                            "right"
                    }
                );

                posicaoY +=
                    6;
            }
        );

        posicaoY +=
            4;


        /*
         * Atividade do período.
         */

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.setFontSize(
            13
        );

        pdf.text(
            "Atividade do período",
            margem,
            posicaoY
        );

        posicaoY +=
            8;

        pdf.setFontSize(
            10
        );

        const linhasAtividade = [
            [
                "Solicitações recebidas",
                consulta.resumo.solicitacoesRecebidas
            ],

            [
                "Corridas aceitas",
                consulta.resumo.corridasAceitas
            ],

            [
                "Corridas concluídas",
                consulta.resumo.corridasConcluidas
            ],

            [
                "Corridas canceladas",
                consulta.resumo.corridasCanceladas
            ]
        ];

        linhasAtividade.forEach(
            function (linha) {

                pdf.setFont(
                    "helvetica",
                    "normal"
                );

                pdf.text(
                    linha[0],
                    margem,
                    posicaoY
                );

                pdf.text(
                    String(
                        linha[1]
                    ),
                    larguraPagina - margem,
                    posicaoY,
                    {
                        align:
                            "right"
                    }
                );

                posicaoY +=
                    6;
            }
        );

        posicaoY +=
            6;


        /*
         * Detalhamento dos registros.
         */

        if (
            posicaoY >
            alturaPagina - 35
        ) {

            pdf.addPage();

            posicaoY =
                18;
        }

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.setFontSize(
            13
        );

        pdf.text(
            "Movimentações do período",
            margem,
            posicaoY
        );

        posicaoY +=
            8;


        /*
         * Usa os registros já consultados e
         * organiza do mais recente para o mais antigo.
         */

        const registrosOrdenados =
            consulta.registros
                .slice()
                .sort(
                    function (
                        registroA,
                        registroB
                    ) {

                        const dataA =
                            MOTORISTAPAG_Login_func_converterDataHistoricoGanhos(
                                registroA.criadoEm
                            );

                        const dataB =
                            MOTORISTAPAG_Login_func_converterDataHistoricoGanhos(
                                registroB.criadoEm
                            );

                        return (
                            (
                                dataB
                                    ? dataB.getTime()
                                    : 0
                            ) -
                            (
                                dataA
                                    ? dataA.getTime()
                                    : 0
                            )
                        );
                    }
                );

        registrosOrdenados.forEach(
            function (registro) {

                const titulo =
                    MOTORISTAPAG_Login_func_obterTituloRegistroHistoricoGanhos(
                        registro
                    );

                const dataTexto =
                    MOTORISTAPAG_Login_func_formatarDataHoraHistoricoGanhos(
                        registro.criadoEm
                    );

                const corridaTexto =
                    registro.corridaId ||
                    "Sem corrida vinculada";

                const grupoTexto =
                    registro.grupo ||
                    "Não informado";

                const statusTexto =
                    registro.status ||
                    "Não informado";

                const descricaoTexto =
                    registro.descricao ||
                    "";

                const valorBruto =
                    MOTORISTAPAG_Login_func_converterNumeroGanhos(
                        registro.valorBruto ||
                        registro.valorBrutoCorrida
                    );

                const valorCredito =
                    MOTORISTAPAG_Login_func_converterNumeroGanhos(
                        registro.valorCredito
                    );

                const valorDebito =
                    MOTORISTAPAG_Login_func_converterNumeroGanhos(
                        registro.valorDebito
                    );

                const valorLiquido =
                    MOTORISTAPAG_Login_func_obterValorLiquidoRegistroGanhos(
                        registro
                    );

                const valorTaxa =
                    MOTORISTAPAG_Login_func_converterNumeroGanhos(
                        registro.taxaPlataforma
                    );

                const linhasRegistro = [];

                linhasRegistro.push(
                    dataTexto +
                    " - " +
                    titulo
                );

                linhasRegistro.push(
                    "Corrida: " +
                    corridaTexto +
                    " | Grupo: " +
                    grupoTexto +
                    " | Status: " +
                    statusTexto
                );

                if (descricaoTexto) {

                    linhasRegistro.push(
                        descricaoTexto
                    );
                }

                if (
                    MOTORISTAPAG_Login_func_registroPossuiImpactoFinanceiro(
                        registro
                    )
                ) {

                    linhasRegistro.push(
                        "Bruto: " +
                        MOTORISTAPAG_Login_func_formatarMoedaGanhos(
                            valorBruto
                        ) +
                        " | Crédito: " +
                        MOTORISTAPAG_Login_func_formatarMoedaGanhos(
                            valorCredito
                        ) +
                        " | Débito: " +
                        MOTORISTAPAG_Login_func_formatarMoedaGanhos(
                            valorDebito
                        )
                    );

                    linhasRegistro.push(
                        "Taxa: " +
                        MOTORISTAPAG_Login_func_formatarMoedaGanhos(
                            valorTaxa
                        ) +
                        " | Líquido: " +
                        MOTORISTAPAG_Login_func_formatarMoedaGanhos(
                            valorLiquido
                        )
                    );

                } else {

                    linhasRegistro.push(
                        "Impacto financeiro: nenhum"
                    );
                }


                /*
                 * Quebra automaticamente textos grandes.
                 */

                const linhasQuebradas = [];

                linhasRegistro.forEach(
                    function (linha) {

                        const partes =
                            pdf.splitTextToSize(
                                String(linha),
                                larguraUtil
                            );

                        partes.forEach(
                            function (parte) {

                                linhasQuebradas.push(
                                    parte
                                );
                            }
                        );
                    }
                );

                const alturaNecessaria =
                    linhasQuebradas.length *
                    4.8 +
                    8;

                if (
                    posicaoY +
                    alturaNecessaria >
                    alturaPagina - 18
                ) {

                    pdf.addPage();

                    posicaoY =
                        18;
                }

                pdf.setFont(
                    "helvetica",
                    "normal"
                );

                pdf.setFontSize(
                    9
                );

                linhasQuebradas.forEach(
                    function (
                        linha,
                        indice
                    ) {

                        pdf.setFont(
                            "helvetica",
                            indice === 0
                                ? "bold"
                                : "normal"
                        );

                        pdf.text(
                            linha,
                            margem,
                            posicaoY
                        );

                        posicaoY +=
                            4.8;
                    }
                );

                posicaoY +=
                    2;

                pdf.line(
                    margem,
                    posicaoY,
                    larguraPagina - margem,
                    posicaoY
                );

                posicaoY +=
                    6;
            }
        );


        /*
         * Aviso final.
         */

        if (
            posicaoY >
            alturaPagina - 35
        ) {

            pdf.addPage();

            posicaoY =
                18;
        }

        pdf.setFont(
            "helvetica",
            "italic"
        );

        pdf.setFontSize(
            8
        );

        const aviso =
            pdf.splitTextToSize(
                "Este relatório é um documento de apoio financeiro. Ele não substitui a declaração de imposto de renda nem a orientação de um profissional de contabilidade.",
                larguraUtil
            );

        pdf.text(
            aviso,
            margem,
            posicaoY
        );


        /*
         * Numeração das páginas.
         */

        const totalPaginas =
            pdf.getNumberOfPages();

        for (
            let pagina = 1;
            pagina <= totalPaginas;
            pagina++
        ) {

            pdf.setPage(
                pagina
            );

            pdf.setFont(
                "helvetica",
                "normal"
            );

            pdf.setFontSize(
                8
            );

            pdf.text(
                "Página " +
                pagina +
                " de " +
                totalPaginas,
                larguraPagina - margem,
                alturaPagina - 8,
                {
                    align:
                        "right"
                }
            );
        }


        /*
         * Nome seguro para o arquivo.
         */

        const periodoArquivo =
            String(
                consulta.periodoTexto ||
                "periodo"
            )
                .normalize(
                    "NFD"
                )
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )
                .toLowerCase()
                .replace(
                    /[^a-z0-9]+/g,
                    "_"
                )
                .replace(
                    /^_+|_+$/g,
                    ""
                );

        const dataArquivo =
            new Date()
                .toISOString()
                .slice(
                    0,
                    10
                );

        const nomeArquivo =
    "relatorio_financeiro_" +
    (
        periodoArquivo ||
        "periodo"
    ) +
    "_" +
    dataArquivo +
    ".pdf";


	/*
	 * Compartilhar o arquivo.
	 */

	if (
		modo ===
		"compartilhar"
	) {

		const blobPdf =
			pdf.output(
				"blob"
			);

		const arquivoPdf =
			new File(
				[
					blobPdf
				],
				nomeArquivo,
				{
					type:
						"application/pdf",

					lastModified:
						Date.now()
				}
			);

		let podeCompartilhar =
			typeof navigator.share ===
			"function";

		if (
			podeCompartilhar &&
			typeof navigator.canShare ===
				"function"
		) {

			podeCompartilhar =
				navigator.canShare({
					files: [
						arquivoPdf
					]
				});
		}

		if (
			podeCompartilhar
		) {

			try {

				await navigator.share({
					files: [
						arquivoPdf
					],

					title:
						"Relatório financeiro TNP MOB",

					text:
						"Relatório financeiro referente a " +
						consulta.periodoTexto +
						"."
				});

				return;

			} catch (
				erroCompartilhamento
			) {

				if (
					erroCompartilhamento &&
					erroCompartilhamento.name ===
						"AbortError"
				) {
					return;
				}

				console.warn(
					"O compartilhamento do PDF não foi concluído:",
					erroCompartilhamento
				);
			}
		}
	}


	/*
	 * Download normal ou proteção quando
	 * o compartilhamento não estiver disponível.
	 */

	pdf.save(
		nomeArquivo
	);

    } catch (erro) {

        console.error(
            "Erro ao gerar relatório em PDF:",
            erro
        );

        MOTORISTAPAG_Login_func_mostrarErroRelatorios(
            "Não foi possível gerar o PDF. Tente novamente."
        );
    }
}

/* ==================================================
   RELATÓRIOS — GERAR CSV
================================================== */

async function MOTORISTAPAG_Login_func_gerarCsvRelatorio(modo = "baixar") {

    MOTORISTAPAG_Login_func_mostrarErroRelatorios(
        ""
    );

    const consulta =
        MOTORISTAPAG_Login_relatorioConsultadoAtual;

    if (
        !consulta ||
        !Array.isArray(
            consulta.registros
        ) ||
        consulta.registros.length === 0
    ) {

        MOTORISTAPAG_Login_func_mostrarErroRelatorios(
            "Consulte um período com registros antes de exportar o CSV."
        );

        return;
    }


    /*
     * Colunas preparadas para abrir no Excel.
     *
     * O ponto e vírgula funciona melhor no
     * Excel configurado em português do Brasil.
     */

    const linhas = [
        [
            "Data",
            "Corrida",
            "Tipo",
            "Descrição",
            "Valor bruto",
            "Tempo de espera",
            "Ajuste de percurso",
            "Promoção",
            "Taxa da plataforma",
            "Valor líquido",
            "Status"
        ]
    ];


    /*
     * Organiza do registro mais antigo
     * para o mais recente na planilha.
     */

    const registrosOrdenados =
        consulta.registros
            .slice()
            .sort(
                function (
                    registroA,
                    registroB
                ) {

                    const dataA =
                        MOTORISTAPAG_Login_func_converterDataHistoricoGanhos(
                            registroA.criadoEm
                        );

                    const dataB =
                        MOTORISTAPAG_Login_func_converterDataHistoricoGanhos(
                            registroB.criadoEm
                        );

                    return (
                        (
                            dataA
                                ? dataA.getTime()
                                : 0
                        ) -
                        (
                            dataB
                                ? dataB.getTime()
                                : 0
                        )
                    );
                }
            );


    registrosOrdenados.forEach(
        function (registro) {

            const grupo =
                String(
                    registro.grupo || ""
                )
                    .toLowerCase()
                    .trim();

            const status =
                String(
                    registro.status || ""
                )
                    .toLowerCase()
                    .trim();

            const titulo =
                MOTORISTAPAG_Login_func_obterTituloRegistroHistoricoGanhos(
                    registro
                );

            const dataTexto =
                MOTORISTAPAG_Login_func_formatarDataHoraHistoricoGanhos(
                    registro.criadoEm
                );

            const valorBruto =
                MOTORISTAPAG_Login_func_converterNumeroGanhos(
                    registro.valorBruto ||
                    registro.valorBrutoCorrida
                );

            const valorLiquido =
                MOTORISTAPAG_Login_func_obterValorLiquidoRegistroGanhos(
                    registro
                );

            const taxaPlataforma =
                MOTORISTAPAG_Login_func_converterNumeroGanhos(
                    registro.taxaPlataforma
                );

            const tempoEspera =
                grupo === "espera"
                    ? valorLiquido
                    : 0;

            const ajustePercurso =
                grupo === "percurso"
                    ? valorLiquido
                    : 0;

            const promocao =
                grupo === "promocoes"
                    ? valorLiquido
                    : 0;

            const descricao = [
                registro.descricao || "",

                registro.origem &&
                registro.destino
                    ? registro.origem +
                      " → " +
                      registro.destino
                    : "",

                Number(
                    registro.tempoEsperaMinutos ||
                    0
                ) > 0
                    ? "Espera: " +
                      Number(
                          registro.tempoEsperaMinutos
                      ) +
                      " minuto(s)"
                    : "",

                registro.motivo
                    ? "Motivo: " +
                      registro.motivo
                    : ""
            ]
                .filter(
                    function (texto) {
                        return Boolean(texto);
                    }
                )
                .join(" | ");

            linhas.push([
				dataTexto,

				registro.corridaId ||
				"",

				titulo,

				descricao,

				valorBruto,

				tempoEspera,

				ajustePercurso,

				promocao,

				taxaPlataforma,

				MOTORISTAPAG_Login_func_registroPossuiImpactoFinanceiro(
					registro
				)
					? valorLiquido
					: 0,

				MOTORISTAPAG_Login_func_obterTextoStatusHistoricoGanhos(
					status
				)
			]);
        }
    );


    /*
     * Protege textos com ponto e vírgula,
     * aspas ou quebra de linha.
     */

    const conteudoCsv =
        "\uFEFF" +
        linhas.map(
            function (linha) {

                return linha.map(
                    function (valor) {

                        const texto =
                            String(
                                valor === undefined ||
                                valor === null
                                    ? ""
                                    : valor
                            );

                        return (
                            '"' +
                            texto.replace(
                                /"/g,
                                '""'
                            ) +
                            '"'
                        );
                    }
                ).join(";");
            }
        ).join("\r\n");


    /*
	 * Prepara o nome do arquivo.
	 */

	const periodoArquivo =
		String(
			consulta.periodoTexto ||
			"periodo"
		)
			.normalize(
				"NFD"
			)
			.replace(
				/[\u0300-\u036f]/g,
				""
			)
			.toLowerCase()
			.replace(
				/[^a-z0-9]+/g,
				"_"
			)
			.replace(
				/^_+|_+$/g,
				""
			);

	const dataArquivo =
		new Date()
			.toISOString()
			.slice(
				0,
				10
			);

	const nomeArquivo =
		"relatorio_financeiro_" +
		(
			periodoArquivo ||
			"periodo"
		) +
		"_" +
		dataArquivo +
		".csv";


	/*
	 * Cria o arquivo CSV.
	 */

	const arquivoBlob =
		new Blob(
			[
				conteudoCsv
			],
			{
				type:
					"text/csv"
			}
		);


	/*
	 * Compartilhar pelo sistema do aparelho.
	 */

	if (
		modo ===
		"compartilhar"
	) {

		let arquivoCsv =
			null;

		try {

			arquivoCsv =
				new File(
					[
						arquivoBlob
					],
					nomeArquivo,
					{
						type:
							"text/csv",

						lastModified:
							Date.now()
					}
				);

		} catch (
			erroCriacaoArquivo
		) {

			console.warn(
				"Não foi possível preparar o CSV para compartilhamento:",
				erroCriacaoArquivo
			);
		}


		let podeCompartilharArquivo =
			Boolean(
				arquivoCsv
			) &&
			typeof navigator.share ===
				"function";


		if (
			podeCompartilharArquivo &&
			typeof navigator.canShare ===
				"function"
		) {

			try {

				podeCompartilharArquivo =
					navigator.canShare({
						files: [
							arquivoCsv
						]
					});

			} catch (
				erroVerificacao
			) {

				podeCompartilharArquivo =
					false;
			}
		}


		if (
			podeCompartilharArquivo
		) {

			try {

				await navigator.share({
					files: [
						arquivoCsv
					],

					title:
						"Relatório financeiro TNP MOB",

					text:
						"Planilha financeira referente a " +
						(
							consulta.periodoTexto ||
							"período consultado"
						) +
						"."
				});

				return;

			} catch (
				erroCompartilhamento
			) {

				/*
				 * O motorista apenas fechou
				 * a tela de compartilhamento.
				 */
				if (
					erroCompartilhamento &&
					erroCompartilhamento.name ===
						"AbortError"
				) {
					return;
				}

				console.warn(
					"O compartilhamento do CSV não foi concluído:",
					erroCompartilhamento
				);
			}
		}
	}


	/*
	 * Download normal ou proteção para aparelhos
	 * sem compartilhamento de arquivos.
	 */

	const enderecoArquivo =
		URL.createObjectURL(
			arquivoBlob
		);

	const link =
		document.createElement(
			"a"
		);

	link.href =
		enderecoArquivo;

	link.download =
		nomeArquivo;

	document.body.appendChild(
		link
	);

	link.click();

	link.remove();

	setTimeout(
		function () {

			URL.revokeObjectURL(
				enderecoArquivo
			);
		},
		1000
	);
}

/* ==================================================
   RELATÓRIOS — ABRIR OPÇÕES DE COMPARTILHAMENTO
================================================== */

function MOTORISTAPAG_Login_func_abrirOpcoesCompartilharRelatorio() {

    MOTORISTAPAG_Login_func_mostrarErroRelatorios(
        ""
    );

    const consulta =
        MOTORISTAPAG_Login_relatorioConsultadoAtual;

    if (
        !consulta ||
        !Array.isArray(
            consulta.registros
        ) ||
        consulta.registros.length === 0
    ) {

        MOTORISTAPAG_Login_func_mostrarErroRelatorios(
            "Consulte um período com registros antes de compartilhar."
        );

        return;
    }

    const overlay =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_compartilhar_overlay"
        );

    if (
        !overlay
    ) {

        MOTORISTAPAG_Login_func_mostrarErroRelatorios(
            "Não foi possível abrir as opções de compartilhamento."
        );

        return;
    }

    overlay.hidden =
        false;

    overlay.setAttribute(
        "aria-hidden",
        "false"
    );

    const btnPdf =
        document.getElementById(
            "MOTORISTAPAG_Login_btn_compartilhar_pdf"
        );

    if (
        btnPdf
    ) {

        setTimeout(
            function () {

                btnPdf.focus();
            },
            50
        );
    }
}

/* ==================================================
   RELATÓRIOS — FECHAR OPÇÕES DE COMPARTILHAMENTO
================================================== */

function MOTORISTAPAG_Login_func_fecharOpcoesCompartilharRelatorio() {

    const overlay =
        document.getElementById(
            "MOTORISTAPAG_Login_relatorios_compartilhar_overlay"
        );

    if (
        !overlay ||
        overlay.hidden
    ) {
        return false;
    }

    const elementoAtivo =
        document.activeElement;

    const btnCompartilhar =
        document.getElementById(
            "MOTORISTAPAG_Login_btn_relatorio_compartilhar"
        );

    if (
        elementoAtivo &&
        overlay.contains(
            elementoAtivo
        )
    ) {

        if (
            btnCompartilhar
        ) {

            try {

                btnCompartilhar.focus({
                    preventScroll: true
                });

            } catch (erro) {

                btnCompartilhar.focus();
            }

        } else if (
            typeof elementoAtivo.blur ===
            "function"
        ) {

            elementoAtivo.blur();
        }
    }

    overlay.hidden =
        true;

    overlay.setAttribute(
        "aria-hidden",
        "true"
    );

    return true;
}

/* ==================================================
   RELATÓRIOS — COMPARTILHAR FORMATO ESCOLHIDO
================================================== */

async function MOTORISTAPAG_Login_func_compartilharRelatorio(
    formato
) {

    const formatoEscolhido =
        String(
            formato || ""
        )
            .toLowerCase()
            .trim();

    MOTORISTAPAG_Login_func_fecharOpcoesCompartilharRelatorio();

    if (
        formatoEscolhido !==
            "pdf" &&
        formatoEscolhido !==
            "csv"
    ) {

        MOTORISTAPAG_Login_func_mostrarErroRelatorios(
            "Escolha PDF ou CSV para compartilhar."
        );

        return;
    }

    MOTORISTAPAG_Login_compartilhamentoNativoAtivo =
        true;

    try {

        if (
            formatoEscolhido ===
            "pdf"
        ) {

            await MOTORISTAPAG_Login_func_gerarPdfRelatorio(
                "compartilhar"
            );

            return;
        }

        if (
            formatoEscolhido ===
            "csv"
        ) {

            await MOTORISTAPAG_Login_func_gerarCsvRelatorio(
                "compartilhar"
            );

            return;
        }

    } finally {

        setTimeout(
            function () {

                MOTORISTAPAG_Login_compartilhamentoNativoAtivo =
                    false;
            },
            500
        );
    }
}

/* ==================================================
   RELATÓRIOS — ABRIR
================================================== */

async function MOTORISTAPAG_Login_func_abrirRelatoriosFinanceiros() {

    let modalRelatorios =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_relatorios_financeiros"
        );

    /*
     * Se o módulo ainda não foi montado,
     * carrega o HTML no ponto de montagem
     * existente dentro do módulo de Ganhos.
     */

    if (!modalRelatorios) {

        const areaRelatorios =
            document.getElementById(
                "MOTORISTAPAG_Login_area_relatorios"
            );

        if (!areaRelatorios) {

            alert(
                "A área de relatórios financeiros não foi encontrada."
            );

            return;
        }

        try {

            const resposta =
                await fetch(
                    "historico/relatorios/relatorios.html"
                );

            if (!resposta.ok) {

                throw new Error(
                    "Falha ao carregar Relatórios financeiros."
                );
            }

            areaRelatorios.innerHTML =
                await resposta.text();

            modalRelatorios =
                document.getElementById(
                    "MOTORISTAPAG_Login_modal_relatorios_financeiros"
                );

        } catch (erro) {

            console.error(
                "Erro ao carregar Relatórios financeiros:",
                erro
            );

            alert(
                "Não foi possível abrir os relatórios financeiros."
            );

            return;
        }
    }

    if (!modalRelatorios) {

        alert(
            "A tela de relatórios financeiros não foi encontrada."
        );

        return;
    }

    /*
     * O modal de Ganhos permanece aberto por baixo.
     */

    modalRelatorios.classList.add(
        "active"
    );
	
		
	/*
	 * RELATÓRIOS FINANCEIROS — VOLTAR GLOBAL
	 *
	 * Registra o módulo filho sobre Ganhos.
	 */
	if (
		typeof TNP_MOB_func_registrarCamadaVoltar ===
		"function"
	) {
		TNP_MOB_func_registrarCamadaVoltar(
			"motorista_relatorios_financeiros",
			MOTORISTAPAG_Login_func_fecharRelatoriosFinanceiros
		);
	}


    /*
     * Inicializa os seletores somente depois
     * que o HTML do módulo estiver montado.
     */

    MOTORISTAPAG_Login_func_inicializarRelatorios();

    const conteudo =
        modalRelatorios.querySelector(
            ".MOTORISTAPAG_Login_relatorios_conteudo"
        );

    if (conteudo) {

        conteudo.scrollTop =
            0;
    }
}


/* ==================================================
   RELATÓRIOS — FECHAR E VOLTAR PARA GANHOS
================================================== */

/* ==================================================
   TNP MOB — MOTORISTA
   RELATÓRIOS FINANCEIROS — FECHAMENTO PRÓPRIO

   - Protege o compartilhamento nativo
   - Fecha primeiro a camada interna
   - Fecha Relatórios quando não houver camada interna
   - Mantém o módulo anterior aberto
   - Preserva o HTML montado
   - Não altera registros financeiros
================================================== */

function MOTORISTAPAG_Login_func_fecharRelatoriosFinanceiros() {

    const chave = "motorista_relatorios_financeiros";

    const modal = document.getElementById(
        "MOTORISTAPAG_Login_modal_relatorios_financeiros"
    );

    /* ==============================================
       RESTAURAR CAMADA SE O VOLTAR GLOBAL A RETIROU
       MAS RELATÓRIOS PRECISA PERMANECER ABERTO
    ============================================== */

    function manterRegistroVoltar() {

        if (
            !modal ||
            !modal.classList.contains("active") ||
            !Array.isArray(window.TNP_MOB_pilhaVoltar) ||
            window.TNP_MOB_pilhaVoltar.some(
                camada => camada.chave === chave
            ) ||
            typeof TNP_MOB_func_registrarCamadaVoltar !== "function"
        ) {
            return;
        }

        TNP_MOB_func_registrarCamadaVoltar(
            chave,
            MOTORISTAPAG_Login_func_fecharRelatoriosFinanceiros
        );
    }

    /* ==============================================
       1. PROTEGER COMPARTILHAMENTO NATIVO
    ============================================== */

    if (MOTORISTAPAG_Login_compartilhamentoNativoAtivo) {

        manterRegistroVoltar();

        return false;
    }

    /* ==============================================
       2. FECHAR PRIMEIRO O OVERLAY INTERNO
    ============================================== */

    const overlay = document.getElementById(
        "MOTORISTAPAG_Login_relatorios_compartilhar_overlay"
    );

    if (overlay && !overlay.hidden) {

        MOTORISTAPAG_Login_func_fecharOpcoesCompartilharRelatorio();

        manterRegistroVoltar();

        return false;
    }

    /* ==============================================
       3. FECHAR SOMENTE RELATÓRIOS
    ============================================== */

    if (modal) {
        modal.classList.remove("active");
    }

    /* ==============================================
       4. REMOVER REGISTRO DO VOLTAR GLOBAL
    ============================================== */

    if (
        typeof TNP_MOB_func_removerCamadaVoltar === "function"
    ) {
        TNP_MOB_func_removerCamadaVoltar(chave);
    }

    return true;
}




































window.MOTORISTAPAG_Login_func_alterarTipoRelatorio =
    MOTORISTAPAG_Login_func_alterarTipoRelatorio;	
	
window.MOTORISTAPAG_Login_func_inicializarRelatorios =
    MOTORISTAPAG_Login_func_inicializarRelatorios;	
	
window.MOTORISTAPAG_Login_func_consultarRelatorio =
    MOTORISTAPAG_Login_func_consultarRelatorio;	
	
window.MOTORISTAPAG_Login_func_gerarPdfRelatorio =
    MOTORISTAPAG_Login_func_gerarPdfRelatorio;		
	
window.MOTORISTAPAG_Login_func_gerarCsvRelatorio =
    MOTORISTAPAG_Login_func_gerarCsvRelatorio;	
	
window.MOTORISTAPAG_Login_func_abrirOpcoesCompartilharRelatorio =
    MOTORISTAPAG_Login_func_abrirOpcoesCompartilharRelatorio;	
	
window.MOTORISTAPAG_Login_func_fecharOpcoesCompartilharRelatorio =
    MOTORISTAPAG_Login_func_fecharOpcoesCompartilharRelatorio;

window.MOTORISTAPAG_Login_func_compartilharRelatorio =
    MOTORISTAPAG_Login_func_compartilharRelatorio;	

window.MOTORISTAPAG_Login_func_abrirRelatoriosFinanceiros =
    MOTORISTAPAG_Login_func_abrirRelatoriosFinanceiros;	
		
window.MOTORISTAPAG_Login_func_fecharRelatoriosFinanceiros =
    MOTORISTAPAG_Login_func_fecharRelatoriosFinanceiros;
			
window.MOTORISTAPAG_Login_func_atualizarPeriodoRelatorio =
    MOTORISTAPAG_Login_func_atualizarPeriodoRelatorio;

window.MOTORISTAPAG_Login_func_validarDatasRelatorio =
    MOTORISTAPAG_Login_func_validarDatasRelatorio;		

/* ==================================================
   HISTÓRICO COMPLETO — MOSTRAR ERRO
================================================== */

function MOTORISTAPAG_Login_func_mostrarErroHistoricoGanhos(
    mensagem
) {

    const campoErro =
        document.getElementById(
            "MOTORISTAPAG_Login_error_historico_ganhos"
        );

    if (!campoErro) {
        return;
    }

    campoErro.innerText =
        mensagem || "";
}

/* ==================================================
   HISTÓRICO COMPLETO — FORMATAR MOEDA
================================================== */

function MOTORISTAPAG_Login_func_formatarMoedaHistoricoGanhos(
    valor
) {

    const numero =
        Number(valor || 0);

    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}

/* ==================================================
   HISTÓRICO COMPLETO — OBTER INTERVALO DO PERÍODO
================================================== */

function MOTORISTAPAG_Login_func_obterIntervaloHistoricoGanhos() {

    const campoPeriodo =
        document.getElementById(
            "MOTORISTAPAG_Login_historico_ganhos_periodo"
        );

    if (!campoPeriodo) {
        return null;
    }

    const agora =
        new Date();

    let inicio =
        new Date(
            agora.getFullYear(),
            agora.getMonth(),
            agora.getDate(),
            0,
            0,
            0,
            0
        );

    let fim =
        new Date(
            agora.getFullYear(),
            agora.getMonth(),
            agora.getDate(),
            23,
            59,
            59,
            999
        );

    switch (
        campoPeriodo.value
    ) {

        case "7_dias":

            inicio.setDate(
                inicio.getDate() - 6
            );

            break;

        case "30_dias":

            inicio.setDate(
                inicio.getDate() - 29
            );

            break;

        case "mes_atual":

            inicio =
                new Date(
                    agora.getFullYear(),
                    agora.getMonth(),
                    1,
                    0,
                    0,
                    0,
                    0
                );

            fim =
                new Date(
                    agora.getFullYear(),
                    agora.getMonth() + 1,
                    0,
                    23,
                    59,
                    59,
                    999
                );

            break;

        case "mes_anterior":

            inicio =
                new Date(
                    agora.getFullYear(),
                    agora.getMonth() - 1,
                    1,
                    0,
                    0,
                    0,
                    0
                );

            fim =
                new Date(
                    agora.getFullYear(),
                    agora.getMonth(),
                    0,
                    23,
                    59,
                    59,
                    999
                );

            break;

        case "personalizado": {

            const campoInicio =
                document.getElementById(
                    "MOTORISTAPAG_Login_historico_ganhos_data_inicio"
                );

            const campoFim =
                document.getElementById(
                    "MOTORISTAPAG_Login_historico_ganhos_data_fim"
                );

            inicio =
                MOTORISTAPAG_Login_func_converterDataInputHistoricoGanhos(
                    campoInicio
                        ? campoInicio.value
                        : "",
                    false
                );

            fim =
                MOTORISTAPAG_Login_func_converterDataInputHistoricoGanhos(
                    campoFim
                        ? campoFim.value
                        : "",
                    true
                );

            if (
                !inicio ||
                !fim
            ) {
                MOTORISTAPAG_Login_func_mostrarErroHistoricoGanhos(
                    "Selecione a data inicial e a data final."
                );

                return null;
            }

            if (
                inicio.getTime() >
                fim.getTime()
            ) {
                MOTORISTAPAG_Login_func_mostrarErroHistoricoGanhos(
                    "A data inicial não pode ser maior que a data final."
                );

                return null;
            }

            break;
        }

        case "hoje":
        default:
            break;
    }

    return {
        inicio: inicio,
        fim: fim
    };
}

/* ==================================================
   HISTÓRICO COMPLETO — ALTERAR PERÍODO
================================================== */

function MOTORISTAPAG_Login_func_alterarPeriodoHistoricoGanhos() {

    const campoPeriodo =
        document.getElementById(
            "MOTORISTAPAG_Login_historico_ganhos_periodo"
        );

    const blocoDatas =
        document.getElementById(
            "MOTORISTAPAG_Login_historico_ganhos_datas"
        );

    if (
        !campoPeriodo ||
        !blocoDatas
    ) {
        return;
    }

    blocoDatas.style.display =
        campoPeriodo.value ===
        "personalizado"
            ? "grid"
            : "none";

    MOTORISTAPAG_Login_func_mostrarErroHistoricoGanhos(
        ""
    );
}

/* ==================================================
   HISTÓRICO COMPLETO — ATUALIZAR SITUAÇÕES
   CONFORME O TIPO DE REGISTRO
================================================== */

function MOTORISTAPAG_Login_func_atualizarSituacoesHistoricoGanhos() {

    const campoTipo =
        document.getElementById(
            "MOTORISTAPAG_Login_historico_ganhos_tipo"
        );

    const campoStatus =
        document.getElementById(
            "MOTORISTAPAG_Login_historico_ganhos_status"
        );

    if (
        !campoTipo ||
        !campoStatus
    ) {
        return;
    }

    const tipoSelecionado =
        String(
            campoTipo.value ||
            "todos"
        )
            .toLowerCase()
            .trim();

    const statusAnterior =
        String(
            campoStatus.value ||
            "todos"
        )
            .toLowerCase()
            .trim();


    const situacoesPorTipo = {

        todos: [
            [
                "todos",
                "Todas as situações"
            ],
            [
                "recebida",
                "Solicitação recebida"
            ],
            [
                "aceita",
                "Corrida aceita"
            ],
            [
                "concluida",
                "Corrida concluída"
            ],
            [
                "cancelada",
                "Corrida cancelada"
            ],
            [
                "credito",
                "Crédito recebido"
            ],
            [
                "debito",
                "Débito ou ajuste"
            ],
            [
                "pendente",
                "Valor pendente"
            ],
            [
                "pausa_ativa",
                "Pausa ativa"
            ],
            [
                "pausa_finalizada",
                "Pausa finalizada"
            ]
        ],


        corridas: [
            [
                "todos",
                "Todas as situações"
            ],
            [
                "recebida",
                "Solicitação recebida"
            ],
            [
                "aceita",
                "Corrida aceita"
            ],
            [
                "concluida",
                "Corrida concluída"
            ],
            [
                "cancelada",
                "Corrida cancelada"
            ]
        ],


        ganhos_corridas: [
            [
                "todos",
                "Todas as situações"
            ],
            [
                "concluida",
                "Corrida concluída"
            ]
        ],


        financeiro: [
            [
                "todos",
                "Todas as situações"
            ],
            [
                "credito",
                "Crédito recebido"
            ],
            [
                "debito",
                "Débito ou ajuste"
            ],
            [
                "pendente",
                "Valor pendente"
            ]
        ],


        espera: [
            [
                "todos",
                "Todas as situações"
            ],
            [
                "credito",
                "Crédito recebido"
            ]
        ],


        percurso: [
            [
                "todos",
                "Todas as situações"
            ],
            [
                "credito",
                "Crédito recebido"
            ]
        ],


        promocoes: [
            [
                "todos",
                "Todas as situações"
            ],
            [
                "credito",
                "Crédito recebido"
            ]
        ],


        cancelamentos: [
            [
                "todos",
                "Todas as situações"
            ],
            [
                "cancelada",
                "Corrida cancelada"
            ]
        ],


        pausas: [
            [
                "todos",
                "Todas as situações"
            ],
            [
                "pausa_ativa",
                "Pausa ativa"
            ],
            [
                "pausa_finalizada",
                "Pausa finalizada"
            ]
        ]
    };


    const situacoes =
        situacoesPorTipo[
            tipoSelecionado
        ] ||
        situacoesPorTipo.todos;


    campoStatus.replaceChildren();


    situacoes.forEach(
        function (
            situacao
        ) {

            const opcao =
                document.createElement(
                    "option"
                );

            opcao.value =
                situacao[0];

            opcao.textContent =
                situacao[1];

            campoStatus.appendChild(
                opcao
            );
        }
    );


    const statusAindaExiste =
        situacoes.some(
            function (
                situacao
            ) {

                return (
                    situacao[0] ===
                    statusAnterior
                );
            }
        );


    campoStatus.value =
        statusAindaExiste
            ? statusAnterior
            : "todos";
}

/* ==================================================
   HISTÓRICO COMPLETO — FILTRAR REGISTROS
================================================== */

function MOTORISTAPAG_Login_func_filtrarRegistrosHistoricoGanhos() {

    const intervalo =
        MOTORISTAPAG_Login_func_obterIntervaloHistoricoGanhos();

    if (!intervalo) {
        return null;
    }

    const campoTipo =
        document.getElementById(
            "MOTORISTAPAG_Login_historico_ganhos_tipo"
        );

    const campoStatus =
        document.getElementById(
            "MOTORISTAPAG_Login_historico_ganhos_status"
        );

    const tipoSelecionado =
        campoTipo
            ? String(campoTipo.value || "todos")
                .toLowerCase()
                .trim()
            : "todos";

    const statusSelecionado =
        campoStatus
            ? String(campoStatus.value || "todos")
                .toLowerCase()
                .trim()
            : "todos";

    return MOTORISTAPAG_Login_historicoGanhosRegistros.filter(
        function (registro) {

            const dataRegistro =
                MOTORISTAPAG_Login_func_converterDataHistoricoGanhos(
                    registro.criadoEm
                );

            if (!dataRegistro) {
                return false;
            }

            const grupoRegistro =
                String(
                    registro.grupo || ""
                )
                    .toLowerCase()
                    .trim();

            const statusRegistro =
                String(
                    registro.status || ""
                )
                    .toLowerCase()
                    .trim();

            const dentroDoPeriodo =
                dataRegistro.getTime() >=
                    intervalo.inicio.getTime() &&
                dataRegistro.getTime() <=
                    intervalo.fim.getTime();

            let tipoCorreto = false;

			if (
				tipoSelecionado ===
				"todos"
			) {

				tipoCorreto =
					true;

			} else if (
				tipoSelecionado ===
				"ganhos_corridas"
			) {

				tipoCorreto =
					grupoRegistro ===
						"corridas" &&
					statusRegistro ===
						"concluida" &&
					MOTORISTAPAG_Login_func_registroPossuiImpactoFinanceiro(
						registro
					);

			} else {

				tipoCorreto =
					grupoRegistro ===
					tipoSelecionado;
			}

            const statusCorreto =
                statusSelecionado ===
                    "todos" ||
                statusRegistro ===
                    statusSelecionado;

            return (
                dentroDoPeriodo &&
                tipoCorreto &&
                statusCorreto
            );
        }
    );
}

/* ==================================================
   HISTÓRICO COMPLETO — ATUALIZAR TEXTO DO PERÍODO
================================================== */

function MOTORISTAPAG_Login_func_atualizarTextoPeriodoHistoricoGanhos() {

    const campoPeriodo =
        document.getElementById(
            "MOTORISTAPAG_Login_historico_ganhos_periodo"
        );

    const campoTexto =
        document.getElementById(
            "MOTORISTAPAG_Login_historico_ganhos_periodo_texto"
        );

    if (
        !campoPeriodo ||
        !campoTexto
    ) {
        return;
    }

    const opcaoSelecionada =
        campoPeriodo.options[
            campoPeriodo.selectedIndex
        ];

    campoTexto.innerText =
        opcaoSelecionada
            ? opcaoSelecionada.text
            : "Período selecionado";
}

/* ==================================================
   HISTÓRICO COMPLETO — ESTADO VAZIO
================================================== */

function MOTORISTAPAG_Login_func_mostrarHistoricoGanhosVazio() {

    const lista =
        document.getElementById(
            "MOTORISTAPAG_Login_historico_ganhos_lista"
        );

    if (!lista) {
        return;
    }

    lista.innerHTML = `
        <div
            class="
                MOTORISTAPAG_Login_historico_ganhos_vazio
                TNP_mini_moldura
            "
        >
            <span>📋</span>

            <strong>
                Nenhum registro encontrado
            </strong>

            <p>
                Quando o motorista receber, aceitar,
                concluir ou cancelar corridas, os
                registros aparecerão aqui.
            </p>
        </div>
    `;
}

/* ==================================================
   HISTÓRICO COMPLETO — ATUALIZAR RESUMO
================================================== */

function MOTORISTAPAG_Login_func_atualizarResumoHistoricoGanhos(
    registros
) {

    const campoQuantidade =
        document.getElementById(
            "MOTORISTAPAG_Login_historico_ganhos_total_registros"
        );

    const campoCreditos =
        document.getElementById(
            "MOTORISTAPAG_Login_historico_ganhos_total_creditos"
        );

    const campoLiquido =
        document.getElementById(
            "MOTORISTAPAG_Login_historico_ganhos_total_liquido"
        );

    let totalCreditos = 0;
    let totalLiquido = 0;

    registros.forEach(
        function (registro) {

            totalCreditos +=
                Number(
                    registro.valorCredito ||
                    0
                );

            if (
                registro.valorLiquido !==
                undefined
            ) {
                totalLiquido +=
                    Number(
                        registro.valorLiquido ||
                        0
                    );

            } else {
                totalLiquido +=
                    Number(
                        registro.valorCredito ||
                        0
                    ) -
                    Number(
                        registro.valorDebito ||
                        0
                    );
            }
        }
    );

    if (campoQuantidade) {
        campoQuantidade.innerText =
            String(registros.length);
    }

    if (campoCreditos) {
        campoCreditos.innerText =
            MOTORISTAPAG_Login_func_formatarMoedaHistoricoGanhos(
                totalCreditos
            );
    }

    if (campoLiquido) {
        campoLiquido.innerText =
            MOTORISTAPAG_Login_func_formatarMoedaHistoricoGanhos(
                totalLiquido
            );
    }
}

/* ==================================================
   HISTÓRICO COMPLETO — PROTEGER TEXTOS
================================================== */

function MOTORISTAPAG_Login_func_protegerTextoHistoricoGanhos(
    valor
) {

    return String(
        valor === undefined ||
        valor === null
            ? ""
            : valor
    ).replace(
        /[&<>"']/g,
        function (caractere) {

            const substituicoes = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return substituicoes[caractere];
        }
    );
}

/* ==================================================
   HISTÓRICO COMPLETO — CRIAR DETALHES DO REGISTRO
================================================== */

function MOTORISTAPAG_Login_func_criarDetalhesHistoricoGanhos(
    registro
) {

    const detalhes = [];

    if (
        registro.descricao
    ) {
        detalhes.push(
            registro.descricao
        );
    }

    if (
        registro.origem ||
        registro.destino
    ) {

        const origem =
            registro.origem ||
            "Origem não informada";

        const destino =
            registro.destino ||
            "Destino não informado";

        detalhes.push(
            origem +
            " → " +
            destino
        );
    }

    if (
        registro.corridaId
    ) {
        detalhes.push(
            "Corrida: " +
            registro.corridaId
        );
    }

    if (
        Number(
            registro.tempoEsperaMinutos ||
            0
        ) > 0
    ) {
        detalhes.push(
            "Tempo de espera: " +
            Number(
                registro.tempoEsperaMinutos
            ) +
            " minuto(s)"
        );
    }

    if (
        Number(
            registro.distanciaCancelamentoMetros ||
            0
        ) > 0
    ) {
        detalhes.push(
            "Distância do embarque: " +
            Number(
                registro.distanciaCancelamentoMetros
            ) +
            " metros"
        );
    }

    if (
        registro.pausaDuracaoTexto
    ) {
        detalhes.push(
            "Pausa aplicada: " +
            registro.pausaDuracaoTexto
        );
    }

    if (
        registro.motivo
    ) {
        detalhes.push(
            "Motivo: " +
            registro.motivo
        );
    }

    return detalhes.map(
        function (detalhe) {

            return `
                <div
                    class="
                        MOTORISTAPAG_Login_historico_ganhos_card_detalhe
                    "
                >
                    ${MOTORISTAPAG_Login_func_protegerTextoHistoricoGanhos(
                        detalhe
                    )}
                </div>
            `;
        }
    ).join("");
}

/* ==================================================
   HISTÓRICO COMPLETO — CRIAR VALORES DO REGISTRO
================================================== */

function MOTORISTAPAG_Login_func_criarValoresHistoricoGanhos(
    registro
) {

    const valorCredito =
        Number(
            registro.valorCredito ||
            0
        );

    const valorDebito =
        Number(
            registro.valorDebito ||
            0
        );

    const possuiValorLiquido =
        registro.valorLiquido !==
        undefined &&
        registro.valorLiquido !==
        null;

    const valorLiquido =
        possuiValorLiquido
            ? Number(
                registro.valorLiquido ||
                0
            )
            : valorCredito -
              valorDebito;

    const valores = [];

    if (
        valorCredito !== 0
    ) {
        valores.push(`
            <div
                class="
                    MOTORISTAPAG_Login_historico_ganhos_card_valor
                    MOTORISTAPAG_Login_historico_ganhos_card_valor_credito
                "
            >
                <span>Crédito</span>

                <strong>
                    +${MOTORISTAPAG_Login_func_formatarMoedaHistoricoGanhos(
                        valorCredito
                    )}
                </strong>
            </div>
        `);
    }

    if (
        valorDebito !== 0
    ) {
        valores.push(`
            <div
                class="
                    MOTORISTAPAG_Login_historico_ganhos_card_valor
                    MOTORISTAPAG_Login_historico_ganhos_card_valor_debito
                "
            >
                <span>Ajuste</span>

                <strong>
                    -${MOTORISTAPAG_Login_func_formatarMoedaHistoricoGanhos(
                        valorDebito
                    )}
                </strong>
            </div>
        `);
    }

    if (
        possuiValorLiquido ||
        valorCredito !== 0 ||
        valorDebito !== 0
    ) {
        valores.push(`
            <div
                class="
                    MOTORISTAPAG_Login_historico_ganhos_card_valor
                    MOTORISTAPAG_Login_historico_ganhos_card_valor_liquido
                "
            >
                <span>Valor líquido</span>

                <strong>
                    ${MOTORISTAPAG_Login_func_formatarMoedaHistoricoGanhos(
                        valorLiquido
                    )}
                </strong>
            </div>
        `);
    }

    if (
        valores.length === 0
    ) {
        return `
            <div
                class="
                    MOTORISTAPAG_Login_historico_ganhos_card_sem_impacto
                "
            >
                Impacto financeiro: nenhum
            </div>
        `;
    }

    return `
        <div
            class="
                MOTORISTAPAG_Login_historico_ganhos_card_valores
            "
        >
            ${valores.join("")}
        </div>
    `;
}

/* ==================================================
   HISTÓRICO COMPLETO — CRIAR CARD DO REGISTRO
================================================== */

function MOTORISTAPAG_Login_func_criarCardHistoricoGanhos(
    registro
) {

    const titulo =
        MOTORISTAPAG_Login_func_obterTituloRegistroHistoricoGanhos(
            registro
        );

    const status =
        String(
            registro.status || ""
        )
            .toLowerCase()
            .trim();

    const textoStatus =
        MOTORISTAPAG_Login_func_obterTextoStatusHistoricoGanhos(
            status
        );

    const statusClasse =
        status.replace(
            /[^a-z0-9_-]/g,
            ""
        );

    const dataTexto =
        MOTORISTAPAG_Login_func_formatarDataHoraHistoricoGanhos(
            registro.criadoEm
        );

    const detalhes =
        MOTORISTAPAG_Login_func_criarDetalhesHistoricoGanhos(
            registro
        );

    const valores =
        MOTORISTAPAG_Login_func_criarValoresHistoricoGanhos(
            registro
        );

    let blocoDetalhes = "";

    if (detalhes) {

        blocoDetalhes =
            '<div class="' +
            'MOTORISTAPAG_Login_historico_ganhos_card_detalhes' +
            '">' +
            detalhes +
            '</div>';
    }

    return (
        '<article class="' +
            'MOTORISTAPAG_Login_historico_ganhos_card ' +
            'TNP_mini_moldura' +
        '">' +

            '<div class="' +
                'MOTORISTAPAG_Login_historico_ganhos_card_topo' +
            '">' +

                '<div class="' +
                    'MOTORISTAPAG_Login_historico_ganhos_card_titulo' +
                '">' +

                    '<strong>' +
                        MOTORISTAPAG_Login_func_protegerTextoHistoricoGanhos(
                            titulo
                        ) +
                    '</strong>' +

                    '<span>' +
                        MOTORISTAPAG_Login_func_protegerTextoHistoricoGanhos(
                            dataTexto
                        ) +
                    '</span>' +

                '</div>' +

                '<span class="' +
                    'MOTORISTAPAG_Login_historico_ganhos_card_status ' +
                    'MOTORISTAPAG_Login_historico_status_' +
                    statusClasse +
                '">' +

                    MOTORISTAPAG_Login_func_protegerTextoHistoricoGanhos(
                        textoStatus
                    ) +

                '</span>' +

            '</div>' +

            blocoDetalhes +

            valores +

        '</article>'
    );
}

/* ==================================================
   HISTÓRICO COMPLETO — MOSTRAR LISTA DE REGISTROS
================================================== */

function MOTORISTAPAG_Login_func_mostrarListaHistoricoGanhos(
    registros
) {

    const lista =
        document.getElementById(
            "MOTORISTAPAG_Login_historico_ganhos_lista"
        );

    if (!lista) {
        return;
    }

    const registrosOrdenados =
        registros.slice().sort(
            function (
                registroA,
                registroB
            ) {

                const dataA =
                    MOTORISTAPAG_Login_func_converterDataHistoricoGanhos(
                        registroA.criadoEm
                    );

                const dataB =
                    MOTORISTAPAG_Login_func_converterDataHistoricoGanhos(
                        registroB.criadoEm
                    );

                const tempoA =
                    dataA
                        ? dataA.getTime()
                        : 0;

                const tempoB =
                    dataB
                        ? dataB.getTime()
                        : 0;

                return tempoB - tempoA;
            }
        );

    lista.innerHTML =
        registrosOrdenados.map(
            function (registro) {

                return MOTORISTAPAG_Login_func_criarCardHistoricoGanhos(
                    registro
                );
            }
        ).join("");
}

/* ==================================================
   HISTÓRICO COMPLETO — RENDERIZAR RESULTADO
================================================== */

function MOTORISTAPAG_Login_func_renderizarHistoricoGanhos() {

    MOTORISTAPAG_Login_func_mostrarErroHistoricoGanhos(
        ""
    );

    const registrosFiltrados =
        MOTORISTAPAG_Login_func_filtrarRegistrosHistoricoGanhos();

    if (
        registrosFiltrados ===
        null
    ) {
        return;
    }

    MOTORISTAPAG_Login_func_atualizarTextoPeriodoHistoricoGanhos();

    MOTORISTAPAG_Login_func_atualizarResumoHistoricoGanhos(
        registrosFiltrados
    );

    if (
        registrosFiltrados.length ===
        0
    ) {

        MOTORISTAPAG_Login_func_mostrarHistoricoGanhosVazio();

        return;
    }

    MOTORISTAPAG_Login_func_mostrarListaHistoricoGanhos(
        registrosFiltrados
    );
}

/* ==================================================
   HISTÓRICO COMPLETO — ABRIR
================================================== */

async function MOTORISTAPAG_Login_func_abrirHistoricoGanhos() {

    let modalHistorico =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_historico_ganhos"
        );

    /*
     * Se ainda não foi carregado,
     * monta o módulo filho.
     */
    if (!modalHistorico) {

        const areaHistorico =
            document.getElementById(
                "MOTORISTAPAG_Login_area_historico_completo"
            );

        if (!areaHistorico) {

            alert(
                "A área do histórico de ganhos não foi encontrada."
            );

            return;
        }

        try {

            const resposta =
                await fetch(
                    "historico/historico-completo/historico-completo.html"
                );

            if (!resposta.ok) {
                throw new Error(
                    "Falha ao carregar Histórico completo."
                );
            }

            areaHistorico.innerHTML =
                await resposta.text();

            modalHistorico =
                document.getElementById(
                    "MOTORISTAPAG_Login_modal_historico_ganhos"
                );

        } catch (erro) {

            console.error(
                "Erro ao carregar Histórico completo:",
                erro
            );

            alert(
                "Não foi possível abrir o histórico de ganhos."
            );

            return;
        }
    }

    if (!modalHistorico) {

        alert(
            "A tela de histórico de ganhos não foi encontrada."
        );

        return;
    }

    /*
     * O modal de Ganhos NÃO é fechado.
     * O Histórico abre por cima dele.
     */
    modalHistorico.classList.add(
        "active"
    );
	
		
	/*
	 * HISTÓRICO COMPLETO — VOLTAR GLOBAL
	 *
	 * Registra o filho sobre o módulo de Ganhos.
	 */
	if (
		typeof TNP_MOB_func_registrarCamadaVoltar ===
		"function"
	) {
		TNP_MOB_func_registrarCamadaVoltar(
			"motorista_historico_completo",
			MOTORISTAPAG_Login_func_fecharHistoricoGanhos
		);
	}


    MOTORISTAPAG_Login_func_alterarPeriodoHistoricoGanhos();
	
	MOTORISTAPAG_Login_func_atualizarSituacoesHistoricoGanhos();

    MOTORISTAPAG_Login_func_renderizarHistoricoGanhos();

    const conteudo =
        modalHistorico.querySelector(
            ".MOTORISTAPAG_Login_historico_ganhos_conteudo"
        );

    if (conteudo) {

        conteudo.scrollTop =
            0;
    }
}


/* ==================================================
   HISTÓRICO COMPLETO — FECHAR
================================================== */

function MOTORISTAPAG_Login_func_fecharHistoricoGanhos() {

    const modalHistorico =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_historico_ganhos"
        );

    if (modalHistorico) {

        modalHistorico.classList.remove(
            "active"
        );
    }

    /*
     * HISTÓRICO COMPLETO — VOLTAR GLOBAL
     *
     * Remove a camada quando o Histórico
     * for fechado pelo botão da tela ou
     * pelo Voltar Global.
     */
    if (
        typeof TNP_MOB_func_removerCamadaVoltar ===
        "function"
    ) {
        TNP_MOB_func_removerCamadaVoltar(
            "motorista_historico_completo"
        );
    }
}


/* ==================================================
   HISTÓRICO COMPLETO — LIMPAR FILTROS
================================================== */

function MOTORISTAPAG_Login_func_limparFiltrosHistoricoGanhos() {

    const campoPeriodo =
        document.getElementById(
            "MOTORISTAPAG_Login_historico_ganhos_periodo"
        );

    const campoTipo =
        document.getElementById(
            "MOTORISTAPAG_Login_historico_ganhos_tipo"
        );
			
    const campoStatus =
        document.getElementById(
            "MOTORISTAPAG_Login_historico_ganhos_status"
        );

    const campoInicio =
        document.getElementById(
            "MOTORISTAPAG_Login_historico_ganhos_data_inicio"
        );

    const campoFim =
        document.getElementById(
            "MOTORISTAPAG_Login_historico_ganhos_data_fim"
        );

    if (campoPeriodo) {
        campoPeriodo.value =
            "hoje";
    }

    if (campoTipo) {
        campoTipo.value =
            "todos";
    }
	
	MOTORISTAPAG_Login_func_atualizarSituacoesHistoricoGanhos();

    if (campoStatus) {
        campoStatus.value =
            "todos";
    }

    if (campoInicio) {
        campoInicio.value =
            "";
    }

    if (campoFim) {
        campoFim.value =
            "";
    }

    MOTORISTAPAG_Login_func_alterarPeriodoHistoricoGanhos();

    MOTORISTAPAG_Login_func_renderizarHistoricoGanhos();
}

/* ==================================================
   HISTÓRICO COMPLETO — APLICAR FILTROS
================================================== */

function MOTORISTAPAG_Login_func_aplicarFiltrosHistoricoGanhos() {

    MOTORISTAPAG_Login_func_renderizarHistoricoGanhos();
}

/* ==================================================
   GANHOS — CONVERTER DATA DOS REGISTROS
   USO COMPARTILHADO: GANHOS / HISTÓRICO / RELATÓRIOS
================================================== */

function MOTORISTAPAG_Login_func_converterDataHistoricoGanhos(
    valor
) {

    if (!valor) {
        return null;
    }

    /*
     * Firebase Timestamp.
     */
    if (
        typeof valor.toDate ===
        "function"
    ) {
        return valor.toDate();
    }

    /*
     * Timestamp convertido em objeto.
     */
    if (
        typeof valor.seconds ===
        "number"
    ) {
        return new Date(
            valor.seconds * 1000
        );
    }

    /*
     * Date já convertido.
     */
    if (
        valor instanceof Date
    ) {
        return new Date(
            valor.getTime()
        );
    }

    /*
     * String, número ou outro valor
     * reconhecido pelo construtor Date.
     */
    const data =
        new Date(valor);

    if (
        Number.isNaN(
            data.getTime()
        )
    ) {
        return null;
    }

    return data;
}

/* ==================================================
   GANHOS — CONVERTER DATA DE INPUT
   USO COMPARTILHADO: HISTÓRICO / RELATÓRIOS
================================================== */

function MOTORISTAPAG_Login_func_converterDataInputHistoricoGanhos(
    valor,
    finalDoDia
) {

    if (!valor) {
        return null;
    }

    const partes =
        String(valor).split("-");

    if (
        partes.length !== 3
    ) {
        return null;
    }

    const ano =
        Number(partes[0]);

    const mes =
        Number(partes[1]) - 1;

    const dia =
        Number(partes[2]);

    if (
        finalDoDia
    ) {
        return new Date(
            ano,
            mes,
            dia,
            23,
            59,
            59,
            999
        );
    }

    return new Date(
        ano,
        mes,
        dia,
        0,
        0,
        0,
        0
    );
}

/* ==================================================
   RELATÓRIOS — MOSTRAR ERRO
================================================== */






























/* ==================================================
   HISTÓRICO COMPLETO — DISPONIBILIZAR FUNÇÕES
================================================== */

window.MOTORISTAPAG_Login_func_abrirHistoricoGanhos =
    MOTORISTAPAG_Login_func_abrirHistoricoGanhos;

window.MOTORISTAPAG_Login_func_fecharHistoricoGanhos =
    MOTORISTAPAG_Login_func_fecharHistoricoGanhos;

window.MOTORISTAPAG_Login_func_alterarPeriodoHistoricoGanhos =
    MOTORISTAPAG_Login_func_alterarPeriodoHistoricoGanhos;

window.MOTORISTAPAG_Login_func_limparFiltrosHistoricoGanhos =
    MOTORISTAPAG_Login_func_limparFiltrosHistoricoGanhos;

window.MOTORISTAPAG_Login_func_aplicarFiltrosHistoricoGanhos =
    MOTORISTAPAG_Login_func_aplicarFiltrosHistoricoGanhos;
	
window.MOTORISTAPAG_Login_func_atualizarSituacoesHistoricoGanhos =
    MOTORISTAPAG_Login_func_atualizarSituacoesHistoricoGanhos;	


async function MOTORISTAPAG_Login_func_carregarHomeMotorista() {
    let user = null;

    try {
        user =
            await TNP_MOB_func_aguardarUsuarioAutenticado(
                8000
            );

    } catch (erroSessao) {
        console.warn(
            "Sessão não restaurada ao carregar Home do Motorista:",
            erroSessao
        );

        window.location.href =
            "../../inicio/inicio.html";

        return;
    }


    /*
     * Estes documentos serão usados primeiro
     * para verificar os termos e depois pelo
     * restante da própria Home.
     */
    let userDoc;
    let motoristaDoc;


    try {
        [
            userDoc,
            motoristaDoc
        ] = await Promise.all([
            PRIMEIRAPAG_Login_db
                .collection("usuarios")
                .doc(user.uid)
                .get(),

            PRIMEIRAPAG_Login_db
                .collection("motoristas")
                .doc(user.uid)
                .get()
        ]);


        const dadosUsuarioTermos =
            userDoc.exists
                ? userDoc.data()
                : {};

        const dadosMotoristaTermos =
            motoristaDoc.exists
                ? motoristaDoc.data()
                : {};
				
		
        /* ==================================================
           HOME MOTORISTA — ATUALIZAÇÃO UNIVERSAL DOS TERMOS

           O módulo resolve os Termos pendentes antes
           de a Home executar suas demais rotinas.
        ================================================== */

        if (
            typeof window.TNP_TERMOS_ATUALIZACAO_func_verificar !==
            "function"
        ) {
            throw new Error(
                "Módulo universal de Termos não carregado."
            );
        }

        const termosBloqueandoHome =
            await window.TNP_TERMOS_ATUALIZACAO_func_verificar(
                "motorista",
                MOTORISTAPAG_Login_func_carregarHomeMotorista
            );

        if (termosBloqueandoHome) {
            return;
        }
						
		const etapaUsuarioTermos =
            String(
                dadosUsuarioTermos
                    .etapaCadastro ||
                ""
            ).trim();

        const etapaMotoristaTermos =
            String(
                dadosMotoristaTermos
                    .etapaCadastroMotorista ||

                dadosUsuarioTermos
                    .etapaCadastroMotorista ||

                ""
            ).trim();


        const motoristaNaEtapaInicialTermos =
            etapaUsuarioTermos ===
                "motorista_termos" ||

            etapaMotoristaTermos ===
                "termos_motorista";

       		
			   
				
		/* ==================================================
		   HOME MOTORISTA — RETOMAR TERMOS DO CADASTRO

		   Se o cadastro ainda estiver na etapa inicial
		   de Termos, retorna ao fluxo de cadastro.

		   Atualizações de versões são responsabilidade
		   do módulo universal.
		================================================== */

		if (motoristaNaEtapaInicialTermos) {

			sessionStorage.setItem(
				"TNP_MOB_ABRIR_ETAPA_MOTORISTA",
				"termos_motorista"
			);

			TNP_MOB_func_irParaModulo(
				"../cadastrom/cadastrom.html"
			);

			return;
		}


		/* ==================================================
		   HOME MOTORISTA — ERRO NA VERIFICAÇÃO DOS TERMOS

		   O módulo universal trata suas próprias falhas
		   e apresenta TENTAR NOVAMENTE.

		   Não repete a verificação.
		   Não redireciona ao Login.
		   Não libera a Home em caso de erro.
		================================================== */

		} catch (erroTermosHomeMotorista) {

			console.error(
				"TNP MOB: erro ao preparar a verificação dos Termos do Motorista:",
				erroTermosHomeMotorista
			);

			alert(
				"Não foi possível verificar os Termos do Motorista. " +
				"Verifique sua conexão e recarregue o aplicativo."
			);

			return;
		}


		/* ==================================================
		   CONTINUAÇÃO NORMAL DA HOME
		================================================== */

		PRIMEIRAPAG_Login_func_limparErros();


    if (typeof MOTORISTAPAG_Login_func_fecharMenuLateral === "function") {
		MOTORISTAPAG_Login_func_fecharMenuLateral();
	}

	if (typeof MOTORISTAPAG_Login_func_fecharModais === "function") {
		MOTORISTAPAG_Login_func_fecharModais();
	}

	PRIMEIRAPAG_Login_func_irPara('MOTORISTAPAG_Login_screen_home');

    if (typeof MOTORISTAPAG_Login_func_carregarTemaMotoristaSalvo === "function") {
        MOTORISTAPAG_Login_func_carregarTemaMotoristaSalvo();
    }
	
	/*
	 * HOME MOTORISTA — CONFIRMAÇÃO PIX
	 *
	 * A Home já foi aberta.
	 * Agora verifica o estado permanente da conta.
	 */
	const dadosMotoristaPixHome =
		motoristaDoc.exists
			? motoristaDoc.data()
			: {};

	await MOTORISTAPAG_Login_func_verificarConfirmacaoPixHome(
		dadosMotoristaPixHome
	);

    const content =
        document.querySelector('.Fame_content') ||
        document.getElementById('PRIMEIRAPAG_Login_content_area');

    if (content) {
        content.classList.add('MOTORISTAPAG_Login_home_ativa');
    }
	
	/*
	 * Abre ou atualiza o Google Maps depois que
	 * a Home do motorista já estiver visível.
	 */
	setTimeout(function() {

		if (
			typeof MOTORISTAPAG_Login_func_prepararMapaGoogle ===
			"function"
		) {
			MOTORISTAPAG_Login_func_prepararMapaGoogle();
		}

	}, 250);

    try {
		const u =
			userDoc.exists
				? userDoc.data()
				: {};

		const m =
			motoristaDoc.exists
				? motoristaDoc.data()
				: {};

        
        const dadosFotoPerfilMotorista = {
            ...u,
            ...m
        };

        if (
            typeof TNP_Login_func_verificarModalFotoPerfilAdmin ===
            "function"
        ) {
            TNP_Login_func_verificarModalFotoPerfilAdmin(
                dadosFotoPerfilMotorista,
                "motorista"
            );
        }
        
        const nomeBruto =

            u.nomeDocumento ||
            u.nome ||
            m.nomeDocumento ||
            m.nome ||
            user.displayName ||
            "Motorista";

        const nomeBaseMotorista =
			String(nomeBruto || "")
				.trim()
				.replace(/\s+(passageiro|motorista)$/i, "")
				.trim();

		const nome =
			nomeBaseMotorista
				? `${nomeBaseMotorista} motorista`
				: "Motorista";

        const email =
            u.email ||
            m.email ||
            user.email ||
            "-";

        const foto =
            u.fotoPerfilUrl ||
            u.selfieUrl ||
            m.fotoPerfilUrl ||
            m.selfieUrl ||
            "";

        const nomeMenu = document.getElementById('MOTORISTAPAG_Login_nome_menu');
        const emailMenu = document.getElementById('MOTORISTAPAG_Login_email_menu');
        const fotoMenu = document.getElementById('MOTORISTAPAG_Login_foto_menu');
        const btnConectar = document.getElementById('MOTORISTAPAG_Login_btn_conectar');

        if (nomeMenu) nomeMenu.innerText = nome;
        if (emailMenu) emailMenu.innerText = email;

        if (fotoMenu) {
            fotoMenu.onerror = null;
            fotoMenu.removeAttribute('src');

            if (foto) {
                fotoMenu.onerror = function() {
                    fotoMenu.onerror = null;
                    fotoMenu.removeAttribute('src');
                };

                fotoMenu.src = foto + (foto.includes("?") ? "&v=" : "?v=") + Date.now();
            }
        }

				
		/* ==================================================
		   TNP MOB — HOME MOTORISTA
		   BOTÃO CONECTAR ALINHADO AO PAINEL ADMIN
		================================================== */

		const estadoConexao =
			MOTORISTAPAG_Login_func_obterEstadoConexaoAdmin(m);

		if (btnConectar) {

			// Limpa o estado visual anterior.
			btnConectar.classList.remove(
				"MOTORISTAPAG_Login_home_btn_online"
			);

			btnConectar.removeAttribute(
				"aria-busy"
			);

			// Aplica o resultado do estado oficial.
			btnConectar.dataset.estado =
				estadoConexao.estado;

			btnConectar.innerText =
				estadoConexao.texto;

			btnConectar.disabled = false;
		}

		
        /* ==================================================
           HOME MOTORISTA — AVISO ADMINISTRATIVO AUTOMÁTICO

           A Home apenas chama o módulo responsável.

           Somente motoristas com aprovação anterior
           recebem automaticamente o aviso de uma
           nova pendência obrigatória.

           Motoristas ainda não aprovados continuam
           podendo acessar a correção pelo sininho.
        ================================================== */

        const motoristaJaFoiAprovado =
            Boolean(m.aprovadoEm) ||
            Boolean(u.aprovadoMotoristaEm) ||
            m.cadastroAprovado === true ||
            u.cadastroAprovadoMotorista === true;

        if (
            motoristaJaFoiAprovado &&
            typeof TNP_Login_func_obterPendenciasAdminDoPerfil ===
                "function" &&
            typeof TNP_Login_func_carregarModuloPendenciasAdmin ===
                "function" &&
            typeof TNP_Login_func_verificarModalPendenciaAdminUniversal ===
                "function"
        ) {

            const leituraPendencias =
                TNP_Login_func_obterPendenciasAdminDoPerfil(
                    u,
                    m,
                    "motorista"
                );

            const possuiPendenciaObrigatoria =
                leituraPendencias.pendencias.some(
                    function(pendencia) {
                        return pendencia.obrigatoria === true;
                    }
                );

            const supercorrecaoAberta =
                document.getElementById(
                    "MODALSUPERCORRECAO_modal"
                )?.classList.contains("active") === true;

            const avisoAdminAberto =
                document.getElementById(
                    "TNP_Login_modal_pendencia_admin"
                )?.classList.contains("active") === true;

            if (
                possuiPendenciaObrigatoria &&
                !supercorrecaoAberta &&
                !avisoAdminAberto
            ) {

                const moduloCarregado =
                    await TNP_Login_func_carregarModuloPendenciasAdmin();

                if (moduloCarregado) {
                    TNP_Login_func_verificarModalPendenciaAdminUniversal(
                        u,
                        m,
                        "motorista",
                        true
                    );
                }
            }
        }

		
        const ganhosOculto = localStorage.getItem("TNP_MOB_MOTORISTA_GANHOS_OCULTO");
		const valorGanhos = document.getElementById('MOTORISTAPAG_Login_home_ganhos_valor');
		const btnGanhos = document.getElementById('MOTORISTAPAG_Login_btn_ocultar_ganhos');

		if (ganhosOculto === "sim") {
			if (valorGanhos) {
				valorGanhos.dataset.valorReal = valorGanhos.dataset.valorReal || valorGanhos.innerText || "R$0,00";
				valorGanhos.innerText = "••••";
				valorGanhos.dataset.oculto = "true";
			}

			if (btnGanhos) {
				btnGanhos.innerText = "🙈";
				btnGanhos.setAttribute("aria-label", "Mostrar ganhos");
				btnGanhos.setAttribute("title", "Mostrar ganhos");
			}
		} else {
			if (valorGanhos) {
				valorGanhos.innerText = valorGanhos.dataset.valorReal || valorGanhos.innerText || "R$0,00";
				valorGanhos.dataset.oculto = "false";
			}

			if (btnGanhos) {
				btnGanhos.innerText = "👁️";
				btnGanhos.setAttribute("aria-label", "Ocultar ganhos");
				btnGanhos.setAttribute("title", "Ocultar ganhos");
			}
		}

    } catch (erro) {
        console.error("Erro ao carregar home do motorista:", erro);
    }
	
	if (
		typeof NOTIFICACOES_func_iniciarEscutaBadge ===
		"function"
	) {
		setTimeout(function() {

			NOTIFICACOES_func_iniciarEscutaBadge(
				"motorista"
			);

		}, 400);
	}
	
	/* RETORNO DA EDIÇÃO DA FOTO DE PERFIL */
	await MOTORISTAPAG_Login_func_receberRetornoEdicaoFotoPerfil();
	
}

function MOTORISTAPAG_Login_func_fecharModais() {

    if (
        typeof MOTORISTAMENSAGENS_func_fecharTela ===
        "function"
    ) {
        MOTORISTAMENSAGENS_func_fecharTela();
    }


    document
        .querySelectorAll(
            ".MOTORISTAPAG_Login_modal_home"
        )
        .forEach(
            function (modal) {

                if (!modal) {
                    return;
                }


                /*
                 * A Central de Segurança possui
                 * fechamento próprio.
                 *
                 * Não pode ser fechada pela rotina
                 * genérica porque precisa proteger
                 * gravação, câmera e microfone.
                 */
                if (
                    modal.id ===
                    "MOTORISTAPAG_Login_screen_central_seguranca"
                ) {
                    return;
                }


                modal.classList.remove(
                    "active"
                );
            }
        );
}


function MOTORISTAPAG_Login_func_abrirPaginaProvisoria(titulo, texto) {
    alert(titulo + "\n\n" + texto);
}

function MOTORISTAPAG_Login_func_alternarVisibilidadeGanhos(event) {
    if (event) {
        event.stopPropagation();
    }

    const valor = document.getElementById('MOTORISTAPAG_Login_home_ganhos_valor');
    const btn = document.getElementById('MOTORISTAPAG_Login_btn_ocultar_ganhos');

    if (!valor || !btn) return;

    const oculto = valor.dataset.oculto === "true";

		if (oculto) {
		valor.innerText = valor.dataset.valorReal || "R$0,00";
		valor.dataset.oculto = "false";

		btn.innerText = "👁️";
		btn.setAttribute("aria-label", "Ocultar ganhos");
		btn.setAttribute("title", "Ocultar ganhos");

		localStorage.setItem("TNP_MOB_MOTORISTA_GANHOS_OCULTO", "nao");
	} else {
		valor.dataset.valorReal = valor.innerText;
		valor.innerText = "••••";
		valor.dataset.oculto = "true";

		btn.innerText = "🙈";
		btn.setAttribute("aria-label", "Mostrar ganhos");
		btn.setAttribute("title", "Mostrar ganhos");

		localStorage.setItem("TNP_MOB_MOTORISTA_GANHOS_OCULTO", "sim");
	}
}

//-- HOME DO MOTORISTA - OCULTAR VALOR/ABRIR GANHOS FINAL -->
//-- HOME DO MOTORISTA - CARD PROMOCIONAL PEQUENO -->
function MOTORISTAPAG_Login_func_fecharCardPromocao() {
    const card = document.getElementById('MOTORISTAPAG_Login_home_card_promo');

    if (card) {
        card.style.display = "none";
    }
}


/* ==================================================
   HOME — ABRIR REPORTAR PROBLEMA
================================================== */

async function MOTORISTAPAG_Login_func_abrirReportarProblema() {

    if (
        typeof MOTORISTAPAG_Login_func_fecharMenuLateral ===
        "function"
    ) {
        MOTORISTAPAG_Login_func_fecharMenuLateral();
    }

    if (
        typeof MOTORISTAPAG_Login_func_fecharModais ===
        "function"
    ) {
        MOTORISTAPAG_Login_func_fecharModais();
    }

    await MOTORISTAPAG_Login_func_abrirModuloReportarProblema();
}

/* ==================================================
   HOME MOTORISTA — CHAMAR CAMADAS DO MAPA
================================================== */

async function MOTORISTAPAG_Login_func_abrirCamadasMapa() {

    if (
        typeof MOTORISTAPAG_Login_func_fecharMenuLateral ===
        "function"
    ) {
        MOTORISTAPAG_Login_func_fecharMenuLateral();
    }

    if (
        typeof MOTORISTAPAG_Login_func_fecharModais ===
        "function"
    ) {
        MOTORISTAPAG_Login_func_fecharModais();
    }

    return await MOTORISTAPAG_Login_func_abrirModuloCamadasMapa();
}


/* ==================================================
   TNP MOB — HOME MOTORISTA
   CONECTAR — CONFERÊNCIA NO FIREBASE
================================================== */

/* ==================================================
   HOME MOTORISTA — BOTÃO CONECTAR
   ENCAMINHAMENTO AO GERENCIADOR
================================================== */

async function MOTORISTAPAG_Login_func_botaoConectar() {

    if (
        typeof MOTORISTAPAG_GERENCIADOR_func_acionarBotaoConectar !==
        "function"
    ) {
        console.error(
            "Gerenciador de Pendências não está disponível."
        );

        return false;
    }

    return await MOTORISTAPAG_GERENCIADOR_func_acionarBotaoConectar();
}

async function MOTORISTAPAG_Login_func_abrirChamadas() {

    if (
        typeof MOTORISTAPAG_Login_func_fecharMenuLateral === "function"
    ) {
        MOTORISTAPAG_Login_func_fecharMenuLateral();
    }

    if (
        typeof MOTORISTAPAG_Login_func_fecharModais === "function"
    ) {
        MOTORISTAPAG_Login_func_fecharModais();
    }

    return await MOTORISTAPAG_Login_func_abrirModuloChamadas();
}

/* ==================================================
   HOME MOTORISTA — CHAMAR MÓDULO FERRAMENTAS
================================================== */

async function MOTORISTAPAG_Login_func_abrirFerramentas() {

    if (
        typeof MOTORISTAPAG_Login_func_fecharMenuLateral === "function"
    ) {
        MOTORISTAPAG_Login_func_fecharMenuLateral();
    }

    if (
        typeof MOTORISTAPAG_Login_func_fecharModais === "function"
    ) {
        MOTORISTAPAG_Login_func_fecharModais();
    }

    return await MOTORISTAPAG_Login_func_abrirModuloFerramentas();
}

/* ==================================================
   MOTORISTA — INICIALIZAR HOME
================================================== */

async function MOTORISTAPAG_Login_func_inicializarHomeMotorista() {
    try {
        await TNP_MOB_func_aguardarUsuarioAutenticado(
            8000
        );
		
	/*
	 * Monta primeiro o Menu Lateral.
	 *
	 * Assim, quando a Home carregar os dados
	 * do motorista, o nome e o e-mail
	 * já terão seus elementos disponíveis.
	 */
	await MOTORISTAPAG_Login_func_carregarModuloMenuLateral();

	await MOTORISTAPAG_Login_func_carregarHomeMotorista();


    } catch (erro) {
        console.error(
            "TNP MOB: não foi possível inicializar a Home do Motorista:",
            erro
        );

        window.location.href =
            "../../inicio/inicio.html";
    }
}

/* ==================================================
   INICIAR HOME
================================================== */

MOTORISTAPAG_Login_func_inicializarHomeMotorista();


/* ==================================================
   TNP MOB — MOTORISTA
   MENU LATERAL
   menu-lateralm.js
================================================== */


/* ==================================================
   CONTROLE DE CARREGAMENTO
================================================== */

let MOTORISTAPAG_Login_menuLateralCarregando = null;


/* ==================================================
   CARREGAR MÓDULO MENU LATERAL
================================================== */

async function MOTORISTAPAG_Login_func_carregarModuloMenuLateral() {

    const area = document.getElementById(
        "MOTORISTAPAG_Login_area_menu_lateral"
    );

    if (!area) {
        console.error(
            "Área do Menu Lateral não encontrada."
        );

        return false;
    }

    /*
     * Se o menu já foi montado,
     * não carregar novamente.
     */
    if (
        document.getElementById(
            "MOTORISTAPAG_Login_menu_overlay"
        )
    ) {
        return true;
    }

    /*
     * Evita dois carregamentos simultâneos.
     */
    if (MOTORISTAPAG_Login_menuLateralCarregando) {
        return MOTORISTAPAG_Login_menuLateralCarregando;
    }

    MOTORISTAPAG_Login_menuLateralCarregando =
        (async function() {

            try {

                const resposta = await fetch(
                    "menu-lateralm/menu-lateralm.html"
                );

                if (!resposta.ok) {
                    throw new Error(
                        "Não foi possível carregar menu-lateralm.html"
                    );
                }

                area.innerHTML = await resposta.text();

                return !!document.getElementById(
                    "MOTORISTAPAG_Login_menu_overlay"
                );

            } catch (erro) {

                console.error(
                    "Erro ao carregar Menu Lateral:",
                    erro
                );

                return false;
            }

        })();

    try {

        return await MOTORISTAPAG_Login_menuLateralCarregando;

    } finally {

        MOTORISTAPAG_Login_menuLateralCarregando = null;
    }
}


/* ==================================================
   ABRIR MENU LATERAL
================================================== */


async function MOTORISTAPAG_Login_func_abrirMenuLateral() {

    const carregou =
        await MOTORISTAPAG_Login_func_carregarModuloMenuLateral();


    if (!carregou) {
        return;
    }

    const overlay = document.getElementById(
        "MOTORISTAPAG_Login_menu_overlay"
    );

    const menu = document.getElementById(
        "MOTORISTAPAG_Login_menu_lateral"
    );

    if (overlay) {
        overlay.classList.add("active");
    }

    if (menu) {
        menu.classList.add("active");
    }

    document.body.style.overflow = "hidden";
	
		
	/*
	 * MENU LATERAL — REGISTRAR NO VOLTAR GLOBAL
	 */
	if (
		typeof TNP_MOB_func_registrarCamadaVoltar ===
		"function"
	) {
		TNP_MOB_func_registrarCamadaVoltar(
			"motorista_menu_lateral",
			MOTORISTAPAG_Login_func_fecharMenuLateral
		);
	}
}

/* ==================================================
   FECHAR MENU LATERAL
================================================== */

function MOTORISTAPAG_Login_func_fecharMenuLateral() {

    const overlay = document.getElementById(
        "MOTORISTAPAG_Login_menu_overlay"
    );

    const menu = document.getElementById(
        "MOTORISTAPAG_Login_menu_lateral"
    );

    if (overlay) {
        overlay.classList.remove("active");
    }

    if (menu) {
        menu.classList.remove("active");
    }

    document.body.style.overflow = "";
		
		
	/*
	 * MENU LATERAL — REMOVER DO VOLTAR GLOBAL
	 */
	if (
		typeof TNP_MOB_func_removerCamadaVoltar ===
		"function"
	) {
		TNP_MOB_func_removerCamadaVoltar(
			"motorista_menu_lateral"
		);
	}

}

/* ==================================================
   MOTORISTA — USAR COMO PASSAGEIRO
================================================== */

async function MOTORISTAPAG_Login_func_usarComoPassageiro() {
    const user =
        PRIMEIRAPAG_Login_auth.currentUser;

    MOTORISTAPAG_Login_func_fecharMenuLateral();

    if (!user) {
        if (
            typeof TNP_MOB_func_irParaModulo ===
            "function"
        ) {
            TNP_MOB_func_irParaModulo(
                "../../inicio/inicio.html"
            );
        } else {
            window.location.href =
                "../../inicio/inicio.html";
        }

        return false;
    }

    try {

    /* ==================================================
       TNP MOB — TROCAR PARA PASSAGEIRO PELO ROTEADOR V2

       O Menu apenas solicita o perfil.

       O Roteador decide o destino.
       O Login registra o perfil ativo no Firebase.
    ================================================== */

		/*
		 * Informa ao Login original qual perfil
		 * foi solicitado pelo Menu Lateral.
		 */
		sessionStorage.setItem(
			"TNP_MOB_PERFIL_SOLICITADO_PELO_MENU",
			user.uid + ":passageiro"
		);

		/*
		 * Limpar histórico da navegação anterior.
		 */
		if (
			typeof TNP_MOB_historicoTelas !==
			"undefined"
		) {
			TNP_MOB_historicoTelas.length = 0;
		}

		/*
		 * Retornar à entrada original.
		 *
		 * O Login recupera a sessão,
		 * consulta o Roteador V2 e
		 * aplica o destino correto.
		 */
		if (
			typeof TNP_MOB_func_irParaModulo ===
			"function"
		) {
			TNP_MOB_func_irParaModulo(
				"../../inicio/inicio.html"
			);

			return true;
		}

		window.location.href =
			"../../inicio/inicio.html";

		return true;

    } catch (erro) {
        console.error(
            "TNP MOB: erro ao trocar do motorista para passageiro:",
            erro
        );

        return false;
    }
}

//-- HOME DO MOTORISTA - MENU LATERAL FINAL --> 

/* ==================================================
   MENU LATERAL — CHAMAR PERFIL DO MOTORISTA
================================================== */

async function MOTORISTAPAG_Login_func_abrirPerfilMotorista() {

    MOTORISTAPAG_Login_func_fecharMenuLateral();

    if (
        typeof MOTORISTAPAG_Login_func_fecharModais === "function"
    ) {
        MOTORISTAPAG_Login_func_fecharModais();
    }

    if (
        typeof MOTORISTAMENSAGENS_func_fecharTela === "function"
    ) {
        MOTORISTAMENSAGENS_func_fecharTela();
    }

    return await MOTORISTAPAG_Login_func_abrirModuloPerfilMotorista();
}

/* ==================================================
   DISPONIBILIZAR FUNÇÕES GLOBALMENTE
================================================== */

window.MOTORISTAPAG_Login_func_carregarModuloMenuLateral =
    MOTORISTAPAG_Login_func_carregarModuloMenuLateral;

window.MOTORISTAPAG_Login_func_abrirMenuLateral =
    MOTORISTAPAG_Login_func_abrirMenuLateral;

window.MOTORISTAPAG_Login_func_fecharMenuLateral =
    MOTORISTAPAG_Login_func_fecharMenuLateral;

window.MOTORISTAPAG_Login_func_abrirPerfilMotorista =
    MOTORISTAPAG_Login_func_abrirPerfilMotorista;

/* ==================================================
   MENU LATERAL MOTORISTA FINAL
================================================== */


/* ==================================================
   MOTORISTA — REPORTAR PROBLEMA
================================================== */

async function MOTORISTAPAG_Login_func_carregarModuloReportarProblema() {
    const area = document.getElementById('MOTORISTAPAG_Login_area_reportar_problema');

    if (!area) {
        console.error('Área do módulo Reportar Problema não encontrada.');
        return false;
    }

    if (!document.getElementById('MOTORISTAPAG_Login_modal_reportar')) {
        try {
            const resposta = await fetch('reportar-problema/reportar-problema.html');

            if (!resposta.ok) {
                throw new Error('Não foi possível carregar reportar-problema.html');
            }

            area.innerHTML = await resposta.text();

        } catch (erro) {
            console.error('Erro ao carregar módulo Reportar Problema:', erro);
            return false;
        }
    }

    return true;
}

/* ==================================================
   ABRIR REPORTAR PROBLEMA
================================================== */

async function MOTORISTAPAG_Login_func_abrirModuloReportarProblema() {

    const carregou =
        await MOTORISTAPAG_Login_func_carregarModuloReportarProblema();

    if (!carregou) {
        return false;
    }

    const modal = document.getElementById(
        "MOTORISTAPAG_Login_modal_reportar"
    );

    if (!modal) {
        return false;
    }

    modal.classList.add("active");

    /*
     * REPORTAR PROBLEMA — VOLTAR GLOBAL
     *
     * Registra o modal na pilha de navegação.
     */
    if (
        typeof TNP_MOB_func_registrarCamadaVoltar ===
        "function"
    ) {
        TNP_MOB_func_registrarCamadaVoltar(
            "motorista_reportar_problema",
            MOTORISTAPAG_Login_func_fecharReportarProblema
        );
    }

    return true;
}


/* ==================================================
   FECHAR
================================================== */


/* ==================================================
   REPORTAR PROBLEMA — FECHAR
================================================== */

function MOTORISTAPAG_Login_func_fecharReportarProblema() {

    const modal =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_reportar"
        );

    /*
     * Fecha visualmente o modal.
     */
    if (modal) {

        modal.classList.remove(
            "active"
        );
    }

    /*
     * REPORTAR PROBLEMA — VOLTAR GLOBAL
     *
     * Remove a camada da pilha quando
     * o modal for fechado.
     */
    if (
        typeof TNP_MOB_func_removerCamadaVoltar ===
        "function"
    ) {
        TNP_MOB_func_removerCamadaVoltar(
            "motorista_reportar_problema"
        );
    }
}



/* ==================================================
   ALERTA PROVISÓRIO
================================================== */

function MOTORISTAPAG_Login_func_criarAlertaMapaTeste(tipoAlerta) {
    const nomes = {
        transito: 'Trânsito',
        policia: 'Polícia',
        acidente: 'Acidente',
        perigo: 'Perigo',
        faixa_fechada: 'Faixa fechada',
        mau_tempo: 'Mau tempo'
    };

    const nomeAlerta = nomes[tipoAlerta] || tipoAlerta;

    alert('Alerta de teste criado: ' + nomeAlerta);
}


/* ==================================================
   DISPONIBILIZAR FUNÇÕES
================================================== */

window.MOTORISTAPAG_Login_func_carregarModuloReportarProblema =
    MOTORISTAPAG_Login_func_carregarModuloReportarProblema;

window.MOTORISTAPAG_Login_func_fecharReportarProblema =
    MOTORISTAPAG_Login_func_fecharReportarProblema;

window.MOTORISTAPAG_Login_func_criarAlertaMapaTeste =
    MOTORISTAPAG_Login_func_criarAlertaMapaTeste;
	

window.MOTORISTAPAG_Login_func_abrirModuloReportarProblema =
    MOTORISTAPAG_Login_func_abrirModuloReportarProblema;
	/* =========================================================
   TNP MOB — MOTORISTA
   SOS SILENCIOSO
   1. ESTADO
   ========================================================= */

let MOTORISTAPAG_Login_sosToques = 0;
let MOTORISTAPAG_Login_sosTimerToques = null;
let MOTORISTAPAG_Login_sosEmAndamento = false;
let MOTORISTAPAG_Login_sosUltimoAcionadoMs = 0;

let MOTORISTAPAG_Login_sosWatchId = null;
let MOTORISTAPAG_Login_sosAlertaAtivoId = "";

let MOTORISTAPAG_Login_sosEncerramentoListener = null;

let MOTORISTAPAG_Login_sosVideoGravando = false;
let MOTORISTAPAG_Login_sosVideoRecorder = null;
let MOTORISTAPAG_Login_sosVideoStreamGravacao = null;
let MOTORISTAPAG_Login_sosVideoChunks = [];

/* =========================================================
   2. ACIONAMENTO DISCRETO — 3 TOQUES
   ========================================================= */

function MOTORISTAPAG_Login_func_toqueSosDiscreto() {
    MOTORISTAPAG_Login_sosToques++;

    clearTimeout(MOTORISTAPAG_Login_sosTimerToques);

    MOTORISTAPAG_Login_sosTimerToques = setTimeout(function() {
        MOTORISTAPAG_Login_sosToques = 0;
    }, 1200);

    if (MOTORISTAPAG_Login_sosToques < 3) {
        return;
    }

    clearTimeout(MOTORISTAPAG_Login_sosTimerToques);
    MOTORISTAPAG_Login_sosToques = 0;

    MOTORISTAPAG_Login_func_acionarSosSilenciosoMotorista();
}

/* =========================================================
   3. LOCALIZAÇÃO INICIAL DO SOS
   ========================================================= */

function MOTORISTAPAG_Login_func_obterLocalizacaoSosMotorista() {
    return new Promise(function(resolve) {
        if (!navigator.geolocation) {
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            function(posicao) {
                resolve({
                    latitude: posicao.coords.latitude,
                    longitude: posicao.coords.longitude,
                    accuracy: posicao.coords.accuracy || null,
                    altitude: posicao.coords.altitude || null,
                    heading: posicao.coords.heading || null,
                    speed: posicao.coords.speed || null,
                    coletadoEmMs: Date.now()
                });
            },
            function(erro) {
                console.warn("SOS silencioso: localização não capturada:", erro);
                resolve(null);
            },
            {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 5000
            }
        );
    });
}

/* =========================================================
   3.2. LOCALIZAÇÃO EM TEMPO REAL DO SOS
   ========================================================= */

function MOTORISTAPAG_Login_func_iniciarLocalizacaoTempoRealSosMotorista(alertaId, chamadoId) {
    if (!navigator.geolocation || !alertaId) return;

    if (MOTORISTAPAG_Login_sosWatchId !== null) {
        navigator.geolocation.clearWatch(MOTORISTAPAG_Login_sosWatchId);
        MOTORISTAPAG_Login_sosWatchId = null;
    }

    MOTORISTAPAG_Login_sosAlertaAtivoId = alertaId;

    MOTORISTAPAG_Login_sosWatchId = navigator.geolocation.watchPosition(
        async function(posicao) {
            try {
                const db =
                    typeof PRIMEIRAPAG_Login_db !== "undefined"
                        ? PRIMEIRAPAG_Login_db
                        : firebase.firestore();

                const localizacaoAtualizada = {
                    latitude: posicao.coords.latitude,
                    longitude: posicao.coords.longitude,
                    accuracy: posicao.coords.accuracy || null,
                    altitude: posicao.coords.altitude || null,
                    heading: posicao.coords.heading || null,
                    speed: posicao.coords.speed || null,
                    coletadoEmMs: Date.now()
                };

                const payload = {
                    latitudeAtual: localizacaoAtualizada.latitude,
                    longitudeAtual: localizacaoAtualizada.longitude,
                    localizacaoAtual: localizacaoAtualizada,
                    localizacaoDisponivel: true,
                    atualizadoLocalizacaoEm: firebase.firestore.FieldValue.serverTimestamp(),
                    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
                };

                await db
                    .collection("alertasSeguranca")
                    .doc(alertaId)
                    .update(payload);

                if (chamadoId) {
                    await db
                        .collection("suporteChamados")
                        .doc(chamadoId)
                        .update(payload);
                }

            } catch (erro) {
                console.warn(
                    "SOS silencioso: erro ao atualizar localização em tempo real:",
                    erro
                );
            }
        },

        async function(erro) {
            console.warn(
                "SOS silencioso: localização em tempo real indisponível:",
                erro
            );

            try {
                const db =
                    typeof PRIMEIRAPAG_Login_db !== "undefined"
                        ? PRIMEIRAPAG_Login_db
                        : firebase.firestore();

                let motivo = "indisponivel";

                if (erro && erro.code === 1) {
                    motivo = "permissao_negada";
                } else if (erro && erro.code === 2) {
                    motivo = "posicao_indisponivel";
                } else if (erro && erro.code === 3) {
                    motivo = "tempo_esgotado";
                }

                const payloadErroLocalizacao = {
                    localizacaoTempoRealAtiva: false,
                    localizacaoTempoRealStatus: motivo,
                    localizacaoTempoRealErro:
                        erro && erro.message
                            ? erro.message
                            : "",
                    atualizadoEm:
                        firebase.firestore.FieldValue.serverTimestamp()
                };

                await db
                    .collection("alertasSeguranca")
                    .doc(alertaId)
                    .update(payloadErroLocalizacao);

                if (chamadoId) {
                    await db
                        .collection("suporteChamados")
                        .doc(chamadoId)
                        .update(payloadErroLocalizacao);
                }

            } catch (erroFirebase) {
                console.warn(
                    "SOS silencioso: erro ao salvar falha de localização:",
                    erroFirebase
                );
            }
        },

        {
            enableHighAccuracy: true,
            maximumAge: 3000,
            timeout: 10000
        }
    );
}

/* =========================================================
   3.3. PARAR LOCALIZAÇÃO EM TEMPO REAL DO SOS
   ========================================================= */

function MOTORISTAPAG_Login_func_pararLocalizacaoTempoRealSosMotorista() {
    if (
        MOTORISTAPAG_Login_sosWatchId !== null &&
        navigator.geolocation
    ) {
        navigator.geolocation.clearWatch(
            MOTORISTAPAG_Login_sosWatchId
        );
    }

    MOTORISTAPAG_Login_sosWatchId = null;
    MOTORISTAPAG_Login_sosAlertaAtivoId = "";
}

/* =========================================================
   4. VÍDEO AUTOMÁTICO DO SOS
   ========================================================= */

async function MOTORISTAPAG_Login_func_gravarVideoSosUmMinutoParaSuporte(alertaId, chamadoId) {
    alertaId = String(alertaId || "").trim();
    chamadoId = String(chamadoId || "").trim();

    if (!alertaId || !chamadoId) return;
    if (MOTORISTAPAG_Login_sosVideoGravando) return;

    const user =
        typeof PRIMEIRAPAG_Login_auth !== "undefined" && PRIMEIRAPAG_Login_auth.currentUser
            ? PRIMEIRAPAG_Login_auth.currentUser
            : firebase.auth().currentUser;

    if (!user) return;

    MOTORISTAPAG_Login_sosVideoGravando = true;
    MOTORISTAPAG_Login_sosVideoChunks = [];

    try {
        const db =
            typeof PRIMEIRAPAG_Login_db !== "undefined"
                ? PRIMEIRAPAG_Login_db
                : firebase.firestore();

        const storage =
            typeof PRIMEIRAPAG_Login_storage !== "undefined"
                ? PRIMEIRAPAG_Login_storage
                : firebase.storage();

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
			await db.collection("alertasSeguranca").doc(alertaId).set({
				videoGravadoSosStatus: "navegador_sem_camera",
				atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
			}, { merge: true });

			MOTORISTAPAG_Login_func_pararGravacaoVideoSos();

			return;
		}

        MOTORISTAPAG_Login_sosVideoStreamGravacao =
            await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: {
                    facingMode: "user"
                }
            });

        let opcoesRecorder = {};

        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
            opcoesRecorder = {
                mimeType: "video/webm;codecs=vp8,opus"
            };
        } else if (MediaRecorder.isTypeSupported("video/webm")) {
            opcoesRecorder = {
                mimeType: "video/webm"
            };
        }

        MOTORISTAPAG_Login_sosVideoRecorder =
            new MediaRecorder(MOTORISTAPAG_Login_sosVideoStreamGravacao, opcoesRecorder);

        MOTORISTAPAG_Login_sosVideoRecorder.ondataavailable = function(event) {
            if (event.data && event.data.size > 0) {
                MOTORISTAPAG_Login_sosVideoChunks.push(event.data);
            }
        };

        MOTORISTAPAG_Login_sosVideoRecorder.onstop = async function() {
            try {
                const mimeType =
                    MOTORISTAPAG_Login_sosVideoRecorder &&
                    MOTORISTAPAG_Login_sosVideoRecorder.mimeType
                        ? MOTORISTAPAG_Login_sosVideoRecorder.mimeType
                        : "video/webm";

                if (!MOTORISTAPAG_Login_sosVideoChunks.length) {
                    await db.collection("alertasSeguranca").doc(alertaId).set({
                        videoGravadoSosStatus: "sem_dados_gravados",
                        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });

                    return;
                }

                const blob = new Blob(MOTORISTAPAG_Login_sosVideoChunks, {
                    type: mimeType
                });

                const dataArquivo = Date.now();
                const nomeArquivo =
                    "tnp-mob-sos-motorista-video-" +
                    alertaId +
                    "-" +
                    dataArquivo +
                    ".webm";

                const caminhoStorage =
                    "segurancaMotoristas/" +
                    user.uid +
                    "/sos/" +
                    alertaId +
                    "/" +
                    nomeArquivo;

                const arquivoRef = storage.ref().child(caminhoStorage);

                await arquivoRef.put(blob, {
                    contentType: mimeType,
                    customMetadata: {
                        origem: "sos_silencioso_motorista",
                        motoristaUid: user.uid,
                        alertaSegurancaId: alertaId,
                        chamadoId: chamadoId,
                        duracaoSegundos: "60"
                    }
                });

                const videoUrl = await arquivoRef.getDownloadURL();

                const textoVideo =
                    "Vídeo de 1 minuto do SOS silencioso enviado pelo motorista.";

                await db.collection("alertasSeguranca").doc(alertaId).set({
                    videoGravadoSosStatus: "enviado",
                    videoGravadoSosUrl: videoUrl,
                    videoGravadoSosStoragePath: caminhoStorage,
                    videoGravadoSosNome: nomeArquivo,
                    videoGravadoSosContentType: mimeType,
                    videoGravadoSosEnviadoEm: firebase.firestore.FieldValue.serverTimestamp(),
                    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

                await db.collection("suporteChamados").doc(chamadoId).set({
                    videoGravadoSosStatus: "enviado",
                    videoGravadoSosUrl: videoUrl,
                    videoGravadoSosStoragePath: caminhoStorage,
                    videoGravadoSosNome: nomeArquivo,
                    videoGravadoSosContentType: mimeType,

                    ultimaMensagem: textoVideo,
                    ultimaMensagemTexto: textoVideo,
                    ultimaMensagemOrigem: "motorista",
                    ultimaMensagemDestino: "suporte",

                    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

                await db.collection("suporteChamados")
                    .doc(chamadoId)
                    .collection("mensagens")
                    .add({
                        origem: "motorista",
                        origemReal: "motorista",
                        origemUid: user.uid,
                        exibidoComo: user.displayName || "Motorista",

                        destinoReal: "suporte",
                        encaminhadoPara: "suporte",

                        tipo: "video_sos",
                        categoria: "seguranca",

                        texto: textoVideo,
                        textoOriginal: textoVideo,
                        textoExibido: textoVideo,

                        alertaSegurancaId: alertaId,

                        arquivoUrl: videoUrl,
                        arquivoNome: nomeArquivo,
                        arquivoTipo: "video_sos",
                        arquivoContentType: mimeType,
                        arquivoStoragePath: caminhoStorage,

                        visivelParaMotorista: true,
                        visivelParaPassageiro: false,
                        visivelParaSuporte: true,

                        visibilidades: {
                            motorista: true,
                            passageiro: false,
                            suporte: true
                        },

                        lidaAdmin: false,
                        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
                    });

            } catch (erroFinalizar) {
                console.error("SOS vídeo: erro ao enviar vídeo gravado:", erroFinalizar);

                try {
                    await db.collection("alertasSeguranca").doc(alertaId).set({
                        videoGravadoSosStatus: "erro_ao_enviar",
                        videoGravadoSosErro:
                            erroFinalizar && erroFinalizar.message
                                ? erroFinalizar.message
                                : String(erroFinalizar),
                        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                } catch (erroSalvar) {
                    console.warn("SOS vídeo: erro ao salvar falha:", erroSalvar);
                }

            } finally {
                MOTORISTAPAG_Login_func_pararGravacaoVideoSos();
            }
        };

        await db.collection("alertasSeguranca").doc(alertaId).set({
            videoGravadoSosStatus: "gravando_1_minuto",
            videoGravadoSosIniciadoEm: firebase.firestore.FieldValue.serverTimestamp(),
            atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        await db.collection("suporteChamados").doc(chamadoId).set({
            videoGravadoSosStatus: "gravando_1_minuto",
            atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        MOTORISTAPAG_Login_sosVideoRecorder.start();

        setTimeout(function() {
            if (
                MOTORISTAPAG_Login_sosVideoRecorder &&
                MOTORISTAPAG_Login_sosVideoRecorder.state === "recording"
            ) {
                MOTORISTAPAG_Login_sosVideoRecorder.stop();
            }
        }, 60 * 1000);

    } catch (erro) {
        console.error("SOS vídeo: erro ao iniciar gravação de 1 minuto:", erro);

        try {
            const db =
                typeof PRIMEIRAPAG_Login_db !== "undefined"
                    ? PRIMEIRAPAG_Login_db
                    : firebase.firestore();

            await db.collection("alertasSeguranca").doc(alertaId).set({
                videoGravadoSosStatus: "erro_ao_iniciar",
                videoGravadoSosErro: erro && erro.message ? erro.message : String(erro),
                atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (erroSalvar) {
            console.warn("SOS vídeo: erro ao salvar falha inicial:", erroSalvar);
        }

        MOTORISTAPAG_Login_func_pararGravacaoVideoSos();
    }
}

/* =========================================================
   4.2. PARAR E LIMPAR GRAVAÇÃO DO VÍDEO DO SOS
   ========================================================= */

function MOTORISTAPAG_Login_func_pararGravacaoVideoSos() {
    if (
        MOTORISTAPAG_Login_sosVideoRecorder &&
        MOTORISTAPAG_Login_sosVideoRecorder.state === "recording"
    ) {
        try {
            MOTORISTAPAG_Login_sosVideoRecorder.stop();

            /*
             * O onstop cuidará do envio.
             * A limpeza será chamada novamente no finally.
             */
            return;

        } catch (erro) {}
    }

    if (MOTORISTAPAG_Login_sosVideoStreamGravacao) {
        MOTORISTAPAG_Login_sosVideoStreamGravacao
            .getTracks()
            .forEach(function(track) {
                track.stop();
            });
    }

    MOTORISTAPAG_Login_sosVideoRecorder = null;
    MOTORISTAPAG_Login_sosVideoStreamGravacao = null;
    MOTORISTAPAG_Login_sosVideoChunks = [];
    MOTORISTAPAG_Login_sosVideoGravando = false;
}

/* =========================================================
   5. ENCERRAMENTO DO SOS PELO SUPORTE
   5.1. PARAR OUVINTE DE ENCERRAMENTO
   ========================================================= */

function MOTORISTAPAG_Login_func_pararOuvinteEncerramentoSosMotorista() {
    if (MOTORISTAPAG_Login_sosEncerramentoListener) {
        MOTORISTAPAG_Login_sosEncerramentoListener();
        MOTORISTAPAG_Login_sosEncerramentoListener = null;
    }
}

/* =========================================================
   5.2. OUVIR ENCERRAMENTO DO SOS PELO SUPORTE
   ========================================================= */

function MOTORISTAPAG_Login_func_ouvirEncerramentoSosMotorista(alertaId) {
    alertaId = String(alertaId || "").trim();

    if (!alertaId) return;

    MOTORISTAPAG_Login_func_pararOuvinteEncerramentoSosMotorista();

    const db =
        typeof PRIMEIRAPAG_Login_db !== "undefined"
            ? PRIMEIRAPAG_Login_db
            : firebase.firestore();

    MOTORISTAPAG_Login_sosAlertaAtivoId = alertaId;

    MOTORISTAPAG_Login_sosEncerramentoListener = db
        .collection("alertasSeguranca")
        .doc(alertaId)
        .onSnapshot(
            function(doc) {
                if (!doc.exists) return;

                const dados =
                    doc.data() || {};

                const status =
                    String(
                        dados.status || ""
                    )
                        .toLowerCase()
                        .trim();

                const foiEncerrado =
                    status === "finalizado" ||
                    status === "encerrado" ||
                    status === "cancelado" ||
                    dados.sosEncerrado === true;

                if (!foiEncerrado) return;

                if (
                    typeof MOTORISTAPAG_Login_func_pararLocalizacaoTempoRealSosMotorista ===
                    "function"
                ) {
                    MOTORISTAPAG_Login_func_pararLocalizacaoTempoRealSosMotorista();
                }

                MOTORISTAPAG_Login_func_pararOuvinteEncerramentoSosMotorista();

                MOTORISTAPAG_Login_sosAlertaAtivoId = "";
                MOTORISTAPAG_Login_sosEmAndamento = false;

                console.log(
                    "SOS silencioso encerrado pelo suporte:",
                    alertaId
                );
            },

            function(erro) {
                console.warn(
                    "Erro ao ouvir encerramento do SOS:",
                    erro
                );
            }
        );
}

/* =========================================================
   6. ACIONAR SOS SILENCIOSO DO MOTORISTA
   ========================================================= */

async function MOTORISTAPAG_Login_func_acionarSosSilenciosoMotorista() {
    if (MOTORISTAPAG_Login_sosEmAndamento) return;

    const user =
        typeof PRIMEIRAPAG_Login_auth !== "undefined" &&
        PRIMEIRAPAG_Login_auth.currentUser
            ? PRIMEIRAPAG_Login_auth.currentUser
            : firebase.auth().currentUser;

    if (!user) {
        return;
    }

    const agoraMs = Date.now();

    if (
        MOTORISTAPAG_Login_sosUltimoAcionadoMs &&
        agoraMs - MOTORISTAPAG_Login_sosUltimoAcionadoMs <
            5 * 60 * 1000
    ) {
        return;
    }

    MOTORISTAPAG_Login_sosEmAndamento = true;
	
	let sosCriadoComSucesso = false;

    try {
        const db =
            typeof PRIMEIRAPAG_Login_db !== "undefined"
                ? PRIMEIRAPAG_Login_db
                : firebase.firestore();

        const localizacao =
            await MOTORISTAPAG_Login_func_obterLocalizacaoSosMotorista();

        const alertaRef =
            db.collection("alertasSeguranca").doc();

        const chamadoRef =
            db.collection("suporteChamados").doc(alertaRef.id);

        const textoCurto =
            "SOS silencioso acionado pelo motorista.";

        const payloadLocalizacao = localizacao
            ? {
                latitudeAtual: localizacao.latitude,
                longitudeAtual: localizacao.longitude,
                localizacaoAtual: localizacao,
                localizacaoDisponivel: true
            }
            : {
                latitudeAtual: null,
                longitudeAtual: null,
                localizacaoAtual: null,
                localizacaoDisponivel: false
            };

        await alertaRef.set({
            origem: "motorista",
            origemPerfil: "motorista",
            motoristaUid: user.uid,
            motoristaEmail: user.email || "",
            motoristaNome: user.displayName || "",

            tipo: "sos_silencioso_motorista",
            status: "ativo",
            prioridade: "alta",
            silencioso: true,

            suporteNotificado: true,

            videoAoVivoSuporte: false,
            videoStatus: "aguardando_fase_video",

            motoristasProximosNotificados: 0,
            motoristasProximosStatus:
                "aguardando_localizacao_real_dos_motoristas",

            ...payloadLocalizacao,

            atualizadoLocalizacaoEm:
                firebase.firestore.FieldValue.serverTimestamp(),

            criadoEm:
                firebase.firestore.FieldValue.serverTimestamp(),

            atualizadoEm:
                firebase.firestore.FieldValue.serverTimestamp()
        });

        await chamadoRef.set({
            origem: "motorista",
            origemPerfil: "motorista",
            destinoPerfil: "suporte",

            categoria: "suporte_motorista",
            tipo: "chat_suporte_motorista",
            tipoAtendimento: "sos_silencioso",
            titulo: "🚨 SOS silencioso do motorista",

            status: "em_atendimento",
            suporteMediando: true,
            chatDiretoLiberado: false,

            motoristaUid: user.uid,
            motoristaEmail: user.email || "",
            nomeMotorista:
                user.displayName || "Motorista",

            alertaSegurancaId: alertaRef.id,

            ...payloadLocalizacao,

            ultimaMensagem: textoCurto,
            ultimaMensagemTexto: textoCurto,
            ultimaMensagemOrigem: "motorista",
            ultimaMensagemDestino: "suporte",

            naoLidasAdmin: 1,

            criadoEm:
                firebase.firestore.FieldValue.serverTimestamp(),

            atualizadoEm:
                firebase.firestore.FieldValue.serverTimestamp()
        });

        await chamadoRef
            .collection("mensagens")
            .add({
                origem: "motorista",
                origemReal: "motorista",
                origemUid: user.uid,
                exibidoComo:
                    user.displayName || "Motorista",

                destinoReal: "suporte",
                encaminhadoPara: "suporte",

                tipo: "sos_silencioso",
                categoria: "seguranca",

                texto: textoCurto,
                textoOriginal: textoCurto,
                textoExibido: textoCurto,

                alertaSegurancaId: alertaRef.id,

                latitudeAtual:
                    payloadLocalizacao.latitudeAtual,

                longitudeAtual:
                    payloadLocalizacao.longitudeAtual,

                localizacaoAtual:
                    payloadLocalizacao.localizacaoAtual,

                localizacaoDisponivel:
                    payloadLocalizacao.localizacaoDisponivel,

                visivelParaMotorista: true,
                visivelParaPassageiro: false,
                visivelParaSuporte: true,

                visibilidades: {
                    motorista: true,
                    passageiro: false,
                    suporte: true
                },

                lidaAdmin: false,

                criadoEm:
                    firebase.firestore.FieldValue.serverTimestamp()
            });

        /*
         * O SOS principal já foi criado com sucesso.
         * A partir daqui entra a proteção contra
         * novo acionamento imediato.
         */
		 
		sosCriadoComSucesso = true; 
		 
        MOTORISTAPAG_Login_sosUltimoAcionadoMs =
            Date.now();

        MOTORISTAPAG_Login_func_iniciarLocalizacaoTempoRealSosMotorista(
            alertaRef.id,
            chamadoRef.id
        );

        MOTORISTAPAG_Login_func_gravarVideoSosUmMinutoParaSuporte(
            alertaRef.id,
            chamadoRef.id
        );

        MOTORISTAPAG_Login_func_ouvirEncerramentoSosMotorista(
            alertaRef.id
        );

        console.log(
            "SOS silencioso enviado para o suporte:",
            alertaRef.id
        );

    } catch (erro) {

        console.error(
            "Erro ao acionar SOS silencioso do motorista:",
            erro
        );

    } finally {

        if (!sosCriadoComSucesso) {
            MOTORISTAPAG_Login_sosEmAndamento = false;
        }
    }
}

/* =========================================================
   7. EXPORTS PÚBLICOS DO SOS
   ========================================================= */

window.MOTORISTAPAG_Login_func_toqueSosDiscreto =
    MOTORISTAPAG_Login_func_toqueSosDiscreto;

window.MOTORISTAPAG_Login_func_acionarSosSilenciosoMotorista =
    MOTORISTAPAG_Login_func_acionarSosSilenciosoMotorista;

window.MOTORISTAPAG_Login_func_iniciarLocalizacaoTempoRealSosMotorista =
    MOTORISTAPAG_Login_func_iniciarLocalizacaoTempoRealSosMotorista;

window.MOTORISTAPAG_Login_func_pararLocalizacaoTempoRealSosMotorista =
    MOTORISTAPAG_Login_func_pararLocalizacaoTempoRealSosMotorista;

window.MOTORISTAPAG_Login_func_gravarVideoSosUmMinutoParaSuporte =
    MOTORISTAPAG_Login_func_gravarVideoSosUmMinutoParaSuporte;

window.MOTORISTAPAG_Login_func_pararGravacaoVideoSos =
    MOTORISTAPAG_Login_func_pararGravacaoVideoSos;

window.MOTORISTAPAG_Login_func_ouvirEncerramentoSosMotorista =
    MOTORISTAPAG_Login_func_ouvirEncerramentoSosMotorista;

window.MOTORISTAPAG_Login_func_pararOuvinteEncerramentoSosMotorista =
    MOTORISTAPAG_Login_func_pararOuvinteEncerramentoSosMotorista;

/* =========================================================
   TNP MOB — MOTORISTA
   CENTRAL DE SEGURANÇA
   seguranca.js
   ========================================================= */


/* =========================================================
   1. ESTADO DA CENTRAL DE SEGURANÇA
   ========================================================= */

const MOTORISTAPAG_Login_segWhatsappSuporte =
    "5531996645814";


let MOTORISTAPAG_Login_segMediaRecorder =
    null;

let MOTORISTAPAG_Login_segStreamAtual =
    null;

let MOTORISTAPAG_Login_segAcaoEmAndamento =
    false;


let MOTORISTAPAG_Login_segMidiaChunks =
    [];

let MOTORISTAPAG_Login_segTipoGravacao =
    "";


let MOTORISTAPAG_Login_segArquivoBlobAtual =
    null;

let MOTORISTAPAG_Login_segArquivoUrlAtual =
    "";

let MOTORISTAPAG_Login_segArquivoNomeAtual =
    "";

let MOTORISTAPAG_Login_segTimerLimite =
    null;


let MOTORISTAPAG_Login_segTimerCronometro =
    null;

let MOTORISTAPAG_Login_segInicioGravacaoMs =
    0;
	
let MOTORISTAPAG_Login_segModalResolver =
    null;	


/* =========================================================
   2. LIMITES DAS GRAVAÇÕES
   ========================================================= */

const MOTORISTAPAG_Login_segLimiteAudioMs =
    60 * 1000; // 60 segundos

const MOTORISTAPAG_Login_segLimiteVideoMs =
    40 * 1000; // 40 segundos
	
/* =========================================================
   CENTRAL DE SEGURANÇA — VERIFICAR GRAVAÇÃO ATIVA
   ========================================================= */

function MOTORISTAPAG_Login_func_existeGravacaoSegurancaAtiva() {

    return !!(
        MOTORISTAPAG_Login_segMediaRecorder &&
        MOTORISTAPAG_Login_segMediaRecorder.state ===
            "recording"
    );
}	
	
async function MOTORISTAPAG_Login_func_carregarCentralSeguranca() {

    /*
     * Fecha o menu lateral antes de abrir
     * a Central de Segurança.
     */
    if (
        typeof MOTORISTAPAG_Login_func_fecharMenuLateral ===
        "function"
    ) {
        MOTORISTAPAG_Login_func_fecharMenuLateral();
    }


    /*
     * Fecha outras camadas da Home.
     */
    if (
        typeof MOTORISTAPAG_Login_func_fecharModais ===
        "function"
    ) {
        MOTORISTAPAG_Login_func_fecharModais();
    }


    /*
     * Verifica se a Central já foi montada.
     */
    let tela =
        document.getElementById(
            "MOTORISTAPAG_Login_screen_central_seguranca"
        );


    /*
     * Se ainda não existe no DOM,
     * carrega o HTML dentro do MOUNT.
     */
    if (!tela) {

        const area =
            document.getElementById(
                "MOTORISTAPAG_Login_area_seguranca"
            );

        if (!area) {
            console.error(
                "MOUNT da Central de Segurança do motorista não encontrado."
            );

            return;
        }


        try {

            const resposta =
                await fetch(
                    "seguranca/seguranca.html"
                );


            if (!resposta.ok) {
                throw new Error(
                    "HTTP " +
                    resposta.status
                );
            }


            const html =
                await resposta.text();


            area.innerHTML =
                html;


            /*
             * Procura novamente depois da montagem.
             */
            tela =
                document.getElementById(
                    "MOTORISTAPAG_Login_screen_central_seguranca"
                );


        } catch (erro) {

            console.error(
                "Erro ao carregar a Central de Segurança do motorista:",
                erro
            );

            alert(
                "Não foi possível carregar a Central de Segurança."
            );

            return;
        }
    }


    /*
     * Segurança após o carregamento.
     */
    if (!tela) {
        console.error(
            "Central de Segurança foi carregada, mas a tela não foi encontrada."
        );

        return;
    }


    /*
     * Abre a Central.
     */
		
	tela.classList.add(
		"active"
	);

	tela.style.display = "block";

	/*
	 * Registrar a Central de Segurança na pilha global.
	 */
	if (
		typeof TNP_MOB_func_registrarCamadaVoltar === "function"
	) {
		TNP_MOB_func_registrarCamadaVoltar(
			"motorista_central_seguranca",
			MOTORISTAPAG_Login_func_voltarPilhaSegurancaMotorista
		);
	}

	/*
	 * Prepara o estado inicial.
	 */
	MOTORISTAPAG_Login_func_limparGravacaoSeguranca();


    MOTORISTAPAG_Login_func_scrollTopoCentralSeguranca();
}

/* =========================================================
   CENTRAL DE SEGURANÇA — FECHAR MODAL INTERNO
   ========================================================= */

function MOTORISTAPAG_Login_func_fecharModalMensagemSeguranca(
    resultado
) {

    const modal =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_modal_mensagem"
        );

    const btnCancelar =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_modal_btn_cancelar"
        );

    const btnConfirmar =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_modal_btn_confirmar"
        );


    /*
     * Fecha visualmente.
     */
    if (modal) {

        modal.classList.remove(
            "active"
        );

        modal.style.display =
            "none";
    }


    /*
     * Remove ações anteriores dos botões.
     */
    if (btnCancelar) {
        btnCancelar.onclick =
            null;
    }


    if (btnConfirmar) {
        btnConfirmar.onclick =
            null;
    }


    /*
     * Resolve a Promise que abriu
     * o modal.
     */
    const resolver =
        MOTORISTAPAG_Login_segModalResolver;


    MOTORISTAPAG_Login_segModalResolver =
        null;


    if (
        typeof resolver ===
        "function"
    ) {

        resolver(
            resultado === true
        );
    }
}


/* =========================================================
   CENTRAL DE SEGURANÇA — ABRIR MODAL INTERNO
   ========================================================= */

function MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca(
    configuracao
) {

    configuracao =
        configuracao ||
        {};


    const modal =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_modal_mensagem"
        );

    const icone =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_modal_mensagem_icone"
        );

    const titulo =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_modal_mensagem_titulo"
        );

    const texto =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_modal_mensagem_texto"
        );

    const btnCancelar =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_modal_btn_cancelar"
        );

    const btnConfirmar =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_modal_btn_confirmar"
        );


    /*
     * Segurança caso o HTML do modal
     * não esteja disponível.
     */
    if (
        !modal ||
        !btnConfirmar
    ) {

        console.error(
            "Modal interno da Central de Segurança não encontrado."
        );


        return Promise.resolve(
            false
        );
    }


    /*
     * Se já existir uma Promise aguardando
     * resposta, encerra a anterior como cancelada.
     */
    if (
        typeof MOTORISTAPAG_Login_segModalResolver ===
        "function"
    ) {

        const resolverAnterior =
            MOTORISTAPAG_Login_segModalResolver;


        MOTORISTAPAG_Login_segModalResolver =
            null;


        resolverAnterior(
            false
        );
    }


    /*
     * Conteúdo.
     */
    if (icone) {

        icone.innerText =
            configuracao.icone ||
            "🛡️";
    }


    if (titulo) {

        titulo.innerText =
            configuracao.titulo ||
            "Central de Segurança";
    }


    if (texto) {

        texto.innerText =
            configuracao.texto ||
            "";
    }


    /*
     * =====================================================
     * BOTÃO CANCELAR
     * =====================================================
     */

    if (
        btnCancelar
    ) {

        if (
            configuracao.textoCancelar
        ) {

            btnCancelar.innerText =
                configuracao.textoCancelar;

            btnCancelar.style.display =
                "block";

        } else {

            btnCancelar.style.display =
                "none";
        }
    }


    /*
     * =====================================================
     * BOTÃO CONFIRMAR
     * =====================================================
     */

    btnConfirmar.innerText =
        configuracao.textoConfirmar ||
        "OK";


    btnConfirmar.style.display =
        "block";


    /*
     * Abre o modal.
     */
    modal.classList.add(
        "active"
    );

    modal.style.display =
        "flex";


    /*
     * =====================================================
     * RETORNO
     * =====================================================
     *
     * Sempre retorna uma Promise:
     *
     * true  = confirmou
     * false = cancelou
     */

    return new Promise(
        function (resolver) {

            MOTORISTAPAG_Login_segModalResolver =
                resolver;


            /*
             * CANCELAR
             */
            if (btnCancelar) {

                btnCancelar.onclick =
                    function () {

                        if (
                            typeof configuracao.aoCancelar ===
                            "function"
                        ) {

                            try {

                                configuracao.aoCancelar();

                            } catch (erro) {

                                console.error(
                                    "Erro na ação de cancelamento do modal de segurança:",
                                    erro
                                );
                            }
                        }


                        MOTORISTAPAG_Login_func_fecharModalMensagemSeguranca(
                            false
                        );
                    };
            }


            /*
             * CONFIRMAR
             */
            btnConfirmar.onclick =
                function () {

                    /*
                     * Fecha primeiro.
                     */
                    MOTORISTAPAG_Login_func_fecharModalMensagemSeguranca(
                        true
                    );


                    /*
                     * Depois executa eventual
                     * ação adicional.
                     */
                    if (
                        typeof configuracao.aoConfirmar ===
                        "function"
                    ) {

                        try {

                            configuracao.aoConfirmar();

                        } catch (erro) {

                            console.error(
                                "Erro na ação de confirmação do modal de segurança:",
                                erro
                            );
                        }
                    }
                };
        }
    );
}

/* =========================================================
   CENTRAL DE SEGURANÇA — FECHAR CENTRAL
   ========================================================= */

/* =========================================================
   CENTRAL DE SEGURANÇA — FECHAMENTO COMPLETO

   - Confirma saída quando houver gravação
   - Impede finalização tardia do arquivo ao sair
   - Desliga câmera e microfone
   - Limpa mídias, prévias e cronômetros
   - Fecha o modal interno
   - Preserva HTML montado e Firebase
   ========================================================= */

async function MOTORISTAPAG_Login_func_fecharCentralSeguranca() {

    const tela = document.getElementById(
        "MOTORISTAPAG_Login_screen_central_seguranca"
    );

    const gravador = MOTORISTAPAG_Login_segMediaRecorder;

    // 1. Pedir confirmação quando estiver gravando.
    if (gravador && gravador.state === "recording") {

        const confirmar =
            await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
                icone: "⚠️",
                titulo: "Gravação em andamento",
                texto:
                    "Existe uma gravação de segurança em andamento.\n\n" +
                    "Deseja parar a gravação e sair da Central de Segurança?",
                textoCancelar: "Cancelar",
                textoConfirmar: "Sair"
            });

        if (!confirmar) {
            return false;
        }
    }

    // 2. Encerrar a gravação sem criar um novo arquivo
    //    depois que o motorista decidiu sair.
    const gravadorAtual = MOTORISTAPAG_Login_segMediaRecorder;

    if (gravadorAtual) {

        gravadorAtual.onstop = null;

        if (gravadorAtual.state !== "inactive") {
            try {
                gravadorAtual.stop();
            } catch (erro) {
                console.warn(
                    "Não foi possível parar a gravação:",
                    erro
                );
            }
        }
    }

    // 3. Garantir câmera e microfone desligados.
    MOTORISTAPAG_Login_func_pararStreamSeguranca();

    // 4. Encerrar toda a mídia temporária.
    MOTORISTAPAG_Login_func_limparGravacaoSeguranca();

    // 5. Encerrar qualquer mensagem interna pendente.
    MOTORISTAPAG_Login_func_fecharModalMensagemSeguranca(false);

		
	// 6. Fechar somente a Central de Segurança.
	if (tela) {
		tela.classList.remove("active");
		tela.style.display = "none";
	}

	/*
	 * Remover a Central da pilha somente
	 * depois que o fechamento foi confirmado.
	 */
	if (
		typeof TNP_MOB_func_removerCamadaVoltar === "function"
	) {
		TNP_MOB_func_removerCamadaVoltar(
			"motorista_central_seguranca"
		);
	}

	return true;

}

/* =========================================================
   CENTRAL DE SEGURANÇA — VOLTAR ROLAGEM AO TOPO
   ========================================================= */

function MOTORISTAPAG_Login_func_scrollTopoCentralSeguranca() {

    const conteudo =
        document.querySelector(
            "#MOTORISTAPAG_Login_screen_central_seguranca " +
            ".MOTORISTAPAG_Login_seg_conteudo"
        );


    const area =
        document.getElementById(
            "PRIMEIRAPAG_Login_content_area"
        );


    /*
     * Rolagem interna da Central.
     */
    if (conteudo) {
        conteudo.scrollTop = 0;
    }


    /*
     * Segurança caso a área principal
     * da aplicação também tenha rolado.
     */
    if (area) {
        area.scrollTop = 0;
    }
}

/* =========================================================
   CENTRAL DE SEGURANÇA — EMERGÊNCIA 190
   ========================================================= */

function MOTORISTAPAG_Login_func_ligarEmergencia190() {

    window.location.href =
        "tel:190";
}

/* =========================================================
   CENTRAL DE SEGURANÇA — GERAR PROTOCOLO DO SUPORTE
   ========================================================= */

function MOTORISTAPAG_Login_func_gerarProtocoloSuporteSeguranca() {

    const agora =
        new Date();


    const ano =
        String(
            agora.getFullYear()
        ).slice(
            -2
        );


    const mes =
        String(
            agora.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const dia =
        String(
            agora.getDate()
        ).padStart(
            2,
            "0"
        );


    const codigo =
        Math.random()
            .toString(36)
            .substring(
                2,
                8
            )
            .toUpperCase();


    return (
        "TNP-" +
        ano +
        mes +
        dia +
        "-" +
        codigo
    );
}

/* =========================================================
   CENTRAL DE SEGURANÇA — VERIFICAR LIMITE DE CHAMADOS
   ========================================================= */

async function MOTORISTAPAG_Login_func_podeAbrirChamadoSeguranca(
    motoristaUid
) {

    /*
     * Mostra o aviso de limite usando
     * o modal interno da Segurança.
     *
     * Como existe apenas o botão OK,
     * ele ficará centralizado.
     */
    function mostrarLimiteChamados() {

        MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone: "💬",

            titulo:
                "Limite de chamados",

            texto:
                "Você já possui 3 chamados abertos com o suporte.\n\n" +
                "Finalize ou aguarde a conclusão de um chamado " +
                "antes de abrir outro.",

            textoConfirmar:
                "OK",

            aoConfirmar:
                function () {

                    if (
                        typeof MOTORISTAPAG_Login_func_abrirHistoricoMensagensAjudaMotorista ===
                        "function"
                    ) {
                        MOTORISTAPAG_Login_func_abrirHistoricoMensagensAjudaMotorista();
                    }
                }
        });
    }


    /*
     * Usa o mesmo contador geral da Central de Ajuda.
     *
     * Segurança, suporte e outros atendimentos
     * compartilham o limite de 3 chamados abertos.
     */
    if (
        typeof TNP_AJUDA_func_contarChamadosAbertosPerfil ===
        "function"
    ) {

        const totalChamadosAbertos =
            await TNP_AJUDA_func_contarChamadosAbertosPerfil(
                "motorista",
                motoristaUid
            );


        if (
            totalChamadosAbertos >=
            3
        ) {

            mostrarLimiteChamados();

            return false;
        }


        return true;
    }


    /*
     * Reserva caso o contador geral
     * ainda não esteja disponível.
     */
    const db =
        typeof PRIMEIRAPAG_Login_db !==
        "undefined"
            ? PRIMEIRAPAG_Login_db
            : firebase.firestore();


    const statusFechados = [
        "finalizado",
        "fechado",
        "encerrado",
        "resolvido",
        "cancelado"
    ];


    const snap =
        await db
            .collection(
                "suporteChamados"
            )
            .where(
                "motoristaUid",
                "==",
                motoristaUid
            )
            .get();


    let totalChamadosAbertos =
        0;


    snap.forEach(
        function (doc) {

            const chamado =
                doc.data() ||
                {};


            const status =
                String(
                    chamado.status ||
                    ""
                )
                    .toLowerCase()
                    .trim();


            if (
                statusFechados.indexOf(
                    status
                ) ===
                -1
            ) {
                totalChamadosAbertos++;
            }
        }
    );


    if (
        totalChamadosAbertos >=
        3
    ) {

        mostrarLimiteChamados();

        return false;
    }


    return true;
}

/* =========================================================
   CENTRAL DE SEGURANÇA — FALAR COM O SUPORTE
   ========================================================= */

async function MOTORISTAPAG_Login_func_falarSuporteSeguranca(
    tipo
) {

    if (
        MOTORISTAPAG_Login_segAcaoEmAndamento
    ) {
        return;
    }


    const user =
        typeof PRIMEIRAPAG_Login_auth !== "undefined" &&
        PRIMEIRAPAG_Login_auth.currentUser

            ? PRIMEIRAPAG_Login_auth.currentUser

            : firebase.auth().currentUser;


    /*
     * SESSÃO
     */
    if (!user) {

        await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone: "🔒",

            titulo:
                "Login necessário",

            texto:
                "Você precisa estar logado para falar com o suporte.",

            textoConfirmar:
                "OK"
        });

        return;
    }


    /*
     * CONFIRMAÇÃO
     */
    const confirmar =
        await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone: "💬",

            titulo:
                "Falar com o suporte",

            texto:
                "Deseja abrir um chamado com o suporte TNP MOB?\n\n" +
                "Sua solicitação será enviada para a Central de Ajuda dentro do aplicativo.",

            textoCancelar:
                "Cancelar",

            textoConfirmar:
                "Abrir chamado"
        });


    if (!confirmar) {
        return;
    }


    /*
     * Verifica o limite geral de chamados.
     */
    const podeAbrirChamado =
        await MOTORISTAPAG_Login_func_podeAbrirChamadoSeguranca(
            user.uid
        );


    if (!podeAbrirChamado) {
        return;
    }


    MOTORISTAPAG_Login_segAcaoEmAndamento =
        true;


    try {

        const db =
            typeof PRIMEIRAPAG_Login_db !==
            "undefined"

                ? PRIMEIRAPAG_Login_db

                : firebase.firestore();


        const chamadoRef =
            db
                .collection(
                    "suporteChamados"
                )
                .doc();


        const protocolo =
            MOTORISTAPAG_Login_func_gerarProtocoloSuporteSeguranca();


        const tipoAtendimento =
            tipo ||
            "Segurança";


        const textoCurto =
            "Pedido de ajuda aberto pela Central de Segurança do motorista.\n\n" +
            "Tipo: " +
            tipoAtendimento;


        /*
         * ==================================================
         * CHAMADO
         *
         * CONTRATO DO FIREBASE PRESERVADO.
         * ==================================================
         */

        await chamadoRef.set({

            protocolo:
                protocolo,

            origem:
                "motorista",

            origemPerfil:
                "motorista",

            destinoPerfil:
                "suporte",

            categoria:
                "suporte_motorista",

            tipo:
                "chat_suporte_motorista",

            tipoAtendimento:
                "seguranca",

            titulo:
                "Pedido de ajuda - Central de Segurança",

            status:
                "em_atendimento",

            suporteMediando:
                true,

            chatDiretoLiberado:
                false,

            motoristaUid:
                user.uid,

            motoristaEmail:
                user.email ||
                "",

            ultimaMensagem:
                textoCurto,

            ultimaMensagemTexto:
                textoCurto,

            ultimaMensagemOrigem:
                "motorista",

            ultimaMensagemDestino:
                "suporte",

            criadoEm:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            atualizadoEm:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()
        });


        /*
         * ==================================================
         * PRIMEIRA MENSAGEM DO CHAMADO
         * ==================================================
         */

        await chamadoRef
            .collection(
                "mensagens"
            )
            .add({

                origem:
                    "motorista",

                origemReal:
                    "motorista",

                origemUid:
                    user.uid,

                exibidoComo:
                    "Motorista",

                destinoReal:
                    "suporte",

                encaminhadoPara:
                    "suporte",

                tipo:
                    "texto",

                categoria:
                    "seguranca",

                texto:
                    textoCurto,

                textoOriginal:
                    textoCurto,

                textoExibido:
                    textoCurto,

                visivelParaMotorista:
                    true,

                visivelParaPassageiro:
                    false,

                visivelParaSuporte:
                    true,

                visibilidades: {
                    motorista:
                        true,

                    passageiro:
                        false,

                    suporte:
                        true
                },

                lidaAdmin:
                    false,

                criadoEm:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()
            });


        /*
         * SUCESSO
         *
         * Apenas um botão:
         * OK centralizado.
         */
        await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone:
                "✅",

            titulo:
                "Chamado enviado",

            texto:
                "Seu chamado foi enviado ao suporte TNP MOB.\n\n" +
                "Protocolo: " +
                protocolo,

            textoConfirmar:
                "OK"
        });


        /*
         * Fecha a Central.
         *
         * Essa função será ajustada para retornar
         * true quando realmente conseguiu sair.
         */
        const centralFechada =
            await MOTORISTAPAG_Login_func_fecharCentralSeguranca();


        if (
            centralFechada ===
            false
        ) {
            return;
        }


        /*
         * Abre a tela de mensagens usando
         * o fluxo completo do motorista.
         */
        if (
            typeof MOTORISTAPAG_Login_func_abrirHistoricoMensagensAjudaMotorista ===
            "function"
        ) {

            MOTORISTAPAG_Login_func_abrirHistoricoMensagensAjudaMotorista();

        } else if (
            typeof MOTORISTAPAG_Login_func_carregarTelaMensagensMotorista ===
            "function"
        ) {

            MOTORISTAPAG_Login_func_carregarTelaMensagensMotorista();

        } else {

            await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
                icone:
                    "⚠️",

                titulo:
                    "Chamado criado",

                texto:
                    "O chamado foi criado com sucesso, mas a tela de mensagens do motorista não foi encontrada.",

                textoConfirmar:
                    "OK"
            });
        }


    } catch (erro) {

        console.error(
            "Erro ao abrir chamado de segurança do motorista:",
            erro
        );


        await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone:
                "⚠️",

            titulo:
                "Não foi possível enviar",

            texto:
                "Não foi possível abrir o chamado no suporte. Tente novamente.",

            textoConfirmar:
                "OK"
        });


    } finally {

        MOTORISTAPAG_Login_segAcaoEmAndamento =
            false;
    }
}

/* =========================================================
   CENTRAL DE SEGURANÇA — COMPARTILHAR VIAGEM
   ========================================================= */

function MOTORISTAPAG_Login_func_compartilharViagemSeguranca() {

    /*
     * Função provisória.
     *
     * O compartilhamento real será ligado quando
     * a corrida do motorista estiver em andamento.
     */
    MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
        icone:
            "📤",

        titulo:
            "Compartilhar viagem",

        texto:
            "O compartilhamento da viagem será disponibilizado quando a corrida estiver em andamento.",

        textoConfirmar:
            "OK"
    });
}

/* =========================================================
   CENTRAL DE SEGURANÇA — PARAR CÂMERA / MICROFONE
   ========================================================= */

function MOTORISTAPAG_Login_func_pararStreamSeguranca() {

    if (
        MOTORISTAPAG_Login_segStreamAtual
    ) {

        MOTORISTAPAG_Login_segStreamAtual
            .getTracks()
            .forEach(
                function (track) {

                    track.stop();
                }
            );
    }


    MOTORISTAPAG_Login_segStreamAtual =
        null;
}

/* =========================================================
   CENTRAL DE SEGURANÇA — LIMPAR GRAVAÇÃO / RESULTADO
   ========================================================= */

function MOTORISTAPAG_Login_func_limparGravacaoSeguranca() {

    const box =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_gravacao_box"
        );

    const status =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_gravacao_status"
        );

    const titulo =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_gravacao_titulo"
        );

    const btnParar =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_btn_parar_gravacao"
        );


    /*
     * ÁUDIO
     */
    const audioArea =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_audio_area"
        );

    const audioPreview =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_audio_preview"
        );


    /*
     * VÍDEO
     */
    const videoPreview =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_video_preview"
        );

    const videoResultado =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_video_resultado"
        );


    /*
     * FOTO
     */
    const fotoResultado =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_foto_resultado"
        );


    /*
     * AÇÕES DO ARQUIVO
     */
    const acoesArquivo =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_acoes_arquivo"
        );


    /*
     * Desliga câmera e microfone.
     */
    MOTORISTAPAG_Login_func_pararStreamSeguranca();


    /*
     * Para o limite automático da gravação.
     */
    clearTimeout(
        MOTORISTAPAG_Login_segTimerLimite
    );

    MOTORISTAPAG_Login_segTimerLimite =
        null;


    /*
     * Para o cronômetro.
     */
    MOTORISTAPAG_Login_func_pararCronometroSeguranca();

    MOTORISTAPAG_Login_segInicioGravacaoMs =
        0;


    /*
     * Libera a URL temporária anterior.
     */
    if (
        MOTORISTAPAG_Login_segArquivoUrlAtual
    ) {

        URL.revokeObjectURL(
            MOTORISTAPAG_Login_segArquivoUrlAtual
        );
    }


    /*
     * Limpa o estado da gravação.
     */
    MOTORISTAPAG_Login_segMediaRecorder =
        null;

    MOTORISTAPAG_Login_segMidiaChunks =
        [];

    MOTORISTAPAG_Login_segTipoGravacao =
        "";

    MOTORISTAPAG_Login_segArquivoBlobAtual =
        null;

    MOTORISTAPAG_Login_segArquivoUrlAtual =
        "";

    MOTORISTAPAG_Login_segArquivoNomeAtual =
        "";


    /*
     * IMPORTANTE:
     *
     * Não alteramos aqui:
     *
     * MOTORISTAPAG_Login_segAcaoEmAndamento
     *
     * Essa trava pertence à função que iniciou
     * a operação e deve ser liberada no finally.
     */


    /*
     * Estado visual principal.
     */
    if (box) {
        box.style.display =
            "none";
    }


    if (status) {
        status.innerText =
            "Aguardando...";
    }


    if (titulo) {
        titulo.innerText =
            "Gravação ativa";
    }


    /*
     * Botão de parar.
     */
    if (btnParar) {

        btnParar.disabled =
            false;

        btnParar.innerText =
            "Parar gravação";

        btnParar.style.display =
            "block";
    }


    /*
     * Ações do arquivo.
     */
    if (acoesArquivo) {
        acoesArquivo.style.display =
            "none";
    }


    /*
     * ÁUDIO
     */
    if (audioPreview) {

        try {
            audioPreview.pause();
        } catch (erro) {
            // Sem ação necessária.
        }

        audioPreview.removeAttribute(
            "src"
        );

        audioPreview.style.display =
            "none";
    }


    if (audioArea) {
        audioArea.style.display =
            "none";
    }


    /*
     * VÍDEO AO VIVO
     */
    if (videoPreview) {

        videoPreview.srcObject =
            null;

        videoPreview.style.display =
            "none";
    }


    /*
     * VÍDEO FINALIZADO
     */
    if (videoResultado) {

        try {
            videoResultado.pause();
        } catch (erro) {
            // Sem ação necessária.
        }

        videoResultado.removeAttribute(
            "src"
        );

        videoResultado.style.display =
            "none";
    }


    /*
     * FOTO
     */
    if (fotoResultado) {

        fotoResultado.removeAttribute(
            "src"
        );

        fotoResultado.style.display =
            "none";
    }
}

/* =========================================================
   CENTRAL DE SEGURANÇA — CRONÔMETRO DA GRAVAÇÃO
   ========================================================= */

function MOTORISTAPAG_Login_func_formatarTempoSeguranca(
    totalSegundos
) {

    const minutos =
        Math.floor(
            totalSegundos / 60
        );

    const segundos =
        totalSegundos % 60;


    return (
        String(minutos).padStart(
            2,
            "0"
        ) +
        ":" +
        String(segundos).padStart(
            2,
            "0"
        )
    );
}


/* =========================================================
   ATUALIZAR CRONÔMETRO
   ========================================================= */

function MOTORISTAPAG_Login_func_atualizarCronometroSeguranca() {

    const cronometro =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_cronometro"
        );


    if (
        !cronometro ||
        !MOTORISTAPAG_Login_segInicioGravacaoMs
    ) {
        return;
    }


    const segundos =
        Math.floor(
            (
                Date.now() -
                MOTORISTAPAG_Login_segInicioGravacaoMs
            ) /
            1000
        );


    cronometro.innerText =
        MOTORISTAPAG_Login_func_formatarTempoSeguranca(
            segundos
        );
}


/* =========================================================
   INICIAR CRONÔMETRO
   ========================================================= */

function MOTORISTAPAG_Login_func_iniciarCronometroSeguranca() {

    clearInterval(
        MOTORISTAPAG_Login_segTimerCronometro
    );


    MOTORISTAPAG_Login_segInicioGravacaoMs =
        Date.now();


    /*
     * Mostra 00:00 imediatamente,
     * sem esperar o primeiro segundo.
     */
    MOTORISTAPAG_Login_func_atualizarCronometroSeguranca();


    MOTORISTAPAG_Login_segTimerCronometro =
        setInterval(
            function () {

                MOTORISTAPAG_Login_func_atualizarCronometroSeguranca();

            },
            1000
        );
}


/* =========================================================
   PARAR CRONÔMETRO
   ========================================================= */

function MOTORISTAPAG_Login_func_pararCronometroSeguranca() {

    clearInterval(
        MOTORISTAPAG_Login_segTimerCronometro
    );


    MOTORISTAPAG_Login_segTimerCronometro =
        null;
}

/* =========================================================
   CENTRAL DE SEGURANÇA — CENTRALIZAR ÁREA DA MÍDIA
   ========================================================= */

function MOTORISTAPAG_Login_func_centralizarBoxGravacaoSeguranca() {

    const box =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_gravacao_box"
        );


    if (!box) {
        return;
    }


    /*
     * Aguarda a área aparecer e então
     * leva o resultado para o centro da tela.
     */
    setTimeout(
        function () {

            try {

                box.scrollIntoView({
                    behavior:
                        "smooth",

                    block:
                        "center"
                });

            } catch (erro) {

                /*
                 * Reserva para navegadores
                 * que não aceitam as opções.
                 */
                box.scrollIntoView();
            }
        },
        180
    );
}

/* =========================================================
   CENTRAL DE SEGURANÇA — VERIFICAR SUPORTE À GRAVAÇÃO
   ========================================================= */

function MOTORISTAPAG_Login_func_navegadorSuportaGravacaoSeguranca() {

    /*
     * Câmera / microfone não disponíveis.
     */
    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone:
                "⚠️",

            titulo:
                "Recurso não disponível",

            texto:
                "Seu navegador ou aparelho não permite acessar a câmera ou o microfone nesta tela.",

            textoConfirmar:
                "OK"
        });

        return false;
    }


    /*
     * MediaRecorder não disponível.
     */
    if (
        typeof MediaRecorder ===
        "undefined"
    ) {

        MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone:
                "⚠️",

            titulo:
                "Gravação não suportada",

            texto:
                "Seu navegador não suporta gravação de áudio ou vídeo.",

            textoConfirmar:
                "OK"
        });

        return false;
    }


    return true;
}

/* =========================================================
   CENTRAL DE SEGURANÇA — INICIAR GRAVAÇÃO DE ÁUDIO
   ========================================================= */

/* =========================================================
   CENTRAL DE SEGURANÇA — INICIAR ÁUDIO

   - Confirma antes de solicitar o microfone
   - Impede gravação duplicada
   - Protege saída durante solicitação de permissão
   - Desliga stream recebido após fechamento
   - Preserva o fluxo normal de gravação
   ========================================================= */

async function MOTORISTAPAG_Login_func_iniciarAudioSeguranca() {

    const tela = document.getElementById(
        "MOTORISTAPAG_Login_screen_central_seguranca"
    );

    if (
        !tela ||
        !tela.classList.contains("active")
    ) {
        return;
    }

    if (
        MOTORISTAPAG_Login_func_existeGravacaoSegurancaAtiva()
    ) {

        await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone: "⚠️",
            titulo: "Gravação em andamento",
            texto:
                "Já existe uma gravação de segurança em andamento.\n\n" +
                "Pare a gravação atual antes de iniciar outra.",
            textoConfirmar: "OK"
        });

        return;
    }

    if (MOTORISTAPAG_Login_segAcaoEmAndamento) {
        return;
    }

    MOTORISTAPAG_Login_segAcaoEmAndamento = true;

    let stream = null;

    try {

        if (
            !MOTORISTAPAG_Login_func_navegadorSuportaGravacaoSeguranca()
        ) {
            return;
        }

        const confirmar =
            await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
                icone: "🎙️",
                titulo: "Gravar áudio de segurança",
                texto:
                    "A gravação de áudio será iniciada com sua permissão.\n\n" +
                    "O TNP MOB não envia nem armazena automaticamente esta gravação.\n\n" +
                    "O arquivo ficará temporariamente no aparelho até você baixar, compartilhar ou descartar.\n\n" +
                    "Use apenas em situações de segurança.",
                textoCancelar: "Cancelar",
                textoConfirmar: "Iniciar"
            });

        if (!confirmar) {
            return;
        }

        // A Central pode ter sido fechada durante a confirmação.
        if (!tela.classList.contains("active")) {
            return;
        }

        MOTORISTAPAG_Login_func_limparGravacaoSeguranca();

        // Solicitar o microfone.
        stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
        });

        /*
         * PROTEÇÃO:
         * A permissão pode ser concedida depois
         * que o motorista fechou a Central.
         */
        if (!tela.classList.contains("active")) {

            stream.getTracks().forEach(function(track) {
                track.stop();
            });

            stream = null;
            return;
        }

        MOTORISTAPAG_Login_segTipoGravacao = "audio";

        MOTORISTAPAG_Login_func_iniciarGravacaoSeguranca(
            stream,
            "audio"
        );

        // O controlador da gravação assume o stream.
        stream = null;

    } catch (erro) {

        // Nunca deixar um stream obtido sem encerramento.
        if (stream) {
            stream.getTracks().forEach(function(track) {
                track.stop();
            });
            stream = null;
        }

        console.error(
            "Erro ao iniciar áudio de segurança:",
            erro
        );

        // Não abrir aviso por cima de uma Central fechada.
        if (tela.classList.contains("active")) {

            await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
                icone: "🎙️",
                titulo: "Microfone não disponível",
                texto:
                    "Não foi possível acessar o microfone.\n\n" +
                    "Verifique as permissões do aparelho e tente novamente.",
                textoConfirmar: "OK"
            });
        }

    } finally {

        MOTORISTAPAG_Login_segAcaoEmAndamento = false;
    }
}

/* =========================================================
   CENTRAL DE SEGURANÇA — INICIAR GRAVAÇÃO DE VÍDEO
   ========================================================= */

/* =========================================================
   CENTRAL DE SEGURANÇA — INICIAR VÍDEO

   - Confirma antes de solicitar câmera/microfone
   - Impede gravação duplicada
   - Protege saída durante solicitação de permissão
   - Desliga stream recebido após fechamento
   - Preserva câmera frontal e gravação normal
   ========================================================= */

async function MOTORISTAPAG_Login_func_iniciarVideoSeguranca() {

    const tela = document.getElementById(
        "MOTORISTAPAG_Login_screen_central_seguranca"
    );

    if (
        !tela ||
        !tela.classList.contains("active")
    ) {
        return;
    }

    if (
        MOTORISTAPAG_Login_func_existeGravacaoSegurancaAtiva()
    ) {

        await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone: "⚠️",
            titulo: "Gravação em andamento",
            texto:
                "Já existe uma gravação de segurança em andamento.\n\n" +
                "Pare a gravação atual antes de iniciar outra.",
            textoConfirmar: "OK"
        });

        return;
    }

    if (MOTORISTAPAG_Login_segAcaoEmAndamento) {
        return;
    }

    MOTORISTAPAG_Login_segAcaoEmAndamento = true;

    let stream = null;

    try {

        if (
            !MOTORISTAPAG_Login_func_navegadorSuportaGravacaoSeguranca()
        ) {
            return;
        }

        const confirmar =
            await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
                icone: "📹",
                titulo: "Gravar vídeo de segurança",
                texto:
                    "A gravação de vídeo será iniciada com sua permissão.\n\n" +
                    "O TNP MOB não envia nem armazena automaticamente esta gravação.\n\n" +
                    "O arquivo ficará temporariamente no aparelho até você baixar, compartilhar ou descartar.\n\n" +
                    "Use apenas em situações de segurança.",
                textoCancelar: "Cancelar",
                textoConfirmar: "Iniciar"
            });

        if (!confirmar) {
            return;
        }

        // A Central pode ter sido fechada durante a confirmação.
        if (!tela.classList.contains("active")) {
            return;
        }

        MOTORISTAPAG_Login_func_limparGravacaoSeguranca();

        // Solicitar câmera frontal e microfone.
        stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
                facingMode: "user"
            }
        });

        /*
         * PROTEÇÃO:
         * A câmera e o microfone podem ser liberados
         * depois que a Central já foi fechada.
         */
        if (!tela.classList.contains("active")) {

            stream.getTracks().forEach(function(track) {
                track.stop();
            });

            stream = null;
            return;
        }

        MOTORISTAPAG_Login_segTipoGravacao = "video";

        MOTORISTAPAG_Login_func_iniciarGravacaoSeguranca(
            stream,
            "video"
        );

        // O controlador da gravação assume o stream.
        stream = null;

    } catch (erro) {

        // Nunca deixar câmera/microfone ativos após erro.
        if (stream) {
            stream.getTracks().forEach(function(track) {
                track.stop();
            });
            stream = null;
        }

        console.error(
            "Erro ao iniciar vídeo de segurança:",
            erro
        );

        // Não abrir aviso por cima de uma Central fechada.
        if (tela.classList.contains("active")) {

            await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
                icone: "📹",
                titulo: "Câmera não disponível",
                texto:
                    "Não foi possível acessar a câmera ou o microfone.\n\n" +
                    "Verifique as permissões do aparelho e tente novamente.",
                textoConfirmar: "OK"
            });
        }

    } finally {

        MOTORISTAPAG_Login_segAcaoEmAndamento = false;
    }
}

/* =========================================================
   CENTRAL DE SEGURANÇA — INICIAR GRAVAÇÃO
   ========================================================= */

function MOTORISTAPAG_Login_func_iniciarGravacaoSeguranca(
    stream,
    tipo
) {

    const box =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_gravacao_box"
        );

    const titulo =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_gravacao_titulo"
        );

    const status =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_gravacao_status"
        );

    const audioArea =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_audio_area"
        );

    const audioPreview =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_audio_preview"
        );

    const videoPreview =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_video_preview"
        );

    const videoResultado =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_video_resultado"
        );

    const fotoResultado =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_foto_resultado"
        );

    const acoesArquivo =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_acoes_arquivo"
        );

    const btnParar =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_btn_parar_gravacao"
        );


    /*
     * Guarda o stream atual.
     */
    MOTORISTAPAG_Login_segStreamAtual =
        stream;

    MOTORISTAPAG_Login_segMidiaChunks =
        [];


    /*
     * Abre a área principal da gravação.
     */
    if (box) {
        box.style.display =
            "block";
    }


    /*
     * Enquanto grava, ainda não existem
     * ações de arquivo finalizado.
     */
    if (acoesArquivo) {
        acoesArquivo.style.display =
            "none";
    }


    /*
     * Botão de parar.
     */
    if (btnParar) {

        btnParar.disabled =
            false;

        btnParar.innerText =
            "Parar gravação";

        btnParar.style.display =
            "block";
    }


    /*
     * Esconde resultados anteriores.
     */
    if (videoResultado) {

        videoResultado.removeAttribute(
            "src"
        );

        videoResultado.style.display =
            "none";
    }


    if (fotoResultado) {

        fotoResultado.removeAttribute(
            "src"
        );

        fotoResultado.style.display =
            "none";
    }


    /*
     * =====================================================
     * VISUAL DA GRAVAÇÃO
     * =====================================================
     */

    if (
        tipo ===
        "video"
    ) {

        /*
         * Vídeo:
         * mostra a câmera ao vivo.
         */
        if (audioArea) {
            audioArea.style.display =
                "none";
        }


        if (audioPreview) {

            audioPreview.removeAttribute(
                "src"
            );

            audioPreview.style.display =
                "none";
        }


        if (videoPreview) {

            videoPreview.srcObject =
                stream;

            videoPreview.style.display =
                "block";


            /*
             * Alguns navegadores precisam
             * de uma tentativa explícita de play.
             */
            const tentativaPlay =
                videoPreview.play();


            if (
                tentativaPlay &&
                typeof tentativaPlay.catch ===
                "function"
            ) {
                tentativaPlay.catch(
                    function () {
                        // Sem ação necessária.
                    }
                );
            }
        }

    } else {

        /*
         * Áudio:
         * mostra a nova área visual grande.
         *
         * O player só aparecerá depois
         * que o arquivo estiver finalizado.
         */
        if (videoPreview) {

            videoPreview.srcObject =
                null;

            videoPreview.style.display =
                "none";
        }


        if (audioArea) {
            audioArea.style.display =
                "flex";
        }


        if (audioPreview) {

            audioPreview.removeAttribute(
                "src"
            );

            audioPreview.style.display =
                "none";
        }
    }


    /*
     * Título + cronômetro.
     */
    if (titulo) {

        titulo.innerHTML =
            tipo === "video"

                ? '📹 Modo segurança ativo ' +
                  '<span id="MOTORISTAPAG_Login_seg_cronometro" ' +
                  'class="MOTORISTAPAG_Login_seg_cronometro">00:00</span>'

                : '🎙️ Modo segurança ativo ' +
                  '<span id="MOTORISTAPAG_Login_seg_cronometro" ' +
                  'class="MOTORISTAPAG_Login_seg_cronometro">00:00</span>';
    }


    /*
     * Texto de estado.
     */
    if (status) {

        status.innerText =
            tipo === "video"

                ? "Gravando vídeo de segurança. " +
                  "A câmera está ativa com sua permissão. " +
                  "Toque em PARAR GRAVAÇÃO quando terminar."

                : "Gravando áudio de segurança. " +
                  "O microfone está ativo com sua permissão. " +
                  "Toque em PARAR GRAVAÇÃO quando terminar.";
    }


    /*
     * Inicia cronômetro e leva
     * a gravação para a área visível.
     */
    MOTORISTAPAG_Login_func_iniciarCronometroSeguranca();

    MOTORISTAPAG_Login_func_centralizarBoxGravacaoSeguranca();


    /*
     * =====================================================
     * MEDIA RECORDER
     * =====================================================
     */

    MOTORISTAPAG_Login_segMediaRecorder =
        new MediaRecorder(
            stream
        );


    MOTORISTAPAG_Login_segMediaRecorder.ondataavailable =
        function (event) {

            if (
                event.data &&
                event.data.size > 0
            ) {

                MOTORISTAPAG_Login_segMidiaChunks.push(
                    event.data
                );
            }
        };


    MOTORISTAPAG_Login_segMediaRecorder.onstop =
        function () {

            MOTORISTAPAG_Login_func_finalizarArquivoSeguranca(
                tipo
            );
        };


    MOTORISTAPAG_Login_segMediaRecorder.start();


    /*
     * =====================================================
     * LIMITE AUTOMÁTICO DE SEGURANÇA
     * =====================================================
     */

    clearTimeout(
        MOTORISTAPAG_Login_segTimerLimite
    );


    MOTORISTAPAG_Login_segTimerLimite =
        setTimeout(
            function () {

                MOTORISTAPAG_Login_func_pararGravacaoSeguranca();


                MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
                    icone:
                        "⏱️",

                    titulo:
                        "Gravação finalizada",

                    texto:
                        "A gravação foi finalizada automaticamente por segurança.\n\n" +
                        "O arquivo não foi enviado automaticamente.",

                    textoConfirmar:
                        "OK"
                });

            },

            tipo === "video"
                ? MOTORISTAPAG_Login_segLimiteVideoMs
                : MOTORISTAPAG_Login_segLimiteAudioMs
        );
}

/* =========================================================
   CENTRAL DE SEGURANÇA — PARAR GRAVAÇÃO
   ========================================================= */

function MOTORISTAPAG_Login_func_pararGravacaoSeguranca() {

    if (
        !MOTORISTAPAG_Login_segMediaRecorder ||
        MOTORISTAPAG_Login_segMediaRecorder.state ===
            "inactive"
    ) {
        return;
    }


    const btnParar =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_btn_parar_gravacao"
        );


    /*
     * Impede novo clique enquanto o arquivo
     * está sendo fechado pelo MediaRecorder.
     */
    if (btnParar) {

        btnParar.disabled =
            true;

        btnParar.innerText =
            "Finalizando...";
    }


    /*
     * Cancela o encerramento automático,
     * caso a gravação tenha sido parada antes
     * do limite de segurança.
     */
    clearTimeout(
        MOTORISTAPAG_Login_segTimerLimite
    );

    MOTORISTAPAG_Login_segTimerLimite =
        null;


    /*
     * Congela o cronômetro no momento
     * em que a gravação foi encerrada.
     */
    MOTORISTAPAG_Login_func_pararCronometroSeguranca();


    /*
     * O evento onstop continuará responsável
     * por montar o arquivo final.
     */
    MOTORISTAPAG_Login_segMediaRecorder.stop();


    /*
     * Desliga imediatamente câmera/microfone.
     */
    MOTORISTAPAG_Login_func_pararStreamSeguranca();
}

/* =========================================================
   CENTRAL DE SEGURANÇA — FINALIZAR ARQUIVO
   ========================================================= */

function MOTORISTAPAG_Login_func_finalizarArquivoSeguranca(
    tipo
) {

    const titulo =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_gravacao_titulo"
        );

    const status =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_gravacao_status"
        );

    const audioArea =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_audio_area"
        );

    const audioPreview =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_audio_preview"
        );

    const videoPreview =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_video_preview"
        );

    const videoResultado =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_video_resultado"
        );

    const fotoResultado =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_foto_resultado"
        );

    const acoesArquivo =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_acoes_arquivo"
        );

    const btnParar =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_btn_parar_gravacao"
        );


    /*
     * Mantemos o formato original atual.
     *
     * Áudio = audio/webm
     * Vídeo = video/webm
     *
     * A renomeação especial do ÁUDIO para
     * compartilhamento será feita depois.
     */
    const mimeType =
        tipo === "video"
            ? "video/webm"
            : "audio/webm";

    const extensao =
        "webm";


    const dataAgora =
        new Date()
            .toISOString()
            .replace(
                /[:.]/g,
                "-"
            );


    /*
     * Nenhuma mídia capturada.
     */
    if (
        !MOTORISTAPAG_Login_segMidiaChunks.length
    ) {

        if (status) {
            status.innerText =
                "Nenhum áudio/vídeo foi capturado. " +
                "Tente gravar novamente.";
        }


        if (btnParar) {

            btnParar.disabled =
                false;

            btnParar.innerText =
                "Parar gravação";

            btnParar.style.display =
                "block";
        }


        clearTimeout(
            MOTORISTAPAG_Login_segTimerLimite
        );

        MOTORISTAPAG_Login_segTimerLimite =
            null;


        MOTORISTAPAG_Login_func_pararCronometroSeguranca();

        MOTORISTAPAG_Login_segInicioGravacaoMs =
            0;

        return;
    }


    /*
     * Cria o Blob da gravação.
     */
    const blob =
        new Blob(
            MOTORISTAPAG_Login_segMidiaChunks,
            {
                type:
                    mimeType
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    /*
     * Guarda o arquivo original.
     *
     * Áudio continua .webm aqui.
     * Vídeo continua .webm aqui.
     */
    MOTORISTAPAG_Login_segArquivoBlobAtual =
        blob;

    MOTORISTAPAG_Login_segArquivoUrlAtual =
        url;

    MOTORISTAPAG_Login_segArquivoNomeAtual =
        "tnp-mob-motorista-seguranca-" +
        tipo +
        "-" +
        dataAgora +
        "." +
        extensao;


    /*
     * Encerra a prévia ao vivo do vídeo.
     */
    if (videoPreview) {

        videoPreview.srcObject =
            null;

        videoPreview.style.display =
            "none";
    }


    /*
     * Garante que foto antiga não fique visível.
     */
    if (fotoResultado) {

        fotoResultado.removeAttribute(
            "src"
        );

        fotoResultado.style.display =
            "none";
    }


    /*
     * =====================================================
     * ÁUDIO FINALIZADO
     * =====================================================
     */

    if (
        tipo === "audio"
    ) {

        if (titulo) {
            titulo.innerText =
                "🎙️ Áudio de segurança";
        }


        if (videoResultado) {

            videoResultado.removeAttribute(
                "src"
            );

            videoResultado.style.display =
                "none";
        }


        /*
         * Mostra a nova área grande do áudio.
         */
        if (audioArea) {
            audioArea.style.display =
                "flex";
        }


        if (audioPreview) {

            audioPreview.src =
                url;

            audioPreview.style.display =
                "block";

            audioPreview.load();
        }
    }


    /*
     * =====================================================
     * VÍDEO FINALIZADO
     * =====================================================
     */

    if (
        tipo === "video"
    ) {

        if (titulo) {
            titulo.innerText =
                "📹 Vídeo de segurança";
        }


        if (audioPreview) {

            audioPreview.removeAttribute(
                "src"
            );

            audioPreview.style.display =
                "none";
        }


        if (audioArea) {
            audioArea.style.display =
                "none";
        }


        if (videoResultado) {

            videoResultado.src =
                url;

            videoResultado.style.display =
                "block";

            videoResultado.load();
        }
    }


    /*
     * Estado final.
     */
    if (status) {

        status.innerText =
            "Gravação finalizada. " +
            "O arquivo não foi enviado automaticamente. " +
            "Você pode baixar, compartilhar por sua conta ou descartar.";
    }


    if (btnParar) {
        btnParar.style.display =
            "none";
    }


    if (acoesArquivo) {
        acoesArquivo.style.display =
            "grid";
    }


    /*
     * Limpeza dos controles da gravação.
     */
    clearTimeout(
        MOTORISTAPAG_Login_segTimerLimite
    );

    MOTORISTAPAG_Login_segTimerLimite =
        null;


    MOTORISTAPAG_Login_func_pararCronometroSeguranca();

    MOTORISTAPAG_Login_segInicioGravacaoMs =
        0;
}

/* =========================================================
   CENTRAL DE SEGURANÇA — CONVERTER BLOB PARA BASE64
   ========================================================= */

function MOTORISTAPAG_Login_func_blobParaBase64Seguranca(
    arquivoBlob
) {

    return new Promise(
        function (
            resolver,
            rejeitar
        ) {

            const leitor =
                new FileReader();


            leitor.onload =
                function () {

                    const resultado =
                        String(
                            leitor.result ||
                            ""
                        );


                    if (!resultado) {

                        rejeitar(
                            new Error(
                                "O arquivo convertido ficou vazio."
                            )
                        );

                        return;
                    }


                    resolver(
                        resultado
                    );
                };


            leitor.onerror =
                function () {

                    rejeitar(
                        leitor.error ||
                        new Error(
                            "Não foi possível ler o arquivo."
                        )
                    );
                };


            leitor.readAsDataURL(
                arquivoBlob
            );
        }
    );
}

/* =========================================================
   CENTRAL DE SEGURANÇA — BAIXAR ARQUIVO
   ========================================================= */

async function MOTORISTAPAG_Login_func_baixarArquivoSeguranca() {

    if (
        MOTORISTAPAG_Login_segAcaoEmAndamento
    ) {
        return;
    }


    /*
     * Nenhum arquivo disponível.
     */
    if (
        !MOTORISTAPAG_Login_segArquivoBlobAtual
    ) {

        await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone:
                "⚠️",

            titulo:
                "Arquivo não disponível",

            texto:
                "Nenhum arquivo de segurança está disponível para baixar.",

            textoConfirmar:
                "OK"
        });

        return;
    }


    MOTORISTAPAG_Login_segAcaoEmAndamento =
        true;


    try {

        const arquivoBlob =
            MOTORISTAPAG_Login_segArquivoBlobAtual;


        /*
         * Usa o nome ORIGINAL do arquivo.
         *
         * Aqui não existe a renomeação especial
         * do áudio usada no compartilhamento.
         */
        const nomeArquivo =
            MOTORISTAPAG_Login_segArquivoNomeAtual ||
            (
                "tnp-mob-motorista-seguranca-" +
                Date.now() +
                ".webm"
            );


        const tipoMime =
            arquivoBlob.type ||
            "application/octet-stream";


        /*
         * ==================================================
         * APLICATIVO ANDROID
         * ==================================================
         *
         * Converte o Blob para Base64 e entrega
         * o arquivo para a ponte nativa.
         */
        if (
            window.TNPAndroid &&
            typeof window.TNPAndroid.baixarArquivo ===
            "function"
        ) {

            const dadosBase64 =
                await MOTORISTAPAG_Login_func_blobParaBase64Seguranca(
                    arquivoBlob
                );


            window.TNPAndroid.baixarArquivo(
                dadosBase64,
                nomeArquivo,
                tipoMime
            );


            return;
        }


        /*
         * ==================================================
         * NAVEGADOR COMUM
         * ==================================================
         */

        if (
            !MOTORISTAPAG_Login_segArquivoUrlAtual
        ) {

            throw new Error(
                "Endereço temporário do arquivo não encontrado."
            );
        }


        const link =
            document.createElement(
                "a"
            );


        link.href =
            MOTORISTAPAG_Login_segArquivoUrlAtual;


        link.download =
            nomeArquivo;


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );


    } catch (erro) {

        console.error(
            "Erro ao baixar arquivo de segurança do motorista:",
            erro
        );


        await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone:
                "⚠️",

            titulo:
                "Não foi possível baixar",

            texto:
                "Não foi possível baixar o arquivo.\n\n" +
                (
                    erro &&
                    erro.message

                        ? erro.message

                        : "Erro desconhecido."
                ),

            textoConfirmar:
                "OK"
        });


    } finally {

        MOTORISTAPAG_Login_segAcaoEmAndamento =
            false;
    }
}

/* =========================================================
   CENTRAL DE SEGURANÇA — COMPARTILHAR POR MINHA CONTA
   ========================================================= */

async function MOTORISTAPAG_Login_func_compartilharArquivoSeguranca() {

    if (
        MOTORISTAPAG_Login_segAcaoEmAndamento
    ) {
        return;
    }


    if (
        !MOTORISTAPAG_Login_segArquivoBlobAtual
    ) {

        await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone: "⚠️",

            titulo:
                "Arquivo não disponível",

            texto:
                "Nenhum arquivo de segurança está disponível para compartilhar.",

            textoConfirmar:
                "OK"
        });

        return;
    }


    MOTORISTAPAG_Login_segAcaoEmAndamento =
        true;


    try {

        const arquivoBlob =
            MOTORISTAPAG_Login_segArquivoBlobAtual;


        const tipoAtual =
            String(
                MOTORISTAPAG_Login_segTipoGravacao ||
                ""
            )
                .toLowerCase()
                .trim();


        const nomeArquivo =
            MOTORISTAPAG_Login_segArquivoNomeAtual ||
            (
                "tnp-mob-motorista-seguranca-" +
                Date.now() +
                ".webm"
            );


        let nomeArquivoCompartilhamento =
            nomeArquivo;


        let tipoMimeCompartilhamento =
            arquivoBlob.type ||
            "application/octet-stream";


        /*
         * MESMA REGRA DO CÓDIGO ANTIGO.
         */
        if (
            tipoAtual ===
            "audio"
        ) {

            nomeArquivoCompartilhamento =
                nomeArquivo.replace(
                    /\.[^.]+$/,
                    ""
                ) +
                ".ogg";


            tipoMimeCompartilhamento =
                "audio/ogg";


        } else if (
            tipoAtual ===
            "video"
        ) {

            tipoMimeCompartilhamento =
                "video/*";


        } else if (
            tipoAtual ===
            "foto"
        ) {

            tipoMimeCompartilhamento =
                "image/*";
        }


        /*
         * APP ANDROID
         */
        if (
            window.TNPAndroid &&
            typeof window.TNPAndroid.compartilharArquivo ===
            "function"
        ) {

            const dadosBase64 =
                await MOTORISTAPAG_Login_func_blobParaBase64Seguranca(
                    arquivoBlob
                );


            window.TNPAndroid.compartilharArquivo(
                dadosBase64,
                nomeArquivoCompartilhamento,
                tipoMimeCompartilhamento
            );


            return;
        }


        /*
         * NAVEGADOR
         */
        const arquivo =
            MOTORISTAPAG_Login_func_criarArquivoCompartilhamentoSeguranca();


        if (!arquivo) {
            throw new Error(
                "Não foi possível preparar o arquivo."
            );
        }


        if (
            navigator.canShare &&
            navigator.canShare({
                files: [
                    arquivo
                ]
            })
        ) {

            await navigator.share({
                title:
                    "Arquivo de segurança TNP MOB",

                text:
                    "Arquivo de segurança feito por mim no TNP MOB.",

                files: [
                    arquivo
                ]
            });


            return;
        }


        await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone: "⚠️",

            titulo:
                "Compartilhamento não disponível",

            texto:
                "Este navegador não permite compartilhar o arquivo diretamente.",

            textoConfirmar:
                "OK"
        });


    } catch (erro) {

        if (
            erro &&
            erro.name ===
            "AbortError"
        ) {
            return;
        }


        console.warn(
            "Compartilhamento do motorista não concluído:",
            erro
        );


        await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone: "⚠️",

            titulo:
                "Não foi possível compartilhar",

            texto:
                "Não foi possível abrir o compartilhamento.\n\n" +
                (
                    erro &&
                    erro.message

                        ? erro.message

                        : "Erro desconhecido."
                ),

            textoConfirmar:
                "OK"
        });


    } finally {

        MOTORISTAPAG_Login_segAcaoEmAndamento =
            false;
    }
}

/* =========================================================
   CENTRAL DE SEGURANÇA — CRIAR ARQUIVO PARA COMPARTILHAMENTO
   ========================================================= */

function MOTORISTAPAG_Login_func_criarArquivoCompartilhamentoSeguranca() {

    if (
        !MOTORISTAPAG_Login_segArquivoBlobAtual
    ) {
        return null;
    }


    const tipoAtual =
        MOTORISTAPAG_Login_segTipoGravacao ||
        "";


    const dataAgora =
        new Date()
            .toISOString()
            .replace(
                /[:.]/g,
                "-"
            );


    /*
     * ÁUDIO — EXATAMENTE COMO ERA ANTES.
     */
    if (
        tipoAtual ===
        "audio"
    ) {

        return new File(
            [
                MOTORISTAPAG_Login_segArquivoBlobAtual
            ],

            "tnp-mob-motorista-seguranca-audio-" +
            dataAgora +
            ".ogg",

            {
                type:
                    "audio/ogg"
            }
        );
    }


    /*
     * FOTO
     */
    if (
        tipoAtual ===
        "foto"
    ) {

        return new File(
            [
                MOTORISTAPAG_Login_segArquivoBlobAtual
            ],

            MOTORISTAPAG_Login_segArquivoNomeAtual ||
            (
                "tnp-mob-motorista-seguranca-foto-" +
                dataAgora +
                ".jpg"
            ),

            {
                type:
                    MOTORISTAPAG_Login_segArquivoBlobAtual.type ||
                    "image/jpeg"
            }
        );
    }


    /*
     * VÍDEO
     */
    return new File(
        [
            MOTORISTAPAG_Login_segArquivoBlobAtual
        ],

        MOTORISTAPAG_Login_segArquivoNomeAtual ||
        (
            "tnp-mob-motorista-seguranca-video-" +
            dataAgora +
            ".webm"
        ),

        {
            type:
                MOTORISTAPAG_Login_segArquivoBlobAtual.type ||
                "video/webm"
        }
    );
}

/* =========================================================
   CENTRAL DE SEGURANÇA — VALIDAR ABERTURA DA FOTO
   ========================================================= */

function MOTORISTAPAG_Login_func_validarAberturaFotoSeguranca(
    event
) {

    /*
     * Sem gravação ativa:
     * deixa a câmera/seletor abrir normalmente.
     */
    if (
        !MOTORISTAPAG_Login_func_existeGravacaoSegurancaAtiva()
    ) {
        return true;
    }


    /*
     * Existe áudio ou vídeo gravando.
     * Impede a abertura da câmera antes que ela
     * possa interferir na gravação atual.
     */
    if (event) {

        event.preventDefault();
        event.stopPropagation();
    }


    MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
        icone:
            "⚠️",

        titulo:
            "Gravação em andamento",

        texto:
            "Já existe uma gravação de segurança em andamento.\n\n" +
            "Pare a gravação atual antes de tirar uma foto.",

        textoConfirmar:
            "OK"
    });


    return false;
}

/* =========================================================
   CENTRAL DE SEGURANÇA — FOTO SELECIONADA
   ========================================================= */


function MOTORISTAPAG_Login_func_fotoSegurancaSelecionada(
    input
) {

    /*
     * PROTEÇÃO:
     * Não permitir que uma foto interrompa
     * uma gravação de áudio ou vídeo ativa.
     */
    if (
        MOTORISTAPAG_Login_func_existeGravacaoSegurancaAtiva()
    ) {

        if (input) {
            input.value = "";
        }

        MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone: "⚠️",
            titulo: "Gravação em andamento",
            texto:
                "Pare a gravação atual antes de tirar uma foto.",
            textoConfirmar: "OK"
        });

        return;
    }

    if (
        MOTORISTAPAG_Login_segAcaoEmAndamento
    ) {
        return;
    }

    const arquivo =
        input &&
        input.files &&
        input.files[0]

            ? input.files[0]

            : null;


    if (!arquivo) {
        return;
    }


    /*
     * Validação básica.
     */
    if (
        !arquivo.type ||
        !arquivo.type.startsWith(
            "image/"
        )
    ) {

        MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone:
                "📸",

            titulo:
                "Imagem inválida",

            texto:
                "Selecione uma imagem válida.",

            textoConfirmar:
                "OK"
        });


        if (input) {
            input.value =
                "";
        }


        return;
    }


    MOTORISTAPAG_Login_segAcaoEmAndamento =
        true;


    try {

        /*
         * Limpa qualquer mídia anterior.
         */
        MOTORISTAPAG_Login_func_limparGravacaoSeguranca();


        const box =
            document.getElementById(
                "MOTORISTAPAG_Login_seg_gravacao_box"
            );

        const titulo =
            document.getElementById(
                "MOTORISTAPAG_Login_seg_gravacao_titulo"
            );

        const status =
            document.getElementById(
                "MOTORISTAPAG_Login_seg_gravacao_status"
            );


        /*
         * ÁUDIO
         */
        const audioArea =
            document.getElementById(
                "MOTORISTAPAG_Login_seg_audio_area"
            );

        const audioPreview =
            document.getElementById(
                "MOTORISTAPAG_Login_seg_audio_preview"
            );


        /*
         * VÍDEO
         */
        const videoPreview =
            document.getElementById(
                "MOTORISTAPAG_Login_seg_video_preview"
            );

        const videoResultado =
            document.getElementById(
                "MOTORISTAPAG_Login_seg_video_resultado"
            );


        /*
         * FOTO
         */
        const fotoResultado =
            document.getElementById(
                "MOTORISTAPAG_Login_seg_foto_resultado"
            );


        /*
         * CONTROLES
         */
        const acoesArquivo =
            document.getElementById(
                "MOTORISTAPAG_Login_seg_acoes_arquivo"
            );

        const btnParar =
            document.getElementById(
                "MOTORISTAPAG_Login_seg_btn_parar_gravacao"
            );


        /*
         * Mantém a lógica atual:
         *
         * PNG → .png
         * demais imagens utilizadas aqui → .jpg
         */
        const extensao =
            arquivo.type ===
            "image/png"

                ? "png"

                : "jpg";


        const dataAgora =
            new Date()
                .toISOString()
                .replace(
                    /[:.]/g,
                    "-"
                );


        const url =
            URL.createObjectURL(
                arquivo
            );


        /*
         * Guarda a foto como arquivo atual.
         */
        MOTORISTAPAG_Login_segTipoGravacao =
            "foto";

        MOTORISTAPAG_Login_segArquivoBlobAtual =
            arquivo;

        MOTORISTAPAG_Login_segArquivoUrlAtual =
            url;

        MOTORISTAPAG_Login_segArquivoNomeAtual =
            "tnp-mob-motorista-seguranca-foto-" +
            dataAgora +
            "." +
            extensao;


        /*
         * Abre a área de resultado.
         */
        if (box) {
            box.style.display =
                "block";
        }


        if (titulo) {
            titulo.innerText =
                "📸 Foto de segurança capturada";
        }


        if (status) {

            status.innerText =
                "Foto de segurança pronta. " +
                "O arquivo não foi enviado automaticamente. " +
                "Você pode baixar, compartilhar por sua conta, " +
                "compartilhar com suporte ou descartar.";
        }


        /*
         * ==================================================
         * ESCONDER ÁUDIO
         * ==================================================
         */

        if (audioPreview) {

            audioPreview.removeAttribute(
                "src"
            );

            audioPreview.style.display =
                "none";
        }


        if (audioArea) {
            audioArea.style.display =
                "none";
        }


        /*
         * ==================================================
         * ESCONDER VÍDEO
         * ==================================================
         */

        if (videoPreview) {

            videoPreview.srcObject =
                null;

            videoPreview.style.display =
                "none";
        }


        if (videoResultado) {

            videoResultado.removeAttribute(
                "src"
            );

            videoResultado.style.display =
                "none";
        }


        /*
         * ==================================================
         * MOSTRAR FOTO
         * ==================================================
         */

        if (fotoResultado) {

            fotoResultado.src =
                url;

            fotoResultado.style.display =
                "block";
        }


        /*
         * Foto não possui botão PARAR.
         */
        if (btnParar) {
            btnParar.style.display =
                "none";
        }


        /*
         * Mostra ações do arquivo.
         */
        if (acoesArquivo) {
            acoesArquivo.style.display =
                "grid";
        }


        MOTORISTAPAG_Login_func_centralizarBoxGravacaoSeguranca();


    } catch (erro) {

        console.error(
            "Erro ao preparar foto de segurança:",
            erro
        );


        MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone:
                "📸",

            titulo:
                "Não foi possível preparar a foto",

            texto:
                "Não foi possível preparar a foto de segurança. Tente novamente.",

            textoConfirmar:
                "OK"
        });


    } finally {

        MOTORISTAPAG_Login_segAcaoEmAndamento =
            false;


        /*
         * Permite selecionar novamente
         * até a mesma foto.
         */
        if (input) {
            input.value =
                "";
        }
    }
}

/* =========================================================
   CENTRAL DE SEGURANÇA — COMPARTILHAR COM O SUPORTE
   ========================================================= */

async function MOTORISTAPAG_Login_func_compartilharArquivoSuporteSeguranca() {

    if (
        MOTORISTAPAG_Login_segAcaoEmAndamento
    ) {
        return;
    }


    /*
     * Nenhum arquivo disponível.
     */
    if (
        !MOTORISTAPAG_Login_segArquivoBlobAtual
    ) {

        await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone:
                "⚠️",

            titulo:
                "Arquivo não disponível",

            texto:
                "Nenhum arquivo de segurança está disponível para enviar ao suporte.",

            textoConfirmar:
                "OK"
        });

        return;
    }


    /*
     * Usuário autenticado.
     */
    const user =
        typeof PRIMEIRAPAG_Login_auth !== "undefined" &&
        PRIMEIRAPAG_Login_auth.currentUser

            ? PRIMEIRAPAG_Login_auth.currentUser

            : firebase.auth().currentUser;


    if (!user) {

        await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone:
                "🔒",

            titulo:
                "Login necessário",

            texto:
                "Você precisa estar logado para compartilhar o arquivo com o suporte.",

            textoConfirmar:
                "OK"
        });

        return;
    }


    /*
     * Confirmação.
     */
    const confirmar =
        await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone:
                "💬",

            titulo:
                "Enviar para o suporte",

            texto:
                "Deseja enviar este arquivo para o suporte TNP MOB?\n\n" +
                "Uma cópia será salva com segurança no sistema e um chamado será aberto na Central de Ajuda.",

            textoCancelar:
                "Cancelar",

            textoConfirmar:
                "Enviar"
        });


    if (!confirmar) {
        return;
    }


    /*
     * Verifica o limite geral de chamados.
     */
    const podeAbrirChamado =
        await MOTORISTAPAG_Login_func_podeAbrirChamadoSeguranca(
            user.uid
        );


    if (!podeAbrirChamado) {
        return;
    }


    MOTORISTAPAG_Login_segAcaoEmAndamento =
        true;


    const btnSuporte =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_btn_compartilhar_suporte"
        );


    if (btnSuporte) {

        btnSuporte.disabled =
            true;

        btnSuporte.innerText =
            "Enviando para suporte...";
    }


    try {

        const db =
            typeof PRIMEIRAPAG_Login_db !==
            "undefined"

                ? PRIMEIRAPAG_Login_db

                : firebase.firestore();


        const storage =
            typeof PRIMEIRAPAG_Login_storage !==
            "undefined"

                ? PRIMEIRAPAG_Login_storage

                : firebase.storage();


        /*
         * ==================================================
         * ARQUIVO ORIGINAL
         * ==================================================
         *
         * IMPORTANTE:
         *
         * Aqui NÃO usamos
         * criarArquivoCompartilhamentoSeguranca().
         *
         * A renomeação especial .ogg do áudio
         * existe somente para compartilhamento externo.
         *
         * Para o suporte:
         *
         * áudio → .webm normal
         * vídeo → normal
         * foto  → normal
         */

        const arquivo =
            MOTORISTAPAG_Login_segArquivoBlobAtual;


        if (!arquivo) {

            await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
                icone:
                    "⚠️",

                titulo:
                    "Arquivo não disponível",

                texto:
                    "Não foi possível preparar o arquivo para envio.",

                textoConfirmar:
                    "OK"
            });

            return;
        }


        const tipoArquivo =
            MOTORISTAPAG_Login_segTipoGravacao ||
            "arquivo";


        const dataArquivo =
            Date.now();


        const nomeArquivoSeguro =
            MOTORISTAPAG_Login_segArquivoNomeAtual ||
            (
                "seguranca-" +
                dataArquivo +
                ".webm"
            );


        /*
         * ==================================================
         * FIREBASE STORAGE
         * ==================================================
         *
         * Caminho original preservado.
         */

        const caminhoStorage =
            "segurancaMotoristas/" +
            user.uid +
            "/" +
            dataArquivo +
            "-" +
            nomeArquivoSeguro;


        const arquivoRef =
            storage
                .ref()
                .child(
                    caminhoStorage
                );


        await arquivoRef.put(
            arquivo,
            {
                contentType:
                    arquivo.type ||
                    "application/octet-stream",

                customMetadata: {
                    origem:
                        "central_seguranca_motorista",

                    motoristaUid:
                        user.uid,

                    tipoArquivo:
                        tipoArquivo
                }
            }
        );


        const arquivoUrl =
            await arquivoRef.getDownloadURL();


        /*
         * ==================================================
         * CRIAR CHAMADO
         * ==================================================
         */

        const chamadoRef =
            db
                .collection(
                    "suporteChamados"
                )
                .doc();


        const protocolo =
            MOTORISTAPAG_Login_func_gerarProtocoloSuporteSeguranca();


        const textoCurto =
            tipoArquivo === "foto"

                ? "Foto de segurança enviada pelo motorista."

                : tipoArquivo === "video"

                    ? "Vídeo de segurança enviado pelo motorista."

                    : "Áudio de segurança enviado pelo motorista.";


        await chamadoRef.set({

            protocolo:
                protocolo,

            origem:
                "motorista",

            origemPerfil:
                "motorista",

            destinoPerfil:
                "suporte",

            categoria:
                "suporte_motorista",

            tipo:
                "chat_suporte_motorista",

            tipoAtendimento:
                "seguranca",

            titulo:
                tipoArquivo === "foto"

                    ? "Foto de segurança do motorista"

                    : tipoArquivo === "video"

                        ? "Vídeo de segurança do motorista"

                        : "Áudio de segurança do motorista",

            status:
                "em_atendimento",

            suporteMediando:
                true,

            chatDiretoLiberado:
                false,

            motoristaUid:
                user.uid,

            motoristaEmail:
                user.email ||
                "",

            arquivoSeguranca: {
                url:
                    arquivoUrl,

                nome:
                    nomeArquivoSeguro,

                tipo:
                    tipoArquivo,

                contentType:
                    arquivo.type ||
                    "",

                storagePath:
                    caminhoStorage
            },

            ultimaMensagem:
                textoCurto,

            ultimaMensagemTexto:
                textoCurto,

            ultimaMensagemOrigem:
                "motorista",

            ultimaMensagemDestino:
                "suporte",

            criadoEm:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            atualizadoEm:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()
        });


        /*
         * ==================================================
         * PRIMEIRA MENSAGEM DO CHAMADO
         * ==================================================
         */

        await chamadoRef
            .collection(
                "mensagens"
            )
            .add({

                origem:
                    "motorista",

                origemReal:
                    "motorista",

                origemUid:
                    user.uid,

                exibidoComo:
                    "Motorista",

                destinoReal:
                    "suporte",

                encaminhadoPara:
                    "suporte",

                tipo:
                    "arquivo_seguranca",

                categoria:
                    "seguranca",

                texto:
                    textoCurto,

                textoOriginal:
                    textoCurto,

                textoExibido:
                    textoCurto,

                arquivoUrl:
                    arquivoUrl,

                arquivoNome:
                    nomeArquivoSeguro,

                arquivoTipo:
                    tipoArquivo,

                arquivoContentType:
                    arquivo.type ||
                    "",

                arquivoStoragePath:
                    caminhoStorage,

                visivelParaMotorista:
                    true,

                visivelParaPassageiro:
                    false,

                visivelParaSuporte:
                    true,

                visibilidades: {
                    motorista:
                        true,

                    passageiro:
                        false,

                    suporte:
                        true
                },

                lidaAdmin:
                    false,

                criadoEm:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()
            });


        /*
         * ==================================================
         * SUCESSO
         * ==================================================
         */

        const textoSucesso =
            tipoArquivo === "foto"

                ? "Foto enviada ao suporte"

                : tipoArquivo === "video"

                    ? "Vídeo enviado ao suporte"

                    : "Áudio enviado ao suporte";


        await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
			icone:
				"✅",

			titulo:
				"Arquivo enviado",

			texto:
				textoSucesso +
				" e chamado criado na Central de Ajuda.\n\n" +
				"Protocolo: " +
				protocolo,

			textoConfirmar:
				"OK"
		});


		/*
		 * ==================================================
		 * IR PARA MENSAGENS APÓS O ENVIO
		 * ==================================================
		 */

		const centralFechada =
			await MOTORISTAPAG_Login_func_fecharCentralSeguranca();


		if (
			centralFechada ===
			false
		) {
			return;
		}


		/*
		 * Abre Mensagens usando o fluxo
		 * completo do motorista.
		 */
		if (
			typeof MOTORISTAPAG_Login_func_abrirHistoricoMensagensAjudaMotorista ===
			"function"
		) {

			MOTORISTAPAG_Login_func_abrirHistoricoMensagensAjudaMotorista();

		} else if (
			typeof MOTORISTAPAG_Login_func_carregarTelaMensagensMotorista ===
			"function"
		) {

			MOTORISTAPAG_Login_func_carregarTelaMensagensMotorista();

		} else {

			await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
				icone:
					"⚠️",

				titulo:
					"Arquivo enviado",

				texto:
					"O arquivo foi enviado e o chamado foi criado, " +
					"mas a tela de mensagens do motorista não foi encontrada.",

				textoConfirmar:
					"OK"
			});
		}


    } catch (erro) {

        console.error(
            "Erro ao compartilhar arquivo de segurança com suporte:",
            erro
        );


        await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone:
                "⚠️",

            titulo:
                "Não foi possível enviar",

            texto:
                "Não foi possível enviar o arquivo ao suporte. Tente novamente.",

            textoConfirmar:
                "OK"
        });


    } finally {

        MOTORISTAPAG_Login_segAcaoEmAndamento =
            false;


        if (btnSuporte) {

            btnSuporte.disabled =
                false;

            btnSuporte.innerText =
                "💬 Compartilhar com suporte TNP MOB";
        }
    }
}

/* =========================================================
   CENTRAL DE SEGURANÇA — DESCARTAR ARQUIVO
   ========================================================= */

async function MOTORISTAPAG_Login_func_descartarArquivoSeguranca() {

    /*
     * Não permite descartar enquanto
     * a gravação ainda está ativa.
     */
    if (
        MOTORISTAPAG_Login_segMediaRecorder &&
        MOTORISTAPAG_Login_segMediaRecorder.state ===
            "recording"
    ) {

        await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone:
                "⚠️",

            titulo:
                "Gravação em andamento",

            texto:
                "Pare a gravação antes de descartar o arquivo.",

            textoConfirmar:
                "OK"
        });

        return;
    }


    /*
     * Confirmação antes de apagar
     * o arquivo temporário.
     */
    const confirmar =
        await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
            icone:
                "🗑️",

            titulo:
                "Descartar arquivo",

            texto:
                "Deseja descartar este arquivo?\n\n" +
                "Essa ação remove o arquivo temporário da tela.",

            textoCancelar:
                "Cancelar",

            textoConfirmar:
                "Descartar"
        });


    if (!confirmar) {
        return;
    }


    /*
     * Remove Blob, URL temporária,
     * prévias e estados da gravação.
     */
    MOTORISTAPAG_Login_func_limparGravacaoSeguranca();


    /*
     * Confirmação final.
     */
    await MOTORISTAPAG_Login_func_abrirModalMensagemSeguranca({
        icone:
            "✅",

        titulo:
            "Arquivo descartado",

        texto:
            "Arquivo descartado. Nenhum arquivo foi enviado.",

        textoConfirmar:
            "OK"
    });
}


/* =========================================================
   CENTRAL DE SEGURANÇA — INTEGRAÇÃO COM A PILHA GLOBAL
   MOTORISTA
========================================================= */

function MOTORISTAPAG_Login_func_voltarPilhaSegurancaMotorista() {

    /*
     * A pilha global já retirou a camada antes
     * de executar este callback.
     *
     * Reutilizamos o tratamento oficial da Central.
     */
    MOTORISTAPAG_Login_func_tratarVoltarGlobalSegurancaMotorista();

    /*
     * Se a Central continua aberta, preservamos
     * seu registro para o próximo VOLTAR.
     *
     * Isso também protege o caso em que a saída
     * depende de confirmação durante a gravação.
     */
    const tela = document.getElementById(
        "MOTORISTAPAG_Login_screen_central_seguranca"
    );

    if (
        tela &&
        tela.classList.contains("active") &&
        tela.style.display !== "none" &&
        typeof TNP_MOB_func_registrarCamadaVoltar === "function"
    ) {
        TNP_MOB_func_registrarCamadaVoltar(
            "motorista_central_seguranca",
            MOTORISTAPAG_Login_func_voltarPilhaSegurancaMotorista
        );
    }
}

/* =========================================================
   CENTRAL DE SEGURANÇA — VOLTAR GLOBAL
   ========================================================= */

function MOTORISTAPAG_Login_func_tratarVoltarGlobalSegurancaMotorista() {

    const modalMensagem =
        document.getElementById(
            "MOTORISTAPAG_Login_seg_modal_mensagem"
        );


    const tela =
        document.getElementById(
            "MOTORISTAPAG_Login_screen_central_seguranca"
        );


    /*
     * =====================================================
     * 1. MODAL INTERNO ABERTO
     * =====================================================
     *
     * O modal é filho da Central.
     *
     * Portanto o VOLTAR fecha primeiro
     * somente o modal e mantém a Central aberta.
     */

    if (
        modalMensagem &&
        (
            modalMensagem.classList.contains(
                "active"
            ) ||
            modalMensagem.style.display ===
                "flex"
        )
    ) {

        MOTORISTAPAG_Login_func_fecharModalMensagemSeguranca(
            false
        );


        return true;
    }


    /*
     * =====================================================
     * 2. CENTRAL DE SEGURANÇA ABERTA
     * =====================================================
     */

    if (
        tela &&
        (
            tela.classList.contains(
                "active"
            ) ||
            tela.style.display ===
                "block"
        )
    ) {

        /*
         * Não usamos await aqui.
         *
         * O Voltar Global precisa receber true
         * imediatamente para não continuar
         * fechando outras camadas.
         *
         * Se existir gravação ativa,
         * fecharCentralSeguranca() cuidará
         * da confirmação internamente.
         */
        MOTORISTAPAG_Login_func_fecharCentralSeguranca();


        return true;
    }


    /*
     * =====================================================
     * 3. SEGURANÇA NÃO ESTÁ ATIVA
     * =====================================================
     *
     * O Voltar Global pode continuar procurando
     * outro módulo aberto.
     */

    return false;
}

/* =========================================================
   CENTRAL DE SEGURANÇA — FUNÇÕES PÚBLICAS
   ========================================================= */

/*
 * Disponibiliza as funções usadas pelo HTML
 * e por outros módulos do TNP MOB.
 */

window.MOTORISTAPAG_Login_func_carregarCentralSeguranca =
    MOTORISTAPAG_Login_func_carregarCentralSeguranca;

window.MOTORISTAPAG_Login_func_fecharCentralSeguranca =
    MOTORISTAPAG_Login_func_fecharCentralSeguranca;

window.MOTORISTAPAG_Login_func_ligarEmergencia190 =
    MOTORISTAPAG_Login_func_ligarEmergencia190;

window.MOTORISTAPAG_Login_func_falarSuporteSeguranca =
    MOTORISTAPAG_Login_func_falarSuporteSeguranca;

window.MOTORISTAPAG_Login_func_compartilharViagemSeguranca =
    MOTORISTAPAG_Login_func_compartilharViagemSeguranca;

window.MOTORISTAPAG_Login_func_iniciarAudioSeguranca =
    MOTORISTAPAG_Login_func_iniciarAudioSeguranca;

window.MOTORISTAPAG_Login_func_iniciarVideoSeguranca =
    MOTORISTAPAG_Login_func_iniciarVideoSeguranca;

window.MOTORISTAPAG_Login_func_pararGravacaoSeguranca =
    MOTORISTAPAG_Login_func_pararGravacaoSeguranca;

window.MOTORISTAPAG_Login_func_fotoSegurancaSelecionada =
    MOTORISTAPAG_Login_func_fotoSegurancaSelecionada;

window.MOTORISTAPAG_Login_func_baixarArquivoSeguranca =
    MOTORISTAPAG_Login_func_baixarArquivoSeguranca;

window.MOTORISTAPAG_Login_func_compartilharArquivoSeguranca =
    MOTORISTAPAG_Login_func_compartilharArquivoSeguranca;

window.MOTORISTAPAG_Login_func_compartilharArquivoSuporteSeguranca =
    MOTORISTAPAG_Login_func_compartilharArquivoSuporteSeguranca;

window.MOTORISTAPAG_Login_func_descartarArquivoSeguranca =
    MOTORISTAPAG_Login_func_descartarArquivoSeguranca;

window.MOTORISTAPAG_Login_func_tratarVoltarGlobalSegurancaMotorista =
    MOTORISTAPAG_Login_func_tratarVoltarGlobalSegurancaMotorista;

/* =========================================================
   MOTORISTA — CENTRAL DE SEGURANÇA
   ========================================================= */



/* ==================================================
   MOTORISTA — PERFIL DO MOTORISTA
================================================== */


/* ==================================================
   CARREGAR MÓDULO
================================================== */

async function MOTORISTAPAG_Login_func_carregarModuloPerfilMotorista() {
    const area =
        document.getElementById(
            "MOTORISTAPAG_Login_area_perfil"
        );

    if (!area) {
        console.error(
            "Área do módulo Perfil do Motorista não encontrada."
        );

        return false;
    }


    if (
        !document.getElementById(
            "MOTORISTAPAG_Login_modal_perfil_motorista"
        )
    ) {
        try {
            const resposta =
                await fetch(
                    "perfil/perfil.html"
                );

            if (!resposta.ok) {
                throw new Error(
                    "Não foi possível carregar perfil.html"
                );
            }

            area.innerHTML =
                await resposta.text();

        } catch (erro) {
            console.error(
                "Erro ao carregar módulo Perfil do Motorista:",
                erro
            );

            return false;
        }
    }

    return true;
}

/* ==================================================
   MOTORISTA — ABRIR MÓDULO PERFIL
================================================== */

async function MOTORISTAPAG_Login_func_abrirModuloPerfilMotorista() {

    const carregou =
        await MOTORISTAPAG_Login_func_carregarModuloPerfilMotorista();

    if (!carregou) {
        return false;
    }

    const modal = document.getElementById(
        "MOTORISTAPAG_Login_modal_perfil_motorista"
    );

    if (!modal) {
        console.error("Modal Perfil do Motorista não encontrado.");
        return false;
    }

    modal.classList.add("active");

    if (
        typeof TNP_MOB_func_registrarCamadaVoltar === "function"
    ) {
        TNP_MOB_func_registrarCamadaVoltar(
            "motorista_perfil",
            MOTORISTAPAG_Login_func_fecharPerfilMotorista
        );
    }

    if (
        typeof MOTORISTAPAG_Login_func_preencherPerfilMotorista === "function"
    ) {
        await MOTORISTAPAG_Login_func_preencherPerfilMotorista();
    }

    return true;
}

/* ==================================================
   FECHAR PERFIL DO MOTORISTA
================================================== */

function MOTORISTAPAG_Login_func_fecharPerfilMotorista() {

    const modal =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_perfil_motorista"
        );

    if (modal) {
        modal.classList.remove("active");
    }

    /*
     * PERFIL MOTORISTA — VOLTAR GLOBAL
     *
     * Remove a camada quando o Perfil for fechado,
     * inclusive pelo botão X.
     */
    if (
        typeof TNP_MOB_func_removerCamadaVoltar ===
        "function"
    ) {
        TNP_MOB_func_removerCamadaVoltar(
            "motorista_perfil"
        );
    }
}


async function MOTORISTAPAG_Login_func_preencherPerfilMotorista() {
    let user = null;

    try {
        user =
            await TNP_MOB_func_aguardarUsuarioAutenticado(
                8000
            );

    } catch (erroSessao) {
        console.warn(
            "Sessão não restaurada ao preencher Perfil do Motorista:",
            erroSessao
        );

        return;
    }

    try {
        const userDoc = await PRIMEIRAPAG_Login_db
            .collection('usuarios')
            .doc(user.uid)
            .get();

        const motoristaDoc = await PRIMEIRAPAG_Login_db
            .collection('motoristas')
            .doc(user.uid)
            .get();

        const u = userDoc.exists ? userDoc.data() : {};
        const m = motoristaDoc.exists ? motoristaDoc.data() : {};

        const nomeBruto =
			u.nomeDocumento ||
			u.nome ||
			m.nome ||
			"Motorista";

		const nome = String(nomeBruto)
			.replace(/\s+passageiro\s*$/i, "")
			.replace(/\s{2,}/g, " ")
			.trim() || "Motorista";
        const email = u.email || user.email || "-";
        const foto = u.fotoPerfilUrl || u.selfieUrl || m.fotoPerfilUrl || "";

        const statusAnalise = m.statusAnalise || m.motoristaStatus || u.motoristaStatus || "em_analise";
        const podeAceitar = m.podeAceitarCorrida === true;

        const nomeEl = document.getElementById('MOTORISTAPAG_Login_perfil_nome');
        const emailEl = document.getElementById('MOTORISTAPAG_Login_perfil_email');
        const fotoEl = document.getElementById('MOTORISTAPAG_Login_perfil_foto');
        const fallbackEl = document.getElementById('MOTORISTAPAG_Login_perfil_avatar_fallback');
        const statusEl = document.getElementById('MOTORISTAPAG_Login_perfil_status');
        const badgeEl = document.getElementById('MOTORISTAPAG_Login_perfil_badge_status');
				
        if (nomeEl) nomeEl.innerText = nome;
        if (emailEl) emailEl.innerText = email;
		
        if (foto && fotoEl) {
            fotoEl.src = foto + (foto.includes("?") ? "&v=" : "?v=") + Date.now();
            fotoEl.style.display = "block";
            if (fallbackEl) fallbackEl.style.display = "none";
        } else {
            if (fotoEl) {
                fotoEl.removeAttribute('src');
                fotoEl.style.display = "none";
            }
            if (fallbackEl) fallbackEl.style.display = "flex";
        }

        let textoStatus = "Em análise";

        if (podeAceitar === true || statusAnalise === "aprovado") {
            textoStatus = "Aprovado";
        }

        if (
            statusAnalise === "reprovado" ||
            statusAnalise === "bloqueado" ||
            statusAnalise === "pendente_correcao"
        ) {
            textoStatus = "Pendência";
        }

        if (statusEl) statusEl.innerText = "Status: " + textoStatus;
        if (badgeEl) badgeEl.innerText = textoStatus;

    } catch (erro) {
        console.error("Erro ao preencher perfil do motorista:", erro);
    }
}

function MOTORISTAPAG_Login_func_formatarGeneroMotorista(genero) {
    if (genero === "masculino") return "Masculino";
    if (genero === "feminino") return "Feminino";
    if (genero === "outro") return "Outro";
    if (genero === "nao_informar") return "Prefiro não informar";

    return "-";
}

/* ==================================================
   MOTORISTA — EDITAR FOTO DE PERFIL
================================================== */

function MOTORISTAPAG_Login_func_editarFotoPerfilMotorista() {

    sessionStorage.setItem(
        "TNP_MOB_EDITANDO_FOTO_PERFIL",
        "true"
    );

    sessionStorage.setItem(
        "TNP_MOB_ORIGEM_EDICAO_FOTO_PERFIL",
        "perfil_motorista"
    );

    window.PRIMEIRAPAG_Login_fluxoSelfieAtual =
        "motorista";

    localStorage.setItem(
        "TNP_MOB_FLUXO_SELFIE_ATUAL",
        "motorista"
    );

    sessionStorage.setItem(
        "TNP_MOB_FLUXO_SELFIE_ATUAL",
        "motorista"
    );

    sessionStorage.removeItem(
        "TNP_MOB_CORRIGINDO_FOTO_PERFIL_ADMIN"
    );

    sessionStorage.removeItem(
        "TNP_MOB_ORIGEM_CORRECAO_FOTO_PERFIL"
    );

    window.location.href =
        "../../inicio/inicio.html";
}

/* ==================================================
   MOTORISTA — RETORNO DA EDIÇÃO DA FOTO DE PERFIL
================================================== */



async function MOTORISTAPAG_Login_func_receberRetornoEdicaoFotoPerfil() {
    const deveAbrirPerfil =
        sessionStorage.getItem(
            "TNP_MOB_ABRIR_PERFIL_MOTORISTA"
        ) === "true";

    if (!deveAbrirPerfil) return;

    if (
        typeof MOTORISTAPAG_Login_func_abrirModuloPerfilMotorista !== "function"
    ) {
        console.warn(
            "TNP MOB: função de abrir Perfil do Motorista ainda não disponível."
        );

        return;
    }

    try {
        const abriuPerfil =
			await MOTORISTAPAG_Login_func_abrirModuloPerfilMotorista();

		if (abriuPerfil === true) {
			sessionStorage.removeItem(
				"TNP_MOB_ABRIR_PERFIL_MOTORISTA"
			);
		}

    } catch (erro) {
        console.error(
            "TNP MOB: erro ao reabrir Perfil do Motorista após editar foto:",
            erro
        );
    }
}


/* ==================================================
   DISPONIBILIZAR GLOBALMENTE
================================================== */

window.MOTORISTAPAG_Login_func_carregarModuloPerfilMotorista =
    MOTORISTAPAG_Login_func_carregarModuloPerfilMotorista;

window.MOTORISTAPAG_Login_func_fecharPerfilMotorista =
    MOTORISTAPAG_Login_func_fecharPerfilMotorista;
	
window.MOTORISTAPAG_Login_func_preencherPerfilMotorista =
    MOTORISTAPAG_Login_func_preencherPerfilMotorista;

window.MOTORISTAPAG_Login_func_formatarGeneroMotorista =
    MOTORISTAPAG_Login_func_formatarGeneroMotorista;	
	
window.MOTORISTAPAG_Login_func_editarFotoPerfilMotorista =
    MOTORISTAPAG_Login_func_editarFotoPerfilMotorista;	
	
window.MOTORISTAPAG_Login_func_receberRetornoEdicaoFotoPerfil =
    MOTORISTAPAG_Login_func_receberRetornoEdicaoFotoPerfil;	
	
window.MOTORISTAPAG_Login_func_abrirModuloPerfilMotorista =
    MOTORISTAPAG_Login_func_abrirModuloPerfilMotorista;	



async function MOTORISTAPAG_Login_func_carregarModuloVeiculoEmUso() {
    const area = document.getElementById('MOTORISTAPAG_Login_area_veiculo_em_uso');

    if (!area) {
        console.error('Área do módulo Veículo em Uso não encontrada.');
        return false;
    }

    if (!document.getElementById('MOTORISTAPAG_Login_modal_veiculo_em_uso')) {
        try {
            const resposta = await fetch('perfil/veiculo-em-uso/veiculo-em-uso.html');

            if (!resposta.ok) {
                throw new Error('Não foi possível carregar veiculo-em-uso.html');
            }

            area.innerHTML = await resposta.text();

        } catch (erro) {
            console.error('Erro ao carregar módulo Veículo em Uso:', erro);
            return false;
        }
    }

    return true;
}


/* ==================================================
   VEÍCULO EM USO — FECHAR MODAL
================================================== */

function MOTORISTAPAG_Login_func_fecharVeiculoEmUso() {

    const modal =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_veiculo_em_uso"
        );

    /*
     * Fecha visualmente o modal.
     *
     * O Perfil do Motorista permanece
     * aberto por baixo.
     */
    if (modal) {

        modal.classList.remove(
            "active"
        );
    }

    /*
     * VEÍCULO EM USO — VOLTAR GLOBAL
     *
     * Remove a camada da pilha quando
     * o modal for fechado.
     */
    if (
        typeof TNP_MOB_func_removerCamadaVoltar ===
        "function"
    ) {
        TNP_MOB_func_removerCamadaVoltar(
            "motorista_veiculo_em_uso"
        );
    }
}



/* ==================================================
   VEÍCULO EM USO — ABRIR MODAL
================================================== */

async function MOTORISTAPAG_Login_func_abrirModalVeiculoEmUso() {

    const carregou =
        await MOTORISTAPAG_Login_func_carregarModuloVeiculoEmUso();

    if (!carregou) return;

    const modal =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_veiculo_em_uso"
        );

    if (modal) {

        modal.classList.add("active");

        /*
         * VEÍCULO EM USO — VOLTAR GLOBAL
         *
         * Registra a camada sobre o Perfil.
         */
        if (
            typeof TNP_MOB_func_registrarCamadaVoltar ===
            "function"
        ) {
            TNP_MOB_func_registrarCamadaVoltar(
                "motorista_veiculo_em_uso",
                MOTORISTAPAG_Login_func_fecharVeiculoEmUso
            );
        }
    }

    await MOTORISTAPAG_Login_func_carregarVeiculosEmUso();
}


async function MOTORISTAPAG_Login_func_carregarVeiculosEmUso() {
    const user = PRIMEIRAPAG_Login_auth.currentUser;
    const lista = document.getElementById('MOTORISTAPAG_Login_lista_veiculos_uso');

    if (!user || !lista) return;

    lista.innerHTML = `
        <div class="MOTORISTAPAG_Login_veiculo_uso_vazio">
            Carregando veículos...
        </div>
    `;
try {
    const motoristaRef = PRIMEIRAPAG_Login_db
        .collection('motoristas')
        .doc(user.uid);

    const doc = await motoristaRef.get();
    const dados = doc.exists ? doc.data() : {};

    const veiculos = Array.isArray(dados.veiculos) ? dados.veiculos : [];
    const veiculoAtualId = dados.veiculoAtualId || "";

    if (veiculos.length === 0) {
        lista.innerHTML = "";

        const vazio = document.createElement("div");
        vazio.className = "MOTORISTAPAG_Login_veiculo_uso_vazio";
        vazio.innerHTML =
            "Nenhum veículo cadastrado ainda.<br><br>" +
            "Para adicionar um veículo, acesse Configurações &gt; Gerenciar veículos.";

        lista.appendChild(vazio);
        return;
    }

    lista.innerHTML = "";
		
	[...veiculos]
		.sort(function(a, b) {
			return Number(b?.id === veiculoAtualId) -
				   Number(a?.id === veiculoAtualId);
		})
		.forEach(function(veiculo, index) {

        const id = veiculo.id || ("veiculo_" + (index + 1));
        const aprovado = veiculo.status === "aprovado";
        const ativo = aprovado && id === veiculoAtualId;

        const modelo = veiculo.modelo || "Veículo";
        const placa = veiculo.placa || "Placa não informada";
        const cor = veiculo.cor || "Cor não informada";
        const categoria =
				veiculo.categoriaPrincipal ||
				veiculo.categoria ||
				"Categoria não informada";

        const statusTexto = ativo
            ? "Em uso"
            : aprovado
                ? "Aprovado"
                : "Em análise";

        const card = document.createElement("div");
        card.className =
            "MOTORISTAPAG_Login_veiculo_uso_card" +
            (ativo ? " ativo" : "") +
            (!aprovado ? " em_analise" : "");

        const topo = document.createElement("div");
        topo.className = "MOTORISTAPAG_Login_veiculo_uso_topo";

        const titulo = document.createElement("strong");
        titulo.textContent = modelo;

        const status = document.createElement("span");
        status.textContent = statusTexto;

        topo.appendChild(titulo);
        topo.appendChild(status);

        const info = document.createElement("p");

	info.appendChild(
		document.createTextNode(
			`${placa || ''} • ${cor || ''}`
		)
	);

	info.appendChild(document.createElement("br"));

	info.appendChild(
		document.createTextNode(categoria || '')
	);

        const botao = document.createElement("button");

		botao.type = "button";

		if (aprovado) {
			botao.className =
			"TNP_btn_principal " +
			"MOTORISTAPAG_Login_veiculo_uso_btn";

			botao.textContent =
				ativo
					? "VEÍCULO EM USO"
					: "USAR ESTE VEÍCULO";

			botao.disabled = ativo;

			botao.addEventListener("click", function() {
				MOTORISTAPAG_Login_func_definirVeiculoEmUso(id);
			});

		} else {
			botao.className =
			"TNP_btn_secundario " +
			"MOTORISTAPAG_Login_veiculo_uso_btn";

			botao.textContent =
				"AGUARDANDO APROVAÇÃO";

			botao.disabled = true;
		}

        card.appendChild(topo);
        card.appendChild(info);
        card.appendChild(botao);

        lista.appendChild(card);
    });

} catch (erro) {
    console.error("Erro ao carregar veículos:", erro);

    lista.innerHTML = "";

    const vazioErro = document.createElement("div");
    vazioErro.className = "MOTORISTAPAG_Login_veiculo_uso_vazio";
    vazioErro.textContent = "Não foi possível carregar os veículos agora.";

    lista.appendChild(vazioErro);
}
}



/* ==================================================
   TNP MOB — MOTORISTA
   VEÍCULO EM USO

   LIMITE GLOBAL: 3 TROCAS POR DIA

   - Independe de categoria e subcategoria
   - Primeira seleção não conta
   - Mesmo veículo não conta
   - Renova diariamente no horário de Brasília
   - Firebase guarda o contador
   - Transação sincroniza veículo e contador
   - Preserva aprovações, documentos e demais veículos
================================================== */

async function MOTORISTAPAG_Login_func_definirVeiculoEmUso(veiculoId) {

    const user = PRIMEIRAPAG_Login_auth.currentUser;

    const idSelecionado = String(
        veiculoId || ''
    ).trim();

    if (!user || !idSelecionado) {
        return;
    }

    const LIMITE_DIARIO = 3;

    let gravouNoFirebase = false;

    /* ==============================================
       1. DATA NO HORÁRIO DE BRASÍLIA
    ============================================== */

    function obterDataBrasilia() {

        const partes = new Intl.DateTimeFormat(
            'pt-BR',
            {
                timeZone: 'America/Sao_Paulo',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }
        ).formatToParts(new Date());

        function valor(tipo) {
            return partes.find(
                parte => parte.type === tipo
            )?.value || '';
        }

        return [
            valor('year'),
            valor('month'),
            valor('day')
        ].join('-');
    }

    /* ==============================================
       2. VALIDAR QUANTIDADES DO CONTADOR
    ============================================== */

    function quantidadeValida(valor) {

        const numero = Number(valor);

        return Number.isSafeInteger(numero) && numero >= 0
            ? numero
            : 0;
    }

    try {

        /* ==============================================
           3. FIREBASE OFICIAL
        ============================================== */

        const motoristaRef = PRIMEIRAPAG_Login_db
            .collection('motoristas')
            .doc(user.uid);

        /* ==============================================
           4. TRANSAÇÃO DE TROCA
        ============================================== */

        const resultado = await PRIMEIRAPAG_Login_db
            .runTransaction(async function(transacao) {

                const snapshot = await transacao.get(
                    motoristaRef
                );

                if (!snapshot.exists) {
                    throw new Error(
                        'Cadastro do motorista não encontrado.'
                    );
                }

                const dados = snapshot.data() || {};

                const veiculos = Array.isArray(dados.veiculos)
                    ? dados.veiculos
                    : [];

                /* ======================================
                   5. IDENTIFICAR VEÍCULO SELECIONADO
                ====================================== */

                const selecionado = veiculos.find(
                    function(veiculo) {

                        return veiculo &&
                            String(veiculo.id || '').trim() ===
                            idSelecionado;
                    }
                );

                if (!selecionado) {
                    throw new Error(
                        'Veículo selecionado não encontrado.'
                    );
                }

                /* ======================================
                   6. VALIDAR APROVAÇÃO
                ====================================== */

                const statusVeiculo = String(
                    selecionado.status || ''
                ).trim().toLowerCase();

                if (statusVeiculo !== 'aprovado') {
                    throw new Error(
                        'Este veículo ainda não está aprovado.'
                    );
                }

                const documentos =
                    selecionado.documentos || {};

                const crlv = String(
                    documentos.crlv?.status || ''
                ).trim().toLowerCase();

                const foto = String(
                    documentos.fotoVeiculoPlaca?.status || ''
                ).trim().toLowerCase();

                if (
                    crlv !== 'aprovado' ||
                    foto !== 'aprovado'
                ) {
                    throw new Error(
                        'O CRLV e a foto do veículo precisam ' +
                        'estar aprovados.'
                    );
                }

                /* ======================================
                   7. IDENTIFICAR TROCA REAL

                   Não considera categoria.

                   Apenas troca quando o novo ID
                   é diferente do veículo atual.
                ====================================== */

                const idAnterior = String(
                    dados.veiculoAtualId || ''
                ).trim();

                const houveTroca =
                    Boolean(idAnterior) &&
                    idAnterior !== idSelecionado;

                /* ======================================
                   8. CARREGAR CONTADOR ÚNICO
                ====================================== */

                const dataHoje = obterDataBrasilia();

                const controle =
                    dados.trocasVeiculoDiarias || {};

                let quantidade = 0;

                if (controle.data === dataHoje) {

                    quantidade = quantidadeValida(
                        controle.quantidade
                    );

                } else {

                    /* ==================================
                       COMPATIBILIDADE TRANSITÓRIA

                       Caso a versão anterior por
                       categorias tenha sido utilizada
                       hoje, aproveita a soma.

                       Se não houver registro anterior,
                       começa em zero.

                       Não exclui campos antigos.
                    ================================== */

                    const antigo =
                        dados.trocasVeiculoPorCategoria || {};

                    if (antigo.data === dataHoje) {

                        quantidade =
                            quantidadeValida(antigo.carro) +
                            quantidadeValida(antigo.moto);
                    }
                }

                /* ======================================
                   9. APLICAR LIMITE DE 3 TROCAS

                   Independe da categoria do veículo.
                ====================================== */

                if (houveTroca) {

                    if (quantidade >= LIMITE_DIARIO) {

                        const erro = new Error(
                            'Você atingiu o limite de ' +
                            LIMITE_DIARIO +
                            ' trocas de veículo por dia.\n\n' +
                            'Continue utilizando o veículo ' +
                            'atualmente selecionado.\n\n' +
                            'Novas trocas estarão disponíveis amanhã.'
                        );

                        erro.codigo = 'LIMITE_TROCAS_DIARIAS';

                        throw erro;
                    }

                    quantidade++;
                }

                /* ======================================
                   10. SINCRONIZAR VEÍCULO EM USO
                ====================================== */

                const veiculosAtualizados = veiculos.map(
                    function(veiculo) {

                        if (
                            !veiculo ||
                            typeof veiculo !== 'object'
                        ) {
                            return veiculo;
                        }

                        return {
                            ...veiculo,

                            emUso:
                                String(veiculo.id || '').trim() ===
                                idSelecionado
                        };
                    }
                );

                /* ======================================
                   11. SALVAR VEÍCULO E CONTADOR

                   Uma única transação no Firestore.
                ====================================== */

                transacao.update(motoristaRef, {

                    veiculoAtualId: idSelecionado,

                    veiculos: veiculosAtualizados,

                    trocasVeiculoDiarias: {
                        data: dataHoje,
                        quantidade: quantidade
                    },

                    veiculoAtualizadoEm:
                        firebase.firestore.FieldValue
                            .serverTimestamp(),

                    atualizadoEm:
                        firebase.firestore.FieldValue
                            .serverTimestamp()
                });

                return {
                    veiculoAnterior: idAnterior,
                    veiculoAtual: idSelecionado,
                    houveTroca: houveTroca,
                    data: dataHoje,
                    quantidade: quantidade,
                    restantes: Math.max(
                        0,
                        LIMITE_DIARIO - quantidade
                    )
                };
            });

        /* ==============================================
           12. ATUALIZAR INTERFACE
        ============================================== */

        gravouNoFirebase = true;

        const badge = document.getElementById(
            'MOTORISTAPAG_Login_perfil_badge_veiculo'
        );

        if (badge) {
            badge.innerText = 'Selecionado';
        }

        await MOTORISTAPAG_Login_func_carregarVeiculosEmUso();

        console.info(
            'TNP MOB — Controle diário de veículos:',
            resultado
        );

    } catch (erro) {

        console.error(
            'Erro ao definir veículo em uso:',
            erro
        );

        /* ==============================================
           13. LIMITE ATINGIDO
        ============================================== */

        if (erro?.codigo === 'LIMITE_TROCAS_DIARIAS') {

            alert(erro.message);
            return;
        }

        const mensagem = gravouNoFirebase
            ? (
                'A seleção foi salva no Firebase, mas ' +
                'houve um problema ao atualizar a tela.'
            )
            : (
                erro?.message ||
                'Não foi possível selecionar o veículo.'
            );

        if (
            typeof MOTORISTAPAG_Login_func_abrirPaginaProvisoria
                === 'function'
        ) {

            MOTORISTAPAG_Login_func_abrirPaginaProvisoria(
                gravouNoFirebase
                    ? 'Atualização da tela'
                    : 'Erro ao selecionar veículo',
                mensagem
            );

        } else {
            alert(mensagem);
        }
    }
}



window.MOTORISTAPAG_Login_func_carregarModuloVeiculoEmUso =
    MOTORISTAPAG_Login_func_carregarModuloVeiculoEmUso;

window.MOTORISTAPAG_Login_func_fecharVeiculoEmUso =
    MOTORISTAPAG_Login_func_fecharVeiculoEmUso;

window.MOTORISTAPAG_Login_func_abrirModalVeiculoEmUso =
    MOTORISTAPAG_Login_func_abrirModalVeiculoEmUso;

window.MOTORISTAPAG_Login_func_carregarVeiculosEmUso =
    MOTORISTAPAG_Login_func_carregarVeiculosEmUso;

window.MOTORISTAPAG_Login_func_definirVeiculoEmUso =
    MOTORISTAPAG_Login_func_definirVeiculoEmUso;

/* ==================================================
   PERFIL DO MOTORISTA — TERMOS DO MOTORISTA
   MODO CONSULTA
================================================== */


/* ==================================================
   ABRIR MÓDULO
================================================== */


/* ==================================================
   PERFIL DO MOTORISTA — TERMOS DO MOTORISTA
   MODO CONSULTA — ABRIR MÓDULO
================================================== */

async function MOTORISTAPAG_Login_func_abrirTermosMotoristaPerfil() {

    const area = document.getElementById(
        'MOTORISTAPAG_Login_area_termos_motorista'
    );

    if (!area) {
        console.error(
            'Área do módulo Termos do Motorista não encontrada.'
        );

        return false;
    }

    if (
        !document.getElementById(
            'MOTORISTAPAG_Login_modal_termos_motorista_perfil'
        )
    ) {
        try {
            const resposta = await fetch(
                'perfil/termos-motorista/termos-motorista.html'
            );

            if (!resposta.ok) {
                throw new Error(
                    'Não foi possível carregar termos-motorista.html'
                );
            }

            area.innerHTML =
                await resposta.text();

        } catch (erro) {
            console.error(
                'Erro ao carregar módulo Termos do Motorista:',
                erro
            );

            return false;
        }
    }

    const modal = document.getElementById(
        'MOTORISTAPAG_Login_modal_termos_motorista_perfil'
    );

    if (!modal) {
        console.error(
            'Modal Termos do Motorista não encontrado.'
        );

        return false;
    }

    modal.classList.add('active');

    /*
     * TERMOS DO MOTORISTA — VOLTAR GLOBAL
     *
     * Registra a camada filha sobre
     * o Perfil do Motorista.
     */
    if (
        typeof TNP_MOB_func_registrarCamadaVoltar ===
        "function"
    ) {
        TNP_MOB_func_registrarCamadaVoltar(
            "motorista_termos_perfil",
            MOTORISTAPAG_Login_func_fecharTermosMotoristaPerfil
        );
    }

    await MOTORISTAPAG_Login_func_carregarTermosMotoristaPerfil();

    return true;
}


/* ==================================================
   FECHAR MÓDULO
================================================== */


/* ==================================================
   PERFIL DO MOTORISTA — TERMOS DO MOTORISTA
   MODO CONSULTA — FECHAR MÓDULO
================================================== */

function MOTORISTAPAG_Login_func_fecharTermosMotoristaPerfil() {

    const modal =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_termos_motorista_perfil"
        );

    /*
     * Fecha visualmente os Termos.
     *
     * O Perfil do Motorista permanece
     * aberto por baixo.
     */
    if (modal) {

        modal.classList.remove(
            "active"
        );
    }

    /*
     * TERMOS DO MOTORISTA — VOLTAR GLOBAL
     *
     * Remove a camada da pilha quando
     * os Termos forem fechados.
     */
    if (
        typeof TNP_MOB_func_removerCamadaVoltar ===
        "function"
    ) {
        TNP_MOB_func_removerCamadaVoltar(
            "motorista_termos_perfil"
        );
    }
}


/* ==================================================
   CARREGAR TERMOS PUBLICADOS
================================================== */

async function MOTORISTAPAG_Login_func_carregarTermosMotoristaPerfil() {
    const titulo = document.getElementById(
        'MOTORISTAPAG_Login_termos_motorista_perfil_titulo_publicado'
    );

    const versao = document.getElementById(
        'MOTORISTAPAG_Login_termos_motorista_perfil_versao'
    );

    const status = document.getElementById(
        'MOTORISTAPAG_Login_termos_motorista_perfil_status'
    );

    const conteudo = document.getElementById(
        'MOTORISTAPAG_Login_termos_motorista_perfil_texto'
    );

    const botaoTentar = document.getElementById(
        'MOTORISTAPAG_Login_btn_tentar_novamente_termos_motorista_perfil'
    );

    if (titulo) {
        titulo.textContent =
            'Termos e Condições do Motorista';
    }

    if (versao) {
        versao.textContent =
            'Consultando versão atual...';
    }

    if (status) {
        status.style.display = 'flex';
        status.textContent =
            'Carregando termos publicados...';
    }

    if (conteudo) {
        conteudo.style.display = 'none';
        conteudo.innerHTML = '';
    }

    if (botaoTentar) {
        botaoTentar.style.display = 'none';
    }

    try {
        const configuracao =
            await TNP_MOB_func_obterConfiguracaoTermos(
                'motorista'
            );

        const dados =
            configuracao.dados || {};

        const conteudoTexto =
            String(
                dados.conteudoTexto ||
                dados.conteudo ||
                ''
            ).trim();

        let conteudoHtml =
            String(
                dados.conteudoHtml ||
                ''
            ).trim();


        /* TEXTO SIMPLES */

        if (!conteudoHtml && conteudoTexto) {
            const temporario =
                document.createElement('div');

            temporario.textContent =
                conteudoTexto;

            conteudoHtml =
                temporario.innerHTML
                    .split(/\n{2,}/)
                    .map(function(paragrafo) {
                        return '<p>' +
                            paragrafo.replace(/\n/g, '<br>') +
                            '</p>';
                    })
                    .join('');
        }


        /* SANITIZAÇÃO LOCAL */

        const template =
            document.createElement('template');

        template.innerHTML =
            conteudoHtml;

        const permitidas = new Set([
            'A',
            'P',
            'BR',
            'STRONG',
            'B',
            'EM',
            'I',
            'H2',
            'H3',
            'UL',
            'OL',
            'LI'
        ]);

        const remover = new Set([
            'SCRIPT',
            'STYLE',
            'IFRAME',
            'OBJECT',
            'EMBED',
            'FORM',
            'INPUT',
            'BUTTON',
            'LINK',
            'META',
            'SVG',
            'MATH'
        ]);

        function limpar(elementoPai) {
            Array.from(
                elementoPai.children
            ).forEach(function(elemento) {
                limpar(elemento);

                const tag =
                    elemento.tagName.toUpperCase();

                if (remover.has(tag)) {
                    elemento.remove();
                    return;
                }

                if (!permitidas.has(tag)) {
                    elemento.replaceWith(
                        ...Array.from(
                            elemento.childNodes
                        )
                    );

                    return;
                }

                Array.from(
                    elemento.attributes
                ).forEach(function(atributo) {
                    elemento.removeAttribute(
                        atributo.name
                    );
                });
            });
        }

        limpar(template.content);

        conteudoHtml =
            template.innerHTML.trim();


        if (!conteudoHtml) {
            throw new Error(
                'A versão publicada não possui conteúdo.'
            );
        }


        if (titulo) {
            titulo.textContent =
                dados.titulo ||
                'Termos e Condições do Motorista';
        }

        if (versao) {
            versao.textContent =
                'Versão ' +
                configuracao.versaoConteudo;
        }

        if (conteudo) {
            conteudo.innerHTML =
                conteudoHtml;

            conteudo.style.display =
                'block';
        }

        if (status) {
            status.style.display =
                'none';
        }

        console.log(
            'TNP MOB: Termos do Motorista carregados para consulta.'
        );

        return true;

    } catch (erro) {
        console.error(
            'Erro ao carregar Termos do Motorista no Perfil:',
            erro
        );

        if (versao) {
            versao.textContent =
                'Termos indisponíveis';
        }

        if (status) {
            status.style.display =
                'flex';

            status.textContent =
                'Não foi possível carregar os termos atuais.';
        }

        if (botaoTentar) {
            botaoTentar.style.display =
                'flex';
        }

        return false;
    }
}

/* ==================================================
   DISPONIBILIZAR GLOBALMENTE
================================================== */

window.MOTORISTAPAG_Login_func_abrirTermosMotoristaPerfil =
    MOTORISTAPAG_Login_func_abrirTermosMotoristaPerfil;
	
window.MOTORISTAPAG_Login_func_fecharTermosMotoristaPerfil =
    MOTORISTAPAG_Login_func_fecharTermosMotoristaPerfil;	
	
window.MOTORISTAPAG_Login_func_carregarTermosMotoristaPerfil =
    MOTORISTAPAG_Login_func_carregarTermosMotoristaPerfil;	

// -- HOME DO MOTORISTA — MODAL STATUS DO CADASTRO -->
/* ==================================================
   MOTORISTA — PERFIL — STATUS DO CADASTRO
================================================== */


/* ==================================================
   CARREGAR MÓDULO
================================================== */

async function MOTORISTAPAG_Login_func_carregarModuloStatusCadastro() {
    const area = document.getElementById('MOTORISTAPAG_Login_area_status_cadastro');

    if (!area) {
        console.error('Área do módulo Status do Cadastro não encontrada.');
        return false;
    }

    if (!document.getElementById('MOTORISTAPAG_Login_modal_status_cadastro')) {
        try {
            const resposta = await fetch('perfil/status-cadastro/status-cadastro.html');

            if (!resposta.ok) {
                throw new Error('Não foi possível carregar status-cadastro.html');
            }

            area.innerHTML = await resposta.text();

        } catch (erro) {
            console.error('Erro ao carregar módulo Status do Cadastro:', erro);
            return false;
        }
    }

    return true;
}


/* ==================================================
   FECHAR STATUS
================================================== */


/* ==================================================
   STATUS DO CADASTRO — FECHAR MODAL
================================================== */

function MOTORISTAPAG_Login_func_fecharStatusCadastro() {

    const modal =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_status_cadastro"
        );

    /*
     * Fecha visualmente o modal.
     *
     * O Perfil do Motorista permanece
     * aberto por baixo.
     */
    if (modal) {

        modal.classList.remove(
            "active"
        );
    }

    /*
     * STATUS DO CADASTRO — VOLTAR GLOBAL
     *
     * Remove a camada da pilha quando
     * o modal for fechado.
     */
    if (
        typeof TNP_MOB_func_removerCamadaVoltar ===
        "function"
    ) {
        TNP_MOB_func_removerCamadaVoltar(
            "motorista_status_cadastro"
        );
    }
}



/* ==================================================
   ABRIR STATUS DO CADASTRO
================================================== */

async function MOTORISTAPAG_Login_func_abrirModalStatusCadastro() {
    const carregou = await MOTORISTAPAG_Login_func_carregarModuloStatusCadastro();

    if (!carregou) return;

    const modal = document.getElementById('MOTORISTAPAG_Login_modal_status_cadastro');
    const titulo = document.getElementById('MOTORISTAPAG_Login_status_cadastro_titulo');
    const texto = document.getElementById('MOTORISTAPAG_Login_status_cadastro_texto');
    const lista = document.querySelector('.MOTORISTAPAG_Login_status_cadastro_lista');
    const icone = document.querySelector('.MOTORISTAPAG_Login_status_cadastro_icone');

    if (!modal) {
        console.warn('Modal Status do Cadastro não encontrado.');
        return;
    }

		modal.classList.add('active');

	/*
	 * STATUS DO CADASTRO — VOLTAR GLOBAL
     *
     * Registra o modal como camada filha
     * do Perfil do Motorista.
     */
    if (
        typeof TNP_MOB_func_registrarCamadaVoltar ===
        "function"
    ) {
        TNP_MOB_func_registrarCamadaVoltar(
            "motorista_status_cadastro",
            MOTORISTAPAG_Login_func_fecharStatusCadastro
        );
    }

    const user = PRIMEIRAPAG_Login_auth.currentUser;


    if (!user) {
        if (titulo) titulo.innerText = 'Usuário não encontrado';
        if (texto) texto.innerText = 'Faça login novamente para consultar o status do cadastro.';
        return;
    }

    try {
        const userDoc = await PRIMEIRAPAG_Login_db
            .collection('usuarios')
            .doc(user.uid)
            .get();

        const motoristaDoc = await PRIMEIRAPAG_Login_db
            .collection('motoristas')
            .doc(user.uid)
            .get();

        
		const u = userDoc.exists ? userDoc.data() : {};
		const m = motoristaDoc.exists ? motoristaDoc.data() : {};

		/* ==================================================
		   SELFIE DE PERFIL — STATUS ADMINISTRATIVO
		   Independente da selfie com CNH
		================================================== */

		const pendenciaSelfiePerfil =
			m.pendenciasAdminMotorista?.fotoPerfil ||
			u.pendenciasAdminMotorista?.fotoPerfil ||
			{};

		const statusSelfiePerfil = String(
			m.fotoPerfilStatus ||
			m.selfieStatus ||
			pendenciaSelfiePerfil.status ||
			(m.fotoPerfilEnviada === true ? 'enviada' : '')
		).trim().toLowerCase();

		const statusPendenciaSelfiePerfil = String(
			pendenciaSelfiePerfil.status || ''
		).trim().toLowerCase();

		const selfiePerfilRevisao =
			m.bloqueadoPorSelfieInadequada === true ||
			['pendente_correcao', 'reprovado', 'recusado', 'corrigir']
				.includes(statusSelfiePerfil) ||
			['aguardando_envio', 'pendente_envio', 'pendente_correcao',
			 'reprovado', 'recusado', 'corrigir']
				.includes(statusPendenciaSelfiePerfil);

		const selfiePerfilOk =
			!selfiePerfilRevisao &&
			(
				statusSelfiePerfil === 'aprovado' ||
				statusPendenciaSelfiePerfil === 'aprovado'
			);

		const statusGeral =

            m.status?.geral ||
            u.status?.geral ||
            m.statusAnalise ||
            u.statusAnalise ||
            m.motoristaStatus ||
            u.motoristaStatus ||
            'em_analise';

        const requerAnaliseAdmin =
            m.requerAnaliseAdmin === true ||
            u.requerAnaliseAdmin === true;

        const fotoCnhStatus =
            m.documentosMotorista?.fotoCnh?.status || '';

        const selfieCnhStatus =
            m.documentosMotorista?.selfieComCnh?.status || '';

        const veiculoAtualId =
			m.veiculoAtualId ||
			m.veiculoCadastroAtualId ||
			'';

		const veiculoAtual = Array.isArray(m.veiculos)
			? (
				m.veiculos.find(v => v && v.id === veiculoAtualId) ||
				m.veiculos.find(v => v && v.emUso === true) ||
				m.veiculos[0] ||
				null
			)
			: null;

        const fotoCnhOk =
            fotoCnhStatus === 'aprovado';

        const selfieCnhOk =
            selfieCnhStatus === 'aprovado';

        const documentosMotoristaOk =
            fotoCnhOk && selfieCnhOk;

        const crlvStatusTopo =
            m.documentosVeiculo?.crlv?.status ||
            veiculoAtual?.documentos?.crlv?.status ||
            '';

        const fotoVeiculoPlacaStatusTopo =
            m.documentosVeiculo?.fotoVeiculoPlaca?.status ||
            veiculoAtual?.documentos?.fotoVeiculoPlaca?.status ||
            '';

        const documentosVeiculoOk =
            crlvStatusTopo === 'aprovado' &&
            fotoVeiculoPlacaStatusTopo === 'aprovado';

        const pixOk =
            m.pixConfirmacaoRecebimento?.pago === true ||
            m.pixConfirmacaoRecebimento?.status === 'pago';

        const termosOk =
            m.termosMotoristaAceitos === true;

        const idTnpOk =
            m.idTnpInformado === true ||
            m.idTnpConcluido === true;

        const cadastroOk =
            m.cadastroAprovado === true &&
            requerAnaliseAdmin !== true &&
            statusGeral === 'aprovado';

        let statusFinal = 'pendente';
				
		const tudoAprovado =
			selfiePerfilOk === true &&
			documentosMotoristaOk === true &&
			documentosVeiculoOk === true &&
			pixOk === true &&
			termosOk === true &&
			idTnpOk === true;
				
		const temBloqueioReal =
			selfiePerfilRevisao === true ||
			statusGeral === 'reprovado' ||
			statusGeral === 'bloqueado' ||
			statusGeral === 'pendente_correcao';

				
		const temDocumentoEmAnalise =
			(
				!selfiePerfilRevisao &&
				[
					'enviada',
					'pendente_analise',
					'em_analise',
					'aguardando_analise'
				].includes(statusSelfiePerfil)
			) ||
			fotoCnhStatus === 'pendente_analise' ||
			selfieCnhStatus === 'pendente_analise' ||
			crlvStatusTopo === 'pendente_analise' ||
			fotoVeiculoPlacaStatusTopo === 'pendente_analise';


        const motoristaLiberado =
            m.podeAceitarCorrida === true ||
            m.cadastroAprovado === true ||
            m.statusAnalise === 'aprovado' ||
            m.motoristaStatus === 'aprovado';

        if (temBloqueioReal) {
            statusFinal = 'pendencia';

        } else if (
            tudoAprovado === true &&
            motoristaLiberado === true
        ) {
            statusFinal = 'aprovado';

        } else if (
            temDocumentoEmAnalise === true ||
            statusGeral === 'pendente_analise_admin'
        ) {
            statusFinal = 'analise';
        }


        /* ==================================================
           RESUMO GERAL
        ================================================== */

        if (statusFinal === 'aprovado') {
            if (icone) icone.innerText = '✅';
            if (titulo) titulo.innerText = 'Cadastro aprovado';

            if (texto) {
                texto.innerText =
                    'Seu cadastro de motorista foi aprovado. Você já pode ficar online para receber chamadas.';
            }
        }

        if (statusFinal === 'analise') {
            if (icone) icone.innerText = '⏳';
            if (titulo) titulo.innerText = 'Cadastro em análise';

            if (texto) {
                texto.innerText =
                    'Seus dados foram enviados e estão em análise. Assim que forem aprovados, você poderá receber chamadas.';
            }
        }

        if (statusFinal === 'pendente') {
            if (icone) icone.innerText = '⚠️';
            if (titulo) titulo.innerText = 'Cadastro pendente';

            if (texto) {
                texto.innerText =
                    'Ainda existem etapas obrigatórias para concluir antes de receber chamadas.';
            }
        }

        if (statusFinal === 'pendencia') {
            if (icone) icone.innerText = '🚫';
            if (titulo) titulo.innerText = 'Cadastro com pendência';

            if (texto) {
                texto.innerText =
                    'Existe uma pendência no cadastro. Revise as informações ou aguarde orientação do suporte.';
            }
        }


        /* ==================================================
           ETAPAS
        ================================================== */

        if (lista) {
            function criarCardStatus(nome, status, textoAuxiliar, acaoTexto, acaoFuncao) {
                let iconeStatus = '⚠️';
                let classeEstado = 'pendente';
                let statusTexto = 'Pendente';

                if (status === 'ok') {
                    iconeStatus = '✅';
                    classeEstado = 'concluido';
                    statusTexto = 'Concluído';
                }

                if (status === 'analise') {
                    iconeStatus = '⏳';
                    classeEstado = 'atual';
                    statusTexto = 'Em análise';
                }

                if (status === 'revisao') {
                    iconeStatus = '❌';
                    classeEstado = 'corrigir';
                    statusTexto = 'Corrigir';
                }

                const botao = acaoTexto && acaoFuncao
                    ? '<button type="button" class="TNP_btn_pilula MOTORISTAPAG_Login_status_card_acao" onclick="' + acaoFuncao + '">' + acaoTexto + '</button>'
                    : '';

                return `
                    <div class="MOTORISTAPAG_Login_status_card">

                        <div class="TNP_btn_etapa_status ${classeEstado}">
                            <span>${iconeStatus}</span>
                            <strong>${nome}</strong>
                            <small>${statusTexto}</small>
                        </div>

                        <div class="MOTORISTAPAG_Login_status_card_texto">
                            ${textoAuxiliar}
                        </div>

                        ${botao}

                    </div>
                `;
            }


            const crlvStatus =
                m.documentosVeiculo?.crlv?.status ||
                veiculoAtual?.documentos?.crlv?.status ||
                '';

            const fotoVeiculoPlacaStatus =
                m.documentosVeiculo?.fotoVeiculoPlaca?.status ||
                veiculoAtual?.documentos?.fotoVeiculoPlaca?.status ||
                '';

            const fotoCnhRevisao =
                fotoCnhStatus === 'reprovado' ||
                fotoCnhStatus === 'pendente_correcao' ||
                fotoCnhStatus === 'corrigir';

            const selfieCnhRevisao =
                selfieCnhStatus === 'reprovado' ||
                selfieCnhStatus === 'pendente_correcao' ||
                selfieCnhStatus === 'corrigir';

            const crlvRevisao =
                crlvStatus === 'reprovado' ||
                crlvStatus === 'pendente_correcao' ||
                crlvStatus === 'corrigir';

            const fotoVeiculoPlacaRevisao =
                fotoVeiculoPlacaStatus === 'reprovado' ||
                fotoVeiculoPlacaStatus === 'pendente_correcao' ||
                fotoVeiculoPlacaStatus === 'corrigir';


            lista.innerHTML = `
                ${criarCardStatus(
                    'Cadastro do motorista',
                    cadastroOk
                        ? 'ok'
                        : statusFinal === 'analise'
                            ? 'analise'
                            : 'pendente',
                    cadastroOk
                        ? 'Cadastro liberado pelo administrador.'
                        : 'Seu cadastro ainda depende da análise final do administrador.',
                    '',
                    ''
                )}
								
                ${criarCardStatus(
                    'Selfie / foto de perfil',
                    selfiePerfilOk
                        ? 'ok'
                        : selfiePerfilRevisao
                            ? 'revisao'
                            : 'analise',
                    selfiePerfilOk
                        ? 'Selfie de perfil aprovada pelo administrador.'
                        : selfiePerfilRevisao
                            ? 'O administrador solicitou uma nova selfie de perfil.'
                            : 'Selfie de perfil aguardando análise.',
                    '',
                    ''
                )}

                ${criarCardStatus(
                    'Foto da CNH',
                    fotoCnhOk
                        ? 'ok'
                        : fotoCnhRevisao
                            ? 'revisao'
                            : 'analise',
                    fotoCnhOk
                        ? 'Foto da CNH aprovada.'
                        : fotoCnhRevisao
                            ? 'O administrador pediu correção da foto da CNH.'
                            : 'Foto da CNH aguardando análise.',
                    fotoCnhRevisao
                        ? 'Reenviar foto da CNH'
                        : '',
                    fotoCnhRevisao
                        ? "TNP_Login_func_abrirModalCorrigirPendencia('motorista', 'fotoCnh')"
                        : ''
                )}

                ${criarCardStatus(
                    'Selfie com CNH',
                    selfieCnhOk
                        ? 'ok'
                        : selfieCnhRevisao
                            ? 'revisao'
                            : 'analise',
                    selfieCnhOk
                        ? 'Selfie com CNH aprovada.'
                        : selfieCnhRevisao
                            ? 'O administrador pediu correção da selfie com CNH.'
                            : 'Selfie com CNH aguardando análise.',
                    selfieCnhRevisao
                        ? 'Reenviar selfie com CNH'
                        : '',
                    selfieCnhRevisao
                        ? "TNP_Login_func_abrirModalCorrigirPendencia('motorista', 'selfieComCnh')"
                        : ''
                )}

                ${criarCardStatus(
                    'CRLV / Documento do veículo',
                    crlvStatus === 'aprovado'
                        ? 'ok'
                        : crlvRevisao
                            ? 'revisao'
                            : 'analise',
                    crlvStatus === 'aprovado'
                        ? 'Documento do veículo aprovado.'
                        : crlvRevisao
                            ? 'O administrador pediu correção do documento do veículo.'
                            : 'Documento do veículo aguardando análise.',
                    crlvRevisao
                        ? 'Reenviar CRLV'
                        : '',
                    crlvRevisao
                        ? "TNP_Login_func_abrirModalCorrigirPendencia('motorista', 'crlv')"
                        : ''
                )}

                ${criarCardStatus(
                    'Foto do veículo com placa',
                    fotoVeiculoPlacaStatus === 'aprovado'
                        ? 'ok'
                        : fotoVeiculoPlacaRevisao
                            ? 'revisao'
                            : 'analise',
                    fotoVeiculoPlacaStatus === 'aprovado'
                        ? 'Foto do veículo com placa aprovada.'
                        : fotoVeiculoPlacaRevisao
                            ? 'O administrador pediu correção da foto do veículo com placa.'
                            : 'Foto do veículo com placa aguardando análise.',
                    fotoVeiculoPlacaRevisao
                        ? 'Reenviar foto do veículo'
                        : '',
                    fotoVeiculoPlacaRevisao
                        ? "TNP_Login_func_abrirModalCorrigirPendencia('motorista', 'fotoVeiculoPlaca')"
                        : ''
                )}

                ${criarCardStatus(
                    'Pix para recebimento',
                    pixOk ? 'ok' : 'pendente',
                    pixOk
                        ? 'Conta de recebimento confirmada.'
                        : 'Confirme o Pix para liberar recebimentos.',
                    '',
                    ''
                )}

                ${criarCardStatus(
                    'Termos do motorista',
                    termosOk ? 'ok' : 'pendente',
                    termosOk
                        ? 'Termos do motorista aceitos.'
                        : 'Você precisa aceitar os termos do motorista.',
                    '',
                    ''
                )}

                ${criarCardStatus(
                    'ID TNP / Cashback',
                    idTnpOk ? 'ok' : 'pendente',
                    idTnpOk
                        ? 'ID TNP informado e vinculado ao cadastro.'
                        : 'Informe seu ID TNP para concluir essa etapa.',
                    '',
                    ''
                )}
            `;
        }

    } catch (erro) {
        console.error('Erro ao carregar status do cadastro:', erro);

        if (icone) icone.innerText = '⚠️';
        if (titulo) titulo.innerText = 'Erro ao carregar status';

        if (texto) {
            texto.innerText =
                'Não foi possível consultar o status agora. Tente novamente em instantes.';
        }
    }
}

/* ==================================================
   DISPONIBILIZAR GLOBALMENTE
================================================== */

window.MOTORISTAPAG_Login_func_carregarModuloStatusCadastro =
    MOTORISTAPAG_Login_func_carregarModuloStatusCadastro;

window.MOTORISTAPAG_Login_func_fecharStatusCadastro =
    MOTORISTAPAG_Login_func_fecharStatusCadastro;

window.MOTORISTAPAG_Login_func_abrirModalStatusCadastro =
    MOTORISTAPAG_Login_func_abrirModalStatusCadastro;










// -- HOME DO MOTORISTA — MODAL STATUS DO CADASTRO FINAL-->



/* ==================================================
   PERFIL DO MOTORISTA — PIX DO MOTORISTA
================================================== */
var MOTORISTAPAG_Login_pixMotoristaAtual = null;

/* ==================================================
   ABRIR MÓDULO
================================================== */

async function MOTORISTAPAG_Login_func_abrirPixMotorista(modo) {
    const area = document.getElementById(
        'MOTORISTAPAG_Login_area_pix_motorista'
    );

    if (!area) {
        console.error(
            'Área do módulo Pix do motorista não encontrada.'
        );

        return false;
    }

    if (
        !document.getElementById(
            'MOTORISTAPAG_Login_modal_pix_motorista'
        )
    ) {
        try {
            const resposta = await fetch(
                'perfil/pix-motorista/pix-motorista.html'
            );

            if (!resposta.ok) {
                throw new Error(
                    'Não foi possível carregar pix-motorista.html'
                );
            }

            area.innerHTML =
                await resposta.text();

        } catch (erro) {
            console.error(
                'Erro ao carregar módulo Pix do motorista:',
                erro
            );

            return false;
        }
    }

    const modal = document.getElementById(
        'MOTORISTAPAG_Login_modal_pix_motorista'
    );

    const estadoGerar = document.getElementById(
        'MOTORISTAPAG_Login_pix_motorista_estado_gerar'
    );

    const estadoCadastrar = document.getElementById(
        'MOTORISTAPAG_Login_pix_motorista_estado_cadastrar'
    );

    const acoesGerar = document.getElementById(
        'MOTORISTAPAG_Login_pix_motorista_acoes_gerar'
    );

    const acoesCadastrar = document.getElementById(
        'MOTORISTAPAG_Login_pix_motorista_acoes_cadastrar'
    );

    if (
        !modal ||
        !estadoGerar ||
        !estadoCadastrar ||
        !acoesGerar ||
        !acoesCadastrar
    ) {
        console.error(
            'Estrutura do módulo Pix do motorista incompleta.'
        );

        return false;
    }

    estadoGerar.classList.remove('active');
    estadoCadastrar.classList.remove('active');

    acoesGerar.classList.remove('active');
    acoesCadastrar.classList.remove('active');

    if (modo === 'cadastrar') {
        estadoCadastrar.classList.add('active');
        acoesCadastrar.classList.add('active');

    } else {
        estadoGerar.classList.add('active');
        acoesGerar.classList.add('active');
    }

    
    modal.classList.add('active');

    /*
     * PIX DO MOTORISTA — VOLTAR GLOBAL
     *
     * Registra o modal como camada filha
     * do Perfil do Motorista.
     *
     * Funciona tanto para Gerar PIX
     * quanto para Cadastrar PIX.
     */
    if (
        typeof TNP_MOB_func_registrarCamadaVoltar ===
        "function"
    ) {
        TNP_MOB_func_registrarCamadaVoltar(
            "motorista_pix_perfil",
            MOTORISTAPAG_Login_func_fecharPixMotorista
        );
    }

    await MOTORISTAPAG_Login_func_carregarPixMotorista();


    return true;
}

/* ==================================================
   ENTRADAS PELOS BOTÕES DO PERFIL
================================================== */

function MOTORISTAPAG_Login_func_abrirGerarPixMotorista() {
    return MOTORISTAPAG_Login_func_abrirPixMotorista(
        'gerar'
    );
}


function MOTORISTAPAG_Login_func_abrirCadastrarPixMotorista() {
    return MOTORISTAPAG_Login_func_abrirPixMotorista(
        'cadastrar'
    );
}

/* ==================================================
   FECHAR MÓDULO
================================================== */


/* ==================================================
   PIX DO MOTORISTA — FECHAR MÓDULO
================================================== */

function MOTORISTAPAG_Login_func_fecharPixMotorista() {

    const modal =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_pix_motorista"
        );

    /*
     * Fecha visualmente o modal.
     *
     * O Perfil do Motorista permanece
     * aberto por baixo.
     */
    if (modal) {

        modal.classList.remove(
            "active"
        );
    }

    /*
     * PIX DO MOTORISTA — VOLTAR GLOBAL
     *
     * Remove a camada da pilha quando
     * o modal for fechado.
     */
    if (
        typeof TNP_MOB_func_removerCamadaVoltar ===
        "function"
    ) {
        TNP_MOB_func_removerCamadaVoltar(
            "motorista_pix_perfil"
        );
    }
}


/* ==================================================
   CARREGAR PIX SALVO
================================================== */

async function MOTORISTAPAG_Login_func_carregarPixMotorista() {
    let user = null;

    try {
        user = await TNP_MOB_func_aguardarUsuarioAutenticado(8000);

    } catch (erroSessao) {
        console.warn(
            "Sessão não restaurada ao carregar Pix:",
            erroSessao
        );

        return null;
    }

    try {
        const snap = await PRIMEIRAPAG_Login_db
            .collection("motoristas")
            .doc(user.uid)
            .get();

        const dados =
            snap.exists
                ? snap.data()
                : {};

        MOTORISTAPAG_Login_pixMotoristaAtual =
            dados.pixRecebimento || null;

        const campoCadastrar =
            document.getElementById(
                "MOTORISTAPAG_Login_pix_copia_cola_base"
            );

        const statusGerar =
            document.getElementById(
                "MOTORISTAPAG_Login_pix_status_gerar"
            );
		
		const campoGerado =
			document.getElementById(
				"MOTORISTAPAG_Login_pix_copia_cola_gerado"
			);
			
        if (campoCadastrar) {
            campoCadastrar.value =
                MOTORISTAPAG_Login_pixMotoristaAtual?.copiaCola || "";
        }
		
		if (campoGerado) {
			campoGerado.value =
				MOTORISTAPAG_Login_pixMotoristaAtual?.copiaCola || "";
		}

        if (statusGerar) {
            if (
                MOTORISTAPAG_Login_pixMotoristaAtual &&
                MOTORISTAPAG_Login_pixMotoristaAtual.copiaCola
            ) {
                statusGerar.textContent =
                    "Pix cadastrado carregado.";
            } else {
                statusGerar.textContent =
                    "Nenhum Pix cadastrado. Primeiro cadastre o Pix copia e cola.";
            }
        }
		
		const estadoGerar =
			document.getElementById(
				"MOTORISTAPAG_Login_pix_motorista_estado_gerar"
			);

		if (
			estadoGerar &&
			estadoGerar.classList.contains("active")
		) {
			MOTORISTAPAG_Login_func_mostrarQrPixMotorista();
		}

        console.log(
            "TNP MOB: Pix do motorista carregado:",
            MOTORISTAPAG_Login_pixMotoristaAtual
        );

        return MOTORISTAPAG_Login_pixMotoristaAtual;

    } catch (erro) {
        console.error(
            "Erro ao carregar Pix do motorista:",
            erro
        );

        return null;
    }
}



/* ==================================================
   MOSTRAR QR CODE DO PIX
================================================== */

function MOTORISTAPAG_Login_func_mostrarQrPixMotorista() {
    const areaQr = document.getElementById(
        "MOTORISTAPAG_Login_pix_qrcode"
    );

    if (!areaQr) {
        return;
    }

    areaQr.innerHTML = "";

    const pix =
        MOTORISTAPAG_Login_pixMotoristaAtual || {};

    const copiaCola =
        pix.copiaCola
            ? String(pix.copiaCola).trim()
            : "";

    if (!copiaCola) {
        return;
    }

    if (typeof QRCode === "undefined") {
        console.error(
            "Biblioteca QR Code não carregada."
        );
        return;
    }

    new QRCode(areaQr, {
        text: copiaCola,
        width: 210,
        height: 210,
        correctLevel: QRCode.CorrectLevel.L
    });

    console.log(
        "TNP MOB: QR Code do Pix gerado."
    );
}

/* ==================================================
   SALVAR PIX
================================================== */

async function MOTORISTAPAG_Login_func_salvarPixMotorista() {
    let user = null;

    try {
        user = await TNP_MOB_func_aguardarUsuarioAutenticado(8000);

    } catch (erroSessao) {
        console.warn(
            "Sessão não restaurada ao salvar Pix:",
            erroSessao
        );

        return;
    }

    const campoPix = document.getElementById(
        "MOTORISTAPAG_Login_pix_copia_cola_base"
    );

    const btn = document.getElementById(
        "MOTORISTAPAG_Login_btn_salvar_pix_motorista"
    );

    const copiaCola =
        campoPix
            ? String(campoPix.value || "").trim()
            : "";

    if (!copiaCola) {
        alert("Cole o Pix copia e cola.");
        return;
    }

    if (copiaCola.length < 20) {
        alert("Esse Pix copia e cola parece incompleto.");
        return;
    }

    try {
        if (btn) {
            btn.disabled = true;
            btn.innerText = "SALVANDO...";
        }

        const pixRecebimento = {
            copiaCola: copiaCola,
            ativo: true,
            origem: "motorista",
            tipo: "pix_copia_e_cola",
            atualizadoEm:
                firebase.firestore.FieldValue.serverTimestamp()
        };

        await PRIMEIRAPAG_Login_db
            .collection("motoristas")
            .doc(user.uid)
            .set(
                {
                    pixRecebimento: pixRecebimento,
                    atualizadoEm:
                        firebase.firestore.FieldValue.serverTimestamp()
                },
                { merge: true }
            );

        MOTORISTAPAG_Login_pixMotoristaAtual =
            pixRecebimento;

        console.log(
            "TNP MOB: Pix do motorista salvo."
        );

        alert("Pix copia e cola salvo.");

    } catch (erro) {
        console.error(
            "Erro ao salvar Pix do motorista:",
            erro
        );

        alert(
            "Não foi possível salvar o Pix."
        );

    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerText = "SALVAR PIX";
        }
    }
}

/* ==================================================
   COLAR PIX
================================================== */

async function MOTORISTAPAG_Login_func_colarPixMotorista() {
    const campo = document.getElementById(
        "MOTORISTAPAG_Login_pix_copia_cola_base"
    );

    if (!campo) {
        return;
    }

    try {
        const texto =
            await navigator.clipboard.readText();

        if (!texto) {
            alert(
                "Não há conteúdo na área de transferência."
            );
            return;
        }

        campo.value =
            String(texto).trim();

        campo.focus();

        console.log(
            "TNP MOB: Pix colado no campo."
        );

    } catch (erro) {
        console.error(
            "Erro ao colar Pix:",
            erro
        );

        alert(
            "Não foi possível acessar a área de transferência."
        );
    }
}
	
/* ==================================================
   DISPONIBILIZAR GLOBALMENTE
================================================== */

window.MOTORISTAPAG_Login_func_abrirPixMotorista =
    MOTORISTAPAG_Login_func_abrirPixMotorista;

window.MOTORISTAPAG_Login_func_abrirGerarPixMotorista =
    MOTORISTAPAG_Login_func_abrirGerarPixMotorista;

window.MOTORISTAPAG_Login_func_abrirCadastrarPixMotorista =
    MOTORISTAPAG_Login_func_abrirCadastrarPixMotorista;	
	
window.MOTORISTAPAG_Login_func_fecharPixMotorista =
    MOTORISTAPAG_Login_func_fecharPixMotorista;	
	
window.MOTORISTAPAG_Login_func_carregarPixMotorista =
    MOTORISTAPAG_Login_func_carregarPixMotorista;	
	
window.MOTORISTAPAG_Login_func_salvarPixMotorista =
    MOTORISTAPAG_Login_func_salvarPixMotorista;	
	
window.MOTORISTAPAG_Login_func_mostrarQrPixMotorista =
    MOTORISTAPAG_Login_func_mostrarQrPixMotorista;	
	
window.MOTORISTAPAG_Login_func_colarPixMotorista =
    MOTORISTAPAG_Login_func_colarPixMotorista;	


/* ==================================================
   MOTORISTA — PERFIL — DADOS PESSOAIS
================================================== */


/* ==================================================
   CARREGAR MÓDULO
================================================== */

async function MOTORISTAPAG_Login_func_carregarModuloDadosPessoaisMotorista() {
    const area = document.getElementById('MOTORISTAPAG_Login_area_dados_pessoais');

    if (!area) {
        console.error('Área do módulo Dados Pessoais não encontrada.');
        return false;
    }

    if (!document.getElementById('MOTORISTAPAG_Login_modal_perfil_02_dados_pessoais')) {
        try {
            const resposta = await fetch('perfil/dados-pessoais/dados-pessoais.html');

            if (!resposta.ok) {
                throw new Error('Não foi possível carregar dados-pessoais.html');
            }

            area.innerHTML = await resposta.text();

        } catch (erro) {
            console.error('Erro ao carregar módulo Dados Pessoais:', erro);
            return false;
        }
    }

    return true;
}


/* ==================================================
   FECHAR — VOLTA PARA O PERFIL
================================================== */


/* ==================================================
   DADOS PESSOAIS — FECHAR MODAL
   VOLTAR GLOBAL
================================================== */

function MOTORISTAPAG_Login_func_fecharDadosPessoaisMotorista() {

    const modal =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_perfil_02_dados_pessoais"
        );

    /*
     * Fecha visualmente o modal.
     *
     * O Perfil do Motorista permanece
     * aberto por baixo.
     */
    if (modal) {

        modal.classList.remove(
            "active"
        );
    }

    /*
     * DADOS PESSOAIS — VOLTAR GLOBAL
     *
     * Remove a camada da pilha quando
     * o modal for fechado.
     */
    if (
        typeof TNP_MOB_func_removerCamadaVoltar ===
        "function"
    ) {
        TNP_MOB_func_removerCamadaVoltar(
            "motorista_dados_pessoais"
        );
    }
}



/* ==================================================
   ABRIR
================================================== */


/* ==================================================
   DADOS PESSOAIS — ABRIR MODAL
================================================== */

async function MOTORISTAPAG_Login_func_abrirModalDadosPessoaisMotorista() {

    const carregou =
        await MOTORISTAPAG_Login_func_carregarModuloDadosPessoaisMotorista();

    if (!carregou) return;

    const modal =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_perfil_02_dados_pessoais"
        );

    if (modal) {

        modal.classList.add("active");

        /*
         * DADOS PESSOAIS — VOLTAR GLOBAL
         *
         * Registra a camada filha
         * do Perfil do Motorista.
         */
        if (
            typeof TNP_MOB_func_registrarCamadaVoltar ===
            "function"
        ) {
            TNP_MOB_func_registrarCamadaVoltar(
                "motorista_dados_pessoais",
                MOTORISTAPAG_Login_func_fecharDadosPessoaisMotorista
            );
        }
    }

    await MOTORISTAPAG_Login_func_carregarDadosPessoaisMotorista();
}



/* ==================================================
   CARREGAR DADOS
================================================== */

async function MOTORISTAPAG_Login_func_carregarDadosPessoaisMotorista() {
    const user = PRIMEIRAPAG_Login_auth.currentUser;

    if (!user) return;

    try {
        const userDoc = await PRIMEIRAPAG_Login_db
            .collection('usuarios')
            .doc(user.uid)
            .get();

        const motoristaDoc = await PRIMEIRAPAG_Login_db
            .collection('motoristas')
            .doc(user.uid)
            .get();

        const u = userDoc.exists ? userDoc.data() : {};
        const m = motoristaDoc.exists ? motoristaDoc.data() : {};

        const endereco = u.endereco || m.endereco || {};
        const contato = u.contatoEmergencia || m.contatoEmergencia || {};

        const contatosExtrasMotorista = Array.isArray(m.contatosReferenciaMotorista)
            ? m.contatosReferenciaMotorista
            : [];

        const nome =
            u.nomeDocumento ||
            u.nomeCompleto ||
            u.nome ||
            m.nomeDocumento ||
            m.nomeCompleto ||
            m.nome ||
            "-";

        const cpf =
			u.cpfFormatado ||
			u.documentoFormatado ||
			m.cpfFormatado ||
			m.documentoFormatado ||
			m.cnhCpfTitularFormatado ||
			m.cnhCpfTitular ||
			"-";

        const nascimento =
            u.dataNascimentoFormatada ||
            u.dataNascimento ||
            m.dataNascimentoFormatada ||
            m.dataNascimento ||
            "-";

        const generoBruto =
            u.genero ||
            m.genero ||
            "";

        const genero =
            typeof MOTORISTAPAG_Login_func_formatarGeneroMotorista === "function"
                ? MOTORISTAPAG_Login_func_formatarGeneroMotorista(generoBruto)
                : (generoBruto || "-");

        const whatsapp =
            u.whatsappFormatado ||
            u.whatsapp ||
            m.whatsappFormatado ||
            m.whatsapp ||
            "-";

        const telefonePrincipal =
            u.telefonePrincipalFormatado ||
            u.telefonePrincipal ||
            m.telefonePrincipalFormatado ||
            m.telefonePrincipal ||
            whatsapp ||
            "-";

        const email =
            u.email ||
            m.email ||
            user.email ||
            "-";

        let enderecoTexto =
            u.enderecoResumoMotorista ||
            m.enderecoResumoMotorista ||
            u.enderecoResumo ||
            m.enderecoResumo ||
            "-";

        if (endereco && endereco.rua) {
            enderecoTexto =
                endereco.rua + ", " +
                (endereco.numero || "s/n") + " - " +
                (endereco.bairro || "") + " - " +
                (endereco.cidade || "") + "/" +
                (endereco.estado || endereco.uf || "");

            if (endereco.complemento) {
                enderecoTexto += "\nComplemento: " + endereco.complemento;
            }

            if (endereco.referencia) {
                enderecoTexto += "\nReferência: " + endereco.referencia;
            }
        }

        const contatosResumo = [];

		if (contato && contato.nome) {
			contatosResumo.push({
				nome: contato.nome,
				telefone:
					contato.whatsappFormatado ||
					contato.whatsapp ||
					""
			});
		}

		contatosExtrasMotorista.forEach(function(contatoExtra) {
			if (contatoExtra && contatoExtra.nome) {
				contatosResumo.push({
					nome: contatoExtra.nome,
					telefone:
						contatoExtra.whatsappFormatado ||
						contatoExtra.whatsapp ||
						""
				});
			}
		});

        function preencherTexto(id, valor) {
            const el = document.getElementById(id);

            if (el) {
                el.innerText = valor || "-";
            }
        }
		
		function preencherContatosResumo() {
			const campo =
				document.getElementById(
					'MOTORISTAPAG_Login_dados_emergencia'
				);

			if (!campo) {
				return;
			}

			campo.replaceChildren();

			if (contatosResumo.length === 0) {
				campo.textContent = "-";
				return;
			}

			contatosResumo.forEach(function(item) {
				const bloco =
					document.createElement("span");

				bloco.className =
					"MOTORISTAPAG_Login_contato_resumo_item";

				const nome =
					document.createElement("span");

				nome.className =
					"MOTORISTAPAG_Login_contato_resumo_nome";

				nome.textContent =
					item.nome;

				const telefone =
					document.createElement("span");

				telefone.className =
					"MOTORISTAPAG_Login_contato_resumo_telefone";

				telefone.textContent =
					item.telefone;

				bloco.append(
					nome,
					telefone
				);

				campo.appendChild(
					bloco
				);
			});
		}

        preencherTexto('MOTORISTAPAG_Login_dados_nome', nome);
		preencherTexto('MOTORISTAPAG_Login_dados_cpf', cpf);
		preencherTexto('MOTORISTAPAG_Login_dados_nascimento', nascimento);
		preencherTexto('MOTORISTAPAG_Login_dados_genero', genero);
		preencherTexto('MOTORISTAPAG_Login_dados_whatsapp', whatsapp);
		preencherTexto('MOTORISTAPAG_Login_dados_telefone_principal', telefonePrincipal);
		preencherTexto('MOTORISTAPAG_Login_dados_email', email);
		preencherTexto('MOTORISTAPAG_Login_dados_endereco', enderecoTexto);

		preencherContatosResumo();

    } catch (erro) {
        console.error('Erro ao carregar dados pessoais do motorista:', erro);
    }
}


/* ==================================================
   DISPONIBILIZAR GLOBALMENTE
================================================== */

window.MOTORISTAPAG_Login_func_carregarModuloDadosPessoaisMotorista =
    MOTORISTAPAG_Login_func_carregarModuloDadosPessoaisMotorista;

window.MOTORISTAPAG_Login_func_fecharDadosPessoaisMotorista =
    MOTORISTAPAG_Login_func_fecharDadosPessoaisMotorista;

window.MOTORISTAPAG_Login_func_abrirModalDadosPessoaisMotorista =
    MOTORISTAPAG_Login_func_abrirModalDadosPessoaisMotorista;

window.MOTORISTAPAG_Login_func_carregarDadosPessoaisMotorista =
    MOTORISTAPAG_Login_func_carregarDadosPessoaisMotorista;



/* ==================================================
   MOTORISTA — EDITAR CONTATOS
================================================== */
let MOTORISTAPAG_Login_var_codigoWhatsappMotorista = null;
let MOTORISTAPAG_Login_var_whatsappMotoristaValidado = false;

/* ==================================================
   CARREGAR MÓDULO
================================================== */

async function MOTORISTAPAG_Login_func_carregarModuloEditarTelefoneMotorista() {
    const area =
        document.getElementById(
            "MOTORISTAPAG_Login_area_editar_telefone"
        );

    if (!area) {
        console.warn(
            "TNP MOB: mount de Editar Telefone não encontrado."
        );

        return false;
    }

    if (
        !document.getElementById(
            "MOTORISTAPAG_Login_modal_perfil_02_editar_telefone"
        )
    ) {
        try {
            const resposta =
                await fetch(
                    "perfil/dados-pessoais/editar-telefone/editar-telefone.html"
                );

            if (!resposta.ok) {
                throw new Error(
                    "HTTP " + resposta.status
                );
            }

            area.innerHTML =
                await resposta.text();

        } catch (erro) {
            console.error(
                "Erro ao carregar módulo Editar Telefone:",
                erro
            );

            return false;
        }
    }

    return true;
}


/* ==================================================
   FECHAR SOMENTE EDITAR CONTATOS
================================================== */

/* ==================================================
   EDITAR TELEFONE — FECHAMENTO PRÓPRIO
   TERCEIRA GERAÇÃO
================================================== */

function MOTORISTAPAG_Login_func_fecharEditarTelefoneMotorista() {

    const modal = document.getElementById(
        "MOTORISTAPAG_Login_modal_perfil_02_editar_telefone"
    );

    /* INVALIDAR VERIFICAÇÃO TEMPORÁRIA */

    MOTORISTAPAG_Login_var_codigoWhatsappMotorista = null;

    MOTORISTAPAG_Login_var_whatsappMotoristaValidado = false;

    /* FECHAR SOMENTE EDITAR TELEFONE */

    if (modal) {
        modal.classList.remove("active");
    }

    /* REMOVER A PRÓPRIA CAMADA */

    if (
        typeof TNP_MOB_func_removerCamadaVoltar === "function"
    ) {
        TNP_MOB_func_removerCamadaVoltar(
            "motorista_editar_telefone"
        );
    }
}



/* ==================================================
   ABRIR EDITAR CONTATOS
================================================== */

async function MOTORISTAPAG_Login_func_abrirEditarTelefoneMotorista() {
    const carregou =
        await MOTORISTAPAG_Login_func_carregarModuloEditarTelefoneMotorista();

    if (!carregou) {
        return;
    }

    const modal =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_perfil_02_editar_telefone"
        );

    
    if (modal) {

        modal.classList.add(
            "active"
        );

        /*
         * EDITAR TELEFONE — VOLTAR GLOBAL
         *
         * Registra a camada filha de
         * Dados Pessoais do Motorista.
         */
        if (
            typeof TNP_MOB_func_registrarCamadaVoltar ===
            "function"
        ) {
            TNP_MOB_func_registrarCamadaVoltar(
                "motorista_editar_telefone",
                MOTORISTAPAG_Login_func_fecharEditarTelefoneMotorista
            );
        }
    }


    /*
     * Toda nova abertura começa limpa.
     */
    MOTORISTAPAG_Login_var_codigoWhatsappMotorista =
        null;

    MOTORISTAPAG_Login_var_whatsappMotoristaValidado =
        false;

    let user = null;

    try {
        user =
            await TNP_MOB_func_aguardarUsuarioAutenticado(
                8000
            );

    } catch (erroSessao) {
        console.warn(
            "Sessão não restaurada ao editar contatos:",
            erroSessao
        );

        return;
    }

    try {
        const [userDoc, motoristaDoc] =
            await Promise.all([
                PRIMEIRAPAG_Login_db
                    .collection("usuarios")
                    .doc(user.uid)
                    .get(),

                PRIMEIRAPAG_Login_db
                    .collection("motoristas")
                    .doc(user.uid)
                    .get()
            ]);

        const u =
            userDoc.exists
                ? userDoc.data()
                : {};

        const m =
            motoristaDoc.exists
                ? motoristaDoc.data()
                : {};

        const whatsapp =
            u.whatsappFormatado ||
            u.whatsapp ||
            m.whatsappFormatado ||
            m.whatsapp ||
            "";

        const telefonePrincipal =
            u.telefonePrincipalFormatado ||
            u.telefonePrincipal ||
            m.telefonePrincipalFormatado ||
            m.telefonePrincipal ||
            "";

        const mesmoTelefone =
            u.telefonePrincipalMesmoWhatsapp !== undefined
                ? u.telefonePrincipalMesmoWhatsapp
                : (
                    m.telefonePrincipalMesmoWhatsapp !== undefined
                        ? m.telefonePrincipalMesmoWhatsapp
                        : true
                );

        const inputWhatsapp =
            document.getElementById(
                "MOTORISTAPAG_Login_input_editar_whatsapp"
            );

        const inputTelefone =
            document.getElementById(
                "MOTORISTAPAG_Login_input_telefone_principal"
            );

        const inputCodigo =
            document.getElementById(
                "MOTORISTAPAG_Login_input_codigo_whatsapp"
            );

        const checkMesmo =
            document.getElementById(
                "MOTORISTAPAG_Login_check_mesmo_telefone"
            );

        const areaCodigo =
            document.getElementById(
                "MOTORISTAPAG_Login_area_codigo_whatsapp"
            );

        const btnEnviar =
            document.getElementById(
                "MOTORISTAPAG_Login_btn_enviar_codigo_whatsapp"
            );

        if (inputWhatsapp) {
            inputWhatsapp.disabled =
                false;

            inputWhatsapp.value =
                whatsapp;

            MOTORISTAPAG_Login_func_maskZapMotorista(
                inputWhatsapp
            );
        }

        if (inputTelefone) {
            inputTelefone.value =
                telefonePrincipal;

            MOTORISTAPAG_Login_func_maskZapMotorista(
                inputTelefone
            );
        }

        if (inputCodigo) {
            inputCodigo.value =
                "";
        }

        if (areaCodigo) {
            areaCodigo.classList.add(
                "PRIMEIRAPAG_Login_hidden"
            );
        }

        if (checkMesmo) {
            checkMesmo.checked =
                mesmoTelefone;
        }

        if (btnEnviar) {
            btnEnviar.disabled =
                false;

            btnEnviar.innerText =
                "ENVIAR CÓDIGO VIA WHATSAPP";
        }

        MOTORISTAPAG_Login_func_toggleTelefonePrincipalMotorista();

    } catch (erro) {
        console.error(
            "Erro ao carregar contatos para edição:",
            erro
        );
    }
}

/* ==================================================
   USAR WHATSAPP COMO TELEFONE PRINCIPAL
================================================== */

function MOTORISTAPAG_Login_func_toggleTelefonePrincipalMotorista() {
    const check =
        document.getElementById(
            "MOTORISTAPAG_Login_check_mesmo_telefone"
        );

    const boxTelefone =
        document.getElementById(
            "MOTORISTAPAG_Login_box_telefone_principal"
        );

    const inputTelefone =
        document.getElementById(
            "MOTORISTAPAG_Login_input_telefone_principal"
        );

    if (
        !check ||
        !boxTelefone ||
        !inputTelefone
    ) {
        return;
    }

    if (check.checked) {
        boxTelefone.classList.add(
            "PRIMEIRAPAG_Login_hidden"
        );

        return;
    }

    boxTelefone.classList.remove(
		"PRIMEIRAPAG_Login_hidden"
	);

	const inputWhatsapp =
		document.getElementById(
			"MOTORISTAPAG_Login_input_editar_whatsapp"
		);

	if (inputWhatsapp) {
		const whatsapp =
			inputWhatsapp.value.replace(/\D/g, "");

		const telefone =
			inputTelefone.value.replace(/\D/g, "");

		if (
			telefone &&
			telefone === whatsapp
		) {
			inputTelefone.value = "";
		}
	}
}

/* ==================================================
   AJUSTAR MODAL AO ABRIR TECLADO
================================================== */

function MOTORISTAPAG_Login_func_ajustarModalAoTeclado(campo) {
    const modal =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_perfil_02_editar_telefone"
        );

    const conteudo =
        modal
            ? modal.querySelector(
                ".MOTORISTAPAG_Login_editar_telefone_conteudo"
            )
            : null;

    if (!modal || !conteudo || !campo) {
        return;
    }

    const secao =
        campo.closest(
            ".MOTORISTAPAG_Login_editar_telefone_secao"
        ) || campo;

    function reposicionar() {
        const conteudoRect =
            conteudo.getBoundingClientRect();

        const secaoRect =
            secao.getBoundingClientRect();

        const deslocamento =
            secaoRect.top -
            conteudoRect.top -
            6;

        conteudo.scrollBy({
            top: deslocamento,
            behavior: "smooth"
        });
    }

    setTimeout(reposicionar, 120);
    setTimeout(reposicionar, 420);
}

/* ==================================================
   MÁSCARA — WHATSAPP / TELEFONE
================================================== */

function MOTORISTAPAG_Login_func_maskZapMotorista(input) {
    let valor =
        input.value.replace(/\D/g, "");

    if (valor.length > 11) {
        valor =
            valor.substring(0, 11);
    }

    if (valor.length > 10) {
        input.value =
            "(" + valor.substring(0, 2) + ") " +
            valor.substring(2, 3) + "." +
            valor.substring(3, 7) + "-" +
            valor.substring(7, 11);

    } else if (valor.length > 6) {
        input.value =
            "(" + valor.substring(0, 2) + ") " +
            valor.substring(2, 6) + "-" +
            valor.substring(6, 10);

    } else if (valor.length > 2) {
        input.value =
            "(" + valor.substring(0, 2) + ") " +
            valor.substring(2);

    } else if (valor.length > 0) {
        input.value =
            "(" + valor;
    }
}

/* ==================================================
   ENVIAR CÓDIGO PELO WHATSAPP
================================================== */

function MOTORISTAPAG_Login_func_enviarCodigoWhatsappMotorista() {
    const inputWhatsapp =
        document.getElementById(
            "MOTORISTAPAG_Login_input_editar_whatsapp"
        );

    const areaCodigo =
        document.getElementById(
            "MOTORISTAPAG_Login_area_codigo_whatsapp"
        );

    const btnEnviar =
        document.getElementById(
            "MOTORISTAPAG_Login_btn_enviar_codigo_whatsapp"
        );

    if (!inputWhatsapp) {
        console.warn(
            "Input do WhatsApp não encontrado."
        );

        return;
    }

    const whatsapp =
        inputWhatsapp.value.replace(/\D/g, "");

    if (whatsapp.length < 11) {
        return PRIMEIRAPAG_Login_func_mostrarErro(
            "MOTORISTAPAG_Login_error_telefone",
            "Digite um WhatsApp válido com DDD + 9 + número."
        );
    }

    MOTORISTAPAG_Login_var_codigoWhatsappMotorista =
        Math.floor(
            1000 +
            Math.random() * 9000
        );

    MOTORISTAPAG_Login_var_whatsappMotoristaValidado =
        false;

    const msg =
        encodeURIComponent(
            "Seu código TNP MOB é: " +
            MOTORISTAPAG_Login_var_codigoWhatsappMotorista
        );

    const linkWhatsapp =
        "https://wa.me/55" +
        whatsapp +
        "?text=" +
        msg;

    const janela =
        window.open(
            linkWhatsapp,
            "_blank"
        );

    if (!janela) {
        alert(
            "O navegador bloqueou a abertura do WhatsApp.\n\n" +
            "Vamos tentar abrir na mesma aba."
        );

        window.location.href =
            linkWhatsapp;

        return;
    }

    if (areaCodigo) {
        areaCodigo.classList.remove(
            "PRIMEIRAPAG_Login_hidden"
        );
    }
	
	const inputCodigo =
		document.getElementById(
			"MOTORISTAPAG_Login_input_codigo_whatsapp"
		);

	const focarCodigo = function() {
		if (!inputCodigo) {
			return;
		}

		setTimeout(function() {
			inputCodigo.focus();
		}, 150);
	};

	focarCodigo();

	window.addEventListener(
		"focus",
		focarCodigo,
		{
			once: true
		}
	);

    inputWhatsapp.disabled =
        true;

    if (btnEnviar) {
        btnEnviar.disabled =
            true;

        btnEnviar.innerText =
            "CÓDIGO GERADO";
    }
}

/* ==================================================
   CORRIGIR NÚMERO DO WHATSAPP
================================================== */

function MOTORISTAPAG_Login_func_corrigirWhatsappMotorista() {
    MOTORISTAPAG_Login_var_codigoWhatsappMotorista =
        null;

    MOTORISTAPAG_Login_var_whatsappMotoristaValidado =
        false;

    const inputWhatsapp =
        document.getElementById(
            "MOTORISTAPAG_Login_input_editar_whatsapp"
        );

    const inputCodigo =
        document.getElementById(
            "MOTORISTAPAG_Login_input_codigo_whatsapp"
        );

    const areaCodigo =
        document.getElementById(
            "MOTORISTAPAG_Login_area_codigo_whatsapp"
        );

    const btnEnviar =
        document.getElementById(
            "MOTORISTAPAG_Login_btn_enviar_codigo_whatsapp"
        );

    if (inputWhatsapp) {
        inputWhatsapp.disabled =
            false;
    }

    if (inputCodigo) {
        inputCodigo.value =
            "";
    }

    if (areaCodigo) {
        areaCodigo.classList.add(
            "PRIMEIRAPAG_Login_hidden"
        );
    }

    if (btnEnviar) {
        btnEnviar.disabled =
            false;

        btnEnviar.innerText =
            "ENVIAR CÓDIGO VIA WHATSAPP";
    }

    if (inputWhatsapp) {
        setTimeout(function() {
            inputWhatsapp.focus();
        }, 100);
    }
}

/* ==================================================
   VALIDAR CÓDIGO DO WHATSAPP
   AINDA SEM SALVAR NO FIREBASE
================================================== */

async function MOTORISTAPAG_Login_func_validarCodigoWhatsappMotorista() {
    const inputCodigo =
        document.getElementById(
            "MOTORISTAPAG_Login_input_codigo_whatsapp"
        );

    const inputWhatsapp =
        document.getElementById(
            "MOTORISTAPAG_Login_input_editar_whatsapp"
        );

    const inputTelefone =
        document.getElementById(
            "MOTORISTAPAG_Login_input_telefone_principal"
        );

    const checkMesmo =
        document.getElementById(
            "MOTORISTAPAG_Login_check_mesmo_telefone"
        );

    const btn =
        document.getElementById(
            "MOTORISTAPAG_Login_btn_confirmar_whatsapp"
        );

    if (
        !inputCodigo ||
        !inputWhatsapp ||
        !inputTelefone ||
        !checkMesmo
    ) {
        return;
    }

    let user = null;

    try {
        user =
            await TNP_MOB_func_aguardarUsuarioAutenticado(
                8000
            );

    } catch (erroSessao) {
        console.warn(
            "Sessão não restaurada ao salvar contatos:",
            erroSessao
        );

        return;
    }

    const codigoDigitado =
        inputCodigo.value.trim();

    const whatsappFormatado =
        inputWhatsapp.value.trim();

    const whatsapp =
        whatsappFormatado.replace(/\D/g, "");

    const mesmoTelefone =
        checkMesmo.checked;

    const telefonePrincipalFormatado =
        mesmoTelefone
            ? whatsappFormatado
            : inputTelefone.value.trim();

    const telefonePrincipal =
        telefonePrincipalFormatado.replace(/\D/g, "");

    if (!MOTORISTAPAG_Login_var_codigoWhatsappMotorista) {
        return PRIMEIRAPAG_Login_func_mostrarErro(
            "MOTORISTAPAG_Login_error_telefone",
            "Envie o código pelo WhatsApp primeiro."
        );
    }

    if (codigoDigitado.length !== 4) {
        return PRIMEIRAPAG_Login_func_mostrarErro(
            "MOTORISTAPAG_Login_error_telefone",
            "Digite o código de 4 números recebido no WhatsApp."
        );
    }

    if (
        codigoDigitado !=
        MOTORISTAPAG_Login_var_codigoWhatsappMotorista
    ) {
        return PRIMEIRAPAG_Login_func_mostrarErro(
            "MOTORISTAPAG_Login_error_telefone",
            "Código incorreto. Confira o número enviado no WhatsApp."
        );
    }

    if (
        !mesmoTelefone &&
        telefonePrincipal.length < 10
    ) {
        return PRIMEIRAPAG_Login_func_mostrarErro(
            "MOTORISTAPAG_Login_error_telefone",
            "Digite um telefone principal válido ou marque que é o mesmo do WhatsApp."
        );
    }

    try {
        if (btn) {
            btn.disabled =
                true;

            btn.innerText =
                "SALVANDO...";
        }

        const agora =
            firebase.firestore
                .FieldValue
                .serverTimestamp();

        const payloadContatos = {
            whatsapp:
                whatsapp,

            whatsappFormatado:
                whatsappFormatado,

            whatsappValidado:
                true,

            whatsappValidadoEm:
                agora,

            telefonePrincipal:
                telefonePrincipal,

            telefonePrincipalFormatado:
                telefonePrincipalFormatado,

            telefonePrincipalMesmoWhatsapp:
                mesmoTelefone,

            atualizadoEm:
                agora
        };

        await Promise.all([
            PRIMEIRAPAG_Login_db
                .collection("usuarios")
                .doc(user.uid)
                .set(
                    payloadContatos,
                    {
                        merge: true
                    }
                ),

            PRIMEIRAPAG_Login_db
                .collection("motoristas")
                .doc(user.uid)
                .set(
                    payloadContatos,
                    {
                        merge: true
                    }
                )
        ]);

        MOTORISTAPAG_Login_var_whatsappMotoristaValidado =
            true;

        MOTORISTAPAG_Login_var_codigoWhatsappMotorista =
            null;

        if (
            typeof MOTORISTAPAG_Login_func_carregarDadosPessoaisMotorista ===
            "function"
        ) {
            await MOTORISTAPAG_Login_func_carregarDadosPessoaisMotorista();
        }

        if (
            typeof MOTORISTAPAG_Login_func_preencherPerfilMotorista ===
            "function"
        ) {
            await MOTORISTAPAG_Login_func_preencherPerfilMotorista();
        }

        MOTORISTAPAG_Login_func_fecharEditarTelefoneMotorista();

    } catch (erro) {
        console.error(
            "Erro ao salvar contatos do motorista:",
            erro
        );

        PRIMEIRAPAG_Login_func_mostrarErro(
            "MOTORISTAPAG_Login_error_telefone",
            "Erro ao salvar contatos: " +
            erro.message
        );

    } finally {
        if (btn) {
            btn.disabled =
                false;

            btn.innerText =
                "VALIDAR E SALVAR";
        }
    }
}


/* ==================================================
   DISPONIBILIZAR GLOBALMENTE
================================================== */

window.MOTORISTAPAG_Login_func_carregarModuloEditarTelefoneMotorista =
    MOTORISTAPAG_Login_func_carregarModuloEditarTelefoneMotorista;

window.MOTORISTAPAG_Login_func_fecharEditarTelefoneMotorista =
    MOTORISTAPAG_Login_func_fecharEditarTelefoneMotorista;

window.MOTORISTAPAG_Login_func_abrirEditarTelefoneMotorista =
    MOTORISTAPAG_Login_func_abrirEditarTelefoneMotorista;
	
window.MOTORISTAPAG_Login_func_toggleTelefonePrincipalMotorista =
    MOTORISTAPAG_Login_func_toggleTelefonePrincipalMotorista;	
	
window.MOTORISTAPAG_Login_func_ajustarModalAoTeclado =
    MOTORISTAPAG_Login_func_ajustarModalAoTeclado;	
	
window.MOTORISTAPAG_Login_func_maskZapMotorista =
    MOTORISTAPAG_Login_func_maskZapMotorista;

window.MOTORISTAPAG_Login_func_enviarCodigoWhatsappMotorista =
    MOTORISTAPAG_Login_func_enviarCodigoWhatsappMotorista;	
	
window.MOTORISTAPAG_Login_func_validarCodigoWhatsappMotorista =
    MOTORISTAPAG_Login_func_validarCodigoWhatsappMotorista;	

/* ==================================================
   MOTORISTA — DADOS PESSOAIS — EDITAR NOME
================================================== */


/* ==================================================
   CARREGAR MÓDULO
================================================== */

async function MOTORISTAPAG_Login_func_carregarModuloEditarNomeMotorista() {
    const area = document.getElementById('MOTORISTAPAG_Login_area_editar_nome');

    if (!area) {
        console.error('Área do módulo Editar Nome não encontrada.');
        return false;
    }

    if (!document.getElementById('MOTORISTAPAG_Login_modal_perfil_02_editar_nome')) {
        try {
            const resposta = await fetch(
                'perfil/dados-pessoais/editar-nome/editar-nome.html'
            );

            if (!resposta.ok) {
                throw new Error('Não foi possível carregar editar-nome.html');
            }

            area.innerHTML = await resposta.text();

        } catch (erro) {
            console.error('Erro ao carregar módulo Editar Nome:', erro);
            return false;
        }
    }

    return true;
}


/* ==================================================
   FECHAR
   VOLTA PARA DADOS PESSOAIS
================================================== */


/* ==================================================
   EDITAR NOME — FECHAR MODAL
   VOLTAR GLOBAL
================================================== */

function MOTORISTAPAG_Login_func_fecharEditarNomeMotorista() {

    const modal =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_perfil_02_editar_nome"
        );

    /*
     * Fecha visualmente o modal.
     *
     * Dados Pessoais e Perfil do Motorista
     * permanecem abertos por baixo.
     */
    if (modal) {

        modal.classList.remove(
            "active"
        );
    }

    /*
     * EDITAR NOME — VOLTAR GLOBAL
     *
     * Remove a camada da pilha quando
     * o modal for fechado, inclusive após
     * o salvamento do nome.
     */
    if (
        typeof TNP_MOB_func_removerCamadaVoltar ===
        "function"
    ) {
        TNP_MOB_func_removerCamadaVoltar(
            "motorista_editar_nome"
        );
    }
}



/* ==================================================
   ABRIR E CARREGAR NOME ATUAL
================================================== */

async function MOTORISTAPAG_Login_func_abrirEditarNomeMotorista() {
    const carregou =
        await MOTORISTAPAG_Login_func_carregarModuloEditarNomeMotorista();

    if (!carregou) return;

    const modal = document.getElementById(
        'MOTORISTAPAG_Login_modal_perfil_02_editar_nome'
    );

    
    if (modal) {

        modal.classList.add(
            "active"
        );

        /*
         * EDITAR NOME — VOLTAR GLOBAL
         *
         * Registra a camada filha
         * de Dados Pessoais do Motorista.
         */
        if (
            typeof TNP_MOB_func_registrarCamadaVoltar ===
            "function"
        ) {
            TNP_MOB_func_registrarCamadaVoltar(
                "motorista_editar_nome",
                MOTORISTAPAG_Login_func_fecharEditarNomeMotorista
            );
        }
    }


    const user = PRIMEIRAPAG_Login_auth.currentUser;

    if (!user) return;

    try {
        const userDoc = await PRIMEIRAPAG_Login_db
            .collection('usuarios')
            .doc(user.uid)
            .get();

        const motoristaDoc = await PRIMEIRAPAG_Login_db
            .collection('motoristas')
            .doc(user.uid)
            .get();

        const u = userDoc.exists ? userDoc.data() : {};
        const m = motoristaDoc.exists ? motoristaDoc.data() : {};

        const nome =
            u.nomeDocumento ||
            u.nomeCompleto ||
            u.nome ||
            m.nomeDocumento ||
            m.nomeCompleto ||
            m.nome ||
            "";

        const input = document.getElementById(
            'MOTORISTAPAG_Login_input_editar_nome'
        );

        if (input) {
            input.value = nome;
        }

    } catch (erro) {
        console.error("Erro ao carregar nome para edição:", erro);
    }
}


/* ==================================================
   SALVAR NOME
================================================== */

async function MOTORISTAPAG_Login_func_salvarNomeMotorista() {
    const user = PRIMEIRAPAG_Login_auth.currentUser;
    const btn = document.getElementById('MOTORISTAPAG_Login_btn_salvar_nome');
    const input = document.getElementById('MOTORISTAPAG_Login_input_editar_nome');

    if (!user || !input) return;

    const nome = input.value.trim();

    if (!nome) {
        return MOTORISTAPAG_Login_func_abrirPaginaProvisoria(
            "Nome obrigatório",
            "Informe seu nome completo."
        );
    }

    try {
        if (btn) {
            btn.disabled = true;
            btn.innerText = "SALVANDO...";
        }

        await PRIMEIRAPAG_Login_db
            .collection('usuarios')
            .doc(user.uid)
            .set({
                nome: nome,
                nomeDocumento: nome,
                atualizadoEm: new Date()
            }, { merge: true });

        await PRIMEIRAPAG_Login_db
            .collection('motoristas')
            .doc(user.uid)
            .set({
                nome: nome,
                nomeDocumento: nome,
                atualizadoEm: new Date()
            }, { merge: true });


        /* ATUALIZA A CASCA DADOS PESSOAIS */
        if (
            typeof MOTORISTAPAG_Login_func_carregarDadosPessoaisMotorista ===
            "function"
        ) {
            await MOTORISTAPAG_Login_func_carregarDadosPessoaisMotorista();
        }


        /* ATUALIZA TAMBÉM O PERFIL QUE ESTÁ MAIS ATRÁS */
        if (
            typeof MOTORISTAPAG_Login_func_preencherPerfilMotorista ===
            "function"
        ) {
            await MOTORISTAPAG_Login_func_preencherPerfilMotorista();
        }


        if (btn) {
            btn.disabled = false;
            btn.innerText = "SALVAR NOME";
        }


        /* FECHA SOMENTE EDITAR NOME */
        MOTORISTAPAG_Login_func_fecharEditarNomeMotorista();

    } catch (erro) {
        console.error("Erro ao salvar nome:", erro);

        if (btn) {
            btn.disabled = false;
            btn.innerText = "SALVAR NOME";
        }

        MOTORISTAPAG_Login_func_abrirPaginaProvisoria(
            "Erro ao salvar",
            "Não foi possível salvar o nome agora. Tente novamente."
        );
    }
}


/* ==================================================
   DISPONIBILIZAR GLOBALMENTE
================================================== */

window.MOTORISTAPAG_Login_func_carregarModuloEditarNomeMotorista =
    MOTORISTAPAG_Login_func_carregarModuloEditarNomeMotorista;

window.MOTORISTAPAG_Login_func_fecharEditarNomeMotorista =
    MOTORISTAPAG_Login_func_fecharEditarNomeMotorista;

window.MOTORISTAPAG_Login_func_abrirEditarNomeMotorista =
    MOTORISTAPAG_Login_func_abrirEditarNomeMotorista;

window.MOTORISTAPAG_Login_func_salvarNomeMotorista =
    MOTORISTAPAG_Login_func_salvarNomeMotorista;

/* ==================================================
   MOTORISTA — EDITAR DATA DE NASCIMENTO
================================================== */


/* ==================================================
   CARREGAR MÓDULO
================================================== */

async function MOTORISTAPAG_Login_func_carregarModuloEditarNascimentoMotorista() {
    const area =
        document.getElementById(
            "MOTORISTAPAG_Login_area_editar_nascimento"
        );

    if (!area) {
        console.warn(
            "TNP MOB: mount de Editar Nascimento não encontrado."
        );

        return false;
    }

    if (
        !document.getElementById(
            "MOTORISTAPAG_Login_modal_perfil_02_editar_nascimento"
        )
    ) {
        try {
            const resposta =
                await fetch(
                    "perfil/dados-pessoais/editar-nascimento/editar-nascimento.html"
                );

            if (!resposta.ok) {
                throw new Error(
                    "HTTP " + resposta.status
                );
            }

            area.innerHTML =
                await resposta.text();

        } catch (erro) {
            console.error(
                "Erro ao carregar módulo Editar Nascimento:",
                erro
            );

            return false;
        }
    }

    return true;
}


/* ==================================================
   FECHAR SOMENTE EDITAR NASCIMENTO
================================================== */


/* ==================================================
   EDITAR NASCIMENTO — FECHAR MODAL
   VOLTAR GLOBAL
================================================== */

function MOTORISTAPAG_Login_func_fecharEditarNascimentoMotorista() {

    const modal =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_perfil_02_editar_nascimento"
        );

    /*
     * Fecha visualmente o modal.
     *
     * Dados Pessoais e Perfil do Motorista
     * permanecem abertos por baixo.
     */
    if (modal) {

        modal.classList.remove(
            "active"
        );
    }

    /*
     * EDITAR NASCIMENTO — VOLTAR GLOBAL
     *
     * Remove a camada da pilha quando
     * o modal for fechado, inclusive após
     * o salvamento da data.
     */
    if (
        typeof TNP_MOB_func_removerCamadaVoltar ===
        "function"
    ) {
        TNP_MOB_func_removerCamadaVoltar(
            "motorista_editar_nascimento"
        );
    }
}



/* ==================================================
   MÁSCARA DA DATA
================================================== */

function MOTORISTAPAG_Login_func_mascaraDataNascimento(input) {
    let valor =
        input.value.replace(
            /\D/g,
            ""
        );

    if (valor.length > 8) {
        valor =
            valor.slice(
                0,
                8
            );
    }

    if (valor.length > 4) {
        valor =
            valor.replace(
                /(\d{2})(\d{2})(\d+)/,
                "$1/$2/$3"
            );

    } else if (valor.length > 2) {
        valor =
            valor.replace(
                /(\d{2})(\d+)/,
                "$1/$2"
            );
    }

    input.value =
        valor;
}


/* ==================================================
   ABRIR EDITAR NASCIMENTO
================================================== */

async function MOTORISTAPAG_Login_func_abrirEditarNascimentoMotorista() {
    const carregou =
        await MOTORISTAPAG_Login_func_carregarModuloEditarNascimentoMotorista();

    if (!carregou) {
        return;
    }

    const modal =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_perfil_02_editar_nascimento"
        );

    
    if (modal) {

        modal.classList.add(
            "active"
        );

        /*
         * EDITAR NASCIMENTO — VOLTAR GLOBAL
         *
         * Registra a camada filha
         * de Dados Pessoais do Motorista.
         */
        if (
            typeof TNP_MOB_func_registrarCamadaVoltar ===
            "function"
        ) {
            TNP_MOB_func_registrarCamadaVoltar(
                "motorista_editar_nascimento",
                MOTORISTAPAG_Login_func_fecharEditarNascimentoMotorista
            );
        }
    }


    let user = null;

    try {
        user =
            await TNP_MOB_func_aguardarUsuarioAutenticado(
                8000
            );

    } catch (erroSessao) {
        console.warn(
            "Sessão não restaurada ao editar nascimento:",
            erroSessao
        );

        return;
    }

    try {
        const userDoc =
            await PRIMEIRAPAG_Login_db
                .collection("usuarios")
                .doc(user.uid)
                .get();

        const u =
            userDoc.exists
                ? userDoc.data()
                : {};

        const nascimento =
            u.dataNascimentoFormatada ||
            u.dataNascimento ||
            "";

        const input =
            document.getElementById(
                "MOTORISTAPAG_Login_input_editar_nascimento"
            );

        if (input) {
            input.value =
                nascimento;
        }

    } catch (erro) {
        console.error(
            "Erro ao carregar data de nascimento:",
            erro
        );
    }
}


/* ==================================================
   SALVAR NASCIMENTO
================================================== */

async function MOTORISTAPAG_Login_func_salvarNascimentoMotorista() {
    let user = null;

    try {
        user =
            await TNP_MOB_func_aguardarUsuarioAutenticado(
                8000
            );

    } catch (erroSessao) {
        console.warn(
            "Sessão não restaurada ao salvar nascimento:",
            erroSessao
        );

        return;
    }

    const btn =
        document.getElementById(
            "MOTORISTAPAG_Login_btn_salvar_nascimento"
        );

    const input =
        document.getElementById(
            "MOTORISTAPAG_Login_input_editar_nascimento"
        );

    if (!input) {
        return;
    }

    const nascimento =
        input.value.trim();

    if (
        !/^\d{2}\/\d{2}\/\d{4}$/.test(
            nascimento
        )
    ) {
        return MOTORISTAPAG_Login_func_abrirPaginaProvisoria(
            "Data inválida",
            "Digite a data no formato DD/MM/AAAA."
        );
    }

    const partes =
        nascimento.split("/");

    const dia =
        Number(partes[0]);

    const mes =
        Number(partes[1]);

    const ano =
        Number(partes[2]);

    const dataTeste =
        new Date(
            ano,
            mes - 1,
            dia
        );

    const dataValida =
        dataTeste.getFullYear() === ano &&
        dataTeste.getMonth() === mes - 1 &&
        dataTeste.getDate() === dia;

    if (!dataValida) {
        return MOTORISTAPAG_Login_func_abrirPaginaProvisoria(
            "Data inválida",
            "Confira o dia, mês e ano informados."
        );
    }

    const hoje =
        new Date();

    let idade =
        hoje.getFullYear() - ano;

    const mesAtual =
        hoje.getMonth() + 1;

    const diaAtual =
        hoje.getDate();

    if (
        mesAtual < mes ||
        (
            mesAtual === mes &&
            diaAtual < dia
        )
    ) {
        idade--;
    }

    if (idade < 18) {
        return MOTORISTAPAG_Login_func_abrirPaginaProvisoria(
            "Idade mínima",
            "Para atuar como motorista, é necessário ter pelo menos 18 anos."
        );
    }

    try {
        if (btn) {
            btn.disabled =
                true;

            btn.innerText =
                "SALVANDO...";
        }

        const dataNascimentoIso =
            ano +
            "-" +
            String(mes).padStart(2, "0") +
            "-" +
            String(dia).padStart(2, "0");

        await Promise.all([

            PRIMEIRAPAG_Login_db
                .collection("usuarios")
                .doc(user.uid)
                .set({
                    dataNascimento:
                        dataNascimentoIso,

                    dataNascimentoFormatada:
                        nascimento,

                    dataNascimentoConcluida:
                        true,

                    idade:
                        idade,

                    atualizadoEm:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()
                }, {
                    merge:
                        true
                }),

            PRIMEIRAPAG_Login_db
                .collection("motoristas")
                .doc(user.uid)
                .set({
                    dataNascimento:
                        firebase.firestore
                            .FieldValue
                            .delete(),

                    dataNascimentoFormatada:
                        firebase.firestore
                            .FieldValue
                            .delete(),

                    dataNascimentoConcluida:
                        firebase.firestore
                            .FieldValue
                            .delete(),

                    idade:
                        firebase.firestore
                            .FieldValue
                            .delete(),

                    atualizadoEm:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()
                }, {
                    merge:
                        true
                })
        ]);

        /*
         * Atualiza o pai que continua montado.
         */
        if (
            typeof MOTORISTAPAG_Login_func_carregarDadosPessoaisMotorista ===
            "function"
        ) {
            await MOTORISTAPAG_Login_func_carregarDadosPessoaisMotorista();
        }

        /*
         * Fecha somente este editor.
         */
        MOTORISTAPAG_Login_func_fecharEditarNascimentoMotorista();

    } catch (erro) {
        console.error(
            "Erro ao salvar data de nascimento:",
            erro
        );

        MOTORISTAPAG_Login_func_abrirPaginaProvisoria(
            "Erro ao salvar",
            "Não foi possível salvar a data agora. Tente novamente."
        );

    } finally {
        if (btn) {
            btn.disabled =
                false;

            btn.innerText =
                "SALVAR DATA";
        }
    }
}


/* ==================================================
   DISPONIBILIZAR GLOBALMENTE
================================================== */

window.MOTORISTAPAG_Login_func_carregarModuloEditarNascimentoMotorista =
    MOTORISTAPAG_Login_func_carregarModuloEditarNascimentoMotorista;

window.MOTORISTAPAG_Login_func_fecharEditarNascimentoMotorista =
    MOTORISTAPAG_Login_func_fecharEditarNascimentoMotorista;

window.MOTORISTAPAG_Login_func_mascaraDataNascimento =
    MOTORISTAPAG_Login_func_mascaraDataNascimento;

window.MOTORISTAPAG_Login_func_abrirEditarNascimentoMotorista =
    MOTORISTAPAG_Login_func_abrirEditarNascimentoMotorista;

window.MOTORISTAPAG_Login_func_salvarNascimentoMotorista =
    MOTORISTAPAG_Login_func_salvarNascimentoMotorista;

/* ==================================================
   MOTORISTA — EDITAR GÊNERO
================================================== */


/* ==================================================
   CARREGAR MÓDULO
================================================== */

async function MOTORISTAPAG_Login_func_carregarModuloEditarGeneroMotorista() {
    const area =
        document.getElementById(
            "MOTORISTAPAG_Login_area_editar_genero"
        );

    if (!area) {
        console.warn(
            "TNP MOB: mount de Editar Gênero não encontrado."
        );

        return false;
    }

    if (
        !document.getElementById(
            "MOTORISTAPAG_Login_modal_perfil_02_editar_genero"
        )
    ) {
        try {
            const resposta =
                await fetch(
                    "perfil/dados-pessoais/editar-genero/editar-genero.html"
                );

            if (!resposta.ok) {
                throw new Error(
                    "HTTP " + resposta.status
                );
            }

            area.innerHTML =
                await resposta.text();

        } catch (erro) {
            console.error(
                "Erro ao carregar módulo Editar Gênero:",
                erro
            );

            return false;
        }
    }

    return true;
}


/* ==================================================
   FECHAR SOMENTE EDITAR GÊNERO
================================================== */


/* ==================================================
   EDITAR GÊNERO — FECHAR MODAL
   VOLTAR GLOBAL
================================================== */

function MOTORISTAPAG_Login_func_fecharEditarGeneroMotorista() {

    const modal =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_perfil_02_editar_genero"
        );

    /*
     * Fecha visualmente o modal.
     *
     * Dados Pessoais e Perfil do Motorista
     * permanecem abertos por baixo.
     */
    if (modal) {

        modal.classList.remove(
            "active"
        );
    }

    /*
     * EDITAR GÊNERO — VOLTAR GLOBAL
     *
     * Remove a camada da pilha quando
     * o modal for fechado, inclusive após
     * o salvamento do gênero.
     */
    if (
        typeof TNP_MOB_func_removerCamadaVoltar ===
        "function"
    ) {
        TNP_MOB_func_removerCamadaVoltar(
            "motorista_editar_genero"
        );
    }
}



/* ==================================================
   ABRIR EDITAR GÊNERO
================================================== */

async function MOTORISTAPAG_Login_func_abrirEditarGeneroMotorista() {
    const carregou =
        await MOTORISTAPAG_Login_func_carregarModuloEditarGeneroMotorista();

    if (!carregou) {
        return;
    }

    const modal =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_perfil_02_editar_genero"
        );

    
    if (modal) {

        modal.classList.add(
            "active"
        );

        /*
         * EDITAR GÊNERO — VOLTAR GLOBAL
         *
         * Registra a camada filha
         * de Dados Pessoais do Motorista.
         */
        if (
            typeof TNP_MOB_func_registrarCamadaVoltar ===
            "function"
        ) {
            TNP_MOB_func_registrarCamadaVoltar(
                "motorista_editar_genero",
                MOTORISTAPAG_Login_func_fecharEditarGeneroMotorista
            );
        }
    }


    let user = null;

    try {
        user =
            await TNP_MOB_func_aguardarUsuarioAutenticado(
                8000
            );

    } catch (erroSessao) {
        console.warn(
            "Sessão não restaurada ao editar gênero:",
            erroSessao
        );

        return;
    }

    try {
        const userDoc =
            await PRIMEIRAPAG_Login_db
                .collection("usuarios")
                .doc(user.uid)
                .get();

        const u =
            userDoc.exists
                ? userDoc.data()
                : {};

        const generoAtual =
            u.genero ||
            "";

        const inputGenero =
            document.getElementById(
                "MOTORISTAPAG_Login_input_editar_genero"
            );

        if (inputGenero) {
            inputGenero.value =
                generoAtual;

            inputGenero.focus();
        }

    } catch (erro) {
        console.error(
            "Erro ao carregar gênero do motorista:",
            erro
        );

        alert(
            "Não foi possível carregar o gênero agora."
        );
    }
}


/* ==================================================
   SALVAR GÊNERO
================================================== */

async function MOTORISTAPAG_Login_func_salvarGeneroMotorista() {
    let user = null;

    try {
        user =
            await TNP_MOB_func_aguardarUsuarioAutenticado(
                8000
            );

    } catch (erroSessao) {
        console.warn(
            "Sessão não restaurada ao salvar gênero:",
            erroSessao
        );

        return;
    }

    const btn =
        document.getElementById(
            "MOTORISTAPAG_Login_btn_salvar_genero"
        );

    const inputGenero =
        document.getElementById(
            "MOTORISTAPAG_Login_input_editar_genero"
        );

    if (!inputGenero) {
        alert(
            "Campo de gênero não encontrado."
        );

        return;
    }

    const genero =
        inputGenero.value.trim();

    if (!genero) {
        alert(
            "Selecione uma opção de gênero."
        );

        return;
    }

    try {
        if (btn) {
            btn.disabled =
                true;

            btn.innerText =
                "SALVANDO...";
        }

        await Promise.all([

            /*
             * Fonte oficial dos dados pessoais.
             */
            PRIMEIRAPAG_Login_db
                .collection("usuarios")
                .doc(user.uid)
                .set({
                    genero:
                        genero,

                    generoInformado:
                        true,

                    atualizadoEm:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()
                }, {
                    merge:
                        true
                }),

            /*
             * Remove cópias antigas do motorista.
             */
            PRIMEIRAPAG_Login_db
                .collection("motoristas")
                .doc(user.uid)
                .set({
                    genero:
                        firebase.firestore
                            .FieldValue
                            .delete(),

                    generoInformado:
                        firebase.firestore
                            .FieldValue
                            .delete(),

                    atualizadoEm:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()
                }, {
                    merge:
                        true
                })
        ]);

        /*
         * Atualiza o pai que continua montado.
         */
        if (
            typeof MOTORISTAPAG_Login_func_carregarDadosPessoaisMotorista ===
            "function"
        ) {
            await MOTORISTAPAG_Login_func_carregarDadosPessoaisMotorista();
        }

        /*
         * Atualiza o Perfil, se necessário.
         */
        if (
            typeof MOTORISTAPAG_Login_func_preencherPerfilMotorista ===
            "function"
        ) {
            await MOTORISTAPAG_Login_func_preencherPerfilMotorista();
        }

        /*
         * Fecha somente este filho.
         */
        MOTORISTAPAG_Login_func_fecharEditarGeneroMotorista();

    } catch (erro) {
        console.error(
            "Erro ao salvar gênero do motorista:",
            erro
        );

        alert(
            "Erro ao salvar gênero: " +
            erro.message
        );

    } finally {
        if (btn) {
            btn.disabled =
                false;

            btn.innerText =
                "SALVAR GÊNERO";
        }
    }
}


/* ==================================================
   DISPONIBILIZAR GLOBALMENTE
================================================== */

window.MOTORISTAPAG_Login_func_carregarModuloEditarGeneroMotorista =
    MOTORISTAPAG_Login_func_carregarModuloEditarGeneroMotorista;

window.MOTORISTAPAG_Login_func_fecharEditarGeneroMotorista =
    MOTORISTAPAG_Login_func_fecharEditarGeneroMotorista;

window.MOTORISTAPAG_Login_func_abrirEditarGeneroMotorista =
    MOTORISTAPAG_Login_func_abrirEditarGeneroMotorista;

window.MOTORISTAPAG_Login_func_salvarGeneroMotorista =
    MOTORISTAPAG_Login_func_salvarGeneroMotorista;

/* ==================================================
   MOTORISTA — EDITAR ENDEREÇO
================================================== */


/* ==================================================
   CARREGAR MÓDULO
================================================== */

async function MOTORISTAPAG_Login_func_carregarModuloEditarEnderecoMotorista() {
    const area =
        document.getElementById(
            "MOTORISTAPAG_Login_area_editar_endereco"
        );

    if (!area) {
        console.warn(
            "TNP MOB: mount de Editar Endereço não encontrado."
        );

        return false;
    }

    if (
        !document.getElementById(
            "MOTORISTAPAG_Login_modal_perfil_02_editar_endereco"
        )
    ) {
        try {
            const resposta =
                await fetch(
                    "perfil/dados-pessoais/editar-endereco/editar-endereco.html"
                );

            if (!resposta.ok) {
                throw new Error(
                    "HTTP " + resposta.status
                );
            }

            area.innerHTML =
                await resposta.text();

        } catch (erro) {
            console.error(
                "Erro ao carregar módulo Editar Endereço:",
                erro
            );

            return false;
        }
    }

    return true;
}


/* ==================================================
   EDITAR ENDEREÇO — FECHAR MODAL
   VOLTAR GLOBAL
================================================== */

function MOTORISTAPAG_Login_func_fecharEditarEnderecoMotorista() {

    const modal =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_perfil_02_editar_endereco"
        );

    /*
     * Fecha visualmente o modal.
     *
     * Dados Pessoais e Perfil do Motorista
     * permanecem abertos por baixo.
     */
    if (modal) {

        modal.classList.remove(
            "active"
        );
    }

    /*
     * EDITAR ENDEREÇO — VOLTAR GLOBAL
     *
     * Remove a camada da pilha quando
     * o modal for fechado, inclusive após
     * o salvamento do endereço.
     */
    if (
        typeof TNP_MOB_func_removerCamadaVoltar ===
        "function"
    ) {
        TNP_MOB_func_removerCamadaVoltar(
            "motorista_editar_endereco"
        );
    }
}



/* ==================================================
   ABRIR EDITAR ENDEREÇO
================================================== */

async function MOTORISTAPAG_Login_func_abrirEditarEnderecoMotorista() {
    const carregou =
        await MOTORISTAPAG_Login_func_carregarModuloEditarEnderecoMotorista();

    if (!carregou) {
        return;
    }

    const modal =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_perfil_02_editar_endereco"
        );

    
    if (modal) {

        modal.classList.add(
            "active"
        );

        /*
         * EDITAR ENDEREÇO — VOLTAR GLOBAL
         *
         * Registra a camada filha
         * de Dados Pessoais do Motorista.
         */
        if (
            typeof TNP_MOB_func_registrarCamadaVoltar ===
            "function"
        ) {
            TNP_MOB_func_registrarCamadaVoltar(
                "motorista_editar_endereco",
                MOTORISTAPAG_Login_func_fecharEditarEnderecoMotorista
            );
        }
    }


    let user = null;

    try {
        user =
            await TNP_MOB_func_aguardarUsuarioAutenticado(
                8000
            );

    } catch (erroSessao) {
        console.warn(
            "Sessão não restaurada ao editar endereço:",
            erroSessao
        );

        return;
    }

    try {
        const [userDoc, motoristaDoc] =
            await Promise.all([
                PRIMEIRAPAG_Login_db
                    .collection("usuarios")
                    .doc(user.uid)
                    .get(),

                PRIMEIRAPAG_Login_db
                    .collection("motoristas")
                    .doc(user.uid)
                    .get()
            ]);

        const u =
            userDoc.exists
                ? userDoc.data()
                : {};

        const m =
            motoristaDoc.exists
                ? motoristaDoc.data()
                : {};

        const endereco =
            u.endereco ||
            m.endereco ||
            {};

        const inputCep =
            document.getElementById(
                "MOTORISTAPAG_Login_input_endereco_cep"
            );

        const inputRua =
            document.getElementById(
                "MOTORISTAPAG_Login_input_endereco_rua"
            );

        const inputNumero =
            document.getElementById(
                "MOTORISTAPAG_Login_input_endereco_numero"
            );

        const inputBairro =
            document.getElementById(
                "MOTORISTAPAG_Login_input_endereco_bairro"
            );

        const inputCidade =
            document.getElementById(
                "MOTORISTAPAG_Login_input_endereco_cidade"
            );

        const inputEstado =
            document.getElementById(
                "MOTORISTAPAG_Login_input_endereco_estado"
            );

        const inputComplemento =
            document.getElementById(
                "MOTORISTAPAG_Login_input_endereco_complemento"
            );

        const inputReferencia =
            document.getElementById(
                "MOTORISTAPAG_Login_input_endereco_referencia"
            );

        if (inputCep) {
            inputCep.value =
                endereco.cepFormatado ||
                endereco.cep ||
                "";
        }

        if (inputRua) {
            inputRua.value =
                endereco.rua ||
                "";
        }

        if (inputNumero) {
            inputNumero.value =
                endereco.numero ||
                "";
        }

        if (inputBairro) {
            inputBairro.value =
                endereco.bairro ||
                "";
        }

        if (inputCidade) {
            inputCidade.value =
                endereco.cidade ||
                "";
        }

        if (inputEstado) {
            inputEstado.value =
                endereco.estado ||
                "";
        }

        if (inputComplemento) {
            inputComplemento.value =
                endereco.complemento ||
                "";
        }

        if (inputReferencia) {
            inputReferencia.value =
                endereco.referencia ||
                "";
        }

    } catch (erro) {
        console.error(
            "Erro ao carregar endereço:",
            erro
        );
    }
}

/* ==================================================
   MÁSCARA DO CEP
================================================== */

function MOTORISTAPAG_Login_func_mascaraCep(input) {
    let valor =
        input.value.replace(/\D/g, "");

    if (valor.length > 8) {
        valor =
            valor.slice(0, 8);
    }

    if (valor.length > 5) {
        valor =
            valor.replace(
                /(\d{5})(\d+)/,
                "$1-$2"
            );
    }

    input.value =
        valor;
}

/* ==================================================
   BUSCAR CEP
================================================== */

async function MOTORISTAPAG_Login_func_buscarCepMotorista() {
    const cepInput =
        document.getElementById(
            "MOTORISTAPAG_Login_input_endereco_cep"
        );

    if (!cepInput) {
        return;
    }

    const cep =
        cepInput.value.replace(/\D/g, "");

    if (cep.length !== 8) {
        return;
    }

    try {
        const resposta =
            await fetch(
                "https://viacep.com.br/ws/" +
                cep +
                "/json/"
            );

        const dados =
            await resposta.json();

        if (dados.erro) {
            return PRIMEIRAPAG_Login_func_mostrarErro(
                "MOTORISTAPAG_Login_error_endereco",
                "CEP não encontrado. Confira o número digitado."
            );
        }

        const rua =
            document.getElementById(
                "MOTORISTAPAG_Login_input_endereco_rua"
            );

        const bairro =
            document.getElementById(
                "MOTORISTAPAG_Login_input_endereco_bairro"
            );

        const cidade =
            document.getElementById(
                "MOTORISTAPAG_Login_input_endereco_cidade"
            );

        const estado =
            document.getElementById(
                "MOTORISTAPAG_Login_input_endereco_estado"
            );

        const numero =
            document.getElementById(
                "MOTORISTAPAG_Login_input_endereco_numero"
            );

        if (rua) {
            rua.value =
                dados.logradouro || "";
        }

        if (bairro) {
            bairro.value =
                dados.bairro || "";
        }

        if (cidade) {
            cidade.value =
                dados.localidade || "";
        }

        if (estado) {
            estado.value =
                dados.uf || "";
        }

        if (numero) {
            numero.focus();
        }

    } catch (erro) {
        console.error(
            "Erro ao buscar CEP:",
            erro
        );

        PRIMEIRAPAG_Login_func_mostrarErro(
            "MOTORISTAPAG_Login_error_endereco",
            "Não foi possível buscar o CEP agora."
        );
    }
}

/* ==================================================
   SALVAR ENDEREÇO
================================================== */

async function MOTORISTAPAG_Login_func_salvarEnderecoMotorista() {
    let user = null;

    try {
        user =
            await TNP_MOB_func_aguardarUsuarioAutenticado(
                8000
            );

    } catch (erroSessao) {
        console.warn(
            "Sessão não restaurada ao salvar endereço:",
            erroSessao
        );

        return;
    }

    const btn =
        document.getElementById(
            "MOTORISTAPAG_Login_btn_salvar_endereco"
        );

    const cepFormatado =
        document.getElementById(
            "MOTORISTAPAG_Login_input_endereco_cep"
        ).value.trim();

    const cep =
        cepFormatado.replace(/\D/g, "");

    const rua =
        document.getElementById(
            "MOTORISTAPAG_Login_input_endereco_rua"
        ).value.trim();

    const numero =
        document.getElementById(
            "MOTORISTAPAG_Login_input_endereco_numero"
        ).value.trim();

    const bairro =
        document.getElementById(
            "MOTORISTAPAG_Login_input_endereco_bairro"
        ).value.trim();

    const cidade =
        document.getElementById(
            "MOTORISTAPAG_Login_input_endereco_cidade"
        ).value.trim();

    const estado =
        document.getElementById(
            "MOTORISTAPAG_Login_input_endereco_estado"
        ).value.trim().toUpperCase();

    const complemento =
        document.getElementById(
            "MOTORISTAPAG_Login_input_endereco_complemento"
        ).value.trim();

    const referencia =
        document.getElementById(
            "MOTORISTAPAG_Login_input_endereco_referencia"
        ).value.trim();

    if (cep.length !== 8) {
        return PRIMEIRAPAG_Login_func_mostrarErro(
            "MOTORISTAPAG_Login_error_endereco",
            "Digite um CEP válido."
        );
    }

    if (
        !rua ||
        !numero ||
        !bairro ||
        !cidade ||
        estado.length !== 2
    ) {
        return PRIMEIRAPAG_Login_func_mostrarErro(
            "MOTORISTAPAG_Login_error_endereco",
            "Preencha CEP, rua, número, bairro, cidade e UF."
        );
    }

    const endereco = {
        cep: cep,
        cepFormatado: cepFormatado,
        rua: rua,
        numero: numero,
        bairro: bairro,
        cidade: cidade,
        estado: estado,
        complemento: complemento,
        referencia: referencia
    };

    const enderecoFormatado =
        rua + ", " + numero +
        (complemento ? " - " + complemento : "") +
        " - " + bairro +
        ", " + cidade + "/" + estado +
        " - CEP " + cepFormatado;

    try {
        if (btn) {
            btn.disabled =
                true;

            btn.innerText =
                "SALVANDO...";
        }

        const agora =
            firebase.firestore
                .FieldValue
                .serverTimestamp();

        const payloadEndereco = {
            endereco:
                endereco,

            enderecoFormatado:
                enderecoFormatado,

            enderecoConcluido:
                true,

            atualizadoEm:
                agora
        };

        await Promise.all([
            PRIMEIRAPAG_Login_db
                .collection("usuarios")
                .doc(user.uid)
                .set(
                    payloadEndereco,
                    {
                        merge: true
                    }
                ),

            PRIMEIRAPAG_Login_db
                .collection("motoristas")
                .doc(user.uid)
                .set(
                    payloadEndereco,
                    {
                        merge: true
                    }
                )
        ]);

        if (
            typeof MOTORISTAPAG_Login_func_carregarDadosPessoaisMotorista ===
            "function"
        ) {
            await MOTORISTAPAG_Login_func_carregarDadosPessoaisMotorista();
        }

        if (
            typeof MOTORISTAPAG_Login_func_preencherPerfilMotorista ===
            "function"
        ) {
            await MOTORISTAPAG_Login_func_preencherPerfilMotorista();
        }

        MOTORISTAPAG_Login_func_fecharEditarEnderecoMotorista();

    } catch (erro) {
        console.error(
            "Erro ao salvar endereço do motorista:",
            erro
        );

        PRIMEIRAPAG_Login_func_mostrarErro(
            "MOTORISTAPAG_Login_error_endereco",
            "Erro ao salvar endereço: " +
            erro.message
        );

    } finally {
        if (btn) {
            btn.disabled =
                false;

            btn.innerText =
                "SALVAR ENDEREÇO";
        }
    }
}


/* ==================================================
   DISPONIBILIZAR GLOBALMENTE
================================================== */

window.MOTORISTAPAG_Login_func_carregarModuloEditarEnderecoMotorista =
    MOTORISTAPAG_Login_func_carregarModuloEditarEnderecoMotorista;

window.MOTORISTAPAG_Login_func_fecharEditarEnderecoMotorista =
    MOTORISTAPAG_Login_func_fecharEditarEnderecoMotorista;

window.MOTORISTAPAG_Login_func_abrirEditarEnderecoMotorista =
    MOTORISTAPAG_Login_func_abrirEditarEnderecoMotorista;
	
window.MOTORISTAPAG_Login_func_mascaraCep =
    MOTORISTAPAG_Login_func_mascaraCep;	
	
window.MOTORISTAPAG_Login_func_salvarEnderecoMotorista =
    MOTORISTAPAG_Login_func_salvarEnderecoMotorista;	
	
window.MOTORISTAPAG_Login_func_buscarCepMotorista =
    MOTORISTAPAG_Login_func_buscarCepMotorista;	

/* ==================================================
   MOTORISTA — CONTATOS DE SEGURANÇA
================================================== */


/* ==================================================
   CARREGAR MÓDULO
================================================== */

async function MOTORISTAPAG_Login_func_carregarModuloEditarContatosReferenciaMotorista() {
    const area =
        document.getElementById(
            "MOTORISTAPAG_Login_area_editar_contatos"
        );

    if (!area) {
        console.warn(
            "TNP MOB: mount de Contatos de Segurança não encontrado."
        );

        return false;
    }

    if (
        !document.getElementById(
            "MOTORISTAPAG_Login_modal_perfil_02_editar_contatos"
        )
    ) {
        try {
            const resposta =
                await fetch(
                    "perfil/dados-pessoais/editar-contatos/editar-contatos.html"
                );

            if (!resposta.ok) {
                throw new Error(
                    "HTTP " + resposta.status
                );
            }

            area.innerHTML =
                await resposta.text();

        } catch (erro) {
            console.error(
                "Erro ao carregar módulo Contatos de Segurança:",
                erro
            );

            return false;
        }
    }

    return true;
}


/* ==================================================
   FECHAR SOMENTE CONTATOS DE SEGURANÇA
================================================== */


/* ==================================================
   CONTATOS DE SEGURANÇA — FECHAR MODAL
   VOLTAR GLOBAL
================================================== */

function MOTORISTAPAG_Login_func_fecharEditarContatosReferenciaMotorista() {

    const modal =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_perfil_02_editar_contatos"
        );

    /*
     * Fecha visualmente somente
     * Contatos de Segurança.
     *
     * Dados Pessoais e Perfil do Motorista
     * permanecem abertos por baixo.
     */
    if (modal) {

        modal.classList.remove(
            "active"
        );
    }

    /*
     * CONTATOS DE SEGURANÇA — VOLTAR GLOBAL
     *
     * Remove a camada da pilha ao fechar
     * pelo botão, pelo Voltar Global
     * ou após salvar os contatos.
     */
    if (
        typeof TNP_MOB_func_removerCamadaVoltar ===
        "function"
    ) {
        TNP_MOB_func_removerCamadaVoltar(
            "motorista_editar_contatos"
        );
    }
}


/* ==================================================
   ABRIR CONTATOS DE SEGURANÇA
================================================== */

async function MOTORISTAPAG_Login_func_abrirEditarContatosReferenciaMotorista() {
    const carregou =
        await MOTORISTAPAG_Login_func_carregarModuloEditarContatosReferenciaMotorista();

    if (!carregou) {
        return;
    }

    const modal =
        document.getElementById(
            "MOTORISTAPAG_Login_modal_perfil_02_editar_contatos"
        );

    
    if (modal) {

        modal.classList.add(
            "active"
        );

        /*
         * CONTATOS DE SEGURANÇA — VOLTAR GLOBAL
         *
         * Registra a camada filha
         * de Dados Pessoais do Motorista.
         */
        if (
            typeof TNP_MOB_func_registrarCamadaVoltar ===
            "function"
        ) {
            TNP_MOB_func_registrarCamadaVoltar(
                "motorista_editar_contatos",
                MOTORISTAPAG_Login_func_fecharEditarContatosReferenciaMotorista
            );
        }
    }

	
	await MOTORISTAPAG_Login_func_carregarContatosReferenciaMotorista();
}

/* ==================================================
   PREENCHER CONTATO
================================================== */

function MOTORISTAPAG_Login_func_preencherCampoContato(prefixo, selectId, contato) {
    contato =
        contato || {};

    const nome =
        document.getElementById(
            prefixo + "_nome"
        );

    const whatsapp =
        document.getElementById(
            prefixo + "_whatsapp"
        );

    const relacao =
        document.getElementById(
            selectId
        );

    if (nome) {
        nome.value =
            contato.nome || "";
    }

    if (whatsapp) {
        whatsapp.value =
            contato.whatsappFormatado ||
            contato.whatsapp ||
            "";

        if (
            typeof MOTORISTAPAG_Login_func_maskZapMotorista ===
            "function"
        ) {
            MOTORISTAPAG_Login_func_maskZapMotorista(
                whatsapp
            );
        }
    }

    if (relacao) {
        relacao.value =
            contato.relacao || "";
    }
}


/* ==================================================
   CARREGAR CONTATOS DO FIREBASE
================================================== */

async function MOTORISTAPAG_Login_func_carregarContatosReferenciaMotorista() {
    let user = null;

    try {
        user =
            await TNP_MOB_func_aguardarUsuarioAutenticado(
                8000
            );

    } catch (erroSessao) {
        console.warn(
            "Sessão não restaurada ao carregar contatos:",
            erroSessao
        );

        return;
    }

    try {
        const [userDoc, motoristaDoc] =
            await Promise.all([
                PRIMEIRAPAG_Login_db
                    .collection("usuarios")
                    .doc(user.uid)
                    .get(),

                PRIMEIRAPAG_Login_db
                    .collection("motoristas")
                    .doc(user.uid)
                    .get()
            ]);

        const u =
            userDoc.exists
                ? userDoc.data()
                : {};

        const m =
            motoristaDoc.exists
                ? motoristaDoc.data()
                : {};

        const contatoPrincipal =
            u.contatoEmergencia ||
            m.contatoEmergencia ||
            {};

        const contatosExtras =
            Array.isArray(
                m.contatosReferenciaMotorista
            )
                ? m.contatosReferenciaMotorista
                : [];

        MOTORISTAPAG_Login_func_preencherCampoContato(
            "MOTORISTAPAG_Login_input_contato_principal",
            "MOTORISTAPAG_Login_select_contato_principal_relacao",
            contatoPrincipal
        );

        MOTORISTAPAG_Login_func_preencherCampoContato(
            "MOTORISTAPAG_Login_input_contato_extra1",
            "MOTORISTAPAG_Login_select_contato_extra1_relacao",
            contatosExtras[0] || {}
        );

        MOTORISTAPAG_Login_func_preencherCampoContato(
            "MOTORISTAPAG_Login_input_contato_extra2",
            "MOTORISTAPAG_Login_select_contato_extra2_relacao",
            contatosExtras[1] || {}
        );

    } catch (erro) {
        console.error(
            "Erro ao carregar contatos de segurança:",
            erro
        );

        PRIMEIRAPAG_Login_func_mostrarErro(
            "MOTORISTAPAG_Login_error_contatos",
            "Não foi possível carregar os contatos agora."
        );
    }
}

/* ==================================================
   LER CONTATO
================================================== */

function MOTORISTAPAG_Login_func_lerContatoReferencia(prefixo, selectId) {
    const nomeInput =
        document.getElementById(
            prefixo + "_nome"
        );

    const whatsappInput =
        document.getElementById(
            prefixo + "_whatsapp"
        );

    const relacaoSelect =
        document.getElementById(
            selectId
        );

    const nome =
        nomeInput
            ? nomeInput.value.trim()
            : "";

    const whatsappFormatado =
        whatsappInput
            ? whatsappInput.value.trim()
            : "";

    const whatsapp =
        whatsappFormatado.replace(
            /\D/g,
            ""
        );

    const relacao =
        relacaoSelect
            ? relacaoSelect.value
            : "";

    return {
        nome: nome,
        whatsapp: whatsapp,
        whatsappFormatado: whatsappFormatado,
        relacao: relacao
    };
}


/* ==================================================
   VALIDAR CONTATOS
   AINDA SEM SALVAR NO FIREBASE
================================================== */

/* ==================================================
   SALVAR CONTATOS DE SEGURANÇA
================================================== */

async function MOTORISTAPAG_Login_func_salvarContatosReferenciaMotorista() {
    let user = null;

    try {
        user =
            await TNP_MOB_func_aguardarUsuarioAutenticado(
                8000
            );

    } catch (erroSessao) {
        console.warn(
            "Sessão não restaurada ao salvar contatos:",
            erroSessao
        );

        return;
    }

    const btn =
        document.getElementById(
            "MOTORISTAPAG_Login_btn_salvar_contatos"
        );

    const contatoPrincipal =
        MOTORISTAPAG_Login_func_lerContatoReferencia(
            "MOTORISTAPAG_Login_input_contato_principal",
            "MOTORISTAPAG_Login_select_contato_principal_relacao"
        );

    const contatoExtra1 =
        MOTORISTAPAG_Login_func_lerContatoReferencia(
            "MOTORISTAPAG_Login_input_contato_extra1",
            "MOTORISTAPAG_Login_select_contato_extra1_relacao"
        );

    const contatoExtra2 =
        MOTORISTAPAG_Login_func_lerContatoReferencia(
            "MOTORISTAPAG_Login_input_contato_extra2",
            "MOTORISTAPAG_Login_select_contato_extra2_relacao"
        );


    /* ==================================================
       VALIDAR PRINCIPAL
    ================================================== */

    if (
        !contatoPrincipal.nome ||
        (
            contatoPrincipal.whatsapp.length !== 10 &&
            contatoPrincipal.whatsapp.length !== 11
        ) ||
        !contatoPrincipal.relacao
    ) {
        return PRIMEIRAPAG_Login_func_mostrarErro(
            "MOTORISTAPAG_Login_error_contatos",
            "Preencha nome, WhatsApp e relação do contato principal."
        );
    }


    /* ==================================================
       VALIDAR EXTRA 1
    ================================================== */

    const extra1TemAlgumDado =
        contatoExtra1.nome ||
        contatoExtra1.whatsapp ||
        contatoExtra1.relacao;

    if (
        extra1TemAlgumDado &&
        (
            !contatoExtra1.nome ||
            (
                contatoExtra1.whatsapp.length !== 10 &&
                contatoExtra1.whatsapp.length !== 11
            ) ||
            !contatoExtra1.relacao
        )
    ) {
        return PRIMEIRAPAG_Login_func_mostrarErro(
            "MOTORISTAPAG_Login_error_contatos",
            "Preencha nome, WhatsApp e relação do contato extra 1 ou deixe todos os campos vazios."
        );
    }


    /* ==================================================
       VALIDAR EXTRA 2
    ================================================== */

    const extra2TemAlgumDado =
        contatoExtra2.nome ||
        contatoExtra2.whatsapp ||
        contatoExtra2.relacao;

    if (
        extra2TemAlgumDado &&
        (
            !contatoExtra2.nome ||
            (
                contatoExtra2.whatsapp.length !== 10 &&
                contatoExtra2.whatsapp.length !== 11
            ) ||
            !contatoExtra2.relacao
        )
    ) {
        return PRIMEIRAPAG_Login_func_mostrarErro(
            "MOTORISTAPAG_Login_error_contatos",
            "Preencha nome, WhatsApp e relação do contato extra 2 ou deixe todos os campos vazios."
        );
    }


    /* ==================================================
       COMPACTAR CONTATOS EXTRAS

       Se somente o Extra 2 estiver preenchido,
       ele passa a ocupar a primeira posição.
    ================================================== */

    const contatosExtras = [];

    if (extra1TemAlgumDado) {
        contatosExtras.push(
            contatoExtra1
        );
    }

    if (extra2TemAlgumDado) {
        contatosExtras.push(
            contatoExtra2
        );
    }


    /* ==================================================
       SALVAR
    ================================================== */

    try {
        if (btn) {
            btn.disabled =
                true;

            btn.innerText =
                "SALVANDO...";
        }

        const agora =
            firebase.firestore
                .FieldValue
                .serverTimestamp();


        await Promise.all([

            /* USUÁRIO — CONTATO PRINCIPAL */

            PRIMEIRAPAG_Login_db
                .collection("usuarios")
                .doc(user.uid)
                .set(
                    {
                        contatoEmergencia:
                            contatoPrincipal,

                        contatoEmergenciaConcluido:
                            true,

                        atualizadoEm:
                            agora
                    },
                    {
                        merge: true
                    }
                ),


            /* MOTORISTA — PRINCIPAL + EXTRAS */

            PRIMEIRAPAG_Login_db
                .collection("motoristas")
                .doc(user.uid)
                .set(
                    {
                        contatoEmergencia:
                            contatoPrincipal,

                        contatoEmergenciaConcluido:
                            true,

                        contatosReferenciaMotorista:
                            contatosExtras,

                        atualizadoEm:
                            agora
                    },
                    {
                        merge: true
                    }
                )
        ]);


        /* ==================================================
           ATUALIZAR TELAS PAIS
        ================================================== */

        if (
            typeof MOTORISTAPAG_Login_func_carregarDadosPessoaisMotorista ===
            "function"
        ) {
            await MOTORISTAPAG_Login_func_carregarDadosPessoaisMotorista();
        }

        if (
            typeof MOTORISTAPAG_Login_func_preencherPerfilMotorista ===
            "function"
        ) {
            await MOTORISTAPAG_Login_func_preencherPerfilMotorista();
        }


        /* ==================================================
           FECHAR SOMENTE O FILHO
        ================================================== */

        MOTORISTAPAG_Login_func_fecharEditarContatosReferenciaMotorista();

    } catch (erro) {
        console.error(
            "Erro ao salvar contatos de segurança:",
            erro
        );

        PRIMEIRAPAG_Login_func_mostrarErro(
            "MOTORISTAPAG_Login_error_contatos",
            "Erro ao salvar contatos: " +
            erro.message
        );

    } finally {
        if (btn) {
            btn.disabled =
                false;

            btn.innerText =
                "SALVAR CONTATOS";
        }
    }
}

/* ==================================================
   EXCLUIR CONTATO DA LISTA
   AINDA SEM SALVAR NO FIREBASE
================================================== */

/* ==================================================
   EXCLUIR CONTATO DE SEGURANÇA
   REORGANIZA E SALVA NO FIREBASE
================================================== */

async function MOTORISTAPAG_Login_func_excluirContatoSeguranca(indice) {
    let user = null;

    try {
        user =
            await TNP_MOB_func_aguardarUsuarioAutenticado(
                8000
            );

    } catch (erroSessao) {
        console.warn(
            "Sessão não restaurada ao excluir contato:",
            erroSessao
        );

        return;
    }


    const contatos = [
        MOTORISTAPAG_Login_func_lerContatoReferencia(
            "MOTORISTAPAG_Login_input_contato_principal",
            "MOTORISTAPAG_Login_select_contato_principal_relacao"
        ),

        MOTORISTAPAG_Login_func_lerContatoReferencia(
            "MOTORISTAPAG_Login_input_contato_extra1",
            "MOTORISTAPAG_Login_select_contato_extra1_relacao"
        ),

        MOTORISTAPAG_Login_func_lerContatoReferencia(
            "MOTORISTAPAG_Login_input_contato_extra2",
            "MOTORISTAPAG_Login_select_contato_extra2_relacao"
        )
    ];


    const contatoTemDados = function(contato) {
        return !!(
            contato.nome ||
            contato.whatsapp ||
            contato.relacao
        );
    };


    if (
        !contatoTemDados(
            contatos[indice]
        )
    ) {
        return;
    }


    const totalContatos =
        contatos.filter(
            contatoTemDados
        ).length;


    /* ==================================================
       PRECISA SOBRAR PELO MENOS 1
    ================================================== */

    if (totalContatos <= 1) {
        return PRIMEIRAPAG_Login_func_mostrarErro(
            "MOTORISTAPAG_Login_error_contatos",
            "É necessário manter pelo menos um contato de segurança cadastrado."
        );
    }


    /* ==================================================
       REMOVE O ESCOLHIDO E COMPACTA
    ================================================== */

    contatos.splice(
        indice,
        1
    );

    const contatosRestantes =
        contatos.filter(
            contatoTemDados
        );


    /* ==================================================
       CONFERE SE OS QUE VÃO PERMANECER ESTÃO COMPLETOS
    ================================================== */

    const contatoValido = function(contato) {
        return (
            !!contato.nome &&
            (
                contato.whatsapp.length === 10 ||
                contato.whatsapp.length === 11
            ) &&
            !!contato.relacao
        );
    };


    const existeContatoIncompleto =
        contatosRestantes.some(
            function(contato) {
                return !contatoValido(
                    contato
                );
            }
        );


    if (existeContatoIncompleto) {
        return PRIMEIRAPAG_Login_func_mostrarErro(
            "MOTORISTAPAG_Login_error_contatos",
            "Complete os contatos que permanecerão na lista antes de excluir."
        );
    }


    const novoPrincipal =
        contatosRestantes[0];

    const novosExtras =
        contatosRestantes.slice(
            1,
            3
        );


    const botoesExcluir =
        document.querySelectorAll(
            "#MOTORISTAPAG_Login_modal_perfil_02_editar_contatos .MOTORISTAPAG_Login_contato_btn_excluir"
        );


    try {
        botoesExcluir.forEach(
            function(botao) {
                botao.disabled =
                    true;
            }
        );


        const agora =
            firebase.firestore
                .FieldValue
                .serverTimestamp();


        await Promise.all([

            /* USUÁRIO — NOVO PRINCIPAL */

            PRIMEIRAPAG_Login_db
                .collection("usuarios")
                .doc(user.uid)
                .set(
                    {
                        contatoEmergencia:
                            novoPrincipal,

                        contatoEmergenciaConcluido:
                            true,

                        atualizadoEm:
                            agora
                    },
                    {
                        merge: true
                    }
                ),


            /* MOTORISTA — NOVO PRINCIPAL + EXTRAS */

            PRIMEIRAPAG_Login_db
                .collection("motoristas")
                .doc(user.uid)
                .set(
                    {
                        contatoEmergencia:
                            novoPrincipal,

                        contatoEmergenciaConcluido:
                            true,

                        contatosReferenciaMotorista:
                            novosExtras,

                        atualizadoEm:
                            agora
                    },
                    {
                        merge: true
                    }
                )
        ]);


        /* ==================================================
           REORGANIZAR A TELA SOMENTE DEPOIS DE SALVAR
        ================================================== */

        MOTORISTAPAG_Login_func_preencherCampoContato(
            "MOTORISTAPAG_Login_input_contato_principal",
            "MOTORISTAPAG_Login_select_contato_principal_relacao",
            novoPrincipal
        );


        MOTORISTAPAG_Login_func_preencherCampoContato(
            "MOTORISTAPAG_Login_input_contato_extra1",
            "MOTORISTAPAG_Login_select_contato_extra1_relacao",
            novosExtras[0] || {}
        );


        MOTORISTAPAG_Login_func_preencherCampoContato(
            "MOTORISTAPAG_Login_input_contato_extra2",
            "MOTORISTAPAG_Login_select_contato_extra2_relacao",
            novosExtras[1] || {}
        );


        /* ==================================================
           ATUALIZAR TELAS PAIS
        ================================================== */

        if (
            typeof MOTORISTAPAG_Login_func_carregarDadosPessoaisMotorista ===
            "function"
        ) {
            await MOTORISTAPAG_Login_func_carregarDadosPessoaisMotorista();
        }

        if (
            typeof MOTORISTAPAG_Login_func_preencherPerfilMotorista ===
            "function"
        ) {
            await MOTORISTAPAG_Login_func_preencherPerfilMotorista();
        }


        console.log(
            "TNP MOB: contato de segurança excluído e lista reorganizada."
        );


    } catch (erro) {
        console.error(
            "Erro ao excluir contato de segurança:",
            erro
        );

        PRIMEIRAPAG_Login_func_mostrarErro(
            "MOTORISTAPAG_Login_error_contatos",
            "Erro ao excluir contato: " +
            erro.message
        );


    } finally {
        botoesExcluir.forEach(
            function(botao) {
                botao.disabled =
                    false;
            }
        );
    }
}


/* ==================================================
   DISPONIBILIZAR GLOBALMENTE
================================================== */

window.MOTORISTAPAG_Login_func_carregarModuloEditarContatosReferenciaMotorista =
    MOTORISTAPAG_Login_func_carregarModuloEditarContatosReferenciaMotorista;

window.MOTORISTAPAG_Login_func_fecharEditarContatosReferenciaMotorista =
    MOTORISTAPAG_Login_func_fecharEditarContatosReferenciaMotorista;

window.MOTORISTAPAG_Login_func_abrirEditarContatosReferenciaMotorista =
    MOTORISTAPAG_Login_func_abrirEditarContatosReferenciaMotorista;
	
window.MOTORISTAPAG_Login_func_carregarContatosReferenciaMotorista =
    MOTORISTAPAG_Login_func_carregarContatosReferenciaMotorista;	
	
window.MOTORISTAPAG_Login_func_salvarContatosReferenciaMotorista =
    MOTORISTAPAG_Login_func_salvarContatosReferenciaMotorista;	
	
window.MOTORISTAPAG_Login_func_excluirContatoSeguranca =
    MOTORISTAPAG_Login_func_excluirContatoSeguranca;	
