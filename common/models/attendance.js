"use strict";

const moment = require("moment");

module.exports = function (Attendance) {
  // function hadir
  Attendance.checkin = async function (username) {
    const app = Attendance.app;
    const Employee = app.models.Employee;
    try {
      const employee = await Employee.findOne({
        where: { username: username },
      });
      if (!employee) {
        return "Username invalid";
      }

      // Init start of day
      const today = moment().startOf("day");

      const checkAttendance = await Attendance.findOne({
        where: {
          and: [
            { employeeId: employee.id },
            { isApproved: true },
            { createdAt: { gte: today } },
            { createdAt: { lte: moment(today).endOf("day").toDate() } },
          ],
        },
      });

      if (checkAttendance) {
        return "Sudah melakukan absen";
      }

      Attendance.create({
        status: "hadir",
        employeeId: employee.id,
      });

      return "Berhasil melakukan absen checkin";
    } catch (error) {
      return error;
    }
  };

  Attendance.remoteMethod("checkin", {
    accepts: { arg: "username", type: "string" },
    returns: { arg: "message", type: "string" },
  });

  // function checkout
  Attendance.checkout = async function (username) {
    const app = Attendance.app;
    const Employee = app.models.Employee;
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
};
