
var bcrypt = require('bcrypt-nodejs');
var express     = require('express');
var User        = require('./models/user');
var Room        = require('./models/room');
var jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens
var cookieParser = require('cookie-parser') // get cookie
var Cookies = require( "cookies") //set cookie
var multer  = require('multer')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/profiles/')
  },
  filename: function (req, file, cb) {
    c = file.mimetype;
    type = c.split('/')[1]
    cb(null, file.fieldname + '-time'+new Date().getTime()+'-'+req.decoded._id+'.'+type)
  }
})



var upload =  multer({ storage: storage })
mongoose = require('mongoose');
ObjectId = mongoose.Types.ObjectId;


//API
//==================================================================
module.exports = function(app){
    var apiRoutes = express.Router(); 

    app.get('/', function(req, res) {
        console.log('TELA DE LOGIN ');
        res.sendfile('./public/views/login/index.html'); 
    });

    app.post('/user/cadastrar', function(req, res) {
        var userCadastrar = req.body;
       
         User.findOne({
            login: userCadastrar.login
        }, function(err, user) {
            if (err){
                resp.json(err);
            }

            if (!user) {
                  userCadastrar.password = bcrypt.hashSync(userCadastrar.password);
                  userCadastrar.picture_url = '/profiles/no.jpg';
                  userCadastrar.bio = '';
                  User.create(userCadastrar,function(err,user){
                    if(err)
                      res.send(err);
                    User.find(user,function(err,user){
                      res.json(user);
                    })
                  });

            } else if (user) {

                res.json({success:'false',message:'E-mail já cadastrado!'})
                return false;
            }
            });

    });
    
    app.get('/dashboard',isAuthenticated, function(req, res) {
        console.log(req.decoded.name+' ACESSOU DASHBOARD');
        res.sendfile('./public/views/dashboard/index.html'); 
    });

    app.get('/views/*',function(req, res) {
        res.redirect('/');
    });


// ROTAS DE FUNCIONALIDADES PRIVADAS /API
//===========================================================================================================
    function isAuthenticated(req, res, next) {
      console.log(req.originalUrl+': VERIFICANDO LOGIN');
      // Verifica se existe o token
      var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.scopeToken;
      if (token) {
        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
          if (err) {
            console.log('VERIFICAÇÃO NEGADA - TOKEN FALSO');
            return res.json({ success: false, message: 'Failed to authenticate token.' });    
          } else {
            console.log('USUARIO ACEITO!')
            // if everything is good, save to request for use in other routes
            req.decoded = decoded; 

            next();
          }
        });
      } else {
        console.log('VERIFICAÇÃO NEGADA - SEM TOKEN');
        res.redirect('/');
      }
    };

    //Gera um token de autenticação apra um usuario
    apiRoutes.post('/auth', function(req, res) {
        console.log('Criando token...');
        console.log(req.body)
        // find the user
        User.findOne({
            login: req.body.login
        }, function(err, user) {
            if (err){
                resp.json(err);
            }
            if (!user) {
              res.json({ success: false, message: 'Authentication failed. User not found.' });
              console.log('Token nao gerado! -- usuario inexistente');
            } else if (user) {
              // check if password matches
              if(!bcrypt.compareSync(req.body.password, user.password)){
                console.log('Token nao gerado!');
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
              } else {
                //if user is found and password is right
                // create a token
                var token = jwt.sign(user, app.get('superSecret'), {
                  expiresIn: 1440 // expires in 24 hours
                });
                console.log('Token gerado!');
                // return the information including token as JSON
                res.json({
                  success: true,
                  message: 'Enjoy your token!',
                  token: token
                });
              }   
            }
            });
        });


    //Obtem informações do usuário
    apiRoutes.get('/me',isAuthenticated, function(req, res) {
        console.log('## API/ME ###')
        console.log(req.decoded)
        res.json({user:req.decoded})
    });

    apiRoutes.post('/profile',isAuthenticated,upload.single('avatar'), function (req, res, next) {
      avatar = '/profiles/'+req.file.filename;

      id = req.decoded._id
      console.log(req.decoded._id);
      User.update({"_id": ObjectId.fromString(id)}, {
            picture_url:avatar
        }, function(err, numberAffected, rawResponse) {
           //handle it
        })


      token = atualizarToken(req,res,req.decoded.login,req.decoded.password)
  

    })



    function atualizarToken(req,res,login,password){

        User.findOne({
            login: login
        }, function(err, user) {
            if (err){
                resp.json(err);
            }
            if (!user) {
              res.json({ success: false, message: 'Authentication failed. User not found.' });
              console.log('Token nao gerado! -- usuario inexistente');
            } else if (user) {
              // check if password matches
              if(password != user.password){
                console.log('Token nao gerado!');
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
              } else {
                //if user is found and password is right
                // create a token
                var token = jwt.sign(user, app.get('superSecret'), {
                  expiresIn: 1440 // expires in 24 hours
                });
                console.log('Token gerado!');

                // return the information including token as JSON
                 console.log(req.headers)
                  console.log(req.headers.referer)
                  // res.clearCookie('scopeToken');
                  res.cookie('scopeToken', token, { maxAge: 900000});
                  res.redirect(req.headers.referer);
              }   
            }
        })
    }

   




    //Obtem todas as salas do aplicativo
    apiRoutes.get('/rooms',isAuthenticated,function(req,res){
         var query = Room.find({});
        query.exec(function(err, rooms){
            if(err)
                res.send(err);

            // If no errors are found, it responds with a JSON of all users
            res.json(rooms);
        });
    });

    //Cadastra uma sala no aplicativo
    apiRoutes.post('/room',isAuthenticated,function(req,res){

        var sala = req.body;
        // Recebo um Json desta forma, preciso transformar as informações
        // {
        //   "title":"title",
        //   "lat":"lat"
        //   "lng":"lng"
        // }
        var newSala = {
                "title": sala.title,
                "location": {
                    "type": "Point", 
                    coordinates: [sala.lat,sala.lng]
                  }
              }
              
        Room.create(newSala,function(err,room){
          if(err)
            res.send(err);
          Room.findOne(room,function(err,room){
            res.json(room);
          })
        });
    });

    apiRoutes.get('/room',isAuthenticated,function(req,res){
      id = req.query.id;
      console.log(id);

      Room.findOne(
        {"_id": ObjectId.fromString(id)}
        ,function(err,room){
        
        if(err)
        {
          res.json(err.message)
        }else{
          console.log('sala encontrada');
          console.log(room);
          res.json(room)
        }
      });
    
    })


    app.use('/api', apiRoutes);
}



