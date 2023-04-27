import { defineStore } from 'pinia';

export const useGraphStore = defineStore('graph', {
  state: () => ({
    data: null,
  }),
  actions: {
    ChangeData(newData){
      this.data=newData
    }
  },
});
