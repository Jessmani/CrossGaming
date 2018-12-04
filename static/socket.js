window.addEventListener('DOMContentLoaded', function() {

    // - V A R I A B L E S - //

    var webSocketConnection = io("https://crossgaming.herokuapp.com/index");
    var connectionForm = document.getElementById('connection-form');
    var registrationForm = document.getElementById('registration-form');
    var name = document.getElementById("name");
    var demandeDajout = document.getElementById("demandedajout");
    var arrayOfMessage = [];
    var arrayOfMessageInTchat = [];
    var arrayOfFriends = [];
    var arrayOfFriendsThatAccept = [];
    var arrayOfMessageLive = [];
    var boutonAjouter = document.getElementById("ajouter");
    //var acceptButton = document.getElementById("ajouter");
    var boutonAccepter = document.getElementById("accept");
    var boutonRefuser = document.getElementById("refuse");
    var blocFriends = document.getElementById("bloc-friends");
    var nameStocked;
    var nameOfThePersonThatClick;
    var friendListChat = document.getElementById("selectionamis");
    var tchatBox = document.getElementById("chatbox");
    var tchatBar = document.getElementById("tchatbar");
    var sendMessageOnTchat = document.getElementById("envoyer");
    var returnOnMyWall = document.getElementById("return");

     // - C O N N E X I O N  - //

    var connectionOk = function() {     // - Si la connexion est validé - //
        webSocketConnection.on('ConnectionOK', function(dataFromServer) { 
            console.log(dataFromServer.arrayOfUsers)   
            var connection = document.getElementById("connection");
            connection.style.display = "none"; // Le cadre de login disparaît si la connexion est validé

            var i;

            tchatBar.style.display = "block";
            sendMessageOnTchat.style.display = "block";

            // Etant donnée que le nombre d'utilisateurs n'est pas prédéfini à l'avance dans un réseau social (pas comme sur mon jeu multi ou seulement 2 utilisateurs pouvaient être connectés), je dois boucler pour tester si la valeur de ce que l'utilisateur tape correspond a une des données utilisateurs stocker côté serveur
            for(i=0; i < dataFromServer.arrayOfUsers.length; i++) { 
                if(document.getElementById("loginConnection").value || document.getElementById("loginRegistration").value == dataFromServer.arrayOfUsers[i].login) {
                    name.style.display = "inline-block";
                    name.style.cssFloat = "right";
                    if(dataFromServer.arrayOfUsers[i].pseudo) {
                        console.log("Login : ", dataFromServer.arrayOfUsers[i].login)
                        console.log("Pseudo : ", dataFromServer.arrayOfUsers[i].pseudo)
                        name.innerHTML = dataFromServer.arrayOfUsers[i].login + ' ' + '"' + dataFromServer.arrayOfUsers[i].pseudo + '"'; // je reçois du back le login et le pseudo
                    } else {
                        name.innerHTML = dataFromServer.arrayOfUsers[i].login; // je reçois du back le login car le pseudo n'existe pas encore
                        console.log("Login : ", dataFromServer.arrayOfUsers[i].login)
                        console.log("Pseudo : Pas encore définit")
                    } 
                } else {
                    console.log("erreur");
                }
            }

            var myAccount = document.getElementById("myaccount");
            myAccount.style.display = "block";

            var banner = document.getElementById("banner");
            banner.style.display = "block";

            boutonAccepter.style.display = "none";
            boutonRefuser.style.display = "none";

            webSocketConnection.on("messagesinDB", function(dataFromServer) {
                // message bien reçu du back-end

                var Paragraphe = function(i) {
                    this.para = document.createElement("p");
                    this.para.id = "messagefromserver" + i;
                    this.para.className = "messageindb"
                    document.getElementById("messagefromserver").appendChild(this.para);
                }

                console.log("message reçu du back:", dataFromServer.message[0])
                console.log("longueur de mon tableau de message ici du back:", dataFromServer.message.length)

                var messageFromServeurNumber = 1;

                for(i = 0; i < dataFromServer.message.length; i++) {
                    console.log("Entrée de boucle :", document.getElementsByClassName("messageindb").length)  
                    var messageParagraphe = new Paragraphe(messageFromServeurNumber++);       
                    if(document.getElementsByClassName("messageindb")) { 
                        console.log("Entrée 2ème condition length :", document.getElementsByClassName("messageindb").length)
                        console.log("Entrée 2ème condition indice + id :", document.getElementsByTagName("p")[i+1].id) 
                        console.log("Tour de boucle numéro : ", i)

                        var messageFromServeur = dataFromServer.message[i];
                        var messageSentFromServeur = document.getElementsByClassName("messageindb")[i];
                        messageSentFromServeur.innerText = messageFromServeur;
                    } 
                }

                if(document.getElementsByClassName("messageindb").length >= 5) {
                    console.log("J'ai bien envoyé plus de 5 messages !")
                    document.getElementById("avatarimg").src = "/static/ironman.png";
                }
            })

            // Reste a faire la même chose pour la PS4 ainsi qu'à ajouter la maj au niveau du FriendFind si jamais il accepte
            webSocketConnection.on("platformchoicefromserver", function(dataFromServer) {
                console.log("dataFromSever.platformchoicefromserver", dataFromServer.platformchoicefromserver)
                if(dataFromServer.platformchoicefromserver == "pc") {
                    document.getElementById("ps4").style.display = "none";
                    document.getElementById("pc").src ="/static/pcvalid.png" 
                } else {
                    if(dataFromServer.platformchoicefromserver == "ps4") {
                        document.getElementById("pc").style.display = "none";
                        document.getElementById("ps4").src ="/static/PS4valid.png"  
                    }
                }
            })

            webSocketConnection.on("admin", function(dataFromServer) {
                
                    console.log("dataFromServer.allusersinfos[0]", dataFromServer.allusersinfos[0]);
                    console.log("Admin Connected !")

                    document.getElementById("header").style.display = "none";
                    document.getElementById("banner").style.display = "none";
                    document.getElementById("chatbox").style.display = "none";
                    document.getElementById("bloc-challenge").style.display = "none";
                    document.getElementById("bloc-friends").style.display = "none";
                    document.body.style.backgroundImage = "url('static/wallpaperbg.jpg')";

                    console.log("All users's infos : ", dataFromServer.allusersinfos);

                    var titleadmin = document.createElement("h1");
                    titleadmin.style.color = "white";
                    titleadmin.innerHTML = "FEEL THE POWER";
                    titleadmin.style.fontSize = "5vw";
                    titleadmin.style.fontStyle = "italic";
                    titleadmin.style.textAlign = "center"; 
                    titleadmin.style.width = "100%";
                    titleadmin.style.margin = "0"; 
                    document.body.appendChild(titleadmin);


                    if(dataFromServer.allusersinfos[1]) {
                        
                        /////////////////////////////// USER 1 ///////////////////////////////
                        
                        var firstUser = document.createElement("p");

                        var imgClose = document.createElement("img");
                        imgClose.src = "/static/close.png";
                        imgClose.style.width = "2%";
                        imgClose.id = "closeaccount"
                        imgClose.style.position = "absolute";
                        imgClose.style.top = "10px";
                        imgClose.style.right = "10px";

                        firstUser.innerHTML = dataFromServer.allusersinfos[1].login;
                        firstUser.style.backgroundColor = "black";
                        firstUser.style.textTransform = "uppercase";
                        firstUser.style.letterSpacing = "15px";
                        firstUser.style.fontSize = "1.4vw";
                        firstUser.style.fontFamily = "Bebas Neue";
                        firstUser.style.color = "white";
                        firstUser.style.border = "2px groove white";
                        firstUser.style.padding = "5px";
                        firstUser.style.position = "relative";
  
                        document.body.appendChild(firstUser);
                        firstUser.appendChild(imgClose);

                        imgClose.addEventListener("click", function() {
                            document.getElementById("closeaccount").parentNode.remove();
                            console.log("J'ai cliqué sur le croix pour supprimer un utilisateur !")
                            webSocketConnection.emit("userdeleted", {
                                userdeleted: dataFromServer.allusersinfos[1].login
                            })
                        });

                        // MESSAGES USER 1

                        if(dataFromServer.allusersinfos[1].message) {
                            for(i = 0; i < dataFromServer.allusersinfos[1].message.length; i++) {
                                
                                
                                var messagesOfFirstUser = document.createElement("p");
                                messagesOfFirstUser.id = "messages" + i;
                                messagesOfFirstUser.innerHTML = dataFromServer.allusersinfos[1].message[i];
                                messagesOfFirstUser.style.color = "white";
                                messagesOfFirstUser.style.position = "relative";
                                messagesOfFirstUser.style.border = "1px dashed white";
                                messagesOfFirstUser.style.padding = "5px";

                                var imgCloseMsg = document.createElement("img");
                                imgCloseMsg.src = "/static/close.png";
                                imgCloseMsg.id = "close" + i;
                                imgCloseMsg.style.width = "2%";
                                imgCloseMsg.style.position = "absolute";
                                imgCloseMsg.style.top = "4px";
                                imgCloseMsg.style.right = "10px";

                                messagesOfFirstUser.appendChild(imgCloseMsg);

                                document.body.appendChild(messagesOfFirstUser);

                                var indexStocked = i;
                                console.log(indexStocked)

                                imgCloseMsg.addEventListener("click", function(event) {

                                    // Récupération du nombre situé dans l'id de l'icone "close" du message que je veux supprimer

                                    console.log("event.target", event.target);

                                    var closeClicked = event.target;

                                    console.log("closeClicked", closeClicked.getAttribute("id"))

                                    closeClicked = closeClicked.getAttribute("id");

                                    console.log("Nouvelle valeur closeClicked", closeClicked)

                                    console.log("document.getElementById(closeClicked)", document.getElementById(closeClicked).parentNode.remove())

                                    closeClicked = closeClicked.match(/\d/g);

                                    console.log("closeClicked RegEx", closeClicked);

                                    closeClicked =  closeClicked.toString();

                                    console.log("closeClicked array to string : ", closeClicked);

                                    closeClicked = parseInt(closeClicked);

                                    console.log("closeClicked parseInt", closeClicked);

                                    var indexCloseClicked = closeClicked;

                                    webSocketConnection.emit("messagedeleted", {
                                        user: dataFromServer.allusersinfos[1].login,
                                        messagedeleted: dataFromServer.allusersinfos[1].message[indexCloseClicked]
                                    })
                                })
                            }
                        }  
                    } 
                    
                    if(dataFromServer.allusersinfos[2]) {
                        
                        /////////////////////////////// USER 2 ///////////////////////////////
                        
                        var secondUser = document.createElement("p");

                        var imgCloseSecondUser = document.createElement("img");
                        imgCloseSecondUser.src = "/static/close.png";
                        imgCloseSecondUser.style.width = "2%";
                        imgCloseSecondUser.id = "closeaccountseconduser"
                        imgCloseSecondUser.style.position = "absolute";
                        imgCloseSecondUser.style.top = "10px";
                        imgCloseSecondUser.style.right = "10px";

                        secondUser.innerHTML = dataFromServer.allusersinfos[2].login;
                        secondUser.style.backgroundColor = "black";
                        secondUser.style.textTransform = "uppercase";
                        secondUser.style.letterSpacing = "15px";
                        secondUser.style.fontSize = "1.4vw";
                        secondUser.style.fontFamily = "Bebas Neue";
                        secondUser.style.color = "white";
                        secondUser.style.border = "2px groove white";
                        secondUser.style.padding = "5px";
                        secondUser.style.position = "relative";
  
                        document.body.appendChild(secondUser);
                        secondUser.appendChild(imgCloseSecondUser);

                        imgCloseSecondUser.addEventListener("click", function() {
                            document.getElementById("closeaccountseconduser").parentNode.remove();
                            console.log("J'ai cliqué sur le croix pour supprimer un utilisateur !")
                            webSocketConnection.emit("seconduserdeleted", {
                                userdeleted: dataFromServer.allusersinfos[2].login
                            })
                        });

                        // MESSAGES USER 2

                        if(dataFromServer.allusersinfos[2].message) {
                            for(i = 0; i < dataFromServer.allusersinfos[2].message.length; i++) {
                                
                                
                                var messagesOfSecondUser = document.createElement("p");
                                messagesOfSecondUser.id = "messagesofseconduser" + i;
                                messagesOfSecondUser.innerHTML = dataFromServer.allusersinfos[2].message[i];
                                messagesOfSecondUser.style.color = "white";
                                messagesOfSecondUser.style.position = "relative";
                                messagesOfSecondUser.style.border = "1px dashed white";
                                messagesOfSecondUser.style.padding = "5px";

                                var imgCloseMsgSecondUser = document.createElement("img");
                                imgCloseMsgSecondUser.src = "/static/close.png";
                                imgCloseMsgSecondUser.id = "closemsgseconduser" + i;
                                imgCloseMsgSecondUser.style.width = "2%";
                                imgCloseMsgSecondUser.style.position = "absolute";
                                imgCloseMsgSecondUser.style.top = "4px";
                                imgCloseMsgSecondUser.style.right = "10px";

                                messagesOfSecondUser.appendChild(imgCloseMsgSecondUser);

                                document.body.appendChild(messagesOfSecondUser);

                                var indexStocked = i;
                                console.log(indexStocked)

                                imgCloseMsgSecondUser.addEventListener("click", function(event) {

                                    // Récupération du nombre situé dans l'id de l'icone "close" du message que je veux supprimer

                                    console.log("event.target", event.target);

                                    var closeClicked = event.target;

                                    console.log("closeClicked", closeClicked.getAttribute("id"))

                                    closeClicked = closeClicked.getAttribute("id");

                                    console.log("Nouvelle valeur closeClicked", closeClicked)

                                    console.log("document.getElementById(closeClicked)", document.getElementById(closeClicked).parentNode.remove())

                                    closeClicked = closeClicked.match(/\d/g);

                                    console.log("closeClicked RegEx", closeClicked);

                                    closeClicked =  closeClicked.toString();

                                    console.log("closeClicked array to string : ", closeClicked);

                                    closeClicked = parseInt(closeClicked);

                                    console.log("closeClicked parseInt", closeClicked);

                                    var indexCloseClicked = closeClicked;

                                    webSocketConnection.emit("messagedeletedseconduser", {
                                        user: dataFromServer.allusersinfos[2].login,
                                        messagedeleted: dataFromServer.allusersinfos[2].message[indexCloseClicked]
                                    })
                                })
                            }
                        }  
                    }
            });
        });
    };

    returnOnMyWall.style.display = "none";
    returnOnMyWall.style.color = "white";
    returnOnMyWall.style.margin = "0px";
    returnOnMyWall.style.cursor = "pointer";

    // CHOIX PLATEFORME DE JEU PREFERER
    document.getElementById("pc").addEventListener("click", function() {
        document.getElementById("ps4").style.display = "none";
        document.getElementById("pc").src ="/static/pcvalid.png"   

        webSocketConnection.emit("platformchoice", {
            name: name.innerHTML,
            platformchoice: "pc"
        })
    });

    document.getElementById("ps4").addEventListener("click", function() {
        document.getElementById("pc").style.display = "none";
        document.getElementById("ps4").src ="/static/PS4valid.png"   

        webSocketConnection.emit("platformchoice", {
            name: name.innerHTML,
            platformchoice: "ps4"
        })
    });



    sendMessageOnTchat.addEventListener("click", function() {
        console.log("JE CLIQUE !!")
        arrayOfMessageLive.push(document.getElementById("tchatbar").value);
        var msgInstantLive = document.getElementById("tchatbar").value;
        console.log("Tableau de message live : ", arrayOfMessageLive);

        webSocketConnection.emit("friendclicked", { 
            name: name.innerHTML,
            messagesentinlive: arrayOfMessageLive,
        })
    });

    webSocketConnection.on("renvoiemessagelive", function(dataFromServer) {
        console.log("dataFromServeur.msg ligne 123", dataFromServer)

        var msg = document.createElement("p");
        document.getElementById("livemessages").appendChild(msg);

        console.log("dataFromServer.name", dataFromServer.name);

        for(i = 0; i < dataFromServer.msg.length; i++) {    
            var messageFromServer = dataFromServer.msg[i];
            var nameFromServer = dataFromServer.name[i];
            msg.innerText = dataFromServer.name + " : " + messageFromServer;      
        }
    })

    // RENVOIE EN LIVE DE LA PERSONNE QUI AJOUTE EN AMI
    webSocketConnection.on("RenvoieDuDemandeur", function(dataFromServeur) {
        if(dataFromServeur.demandeur !== name.innerHTML) { // essayer de faire une condition pour comparer les ID afin d'éviter de recevoir le message d'invitation quand je suis sur le compte de celui qui demande
            console.log("La demande d'ajout provient de :", dataFromServeur.demandeur);
            var demandeDajout = document.getElementById("demandedajout");
            demandeDajout.innerHTML = dataFromServeur.demandeur + " veut vous ajouter !";
            console.log("demandeDajout.innerHTML", demandeDajout.innerHTML)
            demandeDajout.style.color = "white";
            demandeDajout.style.cssFloat = "right";
            demandeDajout.style.clear = "both";
            demandeDajout.style.display = "block";

            boutonAccepter.style.display = "block";
            boutonRefuser.style.display = "block";
        }

        console.log("POURQUOI TU M'AFFICHES LE MAUVAIS NOMMMMMMMMMMM", dataFromServeur.demandeur)

        boutonAccepter.addEventListener("click", function() {
            console.log("nom du demandeur reçu du back avant le push", dataFromServeur.demandeur)
            console.log("Tableau d'amis avant le push du demandeur : ", arrayOfFriends)

            arrayOfFriendsThatAccept.push(name.innerHTML)
            arrayOfFriends.push(dataFromServeur.demandeur);

            for(i=0; i < arrayOfFriends.length; i++) {
                if(arrayOfFriends[i+1] == name.innerHTML) {
                    arrayOfFriends[i].remove();
                }
            }

            console.log("J'ai cliqué sur accepter ! Bienvenue dans ma liste d'ami :D. Tableau d'amis : ", arrayOfFriends)

            webSocketConnection.emit("accepter", {
                //ajouter nomdudemandeur pour l'envoyer au back et ajouter ami egalement dans ses amis
                nomdureceveur: name.innerHTML,
                friendaccepted: arrayOfFriends,
                nomdureceveurarray: arrayOfFriendsThatAccept
            })
            //boucle sur les utilisateurs de mon futur tableau de demande. Lors de l'acceptation envoyer le résultat au back puis supprime le "demanderecude" correspondant au login
            demandeDajout.style.display = "none"; // j'enlève le message de demande d'amis quand l'utilisateur a accepté
            boutonAccepter.style.display = "none";
            boutonRefuser.style.display = "none";
        })

        boutonRefuser.addEventListener("click", function() {
            console.log("J'ai cliqué sur refuser ! Désolé mais non j'accepte pas les noobs.. haha")
            boutonAccepter.style.display = "none";
            boutonRefuser.style.display = "none";
        })
    })

    // AFFICHAGE DES AMIS PRESENT DANS LA BDD //

    webSocketConnection.on("AmisPresentDansLaBDD", function(dataFromServer) {

        console.log("amis dans la BDD", dataFromServer.amisdanslabdd)
        console.log("nombre d'amis dans la BDD", dataFromServer.amisdanslabdd.length)

        var p = document.createElement("p");

        p.innerHTML = "Prochain duel : ";

        p.style.color = "white";
        p.style.fontSize = "20px"
        p.style.fontFamily = "Bebas Neue";

        document.getElementById("bloc-friends").appendChild(p);

        document.getElementById("bloc-friends").style.backgroundImage = "url('static/versus.png')";
        document.getElementById("bloc-friends").style.backgroundSize = "cover";

        for(i = 0; i < dataFromServer.amisdanslabdd.length; i++) {

            /* BUG FIX, EVITER D'AFFICHER PLUSIEURS FOIS LE MEME AMI */

            if(document.getElementById("frd" + i)) { 
                console.log("lami est déjà écrit dans le DOM donc suppression")
                document.getElementById("frd"+i).remove();
            } 

            ///////////////////////////////////////////////////////////

            var Friends = function(i) {
                this.frd = document.createElement("p");
                this.frd.id = "frd" + i;
                this.frd.innerHTML = dataFromServer.amisdanslabdd[i];
                this.frd.className = "friends"
               // this.frd.style.fontFamily = 'Bebas Neue, Verdana, Impact, sans-serif;'
                document.getElementById("bloc-friends").appendChild(this.frd);
            }
            new Friends(i);

            /*
            if(document.getElementById("frd0")) {
                document.getElementById("frd0").style.fontSize = "20px";
            }*/
        }

/*  CLIQUE SUR LUTILISATEUR DANS MA LISTE
        for(var i=0; i<document.querySelectorAll(".friends").length; i++){
            console.log("indice entrée de boucle ligne 224", i)
            document.querySelectorAll(".friends")[i].addEventListener("click", function() {
            console.log("indice entrée de addEventListener ligne 226", i)
              console.log(this.textContent);
              var friendsClick = this.textContent;
              webSocketConnection.emit("friendsclick", { // Envoie au back de l'ami sur lequel je clique afin de recharger la page avec toutes ces infos
                friendsclick: friendsClick
              })
            });
        }*/
    })

    /* PROPOSER UNE PARTIE */
        var buttonChallengeSomeone = document.getElementById("challenge");
        var messageNumber = 1;
        
        var Message = function(i) {
            this.msg = document.createElement("p");
            this.msg.id = "msg" + i;
            this.msg.className = "envoiemessage"
            document.getElementById("bloc-message").appendChild(this.msg);
        }

        //console.log("tableau de message", arrayOfMessage);

        buttonChallengeSomeone.addEventListener("click", function() {
            if(document.getElementById("asktoplay").value == "") {
                alert("Bah alors ?! On se rétracte, on a peur de m'affronter ? Hahaha #FEAR");
            } else {
                var oneMessage = new Message(messageNumber++);
                if(document.getElementsByClassName("envoiemessage").length > 0) {
                console.log("Entrée 1ère condition :", document.getElementsByClassName("envoiemessage").length)
                    for(i = document.getElementsByClassName("envoiemessage").length-1; i < document.getElementsByClassName("envoiemessage").length; i++) {
                        console.log("Entrée de boucle :", document.getElementsByClassName("test").length)         
                        if(document.getElementsByClassName("envoiemessage")) { // Je test s'il y a un nombre contenu dans l'ID d'un de mes paragraphes
                            console.log("Entrée 2ème condition length :", document.getElementsByClassName("envoiemessage").length)
                            console.log("Entrée 2ème condition indice + id :", document.getElementsByTagName("p")[i+1].id) 
                            console.log("Tour de boucle numéro : ", i)

                            document.getElementsByClassName("envoiemessage")[i].style.color = "black";

                            var askToPlay = document.getElementById("asktoplay").value;
                            var messageSent =  document.getElementsByClassName("envoiemessage")[i];;
                            messageSent.innerText = askToPlay + " publié le " + new Date().toLocaleString();

                            arrayOfMessage.push(messageSent.innerText);
                            console.log("tableau de message : ", arrayOfMessage)
                                
                            webSocketConnection.emit("userchallenge", {
                                login: document.getElementById("name").innerHTML.split('"')[0].split(' ').join(''),
                                message: arrayOfMessage
                            })
                        } 
                    }
                }
                
                if(document.getElementsByClassName("envoiemessage").length >= 5) {
                    console.log("J'ai bien envoyé plus de 5 messages !")
                    document.getElementById("avatarimg").src = "/static/ironman.png";
                }
           }
        });
    
    ////////////////////////////////////////////////////////////////////////////////


    connectionForm.addEventListener("submit", function(event) {
        event.preventDefault();

        webSocketConnection.emit('login', {
            login: document.getElementById("loginConnection").value, 
            password: document.getElementById("passwordConnection").value
        });

        webSocketConnection.on("ConnectionError", function(dataFromServer) {
            var messageError = document.getElementById("connectionerror");
            messageError.style.display = "block";
            messageError.innerHTML = dataFromServer.message; 
        });

        webSocketConnection.on("StillConnected", function(dataFromServer) {
            var stillConnected = document.getElementById("stillconnected");
            stillConnected.style.display = "block";
            stillConnected.innerHTML = dataFromServer.message; 
        });

        connectionOk();
    });

    // - F O R M U L A I R E  D ' I N S C R I P T I O N  - //

    var messageError = function(action) {
        webSocketConnection.on(action, function(dataFromServer) {
            var messageErrorID = document.getElementById("registration-error");
            messageErrorID.style.display = "block";
            messageErrorID.innerHTML = dataFromServer.message;
        });
    }

    registrationForm.addEventListener("submit", function(event) {
        event.preventDefault();

        webSocketConnection.emit('registration', {
            login: document.getElementById("loginRegistration").value, 
            password: document.getElementById("passwordRegistration").value,
            mail: document.getElementById("emailRegistration").value
        });

        messageError("insertId");
        messageError("insertPwd");
        messageError("insertMail");
        messageError("otherId");
        messageError("otherMail");

        connectionOk();
    });

    // CHOIX DU PSEUDO
    //input
    var pseudo = document.getElementById("pseudo");

    //submit
    var buttonValidPseudo = document.getElementById("buttonvalidpseudo");
    var chooseANickName = document.getElementById("chooseanickname");

    /*buttonValidPseudo.addEventListener("click", function() {
        if(pseudo.value == "") {
            console.log("aucun pseudo");
        } else {
            console.log("mon pseudo :", pseudo.value);

            console.log("mon login :", name.innerHTML);

            webSocketConnection.emit("SendPseudoToServer", {
                pseudo: pseudo.value,
                login: name.innerHTML
            })

            chooseANickName.style.display = "none";

            webSocketConnection.on("ResendPseudoToFront", function(dataFromServer) {
                name.innerHTML = name.innerHTML + ' ' + '"' + pseudo.value + '"'; // juste pour la première connexion, je me base uniquement sur le front
            })    
        }
    })*/

    // RECHERCHER UN AMI
    var buttonValidSeekFriends = document.getElementById("buttonvalidseekfriends");
    var friends = document.getElementById("friends");
    var blocmessage = document.getElementById("bloc-message");

    buttonValidSeekFriends.addEventListener("click", function() { // au clique sur le bouton rechercher un ami
        console.log("J'ai bien cliqué !")
        webSocketConnection.emit("resultfriends", { // j'envoie un message au back avec le nom de l'ami
            myname: name.innerHTML,
            result: friends.value
        });
    })

    webSocketConnection.on("allinfosOfThePersonThatWantToReturnToHisWall", function(dataFromServer) {

        // NE PLUS AFFICHER LE NOM DE L'AMI RECHERCHé

        var friendFind = document.getElementById("friendfind");
        friendFind.style.display = "none";

        tchatBox.style.display = "block";
        sendMessageOnTchat.style.display = "block";
        tchatBar.style.display = "block";
        boutonAjouter.style.display = "none"; 
        document.getElementById("demandedajout").style.display = "none";
        document.getElementById("accept").style.display = "none";
        document.getElementById("refuse").style.display = "none";


        // NOM + BOUTON RETOUR SUR MON PROFIL

        name.innerHTML = dataFromServer.allinfosreturnwall.login;
        returnOnMyWall.style.display = "none";

        // PLATFORM

        if(dataFromServer.allinfosreturnwall.platform == "pc") {
            console.log("plateform ami PC")
            if(document.getElementById("pc")) {
             document.getElementById("ps4").style.display = "none";
             }
             document.getElementById("pc").style.display = "inline-block"; 
         } else {
             if(dataFromServer.allinfosreturnwall.platform == "ps4") {
                 console.log("plateform ami PS4")
                 if(document.getElementById("pc")) {
                 document.getElementById("pc").style.display = "none";
                 }
                 if(document.getElementById("ps4")) {
                 document.getElementById("ps4").style.display = "inline-block"; 
                 }
             }
         }

         // AFFICHER MES MESSAGES
         
         var Paragraphe = function(i) {
            this.para = document.createElement("p");
            this.para.id = "messagefromserver" + i;
            this.para.className = "messageindb";
            document.getElementById("messagefromserver").appendChild(this.para);
        }

        var messageFromServeurNumber = 1;

        if(dataFromServer.allinfosreturnwall.message) {
            console.log("dataFromServer.allinfosreturnwall.message", dataFromServer.allinfosreturnwall.message.length)
            if(dataFromServer.allinfosreturnwall.message.length >= 5) {
                console.log("J'ai bien envoyé plus de 5 messages !")
                document.getElementById("avatarimg").src = "/static/ironman.png";
            } else {
                document.getElementById("avatarimg").src = "/static/noob.png"; 
            }
  
/*
            if(document.getElementsByClassName("envoiemessage").length >= 5) {
                console.log("J'ai bien envoyé plus de 5 messages !")
                document.getElementById("avatarimg").src = "/static/ironman.png";
            }
*/
            for(i = 0; i < dataFromServer.allinfosreturnwall.message.length; i++) {
                console.log(dataFromServer.allinfosreturnwall.message[0])
                
                var messageParagraphe = new Paragraphe(messageFromServeurNumber++); 

                if(document.getElementsByClassName("messageindb")) { 

                    var messageFromServeur = dataFromServer.allinfosreturnwall.message[i];
                    var messageSentFromServeur = document.getElementsByClassName("messageindb")[i];
                    messageSentFromServeur.innerText = messageFromServeur;

                    if(document.getElementsByClassName("messageindb").length > dataFromServer.allinfosreturnwall.message.length) {

                        var soustractionMessages = document.getElementsByClassName("messageindb").length - dataFromServer.allinfosreturnwall.message.length;

                        for(j = 0; j < document.getElementsByClassName("messageindb").length; j++) {
                            if(document.getElementsByClassName("messageindb")[j].innerHTML !== dataFromServer.allinfosreturnwall.message[j]) {
                                document.getElementsByClassName("messageindb")[j].remove();
                            }
                        }
                    } 
                } 
            }
        } 

        if(document.getElementById("asktoplay")) {
            document.getElementById("asktoplay").style.display = "block";
        }

        if(document.getElementById("challenge")) {
            document.getElementById("challenge").style.display = "block";
            document.getElementById("challenge").style.margin = "auto";
        }


        //document.getElementsByClassName("friends").remove();



        if(dataFromServer.allinfosreturnwall.friends) {
            for(i=0; i < dataFromServer.allinfosreturnwall.friends.length; i++) {

                var Friends = function(i) {
                    this.frd = document.createElement("p");
                    this.frd.id = "frd" + i;
                    this.frd.innerHTML = dataFromServer.allinfosreturnwall.friends[i];
                    this.frd.className = "friends"
                    document.getElementById("bloc-friends").appendChild(this.frd);
                }
                new Friends(i);
            }
        }

        for(j = 0; j < document.getElementsByClassName("friends").length; j++) {
            if(document.getElementsByClassName("friends")[j].innerHTML == name.innerHTML) {       
                console.log("document.getElementsByClassName(friends)[j]", document.getElementsByClassName("friends")[j])
                document.getElementsByClassName("friends")[j].remove();
            }
        }
    })

    webSocketConnection.on("friendFind", function(dataFromServer) { // Je reçois le nom de l'ami trouvé côté front

        nameOfThePersonThatClick = document.getElementById("name").innerHTML; // Je stock le nom de la personne qui a recherché et cliqué sur le nom d'un ami
        console.log("nameOfThePersonThatClick", nameOfThePersonThatClick)

        var friendFind = document.getElementById("friendfind");
        friendFind.innerHTML = dataFromServer.friendname;

        if(friendFind.innerHTML == document.getElementById("name").innerHTML) {
            friendFind.style.display = "none";
        }

        console.log("dataFromServer.allinfos", dataFromServer.allinfos)

        // Au clique sur le nom de l'ami je change le pseudo et le login de l'utilisateur, faire la même chose avec les messages postés par l'utilisateur que je vais stocker dans la BDD
        friendFind.addEventListener("click", function() {

           // document.getElementById("bloc-message").style.display = "none";

           document.getElementById("bloc-friends").style.marginBottom = "25px";

            returnOnMyWall.style.display = "block";
            returnOnMyWall.style.color = "white";
            returnOnMyWall.style.margin = "0px";

            var msg = document.createElement("p");
            document.getElementById("livemessages").appendChild(msg);

            tchatBox.style.display = "none";
            tchatBar.style.display = "none";
            sendMessageOnTchat.style.display = "none";
            //chooseANickName.style.display = "none";

            // Je supprime le bloc qui me permet d'écrire des messages au moment ou je me connecte sur le mur de quelqu'un d'autres 
/*
            if(document.getElementById("asktoplay")) {
                document.getElementById("asktoplay").remove();
            }
            
            if(document.getElementById("challenge")) {
                document.getElementById("challenge").remove();
            }
*/

            if(document.getElementById("asktoplay")) {
                document.getElementById("asktoplay").style.display = "none";
            }

            if(document.getElementById("challenge")) {
                document.getElementById("challenge").style.display = "none";
            }

            document.getElementById("bloc-message").style.display = "none";

            // D E B U T - Ajout de messages publiés par la personneque je veux ajouter ! 

            var Paragraphe = function(i) {
                this.para = document.createElement("p");
                this.para.id = "messagefromserver" + i;
                this.para.className = "messageindb";
                document.getElementById("messagefromserver").appendChild(this.para);
            }

            var messageFromServeurNumber = 1;

            if(dataFromServer.allinfos.message) {
                console.log("Length", dataFromServer.allinfos.message.length)

                if(dataFromServer.allinfos.message.length >= 5) {
                    console.log("J'ai bien envoyé plus de 5 messages !")
                    document.getElementById("avatarimg").src = "/static/ironman.png";
                }

                for(i = 0; i < dataFromServer.allinfos.message.length; i++) {
                    
                    var messageParagraphe = new Paragraphe(messageFromServeurNumber++); 

                    if(document.getElementsByClassName("messageindb")) { 

                        document.getElementsByClassName("messageindb")[i].style.clear = "both";

                        var messageFromServeur = dataFromServer.allinfos.message[i];
                        var messageSentFromServeur = document.getElementsByClassName("messageindb")[i];
                        messageSentFromServeur.innerText = messageFromServeur;

                        if(document.getElementsByClassName("messageindb").length > dataFromServer.allinfos.message.length) {

                            var soustractionMessages = document.getElementsByClassName("messageindb").length - dataFromServer.allinfos.message.length;

                            for(j = 0; j < document.getElementsByClassName("messageindb").length; j++) {
                                if(document.getElementsByClassName("messageindb")[j].innerHTML !== dataFromServer.allinfos.message[j]) {
                                    document.getElementsByClassName("messageindb")[j].remove();
                                }
                            }
                        } 
                    } 
                }
            } 
            
            // F I N 

            // Je boucle sur la liste d'ami de l'utilisateur sur lequel j'ai cliqué

            if(dataFromServer.allinfos.friends) {
                for(i = 0; i < dataFromServer.allinfos.friends.length; i++) {
                    console.log("nameOfThePersonThatClick", nameOfThePersonThatClick)

                    console.log("entrée boucle for au moment du clique")
                    console.log("nameOfThePersonThatClick", nameOfThePersonThatClick, "dataFromServer.allinfos.friends[i]", dataFromServer.allinfos.friends[i])

                    // Si je suis déjà présent dans la liste d'ami de la personne que j'ai recherché

                    if(nameOfThePersonThatClick == dataFromServer.allinfos.friends[i]) {
                        var indiceStocked = i; // Je stock l'indice dans une variable afin de pouvoir l'utiliser dans mon "else" et tester si le nom recherché n'est pas dans ma liste d'ami
                        console.log("indiceStockedInMemory", indiceStocked)
                        boutonAjouter.style.display = "none"; 

                        if(dataFromServer.allinfos.friends) {
                            for(i=0; i < dataFromServer.allinfos.friends.length; i++) {
                                var Friends = function(i) {
                                    this.frd = document.createElement("p");
                                    this.frd.id = "frd" + i;
                                    this.frd.innerHTML = dataFromServer.allinfos.friends[i];
                                    this.frd.className = "friends"
                                    document.getElementById("bloc-friends").appendChild(this.frd);
                                }
                                new Friends(i);
                            }
                        }

                    } else {
                        if(nameOfThePersonThatClick !== dataFromServer.allinfos.friends[indiceStocked]) {
                            boutonAjouter.style.display = "block"; 
                        }
                    } 
                }
            } else {
                boutonAjouter.style.display = "block";
            }

            // Suppression de  la liste d'amis de l'utilisateur précédent lorsque je clique sur un ami trouvé dans la barre de recherche
            for(i = 0; i < document.getElementsByClassName("friends").length; i++) {
                if(document.getElementById("bloc-friends").firstChild) {
                document.getElementById("bloc-friends").removeChild(document.getElementById("bloc-friends").firstChild)
                }
                if(document.getElementById("bloc-friends").lastChild) {
                    document.getElementById("bloc-friends").removeChild(document.getElementById("bloc-friends").lastChild)
                }
            }

            // Suppression des messages de l'utilisateur précédent lorsque je clique sur un ami trouvé dans la barre de recherche
            // Variante : document.getElementById("bloc-message").style.display = "none";

            for(i=0; i < document.getElementById("bloc-message").length;i++) {
                if(document.getElementById("bloc-message").firstChild) {
                    document.getElementById("bloc-message").removeChild(document.getElementById("bloc-message").firstChild)
                    }
                    if(document.getElementById("bloc-message").lastChild) {
                        document.getElementById("bloc-message").removeChild(document.getElementById("bloc-message").lastChild)
                    }
            }

            // Ajout des amis présent dans la BDD de l'ami sur lequel j'ai cliqué //
            if(dataFromServer.allinfos.friends) {
                for(i=0; i < dataFromServer.allinfos.friends.length; i++) {
                    var Friends = function(i) {
                        this.frd = document.createElement("p");
                        this.frd.id = "frd" + i;
                        this.frd.innerHTML = dataFromServer.allinfos.friends[i];
                        this.frd.className = "friends"
                        document.getElementById("bloc-friends").appendChild(this.frd);
                    }
                    new Friends(i);
                }
            }

            nameStocked =  name.innerHTML // document.getElementById("name").innerHTML.split('"')[0].split(' ').join('');
            console.log("before change", nameStocked);
            
            dataFromServer.allinfos.pseudo ? name.innerHTML = dataFromServer.allinfos.login + ' ' + '"' + dataFromServer.allinfos.pseudo + '"' : name.innerHTML = dataFromServer.allinfos.login
            
            console.log("after change", nameStocked);

            var demandeDajout = document.getElementById("demandedajout"); // lorsque je suis sur la page d'un autre utilisateur, j'enlève le message "x vous a ajouté"
            demandeDajout.style.display = "none";

            console.log("dataFromServer.allinfos", dataFromServer.allinfos.platform)
                               
               if(dataFromServer.allinfos.platform == "pc") {
                   console.log("plateform ami PC")
                   if(document.getElementById("pc")) {
                    document.getElementById("ps4").style.display = "none";
                    }
                    document.getElementById("pc").style.display = "inline-block"; 
                } else {
                    if(dataFromServer.allinfos.platform == "ps4") {
                        console.log("plateform ami PS4")
                        if(document.getElementById("pc")) {
                        document.getElementById("pc").style.display = "none";
                        }
                        if(document.getElementById("ps4")) {
                        document.getElementById("ps4").style.display = "inline-block"; 
                        }
                    }
                }
        })

        // Retour sur mon profil 
        
        returnOnMyWall.addEventListener("click", function() {
            console.log("Nom de la personne qui clique sur retour sur mon profil : ", nameOfThePersonThatClick)
            webSocketConnection.emit("nameOfThePersonThatClick", {
                nameoftheseeker: nameOfThePersonThatClick
            })
        })
        

    })

    boutonAjouter.addEventListener("click", function() {
        console.log("Je viens d'ajouter un ami ! Moi mon nom c'est :", nameStocked, " L'utilisateur que j'ajoute c'est :", name.innerHTML); // distinction entre mon nom et celui de l'utilisateur que j'ajoute
        boutonAjouter.style.display = "none";
        
        webSocketConnection.emit("requestfriend", { // j'envoie un message au back avec le nom de l'ami que je veux ajouter
            nomdudemandeur: nameStocked,
            nomdureceveur: name.innerHTML
        });
    });

    //document.getElementById("name").innerHTML.split('"')[0].split(' ').join('')
});