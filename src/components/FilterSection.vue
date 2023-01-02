<template>
  <div v-if="tickers.length >= 2">
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
    <div v-if="tickers.length >= 2">
      Фильтр
      <input v-model="tickerFilter" @input="page = 1" />
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, computed, onMounted, watchEffect, watch } from "vue";

const props = defineProps({
  tickers: Object,
});

const emit = defineEmits(["chage-paginatededTicker"]);

const page = ref(1);

const startIndex = computed(() => (page.value - 1) * 6);
const endtIndex = computed(() => page.value * 6);

const tickerFilter = ref("");

const filteredTicker = computed(() =>
  props.tickers.filter((elem) => elem.name.includes(tickerFilter.value.toUpperCase()))
);

//пагинация (разбивка выводимых тикеров постранично(6 шт. на одной странице))
const paginatededTicker = computed(() =>
  filteredTicker.value.slice(startIndex.value, endtIndex.value)
);

watchEffect(() => {
  emit("chage-paginatededTicker", paginatededTicker.value);
});
// watch(paginatededTicker.value, () => {
//   emit("chage-paginatededTicker", paginatededTicker.value);
// });

//определение показывать кнопку "Вперёд" или нет
const hasNextPage = computed(() => filteredTicker.value.length > endtIndex.value);

onMounted(() => {
  const windowData = Object.fromEntries(new URL(window.location).searchParams.entries());

  watch([tickerFilter, page], () => {
    window.history.pushState(
      null,
      document.title,
      `${window.location.pathname}?tickerFilter=${tickerFilter.value}&page=${page.value}`
    );
  });

  //переход на предыдущую страницу при удалении всех элементов на текущей странице
  watch(paginatededTicker, () => {
    if (paginatededTicker.value.length === 0 && page.value > 1) {
      page.value -= 1;
    }
  });
  //загрузка данных из URL, чтобы сохранить состояние фильтра при перезагрузке страницы
  if (windowData.tickerFilter) {
    tickerFilter.value = windowData.tickerFilter;
  }
  if (windowData.page) {
    page.value = Number(windowData.page);
  }
});
</script>
