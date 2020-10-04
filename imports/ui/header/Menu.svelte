<script>
	import _ from "lodash";

	let pathname = _.replace(window.location.pathname, '/', '');
</script>
<div class="vertical-center">
	{#if _.isEmpty(pathname)}
		<a href="/about">About</a>
	{:else if 'about' === pathname}
		<a href="/">Mahahaklice</a>
	{:else}
		&nbsp;
	{/if}
</div>
