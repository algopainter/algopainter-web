import AlgoPainterMasterChefV2 from "./AlgoPainterMasterChefV2.json";
import AlgoPainterTokenProxy from "./AlgoPainterTokenProxy";
import Farms from "@/data/Farms.json";

export default class AlgoPainterMasterChefV2Proxy {
  constructor() {}

  getContract(contractAddress) {
    return new window.web3.eth.Contract(
      AlgoPainterMasterChefV2,
      contractAddress
    );
  }

  deposit(networkId, account, pid, amount) {
    const farm = Farms.find(farm => farm.pid === pid);
    const contract = this.getContract(farm.contractAddress[networkId]);

    return contract.methods
      .deposit(pid, window.web3.utils.toWei(amount.toString()))
      .send({ from: account });
  }

  withdraw(networkId, account, pid, amount) {
    const farm = Farms.find(farm => farm.pid === pid);
    const contract = this.getContract(farm.contractAddress[networkId]);

    return contract.methods
      .withdraw(pid, window.web3.utils.toWei(amount.toString()))
      .send({ from: account });
  }

  async getFarms(networkId, account) {
    const farms = Farms;

    return Promise.all(
      farms.map(async item => {
        const tokenProxy = new AlgoPainterTokenProxy(
          item.tokenAddress[networkId]
        );
        const contract = this.getContract(item.contractAddress[networkId]);

        const pendingTokens = await contract.methods
          .pendingTokens(item.pid, account)
          .call();

        const poolInfo = await contract.methods.poolInfo(item.pid).call();
        const userInfo = await contract.methods
          .userInfo(item.pid, account)
          .call();

        console.log({ userInfo, poolInfo });

        item.multiplier = parseFloat(poolInfo.allocPoint) / 1000;
        item.depositFee = parseFloat(poolInfo.depositFeeBP);

        item.pendingTokens = parseFloat(
          window.web3.utils.fromWei(pendingTokens.toString(), "ether")
        );

        item.stakedAmount = parseFloat(
          window.web3.utils.fromWei(userInfo.amount.toString(), "ether")
        );

        item.userCurrentBalance = parseFloat(
          window.web3.utils.fromWei(
            await tokenProxy.balanceOf(account),
            "ether"
          )
        );

        return item;
      })
    );
  }
}
