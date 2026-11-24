// ==========================================
// NEXUS STOCK MARKET DASHBOARD
// Alpha Vantage API
// ==========================================

const API_KEY = "F4AKI64SZDXC5FPQ";

// ==========================================
// GLOBAL VARIABLES
// ==========================================

let stocks = [];
let selectedStock = null;

let currentCurrency = "INR";
let currentRange = "1M";

let chartData = [];


// ==========================================
// USER / SESSION
// ==========================================

const user = JSON.parse(
    localStorage.getItem("loggedInUser")
);

const userMode =
    localStorage.getItem("userMode");

if (!user || !userMode) {
    window.location.href = "index.html";
}


// ==========================================
// HTML ELEMENTS
// ==========================================

const userName =
    document.getElementById("userName");

const stockList =
    document.getElementById("stockList");

const searchInput =
    document.getElementById("searchInput");

const stockName =
    document.getElementById("stockName");

const stockSymbol =
    document.getElementById("stockSymbol");

const stockPrice =
    document.getElementById("stockPrice");

const stockChange =
    document.getElementById("stockChange");

const openValue =
    document.getElementById("openValue");

const highValue =
    document.getElementById("highValue");

const lowValue =
    document.getElementById("lowValue");

const prevValue =
    document.getElementById("prevValue");

const volumeValue =
    document.getElementById("volumeValue");

const yearHigh =
    document.getElementById("yearHigh");

const quantity =
    document.getElementById("quantity");

const buyBtn =
    document.getElementById("buyBtn");

const sellBtn =
    document.getElementById("sellBtn");

const orderMessage =
    document.getElementById("orderMessage");

const portfolioValue =
    document.getElementById("portfolioValue");

const guestNotice =
    document.getElementById("guestNotice");

const profileBtn =
    document.getElementById("profileBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const profileModal =
    document.getElementById("profileModal");

const closeModal =
    document.getElementById("closeModal");

const newName =
    document.getElementById("newName");

const newUsername =
    document.getElementById("newUsername");

const newPassword =
    document.getElementById("newPassword");

const saveProfile =
    document.getElementById("saveProfile");

const profileMessage =
    document.getElementById("profileMessage");

const canvas =
    document.getElementById("stockChart");

const ctx =
    canvas ? canvas.getContext("2d") : null;


// ==========================================
// USER DISPLAY
// ==========================================

if (userName) {

    userName.textContent =
        userMode === "guest"
            ? "Guest"
            : user.name;
}


// ==========================================
// GUEST MODE
// ==========================================

if (userMode === "guest") {

    if (guestNotice) {
        guestNotice.style.display = "block";
    }

    if (buyBtn) {
        buyBtn.disabled = true;
    }

    if (sellBtn) {
        sellBtn.disabled = true;
    }

    if (quantity) {
        quantity.disabled = true;
    }
}


// ==========================================
// INDIAN STOCK SYMBOLS
// ==========================================
//
// These symbols are automatically converted:
//
// RELIANCE → RELIANCE.BSE
// TCS      → TCS.BSE
//
// stocks.json does NOT need to be changed.
// ==========================================

const indianSymbols = new Set([

    "RELIANCE",
    "TCS",
    "INFY",
    "HDFCBANK",
    "ICICIBANK",
    "SBIN",
    "ITC",
    "BHARTIARTL",
    "TATAPOWER",
    "WIPRO",
    "HINDUNILVR",
    "LT",
    "AXISBANK",
    "KOTAKBANK",
    "MARUTI",
    "SUNPHARMA",
    "BAJFINANCE",
    "HCLTECH",
    "ADANIENT",
    "ADANIPORTS",
    "TITAN",
    "ASIANPAINT",
    "ULTRACEMCO",
    "NESTLEIND",
    "POWERGRID",
    "NTPC",
    "ONGC",
    "COALINDIA",
    "TATASTEEL",
    "JSWSTEEL",
    "TECHM",
    "INDUSINDBK",
    "BAJAJFINSV",
    "BAJAJ-AUTO",
    "HEROMOTOCO",
    "EICHERMOT",
    "M&M",
    "TATAMOTORS",
    "TATACONSUM",
    "DRREDDY",
    "CIPLA",
    "DIVISLAB",
    "APOLLOHOSP",
    "GRASIM",
    "BPCL",
    "BRITANNIA",
    "HINDALCO",
    "SHRIRAMFIN",
    "TRENT",
    "BEL",
    "HAL",
    "INDIGO",
    "IRCTC",
    "ZOMATO",
    "PAYTM",
    "JIOFIN",
    "DMART",
    "VEDL",
    "IOC",
    "GAIL",
    "SAIL",
    "PIDILITIND",
    "DABUR",
    "GODREJCP",
    "AMBUJACEM",
    "ACC",
    "SIEMENS",
    "ABB",
    "BOSCHLTD",
    "MOTHERSON",
    "TVSMOTOR",
    "ASHOKLEY",
    "BHEL",
    "CANBK",
    "PNB",
    "BANKBARODA",
    "BANKINDIA",
    "IDFCFIRSTB",
    "FEDERALBNK",
    "INDIANB",
    "LICI",
    "SBILIFE",
    "HDFCLIFE",
    "ICICIPRULI",
    "ICICIGI",
    "MUTHOOTFIN",
    "MANAPPURAM",
    "AUROPHARMA",
    "LUPIN",
    "BIOCON",
    "TORNTPHARM",
    "ZYDUSLIFE",
    "COFORGE",
    "PERSISTENT",
    "MPHASIS",
    "LTIM",
    "LTTS"

]);


// ==========================================
// CONVERT SYMBOL FOR ALPHA VANTAGE
// ==========================================

function getAPISymbol(symbol) {

    if (!symbol) {
        return symbol;
    }

    symbol =
        symbol.toUpperCase().trim();

    // Already contains exchange
    if (symbol.includes(".")) {
        return symbol;
    }

    // Indian stock
    if (indianSymbols.has(symbol)) {
        return symbol + ".BSE";
    }

    // Global stock
    return symbol;
}


// ==========================================
// LOAD STOCK LIST FROM stocks.json
// ==========================================

async function loadStocks() {

    try {

        const response =
            await fetch("stocks.json");

        if (!response.ok) {

            throw new Error(
                "Could not load stocks.json"
            );
        }

        const data =
            await response.json();

        stocks =
            Array.isArray(data.stocks)
                ? data.stocks
                : [];

        renderStockList(stocks);

        if (stocks.length > 0) {
            selectStock(stocks[0]);
        }

    } catch (error) {

        console.error(error);

        if (stockList) {

            stockList.innerHTML =
                "<p>Unable to load stocks.json</p>";
        }
    }
}


// ==========================================
// RENDER STOCK LIST
// ==========================================

function renderStockList(list) {

    if (!stockList) {
        return;
    }

    stockList.innerHTML = "";

    list.forEach(stock => {

        const item =
            document.createElement("div");

        item.className =
            "stock-item";

        item.innerHTML = `
            <strong>${stock.symbol}</strong>
            <span>${stock.name}</span>
        `;

        item.addEventListener(
            "click",
            () => selectStock(stock)
        );

        stockList.appendChild(item);
    });
}


// ==========================================
// SEARCH
// ==========================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            const search =
                searchInput.value
                    .toLowerCase()
                    .trim();

            const filtered =
                stocks.filter(stock =>

                    stock.symbol
                        .toLowerCase()
                        .includes(search)

                    ||

                    stock.name
                        .toLowerCase()
                        .includes(search)
                );

            renderStockList(filtered);
        }
    );
}


// ==========================================
// SELECT STOCK
// ==========================================

async function selectStock(stock) {

    selectedStock = stock;

    if (stockName) {
        stockName.textContent =
            stock.name;
    }

    if (stockSymbol) {
        stockSymbol.textContent =
            stock.symbol;
    }

    if (stockPrice) {
        stockPrice.textContent =
            "Loading...";
    }

    if (stockChange) {
        stockChange.textContent =
            "Loading...";
    }

    try {

        const data =
            await getAlphaVantageData(
                stock.symbol
            );

        if (!data) {
            return;
        }

        updateStockInformation(data);

        chartData =
            data.history;

        drawChart(-1);

    } catch (error) {

        console.error(error);

        if (stockPrice) {
            stockPrice.textContent =
                "API Error";
        }

        if (stockChange) {
            stockChange.textContent =
                "-";
        }

        if (openValue) {
            openValue.textContent = "-";
        }

        if (highValue) {
            highValue.textContent = "-";
        }

        if (lowValue) {
            lowValue.textContent = "-";
        }

        if (prevValue) {
            prevValue.textContent = "-";
        }

        if (volumeValue) {
            volumeValue.textContent = "-";
        }

        if (yearHigh) {
            yearHigh.textContent = "-";
        }

        if (ctx && canvas) {
            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );
        }
    }
}


// ==========================================
// ALPHA VANTAGE API
// ==========================================

async function getAlphaVantageData(symbol) {

    const apiSymbol =
        getAPISymbol(symbol);

    console.log(
        "Requesting Alpha Vantage:",
        apiSymbol
    );

    const url =
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(apiSymbol)}&outputsize=compact&apikey=${API_KEY}`;

    const response =
        await fetch(url);

    if (!response.ok) {

        throw new Error(
            "HTTP error: " +
            response.status
        );
    }

    const data =
        await response.json();

    console.log(
        "Alpha Vantage response:",
        data
    );


    // ======================================
    // API LIMIT
    // ======================================

    if (data["Note"]) {

        throw new Error(
            "Alpha Vantage API limit reached."
        );
    }


    // ======================================
    // INFORMATION MESSAGE
    // ======================================

    if (data["Information"]) {

        throw new Error(
            data["Information"]
        );
    }


    // ======================================
    // INVALID SYMBOL
    // ======================================

    if (data["Error Message"]) {

        throw new Error(
            data["Error Message"]
        );
    }


    // ======================================
    // TIME SERIES
    // ======================================

    const timeSeries =
        data["Time Series (Daily)"];

    if (!timeSeries) {

        throw new Error(
            "No daily stock data received."
        );
    }


    // ======================================
    // CREATE HISTORY
    // ======================================

    const dates =
        Object.keys(timeSeries)
            .sort();

    const history =
        dates.map(date => {

            return {

                date: date,

                open:
                    Number(
                        timeSeries[date]["1. open"]
                    ),

                high:
                    Number(
                        timeSeries[date]["2. high"]
                    ),

                low:
                    Number(
                        timeSeries[date]["3. low"]
                    ),

                close:
                    Number(
                        timeSeries[date]["4. close"]
                    ),

                volume:
                    Number(
                        timeSeries[date]["5. volume"]
                    )
            };
        });


    if (history.length === 0) {

        throw new Error(
            "No historical data available."
        );
    }


    // ======================================
    // LATEST DATA
    // ======================================

    const latest =
        history[history.length - 1];

    const previous =
        history.length > 1
            ? history[history.length - 2]
            : latest;


    const change =
        latest.close -
        previous.close;

    const changePercent =
        previous.close !== 0
            ? (change / previous.close) * 100
            : 0;


    // ======================================
    // HIGHEST PRICE
    // ======================================

    const highest =
        Math.max(
            ...history.map(
                item => item.high
            )
        );


    return {

        price:
            latest.close,

        change:
            change,

        changePercent:
            changePercent,

        open:
            latest.open,

        high:
            latest.high,

        low:
            latest.low,

        prevClose:
            previous.close,

        volume:
            latest.volume,

        yearHigh:
            highest,

        history:
            history
    };
}


// ==========================================
// UPDATE STOCK INFORMATION
// ==========================================

function updateStockInformation(data) {

    if (stockPrice) {

        stockPrice.textContent =
            formatCurrency(
                convertCurrency(data.price)
            );
    }


    const sign =
        data.changePercent >= 0
            ? "+"
            : "";


    if (stockChange) {

        stockChange.textContent =
            `${sign}${data.changePercent.toFixed(2)}%`;

        stockChange.className =
            data.changePercent >= 0
                ? "positive"
                : "negative";
    }


    if (openValue) {

        openValue.textContent =
            formatCurrency(
                convertCurrency(data.open)
            );
    }


    if (highValue) {

        highValue.textContent =
            formatCurrency(
                convertCurrency(data.high)
            );
    }


    if (lowValue) {

        lowValue.textContent =
            formatCurrency(
                convertCurrency(data.low)
            );
    }


    if (prevValue) {

        prevValue.textContent =
            formatCurrency(
                convertCurrency(data.prevClose)
            );
    }


    if (volumeValue) {

        volumeValue.textContent =
            data.volume.toLocaleString();
    }


    if (yearHigh) {

        yearHigh.textContent =
            formatCurrency(
                convertCurrency(data.yearHigh)
            );
    }
}


// ==========================================
// CURRENCY SWITCH
// ==========================================

document
    .querySelectorAll(".currency")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".currency")
                    .forEach(btn => {

                        btn.classList.remove(
                            "active"
                        );
                    });

                button.classList.add("active");

                currentCurrency =
                    button.dataset.currency ||
                    "INR";


                if (chartData.length > 0) {

                    drawChart(-1);
                }


                if (selectedStock) {

                    selectStock(
                        selectedStock
                    );
                }
            }
        );
    });


// ==========================================
// USD → INR
// ==========================================

function convertCurrency(value) {

    if (currentCurrency === "USD") {
        return value;
    }

    return value * 83.50;
}


// ==========================================
// FORMAT CURRENCY
// ==========================================

function formatCurrency(value) {

    if (currentCurrency === "USD") {

        return "$" +
            Number(value).toFixed(2);
    }

    return "₹" +
        Number(value).toFixed(2);
}


// ==========================================
// CHART RANGE BUTTONS
// ==========================================

document
    .querySelectorAll(".range")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".range")
                    .forEach(btn => {

                        btn.classList.remove(
                            "active"
                        );
                    });

                button.classList.add("active");

                currentRange =
                    button.dataset.range ||
                    "1M";

                drawChart(-1);
            }
        );
    });


// ==========================================
// GET CHART RANGE
// ==========================================

function getChartRange() {

    let count;

    switch (currentRange) {

        case "1D":
            count = 2;
            break;

        case "1W":
            count = 5;
            break;

        case "1M":
            count = 22;
            break;

        case "3M":
            count = 66;
            break;

        case "1Y":
            count = 100;
            break;

        default:
            count = 22;
    }

    return chartData.slice(-count);
}


// ==========================================
// DRAW INTERACTIVE CHART
// ==========================================

function drawChart(hoverIndex = -1) {

    if (
        !canvas ||
        !ctx ||
        chartData.length < 2
    ) {
        return;
    }


    const rect =
        canvas.getBoundingClientRect();


    if (
        rect.width === 0 ||
        rect.height === 0
    ) {
        return;
    }


    canvas.width =
        rect.width;

    canvas.height =
        rect.height;


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    const points =
        getChartRange();


    if (points.length < 2) {
        return;
    }


    const prices =
        points.map(
            item => item.close
        );


    const min =
        Math.min(...prices);

    const max =
        Math.max(...prices);


    const padding = 40;


    const width =
        canvas.width -
        padding * 2;


    const height =
        canvas.height -
        padding * 2;


    // ======================================
    // GRID
    // ======================================

    ctx.strokeStyle =
        "rgba(0, 255, 136, 0.08)";

    ctx.lineWidth = 1;


    for (
        let i = 0;
        i <= 4;
        i++
    ) {

        const y =
            padding +
            (i / 4) * height;


        ctx.beginPath();


        ctx.moveTo(
            padding,
            y
        );


        ctx.lineTo(
            canvas.width - padding,
            y
        );


        ctx.stroke();
    }


    // ======================================
    // PRICE LINE
    // ======================================

    ctx.beginPath();


    points.forEach(
        (item, index) => {

            const x =
                padding +
                (
                    index /
                    (points.length - 1)
                ) *
                width;


            const y =
                padding +
                (
                    (max - item.close) /
                    (max - min || 1)
                ) *
                height;


            if (index === 0) {

                ctx.moveTo(
                    x,
                    y
                );

            } else {

                ctx.lineTo(
                    x,
                    y
                );
            }
        }
    );


    ctx.strokeStyle =
        "#00ff88";

    ctx.lineWidth = 2;

    ctx.stroke();


    // ======================================
    // HOVER
    // ======================================

    if (
        hoverIndex >= 0 &&
        hoverIndex < points.length
    ) {

        const item =
            points[hoverIndex];


        const x =
            padding +
            (
                hoverIndex /
                (points.length - 1)
            ) *
            width;


        const y =
            padding +
            (
                (max - item.close) /
                (max - min || 1)
            ) *
            height;


        // ==================================
        // VERTICAL CURSOR LINE
        // ==================================

        ctx.beginPath();

        ctx.moveTo(
            x,
            padding
        );

        ctx.lineTo(
            x,
            canvas.height - padding
        );

        ctx.strokeStyle =
            "rgba(0, 255, 136, 0.5)";

        ctx.lineWidth = 1;

        ctx.stroke();


        // ==================================
        // HIGHLIGHT POINT
        // ==================================

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            5,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#00ff88";

        ctx.fill();


        // ==================================
        // TOOLTIP
        // ==================================

        const displayPrice =
            convertCurrency(
                item.close
            );


        const tooltipText =
            item.date +
            " | " +
            formatCurrency(
                displayPrice
            );


        ctx.font =
            "12px Arial";


        const textWidth =
            ctx.measureText(
                tooltipText
            ).width;


        const boxWidth =
            textWidth + 20;


        const boxHeight = 32;


        let boxX =
            x + 10;


        let boxY =
            y - 45;


        // Keep tooltip inside chart

        if (
            boxX + boxWidth >
            canvas.width
        ) {

            boxX =
                x -
                boxWidth -
                10;
        }


        if (boxX < 5) {
            boxX = 5;
        }


        if (boxY < 5) {
            boxY = 5;
        }


        // Tooltip background

        ctx.fillStyle =
            "rgba(0, 20, 15, 0.95)";


        ctx.fillRect(
            boxX,
            boxY,
            boxWidth,
            boxHeight
        );


        // Tooltip border

        ctx.strokeStyle =
            "#00ff88";

        ctx.lineWidth = 1;


        ctx.strokeRect(
            boxX,
            boxY,
            boxWidth,
            boxHeight
        );


        // Tooltip text

        ctx.fillStyle =
            "#00ff88";


        ctx.fillText(
            tooltipText,
            boxX + 10,
            boxY + 20
        );
    }
}


// ==========================================
// MOUSE INTERACTION
// ==========================================

if (canvas) {

    canvas.addEventListener(
        "mousemove",
        event => {

            if (chartData.length < 2) {
                return;
            }


            const rect =
                canvas.getBoundingClientRect();


            const mouseX =
                event.clientX -
                rect.left;


            const points =
                getChartRange();


            if (points.length < 2) {
                return;
            }


            const padding = 40;


            const width =
                canvas.width -
                padding * 2;


            let index =
                Math.round(
                    (
                        mouseX -
                        padding
                    ) /
                    width *
                    (
                        points.length - 1
                    )
                );


            index =
                Math.max(
                    0,
                    Math.min(
                        index,
                        points.length - 1
                    )
                );


            drawChart(index);
        }
    );


    // ======================================
    // REMOVE HOVER
    // ======================================

    canvas.addEventListener(
        "mouseleave",
        () => {

            drawChart(-1);
        }
    );
}


// ==========================================
// REDRAW CHART ON WINDOW RESIZE
// ==========================================

window.addEventListener(
    "resize",
    () => {

        if (chartData.length > 0) {
            drawChart(-1);
        }
    }
);


// ==========================================
// BUY
// ==========================================

if (buyBtn) {

    buyBtn.addEventListener(
        "click",
        () => {

            doTrade("BUY");
        }
    );
}


// ==========================================
// SELL
// ==========================================

if (sellBtn) {

    sellBtn.addEventListener(
        "click",
        () => {

            doTrade("SELL");
        }
    );
}


// ==========================================
// TRADE
// ==========================================

function doTrade(type) {

    if (userMode === "guest") {

        if (orderMessage) {

            orderMessage.textContent =
                "Guest users cannot place orders.";
        }

        return;
    }


    if (!selectedStock) {
        return;
    }


    const qty =
        Number(
            quantity.value
        );


    if (!qty || qty <= 0) {

        if (orderMessage) {

            orderMessage.textContent =
                "Enter a valid quantity.";
        }

        return;
    }


    const currentPrice =
        selectedStock.currentPrice ||
        chartData.length > 0
            ? chartData[chartData.length - 1].close
            : 0;


    const total =
        currentPrice * qty;


    if (orderMessage) {

        orderMessage.textContent =
            `${type} order placed: ${qty} ${selectedStock.symbol} - ${formatCurrency(convertCurrency(total))}`;
    }
}


// ==========================================
// PORTFOLIO KEY
// ==========================================

function getPortfolioKey() {

    if (userMode === "guest") {
        return "guestPortfolio";
    }

    return "portfolio_" +
        user.username;
}


// ==========================================
// UPDATE PORTFOLIO
// ==========================================

function updatePortfolio() {

    const key =
        getPortfolioKey();


    const value =
        Number(
            localStorage.getItem(key)
        ) || 0;


    if (portfolioValue) {

        portfolioValue.textContent =
            formatCurrency(
                value
            );
    }
}


// ==========================================
// PROFILE
// ==========================================

if (profileBtn) {

    profileBtn.addEventListener(
        "click",
        () => {

            if (!profileModal) {
                return;
            }


            profileModal.style.display =
                "flex";


            if (userMode === "user") {

                if (newName) {

                    newName.value =
                        user.name || "";
                }


                if (newUsername) {

                    newUsername.value =
                        user.username || "";
                }


                if (newPassword) {

                    newPassword.value =
                        "";
                }
            }
        }
    );
}


// ==========================================
// CLOSE PROFILE MODAL
// ==========================================

if (closeModal) {

    closeModal.addEventListener(
        "click",
        () => {

            if (profileModal) {

                profileModal.style.display =
                    "none";
            }
        }
    );
}


// ==========================================
// SAVE PROFILE
// ==========================================

if (saveProfile) {

    saveProfile.addEventListener(
        "click",
        () => {

            if (userMode === "guest") {

                profileMessage.textContent =
                    "Guest profile cannot be changed.";

                return;
            }


            if (user.username === "admin") {

                profileMessage.textContent =
                    "Admin account cannot be modified.";

                return;
            }


            const users =
                JSON.parse(
                    localStorage.getItem(
                        "stockUsers"
                    )
                ) || [];


            const index =
                users.findIndex(
                    item =>
                        item.username ===
                        user.username
                );


            if (index === -1) {

                profileMessage.textContent =
                    "User account not found.";

                return;
            }


            const oldUsername =
                user.username;


            const updatedName =
                newName.value.trim();


            const updatedUsername =
                newUsername.value.trim();


            if (!updatedName) {

                profileMessage.textContent =
                    "Name cannot be empty.";

                return;
            }


            if (!updatedUsername) {

                profileMessage.textContent =
                    "Username cannot be empty.";

                return;
            }


            // Check duplicate username

            const duplicate =
                users.some(
                    (item, i) =>
                        i !== index &&
                        item.username.toLowerCase() ===
                        updatedUsername.toLowerCase()
                );


            if (duplicate) {

                profileMessage.textContent =
                    "Username already exists.";

                return;
            }


            users[index].name =
                updatedName;


            users[index].username =
                updatedUsername;


            if (
                newPassword.value.trim()
            ) {

                users[index].password =
                    newPassword.value.trim();
            }


            localStorage.setItem(
                "stockUsers",
                JSON.stringify(users)
            );


            localStorage.setItem(
                "loggedInUser",
                JSON.stringify(
                    users[index]
                )
            );


            // Move portfolio if username changed

            if (
                oldUsername !==
                updatedUsername
            ) {

                const oldKey =
                    "portfolio_" +
                    oldUsername;


                const newKey =
                    "portfolio_" +
                    updatedUsername;


                const oldPortfolio =
                    localStorage.getItem(
                        oldKey
                    );


                if (
                    oldPortfolio !== null
                ) {

                    localStorage.setItem(
                        newKey,
                        oldPortfolio
                    );


                    localStorage.removeItem(
                        oldKey
                    );
                }
            }


            profileMessage.textContent =
                "Profile updated successfully.";


            setTimeout(
                () => {
                    location.reload();
                },
                800
            );
        }
    );
}


// ==========================================
// LOGOUT
// ==========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "loggedInUser"
            );

            localStorage.removeItem(
                "userMode"
            );


            window.location.href =
                "index.html";
        }
    );
}


// ==========================================
// START APPLICATION
// ==========================================

loadStocks();

updatePortfolio();