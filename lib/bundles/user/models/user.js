
// require dependencies
const base   = require ('model');
const eden   = require ('eden');
const config = require ('config');
const crypto = require ('crypto');
const socket = require ('socket');

// require models
const acl = model ('acl');

/**
 * create user model
 */
class user extends base {
  /**
   * construct example model
   */
  constructor () {
    // run super
    super (...arguments);

    // bind auth methods
    this.authenticate = this.authenticate.bind (this);

    // bind socket methods
    this.emit     = this.emit.bind (this);
    this.alert    = this.alert.bind (this);
    this.sanitise = this.sanitise.bind (this);
  }

  /**
   * check ACL before save
   */
  configure () {
    // before creation, check acl
    this.before ('create', '_acl');
  }

  /**
   * authenticates user
   *
   * @param {String} password
   *
   * @returns {Promise}
   */
  async authenticate (password) {
    // compare hash with password
    let hash  = this.get ('hash');
    let check = crypto
      .createHmac ('sha256', config.get ('secret'))
      .update (password)
      .digest ('hex');

    // check if password correct
    if (check !== hash) {
      return {
        'info'  : 'Incorrect password',
        'error' : true
      };
    }

    // password accepted
    return true;
  }

  /**
   * emits to socketio
   *
   * @param  {String} type
   * @param  {Object} data
   *
   * @return {*}
   */
  emit (type, data) {
    // return socket emission
    return socket.user (this, type, data);
  }

  /**
   * alerts user
   *
   * @param  {String} message
   * @param  {String} type
   * @param  {Object} options
   *
   * @return {*}
   */
  alert (message, type, options) {
    // return socket emission
    return socket.alert (this, message, type, options);
  }

  /**
   * check ACL
   *
   * @return {Promise}
   */
  async _acl () {
    // set array
    let Acl = [];

    // check default acl
    let Default = await acl.where ({
      'name' : config.get ('acl.default.name')
    }).findOne ();

    // check default acl exists
    if (!Default) {
      // add new acl
      Default = new acl (config.get ('acl.default'));

      // save defailt
      await Default.save ();
    }

    // set user acl
    Acl.push (Default);

    // check first
    let count = await user.count ();

    // check count
    if (!count) {
      // check first acl
      var Admin = await acl.where ({
        'name' : config.get ('acl.first.name')
      }).findOne ();

      // check first acl exists
      if (!Admin) {
        // add new acl
        Admin = new acl (config.get ('acl.first'));

        // save admin acl
        await Admin.save ();
      }

      // set user acl
      Acl.push (Admin);
    }

    // set acl
    this.set ('acl', Acl);

    // run next
    return true;
  }

  /**
   * sanitises user
   *
   * @return {*}
   */
  async sanitise () {
    // get avatar
    let Avatar = await this.model ('avatar');
    let avatar = false;

    // check avatar
    if (Avatar) {
      avatar = await Avatar.sanitise ();
    }

    // load acl
    let Acls = await this.model ('acl') || [];
    let acls = [];

    // check acl
    for (var i = 0; i < Acls.length; i++) {
      // push to Acls
      acls.push (Acls[i].sanitise ());
    }

    // return sanitised user
    let sanitised = {
      'id'       : this.get ('_id').toString (),
      'acls'     : acls,
      'avatar'   : avatar,
      'balance'  : this.get ('balance') || 0,
      'username' : this.get ('username')
    };

    // hook user login
    await eden.hook ('user.sanitise', {
      'user'      : this,
      'sanitised' : sanitised
    });

    // return sanitised
    return sanitised;
  }
}

/**
 * export user model
 * @type {user}
 */
exports = module.exports = user;
