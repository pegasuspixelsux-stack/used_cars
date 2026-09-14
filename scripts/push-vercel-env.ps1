# Pushes every variable from your local .env.local to Vercel's Production
# environment for this linked project (pegasuspixels/used-cars).
#
# Run this yourself: `powershell -NoProfile -File ./scripts/push-vercel-env.ps1`
# from the project root. It reads secrets straight from your own local file
# and pipes each one into `vercel env add` — nothing is displayed, logged,
# or sent anywhere except Vercel's API.

$envFile = Join-Path $PSScriptRoot "..\.env.local"
if (-not (Test-Path $envFile)) {
    Write-Error "Could not find .env.local at $envFile"
    exit 1
}

# Not a real app variable — Vercel CLI writes this into .env.local itself
# for local `vercel dev` use; it doesn't belong in Production config.
$skip = @("VERCEL_OIDC_TOKEN")

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { return }

    $idx = $line.IndexOf("=")
    if ($idx -lt 1) { return }

    $name = $line.Substring(0, $idx).Trim()
    $value = $line.Substring($idx + 1).Trim()
    if ($skip -contains $name) { return }
    if ($value -eq "") { return }

    # .env files sometimes quote values (needed for FIREBASE_ADMIN_PRIVATE_KEY,
    # whose value contains \n sequences) — strip one matching layer of quotes
    # before sending, since `vercel env add` expects the raw value.
    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or
        ($value.StartsWith("'") -and $value.EndsWith("'"))) {
        $value = $value.Substring(1, $value.Length - 2)
    }

    Write-Host "Setting $name..."
    # Remove any existing value first so re-running this script updates
    # rather than erroring on a duplicate. Ignore failures (var may not exist yet).
    try { & vercel env rm $name production --yes 2>$null | Out-Null } catch {}

    # NEXT_PUBLIC_* vars are meant to be exposed to the browser (Firebase
    # client config) — force --type config so Vercel's credential-detection
    # heuristic (it flags names like "API_KEY") doesn't block the add.
    if ($name.StartsWith("NEXT_PUBLIC_")) {
        $value | & vercel env add $name production --type config
    } else {
        $value | & vercel env add $name production
    }
}

Write-Host ""
Write-Host "Done. Verify with: vercel env ls production (shows names only)."
