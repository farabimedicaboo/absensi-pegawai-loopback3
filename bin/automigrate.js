var path = require("path");

var app = require(path.resolve(__dirname, "../server/server"));
var ds = app.datasources.mongoDS;

const migrateAttendance = function (id) {
  ds.automigrate("Attendance", function (err) {
    if (err) throw err;

    let attendance = [
      {
        status: "hadir",
        employeeId: id,
      },
    ];

    app.models.Attendance.create(attendance, function (err, model) {
      if (err) throw err;
      console.log("Created:", model);
    });
  });
};

ds.automigrate("Employee", function (err) {
  if (err) throw err;

  var employees = [
    {
      username: "farabiandrika",
      name: "Farabi Andrika",
    },
    {
      username: "ilham",
    },
    {
      username: "johndoe",
      name: "John",
    },
  ];

  var count = employees.length;

  employees.forEach(function (employee) {
    app.models.Employee.create(employee, function (err, model) {
      if (err) throw err;

      console.log("Created:", model);

      migrateAttendance(model.id);

      count--;
      if (count === 0) {
        ds.disconnect;
      }
    });
  });
});
