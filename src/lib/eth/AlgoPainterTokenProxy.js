import AlgoPainterToken from "./AlgoPainterToken.json";
import { ethers } from "ethers";
import store from "@/store";
import BigNumber from "bignumber.js";

export default class AlgoPainterTokenProxy {
  constructor(contractAddress) {
    this.contractAddress =
      contractAddress || store.getters["user/contractAddress"];
    this.algoPainter = new window.web3.eth.Contract(
      AlgoPainterToken,
      this.contractAddress
    );
  }

  balanceOf(account) {
    return this.algoPainter.methods.balanceOf(account).call();
  }

  async hasAllowance(owner, spender) {
    const allowance = await this.allowance(owner, spender);
    const bn = new BigNumber(allowance);
    return bn.gt(0);
  }

  allowance(owner, spender) {
    return this.algoPainter.methods.allowance(owner, spender).call();
  }

  approve(from, spender) {
    return this.algoPainter.methods
      .approve(spender, ethers.constants.MaxUint256)
      .send({
        from
      });
  }
}
