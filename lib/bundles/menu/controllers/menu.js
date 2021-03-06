
// require dependencies
const controller = require ('controller');

// require helpers
const menuHelper = helper ('menu');

// require cache
const menuConfig = cache ('menus');

// require local dependencies
const acl = require ('lib/utilities/acl');

/**
 * build menu controller
 *
 * @priority 5
 */
class menu extends controller {
  /**
   * construct home controller
   *
   * @param {eden} eden
   */
  constructor () {
    // run super
    super ();

    // bind methods
    this.build = this.build.bind (this);

    // bind private methods
    this._menus = this._menus.bind (this);

    // build eden
    this.build ();
  }

  /**
   * build app
   *
   * @param {express} app
   */
  build () {
    // on render
    this.eden.pre ('view.compile', (render) => {
      // move menus
      if (render.state.menus) render.menus = render.state.menus;

      // delete from state
      delete render.state.menus;
    });

    // set app
    this.eden.router.use (async (req, res, next) => {
      // set req remove
      req.menu = {};

      // set menus
      res.locals.menus = await this._menus (req.user, menuConfig);

      // add function
      req.menu.add = async (type, route, item) => {
        // add menu item
        menuHelper.add (type, route, item, res);

        // set menus
        res.locals.menus = await this._menus (req.user, res.locals.menus);

        // return
        return true;
      };

      // edit function
      req.menu.edit = async (type, route, item) => {
        // edit menu item
        menuHelper.edit (type, route, item, res);

        // set menus
        res.locals.menus = await this._menus (req.user, res.locals.menus);

        // return
        return true;
      };

      // remove function
      req.menu.remove = async (type, route) => {
        // remove menu item
        menuHelper.remove (type, route, res);

        // set menus
        res.locals.menus = res.locals.menus;

        // return
        return true;
      };

      // run next
      next ();
    });
  }


  /**
   * returns menus
   *
   * @param {user} User
   * @param {Array} menus
   *
   * @return {Array}
   */
  async _menus (User, menus) {
    // clone menus
    let Menus = JSON.parse (JSON.stringify (menus));

    // add hook
    await this.eden.hook ('menu:load', Menus);

    // loop menu types
    for (var type in Menus) {
      // set routes
      let Routes = [];

      // set menu
      Menus[type] = Menus[type] || [];

      // get classes
      Menus[type].sort ((a, b) => {
        // return sort
        return b.priority - a.priority;
      });

      // loop actual menus
      for (var i = (Menus[type].length - 1); i >= 0; i--) {
        // check routes
        if (Routes.indexOf (Menus[type][i].route) > -1) {
          // delete from menu
          Menus[type].splice (i, 1);

          // continue
          continue;
        }

        // push to routes
        Routes.push (Menus[type][i].route);

        // check if valid acl
        if (Menus[type][i].acl) {
          // validate acl
          if (!await acl.validate (User, Menus[type][i].acl)) {
            // delete from menu
            Menus[type].splice (i, 1);

            // continue
            continue;
          }
        }
      }

      // check menu type
      if (!Menus[type].length) {
        // remove menu
        delete Menus[type];

        // continue
        continue;
      }
    }

    // return menus
    return Menus;
  }
}

/**
 * export menu controller
 *
 * @type {menu}
 */
exports = module.exports = menu;
