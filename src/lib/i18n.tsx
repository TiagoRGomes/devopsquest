import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "pt" | "es" | "en";

export const LANGS: { code: Lang; label: string; flag: string; htmlLang: string }[] = [
  { code: "pt", label: "Português (BR)", flag: "🇧🇷", htmlLang: "pt-BR" },
  { code: "es", label: "Español (ES)", flag: "🇪🇸", htmlLang: "es-ES" },
  { code: "en", label: "English", flag: "🇺🇸", htmlLang: "en" },
];

const STORAGE_KEY = "jornada-devops:lang";

type Dict = Record<string, string>;

const pt: Dict = {
  "brand.name": "Jornada DevOps",
  "brand.tagline": "do código à produção",

  "nav.dashboard": "Painel",
  "nav.map": "Mapa da Jornada",
  "nav.skills": "Árvore de Skills",
  "nav.modules": "Módulos",
  "nav.labs": "Laboratórios",
  "nav.challenges": "Desafios",
  "nav.bosses": "Boss Battles",
  "nav.project": "Projeto PrintQuest",
  "nav.career": "Carreira DevOps",
  "nav.badges": "Conquistas",
  "nav.resources": "Recursos",
  "nav.profile": "Perfil",
  "nav.aria": "Navegação principal",

  "shell.level": "Nível",
  "shell.xpToLevel": "XP para o nível",
  "shell.savedCloud": "Progresso salvo na sua conta.",
  "shell.savedLocal": "Entre para salvar seu progresso na nuvem.",
  "shell.openMenu": "Abrir menu",
  "shell.closeMenu": "Fechar menu",
  "shell.days": "dias",
  "shell.signIn": "Entrar",
  "shell.profile": "Perfil",
  "shell.footer": "Jornada DevOps — conteúdo original, baseado no que as vagas pedem hoje.",
  "shell.language": "Idioma",

  "landing.eyebrow": "Do zero ao nível Ninja",
  "landing.title": "Jornada DevOps",
  "landing.subtitle":
    "A trilha completa e gamificada para virar profissional de DevOps: aulas, laboratórios práticos, desafios, Boss Battles e um projeto real de portfólio.",
  "landing.ctaPrimary": "Criar conta grátis",
  "landing.ctaSecondary": "Já tenho conta",
  "landing.ctaGuest": "Explorar sem conta",
  "landing.ctaDashboard": "Continuar minha jornada",
  "landing.note": "Sem cartão de crédito. Seu progresso fica salvo na sua conta.",
  "landing.statModules": "módulos",
  "landing.statLessons": "aulas",
  "landing.statLabs": "laboratórios",
  "landing.statBosses": "Boss Battles",
  "landing.featuresTitle": "Tudo que uma vaga de DevOps pede hoje",
  "landing.featuresLead":
    "O currículo foi montado a partir das exigências reais das vagas: Linux, redes, Git, containers, CI/CD, nuvem, infraestrutura como código, Kubernetes, GitOps, observabilidade e segurança.",
  "landing.f1.title": "Aulas com profundidade",
  "landing.f1.text": "Explicações claras, comandos reais, erros comuns e questionários para fixar cada conceito.",
  "landing.f2.title": "Laboratórios práticos",
  "landing.f2.text": "Você constrói, quebra e conserta ambientes de verdade — do terminal ao cluster em produção.",
  "landing.f3.title": "Progresso gamificado",
  "landing.f3.text": "XP, 50 níveis, sequência de dias, conquistas e um mapa com 10 regiões para atravessar.",
  "landing.f4.title": "Projeto de portfólio",
  "landing.f4.text": "O PrintQuest: uma plataforma completa que você entrega em etapas e mostra em entrevistas.",
  "landing.pathTitle": "As 10 regiões da jornada",
  "landing.pathLead": "Cada região é um bloco de habilidades com entregas verificáveis.",
  "landing.finalTitle": "Comece hoje a sua jornada",
  "landing.finalText": "Crie sua conta e continue de onde parou em qualquer aparelho.",
  "landing.langTitle": "Escolha seu idioma",
  "landing.langText": "A navegação está em português, espanhol e inglês. O conteúdo das aulas está em português.",

  "auth.signinTitle": "Entrar na sua jornada",
  "auth.signupTitle": "Criar sua conta",
  "auth.subtitle": "Seu XP, aulas e conquistas ficam salvos na nuvem.",
  "auth.google": "Continuar com Google",
  "auth.orEmail": "ou com e-mail",
  "auth.name": "Como quer ser chamado",
  "auth.email": "E-mail",
  "auth.password": "Senha",
  "auth.passwordHint": "mínimo 6 caracteres",
  "auth.signin": "Entrar",
  "auth.signup": "Criar conta",
  "auth.toSignup": "Ainda não tenho conta — criar agora",
  "auth.toSignin": "Já tenho conta — entrar",
  "auth.checkEmail": "Confirme seu e-mail",
  "auth.checkEmailText": "Enviamos um link para {email}. Depois de confirmar, você já entra direto.",
  "auth.localNote": "Seu progresso atual neste navegador é levado para a conta ao entrar.",
  "auth.welcomeBack": "Bem-vindo de volta!",
  "auth.created": "Conta criada! Bem-vindo à jornada.",
  "auth.emailSent": "Confira seu e-mail para confirmar a conta",
  "auth.googleError": "Não foi possível entrar com o Google",
  "auth.genericError": "Não foi possível continuar",
  "auth.back": "Voltar para a página inicial",
};

const es: Dict = {
  "brand.name": "Jornada DevOps",
  "brand.tagline": "del código a producción",

  "nav.dashboard": "Panel",
  "nav.map": "Mapa del viaje",
  "nav.skills": "Árbol de habilidades",
  "nav.modules": "Módulos",
  "nav.labs": "Laboratorios",
  "nav.challenges": "Retos",
  "nav.bosses": "Batallas finales",
  "nav.project": "Proyecto PrintQuest",
  "nav.career": "Carrera DevOps",
  "nav.badges": "Logros",
  "nav.resources": "Recursos",
  "nav.profile": "Perfil",
  "nav.aria": "Navegación principal",

  "shell.level": "Nivel",
  "shell.xpToLevel": "XP para el nivel",
  "shell.savedCloud": "Progreso guardado en tu cuenta.",
  "shell.savedLocal": "Entra para guardar tu progreso en la nube.",
  "shell.openMenu": "Abrir menú",
  "shell.closeMenu": "Cerrar menú",
  "shell.days": "días",
  "shell.signIn": "Entrar",
  "shell.profile": "Perfil",
  "shell.footer": "Jornada DevOps — contenido original, basado en lo que piden las vacantes hoy.",
  "shell.language": "Idioma",

  "landing.eyebrow": "De cero a nivel Ninja",
  "landing.title": "Jornada DevOps",
  "landing.subtitle":
    "La ruta completa y gamificada para convertirte en profesional DevOps: clases, laboratorios prácticos, retos, batallas finales y un proyecto real de portafolio.",
  "landing.ctaPrimary": "Crear cuenta gratis",
  "landing.ctaSecondary": "Ya tengo cuenta",
  "landing.ctaGuest": "Explorar sin cuenta",
  "landing.ctaDashboard": "Continuar mi viaje",
  "landing.note": "Sin tarjeta de crédito. Tu progreso queda guardado en tu cuenta.",
  "landing.statModules": "módulos",
  "landing.statLessons": "clases",
  "landing.statLabs": "laboratorios",
  "landing.statBosses": "batallas finales",
  "landing.featuresTitle": "Todo lo que pide una vacante DevOps hoy",
  "landing.featuresLead":
    "El plan de estudios nace de los requisitos reales de las vacantes: Linux, redes, Git, contenedores, CI/CD, nube, infraestructura como código, Kubernetes, GitOps, observabilidad y seguridad.",
  "landing.f1.title": "Clases con profundidad",
  "landing.f1.text": "Explicaciones claras, comandos reales, errores comunes y cuestionarios para fijar cada concepto.",
  "landing.f2.title": "Laboratorios prácticos",
  "landing.f2.text": "Construyes, rompes y arreglas entornos reales — de la terminal al clúster en producción.",
  "landing.f3.title": "Progreso gamificado",
  "landing.f3.text": "XP, 50 niveles, racha diaria, logros y un mapa con 10 regiones por recorrer.",
  "landing.f4.title": "Proyecto de portafolio",
  "landing.f4.text": "PrintQuest: una plataforma completa que entregas por etapas y muestras en entrevistas.",
  "landing.pathTitle": "Las 10 regiones del viaje",
  "landing.pathLead": "Cada región es un bloque de habilidades con entregas verificables.",
  "landing.finalTitle": "Empieza hoy tu viaje",
  "landing.finalText": "Crea tu cuenta y sigue donde lo dejaste en cualquier dispositivo.",
  "landing.langTitle": "Elige tu idioma",
  "landing.langText":
    "La navegación está en portugués, español e inglés. El contenido de las clases está en portugués.",

  "auth.signinTitle": "Entrar a tu viaje",
  "auth.signupTitle": "Crear tu cuenta",
  "auth.subtitle": "Tu XP, clases y logros quedan guardados en la nube.",
  "auth.google": "Continuar con Google",
  "auth.orEmail": "o con correo",
  "auth.name": "¿Cómo quieres que te llamemos?",
  "auth.email": "Correo electrónico",
  "auth.password": "Contraseña",
  "auth.passwordHint": "mínimo 6 caracteres",
  "auth.signin": "Entrar",
  "auth.signup": "Crear cuenta",
  "auth.toSignup": "Aún no tengo cuenta — crear ahora",
  "auth.toSignin": "Ya tengo cuenta — entrar",
  "auth.checkEmail": "Confirma tu correo",
  "auth.checkEmailText": "Enviamos un enlace a {email}. Tras confirmar, entrarás directo.",
  "auth.localNote": "Tu progreso actual en este navegador pasa a tu cuenta al entrar.",
  "auth.welcomeBack": "¡Bienvenido de nuevo!",
  "auth.created": "¡Cuenta creada! Bienvenido al viaje.",
  "auth.emailSent": "Revisa tu correo para confirmar la cuenta",
  "auth.googleError": "No se pudo entrar con Google",
  "auth.genericError": "No se pudo continuar",
  "auth.back": "Volver a la página de inicio",
};

const en: Dict = {
  "brand.name": "Jornada DevOps",
  "brand.tagline": "from code to production",

  "nav.dashboard": "Dashboard",
  "nav.map": "Journey map",
  "nav.skills": "Skill tree",
  "nav.modules": "Modules",
  "nav.labs": "Labs",
  "nav.challenges": "Challenges",
  "nav.bosses": "Boss battles",
  "nav.project": "PrintQuest project",
  "nav.career": "DevOps career",
  "nav.badges": "Achievements",
  "nav.resources": "Resources",
  "nav.profile": "Profile",
  "nav.aria": "Main navigation",

  "shell.level": "Level",
  "shell.xpToLevel": "XP to level",
  "shell.savedCloud": "Progress saved to your account.",
  "shell.savedLocal": "Sign in to save your progress to the cloud.",
  "shell.openMenu": "Open menu",
  "shell.closeMenu": "Close menu",
  "shell.days": "days",
  "shell.signIn": "Sign in",
  "shell.profile": "Profile",
  "shell.footer": "Jornada DevOps — original content, built around what job openings ask for today.",
  "shell.language": "Language",

  "landing.eyebrow": "From zero to Ninja level",
  "landing.title": "Jornada DevOps",
  "landing.subtitle":
    "The complete, gamified path to becoming a DevOps professional: lessons, hands-on labs, challenges, boss battles and a real portfolio project.",
  "landing.ctaPrimary": "Create free account",
  "landing.ctaSecondary": "I already have an account",
  "landing.ctaGuest": "Explore without an account",
  "landing.ctaDashboard": "Continue my journey",
  "landing.note": "No credit card. Your progress is saved to your account.",
  "landing.statModules": "modules",
  "landing.statLessons": "lessons",
  "landing.statLabs": "labs",
  "landing.statBosses": "boss battles",
  "landing.featuresTitle": "Everything a DevOps role asks for today",
  "landing.featuresLead":
    "The curriculum is built from real job requirements: Linux, networking, Git, containers, CI/CD, cloud, infrastructure as code, Kubernetes, GitOps, observability and security.",
  "landing.f1.title": "Lessons with depth",
  "landing.f1.text": "Clear explanations, real commands, common failures and quizzes to lock in every concept.",
  "landing.f2.title": "Hands-on labs",
  "landing.f2.text": "You build, break and fix real environments — from the terminal to a production cluster.",
  "landing.f3.title": "Gamified progress",
  "landing.f3.text": "XP, 50 levels, daily streaks, achievements and a map with 10 regions to cross.",
  "landing.f4.title": "Portfolio project",
  "landing.f4.text": "PrintQuest: a full platform you ship in stages and show off in interviews.",
  "landing.pathTitle": "The 10 regions of the journey",
  "landing.pathLead": "Each region is a block of skills with verifiable deliverables.",
  "landing.finalTitle": "Start your journey today",
  "landing.finalText": "Create your account and pick up where you left off on any device.",
  "landing.langTitle": "Choose your language",
  "landing.langText":
    "Navigation is available in Portuguese, Spanish and English. Lesson content is in Portuguese.",

  "auth.signinTitle": "Sign in to your journey",
  "auth.signupTitle": "Create your account",
  "auth.subtitle": "Your XP, lessons and achievements stay saved in the cloud.",
  "auth.google": "Continue with Google",
  "auth.orEmail": "or with email",
  "auth.name": "What should we call you?",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.passwordHint": "at least 6 characters",
  "auth.signin": "Sign in",
  "auth.signup": "Create account",
  "auth.toSignup": "I don't have an account — create one",
  "auth.toSignin": "I already have an account — sign in",
  "auth.checkEmail": "Confirm your email",
  "auth.checkEmailText": "We sent a link to {email}. Once you confirm, you're in.",
  "auth.localNote": "Progress from this browser moves into your account when you sign in.",
  "auth.welcomeBack": "Welcome back!",
  "auth.created": "Account created! Welcome to the journey.",
  "auth.emailSent": "Check your email to confirm the account",
  "auth.googleError": "Could not sign in with Google",
  "auth.genericError": "Could not continue",
  "auth.back": "Back to the home page",
};

const DICTS: Record<Lang, Dict> = { pt, es, en };

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (stored && stored in DICTS) {
        setLangState(stored);
        return;
      }
      const nav = navigator.language.toLowerCase();
      if (nav.startsWith("es")) setLangState("es");
      else if (nav.startsWith("en")) setLangState("en");
    } catch {
      /* sem armazenamento: mantemos o padrão */
    }
  }, []);

  useEffect(() => {
    const meta = LANGS.find((l) => l.code === lang);
    if (meta && typeof document !== "undefined") {
      document.documentElement.lang = meta.htmlLang;
    }
  }, [lang]);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang: (next) => {
        setLangState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* ignorado */
        }
      },
      t: (key, vars) => {
        let out = DICTS[lang][key] ?? DICTS.pt[key] ?? key;
        if (vars) {
          for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
        }
        return out;
      },
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n precisa estar dentro de I18nProvider");
  return ctx;
}
