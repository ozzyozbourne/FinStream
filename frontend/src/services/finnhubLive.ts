export function connectLiveFinnhub(
  symbol: string,
  onTrade: (trade: any) => void
) {
  const ws = new WebSocket("ws://localhost:3001");
  ws.binaryType = "blob";

  ws.onopen = () => {
    console.log("Frontend connected to live proxy, subscribing to", symbol);
    ws.send(
      JSON.stringify({
        type: "subscribe",
        symbol,
      })
    );
  };

  ws.onmessage = async (event) => {
    let jsonString: string;

    if (event.data instanceof Blob) {
      jsonString = await event.data.text(); // Blob → string
    } else {
      jsonString = event.data as string; // already string
    }

    const msg = JSON.parse(jsonString);

    if (msg.type === "trade") {
      msg.data.forEach((trade: any) => onTrade(trade));
    }
  };

  ws.onclose = () => {
    console.log("WS closed for", symbol);
  };

  ws.onerror = (e) => {
    console.error("WS error for", symbol, e);
  };

  return ws;
}
