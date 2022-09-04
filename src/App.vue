<script setup>
import { computed } from "@vue/reactivity";
import { onMounted, reactive, ref, watch, watchEffect } from "vue";
// import { loadTicker } from "./api";
import {subscribeToTicker} from "./api";
import {unsubscribeFromTicker} from "./api";

const maxGraphElement = ref(38);
//const windowData = Object.fromEntries(new URL (window.location).searchParams.entries());
//const q = Object.fromEntries(new URL (window.location).searchParams);
//console.log(q);
// console.log(windowData);

                                                            //ПОКАЗ ВВОДИМЫХ МОНЕТ

//показ на странице введённого тикера(+полученная цена)
const ticker = ref("");//вводимый тикер
const tickers = ref([]);//массив тикеров
const graphElement = ref(null);
const graphField = ref(null);

function callback() {
const currentTicker = reactive ({
    name: ticker.value.toUpperCase(),
    price: " - ",
    validPrice: true
  });
  
  tickers.value = [...tickers.value, currentTicker];
  subscribeToTicker(currentTicker.name, (newPrice)=>{
    updateTicker (currentTicker.name, newPrice);
  });
  //subcribeToUpdate(currentTicker.name);
  //console.log((tickers.value.map( item => item.name)).join(','));
  //updateTicker();
  ticker.value = "";
};

function updateTicker (tickerName, price) {
  if (price === false) {
    tickers.value.filter(t => t.name === tickerName).forEach(t => {
    t.validPrice = false;
    });
    return;
  };
  tickers.value.filter(t => t.name === tickerName).forEach(t => {
    t.validPrice = true;
    t.price = price;
    if (selectedTicker.value?.name === tickerName) {
      if (graph.value.length >= calculateMaxGraphElement()){
        graph.value = graph.value.slice((graph.value.length-calculateMaxGraphElement()), graph.value.length+1);
      };
      graph.value.push (price);
      //console.log(graphElement.value['0'].clientWidth);
      //console.log(Math.floor(graphField.value.clientWidth/graphElement.value['0'].clientWidth));
      //console.log(graph.value.length);
    };
  });
};

function calculateMaxGraphElement(){ 
  if (!graphField.value) {
    return;
  };
return Math.floor(graphField.value.clientWidth/maxGraphElement.value-1);
};


 onMounted(() => {
   window.addEventListener('resize', ()=> {
    if (graph.value.length >= calculateMaxGraphElement()){
        graph.value = graph.value.slice((graph.value.length-calculateMaxGraphElement()), graph.value.length+1);
      };
   });
 });

function formatePrice(price) {
      if (price == " - " ) {
        return price;
      };
      const priceType = Number(price);
      return priceType>1 ? priceType.toFixed(2) : priceType.toPrecision(2);
};

//Проверка на совпадение (вывод надписи "Такой тикер уже добавлен")
const tickerCompare = ref(false);//для сравнения есть ли уже такой тикер или нет ("Такой тикер уже добавлен")

function add() {
  tickerCompare.value = false;
  if (tickers.value.length){
    for (let i of tickers.value){
      if ( ticker.value.toUpperCase() === i.name){
        tickerCompare.value = true;
        break;
      }
    }
      if(!tickerCompare.value) {
        callback();
    };  
  }
  else{
    callback();
  }
};

//удаление тикера из списка
function handleDelete(tickerToRemove) {
  tickers.value = tickers.value.filter( t => t != tickerToRemove); 
  unsubscribeFromTicker(tickerToRemove.name);
  //tickers.value.splice(tickers.value.indexOf(tickerToRemove), 1);
  if (selectedTicker.value === tickerToRemove) {
    selectedTicker.value = null;
  };
};

//обновление цены тикеров(запрос на серевер)
const selectedTicker = ref();//выбор тикера для показа графика
const graph = ref([]);//бар на графике


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

watch ( tickers, () => {
  if (!tickers.value.length) {
    localStorage.removeItem ('cryptonomicon-list');
    return;
  };
  localStorage.setItem ('cryptonomicon-list', JSON.stringify(tickers.value));
});

//загрузка данных из localStorage, чтобы сохранить состояние введённых тикеров при перезагрузке страницы
const tickerData = localStorage.getItem ('cryptonomicon-list');
if (tickerData) {
  tickers.value = JSON.parse(tickerData);
  tickers.value.forEach (t => {
    subscribeToTicker(t.name, (newPrice)=>{
      updateTicker(t.name, newPrice);
    });
  });
};

//setInterval(updateTicker, 5000);


                                                                      //АВТОКОМПЛИТ

//получение файла сосписком монет, для автокомплита при вводе тикера
const dataCoinList = ref([]); //массив для вывода 4х монет при автокомплите

onMounted(() => {  
  async function getCoinList() {
    const fr = await fetch(
      `https://min-api.cryptocompare.com/data/all/coinlist?summary=true`
    );
    const data = await fr.json();
    return data;
  }
  getCoinList().then((data) => {
    dataCoinList.value = data.Data;
  });
});
const tickerShow = ref([]);// массив списка из 4-х монет при вводе тикера


//получение автокомплита(списка из 4-х монет при вводе тикера)
function autopComplite() {
  tickerCompare.value = false;
  tickerShow.value = [];
  let i = 1;
  for (let key in dataCoinList.value) {
    if ((i<=4) & dataCoinList.value[key].Symbol.includes(ticker.value.toUpperCase())) {
      tickerShow.value.push(dataCoinList.value[key].Symbol);
      i++;
    }
  }
};

//ввод тикера по нажатию на иконку в автокомплите
function addAutocomplite(tic) {
  ticker.value = tic;
  add();
};


                                                                      //ГРАФИК

//выбор тикера для построения графика
function select(ticker) {
  selectedTicker.value = ticker;
};

//изменеие графика при выборе другого тикера
watch (selectedTicker, () => {
    graph.value = [];
});

//пересчёт цены в % для корректного отогбражения графика
const normalizedGraph = computed(()=> {
const maxValue = Math.max(...graph.value);
  const minValue = Math.min(...graph.value);
  if (maxValue === minValue) {
    return graph.value.map (()=>50)
  };
  return graph.value.map(
    (price) => 5 + ((price - minValue) * 95) / (maxValue - minValue)
  );
});



                                                                      //ФИЛЬТР

//вывод тикеров при изменении фильтра
const windowData = Object.fromEntries(new URL (window.location).searchParams.entries());
const tickerFilter = ref(""); //для получения фильтра(инпут)

const filteredTicker = computed (()=> tickers.value.filter((elem) => elem.name.includes(tickerFilter.value.toUpperCase())));

//определение индекса тикера(от какого до кагого) в массиве tickers для пагинации
const page=ref(1); //номер страницы при пагинации

const startIndex = computed( () => (page.value-1)*6);
const endtIndex = computed( () =>  page.value*6);

//пагинация (разбивка выводимых тикеров постранично(6 шт. на одной странице))
const paginatededTicker = computed (()=> filteredTicker.value.slice(startIndex.value,endtIndex.value));

//определение показывать кнопку "Вперёд" или нет
const hasNextPage = computed(() => filteredTicker.value.length > endtIndex.value );

//сохранение состояния(и изменение URL) при переходе на другую страницу или вводу фильтра, чтобы при перезагрузке остаться в этом же месте
watchEffect (() => {
    window.history.pushState(
      null, 
      document.title, 
      `${window.location.pathname}?tickerFilter=${tickerFilter.value}&page=${page.value}`
      );
});

//переход на предыдущую страницу при удалении всех элементов на текущей странице
watchEffect (() => {
    if (paginatededTicker.value.length ===0 && page.value>1){
      page.value -=1;
    }
});

//загрузка данных из URL, чтобы сохранить состояние фильтра при перезагрузке страницы
if(windowData.tickerFilter) {
  tickerFilter.value = windowData.tickerFilter;
};

if(windowData.page) {
  page.value = windowData.page;
};

</script>

<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <section>
        <div class="flex">
          <div 
           class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700"
              >Тикер
            </label>
            <div 
            class="mt-1 relative rounded-md shadow-md">
              <input
                v-model="ticker"
                @keydown.enter="add()"
                @input="autopComplite()"
                type="text"
                name="wallet"
                id="wallet"
                class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="Например DOGE"
              />
            </div>
            <div
              v-if="ticker"
              class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
            >
              <span
              @click="addAutocomplite(tshw)"
              v-for="tshw in tickerShow"
              :key="tshw"
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                {{ tshw }}
              </span>
            </div>
            <div 
            v-if="tickerCompare"
            class="text-sm text-red-600">Такой тикер уже добавлен</div>
          </div>
        </div>
        <button
          @click="add()"
          type="button"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <!-- Heroicon name: solid/mail -->
          <svg
            class="-ml-0.5 mr-2 h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="#ffffff"
          >
            <path
              d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            ></path>
          </svg>
          Добавить
        </button>
      </section>
      <div v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <button 
        v-if="page>1"
        @click="page=Number(page)-1"
        class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
        Назад
        </button>
        <button 
        v-if="hasNextPage"
        @click="page=Number(page)+1"
        class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
        Вперёд
        </button>
        <div> Фильтр
          <input 
            v-model="tickerFilter"
            @input="page=1"
          />
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
            'bg-red-200': !t.validPrice
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
      <section v-if="selectedTicker" class="relative">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8" ref="graphField">
          {{ selectedTicker.name }} - USD
        </h3>
        <div class="flex items-end border-gray-600 border-b border-l h-64">
          <div
            v-for="(bar, idx) in normalizedGraph"
            :key="idx"
            ref="graphElement"
            :style="{ 
              height: `${bar}%`, 
              width: maxGraphElement
              }"
            class="bg-purple-800 border w-10"
          ></div>
        </div>
        <button
          @click="selectedTicker = null"
          type="button"
          class="absolute top-0 right-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:svgjs="http://svgjs.com/svgjs"
            version="1.1"
            width="30"
            height="30"
            x="0"
            y="0"
            viewBox="0 0 511.76 511.76"
            style="enable-background: new 0 0 512 512"
            xml:space="preserve"
          >
            <g>
              <path
                d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                fill="#718096"
                data-original="#000000"
              ></path>
            </g>
          </svg>
        </button>
      </section>
    </div>
  </div>
</template>
