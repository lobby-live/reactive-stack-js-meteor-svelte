<script>
	import {Meteor} from "meteor/meteor";
	import {useTracker} from 'meteor/rdb:svelte-meteor-data';

	import {onMount} from 'svelte';

	import _ from "lodash";
	import {Lorems} from '../../api/lorems.js';

	import Row from './Row.svelte';
	import Preview from './preview/Preview.svelte';

	const MIN_PAGE_SIZE = 5;
	const MAX_PAGE_SIZE = 25;

	let page = 1;
	let pageSize = 10;
	let pageCount = 0;
	let sorting = {
		createdAt: -1
	};
	let filter = {isLatest: true, isDraft: null};
	let query = '';
	let selected, loremsStore;

	onMount(async () => {
		Meteor.subscribe('lorems', filter);
		refreshPage();
	});

	const refreshPage = () => {
		selected = null;
		loremsStore = Lorems.find(
			filter, {
				sort: sorting,
				skip: (page - 1) * pageSize,
				limit: pageSize
			});
	};

	const COLUMNS = ['iteration', 'firstname', 'lastname', 'email', 'rating', 'description'];
	const updateQuery = () => {
		let or = _.map(COLUMNS, (column) => {
			let q = {};
			_.set(q, column, {$regex: query});
			return q;
		});
		filter = {
			isLatest: true,
			$or: or
		};
		Meteor.subscribe('lorems', filter);
		refreshPage();
	};

	const resetQuery = () => {
		query = '';
		filter = {isLatest: true};
		Meteor.subscribe('lorems', filter);
		refreshPage();
	};

	const pageSizeBackward = () => {
		pageSize--;
		if (pageSize < MIN_PAGE_SIZE) pageSize = MIN_PAGE_SIZE;
		refreshPage();
	};

	const pageSizeForward = () => {
		pageSize++;
		if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;
		refreshPage();
	};

	const pageBackward = () => {
		page--;
		if (page < 1) pageSize = 1;
		refreshPage();
	};

	const pageForward = () => {
		page++;
		selected = null;
		if (page > pageCount) pageSize = pageCount;
		refreshPage();
	};

	const selectRow = (lorem, updateVersions = false) => {
		if (selected) {
			if (lorem.itemId === selected.itemId) {
				selected = null;
				return;
			}
		}

		selected = _.cloneDeep(lorem);
		Meteor.call('lorems.iterations', selected.itemId, (error, result) => {
			selected.versions = result;
		});
	};

	const _editLorem = (lorem) => {
		Meteor.call('lorem.draft', lorem._id._str, (error, result) => {
			if (error) return console.error(error);
			window.location.href = '/lorem/' + result;
		});
	};

	const _toggleSortingHelper = (label) => {
		let sortingLabel = _.get(sorting, label, false);
		if (sorting && sortingLabel) {
			if (sortingLabel < 0) _.set(sorting, label, 1);
			else if (sortingLabel > 0) _.set(sorting, label, 0);
			else _.set(sorting, label, -1);
		} else {
			_.set(sorting, label, -1);
		}
	};

	const toggleSorting = (label) => {
		if (label === 'firstname') {
			_toggleSortingHelper('firstname');
			_toggleSortingHelper('lastname');
		} else _toggleSortingHelper(label);

		if (sorting['createdAt']) {
			let createdAt = sorting['createdAt'];
			delete sorting['createdAt'];
			sorting['createdAt'] = createdAt;
		}
		sorting = _.pickBy(sorting, _.identity);
		refreshPage();
	};

	let getIcon;
	$: getIcon = (label) => {
		if (sorting) {
			let sortingLabel = _.get(sorting, label, false);
			if (sortingLabel) {
				if (sortingLabel < 0) return '<i class="fa fa-long-arrow-down"/>';
				if (sortingLabel > 0) return '<i class="fa fa-long-arrow-up"/>';
			}
		}
		return '';
	};

	let isSelected;
	$: isSelected = (lorem) => {
		return selected ? lorem.itemId === selected.itemId : false;
	};

	let currentUser;
	$: currentUser = useTracker(() => Meteor.user());

	let totalCount;
	$: totalCount = useTracker(() => Lorems.find(filter).count());

	let username = '';
	let lorems;
	$: {
		if (Meteor.user()) {
			username = _.first(_.words(_.get(Meteor.user(), 'profile.name', '...')));
		}

		lorems = $loremsStore;
		pageCount = parseInt($totalCount / pageSize, 10) + 1;
		let rowId = (page - 1) * pageSize + 1;
		_.each(lorems, (m) => m.rowId = rowId++);
	}
</script>

<div id="lorems-component">
	{#if $currentUser}
		<div id="lorems-controls">
			Page <b>{page}</b> of <b>{pageCount}</b>
			<button disabled={page<=1} on:click={pageBackward}>-</button>
			<button disabled={page>=pageCount} on:click={pageForward}>+</button>
			|
			Page size <b>{pageSize}</b>
			<button disabled={pageSize<=MIN_PAGE_SIZE} on:click={pageSizeBackward}>-</button>
			<button disabled={pageSize>=MAX_PAGE_SIZE} on:click={pageSizeForward}>+</button>
			|
			<input bind:value={query} on:keyup={updateQuery}>
			<button disabled={_.isEmpty(query)} on:click={resetQuery}>x</button>
		</div>

		<div id="lorems-grid">
			<table width="100%" border="1" cellspacing="0" cellpadding="10">
				<tr>
					<th align="left">#</th>
					<th align="left" on:click={() => toggleSorting('iteration')} nowrap>
						V. {@html getIcon('iteration')}</th>
					<th align="left" on:click={() => toggleSorting('firstname')} nowrap>
						Name {@html getIcon('firstname')}</th>
					<th align="left" on:click={() => toggleSorting('username')}>
						Username {@html getIcon('username')}</th>
					<th align="left" on:click={() => toggleSorting('email')} nowrap>
						Email {@html getIcon('email')}</th>
					<th align="left" on:click={() => toggleSorting('rating')} nowrap>
						Rating {@html getIcon('rating')}</th>
					<th align="left" on:click={() => toggleSorting('species')} nowrap>
						Species {@html getIcon('species')}</th>
					<th align="left" on:click={() => toggleSorting('description')} nowrap>
						Description {@html getIcon('description')}</th>
					<th align="left" on:click={() => toggleSorting('createdAt')} nowrap>Created
						At {@html getIcon('createdAt')}</th>
				</tr>
				{#each lorems as lorem}
					<Row on:click={selectRow(lorem)} on:dblclick={_editLorem(lorem)} lorem={lorem} rowClass={isSelected(lorem) ? 'active' : ''}/>
				{/each}
			</table>
		</div>
	{:else}
		<p style="padding: 20px;">Sorry, you have to sign in to see the data.</p>
	{/if}
	{#if selected}
		<div id="lorems-preview">
			<Preview bind:selected={selected} on:editLorem={_editLorem(selected)}/>
		</div>
	{/if}
</div>

<style>
	#lorems-component {
		display: grid;
		grid-template-columns: 1fr minmax(0px, auto);
		grid-template-rows: 30px auto;
		grid-template-areas: "controls controls" "grid preview";
		padding: 0 5px 5px 5px;
	}

	#lorems-controls {
		grid-area: controls;
		padding: 5px;
	}

	#lorems-grid {
		grid-area: grid;
	}

	#lorems-preview {
		grid-area: preview;
		padding: 5px;
	}
</style>
