import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {check} from 'meteor/check';
import _ from "lodash";

export const Lorems = new Mongo.Collection('lorems');

if (Meteor.isServer) {
	// This code only runs on the server
	Meteor.publish('lorems', function loremsPublication(query = {}, options = {}) {
		return Lorems.find(query, options);
	});

// Meteor.subscribe('lorems', {isLatest: true});
// Meteor.subscribe('lorems', {itemId: someItemIdValue});

	Meteor.methods({
		'lorems.count'(query = {}) {
			// console.log('lorems.count', query);
			return Lorems.find(query).count();
		},

		async 'lorems.iterations'(itemId) {
			// console.log('lorems.iterations', itemId);
			check(itemId, String);
			return await Lorems.find({itemId}, {sort: {iterations: -1}}).fetch();
		},

		async 'lorem.instance'(query) {
			// console.log('lorem.instance', query);
			check(query, Object);
			let instance = await Lorems.find(query).fetch();
			if (_.isArray(instance)) instance = _.first(instance);
			return instance;
		},

		async 'lorem.focus'(params) {
			// console.log('lorem.focus', params);
			check(params, Object);
			let {id, field} = params;
			check(id, String);
			check(field, String);

			id = new Mongo.ObjectID(id);
			let lorem = await Lorems.find({_id: id}).fetch();
			if (_.isArray(lorem)) lorem = _.first(lorem);

			if (!lorem.isDraft) {
				// TODO: not allowed!
			}

			let user = Meteor.user()._id;
			let meta = _.get(lorem, 'meta', null);
			if (meta) {
				if (_.get(meta, field)) return false;
				_.each(meta, (val, id) => {
					if (_.get(val, 'user', false) === user) {
						meta = _.omit(meta, id);
					}
				});
			} else {
				meta = {};
			}
			_.set(meta, field, {user});
			await Lorems.update(id, {$set: {meta}});
			// console.log('lorem.focus', {user, meta: lorem.meta});

			return true;
		},

		async 'lorem.blur'(params) {
			// console.log('lorem.blur', params);
			check(params, Object);
			let {id, field} = params;
			check(id, String);
			check(field, String);

			id = new Mongo.ObjectID(id);
			let lorem = await Lorems.find({_id: id}).fetch();
			if (_.isArray(lorem)) lorem = _.first(lorem);

			if (!lorem.isDraft) {
				// TODO: not allowed!
			}

			let meta = _.get(lorem, 'meta', null);
			if (meta) {
				let curr = _.get(meta, field);
				if (curr) {
					let user = _.get(curr, 'user');
					if (user !== Meteor.user()._id) return false;
					let metaData = _.omit(meta, field);
					await Lorems.update(id, {$set: {meta: metaData}});
				}
			}
			return true;
		},

		async 'lorem.change'(params) {
			// console.log('lorem.change', params);
			check(params, Object);
			let {id, field, value} = params;
			check(id, String);
			check(field, String);

			id = new Mongo.ObjectID(id);
			let lorem = await Lorems.find({_id: id}).fetch();
			if (_.isArray(lorem)) lorem = _.first(lorem);

			if (!lorem.isDraft) {
				// TODO: not allowed!
			}

			let updater = {
				updatedBy: Meteor.user()._id,
				updatedAt: new Date()
			};

			_.set(updater, field, value);

			let result = await Lorems.update(id, {$set: updater});
			return result === 1;
		},

		async 'lorem.draft'(id) {
			// console.log('lorem.draft', id);
			check(id, String);
			id = new Mongo.ObjectID(id);
			let lorem = await Lorems.find({_id: id}).fetch();
			if (_.isArray(lorem)) lorem = _.first(lorem);

			let current = await Lorems.find({itemId: lorem.itemId, isDraft: true}).fetch();
			if (!_.isEmpty(current)) {
				if (_.isArray(current)) current = _.first(current);
				return current._id._str;
			}

			let draft = _.omit(lorem, ['_id', 'meta', 'updatedAt', 'updatedBy', 'createdAt', 'createdBy']);
			draft.isDraft = true;
			draft.isLatest = false;
			draft.createdAt = new Date();
			draft.createdBy = Meteor.user()._id;
			draft._id = new Mongo.ObjectID();

			let draftId = await Lorems.insert(draft);
			return draftId;
		},

		async 'lorem.cancel'(id) {
			// console.log('lorem.cancel', id);
			check(id, String);
			id = new Mongo.ObjectID(id);
			Lorems.remove(id);
			return true;
		},

		async 'lorem.save'(id) {
			// console.log('lorem.save', id);
			check(id, String);
			id = new Mongo.ObjectID(id);
			let lorem = await Lorems.find({_id: id, isDraft: true}).fetch();
			if (_.isEmpty(lorem)) console.log('QUE???');
			if (_.isArray(lorem)) lorem = _.first(lorem);

			let max = await Lorems.find({itemId: lorem.itemId, isLatest: true}).fetch();
			if (_.isArray(max)) max = _.first(max);

			await Lorems.update({_id: max._id}, {$set: {isLatest: false}});
			lorem = _.omit(lorem, ['meta', 'updatedAt', 'updatedBy', 'createdAt', 'createdBy', 'isDraft']);
			lorem.isLatest = true;
			lorem.iteration = max.iteration + 1;
			lorem.createdAt = new Date();
			lorem.createdBy = Meteor.user()._id;
			await Lorems.update({_id: lorem._id}, lorem);
			return true;
		}

	});
}