import React, { useState, useEffect } from 'react';
import { Dropdown, Switch, Menu, Button, Tooltip, DatePicker } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import shortid from 'shortid';
import {
    DownOutlined,
    UserAddOutlined,
    FileAddOutlined,
    HourglassOutlined,
    RobotOutlined,
    SaveOutlined,
    SendOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import logo from './assets/voyage-logo.png';
import MessageItem from './MessageItem';
import { MessageBus } from '@ivoyant/component-message-bus';
import { cache } from '@ivoyant/component-cache';
//modals
import {
    CreateCaseModal,
    OpenCasesModal,
} from '@ivoyant/component-create-case';
import Interaction from '@ivoyant/component-interaction';
import BulkRsa from '@ivoyant/component-bulk-rsa';
import NewNotification from '@ivoyant/component-new-notification';
import UnlockImei from '@ivoyant/component-unlockimei-tool';
import Acpstatus from '@ivoyant/component-acp-status';

import './styles.css';

function getFormattedTime(seconds) {
    var h = Math.floor(seconds / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    var s = seconds % 60;
    return (
        (h ? String(h).padStart(2, '0') + 'h : ' : '') +
        String(m).padStart(2, '0') +
        'm : ' +
        String(s).padStart(2, '0') +
        's'
    );
}

const Timer = React.memo(({ events }) => {
    const { timerStartEvents, timerEndEvents } = events;
    const timerStarted = window[window.sessionStorage?.tabId].timerStarted
        ? window[window.sessionStorage?.tabId].timerStarted
        : false;
    const windowSeconds = window[window.sessionStorage?.tabId].timerSeconds
        ? window[window.sessionStorage?.tabId].timerSeconds
        : 0;
    const [seconds, setSeconds] = useState(windowSeconds);
    const [started, setStarted] = useState(timerStarted);

    const startInteraction =
        () => (subscriptionId, topic, eventData, closure) => {
            setSeconds(0);
            window[window.sessionStorage?.tabId].timerSeconds = 0;
            setStarted(true);
            window[window.sessionStorage?.tabId].timerStarted = true;
        };

    const stopTimer = () => (subscriptionId, topic, eventData, closure) => {
        setStarted(false);
        window[window.sessionStorage?.tabId].timerStarted = false;
    };

    useEffect(() => {
        timerStartEvents.forEach((tse) => {
            MessageBus.subscribe(
                'chat-timer.'.concat(tse),
                tse,
                startInteraction(),
                {}
            );
        });

        timerEndEvents.forEach((tee) => {
            MessageBus.subscribe(
                'chat-timer.'.concat(tee),
                tee,
                stopTimer(),
                {}
            );
        });

        return () => {
            timerStartEvents.forEach((tse) => {
                MessageBus.unsubscribe('chat-timer.'.concat(tse));
            });

            timerEndEvents.forEach((tee) => {
                MessageBus.unsubscribe('chat-timer.'.concat(tee));
            });
        };
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            if (started || window[window.sessionStorage?.tabId].timerStarted) {
                setSeconds((prev) => prev + 1);
                window[window.sessionStorage?.tabId].timerStarted = true;
                window[window.sessionStorage?.tabId].timerSeconds = seconds + 1;
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [seconds, started]);

    const timerBackground = started ? '#00AC60' : 'red';

    return (
        <div className="timer-wrapper">
            <div className="timer-logo">
                <div className="timer-logo-bk"></div>
                <img
                    src={require('./assets/timer-logo.png')}
                    alt="timer-logo"
                />
            </div>
            <div
                className="timer-counter"
                style={{ background: timerBackground }}
            >
                {getFormattedTime(seconds)}
            </div>
        </div>
    );
});

export default function ComponentCsrChatterComponent(props) {
    const { properties, store, datasources } = props;
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
        searchOpenCasesWorkflow,
    } = properties;
    window[window.sessionStorage?.tabId]['datasourcesFromCSRChatter'] =
        datasources;
    const { data } = props.data;
    const caseCategories = data.caseCategories?.categories || [];
    const interactionCategories = data.interactionCategories?.categories || [];
    const interactionTags = data.interactionTags?.categories || [];
    const casePriorities = data.casePriorities?.categories || [];
    const caseAssignedTeam = data.caseAssignedTeam?.categories || [];
    const casePrivileges = data.casePrivileges?.categories || [];
    const customerInfo = data.customerInfo || {};
    const feedbackInfo = data.feedbackInfo?.categories || {};
    const accountDetails = data?.userAccountDetails?.accountDetails || {};

    const interaction = cache.get('interaction');
    const {
        interactionId = '',
        ctn = '',
        ban = '',
        agentId = '',
    } = interaction || {};

    if (store?.response?.['test-component-get-chats']) {
        Object.assign(
            properties,
            store?.response?.['test-component-get-chats']
        );
    }

    const { messages: defaultMessages = [] } = properties;
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState(defaultMessages);
    const [saveInteractionModalVisible, setSaveInteractionModalVisible] =
        useState(false);
    const [saveInteractionInitialized, setSaveInteractionInitialized] =
        useState(false);

    const [createCase, setCreateCase] = useState(false);
    const [openCases, setOpenCases] = useState(false);
    const [showBulkRSAModal, setShowBulkRSAModal] = useState(false);
    const [showNewNotification, setShowNewNotification] = useState(false);
    const [showUnlockImei, setShowUnlockImei] = useState(false);
    const [showAcpstatus, setShowAcpstatus] = useState(false);
    const [submitInteractionSuccess, setSubmitInteractionSuccess] = useState(
        window[window.sessionStorage?.tabId].submitInteractionSuccess
    );
    const [opencasesResponse, setOpencasesResponse] = useState(null);
    const [openErrMessage, setOpenErrMessage] = useState(null);
    const [caseSearchLoading, setOpenCaseSearchLoading] = useState(null);
    const [switchToCreateCase, setSwitchToCreateCase] = useState(false);

    let { attId, profile } =
        window[window.sessionStorage?.tabId].COM_IVOYANT_VARS;

    const logicalDateProfileEnabled = data.profiles
        ?.find(({ name }) => name === profile)
        ?.categories?.find(({ name }) => name === 'logicalDate')?.enable;

    const defaultInteractionData =
        data?.profiles
            ?.find(({ name }) => name === profile)
            ?.categories?.find(
                ({ name }) => name === 'defaultInteractionProperties'
            ) || {};
    const createPrivileges = casePrivileges
        ?.find(({ name }) => name === profile)
        ?.categories?.find(({ name }) => name === 'Create');

    useEffect(() => {
        window[window.sessionStorage?.tabId].triggerSaveInteraction =
            triggerSaveInteraction;
        if (events && events.showInteraction) {
            MessageBus.subscribe(
                'chatter.'.concat(events.showInteraction),
                events.showInteraction,
                handleInteractionShow(),
                {}
            );
        }

        return () => {
            if (window[window.sessionStorage?.tabId].triggerSaveInteraction) {
                delete window[window.sessionStorage?.tabId]
                    .triggerSaveInteraction;
            }

            if (events && events.showInteraction) {
                MessageBus.unsubscribe(
                    'chatter.'.concat(events.showInteraction)
                );
            }
        };
    }, []);

    useEffect(() => {
        let newNotificationData = cache.get('WhatsNewNotificationData');
        if (newNotificationData?.releaseInfo === undefined) {
            getNewNotifications();
        } else {
            MessageBus.send('GETNOTIFICATIONDATA', newNotificationData);
            if (
                !newNotificationData?.notificationSeen &&
                !cache.get('FirstTimeNotificationSeen')
            ) {
                setShowNewNotification(true);
                setTimeout(() => {
                    cache.put('FirstTimeNotificationSeen', true);
                }, 5000);
            }
        }
    }, []);

    const handleShowBulkRSA =
        () => (subscriptionId, topic, eventData, closure) => {
            setShowBulkRSAModal(true);
        };

    const handleShowNewNotification =
        () => (subscriptionId, topic, eventData, closure) => {
            setShowNewNotification(true);
        };

    useEffect(() => {
        if (events && events.showBulkRSA) {
            MessageBus.subscribe(
                'chatter.'.concat(events.showBulkRSA),
                events.showBulkRSA,
                handleShowBulkRSA(),
                {}
            );
        }

        return () => {
            if (events && events.showBulkRSA) {
                MessageBus.unsubscribe('chatter.'.concat(events.showBulkRSA));
            }
        };
    }, []);

    useEffect(() => {
        if (events && events.showNewNotification) {
            MessageBus.subscribe(
                'chatter.'.concat(events.showNewNotification),
                events.showNewNotification,
                handleShowNewNotification(),
                {}
            );
        }

        return () => {
            if (events && events.showNewNotification) {
                MessageBus.unsubscribe(
                    'chatter.'.concat(events.showNewNotification)
                );
            }
        };
    }, []);

    useEffect(
        (prev) => {
            if (
                interaction &&
                !saveInteractionModalVisible &&
                interactionId !== ''
            ) {
                if (events && events.hideInteraction) {
                    MessageBus.send(events.hideInteraction, {
                        header: {
                            source: 'chatter',
                            event: events.hideInteraction,
                        },
                        body: {
                            task: 'Interaction '.concat(interactionId),
                        },
                    });
                }
            }
        },
        [saveInteractionModalVisible]
    );

    const handleSendMessage = () => {
        const newMsg = { msg: message, datetime: new Date() };
        setMessages([...messages, newMsg]);
        setMessage('');
    };

    const triggerSaveInteraction = () => {
        setSaveInteractionModalVisible(true);
        setSaveInteractionInitialized(true);
    };

    const handleOpenCasesSearch =
        (successStates, errorStates) =>
        (subscriptionId, topic, eventData, closure) => {
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
                        setOpenErrMessage(
                            eventData?.event?.data?.response?.data?.causedBy[0]
                                ?.message
                        );
                    } else {
                        setOpenErrMessage(
                            eventData?.event?.data?.response?.data?.message
                        );
                    }
                }
                setOpenCaseSearchLoading(false);
                MessageBus.unsubscribe(subscriptionId);
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

        if (
            accountDetails &&
            accountDetails?.openCases > 0

            // && switchToCreateCase === false
        ) {
            setOpenCaseSearchLoading(true);
            const {
                workflow,
                datasource,
                responseMapping,
                successStates,
                errorStates,
            } = properties?.searchOpenCasesWorkflow;
            const registrationId = workflow.concat('.').concat(attId);
            MessageBus.subscribe(
                registrationId,
                'WF.'.concat(workflow).concat('.STATE.CHANGE'),
                handleOpenCasesSearch(successStates, errorStates)
            );
            MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
                header: {
                    registrationId: registrationId,
                    workflow: workflow,
                    eventType: 'INIT',
                },
            });
            MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
                header: {
                    registrationId: registrationId,
                    workflow: workflow,
                    eventType: 'SUBMIT',
                },
                body: {
                    datasource: datasources[datasource],
                    request: {
                        body: { billingAccountNumber: ban },
                    },
                    responseMapping,
                },
            });

            setOpenCases(true);
        } else {
            setCreateCase(true);
        }
    };

    const handleInteractionShow =
        () => (subscriptionId, topic, eventData, closure) => {
            triggerSaveInteraction();
        };

    const dateValue = cache.get('logicalDate')
        ? moment(cache.get('logicalDate'))
        : null;

    const handleLogicalDateChange = (value) => {
        const date = value && moment(value)?.format('YYYYMMDD');
        const formatedDate = value && moment(value)?.format('DD MMM YYYY');
        cache.put('logicalDate', date);
        cache.put('logicalFormatedDate', formatedDate);
    };

    const handleNewNotifications =
        () => (subscriptionId, topic, eventData, closure) => {
            const status = eventData.value;
            const { successStates, errorStates } =
                properties?.newNotificationWorkflow;
            const isSuccess = successStates.includes(status);
            const isFailure = errorStates.includes(status);
            if (isSuccess || isFailure) {
                if (isSuccess) {
                    cache.put(
                        'WhatsNewNotificationData',
                        eventData?.event?.data?.data
                    );
                    MessageBus.send(
                        'GETNOTIFICATIONDATA',
                        eventData?.event?.data?.data
                    );
                    if (
                        !eventData?.event?.data?.data?.notificationSeen &&
                        !cache.get('FirstTimeNotificationSeen')
                    ) {
                        setShowNewNotification(true);
                    }
                }
                MessageBus.unsubscribe(subscriptionId);
            }
        };

    const getNewNotifications = () => {
        const { workflow, datasource, responseMapping } =
            properties?.newNotificationWorkflow;
        const registrationId = workflow.concat('.').concat(attId);
        MessageBus.subscribe(
            registrationId,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handleNewNotifications()
        );
        MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
            header: {
                registrationId: registrationId,
                workflow: workflow,
                eventType: 'INIT',
            },
        });
        MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
            header: {
                registrationId: registrationId,
                workflow: workflow,
                eventType: 'SUBMIT',
            },
            body: {
                datasource: datasources[datasource],
                request: {
                    params: { agentId: attId },
                },
                responseMapping,
            },
        });
    };

    return (
        <div className="test-chat-wrapper d-flex flex-column">
            <div className="header-title">
                <img className="voyage-logo" src={logo} alt="Logo" />
            </div>
            <div className="stat-wrapper d-flex justify-content-between align-items-center">
                <Timer events={events} />
                <div className="id-list">
                    <Dropdown
                        menu={
                            <Menu>
                                <Menu.Item>ID : {interactionId}</Menu.Item>
                            </Menu>
                        }
                    >
                        <div className="flex-row align-items-center">
                            <span>ID : {interactionId}</span>
                            &nbsp;
                            <DownOutlined
                                style={{
                                    fontSize: '6px',
                                    color: '#00000080',
                                }}
                            />
                        </div>
                    </Dropdown>
                </div>
            </div>
            <div className="dashed-divider"></div>
            <div className="send-by-wrapper d-flex justify-content-between align-items-center">
                <div className="d-flex flex-row align-items-center">
                    <RobotOutlined className="text-green robot-icon" />
                    <div style={{ marginLeft: 6 }}>
                        <div className="text-gray">Send By</div>
                        <div className="text-green font-weight-bold">
                            HELPER BOT
                        </div>
                    </div>
                </div>
                <Switch />
            </div>
            <div className="dashed-divider"></div>
            <div className="icons-wrapper d-flex justify-content-between align-items-center ">
                <div className="text-gray font-12">QUICK ACCESS</div>
                {createPrivileges && (
                    <Tooltip placement="bottomLeft" title="Create Case">
                        <FileAddOutlined
                            onClick={() => {
                                triggerCreateCase();
                            }}
                        />
                    </Tooltip>
                )}
                <Tooltip placement="bottomLeft" title="Create Contact">
                    <UserAddOutlined />
                </Tooltip>
                {ctn !== '' &&
                    !submitInteractionSuccess &&
                    !saveInteractionInitialized && (
                        <Tooltip
                            placement="bottomLeft"
                            title="Save Interaction"
                        >
                            <SaveOutlined
                                onClick={() => {
                                    triggerSaveInteraction();
                                }}
                            />
                        </Tooltip>
                    )}
                {ctn !== '' && submitInteractionSuccess && (
                    <Tooltip
                        placement="bottomLeft"
                        title="Save Interaction Disabled - Interaction successfully submitted"
                    >
                        <SaveOutlined />
                    </Tooltip>
                )}
                {ctn !== '' && saveInteractionInitialized && (
                    <Tooltip
                        placement="bottomLeft"
                        title="Interaction created - continue with the one in taskbar"
                    >
                        <SaveOutlined />
                    </Tooltip>
                )}
                {ctn === '' && (
                    <Tooltip
                        placement="bottomLeft"
                        title="Save Interaction Disabled"
                    >
                        <SaveOutlined />
                    </Tooltip>
                )}
            </div>
            {logicalDateProfileEnabled === 'true' && (
                <>
                    <div className="solid-divider" />
                    <div className="icons-wrapper d-flex justify-content-between align-items-center ">
                        <div className="text-gray font-12">LOGICAL DATE</div>
                        <DatePicker
                            defaultValue={dateValue}
                            onChange={(value) => handleLogicalDateChange(value)}
                        />
                    </div>
                </>
            )}
            <div className="solid-divider"></div>
            <div className="chat-wrapper d-flex flex-column minimized-scroll">
                {messages.map((msg, index) => (
                    <React.Fragment key={shortid.generate()}>
                        <MessageItem messages={messages} index={index} />
                    </React.Fragment>
                ))}
            </div>
            <div className="sender-wrapper d-flex">
                <div className="sender-box">
                    <TextArea
                        placeholder="Please write your message"
                        onChange={(e) => {
                            setMessage(e.target.value);
                        }}
                        value={message}
                        autoSize={{ minRows: 1, maxRows: 5 }}
                    />
                </div>
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                />
            </div>
            <CreateCaseModal
                properties={{
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
                    categoryConditionsForImei:
                        properties?.categoryConditionsForImei || [],
                    categoryConditionsForCTN:
                        properties?.categoryConditionsForCTN || [],
                }}
                datasources={datasources}
                setCreateCase={setCreateCase}
            />
            <OpenCasesModal
                properties={{
                    visible: openCases,
                    cmMode: true,
                    opencasesResponse,
                    agentId,
                    setSwitchToCreateCase,
                    setCreateCase,
                    openErrMessage,
                    setOpenErrMessage,
                    caseSearchLoading,
                    updateOpenCaseWorkflow: properties?.updateOpenCaseWorkflow,
                }}
                datasources={datasources}
                setOpenCases={setOpenCases}
            />
            <Interaction
                properties={{
                    visible: saveInteractionModalVisible,
                    showMultipleTabs,
                    interactionCategories,
                    saveInteractionWorkflow,
                    linkCaseWorkflow,
                    createPrivileges,
                    datasources,
                    submitInteractionWorkflow,
                    uniphoreWorkflow,
                    feedbackWorkflow,
                }}
                setSaveInteractionModalVisible={setSaveInteractionModalVisible}
                setSubmitInteraction={setSubmitInteractionSuccess}
                messages={messages}
                events={events}
                interactionTags={interactionTags}
                defaultInteractionData={defaultInteractionData}
                feedbackInfo={feedbackInfo}
            />
            <BulkRsa
                visible={showBulkRSAModal}
                setShowBulkRSAModal={setShowBulkRSAModal}
                properties={{
                    bulkRsaWorkflow: bulkRsaWorkflow || null,
                }}
                datasources={datasources}
            />
            <NewNotification
                visible={showNewNotification}
                setShowNewNotification={setShowNewNotification}
            />
            <UnlockImei
                visible={showUnlockImei}
                setShowUnlockImei={setShowUnlockImei}
                datasources={datasources}
                properties={{
                    unlockImeikSearchWorkflow:
                        properties?.unlockImeikSearchWorkflow || null,
                    unlockImeikDevicehWorkflow:
                        properties?.unlockImeikDevicehWorkflow || null,
                }}
                metadataProfile={data?.data?.profilesInfo}
                unlockOverrideReasons={data?.data?.unlockOverrideReasons}
            />
            <Acpstatus
                visible={showAcpstatus}
                setShowAcpstatus={setShowAcpstatus}
                datasources={datasources}
                properties={{
                    searchAcpAppStatusWorkflow:
                        properties?.searchAcpAppStatusWorkflow || null,
                }}
            />
        </div>
    );
}
