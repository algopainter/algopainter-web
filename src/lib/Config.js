export function getSmartContractAddress(networkId) {
  switch (networkId.toString()) {
    case "56":
      return process.env.VUE_APP_SMART_CONTRACT_56;
    case "96":
      return process.env.VUE_APP_SMART_CONTRACT_96;
    case "5777":
      return process.env.VUE_APP_SMART_CONTRACT_5777;
    default:
      return process.env.VUE_APP_SMART_CONTRACT;
  }
}

export function getGweiSmartContractAddress(networkId) {
  switch (networkId.toString()) {
    case "56":
      return process.env.VUE_APP_GWEI_SMART_CONTRACT_56;
    case "96":
      return process.env.VUE_APP_GWEI_SMART_CONTRACT_96;
    case "5777":
      return process.env.VUE_APP_GWEI_SMART_CONTRACT_5777;
    default:
      return process.env.VUE_APP_GWEI_SMART_CONTRACT;
  }
}

export default {
  getSmartContractAddress,
  getGweiSmartContractAddress
};
