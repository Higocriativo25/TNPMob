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


