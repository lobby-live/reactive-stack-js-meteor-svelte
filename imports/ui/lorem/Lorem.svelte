<script>
	import {Meteor} from "meteor/meteor";
	import {Mongo} from 'meteor/mongo';
	import {useTracker} from 'meteor/rdb:svelte-meteor-data';

	import {onMount} from 'svelte';

	import _ from "lodash";
	import moment from "moment";
	import jsonDiff from "json-diff";

	import {Lorems} from '../../api/lorems.js';

	export let id;	// incomming id

	const SPECIES = ['Human', 'Draenei', 'Dryad', 'Dwarf', 'Gnome', 'Worgde'];

	let subscription;
	onMount(async () => {
		let filter = {
			_id: new Mongo.ObjectID(id)
		};
		subscription = Meteor.subscribe('lorems', filter);
		loremStore = Lorems.find(filter, {limit: 1});
	});

	const _cleanDiff = (diff) => _.omit(diff, [
		'_id', 'isLatest',
		'isDraft', 'isDraft__added',
		'meta', 'meta__added',
		'updatedAt', 'updatedAt__added',
		'updatedBy', 'updatedBy__added'
	]);

	const closeDialog = () => {
		const diff = _cleanDiff(jsonDiff.diff(INITIAL, lorem));
		if (!_.isEmpty(diff)) {
			alert('Changes detected... still closing since out of POC scope.');
		}

		Meteor.call('draft.cancel', id, (error, result) => {
			if (error) {
				console.error(error);
			}
			window.location.href = '/';
		});
	};

	const saveLorem = () => {
		const diff = _cleanDiff(jsonDiff.diff(INITIAL, lorem));
		if (_.isEmpty(diff)) alert('No changes detected... still saving since out of POC scope.');

		Meteor.call('lorem.saveDraft', id, Meteor.user()._id, (error, result) => {
			if (error) console.error(error);
			window.location.href = '/';
		});
	};

	const onFocus = (fieldName) => {
		if (isDisabled(fieldName)) return;
		Meteor.call('draft.focus', {draftId: id, field: fieldName}, (error, result) => {
			if (error) console.error(error);
		});
	};

	const onBlur = (fieldName) => {
		Meteor.call('draft.blur', {draftId: id, field: fieldName}, (error, result) => {
			if (error) console.error(error);
		});
	};

	const onKeyUp = (fieldName) => {
		Meteor.call('draft.change', {draftId: id, field: fieldName, value: lorem[fieldName]}, (error, result) => {
			if (error) console.error(error);
		});
	};

	let isDisabled;
	$: isDisabled = (fieldName) => {
		if (lorem) {
			let meta = lorem.meta;
			if (meta) {
				let field = _.get(meta, fieldName);
				if (field) {
					let user = _.get(field, 'user');
					return user !== Meteor.user()._id;
				}
			}
		}
		return false;
	};

	let currentUser;
	$: currentUser = useTracker(() => Meteor.user());

	let username = '...';
	let initialLoaded = false;
	let INITIAL;
	let lorem, loremStore;
	$: {
		if (Meteor.user()) {
			username = _.first(_.words(_.get(Meteor.user(), 'profile.name', '...')));
		}

		lorem = $loremStore;
		if (!_.isEmpty(lorem)) {
			lorem = _.first(lorem);

			if (lorem.isDraft !== true) window.location.href = '/';
			else {
				if (!initialLoaded) {
					initialLoaded = true;
					Meteor.call('draft.instance', {
						itemId: lorem.itemId,
						iteration: lorem.iteration
					}, (error, result) => {
						if (error) console.error(error);
						INITIAL = result;
					});
				}
			}
		} else if (subscription && subscription.ready()) window.location.href = '/';
	}
</script>

<div id="lorem-component">
	{#if $currentUser}
		{#if lorem}
			<div id="lorem-form">
				<form>
					<table width="100%" cellspacing="0" cellpadding="10">
						<tbody>
						<tr>
							<td width="60" class="editorRow"><label>Name:</label></td>
							<td nowrap>
								<input class="editorField" type="text" bind:value={lorem.firstname} disabled={isDisabled('firstname')} on:focus={()=>onFocus('firstname')} on:blur={()=>onBlur('firstname')} on:keyup={()=>onKeyUp('firstname')}/>
								&nbsp;
								<input class="editorField" type="text" bind:value={lorem.lastname} disabled={isDisabled('lastname')} on:focus={()=>onFocus('lastname')} on:blur={()=>onBlur('lastname')} on:keyup={()=>onKeyUp('lastname')}/>
							</td>
						</tr>
						<tr>
							<td class="editorRow"><label>E-mail:</label></td>
							<td>
								<input class="editorField" type="text" bind:value={lorem.email} disabled={isDisabled('email')} on:focus={()=>onFocus('email')} on:blur={()=>onBlur('email')} on:keyup={()=>onKeyUp('email')}/>
							</td>
						</tr>
						<tr>
							<td class="editorRow"><label>Species:</label></td>
							<td>
								<select class="editorField" bind:value={lorem.species} disabled={isDisabled('species')} on:focus={()=>onFocus('species')} on:blur={()=>onBlur('species')} on:change="{() => onKeyUp('species')}">
									{#each SPECIES as species}
										<option value={species}>{species}</option>
									{/each}
								</select>
							</td>
						</tr>
						<tr>
							<td class="editorRow"><label>Rating:</label></td>
							<td>
								<input class="editorField" type="number" bind:value={lorem.rating} disabled={isDisabled('rating')} on:focus={()=>onFocus('rating')} on:blur={()=>onBlur('rating')} on:keyup={()=>onKeyUp('rating')}/>
							</td>
						</tr>
						<tr>
							<td class="editorRow"><label>Description:</label></td>
							<td>
								<textarea style="width:413px;height:150px;" bind:value={lorem.description} disabled={isDisabled('description')} on:focus={()=>onFocus('description')} on:blur={()=>onBlur('description')} on:keyup={()=>onKeyUp('description')}></textarea>
							</td>
						</tr>
						</tbody>
					</table>
				</form>
			</div>

			<div id="lorem-meta">
				<p align="right">
					Draft created on
					<b>{moment(lorem.createdAt).format('YYYY/MM/DD HH:mm:ss')}</b>
					using
					<b>version {lorem.iteration}</b> of <b>{lorem.username}</b>.
					{#if lorem.updatedAt}
						<br/>Last update at <b>{moment(lorem.updatedAt).format('YYYY/MM/DD HH:mm:ss')}</b>.
					{/if}
				</p>
			</div>

			<div id="lorem-controls">
				<button on:click={saveLorem}>Save</button>
				&nbsp;&nbsp;
				<button on:click={closeDialog}>Close</button>
			</div>
		{:else}
			<p style="padding: 20px;">Loading data...</p>
		{/if}
	{:else}
		<p style="padding: 20px;">Sorry, you have to sign in to see the data.</p>
	{/if}
</div>

<style>
	#lorem-component {
		position: relative;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto minmax(35px, auto) 35px;
		grid-template-areas: "form" "meta" "controls";
	}

	#lorem-controls {
		grid-area: controls;
		display: flex;
		justify-content: flex-end;
		padding: 5px;
	}

	#lorem-meta {
		grid-area: meta;
		display: flex;
		justify-content: flex-end;
		padding: 5px;
	}

	#lorem-form {
		grid-area: form;
		padding: 5px;
	}
</style>
