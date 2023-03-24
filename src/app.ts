import { Router } from "uws-router";
import { Environment } from "./services/Environment";

let router = new Router(Environment.ssl, {
    key_file_name: Environment.ssl_key,
    cert_file_name: Environment.ssl_cert
});

process.on('uncaughtException', (err) => {
    console.log(err);
});

router.group('frontend', () => {

});

router.group('backend', () => {

});

router.group('files', () => {
});


router.listen(Environment.host, Environment.port, (listen) => {
    if (listen) {
        console.log(`Application is listening on host ${Environment.host}, port: ${Environment.port}`);
    } else {
        console.log(`Application failed to listen on host ${Environment.host}, port: ${Environment.port}`);
    }
});