"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _classnames = _interopRequireDefault(require("classnames"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function getSentTime(date) {
  return new Date(date).toLocaleTimeString('en-US');
}
const MessageItem = _ref => {
  let {
    messages,
    index
  } = _ref;
  const msg = messages[index];

  // If user changed
  const isNewUser = index === 0 || messages[index].user_id !== messages[index - 1].user_id;

  // If current user's message
  const isCurrentUser = !msg.user_id;

  // If passed more than 5 minutes
  const isPassedTime = !isNewUser && Math.abs(new Date(messages[index].datetime).getTime() - new Date(messages[index - 1].datetime).getTime()) > 1000 * 60 * 5;
  return /*#__PURE__*/_react.default.createElement("div", null, (isNewUser || isPassedTime) && /*#__PURE__*/_react.default.createElement("div", {
    className: "chat-sender d-flex justify-content-between align-items-center"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "chat-sender-name"
  }, !isCurrentUser ? msg.user_id : ''), /*#__PURE__*/_react.default.createElement("div", {
    className: "chat-sender-time"
  }, getSentTime(msg.datetime))), /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _classnames.default)('chat-message', isCurrentUser ? 'my-message' : 'client-message', (isNewUser || isPassedTime) && 'new-message')
  }, msg.msg));
};
var _default = MessageItem;
exports.default = _default;
module.exports = exports.default;