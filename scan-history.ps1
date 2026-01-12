$historyPath = "$env:APPDATA\Code\User\History"
$targetDate = "2026-01-11"
$startHour = 17
$endHour = 22

Get-ChildItem -Path $historyPath -Directory | ForEach-Object {
    $entriesFile = Join-Path $_.FullName "entries.json"
    if (Test-Path $entriesFile) {
        $content = Get-Content $entriesFile -Raw
        if ($content -like '*"resource"*' -and $content -like '*wellnessai*' -and $content -notlike '*//*') {
            try {
                $json = $content | ConvertFrom-Json
                if ($json.resource -and $json.entries) {
                    $fileName = Split-Path $json.resource -Leaf
                    foreach ($entry in $json.entries) {
                        $ts = [DateTimeOffset]::FromUnixTimeMilliseconds($entry.timestamp).LocalDateTime
                        if ($ts.Date -eq [DateTime]$targetDate -and $ts.Hour -ge $startHour -and $ts.Hour -lt $endHour) {
                            "$($ts.ToString('HH:mm:ss'))`t$fileName`t$($_.Name)`t$($entry.id)"
                        }
                    }
                }
            } catch {}
        }
    }
}
