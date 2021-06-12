import Jimp from "jimp";

export const STEP_LOADING_BACKGROUND = 1;
export const STEP_LOADING_EXPRESSION = 2;
export const STEP_LOADING_SHADOW = 3;
export const STEP_LOADING_WIREFRAME = 4;
export const STEP_LOADING_INNERCOLOR = 5;
export const STEP_LOADING_OVERLAY = 6;
export const STEP_COMPOSITING_SHADOW = 7;
export const STEP_COMPOSITING_EXPRESSION = 8;
export const STEP_COMPOSITING_WIREFRAME = 9;
export const STEP_COMPOSITING_INNERCOLOR = 10;
export const STEP_COMPOSITING_OVERLAY = 11;
export const STEP_FLIP = 12;
export const STEP_BUFFERING = 13;

export default class Painting {
  parseInfo(collection, paintingInfo, originalData) {
    let data = String(originalData);

    for (const parameter of collection.parameters) {
      const key = "${" + parameter.name + "}";
      let value = paintingInfo[parameter.name];

      if (value === null || value === undefined) {
        value = parameter.defaultValue;
      }

      data = data.replace(key, value);
    }

    return data;
  }

  async paint(collection, paintingInfo, rawImage, cb) {
    const parsedPaintingInfo = Object.assign({}, paintingInfo);

    for (const parameter of collection.parameters) {
      let value = paintingInfo[parameter.name];

      if (value === null || value === undefined) {
        parsedPaintingInfo[parameter.name] = parameter.defaultValue;
      } else {
        parsedPaintingInfo[parameter.name] = value;
      }
    }

    const {
      innerColorHue,
      overlay,
      overlayHue,
      useShadow,
      shadowHue,
      useWireframe,
      wireframeHue,
      useWireframeBlend,
      wireframeBlendStyle,
      flip
    } = parsedPaintingInfo;

    const path = rawImage
      ? collection.layers.rawBaseUrl
      : collection.layers.baseUrl;

    cb(STEP_LOADING_BACKGROUND);
    const backgroundFile = await Jimp.read(
      path +
        this.parseInfo(
          collection,
          paintingInfo,
          collection.layers.names.background
        )
    );
    cb(STEP_LOADING_EXPRESSION);
    const expressionFile = await Jimp.read(
      path +
        this.parseInfo(
          collection,
          paintingInfo,
          collection.layers.names.expression
        )
    );
    cb(STEP_LOADING_SHADOW);
    const shadowFile = useShadow
      ? await Jimp.read(
          path +
            this.parseInfo(
              collection,
              paintingInfo,
              collection.layers.names.shadow
            )
        )
      : null;
    cb(STEP_LOADING_WIREFRAME);
    const wireframeFile = useWireframe
      ? await Jimp.read(
          path +
            this.parseInfo(
              collection,
              paintingInfo,
              collection.layers.names.wireframe
            )
        )
      : null;
    cb(STEP_LOADING_INNERCOLOR);
    const innerColorFile = await Jimp.read(
      path +
        this.parseInfo(
          collection,
          paintingInfo,
          collection.layers.names.innercolor
        )
    );

    cb(STEP_LOADING_OVERLAY);
    const overlayFile =
      overlay !== "0"
        ? await Jimp.read(
            path +
              this.parseInfo(
                collection,
                paintingInfo,
                collection.layers.names.overlay
              )
          )
        : null;

    cb(STEP_COMPOSITING_SHADOW);
    if (shadowFile) {
      shadowFile.color([{ apply: "hue", params: [parseInt(shadowHue) * 36] }]);

      backgroundFile.composite(shadowFile, 0, 0);
    }

    cb(STEP_COMPOSITING_EXPRESSION);
    backgroundFile.composite(expressionFile, 0, 0);

    cb(STEP_COMPOSITING_WIREFRAME);
    if (wireframeFile) {
      wireframeFile.color([
        { apply: "hue", params: [parseInt(wireframeHue) * 36] }
      ]);

      // options
      // Jimp.BLEND_ADD
      // Jimp.BLEND_DARKEN
      // Jimp.BLEND_DIFFERENCE
      // Jimp.BLEND_EXCLUSION
      // Jimp.BLEND_HARDLIGHT
      // Jimp.BLEND_LIGHTEN
      // Jimp.BLEND_MULTIPLY

      if (useWireframeBlend) {
        backgroundFile.composite(wireframeFile, 0, 0, {
          mode: Jimp[wireframeBlendStyle],
          opacityDest: 1,
          opacitySource: 1
        });
      } else {
        backgroundFile.composite(wireframeFile, 0, 0);
      }
    }

    cb(STEP_COMPOSITING_INNERCOLOR);
    innerColorFile.color([
      { apply: "hue", params: [parseInt(innerColorHue) * 36] }
    ]);
    backgroundFile.composite(innerColorFile, 0, 0);

    if (overlayFile) {
      overlayFile.color([
        { apply: "hue", params: [parseInt(overlayHue) * 36] }
      ]);

      backgroundFile.composite(overlayFile, 0, 0, {
        mode: Jimp.BLEND_LIGHTEN,
        opacityDest: 1,
        opacitySource: 1
      });
    }

    cb(STEP_FLIP);
    if (flip) {
      backgroundFile.flip(true, false);
    }

    return backgroundFile;
  }
}
