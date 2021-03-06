/**
 * Create initial config Object
 *
 * @type {Object}
 */
var config = {};


/**
 * Set application page information
 */

// Set application title
config.title  = 'EdenJS';

// Set application domain
config.domain = 'edenjs.com';

// Set application version
config.version = '0.01';

// Set logo
config.logo = '/public/assets/images/logo.svg';


/**
 * Set application server configuration
 */

// Set app environment
config.environment = 'dev';

// Set starting port
config.port = 1337;

// set amount of express threads to run
// setting this as null will count your CPU cores
config.expressThreads = 1;

// set amount of compute threads to run
// setting this as null will use 1 compute thread
// compute threads are threads used for backend processes they do not run
// the express application, but do run all daemons
config.computeThreads = 1;

// Websocket configuration
config.socket = {
  'url'    : '//' + config.domain + (config.environment === 'dev' ? ':' + config.port : ''),
  'params' : {
    'reconnect' : true
  }
};

// Redis configuration
config.redis = {
  'host' : 'localhost',
  'port' : 6379
};

// i18n configuration
config.i18n = {
  'cache' : {
    'prefix'         : 'lang_',
    'enabled'        : true,
    'versions'       : {},
    'expirationTime' : 7 * 24 * 60 * 60 * 1000,
  },
  'detection' : {
    'caches'            : ['cookie'],
    'lookupCookie'      : 'lang',
    'lookupQuerystring' : 'lang'
  },
  'defaultNS'    : 'default',
  'fallbackNS'   : 'default',
  'fallbackLng'  : 'en-au',
  'lowerCaseLng' : true
};

// add media dir
config.media = {
  'dir' : 'media'
};


/**
 * Set database configuration
 */

// Set config database object
config.database = {
  // Set dev database
  'dev' : {
    'db'   : config.domain.split ('.')[0],
    'host' : 'localhost'
  },
  // Set live database
  'live' : {
    'db'   : config.domain.split ('.')[0],
    'host' : 'localhost'
  }
};

/**
 * Set email transport configuration
 */

// Set SMTP config email object
config.email = {
  'service' : 'Zoho',
  'auth'    : {
    'user' : 'email@domain.com',
    'pass' : 'supersecretemailpassword'
  }
};

/**
 * Set included files
 */

// Set scss imports
// These are imported into app.min.css by default
config.sass = [
  './node_modules/bootstrap/scss/bootstrap.scss',
  './node_modules/tether/src/css/tether.scss'
];

// Set js imports
// These are imported into app.min.js at the top
config.js = [
  './node_modules/whatwg-fetch/fetch.js',
  './node_modules/promise-polyfill/promise.min.js',
  './node_modules/jquery/dist/jquery.min.js',
  './node_modules/tether/dist/js/tether.min.js',
  './node_modules/bootstrap/dist/js/bootstrap.js'
];


/**
 * Set application session secret
 */

// Secret for crypto
config.secret = 'someStrongSecretHash';

// Secret for session
config.session = {
  'key'    : config.domain.split ('.')[0] + '.session.id',
  'cookie' : {
    // Setting secure to true allows for secure sessions over HTTPS;
    // if you are not using https then sessions will break
    'secure'   : false,
    'httpOnly' : false
  }
};


/**
 * Set default ACL information
 */

// Set acl object
config.acl = {
  // Default acl per user
  'default' : {
    'name'  : 'user',
    'value' : [
      'user.registered'
    ]
  },
  // Default acl for first user (admin)
  'first' : {
    'name'  : 'admin',
    'value' : true
  }
};


/**
 * Set view import functionality
 */

// Create view object
config.view = {
  // Modules will be required at the top of riot's tags.min.js
  'include' : {
    // Include alert module
    'alert'  : 'alert/public/js/bootstrap',
    // Include socket module
    'socket' : 'socket/public/js/bootstrap'
  }
};

/**
 * Set misc settings
 */

// Create log level setting
config.logLevel = 'info';

/**
 * Export config
 *
 * @type {Object}
 */
module.exports = config;
