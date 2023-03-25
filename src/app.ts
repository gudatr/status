import { Router } from "uws-router";
import { Environment } from "./services/Environment";
import ConfigController from './controllers/ConfigController';
import FrontendController from './controllers/FrontendController';
import { CatchExceptionMiddleware } from "./middleware/CatchExceptionMiddleware";
import { ConfigAuthMiddleware } from "./middleware/ConfigAuthMiddleware";
import StatusService from './services/StatusService';

let app = new Router(Environment.ssl, {
    key_file_name: Environment.ssl_key,
    cert_file_name: Environment.ssl_cert
});

process.on('uncaughtException', (err) => {
    console.log(err);
});

app.middleware(CatchExceptionMiddleware, () => {
    let frontendController = new FrontendController();
    app.group('frontend', () => {
        app.endpoint('get', frontendController.getIntervalData, 'interval');
        app.endpoint('get', frontendController.getIntervalData, 'overview');
    }, frontendController);

    let configController = new ConfigController();
    app.group('config', () => {
        app.middleware(ConfigAuthMiddleware, () => {
            app.endpoint('get', configController.authTest, 'auth');
            app.endpoint('get', configController.getPosts, 'posts/index');
            app.endpoint('get', configController.getStatusEndpoints, 'status-endpoints/index');
            app.endpoint('get', configController.getStatusGroups, 'status-groups/index');

            app.endpoint('post', configController.updatePost, 'posts/update');
            app.endpoint('post', configController.updateStatusEndpoint, 'status-endpoints/update');
            app.endpoint('post', configController.updateStatusGroup, 'status-groups/update');

            app.endpoint('del', configController.updatePost, 'posts/update');
            app.endpoint('del', configController.updateStatusEndpoint, 'status-endpoints/update');
            app.endpoint('del', configController.updateStatusGroup, 'status-groups/update');
        });
    }, configController);

    app.group('files', () => {
        app.serveFileRelative('./frontend/config.html', 'config.html');
        app.serveFileRelative('./frontend/history.html', 'history.html');
        app.serveFileRelative('./frontend/status.html', 'status.html');
        app.serveFileRelative('./frontend/logo.png', 'logo.png');
        app.serveFileRelative('./frontend/style.css', 'style.css');
        app.serveFileRelative('./frontend/translation.js', 'translation.js');
        app.serveFileRelative('./frontend/frontend.js', 'frontend.js');
    });
});

let statusService = new StatusService();
setInterval(() => { statusService.fetchStatus(); })


app.listen(Environment.host, Environment.port, (listen) => {
    if (listen) {
        console.log(`Application is listening on host ${Environment.host}, port: ${Environment.port}`);
    } else {
        console.log(`Application failed to listen on host ${Environment.host}, port: ${Environment.port}`);
    }
});


