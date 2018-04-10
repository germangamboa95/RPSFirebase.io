
const appData = {}
let counter = 0;
const database = firebase.database();

//Log user in on load
firebase.auth().signInAnonymously().catch(function(error) {
  // Handle Errors here.
  let errorCode = error.code;
  let errorMessage = error.message;
  //Console log errors for now
  console.log(errorCode, errorMessage);
});

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    var isAnonymous = user.isAnonymous;
    uid = user.uid;
    console.log(uid);
    appData.user = uid;
    //Update users collection
    writeUserData(appData.user);
    //Attach disconnect listener
    setDisconnectListener(appData.user);
    getConnected();
    document.querySelector('#form').addEventListener('submit', function(e){
      e.preventDefault();

      let val = document.querySelector('#message').value;
      document.querySelector('#message').value = "";
      console.log(val);
      database.ref('msgs').push().set({
        byUser: appData.user,
        message: val
      });

    });



    //Event listener loop below
    connectedUsersUpdate();
    checkMsgs();



  } else {
    console.log('No one is logged in');

  }
});


function writeUserData(userId, stat = "connected") {
  firebase.database().ref('users/' + userId).set({
    username: userId,
    status: stat
  });
}

function setDisconnectListener(id) {

  var ref = firebase.database().ref("users/" + id + "/status");
  ref.onDisconnect().set("Disconnected");

}

function getConnected() {
  database.ref('users').once('value')
  .then(function(data) {
  // Handle new connected user
  });
}

function connectedUsersUpdate() {
  database.ref('users').on('child_changed', function(data) {
    let info = data.val();
    document.querySelector('.jumbotron').innerHTML += "<p>" + info.username +" has "+ info.status + "</p>";
  });
}

function checkMsgs() {
  database.ref('msgs').on('child_added' ,function(data) {
    let info = data.val();
    counter++;

      document.querySelector('.jumbotron').innerHTML += `<p id="${counter}"> ${info.byUser}:  ${info.message} </p>`;
      document.querySelector('#focus').href = "#" +counter;
      document.querySelector('#focus').click();
      document.querySelector('#message').focus();


  });
}
