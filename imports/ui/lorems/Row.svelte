<script>
	import {createEventDispatcher} from 'svelte';
	import _ from "lodash";
	import moment from "moment";

	const dispatch = createEventDispatcher();

	export let lorem;
	export let rowClass;
</script>

<tr on:click on:dblclick class={rowClass}>
	<td>{lorem.rowId}</td>
	<td>{lorem.iteration}</td>
	<td>{lorem.firstname} {lorem.lastname}</td>
	<td>{lorem.username}</td>
	<td>{lorem.email}</td>
	<td>{lorem.rating}</td>
	<td>{lorem.species}</td>
	<td>
		{_.truncate(lorem.description, {
		'length': 75,
		'separator': ' '
		})}
	</td>
	<td>{moment(lorem.createdAt).format('YYYY/MM/DD HH:mm:ss')}</td>
</tr>
