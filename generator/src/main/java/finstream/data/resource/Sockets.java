package finstream.data.resource;

import io.quarkus.logging.Log;
import io.quarkus.websockets.next.OnClose;
import io.quarkus.websockets.next.OnOpen;
import io.quarkus.websockets.next.WebSocket;
import io.quarkus.websockets.next.WebSocketConnection;
import jakarta.enterprise.context.SessionScoped;

import java.io.Serializable;

@WebSocket(path = "data")
@SessionScoped
class Sockets implements Serializable {

    @OnOpen
    void onOpen(WebSocketConnection webSocketConnection){
        Log.infof("Connection opened -> %s", webSocketConnection.id());
    }

    @OnClose
    void onClose(WebSocketConnection webSocketConnection){
        Log.infof("Connection closed -> %s", webSocketConnection.id());
    }

}
