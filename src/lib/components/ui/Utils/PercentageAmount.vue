<template>
  <span>
    {{ computedAmount }}%
  </span>
</template>

<script>
export default {
  props: ["amount", "decimals", "compact", "oneHundred"],

  computed: {
    computedAmount() {
      return parseFloat(this.amount / this.parsedOneHundred).toFixed(this.parsedDecimals);
    },

    parsedDecimals() {
      return this.decimals ?? 2;
    },

    parsedOneHundred() {
      return this.oneHundred ?? 100;
    }
  },
};
</script>
