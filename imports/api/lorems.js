import {Meteor} from "meteor/meteor";
import {Mongo} from "meteor/mongo";
import {check} from "meteor/check";
import _ from "lodash";

import {Drafts} from "./drafts";

export const Lorems = new Mongo.Collection("lorems");

if (Meteor.isServer) {
	// This code only runs on the server
	Meteor.publish("lorems", function loremsPublication(query = {}, options = {}) {
		return Lorems.find(query, options);
	});

	Meteor.methods({
		"lorems.count"(query = {}) {
			// console.log("lorems.count", query);
			check(query, Object);
			return Lorems.find(query).count();
		},

		async "lorems.iterations"(itemId) {
			// console.log("lorems.iterations", itemId);
			check(itemId, String);
			return await Lorems.find({itemId}, {sort: {iterations: -1}}).fetch();
		},

		async "lorem.instance"(query) {
			// console.log("lorem.instance", query);
			check(query, Object);
			let instance = await Lorems.find(query).fetch();
			if (_.isArray(instance)) instance = _.first(instance);
			return instance;
		},

		async "lorem.createDraft"(loremId) {
			// console.log("lorem.createDraft", {loremId});
			check(loremId, String);

			const userId = Meteor.user()._id;

			loremId = new Mongo.ObjectID(loremId);
			let lorem = await Lorems.findOne({_id: loremId});

			const sourceDocumentId = loremId;
			const sourceDocumentItemId = lorem.itemId;

			let existing = _.first(await Drafts.find({sourceDocumentItemId}).fetch());
			if (existing) return existing._id._str;

			const draft = {collectionName: "lorems", sourceDocumentId, sourceDocumentItemId};
			draft.document = _.omit(lorem, ["_id", "updatedAt", "updatedBy"]);
			draft.meta = {};
			draft.createdBy = userId;
			draft._id = new Mongo.ObjectID();
			const draftId = await Drafts.insert(draft);
			return draftId._str;
		},

		async "lorem.saveDraft"(draftId) {
			// console.log("lorem.saveDraft", draftId);
			check(draftId, String);

			const userId = Meteor.user()._id;

			draftId = new Mongo.ObjectID(draftId);
			let draft = await Drafts.findOne({_id: draftId});
			if (_.isEmpty(draft)) console.log("QUE???");

			const document = _.omit(draft.document, ["_id", "createdAt"]);

			let max = await Lorems.find({itemId: draft.sourceDocumentItemId}, {sort: {iteration: -1}}).fetch();
			max = _.first(max);
			await Lorems.update({_id: max._id}, {$set: {isLatest: false}});

			document.isLatest = true;
			document.iteration = max.iteration + 1;
			document.createdBy = userId;
			document.createdAt = new Date();
			document._id = new Mongo.ObjectID();

			await Drafts.remove({_id: draftId});
			const documentId = await Lorems.insert(document);
			return documentId._str;
		}

	});
}
