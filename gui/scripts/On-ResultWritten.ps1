param()
$json = [Console]::In.ReadToEnd()
if (-not $json.Trim()) { exit 0 }
try {
    $j = $json | ConvertFrom-Json
    $fp = $j.tool_input.file_path
    if ($fp -and $fp -match 'result\.md$') {
        $script = Join-Path $PSScriptRoot 'Generate-WorkflowPdf.ps1'
        powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $script -MdPath $fp 2>$null
    }
} catch {
    # Silently ignore errors so hooks never block Claude
}
