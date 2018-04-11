
const DatabaseCtrl = (function(){
  //Firebase init
  var config = {
    apiKey: "AIzaSyBA10s-0KmX5gCCeoXwm7kt1q3uipXORdw",
    authDomain: "messages-b4983.firebaseapp.com",
    databaseURL: "https://messages-b4983.firebaseio.com",
    projectId: "messages-b4983",
    storageBucket: "messages-b4983.appspot.com",
    messagingSenderId: "592036438499"
  };

  firebase.initializeApp(config);
  const database = firebase.database();


  function setPlayer(data) {
    database.ref('players').child(data.name).set(data);
  }

  function setPlayerNumber() {
      return new Promise ( function(res, rej) {
        database.ref('players').once('value', function(data) {
        let counter = 1;
        for(let i in data.val()) {
          if(data.val()[i].connected == true){
            counter++;
          }
          if(counter > 2){
            document.body.innerHTML = "Too many Players, Go away!"
          }
        }

        res(counter);
      });
    });


}

  function loadOpponent(funct) {
      database.ref('players').on('child_added', funct)
  }

  function setTurn(data) {
    database.ref('turn').set(data)
  }

  function whoseTurn(cb) {
      database.ref('turn').on('value', cb);
  }

  function selectionsMade(appdata) {
    database.ref('players').on('value', function(data) {
      var compare = function(choice1,choice2) {
          if (choice1 === choice2) {
              return "tie";
          }
          if (choice1 === "rock") {
              if (choice2 === "scissors") {
                  // rock wins
                  return "win";
              } else {
                  // paper wins
                  return "lose";
              }
          }
          if (choice1 === "paper") {
              if (choice2 === "rock") {
                  // paper wins
                  return "win";
              } else {
                  // scissors wins
                  return "lose";
              }
          }
          if (choice1 === "scissors") {
              if (choice2 === "rock") {
                  // rock wins
                  return "lose";
              } else {
                  // scissors wins
                  return "win";
              }
          }
      };

      let playerOne = data.val()[appdata.player.name];
       playerOne = playerOne.selection;
      let opponent = data.val()[appdata.opponent.name];
          opponent =  opponent.selection;

          if(playerOne != 'none' && opponent != 'none'){
            database.ref('players').off();
            let result = compare(playerOne, opponent);
;

            if(result == 'win') {
              let playerOne = data.val()[appdata.player.name];
              let opponent = data.val()[appdata.opponent.name]
              appdata.player.wins++;
              appdata.opponent.losses++;


              database.ref('players/'+playerOne.name).set(appdata.player);
              database.ref('players/'+opponent.name).set(appdata.opponent);

            } else if( result == 'lose') {
              let playerOne = data.val()[appdata.player.name];
              let opponent = data.val()[appdata.opponent.name]
              appdata.player.losses++;
              appdata.opponent.wins++;
              database.ref('players/'+playerOne.name).set(appdata.player);
              database.ref('players/'+opponent.name).set(appdata.opponent);

            } else {
              let playerOne = data.val()[appdata.player.name];
              let opponent = data.val()[appdata.opponent.name]
              appdata.player.ties++
              appdata.opponent.ties++
              database.ref('players/'+playerOne.name).set(appdata.player);
              database.ref('players/'+opponent.name).set(appdata.opponent);

            }

            database.ref('turn').once('value', function(data) {
              let num = data.val();
              num++;
              setTurn(num);
            })

          }


    });

  }




  return {
    setPlayer: setPlayer,
    setNumber: setPlayerNumber,
    loadOpponentData: loadOpponent,
    whoseTurn: whoseTurn,
    setTurn: setTurn,
    selectionsMade: selectionsMade
  }

})()


const UiCtrl = (function(AppCtrl, DatabaseCtrl){

  function playerCard(data) {
    console.log(data);
    let markup =
    `
    <div id="_${data.playerNumber}">
    <h2>${data.name}</h2>
    <form id="selection">
    <label for="rock">Rock </label>
    <input id="rock" type="checkbox" name="rock" value="rock">
    <label for="stone">scissors</label>
    <input id="stone" type="checkbox" name="scissors" value="scissors">
    <label for="paper">Paper</label>
    <input id="paper" type="checkbox" name="paper" value="paper">
    <button type="submit">Submit</button>
    </form>
    <div>
      <p>Wins: ${data.wins}</p>
      <p>Ties: ${data.ties}</p>
      <p>Losses: ${data.losses}</p>
      <p>Number: ${data.playerNumber}</p>
    </div>
    </div>

    `;
    document.querySelector('#player-one').innerHTML = markup;
  }

  function opponentCard(data) {
    console.log(data);
    let markup =
    `

    <div id="_${data.playerNumber}">
    <h2>${data.name}</h2>
    <h2>Waiting on opponent to choose...</h2>
    <div>
      <p>Wins: ${data.wins}</p>
      <p>Ties: ${data.ties}</p>
      <p>Losses: ${data.losses}</p>
      <p>Number: ${data.playerNumber}</p>
    </div>
    </div>

    `;
    document.querySelector('#player-two').innerHTML = markup;
  }

  return {
    addPlayerCard: playerCard,
    opponentCard: opponentCard
  }

})()

const AppCtrl = (function(){

  const DOM = {
    playerLogin: '#player-name',
    addPlayer: '#add-player',
    playerOneBox: '#player-one',
    playerTwoBox: '#player-two'
  };

  const sessionData = {
    player: {
      name:"",
      wins: 0,
      losses: 0,
      ties: 0,
      connected: false,
      playerNumber: '',
      selection: "none"

    },
    opponent:  {
      name:"",
      wins: "",
      losses: "",
      ties: "",
      connected: "",
      playerNumber: "",
      selection: "none"
    },
    turn: 0
  };

  //set turn
  let turnCheck = (data) => {
    if(data.val() == 1){
      console.log('User one turn')
      document.querySelector('#_1').style.backgroundColor = 'green';
      document.querySelector('#_2').style.backgroundColor = 'red';
    } else {
      console.log("opp turn");
      document.querySelector('#_1').style.backgroundColor = 'red';
      document.querySelector('#_2').style.backgroundColor = 'green';
    }
  }








  //add opponent
  function loadOpponent() {
    let test = (data) => {
      if(data.val().name != sessionData.player.name){
        console.log(data.val(), " hey");
        sessionData.opponent = data.val();
        UiCtrl.opponentCard(sessionData.opponent);
        turnCheck();
      }

    };
    DatabaseCtrl.loadOpponentData(test);

  }


  function setDisconnectListener(id) {

    var ref = firebase.database().ref('players/' + id);
      firebase.database().ref('players').on('child_removed', function() {
        document.querySelector('#player-two').innerHTML = `<h3>opponent left</h3>`;
        DatabaseCtrl.setNumber()
        .then(res => {

          sessionData.player.playerNumber = res - 1;
          DatabaseCtrl.setPlayer(sessionData.player);
          UiCtrl.addPlayerCard(sessionData.player);

        });
    })
    ref.onDisconnect().remove();


  }


  let reset = () => {

      //DatabaseCtrl.setPlayer(sessionData.player);
      sessionData.player.selection = 'none';
      sessionData.opponent.selection = 'none';
      UiCtrl.addPlayerCard(sessionData.player);
      loadOpponent();
      setDisconnectListener(sessionData.player.name);
      selectionListener();
  }







  //EventListeners for player added
  document.querySelector(DOM.addPlayer).addEventListener('click', function(e) {
    sessionData.player.name = document.querySelector(DOM.playerLogin).value;
    document.querySelector(DOM.playerLogin).value = "";

    sessionData.player.connected = true;

    DatabaseCtrl.setNumber()
    .then(res => {
      sessionData.player.playerNumber = res;
      DatabaseCtrl.setPlayer(sessionData.player);
      UiCtrl.addPlayerCard(sessionData.player);
      setDisconnectListener(sessionData.player.name);

      selectionListener();

    });

  });

  //EventListner for weapon selected

  function selectionListener() {
    document.querySelector('#selection').addEventListener('submit', function(e) {
      e.preventDefault();
      console.log(e);
      for(let i = 0; i < 3; i++) {
        if(e.target[i].checked == true) {
          sessionData.player.selection = e.target[i].value;
          break;
        }
      }
      document.querySelector('#selection').style.display = "none";
      DatabaseCtrl.setPlayer(sessionData.player);
      loadOpponent();
      DatabaseCtrl.selectionsMade(sessionData);
      DatabaseCtrl.whoseTurn(reset);


    });

  }



})(UiCtrl, DatabaseCtrl)
