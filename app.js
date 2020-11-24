//jshint esversion:6


const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const lodash = require("lodash");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/gujskiZdebiakDB", {useUnifiedTopology: true, useNewUrlParser: true});
mongoose.connect("mongodb+srv://admin-slawek:q7JYnTD9x8VPC7x@cluster0-jxlvx.mongodb.net/gujskiZdebiakDB?retryWrites=true&w=majority", {useUnifiedTopology: true, useNewUrlParser: true});
mongoose.set('useFindAndModify', false);

const postsSchema = new mongoose.Schema({
  creator: String,
  title: String,
  lead: String,
  content: String,
  date: String,
  href: String,
  link: String,
  source: String,
  news: String,
  covid: String
});

// const usersSchema = new mongoose.Schema ({
//   login: String,
//   password: String
// });

const mailsSchema = new mongoose.Schema ({
  kontakt: String,
  tresc: String
});

const filmsSchema = new mongoose.Schema ({
  title: String,
  href: String,
  link: String
});


// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

// const User = mongoose.model("User", usersSchema);
const Film = mongoose.model("Film", filmsSchema);
const Post = mongoose.model("Post", postsSchema);
const Mail = mongoose.model("Mail", mailsSchema);

app.get("/", function(req, res) {
  Post.find({news: "true"}, function(err, foundEntries) {
    if(err) {
      console.log(err);
    } else {
      Film.find(function(err, foundFilms) {
        if(err) {
          console.log(err);
        } else {
          res.render("index", {
            // paragraph: homeStartingContent,
            films: foundFilms,
            posts: foundEntries,
          });
        }
      }).sort({_id: -1});
    }
  }).sort({date: -1});
});

app.get("/covid", function(req, res) {
  Post.find({covid: "true"}, function(err, foundEntries) {
    if(err) {
      console.log(err);
    } else {
      res.render("covid", {
        posts: foundEntries,
      });
    }
  }).sort({date: -1});
});

app.get("/kancelaria", function(req, res) {
  res.render("kancelaria");
});

app.get("/team", function(req, res) {
  res.render("team");
});

app.get("/kontakt", function(req, res) {
  res.render("kontakt");
});

// app.get("/login", function(req, res) {
//   res.render("login");
// });

app.get("/edit/artykul", function(req, res) {
  res.render("edit-post", {
    id: null,
    naglowek: "Dodaj nowy artykuł",
    tytul: "",
    data: "",
    lead: "",
    tresc: "",
    link: "",
    zrodlo: "",
    placeholder: "Podaj hasło"
  });
});

app.get("/edit/film", function(req, res) {
  res.render("edit-film", {
    id: null,
    naglowek: "Dodaj nowy film",
    tytul: "",
    link: "",
    placeholder: "Podaj hasło"
  });
});

app.get("/filmy", function(req, res) {
  Film.find(function(err, foundEntries) {
    if(err) {
    console.log(err);
  } else {
    res.render("filmy", {
      films: foundEntries,
    });
  }
}).sort({date: -1});
});

app.get("/artykuly", function(req, res) {
  Post.find(function(err, foundEntries) {
  if(err) {
    console.log(err);
  } else {
    res.render("artykuly", {
      posts: foundEntries,
    });
  }
}).sort({date: -1});
});

app.get("/powiadomienia", function(req, res){

    Mail.find(function(err, foundEntries) {
    if(err) {
      console.log(err);
    } else {
      res.render("powiadomienia", {
        posts: foundEntries,
      });
    }
  }).sort({date: -1});
 });

// app.post("/login", function(req, res) {
//       const username = req.body.username;
//       const password = req.body.password;
//
//       User.findOne({login: username}, function(err, foundUser){
//       if(err) {
//         console.log(err);
//       } else {
//         if(foundUser) {
//           if (foundUser.password === password) {
//             res.render("panel");
//             console.log(foundUser.password);
//           }
//           else {
//             console.log("wrong password " + password);
//           }
//         } else {
//           console.log("wrong user " + username);
//         }
//       }
//     });
// });

app.get("/panel", function(req, res){
   res.render("panel");
 });

app.get("/posts/:postId", function(req, res) {
  const requestedTitle = lodash.kebabCase(req.params.postId);
  Post.findOne({href: requestedTitle}, function(err, foundPost){
    if(foundPost) {
      res.render("post", {
        tytul: foundPost.title,
        data: foundPost.date,
        lead: foundPost.lead,
        tresc: foundPost.content,
        link: foundPost.link,
        zrodlo: foundPost.source
      });
    } else {
      res.render("not-found");
    }
  });
});

app.get("/powiadomienia/:postId", function(req, res) {
  const requestedId = req.params.postId;
  Mail.findOne({_id: requestedId}, function(err, foundMail){
    if(foundMail) {
      res.render("mail", {
        kontakt: foundMail.kontakt,
        tresc: foundMail.tresc,
      });
    } else {
      res.render("not-found");
    }
  });
});

app.get("/edit/:postId", function(req, res) {
  const requestedTitle = lodash.kebabCase(req.params.postId);
  Post.findOne({href: requestedTitle}, function(err, foundPost){
    if(foundPost) {
          // console.log(foundPost);
      res.render("edit-post", {
        id: foundPost._id,
        naglowek: "Edycja postu:",
        tytul: foundPost.title,
        data: foundPost.date,
        lead: foundPost.lead,
        tresc: foundPost.content,
        link: foundPost.link,
        zrodlo: foundPost.source,
        placeholder: "Podaj hasło"
      });
    } else {
      Film.findOne({href: lodash.kebabCase(req.params.postId)}, function(err, foundFilm) {
          if(foundFilm) {
          res.render("edit-film", {
            id: foundFilm._id,
            naglowek: "Edycja filmu:",
            tytul: foundFilm.title,
            link: foundFilm.link,
            placeholder: "Podaj hasło"
          });
        } else {
          res.render("not-found");
        }
      }
  );
}});});

app.get("/delete/:postId", function(req, res) {
  const requestedTitle = lodash.kebabCase(req.params.postId);
  Post.findOne({href: requestedTitle}, function(err, foundPost){
    if(foundPost) {
          // console.log(foundPost);
      res.render("delete", {
        co: "artykuł",
        tytul: foundPost.title,
        id: foundPost._id,
        placeholder: "Podaj hasło"
      });
    } else {
      Film.findOne({href: lodash.kebabCase(req.params.postId)}, function(err, foundFilm) {
          if(foundFilm) {
          res.render("delete", {
            co: "film",
            tytul: foundFilm.title,
            id: foundFilm._id,
            placeholder: "Podaj hasło"
          });
        } else {
          res.render("not-found");
        }
      }
  );
}});
});

app.post("/delete", function(req, res) {
  const requestedId = req.body.id;
  const pass = req.body.pass;
  if(pass==="K4ncel@riA") {
  Post.deleteOne({_id: requestedId}, function() {
    console.log(requestedId);
  });
  Film.deleteOne({_id: requestedId}, function(){
    console.log(requestedId);
  });
  res.redirect("/panel");
} else {
  Post.findOne({_id: requestedId}, function(err, foundPost){
    if(foundPost) {
          // console.log(foundPost);
      res.render("delete", {
        co: "artykuł",
        tytul: foundPost.title,
        id: foundPost._id,
        placeholder: "Podano błędne hasło"
      });
    } else {
      Film.findOne({_id: requestedId}, function(err, foundFilm) {
          if(foundFilm) {
          res.render("delete", {
            co: "film",
            tytul: foundFilm.title,
            id: foundFilm._id,
            placeholder: "Podano błędne hasło"
          });
        } else {
          res.render("not-found");
        }
      }
  );
}});
}
});

app.post("/edit-post", function(req, res) {
const tytul = req.body.title;
const data = req.body.date;
const lead = req.body.lead;
const tresc = req.body.content;
const link = req.body.link;
const href = lodash.kebabCase(req.body.title);
const zrodlo = req.body.source;
const news = req.body.news;
const covid = req.body.covid;
const requestedId = req.body.id;
const pass = req.body.pass;
const blogEntry = new Post ({
  title: tytul,
  date: data,
  lead: lead,
  content: tresc,
  link: link,
  href: href,
  source: zrodlo,
  news: news,
  covid: covid
});

if(pass==="K4ncel@riA") {
Post.findOneAndUpdate({_id: req.body.id}, {$set: {
  title: tytul,
  date: data,
  lead: lead,
  content: tresc,
  link: link,
  href: href,
  source: zrodlo,
  news: news,
  covid: covid
}}, {returnOriginal: false}, function(err) {
  if(!err) {
    res.redirect("/panel");
  } else {
    blogEntry.save(function(err) {
      if(!err){
        res.redirect("/panel");
      }
    });
  }
});
} else {
  res.render("edit-post", {
    id: requestedId,
    naglowek: "Edycja postu:",
    tytul: tytul,
    data: data,
    lead: lead,
    tresc: tresc,
    link: link,
    zrodlo: zrodlo,
    placeholder: "Podano błędne hasło"
  });
}});

app.post("/edit-film", function(req, res) {
  const link = req.body.link;
  const title = req.body.title;
  const href = lodash.kebabCase(req.body.title);
  const requestedId = req.body.id;
  const pass = req.body.pass;
  const filmEntry = new Film ({
    title: title,
    link: link,
    href: href
  });

if(pass==="K4ncel@riA") {
  Film.findOneAndUpdate({_id: req.body.id}, {$set: {
    title: title,
    link: link,
    href: href
  }}, {returnOriginal: false}, function(err) {
    if(!err) {
      res.redirect("/panel");
    } else {
      filmEntry.save(function(err) {
        if(!err){
          res.redirect("/panel");
        }
      });
    }
  });
} else {
  res.render("edit-film", {
    id: requestedId,
    naglowek: "Edycja filmu:",
    tytul: title,
    link: link,
    placeholder: "Podno błędne hasło"
  });
}

});

app.post("/powiadomienia", function(req, res) {
  const tresc = req.body.wiadomosc;
  const kontakt = req.body.mail;

  const mailEntry = new Mail ({
    tresc: tresc,
    kontakt: kontakt
  });

  mailEntry.save(function(err) {
    if(!err){
      res.redirect("/kontakt");
    }
  });
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);
