import Web3 from "web3";
import Config from "@/lib/Config";

import WalletConnectProvider from "@walletconnect/web3-provider";

export default {
  disconnectFromMetaMask({ commit }) {
    commit("setIsConnected", false);
    commit("setAccount", "");
  },

  markProposal({ commit }, { proposalId, marked }) {
    commit("markProposal", { proposalId, marked });
  },

  updateCurrentBlockNumber({ commit }, { blockNumber }) {
    commit("updateCurrentBlockNumber", blockNumber);
  },

  async connectToMetaMask({ commit }, { walletConnect, metamask }) {
    let provider = null;

    if (walletConnect) {
      provider = new WalletConnectProvider({
        rpc: {
          56: "https://bsc-dataseed.binance.org/"
        },
        chainId: 56
      });

      //  Enable session (triggers QR Code modal)
      await provider.enable();
    } else if (metamask) {
      provider = window.ethereum;
    }

    const configure = async ({ commit }) => {
      let accounts = await provider.request({
        method: "eth_requestAccounts"
      });

      if (!accounts) {
        accounts = await web3.eth.getAccounts();
      }

      console.log({ accounts });
      console.log(!accounts);

      const networkInfo = {
        id: await web3.eth.net.getId(),
        type: await web3.eth.net.getNetworkType()
      };

      commit("setIsConnected", true);
      commit("setAccount", accounts[0]);
      commit("setNetworkInfo", networkInfo);
      commit(
        "setGweiContractAddress",
        Config.getGweiSmartContractAddress(networkInfo.id)
      );
      commit(
        "setContractAddress",
        Config.getSmartContractAddress(networkInfo.id)
      );
    };

    const clear = ({ commit }) => {
      commit("setIsConnected", false);
      commit("setAccount", null);
      commit("setNetworkInfo", {});
      commit("setGweiContractAddress", "");
      commit("setContractAddress", "");
    };

    window.web3 = new Web3(provider);

    provider.on("accountsChanged", accounts => {
      configure({ commit });
    });

    provider.on("networkChanged", networkId => {
      window.location.reload();
    });

    provider.on("disconnect", () => {
      clear({ commit });
    });

    try {
      configure({ commit });
    } catch (e) {
      clear({ commit });
    }
  }
};
