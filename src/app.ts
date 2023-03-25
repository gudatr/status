import { Router } from "uws-router";
import { Environment } from "./services/Environment";
import ConfigService from './services/ConfigService';
import FrontendService from './services/FrontendService';
import { CatchExceptionMiddleware } from "./middleware/CatchExceptionMiddleware";
import { ConfigAuthMiddleware } from "./middleware/ConfigAuthMiddleware";
import StatusService from './services/StatusService';

let router = new Router(Environment.ssl, {
    key_file_name: Environment.ssl_key,
    cert_file_name: Environment.ssl_cert
});

process.on('uncaughtException', (err) => {
    console.log(err);
});

router.middleware(CatchExceptionMiddleware, () => {
    let frontendService = new FrontendService();
    router.group('frontend', () => {
        router.endpoint('get', frontendService.getIntervalData, 'interval');
        router.endpoint('get', frontendService.getIntervalData, 'overview');
    }, frontendService);

    let configService = new ConfigService();
    router.group('config', () => {
        router.middleware(ConfigAuthMiddleware, () => {
            router.endpoint('get', configService.authTest, 'auth');
            router.endpoint('get', configService.getPosts, 'posts/index');
            router.endpoint('get', configService.getStatusEndpoints, 'status-endpoints/index');
            router.endpoint('get', configService.getStatusGroups, 'status-groups/index');

            router.endpoint('post', configService.updatePost, 'posts/update');
            router.endpoint('post', configService.updateStatusEndpoint, 'status-endpoints/update');
            router.endpoint('post', configService.updateStatusGroup, 'status-groups/update');

            router.endpoint('del', configService.updatePost, 'posts/update');
            router.endpoint('del', configService.updateStatusEndpoint, 'status-endpoints/update');
            router.endpoint('del', configService.updateStatusGroup, 'status-groups/update');
        });
    }, configService);

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

let statusService = new StatusService();
setInterval(() => { statusService.fetchStatus(); })


router.listen(Environment.host, Environment.port, (listen) => {
    if (listen) {
        console.log(`Application is listening on host ${Environment.host}, port: ${Environment.port}`);
    } else {
        console.log(`Application failed to listen on host ${Environment.host}, port: ${Environment.port}`);
    }
});


