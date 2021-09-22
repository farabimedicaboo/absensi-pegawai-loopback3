"use strict";

const moment = require("moment");

module.exports = function (Attendance) {
  const checkEmployee = function (username) {
    const app = Attendance.app;
    const Employee = app.models.Employee;
    const employee = Employee.findOne({
      where: { username: username },
    });

    return employee;
  };

  // Function Hadir
  Attendance.beforeRemote("checkin", function (context, unused, next) {
    const { username } = context.args;

    checkEmployee(username)
      .then((response) => {
        if (!response) {
          next(new Error("Invalid Username"));
        } else {
          // Init start of day
          const today = moment().startOf("day");

          Attendance.findOne({
            where: {
              and: [
                { employeeId: response.id },
                { isApproved: true },
                { createdAt: { gte: today } },
                { createdAt: { lte: moment(today).endOf("day").toDate() } },
              ],
            },
          })
            .then((res) => {
              if (res) {
                next(new Error("Sudah melakukan absen"));
              } else {
                next();
              }
            })
            .catch((err) => {
              next(err);
            });
        }
      })
      .catch((err) => {
        next(err);
      });
  });

  Attendance.checkin = function (username, cb) {
    checkEmployee(username)
      .then((response) => {
        Attendance.create({
          status: "hadir",
          employeeId: response.id,
        });
        cb(null, "Berhasil melakukan absen checkin");
      })
      .catch((err) => {
        cb(err);
      });
  };

  Attendance.remoteMethod("checkin", {
    accepts: { arg: "username", type: "string" },
    returns: { arg: "message", type: "string" },
  });

  // function checkout
  Attendance.checkout = async function (username) {
    try {
      const employee = await Employee.findOne({
        where: { username: username },
      });
      if (!employee) {
        return "Username invalid";
      }

      // Init start of day
      const today = moment().startOf("day");

      const attendance = await Attendance.findOne({
        where: {
          and: [
            { employeeId: employee.id },
            { isApproved: true },
            { createdAt: { gte: today } },
            { createdAt: { lte: moment(today).endOf("day").toDate() } },
          ],
        },
      });

      if (attendance.end != undefined) {
        return "Sudah melakukan absen checkout";
      }

      attendance.updateAttributes({
        end: moment().format(),
        updatedAt: moment().format(),
      });

      return "Berhasil melakukan absen checkout";
    } catch (error) {
      return error;
    }
  };

  Attendance.remoteMethod("checkout", {
    accepts: { arg: "username", type: "string" },
    returns: { arg: "message", type: "string" },
  });

  // Before
  Attendance.beforeRemote("cuti", function (context, unused, next) {
    const { username, start, end } = context.args;
    const startCuti = moment(start).diff(moment(), "days");
    const calcDate = moment(end).diff(moment(start), "days");

    if (calcDate <= 0 || startCuti < 0) {
      return next(new Error("Invalid Time"));
    }

    checkEmployee(username)
      .then((response) => {
        if (!response) {
          next(new Error("Invalid Username"));
        } else {
          next();
        }
      })
      .catch((err) => {
        next(err);
      });
  });

  // Function Cuti
  Attendance.cuti = async function (username, start, end, keterangan) {
    try {
      const employee = await checkEmployee(username);

      Attendance.create({
        status: "cuti",
        start: moment(start),
        end: moment(end),
        employeeId: employee.id,
        isApproved: false,
        keterangan: keterangan,
      });

      return "Berhasil mengajukan cuti";
    } catch (error) {
      return error;
    }
  };

  Attendance.remoteMethod("cuti", {
    http: {
      path: "/cuti",
      verb: "post",
    },
    accepts: [
      { arg: "username", type: "string", required: true },
      { arg: "start", type: "date", required: true },
      { arg: "end", type: "date", required: true },
      { arg: "keterangan", type: "string" },
    ],
    returns: {
      arg: "data",
      type: "string",
    },
  });

  // Function Accept Izin
  // Before
  Attendance.beforeRemote("approve", function (context, unused, next) {
    const { id } = context.args;
    Attendance.findOne({ where: { id: id } }).then((response) => {
      if (!response) {
        next(new Error("Invalid ID"));
      } else {
        next();
      }
    });
  });

  Attendance.approve = function (id, cb) {
    Attendance.findOne({ where: { id: id } }).then((response) => {
      response
        .updateAttributes({
          isApproved: true,
          updatedAt: moment().format(),
        })
        .then(cb(null, "Izin Diberikan"))
        .catch((e) => {
          cb(e);
        });
    });
  };

  Attendance.remoteMethod("approve", {
    http: {
      path: "/approve",
      verb: "put",
    },
    accepts: { arg: "id", type: "string" },
    returns: { arg: "message", type: "string" },
  });

  // Function Izin
  Attendance.beforeRemote("izin", function (context, unused, next) {
    const { username, start, end } = context.args;
    const startIzin = moment(start).diff(moment(), "days");
    const calcDate = moment(end).diff(moment(start), "days");

    if (calcDate <= 0 || startIzin < 0) {
      return next(new Error("Invalid Time"));
    }

    checkEmployee(username)
      .then((response) => {
        if (!response) {
          next(new Error("Invalid Username"));
        } else {
          next();
        }
      })
      .catch((err) => {
        next(err);
      });
  });

  // Function izin
  Attendance.izin = async function (username, start, end, keterangan) {
    try {
      const employee = await checkEmployee(username);

      Attendance.create({
        status: "izin",
        start: moment(start),
        end: moment(end),
        employeeId: employee.id,
        isApproved: false,
        keterangan: keterangan,
      });

      return "Berhasil mengajukan izin";
    } catch (error) {
      return error;
    }
  };

  Attendance.remoteMethod("izin", {
    http: {
      path: "/izin",
      verb: "post",
    },
    accepts: [
      { arg: "username", type: "string", required: true },
      { arg: "start", type: "date", required: true },
      { arg: "end", type: "date", required: true },
      { arg: "keterangan", type: "string" },
    ],
    returns: {
      arg: "data",
      type: "string",
    },
  });
};
