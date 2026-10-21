# Bull patch replay in aitana branches

The `bull@4.16.4` patch combines two changes: n8n's idle worker claim backport
(`5f0b562921`) and the fork's stalled priority cleanup. The cleanup commit uses
the backport's patch and lockfile hash as its starting point.

`sync-fork.sh` rebuilds `aitana-develop` from the minor base and uses `git cherry`
against the latest release tag to select commits. Keep this note in the backport
commit: it gives that prerequisite a distinct patch ID, so the rebuild replays it
before the cleanup commit. The later rebase onto the release tag keeps the note
and applies the cleanup over the already present backport.
