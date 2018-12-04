const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const server = app.listen(process.env.PORT || 8000, function() {
    console.log("Ecoute sur le port " + process.env.PORT || 8000);
}); 
const io = require('socket.io')(server); 

var users = [

];

app.use('/static', express.static(__dirname + '/static'));
app.get('/index', function(req, res) {
    res.sendFile(path.resolve('static/index.html')); // Pallier au fait que le fichier ne soit pas à la racine
});

io.on('connection', function(webSocketConnection) {

    /* io.sockets.emit("usersOnline", {usersOnline: "Utilisateur en ligne : " + users.length}) Utiliser le io.sockets permet d'envoyer le message à tous les utilisateurs en ligne. Ainsi la mise à jour du nombre d'utilisateurs sera faite sur l'écran de tous les utilisateurs. */
    // Ajouter une propriété "first connexion" lorsqu'un utilisateur vient de s'inscrire avec comme valeur : yes. Changer cette valeur sur "no" quand l'utilisateur se connecte via le module de connexion
    // Cela permet de faire en sorte de le forcer à choisir une photo, se présenter etc lors de la première connexion
    // Si l'utilisateur se connecte via le module d'inscription, proposer sur la bannière grise de mentionner sa console préféré, son pseudo, ainsi que son avatar
    
    // -  I N S C R I P T I O N - //

    webSocketConnection.on('registration', function(dataSocket) {
        MongoClient.connect("mongodb://jessmani:azertyuiop75$@ds061196.mlab.com:61196/heroku_lmkffzfs", { useNewUrlParser: true }, function(err, database) {
            if(err) {
                return console.log("Erreur ");
            } 

            if(dataSocket.login == "") {
                return webSocketConnection.emit("insertId", {message: "*Veuillez saisir un identifiant."})
            } else {
                if(dataSocket.password == "") {
                    return webSocketConnection.emit("insertPwd", {message: "*Veuillez saisir un mot de passe."})
                } else {
                    if(dataSocket.mail == "") {
                        return webSocketConnection.emit("insertMail", {message: "*Veuillez saisir votre adresse mail."})
                    }
                }
            }

            const myDb = database.db("heroku_lmkffzfs");
            const collection = myDb.collection("users");

            collection.find().toArray(function(err, dataDB) {
                // if(!dataDB) return [];
                for(i = 0; i < dataDB.length; i++) {
                    if(dataSocket.login == dataDB[i].login) {
                        return webSocketConnection.emit("otherId", {message: "Ce pseudo est déjà pris. Choissisez un autre pseudo."})
                    } else {    
                        if(dataSocket.mail == dataDB[i].mail) {
                            return webSocketConnection.emit("otherMail", {message: "Cette adresse mail existe déjà."})    
                        } 
                    }
                }
                
                if(dataSocket.login == "admin") { // Pouvoir inscrire un admin dans la BDD, à supprimer avant de publier tout en s'assurant que l'admin est bien présent dans la BDD
                    collection.insert({id: webSocketConnection.id, login: dataSocket.login, password: dataSocket.password, mail: dataSocket.mail, rights: "admin"});
                } else { 
                    collection.insert({id: webSocketConnection.id, login: dataSocket.login, password: dataSocket.password, mail: dataSocket.mail, rights: "user"});
                }

                users.push({id: webSocketConnection.id, login: dataSocket.login, rights: "user", pseudo: "", friends: ""});
            
                webSocketConnection.emit("ConnectionOK", // io.sockets.emit permet de changer tout sur toutes les pages
                { 
                    arrayOfUsers: users 
                });
            });  
        });
    });

    // -  C O N N E X I O N - //

    webSocketConnection.on('login', function(dataSocket) {

        MongoClient.connect("mongodb://jessmani:azertyuiop75$@ds061196.mlab.com:61196/heroku_lmkffzfs", { useNewUrlParser: true }, function(err, database) {
            if(err) {
                return console.log("Erreur de connection");
            }
    
            const myDb = database.db("heroku_lmkffzfs");
            const collection = myDb.collection("users");
    
            collection.find().toArray(function(err, dataDB) {

                for(i = 0; i < dataDB.length; i++) {

                    if(dataSocket.login == dataDB[i].login && dataSocket.password == dataDB[i].password) { // - Vérification de la correspondance des logins - // 
                        console.log("Pseudo dans la BDD : ", dataDB[i].pseudo);
                        console.log("webSocketConnection.id", webSocketConnection.id);
                        console.log("dataDB[i].id", dataDB[i].id);
                              // tester dans al db si l'utilisateur existe deja
                              
                        users.push({id: webSocketConnection.id, login: dataSocket.login, rights: "user", pseudo: dataDB[i].pseudo}); // Je push le pseudo maintenant à la connexion car je redéfinis les propriétés et il n'apparaît pas à la connexion
                       // users.push({id: dataDB[i].id, login: dataSocket.login, rights: "user", pseudo: dataDB[i].pseudo});

                        //return
                        
                        // - Envoie du tableau d'utilisateur côté Front - //
                        webSocketConnection.emit("ConnectionOK", // io.sockets.emit permet de changer tout sur toutes les pages
                        { 
                            arrayOfUsers: users 
                        });

                        if(dataSocket.login == "admin") {
                            webSocketConnection.emit("admin", {
                                allusersinfos: dataDB,
                                rights: "admin"
                            })
                        }

                        if(dataDB[i].message) { // test si un ou plusieurs messages existent dans la BDD je l'affiche lorsque l'utilisateur se connecte
                            console.log("messages présents dans la BDD à la connection : ", dataDB[i].message)
                            webSocketConnection.emit("messagesinDB", { message: dataDB[i].message })
                        }

                        if(dataDB[i].demanderecude) {
                            io.sockets.emit("RenvoieDuDemandeur", { // Envoie du nom de l'utilisateur qui me demande en ami
                            demandeur: dataDB[i].demanderecude
                            })
                        }

                        if(dataDB[i].friends) {
                            webSocketConnection.emit("AmisPresentDansLaBDD", {
                                amisdanslabdd: dataDB[i].friends
                            })
                        }
                        
                        if(dataDB[i].platform) {
                            webSocketConnection.emit("platformchoicefromserver", { // Envoie du nom de l'utilisateur qui me demande en ami
                            platformchoicefromserver: dataDB[i].platform
                            })
                        }
                    } 
                }

                webSocketConnection.emit("ConnectionError", {message: "*Connexion refusée. Login ou mot de passe incorrect."})
            });
        }); 
    });

    // ECHANGE DU PSEUDO ENTRE LE FRONT ET LE BACK
    webSocketConnection.on("SendPseudoToServer", function(dataSocket) { // Je reçois le pseudonyme
        console.log(dataSocket.pseudo);
        MongoClient.connect("mongodb://jessmani:azertyuiop75$@ds061196.mlab.com:61196/heroku_lmkffzfs", { useNewUrlParser: true }, function(err, database) {
            if(err) {
                return console.log("Erreur de connection");
            }

            const myDb = database.db("heroku_lmkffzfs");
            const collection = myDb.collection("users");

            collection.find().toArray(function(err, dataDB) {

                for(i = 0; i < dataDB.length; i++) {
                    if(dataSocket.login == dataDB[i].login) { // si l'utilisateur que j'ai envoyé du front au back est dans la BDD alors j'ajoute le pseudo correspondant à cette utilisateur
                        console.log("test utilisateur")
                        collection.update({ login: dataSocket.login }, 
                            {$set : {pseudo: dataSocket.pseudo}}, function(err, data) { // insertion du pseudo dans la BDD
                            if(err) {
                                console.log("Erreur :", err)  
                            } else {
                                //console.log(data);
                            }
                        });

                        webSocketConnection.emit("ResendPseudoToFront", { // envoie du pseudo de la BDD vers le front pour que le pseudo apparaisse tt le temps quand l'utilisateur se connecte mais cela ne fonctionnait pas car il fallait aussi ajouter le login dans la BDD lors de la connexion
                        pseudo: dataDB[i].pseudo
                        })
                    }
                }
            })
        })
    })

    //////////////////////// RECHERCHER UN AMI /////////////////////////////////////////////////
    webSocketConnection.on("resultfriends", function(dataSocket) { // je reçois le nom de l'ami recherché
        //console.log(dataSocket.result);
        MongoClient.connect("mongodb://jessmani:azertyuiop75$@ds061196.mlab.com:61196/heroku_lmkffzfs", { useNewUrlParser: true }, function(err, database) {
            if(err) {
                return console.log("Erreur de connection");
            }
    
            const myDb = database.db("heroku_lmkffzfs");
            const collection = myDb.collection("users");

            collection.find().toArray(function(err, dataDB) {
                for(i = 0; i < dataDB.length; i++) {
                    if(dataSocket.result == dataDB[i].login) { // je test si le nom de l'ami rechercher correspond à quelqu'un présent dans la BDD
                        console.log("ami trouvé !", dataDB[i])

                       io.sockets.emit("friendFind", { // si je trouve un ami j'envoie son nom côté front
                            friendname: dataSocket.result,
                            allinfos: dataDB[i]
                        })

                           /* webSocketConnection.to(dataDB[i].id).emit("friendFind", { 
                            friendname: dataSocket.result,
                            allinfos: dataDB[i] // Se réfère à la première boucle afin d'envoyer le nom de l'ami rechercher *conflit avec boucle j*
                            })  */             

                        return; // le return empêche le for de continuer à chercher si on a trouvé un ami !
                    } else {
                        console.log("ta pas d'ami ici !")
                    }
                }
            });
        })
    })  

    webSocketConnection.on("platformchoice", function(dataSocket) {
        MongoClient.connect("mongodb://jessmani:azertyuiop75$@ds061196.mlab.com:61196/heroku_lmkffzfs", { useNewUrlParser: true }, function(err, database) {
            if(err) {
                return console.log("Erreur de connection");
            }

            const myDb = database.db("heroku_lmkffzfs");
            const collection = myDb.collection("users");

            collection.find().toArray(function(err, dataDB) {
                for(i = 0; i < dataDB.length; i++) {
                    if(dataSocket.name == dataDB[i].login) {
                        collection.update({ login: dataSocket.name }, 
                            {$set : {platform: dataSocket.platformchoice}}, function(err, data) { 
                            if(err) {
                                console.log("Erreur :", err)  
                            } 
                        });

                        webSocketConnection.emit("platformchoicefromserver", { // Envoie du nom de l'utilisateur qui me demande en ami
                        platformchoicefromserver: dataDB[i].platform
                        })

                    }
                    else {
                        console.log("Le login n'a pas été trouvé dans la BDD !")
                    }
                }
            });
        })
    })


    webSocketConnection.on("userchallenge", function(dataSocket) {
        //webSocketConnection.on('disconnect', function() { 
            console.log("data from socket : ", dataSocket)
            MongoClient.connect("mongodb://jessmani:azertyuiop75$@ds061196.mlab.com:61196/heroku_lmkffzfs", { useNewUrlParser: true }, function(err, database) {
                if(err) {
                    return console.log("Erreur de connection");
                }

                const myDb = database.db("heroku_lmkffzfs");
                const collection = myDb.collection("users");

                collection.find().toArray(function(err, dataDB) {
                    for(i = 0; i < dataDB.length; i++) {
                        if(dataSocket.login == dataDB[i].login) {
                            console.log("login trouvé : ", dataSocket.login);
                            console.log("dataSocket.message", dataSocket.message);
                            var arrayFromSocket = dataSocket.message;
                            console.log("arrayFromSocket[arrayFromSocket.length - 1]", arrayFromSocket[arrayFromSocket.length - 1])
                            // J'ajoute uniquement le dernière indice du tableau. Si je ne fais pas ça, j'ajoute tous les indices du tableau à chaque tour de boucle

                            collection.update({ login: dataSocket.login }, 
                                {$set : {message: dataDB[i].message ? dataDB[i].message.concat(arrayFromSocket[arrayFromSocket.length - 1]) : dataSocket.message}}, function(err, data) { 
                                if(err) {
                                    console.log("Erreur :", err)  
                                } 
                            });

                        }
                        else {
                            console.log("Le login n'a pas été trouvé dans la BDD !")
                        }
                    }
                });
            })
    })

    ///////////////////////// JE DEMANDE UN UTILISATEUR EN AMI ////////////////////////////
    webSocketConnection.on("requestfriend", function(dataFromSocket) {
        MongoClient.connect("mongodb://jessmani:azertyuiop75$@ds061196.mlab.com:61196/heroku_lmkffzfs", { useNewUrlParser: true }, function(err, database) {
            if(err) {
                return console.log("Erreur de connection");
            }

            const myDb = database.db("heroku_lmkffzfs");
            const collection = myDb.collection("users");

            collection.find().toArray(function(err, dataDB) {
                for(i = 0; i < dataDB.length; i++) {

                    console.log("ami ajouté", dataFromSocket.nomdureceveur, "dataDB[i].login", dataDB[i].login)

                    if(dataFromSocket.nomdureceveur == dataDB[i].login) {

                        console.log("j'entre dans le IF ligne 241")

                        collection.update({ login: dataFromSocket.nomdureceveur }, 
                            {$set : {demanderecude: dataFromSocket.nomdudemandeur}}, function(err, data) { // insertion du pseudo dans la BDD
                            if(err) {
                                console.log("Erreur :", err)  
                            } else {
                                //console.log(data);
                            }
                        });

                        console.log("dataDB[i].login FAUT KSA MARCHE", dataDB[i].id)
                        console.log("dataDB[i].demanderecude FAUT KSA MARCHE", dataFromSocket.nomdudemandeur)

                        console.log("CONSOLE LOG DE LA MORT QUI TUE", dataFromSocket.nomdudemandeur) 
                        
                        // Si j'utilise dataDB[i].demanderecude cela me renvoie undefined, pour pâlier au problème j'utilise directement le nom du demandeur reçu du front
                        
                        // PERMET DE VISER UNIQUEMENT UNE PERSONNE PAR RAPPORT A SON ID, EVITE D'ENVOYER L'INVITATION A TOUTES LES PERSONNES CONNECTéS
                        console.log("CA MERDE ICIIIIIIIIIIIIIIIIIIII WARNING", dataFromSocket.nomdudemandeur)
                        console.log("dataDB[i].id", dataDB[i].id)

                        webSocketConnection.broadcast.emit("RenvoieDuDemandeur", { // Envoie du nom de l'utilisateur qui me demande en ami
                        demandeur: dataFromSocket.nomdudemandeur
                        })

                        /*webSocketConnection.to(dataDB[i].id).emit("friendFind", { 
                            demandeur: dataFromSocket.nomdudemandeur                       
                        })*/
                    }     
                    else {
                        console.log("Pas trouvé désolé !! ligne 271")
                    }
                }
            });
        })
    });


    ////////////// J'ACCEPTE LA DEMANDE EN AMI //////////////////////
    webSocketConnection.on("accepter", function(dataFromSocket) {
        MongoClient.connect("mongodb://jessmani:azertyuiop75$@ds061196.mlab.com:61196/heroku_lmkffzfs", { useNewUrlParser: true }, function(err, database) {
            if(err) {
                return console.log("Erreur de connection");
            }

            const myDb = database.db("heroku_lmkffzfs");
            const collection = myDb.collection("users");

            // Ajout dans la liste d'amis de la personne qui a reçu et accepter l'invitation

            collection.find().toArray(function(err, dataDB) {
                for(i = 0; i < dataDB.length; i++) {
                    console.log("ami accepté dans ma liste", dataFromSocket.friendaccepted, "dataDB[i].login", dataDB[i].login)
                    if(dataFromSocket.nomdureceveur == dataDB[i].login) {
                        var arrayFromSocket = dataFromSocket.friendaccepted

                        console.log("j'entre dans le IF ligne 350", arrayFromSocket[arrayFromSocket.length - 1])
                        
                        collection.update({ login: dataFromSocket.nomdureceveur }, 
                            {$set : {friends: dataDB[i].friends ? dataDB[i].friends.concat(arrayFromSocket[arrayFromSocket.length - 1]) : dataFromSocket.friendaccepted}}, function(err, data) { // insertion du pseudo dans la BDD
                            if(err) {
                                console.log("Erreur :", err)  
                            } else {
                                //console.log(data);
                            }
                        });
                        
                        // suppression de la demande recu de une fois que l'utilisateur a accepté
                        collection.update({ login: dataFromSocket.nomdureceveur }, 
                            {$unset : {demanderecude: dataDB[i].friends}}, function(err, data) { // insertion du pseudo dans la BDD
                            if(err) {
                                console.log("Erreur :", err)  
                            } else {
                                //console.log(data);
                            }
                        });
                    }    
                    
                    // Ajout dans la liste d'amis de la personne qui a envoyé l'invitation
                    
                    var secondArrayFromSocket = dataFromSocket.friendaccepted;

                    
                    if(secondArrayFromSocket[0] == dataDB[i].login) {
                        console.log("entrée IF ligne 323 : corrélation secondArrayFromSocket[0] - dataDB[i].login")
                        collection.update({ login: secondArrayFromSocket[0] }, 
                            {$set : {friends: dataDB[i].friends ? dataDB[i].friends.concat(dataFromSocket.nomdureceveurarray) : dataFromSocket.nomdureceveurarray}}, function(err, data) { // insertion du pseudo dans la BDD
                            if(err) {
                                console.log("Erreur :", err)  
                            } else {
                                //console.log(data);
                            }
                        });
                    }

                    else {
                        console.log("Pas trouvé désolé !! ligne 336")
                    }
                }

                // Ajout en live de l'utilisateur qui accepte la demande en ami dans ma liste 
                collection.find().toArray(function(err, dataDB) {
                    for(i = 0; i < dataDB.length; i++) {
                        if(dataFromSocket.nomdureceveur == dataDB[i].login) {

                            console.log("j'entre dans le if de merde qui me soul depuis talh")
                            console.log("dataDB[i].friends", dataDB[i].friends)

                            io.sockets.emit("AmisPresentDansLaBDD", {
                                amisdanslabdd: dataDB[i].friends
                            })

                            /*io.to(dataDB[i].id).emit("AmisPresentDansLaBDD", { // Envoie du nom de l'utilisateur qui me demande en ami
                            amisdanslabdd: dataDB[i].friends
                            })*/
                        } 
                    }
                })
            });
        })
    })


    //////////////////////// CLIQUE SUR UN AMI DANS LA LISTE D'AMI /////////////////////////////
    webSocketConnection.on("friendsclick", function(dataFromSocket) {
        // test si le nom existe dans ma BDD, je récupère toutes les infos, je les renvoie au front et je remplace toutes les infos de mon profil par celle de l'utilisateur sur lequel j'ai cliqué
        console.log("dataFromSocket.friendsclick", dataFromSocket.friendsclick)

        MongoClient.connect("mongodb://jessmani:azertyuiop75$@ds061196.mlab.com:61196/heroku_lmkffzfs", { useNewUrlParser: true }, function(err, database) {
            if(err) {
                return console.log("Erreur de connection");
            }

            const myDb = database.db("heroku_lmkffzfs");
            const collection = myDb.collection("users");

            collection.find().toArray(function(err, dataDB) {
                for(i = 0; i < dataDB.length; i++) {
                    if(dataFromSocket.friendsclick == dataDB[i].login) { 
                        console.log("login dans la BDD : ", dataDB[i].login, "login de la Socket : ", dataFromSocket.friendsclick)
                        webSocketConnection.emit("friendonmylist", { // si je trouve un ami j'envoie son nom côté front
                        allinfos: dataDB[i]
                        })
                    }
                    else {
                        console.log("Pas trouvé désolé !! ligne 378")
                    }
                }
            })
        })
    })
    
    /* CLIQUE SUR UN AMI DANS MA LISTE SUR LE TCHAT */

    webSocketConnection.on("friendclicked", function(dataFromSocket) {
        MongoClient.connect("mongodb://jessmani:azertyuiop75$@ds061196.mlab.com:61196/heroku_lmkffzfs", { useNewUrlParser: true }, function(err, database) {
            if(err) {
                return console.log("Erreur de connection");
            }

            console.log("dataFromSocket.messagesentinlive", dataFromSocket.messagesentinlive);

            const myDb = database.db("heroku_lmkffzfs");
            const collection = myDb.collection("users");

            /* splice(position, numberOfItemsToRemove, item)
            array.splice(2, 0, "three"); */

            // dataDB[i].messagelive ? dataDB[i].messagelive.splice(0,2).concat(dataFromSocket.messagesentinlive) : dataFromSocket.messagesentinlive 

            collection.find().toArray(function(err, dataDB) {
                
                for(i = 0; i < dataDB.length; i++) {

                    console.log("dataDB[i].login : ", dataDB[i].login, "dataFromSocket.name : ", dataFromSocket.name)

                    // dataDB[i].messagedirect ? dataDB[i].messagedirect.concat(dataFromSocket.messagesentinlive) : dataFromSocket.messagesentinlive

                    var arrayFromSocket = dataFromSocket.messagesentinlive;
            
                    // J'ajoute uniquement le dernière indice du tableau. Si je ne fais pas ça, j'ajoute tous les indices du tableau à chaque tour de boucle
                    // exemple : message: dataDB[i].message ? dataDB[i].message.concat(arrayFromSocket[arrayFromSocket.length - 1]) : dataSocket.message

                    if(dataDB[i].login == dataFromSocket.name) { // enlever dataFromSocket.name pour mettre les msg dans tt les users
                        console.log("entrée dans le IF : dataDB[i].login", dataDB[i].login)
                        //console.log("J'entre dans le IF de comparaison entre login et name");
                        collection.update({ login: dataDB[i].login }, 
                            {$set : {messagedirect: dataDB[i].messagedirect ? dataDB[i].messagedirect.concat(arrayFromSocket[arrayFromSocket.length - 1]) : dataFromSocket.messagesentinlive}}, function(err, data) {  
                            if(err) {
                                console.log("Erreur :", err)  
                            } else {
                                //console.log(data);
                            }
                        });

                        // if(je boucle afin de connaitre le nom des amis de mon dataSocket.name et je sockets sur tout les amis uniquement)
                        io.sockets.emit("renvoiemessagelive", { // Envoie du nom de l'utilisateur qui me demande en ami
                        name: dataFromSocket.name,
                        msg: arrayFromSocket
                        })
                        
                    } else {
                        console.log("J'entre PAS dans mon IF - ligne 427")
                    }
                }
            }); 
        })
    });

    webSocketConnection.on("nameOfThePersonThatClick", function(dataFromSocket) {
        MongoClient.connect("mongodb://jessmani:azertyuiop75$@ds061196.mlab.com:61196/heroku_lmkffzfs", { useNewUrlParser: true }, function(err, database) {
            if(err) {
                return console.log("Erreur de connection");
            }

            const myDb = database.db("heroku_lmkffzfs");
            const collection = myDb.collection("users");
            console.log("dataFromSocket.nameoftheseeker : ", dataFromSocket.nameoftheseeker)
            collection.find().toArray(function(err, dataDB) { 
                for(i = 0; i < dataDB.length; i++) {
                    if(dataFromSocket.nameoftheseeker == dataDB[i].login) {
                        console.log("Toutes les infos de la personne qui veut retourner sur son profil dataDB[i] : ", dataDB[i])
                        webSocketConnection.emit("allinfosOfThePersonThatWantToReturnToHisWall", {
                            allinfosreturnwall: dataDB[i]
                        })
                    }
                }
            });
        })
    })

    webSocketConnection.on("userdeleted", function(dataFromSocket) {
        MongoClient.connect("mongodb://jessmani:azertyuiop75$@ds061196.mlab.com:61196/heroku_lmkffzfs", { useNewUrlParser: true }, function(err, database) {
            if(err) {
                return console.log("Erreur de connection");
            }

            const myDb = database.db("heroku_lmkffzfs");
            const collection = myDb.collection("users");

            console.log("dataFromSocket.userdeleted : ", dataFromSocket.userdeleted)

            collection.find().toArray(function(err, dataDB) { 
                for(i = 0; i < dataDB.length; i++) {
                    if(dataFromSocket.userdeleted == dataDB[i].login) {

                        console.log("J'entre dans le if pour delete l'utilisateur");

                        collection.remove({ login: dataDB[i].login });           
                    }
                }
            });
        })
    });

    webSocketConnection.on("seconduserdeleted", function(dataFromSocket) {
        MongoClient.connect("mongodb://jessmani:azertyuiop75$@ds061196.mlab.com:61196/heroku_lmkffzfs", { useNewUrlParser: true }, function(err, database) {
            if(err) {
                return console.log("Erreur de connection");
            }

            const myDb = database.db("heroku_lmkffzfs");
            const collection = myDb.collection("users");

            console.log("dataFromSocket.userdeleted : ", dataFromSocket.userdeleted)

            collection.find().toArray(function(err, dataDB) { 
                for(i = 0; i < dataDB.length; i++) {
                    if(dataFromSocket.userdeleted == dataDB[i].login) {

                        console.log("J'entre dans le if pour delete l'utilisateur");

                        collection.remove({ login: dataDB[i].login });           
                    }
                }
            });
        })
    });

    webSocketConnection.on("messagedeleted", function(dataFromSocket) {
        MongoClient.connect("mongodb://jessmani:azertyuiop75$@ds061196.mlab.com:61196/heroku_lmkffzfs", { useNewUrlParser: true }, function(err, database) {
            if(err) {
                return console.log("Erreur de connection");
            }

            const myDb = database.db("heroku_lmkffzfs");
            const collection = myDb.collection("users");

            collection.find().toArray(function(err, dataDB) { 

                var messagesToSave = [];

                for(i = 0; i < dataDB.length; i++) {
                    if(dataFromSocket.user == dataDB[i].login) {

                        for(j = 0; j < dataDB[i].message.length; j++) {

                            if(dataFromSocket.messagedeleted == dataDB[i].message[j]) {

                                console.log("Le message qui va être supprimé : ", dataDB[i].message[j]);
                  
                                for(var k = 0; k < dataDB[i].message.length; k++) {
                                    if(dataDB[i].message[k] == dataDB[i].message[j]) {
                                        dataDB[i].message.slice(k, 1);
                                    } else {
                                        messagesToSave.push(dataDB[i].message[k]);
                                    }
                                } 
                            }
                        }

                        collection.update({login: dataDB[i].login}, {$set: {message: messagesToSave}})                   
                    }
                }
            });
        })
    });

    webSocketConnection.on("messagedeletedseconduser", function(dataFromSocket) {
        MongoClient.connect("mongodb://jessmani:azertyuiop75$@ds061196.mlab.com:61196/heroku_lmkffzfs", { useNewUrlParser: true }, function(err, database) {
            if(err) {
                return console.log("Erreur de connection");
            }

            const myDb = database.db("heroku_lmkffzfs");
            const collection = myDb.collection("users");

            collection.find().toArray(function(err, dataDB) { 

                var messagesToSave = [];

                for(i = 0; i < dataDB.length; i++) {
                    if(dataFromSocket.user == dataDB[i].login) {

                        for(j = 0; j < dataDB[i].message.length; j++) {

                            if(dataFromSocket.messagedeleted == dataDB[i].message[j]) {

                                console.log("Le message qui va être supprimé : ", dataDB[i].message[j]);
                  
                                for(var k = 0; k < dataDB[i].message.length; k++) {
                                    if(dataDB[i].message[k] == dataDB[i].message[j]) {
                                        dataDB[i].message.slice(k, 1);
                                    } else {
                                        messagesToSave.push(dataDB[i].message[k]);
                                    }
                                } 
                            }
                        }

                        collection.update({login: dataDB[i].login}, {$set: {message: messagesToSave}})                   
                    }
                }
            });
        })
    });

    webSocketConnection.on('disconnect', function() {
        MongoClient.connect("mongodb://jessmani:azertyuiop75$@ds061196.mlab.com:61196/heroku_lmkffzfs", function(err, database) {
            if(err) {
                return console.log("Erreur connection");
            }

            
            const myDb = database.db("heroku_lmkffzfs");
            const collection = myDb.collection("users");

            collection.find().toArray(function(err, dataDB) { 
                for(i = 0; i < dataDB.length; i++) {
                    for(j = 0; j < users.length; j++) {
                        if(users[j].id == dataDB[i].id) {

                            console.log("l'user l'id : ", users[j].id, " est déconnecté");

                            users.splice(j, 1);           
                        }
                    }
                }
            });
        
            /*for(var i = 0; i < users.length; i++) { 
                
                if(users[i].id == webSocketConnection.id) { 
                    console.log("l'user avec cette ID : users[i].id est déconnecté !", users[i].id) 

                    if(users[i].id == webSocketConnection.id) { 
                        users.splice(i, 1);                     
                    } 
                }
            }*/
        });
    });  
})