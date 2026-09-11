# GitHub 権限

Git-RPG の既定ログインは、GitHub OAuth の次の最小スコープを要求します。

| スコープ | 利用目的 |
| --- | --- |
| read:user | GitHub の表示名・ログイン名と Contribution の viewer を取得 |
| user:email | GitHub で非公開設定のメールアドレスをログイン ID として取得 |

Contribution の取得は公開データを対象に成立します。既定では非公開リポジトリへのアクセス権を要求しません。

非公開リポジトリの Contribution も取得する運用では、GITHUB_INCLUDE_PRIVATE_CONTRIBUTIONS=true を設定します。この場合は GitHub の classic OAuth repo スコープが要求されます。repo は全非公開リポジトリへの広い権限なので、必要な運用でのみ有効化してください。

権限不足やトークンの期限切れが発生した場合は、エラー画面の再試行を行った後、ログイン画面の「権限を確認して再認証」から GitHub の同意画面を再表示します。アクセストークンはサーバー側の NextAuth JWT にのみ保存し、ブラウザのセッションには公開しません。
