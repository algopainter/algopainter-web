import Painting from "@/lib/Painting";

export const paint = async (collection, paintingInfo, rawImage) => {
  const painting = new Painting();
  const result = await painting.paint(
    collection,
    paintingInfo,
    rawImage,
    status => {
      console.log(new Date(), { status });
    }
  );

  let encodedImage = "";

  await result.getBase64("image/png", (err, res) => {
    encodedImage = res;
  });

  return encodedImage;
};
