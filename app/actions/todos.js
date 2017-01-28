import * as types from '../constants/ActionTypes';

export function changeApp(show_app) {
  return { type: 'CHANGE_APP', show_app };
}

export function loadAccounts() {
  return (dispatch, getState) => {
    let state = getState();
    console.log('b4 state tst=' + state.options.show_app);
    dispatch(changeApp(false));
    console.log('state tst=' + state.options.show_app);
  };
}

export function addTodo(text) {
  return { type: types.ADD_TODO, text };
}

export function deleteTodo(id) {
  return { type: types.DELETE_TODO, id };
}

export function editTodo(id, text) {
  return { type: types.EDIT_TODO, id, text };
}

export function completeTodo(id) {
  return { type: types.COMPLETE_TODO, id };
}

export function completeAll() {
  return { type: types.COMPLETE_ALL };
}

export function clearCompleted() {
  return { type: types.CLEAR_COMPLETED };
}
