NEXUS STOCK ANALYZER
====================

VERCEL APP LINK: https://nexusstockanalyser-iota.vercel.app/

Files:
- index.html       Login / guest page
- dashboard.html   Main stock analyzer
- style.css        Retro-futuristic UI
- login.js         Login logic
- app.js           Stock list, chart, currency and simulated orders
- stocks.json      Local stock data

DEFAULT LOGIN
Username: admin
Password: admin123

FEATURES
- INR / USD display switch
- Guest mode: price/chart viewing only
- Default login
- Custom username, password and name after login
- Search stocks
- Interactive canvas chart
- 1D / 1W / 1M / 3M / 1Y chart ranges
- Mouse hover price readout
- Simulated Buy / Sell orders
- LocalStorage profile and portfolio
- Responsive retro-futuristic UI

IMPORTANT
Because the app loads stocks.json using fetch(), do not open dashboard.html
directly with file://.

Run it using a local server.

OPTION 1: VS Code
Install "Live Server", right-click index.html and choose "Open with Live Server".

OPTION 2: Python
Open a terminal in this folder and run:
python -m http.server 5500

Then open:
http://localhost:5500

This is a frontend/student project. Prices in stocks.json are sample/local
data and are not live NSE/BSE market prices. Orders are simulated only.
