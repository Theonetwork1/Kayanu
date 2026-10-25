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

## CJ integration
- Keep CJ credentials and the authentication lock in service-role-only Cloud tables; stateless instances must reuse one persisted token.
- Verify provider signatures before saving CJ pushes to the durable inbox; dispatch processing on insert and retry pending events through the authenticated reconciliation callback.
- Expose external callbacks under `/api/public/` and preserve old webhook URLs as aliases; every handler verifies its own caller.
- Do not auto-pay CJ orders or enable live fulfillment until the supplier contents and payment setup are confirmed; customer charges are not a safe integration test.
