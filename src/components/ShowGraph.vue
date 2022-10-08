<template>
  <section v-if="selectedTicker" class="relative">
    <h3
      class="text-lg leading-6 font-medium text-gray-900 my-8"
      ref="graphField"
    >
      {{ selectedTicker.name }} - USD
      {{ stateGraph.graphField }}
      {{ props.graph.length }}
    </h3>
    <div class="flex items-end border-gray-600 border-b border-l h-64">
      <div
        ref="graphElement"
        v-for="(bar, idx) in normalizedGraph"
        :key="idx"
        :style="{
          height: `${bar}%`,
          width: maxGraphElement,
        }"
        class="bg-purple-800 border w-10"
      ></div>
    </div>
    <button
      @click="changeSelectedticker"
      type="button"
      class="absolute top-0 right-0"
    >
      <close-icon />
    </button>
  </section>
</template>

<script setup>
import { ref, defineProps, onMounted, computed, onUpdated } from "vue";
import CloseIcon from "./CloseIcon.vue";
import { useGraphStore } from "../stores/changerGraph";

const stateGraph = useGraphStore();

const graphElement = ref(null);
const graphField = ref(null);
const maxGraphElement = stateGraph.maxGraphElement;

const emit = defineEmits(["change-selectedticker"]);

onUpdated(() => {
  if (graphField.value) {
    stateGraph.graphField = Math.floor(
      graphField.value.clientWidth / maxGraphElement - 0.3
    );
  }
});

function changeSelectedticker() {
  emit("change-selectedticker");
}

const props = defineProps({
  selectedTicker: Object,
  graph: Array,
});

//пересчёт цены в % для корректного отогбражения графика
const normalizedGraph = computed(() => {
  const maxValue = Math.max(...props.graph);
  const minValue = Math.min(...props.graph);
  if (maxValue === minValue) {
    return props.graph.map(() => 50);
  }
  return props.graph.map(
    (price) => 5 + ((price - minValue) * 95) / (maxValue - minValue)
  );
});
</script>

@click="selectedTicker = null"
