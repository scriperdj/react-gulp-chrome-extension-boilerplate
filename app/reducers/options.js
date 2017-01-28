import * as ActionTypes from '../constants/ActionTypes';

const initialState = {
  show_app: true
};

const actionsMap = {
  ['CHANGE_APP'](state, action) {
    console.log('executing state change');
    return Object.assign({}, state, { show_app: action.show_app });
  }
};

export default function options(state = initialState, action) {
  const reduceFn = actionsMap[action.type];
  if (!reduceFn) return state;
  return reduceFn(state, action);
}
