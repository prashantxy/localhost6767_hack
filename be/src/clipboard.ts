import clipboard from "clipboardy";

let lastClipboard = "";

export async function watchClipboard(
  callback: (text: string) => void
) {

  setInterval(async () => {

    try {

      const text = await clipboard.read();


      if (!text.trim()) {
        return;
      }


      if (text === lastClipboard) {
        return;
      }


      lastClipboard = text;


      callback(text);


    } catch (err) {

      console.error(
        "Clipboard error",
        err
      );

    }

  }, 1000);

}