"use strict";

const moment = require("moment");

module.exports = function (Employee) {
  Employee.validatesUniquenessOf("username");

  Employee.laporan = function (bulan, tahun) {
    const startOfMonth = moment(`01-${bulan}-${tahun}`, "DD-MM-YYYY").utc();
    const endOfMonth = moment(`01-${bulan}-${tahun}`, "DD-MM-YYYY")
      .endOf("month")
      .utc();
    const daysOfMonth = startOfMonth.daysInMonth();

    return Employee.aggregate([
      {
        $lookup: {
          from: "Attendance",
          let: { employeeId: "$_id" },
          pipeline: [
            {
              $match: {
                $and: [
                  { $expr: { $eq: ["$employeeId", "$$employeeId"] } },
                  { status: "hadir" },
                  { isApproved: true },
                  {
                    createdAt: {
                      $gte: startOfMonth.toDate(),
                      $lte: endOfMonth.toDate(),
                    },
                  },
                ],
              },
            },
            {
              $project: {
                status: 1,
                start: {
                  $dateToString: {
                    date: { $add: ["$start", 7 * 60 * 60 * 1000] },
                    format: "%H:%M",
                  },
                },
              },
            },
            {
              $match: { start: { $lte: "08:30" } },
            },
          ],
          as: "hadir",
        },
      },
      {
        $lookup: {
          from: "Attendance",
          let: { employeeId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$employeeId", "$$employeeId"] },
                isApproved: true,
                status: "izin",
                createdAt: {
                  $gte: startOfMonth.toDate(),
                  $lte: endOfMonth.toDate(),
                },
              },
            },
          ],
          as: "izin",
        },
      },
      {
        $lookup: {
          from: "Attendance",
          let: { employeeId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$employeeId", "$$employeeId"] },
                isApproved: true,
                status: "cuti",
              },
            },
          ],
          as: "cuti",
        },
      },
      {
        $lookup: {
          from: "Attendance",
          let: { employeeId: "$_id" },
          pipeline: [
            {
              $match: {
                $and: [
                  { $expr: { $eq: ["$employeeId", "$$employeeId"] } },
                  { status: "hadir" },
                  { isApproved: true },
                  {
                    createdAt: {
                      $gte: startOfMonth.toDate(),
                      $lte: endOfMonth.toDate(),
                    },
                  },
                ],
              },
            },
            {
              $project: {
                start: {
                  $dateToString: {
                    date: { $add: ["$start", 7 * 60 * 60 * 1000] },
                    format: "%H:%M",
                  },
                },
              },
            },
            {
              $match: { start: { $gt: "08:30", $lte: "24:00" } },
            },
          ],
          as: "telat",
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          name: 1,
          absensi: {
            hadir: { $size: "$hadir" },
            telat: { $size: "$telat" },
            izin: { $size: "$izin" },
            cuti: { $size: "$cuti" },
            tanpa_keterangan: {
              $cond: {
                if: {
                  $gt: [
                    {
                      $subtract: [
                        { $add: daysOfMonth },
                        {
                          $sum: [
                            { $size: "$hadir" },
                            { $size: "$telat" },
                            { $size: "$izin" },
                            { $size: "$cuti" },
                          ],
                        },
                      ],
                    },
                    0,
                  ],
                },
                then: {
                  $subtract: [
                    { $add: daysOfMonth },
                    {
                      $sum: [
                        { $size: "$hadir" },
                        { $size: "$telat" },
                        { $size: "$izin" },
                        { $size: "$cuti" },
                      ],
                    },
                  ],
                },
                else: 0,
              },
            },
          },
        },
      },
    ]);
  };

  Employee.remoteMethod("laporan", {
    http: {
      path: "/laporan",
      verb: "get",
    },
    accepts: [
      { arg: "bulan", type: "number", required: true },
      { arg: "tahun", type: "number", required: true },
    ],
    returns: {
      arg: "data",
      type: "string",
    },
  });
  Employee.remoteMethod("laporan", {
    http: {
      path: "/laporan",
      verb: "get",
    },
    accepts: [
      { arg: "bulan", type: "number", required: true },
      { arg: "tahun", type: "number", required: true },
    ],
    returns: {
      arg: "data",
      type: "string",
    },
  });
};
