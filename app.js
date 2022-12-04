//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const day = date.getDate();


const user_typed_item = [];
// ---------------------------------------------

mongoose.connect("mongodb+srv://admin-prakhar-hatim:prakhar_hatim9015_20062021@cluster0.ieqc6bg.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String,
    // type: String,
    // required: [true, "Please don't leave the field empty.🙏"]
  // }
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist📃!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<--- Hit this to delete an item."
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);


// ---------------------------------------------------------------------------
const defaultItems = [item1, item2, item3];


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
  // const day = date.getDate();

  if (foundItems.length === 0) {

    Item.insertMany(defaultItems, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully saved all the " + defaultItems.length +" items to todolistDB.");
      }
    })
    res.redirect("/");

  } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
  }

});

});

// ---------------------------------------------------------------------------

app.get("/:customListName", function(req, res) {
  // console.log(req.params.customListName);
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        // Create a new list and show
        console.log("Doesn't exist");

        const list = new List({
          name: customListName,
         items: defaultItems       //it needs improvement...create an empty list don't show those 3 stupid names...
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // Show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        console.log("exists");
      };
    };

  });

});
// ---------------------------------------------------------------------------


  app.post("/", function(req, res){

    const itemName = req.body.newItem;
    // console.log(itemName);
    const listName = req.body.list;  //listname= where the user currently is...so whether in Today heading or...a custom one..eg School, college, etc.
    console.log(listName);

    const item = new Item({     //New object...or Goal which teh user has typed...& create a new object by the same name and store it in a database.
      name: itemName
    });

    if (listName === "Today") {
      item.save();
      res.redirect("/");
    } else {
      List.findOne({name: listName}, function(err, foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
    }

  });

// ---------------------------------------------------------------------------

  app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    console.log(checkedItemId);

    if (listName === "Today") {
      Item.findByIdAndRemove(checkedItemId, function(err) {
        if (!err){
          console.log("Deleted the checked item.");
          res.redirect("/")
        }
      });
    } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      });
    };

  });


// ---------------------------------------------------------------------------

app.get("/about", function(req, res){
  res.render("about");
});

// ---------------------------------------------------------------------------

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
