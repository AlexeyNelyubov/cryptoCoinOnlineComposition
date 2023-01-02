const allPorts = [];
self.onconnect = (e) => {
  const port = e.ports[0];
  allPorts.push(port);
  port.onmessage = function (ev) {
    //port.postMessage([ev.data[0], ev.data[1]])
    if (!ev.data[1]) {
      unsubscribeFromTickerOnWs(ev.data[0]);
    }
    if (ev.data[1]) {
      subscribeToTickerOnWs(ev.data[0]);
    }
  };
};

const API_KEY = "935a739f8e8fb902d649fdda4ab3f6f5492697eadbb74ab6ed6efc229417c500";
//const API_KEY = "5831820a166a9154a7d405ffec10fcbffe0948a94751f0db89d8ea3cec742e3e";
// const tickersHandler = new Map();
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);
const AGGRIGATE_INDEX = 5;
const tickers = [];
//socket.close();
socket.onmessage = function (e) {
  const parsedMassage = JSON.parse(e.data);
  if (parsedMassage.TYPE == 500) {
    allPorts.map((instance) => {
      instance.postMessage([parsedMassage.PARAMETER.split("~")[2], false]);
    });
  }
  if (parsedMassage.TYPE == AGGRIGATE_INDEX) {
    if (parsedMassage.PRICE === undefined) {
      return;
    }
    allPorts.map((instance) => {
      instance.postMessage([parsedMassage.FROMSYMBOL, parsedMassage.PRICE]);
    });
  }
};

function sendToWS(massage) {
  const stringifiedMassage = JSON.stringify(massage);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMassage);
    return;
  } else {
    tickers.push(stringifiedMassage);
    (socket.onopen = function () {
      for (let el of tickers) {
        socket.send(el);
      }
    }),
      { once: true };
  }
}

function subscribeToTickerOnWs(ticker) {
  sendToWS({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USDT`],
  });
}

// function subscribeToTicker (ticker, cb) {
//     const subscriber = tickersHandler.get(ticker) || [];
//     tickersHandler.set(ticker, [...subscriber, cb]);
//     subscribeToTickerOnWs (ticker);
// };

// export const subscribeToTicker = (ticker, cb) => {
//     const subscriber = tickersHandler.get(ticker) || [];
//     tickersHandler.set(ticker, [...subscriber, cb]);
//     subscribeToTickerOnWs (ticker);
// };

function unsubscribeFromTickerOnWs(ticker) {
  sendToWS({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USDT`],
  });
}

// export const unsubscribeFromTicker = (ticker) => {
//     tickersHandler.delete (ticker);
//     unsubscribeFromTickerOnWs (ticker);
// };
