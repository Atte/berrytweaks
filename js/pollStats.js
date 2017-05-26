BerryTweaks.modules['pollStats'] = (function(){
'use strict';

const self = {
    css: false,
    update(poll) {
        let stats = poll.find('.berrytweaks-poll-stats');
        if ( !stats.length ){
            stats = $('<div>', {
                'class': 'berrytweaks-poll-stats'
            }).appendTo(poll);
        }
        stats.empty();

        const data = new Map();
        let allNumeric = true;

        poll.find('.btn').each(function(){
            let i = $(this).data('op');
            let key = window.POLL_OPTIONS[parseInt(i, 10)];
            const numKey = parseInt(key, 10);
            const val = parseInt($(this).text(), 10);
            if ( Number.isNaN(numKey) )
                allNumeric = false;
            else
                key = numKey;
            data.set(key, val);
        });

        if ( data.size < 1 )
            return;

        const totalVotes = Array.from(data.values()).reduce((acc, n) => acc + n);
        stats.append($('<p>', {
            'text': 'Number of votes: ' + totalVotes
        }));

        if ( allNumeric ){
            const voteSum = Array.from(data).reduce((acc, entry) => acc + entry[0] * entry[1], 0);
            stats.append($('<p>', {
                'text': 'Average: ' + (voteSum / totalVotes)
            }));
        }
    },
    updateAll() {
        $('.poll').each(function(){
            self.update($(this));
        });
    },
    enable() {
        self.updateAll();
    },
    disable() {
        $('.berrytweaks-poll-stats').remove();
    }
};

BerryTweaks.patch(window, 'newPoll', () => {
    if ( self.enabled )
        self.updateAll();
});

BerryTweaks.patch(window, 'updatePoll', () => {
    if ( self.enabled )
        self.updateAll();
});

return self;

})();
