"use strict";

/* =========================================================
   ABERTURA — 5 MOMENTOS DE 5 SEGUNDOS
========================================================= */

const OPENING_CONFIG = {
    mode: "once-per-session",
    storageKey: "philoflix-opening-viewed",
    momentDuration: 5000,
    transitionDuration: 720
};

const openingScreen = document.getElementById("openingScreen");
const openingMoments = Array.from(document.querySelectorAll(".opening-moment"));
const openingFinal = document.getElementById("openingFinal");
const openingProgressItems = Array.from(document.querySelectorAll("[data-progress-index]"));
const openingProgressText = document.getElementById("openingProgressText");
const skipOpeningButton = document.getElementById("skipOpeningButton");
const enterPhiloflixButton = document.getElementById("enterPhiloflixButton");

let currentOpeningIndex = 0;
let openingTimer = null;
let openingIsFinal = false;
let openingIsRunning = false;

function setPlatformInert(disabled) {
    Array.from(document.body.children).forEach((element) => {
        if (element === openingScreen || element.tagName === "SCRIPT") {
            return;
        }

        if (disabled) {
            element.setAttribute("inert", "");
            element.setAttribute("aria-hidden", "true");
        } else {
            element.removeAttribute("inert");
            element.removeAttribute("aria-hidden");
        }
    });
}

function shouldShowOpening() {
    if (OPENING_CONFIG.mode === "disabled") {
        return false;
    }

    if (OPENING_CONFIG.mode === "always") {
        return true;
    }

    try {
        return sessionStorage.getItem(OPENING_CONFIG.storageKey) !== "true";
    } catch (error) {
        return true;
    }
}

function saveOpeningAsViewed() {
    if (OPENING_CONFIG.mode !== "once-per-session") {
        return;
    }

    try {
        sessionStorage.setItem(OPENING_CONFIG.storageKey, "true");
    } catch (error) {
        console.warn("Não foi possível registrar a abertura.", error);
    }
}

function updateOpeningProgress(activeIndex, allComplete = false) {
    openingProgressItems.forEach((progressItem, index) => {
        progressItem.classList.remove("active", "complete");

        if (allComplete) {
            progressItem.classList.add("complete");
        } else if (index < activeIndex) {
            progressItem.classList.add("complete");
        } else if (index === activeIndex) {
            progressItem.classList.add("active");
        }
    });

    openingProgressText.textContent = allComplete
        ? "Cinco momentos apresentados"
        : `Momento ${activeIndex + 1} de 5`;
}

function clearOpeningMomentStates() {
    openingMoments.forEach((moment) => {
        moment.classList.remove("active", "leaving");
    });
}

function showOpeningMoment(index) {
    if (index < 0 || index >= openingMoments.length) {
        return;
    }

    window.clearTimeout(openingTimer);

    const previousMoment = openingMoments[currentOpeningIndex];
    const nextMoment = openingMoments[index];

    if (previousMoment && previousMoment !== nextMoment) {
        previousMoment.classList.remove("active");
        previousMoment.classList.add("leaving");

        window.setTimeout(() => {
            previousMoment.classList.remove("leaving");
        }, OPENING_CONFIG.transitionDuration);
    }

    openingFinal.classList.remove("active");
    nextMoment.classList.add("active");

    currentOpeningIndex = index;
    openingIsFinal = false;

    updateOpeningProgress(index);

    openingTimer = window.setTimeout(
        advanceOpening,
        OPENING_CONFIG.momentDuration
    );
}

function advanceOpening() {
    if (!openingIsRunning) {
        return;
    }

    if (currentOpeningIndex < openingMoments.length - 1) {
        showOpeningMoment(currentOpeningIndex + 1);
        return;
    }

    showOpeningFinal();
}

function previousOpeningMoment() {
    if (!openingIsRunning) {
        return;
    }

    if (openingIsFinal) {
        showOpeningMoment(openingMoments.length - 1);
        return;
    }

    if (currentOpeningIndex > 0) {
        showOpeningMoment(currentOpeningIndex - 1);
    }
}

function showOpeningFinal() {
    window.clearTimeout(openingTimer);

    openingMoments.forEach((moment) => {
        moment.classList.remove("active", "leaving");
    });

    openingFinal.classList.add("active");
    openingIsFinal = true;

    updateOpeningProgress(openingMoments.length - 1, true);

    window.setTimeout(() => {
        enterPhiloflixButton.focus();
    }, 450);
}

function finishOpening() {
    if (!openingScreen || openingScreen.hidden) {
        return;
    }

    openingIsRunning = false;
    window.clearTimeout(openingTimer);
    saveOpeningAsViewed();

    openingScreen.classList.add("opening-exit");
    setPlatformInert(false);

    window.setTimeout(() => {
        openingScreen.hidden = true;
        document.body.classList.remove("opening-active");

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto"
        });

        const mainLogoButton = document.getElementById("logoButton");

        if (mainLogoButton) {
            mainLogoButton.focus({ preventScroll: true });
        }
    }, 850);
}

function initializeOpening() {
    if (!openingScreen || !shouldShowOpening()) {
        if (openingScreen) {
            openingScreen.hidden = true;
        }

        document.body.classList.remove("opening-active");
        setPlatformInert(false);
        return;
    }

    openingIsRunning = true;
    openingScreen.hidden = false;
    openingScreen.classList.remove("opening-exit");
    document.body.classList.add("opening-active");

    setPlatformInert(true);
    clearOpeningMomentStates();

    currentOpeningIndex = 0;
    openingMoments[0].classList.add("active");
    updateOpeningProgress(0);

    window.setTimeout(() => {
        skipOpeningButton.focus();
    }, 250);

    openingTimer = window.setTimeout(
        advanceOpening,
        OPENING_CONFIG.momentDuration
    );
}

skipOpeningButton.addEventListener("click", finishOpening);
enterPhiloflixButton.addEventListener("click", finishOpening);

document.addEventListener("keydown", (event) => {
    if (!openingIsRunning) {
        return;
    }

    if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();

        if (!openingIsFinal) {
            advanceOpening();
        }

        return;
    }

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        previousOpeningMoment();
        return;
    }

    if (event.key === "Escape") {
        event.preventDefault();
        finishOpening();
    }
});


/* =========================================================
   IMAGENS NO DIRETÓRIO-RAIZ DO GITHUB
========================================================= */

/* Todos os arquivos visuais do projeto são JPG e ficam na raiz do GitHub. */
const IMAGE_EXTENSIONS = ["jpg"];
const resolvedAssetPaths = new Map();

function formatNumber(number) {
    return String(number).padStart(2, "0");
}

function normalizeAssetBaseNames(baseNameOrNames) {
    const names = Array.isArray(baseNameOrNames)
        ? baseNameOrNames
        : [baseNameOrNames];

    return names
        .map((name) => String(name || "").trim())
        .filter(Boolean);
}

function createAssetCandidates(baseNameOrNames, forceRefresh = false) {
    const cacheSuffix = forceRefresh
        ? `?update=${Date.now()}`
        : "";

    return normalizeAssetBaseNames(baseNameOrNames).flatMap(
        (baseName) => IMAGE_EXTENSIONS.map(
            (extension) => `./${baseName}.${extension}${cacheSuffix}`
        )
    );
}

function loadRepositoryAsset(
    imageElement,
    baseNameOrNames,
    callbacks = {},
    forceRefresh = false
) {
    const baseNames = normalizeAssetBaseNames(baseNameOrNames);

    if (!imageElement || baseNames.length === 0) {
        callbacks.onFailure?.();
        return;
    }

    const cacheKey = baseNames.join("|");

    if (forceRefresh) {
        resolvedAssetPaths.delete(cacheKey);
    }

    const cachedPath = resolvedAssetPaths.get(cacheKey);
    const defaultCandidates = createAssetCandidates(baseNames, forceRefresh);

    const candidates = cachedPath && !forceRefresh
        ? [
            cachedPath,
            ...defaultCandidates.filter((path) => path !== cachedPath)
        ]
        : defaultCandidates;

    let candidateIndex = 0;

    function tryNextCandidate() {
        if (candidateIndex >= candidates.length) {
            imageElement.onload = null;
            imageElement.onerror = null;
            imageElement.removeAttribute("src");
            callbacks.onFailure?.();
            return;
        }

        const candidate = candidates[candidateIndex];
        candidateIndex += 1;

        imageElement.onload = () => {
            imageElement.onerror = null;
            resolvedAssetPaths.set(cacheKey, candidate.split("?")[0]);
            callbacks.onSuccess?.(candidate);
        };

        imageElement.onerror = tryNextCandidate;
        imageElement.src = candidate;
    }

    tryNextCandidate();
}


/* =========================================================
   CATÁLOGO PRINCIPAL — IMG01 A IMG30

   Ordem de cada grupo:
   01 Conteúdo
   02 Fórum
   03 Vídeos
   04 Atividades
   05 Saiba Mais
========================================================= */

const categoryDefinitions = [
    {
        id: "mito-filosofia",
        title: "Mito e Filosofia",
        subtitle: "Narrativas míticas, explicações simbólicas e o surgimento do pensamento filosófico.",
        symbol: "Ω",
        rgb: "184, 117, 255",
        imageStart: 1,
        items: [
            {
                type: "Conteúdo",
                title: "Origens do pensamento filosófico",
                description: "Textos introdutórios sobre mito, razão e nascimento da Filosofia.",
                icon: "Φ"
            },
            {
                type: "Fórum",
                title: "O mito ainda explica o mundo?",
                description: "Espaço de participação, argumentação e debate coletivo.",
                icon: "◌"
            },
            {
                type: "Vídeos",
                title: "Do mito ao pensamento racional",
                description: "Biblioteca audiovisual sobre mitologia e nascimento da Filosofia.",
                icon: "▶"
            },
            {
                type: "Atividades",
                title: "Mito, narrativa e explicação",
                description: "Atividades de interpretação, comparação e reflexão filosófica.",
                icon: "✓"
            },
            {
                type: "Saiba Mais",
                title: "Mitos, filósofos e narrativas",
                description: "Leituras, textos complementares e materiais de aprofundamento.",
                icon: "✦"
            }
        ]
    },
    {
        id: "teoria-conhecimento",
        title: "Teoria do Conhecimento",
        subtitle: "Verdade, crença, razão, experiência, dúvida e possibilidades do conhecimento humano.",
        symbol: "?",
        rgb: "78, 181, 255",
        imageStart: 6,
        items: [
            {
                type: "Conteúdo",
                title: "O que podemos conhecer?",
                description: "Conceitos sobre verdade, crença, razão, experiência e conhecimento.",
                icon: "?"
            },
            {
                type: "Fórum",
                title: "Existe uma verdade absoluta?",
                description: "Debate sobre verdade, opinião, evidência e interpretação.",
                icon: "◌"
            },
            {
                type: "Vídeos",
                title: "Caminhos do conhecimento",
                description: "Biblioteca audiovisual sobre racionalismo, empirismo, criticismo e ceticismo.",
                icon: "▶"
            },
            {
                type: "Atividades",
                title: "Razão, dúvida e experiência",
                description: "Questões investigativas e exercícios sobre o conhecimento humano.",
                icon: "✓"
            },
            {
                type: "Saiba Mais",
                title: "Verdade e pensamento",
                description: "Textos filosóficos e materiais complementares para pesquisa.",
                icon: "✦"
            }
        ]
    },
    {
        id: "etica",
        title: "Ética",
        subtitle: "Liberdade, responsabilidade, valores, escolhas, virtudes e convivência humana.",
        symbol: "⚖",
        rgb: "255, 181, 71",
        imageStart: 11,
        items: [
            {
                type: "Conteúdo",
                title: "Liberdade e responsabilidade",
                description: "Estudos sobre valores, escolhas, virtudes e ação moral.",
                icon: "⚖"
            },
            {
                type: "Fórum",
                title: "Como devemos agir?",
                description: "Discussões sobre decisões, valores e responsabilidade social.",
                icon: "◌"
            },
            {
                type: "Vídeos",
                title: "Ética na vida cotidiana",
                description: "Biblioteca audiovisual sobre virtude, dever, liberdade e consequências.",
                icon: "▶"
            },
            {
                type: "Atividades",
                title: "Dilemas e decisões éticas",
                description: "Situações-problema para análise, escolha e argumentação.",
                icon: "✓"
            },
            {
                type: "Saiba Mais",
                title: "Pensadores da Ética",
                description: "Textos de Aristóteles, Kant, Mill e outros filósofos.",
                icon: "✦"
            }
        ]
    },
    {
        id: "filosofia-politica",
        title: "Filosofia Política",
        subtitle: "Poder, Estado, justiça, democracia, cidadania, direitos e organização da sociedade.",
        symbol: "▥",
        rgb: "255, 97, 107",
        imageStart: 16,
        items: [
            {
                type: "Conteúdo",
                title: "Poder, Estado e sociedade",
                description: "Conceitos de poder, justiça, cidadania e organização política.",
                icon: "▥"
            },
            {
                type: "Fórum",
                title: "O que torna uma sociedade justa?",
                description: "Debates sobre desigualdade, direitos, justiça e democracia.",
                icon: "◌"
            },
            {
                type: "Vídeos",
                title: "Ideias que organizaram sociedades",
                description: "Biblioteca audiovisual sobre democracia, poder, Estado e liberdade.",
                icon: "▶"
            },
            {
                type: "Atividades",
                title: "Cidadania e participação",
                description: "Atividades sobre direitos, deveres, democracia e vida coletiva.",
                icon: "✓"
            },
            {
                type: "Saiba Mais",
                title: "Clássicos da Filosofia Política",
                description: "Leituras de Platão, Hobbes, Locke, Rousseau, Marx e Arendt.",
                icon: "✦"
            }
        ]
    },
    {
        id: "filosofia-ciencia",
        title: "Filosofia da Ciência",
        subtitle: "Método científico, hipóteses, evidências, paradigmas, tecnologia e limites da ciência.",
        symbol: "✧",
        rgb: "70, 213, 194",
        imageStart: 21,
        items: [
            {
                type: "Conteúdo",
                title: "Conceitos sobre método, hipótese, evidência e explicação científica",
                description: "Estude os principais conceitos empregados na investigação e na construção do conhecimento científico.",
                icon: "✧"
            },
            {
                type: "Fórum",
                title: "Discussões sobre ciência, tecnologia, ética e sociedade",
                description: "Participe de debates sobre os impactos científicos e tecnológicos na vida individual e coletiva.",
                icon: "◌"
            },
            {
                type: "Vídeos",
                title: "Por dentro do cinema: como a ciência constrói explicações",
                description: "Biblioteca de filmes e produções audiovisuais sobre ciência, história e sociedade.",
                icon: "▶"
            },
            {
                type: "Atividades",
                title: "Revisão com atividades e jogos",
                description: "Revise os conceitos de Filosofia da Ciência por meio de exercícios, desafios e jogos educativos.",
                icon: "✓"
            },
            {
                type: "Saiba Mais",
                title: "Artigos científicos para aprofundar o tema",
                description: "Acesse artigos, textos acadêmicos e materiais complementares relacionados à Filosofia da Ciência.",
                icon: "✦"
            }
        ]
    },
    {
        id: "estetica",
        title: "Estética",
        subtitle: "Arte, beleza, sensibilidade, criação, interpretação e experiência estética.",
        symbol: "◐",
        rgb: "236, 114, 216",
        imageStart: 26,
        items: [
            {
                type: "Conteúdo",
                title: "Arte, beleza e sensibilidade",
                description: "Conceitos de beleza, criação artística e experiência estética.",
                icon: "◐"
            },
            {
                type: "Fórum",
                title: "O que transforma algo em arte?",
                description: "Espaço para discutir beleza, cultura, criação e interpretação.",
                icon: "◌"
            },
            {
                type: "Vídeos",
                title: "Filosofia, arte e cultura",
                description: "Biblioteca audiovisual sobre arte, gosto, beleza e indústria cultural.",
                icon: "▶"
            },
            {
                type: "Atividades",
                title: "Leitura e interpretação de obras",
                description: "Atividades de observação, análise e produção estética.",
                icon: "✓"
            },
            {
                type: "Saiba Mais",
                title: "Pensamento estético",
                description: "Textos, obras e materiais para aprofundamento filosófico.",
                icon: "✦"
            }
        ]
    }
];

const ENVIRONMENT_IMAGE_PREFIXES = [
    "conteudo",
    "forum",
    "video",
    "atividade",
    "saibamais"
];

const catalogData = categoryDefinitions.map((category, categoryIndex) => ({
    ...category,
    sequence: formatNumber(categoryIndex + 1),
    items: category.items.map((item, itemIndex) => ({
        ...item,
        number: formatNumber(itemIndex + 1),

        /*
           Nomenclatura única das capas e dos fundos internos.
           Todos os arquivos ficam na raiz do GitHub e utilizam .jpg:

           conteudo01.jpg, forum01.jpg, video01.jpg,
           atividade01.jpg e saibamais01.jpg
           ... até a sequência 06.

           A mesma imagem exibida na capa 16:9 é reutilizada como
           plano de fundo da página interna correspondente.
        */
        imageBase: `${ENVIRONMENT_IMAGE_PREFIXES[itemIndex]}${formatNumber(categoryIndex + 1)}`,
        detailBackgroundBase: `${ENVIRONMENT_IMAGE_PREFIXES[itemIndex]}${formatNumber(categoryIndex + 1)}`
    }))
}));


/* =========================================================
   PÁGINAS DE ENTRADA — O QUE VOCÊ ENCONTRARÁ

   Estas cinco imagens permanecem na raiz do GitHub:
   conteudos.jpg
   forum.jpg
   videos.jpg
   atividades.jpg
   saibamais.jpg
========================================================= */

const environmentEntryDefinitions = {
    "conteudos": {
        id: "conteudos",
        itemNumber: "01",
        number: "AMBIENTE 01",
        title: "CONTEÚDOS",
        subtitle: "Textos, conceitos, explicações e materiais organizados para estudo.",
        sectionLabel: "CONTEÚDOS NO ROTEIRO",
        instruction: "Escolha um conteúdo estruturante para acessar sua página de conteúdos.",
        symbol: "▤",
        backgroundBase: "conteudos",
        accentRgb: "90, 166, 255"
    },
    "forum": {
        id: "forum",
        itemNumber: "02",
        number: "AMBIENTE 02",
        title: "FÓRUM DE DEBATES",
        subtitle: "Espaços de participação, argumentação, escuta e construção coletiva de ideias.",
        sectionLabel: "FÓRUNS NO ROTEIRO",
        instruction: "Escolha um conteúdo estruturante para acessar seu espaço de debate.",
        symbol: "dialog",
        backgroundBase: "forum",
        accentRgb: "229, 9, 20"
    },
    "videos": {
        id: "videos",
        itemNumber: "03",
        number: "AMBIENTE 03",
        title: "VÍDEOS COMPLEMENTARES",
        subtitle: "Filmes, documentários, aulas e produções audiovisuais para ampliar o pensamento.",
        sectionLabel: "VÍDEOS NO ROTEIRO",
        instruction: "Escolha um conteúdo estruturante para acessar sua biblioteca audiovisual.",
        symbol: "▶",
        backgroundBase: "videos",
        accentRgb: "255, 122, 71"
    },
    "atividades": {
        id: "atividades",
        itemNumber: "04",
        number: "AMBIENTE 04",
        title: "ATIVIDADES",
        subtitle: "Exercícios, jogos, desafios e experiências interativas de aprendizagem.",
        sectionLabel: "ATIVIDADES NO ROTEIRO",
        instruction: "Escolha um conteúdo estruturante para acessar suas atividades.",
        symbol: "✓",
        backgroundBase: "atividades",
        accentRgb: "41, 197, 111"
    },
    "saiba-mais": {
        id: "saiba-mais",
        itemNumber: "05",
        number: "AMBIENTE 05",
        title: "SAIBA +",
        subtitle: "Leituras, artigos, referências e materiais complementares para aprofundamento.",
        sectionLabel: "SAIBA + NO ROTEIRO",
        instruction: "Escolha um conteúdo estruturante para acessar seus materiais complementares.",
        symbol: "✦",
        backgroundBase: "saibamais",
        accentRgb: "203, 167, 92"
    }
};


/* =========================================================
   BIBLIOTECAS AUDIOVISUAIS — 10 ESPAÇOS POR TEMA

   Capas no diretório-raiz:
   VMF: vmf01 a vmf10
   VTC: vtc01 a vtc10
   VET: vet01 a vet10
   VFP: vfp01 a vfp10
   VFC: vfc01 a vfc10
   VES: ves01 a ves10
========================================================= */

const videoLibraries = {
    "mito-filosofia": [
        {
            "number": 1,
            "code": "VMF01",
            "coverBase": "vmf01",
            "available": true,
            "videoAvailable": false,
            "title": "Fúria de Titãs",
            "shortDescription": "Perseu, filho mortal de Zeus, aceita liderar uma perigosa missão para impedir que Hades destrua o mundo humano e tome o poder do Olimpo.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Perseu, filho mortal de Zeus, aceita liderar uma perigosa missão para impedir que Hades destrua o mundo humano e tome o poder do Olimpo. Em sua jornada, enfrenta criaturas mitológicas e conflitos entre destino, coragem e escolha pessoal.",
            "technicalTitle": "Clash of the Titans",
            "direction": "Louis Leterrier",
            "cast": "Sam Worthington, Gemma Arterton, Mads Mikkelsen, Liam Neeson, Ralph Fiennes",
            "countryYear": "Estados Unidos/2010",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Não se aplica. Não foi localizado canal autorizado com o filme completo em domínio público.",
            "sources": "Warner Bros. | British Film Institute",
            "pedagogicalRange": ""
        },
                {
            "number": 2,
            "code": "VMF02",
            "coverBase": "vmf02",
            "available": true,
            "videoAvailable": true,
            "badgeLabel": "Acesso público",
            "title": "Uma Noite no Museu",
            "shortDescription": "Larry Daley descobre que, depois do anoitecer, personagens e peças do Museu de História Natural ganham vida.",
            "videoUrl": "https://play.mercadolivre.com.br/assistir/uma-noite-no-museu/258dcaf180a64ee7ab75712275f27e75",
            "embedUrl": "",
            "linkLabel": "Abrir no Mercado Play",
            "synopsis": "Larry Daley aceita trabalhar como guarda noturno no Museu de História Natural de Nova York e descobre que, depois do anoitecer, as peças e os personagens das exposições ganham vida. Ao conviver com figuras históricas e representações de diferentes épocas, ele precisa superar conflitos e proteger o museu. A obra permite refletir sobre memória cultural, construção das narrativas históricas, heroísmo, imaginação e a transformação de personagens do passado em símbolos coletivos.",
            "technicalTitle": "Night at the Museum",
            "direction": "Shawn Levy",
            "cast": "Ben Stiller, Carla Gugino, Dick Van Dyke, Mickey Rooney, Bill Cobbs, Robin Williams e Owen Wilson",
            "countryYear": "Estados Unidos, Reino Unido/2006",
            "publicAccessText": "Acesso gratuito e licenciado no Mercado Play. A obra não está em domínio público e a disponibilidade deve ser reconferida antes da publicação.",
            "channel": "Mercado Play — acesso gratuito licenciado",
            "sources": "Mercado Play | 20th Century Studios | Disney+ Brasil | British Film Institute",
            "pedagogicalRange": "Livre na curadoria do Mercado Play; faixa pedagógica sugerida: 8 a 14 anos"
        },
        {
            "number": 3,
            "code": "VMF03",
            "coverBase": "vmf03",
            "available": true,
            "videoAvailable": false,
            "title": "Moana: Um Mar de Aventuras",
            "shortDescription": "Moana, uma jovem navegadora, atravessa o oceano para restaurar o coração de Te Fiti e salvar sua comunidade.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Moana, uma jovem navegadora, atravessa o oceano para restaurar o coração de Te Fiti e salvar sua comunidade. Ao lado do semideus Maui, reencontra tradições ancestrais e aprende sobre identidade, responsabilidade e relação entre humanidade e natureza.",
            "technicalTitle": "Moana",
            "direction": "John Musker e Ron Clements",
            "cast": "Auli'i Cravalho, Dwayne Johnson, Rachel House, Temuera Morrison, Jemaine Clement",
            "countryYear": "Estados Unidos/2016",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Não se aplica. Não foi localizado canal autorizado com o filme completo em domínio público.",
            "sources": "Disney Movies | British Film Institute",
            "pedagogicalRange": ""
        },
        {
            "number": 4,
            "code": "VMF04",
            "coverBase": "vmf04",
            "available": true,
            "videoAvailable": false,
            "title": "A Canção do Oceano",
            "shortDescription": "Ben e sua irmã Saoirse, a última das selkies, atravessam um mundo inspirado no folclore irlandês para libertar seres mágicos ameaçados.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Ben e sua irmã Saoirse, a última das selkies, atravessam um mundo inspirado no folclore irlandês para libertar seres mágicos ameaçados. A viagem transforma o luto da família em uma narrativa sobre memória, afeto e reconciliação.",
            "technicalTitle": "Song of the Sea",
            "direction": "Tomm Moore",
            "cast": "David Rawle, Lucy O'Connell, Brendan Gleeson, Fionnula Flanagan, Lisa Hannigan",
            "countryYear": "Irlanda, Luxemburgo, Bélgica, França, Dinamarca/2014",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Não se aplica. Não foi localizado canal autorizado com o filme completo em domínio público.",
            "sources": "British Film Institute | BFI Player",
            "pedagogicalRange": ""
        },
        {
            "number": 5,
            "code": "VMF05",
            "coverBase": "vmf05",
            "available": true,
            "videoAvailable": true,
            "title": "Poder Além da Vida",
            "shortDescription": "Dan Millman é um ginasta talentoso, mas inquieto e obcecado pelo sucesso.",
            "videoUrl": "https://www.youtube.com/watch?v=0XxCLLrWXxE",
            "embedUrl": "https://www.youtube.com/embed/0XxCLLrWXxE",
            "synopsis": "Dan Millman é um ginasta talentoso, mas inquieto e obcecado pelo sucesso. O encontro com um homem chamado Sócrates e as consequências de um grave acidente o conduzem a uma aprendizagem sobre disciplina, presença, humildade e sentido da vida.",
            "technicalTitle": "Peaceful Warrior",
            "direction": "Victor Salva",
            "cast": "Scott Mechlowicz, Nick Nolte, Amy Smart, Tim DeKay, Paul Wesley",
            "countryYear": "Estados Unidos/2006",
            "publicAccessText": "Filme integral disponibilizado gratuitamente no canal Film Plus.",
            "channel": "Film Plus",
            "sources": "American Film Institute | Rotten Tomatoes",
            "pedagogicalRange": ""
        },
        {
            "number": 6,
            "code": "VMF06",
            "coverBase": "vmf06",
            "available": true,
            "videoAvailable": true,
            "title": "O Grande Desafio",
            "shortDescription": "Inspirado em acontecimentos reais, o filme acompanha o professor Melvin B.",
            "videoUrl": "https://www.youtube.com/watch?v=WfbbSeTjviM",
            "embedUrl": "https://www.youtube.com/embed/WfbbSeTjviM",
            "synopsis": "Inspirado em acontecimentos reais, o filme acompanha o professor Melvin B. Tolson e uma equipe de debates de uma universidade negra no Texas dos anos 1930. Por meio de estudo, pesquisa e argumentação, os estudantes enfrentam o racismo e disputam espaço em uma sociedade segregada.",
            "technicalTitle": "The Great Debaters",
            "direction": "Denzel Washington",
            "cast": "Denzel Washington, Forest Whitaker, Nate Parker, Jurnee Smollett, Denzel Whitaker",
            "countryYear": "Estados Unidos/2007",
            "publicAccessText": "Filme integral disponibilizado gratuitamente no canal Film Plus.",
            "channel": "Film Plus",
            "sources": "American Film Institute | Google Play",
            "pedagogicalRange": ""
        },
        {
            "number": 7,
            "code": "VMF07",
            "coverBase": "vmf07",
            "available": true,
            "videoAvailable": false,
            "title": "Enola Holmes",
            "shortDescription": "Ao descobrir o desaparecimento da mãe, Enola Holmes deixa a casa da família e inicia sua própria investigação.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Ao descobrir o desaparecimento da mãe, Enola Holmes deixa a casa da família e inicia sua própria investigação. Usando observação, códigos e dedução, ela procura superar os irmãos Sherlock e Mycroft, ajuda um jovem lorde e descobre uma conspiração política.",
            "technicalTitle": "Enola Holmes",
            "direction": "Harry Bradbeer",
            "cast": "Millie Bobby Brown, Henry Cavill, Sam Claflin, Helena Bonham Carter, Louis Partridge",
            "countryYear": "Reino Unido, Estados Unidos/2020",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Não se aplica. Não foi localizado canal autorizado com o filme completo em domínio público.",
            "sources": "Netflix | American Film Institute",
            "pedagogicalRange": ""
        },
        {
            "number": 8,
            "code": "VMF08",
            "coverBase": "vmf08",
            "available": true,
            "videoAvailable": false,
            "title": "12 Homens e uma Sentença",
            "shortDescription": "Doze jurados precisam decidir o destino de um adolescente acusado de assassinato.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Doze jurados precisam decidir o destino de um adolescente acusado de assassinato. Quando um deles manifesta dúvida razoável, o grupo é obrigado a reexaminar provas, testemunhos e preconceitos, revelando como decisões podem ser influenciadas por emoções e convicções pessoais.",
            "technicalTitle": "12 Angry Men",
            "direction": "Sidney Lumet",
            "cast": "Henry Fonda, Lee J. Cobb, E. G. Marshall, Jack Warden, Ed Begley",
            "countryYear": "Estados Unidos/1957",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Não se aplica. Não foi localizado canal autorizado com o filme completo em domínio público.",
            "sources": "The Criterion Collection",
            "pedagogicalRange": ""
        },
        {
            "number": 9,
            "code": "VMF09",
            "coverBase": "vmf09",
            "available": false,
            "videoAvailable": false,
            "title": "Espaço reservado 09",
            "shortDescription": "Nova obra audiovisual será organizada neste espaço.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "",
            "technicalTitle": "",
            "direction": "",
            "cast": "",
            "countryYear": "",
            "publicAccessText": "",
            "channel": "",
            "sources": "",
            "pedagogicalRange": ""
        },
        {
            "number": 10,
            "code": "VMF10",
            "coverBase": "vmf10",
            "available": false,
            "videoAvailable": false,
            "title": "Espaço reservado 10",
            "shortDescription": "Nova obra audiovisual será organizada neste espaço.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "",
            "technicalTitle": "",
            "direction": "",
            "cast": "",
            "countryYear": "",
            "publicAccessText": "",
            "channel": "",
            "sources": "",
            "pedagogicalRange": ""
        }
    ],
    "teoria-conhecimento": [
        {
            "number": 1,
            "code": "VTC01",
            "coverBase": "vtc01",
            "available": true,
            "videoAvailable": false,
            "title": "As Aventuras de Pi",
            "shortDescription": "Após um naufrágio, o jovem Pi Patel fica à deriva em um bote salva-vidas ao lado de um tigre-de-bengala.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Após um naufrágio, o jovem Pi Patel fica à deriva em um bote salva-vidas ao lado de um tigre-de-bengala. A experiência de sobrevivência transforma-se em uma reflexão sobre fé, verdade, narrativa, percepção e os diferentes sentidos que atribuímos à realidade.",
            "technicalTitle": "Life of Pi",
            "direction": "Ang Lee",
            "cast": "Suraj Sharma, Irrfan Khan, Tabu, Adil Hussain, Rafe Spall",
            "countryYear": "Estados Unidos, Taiwan, Reino Unido, Canadá/2012",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Acesso somente por distribuidora ou plataforma licenciada.",
            "sources": "20th Century Studios | British Film Institute",
            "pedagogicalRange": ""
        },
        {
            "number": 2,
            "code": "VTC02",
            "coverBase": "vtc02",
            "available": true,
            "videoAvailable": false,
            "title": "Matrix",
            "shortDescription": "Neo, um programador que atua secretamente como hacker, descobre que o mundo percebido pelos seres humanos é uma simulação criada para mantê-los…",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Neo, um programador que atua secretamente como hacker, descobre que o mundo percebido pelos seres humanos é uma simulação criada para mantê-los sob controle. A obra permite discutir aparência e realidade, confiança nos sentidos, dúvida, liberdade e conhecimento.",
            "technicalTitle": "The Matrix",
            "direction": "Lana Wachowski e Lilly Wachowski",
            "cast": "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss, Hugo Weaving",
            "countryYear": "Estados Unidos, Austrália/1999",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Acesso somente por distribuidora ou plataforma licenciada.",
            "sources": "British Film Institute | BBFC",
            "pedagogicalRange": ""
        },
        {
            "number": 3,
            "code": "VTC03",
            "coverBase": "vtc03",
            "available": true,
            "videoAvailable": false,
            "title": "O Homem que Viu o Infinito",
            "shortDescription": "O matemático indiano Srinivasa Ramanujan deixa seu país para estudar em Cambridge, onde desenvolve uma relação intelectual com G.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "O matemático indiano Srinivasa Ramanujan deixa seu país para estudar em Cambridge, onde desenvolve uma relação intelectual com G. H. Hardy. A narrativa permite examinar intuição, razão, demonstração, preconceito acadêmico e os critérios necessários para que uma ideia seja reconhecida como conhecimento.",
            "technicalTitle": "The Man Who Knew Infinity",
            "direction": "Matt Brown",
            "cast": "Dev Patel, Jeremy Irons, Devika Bhise, Stephen Fry, Toby Jones",
            "countryYear": "Reino Unido/2015",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Acesso somente por distribuidora ou plataforma licenciada.",
            "sources": "British Council — UK Films | Paramount Pictures",
            "pedagogicalRange": ""
        },
        {
            "number": 4,
            "code": "VTC04",
            "coverBase": "vtc04",
            "available": true,
            "videoAvailable": false,
            "title": "O Pequeno Príncipe",
            "shortDescription": "Uma menina submetida a uma rotina rigidamente planejada conhece um aviador que lhe apresenta a história do Pequeno Príncipe.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Uma menina submetida a uma rotina rigidamente planejada conhece um aviador que lhe apresenta a história do Pequeno Príncipe. A experiência desperta reflexões sobre imaginação, amizade, valores, experiência e formas de conhecimento que não podem ser reduzidas a cálculos ou resultados mensuráveis.",
            "technicalTitle": "The Little Prince",
            "direction": "Mark Osborne",
            "cast": "Jeff Bridges, Mackenzie Foy, Rachel McAdams, Riley Osborne, Marion Cotillard",
            "countryYear": "França/2015",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Acesso somente por distribuidora ou plataforma licenciada.",
            "sources": "Festival de Cannes",
            "pedagogicalRange": ""
        },
        {
            "number": 5,
            "code": "VTC05",
            "coverBase": "vtc05",
            "available": true,
            "videoAvailable": false,
            "title": "O Show de Truman: O Show da Vida",
            "shortDescription": "Truman Burbank vive em uma cidade aparentemente perfeita, sem saber que sua vida inteira é encenada e transmitida como um programa de televisão.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Truman Burbank vive em uma cidade aparentemente perfeita, sem saber que sua vida inteira é encenada e transmitida como um programa de televisão. Ao perceber incoerências, ele passa a investigar o mundo ao redor, questionando percepção, testemunho, manipulação, verdade e autonomia.",
            "technicalTitle": "The Truman Show",
            "direction": "Peter Weir",
            "cast": "Jim Carrey, Laura Linney, Ed Harris, Noah Emmerich, Natascha McElhone",
            "countryYear": "Estados Unidos/1998",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Acesso somente por distribuidora ou plataforma licenciada.",
            "sources": "Paramount Pictures",
            "pedagogicalRange": ""
        },
        {
            "number": 6,
            "code": "VTC06",
            "coverBase": "vtc06",
            "available": true,
            "videoAvailable": true,
            "title": "Solaris",
            "shortDescription": "O psicólogo Kris Kelvin é enviado a uma estação espacial que orbita o planeta Solaris, onde os tripulantes enfrentam manifestações ligadas às…",
            "videoUrl": "https://www.youtube.com/watch?v=A-Wr3eyEoLo",
            "embedUrl": "https://www.youtube.com/embed/A-Wr3eyEoLo",
            "synopsis": "O psicólogo Kris Kelvin é enviado a uma estação espacial que orbita o planeta Solaris, onde os tripulantes enfrentam manifestações ligadas às próprias memórias e culpas. O filme investiga percepção, consciência, memória, realidade, identidade e os limites do conhecimento científico.",
            "technicalTitle": "Solyaris (Solaris)",
            "direction": "Andrei Tarkovsky",
            "cast": "Donatas Banionis, Natalya Bondarchuk, Yuri Yarvet, Anatoly Solonitsyn",
            "countryYear": "União Soviética/1972",
            "publicAccessText": "Filme integral disponibilizado oficialmente pelo estúdio Mosfilm.",
            "channel": "Mosfilm",
            "sources": "The Criterion Collection | Mosfilm — vídeo integral autorizado",
            "pedagogicalRange": ""
        },
        {
            "number": 7,
            "code": "VTC07",
            "coverBase": "vtc07",
            "available": true,
            "videoAvailable": false,
            "title": "O Doador de Memórias",
            "shortDescription": "Em uma sociedade que eliminou escolhas, diferenças e lembranças dolorosas, Jonas recebe as memórias coletivas que foram ocultadas da população.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Em uma sociedade que eliminou escolhas, diferenças e lembranças dolorosas, Jonas recebe as memórias coletivas que foram ocultadas da população. Ao conhecer o passado, ele passa a questionar autoridade, liberdade, verdade, dogmatismo e a relação entre conhecimento e responsabilidade.",
            "technicalTitle": "The Giver",
            "direction": "Phillip Noyce",
            "cast": "Jeff Bridges, Brenton Thwaites, Meryl Streep, Odeya Rush, Alexander Skarsgård",
            "countryYear": "Estados Unidos/2014",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Acesso somente por distribuidora ou plataforma licenciada.",
            "sources": "British Film Institute",
            "pedagogicalRange": ""
        },
        {
            "number": 8,
            "code": "VTC08",
            "coverBase": "vtc08",
            "available": true,
            "videoAvailable": false,
            "title": "Estrelas Além do Tempo",
            "shortDescription": "Três matemáticas negras desempenham funções decisivas no programa espacial da NASA enquanto enfrentam segregação racial e desigualdade de gênero.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Três matemáticas negras desempenham funções decisivas no programa espacial da NASA enquanto enfrentam segregação racial e desigualdade de gênero. A obra possibilita discutir conhecimento matemático, reconhecimento intelectual, preconceito institucional, autoridade e justiça.",
            "technicalTitle": "Hidden Figures",
            "direction": "Theodore Melfi",
            "cast": "Taraji P. Henson, Octavia Spencer, Janelle Monáe, Kevin Costner, Kirsten Dunst",
            "countryYear": "Estados Unidos/2016",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Acesso somente por distribuidora ou plataforma licenciada.",
            "sources": "20th Century Studios",
            "pedagogicalRange": ""
        },
        {
            "number": 9,
            "code": "VTC09",
            "coverBase": "vtc09",
            "available": false,
            "videoAvailable": false,
            "title": "Espaço reservado 09",
            "shortDescription": "Nova obra audiovisual será organizada neste espaço.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "",
            "technicalTitle": "",
            "direction": "",
            "cast": "",
            "countryYear": "",
            "publicAccessText": "",
            "channel": "",
            "sources": "",
            "pedagogicalRange": ""
        },
        {
            "number": 10,
            "code": "VTC10",
            "coverBase": "vtc10",
            "available": false,
            "videoAvailable": false,
            "title": "Espaço reservado 10",
            "shortDescription": "Nova obra audiovisual será organizada neste espaço.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "",
            "technicalTitle": "",
            "direction": "",
            "cast": "",
            "countryYear": "",
            "publicAccessText": "",
            "channel": "",
            "sources": "",
            "pedagogicalRange": ""
        }
    ],
    "etica": [
                {
            "number": 1,
            "code": "VET01",
            "coverBase": "vet01",
            "available": true,
            "videoAvailable": true,
            "title": "Meu Novo Brinquedo",
            "shortDescription": "Sami é escolhido como o “novo brinquedo” do filho de um empresário e enfrenta uma relação marcada por desigualdade e humilhação.",
            "videoUrl": "https://youtu.be/aagGsNT_ly8?si=ksnLBjI7bQWsoZvr",
            "embedUrl": "https://www.youtube.com/embed/aagGsNT_ly8",
            "synopsis": "Sami vive em um conjunto habitacional e aceita um trabalho noturno em uma loja de luxo. Alexandre, filho de um empresário muito rico, decide escolhê-lo como seu “novo brinquedo”. A relação inicialmente marcada por humilhação e desigualdade se transforma em aprendizagem mútua. A obra permite discutir dignidade humana, objetificação, desigualdade social, preconceito, amizade, cuidado e responsabilidade.",
            "technicalTitle": "Le Nouveau Jouet",
            "direction": "James Huth",
            "cast": "Jamel Debbouze, Daniel Auteuil, Simon Faliu, Alice Belaïdi e Anna Cervinka",
            "countryYear": "França/2022",
            "publicAccessText": "Link de acesso público indicado no arquivo de substituições. A disponibilidade e a autorização ou o licenciamento devem ser reconferidos antes da publicação.",
            "channel": "YouTube — MoviePlay: Filmes em Português",
            "sources": "YouTube indicado no arquivo de substituições | Unifrance",
            "pedagogicalRange": ""
        },
        {
            "number": 2,
            "code": "VET02",
            "coverBase": "vet02",
            "available": true,
            "videoAvailable": false,
            "title": "Benzinho",
            "shortDescription": "Irene vive com o marido e os quatro filhos nos arredores do Rio de Janeiro.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Irene vive com o marido e os quatro filhos nos arredores do Rio de Janeiro. Em meio a dificuldades financeiras e familiares, ela precisa lidar com a partida do filho mais velho, convidado para jogar handebol na Alemanha. O filme favorece reflexões sobre ética do cuidado, autonomia, maternidade, responsabilidade familiar, afeto e respeito às escolhas individuais.",
            "technicalTitle": "Benzinho",
            "direction": "Gustavo Pizzi",
            "cast": "Karine Teles, Otávio Müller, Adriana Esteves, César Troncoso, Konstantinos Sarri e Mateus Solano",
            "countryYear": "Brasil/2018",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Globoplay — acesso licenciado",
            "sources": "Globoplay | Trailer oficial",
            "pedagogicalRange": ""
        },
        {
            "number": 3,
            "code": "VET03",
            "coverBase": "vet03",
            "available": true,
            "videoAvailable": false,
            "title": "Doméstica",
            "shortDescription": "Sete jovens registram durante uma semana o cotidiano das trabalhadoras domésticas de suas casas.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Sete jovens registram durante uma semana o cotidiano das trabalhadoras domésticas de suas casas. As imagens revelam relações de afeto, intimidade, desigualdade e poder presentes no trabalho doméstico. A obra possibilita discutir dignidade, direitos trabalhistas, desigualdade social, respeito, exploração e os limites éticos de filmar a vida de outra pessoa.",
            "technicalTitle": "Doméstica",
            "direction": "Gabriel Mascaro",
            "cast": "Dilma dos Santos Souza, Flávia Santos Silva, Helena Araújo, Lucimar Roza, Maria das Graças Almeida, Sérgio de Jesus e Vanuza de Oliveira",
            "countryYear": "Brasil/2013",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Embaúba Play — locação licenciada",
            "sources": "Embaúba Play",
            "pedagogicalRange": ""
        },
        {
            "number": 4,
            "code": "VET04",
            "coverBase": "vet04",
            "available": true,
            "videoAvailable": false,
            "title": "Extraordinário",
            "shortDescription": "Auggie Pullman, um menino com diferenças faciais, começa a frequentar uma escola regular pela primeira vez.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Auggie Pullman, um menino com diferenças faciais, começa a frequentar uma escola regular pela primeira vez. Ao enfrentar olhares, bullying e exclusão, ele e as pessoas ao redor aprendem sobre respeito, dignidade, amizade e empatia. O filme permite discutir a responsabilidade de quem pratica, presencia ou combate uma injustiça.",
            "technicalTitle": "Wonder",
            "direction": "Stephen Chbosky",
            "cast": "Julia Roberts, Owen Wilson, Jacob Tremblay, Izabela Vidovic e Mandy Patinkin",
            "countryYear": "Estados Unidos/2017",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Lionsgate e plataformas de acesso licenciado",
            "sources": "Lionsgate — página oficial | Trailer oficial Lionsgate",
            "pedagogicalRange": ""
        },
        {
            "number": 5,
            "code": "VET05",
            "coverBase": "vet05",
            "available": true,
            "videoAvailable": false,
            "title": "Homem-Aranha no Aranhaverso",
            "shortDescription": "Miles Morales descobre que também pode assumir a identidade do Homem-Aranha e encontra diferentes heróis vindos de outras dimensões.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Miles Morales descobre que também pode assumir a identidade do Homem-Aranha e encontra diferentes heróis vindos de outras dimensões. A jornada mostra que coragem não é ausência de medo e que capacidades especiais trazem responsabilidades. A obra possibilita discutir identidade, dever moral, solidariedade, coragem e escolha.",
            "technicalTitle": "Spider-Man: Into the Spider-Verse",
            "direction": "Bob Persichetti, Peter Ramsey e Rodney Rothman",
            "cast": "Shameik Moore, Jake Johnson, Hailee Steinfeld, Mahershala Ali e Brian Tyree Henry",
            "countryYear": "Estados Unidos/2018",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Sony Pictures — compra ou locação digital licenciada",
            "sources": "Sony Pictures Animation | Sony Pictures Entertainment | British Film Institute",
            "pedagogicalRange": ""
        },
        {
            "number": 6,
            "code": "VET06",
            "coverBase": "vet06",
            "available": true,
            "videoAvailable": false,
            "title": "O Lorax: Em Busca da Trúfula Perdida",
            "shortDescription": "Ted vive em uma cidade artificial e parte em busca de uma árvore verdadeira.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Ted vive em uma cidade artificial e parte em busca de uma árvore verdadeira. Durante a jornada, conhece a história do Lorax, defensor da floresta destruída pela exploração econômica. A animação permite discutir ética ambiental, consumo, ganância, responsabilidade empresarial e deveres com as futuras gerações.",
            "technicalTitle": "Dr. Seuss' The Lorax",
            "direction": "Chris Renaud; codireção de Kyle Balda",
            "cast": "Danny DeVito, Ed Helms, Zac Efron, Taylor Swift, Jenny Slate e Betty White",
            "countryYear": "Estados Unidos/2012",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Universal Pictures — compra ou locação digital licenciada",
            "sources": "Universal Pictures At Home",
            "pedagogicalRange": ""
        },
        {
            "number": 7,
            "code": "VET07",
            "coverBase": "vet07",
            "available": true,
            "videoAvailable": false,
            "title": "Soul",
            "shortDescription": "Joe Gardner, professor de música apaixonado por jazz, acredita que sua vida só terá valor quando realizar o sonho de tocar profissionalmente.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Joe Gardner, professor de música apaixonado por jazz, acredita que sua vida só terá valor quando realizar o sonho de tocar profissionalmente. Uma experiência inesperada o leva a reconsiderar o sentido da existência e o valor das pequenas experiências. O filme favorece debates sobre felicidade, propósito, realização, cuidado consigo mesmo e concepções de vida boa.",
            "technicalTitle": "Soul",
            "direction": "Pete Docter; codireção de Kemp Powers",
            "cast": "Jamie Foxx, Tina Fey, Graham Norton, Rachel House, Angela Bassett e Daveed Diggs",
            "countryYear": "Estados Unidos/2020",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Disney+ — acesso licenciado",
            "sources": "Disney Movies | Disney+ Brasil | Pixar Animation Studios",
            "pedagogicalRange": ""
        },
        {
            "number": 8,
            "code": "VET08",
            "coverBase": "vet08",
            "available": true,
            "videoAvailable": false,
            "title": "Zootopia",
            "shortDescription": "Judy Hopps torna-se a primeira coelha da polícia de Zootopia e precisa trabalhar com a raposa Nick Wilde para investigar um caso misterioso.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Judy Hopps torna-se a primeira coelha da polícia de Zootopia e precisa trabalhar com a raposa Nick Wilde para investigar um caso misterioso. A convivência entre diferentes espécies revela estereótipos, preconceitos e discriminações. A obra permite discutir igualdade, justiça, convivência, responsabilidade institucional e os efeitos morais de julgar indivíduos pelo grupo ao qual pertencem.",
            "technicalTitle": "Zootopia",
            "direction": "Byron Howard e Rich Moore; codireção de Jared Bush",
            "cast": "Ginnifer Goodwin, Jason Bateman, Idris Elba, Jenny Slate, J. K. Simmons e Shakira",
            "countryYear": "Estados Unidos/2016",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Disney+ e Disney — acesso licenciado",
            "sources": "Walt Disney Animation Studios | Disney Movies",
            "pedagogicalRange": ""
        },
                {
            "number": 9,
            "code": "VET09",
            "coverBase": "vet09",
            "available": true,
            "videoAvailable": true,
            "title": "O Presente",
            "shortDescription": "Jason Stevens precisa cumprir tarefas e aprendizagens antes de receber a herança deixada pelo avô.",
            "videoUrl": "https://youtu.be/6ZUuLl1O6JY?si=_FxV9YGv4VqcO57r",
            "embedUrl": "https://www.youtube.com/embed/6ZUuLl1O6JY",
            "synopsis": "Jason Stevens espera receber uma grande herança do avô, mas descobre que deverá cumprir uma sequência de tarefas e aprendizagens antes de ter acesso ao patrimônio. Cada desafio o confronta com o valor do trabalho, da amizade, da gratidão e da generosidade. O filme permite discutir riqueza e felicidade, responsabilidade, solidariedade, mérito, escolhas e transformação moral.",
            "technicalTitle": "The Ultimate Gift",
            "direction": "Michael O. Sajbel",
            "cast": "Drew Fuller, James Garner, Abigail Breslin, Ali Hillis, Brian Dennehy e Bill Cobbs",
            "countryYear": "Estados Unidos/2007",
            "publicAccessText": "Link de acesso público indicado no arquivo de substituições. A disponibilidade e a autorização ou o licenciamento devem ser reconferidos antes da publicação.",
            "channel": "YouTube — Rodrigo Cardoso Spies",
            "sources": "YouTube indicado no arquivo de substituições | AFI Catalog | Hallmark+",
            "pedagogicalRange": ""
        },
                {
            "number": 10,
            "code": "VET10",
            "coverBase": "vet10",
            "available": true,
            "videoAvailable": true,
            "title": "O Presente 2",
            "shortDescription": "Jason administra a fundação criada com a herança do avô e precisa decidir como usar a riqueza de modo responsável.",
            "videoUrl": "https://youtu.be/uxECO5fpstU?si=Bh5zuiZ2Hjv8_KEb",
            "embedUrl": "https://www.youtube.com/embed/uxECO5fpstU",
            "synopsis": "Ao administrar a fundação criada com a herança do avô, Jason Stevens enfrenta conflitos familiares e dúvidas sobre o uso responsável da riqueza. A narrativa retoma a juventude de Red Stevens para mostrar como trabalho, perdas e escolhas moldaram seu legado. A obra permite discutir responsabilidade social, finalidade do patrimônio, justiça, família, perseverança e concepções de vida bem vivida.",
            "technicalTitle": "The Ultimate Life (também divulgado no Brasil como O Que Realmente Importa)",
            "direction": "Michael Landon Jr.",
            "cast": "Logan Bartholomew, Peter Fonda, Ali Hillis, Lee Meriwether, Bill Cobbs e Drew Waters",
            "countryYear": "Estados Unidos/2013",
            "publicAccessText": "Link de acesso público indicado no arquivo de substituições. A disponibilidade e a autorização ou o licenciamento devem ser reconferidos antes da publicação.",
            "channel": "YouTube — Silvio Torezin",
            "sources": "YouTube indicado no arquivo de substituições | AFI Catalog | Rotten Tomatoes",
            "pedagogicalRange": ""
        }
    ],
    "filosofia-politica": [
        {
            "number": 1,
            "code": "VFP01",
            "coverBase": "vfp01",
            "available": true,
            "videoAvailable": false,
            "title": "Sócrates",
            "shortDescription": "A obra acompanha os últimos anos de Sócrates, seu modo de dialogar com os cidadãos de Atenas, as acusações apresentadas contra ele e seu…",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "A obra acompanha os últimos anos de Sócrates, seu modo de dialogar com os cidadãos de Atenas, as acusações apresentadas contra ele e seu julgamento. O filme favorece reflexões sobre democracia, cidadania, liberdade de pensamento, obediência às leis, responsabilidade política e a relação entre o indivíduo e a cidade.",
            "technicalTitle": "Socrate",
            "direction": "Roberto Rossellini",
            "cast": "Jean Sylvère, Anne Caprile, Giuseppe Mannajuolo e Ricardo Palacios",
            "countryYear": "Itália, Espanha, França/1971",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Google Play e serviços licenciados",
            "sources": "Google Play | Turner Classic Movies",
            "pedagogicalRange": ""
        },
        {
            "number": 2,
            "code": "VFP02",
            "coverBase": "vfp02",
            "available": true,
            "videoAvailable": false,
            "title": "Você Não Estava Aqui",
            "shortDescription": "Uma família enfrenta dificuldades econômicas quando Ricky começa a trabalhar como entregador em um sistema que o apresenta como autônomo, mas…",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Uma família enfrenta dificuldades econômicas quando Ricky começa a trabalhar como entregador em um sistema que o apresenta como autônomo, mas controla rigidamente seu tempo e suas obrigações. O filme permite discutir precarização do trabalho, direitos sociais, liberdade contratual, exploração, responsabilidade empresarial e os efeitos políticos das novas relações de trabalho.",
            "technicalTitle": "Sorry We Missed You",
            "direction": "Ken Loach",
            "cast": "Kris Hitchen, Debbie Honeywood, Rhys Stone e Katie Proctor",
            "countryYear": "Reino Unido, França, Bélgica/2019",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Acesso somente por distribuidora ou plataforma licenciada",
            "sources": "Festival de Cannes | British Council — UK Films",
            "pedagogicalRange": ""
        },
        {
            "number": 3,
            "code": "VFP03",
            "coverBase": "vfp03",
            "available": true,
            "videoAvailable": false,
            "title": "Selma: Uma Luta pela Igualdade",
            "shortDescription": "Martin Luther King Jr.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Martin Luther King Jr. e outros ativistas organizam marchas entre Selma e Montgomery para defender o direito da população negra ao voto. A obra permite discutir democracia, direitos civis, participação política, desobediência civil, resistência não violenta, repressão estatal e igualdade perante a lei.",
            "technicalTitle": "Selma",
            "direction": "Ava DuVernay",
            "cast": "David Oyelowo, Carmen Ejogo, Tom Wilkinson e Oprah Winfrey",
            "countryYear": "Estados Unidos, Reino Unido/2014",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Paramount Pictures e plataformas de acesso licenciado",
            "sources": "Paramount Pictures | Paramount Movies",
            "pedagogicalRange": ""
        },
        {
            "number": 4,
            "code": "VFP04",
            "coverBase": "vfp04",
            "available": true,
            "videoAvailable": false,
            "title": "Eu, Daniel Blake",
            "shortDescription": "Após sofrer um problema cardíaco, Daniel Blake enfrenta um sistema burocrático que dificulta o acesso aos benefícios sociais.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Após sofrer um problema cardíaco, Daniel Blake enfrenta um sistema burocrático que dificulta o acesso aos benefícios sociais. Ao conhecer uma mãe e seus filhos, ele percebe que outras pessoas enfrentam obstáculos semelhantes. O filme discute cidadania social, dignidade, direitos, burocracia, pobreza, solidariedade e deveres do Estado.",
            "technicalTitle": "I, Daniel Blake",
            "direction": "Ken Loach",
            "cast": "Dave Johns, Hayley Squires, Dylan McKiernan e Briana Shann",
            "countryYear": "Reino Unido, França, Bélgica/2016",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Acesso somente por distribuidora ou plataforma licenciada",
            "sources": "British Council — UK Films | Festival de Cannes",
            "pedagogicalRange": ""
        },
        {
            "number": 5,
            "code": "VFP05",
            "coverBase": "vfp05",
            "available": true,
            "videoAvailable": false,
            "title": "Invictus",
            "shortDescription": "Depois do fim do apartheid, Nelson Mandela procura utilizar a Copa do Mundo de Rugby de 1995 como oportunidade de aproximação entre grupos…",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Depois do fim do apartheid, Nelson Mandela procura utilizar a Copa do Mundo de Rugby de 1995 como oportunidade de aproximação entre grupos historicamente separados. O filme permite discutir liderança política, reconciliação, identidade nacional, memória, perdão, símbolos coletivos e os limites da unidade construída pelo Estado.",
            "technicalTitle": "Invictus",
            "direction": "Clint Eastwood",
            "cast": "Morgan Freeman, Matt Damon, Tony Kgoroge e Adjoa Andoh",
            "countryYear": "Estados Unidos, África do Sul/2009",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Warner Bros. e plataformas de acesso licenciado",
            "sources": "British Film Institute | Warner Bros.",
            "pedagogicalRange": ""
        },
                {
            "number": 6,
            "code": "VFP06A",
            "coverBase": "vfp06",
            "available": true,
            "videoAvailable": true,
            "badgeLabel": "Acesso público",
            "title": "Uma Noite no Museu 2",
            "shortDescription": "Larry retorna à aventura quando as peças do museu são transferidas para o Instituto Smithsonian.",
            "videoUrl": "https://play.mercadolivre.com.br/assistir/uma-noite-no-museu-2/5f5a2b0d6b334962a1deeb4b7a898c5d",
            "embedUrl": "",
            "linkLabel": "Abrir no Mercado Play",
            "synopsis": "Quando as peças do museu são transferidas para o Instituto Smithsonian, Larry retorna à aventura e enfrenta figuras históricas que pretendem assumir o controle do museu e do mundo. No campo da Filosofia Política, a obra permite discutir poder, liderança, heroísmo, memória pública, representação do passado e o uso político de personagens históricos.",
            "technicalTitle": "Night at the Museum: Battle of the Smithsonian",
            "direction": "Shawn Levy",
            "cast": "Ben Stiller, Amy Adams, Owen Wilson, Hank Azaria e Robin Williams",
            "countryYear": "Estados Unidos/2009",
            "publicAccessText": "Acesso gratuito por licenciamento do Mercado Play; não se trata de domínio público. O catálogo deve ser reconferido antes da publicação.",
            "channel": "Mercado Play",
            "sources": "Curadoria Mercado Play | British Film Institute | AFI Catalog",
            "pedagogicalRange": "Classificação registrada na curadoria: AL"
        },
        {
            "number": 7,
            "code": "VFP06B",
            "coverBase": "vfp07",
            "available": true,
            "videoAvailable": true,
            "badgeLabel": "Acesso público",
            "title": "O Discurso do Rei",
            "shortDescription": "O futuro rei George VI procura ajuda para enfrentar a gagueira e comunicar-se com a população durante uma crise.",
            "videoUrl": "https://play.mercadolivre.com.br/filtrar/filmes",
            "embedUrl": "",
            "linkLabel": "Verificar no Mercado Play",
            "synopsis": "O príncipe Albert, futuro rei George VI, procura o terapeuta da fala Lionel Logue para enfrentar a gagueira e preparar-se para comunicar-se com a população em um período de crise. A obra permite discutir legitimidade, dever público, liderança, linguagem, confiança, responsabilidade institucional e o papel político da comunicação.",
            "technicalTitle": "The King's Speech",
            "direction": "Tom Hooper",
            "cast": "Colin Firth, Geoffrey Rush, Helena Bonham Carter, Guy Pearce e Derek Jacobi",
            "countryYear": "Reino Unido, Austrália/2010",
            "publicAccessText": "A curadoria direciona à página de filmes do Mercado Play. A presença atual do título deve ser confirmada antes da publicação; trata-se de acesso licenciado, não de domínio público.",
            "channel": "Mercado Play — catálogo sujeito a alteração",
            "sources": "Curadoria Mercado Play | British Film Institute | British Council UK Films",
            "pedagogicalRange": "12 anos na curadoria"
        },
        {
            "number": 8,
            "code": "VFP07",
            "coverBase": "vfp08",
            "available": true,
            "videoAvailable": false,
            "title": "O Jovem Karl Marx",
            "shortDescription": "A narrativa acompanha Karl Marx e Friedrich Engels durante a juventude, mostrando a formação de sua amizade, a crítica às condições de trabalho…",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "A narrativa acompanha Karl Marx e Friedrich Engels durante a juventude, mostrando a formação de sua amizade, a crítica às condições de trabalho e a elaboração de ideias políticas que culminariam no Manifesto Comunista. O filme permite abordar capitalismo, luta de classes, exploração, propriedade, organização política e transformação social.",
            "technicalTitle": "Le Jeune Karl Marx",
            "direction": "Raoul Peck",
            "cast": "August Diehl, Stefan Konarske, Vicky Krieps e Olivier Gourmet",
            "countryYear": "França, Alemanha, Bélgica/2017",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Velvet Film e plataformas de acesso licenciado",
            "sources": "Velvet Film | Artemis Productions",
            "pedagogicalRange": ""
        },
        {
            "number": 9,
            "code": "VFP08",
            "coverBase": "vfp09",
            "available": true,
            "videoAvailable": true,
            "title": "Quem me Representa?",
            "shortDescription": "O documentário apresenta a história da representação política e do voto no Brasil, desde as primeiras eleições até a ampliação da participação…",
            "videoUrl": "https://www.youtube.com/watch?v=S8vM_27AgIQ",
            "embedUrl": "https://www.youtube.com/embed/S8vM_27AgIQ",
            "synopsis": "O documentário apresenta a história da representação política e do voto no Brasil, desde as primeiras eleições até a ampliação da participação de grupos historicamente excluídos. A obra favorece discussões sobre democracia representativa, cidadania, voto, participação, diversidade política, inclusão e legitimidade das instituições.",
            "technicalTitle": "Quem me Representa?",
            "direction": "Jimi Figueiredo",
            "cast": "Documentário com depoimentos de especialistas, parlamentares e representantes de grupos sociais",
            "countryYear": "Brasil/2021",
            "publicAccessText": "Documentário integral disponibilizado oficialmente pela TV Senado.",
            "channel": "TV Senado",
            "sources": "TV Senado | YouTube oficial da TV Senado",
            "pedagogicalRange": ""
        },
        {
            "number": 10,
            "code": "VFP09",
            "coverBase": "vfp10",
            "available": true,
            "videoAvailable": true,
            "title": "Raça",
            "shortDescription": "Jesse Owens desafia a propaganda de supremacia ariana ao competir nos Jogos Olímpicos de Berlim de 1936.",
            "videoUrl": "https://youtu.be/C0MZMfiU9Zg?si=b86OUjojOQpgo8X2",
            "embedUrl": "https://www.youtube.com/embed/C0MZMfiU9Zg",
            "synopsis": "A cinebiografia acompanha Jesse Owens em sua preparação e participação nos Jogos Olímpicos de Berlim de 1936, quando suas conquistas desafiaram a propaganda de supremacia ariana do regime nazista. A obra permite discutir racismo, nacionalismo, propaganda política, direitos civis, esporte e poder, coragem pública e as contradições entre democracia e discriminação.",
            "technicalTitle": "Race",
            "direction": "Stephen Hopkins",
            "cast": "Stephan James, Jason Sudeikis, Jeremy Irons, Carice van Houten e William Hurt",
            "countryYear": "Canadá, Alemanha, França/2016",
            "publicAccessText": "Link de acesso público indicado no arquivo de substituições. A disponibilidade pública não comprova domínio público ou autorização permanente e deve ser reconferida.",
            "channel": "YouTube — Filmão TV",
            "sources": "Focus Features | British Film Institute | YouTube indicado no arquivo de substituições",
            "pedagogicalRange": ""
        }
    ],
    "filosofia-ciencia": [
        {
            "number": 1,
            "code": "VFC01",
            "coverBase": "vfc01",
            "available": true,
            "videoAvailable": true,
            "title": "Radioactive",
            "shortDescription": "Acompanhe a incrível trajetória de Marie Curie, vencedora do Prêmio Nobel, e suas descobertas científicas revolucionárias, explorando sua…",
            "videoUrl": "https://youtu.be/y5FVCeyfns0?si=D1gx9JCNcKzI4MjX",
            "embedUrl": "https://www.youtube.com/embed/y5FVCeyfns0",
            "synopsis": "Acompanhe a incrível trajetória de Marie Curie, vencedora do Prêmio Nobel, e suas descobertas científicas revolucionárias, explorando sua relação com Pierre Curie e o impacto transformador da descoberta do rádio no século XX.",
            "technicalTitle": "Radioactive",
            "direction": "Marjane Satrapi",
            "cast": "Rosamund Pike, Sam Riley, Anya Taylor-Joy",
            "countryYear": "França, Reino Unido/2020",
            "publicAccessText": "Filme integral disponibilizado gratuitamente no canal Film Plus.",
            "channel": "Film Plus",
            "sources": "Ficha técnica PHILOFLIX | Film Plus",
            "pedagogicalRange": ""
        },
        {
            "number": 2,
            "code": "VFC02",
            "coverBase": "vfc02",
            "available": true,
            "videoAvailable": false,
            "title": "Estrelas Além do Tempo",
            "shortDescription": "Baseado em uma história real, acompanha Katherine Johnson, Dorothy Vaughan e Mary Jackson, matemáticas negras que contribuíram de forma…",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Baseado em uma história real, acompanha Katherine Johnson, Dorothy Vaughan e Mary Jackson, matemáticas negras que contribuíram de forma decisiva para o programa espacial da NASA enquanto enfrentavam o racismo e a desigualdade de gênero.",
            "technicalTitle": "Hidden Figures",
            "direction": "Theodore Melfi",
            "cast": "Taraji P. Henson, Octavia Spencer, Janelle Monáe, Kevin Costner, Kirsten Dunst, Jim Parsons, Mahershala Ali",
            "countryYear": "Estados Unidos/2016",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "20th Century Studios / Disney+",
            "sources": "20th Century Studios | Disney+ Brasil",
            "pedagogicalRange": "10 a 14 anos"
        },
        {
            "number": 3,
            "code": "VFC03",
            "coverBase": "vfc03",
            "available": true,
            "videoAvailable": false,
            "title": "O Menino que Descobriu o Vento",
            "shortDescription": "Inspirado na trajetória de William Kamkwamba, mostra um adolescente do Malawi que aplica conhecimentos obtidos em livros de ciência para…",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Inspirado na trajetória de William Kamkwamba, mostra um adolescente do Malawi que aplica conhecimentos obtidos em livros de ciência para construir uma turbina eólica e ajudar sua comunidade durante uma crise de fome.",
            "technicalTitle": "The Boy Who Harnessed the Wind",
            "direction": "Chiwetel Ejiofor",
            "cast": "Maxwell Simba, Chiwetel Ejiofor, Aïssa Maïga, Lily Banda, Joseph Marcell, Noma Dumezweni",
            "countryYear": "Reino Unido, Malawi/2019",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Netflix",
            "sources": "Netflix | BFI",
            "pedagogicalRange": "12 a 14 anos"
        },
        {
            "number": 4,
            "code": "VFC04",
            "coverBase": "vfc04",
            "available": true,
            "videoAvailable": false,
            "title": "Céu de Outubro",
            "shortDescription": "Depois de observar o satélite Sputnik, o jovem Homer Hickam decide construir foguetes.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Depois de observar o satélite Sputnik, o jovem Homer Hickam decide construir foguetes. Com o apoio de uma professora e dos amigos, ele transforma falhas, cálculos e testes em um projeto científico que desafia as expectativas de sua cidade mineradora.",
            "technicalTitle": "October Sky",
            "direction": "Joe Johnston",
            "cast": "Jake Gyllenhaal, Laura Dern, Chris Cooper, Chris Owen, William Lee Scott, Chad Lindberg",
            "countryYear": "Estados Unidos/1999",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Universal Pictures",
            "sources": "Universal Pictures | BFI",
            "pedagogicalRange": "10 a 14 anos"
        },
        {
            "number": 5,
            "code": "VFC05",
            "coverBase": "vfc05",
            "available": true,
            "videoAvailable": false,
            "title": "Gattaca: A Experiência Genética",
            "shortDescription": "Em uma sociedade que seleciona e classifica as pessoas por seu perfil genético, Vincent assume a identidade de outro homem para tentar realizar…",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Em uma sociedade que seleciona e classifica as pessoas por seu perfil genético, Vincent assume a identidade de outro homem para tentar realizar o sonho de viajar ao espaço. A trama discute genética, discriminação, liberdade e determinismo.",
            "technicalTitle": "Gattaca",
            "direction": "Andrew Niccol",
            "cast": "Ethan Hawke, Uma Thurman, Jude Law, Alan Arkin, Ernest Borgnine, Tony Shalhoub",
            "countryYear": "Estados Unidos/1997",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Columbia Pictures / Sony Pictures",
            "sources": "Sony Pictures | BFI",
            "pedagogicalRange": "14 anos"
        },
        {
            "number": 6,
            "code": "VFC06",
            "coverBase": "vfc06",
            "available": true,
            "videoAvailable": false,
            "title": "WALL-E",
            "shortDescription": "Após séculos limpando uma Terra coberta de resíduos, o robô WALL-E encontra a sonda EVE e participa de uma jornada que pode permitir o retorno…",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Após séculos limpando uma Terra coberta de resíduos, o robô WALL-E encontra a sonda EVE e participa de uma jornada que pode permitir o retorno da humanidade ao planeta. A animação aborda consumo, ambiente, tecnologia e autonomia.",
            "technicalTitle": "WALL-E",
            "direction": "Andrew Stanton",
            "cast": "Ben Burtt, Elissa Knight, Jeff Garlin, Fred Willard, Sigourney Weaver, John Ratzenberger",
            "countryYear": "Estados Unidos/2008",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Pixar Animation Studios / Walt Disney Pictures",
            "sources": "Disney Movies",
            "pedagogicalRange": "6 a 14 anos"
        },
        {
            "number": 7,
            "code": "VFC07",
            "coverBase": "vfc07",
            "available": true,
            "videoAvailable": false,
            "title": "Operação Big Hero",
            "shortDescription": "O jovem inventor Hiro Hamada se une ao robô de cuidados médicos Baymax e a um grupo de amigos para enfrentar uma ameaça tecnológica.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "O jovem inventor Hiro Hamada se une ao robô de cuidados médicos Baymax e a um grupo de amigos para enfrentar uma ameaça tecnológica. A narrativa permite refletir sobre robótica, cuidado, luto e responsabilidade do inventor.",
            "technicalTitle": "Big Hero 6",
            "direction": "Don Hall e Chris Williams",
            "cast": "Ryan Potter, Scott Adsit, Daniel Henney, Jamie Chung, Genesis Rodriguez, Damon Wayans Jr., Maya Rudolph",
            "countryYear": "Estados Unidos/2014",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Walt Disney Animation Studios",
            "sources": "Disney Movies",
            "pedagogicalRange": "8 a 14 anos"
        },
        {
            "number": 8,
            "code": "VFC08",
            "coverBase": "vfc08",
            "available": true,
            "videoAvailable": false,
            "title": "O Jogo da Imitação",
            "shortDescription": "Durante a Segunda Guerra Mundial, Alan Turing e uma equipe de criptanalistas trabalham para decifrar o código Enigma.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Durante a Segunda Guerra Mundial, Alan Turing e uma equipe de criptanalistas trabalham para decifrar o código Enigma. O filme relaciona matemática, computação, inteligência artificial, segredo de Estado e perseguição social.",
            "technicalTitle": "The Imitation Game",
            "direction": "Morten Tyldum",
            "cast": "Benedict Cumberbatch, Keira Knightley, Matthew Goode, Mark Strong, Charles Dance, Rory Kinnear",
            "countryYear": "Reino Unido, Estados Unidos/2014",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "STUDIOCANAL (Reino Unido)",
            "sources": "British Film Institute",
            "pedagogicalRange": "14 anos"
        },
        {
            "number": 9,
            "code": "VFC09",
            "coverBase": "vfc09",
            "available": false,
            "videoAvailable": false,
            "title": "Espaço reservado 09",
            "shortDescription": "Nova obra audiovisual será organizada neste espaço.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "",
            "technicalTitle": "",
            "direction": "",
            "cast": "",
            "countryYear": "",
            "publicAccessText": "",
            "channel": "",
            "sources": "",
            "pedagogicalRange": ""
        },
        {
            "number": 10,
            "code": "VFC10",
            "coverBase": "vfc10",
            "available": false,
            "videoAvailable": false,
            "title": "Espaço reservado 10",
            "shortDescription": "Nova obra audiovisual será organizada neste espaço.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "",
            "technicalTitle": "",
            "direction": "",
            "cast": "",
            "countryYear": "",
            "publicAccessText": "",
            "channel": "",
            "sources": "",
            "pedagogicalRange": ""
        }
    ],
    "estetica": [
        {
            "number": 1,
            "code": "VES01",
            "coverBase": "ves01",
            "available": true,
            "videoAvailable": false,
            "title": "A Invenção de Hugo Cabret",
            "shortDescription": "Na Paris dos anos 1930, o órfão Hugo vive escondido em uma estação ferroviária e procura compreender o mecanismo de um autômato deixado pelo pai.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Na Paris dos anos 1930, o órfão Hugo vive escondido em uma estação ferroviária e procura compreender o mecanismo de um autômato deixado pelo pai. A investigação o aproxima do cineasta Georges Méliès e da memória dos primeiros espetáculos cinematográficos. A obra permite discutir cinema como arte, preservação da memória, ilusão, técnica, autoria e transformação da experiência visual.",
            "technicalTitle": "Hugo",
            "direction": "Martin Scorsese",
            "cast": "Asa Butterfield, Chloë Grace Moretz, Ben Kingsley, Sacha Baron Cohen, Helen McCrory e Christopher Lee",
            "countryYear": "Estados Unidos, Reino Unido, França/2011",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Paramount Pictures e plataformas de acesso licenciado",
            "sources": "Paramount Pictures | Paramount Movies",
            "pedagogicalRange": ""
        },
        {
            "number": 2,
            "code": "VES02",
            "coverBase": "ves02",
            "available": true,
            "videoAvailable": false,
            "title": "A Viagem de Chihiro",
            "shortDescription": "Chihiro entra em um mundo de espíritos e precisa trabalhar em uma casa de banhos para salvar os pais.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Chihiro entra em um mundo de espíritos e precisa trabalhar em uma casa de banhos para salvar os pais. A animação constrói uma linguagem visual marcada por metamorfoses, criaturas simbólicas, ambientes detalhados e relações entre beleza, estranhamento e memória cultural. O filme favorece debates sobre imaginação, simbolismo, identidade, estética da animação e interpretação de imagens.",
            "technicalTitle": "Sen to Chihiro no Kamikakushi (Spirited Away)",
            "direction": "Hayao Miyazaki",
            "cast": "Rumi Hiiragi, Miyu Irino, Mari Natsuki, Bunta Sugawara e Takashi Naitô",
            "countryYear": "Japão/2001",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Studio Ghibli e plataformas de acesso licenciado",
            "sources": "Studio Ghibli — página oficial | Studio Ghibli Brasil",
            "pedagogicalRange": ""
        },
        {
            "number": 3,
            "code": "VES03",
            "coverBase": "ves03",
            "available": true,
            "videoAvailable": false,
            "title": "Arquitetura da Destruição",
            "shortDescription": "O documentário examina como o nazismo transformou ideias de beleza, pureza, saúde e arte em instrumentos de propaganda, exclusão e extermínio.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "O documentário examina como o nazismo transformou ideias de beleza, pureza, saúde e arte em instrumentos de propaganda, exclusão e extermínio. Imagens de arquitetura, pintura, escultura, medicina e cinema mostram a ligação entre estética e poder totalitário. A obra permite discutir manipulação da sensibilidade, arte oficial, censura, propaganda, eugenia e responsabilidade política das imagens.",
            "technicalTitle": "Undergångens arkitektur (The Architecture of Doom)",
            "direction": "Peter Cohen",
            "cast": "Narração de Rolf Arsenius; versões narradas por Bruno Ganz e Sam Gray; imagens de arquivo histórico",
            "countryYear": "Suécia/1989",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Google Play, SF Anytime e outros serviços licenciados, conforme disponibilidade regional",
            "sources": "Swedish Film Database | Swedish Film Institute | Danish Film Institute",
            "pedagogicalRange": ""
        },
        {
            "number": 4,
            "code": "VES04",
            "coverBase": "ves04",
            "available": true,
            "videoAvailable": false,
            "title": "Be Natural: A História Não Contada da Primeira Cineasta do Mundo",
            "shortDescription": "O documentário reconstrói a trajetória de Alice Guy-Blaché, pioneira da direção cinematográfica e autora de centenas de filmes.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "O documentário reconstrói a trajetória de Alice Guy-Blaché, pioneira da direção cinematográfica e autora de centenas de filmes. A investigação mostra como sua contribuição foi apagada de parte da história do cinema. A obra permite discutir autoria, memória, reconhecimento, desigualdade de gênero, formação do cânone e processos históricos que determinam quais artistas são lembrados.",
            "technicalTitle": "Be Natural: The Untold Story of Alice Guy-Blaché",
            "direction": "Pamela B. Green",
            "cast": "Narração de Jodie Foster; participações de Alice Guy-Blaché em arquivos e de cineastas, historiadores e pesquisadoras",
            "countryYear": "Estados Unidos/2018",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Modern Films e plataformas de acesso licenciado",
            "sources": "Festival de Cannes | Modern Films",
            "pedagogicalRange": ""
        },
        {
            "number": 5,
            "code": "VES05",
            "coverBase": "ves05",
            "available": true,
            "videoAvailable": false,
            "title": "O Sorriso de Mona Lisa",
            "shortDescription": "Uma professora de História da Arte chega a uma instituição feminina conservadora nos anos 1950 e incentiva as estudantes a questionarem…",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Uma professora de História da Arte chega a uma instituição feminina conservadora nos anos 1950 e incentiva as estudantes a questionarem interpretações prontas, padrões de beleza e expectativas sociais. O filme possibilita discutir leitura de imagens, critérios de valor artístico, arte moderna, educação estética, papéis sociais e liberdade de interpretação.",
            "technicalTitle": "Mona Lisa Smile",
            "direction": "Mike Newell",
            "cast": "Julia Roberts, Kirsten Dunst, Julia Stiles, Maggie Gyllenhaal, Marcia Gay Harden e Juliet Stevenson",
            "countryYear": "Estados Unidos/2003",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Sony Pictures e plataformas de acesso licenciado",
            "sources": "Sony Pictures",
            "pedagogicalRange": ""
        },
        {
            "number": 6,
            "code": "VES06",
            "coverBase": "ves06",
            "available": true,
            "videoAvailable": true,
            "title": "Com Amor, Van Gogh",
            "shortDescription": "Construído com milhares de pinturas a óleo inspiradas no estilo de Vincent van Gogh, o filme acompanha uma investigação sobre os últimos dias…",
            "videoUrl": "https://www.youtube.com/watch?v=kkYjRNSC55o",
            "embedUrl": "https://www.youtube.com/embed/kkYjRNSC55o",
            "synopsis": "Construído com milhares de pinturas a óleo inspiradas no estilo de Vincent van Gogh, o filme acompanha uma investigação sobre os últimos dias do artista. A obra transforma pinturas conhecidas em movimento e permite discutir estilo, técnica, autoria, biografia, interpretação, reprodução e os limites entre pintura, animação e cinema.",
            "technicalTitle": "Loving Vincent",
            "direction": "DK Welchman e Hugh Welchman",
            "cast": "Douglas Booth, Robert Gulaczyk, Jerome Flynn, Saoirse Ronan, Helen McCrory, Chris O’Dowd e Eleanor Tomlinson",
            "countryYear": "Polônia, Reino Unido/2017",
            "publicAccessText": "Filme integral disponibilizado gratuitamente no canal verificado NetMovies.",
            "channel": "NetMovies",
            "sources": "Van Gogh Museum | NetMovies",
            "pedagogicalRange": ""
        },
        {
            "number": 7,
            "code": "VES07",
            "coverBase": "ves07",
            "available": true,
            "videoAvailable": false,
            "title": "Dias Perfeitos",
            "shortDescription": "Hirayama trabalha na limpeza de banheiros públicos em Tóquio e organiza sua vida em torno de gestos cotidianos, música, livros, fotografia e…",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Hirayama trabalha na limpeza de banheiros públicos em Tóquio e organiza sua vida em torno de gestos cotidianos, música, livros, fotografia e observação da natureza. A narrativa minimalista convida a perceber beleza, ritmo, silêncio, repetição e atenção ao comum. O filme favorece reflexões sobre experiência estética, contemplação, cotidiano e construção de sentido.",
            "technicalTitle": "Perfect Days",
            "direction": "Wim Wenders",
            "cast": "Kōji Yakusho, Tokio Emoto, Arisa Nakano, Aoi Yamada, Yumi Asō, Tomokazu Miura e Min Tanaka",
            "countryYear": "Japão, Alemanha/2023",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "Distribuidoras e plataformas de acesso licenciado, conforme disponibilidade regional",
            "sources": "Festival de Cannes — ficha técnica | Festival de Cannes — entrevista",
            "pedagogicalRange": ""
        },
        {
            "number": 8,
            "code": "VES08",
            "coverBase": "ves08",
            "available": true,
            "videoAvailable": false,
            "title": "O Menino e o Mundo",
            "shortDescription": "Um menino deixa sua aldeia para procurar o pai e descobre um mundo marcado por máquinas, cidades, trabalho e desigualdade.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "Um menino deixa sua aldeia para procurar o pai e descobre um mundo marcado por máquinas, cidades, trabalho e desigualdade. A animação utiliza lápis, giz, colagem, pintura e sons inventados para representar a percepção infantil. A obra permite discutir linguagem não verbal, cor, música, composição, arte brasileira e crítica social construída por meio da forma estética.",
            "technicalTitle": "O Menino e o Mundo (Boy and the World)",
            "direction": "Alê Abreu",
            "cast": "Vozes de Vinicius Garcia, Lu Horta, Marco Aurélio Campos, Felipe Zilse, Alê Abreu e Cassius Romero",
            "countryYear": "Brasil/2013",
            "publicAccessText": "Não foi localizada disponibilização integral confirmada em canal público autorizado.",
            "channel": "GKIDS e distribuidoras/plataformas de acesso licenciado",
            "sources": "GKIDS | Filme B | Premiers Plans",
            "pedagogicalRange": ""
        },
        {
            "number": 9,
            "code": "VES09",
            "coverBase": "ves09",
            "available": false,
            "videoAvailable": false,
            "title": "Espaço reservado 09",
            "shortDescription": "Nova obra audiovisual será organizada neste espaço.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "",
            "technicalTitle": "",
            "direction": "",
            "cast": "",
            "countryYear": "",
            "publicAccessText": "",
            "channel": "",
            "sources": "",
            "pedagogicalRange": ""
        },
        {
            "number": 10,
            "code": "VES10",
            "coverBase": "ves10",
            "available": false,
            "videoAvailable": false,
            "title": "Espaço reservado 10",
            "shortDescription": "Nova obra audiovisual será organizada neste espaço.",
            "videoUrl": "",
            "embedUrl": "",
            "synopsis": "",
            "technicalTitle": "",
            "direction": "",
            "cast": "",
            "countryYear": "",
            "publicAccessText": "",
            "channel": "",
            "sources": "",
            "pedagogicalRange": ""
        }
    ]
};


/* =========================================================
   CONFIGURAÇÕES DAS PÁGINAS PADRÃO
========================================================= */

const pageTypeSettings = {
    "Conteúdo": {
        sectionTitle: "Conteúdo principal",
        introduction: "Nesta página poderão ser organizados textos, conceitos, explicações e materiais de estudo.",
        materialTitle: "Conteúdos e explicações",
        materialDescription: "Insira textos, apresentações, documentos, infográficos e outros materiais relacionados ao tema.",
        cards: [
            {
                title: "Conceitos fundamentais",
                text: "Apresente as principais ideias necessárias para compreender o tema."
            },
            {
                title: "Contextualização filosófica",
                text: "Relacione o conteúdo aos filósofos, períodos históricos e problemas estudados."
            },
            {
                title: "Síntese para estudo",
                text: "Organize resumos, esquemas ou orientações que apoiem a aprendizagem."
            }
        ]
    },
    "Fórum": {
        sectionTitle: "Fórum de participação e debates",
        introduction: "Nesta página poderão ser apresentadas questões filosóficas para argumentação, diálogo e participação coletiva.",
        materialTitle: "Espaço do fórum",
        materialDescription: "Insira a pergunta norteadora, as regras de participação e o endereço da ferramenta de debate.",
        cards: [
            {
                title: "Questão norteadora",
                text: "Apresente uma pergunta filosófica clara, relevante e aberta ao debate."
            },
            {
                title: "Participação",
                text: "Defina critérios de argumentação, respeito e interação entre os participantes."
            },
            {
                title: "Síntese do debate",
                text: "Organize conclusões, diferentes perspectivas e questões que permaneceram abertas."
            }
        ]
    },
    "Atividades": {
        sectionTitle: "Atividades e experiências",
        introduction: "Nesta página poderão ser disponibilizados exercícios, jogos, desafios e propostas de participação.",
        materialTitle: "Atividades da página",
        materialDescription: "Insira questionários, jogos, formulários, tarefas, desafios ou recursos interativos.",
        cards: [
            {
                title: "Orientações",
                text: "Apresente as instruções necessárias para realizar as atividades."
            },
            {
                title: "Atividade principal",
                text: "Organize o exercício, jogo ou desafio relacionado ao tema filosófico."
            },
            {
                title: "Registro da aprendizagem",
                text: "Reserve um espaço para respostas, produção textual ou reflexão final."
            }
        ]
    },
    "Saiba Mais": {
        sectionTitle: "Biblioteca — Saiba Mais",
        introduction: "Nesta página poderão ser reunidos artigos, livros, documentos, pesquisas e materiais complementares.",
        materialTitle: "Biblioteca de materiais",
        materialDescription: "Insira links, documentos em PDF, artigos científicos, livros digitais e sugestões de leitura.",
        cards: [
            {
                title: "Leituras principais",
                text: "Organize os textos fundamentais para o aprofundamento do tema."
            },
            {
                title: "Materiais complementares",
                text: "Disponibilize artigos, reportagens, entrevistas e outras fontes."
            },
            {
                title: "Referências",
                text: "Registre autores, obras, endereços eletrônicos e referências utilizadas."
            }
        ]
    }
};


/* =========================================================
   ELEMENTOS DA INTERFACE
========================================================= */

const homePage = document.getElementById("homePage");
const environmentEntryPage = document.getElementById("environmentEntryPage");
const detailPage = document.getElementById("detailPage");
const catalog = document.getElementById("catalog");
const topbar = document.getElementById("topbar");

const environmentGatewayButtons = Array.from(
    document.querySelectorAll("[data-environment-id]")
);

const environmentGatewayCoverImages = Array.from(
    document.querySelectorAll(
        "[data-environment-cover-base] .environment-cover-image"
    )
);
const environmentEntryBackgroundImage = document.getElementById("environmentEntryBackgroundImage");
const environmentEntryBackgroundFallback = document.getElementById("environmentEntryBackgroundFallback");
const environmentEntryFallbackSymbol = document.getElementById("environmentEntryFallbackSymbol");
const environmentEntryImageStatus = document.getElementById("environmentEntryImageStatus");
const environmentEntryNumber = document.getElementById("environmentEntryNumber");
const environmentEntrySymbol = document.getElementById("environmentEntrySymbol");
const environmentEntryTitle = document.getElementById("environmentEntryTitle");
const environmentEntrySubtitle = document.getElementById("environmentEntrySubtitle");
const environmentEntryExploreButton = document.getElementById("environmentEntryExploreButton");
const environmentEntryOptions = document.getElementById("environmentEntryOptions");
const environmentEntrySectionLabel = document.getElementById("environmentEntrySectionLabel");
const environmentEntryInstruction = document.getElementById("environmentEntryInstruction");
const environmentEntryGrid = document.getElementById("environmentEntryGrid");
const environmentEntryBackTop = document.getElementById("environmentEntryBackTop");
const environmentEntryBackBottom = document.getElementById("environmentEntryBackBottom");

const mobileMenuButton = document.getElementById("mobileMenuButton");
const mainNavigation = document.getElementById("mainNavigation");
const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");

const logoButton = document.getElementById("logoButton");
const footerLogoButton = document.getElementById("footerLogoButton");
const exploreButton = document.getElementById("exploreButton");
const finalExploreButton = document.getElementById("finalExploreButton");

const searchArea = document.getElementById("searchArea");
const searchButton = document.getElementById("searchButton");
const searchInput = document.getElementById("searchInput");
const emptySearch = document.getElementById("emptySearch");
const clearSearchButton = document.getElementById("clearSearchButton");
const refreshImagesButton = document.getElementById("refreshImagesButton");

const detailHero = document.getElementById("detailHero");
const detailFixedBackground = document.getElementById("detailFixedBackground");
const detailCoverImage = document.getElementById("detailCoverImage");
const detailCoverFallback = document.getElementById("detailCoverFallback");
const detailFallbackSymbol = document.getElementById("detailFallbackSymbol");
const detailImageErrorText = document.getElementById("detailImageErrorText");

const detailCategory = document.getElementById("detailCategory");
const detailType = document.getElementById("detailType");
const detailTitle = document.getElementById("detailTitle");
const detailSubtitle = document.getElementById("detailSubtitle");
const detailPageNumber = document.getElementById("detailPageNumber");
const detailSectionTitle = document.getElementById("detailSectionTitle");
const detailIntroduction = document.getElementById("detailIntroduction");
const detailContentGrid = document.getElementById("detailContentGrid");
const materialAreaTitle = document.getElementById("materialAreaTitle");
const materialAreaDescription = document.getElementById("materialAreaDescription");

const standardDetailContent = document.getElementById("standardDetailContent");
const videoLibrarySection = document.getElementById("videoLibrarySection");
const videoLibraryGrid = document.getElementById("videoLibraryGrid");
const refreshVideoCoversButton = document.getElementById("refreshVideoCoversButton");

const videoExperience = document.getElementById("videoExperience");
const returnVideoLibrary = document.getElementById("returnVideoLibrary");
const videoPlayer = document.getElementById("videoPlayer");
const videoIframe = document.getElementById("videoIframe");
const videoUnavailablePanel = document.getElementById("videoUnavailablePanel");
const youtubeAccessButton = document.getElementById("youtubeAccessButton");

const selectedVideoCode = document.getElementById("selectedVideoCode");
const selectedVideoTitle = document.getElementById("selectedVideoTitle");
const selectedVideoSynopsis = document.getElementById("selectedVideoSynopsis");
const selectedVideoTechnicalTitle = document.getElementById("selectedVideoTechnicalTitle");
const selectedVideoDirection = document.getElementById("selectedVideoDirection");
const selectedVideoCast = document.getElementById("selectedVideoCast");
const selectedVideoCountryYear = document.getElementById("selectedVideoCountryYear");
const selectedVideoPedagogicalRow = document.getElementById("selectedVideoPedagogicalRow");
const selectedVideoPedagogicalRange = document.getElementById("selectedVideoPedagogicalRange");
const selectedVideoPublicLink = document.getElementById("selectedVideoPublicLink");
const selectedVideoChannel = document.getElementById("selectedVideoChannel");
const selectedVideoSources = document.getElementById("selectedVideoSources");

const detailBackTop = document.getElementById("detailBackTop");
const detailBackBottom = document.getElementById("detailBackBottom");
const detailRefreshImage = document.getElementById("detailRefreshImage");

const backToTop = document.getElementById("backToTop");
const currentYear = document.getElementById("currentYear");


/* =========================================================
   ESTADO E FUNÇÕES AUXILIARES
========================================================= */

const ORIGIN_STORAGE_KEY = "philoflix-origin-state";

let currentCategoryId = null;
let currentItemNumber = null;
let currentDetailImageBase = null;
let currentEnvironmentEntryId = null;
let currentDetailReturnContext = null;
let environmentHomeScrollY = 0;

if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}

function normalizeText(text) {
    return String(text)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function findCategory(categoryId) {
    return catalogData.find((category) => category.id === categoryId);
}

function findItem(category, itemNumber) {
    return category.items.find((item) => item.number === itemNumber);
}

function closeMobileMenu() {
    mobileMenuButton.classList.remove("active");
    mainNavigation.classList.remove("active");
    mobileMenuOverlay.classList.remove("active");
    mobileMenuButton.setAttribute("aria-expanded", "false");
}


/* =========================================================
   RETORNO EXATO AO ROTEIRO
========================================================= */

function saveOriginState(state) {
    try {
        sessionStorage.setItem(ORIGIN_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.warn("Não foi possível salvar a posição de retorno.", error);
    }
}

function readOriginState() {
    try {
        const savedState = sessionStorage.getItem(ORIGIN_STORAGE_KEY);
        return savedState ? JSON.parse(savedState) : null;
    } catch (error) {
        return null;
    }
}

function createDefaultOriginState(categoryId = "mito-filosofia") {
    return {
        categoryId,
        cardId: null,
        scrollY: null,
        railScrolls: {}
    };
}

function captureOriginState(categoryId, cardId) {
    const railScrolls = {};

    document.querySelectorAll(".cards-rail").forEach((rail) => {
        railScrolls[rail.dataset.categoryId] = rail.scrollLeft;
    });

    const state = {
        categoryId,
        cardId,
        scrollY: window.scrollY,
        railScrolls
    };

    saveOriginState(state);
    return state;
}

function restoreOriginState(state) {
    const safeState = state || createDefaultOriginState();

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const railScrolls = safeState.railScrolls || {};

            Object.entries(railScrolls).forEach(([categoryId, scrollLeft]) => {
                const rail = document.querySelector(
                    `.cards-rail[data-category-id="${categoryId}"]`
                );

                if (rail) {
                    rail.scrollLeft = Number(scrollLeft) || 0;
                }
            });

            const categorySection = document.getElementById(safeState.categoryId);
            let targetScrollY = 0;

            if (
                safeState.scrollY !== null &&
                Number.isFinite(Number(safeState.scrollY))
            ) {
                targetScrollY = Number(safeState.scrollY);
            } else if (categorySection) {
                targetScrollY = categorySection.offsetTop - 95;
            }

            window.scrollTo({
                top: Math.max(0, targetScrollY),
                left: 0,
                behavior: "auto"
            });

            if (safeState.cardId) {
                const originCard = document.getElementById(safeState.cardId);

                if (originCard) {
                    originCard.focus({ preventScroll: true });
                }
            }
        });
    });
}



/* =========================================================
   CAPAS DE "O QUE VOCÊ ENCONTRARÁ"
========================================================= */

function loadEnvironmentGatewayCovers(forceRefresh = false) {
    environmentGatewayCoverImages.forEach((image) => {
        const card = image.closest("[data-environment-cover-base]");
        const baseName = card?.dataset.environmentCoverBase;

        if (!card || !baseName) {
            return;
        }

        card.classList.remove("image-error");

        loadRepositoryAsset(
            image,
            baseName,
            {
                onSuccess: () => {
                    card.classList.remove("image-error");
                },
                onFailure: () => {
                    card.classList.add("image-error");
                }
            },
            forceRefresh
        );
    });
}


/* =========================================================
   PÁGINAS DE ENTRADA — O QUE VOCÊ ENCONTRARÁ
========================================================= */

function createDialogSymbolMarkup(className = "entry-dialog-pair") {
    return `
        <span class="${className}" aria-hidden="true">
            <i class="entry-dialog-box entry-dialog-box-left"></i>
            <i class="entry-dialog-box entry-dialog-box-right"></i>
        </span>
    `;
}

function setEnvironmentEntrySymbol(definition) {
    environmentEntrySymbol.classList.toggle(
        "is-activity",
        definition.id === "atividades"
    );

    environmentEntrySymbol.classList.toggle(
        "is-forum",
        definition.id === "forum"
    );

    if (definition.symbol === "dialog") {
        environmentEntrySymbol.innerHTML = createDialogSymbolMarkup();
        return;
    }

    environmentEntrySymbol.textContent = definition.symbol;
}

function loadEnvironmentEntryBackground(definition, forceRefresh = false) {
    environmentEntryBackgroundImage.style.display = "block";
    environmentEntryBackgroundFallback.classList.remove("visible");

    environmentEntryFallbackSymbol.textContent =
        definition.symbol === "dialog" ? "◌◌" : definition.symbol;

    environmentEntryImageStatus.textContent =
        `Aguardando ${definition.backgroundBase}.jpg na raiz do repositório.`;

    loadRepositoryAsset(
        environmentEntryBackgroundImage,
        definition.backgroundBase,
        {
            onSuccess: () => {
                environmentEntryBackgroundImage.style.display = "block";
                environmentEntryBackgroundFallback.classList.remove("visible");
            },
            onFailure: () => {
                environmentEntryBackgroundImage.style.display = "none";
                environmentEntryBackgroundFallback.classList.add("visible");
            }
        },
        forceRefresh
    );
}

function createEnvironmentEntryCard(category, definition) {
    const item = findItem(category, definition.itemNumber);
    const card = document.createElement("button");

    card.type = "button";
    card.className = "environment-entry-card";
    card.dataset.categoryId = category.id;
    card.dataset.itemNumber = definition.itemNumber;
    card.style.setProperty("--entry-category-rgb", category.rgb);

    if (definition.id === "atividades") {
        card.classList.add("is-activity");
    }

    const imageArea = document.createElement("span");
    imageArea.className = "environment-entry-card-image-area";

    const image = document.createElement("img");
    image.className = "environment-entry-card-image";
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";

    const fallback = document.createElement("span");
    fallback.className = "environment-entry-card-fallback";
    fallback.innerHTML = `
        <span aria-hidden="true">${item?.icon || category.symbol}</span>
        <small>Aguardando ${item?.imageBase || "imagem"}</small>
    `;

    imageArea.appendChild(image);
    imageArea.appendChild(fallback);

    const textArea = document.createElement("span");
    textArea.className = "environment-entry-card-content";
    textArea.innerHTML = `
        <span class="environment-entry-card-order">${category.sequence}</span>
        <strong>${category.title}</strong>
        <span>${item?.title || definition.title}</span>
        <small>${item?.description || category.subtitle}</small>
    `;

    const arrow = document.createElement("span");
    arrow.className = "environment-entry-card-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";

    card.appendChild(imageArea);
    card.appendChild(textArea);
    card.appendChild(arrow);

    card.setAttribute(
        "aria-label",
        `Acessar ${definition.title} em ${category.title}`
    );

    loadRepositoryAsset(
        image,
        item?.imageBase,
        {
            onSuccess: () => card.classList.remove("image-error"),
            onFailure: () => card.classList.add("image-error")
        }
    );

    card.addEventListener("click", () => {
        const entryScrollY = window.scrollY;

        openDetailPage(
            category.id,
            definition.itemNumber,
            {
                pushHistory: true,
                originState: createDefaultOriginState(category.id),
                returnContext: {
                    view: "environment",
                    environmentId: definition.id,
                    homeScrollY: environmentHomeScrollY,
                    entryScrollY
                }
            }
        );
    });

    return card;
}

function renderEnvironmentEntryGrid(definition) {
    environmentEntryGrid.innerHTML = "";

    catalogData.forEach((category) => {
        environmentEntryGrid.appendChild(
            createEnvironmentEntryCard(category, definition)
        );
    });
}

function openEnvironmentEntryPage(environmentId, options = {}) {
    const definition = environmentEntryDefinitions[environmentId];

    if (!definition) {
        return;
    }

    document.documentElement.classList.remove("detail-background-active");
    document.body.classList.remove("detail-background-active");
    document.documentElement.style.removeProperty("--active-detail-rgb");

    currentEnvironmentEntryId = definition.id;
    environmentHomeScrollY = Number.isFinite(Number(options.homeScrollY))
        ? Number(options.homeScrollY)
        : environmentHomeScrollY;

    closeSelectedVideo();

    homePage.hidden = true;
    detailPage.hidden = true;
    environmentEntryPage.hidden = false;

    environmentEntryPage.style.setProperty(
        "--environment-entry-rgb",
        definition.accentRgb
    );

    environmentEntryPage.classList.toggle(
        "is-activity-entry",
        definition.id === "atividades"
    );

    environmentEntryPage.classList.toggle(
        "is-forum-entry",
        definition.id === "forum"
    );

    environmentEntryNumber.textContent = definition.number;
    environmentEntryTitle.textContent = definition.title;
    environmentEntrySubtitle.textContent = definition.subtitle;
    environmentEntrySectionLabel.textContent = definition.sectionLabel;
    environmentEntryInstruction.textContent = definition.instruction;

    setEnvironmentEntrySymbol(definition);
    renderEnvironmentEntryGrid(definition);
    loadEnvironmentEntryBackground(definition, Boolean(options.forceRefresh));

    if (options.pushHistory) {
        history.replaceState(
            {
                view: "home",
                homeScrollY: environmentHomeScrollY
            },
            "",
            "#/"
        );

        history.pushState(
            {
                view: "environment",
                environmentId: definition.id,
                homeScrollY: environmentHomeScrollY
            },
            "",
            `#/ambiente/${definition.id}`
        );
    } else if (options.replaceHistory) {
        history.replaceState(
            {
                view: "environment",
                environmentId: definition.id,
                homeScrollY: environmentHomeScrollY
            },
            "",
            `#/ambiente/${definition.id}`
        );
    }

    searchArea.classList.remove("active");
    closeMobileMenu();

    const targetScroll = Number.isFinite(Number(options.restoreScrollY))
        ? Number(options.restoreScrollY)
        : 0;

    requestAnimationFrame(() => {
        window.scrollTo({
            top: Math.max(0, targetScroll),
            left: 0,
            behavior: "auto"
        });
    });

    document.title = `${definition.title} | PHILOFLIX`;
}

function returnFromEnvironmentEntry() {
    document.documentElement.classList.remove("detail-background-active");
    document.body.classList.remove("detail-background-active");
    document.documentElement.style.removeProperty("--active-detail-rgb");

    const targetScrollY = environmentHomeScrollY;

    environmentEntryPage.hidden = true;
    detailPage.hidden = true;
    homePage.hidden = false;

    currentEnvironmentEntryId = null;
    document.title = "PHILOFLIX | Filosofia";

    history.replaceState(
        {
            view: "home",
            homeScrollY: targetScrollY
        },
        "",
        "#/"
    );

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            window.scrollTo({
                top: Math.max(0, targetScrollY),
                left: 0,
                behavior: "auto"
            });
        });
    });
}

environmentGatewayButtons.forEach((button) => {
    button.addEventListener("click", () => {
        environmentHomeScrollY = window.scrollY;

        openEnvironmentEntryPage(
            button.dataset.environmentId,
            {
                pushHistory: true,
                homeScrollY: environmentHomeScrollY
            }
        );
    });
});

environmentEntryExploreButton.addEventListener("click", () => {
    environmentEntryOptions.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

environmentEntryBackTop.addEventListener("click", returnFromEnvironmentEntry);
environmentEntryBackBottom.addEventListener("click", returnFromEnvironmentEntry);


/* =========================================================
   CAPAS PRINCIPAIS
========================================================= */

function createCoverCard(category, item) {
    const card = document.createElement("button");
    const cardId = `cover-${category.id}-${item.number}`;

    card.id = cardId;
    card.type = "button";
    card.className = "cover-card";
    card.dataset.categoryId = category.id;
    card.dataset.itemNumber = item.number;
    card.dataset.imageBase = item.imageBase;
    card.dataset.search = normalizeText(`
        ${category.title}
        ${category.subtitle}
        ${item.type}
        ${item.title}
        ${item.description}
    `);

    card.style.setProperty("--card-rgb", category.rgb);
    card.setAttribute(
        "aria-label",
        `Acessar ${item.type}: ${item.title}`
    );

    /*
       A área visual da capa permanece rigorosamente em 16:9.
       A aba de identificação é adicionada abaixo dessa área,
       sem cobrir ou reduzir a imagem.
    */
    const media = document.createElement("span");
    media.className = "cover-media";

    const image = document.createElement("img");
    image.className = "cover-image";
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    image.draggable = false;

    const fallback = document.createElement("span");
    fallback.className = "cover-fallback";
    fallback.innerHTML = `
        <span aria-hidden="true">${item.icon}</span>
        <strong>${item.type}</strong>
        <small>Aguardando ${item.imageBase}.jpg</small>
    `;

    const indicator = document.createElement("span");
    indicator.className = "cover-access-indicator";
    indicator.setAttribute("aria-hidden", "true");
    indicator.textContent = "→";

    media.append(image, fallback, indicator);

    const lowerTab = document.createElement("span");
    lowerTab.className = "cover-lower-tab";
    lowerTab.textContent = item.type === "Saiba Mais"
        ? "Saiba +"
        : item.type;

    card.append(media, lowerTab);

    loadRepositoryAsset(
        image,
        item.imageBase,
        {
            onSuccess: () => card.classList.remove("image-error"),
            onFailure: () => card.classList.add("image-error")
        }
    );

    return card;
}

function createCategorySection(category) {
    const section = document.createElement("section");

    section.className = "content-section";
    section.id = category.id;
    section.dataset.search = normalizeText(
        `${category.title} ${category.subtitle}`
    );

    section.style.setProperty("--category-rgb", category.rgb);

    const heading = document.createElement("div");
    heading.className = "section-heading";
    heading.innerHTML = `
        <div class="section-title-area">
            <span class="section-symbol" aria-hidden="true">
                ${category.symbol}
            </span>

            <div>
                <h2>${category.title}</h2>
                <p>${category.subtitle}</p>
            </div>
        </div>

        <div class="section-controls">
            <button
                class="rail-button rail-left"
                type="button"
                aria-label="Mover capas para a esquerda"
            >
                ‹
            </button>

            <button
                class="rail-button rail-right"
                type="button"
                aria-label="Mover capas para a direita"
            >
                ›
            </button>
        </div>
    `;

    const rail = document.createElement("div");
    rail.className = "cards-rail";
    rail.dataset.categoryId = category.id;

    category.items.forEach((item) => {
        rail.appendChild(createCoverCard(category, item));
    });

    section.append(heading, rail);

    heading.querySelector(".rail-left").addEventListener("click", () => {
        rail.scrollBy({
            left: -rail.clientWidth * 0.8,
            behavior: "smooth"
        });
    });

    heading.querySelector(".rail-right").addEventListener("click", () => {
        rail.scrollBy({
            left: rail.clientWidth * 0.8,
            behavior: "smooth"
        });
    });

    return section;
}

function renderCatalog() {
    catalog.innerHTML = "";

    catalogData.forEach((category) => {
        catalog.appendChild(createCategorySection(category));
    });
}

catalog.addEventListener("click", (event) => {
    const selectedCard = event.target.closest(".cover-card");

    if (!selectedCard || !catalog.contains(selectedCard)) {
        return;
    }

    const categoryId = selectedCard.dataset.categoryId;
    const itemNumber = selectedCard.dataset.itemNumber;
    const originState = captureOriginState(categoryId, selectedCard.id);

    openDetailPage(
        categoryId,
        itemNumber,
        {
            pushHistory: true,
            originState
        }
    );
});


/* =========================================================
   PÁGINAS PADRÃO
========================================================= */

function renderStandardDetailContent(item) {
    const settings = pageTypeSettings[item.type];

    if (!settings) {
        return;
    }

    detailSectionTitle.textContent = settings.sectionTitle;
    detailIntroduction.textContent = settings.introduction;
    materialAreaTitle.textContent = settings.materialTitle;
    materialAreaDescription.textContent = settings.materialDescription;
    detailContentGrid.innerHTML = "";

    settings.cards.forEach((information, index) => {
        const article = document.createElement("article");
        article.className = "detail-information-card";
        article.innerHTML = `
            <span>${formatNumber(index + 1)}</span>
            <h3>${information.title}</h3>
            <p>${information.text}</p>
        `;

        detailContentGrid.appendChild(article);
    });
}


/* =========================================================
   BIBLIOTECA DE 10 FILMES
========================================================= */

function createVideoBadge(video) {
    const badge = document.createElement("span");
    badge.className = "video-card-access-badge";

    if (!video.available) {
        badge.classList.add("reserved");
        badge.textContent = "Reserva";
    } else if (video.videoAvailable || video.videoUrl) {
        badge.classList.add("public-video");
        badge.textContent = video.badgeLabel || "Vídeo integral";
    } else {
        badge.classList.add("technical-sheet");
        badge.textContent = "Ficha técnica";
    }

    return badge;
}

function renderVideoLibrary(categoryId, forceRefresh = false) {
    const videos = videoLibraries[categoryId] || [];

    videoLibraryGrid.innerHTML = "";
    closeSelectedVideo();

    videos.forEach((video, index) => {
        const card = document.createElement("button");

        card.type = "button";
        card.className = "video-library-card";
        card.dataset.videoIndex = String(index);
        card.dataset.coverBase = video.coverBase;
        card.disabled = !video.available;

        if (video.available && !video.videoAvailable) {
            card.classList.add("ficha-only");
        }

        card.setAttribute(
            "aria-label",
            video.available
                ? `Acessar ${video.code}: ${video.title}`
                : `${video.code}: espaço reservado`
        );

        const posterArea = document.createElement("div");
        posterArea.className = "video-poster-area";

        const poster = document.createElement("img");
        poster.className = "video-poster-image";
        poster.alt = video.available
            ? `Capa de ${video.title}`
            : "";
        poster.loading = "lazy";
        poster.decoding = "async";
        poster.draggable = false;

        const fallback = document.createElement("div");
        fallback.className = "video-poster-fallback";
        fallback.innerHTML = `
            <span aria-hidden="true">
                ${video.videoAvailable ? "▶" : video.available ? "▣" : "+"}
            </span>

            <strong>
                ${video.available ? video.title : "Espaço reservado"}
            </strong>

            <small>
                Aguardando ${video.coverBase}
            </small>
        `;

        const indicator = document.createElement("span");
        indicator.className = "video-play-indicator";
        indicator.setAttribute("aria-hidden", "true");
        indicator.textContent = video.videoAvailable ? "▶" : "▣";

        posterArea.append(
            poster,
            fallback,
            createVideoBadge(video),
            indicator
        );

        const information = document.createElement("div");
        information.className = "video-card-information";
        information.innerHTML = `
            <span class="video-card-number">${video.code}</span>
            <h3>${video.title}</h3>
            <p>${video.shortDescription}</p>
        `;

        card.append(posterArea, information);

        loadRepositoryAsset(
            poster,
            video.coverBase,
            {
                onSuccess: () => card.classList.remove("poster-error"),
                onFailure: () => card.classList.add("poster-error")
            },
            forceRefresh
        );

        videoLibraryGrid.appendChild(card);
    });
}

function renderPublicAccessField(video) {
    selectedVideoPublicLink.innerHTML = "";

    const statusText = document.createElement("span");
    statusText.textContent = video.publicAccessText || "Não informado.";
    selectedVideoPublicLink.appendChild(statusText);

    if (!video.videoUrl) {
        return;
    }

    selectedVideoPublicLink.appendChild(document.createElement("br"));

    const link = document.createElement("a");
    link.href = video.videoUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const isYouTubeLink = /(?:youtube\.com|youtu\.be)/i.test(video.videoUrl);
    link.textContent = video.linkLabel || (
        isYouTubeLink
            ? "Abrir vídeo integral no YouTube"
            : "Abrir acesso público ao filme"
    );

    selectedVideoPublicLink.appendChild(link);
}

function openSelectedVideo(video) {
    selectedVideoCode.textContent = video.code;
    selectedVideoTitle.textContent = video.title;
    selectedVideoSynopsis.textContent = video.synopsis || "Sinopse não informada.";
    selectedVideoTechnicalTitle.textContent = video.technicalTitle || "—";
    selectedVideoDirection.textContent = video.direction || "—";
    selectedVideoCast.textContent = video.cast || "—";
    selectedVideoCountryYear.textContent = video.countryYear || "—";
    selectedVideoChannel.textContent = video.channel || "—";
    selectedVideoSources.textContent = video.sources || "—";

    if (video.pedagogicalRange) {
        selectedVideoPedagogicalRow.hidden = false;
        selectedVideoPedagogicalRange.textContent = video.pedagogicalRange;
    } else {
        selectedVideoPedagogicalRow.hidden = true;
        selectedVideoPedagogicalRange.textContent = "—";
    }

    renderPublicAccessField(video);

    const unavailableTitle = videoUnavailablePanel.querySelector("h3");
    const unavailableText = videoUnavailablePanel.querySelector("p");
    const hasPublicLink = Boolean(video.videoUrl);
    const hasEmbeddedPlayer = Boolean(video.embedUrl && video.videoUrl);

    if (hasEmbeddedPlayer) {
        videoPlayer.hidden = false;
        videoUnavailablePanel.hidden = true;

        videoIframe.src = video.embedUrl;
        youtubeAccessButton.href = video.videoUrl;
        youtubeAccessButton.textContent = "▶ ABRIR VÍDEO NO YOUTUBE";
        youtubeAccessButton.hidden = false;
    } else {
        videoIframe.src = "";
        videoPlayer.hidden = true;
        videoUnavailablePanel.hidden = false;

        if (hasPublicLink) {
            unavailableTitle.textContent = "Acesso público por link externo";
            unavailableText.textContent = "O acesso está disponível em uma plataforma externa e será aberto em uma nova guia.";
            youtubeAccessButton.href = video.videoUrl;
            youtubeAccessButton.textContent = "↗ ABRIR ACESSO PÚBLICO";
            youtubeAccessButton.hidden = false;
        } else {
            unavailableTitle.textContent = "Ficha técnica disponível";
            unavailableText.textContent = "Não foi localizada disponibilização integral confirmada em canal público autorizado para esta obra.";
            youtubeAccessButton.href = "#";
            youtubeAccessButton.hidden = true;
        }
    }

    videoExperience.hidden = false;

    requestAnimationFrame(() => {
        videoExperience.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}

function closeSelectedVideo() {
    videoIframe.src = "";
    videoExperience.hidden = true;
    videoPlayer.hidden = false;
    videoUnavailablePanel.hidden = true;
    youtubeAccessButton.hidden = true;
    youtubeAccessButton.href = "#";
}

videoLibraryGrid.addEventListener("click", (event) => {
    const card = event.target.closest(".video-library-card");

    if (
        !card ||
        card.disabled ||
        currentCategoryId === null
    ) {
        return;
    }

    const videoIndex = Number(card.dataset.videoIndex);
    const selectedVideo = videoLibraries[currentCategoryId]?.[videoIndex];

    if (selectedVideo?.available) {
        openSelectedVideo(selectedVideo);
    }
});

returnVideoLibrary.addEventListener("click", () => {
    closeSelectedVideo();

    videoLibrarySection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

refreshVideoCoversButton.addEventListener("click", () => {
    if (!currentCategoryId) {
        return;
    }

    renderVideoLibrary(currentCategoryId, true);
    refreshVideoCoversButton.textContent = "✓ Verificação realizada";

    window.setTimeout(() => {
        refreshVideoCoversButton.textContent = "↻ Verificar capas dos filmes";
    }, 1800);
});


/* =========================================================
   IMAGEM DA PÁGINA INTERNA
========================================================= */

function loadDetailImage(imageBase, forceRefresh = false) {
    currentDetailImageBase = imageBase;

    detailPage.dataset.backgroundBase = imageBase;

    detailFixedBackground.classList.remove("has-image", "image-error");
    detailFixedBackground.style.removeProperty("background-image");

    detailCoverFallback.classList.remove("visible");
    detailRefreshImage.hidden = true;

    loadRepositoryAsset(
        detailCoverImage,
        imageBase,
        {
            onSuccess: (resolvedPath) => {
                /*
                   O caminho resolvido é aplicado como background real do
                   contêiner fixo. Isso evita que o fundo desapareça por
                   recorte, opacidade ou empilhamento do elemento IMG.
                */
                detailFixedBackground.style.backgroundImage =
                    `url(${JSON.stringify(resolvedPath)})`;

                detailFixedBackground.classList.add("has-image");
                detailFixedBackground.classList.remove("image-error");

                detailCoverFallback.classList.remove("visible");
                detailRefreshImage.hidden = true;
            },
            onFailure: () => {
                detailFixedBackground.style.removeProperty("background-image");
                detailFixedBackground.classList.remove("has-image");
                detailFixedBackground.classList.add("image-error");

                detailCoverFallback.classList.add("visible");
                detailRefreshImage.hidden = false;
            }
        },
        forceRefresh
    );
}


/* =========================================================
   ABERTURA DAS PÁGINAS INTERNAS
========================================================= */

function openDetailPage(
    categoryId,
    itemNumber,
    options = {}
) {
    const category = findCategory(categoryId);

    if (!category) {
        return;
    }

    const item = findItem(category, itemNumber);

    if (!item) {
        return;
    }

    currentCategoryId = category.id;
    currentItemNumber = item.number;

    document.documentElement.classList.add("detail-background-active");
    document.body.classList.add("detail-background-active");
    document.documentElement.style.setProperty(
        "--active-detail-rgb",
        category.rgb
    );

    const originState = options.originState
        || readOriginState()
        || createDefaultOriginState(category.id);

    const returnContext = options.returnContext
        || {
            view: "home",
            originState
        };

    currentDetailReturnContext = returnContext;
    saveOriginState(originState);

    if (options.pushHistory) {
        if (returnContext.view === "environment") {
            history.replaceState(
                {
                    view: "environment",
                    environmentId: returnContext.environmentId,
                    homeScrollY: returnContext.homeScrollY,
                    entryScrollY: returnContext.entryScrollY
                },
                "",
                `#/ambiente/${returnContext.environmentId}`
            );
        } else {
            history.replaceState(
                {
                    view: "home",
                    originState
                },
                "",
                "#/"
            );
        }

        history.pushState(
            {
                view: "detail",
                categoryId: category.id,
                itemNumber: item.number,
                originState,
                returnContext
            },
            "",
            `#/${category.id}/${item.number}`
        );
    }

    detailHero.style.setProperty("--detail-rgb", category.rgb);
    detailPage.style.setProperty("--detail-rgb", category.rgb);

    detailCategory.textContent = category.title;
    detailType.textContent = item.type;
    detailTitle.textContent = item.title;
    detailSubtitle.textContent = item.description;
    detailPageNumber.textContent = `AMBIENTE ${item.number}`;

    detailFallbackSymbol.textContent = item.icon;
    detailImageErrorText.textContent =
        `Aguardando a publicação de ${item.detailBackgroundBase}.jpg na raiz do repositório.`;

    detailCoverImage.alt = "";
    loadDetailImage(item.detailBackgroundBase);

    const isVideoPage = item.type === "Vídeos";

    standardDetailContent.hidden = isVideoPage;
    videoLibrarySection.hidden = !isVideoPage;
    closeSelectedVideo();

    if (isVideoPage) {
        renderVideoLibrary(category.id);
    } else {
        renderStandardDetailContent(item);
    }

    homePage.hidden = true;
    environmentEntryPage.hidden = true;
    detailPage.hidden = false;

    searchArea.classList.remove("active");
    closeMobileMenu();

    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto"
    });

    document.title = `${item.title} | PHILOFLIX`;
}


/* =========================================================
   VOLTAR AO ROTEIRO
========================================================= */

function showRoteiro(originState, replaceHistory = true) {
    document.documentElement.classList.remove("detail-background-active");
    document.body.classList.remove("detail-background-active");
    document.documentElement.style.removeProperty("--active-detail-rgb");

    const safeOriginState = originState
        || readOriginState()
        || createDefaultOriginState(
            currentCategoryId || "mito-filosofia"
        );

    closeSelectedVideo();

    detailPage.hidden = true;
    environmentEntryPage.hidden = true;
    homePage.hidden = false;
    document.title = "PHILOFLIX | Filosofia";

    if (replaceHistory) {
        history.replaceState(
            {
                view: "home",
                originState: safeOriginState
            },
            "",
            "#/"
        );
    }

    restoreOriginState(safeOriginState);

    currentCategoryId = null;
    currentItemNumber = null;
    currentDetailImageBase = null;
    currentDetailReturnContext = null;
}

function returnToRoteiro() {
    const historyReturnContext = history.state?.returnContext || null;
    const returnContext = historyReturnContext || currentDetailReturnContext;

    if (returnContext?.view === "environment") {
        closeSelectedVideo();

        openEnvironmentEntryPage(
            returnContext.environmentId,
            {
                replaceHistory: true,
                homeScrollY: returnContext.homeScrollY,
                restoreScrollY: returnContext.entryScrollY
            }
        );

        currentCategoryId = null;
        currentItemNumber = null;
        currentDetailImageBase = null;
        currentDetailReturnContext = null;
        return;
    }

    const historyOrigin = history.state?.originState || null;

    showRoteiro(
        historyOrigin
        || readOriginState()
        || createDefaultOriginState(
            currentCategoryId || "mito-filosofia"
        ),
        true
    );
}

detailBackTop.addEventListener("click", returnToRoteiro);
detailBackBottom.addEventListener("click", returnToRoteiro);

detailRefreshImage.addEventListener("click", () => {
    if (currentDetailImageBase) {
        loadDetailImage(currentDetailImageBase, true);
    }
});


/* =========================================================
   MENU E NAVEGAÇÃO
========================================================= */

function navigateToSection(sectionId) {
    document.documentElement.classList.remove("detail-background-active");
    document.body.classList.remove("detail-background-active");
    document.documentElement.style.removeProperty("--active-detail-rgb");

    closeSelectedVideo();

    detailPage.hidden = true;
    environmentEntryPage.hidden = true;
    homePage.hidden = false;
    currentEnvironmentEntryId = null;

    closeMobileMenu();

    history.replaceState(
        { view: "home" },
        "",
        "#/"
    );

    requestAnimationFrame(() => {
        const target = document.getElementById(sectionId);

        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
}

document.querySelectorAll("[data-navigation]").forEach((button) => {
    button.addEventListener("click", () => {
        navigateToSection(button.dataset.navigation);
    });
});

mobileMenuButton.addEventListener("click", () => {
    const isOpen = mainNavigation.classList.contains("active");

    if (isOpen) {
        closeMobileMenu();
        return;
    }

    mobileMenuButton.classList.add("active");
    mainNavigation.classList.add("active");
    mobileMenuOverlay.classList.add("active");
    mobileMenuButton.setAttribute("aria-expanded", "true");
});

mobileMenuOverlay.addEventListener("click", closeMobileMenu);

function goToTop() {
    document.documentElement.classList.remove("detail-background-active");
    document.body.classList.remove("detail-background-active");
    document.documentElement.style.removeProperty("--active-detail-rgb");

    closeSelectedVideo();

    detailPage.hidden = true;
    environmentEntryPage.hidden = true;
    homePage.hidden = false;
    currentEnvironmentEntryId = null;

    history.replaceState(
        { view: "home" },
        "",
        "#/"
    );

    document.title = "PHILOFLIX | Filosofia";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

logoButton.addEventListener("click", goToTop);
footerLogoButton.addEventListener("click", goToTop);

exploreButton.addEventListener("click", () => {
    navigateToSection("mito-filosofia");
});

finalExploreButton.addEventListener("click", () => {
    navigateToSection("mito-filosofia");
});


/* =========================================================
   VERIFICAÇÃO DE NOVAS IMAGENS
========================================================= */

function refreshMissingMainImages() {
    document.querySelectorAll(".cover-card.image-error").forEach((card) => {
        const image = card.querySelector(".cover-image");
        loadRepositoryAsset(
            image,
            card.dataset.imageBase,
            {
                onSuccess: () => card.classList.remove("image-error"),
                onFailure: () => card.classList.add("image-error")
            },
            true
        );
    });
}

refreshImagesButton.addEventListener("click", () => {
    refreshMissingMainImages();
    loadEnvironmentGatewayCovers(true);
    refreshImagesButton.textContent = "✓ Verificação realizada";

    window.setTimeout(() => {
        refreshImagesButton.textContent = "↻ Verificar novas imagens";
    }, 1800);
});


/* =========================================================
   PESQUISA
========================================================= */

function filterCatalog(searchTerm) {
    const normalizedTerm = normalizeText(searchTerm);
    const sections = catalog.querySelectorAll(".content-section");
    let totalVisibleCards = 0;

    sections.forEach((section) => {
        const categoryMatches =
            normalizedTerm === ""
            || section.dataset.search.includes(normalizedTerm);

        const cards = section.querySelectorAll(".cover-card");
        let visibleCards = 0;

        cards.forEach((card) => {
            const matches =
                normalizedTerm === ""
                || categoryMatches
                || card.dataset.search.includes(normalizedTerm);

            card.hidden = !matches;

            if (matches) {
                visibleCards += 1;
                totalVisibleCards += 1;
            }
        });

        section.classList.toggle(
            "hidden-by-search",
            visibleCards === 0
        );
    });

    emptySearch.classList.toggle(
        "visible",
        normalizedTerm !== "" && totalVisibleCards === 0
    );
}

function clearSearch() {
    searchInput.value = "";
    filterCatalog("");
    searchArea.classList.remove("active");
    searchInput.blur();
}

searchButton.addEventListener("click", (event) => {
    event.stopPropagation();

    if (!detailPage.hidden || !environmentEntryPage.hidden) {
        showRoteiro(readOriginState(), true);
    }

    searchArea.classList.add("active");

    window.setTimeout(() => {
        searchInput.focus();
    }, 100);
});

searchArea.addEventListener("click", (event) => {
    event.stopPropagation();
});

document.addEventListener("click", () => {
    if (!searchInput.value.trim()) {
        searchArea.classList.remove("active");
    }
});

searchInput.addEventListener("input", () => {
    filterCatalog(searchInput.value);
});

clearSearchButton.addEventListener("click", clearSearch);


/* =========================================================
   HISTÓRICO E ROTAS
========================================================= */

window.addEventListener("popstate", (event) => {
    const state = event.state;

    if (state?.view === "detail") {
        openDetailPage(
            state.categoryId,
            state.itemNumber,
            {
                pushHistory: false,
                originState: state.originState,
                returnContext: state.returnContext
            }
        );

        return;
    }

    if (state?.view === "environment") {
        openEnvironmentEntryPage(
            state.environmentId,
            {
                pushHistory: false,
                homeScrollY: state.homeScrollY,
                restoreScrollY: state.entryScrollY
            }
        );

        return;
    }

    showRoteiro(
        state?.originState || readOriginState(),
        false
    );

    const homeScrollY = Number.isFinite(Number(state?.homeScrollY))
        ? Number(state.homeScrollY)
        : null;

    if (homeScrollY !== null) {
        requestAnimationFrame(() => {
            window.scrollTo({
                top: Math.max(0, homeScrollY),
                left: 0,
                behavior: "auto"
            });
        });
    }
});

function loadInitialRoute() {
    const environmentRoute = window.location.hash.match(
        /^#\/ambiente\/([^/]+)$/
    );

    if (environmentRoute) {
        const environmentId = environmentRoute[1];

        history.replaceState(
            {
                view: "environment",
                environmentId,
                homeScrollY: 0
            },
            "",
            window.location.hash
        );

        openEnvironmentEntryPage(
            environmentId,
            {
                pushHistory: false,
                homeScrollY: 0
            }
        );

        return;
    }

    const route = window.location.hash.match(
        /^#\/([^/]+)\/(\d{2})$/
    );

    if (route) {
        const categoryId = route[1];
        const itemNumber = route[2];
        const originState = createDefaultOriginState(categoryId);
        const returnContext = {
            view: "home",
            originState
        };

        history.replaceState(
            {
                view: "detail",
                categoryId,
                itemNumber,
                originState,
                returnContext
            },
            "",
            window.location.hash
        );

        openDetailPage(
            categoryId,
            itemNumber,
            {
                pushHistory: false,
                originState,
                returnContext
            }
        );

        return;
    }

    history.replaceState(
        { view: "home" },
        "",
        "#/"
    );

    document.documentElement.classList.remove("detail-background-active");
    document.body.classList.remove("detail-background-active");
    document.documentElement.style.removeProperty("--active-detail-rgb");

    homePage.hidden = false;
    environmentEntryPage.hidden = true;
    detailPage.hidden = true;
}


/* =========================================================
   ROLAGEM E TECLA ESCAPE
========================================================= */

function handlePageScroll() {
    topbar.classList.toggle("scrolled", window.scrollY > 30);
    backToTop.classList.toggle("visible", window.scrollY > 650);
}

window.addEventListener(
    "scroll",
    handlePageScroll,
    { passive: true }
);

backToTop.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

document.addEventListener("keydown", (event) => {
    if (openingIsRunning || event.key !== "Escape") {
        return;
    }

    if (mainNavigation.classList.contains("active")) {
        closeMobileMenu();
        return;
    }

    if (!videoExperience.hidden) {
        closeSelectedVideo();
        return;
    }

    if (!detailPage.hidden) {
        returnToRoteiro();
        return;
    }

    if (!environmentEntryPage.hidden) {
        returnFromEnvironmentEntry();
    }
});


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

function initializePlatform() {
    renderCatalog();
    loadEnvironmentGatewayCovers();
    currentYear.textContent = new Date().getFullYear();

    loadInitialRoute();
    handlePageScroll();
    initializeOpening();
}

document.addEventListener("DOMContentLoaded", initializePlatform);
