
// require dependencies
const extend = require ('extendify');
const helper = require ('helper');

/**
 * build datagrid helper class
 */
class grid extends helper {
  /**
   * construct datagrid helper
   */
  constructor (options) {
    // run super
    super ();

    // bind methods
    this.rows   = this.rows.bind (this);
    this.page   = this.page.bind (this);
    this.post   = this.post.bind (this);
    this.sort   = this.sort.bind (this);
    this.model  = this.model.bind (this);
    this.route  = this.route.bind (this);
    this.filter = this.filter.bind (this);
    this.render = this.render.bind (this);

    // bind private methods
    this._bind = this._bind.bind (this);

    // set default options
    options = options || {};

    // bind variables
    this._way     = options.way     || false;
    this._rows    = options.rows    || 20;
    this._page    = options.page    || 1;
    this._sort    = options.sort    || false;
    this._model   = options.model   || false;
    this._where   = options.where   || this._model;
    this._route   = options.route   || '';
    this._filter  = options.filter  || {};
    this._filters = options.filters || {};
    this._columns = options.columns || {};

    // bind model
    this._bind ();
  }

  /**
   * set rows
   *
   * @param  {*} model
   *
   * @return {grid}
   */
  rows (rows) {
    // set rows
    this._rows = rows;

    // allow chainable
    return this;
  }

  /**
   * set page
   *
   * @param  {*} page
   *
   * @return {grid}
   */
  page (page) {
    // set page
    this._page = page;

    // allow chainable
    return this;
  }

  /**
   * set sort
   *
   * @param  {String} sort
   * @param  {Integer} way
   *
   * @return {grid}
   */
  sort (sort, way) {
    // set sort
    this._way  = way;
    this._sort = sort;

    // allow chainable
    return this;
  }

  /**
   * set model
   *
   * @param  {*} model
   *
   * @return {grid}
   */
  model (model) {
    // set model
    this._model = model;

    // run model bind
    this._bind ();

    // allow chainable
    return this;
  }

  /**
   * set route
   *
   * @param  {String} route
   */
  route (route) {
    // set route
    this._route = route;

    // allow chainable
    return this;
  }

  /**
   * add filter
   *
   * @param  {String} key
   * @param  {*}      filter
   *
   * @return {grid}
   */
  filter (key, filter) {
    // set filter
    this._filters[key] = filter;

    // allow chainable
    return this;
  }

  /**
   * add column
   *
   * @param  {String} key
   * @param  {*}      column
   *
   * @return {grid}
   */
  column (key, column) {
    // set column
    this._columns[key] = column;

    // allow chainable
    return this;
  }

  /**
   * runs post request
   *
   * @param  {Request}  req
   * @param  {Response} res
   */
  async post (req, res) {
    // check rows
    if (req.body.rows) this._rows = parseInt (req.body.rows);
    // check page
    if (req.body.page) this._page = parseInt (req.body.page);
    // check order
    if (req.body.sort) this._sort = req.body.sort;
    // set way
    this._way = req.body.way;
    // check where
    if (req.body.filter) {
      // run loop
      for (var key in req.body.filter) {
        if (req.body.filter[key].trim () !== '') {
          this._filter[key] = req.body.filter[key];
        }
      }
    }

    // return res
    var result = await this.render ();

    // send result
    res.json (result);
  }

  /**
   * renders grid view
   *
   * @return {Promise}
   */
  async render () {
    // get grid
    let response = {
      'data'    : [],
      'filters' : [],
      'columns' : []
    };

    // set standard vars
    response.way   = this._way;
    response.page  = this._page;
    response.rows  = this._rows;
    response.sort  = this._sort;
    response.route = this._route;

    // check filters
    for (var filter in this._filter) {
      // check filter exists
      if (!this._filters[filter]) {
        continue;
      }

      // check if filter has query
      if (this._filters[filter].query) {
        // run query
        await this._filters[filter].query (this._filter[filter]);
      } else {
        // setup where
        let where = {};

        // add to where
        where[filter] = this._filter[filter];

        // run and
        this.and (where[filter]);
      }
    }

    // set sort
    if (this._sort && this._columns[this._sort] && this._columns[this._sort].sort && this._way !== false) {
      // check type
      if (typeof this._columns[this._sort].sort === 'function') {
        // set sort
        this._where = await this._sorts[this._sort] (this._where);
      } else if (this._columns[this._sort].sort === true) {
        // create sort object
        let sort = {};

        // set sort direction
        sort[this._sort] = this._way;

        // set sort directly
        this._where = this._where.sort (sort);
      } else {
        // set sort directly
        this._where = this._where.sort (this._sorts[this._sort]);
      }
    }

    // set total
    response.total = await this._where.count ();

    // complete query
    let rows = await this._where.limit (this._rows).skip (this._rows * (this._page - 1)).find ();

    // get columns
    for (var i = 0; i < rows.length; i++) {
      // create row
      let row = {};

      // loop columns
      for (var a in this._columns) {
        // get column
        let column = rows[i].get (a);

        // check for format
        if (this._columns[a].format) {
          column = await this._columns[a].format (column, rows[i]);
        }

        // set column
        row[a] = column;
      }

      // push into data
      response.data.push (row);
    }

    // setup columns
    for (var b in this._columns) {
      // push into columns
      response.columns.push ({
        'id'    : b,
        'sort'  : this._columns[b].sort ? true : false,
        'width' : this._columns[b].width || false,
        'title' : this._columns[b].title
      });
    }

    // setup columns
    for (var c in this._filters) {
      // create the filters
      let filter = {
        'id'   : c,
        'type' : this._filters[c].type
      };

      // set extra fields
      if (this._filters[c].ajax) filter.ajax       = this._filters[c].ajax;
      if (this._filters[c].title) filter.title     = this._filters[c].title;
      if (this._filters[c].socket) filter.socket   = this._filters[c].socket;
      if (this._filters[c].options) filter.options = this._filters[c].options;

      // push into columns
      response.filters.push (filter);
    }

    // resolve
    return response;
  }

  /**
   * binds model
   */
  _bind () {
    // create extender
    let extender = extend ({
      'isDeep' : true,
      'arrays' : 'concat'
    });

    // check model
    if (!this._model) return;

    // check where
    if (!this._where) this._where = this._model;

    // bind where or and methods
    ['where', 'or', 'and'].forEach ((method) => {
      // create new function
      this[method] = function () {
        // check where
        if (!this._where.query) {
          // set where
          this._where = this._where[method] (...arguments);

          // return
          return;
        }

        // extend
        if (method === 'and') {
          // set and
          this._where.query = extender ({
            '$and' : Array.from (arguments)
          }, this._where.query);
        } else if (method === 'or') {
          // set and
          this._where.query = extender ({
            '$or' : Array.from (arguments)
          }, this._where.query);
        } else if (method === 'where') {
          // set and
          this._where.query = extender (Array.from (arguments)[0], this._where.query);
        } else {
          this._where = this._where[method] (...arguments);
        }
      };
    });
  }
}

/**
 * export grid helper class
 *
 * @type {grid}
 */
exports = module.exports = grid;
