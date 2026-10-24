<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Native Android/iOS apps use Capacitor loading the hosted web app via server.url — one codebase and one backend for web and apps.
- Before native delivery, compare the configured public host with the current web design and verify the URL inside the generated APK to avoid shipping an outdated deployment.
- Keep the Android shell in android/ and its minimal sync assets in native/web; sync with Capacitor before native builds, without bundling the SSR web output, because the shell loads the configured public HTTPS deployment.
- Android release signing uses DEVOPSQUEST_UPLOAD_* environment variables and fails without them; keep signing keys and passwords outside source control so future Play updates retain the owner's upload identity.
- Share the medieval visual system through global semantic tokens and the app shell; keep learning and account logic unchanged so all screens stay consistent without duplicating behavior.
- Use the shared BrandLogo and realm-art mapping for brand and course landmarks; preserve the atlas aspect ratio so interactive pins stay aligned with the illustrated realms.
