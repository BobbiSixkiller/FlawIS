const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true,
		trim: true,
		max: 50
	},
	lastName: {
		type: String,
		required: true,
		trim: true,
		max: 50
	},
	email: {
		type: String,
		required: true,
		max: 255,
		trim: true
	},
	password: {
		type: String,
		required: true,
		trim: true,
		min: 8,
		max: 1024
	},
	role: {
		type: String,
		default: 'basic',
		enum: ["basic", "supervisor", "admin"],
		trim: true
	},
	tokens: [{
		token: {
			type: String
		}
	}]
}, {
	timestamps: true,
	toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

userSchema.statics.getUsersGrantsAggregation = function () {
	return this.aggregate([
	    {
	      $lookup: {
	        from: "grants",
	        localField: "_id",
	        foreignField: "budget.members.member",
	        as: "grants"
	      },
	    },
	    {
	      $addFields: {
	        groupGrants: "$grants"
	      },
	    },
	    { $unwind: {path: "$groupGrants", preserveNullAndEmptyArrays: true} },
	    { $unwind: {path: "$groupGrants.budget", preserveNullAndEmptyArrays: true} },
	    { $unwind: {path: "$groupGrants.budget.members", preserveNullAndEmptyArrays: true} },
	   	{ 
	    	$match: { 
	    		$or: [
     				{ 
     					$and: [
     						{ $expr: {$eq: ["$_id", "$groupGrants.budget.members.member"]} }, 
     						{ $expr: {$eq: [new Date().getFullYear(), {$year: "$groupGrants.budget.year"}] } }
     					] 
     				},
      				{ groupGrants: { $eq: null } },
    			], 
    		} 
    	},
    	{
	      $group: {
	        _id: "$_id",
	        firstName: { $first: "$firstName" },
	        lastName: { $first: "$lastName"},
	        email: {$first: "$email"},
	        role: {$first: "$role"},
	        tokens: {$first: "$tokens"},
	        grants: { $first: "$grants" },
	        hoursTotal: { $sum: "$groupGrants.budget.members.hours" },
	        createdAt: { $first: "$createdAt" },
	        updatedAt: { $first: "$updatedAt" }
	      },
	    },
	    { $unwind: {path: "$grants", preserveNullAndEmptyArrays: true} },
	    { $unwind: {path: "$grants.budget", preserveNullAndEmptyArrays: true} },
	    { $unwind: {path: "$grants.budget.members", preserveNullAndEmptyArrays: true} },
	    {
	      $lookup: {
	        from: "users",
	        localField: "grants.budget.members.member",
	        foreignField: "_id",
	        as: "users",
	      },
	    },
	    { $unwind: {path: "$users", preserveNullAndEmptyArrays: true} },
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
	          budgetId: "$grants.budget._id"
	        },
	        firstName: { $first: "$firstName" },
	        lastName: { $first: "$lastName"},
	        email: {$first: "$email"},
	        role: {$first: "$role"},
	        tokens: {$first: "$tokens"},
	        createdAt: { $first: "$createdAt" },
	        updatedAt: { $first: "$updatedAt"},
	        grants: {
	          $first: "$grants",
	        },
	        budget: {
	          $first: "$grants.budget",
	        },
	        members: {
	        	$push: "$grants.budget.members",
	        },
	        hoursTotal: { $first: "$hoursTotal" }   
	      },
	    },
	    {
	      $group: {
	        _id: {
	          _id: "$_id._id",
	          grantId: "$grants._id"	          
	        },
	        firstName: { $first: "$firstName" },
	        lastName: { $first: "$lastName"},
	        email: {$first: "$email"},
	        role: {$first: "$role"},
	        tokens: {$first: "$tokens"},
	        createdAt: { $first: "$createdAt" },
	        updatedAt: { $first: "$updatedAt"},
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
	          	members: "$members"
	          },
	        },
	        hoursTotal: { $first: "$hoursTotal" },
	      },
		},
		{
	    	$sort: {
	    		"grants.updatedAt": -1
	    	}
		},
	    {
	      $group: {
	        _id: "$_id._id",
	        firstName: { $first: "$firstName" },
	        lastName: { $first: "$lastName"},
	        email: {$first: "$email"},
	        role: {$first: "$role"},
	        tokens: {$first: "$tokens"},
	        createdAt: { $first: "$createdAt" },
	        updatedAt: { $first: "$updatedAt"},
	        grants: {
	          $push: {
	            _id: "$grants._id",
	            name: "$grants.name",
	            idNumber: "$grants.idNumber",
	            type: "$grants.type",
	            start: "$grants.start",
	            end: "$grants.end",
	            budget: "$budget"
	          },
	        },
	        hoursTotal: { $first: "$hoursTotal" },
	      },
		},
		{
			$sort: { lastName: 1}
		}
	]).exec();
}

userSchema.statics.getUserGrantsAggregation = function (id, year) {
	return this.aggregate([
    	{
	      $match: {
	      	_id: { $eq: mongoose.Types.ObjectId(id) }
	      },
	    },
	    {
	      $lookup: {
	        from: "grants",
	        localField: "_id",
	        foreignField: "budget.members.member",
	        as: "grants"
	      },
	    },
	    {
	      $addFields: {
	        groupGrants: "$grants"
	      },
	    },
	    { $unwind: {path: "$groupGrants", preserveNullAndEmptyArrays: true} },
	    { $unwind: {path: "$groupGrants.budget", preserveNullAndEmptyArrays: true} },
	    { $unwind: {path: "$groupGrants.budget.members", preserveNullAndEmptyArrays: true} },
	   	{ 
	    	$match: { 
	    		$or: [
     				{ 
     					$and: [
							 { $expr: {$eq: ["$_id", "$groupGrants.budget.members.member"]} }, 
							 { $expr: {$eq: [new Date(year).getFullYear(), {$year: "$groupGrants.budget.year"}] } }
     					] 
     				},
      				{ groupGrants: { $eq: null } },
    			], 
    		} 
    	},
    	{
	      $group: {
	        _id: "$_id",
	        firstName: { $first: "$firstName" },
	        lastName: { $first: "$lastName"},
	        email: {$first: "$email"},
	        role: {$first: "$role"},
	        tokens: {$first: "$tokens"},
	        grants: { $first: "$grants" },
	        hoursTotal: { $sum: "$groupGrants.budget.members.hours" },
	        createdAt: { $first: "$createdAt" },
	        updatedAt: { $first: "$updatedAt" }
	      },
	    },
	    { $unwind: {path: "$grants", preserveNullAndEmptyArrays: true} },
	    { $unwind: {path: "$grants.budget", preserveNullAndEmptyArrays: true} },
	    { $unwind: {path: "$grants.budget.members", preserveNullAndEmptyArrays: true} },
	    {
	      $lookup: {
	        from: "users",
	        localField: "grants.budget.members.member",
	        foreignField: "_id",
	        as: "users",
	      },
	    },
	    { $unwind: {path: "$users", preserveNullAndEmptyArrays: true} },
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
	      }
		},
	    {
	      $group: {
	        _id: {
	          _id: "$_id",
	          grantId: "$grants._id",
	          budgetId: "$grants.budget._id"
	        },
	        firstName: { $first: "$firstName" },
	        lastName: { $first: "$lastName"},
	        email: {$first: "$email"},
	        role: {$first: "$role"},
	        tokens: {$first: "$tokens"},
	        createdAt: { $first: "$createdAt" },
	        updatedAt: { $first: "$updatedAt"},
	        grants: {
	          $first: "$grants",
	        },
	        budget: {
	          $first: "$grants.budget",
	        },
	        members: {
				$push: "$grants.budget.members",
	        },
	        hoursTotal: { $first: "$hoursTotal" }   
	      },
	    },
	    {
	      $group: {
	        _id: {
	          _id: "$_id._id",
	          grantId: "$grants._id"	          
	        },
	        firstName: { $first: "$firstName" },
	        lastName: { $first: "$lastName"},
	        email: {$first: "$email"},
	        role: {$first: "$role"},
	        tokens: {$first: "$tokens"},
	        createdAt: { $first: "$createdAt" },
	        updatedAt: { $first: "$updatedAt"},
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
	          	members: "$members"
	          },
	        },
	        hoursTotal: { $first: "$hoursTotal" },
	      },
		},
		{
	    	$sort: {
	    		"grants.updatedAt": -1
	    	}
		},
	    {
	      $group: {
	        _id: "$_id._id",
	        firstName: { $first: "$firstName" },
	        lastName: { $first: "$lastName"},
	        email: {$first: "$email"},
	        role: {$first: "$role"},
	        tokens: {$first: "$tokens"},
	        createdAt: { $first: "$createdAt" },
	        updatedAt: { $first: "$updatedAt"},
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
	            updatedAt: "$grants.updatedAt"
	          },
	        },
	        hoursTotal: { $first: "$hoursTotal" },
	      },
		},
	]).exec();
}

userSchema
.virtual('fullName')
.get(function () {
	const fullName = this.firstName + ' ' + this.lastName;
	return fullName;
})

userSchema
.virtual('grants', {
	ref: 'Grant',
	localField: '_id',
	foreignField: 'budget.members.member',
	justOne: false
}); 

userSchema.pre("remove", function(next) {
  	const user = this;
  	console.log(user);
   	user.model('Grant').updateMany(
        { "budget.members.member": user._id }, 
        { $pull: { "budget.$[].members": { member: user._id } } }
    );
  next();
});

userSchema.post("remove", function(user) {
	console.log(user);
   	user.model('Grant').updateMany(
        { "budget.members.member": user._id }, 
        { $pull: { "budget.$[].members": { member: user._id } } }
    ).exec();
});

module.exports = mongoose.model('User', userSchema);