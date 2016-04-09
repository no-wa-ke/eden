/**
 * Created by Awesome on 2/23/2016.
 */

// use strict
'use strict';

// require dependencies
var co     = require ('co');
var crypto = require('crypto');

// require local dependencies
var config = require(global.appRoot + '/config');
var model  = require(global.appRoot + '/bin/bundles/core/model');
var acl    = require(global.appRoot + '/bin/bundles/user/model/acl');

/**
 * create user model
 */
class user extends model {
    /**
     * construct example model
     *
     * @param a
     * @param b
     */
    constructor(a, b) {
        super(a, b);

        // set model location
        this._modelLocation = __filename.replace (global.appRoot, '');
    }

    /**
     * check ACL before save
     */
    configure() {
        this.before('create', 'checkAcl');
    }

    /**
     * authenticates user
     *
     * @param pass
     * @returns {Promise}
     */
    authenticate(pass) {
        var that = this;

        return new Promise((resolve, reject) => {
            // compare hash with password
            var hash  = that.get('hash');
            var check = crypto
                .createHmac('sha256', config.secret)
                .update(pass)
                .digest('hex');

            // check if password correct
            if (check !== hash) {
                return resolve({
                    'error' : true,
                    'mess'  : 'Incorrect password'
                });
            }

            // password accepted
            resolve({
                'error' : false
            });
        });
    }

    /**
     * check ACL
     *
     * @param next
     */
    checkAcl(next) {
        var that = this;
        
        co(function * () {
            var arr  = [];

            // check default acl
            var def = yield acl.where({
                'name' : config.acl.default.name
            }).findOne();
            // check default acl exists
            if (!def) {
                def = new acl(config.acl.default);
                yield def.save();
            }
            // set user acl
            arr.push(def);

            // check first
            var count = yield user.count();
            if (!count) {
                // check first acl
                var adm = yield acl.where({
                    'name' : config.acl.first.name
                }).findOne();
                // check first acl exists
                if (!adm) {
                    adm = new acl(config.acl.first);
                    yield adm.save();
                }
                // set user acl
                arr.push(adm);
            }

            // set acl
            that.set('acl', arr);

            // run next
            yield next;
        });
    }

    /**
     * sanitises user
     *
     * @return {*}
     */
    sanitise () {
        return {
            'id'       : this.get('_id').toString(),
            'balance'  : this.get('balance') || 0,
            'username' : this.get('username'),
            'avatar'   : this.get('avatar')
        };
    }
}

/**
 * export user model
 * @type {user}
 */
module.exports = user;