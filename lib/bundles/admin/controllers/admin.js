
// bind methods
const controller = require ('controller');

/**
 * build admin controller
 *
 * @acl   admin.view
 * @fail  /
 * @mount /admin
 */
class admin extends controller {
  /**
   * construct admin controller
   *
   * @param  {eden} eden
   */
  constructor () {
    // run super
    super ();

    // bind methods
    this.indexAction = this.indexAction.bind (this);
  }

  /**
   * admin index action
   *
   * @param  {request}  req Express request
   * @param  {response} res Express response
   *

   * @menu     {MAIN}  Admin
   * @menu     {ADMIN} Admin Home
   * @icon     fa fa-lock
   * @route    {get}   /
   * @priority 15
   */
  indexAction (req, res) {
    // render admin home page
    res.render ('admin', {
      'layout' : 'admin'
    });
  }
}

/**
 * exports admin controller
 *
 * @type {admin}
 */
exports = module.exports = admin;
