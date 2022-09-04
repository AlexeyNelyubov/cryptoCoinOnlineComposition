const API_KEY = "935a739f8e8fb902d649fdda4ab3f6f5492697eadbb74ab6ed6efc229417c500";
const tickersHandler= new Map();
const socket = new WebSocket (`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);
const AGGRIGATE_INDEX = 5;
//socket.close();
socket.onmessage = function(e) {
    const parsedMassage = JSON.parse(e.data);
    if (parsedMassage.TYPE == 500) {
        const handlers1 = tickersHandler.get (parsedMassage.PARAMETER.split('~')[2]);
                handlers1.forEach(fn => fn(false));
    };
        if (parsedMassage.TYPE == AGGRIGATE_INDEX) {
            if (parsedMassage.PRICE===undefined) {
                return;
            };
            const handlers = tickersHandler.get (parsedMassage.FROMSYMBOL);
                handlers.forEach(fn => fn(parsedMassage.PRICE));
        };
};

// socket.addEventListener("message", (e)=>{
// if (e.TYPE = AGGRIGATE_INDEX) {
//     const a = JSON.parse(e.data);
//     if (!a.PRICE) {
//         return;
//     };
//     const handlers1 = tickersHandler.get (a.FROMSYMBOL);
//         handlers1.forEach(fn => fn(a.PRICE));
// };
// });

// export const loadTicker = ( tickers => {
//     const param = new URLSearchParams ({
//         fsyms: `${tickers.join(',')}`,
//         tsyms: 'USD',
//         api_key: `${API_KEY}`
//     });
//     const URL = `https://min-api.cryptocompare.com/data/pricemulti?${param.toString()}`;
//     return fetch(URL)
//     . then(f => f.json())
//     . then (rawData => 
//          Object.fromEntries(
//              Object.entries(rawData).map(([key, value]) => [key, value.USD])
//         )
//      );
// });

// const loadTicker1 = () => {
//     if (!tickersHandler.size) {
//         return;
//     };
//     const param = new URLSearchParams ({
//         fsyms: `${[...tickersHandler.keys()].join(',')}`,
//         tsyms: 'USD',
//         api_key: `${API_KEY}`
//     });
//     const URL = `https://min-api.cryptocompare.com/data/pricemulti?${param.toString()}`;
//     return fetch(URL)
//     . then(f => f.json())
//     . then (rawData => {
//         const updatedPrieces = Object.fromEntries(
//             Object.entries(rawData).map(([key, value]) => [key, value.USD])
//        );
//        Object.entries(updatedPrieces).forEach(([currency, newPrice]) => {
//         const handlers = tickersHandler.get (currency);
//         handlers.forEach(fn => fn(newPrice));
//        })
//     });
// };

function sendToWS (massage) {
    const stringifiedMassage = JSON.stringify(massage);
    if(socket.readyState === WebSocket.OPEN) {
        socket.send (stringifiedMassage);
        return;
    };
   socket.onopen = function () {
    socket.send(stringifiedMassage);
   },
   {once: true};

    // socket.addEventListener ("open", () => {
    //     socket.send(stringifiedMassage);
    // },
    // {once: true}
    // );
};



function subscribeToTickerOnWs (ticker) {
    sendToWS ({
        "action": "SubAdd",
        "subs": [`5~CCCAGG~${ticker}~USDT`]
    });
};

export const subscribeToTicker = (ticker, cb) => {
    const subscriber = tickersHandler.get(ticker) || [];
    tickersHandler.set(ticker, [...subscriber, cb]);
    subscribeToTickerOnWs (ticker);
}; 

function unsubscribeFromTickerOnWs (ticker) {
    sendToWS ({
        "action": "SubRemove",
        "subs": [`5~CCCAGG~${ticker}~USDT`]
    });
};

export const unsubscribeFromTicker = (ticker) => {
    tickersHandler.delete (ticker);
    unsubscribeFromTickerOnWs (ticker);
}; 
    
//setInterval ( loadTicker1, 5000 );
window.tickers = tickersHandler;

    // export const loadTicker = ((tickerName) => {
    //     return fetch(
    //         `https://min-api.cryptocompare.com/data/price?fsym=${tickerName}&tsyms=USD&api_key=${API_KEY}`
    //     ). then(f => f.json())
    // });
      
    // export function loadTicker (tickerName) {
    //     return fetch(
    //         `https://min-api.cryptocompare.com/data/price?fsym=${tickerName}&tsyms=USD&api_key=${API_KEY}`
    //     ). then(f => f.json())
    // };