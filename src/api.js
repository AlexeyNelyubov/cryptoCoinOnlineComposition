const API_KEY = "935a739f8e8fb902d649fdda4ab3f6f5492697eadbb74ab6ed6efc229417c500";

export const loadTicker = ( tickers => {
    const param = new URLSearchParams ({
        fsyms: `${tickers.join(',')}`,
        tsyms: 'USD',
        api_key: `${API_KEY}`
    });
    const URL = `https://min-api.cryptocompare.com/data/pricemulti?${param.toString()}`;
    return fetch(URL)
    . then(f => f.json())
    . then (rawData => 
         Object.fromEntries(
             Object.entries(rawData).map(([key, value]) => [key, value.USD])
        )
     );
})
    

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