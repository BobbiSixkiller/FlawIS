const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      default: "basic",
      enum: ["basic", "supervisor", "admin"],
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

userSchema.index({
  email: "text",
  firstName: "text",
  lastName: "text",
});

userSchema.statics.getUsersAggregation = function (limit, skip) {
  return this.aggregate([
    {
      $lookup: {
        from: "grants",
        localField: "_id",
        foreignField: "budget.members.member",
        as: "grants",
      },
    },
    { $addFields: { grants: "$grants" } },
    { $unwind: { path: "$grants", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$grants.budget", preserveNullAndEmptyArrays: true } },
    {
      $unwind: {
        path: "$grants.budget.members",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        $or: [
          {
            $and: [
              { $expr: { $eq: ["$_id", "$grants.budget.members.member"] } },
              {
                $expr: {
                  $eq: [
                    new Date().getFullYear(),
                    { $year: "$grants.budget.year" },
                  ],
                },
              },
            ],
          },
          { grants: { $eq: null } },
        ],
      },
    },
    {
      $group: {
        _id: "$_id",
        firstName: { $first: "$firstName" },
        lastName: { $first: "$lastName" },
        email: { $first: "$email" },
        role: { $first: "$role" },
        tokens: { $first: "$tokens" },
        hoursTotal: { $sum: "$grants.budget.members.hours" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
      },
    },
    {
      $project: {
        _id: 1,
        firstName: 1,
        lastName: 1,
        fullName: { $concat: ["$firstName", " ", "$lastName"] },
        email: 1,
        role: 1,
        hoursTotal: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $sort: {
        updatedAt: -1,
      },
    },
    { $skip: skip },
    { $limit: limit },
  ]);
};

userSchema.statics.getUserAggregation = function (userId, year) {
  return this.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "grants",
        localField: "_id",
        foreignField: "budget.members.member",
        as: "grants",
      },
    },
    { $addFields: { grants: "$grants" } },
    { $unwind: { path: "$grants", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$grants.budget", preserveNullAndEmptyArrays: true } },
    {
      $unwind: {
        path: "$grants.budget.members",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        $and: [
          { $expr: { $eq: ["$_id", "$grants.budget.members.member"] } },
          {
            $expr: {
              $eq: [
                new Date(year).getFullYear(),
                { $year: "$grants.budget.year" },
              ],
            },
          },
        ],
      },
    },
    {
      $sort: {
        "grants.updatedAt": -1,
      },
    },
    {
      $group: {
        _id: "$_id",
        firstName: { $first: "$firstName" },
        lastName: { $first: "$lastName" },
        email: { $first: "$email" },
        role: { $first: "$role" },
        tokens: { $first: "$tokens" },
        hoursTotal: { $sum: "$grants.budget.members.hours" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        grants: { $push: "$grants" },
      },
    },
    {
      $project: {
        _id: 1,
        firstName: 1,
        lastName: 1,
        fullName: { $concat: ["$firstName", " ", "$lastName"] },
        email: 1,
        role: 1,
        hoursTotal: 1,
        grants: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);
};

userSchema.statics.getUsersGrantsAggregation = function () {
  return this.aggregate([
    {
      $lookup: {
        from: "grants",
        localField: "_id",
        foreignField: "budget.members.member",
        as: "grants",
      },
    },
    {
      $addFields: {
        groupGrants: "$grants",
      },
    },
    { $unwind: { path: "$groupGrants", preserveNullAndEmptyArrays: true } },
    {
      $unwind: {
        path: "$groupGrants.budget",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$groupGrants.budget.members",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        $or: [
          {
            $and: [
              {
                $expr: { $eq: ["$_id", "$groupGrants.budget.members.member"] },
              },
              {
                $expr: {
                  $eq: [
                    new Date().getFullYear(),
                    { $year: "$groupGrants.budget.year" },
                  ],
                },
              },
            ],
          },
          { groupGrants: { $eq: null } },
        ],
      },
    },
    {
      $group: {
        _id: "$_id",
        firstName: { $first: "$firstName" },
        lastName: { $first: "$lastName" },
        email: { $first: "$email" },
        role: { $first: "$role" },
        tokens: { $first: "$tokens" },
        grants: { $first: "$grants" },
        hoursTotal: { $sum: "$groupGrants.budget.members.hours" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
      },
    },
    { $unwind: { path: "$grants", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$grants.budget", preserveNullAndEmptyArrays: true } },
    {
      $unwind: {
        path: "$grants.budget.members",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "grants.budget.members.member",
        foreignField: "_id",
        as: "users",
      },
    },
    { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        "grants.budget.members.member": {
          $mergeObjects: ["$grants.budget.members", "$users"],
        },
      },
    },
    {
      $project: {
        users: 0,
      },
    },
    {
      $group: {
        _id: {
          _id: "$_id",
          grantId: "$grants._id",
          budgetId: "$grants.budget._id",
        },
        firstName: { $first: "$firstName" },
        lastName: { $first: "$lastName" },
        email: { $first: "$email" },
        role: { $first: "$role" },
        tokens: { $first: "$tokens" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        grants: {
          $first: "$grants",
        },
        budget: {
          $first: "$grants.budget",
        },
        members: {
          $push: "$grants.budget.members",
        },
        hoursTotal: { $first: "$hoursTotal" },
      },
    },
    {
      $group: {
        _id: {
          _id: "$_id._id",
          grantId: "$grants._id",
        },
        firstName: { $first: "$firstName" },
        lastName: { $first: "$lastName" },
        email: { $first: "$email" },
        role: { $first: "$role" },
        tokens: { $first: "$tokens" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        grants: {
          $first: "$grants",
        },
        budget: {
          $push: {
            _id: "$budget._id",
            year: "$budget.year",
            travel: "$budget.travel",
            services: "$budget.services",
            material: "$budget.material",
            members: "$members",
          },
        },
        hoursTotal: { $first: "$hoursTotal" },
      },
    },
    {
      $sort: {
        "grants.updatedAt": -1,
      },
    },
    {
      $group: {
        _id: "$_id._id",
        firstName: { $first: "$firstName" },
        lastName: { $first: "$lastName" },
        email: { $first: "$email" },
        role: { $first: "$role" },
        tokens: { $first: "$tokens" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        grants: {
          $push: {
            _id: "$grants._id",
            name: "$grants.name",
            idNumber: "$grants.idNumber",
            type: "$grants.type",
            start: "$grants.start",
            end: "$grants.end",
            budget: "$budget",
          },
        },
        hoursTotal: { $first: "$hoursTotal" },
      },
    },
    {
      $sort: { lastName: 1 },
    },
  ]).exec();
};

userSchema.statics.getUserGrantsAggregation = function (id, year) {
  return this.aggregate([
    {
      $match: {
        _id: { $eq: mongoose.Types.ObjectId(id) },
      },
    },
    {
      $lookup: {
        from: "grants",
        localField: "_id",
        foreignField: "budget.members.member",
        as: "grants",
      },
    },
    {
      $addFields: {
        groupGrants: "$grants",
      },
    },
    { $unwind: { path: "$groupGrants", preserveNullAndEmptyArrays: true } },
    {
      $unwind: {
        path: "$groupGrants.budget",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$groupGrants.budget.members",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        $or: [
          {
            $and: [
              {
                $expr: { $eq: ["$_id", "$groupGrants.budget.members.member"] },
              },
              {
                $expr: {
                  $eq: [
                    new Date(year).getFullYear(),
                    { $year: "$groupGrants.budget.year" },
                  ],
                },
              },
            ],
          },
          { groupGrants: { $eq: null } },
        ],
      },
    },
    {
      $group: {
        _id: "$_id",
        firstName: { $first: "$firstName" },
        lastName: { $first: "$lastName" },
        email: { $first: "$email" },
        role: { $first: "$role" },
        tokens: { $first: "$tokens" },
        grants: { $first: "$grants" },
        hoursTotal: { $sum: "$groupGrants.budget.members.hours" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
      },
    },
    { $unwind: { path: "$grants", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$grants.budget", preserveNullAndEmptyArrays: true } },
    {
      $unwind: {
        path: "$grants.budget.members",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "grants.budget.members.member",
        foreignField: "_id",
        as: "users",
      },
    },
    { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        "grants.budget.members.member": {
          $mergeObjects: ["$grants.budget.members", "$users"],
        },
      },
    },
    {
      $project: {
        users: 0,
      },
    },
    {
      $group: {
        _id: {
          _id: "$_id",
          grantId: "$grants._id",
          budgetId: "$grants.budget._id",
        },
        firstName: { $first: "$firstName" },
        lastName: { $first: "$lastName" },
        email: { $first: "$email" },
        role: { $first: "$role" },
        tokens: { $first: "$tokens" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        grants: {
          $first: "$grants",
        },
        budget: {
          $first: "$grants.budget",
        },
        members: {
          $push: "$grants.budget.members",
        },
        hoursTotal: { $first: "$hoursTotal" },
      },
    },
    {
      $group: {
        _id: {
          _id: "$_id._id",
          grantId: "$grants._id",
        },
        firstName: { $first: "$firstName" },
        lastName: { $first: "$lastName" },
        email: { $first: "$email" },
        role: { $first: "$role" },
        tokens: { $first: "$tokens" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        grants: {
          $first: "$grants",
        },
        budget: {
          $push: {
            _id: "$budget._id",
            year: "$budget.year",
            travel: "$budget.travel",
            services: "$budget.services",
            material: "$budget.material",
            members: "$members",
          },
        },
        hoursTotal: { $first: "$hoursTotal" },
      },
    },
    {
      $sort: {
        "grants.updatedAt": -1,
      },
    },
    {
      $group: {
        _id: "$_id._id",
        firstName: { $first: "$firstName" },
        lastName: { $first: "$lastName" },
        email: { $first: "$email" },
        role: { $first: "$role" },
        tokens: { $first: "$tokens" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        grants: {
          $push: {
            _id: "$grants._id",
            name: "$grants.name",
            idNumber: "$grants.idNumber",
            type: "$grants.type",
            start: "$grants.start",
            end: "$grants.end",
            budget: "$budget",
            createdAt: "$grants.createdAt",
            updatedAt: "$grants.updatedAt",
          },
        },
        hoursTotal: { $first: "$hoursTotal" },
      },
    },
  ]).exec();
};

userSchema.virtual("fullName").get(function () {
  const fullName = this.firstName + " " + this.lastName;
  return fullName;
});

userSchema.virtual("grants", {
  ref: "Grant",
  localField: "_id",
  foreignField: "budget.members.member",
  justOne: false,
});

userSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "userId",
  justOne: false,
});

userSchema.pre("remove", function (next) {
  const user = this;
  console.log(user);
  user
    .model("Grant")
    .updateMany(
      { "budget.members.member": user._id },
      { $pull: { "budget.$[].members": { member: user._id } } }
    );
  next();
});

module.exports = mongoose.model("User", userSchema);
