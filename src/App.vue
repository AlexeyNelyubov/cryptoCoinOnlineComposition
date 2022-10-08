<script setup>
import { computed } from "@vue/reactivity";
import { onMounted, onUpdated, reactive, ref, watch, watchEffect } from "vue";
// import { loadTicker } from "./api";
//import { subscribeToTicker } from "./api";
//import { unsubscribeFromTicker } from "./api";
import AddTicker from "./components/AddTicker.vue";
import ShowGraph from "./components/ShowGraph.vue";
import { useGraphStore } from "./stores/changerGraph";

const stateGraph = useGraphStore();

//ПОКАЗ ВВОДИМЫХ МОНЕТ

//показ на странице введённого тикера(+полученная цена)
const tickers = ref([]); //массив тикеров
const graphElement = ref(null);

const worker = new SharedWorker("./src/worker/worker-api.js", {
  name: "sharedworker",
});
const workerPrice = new Worker("./src/worker/worker-price.js", {
  name: "workerprice",
});
const workerPrice1 = new SharedWorker("./src/worker/worker-price1.js", {
  name: "sharedworkerprice",
});

//workerPrice.postMessage([currentTicker.name, true]);
// workerPrice.onmessage = (e) => {
//   console.log(e.data);
// };

worker.port.onmessage = (e) => {
  //console.log(e.data);
  if (e.data[1]) {
    const tickerworker = {
      name: e.data[0],
      price: " - ",
      validPrice: true,
    };
    if (!tickers.value.find((el) => el.name === e.data[0])) {
      tickers.value = [...tickers.value, tickerworker];
    }
  }
  if (!e.data[1]) {
    tickers.value = tickers.value.filter((t) => t.name != e.data[0]);
  }
};
workerPrice1.port.onmessage = (e) => {
  //console.log(e.data[0], e.data[1]);
  updateTicker(e.data[0], e.data[1]);
};

function getTicker(ticker) {
  const currentTicker = reactive({
    name: ticker.toUpperCase(),
    price: " - ",
    validPrice: true,
  });

  tickers.value = [...tickers.value, currentTicker];

  worker.port.postMessage([currentTicker.name, true]);
  workerPrice1.port.postMessage([currentTicker.name, true]);
  workerPrice1.port.onmessage = (e) => {
    //console.log(e.data[0], e.data[1]);
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
      if (selectedTicker.value?.name === tickerName) {
        graph.value.push(price);
        if (graph.value.length > stateGraph.calculateMaxGraphElement()) {
          graph.value = graph.value.slice(
            graph.value.length - stateGraph.calculateMaxGraphElement(),
            graph.value.length + 1
          );
        }
      }
    });
}

onMounted(() => {
  window.addEventListener("resize", () => {
    if (graph.value.length >= stateGraph.calculateMaxGraphElement()) {
      graph.value = graph.value.slice(
        graph.value.length - stateGraph.calculateMaxGraphElement(),
        graph.value.length + 1
      );
    }
  });
});

function formatePrice(price) {
  if (price == " - ") {
    return price;
  }
  const priceType = Number(price);
  return priceType > 1 ? priceType.toFixed(2) : priceType.toPrecision(2);
}

//удаление тикера из списка
function handleDelete(tickerToRemove) {
  tickers.value = tickers.value.filter((t) => t != tickerToRemove);
  worker.port.postMessage([tickerToRemove.name, false]);
  workerPrice1.port.postMessage([tickerToRemove.name, false]);
  //tickers.value.splice(tickers.value.indexOf(tickerToRemove), 1);
  if (selectedTicker.value === tickerToRemove) {
    selectedTicker.value = null;
  }
}

//обновление цены тикеров(запрос на серевер)
const selectedTicker = ref(); //выбор тикера для показа графика
window.selectedTicker = selectedTicker;
const graph = ref([]); //бар на графике

// async function updateTicker () {
//   if (!tickers.value.length) {
//     return;
//   };
//   const exchangeData = await loadTicker(tickers.value.map ((t) => t.name));
//   //console.log(exchangeData);
//   tickers.value.forEach ( t => {
//   const price = exchangeData[t.name.toUpperCase()];
//   if (price === "-") {
//         t.price = price;
//       }
//       else {
//        t.price = price>1 ? price.toFixed(2) : price.toPrecision(2);
//       };

//   if (selectedTicker.value?.name === t.name) {
//         graph.value.push(price);
//     };
//   })
// };

watch(tickers, () => {
  if (!tickers.value.length) {
    localStorage.removeItem("cryptonomicon-list");
    return;
  }
  localStorage.setItem("cryptonomicon-list", JSON.stringify(tickers.value));
});

//загрузка данных из localStorage, чтобы сохранить состояние введённых тикеров при перезагрузке страницы
const tickerData = localStorage.getItem("cryptonomicon-list");
if (tickerData) {
  tickers.value = JSON.parse(tickerData);
  tickers.value.forEach((t) => {
    workerPrice1.port.postMessage([t.name, true]);
  });
  // tickers.value.forEach((t) => {
  //   subscribeToTicker(t.name, (newPrice) => {
  //     updateTicker(t.name, newPrice);
  //   });
  // });
}
// if (tickers.value.length) {
//   tickers.value.map((ticker) => {
//     console.log(ticker.name);
//     worker.port.postMessage(ticker.name);
//     worker.port.onmessage = (e) => {
//       //worker.postMessage(ticker.name);
//       //worker.onmessage = (e) => {
//       console.log("apishared", e.data);
//     };
//   });
// }
//setInterval(updateTicker, 5000);

//ГРАФИК

//выбор тикера для построения графика
function select(ticker) {
  selectedTicker.value = ticker;
}

function changeselectedticker() {
  selectedTicker.value = null;
}

//изменеие графика при выборе другого тикера
watch(selectedTicker, () => {
  graph.value = [];
});

//ФИЛЬТР

//вывод тикеров при изменении фильтра
const windowData = Object.fromEntries(
  new URL(window.location).searchParams.entries()
);
const tickerFilter = ref(""); //для получения фильтра(инпут)

const filteredTicker = computed(() =>
  tickers.value.filter((elem) =>
    elem.name.includes(tickerFilter.value.toUpperCase())
  )
);

//определение индекса тикера(от какого до кагого) в массиве tickers для пагинации
const page = ref(1); //номер страницы при пагинации

const startIndex = computed(() => (page.value - 1) * 6);
const endtIndex = computed(() => page.value * 6);

//пагинация (разбивка выводимых тикеров постранично(6 шт. на одной странице))
const paginatededTicker = computed(() =>
  filteredTicker.value.slice(startIndex.value, endtIndex.value)
);

//определение показывать кнопку "Вперёд" или нет
const hasNextPage = computed(
  () => filteredTicker.value.length > endtIndex.value
);

//сохранение состояния(и изменение URL) при переходе на другую страницу или вводу фильтра, чтобы при перезагрузке остаться в этом же месте
watchEffect(() => {
  window.history.pushState(
    null,
    document.title,
    `${window.location.pathname}?tickerFilter=${tickerFilter.value}&page=${page.value}`
  );
});

//переход на предыдущую страницу при удалении всех элементов на текущей странице
watchEffect(() => {
  if (paginatededTicker.value.length === 0 && page.value > 1) {
    page.value -= 1;
  }
});

//загрузка данных из URL, чтобы сохранить состояние фильтра при перезагрузке страницы
if (windowData.tickerFilter) {
  tickerFilter.value = windowData.tickerFilter;
  tickers.value.forEach((t) => {
    workerPrice1.port.postMessage([t.name, true]);
  });
  // filteredTicker.value.forEach((t) => {
  //   workerPrice1.port.postMessage(t.name);
  // });
  // paginatededTicker.value.forEach((t) => {
  //   workerPrice1.port.postMessage(t.name);
  // });
}

if (windowData.page) {
  page.value = windowData.page;
}
</script>

<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      {{ stateGraph.graphField }}
      <add-ticker @add-ticker="getTicker" :tickers="tickers" />
      <div v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <button
          v-if="page > 1"
          @click="page = Number(page) - 1"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Назад
        </button>
        <button
          v-if="hasNextPage"
          @click="page = Number(page) + 1"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Вперёд
        </button>
        <div>
          Фильтр
          <input v-model="tickerFilter" @input="page = 1" />
        </div>
      </div>

      <hr v-if="tickers.length" class="w-full border-t border-gray-600 my-4" />
      <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div
          @click="select(t)"
          v-for="t in paginatededTicker"
          :key="t"
          :class="{
            'border-4': selectedTicker === t,
            'bg-red-200': !t.validPrice,
          }"
          class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
        >
          <div class="px-4 py-5 sm:p-6 text-center">
            <dt class="text-sm font-medium text-gray-500 truncate">
              {{ t.name }} - USD
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ formatePrice(t.price) }}
            </dd>
          </div>
          <div class="w-full border-t border-gray-200"></div>
          <button
            @click.stop="handleDelete(t)"
            class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
          >
            <svg
              class="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="#718096"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              ></path></svg
            >Удалить
          </button>
        </div>
      </dl>
      <hr v-if="tickers.length" class="w-full border-t border-gray-600 my-4" />
      <ShowGraph
        :selectedTicker="selectedTicker"
        :graph="graph"
        @change-selectedticker="changeselectedticker"
      />
    </div>
  </div>
</template>
