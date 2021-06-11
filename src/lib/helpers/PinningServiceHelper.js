const axios = require("axios").default;

export default class PinningServiceHelper {
  static async pinFile(name, collection, path) {
    const endpoint = `${process.env.VUE_APP_MS_IPFS_PINNER}?name=${encodeURI(
      name
    )}&collection=${encodeURI(collection)}&path=${escape(encodeURI(path))}`;

    console.log({ endpoint });
    const response = await axios.get(endpoint);
    return response.data;
  }

  static async pinJSON(data) {
    console.log({ url: process.env.VUE_APP_MS_IPFS_PINNER, data });
    const response = await axios.post(process.env.VUE_APP_MS_IPFS_PINNER, data);
    return response.data;
  }
}
