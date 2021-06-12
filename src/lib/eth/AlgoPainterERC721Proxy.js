import AlgoPainterGweiItem from "./AlgoPainterGweiItem.json";

const axios = require("axios").default.create({
  timeout: 3000
});

export default class AlgoPainterERC721Proxy {
  constructor(collection, contractAddress) {
    this.collection = collection;
    this.contractAddress = contractAddress;
    this.erc721 = new window.web3.eth.Contract(
      AlgoPainterGweiItem,
      this.contractAddress
    );
  }

  async getTotalSupply() {
    return parseInt(await this.erc721.methods.totalSupply().call());
  }

  getBalanceOf(account) {
    return this.erc721.methods.balanceOf(account).call();
  }

  async restoreGweiItem(index) {
    const text = await this.erc721.methods
      .getTokenStringConfigParameter(0, index, 1)
      .call();
    const inspiration = (
      await this.erc721.methods
        .getTokenUint256ConfigParameter(0, index, 0)
        .call()
    ).toString();
    const probability =
      parseInt(
        (
          await this.erc721.methods
            .getTokenUint256ConfigParameter(0, index, 3)
            .call()
        ).toString()
      ) / 10;
    const place = (
      await this.erc721.methods
        .getTokenUint256ConfigParameter(0, index, 4)
        .call()
    ).toString();
    const useRandom = (
      await this.erc721.methods
        .getTokenBooleanConfigParameter(0, index, 2)
        .call()
    ).toString();

    const image = `https://gwei.algopainter.art/?text=${encodeURI(
      text
    )}&inspiration=${inspiration}&useRandom=${useRandom}&probability=${probability}&wallType=${place}`;

    return {
      image,
      text,
      inspiration,
      useRandom,
      probability,
      place,
      description: "Recovered"
    };
  }

  async getItem(index, account) {
    console.log(`Getting info about token ${index}`);

    if (account) {
      //updating to the global index
      index = await this.erc721.methods
        .tokenOfOwnerByIndex(account, index - 1)
        .call();
    }

    const tokenURI = await this.erc721.methods.tokenURI(index).call();
    const owner = await this.erc721.methods.ownerOf(index).call();

    try {
      const url =
        tokenURI.indexOf("http://") >= 0 || tokenURI.indexOf("https://") >= 0
          ? tokenURI
          : `https://ipfs.io/ipfs/${tokenURI}`;
      const result = await axios.get(url);

      return {
        ...result.data,
        owner: owner,
        tokenId: index
      };
    } catch (e) {
      if (this.collection.id === 0) {
        const result = await this.restoreGweiItem(index);
        return {
          ...result,
          owner: owner,
          tokenId: index
        };
      } else {
        return {
          isError: true,
          error: e,
          owner: owner,
          tokenId: index
        };
      }
    }
  }

  async getItems(pageLimit, page, account) {
    const count = !account
      ? await this.getTotalSupply()
      : await this.getBalanceOf(account);
    const start = count - pageLimit * page;

    const promises = [];

    for (let i = start; i > start - pageLimit && i > 0; i--) {
      promises.push(this.getItem(i, account));
    }

    return Promise.all(promises);
  }
}
