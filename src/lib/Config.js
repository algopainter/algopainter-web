export function getSmartContractAddress(networkId) {
  switch (networkId.toString()) {
    case "56":
      return process.env.VUE_APP_SMART_CONTRACT_56;
    case "97":
      return process.env.VUE_APP_SMART_CONTRACT_97;
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
    case "97":
      return process.env.VUE_APP_GWEI_SMART_CONTRACT_97;
    case "5777":
      return process.env.VUE_APP_GWEI_SMART_CONTRACT_5777;
    default:
      return process.env.VUE_APP_GWEI_SMART_CONTRACT;
  }
}

export function getWalletConnectConfig(networkId) {
  return {
    rpc: {
      56: process.env.RPC_URL_56,
      97: process.env.RPC_URL_97,
    },
    chainId: networkId,
  };
}

export default {
  getSmartContractAddress,
  getGweiSmartContractAddress
};
