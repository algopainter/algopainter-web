const axios = require("axios").default;

export default class HttpHelper {
  static async getBase64(path) {
    const response = await axios.get(path, {
      responseType: "arraybuffer"
    });
    return Buffer.from(response.data, "binary").toString("base64");
  }

  static async get(path) {
    const response = await axios.get(path);
    response.data;
  }
}
