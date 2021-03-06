
// require local dependencies
const store = require ('riot/public/js/store');

/**
 * build acl class
 */
class acl {
  /**
   * construct acl class
   */
  constructor () {
    // bind methods
    this.list     = this.list.bind (this);
    this.validate = this.validate.bind (this);
  }

  /**
   * validates acl
   *
   * @param {*} test
   * @param {*} list
   */
  validate (test, list) {
    // get list
    if (!list) list = this.list ();

    // set as Array
    if (list !== true && !Array.isArray (list)) list = [list];

    // set array if not
    if (!Array.isArray (test)) test = [test];

    // loop list
    for (var i = 0; i < test.length; i++) {
      // check if user
      if (test[i] === true || test[i] === false) {
        // check user
        if ((test[i] === true && !store.get ('user')) || (test[i] === false && store.get ('user'))) {
          return false;
        } else {
          continue;
        }
      }

      // check if list is true
      if (list === true) return true;

      // var area
      let area = test[i].split ('.');
      area.pop ();
      area = area.join ('.');

      // check against user acl
      if (list.indexOf (test[i]) === -1 && list.indexOf (area + '.*') === -1) {
        // return false
        return false;
      }
    }

    // return true
    return true;
  }

  /**
   * gets acl list from user
   *
   * @param {user} User
   *
   * @private
   */
  list () {
    // return array if no user
    if (!store.get ('user')) return [];

    // get groups
    return store.get ('user').acl || [];
  }
}

/**
 * export aclUtil class
 *
 * @type {aclUtil}
 */
exports = module.exports = new acl ();
