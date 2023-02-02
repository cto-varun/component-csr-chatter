"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ComponentCsrChatterComponent;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _TextArea = _interopRequireDefault(require("antd/lib/input/TextArea"));
var _shortid = _interopRequireDefault(require("shortid"));
var _icons = require("@ant-design/icons");
var _moment = _interopRequireDefault(require("moment"));
var _voyageLogo = _interopRequireDefault(require("./assets/voyage-logo.png"));
var _MessageItem = _interopRequireDefault(require("./MessageItem"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _componentCache = require("@ivoyant/component-cache");
var _componentCreateCase = require("@ivoyant/component-create-case");
var _componentInteraction = _interopRequireDefault(require("@ivoyant/component-interaction"));
var _componentBulkRsa = _interopRequireDefault(require("@ivoyant/component-bulk-rsa"));
var _componentNewNotification = _interopRequireDefault(require("@ivoyant/component-new-notification"));
var _componentUnlockimeiTool = _interopRequireDefault(require("@ivoyant/component-unlockimei-tool"));
var _componentAcpStatus = _interopRequireDefault(require("@ivoyant/component-acp-status"));
require("./styles.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
//modals

function getFormattedTime(seconds) {
  var h = Math.floor(seconds / 3600);
  var m = Math.floor(seconds % 3600 / 60);
  var s = seconds % 60;
  return (h ? String(h).padStart(2, '0') + 'h : ' : '') + String(m).padStart(2, '0') + 'm : ' + String(s).padStart(2, '0') + 's';
}
const Timer = /*#__PURE__*/_react.default.memo(_ref => {
  let {
    events
  } = _ref;
  const {
    timerStartEvents,
    timerEndEvents
  } = events;
  const timerStarted = window[window.sessionStorage?.tabId].timerStarted ? window[window.sessionStorage?.tabId].timerStarted : false;
  const windowSeconds = window[window.sessionStorage?.tabId].timerSeconds ? window[window.sessionStorage?.tabId].timerSeconds : 0;
  const [seconds, setSeconds] = (0, _react.useState)(windowSeconds);
  const [started, setStarted] = (0, _react.useState)(timerStarted);
  const startInteraction = () => (subscriptionId, topic, eventData, closure) => {
    setSeconds(0);
    window[window.sessionStorage?.tabId].timerSeconds = 0;
    setStarted(true);
    window[window.sessionStorage?.tabId].timerStarted = true;
  };
  const stopTimer = () => (subscriptionId, topic, eventData, closure) => {
    setStarted(false);
    window[window.sessionStorage?.tabId].timerStarted = false;
  };
  (0, _react.useEffect)(() => {
    timerStartEvents.forEach(tse => {
      _componentMessageBus.MessageBus.subscribe('chat-timer.'.concat(tse), tse, startInteraction(), {});
    });
    timerEndEvents.forEach(tee => {
      _componentMessageBus.MessageBus.subscribe('chat-timer.'.concat(tee), tee, stopTimer(), {});
    });
    return () => {
      timerStartEvents.forEach(tse => {
        _componentMessageBus.MessageBus.unsubscribe('chat-timer.'.concat(tse));
      });
      timerEndEvents.forEach(tee => {
        _componentMessageBus.MessageBus.unsubscribe('chat-timer.'.concat(tee));
      });
    };
  }, []);
  (0, _react.useEffect)(() => {
    const timer = setInterval(() => {
      if (started || window[window.sessionStorage?.tabId].timerStarted) {
        setSeconds(prev => prev + 1);
        window[window.sessionStorage?.tabId].timerStarted = true;
        window[window.sessionStorage?.tabId].timerSeconds = seconds + 1;
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds, started]);
  const timerBackground = started ? '#00AC60' : 'red';
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "timer-wrapper"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "timer-logo"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "timer-logo-bk"
  }), /*#__PURE__*/_react.default.createElement("img", {
    src: require('./assets/timer-logo.png'),
    alt: "timer-logo"
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "timer-counter",
    style: {
      background: timerBackground
    }
  }, getFormattedTime(seconds)));
});
function ComponentCsrChatterComponent(props) {
  const {
    properties,
    store,
    datasources
  } = props;
  const {
    events,
    saveInteractionWorkflow,
    submitInteractionWorkflow,
    linkCaseWorkflow,
    caseCategoriesConfig,
    showMultipleTabs,
    createCaseWorkflow,
    bulkRsaWorkflow,
    uniphoreWorkflow,
    feedbackWorkflow,
    searchOpenCasesWorkflow
  } = properties;
  window[window.sessionStorage?.tabId]['datasourcesFromCSRChatter'] = datasources;
  const {
    data
  } = props.data;
  const caseCategories = data.caseCategories?.categories || [];
  const interactionCategories = data.interactionCategories?.categories || [];
  const interactionTags = data.interactionTags?.categories || [];
  const casePriorities = data.casePriorities?.categories || [];
  const caseAssignedTeam = data.caseAssignedTeam?.categories || [];
  const casePrivileges = data.casePrivileges?.categories || [];
  const customerInfo = data.customerInfo || {};
  const feedbackInfo = data.feedbackInfo?.categories || {};
  const accountDetails = data?.userAccountDetails?.accountDetails || {};
  const interaction = _componentCache.cache.get('interaction');
  const {
    interactionId = '',
    ctn = '',
    ban = '',
    agentId = ''
  } = interaction || {};
  if (store?.response?.['test-component-get-chats']) {
    Object.assign(properties, store?.response?.['test-component-get-chats']);
  }
  const {
    messages: defaultMessages = []
  } = properties;
  const [message, setMessage] = (0, _react.useState)('');
  const [messages, setMessages] = (0, _react.useState)(defaultMessages);
  const [saveInteractionModalVisible, setSaveInteractionModalVisible] = (0, _react.useState)(false);
  const [saveInteractionInitialized, setSaveInteractionInitialized] = (0, _react.useState)(false);
  const [createCase, setCreateCase] = (0, _react.useState)(false);
  const [openCases, setOpenCases] = (0, _react.useState)(false);
  const [showBulkRSAModal, setShowBulkRSAModal] = (0, _react.useState)(false);
  const [showNewNotification, setShowNewNotification] = (0, _react.useState)(false);
  const [showUnlockImei, setShowUnlockImei] = (0, _react.useState)(false);
  const [showAcpstatus, setShowAcpstatus] = (0, _react.useState)(false);
  const [submitInteractionSuccess, setSubmitInteractionSuccess] = (0, _react.useState)(window[window.sessionStorage?.tabId].submitInteractionSuccess);
  const [opencasesResponse, setOpencasesResponse] = (0, _react.useState)(null);
  const [openErrMessage, setOpenErrMessage] = (0, _react.useState)(null);
  const [caseSearchLoading, setOpenCaseSearchLoading] = (0, _react.useState)(null);
  const [switchToCreateCase, setSwitchToCreateCase] = (0, _react.useState)(false);
  let {
    attId,
    profile
  } = window[window.sessionStorage?.tabId].COM_IVOYANT_VARS;
  const logicalDateProfileEnabled = data.profiles?.find(_ref2 => {
    let {
      name
    } = _ref2;
    return name === profile;
  })?.categories?.find(_ref3 => {
    let {
      name
    } = _ref3;
    return name === 'logicalDate';
  })?.enable;
  const defaultInteractionData = data?.profiles?.find(_ref4 => {
    let {
      name
    } = _ref4;
    return name === profile;
  })?.categories?.find(_ref5 => {
    let {
      name
    } = _ref5;
    return name === 'defaultInteractionProperties';
  }) || {};
  const createPrivileges = casePrivileges?.find(_ref6 => {
    let {
      name
    } = _ref6;
    return name === profile;
  })?.categories?.find(_ref7 => {
    let {
      name
    } = _ref7;
    return name === 'Create';
  });
  (0, _react.useEffect)(() => {
    window[window.sessionStorage?.tabId].triggerSaveInteraction = triggerSaveInteraction;
    if (events && events.showInteraction) {
      _componentMessageBus.MessageBus.subscribe('chatter.'.concat(events.showInteraction), events.showInteraction, handleInteractionShow(), {});
    }
    return () => {
      if (window[window.sessionStorage?.tabId].triggerSaveInteraction) {
        delete window[window.sessionStorage?.tabId].triggerSaveInteraction;
      }
      if (events && events.showInteraction) {
        _componentMessageBus.MessageBus.unsubscribe('chatter.'.concat(events.showInteraction));
      }
    };
  }, []);
  (0, _react.useEffect)(() => {
    let newNotificationData = _componentCache.cache.get('WhatsNewNotificationData');
    if (newNotificationData?.releaseInfo === undefined) {
      getNewNotifications();
    } else {
      _componentMessageBus.MessageBus.send('GETNOTIFICATIONDATA', newNotificationData);
      if (!newNotificationData?.notificationSeen && !_componentCache.cache.get('FirstTimeNotificationSeen')) {
        setShowNewNotification(true);
        setTimeout(() => {
          _componentCache.cache.put('FirstTimeNotificationSeen', true);
        }, 5000);
      }
    }
  }, []);
  const handleShowBulkRSA = () => (subscriptionId, topic, eventData, closure) => {
    setShowBulkRSAModal(true);
  };
  const handleShowNewNotification = () => (subscriptionId, topic, eventData, closure) => {
    setShowNewNotification(true);
  };
  (0, _react.useEffect)(() => {
    if (events && events.showBulkRSA) {
      _componentMessageBus.MessageBus.subscribe('chatter.'.concat(events.showBulkRSA), events.showBulkRSA, handleShowBulkRSA(), {});
    }
    return () => {
      if (events && events.showBulkRSA) {
        _componentMessageBus.MessageBus.unsubscribe('chatter.'.concat(events.showBulkRSA));
      }
    };
  }, []);
  (0, _react.useEffect)(() => {
    if (events && events.showNewNotification) {
      _componentMessageBus.MessageBus.subscribe('chatter.'.concat(events.showNewNotification), events.showNewNotification, handleShowNewNotification(), {});
    }
    return () => {
      if (events && events.showNewNotification) {
        _componentMessageBus.MessageBus.unsubscribe('chatter.'.concat(events.showNewNotification));
      }
    };
  }, []);
  (0, _react.useEffect)(prev => {
    if (interaction && !saveInteractionModalVisible && interactionId !== '') {
      if (events && events.hideInteraction) {
        _componentMessageBus.MessageBus.send(events.hideInteraction, {
          header: {
            source: 'chatter',
            event: events.hideInteraction
          },
          body: {
            task: 'Interaction '.concat(interactionId)
          }
        });
      }
    }
  }, [saveInteractionModalVisible]);
  const handleSendMessage = () => {
    const newMsg = {
      msg: message,
      datetime: new Date()
    };
    setMessages([...messages, newMsg]);
    setMessage('');
  };
  const triggerSaveInteraction = () => {
    setSaveInteractionModalVisible(true);
    setSaveInteractionInitialized(true);
  };
  const handleOpenCasesSearch = (successStates, errorStates) => (subscriptionId, topic, eventData, closure) => {
    const status = eventData.value;
    const isSuccess = successStates.includes(status);
    const isFailure = errorStates.includes(status);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        setOpencasesResponse(eventData?.event?.data?.data);
        setOpenErrMessage('');
      }
      if (isFailure) {
        if (eventData?.event?.data?.response?.data?.causedBy) {
          setOpenErrMessage(eventData?.event?.data?.response?.data?.causedBy[0]?.message);
        } else {
          setOpenErrMessage(eventData?.event?.data?.response?.data?.message);
        }
      }
      setOpenCaseSearchLoading(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  const triggerCreateCase = () => {
    // OLD CODE
    // setCreateCase(true);

    // NEW CODE
    /**
     * following code get triggered when we click the create case icon on the csr-chatter
     * It basically checks customer360view data to get open cases count
     * and based on the count renders either CreateCaseModal or OpenCasesModal
     */

    if (accountDetails && accountDetails?.openCases > 0

    // && switchToCreateCase === false
    ) {
      setOpenCaseSearchLoading(true);
      const {
        workflow,
        datasource,
        responseMapping,
        successStates,
        errorStates
      } = properties?.searchOpenCasesWorkflow;
      const registrationId = workflow.concat('.').concat(attId);
      _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleOpenCasesSearch(successStates, errorStates));
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
        header: {
          registrationId: registrationId,
          workflow: workflow,
          eventType: 'INIT'
        }
      });
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
        header: {
          registrationId: registrationId,
          workflow: workflow,
          eventType: 'SUBMIT'
        },
        body: {
          datasource: datasources[datasource],
          request: {
            body: {
              billingAccountNumber: ban
            }
          },
          responseMapping
        }
      });
      setOpenCases(true);
    } else {
      setCreateCase(true);
    }
  };
  const handleInteractionShow = () => (subscriptionId, topic, eventData, closure) => {
    triggerSaveInteraction();
  };
  const dateValue = _componentCache.cache.get('logicalDate') ? (0, _moment.default)(_componentCache.cache.get('logicalDate')) : null;
  const handleLogicalDateChange = value => {
    const date = value && (0, _moment.default)(value)?.format('YYYYMMDD');
    const formatedDate = value && (0, _moment.default)(value)?.format('DD MMM YYYY');
    _componentCache.cache.put('logicalDate', date);
    _componentCache.cache.put('logicalFormatedDate', formatedDate);
  };
  const handleNewNotifications = () => (subscriptionId, topic, eventData, closure) => {
    const status = eventData.value;
    const {
      successStates,
      errorStates
    } = properties?.newNotificationWorkflow;
    const isSuccess = successStates.includes(status);
    const isFailure = errorStates.includes(status);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        _componentCache.cache.put('WhatsNewNotificationData', eventData?.event?.data?.data);
        _componentMessageBus.MessageBus.send('GETNOTIFICATIONDATA', eventData?.event?.data?.data);
        if (!eventData?.event?.data?.data?.notificationSeen && !_componentCache.cache.get('FirstTimeNotificationSeen')) {
          setShowNewNotification(true);
        }
      }
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  const getNewNotifications = () => {
    const {
      workflow,
      datasource,
      responseMapping
    } = properties?.newNotificationWorkflow;
    const registrationId = workflow.concat('.').concat(attId);
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleNewNotifications());
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: registrationId,
        workflow: workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
      header: {
        registrationId: registrationId,
        workflow: workflow,
        eventType: 'SUBMIT'
      },
      body: {
        datasource: datasources[datasource],
        request: {
          params: {
            agentId: attId
          }
        },
        responseMapping
      }
    });
  };
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "test-chat-wrapper d-flex flex-column"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "header-title"
  }, /*#__PURE__*/_react.default.createElement("img", {
    className: "voyage-logo",
    src: _voyageLogo.default,
    alt: "Logo"
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "stat-wrapper d-flex justify-content-between align-items-center"
  }, /*#__PURE__*/_react.default.createElement(Timer, {
    events: events
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "id-list"
  }, /*#__PURE__*/_react.default.createElement(_antd.Dropdown, {
    menu: /*#__PURE__*/_react.default.createElement(_antd.Menu, null, /*#__PURE__*/_react.default.createElement(_antd.Menu.Item, null, "ID : ", interactionId))
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "flex-row align-items-center"
  }, /*#__PURE__*/_react.default.createElement("span", null, "ID : ", interactionId), "\xA0", /*#__PURE__*/_react.default.createElement(_icons.DownOutlined, {
    style: {
      fontSize: '6px',
      color: '#00000080'
    }
  }))))), /*#__PURE__*/_react.default.createElement("div", {
    className: "dashed-divider"
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "send-by-wrapper d-flex justify-content-between align-items-center"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex flex-row align-items-center"
  }, /*#__PURE__*/_react.default.createElement(_icons.RobotOutlined, {
    className: "text-green robot-icon"
  }), /*#__PURE__*/_react.default.createElement("div", {
    style: {
      marginLeft: 6
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "text-gray"
  }, "Send By"), /*#__PURE__*/_react.default.createElement("div", {
    className: "text-green font-weight-bold"
  }, "HELPER BOT"))), /*#__PURE__*/_react.default.createElement(_antd.Switch, null)), /*#__PURE__*/_react.default.createElement("div", {
    className: "dashed-divider"
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "icons-wrapper d-flex justify-content-between align-items-center "
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "text-gray font-12"
  }, "QUICK ACCESS"), createPrivileges && /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
    placement: "bottomLeft",
    title: "Create Case"
  }, /*#__PURE__*/_react.default.createElement(_icons.FileAddOutlined, {
    onClick: () => {
      triggerCreateCase();
    }
  })), /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
    placement: "bottomLeft",
    title: "Create Contact"
  }, /*#__PURE__*/_react.default.createElement(_icons.UserAddOutlined, null)), ctn !== '' && !submitInteractionSuccess && !saveInteractionInitialized && /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
    placement: "bottomLeft",
    title: "Save Interaction"
  }, /*#__PURE__*/_react.default.createElement(_icons.SaveOutlined, {
    onClick: () => {
      triggerSaveInteraction();
    }
  })), ctn !== '' && submitInteractionSuccess && /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
    placement: "bottomLeft",
    title: "Save Interaction Disabled - Interaction successfully submitted"
  }, /*#__PURE__*/_react.default.createElement(_icons.SaveOutlined, null)), ctn !== '' && saveInteractionInitialized && /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
    placement: "bottomLeft",
    title: "Interaction created - continue with the one in taskbar"
  }, /*#__PURE__*/_react.default.createElement(_icons.SaveOutlined, null)), ctn === '' && /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
    placement: "bottomLeft",
    title: "Save Interaction Disabled"
  }, /*#__PURE__*/_react.default.createElement(_icons.SaveOutlined, null))), logicalDateProfileEnabled === 'true' && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: "solid-divider"
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "icons-wrapper d-flex justify-content-between align-items-center "
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "text-gray font-12"
  }, "LOGICAL DATE"), /*#__PURE__*/_react.default.createElement(_antd.DatePicker, {
    defaultValue: dateValue,
    onChange: value => handleLogicalDateChange(value)
  }))), /*#__PURE__*/_react.default.createElement("div", {
    className: "solid-divider"
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "chat-wrapper d-flex flex-column minimized-scroll"
  }, messages.map((msg, index) => /*#__PURE__*/_react.default.createElement(_react.default.Fragment, {
    key: _shortid.default.generate()
  }, /*#__PURE__*/_react.default.createElement(_MessageItem.default, {
    messages: messages,
    index: index
  })))), /*#__PURE__*/_react.default.createElement("div", {
    className: "sender-wrapper d-flex"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "sender-box"
  }, /*#__PURE__*/_react.default.createElement(_TextArea.default, {
    placeholder: "Please write your message",
    onChange: e => {
      setMessage(e.target.value);
    },
    value: message,
    autoSize: {
      minRows: 1,
      maxRows: 5
    }
  })), /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: "primary",
    icon: /*#__PURE__*/_react.default.createElement(_icons.SendOutlined, null),
    onClick: handleSendMessage
  })), /*#__PURE__*/_react.default.createElement(_componentCreateCase.CreateCaseModal, {
    properties: {
      visible: createCase,
      interactionCtn: ctn,
      agentId,
      caseCategories,
      casePriorities,
      caseAssignedTeam,
      casePrivileges,
      caseCategoriesConfig,
      customerInfo,
      createCaseWorkflow,
      categoryConditionsForImei: properties?.categoryConditionsForImei || [],
      categoryConditionsForCTN: properties?.categoryConditionsForCTN || []
    },
    datasources: datasources,
    setCreateCase: setCreateCase
  }), /*#__PURE__*/_react.default.createElement(_componentCreateCase.OpenCasesModal, {
    properties: {
      visible: openCases,
      cmMode: true,
      opencasesResponse,
      agentId,
      setSwitchToCreateCase,
      setCreateCase,
      openErrMessage,
      setOpenErrMessage,
      caseSearchLoading,
      updateOpenCaseWorkflow: properties?.updateOpenCaseWorkflow
    },
    datasources: datasources,
    setOpenCases: setOpenCases
  }), /*#__PURE__*/_react.default.createElement(_componentInteraction.default, {
    properties: {
      visible: saveInteractionModalVisible,
      showMultipleTabs,
      interactionCategories,
      saveInteractionWorkflow,
      linkCaseWorkflow,
      createPrivileges,
      datasources,
      submitInteractionWorkflow,
      uniphoreWorkflow,
      feedbackWorkflow
    },
    setSaveInteractionModalVisible: setSaveInteractionModalVisible,
    setSubmitInteraction: setSubmitInteractionSuccess,
    messages: messages,
    events: events,
    interactionTags: interactionTags,
    defaultInteractionData: defaultInteractionData,
    feedbackInfo: feedbackInfo
  }), /*#__PURE__*/_react.default.createElement(_componentBulkRsa.default, {
    visible: showBulkRSAModal,
    setShowBulkRSAModal: setShowBulkRSAModal,
    properties: {
      bulkRsaWorkflow: bulkRsaWorkflow || null
    },
    datasources: datasources
  }), /*#__PURE__*/_react.default.createElement(_componentNewNotification.default, {
    visible: showNewNotification,
    setShowNewNotification: setShowNewNotification
  }), /*#__PURE__*/_react.default.createElement(_componentUnlockimeiTool.default, {
    visible: showUnlockImei,
    setShowUnlockImei: setShowUnlockImei,
    datasources: datasources,
    properties: {
      unlockImeikSearchWorkflow: properties?.unlockImeikSearchWorkflow || null,
      unlockImeikDevicehWorkflow: properties?.unlockImeikDevicehWorkflow || null
    },
    metadataProfile: data?.data?.profilesInfo,
    unlockOverrideReasons: data?.data?.unlockOverrideReasons
  }), /*#__PURE__*/_react.default.createElement(_componentAcpStatus.default, {
    visible: showAcpstatus,
    setShowAcpstatus: setShowAcpstatus,
    datasources: datasources,
    properties: {
      searchAcpAppStatusWorkflow: properties?.searchAcpAppStatusWorkflow || null
    }
  }));
}
module.exports = exports.default;