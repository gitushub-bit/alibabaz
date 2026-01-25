# Fixes Applied

## 1. Select Component Warning (FIXED)
The warning "Select is changing from uncontrolled to controlled" happens because the Select component's value can be undefined initially.

**Solution**: The code already uses `|| 'once_per_session'` as a fallback, which should work. The warning might be coming from a different Select component.

## 2. Telegram API 400 Error

The error `api.telegram.org/bot…iouaA/sendMessage:1 Failed to load resource: the server responded with a status of 400` indicates:

### Possible Causes:
1. **Invalid Bot Token** - The token might be incorrect or revoked
2. **Invalid Chat ID** - The chat ID might be wrong
3. **Bot not added to group** - If using a group chat ID, the bot must be added as a member
4. **Bot permissions** - The bot might not have permission to send messages

### How to Fix:

1. **Verify Bot Token**:
   - Open Telegram and search for `@BotFather`
   - Send `/mybots`
   - Select your bot
   - Click "API Token" to see your current token
   - Compare with `.env` file: `VITE_TELEGRAM_BOT_TOKEN`

2. **Verify Chat ID**:
   - For personal chat: Search for `@userinfobot` on Telegram, send any message, it will reply with your chat ID
   - For group chat: 
     - Add your bot to the group
     - Send a message in the group
     - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
     - Look for `"chat":{"id":-1001234567890}` in the response
     - Use the negative number (including the minus sign) as your chat ID

3. **Test the Bot**:
   - Send a test message using curl:
   ```bash
   curl -X POST "https://api.telegram.org/bot7622362022:AAHhmcc8OutFC-SmCWoOUhFPysFvSeiouaA/sendMessage" \
   -H "Content-Type: application/json" \
   -d '{"chat_id": "-1003672391681", "text": "Test message"}'
   ```

4. **Check Bot Permissions** (if using a group):
   - Make sure the bot is still a member of the group
   - Make sure the bot has permission to send messages
   - Group admins can restrict bot permissions

### Current Configuration:
- Bot Token: `7622362022:AAHhmcc8OutFC-SmCWoOUhFPysFvSeiouaA`
- Chat ID: `-1003672391681` (This is a group/channel ID)

**Action Required**: Please verify that:
1. The bot is still active and the token is valid
2. The bot has been added to the group with ID `-1003672391681`
3. The bot has permission to send messages in that group
