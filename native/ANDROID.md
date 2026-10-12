# DevOpsQuest — Android nativo de teste

## Instalar diretamente no celular (sem computador)

1. Baixe `DevOpsQuest-Android-teste.apk` no seu Android.
2. Abra **Arquivos / Meus arquivos → Downloads** e toque no APK.
3. Se solicitado, abra **Configurações → Permitir desta fonte** para o navegador ou gerenciador de arquivos utilizado. O nome varia por fabricante.
4. Volte e toque em **Instalar**; em seguida, **Abrir**.
5. Depois da instalação, desative novamente a permissão de instalar aplicativos desconhecidos.

Requer **Android 7.0 ou superior** e internet. O ícone é o escudo dourado com o infinito DevOps.
Não desative o Play Protect: se o Android bloquear, anote a mensagem antes de prosseguir.

## O que esta versão faz

É um aplicativo Android real, compilado com Capacitor 8.5.2 e assinado com chave de desenvolvimento. Carrega **https://devopsquest.lovable.app** — não a prévia privada do editor. Utiliza o site e as mesmas contas, progresso e comunidade desse endereço, sem criar outro banco.

O endereço público respondeu HTTP 200 durante a verificação. A aparência e o conteúdo são os que estiverem publicados nele, não necessariamente as últimas alterações vistas no editor. Não houve publicação ou alteração do backend neste pedido.

**Importante se você usa Cloudflare:** este APK não carrega devopsquests.pages.dev. Para carregar seu site da Cloudflare, altere `server.url` em `capacitor.config.json` para o endereço público desejado, sincronize e gere outro APK. As contas e o progresso serão os do backend configurado nesse site; não há transferência de dados entre sites neste pacote.

## Limitações importantes

- A compilação, assinatura, identificador, URL HTTPS e versão mínima do Android foram conferidos. **Não foi executado em celular físico nem em emulador**; confirme os fluxos após instalar.
- **Login Google dentro do app ainda não está preparado/validado como login nativo.** Google pode bloquear autenticação em WebView. A solução completa exige navegador externo e retorno seguro ao app; não foi adicionada neste pacote. Teste primeiro acesso com e-mail e senha, se disponível no site; esse acesso também não foi validado em aparelho.
- Downloads de certificados, envio de fotos, botão Voltar e comportamento após suspensão precisam de teste no aparelho.
- Requer conexão; não inclui modo offline, notificações push ou recursos nativos adicionais.
- **Este APK é para testes pessoais, não para publicar na Google Play.** A loja exige um Android App Bundle (AAB) de produção com assinatura própria, configuração de login adequada, revisão de políticas, ficha e declarações exigidas.
- Se já existir um aplicativo com o mesmo identificador assinado por outra chave, a atualização pode ser recusada. Não desinstale sem considerar dados locais; confirme antes se o progresso está salvo na nuvem.

## Gerar novamente com Android Studio

O ZIP contém apenas o projeto Android e a configuração do aplicativo conectado ao site, **não o código completo do curso**.

1. Instale Android Studio, Node.js 22 ou superior e JDK 21.
2. Extraia o ZIP. Na pasta extraída execute:

```sh
npm install
npx cap sync android
npx cap open android
```

3. No Android Studio, permita o download de SDK Platform 36 e Build Tools 36.0.0 e aguarde a sincronização.
4. Use **Build → Generate App Bundles or APKs → Generate APKs** (os nomes podem variar por versão).
5. O APK de teste fica em `android/app/build/outputs/apk/debug/app-debug.apk`.

Pelo terminal, após configurar o SDK:

```sh
# Linux/macOS
./android/gradlew -p android assembleDebug
# Windows
android\gradlew.bat -p android assembleDebug
```

Para a loja, use **Generate Signed App Bundle or APK → Android App Bundle**, crie sua chave de produção e guarde-a com segurança. Não envie a chave nem suas senhas para terceiros. Resolva e teste login, downloads e requisitos da loja antes de distribuir.

## Instalar por USB (alternativa)

1. Ative Opções do desenvolvedor no Android, tocando sete vezes em **Número da versão**.
2. Ative **Depuração USB**, conecte por cabo e autorize o computador no celular.
3. Com Android SDK Platform Tools instalado:

```sh
adb devices
adb install -r DevOpsQuest-Android-teste.apk
```

Desative a depuração USB após o teste. Se `adb devices` mostrar `unauthorized`, aceite a autorização no celular.
