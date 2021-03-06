import AlgoPainterGweiItem from "./AlgoPainterGweiItem.json";
import store from "@/store";

export default class AlgoPainterGweiItemProxy {
  constructor(contractAddress) {
    this.contractAddress =
      contractAddress || store.getters["user/gweiContractAddress"];
    this.algoPainter = new window.web3.eth.Contract(
      AlgoPainterGweiItem,
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

  getTotalSupply() {
    return this.algoPainter.methods.totalSupply().call();
  }

  async getAmountToBurn() {
    return window.web3.utils.fromWei(
      await this.algoPainter.methods.getAmountToBurn().call(),
      "ether"
    );
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

      let response = null;

      try {
        const getIPFS = await fetch(tokenURI, { signal: controller.signal });
        response = await getIPFS.json();
      } catch (e) {
        const text = await this.algoPainter.methods
          .getTokenStringConfigParameter(0, tokenIndex, 1)
          .call();
        const inspiration = (
          await this.algoPainter.methods
            .getTokenUint256ConfigParameter(0, tokenIndex, 0)
            .call()
        ).toString();
        const probability =
          parseInt(
            (
              await this.algoPainter.methods
                .getTokenUint256ConfigParameter(0, tokenIndex, 3)
                .call()
            ).toString()
          ) / 10;
        const place = (
          await this.algoPainter.methods
            .getTokenUint256ConfigParameter(0, tokenIndex, 4)
            .call()
        ).toString();
        const useRandom = (
          await this.algoPainter.methods
            .getTokenBooleanConfigParameter(0, tokenIndex, 2)
            .call()
        ).toString();

        const image = `https://gwei.algopainter.art/?text=${encodeURI(
          text
        )}&inspiration=${inspiration}&useRandom=${useRandom}&probability=${probability}&wallType=${place}`;

        response = {
          image,
          text,
          inspiration,
          useRandom,
          probability,
          place,
          description: "Recovered",
          amount: "300",
          createdAt: "N/A",
          mintedBy: account
        };
      }

      return {
        status: 200,
        code: "SUCCESS",
        response: {
          ...response,
          owner: account,
          tokenId: tokenIndex
        }
      };
    } catch (error) {
      return {
        status: 409,
        code: "NOT_LOAD",
        response: {}
      };
    }
  }

  async getCurrentAmount() {
    const minimumAmount = await this.algoPainter.methods
      .getCurrentAmount(await this.getPaintingsCount())
      .call();
    const ether = parseFloat(this.weiToEther(minimumAmount));

    return ether;
  }

  async getPainting(index) {
    try {
      const tokenURI = await this.tokenURI(index);

      const controller = new AbortController();
      setTimeout(() => controller.abort(), 3000);

      let response = null;

      const owner = await this.algoPainter.methods.ownerOf(index).call();

      try {
        console.log({ index, tokenURI });
        const getIPFS = await fetch(tokenURI, { signal: controller.signal });
        response = await getIPFS.json();
      } catch (e) {
        console.log({ error: 1, index, tokenURI });
        const text = await this.algoPainter.methods
          .getTokenStringConfigParameter(0, index, 1)
          .call();
        const inspiration = (
          await this.algoPainter.methods
            .getTokenUint256ConfigParameter(0, index, 0)
            .call()
        ).toString();
        const probability =
          parseInt(
            (
              await this.algoPainter.methods
                .getTokenUint256ConfigParameter(0, index, 3)
                .call()
            ).toString()
          ) / 10;
        const place = (
          await this.algoPainter.methods
            .getTokenUint256ConfigParameter(0, index, 4)
            .call()
        ).toString();
        const useRandom = (
          await this.algoPainter.methods
            .getTokenBooleanConfigParameter(0, index, 2)
            .call()
        ).toString();

        const image = `https://gwei.algopainter.art/?text=${encodeURI(
          text
        )}&inspiration=${inspiration}&useRandom=${useRandom}&probability=${probability}&wallType=${place}`;

        response = {
          image,
          text,
          inspiration,
          useRandom,
          probability,
          place,
          description: "Recovered",
          amount: "300",
          createdAt: "N/A",
          mintedBy: owner
        };
      }

      return {
        status: 200,
        code: "SUCCESS",
        response: {
          ...response,
          owner: owner,
          tokenId: index
        }
      };
    } catch (error) {
      console.log(error);
      return {
        status: 409,
        code: "NOT_LOAD",
        response: {}
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

  async checkIfAvailable({ inspiration, text, useRandom, probability }) {
    const hash = await this.algoPainter.methods
      .hashData(inspiration, text, useRandom, probability)
      .call();

    const tokenId = await this.algoPainter.methods.getTokenByHash(hash).call();

    return tokenId.toString() === "0";
  }

  async mint(
    { inspiration, text, useRandom, probability, place, amount, tokenURI },
    account,
    cb
  ) {
    if (
      !(await this.checkIfAvailable({
        inspiration,
        text,
        useRandom,
        probability
      }))
    ) {
      throw {
        status: 409,
        code: "PAINTING_ALREADY_REGISTERED"
      };
    }

    const from = account;
    const nonce = window.web3.utils.toHex(
      await window.web3.eth.getTransactionCount(account)
    );
    const to = this.contractAddress;

    amount = this.etherToWei(amount);

    const txObject = {
      from,
      nonce,
      value: 0,
      to,
      data: this.algoPainter.methods
        .mint(
          inspiration,
          text,
          useRandom,
          probability,
          place,
          amount,
          tokenURI
        )
        .encodeABI()
    };

    return new Promise((resolve, reject) => {
      window.web3.eth
        .sendTransaction(txObject)
        .on("transactionHash", resolve)
        .on("confirmation", function(confirmationNumber, receipt) {
          cb({
            receipt,
            confirmationNumber
          });
        })
        .on("error", reject);
    });
  }
}
