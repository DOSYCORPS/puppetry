import uniqid from "uniqid";
import actions from "action";
import update from "immutability-helper";
import {
  normalizeComplexPayload
} from "reducer/helpers";

import  { testDefaultState } from "reducer/defaultState";

/**
 * @typedef {object} Position
 * @property {string} [before] - reference id to inject before
 * @property {string} [after] - reference id to inject after
 */

/**
 * @typedef {object} EntityRef
 * @property {string} id
 * @property {string} groupId
 */

/**
 * @typedef {object} Entity - Contents of test
 */


function normalize( state, groupId ) {
  if ( state.groups.hasOwnProperty( groupId ) ) {
    return state;
  }
  return update( state, {
    groups: {
      [ groupId ]: {
        $set: { tests: {} }
      }
    }
  });
}

/**
 * Contents of test
 * @typedef {object} Payload
 * @property {Entity} options
 * @property {string} [id] - when given it's used as id, otherwise a new id is generated
 * @property {Position} [position]
 */

export default ( ns = "Test" ) => ({

  /**
     * Add record
     * @param {object} state
     * @param {Payload} payload
     * @returns {object}
     */
  [ actions[ `add${ ns }` ] ]: ( state, { payload }) => {
    const { options, id } = normalizeComplexPayload( payload ),
          merge = {},
          gid = id || uniqid();

    merge[ gid ] = { ...testDefaultState( gid ), ...options, commands: {}};
    return update( normalize( state, options.groupId ), {
      lastInsertTestId: {
        $set: gid
      },
      modified: {
        $set: true
      },
      groups: {
        [ options.groupId ]: {
          tests: {
            $merge: merge
          }
        }
      }
    });
  },

  /**
     * Insert record before/after
     * @param {object} state
     * @param {Payload} payload
     * @returns {object}
     */
  [ actions[ `insertAdjacent${ ns }` ] ]: ( state, { payload }) => {
    let gid;
    const { options, position, id } = normalizeComplexPayload( payload ),
          { tests }  = state.groups[ options.groupId ],

          entities = Object.values( tests ).reduce( ( carry, test ) => {
            if ( position.before && position.before === test.id ) {
              gid = id || uniqid();
              carry[ gid ] = { ...testDefaultState( gid ), ...options, commands: {}};
            }
            carry[ test.id ] = test;
            if ( position.after && position.after === test.id ) {
              gid = id || uniqid();
              carry[ gid ] = { ...testDefaultState( gid ), ...options, commands: {}};
            }
            return carry;
          }, {});

    return update( state, {
      lastInsertTestId: {
        $set: gid
      },
      modified: {
        $set: true
      },
      groups: {
        [ options.groupId ]: {
          tests: {
            $set: entities
          }
        }
      }

    });
  },

  /**
     * Update record
     * @param {object} state
     * @param {Entity} payload (EntityRef required)
     * @returns {object}
     */
  [ actions[ `update${ ns }` ] ]: ( state, { payload }) => update( state, {
    modified: {
      $set: true
    },
    groups: {
      [ payload.groupId ]: {
        tests: {
          $apply: ( ref ) => {
            const tests = { ...ref },
                  id = payload.id;
            tests[ id ] = { ...tests[ id ], ...payload, id, key: id };
            if ( !tests[ id ].hasOwnProperty( "commands" ) ) {
              tests[ id ].commands = {};
            }
            return tests;
          }
        }
      }
    }
  }),

  /**
     * Remove record
     * @param {object} state
     * @param {EntityRef} payload
     * @returns {object}
     */
  [ actions[ `remove${ ns }` ] ]: ( state, { payload }) => update( state, {
    modified: {
      $set: true
    },
    groups: {
      [ payload.groupId ]: {
        tests: {
          $unset:[ payload.id ]
        }
      }
    }
  })

});


