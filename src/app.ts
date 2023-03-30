import { Router } from "uws-router";
import { Environment } from "./services/Environment";
import ConfigController from './controllers/ConfigController';
import FrontendController from './controllers/FrontendController';
import { CatchExceptionMiddleware } from "./middleware/CatchExceptionMiddleware";
import { ConfigAuthMiddleware } from "./middleware/ConfigAuthMiddleware";
import StatusService from './services/StatusService';
import Setup from "./database/Setup";
import TableSetup from "./database/InitialSetup";

(async () => {
    let app = new Router(Environment.ssl, {
        key_file_name: Environment.ssl_key,
        cert_file_name: Environment.ssl_cert
    });

    let pool = await Setup(Environment.postgres.threads);

    if (!await TableSetup(pool)) return;

    process.on('uncaughtException', (err) => {
        console.log(err);
    });

    app.middleware(CatchExceptionMiddleware, () => {
        let frontend = new FrontendController(pool);
        app.group('frontend', () => {
            app.endpoint('get', frontend.getIntervalData, 'interval');
            app.endpoint('get', frontend.getIntervalData, 'overview');
        }, frontend);

        let config = new ConfigController(pool);
        app.group('config', () => {
            app.middleware(ConfigAuthMiddleware, () => {
                app.endpoint('get', config.authTest, 'auth');
                app.endpoint('get', config.getPosts, 'posts/index');
                app.endpoint('get', config.getStatusEndpoints, 'status-endpoints/index');
                app.endpoint('get', config.getStatusGroups, 'status-groups/index');

                app.endpoint('post', config.updatePost, 'posts/update');
                app.endpoint('post', config.updateStatusEndpoint, 'status-endpoints/update');
                app.endpoint('post', config.updateStatusGroup, 'status-groups/update');

                app.endpoint('del', config.updatePost, 'posts/delete');
                app.endpoint('del', config.updateStatusEndpoint, 'status-endpoints/delete');
                app.endpoint('del', config.updateStatusGroup, 'status-groups/delete');
            });
        }, config);

        app.group('app', () => {
            app.serveFile('./src/frontend/config.html', 'config', 0);
            app.serveFile('./src/frontend/history.html', 'history', 0);
            app.serveFile('./src/frontend/status.html', 'status', 0);
        });

        app.group('files', () => {
            app.serveFileRelative('./frontend/logo.png', 'logo.png');
            app.serveFileRelative('./frontend/style.css', 'style.css');
            app.serveFileRelative('./frontend/translation.js', 'translation.js');
            app.serveFileRelative('./frontend/frontend.js', 'frontend.js');
        });
    });

    let statusService = new StatusService(pool);
    setInterval(() => { statusService.fetchStatus(); }, Environment.status.interval);


    app.listen(Environment.host, Environment.port, (listen) => {
        if (listen) {
            console.log(`Application is listening on host ${Environment.host}, port: ${Environment.port}`);
            console.log(app.getRoutes());
        } else {
            console.log(`Application failed to listen on host ${Environment.host}, port: ${Environment.port}`);
        }
    });

})();