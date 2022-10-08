import { defineStore } from 'pinia'

export const useGraphStore = defineStore('graph', {
  
state: () => ({ 
  graphField: 0,
  graph: [], 
  maxGraphElement: 38
}),

actions: {
  calculateMaxGraphElement(){ 
    if (!this.graphField) {
    return;
    };
    return this.graphField;
  }
},

// getters:{
//   graph: ()=>{
    
//   }
// },
})