$(document).ready(function() {

    /*
        ===========================================================================
                               Communication with Server
        ===========================================================================
    */
    var username;
    var socket = io.connect('/', {
        path: '/chat-socket'
    });

    $('form').submit(function() {});

    $('#send').click(function() {
        socket.emit('chat message', $('#text').val());
        $('#text').val('');
        return false;
    });

    $('#melar').click(function() {
        socket.emit('spam', "melar");
    });

    /*
        ===========================================================================
                                Receive Server Messages
        ===========================================================================
    */
    /* Buffer para mensagens de histórico */
    var total, count = 0;
    var chat_messages = [];

    socket.on('connected', function(msg) {
        /* Register self */
        if (username == undefined)
            register_self(msg);
        else printMsg(msg, 'connected');
    });
    socket.on('disconnected', function(msg) { printMsg(msg, 'disconnected'); });
    socket.on('chat', function(msg) { printMsg(msg, 'chat'); });
    socket.on('spam', function(msg) { printMsg(msg, 'spam'); });
    socket.on('keys', function(msg) { total = msg; });
    socket.on('history', function(msg) {
        if (msg.dest != username) return;
        kind = msg.key.split(':').slice(1, 2)[0];
        msg = msg.msg;
        msg.value = JSON.parse(msg.value);
        chat_messages.push([msg, kind]);
        if (++count == total)
            printNextMsg(0);
    });

    /* Imprime histórico recursivamente */
    function printNextMsg(index) {
        if (index == chat_messages.length) return;
        [msg, kind] = chat_messages[index];
        printMsg(msg, kind).then(function() {
            printNextMsg(index + 1);
        });
    }

    /*
        ===========================================================================
                                Proccess Received Messages
        ===========================================================================
    */

    function printMsg(msg, kind) {
        return new Promise(function(resolve, reject) {
            new EmbedJS({
                googleAuthKey: 'AIzaSyCqFouT8h5DKAbxlrTZmjXEmNBjC69f0ts',
                input: msg.value.message
            }).text(function(compiled) {
                var time = msg.key.split(':').slice(5, 8).join(':');
                $('#messages').append(
                    $('<p>').html(time + "  " + user_credential(msg.value.user) +
                        '<span style="color:#6c6"> ' + kind + '</span> ' +
                        compiled
                    )
                );
                processUsers(msg, kind);
                scrollBotton();
                resolve();
            })
        });
    }

    function processUsers(msg, kind) {
        if (kind == "connected" && msg.value.user != username &&
            $("[id='" + msg.value.user + "']").length == 0)
            $('#users').append(
                $('<p id="' + msg.value.user + '">').html(user_great_credential(msg.value))
            );
        else if (kind == "disconnected")
            $("[id='" + msg.value.user + "']").remove();
    }

    function register_self(msg) {
        username = msg.value.user;
        $('#users').append($('<p>').html(user_great_credential(msg.value)));
    }

    /*
        ===========================================================================
                                Helpers to Manage View
        ===========================================================================
    */

    function user_great_credential(value) {
        return '<img class="userIcon" src="' + value.img + '"/>' + user_credential(value.user);
    }

    function user_credential(user) {
        return '<b style="color:' + stringToColour(user) + '">@' + user + '</b>';
    }

    function scrollBotton() {
        var scroll = document.getElementById('messages');
        scroll.scrollTop = scroll.scrollHeight
    }

    /*
        ===========================================================================
                                Emoticons Selector
        ===========================================================================
    */

    wdtEmojiBundle.defaults.emojiSheets = {
        'apple': 'public/img/sheet_apple_64-min.png'
    };

    wdtEmojiBundle.init('.wdt-emoji-bundle-enabled');

    var typeChangers = document.querySelectorAll('.change-emoji-type');
    for (var i = 0; i < typeChangers.length; i++) {
        typeChangers[i].addEventListener('click', function() {
            wdtEmojiBundle.changeType(this.dataset.emojiType);
            return false;
        });
    }

});

/*
 * Google Analytics
 */
(function(i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', '/js/analytics.js', 'ga');

ga('create', 'UA-60506552-2', 'auto');
ga('send', 'pageview');