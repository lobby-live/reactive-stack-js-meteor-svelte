<!-- App.svelte -->
<script>
	import {Router, Route} from "svelte-routing";
	import {BlazeTemplate} from 'meteor/svelte:blaze-integration';

	import Header from './header/Header.svelte';

	import Lorems from "./lorems/Lorems.svelte";
	import Lorem from "./lorem/Lorem.svelte";
	import About from "./about/About.svelte";

	export let url = "";
</script>

<Router url="{url}">
	<div id="header">
		<Header/>
	</div>
	<div id="content">
		<Route path="lorem/:id" component="{Lorem}"/>
		<Route path="about" component="{About}"/>
		<Route path="/" component="{Lorems}"/>
	</div>
	<div id="user">
		<BlazeTemplate template="loginButtons"/>
	</div>
</Router>
