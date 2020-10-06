const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	},
	issuedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}
}, {
	timestamps: true,
	toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

announcementSchema
.virtual('grants', {
	ref: 'Grant',
	localField: '_id',
	foreignField: 'announcements',
	justOne: false
});

announcementSchema.pre("remove", function(next) {
  	const announcement = this;
   	announcement.model('Grant').updateMany(
        { announcements: announcement._id }, 
        { $pull: { announcements: announcement._id } }
    );
  next();
});

announcementSchema.post("remove", function(announcement) {
   	announcement.model('Grant').updateMany(
        { announcements: announcement._id }, 
        { $pull: { announcements: announcement._id } }
    ).exec();
});

module.exports = mongoose.model('Announcement', announcementSchema);