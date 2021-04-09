const { ObjectID } = require("bson");
const express = require("express");
const router = express.Router();

// Bcrypt for password encryption
const bcrypt = require("bcrypt");


function cypherPasswords(req, res, next) {
    let user = req.body;
    user.password = bcrypt.hashSync(user.password, 10);
    req.body = user;
    next();
}

// Get user with given id
router.get("/id/:id", ( req, res ) => {

    let db = req.app.locals.db;

    id = new ObjectID(req.params.id)

    db.collection("users").findOne( { "_id": id },  (err, user ) => {
        if ( err !== null ) {
            res.send(err);
        }
        
        if ( !user ) {
            res.send( { "userExists": false, msg: "Database is empty" } );
        }

        res.send( { "userExists": true, results: user } )
    });
});


// Get user with given email
router.post("/email/", ( req, res ) => {

    let db = req.app.locals.db;

    email = req.body.email;

    db.collection("users").findOne( { "email": email },  (err, user ) => {
        if ( err !== null ) {
            res.send(err);
        }
        
        if ( !user ) {
            res.send( { "userFound": false, msg: "Database is empty" } );
            return;
        }

        res.send( { "userFound": true, results: user } )
    });
});

// Update password of user certain ID
router.put("/password", cypherPasswords, ( req, res ) => {

    let db = req.app.locals.db;

    const userId = new ObjectID(req.body._id);
    const newPassword = req.body.password;
    const currentDate = new Date();


    db.collection("users").updateOne( { "_id": userId }, { $set: { "password": newPassword, "password_modified": currentDate } },  (err, info ) => {
        if ( err !== null ) {
            res.send(err);
        }

        if ( !info.result.nModified === 0 ) {
            res.send( { "msg": "No entry was modified"} );
            return;
        }

        res.send( { nModified: info.result.nModified } )
    });
});

// Modify personal data (name, surname, email)
router.put("/update/data", ( req, res ) => {

    let db = req.app.locals.db;
    
    const oldmail = req.body.oldmail;
    const email = req.body.email;
    const name = req.body.name;
    const surname = req.body.surname;

    db.collection("users").updateOne( {"email": oldmail}, { $set: { email, name, surname } }, (err, result ) => {
        if ( err !== null ) {
            res.send(err);
        }
        
        res.send( { results: result } )
    });
});

module.exports = router;