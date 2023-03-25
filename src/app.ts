import { Router } from "uws-router";
import { Environment } from "./services/Environment";
import ConfigService from './services/ConfigService';
import FrontendService from './services/FrontendService';
import path from "path";
import { CatchExceptionMiddleware } from "./middleware/CatchExceptionMiddleware";
import { ConfigAuthMiddleware } from "./middleware/ConfigAuthMiddleware";

let router = new Router(Environment.ssl, {
    key_file_name: Environment.ssl_key,
    cert_file_name: Environment.ssl_cert
});

process.on('uncaughtException', (err) => {
    console.log(err);
});

router.middleware(CatchExceptionMiddleware, () => {
    router.group('frontend', () => {
        router.endpoint('get', FrontendService.getIntervalData, 'interval');
        router.endpoint('get', FrontendService.getIntervalData, 'overview');
    });

    router.group('config', () => {
        router.middleware(ConfigAuthMiddleware, () => {
            router.endpoint('get', ConfigService.authTest, 'auth');
            router.endpoint('get', ConfigService.getPosts, 'posts/index');
            router.endpoint('get', ConfigService.getStatusEndpoints, 'status-endpoints/index');
            router.endpoint('get', ConfigService.getStatusGroups, 'status-groups/index');

            router.endpoint('post', ConfigService.updatePost, 'posts/update');
            router.endpoint('post', ConfigService.updateStatusEndpoint, 'status-endpoints/update');
            router.endpoint('post', ConfigService.updateStatusGroup, 'status-groups/update');

            router.endpoint('del', ConfigService.updatePost, 'posts/update');
            router.endpoint('del', ConfigService.updateStatusEndpoint, 'status-endpoints/update');
            router.endpoint('del', ConfigService.updateStatusGroup, 'status-groups/update');
        });
    });

    router.group('files', () => {
        router.serveFileRelative('./frontend/config.html', 'config.html');
        router.serveFileRelative('./frontend/history.html', 'history.html');
        router.serveFileRelative('./frontend/status.html', 'status.html');
        router.serveFileRelative('./frontend/logo.png', 'logo.png');
        router.serveFileRelative('./frontend/style.css', 'style.css');
        router.serveFileRelative('./frontend/translation.js', 'translation.js');
        router.serveFileRelative('./frontend/frontend.js', 'frontend.js');
    });
});


router.listen(Environment.host, Environment.port, (listen) => {
    if (listen) {
        console.log(`Application is listening on host ${Environment.host}, port: ${Environment.port}`);
    } else {
        console.log(`Application failed to listen on host ${Environment.host}, port: ${Environment.port}`);
    }
});