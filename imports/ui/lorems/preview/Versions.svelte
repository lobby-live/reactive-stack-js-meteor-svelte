<script>
	import {createEventDispatcher} from "svelte";
	import _ from "lodash";
	import moment from "moment";

	const dispatch = createEventDispatcher();

	export let selected;
	export let versions;

	let isSelected;
	$: isSelected = (lorem) => {
		return !_.isEmpty(selected) ? lorem._id._str === selected._id._str : false;
	}

	const selectVersion = (lorem, updateVersions = false) => {
		if (selected) {
			if (lorem._id._str === selected._id._str) return;
		}
		let versions = selected.versions;
		selected = _.cloneDeep(lorem);
		selected.versions = versions;
	}

</script>

{#if _.isEmpty(versions)}
	<span><i class="fa fa-refresh fa-spin"/> Loading versions...</span>
{:else}
	<table width="100%" border="1" cellspacing="0" cellpadding="10">
		<tr>
			<th align="left">V.</th>
			<th align="left">Rating</th>
			<th align="left">Created At</th>
		</tr>
		{#each versions as lorem}
			<tr on:click={selectVersion(lorem)} class={isSelected(lorem) ? "active" : ""}>
				<td>{lorem.iteration}</td>
				<td>{lorem.rating}</td>
				<td>{moment(lorem.createdAt).format("YYYY/MM/DD HH:mm:ss")}</td>
			</tr>
		{/each}
	</table>
{/if}
