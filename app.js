
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

  function selectionsMade() {
    database.ref('players').on('value', function(data) {
      console.log(data.val());

    });

  }




  return {
    setPlayer: setPlayer,
    setNumber: setPlayerNumber,
    loadOpponentData: loadOpponent,
    whoseTurn: whoseTurn,
    setTurn: setTurn,
    selectionsMade, selectionsMade
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
    <label for="stone">Stone </label>
    <input id="stone" type="checkbox" name="stone" value="stone">
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
      selection: ""
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
        DatabaseCtrl.whoseTurn(turnCheck);
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
      loadOpponent();
      selectionListener();

    });

  });

  //EventListner for weapon selected

  function selectionListener() {
    document.querySelector('#selection').addEventListener('submit', function(e) {
      e.preventDefault();
      for(let i = 0; i < 3; i++) {
        if(e.target[i].checked == true) {
          sessionData.player.selection = e.target[i].value;
          break;
        }
      }
      DatabaseCtrl.setPlayer(sessionData.player);
      DatabaseCtrl.selectionsMade();

    });

  }



})(UiCtrl, DatabaseCtrl)
