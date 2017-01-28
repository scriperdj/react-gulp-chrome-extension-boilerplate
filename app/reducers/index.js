import { combineReducers } from 'redux';
import todos from './todos';
import options from './options';

export default combineReducers({
  todos,
  options
});
