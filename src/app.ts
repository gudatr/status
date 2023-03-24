import { Router } from "uws-router";
import { Environment } from "./services/Environment";
import ConfigService from './services/ConfigService';
import FrontendService from './services/FrontendService';

let router = new Router(Environment.ssl, {
    key_file_name: Environment.ssl_key,
    cert_file_name: Environment.ssl_cert
});

process.on('uncaughtException', (err) => {
    console.log(err);
});

router.group('frontend', () => {
    router.endpoint('get', FrontendService.getIntervalData, 'interval');

    router.endpoint('get', FrontendService.getIntervalData, 'overview');
});

router.group('config', () => {
    router.endpoint('get', ConfigService.authTest, 'auth');

    router.endpoint('get', ConfigService.getPosts, 'posts/index');

    router.endpoint('get', ConfigService.getStatusEndpoints, 'status-endpoints/index');

    router.endpoint('get', ConfigService.getStatusGroups, 'status-groups/index');

    router.endpoint('post', ConfigService.updatePost, 'posts/update');

    router.endpoint('post', ConfigService.updateStatusEndpoint, 'status-endpoints/update');

    router.endpoint('post', ConfigService.updateStatusGroup, 'status-groups/update');
});

router.group('files', () => {
    router.serveFile('./frontend/config.html', 'config.html', 60000);

    router.serveFile('./frontend/history.html', 'history.html', 60000);

    router.serveFile('./frontend/status.html', 'status.html', 60000);

    router.serveFile('./frontend/logo.png', 'logo.png', 60000);

    router.serveFile('./frontend/style.css', 'style.css', 60000);

    router.serveFile('./frontend/translation.js', 'translation.js', 60000);

    router.serveFile('./frontend/frontend.js', 'frontend.js', 60000);
});


router.listen(Environment.host, Environment.port, (listen) => {
    if (listen) {
        console.log(`Application is listening on host ${Environment.host}, port: ${Environment.port}`);
    } else {
        console.log(`Application failed to listen on host ${Environment.host}, port: ${Environment.port}`);
    }
});