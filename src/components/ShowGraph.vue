<template>
  <section v-if="selectedTicker" class="relative">
    <h3 class="text-lg leading-6 font-medium text-gray-900 my-8" ref="graphField">
      {{ selectedTicker.name }} - USD
    </h3>
    <div class="flex items-end border-gray-600 border-b border-l h-64">
      <div
        v-for="(bar, idx) in normalizedGraph"
        :key="idx"
        :style="{
          height: `${bar}%`,
          width: maxGraphElement,
        }"
        class="bg-purple-800 border w-10"
      ></div>
    </div>
    <button @click="changeSelectedticker" type="button" class="absolute top-0 right-0">
      <close-icon />
    </button>
  </section>
</template>

<script setup>
import { ref, defineProps, computed, onUpdated, watch, onMounted } from "vue";
import CloseIcon from "./CloseIcon.vue";

const graph = ref([]);

const graphField = ref(null);
const maxGraphElement = 38;
const graphFieldSize = ref();

const props = defineProps({
  selectedTicker: Object,
  tickers: Object,
});

const emit = defineEmits(["change-selectedticker"]);

onUpdated(() => {
  if (graphField.value) {
    graphFieldSize.value = Math.floor(graphField.value.clientWidth / maxGraphElement - 0.3);
  }
});

watch(
  () => props.selectedTicker,
  () => {
    graph.value = [];
  }
);

watch(props.tickers, () => {
  props.tickers
    .filter((t) => t.name === props.selectedTicker?.name)
    .forEach((t) => {
      graph.value.push(t.price);
      if (graph.value.length >= graphFieldSize.value) {
        graph.value = graph.value.slice(
          graph.value.length - graphFieldSize.value,
          graph.value.length + 1
        );
      }
    });
});

onMounted(() => {
  window.addEventListener("resize", () => {
    if (graph.value.length >= graphFieldSize.value) {
      graph.value = graph.value.slice(
        graph.value.length - graphFieldSize.value,
        graph.value.length + 1
      );
    }
  });
});

function changeSelectedticker() {
  emit("change-selectedticker");
}

let normalizedGraph = computed(() => {
  const maxValue = Math.max(...graph.value);
  const minValue = Math.min(...graph.value);
  if (maxValue === minValue) {
    return graph.value.map(() => 50);
  }
  return graph.value.map((price) => 5 + ((price - minValue) * 95) / (maxValue - minValue));
});
</script>
