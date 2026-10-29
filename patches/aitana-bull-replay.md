# Bull patch replay in aitana branches

The `bull@4.16.4` patch combines n8n's idle worker claim changes and the fork's
stalled priority cleanup. The cleanup must follow the current upstream patch.

The 2.46 series includes the claim backports `d7dbb93fbf` and `1225748c62`.
Keep their patch and integration tests in this commit before the cleanup.
They replace the earlier idle worker implementation from `5f0b562921`.

`sync-fork.sh` selects commits with `git cherry` against the latest release tag.
This note gives the prerequisite commit a distinct patch ID. The rebuild can
then replay the prerequisite before the cleanup, even when the release tag
already contains it. The release rebase keeps the note and applies the cleanup
to the same upstream patch.

Keep the priority cleanup in both the Lua source and the generated script in
`lib/scripts`. Bull loads the generated script from the published package.
