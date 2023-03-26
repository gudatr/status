document.addEventListener('alpine:init', () => {

    Alpine.store('data', {
        servers: [],
        channels: [],
        messages: [],
        trigger_messages: [],
        triggers: []
    })

    Alpine.store('controls', {
        datetime1: new Date().toISOString().substring(0, 19),
        datetime2: new Date().toISOString().substring(0, 19),
        metrics: ['cpu', 'mem_used', 'disk_used', 'io_read', 'io_write', 'net_in', 'net_out', 'error_rate'],
        showAuthModal: true,
        showTriggerModal: false,
        trigger_edit: {
            id: 0,
            name: '',
            description: '',
            type: '',
            value: '',
            threshold: 0,
            time: 0,
            active: true
        },
        showPage: 0,
        autoUpdate: false,
        autoUpdateSpeed: 3000,
        serverFilter: [],
        channelFilter: [],
        timeframeType: 'since',
        timeSelect: Date.now(),
        pageLogs: 0,
        pageTriggerMessages: 0,
        pageSize: 30,
        lastPage: 0,
        minimumLevel: 1,
        maximumLevel: 10,
        searchTerm: '',
    })

    Alpine.store('credentials', {
        password: '',
        authenticated: 0
    });

    _global.trans = initializeTranslation();
});

