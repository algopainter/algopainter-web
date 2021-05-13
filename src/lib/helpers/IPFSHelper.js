let defaultNode;
const axios = require("axios").default;

export default class IPFSHelper {
  static async connect() {
    if (!defaultNode) {
      defaultNode = await Ipfs.create();
    }
  }

  static getNode() {
    return defaultNode;
  }

  static async add(data) {
    const response = await axios.post(process.env.VUE_APP_MS_IPFS_PINNER, data);

    return {
      path: response.data.ipfsHash
    };
  }

  static async read(path) {
    const node = IPFSHelper.getNode();
    const stream = node.cat(path);
    let data = "";

    for await (const chunk of stream) {
      data += chunk.toString();
    }

    return data;
  }
}
