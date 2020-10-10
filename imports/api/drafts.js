import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {check} from 'meteor/check';
import _ from "lodash";

export const Drafts = new Mongo.Collection('drafts');

if (Meteor.isServer) {
	// This code only runs on the server
	Meteor.publish('drafts', function loremsPublication(query = {}, options = {}) {
		return Drafts.find(query, options);
	});

	Meteor.methods({

		async 'draft.instance'(draftId) {
			// console.log('lorem.instance', draftId);
			check(draftId, String);
			let draft = await Drafts.findOne({_id: draftId});
			return draft;
		},

		async 'draft.focus'(params) {
			// console.log('draft.focus', params);
			check(params, Object);
			let {draftId, field} = params;
			check(draftId, String);
			check(field, String);

			const userId = Meteor.user()._id;

			draftId = new Mongo.ObjectID(draftId);
			const draft = await Drafts.findOne({_id: draftId});
			if (!draft) throw new Error(`Drafts does not exist: ${draftId}`);

			let meta = _.get(draft, 'meta', {});
			if (_.get(meta, field)) return false;

			_.each(meta, (val, id) => {
				if (_.get(val, 'user', false) === userId) {
					meta = _.omit(meta, id);
				}
			});
			_.set(meta, field, {user: userId});
			await Drafts.update({_id: draftId}, {$set: {meta}});
			return true;
		},

		async 'draft.blur'(params) {
			// console.log('draft.blur', params);
			check(params, Object);
			let {draftId, field} = params;
			check(draftId, String);
			check(field, String);

			const userId = Meteor.user()._id;

			draftId = new Mongo.ObjectID(draftId);
			const draft = await Drafts.findOne({_id: draftId});
			if (!draft) throw new Error(`Drafts does not exist: ${draftId}`);

			const meta = _.get(draft, 'meta', null);
			if (meta) {
				const curr = _.get(meta, field);
				if (curr) {
					const userId = _.get(curr, 'user');
					if (userId !== userId) return false;
					const metaData = _.omit(meta, field);
					await Drafts.update({_id: draftId}, {$set: {meta: metaData}});
				}
			}
			return true;
		},

		async 'draft.change'(params) {
			// console.log('draft.change', params);
			check(params, Object);
			let {draftId, field, value} = params;
			check(draftId, String);
			check(field, String);

			const userId = Meteor.user()._id;

			draftId = new Mongo.ObjectID(draftId);
			const draft = await Drafts.findOne({_id: draftId});
			if (draft) {
				let {document} = draft;
				document = _.set(document, field, value);
				const updater = {
					updatedBy: userId,
					updatedAt: new Date(),
					document
				};
				return Drafts.update({_id: draftId}, {$set: updater});
			}
			return {draftId, change: {field, value}, userId, error: 'Drafts does not exist!'};
		},

		async 'draft.cancel'(draftId) {
			// console.log('draft.cancel', draftId);
			check(draftId, String);
			draftId = new Mongo.ObjectID(draftId);
			Drafts.remove(draftId);
			return true;
		},

	});
}