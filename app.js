'use strict';
require('dotenv').config()
let constant = "./config/config.js";
process.config.global_config = require(constant);

let express         = require('express'),
    app             = express(),
    cors            = require("cors"),
    responseHandler = require('./modules/middleware/responseHandler'),
    multer          = require('multer'),
    bodyParser      = require('body-parser'),
    swaggerJSDoc    = require("swagger-jsdoc"),
    i18next         = require('i18next'),    
    i18nFsBackend   = require('i18next-fs-backend'),
    i18nMiddleware = require('i18next-http-middleware'),
    swaggerUi = require("swagger-ui-express");
    
process.env.TZ = "Africa/Gamibia";
console.log('Initializing Server.',new Date().toString() );
console.log("Environment: " +process.env.NODE_ENV);
console.log("Loading Environment Constant: " +constant);

i18next.use(i18nFsBackend).use(i18nMiddleware.LanguageDetector).init({
  fallbackLng: 'en',
  backend: {
    loadPath: 'locales/{{lng}}/translation.json'
  }
});

app.use(cors());
app.use(i18nMiddleware.handle(i18next));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization,API-KEY");
    next();
});


app.use(bodyParser.urlencoded({
	limit: '50mb',
    extended: true,
}));
app.use(bodyParser.json({limit: '50mb'}));

const docOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'YoApp',
            version: '1',
        },
        servers: [{
          url: process.config.global_config.base_url,
          description: 'Development server',
        }],
        components: {
          securitySchemes: {
            ApiKeyAuth: {
              type: "apiKey",
              in: "header",     
              name: "x-auth-token"
            }
          }
        },
        security: [{
          ApiKeyAuth: []
        }]
    },
    apis: ['./modules/controllers/*.js'],
};
const swaggerSpec = swaggerJSDoc(docOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
 
app.use('/public', express.static(__dirname + '/public'));
app.use('/uploads', express.static(__dirname + '/uploads'));

app.disable('x-powered-by');

console.log('Setting up success listener.');
app.use(responseHandler.onSuccess);

console.log('Setting up routes.');
require('./routes')(app);

console.log('Plugging the error leaks.');
app.use(responseHandler.onError);

module.exports = app;

console.log('Ready for requests.');



let port = Number(process.env.PORT || process.config.global_config.server.port);
let server = app.listen(port, function() {
    console.log('server listening on port ' + server.address().port);
});
// initialNotification.sendAppRestartNotifications();



server.timeout = process.config.global_config.server.networkCallTimeout;

/*let merchantStripe = require('./modules/helpers/stripe');
merchantStripe.onBoardMerchant({});*/





