import Collections from "@/data/Collections.json";

export default class CollectionController {
  async getCollections() {
    return [].concat(Collections);
  }

  async getCollectionById(id) {
    return Collections.find(c => c.id === id);
  }

  async getContract(network, id) {
    const collection = await this.getCollectionById(id);

    return new window.web3.eth.Contract(
      collection.contract.abi,
      collection.contract.address[network.id]
    );
  }

  async getMintMethod(network, id) {
    const contract = await this.getContract(network, id);
    return contract.methods.mint;
  }

  async getTotalSupply(network, id) {
    const contract = await this.getContract(network, id);
    return contract.methods.totalSupply().call();
  }

  async getAvailableSupply(network, id) {
    const collection = await this.getCollectionById(id);

    return (
      collection.contract.maxTotalSupply -
      (await this.getTotalSupply(network, id))
    );
  }

  async getCurrentAmount(network, id) {
    const contract = await this.getContract(network, id);
    return (
      await contract.methods
        .getCurrentAmount(id, await this.getTotalSupply(network, id))
        .call()
    ).toString();
  }

  async getFormattedServiceFee(network, id) {
    const contract = await this.getContract(network, id);

    const serviceFee = (
      await contract.methods.getServiceFee().call()
    ).toString();

    return parseFloat((serviceFee / 10000).toFixed(4)) * 100;
  }

  async getFormattedCurrentAmount(network, id) {
    return window.web3.utils.fromWei(
      await this.getCurrentAmount(network, id),
      "ether"
    );
  }
}
