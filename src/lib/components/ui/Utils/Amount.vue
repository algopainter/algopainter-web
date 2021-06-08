<template>
  <span>
    {{ computedAmount }}
  </span>
</template>

<script>
export default {
  props: ["amount", "compact", "decimals"],

  computed: {
    computedAmount() {
      if (this.amount !== undefined) {
        const numberAmount = this.amount.toFixed(this.parsedDecimals);
        if (this.compact !== undefined) {
          numberAmount = this.compactNumber(parseFloat(numberAmount), this.parsedDecimals);
        } else {
          return parseFloat(numberAmount).toLocaleString();
        }
      } else {
        return 0;
      }
    },

    parsedDecimals() {
      return this.decimals ?? 0;
    },
  },

  methods: {
    compactNumber(value, decimals) {
      if (value < 1e3) return value;
      if (value >= 1e3 && value < 1e6)
        return +(value / 1e3).toFixed(decimals) + "K";
      if (value >= 1e6 && value < 1e9)
        return +(value / 1e6).toFixed(decimals) + "M";
      if (value >= 1e9 && value < 1e12)
        return +(value / 1e9).toFixed(decimals) + "B";
      if (value >= 1e12) return +(value / 1e12).toFixed(decimals) + "T";
    },
  },
};
</script>
