<script setup>
import { watch, ref } from "vue";
import AddTicker from "./components/AddTicker.vue";
import ShowTickers from "./components/ShowTickers.vue";

const tickers = ref([]);

const worker = new SharedWorker("./src/worker/worker-api.js", {
  name: "sharedworker",
});

const workerPrice1 = new SharedWorker("./src/worker/worker-price1.js", {
  name: "sharedworkerprice",
});

const tickerData = localStorage.getItem("cryptonomicon-list");
if (tickerData) {
  const tickersFromLocalStorage = JSON.parse(tickerData);
  for (let el of tickersFromLocalStorage) {
    tickers.value.push(el);
    workerPrice1.port.postMessage([el.name, true]);
  }
}

workerPrice1.port.onmessage = (e) => {
  updateTicker(e.data[0], e.data[1]);
};

worker.port.onmessage = (e) => {
  if (e.data[1]) {
    const tickerworker = {
      name: e.data[0],
      price: " - ",
      validPrice: true,
    };
    if (!tickers.value.find((el) => el.name === e.data[0])) {
      tickers.value.push(tickerworker);
    }
  }
  if (!e.data[1]) {
    for (const ind in tickers.value) {
      if (e.data[0] === tickers.value[ind].name) {
        tickers.value.splice(ind, 1);
      }
    }
  }
};

function getTicker(ticker) {
  const currentTicker = {
    name: ticker.toUpperCase(),
    price: " - ",
    validPrice: true,
  };
  tickers.value.push(currentTicker);
  worker.port.postMessage([currentTicker.name, true]);
  workerPrice1.port.postMessage([currentTicker.name, true]);
  workerPrice1.port.onmessage = (e) => {
    updateTicker(e.data[0], e.data[1]);
  };
}

function updateTicker(tickerName, price) {
  if (price === false) {
    tickers.value
      .filter((t) => t.name === tickerName)
      .forEach((t) => {
        t.validPrice = false;
      });
    return;
  }
  tickers.value
    .filter((t) => t.name === tickerName)
    .forEach((t) => {
      t.validPrice = true;
      t.price = price;
    });
}

function handleDelete(tickerToRemove) {
  for (const ind in tickers.value) {
    if (tickers.value[ind] === tickerToRemove) {
      tickers.value.splice(ind, 1);
    }
  }
  worker.port.postMessage([tickerToRemove.name, false]);
  workerPrice1.port.postMessage([tickerToRemove.name, false]);
}

watch(tickers.value, () => {
  if (tickers.value.length === 0) {
    localStorage.removeItem("cryptonomicon-list");
    return;
  }
  localStorage.setItem("cryptonomicon-list", JSON.stringify(tickers.value));
});
</script>

<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <add-ticker @add-ticker="getTicker" :tickers="tickers" />
      <show-tickers :tickers="tickers" @handle-delete="handleDelete" />
    </div>
  </div>
</template>
