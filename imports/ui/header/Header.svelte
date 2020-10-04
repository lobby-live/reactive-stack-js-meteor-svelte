<script>
	import Title from "./Title.svelte";
	import Menu from "./Menu.svelte";
</script>

<div id="header-content">
	<div id="header-title">
		<Title/>
	</div>
	<div id="header-menu">
		<Menu/>
	</div>
</div>

<style>
	#header-content {
		position: relative;
		display: grid;
		grid-template-columns: auto 300px;
		grid-template-rows: 25px 25px;
		grid-template-areas: "title menu" "title user";
	}

	#header-title {
		grid-area: title;
		position: relative;
		padding: 10px;
	}

	#header-menu {
		grid-area: menu;
		position: relative;
	}
</style>
