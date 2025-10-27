import Keycloak from "keycloak-js";
const keycloak = new Keycloak({
 url: "http://localhost:8080",
 realm: "Finstream_External",
 clientId: "my_client",
});
export default keycloak;