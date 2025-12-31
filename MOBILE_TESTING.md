# Mobile Testing Guide

## Testing on Mobile Without Deploying

### Method 1: Local Network (Recommended)

#### For WSL2 Users (You are on WSL2):

1. **Start the dev server:**

   ```bash
   npm run dev
   ```

2. **Find your Windows host IP address:**
   - In **Windows PowerShell** (not WSL), run: `ipconfig`
   - Look for your WiFi adapter (usually "Wireless LAN adapter Wi-Fi" or "Ethernet adapter")
   - Find the "IPv4 Address" - this is the IP to use (e.g., `192.168.1.100`)
   - **OR** use the WSL2 host gateway: `10.255.255.253` (nameserver IP - 1)

3. **Set up port forwarding (one-time setup):**
   - In **Windows PowerShell as Administrator**, run:

   ```powershell
   netsh interface portproxy add v4tov4 listenport=5173 listenaddress=0.0.0.0 connectport=5173 connectaddress=172.18.44.145
   ```

   - Replace `172.18.44.145` with your actual WSL2 IP (check with `hostname -I` in WSL)

   To remove the forwarding later:

   ```powershell
   netsh interface portproxy delete v4tov4 listenport=5173 listenaddress=0.0.0.0
   ```

4. **Access from mobile device:**
   - Make sure your mobile device is on the **same WiFi network** as your Windows computer
   - Open a browser on your mobile device
   - Navigate to: `http://YOUR_WINDOWS_IP:5173`
   - Example: `http://192.168.1.100:5173`

#### For Native Linux/Mac Users:

1. **Start the dev server:**

   ```bash
   npm run dev
   ```

2. **Find your local IP address:**
   - The dev server will show your local network IP in the terminal
   - Or run: `hostname -I` (Linux) or `ipconfig getifaddr en0` (Mac)

3. **Access from mobile device:**
   - Make sure your mobile device is on the **same WiFi network** as your computer
   - Open a browser on your mobile device
   - Navigate to: `http://YOUR_LOCAL_IP:5173`
   - Example: `http://192.168.1.100:5173`

### Method 2: Browser DevTools (Quick Testing)

1. **Open Chrome/Firefox DevTools** (F12)
2. **Toggle device toolbar** (Ctrl+Shift+M / Cmd+Shift+M)
3. **Select a mobile device** from the dropdown
4. **Test touch interactions** - Note: This simulates touch but may not perfectly match real mobile behavior

### Method 3: Tunneling Service (For Testing Remotely)

If you need to test from a different network:

1. **Install ngrok:**

   ```bash
   npm install -g ngrok
   # Or download from https://ngrok.com/
   ```

2. **Start dev server:**

   ```bash
   npm run dev
   ```

3. **In another terminal, start ngrok:**

   ```bash
   ngrok http 5173
   ```

4. **Use the ngrok URL** shown in the terminal on your mobile device

### Troubleshooting

- **Can't access from mobile?**
  - Check firewall settings (allow port 5173)
  - Ensure both devices are on the same WiFi network
  - Try disabling VPN if active

- **Connection refused?**
  - Make sure `host: true` is set in `vite.config.js`
  - Restart the dev server after changing config

- **HTTPS required?**
  - Some mobile browsers require HTTPS for certain features
  - Use ngrok (provides HTTPS) or configure Vite with HTTPS
