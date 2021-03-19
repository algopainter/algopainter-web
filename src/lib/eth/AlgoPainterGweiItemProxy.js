import AlgoPainterGweiItem from "./AlgoPainterGweiItem.json";
import store from "@/store";

export default class AlgoPainterGweiItemProxy {
  constructor() {
    this.contractAddress = store.getters["user/contractAddress"];
    this.smc = new window.web3.eth.Contract(
      AlgoPainterGweiItem.abi,
      this.contractAddress
    );
  }

  weiToEther(weiAmount) {
    return window.web3.utils.fromWei(weiAmount.toString(), "ether");
  }

  etherToWei(etherAmount) {
    return window.web3.utils.toWei(etherAmount.toString());
  }

  getRobotByName(name) {
    return this.smc.methods.getRobotByName(name).call();
  }

  async getLastBidByStar(star) {
    const amount = await this.smc.methods.getLastBidByStar(star).call();

    return parseFloat(this.weiToEther(amount));
  }

  async getMinBidByStar(star) {
    const amount = await this.smc.methods.getMinBidByStar(star).call();

    return parseFloat(this.weiToEther(amount));
  }

  balanceOf(account) {
    return this.smc.methods.balanceOf(account).call();
  }

  tokenOfOwnerByIndex(account, index) {
    return this.smc.methods.tokenOfOwnerByIndex(account, index).call();
  }

  getRobotUriByStarAndIndex(star, index) {
    return this.smc.methods.getRobotUriByStarAndIndex(star, index).call();
  }

  tokenURI(index) {
    return this.smc.methods.tokenURI(index).call();
  }

  async mint({ hash, tokenURI, signature, amount }, account) {
    const from = account;
    const nonce = window.web3.utils.toHex(
      await window.web3.eth.getTransactionCount(account)
    );
    const to = this.contractAddress;

    const txObject = {
      from,
      nonce,
      value: window.web3.utils.toHex(this.etherToWei(amount)),
      to,
      data: this.smc.methods.mint(hash, tokenURI, signature).encodeABI(),
    };

    return new Promise((resolve, reject) => {
      window.web3.eth.sendTransaction(txObject, (error, hash) => {
        if (error) {
          reject(error);
        } else {
          resolve(hash);
        }
      });
    });
  }
}
