(function() {
    if (!(localStorage.getItem('players'))) localStorage.setItem('players',JSON.stringify([]));
    var backgroundCounter = 0;
    var stage = $('#stage');
    var player = $('#player');
    var playerStandBy = 'images/player-standby.png';
    var playerJump = 'images/player-jump2.png';
    var playerSquat = 'images/player-squat.png';
    var enemyBee = $('#enemy-bee');
    var enemySlime = $('#enemy-slime');
    var livesLeft = 3;
    var livesContainer = $('.lives').find('span');
    var score = 0;
    var scoreContainer = $('.score').find('span');
    var newBee = '<div id="enemy-bee"><img src=\"images/enemy-bee.png\" alt=""></div>';
    var newSlime = '<div id="enemy-slime"><img src=\"images/enemy-slime.png\" alt=""></div>';
    var flagBee = true;
    var flagSlime = true;
    var stopEverything = false;
    var currentTime = 0;
    var time = $('.time').find('span');

    livesContainer.text(livesLeft);
    scoreContainer.text(score);
    time.text(currentTime);

    //### create leaderboards ###
    var gimme = JSON.parse(localStorage.getItem('players'));
    gimme.sort(function(a, b) {
        if (a[2] === b[2]) {
            return 0;
        } else {
            return (a[2] > b[2]) ? -1 : 1;
        }
    });

    for (var k in gimme) {
        var person = gimme[k];
        var tbody = $('tbody');
        var len = tbody.find('tr').length;
        var row =
            '<tr>' +
                '<th scope="row" class="text-center">' + len + '</th>' +
                '<td>' + person[0] + '</td>' +
                '<td>' + person[1] + '</td>' +
                '<td>' + person[2] + '</td>' +
            '</tr>';
        tbody.append(row);
    }
    //###########################

    function gameLoop() {
        if (livesLeft <= 0) {
            $('#name-modal').modal('show');
            stopEverything = true;
        } else {

            backgroundCounter -= 2;

            /*$('#game-container').animate({
                backgroundPosition:backgroundCounter+"px"
            }, 1000, 'linear');*/
            $('#game-container').css('background-position', backgroundCounter + 'px');


            if (collision(player, enemyBee)) {
                livesLeft--;
                livesContainer.text(livesLeft);
                enemyBee.remove();
                $(newBee).appendTo(stage);
                enemyBee = $(stage).find('#enemy-bee');
                playerBlink(player);
            }
            if (collision(player, enemySlime)) {
                livesLeft--;
                livesContainer.text(livesLeft);
                enemySlime.remove();
                $(newSlime).appendTo(stage);
                enemySlime = $(stage).find('#enemy-slime');
                playerBlink(player);
            }

            if (flagBee && (enemyBee.offset().left < player.offset().left)) {
                score++;
                scoreContainer.text(score);
                flagBee = false;
            }
            if (flagSlime && (enemySlime.offset().left < player.offset().left)) {
                score++;
                scoreContainer.text(score);
                flagSlime = false;
            }




            window.requestAnimationFrame(gameLoop);
        }

    }

    function playerBlink(player) {
        player.hide();
        setTimeout(function() {
            player.show();
        }, 200);
    }

    function rotateEnemies() {
        if (stopEverything) return;
        if (enemyBee.css('right') == '-150px') {
            enemyBee.animate({
                'right': '100%'
            }, 5000, 'linear', function() {
                enemySlime.css('right', '-150px');
                flagSlime = true;
                rotateEnemies();
            });
        } else {
            enemySlime.animate({
                'right': '100%'
            }, 5000, 'linear', function() {
                enemyBee.css('right', '-150px');
                flagBee = true;
                rotateEnemies();
            });
        }

    }

    function collision($div1, $div2) {
        var x1 = $div1.offset().left;
        var y1 = $div1.offset().top;
        var h1 = $div1.outerHeight(true);
        var w1 = $div1.outerWidth(true);
        var b1 = y1 + h1;
        var r1 = x1 + w1;
        var x2 = $div2.offset().left;
        var y2 = $div2.offset().top;
        var h2 = $div2.outerHeight(true);
        var w2 = $div2.outerWidth(true);
        var b2 = y2 + h2;
        var r2 = x2 + w2;

        return !(b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2);
    }

    function setTimer() {
        var asd = setInterval(function () {
            if(stopEverything) window.clearInterval(asd);
            currentTime++;
            var stringTime = new Date(null);
            stringTime.setSeconds(currentTime);
            stringTime = stringTime.toISOString().substr(11, 8);
            time.text(stringTime);
        },1000);
    }

    $(window).on('keypress', function(e) {
        //console.log(e.which);
        switch (e.which) {
            case 115 ://S - squat
                $(player)
                    .find('img')
                    .attr('src', playerSquat)
                    .end()
                    .animate({
                            'padding-top' : '-40px'
                        }, 500, function() {
                            $(this).animate({
                                'padding-top': 0
                            }, 1000, function() {
                                $(this).find('img').attr('src', playerStandBy);
                            })
                        }
                    );
                break;
            case 119 ://W - jump
                $(player)
                    .find('img')
                        .attr('src', playerJump)
                    .end()
                    .animate({
                            'bottom' : '150px'
                        }, 500, function() {
                            $(this).animate({
                                'bottom': '10px'
                            }, 1000, function() {
                                $(this).find('img').attr('src', playerStandBy);
                            })
                        }
                    );
                break;

            case 112://P - pause/start

                break;
        }
    });

    $('#start').on('click', function() {
        gameLoop();
        rotateEnemies();
        window.location.hash = 'game-container';
        setTimer();
        $('audio').trigger('play');
    });

    $('.rock').on('click', function() {
        $('#footer').find('h4').text('You just took orders from a rock.');
    });

    $('#submit-score').on('click', function() {
        var playerName = $('input#name').val();
        var playerData = [playerName, time.text(), score];
        var storage = JSON.parse(localStorage.getItem('players'));
        storage.push(playerData);
        localStorage.setItem('players', JSON.stringify(storage));
        window.location.href = window.location.pathname + '#leaderboards';
        $('#name-modal').modal('hide');
        window.location.reload();
    });

})();