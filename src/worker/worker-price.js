// onmessage = (e) => {
//   console.log(e.data);
//   if (!e.data[1]) {
//     unsubscribeFromTickerOnWs(e.data[0]);
//   }
//   if (e.data[1]) {
//     subscribeToTickerOnWs(e.data[0]);
//   }
// };

// const API_KEY = "935a739f8e8fb902d649fdda4ab3f6f5492697eadbb74ab6ed6efc229417c500";
// const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);
// const AGGRIGATE_INDEX = 5;
// const tickers = [];
// socket.onmessage = function (e) {
//   const parsedMassage = JSON.parse(e.data);
//   if (parsedMassage.TYPE == 500) {
//     postMessage([parsedMassage.PARAMETER.split("~")[2], false]);
//   }
//   if (parsedMassage.TYPE == AGGRIGATE_INDEX) {
//     if (parsedMassage.PRICE === undefined) {
//       return;
//     }
//     postMessage([parsedMassage.FROMSYMBOL, parsedMassage.PRICE]);
//   }
// };

// function sendToWS(massage) {
//   const stringifiedMassage = JSON.stringify(massage);
//   console.log(stringifiedMassage);
//   console.log(socket.readyState);
//   if (socket.readyState === WebSocket.OPEN) {
//     console.log("if", stringifiedMassage);
//     socket.send(stringifiedMassage);
//     return;
//   } else {
//     tickers.push(stringifiedMassage);
//     (socket.onopen = function () {
//       for (let el of tickers){
//         socket.send(el);
//       }
//     }),
//       { once: true };
//   }
// }

// function subscribeToTickerOnWs(ticker) {
//   sendToWS({
//     action: "SubAdd",
//     subs: [`5~CCCAGG~${ticker}~USDT`],
//   });
// }

// function unsubscribeFromTickerOnWs(ticker) {
//   sendToWS({
//     action: "SubRemove",
//     subs: [`5~CCCAGG~${ticker}~USDT`],
//   });
// }
