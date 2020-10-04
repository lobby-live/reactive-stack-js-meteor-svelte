<script>
	import {createEventDispatcher} from 'svelte';
	import {fade} from 'svelte/transition';

	import _ from "lodash";
	import moment from "moment";

	import Versions from './Versions.svelte';

	export let selected;

	const dispatch = createEventDispatcher();
</script>

<div id="lorems-preview-component" in:fade>
	<div id="lorems-preview-edit">
		<button on:click={()=>dispatch('editLorem')}>Edit</button>
	</div>
	<div id="lorems-preview-content">
		<p><label class="preview-label">Version:</label> {selected.iteration}</p>
		<p><label class="preview-label">Name:</label> {selected.firstname} {selected.lastname}</p>
		<p><label class="preview-label">Username:</label> {selected.username}</p>
		<p><label class="preview-label">Email:</label> {selected.email}</p>
		<p><label class="preview-label">Rating:</label> {selected.rating}</p>
		<p><label class="preview-label">Spieces:</label> {selected.species}</p>
		<p><label class="preview-label">Created At:</label> {moment(selected.createdAt).format('YYYY/MM/DD HH:mm:ss')}
		</p>
		<p><label class="preview-label">Description:</label> {selected.description}</p>
	</div>
	<div id="lorems-preview-grid">
		<Versions bind:selected={selected} versions={_.orderBy(selected.versions, ['iteration'], [ 'desc'])}/>
	</div>
</div>

<style>
	#lorems-preview-component {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 25px fit-content(0) auto;
		grid-template-areas: "edit" "preview" "grid";
		padding: 5px;
	}

	#lorems-preview-edit {
		grid-area: edit;
		display: flex;
		justify-content: flex-end;
	}

	#lorems-preview-content {
		grid-area: preview;
	}

	#lorems-preview-grid {
		grid-area: grid;
	}
</style>
