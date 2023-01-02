<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700">Тикер </label>
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @keydown.enter="add"
            @input="autopComplite()"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <div v-if="ticker" class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap">
          <span
            @click="addAutocomplite(tshw)"
            v-for="tshw in tickerShow"
            :key="tshw"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ tshw }}
          </span>
        </div>
        <div v-if="tickerCompare" class="text-sm text-red-600">Такой тикер уже добавлен</div>
      </div>
    </div>
    <add-button @click="add" />
  </section>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps } from "vue";
import AddButton from "./AddButton.vue";

const props = defineProps({
  tickers: { type: Array, required: true },
});

const emit = defineEmits(["add-ticker"]);

//получение файла сосписком монет, для автокомплита при вводе тикера
const dataCoinList = ref([]); //массив для вывода 4х монет при автокомплите

onMounted(() => {
  async function getCoinList() {
    const fr = await fetch("https://min-api.cryptocompare.com/data/all/coinlist?summary=true");
    const data = await fr.json();
    return data;
  }
  getCoinList().then((data) => {
    dataCoinList.value = data.Data;
  });
});
const tickerShow = ref([]); // массив списка из 4-х монет при вводе тикера

//Проверка на совпадение (вывод надписи "Такой тикер уже добавлен")
const tickerCompare = ref(false); //для сравнения есть ли уже такой тикер или нет ("Такой тикер уже добавлен")

function add() {
  tickerCompare.value = false;
  if (props.tickers.filter((t) => t.name === ticker.value.toUpperCase()).length) {
    tickerCompare.value = true;
    return;
  }

  if (!tickerCompare.value) {
    getTicker();
  } else {
    getTicker();
  }
}

//показ на странице введённого тикера(+полученная цена)
const ticker = ref(""); //вводимый тикер

function getTicker() {
  emit("add-ticker", ticker.value);
  ticker.value = "";
}

//получение автокомплита(списка из 4-х монет при вводе тикера)
function autopComplite() {
  tickerCompare.value = false;
  tickerShow.value = [];
  let i = 1;
  for (let key in dataCoinList.value) {
    if ((i <= 4) & dataCoinList.value[key].Symbol.includes(ticker.value.toUpperCase())) {
      tickerShow.value.push(dataCoinList.value[key].Symbol);
      i++;
    }
  }
}

//ввод тикера по нажатию на иконку в автокомплите
function addAutocomplite(tic) {
  ticker.value = tic;
  add();
}
</script>
