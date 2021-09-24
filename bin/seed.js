/* mySeedScript.js */
// require the necessary libraries
const faker = require("faker");
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const _ = require("lodash");
const moment = require("moment");
// Connection URL
const url = "mongodb://localhost:27017";

// Database Name
const dbName = "absensi_pegawai_loopback";

// Use connect method to connect to the server
MongoClient.connect(url, function (err, client) {
  assert.equal(null, err);

  const db = client.db(dbName);

  // get access to the relevant collections
  const EmployeeCollection = db.collection("Employee");
  const attendantCollection = db.collection("Attendance");

  EmployeeCollection.drop();
  attendantCollection.drop();

  // make a bunch of users
  let users = [];
  for (let i = 0; i < 10; i += 1) {
    const username = faker.name.firstName();
    const name = faker.name.lastName();
    let newUser = {
      username,
      name,
    };
    users.push(newUser);

    // visual feedback always feels nice!
    console.log(newUser.username);
  }
  EmployeeCollection.insertMany(users)
    .then(() => {
      for (let i = 0; i < 100; i += 1) {
        let newAttendant = {
          status: _.sample(["hadir", "izin", "sakit"]),
          start: moment().add(i, "days").utc()._d,
          employeeId: _.sampleSize(users).map((user) => user._id)[0],
          createdAt: moment().utc()._d,
          isApproved: true,
        };
        attendant.push(newAttendant);

        // visual feedback again!
        console.log(newAttendant.start);
      }
      attendantCollection.insertMany(attendant).catch((err) => {
        throw err;
      });

      console.log("Database seeded! :)");
    })
    .catch((err) => {
      throw err;
    });

  // make a bunch of posts
  let attendant = [];
});
