
// const allPorts = [];
// const counter = 0;

// self.onconnect = (e) => {
//     const port = e.ports[0];
//     allPorts.push(port);
//     port.onmessage = function(ev) {
//         counter++;
//         allPorts.forEach(instance => {
//             instance.postMessage(`counter is ${counter}`);
//           });
//     };
// }
const allPorts = [];
self.onconnect = (e) => {
    const port = e.ports[0];
    allPorts.push(port);
    port.onmessage = function(ev) {
        if (ev.data[1]){
            allPorts.map(instance => {
                instance.postMessage([ev.data[0], true]);
        });
        }
        if (!ev.data[1]){
            allPorts.map(instance => {
                instance.postMessage([ev.data[0], false]);
        });
        }
    };
    
}
// const API_KEY = "935a739f8e8fb902d649fdda4ab3f6f5492697eadbb74ab6ed6efc229417c500";
// //const API_KEY = "5831820a166a9154a7d405ffec10fcbffe0948a94751f0db89d8ea3cec742e3e";
// const tickersHandler= new Map();
// const socket = new WebSocket (`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);
// const AGGRIGATE_INDEX = 5;
// //socket.close();
// socket.onmessage = function(e) {
//     const parsedMassage = JSON.parse(e.data);
//     if (parsedMassage.TYPE == 500) {
//         const handlers1 = tickersHandler.get (parsedMassage.PARAMETER.split('~')[2]);
//                 handlers1.forEach(fn => fn(false));
//     };
//         if (parsedMassage.TYPE == AGGRIGATE_INDEX) {
//             if (parsedMassage.PRICE===undefined) {
//                 return;
//             };
//             const handlers = tickersHandler.get (parsedMassage.FROMSYMBOL);
//                 handlers.forEach(fn => fn(parsedMassage.PRICE));
//         };
// };

// function sendToWS (massage) {
//     const stringifiedMassage = JSON.stringify(massage);
//     if(socket.readyState === WebSocket.OPEN) {
//         socket.send (stringifiedMassage);
//         return;
//     };
//    socket.onopen = function () {
//     socket.send(stringifiedMassage);
//    },
//    {once: true};
// };



// function subscribeToTickerOnWs (ticker) {
//     sendToWS ({
//         "action": "SubAdd",
//         "subs": [`5~CCCAGG~${ticker}~USDT`]
//     });
// };

// export const subscribeToTicker = (ticker, cb) => {
//     const subscriber = tickersHandler.get(ticker) || [];
//     tickersHandler.set(ticker, [...subscriber, cb]);
//     subscribeToTickerOnWs (ticker);
// }; 

// function unsubscribeFromTickerOnWs (ticker) {
//     sendToWS ({
//         "action": "SubRemove",
//         "subs": [`5~CCCAGG~${ticker}~USDT`]
//     });
// };

// export const unsubscribeFromTicker = (ticker) => {
//     tickersHandler.delete (ticker);
//     unsubscribeFromTickerOnWs (ticker);
// }; 

