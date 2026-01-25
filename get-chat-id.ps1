# Get Telegram Chat ID Script
# Run this AFTER sending a message to your bot

$botToken = "7622362022:AAHhmcc8OutFC-SmCWoOUhFPysFvSeiouaA"
$response = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getUpdates"

if ($response.ok -and $response.result.Count -gt 0) {
    Write-Host "`n=== Available Chats ===" -ForegroundColor Green
    
    foreach ($update in $response.result) {
        if ($update.message) {
            $chatId = $update.message.chat.id
            $chatType = $update.message.chat.type
            $chatTitle = if ($update.message.chat.title) { $update.message.chat.title } else { "Personal Chat" }
            $firstName = if ($update.message.chat.first_name) { $update.message.chat.first_name } else { "N/A" }
            
            Write-Host "`nChat ID: $chatId" -ForegroundColor Cyan
            Write-Host "Type: $chatType"
            Write-Host "Title/Name: $chatTitle ($firstName)"
            Write-Host "---"
        }
    }
    
    Write-Host "`nCopy one of the Chat IDs above and update your .env file" -ForegroundColor Yellow
    Write-Host "VITE_TELEGRAM_CHAT_ID=`"<YOUR_CHAT_ID>`"" -ForegroundColor Yellow
} else {
    Write-Host "`nNo messages found!" -ForegroundColor Red
    Write-Host "Please send a message to your bot first, then run this script again." -ForegroundColor Yellow
}
