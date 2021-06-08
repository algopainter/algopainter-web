export default {
  account: state => state.account,
  isConnected: state => state.isConnected,
  markedProposals: state => state.markedProposals,
  networkInfo: state => state.networkInfo,
  networkId: state =>
    state.networkInfo && state.networkInfo.id
      ? state.networkInfo.id.toString()
      : null,
  gweiContractAddress: state => state.gweiContractAddress,
  contractAddress: state => state.contractAddress,
  currentBlockNumber: state => state.currentBlockNumber
};
