import AlgoPainterGweiItem from "./AlgoPainterGweiItem.json";
import store from "@/store";

export default class AlgoPainterGweiItemProxy {
  constructor() {
    this.contractAddress = store.getters["user/contractAddress"];
    this.algoPainter = new window.web3.eth.Contract(
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

  balanceOf(account) {
    return this.algoPainter.methods.balanceOf(account).call();
  }

  getPaintingsAccountCount(account) {
    return this.algoPainter.methods.balanceOf(account).call();
  }

  getPaintingsCount() {
    return this.algoPainter.methods.totalSupply().call();
  }

  tokenOfOwnerByIndex(account, index) {
    return this.algoPainter.methods.tokenOfOwnerByIndex(account, index).call();
  }

  tokenURI(index) {
    return this.algoPainter.methods.tokenURI(index).call();
  }

  async getMyPainting(index, account) {
    try {
      const tokenIndex = await this.tokenOfOwnerByIndex(account, index);
      const tokenURI = await this.tokenURI(tokenIndex);

      const controller = new AbortController();
      setTimeout(() => controller.abort(), 3000);
      const getIPFS = await fetch(tokenURI, { signal: controller.signal });
      const response = await getIPFS.json();

      return {
        status: 200,
        code: "SUCCESS",
        response: response,
      };
    } catch (error) {
      return {
        status: 409,
        code: "ROBOT_NOT_LOAD",
        response: {},
      };
    }
  }

  async getPainting(index) {
    try {
      const tokenURI = await this.tokenURI(index);

      const controller = new AbortController();
      setTimeout(() => controller.abort(), 3000);
      const getIPFS = await fetch(tokenURI, { signal: controller.signal });
      const response = await getIPFS.json();

      return {
        status: 200,
        code: "SUCCESS",
        response: response,
      };
    } catch (error) {
      return {
        status: 409,
        code: "ROBOT_NOT_LOAD",
        response: {},
      };
    }
  }

  async getPaintings(pageLimit, page) {
    const count = await this.getPaintingsCount();
    const start = count - pageLimit * page;

    const promises = [];

    for (let i = start; i > start - pageLimit && i > 0; i--) {
      promises.push(this.getPainting(i));
    }

    return Promise.all(promises);
  }

  async getMyPaintings(pageLimit, page, account) {
    const count = await this.getPaintingsAccountCount(account);
    const start = count - pageLimit * page;

    const promises = [];

    for (let i = start; i > start - pageLimit && i > 0; i--) {
      promises.push(this.getMyPainting(i - 1, account));
    }

    return Promise.all(promises);
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
      data: this.algoPainter.methods.mint(hash, tokenURI, signature).encodeABI(),
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
