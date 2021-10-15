import store from "@/store";
import AlgoPainterBidbackPirsJson from "./AlgoPainterBidbackPirsProxy.json";

export default class AlgoPainterBidbackPirsProxy {
    constructor() {
      this.contractAddress = store.getters["user/bidbackPirsContractAddress"];
      this.algoPainter = new window.web3.eth.Contract(
        AlgoPainterBidbackPirsJson,
        this.contractAddress
      );
    }

    setInvestorPirsPercentage(_tokenAddress, _tokenId, _investorPirsPercentage, _from) {
        return this.algoPainter.methods.setInvestorPirsPercentage(_tokenAddress, _tokenId, _investorPirsPercentage).send(_from);
    }
}
  